"""
Prediction Module
- Loads trained model
- Makes predictions
- Returns probabilities and risk levels
"""
import joblib
import numpy as np
import pandas as pd
from preprocess import DataPreprocessor
from typing import Dict, Any, List

class Predictor:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.is_loaded = False
        
    def load_model(self, model_dir: str = 'models'):
        """Load trained model and artifacts"""
        self.model = joblib.load(f'{model_dir}/diabetes_model.pkl')
        
        # Load preprocessor artifacts
        self.preprocessor = DataPreprocessor()
        self.preprocessor.load_artifacts(model_dir)
        
        self.is_loaded = True
        print("✅ Model loaded successfully!")
        
    def preprocess_input(self, data: Dict[str, Any]) -> np.ndarray:
        """Preprocess input data for prediction"""
        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # Encode categorical
        df = self.preprocessor.encode_categorical(df)
        
        # Feature engineering
        df = self.preprocessor.engineer_features(df)
        
        # Select features
        X = self.preprocessor.prepare_features(df)
        
        # Scale
        X_scaled = self.preprocessor.scaler.transform(X)
        
        return X_scaled
    
    def predict(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction for a single patient"""
        if not self.is_loaded:
            raise ValueError("Model not loaded! Call load_model() first.")
        
        # Preprocess
        X = self.preprocess_input(patient_data)
        
        # Predict
        prediction = self.model.predict(X)[0]
        probability = self.model.predict_proba(X)[0]
        
        # Determine risk level
        prob_diabetes = float(probability[1])
        if prob_diabetes >= 0.7:
            risk_level = "🔴 HIGH"
        elif prob_diabetes >= 0.4:
            risk_level = "🟡 MODERATE"
        else:
            risk_level = "🟢 LOW"
        
        return {
            'prediction': int(prediction),
            'diabetes_probability': prob_diabetes,
            'no_diabetes_probability': float(probability[0]),
            'risk_level': risk_level,
            'confidence': f"{prob_diabetes*100:.2f}%"
        }
    
    def predict_batch(self, patients_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Make predictions for multiple patients"""
        results = []
        for patient in patients_data:
            results.append(self.predict(patient))
        return results

# Example usage
if __name__ == "__main__":
    # Load model
    predictor = Predictor()
    predictor.load_model()
    
    # Test prediction
    sample_patient = {
        'gender': 'Female',
        'age': 45,
        'hypertension': 0,
        'heart_disease': 0,
        'smoking_history': 'never',
        'bmi': 33.6,
        'HbA1c_level': 6.8,
        'blood_glucose_level': 160
    }
    
    result = predictor.predict(sample_patient)
    
    print("\n🔮 PREDICTION RESULT")
    print("="*40)
    print(f"Patient: {sample_patient['gender']}, Age {sample_patient['age']}")
    print(f"BMI: {sample_patient['bmi']}, Glucose: {sample_patient['blood_glucose_level']}")
    print(f"HbA1c: {sample_patient['HbA1c_level']}")
    print("-"*40)
    print(f"Prediction: {result['prediction']} - {result['risk_level']}")
    print(f"Probability: {result['confidence']}")