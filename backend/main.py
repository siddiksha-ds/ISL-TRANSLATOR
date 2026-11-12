
from fastapi import FastAPI

app = FastAPI(title="ISL AI Interpreter")

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
    