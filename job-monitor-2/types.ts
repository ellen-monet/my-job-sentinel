export interface Job {
  id: string; // generated hash
  title: string;
  url: string;
  location?: string;
  date?: string;
  organization: string;
  detectedAt: string; // ISO date
  isNew: boolean;
}

export enum MonitorStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COOLDOWN = 'COOLDOWN',
  ERROR = 'ERROR'
}

export interface MonitoredSite {
  id: string;
  name: string;
  url: string;
  lastChecked?: string;
  status: 'active' | 'inactive' | 'error';
  lastError?: string;
  jobCount: number;
}

export interface Settings {
  checkIntervalMinutes: number;
  webhookUrl?: string; // For Slack/Discord/Telegram integration
  enableBrowserNotifications: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}