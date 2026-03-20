"""
MLN Severity Classification API
FastAPI application for predicting MLN (Maize Lethal Necrosis) severity
from leaf images using a ResNet50-based classifier.
"""

import io
import os
import time
import logging
import urllib.request
from pathlib import Path
from contextlib import asynccontextmanager

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional

# ─────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
MODEL_DIR = "models/production"
MODEL_PATH = os.path.join(MODEL_DIR, "baseline_final.pt")

# Hugging Face model URL for download
MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/Kabisa/ikigori-mln-model/resolve/main/baseline_final.pt"
)

DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMG_SIZE   = 224
MAX_FILE_MB = 10

# CORS origins - set ALLOWED_ORIGINS env var for production (comma-separated)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",") if os.getenv("ALLOWED_ORIGINS") else ["*"]

CLASS_NAMES_FALLBACK = ["Early", "HEALTHY", "Moderate", "Severe"]

# ImageNet normalisation (same as training)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/bmp"}


# ─────────────────────────────────────────────
# Model Download from Hugging Face
# ─────────────────────────────────────────────
def download_model():
    """Download model from Hugging Face if not exists locally."""
    if os.path.exists(MODEL_PATH):
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        logger.info(f"Model already exists at {MODEL_PATH} ({file_size:.1f} MB)")
        return MODEL_PATH
    
    if not MODEL_URL:
        raise FileNotFoundError("MODEL_URL not set and model file not found locally")
    
    logger.info(f"Downloading model from Hugging Face...")
    logger.info(f"   URL: {MODEL_URL}")
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        logger.info(f" Model downloaded successfully ({file_size:.1f} MB)")
        return MODEL_PATH
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise


# ─────────────────────────────────────────────
# Model architecture  
# ─────────────────────────────────────────────
class MLNClassifier(nn.Module):
    """ResNet50-based MLN severity classifier – mirrors training notebook."""

    def __init__(self, num_classes: int = 4, dropout_rate: float = 0.5, dense_units: int = 256):
        super().__init__()
        self.base_model = models.resnet50(weights=None)
        num_features = self.base_model.fc.in_features
        self.base_model.fc = nn.Identity()

        self.classifier = nn.Sequential(
            nn.BatchNorm1d(num_features),
            nn.Dropout(dropout_rate),
            nn.Linear(num_features, dense_units),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout_rate * 0.6),
            nn.Linear(dense_units, num_classes),
        )
        self.num_classes  = num_classes
        self.num_features = num_features

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.base_model(x)
        return self.classifier(features)


# ─────────────────────────────────────────────
# Model loader
# ─────────────────────────────────────────────
class ModelManager:
    """Singleton that holds the loaded model."""

    model: Optional[MLNClassifier] = None
    class_names: list[str] = CLASS_NAMES_FALLBACK
    loaded_at: Optional[str] = None

    @classmethod
    def load(cls, path: str = MODEL_PATH) -> None:
        # Download model from Hugging Face if not exists
        download_model()
        
        logger.info(f"Loading model from: {path}  (device={DEVICE})")
        if not Path(path).exists():
            raise FileNotFoundError(
                f"Model file not found at '{path}'. "
                "Check MODEL_URL environment variable for download."
            )
        checkpoint = torch.load(path, map_location=DEVICE, weights_only=False)

        cls.model = MLNClassifier(
            num_classes   = checkpoint.get("num_classes", 4),
            dropout_rate  = 0.5,
            dense_units   = 256,
        )
        cls.model.load_state_dict(checkpoint["model_state_dict"])
        cls.model.to(DEVICE)
        cls.model.eval()

        cls.class_names = checkpoint.get("class_names", CLASS_NAMES_FALLBACK)
        cls.loaded_at   = time.strftime("%Y-%m-%dT%H:%M:%S")
        logger.info(f"Model loaded. Classes: {cls.class_names}")


# ─────────────────────────────────────────────
# Inference transform (same as validation)
# ─────────────────────────────────────────────
inference_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


