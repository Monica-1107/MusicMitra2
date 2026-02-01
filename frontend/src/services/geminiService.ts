import { GoogleGenAI, Type } from "@google/genai";
import { LyricsResponse } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateLyrics = async (audioFile: File): Promise<LyricsResponse> => {
  const apiKey = "AIzaSyBNHxK9kMz3hyejRwyzZHXbLKYWHSLkZSQ"
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare the file data
  const audioPart = await fileToGenerativePart(audioFile);

  const prompt = `
    You are an expert lyrical transcriber and translator specializing in Telugu music.
    
    Task:
    1. Listen to the provided audio file carefully.
    2. Identify if the song is primarily in Telugu.
    3. If it is NOT Telugu, set 'isTelugu' to false.
    4. If it IS Telugu, segment the song line-by-line or phrase-by-phrase to create synchronized lyrics.
    5. For EACH segment, provide:
       - 'timestamp': The approximate start time of the line in "MM:SS" format (e.g., "00:15").
       - 'telugu': The lyrics in standard Telugu script.
       - 'transliteration': The English transliteration so a non-native speaker can pronounce it.
       - 'translation': The semantic English meaning of the line.
    6. Extract metadata (Title, Artist, Album) if recognizable.
    
    Ensure the timestamps are chronological and cover the duration of the song clip provided.
    
    Return the output STRICTLY as JSON matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          audioPart,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the song" },
                artist: { type: Type.STRING, description: "Singer or Composer" },
                album: { type: Type.STRING, description: "Movie or Album name" },
                isTelugu: { type: Type.BOOLEAN, description: "True if the song is identified as Telugu" },
                message: { type: Type.STRING, description: "Error message if not Telugu or other notes" }
              },
              required: ["title", "artist", "isTelugu"],
            },
            lyrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  telugu: { type: Type.STRING, description: "Lyrics in Telugu script" },
                  transliteration: { type: Type.STRING, description: "English transliteration/pronunciation" },
                  translation: { type: Type.STRING, description: "English semantic meaning" },
                  timestamp: { type: Type.STRING, description: "Start time of the line in MM:SS format" }
                },
                required: ["telugu", "transliteration", "translation", "timestamp"]
              }
            }
          },
          required: ["metadata", "lyrics"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response generated from model.");
    }

    const result = JSON.parse(response.text) as LyricsResponse;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process audio. Please try again with a clear audio file.");
  }
};