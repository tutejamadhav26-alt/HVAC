import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function AlertsCenter() {
  const { alerts, handleResolveAlert } = useData();
  const [filter, setFilter] = useState('all'); // all, active, resolved

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return !a.is_resolved;
    if (filter === 'resolved') return a.is_resolved;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Alerts & Maintenance Notifications</h1>
          <p className="text-sm text-slate-400">Manage automated critical anomalies, warning thresholds, and resolved events</p>
        </div>

        <div className="flex bg-slate-800 p-1 border border-slate-700 rounded-lg">
          {['all', 'active', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                filter === f
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-700">
            <tr>
              <th className="p-4">Severity</th>
              <th className="p-4">Alert Title</th>
              <th className="p-4">Message</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60 text-slate-300">
            {filteredAlerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-700/30">
                <td className="p-4">
                  <span className={`px-2.5 py-1 font-bold rounded text-xs inline-flex items-center gap-1 ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {alert.severity === 'critical' && <AlertOctagon className="w-3.5 h-3.5" />}
                    {alert.severity === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {alert.severity === 'info' && <Info className="w-3.5 h-3.5" />}
                    {alert.severity.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 font-bold text-slate-100">{alert.title}</td>
                <td className="p-4 max-w-lg">{alert.message}</td>
                <td className="p-4 text-slate-400 font-mono">{alert.timestamp ? alert.timestamp.replace('T', ' ').substring(0, 19) : ''}</td>
                <td className="p-4">
                  {alert.is_resolved ? (
                    <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Resolved ({alert.resolved_by || 'Staff'})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold transition shadow"
                    >
                      Resolve Alert
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">No alerts match the selected filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
