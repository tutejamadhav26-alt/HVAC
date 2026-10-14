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
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, remote, live, predictions, alerts, settings
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState('Daikin');

  const [sensorData, setSensorData] = useState({
    temperature: 24.0,
    humidity: 50.0,
    pressure: 101.3,
    current: 4.8,
    power: 1050.0,
    occupancy: 6,
    outdoor_temp: 33.5
  });

  const [predictionData, setPredictionData] = useState({
    anomaly_score: 0.05,
    predicted_fault: 'normal',
    confidence: 98.5,
    severity: 'Low',
    health_score: 95.0,
    recommended_action: 'System operating normally.'
  });

  const [remoteRec, setRemoteRec] = useState({
    recommended_mode: 'AUTO',
    recommended_temperature: 24.0,
    recommended_fan_speed: 'AUTO',
    energy_saving_potential_pct: 18.5,
    reason: 'Dynamic occupancy load compensation.'
  });

  const [alerts, setAlerts] = useState([]);
  const [remoteAppliedMsg, setRemoteAppliedMsg] = useState(null);

  // Fetch telemetry from backend
  const fetchData = async () => {
    try {
      const sRes = await fetch(`${apiBaseUrl}/api/sensors/latest`);
      if (sRes.ok) {
        const sJson = await sRes.json();
        setSensorData(prev => ({ ...prev, ...sJson }));
      }

      const pRes = await fetch(`${apiBaseUrl}/api/predictions/latest`);
      if (pRes.ok) {
        const pJson = await pRes.json();
        setPredictionData(pJson);
      }

      const rRes = await fetch(`${apiBaseUrl}/api/commercial/remote-recommendation?brand=${brand}`);
      if (rRes.ok) {
        const rJson = await rRes.json();
        setRemoteRec(rJson);
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

  const handleApplyRemote = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/commercial/apply-remote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: 'HVAC-001',
          brand: brand,
          mode: remoteRec.recommended_mode,
          temperature: remoteRec.recommended_temperature,
          fan_speed: remoteRec.recommended_fan_speed
        })
      });
      if (res.ok) {
        setRemoteAppliedMsg(`Applied ${remoteRec.recommended_mode} @ ${remoteRec.recommended_temperature}°C to ${brand}`);
        setTimeout(() => setRemoteAppliedMsg(null), 3500);
      }
    } catch (err) {
      setRemoteAppliedMsg('Failed to apply command');
      setTimeout(() => setRemoteAppliedMsg(null), 3500);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [apiBaseUrl, brand]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Smart HVAC AI</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>BEMS v2.4</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Universal Remote & Commercial Analytics</Text>
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
                STATUS: {predictionData.severity.toUpperCase()}
              </Text>
            </View>

            {/* AI Universal Remote Recommendation Card */}
            <View style={[styles.card, styles.remoteCard]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>AI Universal Remote Optimizer</Text>
                <Text style={styles.brandTag}>{brand}</Text>
              </View>
              <View style={styles.modeRow}>
                <View style={styles.modeBadge}>
                  <Text style={styles.modeBadgeText}>{remoteRec.recommended_mode}</Text>
                </View>
                <Text style={styles.tempLarge}>{remoteRec.recommended_temperature}°C</Text>
                <Text style={styles.fanText}>Fan: {remoteRec.recommended_fan_speed}</Text>
              </View>
              <Text style={styles.savingsTag}>
                ⚡ Save ~{remoteRec.energy_saving_potential_pct}% Power
              </Text>
              <Text style={styles.recReason}>{remoteRec.reason}</Text>

              {remoteAppliedMsg && (
                <Text style={styles.appliedMsgText}>✔ {remoteAppliedMsg}</Text>
              )}

              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyRemote}>
                <Text style={styles.applyBtnText}>APPLY RECOMMENDED MODE</Text>
              </TouchableOpacity>
            </View>

            {/* Occupancy & Climate Quick Grid */}
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Occupancy</Text>
                <Text style={styles.gridValHighlight}>{sensorData.occupancy} People</Text>
                <Text style={styles.gridSub}>+{sensorData.occupancy * 120}W Heat</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Outdoor Temp</Text>
                <Text style={styles.gridVal}>{sensorData.outdoor_temp}°C</Text>
                <Text style={styles.gridSub}>Ambient Solar</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Indoor Temp</Text>
                <Text style={styles.gridVal}>{sensorData.temperature}°C</Text>
                <Text style={styles.gridSub}>Return Air</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Power Draw</Text>
                <Text style={styles.gridVal}>{sensorData.power} W</Text>
                <Text style={styles.gridSub}>{sensorData.current} A</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'remote' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Universal Remote Control</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Select Brand Protocol</Text>
              <View style={styles.brandSelectorRow}>
                {['Daikin', 'Carrier', 'Panasonic', 'Toshiba', 'Voltas', 'LG'].map(b => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBrand(b)}
                    style={[styles.brandBtn, brand === b && styles.brandBtnActive]}
                  >
                    <Text style={[styles.brandBtnText, brand === b && styles.brandBtnTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Thermodynamic Setpoint</Text>
              <View style={styles.remoteControlRow}>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setRemoteRec(p => ({ ...p, recommended_temperature: p.recommended_temperature - 0.5 }))}
                >
                  <Text style={styles.circleBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.tempHuge}>{remoteRec.recommended_temperature}°C</Text>
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setRemoteRec(p => ({ ...p, recommended_temperature: p.recommended_temperature + 0.5 }))}
                >
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyRemote}>
                <Text style={styles.applyBtnText}>TRANSMIT TO {brand.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'live' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Live Sensor Metrics</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Indoor Temperature</Text>
              <Text style={styles.metricVal}>{sensorData.temperature} °C</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Relative Humidity</Text>
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
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Room Occupants</Text>
              <Text style={styles.metricVal}>{sensorData.occupancy} People</Text>
            </View>
          </View>
        )}

        {activeTab === 'predictions' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>AI Fault Predictions</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Classified Fault State</Text>
              <Text style={styles.textValueBold}>{predictionData.predicted_fault.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.recText}>Confidence: {predictionData.confidence}%</Text>
              <Text style={styles.recText}>Anomaly Index: {predictionData.anomaly_score}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Prescriptive Directive</Text>
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
              <Text style={styles.noAlerts}>No active alerts. System healthy.</Text>
            )}
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>System Settings</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Backend API Endpoint</Text>
              <TextInput
                style={styles.input}
                value={apiBaseUrl}
                onChangeText={setApiBaseUrl}
                placeholder="http://192.168.1.100:8000"
                placeholderTextColor="#64748b"
              />
              <Text style={styles.hint}>Enter your computer's IP address on local network.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        {['dashboard', 'remote', 'live', 'predictions', 'alerts', 'settings'].map((t) => (
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#f8fafc' },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  liveBadge: { backgroundColor: '#0284c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  liveBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  cardLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandTag: { backgroundColor: '#334155', color: '#38bdf8', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  remoteCard: { borderColor: '#0284c7', backgroundColor: '#0c4a6e20' },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  modeBadge: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  modeBadgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  tempLarge: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  fanText: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  savingsTag: { fontSize: 12, color: '#34d399', fontWeight: 'bold', marginTop: 8 },
  recReason: { fontSize: 11, color: '#cbd5e1', marginTop: 4, lineHeight: 16 },
  appliedMsgText: { color: '#34d399', fontSize: 12, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  applyBtn: { backgroundColor: '#0284c7', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  applyBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 },
  healthScore: { fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  healthStatus: { fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 'bold' },
  textRed: { color: '#ef4444' },
  textAmber: { color: '#f59e0b' },
  textEmerald: { color: '#10b981' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  gridItem: { flex: 1, minWidth: '45%', backgroundColor: '#1e293b', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  gridLabel: { fontSize: 11, color: '#94a3b8' },
  gridVal: { fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginTop: 2 },
  gridValHighlight: { fontSize: 16, fontWeight: 'bold', color: '#38bdf8', marginTop: 2 },
  gridSub: { fontSize: 10, color: '#64748b', marginTop: 2 },
  brandSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  brandBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  brandBtnActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  brandBtnText: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  brandBtnTextActive: { color: '#ffffff' },
  remoteControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 16 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  circleBtnText: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  tempHuge: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  metricVal: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8', marginTop: 4 },
  recText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, marginTop: 4 },
  textValueBold: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
  alertMsg: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  noAlerts: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  input: { backgroundColor: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#334155', fontFamily: 'monospace' },
  hint: { fontSize: 11, color: '#64748b', marginTop: 6 },
  navBar: { flexDirection: 'row', backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155', paddingVertical: 8 },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navBtnActive: { borderBottomWidth: 2, borderBottomColor: '#38bdf8' },
  navText: { fontSize: 9, color: '#64748b', fontWeight: 'bold' },
  navTextActive: { color: '#38bdf8' }
});
