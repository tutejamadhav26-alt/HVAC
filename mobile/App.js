import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://192.168.1.100:8000');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, live, predictions, alerts, settings
  const [loading, setLoading] = useState(false);

  const [sensorData, setSensorData] = useState({
    temperature: 23.0,
    humidity: 50.0,
    pressure: 101.3,
    current: 4.8,
    power: 1050.0
  });

  const [predictionData, setPredictionData] = useState({
    anomaly_score: 0.05,
    predicted_fault: 'normal',
    confidence: 98.5,
    severity: 'Low',
    health_score: 95.0,
    recommended_action: 'System operating normally.'
  });

  const [alerts, setAlerts] = useState([]);

  // Fetch telemetry from backend
  const fetchData = async () => {
    try {
      const sRes = await fetch(`${apiBaseUrl}/api/sensors/latest`);
      if (sRes.ok) {
        const sJson = await sRes.json();
        setSensorData(sJson);
      }

      const pRes = await fetch(`${apiBaseUrl}/api/predictions/latest`);
      if (pRes.ok) {
        const pJson = await pRes.json();
        setPredictionData(pJson);
      }

      const aRes = await fetch(`${apiBaseUrl}/api/alerts`);
      if (aRes.ok) {
        const aJson = await aRes.json();
        setAlerts(aJson);
      }
    } catch (e) {
      // Ignore network errors in preview mode
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart HVAC AI</Text>
        <Text style={styles.headerSubtitle}>Mobile Diagnostics</Text>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* Health Score Card */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>HVAC Health Score</Text>
              <Text style={[
                styles.healthScore,
                predictionData.health_score < 60 ? styles.textRed :
                predictionData.health_score < 85 ? styles.textAmber : styles.textEmerald
              ]}>
                {predictionData.health_score} / 100
              </Text>
              <Text style={styles.healthStatus}>
                Status: {predictionData.severity.toUpperCase()}
              </Text>
            </View>

            {/* AI Diagnosis Summary */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>AI Diagnostics</Text>
              <View style={styles.row}>
                <Text style={styles.textSub}>Predicted Fault:</Text>
                <Text style={styles.textValueBold}>{predictionData.predicted_fault.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.textSub}>Confidence:</Text>
                <Text style={styles.textValue}>{predictionData.confidence}%</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.textSub}>Anomaly Score:</Text>
                <Text style={styles.textValue}>{predictionData.anomaly_score}</Text>
              </View>
            </View>

            {/* Key Telemetry Quick Grid */}
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel font-bold}>Temp</Text>
                <Text style={styles.gridVal}>{sensorData.temperature}°C</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel font-bold}>Humidity</Text>
                <Text style={styles.gridVal}>{sensorData.humidity}%</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel font-bold}>Pressure</Text>
                <Text style={styles.gridVal}>{sensorData.pressure} kPa</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel font-bold}>Current</Text>
                <Text style={styles.gridVal}>{sensorData.current} A</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'live' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Live Sensor Metrics</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Temperature</Text>
              <Text style={styles.metricVal}>{sensorData.temperature} °C</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Humidity</Text>
              <Text style={styles.metricVal}>{sensorData.humidity} %</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Suction Pressure</Text>
              <Text style={styles.metricVal}>{sensorData.pressure} kPa</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Compressor Current</Text>
              <Text style={styles.metricVal}>{sensorData.current} A</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Power Consumption</Text>
              <Text style={styles.metricVal}>{sensorData.power} W</Text>
            </View>
          </View>
        )}

        {activeTab === 'predictions' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>AI Fault Predictions</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Prescriptive Recommendation</Text>
              <Text style={styles.recText}>{predictionData.recommended_action}</Text>
            </View>
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Active Alerts ({alerts.length})</Text>
            {alerts.map((a) => (
              <View key={a.id} style={styles.card}>
                <Text style={styles.alertTitle}>{a.title}</Text>
                <Text style={styles.alertMsg}>{a.message}</Text>
              </View>
            ))}
            {alerts.length === 0 && (
              <Text style={styles.noAlerts}>No active alerts.</Text>
            )}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>API Settings</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Backend Base URL</Text>
              <TextInput
                style={styles.input}
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                placeholder="http://192.168.1.100:8000"
                placeholderTextColor="#64748b"
              />
              <Text style={styles.hint}>Enter your computer's IP address on local Wi-Fi.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        {['dashboard', 'live', 'predictions', 'alerts', 'settings'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.navBtn, activeTab === t && styles.navBtnActive]}
          >
            <Text style={[styles.navText, activeTab === t && styles.navTextActive]}>
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
  headerSubtitle: { fontSize: 12, color: '#94a3b8' },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  cardLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' },
  healthScore: { fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  healthStatus: { fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 'bold' },
  textRed: { color: '#ef4444' },
  textAmber: { color: '#f59e0b' },
  textEmerald: { color: '#10b981' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  textSub: { color: '#94a3b8', fontSize: 13 },
  textValue: { color: '#3b82f6', fontSize: 13, fontWeight: 'bold' },
  textValueBold: { color: '#f8fafc', fontSize: 13, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  gridItem: { flex: 1, minWidth: '45%', backgroundColor: '#1e293b', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  gridLabel: { fontSize: 11, color: '#94a3b8' },
  gridVal: { fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  metricVal: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6', marginTop: 4 },
  recText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, marginTop: 8 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
  alertMsg: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  noAlerts: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#334155', fontFamily: 'monospace' },
  hint: { fontSize: 11, color: '#64748b', marginTop: 6 },
  navBar: { flexDirection: 'row', backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155', paddingVertical: 8 },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navBtnActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  navText: { fontSize: 10, color: '#64748b', fontWeight: 'bold' },
  navTextActive: { color: '#3b82f6' }
});
