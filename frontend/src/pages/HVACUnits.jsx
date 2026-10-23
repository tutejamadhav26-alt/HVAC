import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, MapPin, Plus, RefreshCw, Power, CheckCircle2, AlertCircle, 
  Sliders, ShieldCheck, Wrench, Trash2, Edit3, Network, Terminal,
  Building, ChevronRight, X, Check
} from 'lucide-react';
import { 
  fetchHVACUnits, 
  createHVACUnit, 
  updateHVACUnit, 
  deleteHVACUnit, 
  testControllerConnection, 
  fetchDeviceCapabilities, 
  sendHVACCommand 
} from '../services/api';

export default function HVACUnits() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testingConn, setTestingConn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState(null);

  // New Device Form State
  const [formData, setFormData] = useState({
    unit_id: '',
    name: '',
    location: '',
    building_floor: 'Floor 1',
    zone_type: 'Commercial Office / Meeting Space',
    brand: 'Daikin',
    controller_type: 'vrf_vrv',
    current_setpoint: 24.0,
    current_mode: 'AUTO',
    host: '',
    port: 10102,
    indoor_unit_address: '101'
  });

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await fetchHVACUnits();
      setUnits(data);
      if (data && data.length > 0 && !selectedUnit) {
        selectUnit(data[0]);
      } else if (selectedUnit) {
        const refreshed = data.find(u => u.unit_id === selectedUnit.unit_id);
        if (refreshed) setSelectedUnit(refreshed);
      }
    } catch (e) {
      console.error('Error fetching units:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectUnit = async (unit) => {
    setSelectedUnit(unit);
    setTestResult(null);
    setCommandFeedback(null);
    try {
      const caps = await fetchDeviceCapabilities(unit.unit_id);
      setCapabilities(caps);
    } catch (e) {
      console.error('Error fetching capabilities:', e);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  // Ping / Test Connection
  const handleTestConnection = async () => {
    if (!selectedUnit) return;
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await testControllerConnection(selectedUnit.unit_id);
      setTestResult(res);
      // update connection status in unit
      setSelectedUnit(prev => ({ ...prev, connection_status: res.status }));
    } catch (err) {
      setTestResult({
        connected: false,
        status: 'DISCONNECTED',
        message: err.message || 'Connection test failed.'
      });
    } finally {
      setTestingConn(false);
    }
  };

  // Send Direct Command from Devices page
  const handleSendCommand = async (cmd) => {
    if (!selectedUnit) return;
    try {
      const res = await sendHVACCommand(selectedUnit.unit_id, cmd);
      setCommandFeedback({
        success: true,
        message: res.message
      });
      setSelectedUnit(prev => ({
        ...prev,
        ...res.applied_state,
        current_setpoint: res.applied_state.target_temperature ?? prev.current_setpoint,
        current_mode: res.applied_state.mode ?? prev.current_mode,
        fan_speed: res.applied_state.fan_speed ?? prev.fan_speed
      }));
    } catch (e) {
      setCommandFeedback({
        success: false,
        message: e.message || 'Command rejected'
      });
    }
  };

  // Add Device Submission
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      const connection_params = JSON.stringify({
        brand: formData.brand,
        host: formData.host.trim(),
        port: parseInt(formData.port),
        indoor_unit_address: formData.indoor_unit_address,
        protocol: formData.controller_type === 'central_ducted' ? 'Modbus-TCP' : 'CoolMasterNet'
      });

      const payload = {
        unit_id: formData.unit_id.trim().toUpperCase(),
        name: formData.name.trim(),
        location: formData.location.trim(),
        building_floor: formData.building_floor,
        zone_type: formData.zone_type,
        brand: formData.brand,
        controller_type: formData.controller_type,
        connection_params: connection_params,
        current_setpoint: parseFloat(formData.current_setpoint),
        current_mode: formData.current_mode,
        fan_speed: 'AUTO',
        power_state: true,
        status: 'NORMAL',
        connection_status: formData.controller_type === 'simulator' ? 'SIMULATED' : 'UNCONFIGURED',
        auto_mode_enabled: false
      };

      await createHVACUnit(payload);
      setShowAddModal(false);
      await loadUnits();
    } catch (err) {
      alert(`Error creating device: ${err.message}`);
    }
  };

  // Delete device
  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm(`Are you sure you want to remove HVAC device '${unitId}'?`)) return;
    try {
      await deleteHVACUnit(unitId);
      setSelectedUnit(null);
      await loadUnits();
    } catch (err) {
      alert(`Error removing unit: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500" />
            HVAC Devices & Controller Integration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage commercial ducted controllers, VRF/VRV central gateways, and simulated adapters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUnits}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition shadow-sm"
            title="Refresh Devices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add HVAC Device</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Devices List (Left 5 cols) + Selected Device Controller (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Device List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            Registered Controllers ({units.length})
          </div>

          <div className="space-y-2.5">
            {units.map((unit) => {
              const isSelected = selectedUnit?.unit_id === unit.unit_id;
              const conn = unit.connection_status || 'SIMULATED';

              return (
                <div
                  key={unit.unit_id}
                  onClick={() => selectUnit(unit)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/60 shadow-sm'
                      : 'bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {unit.name}
                        </h3>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{unit.unit_id}</span>
                          {' • '}{unit.brand}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          {unit.location}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        conn === 'CONNECTED'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : conn === 'SIMULATED'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      }`}>
                        {conn}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {unit.controller_type === 'central_ducted'
                          ? 'Central Ducted'
                          : unit.controller_type === 'vrf_vrv'
                          ? 'VRF/VRV'
                          : 'Simulator'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Device Controller & Capabilities Detail */}
        <div className="lg:col-span-7">
          {selectedUnit ? (
            <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
              {/* Device Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">{selectedUnit.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {selectedUnit.unit_id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedUnit.location} • {selectedUnit.building_floor} • {selectedUnit.zone_type}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConn}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Network className="w-3.5 h-3.5 text-blue-500" />
                    <span>{testingConn ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUnit(selectedUnit.unit_id)}
                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    title="Delete Device"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Connection Test Result Alert (if run) */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                  testResult.connected
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                }`}>
                  {testResult.connected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">Connection Result [{testResult.status}]:</span> {testResult.message}
                  </div>
                </div>
              )}

              {/* Verified Hardware Capabilities Display */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Supported Controller Capabilities:
                </span>
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Integration Protocol:</span>
                    <strong className="text-zinc-900 dark:text-zinc-200">
                      {capabilities?.protocol_name || (selectedUnit.controller_type === 'central_ducted' ? 'Modbus-TCP / BACnet-IP' : 'CoolMasterNet / Intesis')}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Allowable Setpoint Range:</span>
                    <strong className="text-zinc-900 dark:text-zinc-200">
                      {capabilities?.min_temperature ?? 16.0}°C — {capabilities?.max_temperature ?? 30.0}°C (Step: {capabilities?.temperature_step ?? 0.5}°C)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Supported Operating Modes:</span>
                    <span className="flex items-center gap-1">
                      {(capabilities?.supported_modes || ['COOL', 'AUTO', 'DRY', 'FAN']).map(m => (
                        <span key={m} className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                          {m}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Interactive Control Section */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Direct Remote Equipment Control:
                </span>

                {commandFeedback && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium ${
                    commandFeedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'
                  }`}>
                    {commandFeedback.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Setpoint Stepper */}
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-center">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Target Setpoint</span>
                    <div className="flex items-center justify-center gap-3 my-2">
                      <button
                        onClick={() => handleSendCommand({ target_temperature: Number((selectedUnit.current_setpoint - 0.5).toFixed(1)) })}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition shadow-sm"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                        {selectedUnit.current_setpoint}°C
                      </span>
                      <button
                        onClick={() => handleSendCommand({ target_temperature: Number((selectedUnit.current_setpoint + 0.5).toFixed(1)) })}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-2 text-center">
                      Mode Change
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(capabilities?.supported_modes || ['COOL', 'AUTO', 'DRY', 'FAN']).slice(0, 4).map(m => (
                        <button
                          key={m}
                          onClick={() => handleSendCommand({ mode: m })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                            selectedUnit.current_mode === m
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-400 text-xs bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              Select an HVAC device from the list to view controller parameters and send commands.
            </div>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Register New HVAC Controller
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDevice} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Controller Identifier (Unit ID):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HVAC-002"
                    value={formData.unit_id}
                    onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Equipment Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2nd Floor Executive VRV System"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Location / Room:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Building B - Conf Room"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Equipment Brand:</label>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Daikin">Daikin VRV</option>
                      <option value="Carrier">Carrier Commercial</option>
                      <option value="Mitsubishi">Mitsubishi City Multi</option>
                      <option value="Panasonic">Panasonic FSV</option>
                      <option value="Toshiba">Toshiba SMMS</option>
                      <option value="LG">LG Multi V</option>
                      <option value="Voltas">Voltas Commercial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Controller Integration Type:</label>
                  <select
                    value={formData.controller_type}
                    onChange={e => setFormData({ ...formData, controller_type: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="vrf_vrv">VRF / VRV Central Gateway (CoolMasterNet / Intesis / BACnet)</option>
                    <option value="central_ducted">Commercial Ducted / Central Chiller (Modbus-TCP / BACnet-IP)</option>
                    <option value="simulator">Thermodynamic Physics Simulator (No Hardware Required)</option>
                    <option value="mqtt_esp32">ESP32 / DHT22 Wi-Fi Sensor Node (MQTT)</option>
                  </select>
                </div>

                {formData.controller_type !== 'simulator' && (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Hardware Connection Parameters:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">Gateway IP/Host:</label>
                        <input
                          type="text"
                          placeholder="e.g. 192.168.1.105 (leave blank if pending)"
                          value={formData.host}
                          onChange={e => setFormData({ ...formData, host: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">Port:</label>
                        <input
                          type="number"
                          value={formData.port}
                          onChange={e => setFormData({ ...formData, port: e.target.value })}
                          className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg px-2.5 py-1.5 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                  >
                    Register Device
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
