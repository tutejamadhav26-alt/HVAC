"""
HVAC Model Trainer
Trains Isolation Forest (Anomaly Detection), Random Forest / XGBoost (Fault Classifier),
and Power/Temperature Regressor Forecaster.
Saves models to backend/models/
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import sys
sys.path.insert(0, os.path.dirname(__file__))
from generate_dataset import generate_hvac_dataset

def train_hvac_models():
    dataset_path = 'ml/dataset/hvac_telemetry.csv'
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating now...")
        generate_hvac_dataset()
        
    df = pd.read_csv(dataset_path)
    
    feature_cols = ['temperature', 'humidity', 'pressure', 'current', 'power']
    X = df[feature_cols]
    y_fault = df['fault_label']
    y_anomaly = df['is_anomaly']
    
    # 1. Standard Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 2. Label Encoder for Fault Classes
    label_encoder = LabelEncoder()
    y_fault_encoded = label_encoder.fit_transform(y_fault)
    
    # Train/Test Split
    X_train, X_test, y_fault_train, y_fault_test, X_scaled_train, X_scaled_test = train_test_split(
        X, y_fault_encoded, X_scaled, test_size=0.2, random_state=42, stratify=y_fault_encoded
    )
    
    # 3. Model 1: Isolation Forest (Anomaly Detection)
    # Contamination ~ 0.40 since 40% of generated data has faults
    iso_forest = IsolationForest(n_estimators=100, contamination=0.40, random_state=42)
    iso_forest.fit(X_scaled_train)
    
    # 4. Model 2: Fault Classifier (Random Forest / XGBoost fallback)
    try:
        from xgboost import XGBClassifier
        fault_classifier = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
        print("[+] Using XGBClassifier for fault classification")
    except ImportError:
        fault_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        print("[+] Using RandomForestClassifier for fault classification")
        
    fault_classifier.fit(X_train, y_fault_train)
    
    # 5. Model 3: Power Forecaster (Predict power based on lag/current metrics)
    df['power_next'] = df['power'].shift(-1)
    df_clean = df.dropna()
    X_forecaster = df_clean[feature_cols]
    y_power_next = df_clean['power_next']
    
    power_forecaster = RandomForestRegressor(n_estimators=100, random_state=42)
    power_forecaster.fit(X_forecaster, y_power_next)
    
    # Ensure destination directory exists
    model_dir = 'backend/models'
    os.makedirs(model_dir, exist_ok=True)
    
    # Save artifacts
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.joblib'))
    joblib.dump(label_encoder, os.path.join(model_dir, 'label_encoder.joblib'))
    joblib.dump(iso_forest, os.path.join(model_dir, 'isolation_forest.joblib'))
    joblib.dump(fault_classifier, os.path.join(model_dir, 'fault_classifier.joblib'))
    joblib.dump(power_forecaster, os.path.join(model_dir, 'power_forecaster.joblib'))
    
    metadata = {
        'feature_names': feature_cols,
        'fault_classes': list(label_encoder.classes_),
        'trained_at': pd.Timestamp.now().isoformat(),
        'num_samples': len(df)
    }
    
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[+] All models trained successfully and saved to '{model_dir}/'")

if __name__ == "__main__":
    train_hvac_models()
