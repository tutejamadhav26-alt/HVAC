import React, { useEffect, useState } from 'react';
import { fetchHealth } from '../services/api';
import { Cpu, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function HVACUnits() {
  const [units, setUnits] = useState([
    {
      id: 1,
      unit_id: 'HVAC-001',
      name: 'Main Central Chiller System',
      location: 'Building A - Mechanical Room 1',
      status: 'NORMAL',
      installation_date: '2025-01-15T00:00:00'
    }
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">HVAC Machinery Units Registry</h1>
        <p className="text-sm text-slate-400">Registered HVAC hardware units and sensor node status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div key={unit.unit_id} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                {unit.status}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{unit.name}</h3>
              <p className="text-xs font-mono text-blue-400 mt-0.5">ID: {unit.unit_id}</p>
            </div>
            <div className="space-y-2 text-xs text-slate-400 border-t border-slate-700/60 pt-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{unit.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Installed: {unit.installation_date.substring(0, 10)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
