from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="ISL AI Interpreter",
    description="Backend APIs for an AI-powered Indian Sign Language communication system.",
    version="1.0.0"
)
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


# CORS configuration
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


# API request models
class RecognizedSign(BaseModel):
    text: str = Field(
        min_length=1,
        json_schema_extra={
            "examples": ["Hello"]
        }
    )


class TextToSign(BaseModel):
    text: str = Field(
        min_length=1,
        json_schema_extra={
            "examples": ["I need water"]
        }
    )
    language: str = Field(
        default="English",
        min_length=1,
        json_schema_extra={
            "examples": ["English"]
        }
    )

# API response models
class RecognizedSignResponse(BaseModel):
    received_text: str
    message: str


class TextToSignResponse(BaseModel):
    text: str
    language: str
    message: str


# Home API
@app.get("/")
def home():
    return {
        "message": "ISL Backend is running successfully!"
    }


# Hello API
@app.get("/hello")
def hello():
    return {
        "message": "Welcome to ISL AI Interpreter"
    }
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "ISL backend is running"
    }

# Sign-to-Text API
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


# Text-to-Sign API
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

