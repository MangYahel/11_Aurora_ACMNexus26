import React from 'react';
import { Laptop, Shield, User, ChevronDown } from 'lucide-react';

const UserSelection = ({ users, selectedUser, onSelect }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="cyber-panel p-5">
      <div className="flex items-center gap-2 mb-4 text-cyber-neon border-b border-cyber-700/50 pb-3">
        <Laptop className="w-5 h-5" />
        <h3 className="font-semibold text-white tracking-wide">Select Physical Endpoint</h3>
      </div>
      <div className="relative">
        <select 
          className="cyber-input appearance-none pl-3 pr-10 py-2.5 font-medium cursor-pointer bg-cyber-900 border-cyber-700 shadow-sm"
          value={selectedUser?.id || ''}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            onSelect(user);
          }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} - {u.role === 'admin' ? '[SOC Admin Role]' : '[Employee Role]'}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500 font-medium leading-relaxed">
        {selectedUser?.role === 'admin' 
          ? "Viewing global SOC dashboard acting as the designated security administrator."
          : "Viewing an individual employee endpoint. You can either train the behavioral AI or execute hostile anomalies here."}
      </p>
    </div>
  );
};

export default UserSelection;
