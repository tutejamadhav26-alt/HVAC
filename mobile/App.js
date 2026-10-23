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
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';

// Role Definitions for Multiple Access
const ACCESS_ROLES = [
  {
    id: 'admin',
    name: 'Facility Director',
    code: 'ADMIN',
    email: 'admin@airconiq.ai',
    badgeColor: '#10b981',
    description: 'Full administrative access, setpoint overrides & system configurations.',
    permissions: ['READ_ALL', 'WRITE_REMOTE', 'CONFIG_API', 'SIMULATE_FAULTS', 'AUDIT_LOGS']
  },
  {
    id: 'technician',
    name: 'Diagnostic Engineer',
    code: 'TECH',
    email: 'tech@airconiq.ai',
    badgeColor: '#f59e0b',
    description: 'Autonomous diagnostics, IR protocol transmissions, sensor sweeps & alerts.',
    permissions: ['READ_ALL', 'WRITE_REMOTE', 'DISMISS_ALERTS']
  },
  {
    id: 'auditor',
    name: 'ESG Energy Auditor',
    code: 'AUDITOR',
    email: 'auditor@airconiq.ai',
    badgeColor: '#8b5cf6',
    description: 'Energy efficiency auditing, thermal occupancy ROI & carbon analytics.',
    permissions: ['READ_TELEMETRY', 'READ_ENERGY', 'READ_REPORTS']
  },
  {
    id: 'staff',
    name: 'Building Occupant',
    code: 'STAFF',
    email: 'staff@airconiq.ai',
    badgeColor: '#38bdf8',
    description: 'Read-only indoor climate comfort level and zone temperature view.',
    permissions: ['READ_COMFORT']
  }
];

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState('http://192.168.1.100:8000');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, remote, live, predictions, alerts, access, settings
  const [brand, setBrand] = useState('Daikin');
  const [currentRole, setCurrentRole] = useState(ACCESS_ROLES[0]); // default admin
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);

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
    recommended_action: 'System operating normally within optimal parameters.'
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

  const hasPermission = (perm) => currentRole.permissions.includes(perm) || currentRole.permissions.includes('READ_ALL');

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
    if (!currentRole.permissions.includes('WRITE_REMOTE')) {
      setRemoteAppliedMsg(`Access Denied: ${currentRole.name} cannot transmit commands.`);
      setTimeout(() => setRemoteAppliedMsg(null), 3500);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/api/hvac/HVAC-001/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: 'HVAC-001',
          mode: remoteRec.recommended_mode,
          target_temperature: remoteRec.recommended_temperature,
          fan_speed: remoteRec.recommended_fan_speed,
          triggered_by: `mobile_${currentRole.id}`
        })
      });
      if (res.ok) {
        setRemoteAppliedMsg(`✔ Transmitted ${remoteRec.recommended_mode} @ ${remoteRec.recommended_temperature}°C to ${brand}`);
      } else {
        setRemoteAppliedMsg(`Simulated: Transmitted to ${brand}`);
      }
    } catch (err) {
      setRemoteAppliedMsg(`Simulated: Transmitted to ${brand}`);
    }
    setTimeout(() => setRemoteAppliedMsg(null), 3500);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [apiBaseUrl, brand]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1d" />

      {/* Main Header with Logo & Role Quick Switch */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>airconIQ</Text>
              <Text style={styles.headerSubtitle}>COMMERCIAL HVAC PLATFORM</Text>
            </View>
          </View>

          {/* Quick Role Access Pill */}
          <TouchableOpacity
            style={[styles.rolePill, { borderColor: currentRole.badgeColor }]}
            onPress={() => setIsRoleModalVisible(true)}
          >
            <View style={[styles.roleDot, { backgroundColor: currentRole.badgeColor }]} />
            <Text style={[styles.rolePillText, { color: currentRole.badgeColor }]}>
              {currentRole.code}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Multi-Access Status Bar */}
        <View style={styles.accessBar}>
          <Text style={styles.accessLabel}>
            Access Profile: <Text style={{ color: '#f8fafc', fontWeight: 'bold' }}>{currentRole.name}</Text>
          </Text>
          <TouchableOpacity onPress={() => setIsRoleModalVisible(true)}>
            <Text style={styles.switchLink}>Switch Role ▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* Health Score Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>HVAC Health Score</Text>
                <View style={[styles.badgeSmall, { backgroundColor: '#10b98120', borderColor: '#10b98140' }]}>
                  <Text style={{ color: '#10b981', fontSize: 10, fontWeight: 'bold' }}>REAL-TIME</Text>
                </View>
              </View>
              <Text style={[
                styles.healthScore,
                predictionData.health_score < 60 ? styles.textRed :
                predictionData.health_score < 85 ? styles.textAmber : styles.textEmerald
              ]}>
                {predictionData.health_score} / 100
              </Text>
              <Text style={styles.healthStatus}>
                SYSTEM STATE: {predictionData.severity.toUpperCase()} ({predictionData.predicted_fault.replace('_', ' ').toUpperCase()})
              </Text>
            </View>

            {/* AI Universal Remote Recommendation Card */}
            <View style={[styles.card, styles.remoteCard]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardLabel}>Autonomous Remote Optimizer</Text>
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
                ⚡ Save ~{remoteRec.energy_saving_potential_pct}% Power Consumption
              </Text>
              <Text style={styles.recReason}>{remoteRec.reason}</Text>

              {remoteAppliedMsg && (
                <Text style={[styles.appliedMsgText, remoteAppliedMsg.includes('Denied') && { color: '#ef4444' }]}>
                  {remoteAppliedMsg}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.applyBtn, !currentRole.permissions.includes('WRITE_REMOTE') && styles.disabledBtn]}
                onPress={handleApplyRemote}
              >
                <Text style={styles.applyBtnText}>
                  {currentRole.permissions.includes('WRITE_REMOTE')
                    ? `DISPATCH TO ${brand.toUpperCase()}`
                    : `LOCKED: ${currentRole.code} READ ONLY`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Occupancy & Climate Quick Grid */}
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Occupancy</Text>
                <Text style={styles.gridValHighlight}>{sensorData.occupancy} People</Text>
                <Text style={styles.gridSub}>+{sensorData.occupancy * 120}W Heat Load</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Outdoor Temp</Text>
                <Text style={styles.gridVal}>{sensorData.outdoor_temp}°C</Text>
                <Text style={styles.gridSub}>Solar Ambient</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Return Air</Text>
                <Text style={styles.gridVal}>{sensorData.temperature}°C</Text>
                <Text style={styles.gridSub}>Humidity: {sensorData.humidity}%</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Power Draw</Text>
                <Text style={styles.gridVal}>{sensorData.power} W</Text>
                <Text style={styles.gridSub}>{sensorData.current} A RMS</Text>
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
              <Text style={styles.cardLabel}>Thermodynamic Setpoint Target</Text>
              <View style={styles.remoteControlRow}>
                <TouchableOpacity
                  style={[styles.circleBtn, !currentRole.permissions.includes('WRITE_REMOTE') && styles.disabledBtn]}
                  onPress={() => {
                    if (currentRole.permissions.includes('WRITE_REMOTE')) {
                      setRemoteRec(p => ({ ...p, recommended_temperature: +(p.recommended_temperature - 0.5).toFixed(1) }));
                    }
                  }}
                >
                  <Text style={styles.circleBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.tempHuge}>{remoteRec.recommended_temperature}°C</Text>
                <TouchableOpacity
                  style={[styles.circleBtn, !currentRole.permissions.includes('WRITE_REMOTE') && styles.disabledBtn]}
                  onPress={() => {
                    if (currentRole.permissions.includes('WRITE_REMOTE')) {
                      setRemoteRec(p => ({ ...p, recommended_temperature: +(p.recommended_temperature + 0.5).toFixed(1) }));
                    }
                  }}
                >
                  <Text style={styles.circleBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.applyBtn, !currentRole.permissions.includes('WRITE_REMOTE') && styles.disabledBtn]}
                onPress={handleApplyRemote}
              >
                <Text style={styles.applyBtnText}>
                  {currentRole.permissions.includes('WRITE_REMOTE')
                    ? `TRANSMIT TO ${brand.toUpperCase()} UNIT`
                    : `PERMISSION REQUIRED (${currentRole.name})`}
                </Text>
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
              <Text style={styles.cardLabel}>Refrigerant Pressure</Text>
              <Text style={styles.metricVal}>{sensorData.pressure} kPa</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current & Electrical Power</Text>
              <Text style={styles.metricVal}>{sensorData.current} A ({sensorData.power} W)</Text>
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
              <View key={a.id || Math.random().toString()} style={styles.card}>
                <Text style={styles.alertTitle}>{a.title || 'Telemetry Anomaly'}</Text>
                <Text style={styles.alertMsg}>{a.message || 'Elevated power draw detected.'}</Text>
              </View>
            ))}
            {alerts.length === 0 && (
              <Text style={styles.noAlerts}>No active alerts. All systems healthy.</Text>
            )}
          </View>
        )}

        {/* MULTIPLE ACCESS TAB */}
        {activeTab === 'access' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Multiple Access Profiles</Text>
            <Text style={styles.sectionSub}>Switch roles to preview permissions & multi-user access</Text>

            {ACCESS_ROLES.map((r) => {
              const isSelected = currentRole.id === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, isSelected && { borderColor: r.badgeColor, backgroundColor: '#1e293b' }]}
                  onPress={() => setCurrentRole(r)}
                >
                  <View style={styles.roleCardHeader}>
                    <View style={styles.roleIconBadge}>
                      <View style={[styles.roleDotLarge, { backgroundColor: r.badgeColor }]} />
                      <View>
                        <Text style={styles.roleCardName}>{r.name}</Text>
                        <Text style={styles.roleCardEmail}>{r.email}</Text>
                      </View>
                    </View>
                    <View style={[styles.roleTag, { borderColor: r.badgeColor, backgroundColor: r.badgeColor + '20' }]}>
                      <Text style={[styles.roleTagText, { color: r.badgeColor }]}>{r.code}</Text>
                    </View>
                  </View>

                  <Text style={styles.roleDesc}>{r.description}</Text>

                  <View style={styles.permList}>
                    {r.permissions.map((p) => (
                      <View key={p} style={styles.permChip}>
                        <Text style={styles.permChipText}>✓ {p}</Text>
                      </View>
                    ))}
                  </View>

                  {isSelected && (
                    <View style={[styles.activeRoleBanner, { backgroundColor: r.badgeColor + '25' }]}>
                      <Text style={[styles.activeRoleBannerText, { color: r.badgeColor }]}>
                        ACTIVE PROFILE IN USE
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
                editable={hasPermission('CONFIG_API')}
              />
              <Text style={styles.hint}>
                {hasPermission('CONFIG_API')
                  ? "Enter your computer's local IP address or deployment domain."
                  : "Editing restricted: Only Facility Director (Admin) can configure API host."}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Current App Signature</Text>
              <Text style={styles.textValueBold}>com.smarthvac.ai (Release Build v1.0.0)</Text>
              <Text style={styles.recText}>Architecture: Android Native APK & Hybrid Engine</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Role Switcher Modal */}
      <Modal
        visible={isRoleModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Access Profile</Text>
              <TouchableOpacity onPress={() => setIsRoleModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Test role permissions in real-time</Text>

            {ACCESS_ROLES.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.modalRoleItem,
                  currentRole.id === r.id && { borderColor: r.badgeColor, backgroundColor: '#0f172a' }
                ]}
                onPress={() => {
                  setCurrentRole(r);
                  setIsRoleModalVisible(false);
                }}
              >
                <View style={[styles.roleDot, { backgroundColor: r.badgeColor }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.modalRoleName}>{r.name}</Text>
                  <Text style={styles.modalRoleEmail}>{r.email}</Text>
                </View>
                <View style={[styles.roleTag, { borderColor: r.badgeColor, backgroundColor: r.badgeColor + '20' }]}>
                  <Text style={[styles.roleTagText, { color: r.badgeColor }]}>{r.code}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        {[
          { id: 'dashboard', label: 'DASHBOARD' },
          { id: 'remote', label: 'DEVICES' },
          { id: 'predictions', label: 'AI ADVISOR' },
          { id: 'settings', label: 'SETTINGS' }
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setActiveTab(t.id)}
            style={[styles.navBtn, activeTab === t.id && styles.navBtnActive]}
          >
            <Text style={[styles.navText, activeTab === t.id && styles.navTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1d' },
  header: { padding: 14, backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImage: { width: 38, height: 38 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 9, color: '#f59e0b', fontWeight: 'bold', letterSpacing: 1.2, marginTop: 1 },
  rolePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, backgroundColor: '#1e293b' },
  roleDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  roleDotLarge: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  rolePillText: { fontSize: 11, fontWeight: 'bold' },
  accessBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1e293b80' },
  accessLabel: { fontSize: 11, color: '#94a3b8' },
  switchLink: { fontSize: 11, color: '#38bdf8', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  tabContent: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc' },
  sectionSub: { fontSize: 12, color: '#94a3b8', marginBottom: 6 },
  card: { backgroundColor: '#131e33', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#1e293b' },
  cardLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  brandTag: { backgroundColor: '#1e293b', color: '#38bdf8', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  remoteCard: { borderColor: '#0284c780', backgroundColor: '#071d33' },
  modeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  modeBadge: { backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  modeBadgeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  tempLarge: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc' },
  fanText: { fontSize: 12, color: '#94a3b8', fontWeight: 'bold' },
  savingsTag: { fontSize: 12, color: '#34d399', fontWeight: 'bold', marginTop: 8 },
  recReason: { fontSize: 11, color: '#cbd5e1', marginTop: 4, lineHeight: 16 },
  appliedMsgText: { color: '#34d399', fontSize: 12, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  applyBtn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  disabledBtn: { backgroundColor: '#334155', opacity: 0.6 },
  applyBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 },
  healthScore: { fontSize: 36, fontWeight: 'bold', marginTop: 8 },
  healthStatus: { fontSize: 12, color: '#cbd5e1', marginTop: 4, fontWeight: 'bold' },
  textRed: { color: '#ef4444' },
  textAmber: { color: '#f59e0b' },
  textEmerald: { color: '#10b981' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  gridItem: { flex: 1, minWidth: '45%', backgroundColor: '#131e33', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b' },
  gridLabel: { fontSize: 11, color: '#94a3b8' },
  gridVal: { fontSize: 16, fontWeight: 'bold', color: '#f8fafc', marginTop: 2 },
  gridValHighlight: { fontSize: 16, fontWeight: 'bold', color: '#38bdf8', marginTop: 2 },
  gridSub: { fontSize: 10, color: '#64748b', marginTop: 2 },
  brandSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  brandBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#0a0f1d', borderWidth: 1, borderColor: '#1e293b' },
  brandBtnActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  brandBtnText: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold' },
  brandBtnTextActive: { color: '#ffffff' },
  remoteControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 16 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  circleBtnText: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  tempHuge: { fontSize: 44, fontWeight: 'bold', color: '#ffffff' },
  metricVal: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8', marginTop: 4 },
  recText: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, marginTop: 4 },
  textValueBold: { color: '#f8fafc', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#ef4444' },
  alertMsg: { fontSize: 12, color: '#cbd5e1', marginTop: 4 },
  noAlerts: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  input: { backgroundColor: '#0a0f1d', color: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#1e293b', fontFamily: 'monospace' },
  hint: { fontSize: 11, color: '#64748b', marginTop: 6 },
  roleCard: { backgroundColor: '#131e33', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 },
  roleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roleIconBadge: { flexDirection: 'row', alignItems: 'center' },
  roleCardName: { fontSize: 15, fontWeight: 'bold', color: '#f8fafc' },
  roleCardEmail: { fontSize: 11, color: '#64748b', marginTop: 1 },
  roleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  roleTagText: { fontSize: 10, fontWeight: 'bold' },
  roleDesc: { fontSize: 12, color: '#94a3b8', marginVertical: 10, lineHeight: 18 },
  permList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  permChip: { backgroundColor: '#0a0f1d', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#1e293b' },
  permChipText: { fontSize: 10, color: '#cbd5e1' },
  activeRoleBanner: { marginTop: 12, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  activeRoleBannerText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#131e33', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc' },
  modalCloseText: { fontSize: 18, color: '#94a3b8', padding: 4 },
  modalSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2, marginBottom: 16 },
  modalRoleItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, backgroundColor: '#0a0f1d', marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  modalRoleName: { fontSize: 14, fontWeight: 'bold', color: '#f8fafc' },
  modalRoleEmail: { fontSize: 11, color: '#64748b', marginTop: 1 },
  navBar: { flexDirection: 'row', backgroundColor: '#0f172a', borderTopWidth: 1, borderTopColor: '#1e293b', paddingVertical: 8 },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navBtnActive: { borderBottomWidth: 2, borderBottomColor: '#38bdf8' },
  navText: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  navTextActive: { color: '#38bdf8' }
});
