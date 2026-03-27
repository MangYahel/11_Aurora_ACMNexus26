import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, BrainCircuit, Bug, Monitor, MapPin, Clock } from 'lucide-react';

const LiveSessionAnalyzer = ({ user, onAnalyze, onTrain, isAnalyzing }) => {

  const [telemetry, setTelemetry] = useState({
    login_hour: new Date().getHours(),
    location: "Identifying real-time IP...",
    device: "Reading OS Fingerprint...",
    department: 'Connecting...',
    files_accessed: 12, // Stable tracking
    download_size_mb: 45 // Stable tracking
  });

  useEffect(() => {
    // Fetch REAL non-hardcoded IP & Geodata
    axios.get('https://ipapi.co/json/')
      .then(res => {
        setTelemetry(prev => ({ ...prev, location: `${res.data.city}, ${res.data.region} (IP: ${res.data.ip})` }));
      })
      .catch(() => {
        setTelemetry(prev => ({ ...prev, location: "Local Network Proxy / Offline" }));
      });
      
    // Parse real OS Data from the physical laptop
    const platform = navigator?.userAgentData?.platform || navigator?.platform || "Unknown Webkit";
    setTelemetry(prev => ({ 
      ...prev, 
      device: `${platform} Client [Hooked]`,
      department: user?.department || 'Unknown'
    }));
    
  }, [user]);

  const handleExecuteThreat = () => {
    // Pushes your actual physical tracking data into the model, but artificially spikes the "Insider Action" 
    onAnalyze({
      ...telemetry,
      files_accessed: 9500, // Massive Exfiltration
      download_size_mb: 8500 // 8.5GB spike off baseline
    });
  };

  const TelemetryItem = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col gap-1.5 p-3 bg-cyber-900/50 border border-cyber-700 rounded-lg">
      <div className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-cyber-neon" /> {label}
      </div>
      <div className="text-sm text-gray-200 font-mono font-bold truncate" title={value}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="cyber-panel p-5 border-cyber-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.1)] animate-fade-in">
      <div className="flex items-center justify-between mb-5 border-b border-cyber-700/50 pb-3">
        <div className="flex items-center gap-2 text-cyber-accent">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold text-white tracking-wide">Live Hardware Telemetry</h3>
        </div>
        <div className="text-[10px] font-bold tracking-widest text-cyber-success uppercase animate-pulse border border-cyber-success/30 px-2 py-0.5 rounded bg-cyber-success/10">
          Hardware Sync Active
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <TelemetryItem icon={Clock} label="System Clock (Hour)" value={`${telemetry.login_hour}:00 Local Time`} />
        <TelemetryItem icon={MapPin} label="Active IP Routing" value={telemetry.location} />
        <TelemetryItem icon={Monitor} label="Browser Signature" value={telemetry.device} />
        <TelemetryItem icon={Activity} label="Active Domain Role" value={telemetry.department} />
      </div>

      <div className="text-xs text-orange-400 font-medium mb-5 bg-orange-500/10 p-2 rounded border border-orange-500/20">
        All text inputs have been destroyed. The system is natively hooking your real IP address and OS fingerprint dynamically from the presentation machine.
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-cyber-700/50">
          
          <button 
            onClick={() => onTrain(telemetry)}
            disabled={isAnalyzing || !user}
            className="w-full md:w-1/2 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-cyber-success/80 to-cyber-success text-white rounded-lg shadow-lg font-bold tracking-wide hover:from-cyber-success hover:to-green-400 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2 animate-pulse">
                <BrainCircuit className="w-4 h-4 animate-spin" /> Syncing...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <BrainCircuit className="w-4 h-4" /> Train from Live Hardware
              </span>
            )}
          </button>
          
          <button 
            onClick={handleExecuteThreat}
            disabled={isAnalyzing || !user}
            className="w-full md:w-1/2 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500/80 to-cyber-danger/80 text-white rounded-lg shadow-lg font-bold tracking-wide hover:from-orange-500 hover:to-cyber-danger transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Activity className="w-4 h-4 animate-spin" /> Tracing...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <Bug className="w-4 h-4" /> Trigger Insider Attack
              </span>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default LiveSessionAnalyzer;
