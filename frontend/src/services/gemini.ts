import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '@/types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const chatWithGemini = async (
  prompt: string,
  history: { role: 'user' | 'model'; content: string }[],
  rubro?: string
) => {
  const model = 'gemini-3-flash-preview';

  const formattedHistory = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.content }],
  }));

  const systemInstruction = `Eres MiLocal Advisor, un consultor experto en expansión comercial y Real Estate Estratégico.
  Tu misión es ayudar a emprendedores a encontrar el local perfecto mediante un sistema de match.
  ${rubro ? `El usuario tiene un negocio de: ${rubro}. Enfoca tus consejos en las necesidades técnicas de este sector (permisos, tráfico, instalaciones).` : ''}
  Evalúa factores como: visibilidad, flujo peatonal, compatibilidad de patentes comerciales y ROI.
  Si preguntan por zonas específicas, usa Google Search para dar datos actualizados de barrios comerciales en Latam.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: prompt }] },
    ],
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || 'No pude analizar la viabilidad comercial en este momento.',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
  };
};
