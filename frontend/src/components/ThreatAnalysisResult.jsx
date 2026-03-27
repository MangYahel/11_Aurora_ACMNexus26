import React from 'react';
import { Target, AlertTriangle, ShieldAlert, Fingerprint, Activity, Gauge } from 'lucide-react';

const ThreatAnalysisResult = ({ result }) => {
  if (!result) return null;

  const { risk_level, risk_score, confidence, identity_drift, explanation, threat_type } = result;

  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return 'text-cyber-success';
      case 'Medium': return 'text-cyber-warning';
      case 'High': return 'text-orange-500';
      case 'Critical': return 'text-cyber-danger';
      default: return 'text-gray-400';
    }
  };

  const getRiskBg = (level) => {
    switch(level) {
      case 'Low': return 'border-cyber-success/30 bg-cyber-success/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
      case 'Medium': return 'border-cyber-warning/30 bg-cyber-warning/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
      case 'High': return 'border-orange-500/30 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
      case 'Critical': return 'border-cyber-danger/30 bg-cyber-danger/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
      default: return 'border-cyber-700 bg-cyber-800';
    }
  };

  const ProgressCircle = ({ percentage, colorClass }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            className="text-cyber-800/80 stroke-current" 
            strokeWidth="6" 
            cx="48" cy="48" r={radius} 
            fill="transparent"
          />
          <circle 
            className={`stroke-current ${colorClass}`} 
            strokeWidth="6" 
            strokeLinecap="round"
            cx="48" cy="48" r={radius} 
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colorClass}`}>{percentage}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`cyber-panel p-6 ${getRiskBg(risk_level)} transition-colors duration-500`}>
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
        
        {/* Risk Score */}
        <div className="flex items-center gap-6 border-b lg:border-b-0 lg:border-r border-cyber-700/50 pb-6 lg:pb-0 lg:pr-8">
          <ProgressCircle percentage={risk_score} colorClass={getRiskColor(risk_level)} />
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Gauge className="w-4 h-4" /> Risk Score
            </h3>
            <div className={`text-3xl font-bold uppercase tracking-wider flex items-center gap-2 ${getRiskColor(risk_level)}`}>
              {risk_level}
            </div>
            <div className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> AI Confidence: {confidence}%
            </div>
          </div>
        </div>

        {/* Threat & Drift */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyber-900/40 border border-cyber-700 p-3 rounded-lg">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Threat Classification</span>
              <span className={`text-lg font-bold truncate flex items-center gap-2 ${getRiskColor(risk_level)}`}>
                <Target className="w-5 h-5" /> {threat_type}
              </span>
            </div>
            <div className="bg-cyber-900/40 border border-cyber-700 p-3 rounded-lg">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Identity Drift State</span>
              <span className={`text-lg font-bold truncate flex items-center gap-2 ${risk_score > 50 ? 'text-orange-500' : 'text-cyber-success'}`}>
                <Fingerprint className="w-5 h-5" /> {identity_drift}
              </span>
            </div>
          </div>
          
          {/* Explanation Engine */}
          <div className="bg-cyber-900/60 border border-cyber-700/50 rounded-lg p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5 border-b border-cyber-700 pb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-neon" /> Behavioral Anomaly Breakdown
            </h4>
            <ul className="space-y-1.5 text-sm font-medium mt-2 max-h-32 overflow-y-auto">
              {explanation.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${risk_score > 30 ? 'text-cyber-warning' : 'text-cyber-success'}`} />
                  <span className={risk_score > 30 ? 'text-gray-300' : 'text-gray-400'}>{exp}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThreatAnalysisResult;
