/*
 * AI-Based Smart HVAC Monitoring System - ESP32 Firmware
 * Hardware: ESP32 Dev Module, DHT22 Temperature/Humidity Sensor, SCT-013 Current Sensor (Analog input)
 * Protocol: MQTT JSON over Wi-Fi
 * Topic: hvac/sensor/readings
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server = "192.168.1.100"; // Computer IP running backend
const int mqtt_port = 1883;
const char* mqtt_topic = "hvac/sensor/readings";
const char* device_id = "HVAC-001";

// Sensor Pins
#define DHTPIN 4
#define DHTTYPE DHT22
#define CURRENT_SENSOR_PIN 34
#define PRESSURE_SENSOR_PIN 35

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(device_id)) {
      Serial.println("Connected to MQTT Broker!");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  unsigned long now = millis();
  // Publish telemetry every 3 seconds
  if (now - lastMsg > 3000) {
    lastMsg = now;

    // Read DHT22
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor! Using fallback.");
      temperature = 23.5;
      humidity = 51.0;
    }

    // Read Analog Current / Pressure sensor inputs (ADC 0-4095 mapped)
    int raw_current = analogRead(CURRENT_SENSOR_PIN);
    int raw_pressure = analogRead(PRESSURE_SENSOR_PIN);

    float current_amps = (raw_current / 4095.0) * 15.0; // 0-15A range
    float pressure_kpa = 90.0 + (raw_pressure / 4095.0) * 25.0; // 90-115 kPa
    float power_watts = current_amps * 220.0;

    // Build JSON Payload
    String payload = "{";
    payload += "\"device_id\":\"" + String(device_id) + "\",";
    payload += "\"temperature\":" + String(temperature, 2) + ",";
    payload += "\"humidity\":" + String(humidity, 2) + ",";
    payload += "\"pressure\":" + String(pressure_kpa, 2) + ",";
    payload += "\"current\":" + String(current_amps, 2) + ",";
    payload += "\"power\":" + String(power_watts, 2);
    payload += "}";

    Serial.print("Publishing MQTT payload: ");
    Serial.println(payload);

    client.publish(mqtt_topic, payload.c_str());
  }
}
