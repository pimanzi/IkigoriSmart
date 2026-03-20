"""
IkigoriSmart — Spread Risk Prediction API
==========================================
FastAPI service that wraps the trained Random Forest model.

Pipeline:
  CNN severity output + weather inputs → Spread Risk (Low / Medium / High)
"""

import os
import time
import logging
import urllib.request
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ── Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
)
logger = logging.getLogger(__name__)

# ── Model Artifact Paths ───────────────────────────────────────────
MODELS_DIR = Path(__file__).parent.parent / "models"

MODEL_PATH    = MODELS_DIR / "spread_risk_model.pkl"
ENC_SEVERITY  = MODELS_DIR / "encoder_severity.pkl"
ENC_DISTRICT  = MODELS_DIR / "encoder_district.pkl"
ENC_RISK      = MODELS_DIR / "encoder_risk.pkl"

# ── Hugging Face Model URLs ────────────────────────────────────────
HUGGINGFACE_BASE_URL = os.getenv(
    "HUGGINGFACE_BASE_URL",
    "https://huggingface.co/Kabisa/ikigori-weather-risk-model/resolve/main"
)

MODEL_FILES = {
    "spread_risk_model.pkl": MODEL_PATH,
    "encoder_severity.pkl": ENC_SEVERITY,
    "encoder_district.pkl": ENC_DISTRICT,
    "encoder_risk.pkl": ENC_RISK,
}

# ── Global Model State ─────────────────────────────────────────────
# Loaded once at startup — shared across all requests
model        = None
le_severity  = None
le_district  = None
le_risk      = None


# ── Download Models from Hugging Face ──────────────────────────────
def download_model(filename: str, local_path: Path):
    """Download a model file from Hugging Face if not exists locally."""
    if local_path.exists():
        file_size = local_path.stat().st_size / 1024
        logger.info(f" {filename} already exists ({file_size:.1f} KB)")
        return
    
    # Create directory if needed
    local_path.parent.mkdir(parents=True, exist_ok=True)
    
    url = f"{HUGGINGFACE_BASE_URL}/{filename}"
    logger.info(f" Downloading {filename}...")
    logger.info(f"   URL: {url}")
    
    try:
        urllib.request.urlretrieve(url, str(local_path))
        file_size = local_path.stat().st_size / 1024
        logger.info(f"{filename} downloaded ({file_size:.1f} KB)")
    except Exception as e:
        logger.error(f"Failed to download {filename}: {e}")
        raise


def download_all_models():
    """Download all required models from Hugging Face."""
    logger.info("Checking model files...")
    for filename, local_path in MODEL_FILES.items():
        download_model(filename, local_path)
    logger.info("All model files ready")


