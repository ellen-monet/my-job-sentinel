import { MonitoredSite, Job, LogEntry } from "../types";
import { extractJobsFromHtml } from "./geminiService";

// Helper to resolve relative URLs
const resolveUrl = (base: string, relative: string) => {
  try {
    return new URL(relative, base).href;
  } catch (e) {
    return relative;
  }
};

// Use a CORS proxy to fetch external HTML from the browser
const fetchHtml = async (url: string): Promise<string> => {
  // Using allorigins.win as a reliable free public proxy for this demo
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
  
  const data = await response.json();
  if (!data.contents) throw new Error("No content received from proxy");
  
  return data.contents;
};

export const checkSite = async (
  site: MonitoredSite,
  existingJobs: Job[]
): Promise<{ newJobs: Job[]; updatedSite: MonitoredSite; log: LogEntry }> => {
  try {
    const html = await fetchHtml(site.url);
    const extractedRawJobs = await extractJobsFromHtml(site.name, html);

    const detectedJobs: Job[] = extractedRawJobs.map(raw => {
      // Create a unique hash for the job to detect duplicates
      const idString = `${site.id}-${raw.title}-${raw.url}`;
      // Simple hash function for ID
      let hash = 0;
      for (let i = 0; i < idString.length; i++) {
        const char = idString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      const id = Math.abs(hash).toString(16);

      return {
        id,
        title: raw.title,
        url: resolveUrl(site.url, raw.url),
        date: raw.date || undefined,
        location: raw.location || undefined,
        organization: site.name,
        detectedAt: new Date().toISOString(),
        isNew: false
      };
    });

    // Filter out jobs we've already seen
    const newJobs = detectedJobs.filter(
      detected => !existingJobs.some(existing => existing.id === detected.id)
    ).map(job => ({ ...job, isNew: true }));

    return {
      newJobs,
      updatedSite: {
        ...site,
        lastChecked: new Date().toISOString(),
        status: 'active',
        jobCount: detectedJobs.length,
        lastError: undefined
      },
      log: {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: `Scanned ${site.name}: Found ${detectedJobs.length} jobs (${newJobs.length} new).`,
        type: newJobs.length > 0 ? 'success' : 'info'
      }
    };

  } catch (error: any) {
    return {
      newJobs: [],
      updatedSite: {
        ...site,
        lastChecked: new Date().toISOString(),
        status: 'error',
        lastError: error.message || "Unknown error"
      },
      log: {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: `Error scanning ${site.name}: ${error.message}`,
        type: 'error'
      }
    };
  }
};