const API_BASE_URL = window.location.origin.includes('3000') 
  ? 'http://localhost:8000' 
  : window.location.origin;

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return res.json();
}

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE_URL}/api/system/status`);
  return res.json();
}

export async function fetchLatestSensor(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/sensors/latest?unit_id=${unitId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSensorHistory(unitId = 'HVAC-001', timeframe = '1h') {
  const res = await fetch(`${API_BASE_URL}/api/sensors/history?unit_id=${unitId}&timeframe=${timeframe}`);
  return res.json();
}

export async function fetchLatestPrediction(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/predictions/latest?unit_id=${unitId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchPredictionsHistory(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/predictions/history?unit_id=${unitId}`);
  return res.json();
}

export async function fetchAlerts(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/alerts?unit_id=${unitId}`);
  return res.json();
}

export async function resolveAlert(alertId, resolvedBy = 'Staff') {
  const res = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resolved_by: resolvedBy })
  });
  return res.json();
}

export async function fetchEnergySummary(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/energy?unit_id=${unitId}`);
  return res.json();
}

export async function fetchSimulationStatus() {
  const res = await fetch(`${API_BASE_URL}/api/simulation/status`);
  return res.json();
}

export async function setSimulationScenario(scenario, speedMultiplier = 1.0) {
  const res = await fetch(`${API_BASE_URL}/api/simulation/scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, speed_multiplier: speedMultiplier })
  });
  return res.json();
}

export function createWebSocketConnection(onMessageCallback) {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsHost = window.location.origin.includes('3000') ? 'localhost:8000' : window.location.host;
  const wsUrl = `${wsProtocol}//${wsHost}/api/ws`;

  let ws = null;
  let retryTimeout = null;

  function connect() {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[+] WebSocket connected to', wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageCallback(data);
      } catch (e) {
        console.error('[-] Error parsing WS message', e);
      }
    };

    ws.onclose = () => {
      console.log('[-] WebSocket closed. Retrying in 3s...');
      retryTimeout = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[-] WebSocket error:', err);
      ws.close();
    };
  }

  connect();

  return () => {
    if (retryTimeout) clearTimeout(retryTimeout);
    if (ws) ws.close();
  };
}

export async function fetchRemoteRecommendation(unitId = 'HVAC-001', brand = null) {
  const url = brand 
    ? `${API_BASE_URL}/api/commercial/remote-recommendation?unit_id=${unitId}&brand=${encodeURIComponent(brand)}`
    : `${API_BASE_URL}/api/commercial/remote-recommendation?unit_id=${unitId}`;
  const res = await fetch(url);
  return res.json();
}

export async function applyRemoteCommand(commandData) {
  const res = await fetch(`${API_BASE_URL}/api/commercial/apply-remote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commandData)
  });
  return res.json();
}

export async function fetchTechnicianDiagnostics(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/commercial/technician-diagnostics?unit_id=${unitId}`);
  return res.json();
}

export async function fetchROIAnalytics(unitId = 'HVAC-001', currency = 'INR') {
  const res = await fetch(`${API_BASE_URL}/api/commercial/roi?unit_id=${unitId}&currency=${currency}`);
  return res.json();
}

export async function fetchBuildingZones() {
  const res = await fetch(`${API_BASE_URL}/api/commercial/zones`);
  return res.json();
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Authentication failed. Please verify credentials.');
  }

  return res.json();
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchLatestAudit(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/audit/latest?unit_id=${unitId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createAudit(auditData) {
  const res = await fetch(`${API_BASE_URL}/api/audit/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(auditData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Audit generation failed.');
  }
  return res.json();
}

export async function fetchAuditList(limit = 20) {
  const res = await fetch(`${API_BASE_URL}/api/audit/list?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAuditById(auditId) {
  const res = await fetch(`${API_BASE_URL}/api/audit/${auditId}`);
  if (!res.ok) return null;
  return res.json();
}

// -------------------------------------------------------------
// SIMPLIFIED HVAC DEVICE MANAGEMENT & REMOTE CONTROL API CALLS
// -------------------------------------------------------------

export async function fetchHVACUnits() {
  const res = await fetch(`${API_BASE_URL}/api/hvac`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchHVACUnitById(unitId) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createHVACUnit(unitData) {
  const res = await fetch(`${API_BASE_URL}/api/hvac`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create HVAC unit');
  }
  return res.json();
}

export async function updateHVACUnit(unitId, unitData) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unitData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update HVAC unit');
  }
  return res.json();
}

export async function deleteHVACUnit(unitId) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchDeviceCapabilities(unitId) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}/capabilities`);
  if (!res.ok) return null;
  return res.json();
}

export async function testControllerConnection(unitId) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}/test-connection`, {
    method: 'POST'
  });
  return res.json();
}

export async function sendHVACCommand(unitId, commandData) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unit_id: unitId, ...commandData })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to transmit command');
  }
  return res.json();
}

export async function fetchCommandLogs(unitId, limit = 20) {
  const res = await fetch(`${API_BASE_URL}/api/hvac/${unitId}/command-logs?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUnifiedRecommendation(unitId = 'HVAC-001') {
  const res = await fetch(`${API_BASE_URL}/api/predictions/unified-recommendation?unit_id=${unitId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function applyUnifiedRecommendation(unitId, recData = {}) {
  const params = new URLSearchParams({ unit_id: unitId });
  if (recData.target_temperature) params.append('target_temperature', recData.target_temperature);
  if (recData.mode) params.append('mode', recData.mode);
  if (recData.fan_speed) params.append('fan_speed', recData.fan_speed);
  if (recData.triggered_by) params.append('triggered_by', recData.triggered_by);

  const res = await fetch(`${API_BASE_URL}/api/predictions/apply-recommendation?${params.toString()}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to apply recommendation');
  }
  return res.json();
}

export async function fetchControlSettings() {
  const res = await fetch(`${API_BASE_URL}/api/system/settings`);
  if (!res.ok) return null;
  return res.json();
}

export async function updateControlSettings(settingsData) {
  const res = await fetch(`${API_BASE_URL}/api/system/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  return res.json();
}

export async function fetchSystemAuditLogs(limit = 50) {
  const res = await fetch(`${API_BASE_URL}/api/system/audit-logs?limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}

export async function evaluateAutoMode() {
  const res = await fetch(`${API_BASE_URL}/api/system/evaluate-auto-mode`, {
    method: 'POST'
  });
  return res.json();
}