# ── Lifespan: Load Model at Startup ───────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load all model artifacts once when the server starts.
    Downloads from Hugging Face if not present locally.
    """
    global model, le_severity, le_district, le_risk

    logger.info("Starting Weather Risk Prediction API...")
    
    # Download models from Hugging Face if needed
    download_all_models()

    logger.info("Loading spread risk model artifacts...")

    model       = joblib.load(MODEL_PATH)
    le_severity = joblib.load(ENC_SEVERITY)
    le_district = joblib.load(ENC_DISTRICT)
    le_risk     = joblib.load(ENC_RISK)

    logger.info("✓ spread_risk_model.pkl loaded")
    logger.info("✓ encoder_severity.pkl  loaded  | classes: %s", list(le_severity.classes_))
    logger.info("✓ encoder_district.pkl  loaded  | classes: %s", list(le_district.classes_))
    logger.info("✓ encoder_risk.pkl      loaded  | classes: %s", list(le_risk.classes_))
    logger.info(" API ready to receive requests")

    yield  # server runs here

    logger.info("Shutting down spread risk API.")


# ── FastAPI App ────────────────────────────────────────────────────
app = FastAPI(
    title="IkigoriSmart — Spread Risk API",
    description=(
        "Predicts MLN spread risk (Low / Medium / High) by fusing "
        "CNN severity output with real-time weather data using a "
        "Random Forest model trained on rule-based synthetic data "
        "grounded in CIMMYT (2021) and Prasanna (2021) thresholds."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────────────
# Allow React Native app (Expo) to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════
# REQUEST / RESPONSE SCHEMAS
# ══════════════════════════════════════════════════════════════════

class SpreadRiskRequest(BaseModel):
    """
    Input payload for spread risk prediction.

    severity    : CNN model output from the MLN severity API
    temperature : Temperature in Celsius (Rwanda highland range: 10–30°C)
    humidity    : Relative humidity in % (range: 50–95%)
    rainfall    : Rainfall in mm (range: 0–200mm)
    district    : Farmer's district — must be Musanze or Nyabihu
    """

    severity:    str   = Field(..., description="CNN severity output: Healthy | Early | Moderate | Severe")
    temperature: float = Field(..., description="Temperature in °C (10–30)")
    humidity:    float = Field(..., description="Relative humidity in % (50–95)")
    rainfall:    float = Field(..., description="Rainfall in mm (0–200)")
    district:    str   = Field(..., description="Farmer district: Musanze | Nyabihu")

    # ── Severity Validation ─────────────────────────────────────
    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        """
        Normalise severity to title case so 'HEALTHY', 'healthy',
        and 'Healthy' are all accepted — matching the CNN output
        which may return uppercase.
        """
        normalised = v.strip().capitalize()
        # Special case: CNN returns 'HEALTHY' → normalise to 'Healthy'
        valid = {"Healthy", "Early", "Moderate", "Severe"}
        if normalised not in valid:
            raise ValueError(
                f"severity must be one of {sorted(valid)}. "
                f"Received: '{v}'"
            )
        return normalised

    # ── District Validation ─────────────────────────────────────
    @field_validator("district")
    @classmethod
    def validate_district(cls, v: str) -> str:
        normalised = v.strip().title()
        valid = {"Musanze", "Nyabihu"}
        if normalised not in valid:
            raise ValueError(
                f"district must be one of {sorted(valid)}. "
                f"Received: '{v}'"
            )
        return normalised

    # ── Temperature Validation ──────────────────────────────────
    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        if not (10.0 <= v <= 35.0):
            raise ValueError(
                f"temperature must be between 10°C and 35°C. "
                f"Received: {v}"
            )
        return v

    # ── Humidity Validation ─────────────────────────────────────
    @field_validator("humidity")
    @classmethod
    def validate_humidity(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError(
                f"humidity must be between 0% and 100%. "
                f"Received: {v}"
            )
        return v

    # ── Rainfall Validation ─────────────────────────────────────
    @field_validator("rainfall")
    @classmethod
    def validate_rainfall(cls, v: float) -> float:
        if not (0.0 <= v <= 500.0):
            raise ValueError(
                f"rainfall must be between 0mm and 500mm. "
                f"Received: {v}"
            )
        return v


class RiskProbability(BaseModel):
    """Individual class probability."""
    label:       str
    probability: float


class ScoreBreakdown(BaseModel):
    """
    Shows exactly how the risk score was calculated.
    Useful for transparency and academic documentation.
    Each field shows the points contributed by that factor.
    """
    severity_score:    int
    temperature_score: int
    humidity_score:    int
    rainfall_score:    int
    total_score:       int
    max_possible:      int = 9


class SpreadRiskResponse(BaseModel):
    """
    Full response returned by the spread risk prediction endpoint.
    """
    risk_level:        str                    # Low | Medium | High
    confidence:        float                  # highest class probability
    probabilities:     list[RiskProbability]  # all 3 class probabilities
    score_breakdown:   ScoreBreakdown         # rule-based score details
    risk_level_int:    int                    # 0=Low, 1=Medium, 2=High
    inference_time_ms: float
    model_version:     str = "1.0.0"


class HealthResponse(BaseModel):
    status:        str
    model_loaded:  bool
    version:       str
    description:   str


# ══════════════════════════════════════════════════════════════════
# HELPER — Rule-Based Score Breakdown
# ══════════════════════════════════════════════════════════════════

def compute_score_breakdown(
    severity:    str,
    temperature: float,
    humidity:    float,
    rainfall:    float,
) -> ScoreBreakdown:
    """
    Recomputes the rule-based score breakdown for transparency.
    This mirrors the assign_risk_label() function from the notebook
    but returns the individual component scores instead of just the label.

    Sources:
      Severity    : Mayo & Mduma (2024)
      Temperature : CIMMYT (2021)
      Humidity    : Prasanna (2021)
      Rainfall    : Prasanna (2021)
    """
    # Severity score
    severity_score = {"Severe": 3, "Moderate": 2, "Early": 1, "Healthy": 0}.get(severity, 0)

    # Temperature score — CIMMYT (2021) vector activity thresholds
    if 25 <= temperature <= 30:
        temp_score = 2    # optimal insect vector breeding zone
    elif temperature > 30:
        temp_score = 1    # vectors slow above 30°C
    elif 22 <= temperature < 25:
        temp_score = 1    # approaching danger zone
    else:
        temp_score = 0    # below 22°C — vectors largely inactive

    # Humidity score — Prasanna (2021) virus stability thresholds
    if humidity > 80:
        hum_score = 2     # danger zone — virus survives longer
    elif humidity >= 60:
        hum_score = 1     # moderate concern
    else:
        hum_score = 0

    # Rainfall score — Prasanna (2021) drought stress threshold
    if rainfall < 20:
        rain_score = 2    # drought stress — collapsed plant immunity
    elif rainfall < 50:
        rain_score = 1    # moderate dryness
    else:
        rain_score = 0

    total = severity_score + temp_score + hum_score + rain_score

    return ScoreBreakdown(
        severity_score=severity_score,
        temperature_score=temp_score,
        humidity_score=hum_score,
        rainfall_score=rain_score,
        total_score=total,
        max_possible=9,
    )


# ══════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════

@app.get(
    "/",
    response_model=HealthResponse,
    summary="Health Check",
    tags=["System"],
)
def root() -> HealthResponse:
    """
    Root health check endpoint.
    Returns model load status and API version.
    """
    return HealthResponse(
        status="ok",
        model_loaded=model is not None,
        version="1.0.0",
        description=(
            "IkigoriSmart Spread Risk API — "
            "POST /predict to get MLN spread risk prediction"
        ),
    )


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    tags=["System"],
)
def health() -> HealthResponse:
    """Explicit health check endpoint for monitoring."""
    return root()


@app.post(
    "/predict",
    response_model=SpreadRiskResponse,
    summary="Predict MLN Spread Risk",
    tags=["Prediction"],
    responses={
        200: {"description": "Successful spread risk prediction"},
        422: {"description": "Validation error — invalid input values"},
        500: {"description": "Internal server error during inference"},
    },
)
def predict(request: SpreadRiskRequest) -> SpreadRiskResponse:
    """
    Predict MLN spread risk by fusing CNN severity output with weather data.

    **Input:**
    - `severity`    — CNN model output (Healthy / Early / Moderate / Severe)
    - `temperature` — Temperature in °C
    - `humidity`    — Relative humidity in %
    - `rainfall`    — Rainfall in mm
    - `district`    — Farmer's district (Musanze / Nyabihu)

    **Output:**
    - `risk_level`      — Low / Medium / High
    - `confidence`      — Model confidence for the predicted class
    - `probabilities`   — All three class probabilities
    - `score_breakdown` — Transparent breakdown of how score was computed
    - `risk_level_int`  — 0=Low, 1=Medium, 2=High (for app logic)

    **Biological thresholds used:**
    - Temperature 25–30°C: optimal insect vector zone (CIMMYT, 2021)
    - Humidity > 80%: virus stability danger zone (Prasanna, 2021)
    - Rainfall < 20mm: drought stress threshold (Prasanna, 2021)
    """
    if model is None:
        raise HTTPException(
            status_code=500,
            detail="Model is not loaded. Please restart the server.",
        )

    start_time = time.perf_counter()

    try:
        # ── Step 1: Clip inputs to training distribution boundaries ──
        # Standard MLOps practice: constrain OOD inputs rather than
        # letting the model extrapolate into unseen territory.
        temperature_clipped = float(np.clip(request.temperature, 19, 30))
        humidity_clipped    = float(np.clip(request.humidity,    60, 95))
        rainfall_clipped    = float(np.clip(request.rainfall,     5, 180))

        logger.info(
            "Prediction request — severity=%s district=%s "
            "temp=%.1f hum=%.1f rain=%.1f",
            request.severity, request.district,
            temperature_clipped, humidity_clipped, rainfall_clipped,
        )

        # ── Step 2: Encode categorical inputs ───────────────────────
        try:
            sev_enc  = le_severity.transform([request.severity])[0]
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Severity value '{request.severity}' not recognised "
                    f"by the encoder. Valid values: {list(le_severity.classes_)}"
                ),
            )

        try:
            dist_enc = le_district.transform([request.district])[0]
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"District value '{request.district}' not recognised "
                    f"by the encoder. Valid values: {list(le_district.classes_)}"
                ),
            )

        # ── Step 3: Build feature array ──────────────────────────────
        # Feature order must match training: 
        # [severity_enc, temperature_c, humidity_pct, rainfall_mm, district_enc]
        features = np.array([[
            sev_enc,
            temperature_clipped,
            humidity_clipped,
            rainfall_clipped,
            dist_enc,
        ]])

        # ── Step 4: Predict ──────────────────────────────────────────
        pred_enc   = model.predict(features)[0]
        pred_proba = model.predict_proba(features)[0]

        risk_label = le_risk.inverse_transform([pred_enc])[0]  # Low/Medium/High

        # ── Step 5: Map risk label to integer for app convenience ────
        risk_int_map = {"Low": 0, "Medium": 1, "High": 2}
        risk_level_int = risk_int_map.get(risk_label, 0)

        # ── Step 6: Build probability list ──────────────────────────
        class_labels = le_risk.classes_  # alphabetical: High, Low, Medium
        probabilities = [
            RiskProbability(
                label=label,
                probability=round(float(prob), 6),
            )
            for label, prob in sorted(
                zip(class_labels, pred_proba),
                key=lambda x: x[1],
                reverse=True,     # highest probability first
            )
        ]

        confidence = probabilities[0].probability

        # ── Step 7: Score breakdown for transparency ─────────────────
        score_breakdown = compute_score_breakdown(
            severity=request.severity,
            temperature=temperature_clipped,
            humidity=humidity_clipped,
            rainfall=rainfall_clipped,
        )

        inference_time_ms = (time.perf_counter() - start_time) * 1000

        logger.info(
            "Prediction result — risk=%s confidence=%.3f score=%d/9 time=%.2fms",
            risk_label, confidence, score_breakdown.total_score, inference_time_ms,
        )

        return SpreadRiskResponse(
            risk_level=risk_label,
            confidence=confidence,
            probabilities=probabilities,
            score_breakdown=score_breakdown,
            risk_level_int=risk_level_int,
            inference_time_ms=round(inference_time_ms, 2),
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during prediction: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed due to an internal error: {str(exc)}",
        )