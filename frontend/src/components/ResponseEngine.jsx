import React from 'react';
import { Shield, Lock, BellRing, Server, CheckCircle2, AlertOctagon } from 'lucide-react';

const ResponseEngine = ({ result }) => {
  if (!result) return null;

  const { recommended_actions, auto_response_triggered, alert_status, risk_level } = result;

  const isHighRisk = ['High', 'Critical'].includes(risk_level);

  return (
    <div className="cyber-panel p-5 h-full relative overflow-hidden">
      {/* Background glow for critical threats */}
      {isHighRisk && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyber-danger/10 blur-[40px] rounded-full pointer-events-none" />
      )}

      <div className="flex items-center justify-between mb-5 border-b border-cyber-700/50 pb-3 relative z-10">
        <div className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-cyber-neon" />
          <h3 className="font-semibold tracking-wide">Automated Response Engine</h3>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-cyber-900/60 rounded-lg border border-cyber-700 mb-5 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">SOC Alert Status</span>
          <div className="flex items-center gap-2">
            {alert_status === 'Active' ? (
              <span className="flex items-center gap-1.5 text-cyber-danger font-bold text-sm bg-cyber-danger/10 px-2 py-0.5 rounded border border-cyber-danger/30">
                <AlertOctagon className="w-3.5 h-3.5 animate-pulse" /> {alert_status}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-cyber-success font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> {alert_status}
              </span>
            )}
          </div>
        </div>
        <div className="w-px h-8 bg-cyber-700"></div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Auto-Response Executed</span>
          <span className={`font-bold text-sm truncate max-w-[150px] ${isHighRisk ? 'text-orange-500' : 'text-cyber-neon'}`}>
            {auto_response_triggered}
          </span>
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Generated Countermeasures</h4>
        <div className="grid grid-cols-1 gap-2">
          {recommended_actions.map((action, idx) => {
            const isLock = action.toLowerCase().includes('lock') || action.toLowerCase().includes('restrict');
            const isAlert = action.toLowerCase().includes('alert') || action.toLowerCase().includes('notify');
            const isSystem = action.toLowerCase().includes('shutdown') || action.toLowerCase().includes('block');
            
            let ActionIcon = CheckCircle2;
            let themeClass = "text-gray-300 bg-cyber-900/30 border-cyber-700/50";
            
            if (isLock) { ActionIcon = Lock; themeClass = "text-orange-400 bg-orange-500/5 border-orange-500/20"; }
            else if (isAlert) { ActionIcon = BellRing; themeClass = "text-cyber-warning bg-cyber-warning/5 border-cyber-warning/20"; }
            else if (isSystem) { ActionIcon = Server; themeClass = "text-cyber-danger bg-cyber-danger/5 border-cyber-danger/20"; }

            return (
              <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm font-medium ${themeClass}`}>
                <ActionIcon className="w-4 h-4 shrink-0 opacity-80" />
                <span>{action}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResponseEngine;
