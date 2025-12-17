import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dashboard from './components/Dashboard';
import JobFeed from './components/JobFeed';
import Settings from './components/Settings';
import { MonitoredSite, Job, MonitorStatus, Settings as SettingsType, LogEntry } from './types';
import { checkSite } from './services/monitorService';

// Initial state helpers
const getStored = <T,>(key: string, def: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : def;
  } catch {
    return def;
  }
};

const setStored = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
};

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'feed' | 'settings'>('dashboard');
  
  const [sites, setSites] = useState<MonitoredSite[]>(() => getStored('sentinel_sites', []));
  const [jobs, setJobs] = useState<Job[]>(() => getStored('sentinel_jobs', []));
  const [settings, setSettings] = useState<SettingsType>(() => getStored('sentinel_settings', {
    checkIntervalMinutes: 30,
    enableBrowserNotifications: false,
    webhookUrl: ''
  }));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<MonitorStatus>(MonitorStatus.IDLE);
  
  // Refs for interval management
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isScanningRef = useRef(false);

  // --- Persistence ---
  useEffect(() => setStored('sentinel_sites', sites), [sites]);
  useEffect(() => setStored('sentinel_jobs', jobs), [jobs]);
  useEffect(() => setStored('sentinel_settings', settings), [settings]);

  // --- Notifications ---
  const sendNotification = async (newJobsCount: number, siteName: string) => {
    const msg = `Found ${newJobsCount} new jobs at ${siteName}`;
    
    // Browser Notification
    if (settings.enableBrowserNotifications && Notification.permission === "granted") {
      new Notification("Sentinel Alert", { body: msg });
    }

    // Webhook
    if (settings.webhookUrl) {
      try {
        await fetch(settings.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **Sentinel Alert**: ${msg}`,
            embeds: [{
              title: `New Job Postings - ${siteName}`,
              description: "New positions detected.",
              color: 1107217
            }]
          })
        });
      } catch (e) {
        console.error("Webhook failed", e);
      }
    }
  };

  // --- Scanning Logic ---
  const performScan = useCallback(async () => {
    if (isScanningRef.current) return;
    if (sites.length === 0) return;

    isScanningRef.current = true;
    setStatus(MonitorStatus.SCANNING);

    const jobsRef = [...jobs]; // Snapshot of current jobs
    let totalNew = 0;

    for (const site of sites) {
        const { newJobs, updatedSite, log } = await checkSite(site, jobsRef);
        
        // SAFE UPDATE: Use functional state update to prevent race conditions
        setSites(prev => prev.map(s => s.id === site.id ? updatedSite : s));
        setLogs(prev => [log, ...prev].slice(0, 50));

        if (newJobs.length > 0) {
            setJobs(prev => {
                const updated = [...newJobs, ...prev];
                return updated.slice(0, 500);
            });
            jobsRef.push(...newJobs);
            
            totalNew += newJobs.length;
            sendNotification(newJobs.length, site.name);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    setStatus(MonitorStatus.IDLE);
    isScanningRef.current = false;
  }, [sites, jobs, settings]);

  // --- Interval Setup ---
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const ms = settings.checkIntervalMinutes * 60 * 1000;
    intervalRef.current = setInterval(performScan, ms);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [settings.checkIntervalMinutes, performScan]);

  // --- Handlers ---
  const handleAddSite = (name: string, url: string) => {
    const newSite: MonitoredSite = {
      id: Date.now().toString(),
      name,
      url,
      status: 'active',
      jobCount: 0
    };
    // SAFE UPDATE: Functional update prevents clobbering concurrent scan updates
    setSites(prev => [...prev, newSite]);
  };

  const handleRemoveSite = (id: string) => {
    // SAFE UPDATE
    setSites(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-20">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 text-primary-500 mb-1">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span className="font-bold text-lg tracking-tight text-white">SENTINEL</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${status === MonitorStatus.SCANNING ? 'bg-primary-500 animate-pulse' : 'bg-gray-600'}`}></span>
            <span className="text-xs text-gray-500 font-mono uppercase">{status}</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Targets
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'feed' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
          >
             <div className="relative">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {jobs.filter(j => j.isNew).length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-gray-950"></span>
              )}
             </div>
            Job Feed
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        {/* Live Log Widget */}
        <div className="p-4 border-t border-gray-800">
           <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">System Log</h4>
           <div className="h-32 overflow-y-auto font-mono text-xs space-y-1.5 text-gray-400 bg-gray-900 rounded p-2 border border-gray-800">
             {logs.length === 0 && <span className="text-gray-600 italic">System ready...</span>}
             {logs.map(log => (
               <div key={log.id} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-primary-400' : ''}`}>
                 <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {hour12:false})}]</span> {log.message}
               </div>
             ))}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          <Dashboard 
            sites={sites} 
            status={status} 
            onAddSite={handleAddSite} 
            onRemoveSite={handleRemoveSite}
            onForceScan={performScan}
          />
        )}
        {activeTab === 'feed' && (
          <JobFeed jobs={jobs} onClear={() => setJobs([])} />
        )}
        {activeTab === 'settings' && (
          <Settings settings={settings} onSave={setSettings} />
        )}
      </main>
    </div>
  );
};

export default App;