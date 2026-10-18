"""
Explainability Module - SHAP explanations for predictions
"""
import shap
import numpy as np
import pandas as pd
import joblib
import os


class ModelExplainer:
    def __init__(self):
        self.explainer = None
        self.model = None
        self.preprocessor = None
        self.feature_names = []

    def load_model(self, model_dir='models'):
        """Load model and create SHAP explainer"""
        # Load trained model
        self.model = joblib.load(f'{model_dir}/diabetes_model.pkl')

        # Load preprocessor artifacts
        from preprocess import DataPreprocessor
        self.preprocessor = DataPreprocessor()
        self.preprocessor.load_artifacts(model_dir)
        self.feature_names = self.preprocessor.feature_columns

        # Create SHAP explainer
        try:
            self.explainer = shap.TreeExplainer(self.model)
            print(f"✅ SHAP TreeExplainer created for {type(self.model).__name__}")
        except Exception as e:
            print(f"⚠️ TreeExplainer failed: {e}")
            print("   Using KernelExplainer instead (slower)...")
            # Fallback: use a small background sample
            background = np.zeros((10, len(self.feature_names)))
            self.explainer = shap.KernelExplainer(
                self.model.predict_proba,
                background
            )

    def explain_prediction(self, scaled_features):
        """
        Generate SHAP explanation for a single prediction.

        Args:
            scaled_features: numpy array (1 x n_features) already scaled

        Returns:
            dict with shap values, feature names, top factors, base value
        """
        if self.explainer is None:
            raise ValueError("Explainer not initialized. Call load_model() first.")

        # Compute SHAP values
        shap_values = self.explainer.shap_values(scaled_features)

        # Normalize SHAP output (handles list, array, 2D, 3D)
        if isinstance(shap_values, list):
            # Binary classification: take class 1 (diabetes)
            shap_vals = np.array(shap_values[1][0]).flatten()
            base_value = (
                self.explainer.expected_value[1]
                if isinstance(self.explainer.expected_value, (list, np.ndarray))
                else self.explainer.expected_value
            )
        else:
            shap_arr = np.array(shap_values)
            if shap_arr.ndim == 2:
                shap_vals = shap_arr[0].flatten()
            else:
                shap_vals = shap_arr.flatten()
            base_value = (
                self.explainer.expected_value[1]
                if isinstance(self.explainer.expected_value, (list, np.ndarray))
                else self.explainer.expected_value
            )

        feature_values = np.array(scaled_features[0]).flatten().tolist()

        # Build top factors (top 5 by absolute impact)
        pairs = list(zip(self.feature_names, shap_vals))
        pairs_sorted = sorted(pairs, key=lambda x: abs(x[1]), reverse=True)[:5]

        top_factors = [
            {
                "feature": name,
                "impact": float(val),
                "direction": "increases_risk" if val > 0 else "decreases_risk",
            }
            for name, val in pairs_sorted
        ]

        explanation = {
            "shap_values": [float(v) for v in shap_vals],
            "feature_names": self.feature_names,
            "feature_values": feature_values,
            "base_value": float(base_value),
            "prediction_contribution": float(np.sum(shap_vals)),
            "top_factors": top_factors,
        }
        return explanation

    def get_feature_importance(self):
        """Global feature importance"""
        if hasattr(self.model, "feature_importances_"):
            return {
                "features": self.feature_names,
                "importance": [float(x) for x in self.model.feature_importances_],
            }
        return {"features": self.feature_names, "importance": []}