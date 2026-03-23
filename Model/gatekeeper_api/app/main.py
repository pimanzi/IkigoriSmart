import io
import os
import time
import logging
import urllib.request
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


MODEL_DIR  = "models/gatekeeper"
MODEL_PATH = os.path.join(MODEL_DIR, "gatekeeper_model2.pth")

MODEL_URL = os.getenv(
    "MODEL_URL",
    "https://huggingface.co/Kabisa/ikigori-gatekeeper/resolve/main/gatekeeper_model2.pth",
)

DEVICE     = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMG_SIZE   = 224
MAX_FILE_MB = 10
CLASS_NAMES = ["maize", "not_maize"]

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/bmp", "image/webp"}
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",") if os.getenv("ALLOWED_ORIGINS") else ["*"]


def download_model() -> None:
    if os.path.exists(MODEL_PATH):
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        logger.info(f"Model already exists at {MODEL_PATH} ({size_mb:.1f} MB)")
        return
    if not MODEL_URL:
        raise FileNotFoundError("MODEL_URL not set and model file not found locally.")
    logger.info(f"Downloading model from {MODEL_URL}")
    os.makedirs(MODEL_DIR, exist_ok=True)
    try:
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        logger.info(f"Model downloaded ({size_mb:.1f} MB)")
    except Exception as e:
        logger.error(f"Failed to download model: {e}")
        raise


def build_model() -> nn.Module:
    model = models.mobilenet_v2(weights=None)
    last_channel = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(last_channel, 2),
    )
    return model


class ModelManager:
    model: Optional[nn.Module] = None
    loaded_at: Optional[str] = None

    @classmethod
    def load(cls) -> None:
        download_model()
        logger.info(f"Loading gatekeeper model from {MODEL_PATH} (device={DEVICE})")
        if not Path(MODEL_PATH).exists():
            raise FileNotFoundError(f"Model file not found at '{MODEL_PATH}'.")
        state_dict = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
        cls.model = build_model()
        cls.model.load_state_dict(state_dict)
        cls.model.to(DEVICE)
        cls.model.eval()
        cls.loaded_at = time.strftime("%Y-%m-%dT%H:%M:%S")
        logger.info("Gatekeeper model loaded successfully.")


inference_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


class PredictionResponse(BaseModel):
    is_maize: bool          = Field(..., description="True if the image is a maize leaf")
    predicted_class: str    = Field(..., description="'maize' or 'not_maize'")
    confidence: float       = Field(..., ge=0.0, le=1.0)
    maize_probability: float      = Field(..., ge=0.0, le=1.0)
    not_maize_probability: float  = Field(..., ge=0.0, le=1.0)
    inference_time_ms: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    model_path: str
    loaded_at: Optional[str]


def run_inference(image: Image.Image) -> dict:
    tensor = inference_transform(image).unsqueeze(0).to(DEVICE)
    t0 = time.perf_counter()
    with torch.no_grad():
        outputs = ModelManager.model(tensor)
        probs   = torch.softmax(outputs, dim=1)[0]
    elapsed_ms = (time.perf_counter() - t0) * 1000

    pred_idx   = probs.argmax().item()
    pred_class = CLASS_NAMES[pred_idx]
    confidence = probs[pred_idx].item()

    return {
        "is_maize":             pred_class == "maize",
        "predicted_class":      pred_class,
        "confidence":           round(confidence, 6),
        "maize_probability":    round(probs[0].item(), 6),
        "not_maize_probability": round(probs[1].item(), 6),
        "inference_time_ms":    round(elapsed_ms, 2),
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ModelManager.load()
    except FileNotFoundError as e:
        logger.warning(f"{e} — API will start but /predict will fail until model is available.")
    yield
    logger.info("Shutting down Gatekeeper API.")


app = FastAPI(
    title="Gatekeeper API",
    description=(
        "Upload any image and get a binary prediction: **maize** or **not_maize**. "
        "This API runs before the MLN severity model to reject non-maize images."
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


@app.get("/", tags=["General"])
async def root():
    return {
        "name":    "Gatekeeper API",
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
        device       = str(DEVICE),
        model_path   = MODEL_PATH,
        loaded_at    = ModelManager.loaded_at,
    )


@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
async def predict(file: UploadFile = File(..., description="Any image (JPG / PNG / BMP)")):
    """
    **Check whether an uploaded image shows a maize leaf.**

    Returns `is_maize: true` if the image is a maize leaf with high confidence.
    Returns `is_maize: false` for any other image — the MLN severity model should
    not be called in that case.
    """
    if ModelManager.model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Allowed: {sorted(ALLOWED_CONTENT_TYPES)}",
        )

    contents = await file.read()
    size_mb  = len(contents) / (1024 ** 2)
    if size_mb > MAX_FILE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({size_mb:.1f} MB). Maximum is {MAX_FILE_MB} MB.",
        )

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read image: {e}",
        )

    try:
        result = run_inference(image)
    except Exception as e:
        logger.exception("Inference error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {e}",
        )

    logger.info(
        f"is_maize={result['is_maize']}  "
        f"class={result['predicted_class']}  "
        f"confidence={result['confidence']:.3f}  "
        f"time={result['inference_time_ms']}ms  "
        f"file={file.filename}"
    )
    return PredictionResponse(**result)
