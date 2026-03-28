import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Target,
  Activity,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Bell,
  Shield,
  Database,
  LayoutTemplate,
  Briefcase,
  Lock
} from 'lucide-react';

const EmployeeDashboard = () => {
  const params = new URLSearchParams(window.location.search);
  const currentUser = params.get('user') || 'Irene';

  const [tickets, setTickets] = useState([]);
  const [activeTicketId, setActiveTicketId] = useState('');

  const [session, setSession] = useState({
    files_accessed: 5,
    download_size_mb: 20,
    accessed_folder: '/finance/reports/q1',
    action_taken: 'read',
    department: 'Finance',
    active_app: 'chrome',
    active_website: 'docs.google.com',
    usb_inserted: false
  });

  const [result, setResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [endpointMode, setEndpointMode] = useState('normal');
  const [unlockPin, setUnlockPin] = useState('');
  const [bypassMessage, setBypassMessage] = useState('');

  const API_BASE = `http://${window.location.hostname}:5000`;

  useEffect(() => {
    axios.get(`${API_BASE}/api/tickets`).then(res => {
      const allTickets = res.data.tickets || [];
      const userTickets = allTickets.filter(t => t.user_name === currentUser);
      setTickets(userTickets);

      if (userTickets.length > 0) {
        setActiveTicketId(userTickets[0].id);
        prefillSession(userTickets[0]);
      }
    }).catch(err => console.error(err));
  }, [currentUser]);

  // POLL BACKEND FOR ENDPOINT MODE + EXECUTE LOCAL OS ACTIONS
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/endpoint/status?user=${currentUser}`);
        const mode = res.data.mode;
        setEndpointMode(mode);

        // If this frontend is running on the same machine as the backend,
        // these will execute locally on that machine.
        if (mode === 'sleep') {
          await axios.post(`${API_BASE}/api/endpoint/execute_sleep`);
        }

        if (mode === 'shutdown') {
          await axios.post(`${API_BASE}/api/endpoint/execute_shutdown`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentUser]);

  const prefillSession = (ticketOrId) => {
    const t = typeof ticketOrId === "string"
      ? tickets.find(x => x.id === ticketOrId)
      : ticketOrId;

    if (t) {
      setSession({
        files_accessed: t.max_files || 5,
        download_size_mb: t.max_download_mb || 20,
        accessed_folder: t.allowed_folders?.split(',')[0]?.trim() || '',
        action_taken: t.allowed_actions?.split(',')[0]?.trim() || '',
        department: t.department || '',
        active_app: t.allowed_apps ? t.allowed_apps.split(',')[0].trim() : 'chrome',
        active_website: t.allowed_websites ? t.allowed_websites.split(',')[0].trim() : 'docs.google.com',
        usb_inserted: false
      });
    }
  };

  const handleTicketChange = (e) => {
    const selectedId = e.target.value;
    setActiveTicketId(selectedId);
    prefillSession(selectedId);
    setResult(null);
  };

  const evaluateSession = async () => {
    setIsEvaluating(true);
    try {
      const payload = { ticket_id: activeTicketId, ...session };
      const res = await axios.post(`${API_BASE}/api/analyze_session`, payload);
      setResult(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleBypassVerify = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/admin/verify-pin`, {
        pin: unlockPin
      });

      if (res.data.success) {
        setBypassMessage("PIN verified. Awaiting admin recovery decision...");
      }
    } catch (err) {
      setBypassMessage("Unauthorized Admin PIN");
    }
  };

  // SHUTDOWN SCREEN
  if (endpointMode === 'shutdown') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#02050A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md p-10 border border-red-500/30 shadow-[0_0_80px_rgba(255,0,0,0.15)] bg-[#0A0F1A]/90 rounded-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_30px_rgba(255,0,0,0.4)]">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-red-500 tracking-widest uppercase mb-2">System Shutdown</h1>
          <p className="text-gray-400 font-medium">
            Remote administrative shutdown has been authorized.
          </p>
        </div>
      </div>
    );
  }

  // SLEEP SCREEN
  if (endpointMode === 'sleep') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#02050A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md p-10 border border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)] bg-[#0A0F1A]/90 rounded-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Lock className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-black text-blue-400 tracking-widest uppercase mb-2">Endpoint Asleep</h1>
          <p className="text-gray-400 font-medium">
            Remote admin has temporarily frozen this endpoint pending security review.
          </p>
        </div>
      </div>
    );
  }

  // LOCK SCREEN
  if (endpointMode === 'locked') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#02050A]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md p-10 border border-red-500/30 shadow-[0_0_80px_rgba(244,63,94,0.15)] bg-[#0A0F1A]/90 rounded-2xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/50 flex items-center justify-center mb-6 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]">
            <Lock className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-red-500 tracking-widest uppercase mb-2">Endpoint Secured</h1>
          <p className="text-gray-400 font-medium mb-8">
            Severe ticket misuse detected. Active session terminated and endpoint network frozen.
          </p>

          <input
            type="password"
            placeholder="Enter Admin Bypass PIN"
            className="w-full bg-cyber-900 border border-cyber-700 text-center py-3 rounded-lg text-white font-mono tracking-widest outline-none mb-4"
            value={unlockPin}
            onChange={(e) => setUnlockPin(e.target.value)}
          />

          <button
            onClick={handleBypassVerify}
            className="w-full py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500 font-bold text-red-400 rounded-lg transition-all"
          >
            Verify Remote Admin Bypass
          </button>

          {bypassMessage && (
            <p className="mt-4 text-sm text-orange-300 font-medium">{bypassMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full animate-fade-in">
      {/* Left Column */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <div className="cyber-panel p-6 border-cyber-accent/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
          <div className="flex items-center gap-3 border-b border-cyber-700 pb-4 mb-5">
            <Briefcase className="w-5 h-5 text-cyber-accent" />
            <h2 className="text-xl font-bold tracking-wider text-white">Select Pre-Approved Task Envelope</h2>
          </div>

          <select
            value={activeTicketId}
            onChange={handleTicketChange}
            className="cyber-input appearance-none w-full bg-cyber-900 border-cyber-700 font-bold mb-2"
          >
            {tickets.length === 0 ? (
              <option value="">No tickets assigned</option>
            ) : (
              tickets.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.task_description} ({t.user_name})
                </option>
              ))
            )}
          </select>

          <div className="p-3 bg-cyber-800 rounded border border-cyber-700 text-xs text-gray-400">
            If the employee operates perfectly within the exact boundaries defined by the admin ticket, the session remains green.
          </div>
        </div>

        <div className="cyber-panel p-6 border-cyber-success/30 mt-auto flex-1">
          <div className="flex items-center gap-3 border-b border-cyber-700 pb-4 mb-5">
            <Activity className="w-5 h-5 text-cyber-success" />
            <h2 className="text-xl font-bold tracking-wider text-white">Live Activity Simulator</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Department Token</label>
              <input value={session.department} onChange={e => setSession({ ...session, department: e.target.value })} className="cyber-input" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Target Folder</label>
              <input value={session.accessed_folder} onChange={e => setSession({ ...session, accessed_folder: e.target.value })} className="cyber-input" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Running Process / App</label>
              <input value={session.active_app} onChange={e => setSession({ ...session, active_app: e.target.value })} className="cyber-input" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Website Traffic</label>
              <input value={session.active_website} onChange={e => setSession({ ...session, active_website: e.target.value })} className="cyber-input" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Action Type Requested</label>
              <input value={session.action_taken} onChange={e => setSession({ ...session, action_taken: e.target.value })} className="cyber-input" />
            </div>

            <div className="col-span-2 flex items-center justify-between bg-cyber-900 border border-cyber-700 rounded p-3">
              <label className="text-xs uppercase font-bold text-red-400">Mount Unauthorized USB Device?</label>
              <input type="checkbox" checked={session.usb_inserted} onChange={e => setSession({ ...session, usb_inserted: e.target.checked })} className="w-5 h-5 accent-red-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Mass File Sync Input</label>
              <input type="number" value={session.files_accessed} onChange={e => setSession({ ...session, files_accessed: e.target.value })} className="cyber-input" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase font-bold text-gray-400">Data Exfiltration Payload (MB)</label>
              <input type="number" value={session.download_size_mb} onChange={e => setSession({ ...session, download_size_mb: e.target.value })} className="cyber-input" />
            </div>

            <button
              onClick={evaluateSession}
              disabled={isEvaluating || tickets.length === 0}
              className="col-span-2 mt-4 h-12 bg-gray-800 hover:bg-cyber-success/30 border border-cyber-success text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isEvaluating ? <Activity className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5 text-cyber-success" />}
              Run Compliance Audit
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="xl:col-span-7 h-full flex flex-col">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-cyber-700 rounded-2xl bg-cyber-800/20 text-center p-8">
            <LayoutTemplate className="w-12 h-12 text-cyber-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white tracking-widest uppercase opacity-50">Awaiting Telemetry Packet</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-slide-up h-full">
            <div className={`p-6 rounded-xl border-2 flex items-center justify-between ${
              result.compliance_status === 'ADHERENCE'
                ? 'bg-cyber-success/10 border-cyber-success shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : result.severity === 'CRITICAL'
                  ? 'bg-cyber-danger/10 border-cyber-danger shadow-[0_0_40px_rgba(244,63,94,0.2)]'
                  : 'bg-orange-500/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
            }`}>
              <div className="flex items-center gap-4">
                {result.compliance_status === 'ADHERENCE'
                  ? <CheckCircle className="w-10 h-10 text-cyber-success" />
                  : <XCircle className="w-10 h-10 text-orange-500" />}
                <div>
                  <h3 className={`text-2xl font-black tracking-widest uppercase ${result.compliance_status === 'ADHERENCE' ? 'text-cyber-success' : 'text-orange-500'}`}>
                    {result.compliance_status}
                  </h3>
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                    {result.severity === 'NORMAL' ? 'Session Fully Validated' : result.severity + ' INCIDENT'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Live Risk Score</p>
                <h4 className={`text-5xl font-black font-mono ${result.risk_score > 50 ? 'text-cyber-danger' : result.risk_score > 0 ? 'text-orange-400' : 'text-cyber-success'}`}>
                  {result.risk_score}
                </h4>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="p-5 bg-black/60 border border-cyber-800 rounded-xl">
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-widest">Endpoint User Screen Warning</h4>
                <p className={`font-medium leading-relaxed ${result.compliance_status === 'ADHERENCE' ? 'text-gray-400' : 'text-orange-300'}`}>
                  {result.user_notification}
                </p>
              </div>

              <div className="p-5 bg-black/60 border border-cyber-800 rounded-xl">
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-widest flex items-center gap-2">
                  <Bell className="w-3 h-3 text-cyber-neon" /> Global Analytics SOC Alert
                </h4>
                <p className={`font-medium leading-relaxed ${result.compliance_status === 'ADHERENCE' ? 'text-gray-400' : 'text-cyber-neon'}`}>
                  {result.admin_notification}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="cyber-panel p-4 border-cyber-700 col-span-2 md:col-span-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyber-neon" /> Validation Flags
                </h3>
                {result.explanation.length === 0 ? (
                  <div className="text-sm text-cyber-success font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> All metrics verified.
                  </div>
                ) : (
                  <ul className="text-sm text-gray-300 flex flex-col gap-2">
                    {result.explanation.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 bg-black/40 p-2 rounded border border-cyber-700">
                        <XCircle className={`w-4 h-4 shrink-0 mt-0.5 ${result.severity === 'CRITICAL' ? 'text-cyber-danger' : 'text-orange-400'}`} /> {exp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="cyber-panel p-4 border-cyber-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Bell className="w-3 h-3 text-orange-400" /> Emulated User Display
                </h3>
                <div className={`p-3 rounded text-sm font-bold leading-relaxed border ${
                  result.severity === 'NORMAL'
                    ? 'bg-cyber-success/10 text-cyber-success border-cyber-success/30'
                    : result.severity === 'CRITICAL'
                      ? 'bg-cyber-danger/20 text-red-300 border-cyber-danger/50'
                      : 'bg-warning/10 text-orange-300 border-warning/30'
                }`}>
                  {result.user_notification}
                </div>
              </div>

              <div className="cyber-panel p-4 border-cyber-700 col-span-2 bg-cyber-900/60">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyber-accent" /> Security Automation
                    </h3>
                    <ul className="grid grid-cols-2 gap-2 text-xs">
                      {result.response_actions.map((act, i) => (
                        <li key={i} className={`p-1.5 border rounded font-bold text-center ${
                          result.compliance_status === 'ADHERENCE'
                            ? 'bg-cyber-success/10 border-cyber-success/50 text-cyber-success'
                            : 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                        }`}>
                          {act}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex-1 border-t md:border-t-0 md:border-l border-cyber-700 pt-4 md:pt-0 md:pl-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-cyber-danger" /> Admin Incident Trigger
                    </h3>
                    <div className={`p-2 rounded font-mono text-sm tracking-tight border ${
                      result.compliance_status === 'ADHERENCE'
                        ? 'text-gray-500 border-cyber-700'
                        : 'text-white bg-cyber-danger/80 border-cyber-danger shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    }`}>
                      {result.admin_notification}
                    </div>
                  </div>
                </div>
              </div>
       </div>
       </div>
      )}
    </div>
    </div>
  );
};
export default EmployeeDashboard;
