import React from 'react';
import { Clock, ShieldAlert, Crosshair, TrendingUp } from 'lucide-react';

const AttackTimeline = ({ timeline, riskLevel }) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="cyber-panel p-5 h-full">
      <div className="flex items-center justify-between mb-5 border-b border-cyber-700/50 pb-3">
        <div className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5 text-cyber-neon" />
          <h3 className="font-semibold tracking-wide">Attack Matrix Timeline</h3>
        </div>
        <div className={`cyber-badge ${riskLevel === 'Low' ? 'cyber-badge-low' : riskLevel === 'Medium' ? 'cyber-badge-medium' : riskLevel === 'High' ? 'cyber-badge-high' : 'cyber-badge-critical'}`}>
          Active Trace
        </div>
      </div>

      <div className="relative border-l-2 border-cyber-700/80 ml-3 space-y-6 pb-2">
        {timeline.map((event, idx) => {
          const isCritical = event.toLowerCase().includes('critical') || event.toLowerCase().includes('locked');
          const isWarning = event.toLowerCase().includes('unusual') || event.toLowerCase().includes('mismatch') || event.toLowerCase().includes('spike');
          
          let icon = <TrendingUp className="w-3 h-3 text-cyber-neon" />;
          let dotColor = "bg-cyber-neon border-cyber-900";
          
          if (isCritical) {
            icon = <ShieldAlert className="w-3 h-3 text-cyber-danger" />;
            dotColor = "bg-cyber-danger border-cyber-900";
          } else if (isWarning) {
            icon = <Crosshair className="w-3 h-3 text-orange-500" />;
            dotColor = "bg-orange-500 border-cyber-900";
          } else if (idx === 0) {
            dotColor = "bg-cyber-success border-cyber-900";
          }

          const [time, ...descParts] = event.split(' - ');
          const desc = descParts.join(' - ');

          return (
            <div key={idx} className="relative pl-6">
              <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-[3px] flex items-center justify-center ${dotColor}`}>
                <div className="w-0.5 h-0.5 bg-cyber-900 rounded-full"></div>
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-cyber-neon/80 tracking-wide font-mono">{time}</span>
                <span className={`text-sm font-medium ${isCritical ? 'text-cyber-danger' : isWarning ? 'text-orange-400' : 'text-gray-300'}`}>
                  {desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-neon/5 blur-[50px] pointer-events-none rounded-full" />
    </div>
  );
};

export default AttackTimeline;
