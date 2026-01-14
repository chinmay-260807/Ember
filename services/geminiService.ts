import { GoogleGenAI, Type } from "@google/genai";
import { GentleMessage, MessageType } from "../types";

export const fetchGentleMessage = async (type: MessageType, goalContext?: string): Promise<GentleMessage> => {
  // Always use a named parameter and direct process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  try {
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

    // Extract text directly from the response object's .text property.
    const result = JSON.parse(response.text || '{}');
    return {
      text: result.text || "A beautiful step forward.",
      type: type,
      author: result.author || (type === 'quote' || type === 'daily' ? 'Anonymous' : undefined)
    };
  } catch (error) {
    console.error("Error fetching message:", error);
    return {
      text: "Take a deep breath. You're doing just fine.",
      type: 'quote',
      author: 'Ember'
    };
  }
};