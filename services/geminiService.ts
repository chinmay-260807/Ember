import { GoogleGenAI, Type } from "@google/genai";
import { GentleMessage, MessageType } from "../types";

// Safety wrapper for process access
const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  } catch {
    return undefined;
  }
};

export const fetchGentleMessage = async (type: MessageType, goalContext?: string): Promise<GentleMessage> => {
  const fallback: GentleMessage = {
    text: "The stars are quiet today, but they are still there. Take a gentle breath.",
    type: 'quote',
    author: 'Ember'
  };

  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("API Key is missing. Using local fallback.");
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    if (type === 'quote') {
      prompt = "Generate a short, unique, and deeply gentle motivational quote. It should feel like a warm hug and avoid generic clichés. Focus on themes of peace, resilience, or self-compassion. Maximum 20 words.";
    } else if (type === 'compliment') {
      prompt = "Generate a short, natural, and sincere compliment for a user. It should feel personal and warm, focusing on their inner light, presence, or kindness. Maximum 15 words.";
    } else if (type === 'goal_completion') {
      prompt = `Encourage a user who finished: "${goalContext}". Sincere, soft celebratory tone. Maximum 15 words.`;
    } else if (type === 'daily') {
      prompt = "Generate a profound, poetic 'Quote of the Day'. Unique and centering. Maximum 25 words.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            author: { type: Type.STRING }
          },
          required: ["text"]
        }
      }
    });

    const rawText = response.text || "{}";
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanJson);
    
    return {
      text: result.text || fallback.text,
      type: type,
      author: result.author || (type === 'quote' || type === 'daily' ? 'Anonymous' : undefined)
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return fallback;
  }
};
