
from pathlib import Path
import threading

import cv2
import joblib
import mediapipe as mp
import numpy as np

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

from fastapi import FastAPI, Request, UploadFile, File
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "sign_recognition" / "models" / "isl_model.pkl"
HAND_LANDMARKER_PATH = PROJECT_ROOT / "sign_recognition" / "hand_landmarker.task"


# --------------------------------------------------
# LOAD TRAINED AI MODEL
# --------------------------------------------------

model = joblib.load(MODEL_PATH)
print("ISL AI model loaded successfully!")
print("Recognized signs:", model.classes_)


# --------------------------------------------------
# INITIALIZE MEDIAPIPE HAND DETECTOR
# --------------------------------------------------

base_options = python.BaseOptions(
    model_asset_path=str(HAND_LANDMARKER_PATH)
)

hand_options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=vision.RunningMode.IMAGE
)

landmarker = vision.HandLandmarker.create_from_options(hand_options)

# Prevent simultaneous requests from using the detector together.
detector_lock = threading.Lock()


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="ISL AI Interpreter",
    description="Backend APIs for an AI-powered Indian Sign Language communication system.",
    version="1.0.0"
)


# --------------------------------------------------
# ERROR HANDLERS
# --------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Invalid input",
            "errors": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": "Something went wrong on the server"
        }
    )


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# REQUEST AND RESPONSE MODELS
# --------------------------------------------------

class RecognizedSign(BaseModel):
    text: str = Field(
        min_length=1,
        json_schema_extra={"examples": ["Hello"]}
    )


class TextToSign(BaseModel):
    text: str = Field(
        min_length=1,
        json_schema_extra={"examples": ["I need water"]}
    )
    language: str = Field(
        default="English",
        min_length=1,
        json_schema_extra={"examples": ["English"]}
    )


class RecognizedSignResponse(BaseModel):
    received_text: str
    message: str


class TextToSignResponse(BaseModel):
    text: str
    language: str
    message: str


# --------------------------------------------------
# BASIC ENDPOINTS
# --------------------------------------------------

@app.get("/")
def home():
    return {"message": "ISL Backend is running successfully!"}


@app.get("/hello")
def hello():
    return {"message": "Welcome to ISL AI Interpreter"}


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "ISL backend is running"
    }


# --------------------------------------------------
# EXISTING SIGN-TO-TEXT ENDPOINT
# --------------------------------------------------

@app.post(
    "/recognized-text",
    response_model=RecognizedSignResponse,
    summary="Sign-to-Text",
    description="Receives text recognised from Indian Sign Language gestures."
)
def receive_recognized_text(data: RecognizedSign):
    return {
        "received_text": data.text,
        "message": "Recognized sign text received successfully"
    }


# --------------------------------------------------
# EXISTING TEXT-TO-SIGN ENDPOINT
# --------------------------------------------------

@app.post(
    "/text-to-sign",
    response_model=TextToSignResponse,
    summary="Text-to-Sign",
    description="Receives text and language information for conversion into Indian Sign Language."
)
def convert_text_to_sign(data: TextToSign):
    return {
        "text": data.text,
        "language": data.language,
        "message": "Text received for sign language conversion"
    }


# --------------------------------------------------
# NEW AI SIGN RECOGNITION ENDPOINT
# --------------------------------------------------

@app.post(
    "/predict-sign",
    summary="AI Sign Recognition",
    description="Receives a webcam image and predicts the Indian Sign Language gesture."
)
def predict_sign(file: UploadFile = File(...)):

    image_bytes = file.file.read()

    if not image_bytes:
        return {
            "success": False,
            "message": "Uploaded image is empty"
        }

    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "success": False,
            "message": "Invalid image file"
        }

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )

    with detector_lock:
        result = landmarker.detect(mp_image)

    if not result.hand_landmarks:
        return {
            "success": False,
            "message": "No hand detected. Please show your hand clearly."
        }

    hand_landmarks = result.hand_landmarks[0]

    landmarks = np.array(
        [[point.x, point.y, point.z] for point in hand_landmarks],
        dtype=np.float32
    )

    if landmarks.shape != (21, 3):
        return {
            "success": False,
            "message": "Could not extract valid hand landmarks"
        }

    features = landmarks.flatten().reshape(1, 63)

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    confidence = float(np.max(probabilities))

    return {
        "success": True,
        "prediction": str(prediction),
        "confidence": round(confidence, 4),
        "message": "Sign recognized successfully"
    }
