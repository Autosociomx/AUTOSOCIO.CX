
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Agent, Part, Language, DiagnosticGuide, AuditScenario, CIAModuleOutput } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getConstitution = (lang: Language = 'es') => {
  const instructions: Record<Language, string> = {
    es: `ACTÚAS COMO UN INGENIERO DE PLANTA Y AUDITOR TÉCNICO DE ÉLITE. Creado por Miguel Alexis Pérez Aguilar. Tono: Profesional, Técnico, Preciso, Industrial. REGLA: Nunca inventes datos, usa lógica mecánica real.`,
    en: `YOU ACT AS A PLANT ENGINEER AND ELITE TECHNICAL AUDITOR. Created by Miguel Alexis Pérez Aguilar. Tone: Professional, Technical, Precise, Industrial. RULE: Never invent data, use real mechanical logic.`,
    pt: `VOCÊ AGE COMO UM ENGENHEIRO DE PLANTA E AUDITOR TÉCNICO DE ELITE. Tom: Profissional, Técnico, Preciso, Industrial.`,
    fr: `VOUS AGISSEZ EN TANT QU'INGÉNIEUR D'USINE ET AUDITEUR TECHNIQUE D'ÉLITE.`,
    de: `SIE AGIEREN ALS WERKSINGENIEUR UND TECHNISCHER PRÜFER DER ELITE.`,
    zh: `您是资深工厂工程师和技术审核员。`,
    ja: `あなたはプラントエンジニアおよびエリート技術監査人として行動します。`
  };

  const base = instructions[lang] || instructions.es;
  
  return `
${base}
CONECTAX ENGINE ACTIVE:
- Auditoría Forense Industrial.
- Protocolo "Cero Alucinaciones".
`;
};

const chatSessions = new Map<string, Chat>();

export async function getChatSession(agentId: number, systemInstruction: string, lang: Language = 'es'): Promise<Chat> {
  const sessionId = `agent-${agentId}-${lang}`;
  if (!chatSessions.has(sessionId)) {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `${getConstitution(lang)}\nEJECUTANDO COMO: ${systemInstruction}`,
        temperature: 0.7,
      },
    });
    chatSessions.set(sessionId, chat);
  }
  return chatSessions.get(sessionId)!;
}

export async function sendMessageToAgent(
  agent: Agent,
  message: string,
  lang: Language = 'es',
  image: { data: string; mimeType: string } | null = null
): Promise<string> {
  if (image) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: message || "Analiza esta imagen." }
        ]
      },
      config: {
        systemInstruction: `${getConstitution(lang)}\nEJECUTANDO COMO: ${agent.prompt}`,
      }
    });
    return response.text || "Sin respuesta.";
  }

  const chat = await getChatSession(agent.id, agent.prompt, lang);
  const response = await chat.sendMessage({ message: message || "Iniciando." });
  return response.text || "Sin respuesta.";
}

export async function analyzeIntent(query: string, lang: Language = 'es'): Promise<AuditScenario> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `INTENCIÓN: "${query}"`,
    config: {
      systemInstruction: "Determina EDUCATION, MONETIZATION o CREATOR_API.",
    }
  });
  const text = response.text?.trim().toUpperCase() || 'MONETIZATION';
  if (text.includes('EDUCATION')) return 'EDUCATION';
  if (text.includes('CREATOR')) return 'CREATOR_API';
  return 'MONETIZATION';
}

export async function generateDiagnosticGuide(
  adn: string,
  scenario: AuditScenario,
  lang: Language = 'es'
): Promise<DiagnosticGuide> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `AUDITORÍA ADN: ${adn}. Region: ${lang.toUpperCase()}.`,
    config: {
      systemInstruction: `${getConstitution(lang)}
      GENERA:
      1. SÍNTOMAS: 4 puntos críticos.
      2. UBICACIÓN: Donde está la pieza.
      3. NUTRI TAQUITA: "Información Nutrimental" técnica de la pieza (Calories/Fiber/Purity/ROI).
      4. PASOS: Protocolo profesional.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          locationDescription: { type: Type.STRING },
          failureAnalysis: { type: Type.STRING },
          symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          diagnosticSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          toolsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedPartKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          nutriTaquita: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.STRING, description: 'Potencial energético de la reparación' },
              technicalFiber: { type: Type.STRING, description: 'Resistencia mecánica' },
              purity: { type: Type.STRING, description: 'Nivel de compatibilidad OEM' },
              roiVitamin: { type: Type.STRING, description: 'Impacto en rentabilidad' }
            }
          }
        },
        required: ['title', 'locationDescription', 'failureAnalysis', 'symptoms', 'diagnosticSteps', 'toolsRequired', 'recommendedPartKeywords', 'nutriTaquita']
      },
    },
  });
  return { ...JSON.parse(response.text || '{}'), scenario };
}

export async function identifyPartKeywords(
  searchTerm: string,
  uploadedImage: { data: string; mimeType: string; } | null,
  lang: Language = 'es'
): Promise<string[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [
      ...(uploadedImage ? [{ inlineData: { mimeType: uploadedImage.mimeType, data: uploadedImage.data } }] : []),
      { text: `Sourcing: ${searchTerm}` }
    ]},
    config: {
      systemInstruction: getConstitution(lang),
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: { keywords: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ['keywords']
      },
    },
  });
  return JSON.parse(response.text || '{"keywords":[]}').keywords;
}

export async function getEnhancedPartRecommendations(
    searchTerm: string,
    candidateParts: Part[],
    lang: Language = 'es'
): Promise<any[]> {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `COMPATIBILIDAD CONECTAX: ${searchTerm}. Candidatas: ${JSON.stringify(candidateParts)}.`,
        config: {
            systemInstruction: getConstitution(lang),
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        partId: { type: Type.STRING },
                        recommendation: { type: Type.STRING },
                        viabilityScore: { type: Type.NUMBER },
                        isMostRecommended: { type: Type.BOOLEAN },
                    },
                    required: ['partId', 'recommendation', 'viabilityScore', 'isMostRecommended'],
                },
            },
        },
    });
    return JSON.parse(response.text || '[]');
}
