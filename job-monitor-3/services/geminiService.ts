import { GoogleGenAI, Type } from "@google/genai";
import { Job } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts job postings from raw HTML content using Gemini Flash.
 */
export const extractJobsFromHtml = async (siteName: string, htmlContent: string): Promise<Omit<Job, 'id' | 'detectedAt' | 'isNew'>[]> => {
  try {
    // Truncate HTML to avoid excessive tokens if extremely large, though Flash handles huge context.
    // 100k chars is usually a safe heuristic for a "page" without blowing up if it's a huge dump.
    const truncatedHtml = htmlContent.substring(0, 150000); 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze the following HTML content from the career page of "${siteName}".
        Extract all distinct job postings found.
        
        Return a JSON array where each object has:
        - title: The job title
        - url: The direct link to the job posting (if relative, keep it relative)
        - date: The posted date (if available, else null)
        - location: The job location (if available, else null)
        
        HTML Content:
        ${truncatedHtml}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              date: { type: Type.STRING, nullable: true },
              location: { type: Type.STRING, nullable: true },
            },
            required: ["title", "url"],
          },
        },
      },
    });

    const jobs = JSON.parse(response.text || "[]");
    
    // Enrich with organization name
    return jobs.map((job: any) => ({
      ...job,
      organization: siteName,
    }));

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to parse jobs from the page content.");
  }
};