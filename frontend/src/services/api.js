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

