"""
Data Preprocessing Module
- Loads dataset
- Handles categorical features
- Engineers new features
- Scales numerical features
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
import joblib
import os
from typing import Tuple, List

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = []
        
    def load_data(self, filepath: str) -> pd.DataFrame:
        """Load dataset"""
        df = pd.read_csv(filepath)
        print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
        return df
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and handle missing values"""
        df_clean = df.copy()
        
        # Check for missing values
        missing = df_clean.isnull().sum()
        if missing.sum() > 0:
            print(f"⚠️ Missing values found: {missing[missing>0].to_dict()}")
            df_clean = df_clean.fillna(df_clean.median())
        
        # Remove duplicates
        before = len(df_clean)
        df_clean = df_clean.drop_duplicates()
        after = len(df_clean)
        if before != after:
            print(f"🗑️ Removed {before - after} duplicate rows")
        
        return df_clean
    
    def encode_categorical(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical variables"""
        df_encoded = df.copy()
        
        categorical_cols = ['gender', 'smoking_history']
        
        for col in categorical_cols:
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
            self.label_encoders[col] = le
            print(f"✅ Encoded '{col}' with {len(le.classes_)} unique values")
        
        return df_encoded
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create new features"""
        df_fe = df.copy()
        
        # 1. BMI Categories (WHO Classification)
        df_fe['BMI_Category'] = pd.cut(
            df_fe['bmi'],
            bins=[0, 18.5, 25, 30, 35, 40, 100],
            labels=[0, 1, 2, 3, 4, 5]
        ).astype(int)
        
        # 2. Glucose Risk Categories
        df_fe['Glucose_Category'] = pd.cut(
            df_fe['blood_glucose_level'],
            bins=[0, 100, 126, 200, 500],
            labels=[0, 1, 2, 3]
        ).astype(int)
        
        # 3. Age Groups
        df_fe['Age_Group'] = pd.cut(
            df_fe['age'],
            bins=[0, 18, 30, 45, 60, 100],
            labels=[0, 1, 2, 3, 4]
        ).astype(int)
        
        # 4. HbA1c Risk Score
        df_fe['HbA1c_Risk'] = df_fe['HbA1c_level'].apply(
            lambda x: 0 if x < 5.7 else (1 if x < 6.5 else 2)
        )
        
        # 5. Glucose * BMI Interaction
        df_fe['Glucose_BMI_Interaction'] = (
            df_fe['blood_glucose_level'] * df_fe['bmi'] / 100
        )
        
        # 6. Age * Glucose Interaction
        df_fe['Age_Glucose_Interaction'] = (
            df_fe['age'] * df_fe['blood_glucose_level'] / 100
        )
        
        # 7. Hypertension & Heart Disease combination
        df_fe['Cardiovascular_Risk'] = (
            df_fe['hypertension'] + df_fe['heart_disease']
        )
        
        # 8. Smoking & Age interaction
        df_fe['Smoking_Age'] = df_fe['smoking_history'] * df_fe['age']
        
        print(f"✅ Added {df_fe.shape[1] - df.shape[1]} new features")
        return df_fe
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Select features for training"""
        # Define feature columns
        self.feature_columns = [
            'gender', 'age', 'hypertension', 'heart_disease', 
            'smoking_history', 'bmi', 'HbA1c_level', 
            'blood_glucose_level',
            'BMI_Category', 'Glucose_Category', 'Age_Group',
            'HbA1c_Risk', 'Glucose_BMI_Interaction',
            'Age_Glucose_Interaction', 'Cardiovascular_Risk',
            'Smoking_Age'
        ]
        
        # Ensure all feature columns exist
        for col in self.feature_columns:
            if col not in df.columns:
                raise ValueError(f"Feature '{col}' not found in data")
        
        return df[self.feature_columns]
    
    def split_and_scale(self, 
                        X: pd.DataFrame, 
                        y: pd.Series,
                        test_size: float = 0.2,
                        random_state: int = 42) -> Tuple:
        """Split data and scale features"""
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, 
            random_state=random_state, 
            stratify=y
        )
        
        print(f"📊 Training set: {len(X_train)} samples")
        print(f"📊 Test set: {len(X_test)} samples")
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Apply SMOTE to handle class imbalance
        smote = SMOTE(random_state=random_state)
        X_train_resampled, y_train_resampled = smote.fit_resample(
            X_train_scaled, y_train
        )
        
        print(f"🔄 After SMOTE: {len(X_train_resampled)} samples")
        print(f"   Class distribution: {pd.Series(y_train_resampled).value_counts().to_dict()}")
        
        return X_train_resampled, X_test_scaled, y_train_resampled, y_test
    
    def save_artifacts(self, save_dir: str = 'models'):
        """Save preprocessor artifacts"""
        os.makedirs(save_dir, exist_ok=True)
        
        joblib.dump(self.scaler, f'{save_dir}/scaler.pkl')
        joblib.dump(self.label_encoders, f'{save_dir}/label_encoders.pkl')
        joblib.dump(self.feature_columns, f'{save_dir}/features.pkl')
        
        print(f"💾 Saved preprocessor artifacts to '{save_dir}/'")
    
    def load_artifacts(self, load_dir: str = 'models'):
        """Load preprocessor artifacts"""
        self.scaler = joblib.load(f'{load_dir}/scaler.pkl')
        self.label_encoders = joblib.load(f'{load_dir}/label_encoders.pkl')
        self.feature_columns = joblib.load(f'{load_dir}/features.pkl')
        print(f"📂 Loaded preprocessor artifacts from '{load_dir}/'")