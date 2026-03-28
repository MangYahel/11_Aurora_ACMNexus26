import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, Users, FileLock } from 'lucide-react';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

function App() {
  const params = new URLSearchParams(window.location.search);
  const roleFromURL = params.get('role') === 'admin' ? 'admin' : 'employee';

  const [activeView] = useState(roleFromURL);
  const [backendStatus, setBackendStatus] = useState('Connecting...');

  useEffect(() => {
    const API_BASE = `http://${window.location.hostname}:5000`;
    axios.get(`${API_BASE}/api/tickets`)
      .then(() => setBackendStatus('Connected'))
      .catch(() => setBackendStatus('Disconnected'));
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-6 pb-24 flex flex-col gap-6 overflow-y-auto w-full bg-[#0a0f18]">
      {/* Universal Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-700 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyber-800 flex items-center justify-center border border-cyber-700 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <FileLock className="w-6 h-6 text-cyber-neon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              GhostTrace <span className="text-cyber-neon">X</span>
            </h1>
            <p className="text-sm text-gray-400">
              Task-Bound Access Enforcement & Ticket Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Role Display (NO SWITCHING) */}
          <div className="flex items-center bg-cyber-900 border border-cyber-700 px-4 py-2 rounded-lg">
            <div
              className={`flex items-center gap-2 font-bold text-sm tracking-wide ${
                activeView === 'admin' ? 'text-cyber-neon' : 'text-orange-400'
              }`}
            >
              {activeView === 'admin' ? (
                <>
                  <Shield className="w-4 h-4" /> Admin Governance
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" /> Employee Workspace
                </>
              )}
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex items-center gap-2 bg-cyber-800 px-3 py-1.5 rounded-lg border border-cyber-700 text-sm">
            <span className="text-gray-400">Gateway:</span>
            <div
              className={`flex items-center gap-1.5 font-medium ${
                backendStatus === 'Connected'
                  ? 'text-cyber-success'
                  : 'text-cyber-danger'
              }`}
            >
              <Activity
                className={`w-4 h-4 ${
                  backendStatus === 'Connected' ? 'animate-pulse' : ''
                }`}
              />
              {backendStatus}
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic View Rendering */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto transition-all duration-300 ease-in-out">
        {activeView === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
      </main>
    </div>
  );
}

export default App;