# ─────────────────────────────────────────────
# Pydantic response schemas
# ─────────────────────────────────────────────
class ClassProbability(BaseModel):
    label: str
    probability: float = Field(..., ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    prediction: str              = Field(..., description="Top predicted severity class")
    confidence: float            = Field(..., ge=0.0, le=1.0, description="Confidence of top class")
    probabilities: list[ClassProbability] = Field(..., description="Softmax probabilities for all classes")
    severity_level: int          = Field(..., description="0=Healthy, 1=Early, 2=Moderate, 3=Severe")
    inference_time_ms: float     = Field(..., description="Inference time in milliseconds")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    class_names: list[str]
    device: str
    model_path: str
    loaded_at: Optional[str]


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
SEVERITY_META = {
    "HEALTHY":  {"level": 0},
    "Early":    {"level": 1},
    "Moderate": {"level": 2},
    "Severe":   {"level": 3},
}


def get_severity_meta(class_name: str) -> dict:
    return SEVERITY_META.get(class_name, {"level": -1})


def predict(image: Image.Image) -> dict:
    """Run inference on a PIL image and return result dict."""
    tensor = inference_transform(image).unsqueeze(0).to(DEVICE)

    t0 = time.perf_counter()
    with torch.no_grad():
        outputs = ModelManager.model(tensor)
        probs   = torch.softmax(outputs, dim=1)[0]
    elapsed_ms = (time.perf_counter() - t0) * 1000

    confidence, predicted_idx = probs.max(0)
    predicted_class = ModelManager.class_names[predicted_idx.item()]
    meta = get_severity_meta(predicted_class)

    all_probs = [
        ClassProbability(label=name, probability=round(probs[i].item(), 6))
        for i, name in enumerate(ModelManager.class_names)
    ]
    # Sort descending by probability
    all_probs.sort(key=lambda x: x.probability, reverse=True)

    return {
        "prediction":       predicted_class,
        "confidence":       round(confidence.item(), 6),
        "probabilities":    all_probs,
        "severity_level":   meta["level"],
        "inference_time_ms": round(elapsed_ms, 2),
    }


# ─────────────────────────────────────────────
# App lifespan
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    try:
        ModelManager.load()
    except FileNotFoundError as e:
        logger.warning(f"⚠️  {e}  — API will start but /predict will fail until model is available.")
    yield
    logger.info("Shutting down MLN API.")


# ─────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────
app = FastAPI(
    title="MLN Severity Classification API",
    description=(
        "Upload a maize leaf image and get an MLN (Maize Lethal Necrosis) "
        "severity classification: **Healthy**, **Early**, **Moderate**, or **Severe**."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────
@app.get("/", tags=["General"])
async def root():
    return {
        "name":    "MLN Severity Classification API",
        "version": "1.0.0",
        "docs":    "/docs",
        "health":  "/health",
        "predict": "/predict",
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health():
    return HealthResponse(
        status       = "ok" if ModelManager.model is not None else "model_not_loaded",
        model_loaded = ModelManager.model is not None,
        class_names  = ModelManager.class_names,
        device       = str(DEVICE),
        model_path   = MODEL_PATH,
        loaded_at    = ModelManager.loaded_at,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict_severity(file: UploadFile = File(..., description="Maize leaf image (JPG / PNG / BMP)")):
    """
    **Predict MLN severity from a leaf image.**

    - Accepts JPEG, PNG, or BMP images up to 10 MB
    - Returns the predicted severity class, confidence score,
      and per-class probabilities
    """

    # ── Guard: model loaded? ──────────────────
    if ModelManager.model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model is not loaded. Check that '{MODEL_PATH}' exists and restart the server.",
        )

    # ── Guard: content type ───────────────────
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    # ── Read & size check ─────────────────────
    contents = await file.read()
    size_mb  = len(contents) / (1024 ** 2)
    if size_mb > MAX_FILE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed size is {MAX_FILE_MB} MB.",
        )

    # ── Open image ────────────────────────────
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read image: {e}",
        )

    # ── Inference ─────────────────────────────
    try:
        result = predict(image)
    except Exception as e:
        logger.exception("Inference error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {e}",
        )

    logger.info(
        f"Predicted: {result['prediction']}  "
        f"confidence={result['confidence']:.3f}  "
        f"time={result['inference_time_ms']}ms  "
        f"file={file.filename}"
    )
    return PredictionResponse(**result)


@app.post("/predict/batch", tags=["Inference"])
async def predict_batch(files: list[UploadFile] = File(..., description="Up to 10 leaf images")):
    """
    **Predict MLN severity for multiple images at once.**

    Returns a list of predictions in the same order as the uploaded files.
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 images per batch request.",
        )

    if ModelManager.model is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Model not loaded.")

    results = []
    for f in files:
        try:
            if f.content_type not in ALLOWED_CONTENT_TYPES:
                results.append({"filename": f.filename, "error": f"Unsupported type: {f.content_type}"})
                continue
            contents = await f.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            res   = predict(image)
            results.append({"filename": f.filename, **res})
        except Exception as e:
            results.append({"filename": f.filename, "error": str(e)})

    return {"count": len(results), "results": results}