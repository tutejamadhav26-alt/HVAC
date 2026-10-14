"""
HVAC Synthetic Dataset Generator (Enhanced with Occupancy & Outdoor Climate)
Generates realistic multivariate sensor data (15,000 samples) across:
- Indoor Temperature (°C), Humidity (%), Pressure (kPa), Current (A), Power (W)
- Occupancy (count 0-30 people)
- Outdoor Ambient Temperature (°C)
- Fault scenarios: Normal, Filter Clogging, Compressor Overload, Refrigerant Leakage
"""

import os
import csv
from collections import Counter
import numpy as np
from datetime import datetime, timedelta

def generate_hvac_dataset(num_samples=15000, seed=42):
    np.random.seed(seed)
    
    start_time = datetime(2026, 1, 1, 0, 0, 0)
    timestamps = [start_time + timedelta(minutes=5 * i) for i in range(num_samples)]
    
    # 60% normal, 40% split among fault scenarios
    scenario_choices = ['normal', 'filter_clogging', 'compressor_overload', 'refrigerant_leakage']
    probabilities = [0.60, 0.15, 0.13, 0.12]
    
    scenarios = np.random.choice(scenario_choices, size=num_samples, p=probabilities)
    
    # Temporal continuity (grouping faults in contiguous blocks)
    block_size = 24
    for i in range(0, num_samples - block_size, block_size):
        scenarios[i:i+block_size] = scenarios[i]
        
    temperatures = []
    humidities = []
    pressures = []
    currents = []
    powers = []
    occupancies = []
    outdoor_temps = []
    is_anomalies = []
    fault_labels = []
    
    # Daily outdoor solar cycle (288 five-minute steps = 24 hours)
    daily_phase = np.linspace(0, 2 * np.pi * (num_samples / 288), num_samples)
    outdoor_cycle = 33.0 + np.sin(daily_phase - np.pi / 2.0) * 6.5 # 26.5°C to 39.5°C
    
    for i in range(num_samples):
        scenario = scenarios[i]
        
        # Step of day (0 to 287)
        tod = i % 288
        hour = (tod * 5) / 60.0
        
        # Realistic office occupancy pattern
        if 8.5 <= hour <= 18.5:
            if 12.0 <= hour <= 13.5: # lunch
                base_occ = np.random.randint(3, 8)
            else:
                base_occ = np.random.randint(8, 26)
        else:
            base_occ = 0 if np.random.rand() > 0.15 else np.random.randint(1, 3)
            
        occupancy = base_occ
        outdoor_t = outdoor_cycle[i] + np.random.normal(0, 0.4)
        
        # Internal thermal load from people (120W per occupant)
        occupant_heat_kw = (occupancy * 120.0) / 1000.0
        
        base_temp = 22.8 + (occupant_heat_kw * 0.15)
        base_hum = 50.0 + (occupancy * 0.25)
        base_press = 101.3
        base_curr = 4.8 + (occupant_heat_kw * 0.45)
        base_pow = base_curr * 220.0
        
        if scenario == 'normal':
            temp = base_temp + np.random.normal(0, 0.4)
            hum = base_hum + np.random.normal(0, 1.0)
            press = base_press + np.random.normal(0, 0.3)
            curr = base_curr + np.random.normal(0, 0.15)
            pow_val = curr * 220.0 + np.random.normal(0, 12.0)
            is_anom = 0
            
        elif scenario == 'filter_clogging':
            # Airflow restricted: temperature & current rise, pressure drop
            temp = base_temp + np.random.uniform(4.0, 9.0)
            hum = base_hum + np.random.uniform(6.0, 14.0)
            press = base_press - np.random.uniform(1.2, 2.8)
            curr = base_curr + np.random.uniform(1.8, 3.6)
            pow_val = curr * 225.0 + np.random.normal(0, 25.0)
            is_anom = 1
            
        elif scenario == 'compressor_overload':
            # Severe electrical overload: current & power spike dramatically
            temp = base_temp + np.random.uniform(6.5, 12.5)
            hum = base_hum - np.random.uniform(2.0, 8.0)
            press = base_press + np.random.uniform(2.0, 5.0)
            curr = base_curr + np.random.uniform(5.5, 9.8)
            pow_val = curr * 230.0 + np.random.normal(0, 60.0)
            is_anom = 1
            
        elif scenario == 'refrigerant_leakage':
            # Low pressure, poor cooling: pressure drops, temp rises high
            temp = base_temp + np.random.uniform(7.5, 14.5)
            hum = base_hum - np.random.uniform(10.0, 20.0)
            press = base_press - np.random.uniform(16.0, 32.0)
            curr = base_curr + np.random.uniform(0.5, 1.8)
            pow_val = curr * 215.0 + np.random.normal(0, 20.0)
            is_anom = 1
            
        temperatures.append(round(float(temp), 2))
        humidities.append(round(float(hum), 2))
        pressures.append(round(float(press), 2))
        currents.append(round(float(curr), 2))
        powers.append(round(float(pow_val), 2))
        occupancies.append(int(occupancy))
        outdoor_temps.append(round(float(outdoor_t), 1))
        is_anomalies.append(is_anom)
        fault_labels.append(scenario)
        
    os.makedirs('ml/dataset', exist_ok=True)
    csv_path = 'ml/dataset/hvac_telemetry.csv'
    fieldnames = [
        'timestamp', 'temperature', 'humidity', 'pressure', 'current',
        'power', 'occupancy', 'outdoor_temp', 'is_anomaly', 'fault_label'
    ]
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(num_samples):
            writer.writerow({
                'timestamp': timestamps[i].isoformat(),
                'temperature': temperatures[i],
                'humidity': humidities[i],
                'pressure': pressures[i],
                'current': currents[i],
                'power': powers[i],
                'occupancy': occupancies[i],
                'outdoor_temp': outdoor_temps[i],
                'is_anomaly': is_anomalies[i],
                'fault_label': fault_labels[i]
            })

    counts = Counter(fault_labels)
    print(f"[+] Successfully generated {num_samples} multivariate samples saved to '{csv_path}'")
    print(f"Scenario distribution: {dict(counts)}")
    return csv_path

if __name__ == "__main__":
    generate_hvac_dataset()

