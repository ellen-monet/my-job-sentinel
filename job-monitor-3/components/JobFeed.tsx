import React from 'react';
import { Job } from '../types';

interface JobFeedProps {
  jobs: Job[];
  onClear: () => void;
}

const JobFeed: React.FC<JobFeedProps> = ({ jobs, onClear }) => {
  // Sort by detectedAt desc
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <div>
          <h1 className="text-2xl font-bold text-white mb-1">Intelligence Feed</h1>
          <p className="text-gray-500 text-sm">Real-time job detection stream</p>
        </div>
        {jobs.length > 0 && (
          <button onClick={onClear} className="text-xs text-gray-500 hover:text-white underline">
            Clear History
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {sortedJobs.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-gray-600">
             <p className="font-mono text-sm">No signals detected yet.</p>
           </div>
        ) : (
          sortedJobs.map(job => (
            <div key={job.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                  {job.organization}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(job.detectedAt).toLocaleDateString()} {new Date(job.detectedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100 group-hover:text-primary-400 transition-colors mt-2 mb-1">
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  {job.title}
                  <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </h3>
              <div className="flex gap-4 text-sm text-gray-400 mt-2">
                {job.location && (
                  <div className="flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </div>
                )}
                {job.date && (
                   <div className="flex items-center gap-1">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {job.date}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobFeed;