"""
HVAC Model Evaluator
Evaluates trained ML models and outputs performance metrics:
Accuracy, Precision, Recall, F1-Score, Confusion Matrix, RMSE, MAE.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, mean_squared_error, mean_absolute_error
from sklearn.model_selection import train_test_split

def evaluate_hvac_models():
    model_dir = 'backend/models'
    dataset_path = 'ml/dataset/hvac_telemetry.csv'
    
    if not os.path.exists(dataset_path):
        print("Dataset missing. Please run ml/generate_dataset.py first.")
        return
        
    if not os.path.exists(os.path.join(model_dir, 'fault_classifier.joblib')):
        print("Models missing. Please run ml/train_models.py first.")
        return
        
    df = pd.read_csv(dataset_path)
    feature_cols = ['temperature', 'humidity', 'pressure', 'current', 'power']
    X = df[feature_cols]
    y_fault = df['fault_label']
    
    # Load Saved Artifacts
    scaler = joblib.load(os.path.join(model_dir, 'scaler.joblib'))
    label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.joblib'))
    iso_forest = joblib.load(os.path.join(model_dir, 'isolation_forest.joblib'))
    fault_classifier = joblib.load(os.path.join(model_dir, 'fault_classifier.joblib'))
    power_forecaster = joblib.load(os.path.join(model_dir, 'power_forecaster.joblib'))
    
    y_encoded = label_encoder.transform(y_fault)
    X_scaled = scaler.transform(X)
    
    _, X_test, _, y_test, _, X_scaled_test = train_test_split(
        X, y_encoded, X_scaled, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # 1. Evaluate Fault Classifier
    y_pred = fault_classifier.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    cm = confusion_matrix(y_test, y_pred)
    
    print("=" * 60)
    print("           EVALUATION REPORT: FAULT CLASSIFIER          ")
    print("=" * 60)
    print(f"Accuracy:  {accuracy * 100:.2f}%")
    print(f"Precision: {precision * 100:.2f}%")
    print(f"Recall:    {recall * 100:.2f}%")
    print(f"F1-Score:  {f1 * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=label_encoder.classes_, columns=label_encoder.classes_))
    
    # 2. Evaluate Anomaly Detection (Isolation Forest)
    # -1 is anomaly in Isolation Forest, 1 is normal
    iso_preds = iso_forest.predict(X_scaled_test)
    anomaly_preds = np.where(iso_preds == -1, 1, 0)
    true_anomalies = np.where(y_test != label_encoder.transform(['normal'])[0], 1, 0)
    iso_acc = accuracy_score(true_anomalies, anomaly_preds)
    print("\n" + "=" * 60)
    print("        EVALUATION REPORT: ANOMALY DETECTOR (ISOLATION FOREST)")
    print("=" * 60)
    print(f"Anomaly Detection Accuracy: {iso_acc * 100:.2f}%")
    
    # 3. Evaluate Power Forecaster
    df['power_next'] = df['power'].shift(-1)
    df_clean = df.dropna()
    X_fore = df_clean[feature_cols]
    y_true_power = df_clean['power_next']
    
    y_fore_pred = power_forecaster.predict(X_fore)
    rmse = np.sqrt(mean_squared_error(y_true_power, y_fore_pred))
    mae = mean_absolute_error(y_true_power, y_fore_pred)
    
    print("\n" + "=" * 60)
    print("           EVALUATION REPORT: POWER FORECASTER          ")
    print("=" * 60)
    print(f"RMSE: {rmse:.4f} W")
    print(f"MAE:  {mae:.4f} W")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_hvac_models()
