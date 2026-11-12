
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="ISL AI Interpreter")

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
    text: str = Field(min_length=1)

class TextToSign(BaseModel):
    text: str = Field(min_length=1)
    language: str = Field(default="English", min_length=1)

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

# Sign recognition to text API
@app.post("/recognized-text")
def receive_recognized_text(data: RecognizedSign):
    return {
        "received_text": data.text,
        "message": "Recognized sign text received successfully"
    }

# Text to sign language API
@app.post("/text-to-sign")
def convert_text_to_sign(data: TextToSign):
    return {
        "text": data.text,
        "language": data.language,
        "message": "Text received for sign language conversion"
    }
