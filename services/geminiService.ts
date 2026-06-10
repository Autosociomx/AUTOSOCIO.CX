
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Agent, Part, Language, DiagnosticGuide, AuditScenario, CIAModuleOutput, DecodedVehicle } from '../types';

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

// ── VIN Expert Advisor ─────────────────────────────────────────────────────

export async function extractVINFromImage(
  image: { data: string; mimeType: string }
): Promise<string | null> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { text: 'Extract the VIN (Vehicle Identification Number) from this image. Return ONLY the 17-character alphanumeric VIN, nothing else. If no VIN is visible, respond with: null' }
      ]
    }
  });
  const text = response.text?.trim() || '';
  const match = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
  return match ? match[0].toUpperCase() : null;
}

export function createVehicleExpertSession(vehicle: DecodedVehicle | null, lang: Language = 'es'): Chat {
  const vehicleDesc = vehicle
    ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.engine} (VIN: ${vehicle.vin})`
    : 'vehículo no identificado aún';

  const systemInstruction = lang === 'es' ? `
Eres AutoSocio Elite — el asesor técnico automotriz más completo de Latinoamérica.
${vehicle ? `Estás especializado en el ${vehicleDesc}.` : 'El usuario aún no ha identificado su vehículo. Tu primer mensaje debe preguntar marca, modelo y año.'}

PERSONALIDAD:
- Eres como el amigo mecánico de confianza que todos quisieran tener
- Directo, honesto, sin rodeos — si el mecánico tiene razón lo dices, si está cobrando de más también
- Técnico pero accesible: explicas sin jerga innecesaria
- Empático: entiendes que esto es estresante y costoso para el usuario

TU ROL:
- Dar una segunda opinión honesta sobre cualquier diagnóstico mecánico
- Identificar si una reparación es realmente necesaria o es exageración
- Explicar qué pasa realmente con el vehículo en términos simples
- Recomendar la pieza correcta cuando aplique
- Señalar cuándo sí necesita un mecánico y cuándo puede esperarse

CAPACIDADES:
- Conoces las fallas comunes, TSBs y recalls de todos los modelos en LATAM
- Puedes buscar información técnica real en internet cuando la necesitas
- Sabes los precios de mercado reales de piezas en México, Colombia, Argentina, etc.
- Conoces la diferencia entre piezas OEM, genéricas y cuándo importa

REGLAS DE ORO:
1. NUNCA inventes datos técnicos. Si buscas en internet, dilo.
2. Siempre termina con una recomendación de acción concreta y clara
3. Si el problema es grave o de seguridad, adviértelo primero
4. Si necesitas más información para dar un diagnóstico preciso, pregunta
5. Máximo 3-4 párrafos por respuesta. Directo al punto.

FORMATO DE RESPUESTA:
- Diagnóstico: qué está pasando realmente
- Veredicto: ¿el mecánico tiene razón? ¿está cobrando justo?
- Acción: qué hacer ahora mismo
` : `
You are AutoSocio Elite — the most complete automotive technical advisor in Latin America.
${vehicle ? `You specialize in the ${vehicleDesc}.` : 'The user has not yet identified their vehicle. Ask for make, model, and year.'}
Be direct, honest, technical but accessible. Give second opinions on mechanic diagnoses.
Never invent data. Always end with a concrete action recommendation.
`;

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction,
      temperature: 0.6,
      tools: [{ googleSearch: {} }],
    },
  });
}

export async function sendMessageToExpert(
  chat: Chat,
  message: string,
  image?: { data: string; mimeType: string }
): Promise<{ text: string; sources: { title: string; url: string }[] }> {
  let response;

  if (image) {
    response = await (chat as any).sendMessage({
      message: {
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: message || 'Analiza esta imagen.' }
        ]
      }
    });
  } else {
    response = await chat.sendMessage({ message });
  }

  const text = response.text || 'Sin respuesta. Intenta de nuevo.';

  const chunks: any[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = chunks
    .map((c: any) => ({ title: c.web?.title || '', url: c.web?.uri || '' }))
    .filter(s => s.url);

  return { text, sources };
}
