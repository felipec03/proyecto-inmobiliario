
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialization with named parameter and process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithGemini = async (prompt: string, history: { role: 'user' | 'model', content: string }[], rubro?: string) => {
  const model = 'gemini-3-flash-preview';
  
  const formattedHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  const systemInstruction = `Eres MiLocal Advisor, un consultor experto en expansión comercial y Real Estate Estratégico. 
  Tu misión es ayudar a emprendedores a encontrar el local perfecto mediante un sistema de match. 
  ${rubro ? `El usuario tiene un negocio de: ${rubro}. Enfoca tus consejos en las necesidades técnicas de este sector (permisos, tráfico, instalaciones).` : ''}
  Evalúa factores como: visibilidad, flujo peatonal, compatibilidad de patentes comerciales y ROI.
  Si preguntan por zonas específicas, usa Google Search para dar datos actualizados de barrios comerciales en Latam.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "No pude analizar la viabilidad comercial en este momento.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
  };
};

export const analyzeLocalPotential = async (base64Image: string, rubro: string) => {
  // Use 'gemini-3-flash-preview' for vision-to-text analysis as it is optimized for multimodal Q&A tasks.
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Analiza este local comercial para un negocio de ${rubro}. 
        ¿Qué potencial ves en la fachada o el interior? 
        Identifica si tiene visibilidad, espacio para letreros, y si parece apto técnicamente. 
        Responde de forma ejecutiva y motivadora enfocándote en MiLocal Analysis.` }
      ]
    }
  });

  return response.text;
};

export const getCommercialMarketTrends = async (city: string) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: `Analiza las tendencias de REAL ESTATE COMERCIAL en ${city} para la plataforma MiLocal. 
    Datos de vacancia, precio por m2 en locales y zonas de mayor crecimiento para emprendimientos. 
    Usa Google Search para datos 2024-2025.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING },
          avgPriceSqm: { type: Type.NUMBER },
          demandLevel: { type: Type.STRING },
          summary: { type: Type.STRING },
          trends: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                growth: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["city", "avgPriceSqm", "demandLevel", "summary", "trends"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
