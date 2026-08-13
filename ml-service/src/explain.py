"""
Explainability Module
- SHAP explanations for predictions
- Feature importance visualization
"""
import shap
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from predict import Predictor
import joblib

class ModelExplainer:
    def __init__(self):
        self.explainer = None
        self.model = None
        self.preprocessor = None
        self.X_background = None
        
    def load_model(self, model_dir: str = 'models'):
        """Load model and create SHAP explainer"""
        # Load model
        self.model = joblib.load(f'{model_dir}/diabetes_model.pkl')
        
        # Load preprocessor
        from preprocess import DataPreprocessor
        self.preprocessor = DataPreprocessor()
        self.preprocessor.load_artifacts(model_dir)
        
        # Create explainer
        self.explainer = shap.TreeExplainer(self.model)
        print("✅ SHAP explainer created!")
        
    def set_background_data(self, X_sample: np.ndarray):
        """Set background data for SHAP explanations"""
        self.X_background = X_sample
        
    def explain_prediction(self, patient_data: np.ndarray) -> dict:
        """Get SHAP values for a prediction"""
        if self.explainer is None:
            raise ValueError("Model not loaded! Call load_model() first.")
        
        # Get SHAP values
        shap_values = self.explainer.shap_values(patient_data)
        
        # Get feature names
        feature_names = self.preprocessor.feature_columns
        
        return {
            'shap_values': shap_values.tolist(),
            'feature_names': feature_names,
            'base_value': float(self.explainer.expected_value)
        }
    
    def plot_shap_summary(self, X_sample: np.ndarray, save_path: str = None):
        """Plot SHAP summary plot"""
        shap_values = self.explainer.shap_values(X_sample)
        feature_names = self.preprocessor.feature_columns
        
        shap.summary_plot(shap_values, X_sample, feature_names=feature_names, show=False)
        
        if save_path:
            plt.savefig(save_path, bbox_inches='tight', dpi=300)
            print(f"💾 SHAP summary saved to {save_path}")
        plt.show()
    
    def plot_shap_waterfall(self, patient_data: np.ndarray, save_path: str = None):
        """Plot SHAP waterfall plot for a single prediction"""
        shap_values = self.explainer.shap_values(patient_data)
        feature_names = self.preprocessor.feature_columns
        
        shap.waterfall_plot(
            shap.Explanation(
                values=shap_values[0],
                base_values=self.explainer.expected_value,
                data=patient_data[0],
                feature_names=feature_names
            ),
            show=False
        )
        
        if save_path:
            plt.savefig(save_path, bbox_inches='tight', dpi=300)
            print(f"💾 SHAP waterfall saved to {save_path}")
        plt.show()

# Example usage
if __name__ == "__main__":
    explainer = ModelExplainer()
    explainer.load_model()
    
    # Sample patient
    sample_patient = np.array([[0, 45, 0, 0, 0, 33.6, 6.8, 160, 3, 2, 3, 1, 53.76, 72, 0, 0]])
    
    # Get explanation
    explanation = explainer.explain_prediction(sample_patient)
    print(f"Base value: {explanation['base_value']:.4f}")
    print(f"Feature names: {explanation['feature_names'][:5]}...")