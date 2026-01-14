import { GoogleGenAI, Type } from "@google/genai";
import { GentleMessage, MessageType } from "../types";

export const fetchGentleMessage = async (type: MessageType, goalContext?: string): Promise<GentleMessage> => {
  const apiKey = process.env.API_KEY;
  
  // Fallback content in case of API failure or missing key
  const fallback: GentleMessage = {
    text: "The stars are quiet today, but they are still there. Take a gentle breath.",
    type: 'quote',
    author: 'Ember'
  };

  if (!apiKey) {
    console.warn("API Key is missing. Using fallback content.");
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    if (type === 'quote') {
      prompt = "Generate a short, unique, and deeply gentle motivational quote. It should feel like a warm hug and avoid generic clichés. Focus on themes of peace, resilience, or self-compassion. Maximum 20 words.";
    } else if (type === 'compliment') {
      prompt = "Generate a short, natural, and sincere compliment for a user. It should feel personal and warm, focusing on their inner light, presence, or kindness. No generic 'you are great' stuff. Maximum 15 words.";
    } else if (type === 'goal_completion') {
      prompt = `The user just completed their goal: "${goalContext}". Generate a short, deeply encouraging response that acknowledges their effort with grace and warmth. It should feel like a soft celebratory sigh, not a loud cheer. Maximum 15 words.`;
    } else if (type === 'daily') {
      prompt = "Generate a profound, unique, and deeply curated 'Quote of the Day'. It should be timeless, poetic, and provide a centering thought for the day. Avoid common internet quotes. Maximum 25 words.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "The content of the message.",
            },
            author: {
              type: Type.STRING,
              description: "The author of the quote, if applicable. Leave blank for compliments or goal completions.",
            }
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
    console.error("Error fetching message:", error);
    return fallback;
  }
};