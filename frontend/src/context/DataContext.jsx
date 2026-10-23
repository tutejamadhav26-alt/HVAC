import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchLatestSensor, 
  fetchLatestPrediction, 
  fetchAlerts, 
  fetchSimulationStatus,
  setSimulationScenario as setScenarioApi,
  resolveAlert as resolveAlertApi,
  createWebSocketConnection
} from '../services/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [latestReading, setLatestReading] = useState({
    temperature: 23.0,
    humidity: 50.0,
    pressure: 101.3,
    current: 4.8,
    power: 1050.0,
    timestamp: new Date().toISOString()
  });

  const [latestPrediction, setLatestPrediction] = useState({
    anomaly_score: 0.05,
    is_anomaly: false,
    predicted_fault: 'normal',
    confidence: 98.5,
    severity: 'Low',
    health_score: 95.0,
    recommended_action: 'System operating normally. Perform standard routine inspection.'
  });

  const [alerts, setAlerts] = useState([]);
  const [simulation, setSimulation] = useState({
    is_running: true,
    scenario: 'NORMAL',
    speed_multiplier: 1.0
  });

  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // Initial Data Load & WebSocket setup
  useEffect(() => {
    async function loadInitial() {
      try {
        const sensor = await fetchLatestSensor();
        if (sensor) setLatestReading(sensor);

        const pred = await fetchLatestPrediction();
        if (pred) setLatestPrediction(pred);

        const alertList = await fetchAlerts();
        if (alertList) setAlerts(alertList);

        const sim = await fetchSimulationStatus();
        if (sim) setSimulation(sim);
      } catch (e) {
        console.error('[-] Error fetching initial data:', e);
      }
    }

    loadInitial();

    // Attach WebSocket listener with standalone fallback pulse
    let wsReceived = false;
    let fallbackPulse = null;

    const cleanupWs = createWebSocketConnection((data) => {
      wsReceived = true;
      if (fallbackPulse) {
        clearInterval(fallbackPulse);
        fallbackPulse = null;
      }
      if (data.reading) {
        setLatestReading(data.reading);
        setTelemetryHistory((prev) => [...prev.slice(-49), data.reading]);
      }
      if (data.prediction) {
        setLatestPrediction(data.prediction);
      }
      if (data.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
      }
      if (data.scenario) {
        setSimulation((prev) => ({
          ...prev,
          scenario: data.scenario,
          speed_multiplier: data.speed_multiplier
        }));
      }
    });

    // If WebSocket is not connected (e.g. static host on Vercel), simulate live telemetry ticks
    const pulseTimer = setTimeout(() => {
      if (!wsReceived) {
        fallbackPulse = setInterval(() => {
          setLatestReading((prev) => {
            const tempDelta = (Math.random() - 0.5) * 0.2;
            const powerDelta = (Math.random() - 0.5) * 25;
            const updated = {
              ...prev,
              temperature: +(prev.temperature + tempDelta).toFixed(1),
              power: Math.round(Math.max(1200, Math.min(2200, (prev.power || 1715) + powerDelta))),
              current: +(((prev.power || 1715) + powerDelta) / 220).toFixed(1),
              timestamp: new Date().toISOString()
            };
            setTelemetryHistory((history) => [...history.slice(-49), updated]);
            return updated;
          });
        }, 3000);
      }
    }, 3500);

    return () => {
      clearTimeout(pulseTimer);
      if (fallbackPulse) clearInterval(fallbackPulse);
      cleanupWs();
    };
  }, []);

  const triggerScenario = async (scenarioName, speed = 1.0) => {
    try {
      const res = await setScenarioApi(scenarioName, speed);
      setSimulation(res);
    } catch (e) {
      console.error('[-] Error changing scenario:', e);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await resolveAlertApi(alertId);
      setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, is_resolved: true } : a));
    } catch (e) {
      console.error('[-] Error resolving alert:', e);
    }
  };

  return (
    <DataContext.Provider value={{
      latestReading,
      latestPrediction,
      alerts,
      simulation,
      telemetryHistory,
      triggerScenario,
      handleResolveAlert
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
