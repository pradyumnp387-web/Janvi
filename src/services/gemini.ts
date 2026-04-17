import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StoryPart {
  partNumber: number;
  script: string;
  imagePrompt: string;
  caption: string;
  hashtags: string[];
}

export async function generateSeriesPlan(prompt: string, totalParts: number = 10): Promise<{ title: string; description: string; parts: StoryPart[] }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a multi-part story series based on this prompt: "${prompt}". 
    Create ${totalParts} parts. Each part should have a script, an image prompt for AI generation, a social media caption, and hashtags.
    Return the result as a JSON object with title, description, and an array of parts.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          parts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                partNumber: { type: Type.NUMBER },
                script: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                caption: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["partNumber", "script", "imagePrompt", "caption", "hashtags"]
            }
          }
        },
        required: ["title", "description", "parts"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
