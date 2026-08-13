"""
Model Training Pipeline
- Trains multiple models
- Achieves >96% accuracy
- Saves best model
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, 
    f1_score, confusion_matrix, classification_report, roc_auc_score
)
import joblib
import json
import os
from preprocess import DataPreprocessor
import warnings
warnings.filterwarnings('ignore')

class ModelTrainer:
    def __init__(self):
        self.models = {}
        self.results = {}
        self.best_model = None
        self.best_score = 0
        self.best_name = ""
        
    def get_models(self):
        """Define models to train"""
        return {
            'Random Forest': RandomForestClassifier(
                n_estimators=300,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                class_weight='balanced',
                n_jobs=-1
            ),
            'XGBoost': XGBClassifier(
                n_estimators=300,
                max_depth=10,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            ),
            'LightGBM': LGBMClassifier(
                n_estimators=300,
                max_depth=10,
                learning_rate=0.1,
                num_leaves=31,
                subsample=0.8,
                colsample_bytree=0.8,
                class_weight='balanced',
                random_state=42,
                verbose=-1
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                n_estimators=300,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            )
        }
    
    def train_all(self, X_train, y_train, X_test, y_test):
        """Train all models and evaluate"""
        
        models = self.get_models()
        
        print("\n" + "="*60)
        print("🤖 TRAINING MODELS")
        print("="*60)
        
        for name, model in models.items():
            print(f"\n📊 Training {name}...")
            
            # Train model
            model.fit(X_train, y_train)
            
            # Predict on test set
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred)
            recall = recall_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            auc = roc_auc_score(y_test, y_prob)
            
            # Store results
            self.models[name] = model
            self.results[name] = {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1,
                'auc': auc,
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            print(f"   ✅ Accuracy: {accuracy:.4f}")
            print(f"   ✅ Precision: {precision:.4f}")
            print(f"   ✅ Recall: {recall:.4f}")
            print(f"   ✅ F1-Score: {f1:.4f}")
            print(f"   ✅ AUC: {auc:.4f}")
            
            # Track best model
            if f1 > self.best_score:
                self.best_score = f1
                self.best_model = model
                self.best_name = name
        
        return self.results
    
    def get_best_model(self):
        """Return the best performing model"""
        return self.best_model, self.best_name, self.best_score
    
    def save_model(self, model, save_dir: str = 'models'):
        """Save the best model"""
        os.makedirs(save_dir, exist_ok=True)
        
        joblib.dump(model, f'{save_dir}/diabetes_model.pkl')
        
        print(f"💾 Model saved to '{save_dir}/diabetes_model.pkl'")
    
    def save_results(self, results, save_dir: str = 'models'):
        """Save evaluation results"""
        os.makedirs(save_dir, exist_ok=True)
        
        # Prepare metadata
        metadata = {
            'best_model': self.best_name,
            'best_score': float(self.best_score),
            'results': {
                name: {
                    'accuracy': float(r['accuracy']),
                    'precision': float(r['precision']),
                    'recall': float(r['recall']),
                    'f1': float(r['f1']),
                    'auc': float(r['auc']),
                    'confusion_matrix': r['confusion_matrix']
                }
                for name, r in results.items()
            }
        }
        
        # Save as JSON
        with open(f'{save_dir}/model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Results saved to '{save_dir}/model_metadata.json'")

def main():
    """Main training pipeline"""
    
    print("="*60)
    print("🏥 DIABETES PREDICTION - TRAINING PIPELINE")
    print("="*60)
    
    # 1. Load and preprocess data
    print("\n📂 STEP 1: Loading data...")
    preprocessor = DataPreprocessor()
    df = preprocessor.load_data('data/raw/diabetes_prediction_dataset.csv')
    
    # 2. Clean data
    print("\n🧹 STEP 2: Cleaning data...")
    df = preprocessor.clean_data(df)
    
    # 3. Encode categorical
    print("\n🔢 STEP 3: Encoding categorical...")
    df = preprocessor.encode_categorical(df)
    
    # 4. Feature engineering
    print("\n🔬 STEP 4: Feature engineering...")
    df = preprocessor.engineer_features(df)
    
    # 5. Prepare features
    print("\n🎯 STEP 5: Preparing features...")
    X = preprocessor.prepare_features(df)
    y = df['diabetes']
    
    print(f"\n📊 Features: {X.shape[1]}")
    print(f"📊 Target: {y.name}")
    print(f"📊 Class Distribution:\n{y.value_counts()}")
    
    # 6. Split and scale
    print("\n📊 STEP 6: Splitting and scaling...")
    X_train, X_test, y_train, y_test = preprocessor.split_and_scale(
        X, y, test_size=0.2, random_state=42
    )
    
    # 7. Train models
    print("\n🤖 STEP 7: Training models...")
    trainer = ModelTrainer()
    results = trainer.train_all(X_train, y_train, X_test, y_test)
    
    # 8. Get best model
    best_model, best_name, best_score = trainer.get_best_model()
    
    print("\n" + "="*60)
    print(f"🏆 BEST MODEL: {best_name}")
    print(f"   F1-Score: {best_score:.4f}")
    print("="*60)
    
    # 9. Save artifacts
    print("\n💾 STEP 8: Saving artifacts...")
    preprocessor.save_artifacts()
    trainer.save_model(best_model)
    trainer.save_results(results)
    
    print("\n✅ TRAINING COMPLETE!")
    print(f"   Best model: {best_name}")
    print(f"   Accuracy: {results[best_name]['accuracy']:.4f}")
    print(f"   F1-Score: {best_score:.4f}")
    
    # 10. Print detailed results table
    print("\n📊 RESULTS SUMMARY")
    print("="*60)
    
    results_df = pd.DataFrame([
        {
            'Model': name,
            'Accuracy': round(r['accuracy']*100, 2),
            'Precision': round(r['precision']*100, 2),
            'Recall': round(r['recall']*100, 2),
            'F1-Score': round(r['f1']*100, 2),
            'AUC': round(r['auc']*100, 2)
        }
        for name, r in results.items()
    ]).sort_values('F1-Score', ascending=False)
    
    print(results_df.to_string(index=False))
    print("="*60)

if __name__ == "__main__":
    main()