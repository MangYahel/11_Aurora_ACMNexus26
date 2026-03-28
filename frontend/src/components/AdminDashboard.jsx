import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, FileText, AlertTriangle, Cpu, Tag, Server, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [incidents, setIncidents] = useState([]);

  // NEW: Admin control state
  const [targetUser, setTargetUser] = useState('Irene');
  const [adminPin, setAdminPin] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  
  // Ticket Form State
  const [formData, setFormData] = useState({
    user_name: '', department: 'Finance', task_description: '',
    allowed_folders: '', allowed_actions: 'read', allowed_apps: 'chrome, excel', allowed_websites: 'docs.google.com', max_files: 10, max_download_mb: 50, time_window: '9 AM - 6 PM'
  });

  const API_BASE = `http://${window.location.hostname}:5000`;

  const fetchTickets = () => {
    axios.get(`${API_BASE}/api/tickets`).then(res => setTickets(res.data.tickets));
  };
  
  const fetchIncidents = () => {
     axios.get(`${API_BASE}/api/alerts`).then(res => setIncidents(res.data.alerts));
  };

  useEffect(() => {
    fetchTickets();
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/api/tickets`, formData);
    fetchTickets();
    setFormData({...formData, task_description: '', allowed_folders: ''}); // reset some
  };

  // =========================
  // NEW: Admin control functions
  // =========================
  const verifyAndUnlock = async () => {
    try {
      const verify = await axios.post(`${API_BASE}/api/admin/verify-pin`, { pin: adminPin });
      if (verify.data.success) {
        await axios.post(`${API_BASE}/api/admin/unlock`, { user: targetUser });
        setAdminMessage(`Endpoint (${targetUser}) unlocked successfully`);
      }
    } catch (err) { setAdminMessage("Invalid Admin PIN"); }
  };

  const verifyAndSleep = async () => {
    try {
      const verify = await axios.post(`${API_BASE}/api/admin/verify-pin`, { pin: adminPin });
      if (verify.data.success) {
        await axios.post(`${API_BASE}/api/admin/sleep`, { user: targetUser });
        setAdminMessage(`Endpoint (${targetUser}) put into sleep mode`);
      }
    } catch (err) { setAdminMessage("Invalid Admin PIN"); }
  };

  const verifyAndShutdown = async () => {
    try {
      const verify = await axios.post(`${API_BASE}/api/admin/verify-pin`, { pin: adminPin });
      if (verify.data.success) {
        await axios.post(`${API_BASE}/api/admin/shutdown`, { user: targetUser });
        setAdminMessage(`Endpoint (${targetUser}) shutdown triggered`);
      }
    } catch (err) { setAdminMessage("Invalid Admin PIN"); }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/tickets/${id}`);
      fetchTickets();
    } catch (err) { console.error("Error deleting ticket", err); }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full animate-fade-in">
      
      {/* Left Column: Ticket Generation & Active List */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
        {/* CREATE TICKET PANEL */}
        <div className="cyber-panel p-8 border-cyber-accent/30 shadow-[0_0_40px_rgba(139,92,246,0.1)] bg-[#0A0F1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-cyber-700/50 pb-5 mb-6">
            <Plus className="w-6 h-6 text-cyber-accent" />
            <h2 className="text-2xl font-black tracking-wider text-white uppercase">Generate Approval Scope</h2>
          </div>
          
          <form onSubmit={handleCreateTicket} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Employee Name</label>
              <input required value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} className="cyber-input" placeholder="e.g. Rahul" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="cyber-input appearance-none">
                <option>Finance</option><option>Engineering</option><option>HR</option><option>Executive</option>
              </select>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Authorized Task Scope</label>
              <input required value={formData.task_description} onChange={e => setFormData({...formData, task_description: e.target.value})} className="cyber-input" placeholder="e.g. Audit Q1 Reports" />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Allowed Directories (Comma Separated)</label>
              <input required value={formData.allowed_folders} onChange={e => setFormData({...formData, allowed_folders: e.target.value})} className="cyber-input" placeholder="e.g. /finance/reports, /finance/inbox" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Allowed Actions</label>
              <input required value={formData.allowed_actions} onChange={e => setFormData({...formData, allowed_actions: e.target.value})} className="cyber-input" placeholder="read, download" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Time Window</label>
              <input value={formData.time_window} onChange={e => setFormData({...formData, time_window: e.target.value})} className="cyber-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Approved Applications</label>
              <input required value={formData.allowed_apps} onChange={e => setFormData({...formData, allowed_apps: e.target.value})} className="cyber-input" placeholder="chrome, vscode" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Approved Websites</label>
              <input required value={formData.allowed_websites} onChange={e => setFormData({...formData, allowed_websites: e.target.value})} className="cyber-input" placeholder="github.com, drive.google.com" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Max File Access Cap</label>
              <input type="number" value={formData.max_files} onChange={e => setFormData({...formData, max_files: e.target.value})} className="cyber-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-500">Max Exfiltration (MB)</label>
              <input type="number" value={formData.max_download_mb} onChange={e => setFormData({...formData, max_download_mb: e.target.value})} className="cyber-input" />
            </div>

            <button type="submit" className="col-span-2 mt-4 h-14 bg-cyber-accent/20 hover:bg-cyber-accent/40 border border-cyber-accent font-black tracking-widest text-cyber-accent rounded-lg transition-all flex items-center justify-center gap-3 uppercase shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-95">
               <Tag className="w-6 h-6" /> Initialize Strict Ticket Binding
            </button>
          </form>
        </div>

        {/* ACTIVE TICKETS OVERVIEW */}
        <div className="cyber-panel p-8 border-cyber-700/50 flex-1 bg-[#0A0F1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-cyber-700/50 pb-5 mb-6">
            <FileText className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-black tracking-wider text-white uppercase">Active Monitored Scopes</h2>
          </div>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {tickets.map(t => (
              <div key={t.id} className="p-4 bg-cyber-800 border border-cyber-700 rounded-lg flex flex-col md:flex-row justify-between gap-4 shadow-sm hover:border-gray-500 transition-colors">
                 <div className="flex flex-col gap-1 w-full">
                   <div className="flex items-center justify-between w-full">
                     <span className="text-cyber-neon font-bold text-lg font-mono">{t.id} <span className="text-gray-500 text-sm font-sans mx-2">|</span> <span className="text-white font-sans">{t.user_name}</span></span>
                     <button onClick={() => deleteTicket(t.id)} className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-500/10 active:scale-95">✕</button>
                   </div>
                   <span className="text-gray-400 text-sm font-medium">{t.task_description}</span>
                   <span className="text-[10px] text-cyber-success font-bold uppercase mt-1 tracking-wider bg-cyber-success/10 w-max px-2 py-0.5 rounded border border-cyber-success/30"><CheckCircle2 className="w-3 h-3 inline mr-1" /> Bound & Validated</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400 border-l border-cyber-700 pl-4">
                  <span className="font-bold text-gray-500 uppercase">Limits:</span><span></span>
                  <span>Files: <span className="text-white font-mono">{t.max_files}</span></span>
                  <span>Size: <span className="text-white font-mono">{t.max_download_mb}MB</span></span>
                  <span>Apps: <span className="text-white truncate block w-24">{t.allowed_apps?.split(',')[0]}</span></span>
                  <span>Web: <span className="text-white truncate block w-24">{t.allowed_websites?.split(',')[0]}</span></span>
                  <span className="col-span-2">Folder: <span className="text-white truncate block w-48">{t.allowed_folders.split(',')[0]}...</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NEW: REMOTE ENDPOINT CONTROL */}
        <div className="cyber-panel p-8 border-cyber-neon/30 shadow-[0_0_40px_rgba(14,165,233,0.1)] bg-[#0A0F1A]/80 backdrop-blur-md mt-6">
          <div className="flex items-center gap-3 border-b border-cyber-700/50 pb-5 mb-6">
            <Cpu className="w-6 h-6 text-cyber-neon animate-pulse" />
            <h2 className="text-2xl font-black tracking-wider text-white uppercase flex items-center gap-4">Remote Endpoint Control <span className="px-2 py-0.5 bg-cyber-neon/20 border border-cyber-neon text-cyber-neon text-[10px] rounded animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.6)]">LIVE LINK</span></h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Target User (e.g. Irene)"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="cyber-input font-bold text-cyber-neon"
              />
              <input
                type="password"
                placeholder="Enter Admin PIN"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="cyber-input"
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              <button
                onClick={verifyAndUnlock}
                className="flex-1 px-5 py-3 rounded-lg bg-green-500/10 border border-green-500/50 text-green-400 font-bold hover:bg-green-500/20 hover:border-green-400 transition-all active:scale-95"
              >
                Unlock Target
              </button>

              <button
                onClick={verifyAndSleep}
                className="flex-1 px-5 py-3 rounded-lg bg-blue-500/10 border border-blue-500/50 text-blue-400 font-bold hover:bg-blue-500/20 hover:border-blue-400 transition-all active:scale-95"
              >
                Sleep Endpoint
              </button>

              <button
                onClick={verifyAndShutdown}
                className="flex-1 px-5 py-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 font-bold hover:bg-red-500/20 hover:border-red-400 transition-all active:scale-95"
              >
                Shutdown Endpoint
              </button>
            </div>

            {adminMessage && (
              <p className="text-sm font-medium text-cyber-neon">{adminMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: SOC INCIDENT QUEUE */}
      <div className="xl:col-span-5 h-full">
        <div className="cyber-panel p-8 border-cyber-danger/30 shadow-[0_0_40px_rgba(244,63,94,0.1)] h-full flex flex-col bg-[#0A0F1A]/80 backdrop-blur-md">
          <div className="flex items-center gap-4 border-b border-cyber-700/50 pb-5 mb-6">
            <div className="p-3 bg-cyber-danger/10 border border-cyber-danger/40 rounded-lg shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-8 h-8 text-cyber-danger animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-widest text-white uppercase drop-shadow-md">Global Incident Tracker</h2>
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">Live Endpoint Misuse Telemetry</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
            {incidents.length === 0 ? (
               <div className="mt-12 text-center text-gray-500 font-medium flex flex-col items-center gap-3">
                 <Shield className="w-12 h-12 opacity-50" />
                 All active users operating within predefined ticket boundaries.
               </div>
            ) : (
              incidents.map((inc, i) => {
                const isCrit = inc.severity === 'CRITICAL';
                return (
                  <div key={i} className={`p-4 rounded-lg border flex flex-col gap-2 ${isCrit ? 'bg-cyber-danger/10 border-cyber-danger' : 'bg-orange-500/10 border-orange-500'} animate-slide-up`}>
                     <div className="flex justify-between items-center border-b border-cyber-700 pb-2">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isCrit ? 'bg-cyber-danger text-white' : 'bg-orange-500 text-white'}`}>
                          {inc.incident_id}
                        </span>
                        <span className="text-xs text-gray-400">{inc.timestamp}</span>
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                        <Server className={`w-4 h-4 ${isCrit ? 'text-cyber-danger' : 'text-orange-400'}`} />
                        <h4 className="text-sm font-bold text-white tracking-wide">{inc.violation_type}</h4>
                     </div>
                     <p className="text-xs text-gray-400">Target Session: <span className="font-bold text-gray-200">{inc.user}</span> (Ticket: {inc.ticket_id})</p>
                     <div className="mt-2 p-2 bg-black/40 border border-cyber-700 rounded text-xs">
                        <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">Automated OS Response:</span>
                        <span className={`font-bold ${isCrit ? 'text-cyber-danger' : 'text-orange-400'}`}>{inc.action_taken}</span>
                     </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboard;