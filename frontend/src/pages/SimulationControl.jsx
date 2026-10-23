import React from 'react';
import { useData } from '../context/DataContext';
import { Play, Square, FastForward, ShieldCheck, Filter, AlertOctagon, Droplets, Shuffle } from 'lucide-react';

export default function SimulationControl() {
  const { simulation, triggerScenario } = useData();

  const scenarios = [
    {
      id: 'NORMAL',
      title: 'Normal Operating Conditions',
      desc: 'Nominal ambient temperature (23°C), current (4.8A), pressure (101.3kPa). ML health score ~95-100.',
      icon: ShieldCheck,
      color: 'emerald'
    },
    {
      id: 'FILTER_CLOGGING',
      title: 'Air Filter Clogging / Restriction',
      desc: 'Airflow is restricted. Temperature rises to 28-34°C, current rises to 6.5-9A, power increases.',
      icon: Filter,
      color: 'amber'
    },
    {
      id: 'COMPRESSOR_OVERLOAD',
      title: 'Compressor Electrical Overload',
      desc: 'Electrical windings overheat or lock. Current spikes to 10-15A, power spikes >2500W, critical alert triggered.',
      icon: AlertOctagon,
      color: 'red'
    },
    {
      id: 'REFRIGERANT_LEAKAGE',
      title: 'Refrigerant Pressure Loss Leak',
      desc: 'Low suction pressure drops sharply (<85kPa), cooling efficiency degrades, temperature rises.',
      icon: Droplets,
      color: 'purple'
    },
    {
      id: 'RANDOM_FAULT',
      title: 'Random Fault Alternator',
      desc: 'Periodically cycles among all fault modes every 15 simulation cycles to test system dynamic response.',
      icon: Shuffle,
      color: 'emerald'
    }
  ];

  const speeds = [1.0, 2.0, 5.0, 10.0];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">HVAC Physics Sensor Simulator Control</h1>
        <p className="text-sm text-slate-400">Inject fault dynamics in real-time and observe full-stack ML classification & alert response</p>
      </div>

      {/* Current Simulation Status Banner */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Scenario Mode</span>
          <h2 className="text-2xl font-bold text-emerald-400 mt-1">{simulation.scenario}</h2>
          <p className="text-xs text-slate-400 mt-1">Simulation Speed: <span className="font-bold text-slate-200">{simulation.speed_multiplier}x</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerScenario(simulation.scenario, simulation.speed_multiplier)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow"
          >
            <Play className="w-4 h-4" /> Restart Simulator
          </button>
        </div>
      </div>

      {/* Speed Multipliers */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Simulation Speed Multiplier</h3>
        <div className="flex gap-3">
          {speeds.map((speed) => (
            <button
              key={speed}
              onClick={() => triggerScenario(simulation.scenario, speed)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                simulation.speed_multiplier === speed
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" /> {speed}x Speed
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = simulation.scenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => triggerScenario(sc.id, simulation.speed_multiplier)}
              className={`cursor-pointer rounded-xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-600 text-white rounded-full">ACTIVE</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-100">{sc.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{sc.desc}</p>
              </div>
              <button
                className={`mt-5 w-full py-2 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isSelected ? 'Scenario Running' : 'Trigger Scenario'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
