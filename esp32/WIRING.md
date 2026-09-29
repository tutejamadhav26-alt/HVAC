# ESP32 HVAC Hardware Sensor Wiring Guide

This document details the circuit pinout connections for connecting real sensors to the ESP32 microcontroller board.

## Component List

1. **ESP32 Dev Module** (30-pin or 38-pin version)
2. **DHT22 Temperature & Humidity Sensor** (with 10k pull-up resistor)
3. **SCT-013 Non-Invasive AC Current Sensor** (with burden resistor & voltage divider circuit)
4. **Pressure Sensor Transducer** (0-1.2 MPa analog 0.5V-4.5V output)
5. **Breadboard & Jumper Wires**

---

## Pinout Map

| Sensor | Sensor Pin | ESP32 Pin | Details |
| :--- | :--- | :--- | :--- |
| **DHT22** | VCC | 3.3V / 5V | Power supply |
| **DHT22** | DATA | **GPIO 4** | Digital Data line (10k resistor to 3.3V) |
| **DHT22** | GND | GND | Ground connection |
| **Current Sensor** | OUT | **GPIO 34 (ADC1)** | Analog voltage input for AC current |
| **Current Sensor** | GND | GND | Circuit Ground |
| **Pressure Transducer**| OUT | **GPIO 35 (ADC1)** | Analog pressure voltage output |
| **Pressure Transducer**| VCC | 5V | Sensor power |
| **Pressure Transducer**| GND | GND | Ground |

---

## MQTT Configuration

- **Default Topic**: `hvac/sensor/readings`
- **Port**: `1883`
- Update `ssid`, `password`, and `mqtt_server` in `esp32/hvac_sensor.ino` before flashing using Arduino IDE or PlatformIO.
