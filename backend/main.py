
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ISL AI Interpreter")
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

@app.get("/")
def home():
    return {
        "message": "ISL Backend is running successfully!"
    }

@app.get("/hello")
def hello():
    return {
        "message": "Welcome to ISL AI Interpreter"
    }
from pydantic import BaseModel

class RecognizedSign(BaseModel):
    text: str

@app.post("/recognized-text")
def receive_recognized_text(data: RecognizedSign):
    return {
        "received_text": data.text,
        "message": "Recognized sign text received successfully"
    }