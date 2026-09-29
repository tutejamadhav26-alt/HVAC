"""
HVAC Synthetic Dataset Generator
Generates realistic multivariate sensor data for HVAC anomaly detection,
fault classification, and power/temperature forecasting.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_hvac_dataset(num_samples=5000, seed=42):
    np.random.seed(seed)
    
    start_time = datetime(2026, 1, 1, 0, 0, 0)
    timestamps = [start_time + timedelta(minutes=5 * i) for i in range(num_samples)]
    
    # 60% normal, 40% split among fault scenarios
    scenario_choices = ['normal', 'filter_clogging', 'compressor_overload', 'refrigerant_leakage']
    probabilities = [0.60, 0.15, 0.13, 0.12]
    
    scenarios = np.random.choice(scenario_choices, size=num_samples, p=probabilities)
    
    # Add temporal continuity (grouping faults in contiguous blocks)
    block_size = 20
    for i in range(0, num_samples - block_size, block_size):
        scenarios[i:i+block_size] = scenarios[i]
        
    temperatures = []
    humidities = []
    pressures = []
    currents = []
    powers = []
    is_anomalies = []
    fault_labels = []
    
    # Base ambient variation (sine wave over 24h)
    daily_cycle = np.sin(np.linspace(0, 2 * np.pi * (num_samples / 288), num_samples)) * 2.0
    
    for i in range(num_samples):
        scenario = scenarios[i]
        base_temp = 22.5 + daily_cycle[i]
        base_hum = 50.0 + np.cos(i / 50.0) * 3.0
        base_press = 101.3
        base_curr = 4.8
        base_pow = 1050.0
        
        if scenario == 'normal':
            temp = base_temp + np.random.normal(0, 0.5)
            hum = base_hum + np.random.normal(0, 1.2)
            press = base_press + np.random.normal(0, 0.3)
            curr = base_curr + np.random.normal(0, 0.2)
            pow_val = curr * 220.0 + np.random.normal(0, 15.0)
            is_anom = 0
            
        elif scenario == 'filter_clogging':
            # Airflow restricted: temperature & current gradually rise
            temp = base_temp + np.random.uniform(4.0, 9.0)
            hum = base_hum + np.random.uniform(5.0, 12.0)
            press = base_press - np.random.uniform(1.0, 2.5)
            curr = base_curr + np.random.uniform(1.8, 3.5)
            pow_val = curr * 225.0 + np.random.normal(0, 30.0)
            is_anom = 1
            
        elif scenario == 'compressor_overload':
            # Severe electrical overload: current & power spike dramatically
            temp = base_temp + np.random.uniform(6.0, 12.0)
            hum = base_hum - np.random.uniform(2.0, 8.0)
            press = base_press + np.random.uniform(2.0, 5.0)
            curr = base_curr + np.random.uniform(5.5, 10.0)
            pow_val = curr * 230.0 + np.random.normal(0, 80.0)
            is_anom = 1
            
        elif scenario == 'refrigerant_leakage':
            # Low pressure, poor cooling: pressure drops, temp rises high
            temp = base_temp + np.random.uniform(7.0, 14.0)
            hum = base_hum - np.random.uniform(10.0, 20.0)
            press = base_press - np.random.uniform(15.0, 30.0)
            curr = base_curr + np.random.uniform(0.5, 2.0)
            pow_val = curr * 215.0 + np.random.normal(0, 25.0)
            is_anom = 1
            
        temperatures.append(round(float(temp), 2))
        humidities.append(round(float(hum), 2))
        pressures.append(round(float(press), 2))
        currents.append(round(float(curr), 2))
        powers.append(round(float(pow_val), 2))
        is_anomalies.append(is_anom)
        fault_labels.append(scenario)
        
    df = pd.DataFrame({
        'timestamp': timestamps,
        'temperature': temperatures,
        'humidity': humidities,
        'pressure': pressures,
        'current': currents,
        'power': powers,
        'is_anomaly': is_anomalies,
        'fault_label': fault_labels
    })
    
    os.makedirs('ml/dataset', exist_ok=True)
    csv_path = 'ml/dataset/hvac_telemetry.csv'
    df.to_csv(csv_path, index=False)
    print(f"[+] Successfully generated {num_samples} samples saved to '{csv_path}'")
    print(f"Scenario distribution:\n{df['fault_label'].value_counts()}")
    return csv_path

if __name__ == "__main__":
    generate_hvac_dataset()
