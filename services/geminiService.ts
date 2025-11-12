import { GoogleGenAI, Type } from "@google/genai";
import { BaseHealthPlan } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Updated prompt to instruct the AI to detect and respond in the user's language (English, Hindi, Hinglish).
const healthPlanPrompt = (query: string) => `First, detect the language of the user's query: "${query}". The language could be English, Hindi, or Hinglish. Then, generate a comprehensive and actionable health plan in that same language. For each exercise, provide its name, description, duration or sets, and a type from one of the following categories: 'Cardio', 'Strength', 'Flexibility'.`;

// FIX: Added responseSchema for robust JSON generation.
const healthPlanSchema = {
    type: Type.OBJECT,
    properties: {
        advice: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        dietPlan: {
            type: Type.OBJECT,
            properties: {
                breakfast: { type: Type.ARRAY, items: { type: Type.STRING } },
                lunch: { type: Type.ARRAY, items: { type: Type.STRING } },
                dinner: { type: Type.ARRAY, items: { type: Type.STRING } },
                snacks: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['breakfast', 'lunch', 'dinner']
        },
        exercisePlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    sets: { type: Type.STRING },
                },
                required: ['name', 'description', 'type']
            }
        }
    },
    required: ['advice', 'dietPlan', 'exercisePlan']
};

const quickTipPrompt = (query: string) => `
First, detect the language of the user's health query: "${query}" (it could be English, Hindi, or Hinglish). Then, provide a single, short, and actionable health tip in that same language.
Keep it concise, under 30 words. This is for a fast, low-latency response.
`;


export const getHealthPlan = async (query: string) => {
    try {
        // FIX: Replaced googleSearch tool with responseSchema to ensure reliable JSON output, as per API guidelines.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: healthPlanPrompt(query),
            config: {
                responseMimeType: "application/json",
                responseSchema: healthPlanSchema,
            },
        });

        const plan: BaseHealthPlan = JSON.parse(response.text);

        // Sources are not available when not using the googleSearch tool.
        const sources: [] = [];

        return { plan, sources };
    } catch (error) {
        console.error("Error generating health plan:", error);
        throw new Error("Failed to generate a detailed health plan. The AI model could not return a valid plan for your query. Please try rephrasing it.");
    }
};

export const getQuickTip = async (query: string) => {
    try {
        const response = await ai.models.generateContent({
            // FIX: Corrected model name from 'gemini-2.5-flash-lite' to the correct alias 'gemini-flash-lite-latest'.
            model: "gemini-flash-lite-latest",
            contents: quickTipPrompt(query),
        });
        return response.text;
    } catch (error) {
        console.error("Error generating quick tip:", error);
        throw new Error("Failed to generate a quick tip.");
    }
};