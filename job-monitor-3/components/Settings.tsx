import React from 'react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleChange = (key: keyof SettingsType, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div className="p-6 h-full">
      <h1 className="text-2xl font-bold text-white mb-8">System Configuration</h1>
      
      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        
        {/* Monitoring Interval */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">Scan Frequency</h3>
          <div className="flex items-center gap-4">
             <input
              type="range"
              min="5"
              max="120"
              step="5"
              value={localSettings.checkIntervalMinutes}
              onChange={(e) => handleChange('checkIntervalMinutes', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <span className="bg-gray-900 px-3 py-1 rounded text-primary-500 font-mono border border-primary-500/30 w-24 text-center">
              {localSettings.checkIntervalMinutes} min
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Time between automated checks for each target site.</p>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
             Notification Webhook
             <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Optional</span>
           </h3>
           <div className="space-y-4">
             <div>
               <label className="block text-sm text-gray-400 mb-1">Webhook URL</label>
               <input 
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none font-mono text-sm"
                  value={localSettings.webhookUrl || ''}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
               />
               <p className="text-gray-500 text-xs mt-2">
                 Sentinel will POST a JSON payload to this URL when new jobs are detected. Compatible with Discord, Slack, and automation tools like Zapier.
               </p>
             </div>
           </div>
        </div>

        {/* Browser Notifications */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-white">Browser Alerts</h3>
            <p className="text-gray-500 text-sm">Receive desktop notifications when the app is running in background.</p>
          </div>
          <button
            type="button"
            onClick={() => {
                if (!localSettings.enableBrowserNotifications && Notification.permission !== 'granted') {
                    Notification.requestPermission();
                }
                handleChange('enableBrowserNotifications', !localSettings.enableBrowserNotifications);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings.enableBrowserNotifications ? 'bg-primary-600' : 'bg-gray-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings.enableBrowserNotifications ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-primary-500/20 transition-all active:scale-95"
          >
            Save Configuration
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;