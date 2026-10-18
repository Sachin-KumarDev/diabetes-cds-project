"""
Diabetes ML Service — FastAPI Server with SHAP Explanations
"""
import os
import json
import numpy as np
from typing import List, Optional, Dict, Any
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from predict import predictor
from explain import ModelExplainer
from chatbot.agent import ClinicalChatbot

# ---------- Setup ----------
load_dotenv()

app = FastAPI(
    title="Diabetes ML Service",
    description="ML Service for Diabetes Prediction with SHAP Explainability",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Globals ----------
explainer = ModelExplainer()
chatbot = ClinicalChatbot()
model_loaded = False

# ---------- Schemas ----------
class PatientData(BaseModel):
    gender: str
    age: float
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    HbA1c_level: float
    blood_glucose_level: int

class PredictionResponse(BaseModel):
    prediction: int
    diabetes_probability: float
    no_diabetes_probability: float
    risk_level: str
    confidence: str
    explanation: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None
    patient_data: Optional[Dict] = None

class ChatStartRequest(BaseModel):
    patient_data: Optional[Dict] = None

# ---------- Startup ----------
@app.on_event("startup")
async def startup_event():
    global model_loaded
    try:
        print("📂 Loading model...")
        predictor.load_model("models")
        explainer.load_model("models")
        predictor.set_explainer(explainer)
        model_loaded = True
        print("✅ ML service ready!")
    except Exception as e:
        print(f"❌ Startup error: {e}")
        model_loaded = False

# ---------- Health ----------
@app.get("/")
async def root():
    return {
        "service": "Diabetes ML Service",
        "version": "2.0.0",
        "status": "healthy" if model_loaded else "model_not_loaded",
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "service": "Diabetes ML Service",
    }

# ---------- Prediction ----------
@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PatientData):
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        return predictor.predict(data.dict(), include_explanation=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/explain")
async def predict_with_explanation(data: PatientData):
    """Return prediction + SHAP explanation"""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    try:
        return predictor.predict(data.dict(), include_explanation=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Features / Metadata ----------
@app.get("/features")
async def get_features():
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "features": predictor.preprocessor.feature_columns,
        "count": len(predictor.preprocessor.feature_columns),
    }

@app.get("/metadata")
async def get_metadata():
    try:
        with open("models/model_metadata.json", "r") as f:
            return json.load(f)
    except Exception:
        return {"message": "Metadata not available"}

# ---------- Chatbot ----------
@app.post("/chat/start")
async def chat_start(request: ChatStartRequest):
    try:
        return {"success": True, "data": chatbot.start_conversation(request.patient_data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_message(request: ChatRequest):
    try:
        if request.patient_data:
            chatbot.context_manager.update_patient_context(request.patient_data)
        return {"success": True, "data": chatbot.chat(request.question)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/suggested")
async def get_suggested():
    from chatbot.prompts import SUGGESTED_QUESTIONS
    return {"success": True, "data": {"suggested_questions": SUGGESTED_QUESTIONS}}

# ---------- Run ----------
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)