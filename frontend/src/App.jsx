import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Ghost, ShieldAlert, Activity, Wifi, Shield, RefreshCw } from 'lucide-react';

import UserSelection from './components/UserSelection';
import BehaviorProfile from './components/BehaviorProfile';
import LiveSessionAnalyzer from './components/LiveSessionAnalyzer';
import ThreatAnalysisResult from './components/ThreatAnalysisResult';
import AttackTimeline from './components/AttackTimeline';
import ResponseEngine from './components/ResponseEngine';
import AdminDashboard from './components/AdminDashboard'; // We will create this next

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState('Checking...');

  const fetchUsers = () => {
      const API_BASE = `http://${window.location.hostname}:5000`;
      axios.get(`${API_BASE}/api/users`)
      .then(res => {
        setUsers(res.data.users);
        setBackendStatus('Connected');
        if (!selectedUser && res.data.users.length > 0) {
          // Default to Admin Laptop
          setSelectedUser(res.data.users.find(u => u.role === 'admin') || res.data.users[0]);
        }
      })
      .catch(err => {
        console.error("Backend connection failed", err);
        setBackendStatus('Disconnected');
      });
  };

  useEffect(() => {
    fetchUsers();
    // Poll for user updates every 5 seconds (to keep baselines fresh after training)
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [selectedUser]); // re-bind interval on user change is fine to prevent staleness but we can keep it decoupled

  // Analyze Session
  const handleAnalyzeSession = async (sessionData) => {
    setIsAnalyzing(true);
    try {
      const API_BASE = `http://${window.location.hostname}:5000`;
      const res = await axios.post(`${API_BASE}/api/analyze_session`, {
        user_id: selectedUser.id,
        ...sessionData
      });
      setAnalysisResult(res.data.data);
    } catch (err) {
      console.error("Error analyzing session", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Train AI Sequence
  const handleTrainAI = async (sessionData) => {
    setIsAnalyzing(true);
    try {
      const API_BASE = `http://${window.location.hostname}:5000`;
      await axios.post(`${API_BASE}/api/train`, {
        user_id: selectedUser.id,
        ...sessionData
      });
      // Clear out the threat result screen 
      setAnalysisResult(null);
      // Immediately refresh the current profile baseline logic
      fetchUsers();
      window.alert("✅ Hardware Pattern Saved!\n\nThe AI has memorized your System Fingerprint and IP Address as a verified safe behavior pattern. Check the 'Real-Time Behavioral AI' panel to see your numbers tick up!");
    } catch (err) {
      console.error("Error training baseline", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 pb-24 flex flex-col gap-6 overflow-y-auto w-full">
      {/* App Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-700 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyber-800 flex items-center justify-center border border-cyber-700 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Ghost className="w-6 h-6 text-cyber-neon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">GhostTrace <span className="text-cyber-neon">X</span></h1>
            <p className="text-sm text-gray-400">Continuous Behavioral Identity Threat Detection</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-cyber-800 px-3 py-1.5 rounded-lg border border-cyber-700 text-sm">
            <span className="text-gray-400">Target Role:</span>
            <div className={`flex items-center gap-1.5 font-bold ${selectedUser?.role === 'admin' ? 'text-cyber-neon' : 'text-orange-500'}`}>
              <Shield className="w-4 h-4" /> {selectedUser?.role === 'admin' ? 'Admin SOC' : 'Employee Endpoint'}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-cyber-800 px-3 py-1.5 rounded-lg border border-cyber-700 text-sm">
            <span className="text-gray-400">API Gateway:</span>
            <div className={`flex items-center gap-1.5 font-medium ${backendStatus === 'Connected' ? 'text-cyber-success' : 'text-cyber-danger'}`}>
              {backendStatus === 'Connected' ? <Wifi className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />} {backendStatus}
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 items-start max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Context Setup */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full h-full">
          <UserSelection 
            users={users} 
            selectedUser={selectedUser} 
            onSelect={(user) => {
              setSelectedUser(user);
              setAnalysisResult(null); // Clear active traces when swapping computers
            }} 
          />
          
          {selectedUser?.role !== 'admin' && (
            <>
              {/* Show the employee's dynamically updating baseline */}
              <BehaviorProfile user={users.find(u => u.id === selectedUser.id) || selectedUser} />

              {/* Feed the backend either training data or hostile threat data */}
              <LiveSessionAnalyzer 
                user={users.find(u => u.id === selectedUser.id) || selectedUser} 
                onAnalyze={handleAnalyzeSession}
                onTrain={handleTrainAI}
                isAnalyzing={isAnalyzing}
              />
            </>
          )}
        </div>

        {/* Right Column: Threats & Output */}
        <div className="xl:col-span-8 flex flex-col gap-6 h-full w-full">
          
          {selectedUser?.role === 'admin' ? (
             /* Show the Global Alert Center instead of individual tracking */
             <AdminDashboard />
          ) : (
            /* Show personal endpoint threat trace */
            analysisResult ? (
              <>
                <ThreatAnalysisResult result={analysisResult} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <AttackTimeline timeline={analysisResult.timeline} riskLevel={analysisResult.risk_level} />
                  <ResponseEngine result={analysisResult} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-cyber-700 rounded-2xl bg-cyber-800/20 text-center p-8">
                <div className="w-20 h-20 rounded-full bg-cyber-800/80 border border-cyber-700 flex items-center justify-center mb-6 shadow-xl relative">
                  <Activity className="w-10 h-10 text-cyber-neon" />
                </div>
                <h2 className="text-xl font-semibold text-gray-300 mb-2 tracking-wide">Endpoint Trace Ready</h2>
                <p className="text-gray-500 max-w-md">
                  This employee endpoint is currently unflagged. Either submit a normal workflow to continually "Train" the baseline AI, or execute a live Threat payload to trigger the Identity Drift anomaly logic.
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
