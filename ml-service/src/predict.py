"""
Prediction Module with SHAP Explanations
"""
import joblib
import numpy as np
import pandas as pd
from preprocess import DataPreprocessor


class Predictor:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.explainer = None
        self.is_loaded = False

    def load_model(self, model_dir='models'):
        """Load model + preprocessor artifacts"""
        self.model = joblib.load(f'{model_dir}/diabetes_model.pkl')
        self.preprocessor = DataPreprocessor()
        self.preprocessor.load_artifacts(model_dir)
        self.is_loaded = True
        print("✅ Predictor: model loaded!")

    def set_explainer(self, explainer):
        """Attach SHAP explainer"""
        self.explainer = explainer
        print("✅ Predictor: SHAP explainer attached!")

    def preprocess_input(self, data: dict):
        """Run full preprocessing pipeline and return scaled features"""
        df = pd.DataFrame([data])
        df = self.preprocessor.encode_categorical(df)
        df = self.preprocessor.engineer_features(df)
        X = self.preprocessor.prepare_features(df)
        return self.preprocessor.scaler.transform(X)

    def predict(self, patient_data: dict, include_explanation: bool = True) -> dict:
        """Predict diabetes risk with optional SHAP explanation"""
        if not self.is_loaded:
            raise ValueError("Model not loaded. Call load_model() first.")

        X_scaled = self.preprocess_input(patient_data)

        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0]
        prob_diabetes = float(probability[1])

        # Risk level — NO emojis (DB-safe)
        if prob_diabetes >= 0.7:
            risk_level = "HIGH"
        elif prob_diabetes >= 0.4:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        result = {
            "prediction": int(prediction),
            "diabetes_probability": prob_diabetes,
            "no_diabetes_probability": float(probability[0]),
            "risk_level": risk_level,
            "confidence": f"{prob_diabetes * 100:.2f}%",
        }

        if include_explanation and self.explainer is not None:
            try:
                result["explanation"] = self.explainer.explain_prediction(X_scaled)
            except Exception as e:
                print(f"⚠️ SHAP explanation failed: {e}")
                result["explanation"] = None

        return result


# Singleton instance
predictor = Predictor()