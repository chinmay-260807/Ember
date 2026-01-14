import { GoogleGenAI, Type } from "@google/genai";
import { GentleMessage, MessageType } from "../types";

export const fetchGentleMessage = async (type: MessageType, goalContext?: string, entropy?: string): Promise<GentleMessage> => {
  // Move fallbacks inside the function to avoid module-scope static data
  const localFallbacks: string[] = [
    "The stars are quiet today, but they are still there. Take a gentle breath.",
    "You are doing enough, simply by being here in this moment.",
    "Softly, let the day's weight drift away. You are safe here.",
    "Even the moon has phases; it is okay not to be at your peak today.",
    "There is beauty in your quiet resilience. Rest your heart."
  ];

  const getFallback = (): GentleMessage => ({
    text: localFallbacks[Math.floor(Math.random() * localFallbacks.length)],
    type: 'quote',
    author: 'Ember'
  });

  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API Key is missing. Using dynamic local fallback.");
    return getFallback();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    let prompt = "";
    // Incorporate entropy/theme to ensure model variation
    const variation = entropy ? ` Focus theme: ${entropy}.` : "";

    if (type === 'quote') {
      prompt = `Generate a short, unique, and deeply gentle motivational quote.${variation} It should feel like a warm hug and avoid generic clichés. Focus on themes of peace, resilience, or self-compassion. Maximum 20 words.`;
    } else if (type === 'compliment') {
      prompt = `Generate a short, natural, and sincere compliment for a user.${variation} It should feel personal and warm, focusing on their inner light, presence, or kindness. Maximum 15 words.`;
    } else if (type === 'goal_completion') {
      prompt = `Encourage a user who finished: "${goalContext}". Sincere, soft celebratory tone. Maximum 15 words.`;
    } else if (type === 'daily') {
      prompt = `Generate a profound, poetic 'Quote of the Day'.${variation} Unique and centering. Maximum 25 words.`;
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

    const result = JSON.parse(response.text || "{}");
    
    return {
      text: result.text || getFallback().text,
      type: type,
      author: result.author || (type === 'quote' || type === 'daily' ? 'Anonymous' : undefined)
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return getFallback();
  }
};