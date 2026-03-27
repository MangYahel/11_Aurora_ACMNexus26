import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, MapPin, Target, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Poll the backend queue for actively firing anomalies
    const fetchAlerts = () => {
      const API_BASE = `http://${window.location.hostname}:5000`;
      axios.get(`${API_BASE}/api/alerts`)
        .then(res => setAlerts(res.data.alerts))
        .catch(err => console.error(err));
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 2000); // Check every 2s

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="cyber-panel p-6 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
        <div className="flex items-center gap-3 border-b border-cyber-700 pb-4 mb-4">
          <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wider text-white">Global SOC Alert Dashboard</h2>
            <p className="text-sm font-medium text-gray-400">Monitoring endpoints for behavioral identity drift in real-time.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
          {alerts.length === 0 ? (
            <div className="text-center p-12 text-gray-500 font-medium">
              <Shield className="w-12 h-12 text-cyber-700 mx-auto mb-3" />
              All monitored network endpoints currently operating within normalized ranges.
            </div>
          ) : (
            alerts.map((alert) => {
              const isCrit = alert.risk_level === 'Critical';
              return (
                <div key={alert.id} className={`p-4 rounded-lg border ${isCrit ? 'bg-cyber-danger/10 border-cyber-danger/30' : 'bg-orange-500/10 border-orange-500/30'} flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in`}>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Cpu className={`w-8 h-8 ${isCrit ? 'text-cyber-danger' : 'text-orange-500'}`} />
                      <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{alert.machine}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-cyber-700 pl-4">
                      <h4 className={`text-sm font-bold tracking-wider uppercase flex items-center gap-1.5 ${isCrit ? 'text-red-400' : 'text-orange-400'}`}>
                        <Target className="w-4 h-4" /> {alert.threat_type} detected
                      </h4>
                      <p className="text-sm font-medium text-gray-300">Target Session: <span className="text-white font-bold">{alert.user}</span></p>
                      <p className="text-xs text-gray-400 font-mono mt-1 w-max px-1.5 py-0.5 bg-cyber-900 border border-cyber-700 rounded">
                        Time: {alert.timestamp} | Ping TTL: {alert.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5 border-t md:border-t-0 border-cyber-700 pt-3 md:pt-0">
                     <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Auto-Response Execution</span>
                     <span className={`text-sm font-bold flex items-center gap-1.5 ${isCrit ? 'text-cyber-danger' : 'text-orange-500'}`}>
                        <AlertTriangle className="w-4 h-4" /> {alert.auto_response}
                     </span>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
