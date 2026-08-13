"""
FastAPI Server
- Serves predictions via REST API
- Returns SHAP explanations
- Health checks
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import numpy as np

from predict import Predictor
from explain import ModelExplainer

# Initialize FastAPI
app = FastAPI(
    title="Diabetes Prediction API",
    description="Clinical Decision Support System for Diabetes",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictors
predictor = Predictor()
explainer = ModelExplainer()
model_loaded = False

# Request/Response Models
class PatientData(BaseModel):
    gender: str = Field(..., description="Gender: Female or Male")
    age: float = Field(..., ge=0, le=120, description="Age in years")
    hypertension: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    heart_disease: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    smoking_history: str = Field(..., description="Never, Former, Current, etc.")
    bmi: float = Field(..., ge=10, le=70, description="Body Mass Index")
    HbA1c_level: float = Field(..., ge=3.5, le=15, description="HbA1c Level (%)")
    blood_glucose_level: int = Field(..., ge=50, le=500, description="Blood Glucose Level (mg/dL)")

class PredictionResponse(BaseModel):
    prediction: int
    diabetes_probability: float
    no_diabetes_probability: float
    risk_level: str
    confidence: str
    explanation: Optional[Dict[str, Any]] = None

class BatchPredictionRequest(BaseModel):
    patients: List[PatientData]

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]

# Load model on startup
@app.on_event("startup")
async def startup_event():
    global model_loaded, predictor, explainer
    
    try:
        print("📂 Loading model...")
        predictor.load_model('models')
        explainer.load_model('models')
        model_loaded = True
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        model_loaded = False

# Endpoints
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Diabetes Prediction API",
        "status": "healthy" if model_loaded else "model_not_loaded",
        "version": "1.0.0"
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "model_path": "models/diabetes_model.pkl"
    }

@app.get("/api/features", tags=["Metadata"])
async def get_features():
    """Get list of features used by the model"""
    if not model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded"
        )
    return {
        "features": predictor.preprocessor.feature_columns,
        "count": len(predictor.preprocessor.feature_columns)
    }

@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(data: PatientData):
    """Make prediction for a single patient"""
    if not model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Please try again later."
        )
    
    try:
        # Convert to dict
        patient_dict = data.model_dump()
        
        # Get prediction
        result = predictor.predict(patient_dict)
        
        # Get SHAP explanation
        # (In production, you'd compute SHAP here)
        result['explanation'] = None  # Placeholder
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/api/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
async def predict_batch(request: BatchPredictionRequest):
    """Make predictions for multiple patients"""
    if not model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Please try again later."
        )
    
    try:
        results = []
        for patient in request.patients:
            patient_dict = patient.model_dump()
            result = predictor.predict(patient_dict)
            result['explanation'] = None
            results.append(result)
        
        return BatchPredictionResponse(predictions=results)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction failed: {str(e)}"
        )

@app.get("/api/metadata", tags=["Metadata"])
async def get_metadata():
    """Get model metadata"""
    if not model_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded"
        )
    
    try:
        import json
        with open('models/model_metadata.json', 'r') as f:
            metadata = json.load(f)
        return metadata
    except:
        return {"message": "Metadata not available"}

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )