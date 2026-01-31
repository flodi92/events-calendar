import { GoogleGenAI, Type } from "@google/genai";
import { FetchEventsResponse, GroundingSource } from "../types.ts";

export const fetchEventsFromWeb = async (urls: string[]): Promise<FetchEventsResponse> => {
  if (urls.length === 0) return { events: [], sources: [] };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const urlListPrompt = urls.map((url, i) => `${i + 1}. ${url}`).join('\n');

  const prompt = `
    Search the following cultural venue websites for upcoming events in the next 3 months:
    ${urlListPrompt}

    For each event found, extract:
    - Title of the performance/event
    - Date in YYYY-MM-DD format
    - Start time (if available, else leave blank or guess common times like 19:30 or 20:00)
    - Location (The specific hall or venue name)
    - Organizer (The name of the venue or organizer associated with the URL)
    - URL (The direct link to the event page or the venue's main schedule page where you found it)

    Ensure the output is a valid JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              date: { type: Type.STRING },
              time: { type: Type.STRING },
              location: { type: Type.STRING },
              organizer: { 
                type: Type.STRING,
                description: "The name of the venue or organizer"
              },
              url: {
                type: Type.STRING,
                description: "The URL of the event or venue website"
              }
            },
            required: ["title", "date", "time", "location", "organizer", "url"]
          }
        }
      },
    });

    const jsonStr = response.text.trim();
    const rawEvents = JSON.parse(jsonStr);

    const eventsWithIds = rawEvents.map((e: any, index: number) => ({
      ...e,
      id: `${e.organizer}-${index}-${Date.now()}`,
    }));

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    return { events: eventsWithIds, sources };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { events: [], sources: [] };
  }
};
