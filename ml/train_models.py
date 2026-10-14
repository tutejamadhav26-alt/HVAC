"""
HVAC Model Trainer (Enhanced with Occupancy & Outdoor Climate)
Trains:
1. Isolation Forest (Anomaly Detection)
2. XGBoost / Random Forest Classifier (Multi-Class Fault Classification)
3. Random Forest Power Regressor (Future Load Forecasting)
Saves models to backend/models/
"""

import os
import json
import joblib
from datetime import datetime, timezone
import numpy as np
import polars as pl
from sklearn.ensemble import IsolationForest, RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import sys
sys.path.insert(0, os.path.dirname(__file__))
from generate_dataset import generate_hvac_dataset

def train_hvac_models():
    dataset_path = 'ml/dataset/hvac_telemetry.csv'
    print("[+] Generating fresh 15,000 samples dataset...")
    generate_hvac_dataset(num_samples=15000)
        
    df = pl.read_csv(dataset_path)
    
    feature_cols = ['temperature', 'humidity', 'pressure', 'current', 'power', 'occupancy', 'outdoor_temp']
    X = df.select(feature_cols).to_numpy()
    y_fault = df['fault_label'].to_numpy()
    y_anomaly = df['is_anomaly'].to_numpy()
    
    # 1. Standard Scaler
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 2. Label Encoder for Fault Classes
    label_encoder = LabelEncoder()
    y_fault_encoded = label_encoder.fit_transform(y_fault)
    
    # Train/Test Split (80% train / 20% test)
    X_train, X_test, y_fault_train, y_fault_test, X_scaled_train, X_scaled_test = train_test_split(
        X, y_fault_encoded, X_scaled, test_size=0.2, random_state=42, stratify=y_fault_encoded
    )
    
    # 3. Model 1: Isolation Forest (Anomaly Detection)
    print("[+] Training Isolation Forest on 15,000 samples...")
    iso_forest = IsolationForest(n_estimators=100, contamination=0.40, random_state=42)
    iso_forest.fit(X_scaled_train)
    
    # 4. Model 2: Fault Classifier (Random Forest / XGBoost)
    print("[+] Training Fault Classifier...")
    try:
        from xgboost import XGBClassifier
        fault_classifier = XGBClassifier(n_estimators=120, max_depth=6, learning_rate=0.08, random_state=42)
        print("[+] Using XGBClassifier for fault classification")
    except ImportError:
        fault_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        print("[+] Using RandomForestClassifier for fault classification")
        
    fault_classifier.fit(X_train, y_fault_train)
    
    # 5. Model 3: Power Forecaster
    print("[+] Training Power Forecaster Regressor...")
    power_vals = df['power'].to_numpy()
    X_forecaster = X[:-1]
    y_power_next = power_vals[1:]
    
    power_forecaster = RandomForestRegressor(n_estimators=60, max_depth=12, random_state=42, n_jobs=-1)
    power_forecaster.fit(X_forecaster, y_power_next)
    
    # Destination directory
    model_dir = 'backend/models'
    os.makedirs(model_dir, exist_ok=True)
    
    # Save artifacts
    print("[+] Exporting trained model artifacts to backend/models/...")
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.joblib'))
    joblib.dump(label_encoder, os.path.join(model_dir, 'label_encoder.joblib'))
    joblib.dump(iso_forest, os.path.join(model_dir, 'isolation_forest.joblib'))
    joblib.dump(fault_classifier, os.path.join(model_dir, 'fault_classifier.joblib'))
    joblib.dump(power_forecaster, os.path.join(model_dir, 'power_forecaster.joblib'))
    
    metadata = {
        'feature_names': feature_cols,
        'fault_classes': list(label_encoder.classes_),
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'num_samples': len(df)
    }
    
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"[+] All models successfully trained on {len(df)} samples and saved to '{model_dir}'!")

if __name__ == "__main__":
    train_hvac_models()
