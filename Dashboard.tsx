import React, { useState } from 'react';
import { MonitoredSite, Job, MonitorStatus } from '../types';

interface DashboardProps {
  sites: MonitoredSite[];
  status: MonitorStatus;
  onAddSite: (name: string, url: string) => void;
  onRemoveSite: (id: string) => void;
  onForceScan: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ sites, status, onAddSite, onRemoveSite, onForceScan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newUrl) {
      onAddSite(newName, newUrl);
      setNewName('');
      setNewUrl('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Surveillance Targets</h1>
          <p className="text-gray-500 text-sm">Managing {sites.length} institutional sources</p>
        </div>
        <div className="flex gap-3">
            <button
            onClick={onForceScan}
            disabled={status === MonitorStatus.SCANNING}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
              ${status === MonitorStatus.SCANNING 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-primary-500 hover:bg-gray-750 border border-primary-500/20'}`}
          >
             <svg className={`w-4 h-4 ${status === MonitorStatus.SCANNING ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {status === MonitorStatus.SCANNING ? 'Scanning...' : 'Scan Now'}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Target
          </button>
        </div>
      </div>

      {sites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl p-12">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <p className="text-lg font-medium">No targets configured</p>
          <p className="text-sm mt-1">Add a website URL to start monitoring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => (
            <div key={site.id} className="bg-gray-800 rounded-xl p-5 border border-gray-750 hover:border-gray-600 transition-colors group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex gap-2">
                   <div className={`w-2 h-2 rounded-full mt-2 ${site.status === 'active' ? 'bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : site.status === 'error' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
                   <button 
                      onClick={() => onRemoveSite(site.id)}
                      className="text-gray-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-lg text-white mb-1 truncate">{site.name}</h3>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-primary-500 truncate block mb-4">
                {site.url}
              </a>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Last Check</p>
                  <p className="text-gray-300 font-mono text-xs">
                    {site.lastChecked ? new Date(site.lastChecked).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Jobs Found</p>
                  <p className="text-white font-mono">{site.jobCount}</p>
                </div>
              </div>
              
              {site.lastError && (
                 <div className="mt-4 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50 truncate">
                   {site.lastError}
                 </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Site Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Target</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Acme Corp"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-1">Careers Page URL</label>
                <input
                  type="url"
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  placeholder="https://company.com/jobs"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-medium transition-colors"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;