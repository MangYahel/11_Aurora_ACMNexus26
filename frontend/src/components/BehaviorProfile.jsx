import React from 'react';
import { UserCheck, Clock, Download, MapPin, Laptop, Database, HardDrive, BrainCircuit } from 'lucide-react';

const BehaviorProfile = ({ user }) => {
  if (!user || user.role === 'admin') return null;

  const baseline = user.baseline || {};
  const sessionCount = baseline.session_count || 0;

  const isTrained = sessionCount >= 3;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cyber-900/40 border border-cyber-700/50">
      <div className="p-1.5 rounded-md bg-cyber-800 text-gray-400 border border-cyber-700">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 w-full overflow-hidden">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</p>
        <p className="text-sm font-medium text-gray-200 truncate" title={value}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="cyber-panel p-5">
      <div className="flex items-center justify-between gap-2 mb-5 border-b border-cyber-700/50 pb-3">
        <div className="flex items-center gap-2 text-gray-200">
          <BrainCircuit className="w-5 h-5 text-cyber-accent" />
          <h3 className="font-semibold tracking-wide">Real-Time Behavioral AI</h3>
        </div>
        <div className={`cyber-badge ${isTrained ? 'cyber-badge-success bg-cyber-success/10 text-cyber-success border border-cyber-success/30' : 'cyber-badge-warning bg-cyber-warning/10 text-cyber-warning border border-cyber-warning/30'}`}>
          {isTrained ? 'Trained Baseline' : 'Insufficient Data'}
        </div>
      </div>
      
      <p className="text-xs text-gray-400 font-medium mb-4 italic flex items-center gap-1.5 bg-cyber-800 p-2 rounded border border-cyber-700">
        AI Confidence Level based on <span className="text-white font-bold">{sessionCount}</span> actively trained verified sessions.
      </p>

      {sessionCount > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DetailItem 
            icon={Location} 
            label="Trusted Locations" 
            value={baseline.trusted_locations?.join(", ") || "None learned"} 
          />
          <DetailItem 
            icon={Laptop} 
            label="Known Devices" 
            value={baseline.trusted_devices?.join(", ") || "None learned"} 
          />
          <DetailItem 
            icon={Database} 
            label="Dept Domains" 
            value={baseline.trusted_departments?.join(", ") || "None"} 
          />
          <DetailItem 
            icon={HardDrive} 
            label="Avg Daily Files" 
            value={Math.round(baseline.files_accessed_avg || 0)} 
          />
          <DetailItem 
            icon={Download} 
            label="Avg Download Cap" 
            value={`${Math.round(baseline.download_size_mb_avg || 0)} MB`} 
          />
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-cyber-700 bg-cyber-900 rounded-lg">
           <p className="text-sm text-gray-500">No baseline training data available for this endpoint yet.</p>
        </div>
      )}
    </div>
  );
};

// Polyfill icon mapping missed 
import { MapPin as Location } from 'lucide-react';

export default BehaviorProfile;
