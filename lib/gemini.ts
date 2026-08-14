import { GoogleGenAI, ThinkingLevel, Type, type Schema } from "@google/genai";
import { normalizeBreakdown } from "./breakdown";
import type { AnalyzeResult } from "./types";

export type { NutrientBreakdown, AnalyzeResult } from "./types";

const MODEL = "gemini-3.1-flash-lite";

// RNF-04: el procesamiento de la imagen no debe exceder los 30s.
const TIMEOUT_MS = 30_000;

const PROMPT = `Sos un asistente nutricional. Analizá la imagen de un plato de comida y devolvé, en español:
- Una descripción de los alimentos identificados, corta y directa (no narrada), del estilo "Plato principal (variante) con acompañamiento (detalle)". Si hay una bebida en la imagen, mencionala también, con el mismo estilo breve. Evitá frases especulativas largas como "que parece ser..." o "dado el tono y la textura"; si hay ambigüedad, resolvela entre paréntesis con 2-3 palabras como máximo.
  Ejemplo de estilo esperado: "Un plato de pastas (penne rigate) con salsa cremosa (cuatro quesos o queso azul)".
- La cantidad total de calorías estimadas para todo lo que se ve en la imagen.
- Un desglose de esas calorías en 4 categorías: carbohidratos, proteínas, grasas y otros nutrientes (como porcentajes aproximados del total).
- Un puntaje de confianza entre 0 y 1 que refleje qué tan seguro estás de la estimación (1 = muy seguro).`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    calories: { type: Type.NUMBER },
    confidence: { type: Type.NUMBER },
    breakdown: {
      type: Type.OBJECT,
      properties: {
        carbohidratos: { type: Type.NUMBER },
        proteinas: { type: Type.NUMBER },
        grasas: { type: Type.NUMBER },
        otrosNutrientes: { type: Type.NUMBER },
      },
      required: ["carbohidratos", "proteinas", "grasas", "otrosNutrientes"],
    },
  },
  required: ["description", "calories", "confidence", "breakdown"],
};

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY no está configurada.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// RNF-07: imageBytes vive solo en memoria durante la llamada, nunca se escribe a disco.
export async function analyzeImage(
  imageBytes: Buffer,
  mimeType: string,
): Promise<AnalyzeResult> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          { inlineData: { data: imageBytes.toString("base64"), mimeType } },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      abortSignal: AbortSignal.timeout(TIMEOUT_MS),
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("El modelo de visión no devolvió una respuesta.");
  }

  const result = parseAnalyzeResponse(text);
  return { ...result, breakdown: normalizeBreakdown(result.breakdown) };
}

export function parseAnalyzeResponse(text: string): AnalyzeResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("La respuesta del modelo de visión no es JSON válido.");
  }

  if (typeof raw !== "object" || raw === null) {
    throw new Error(
      "La respuesta del modelo de visión tiene un formato inesperado.",
    );
  }

  const { description, calories, confidence, breakdown } = raw as Record<
    string,
    unknown
  >;

  if (
    typeof description !== "string" ||
    typeof calories !== "number" ||
    typeof confidence !== "number" ||
    typeof breakdown !== "object" ||
    breakdown === null
  ) {
    throw new Error(
      "La respuesta del modelo de visión tiene un formato inesperado.",
    );
  }

  const { carbohidratos, proteinas, grasas, otrosNutrientes } =
    breakdown as Record<string, unknown>;

  if (
    typeof carbohidratos !== "number" ||
    typeof proteinas !== "number" ||
    typeof grasas !== "number" ||
    typeof otrosNutrientes !== "number"
  ) {
    throw new Error(
      "El desglose nutricional de la respuesta tiene un formato inesperado.",
    );
  }

  return {
    description,
    calories,
    confidence,
    breakdown: { carbohidratos, proteinas, grasas, otrosNutrientes },
  };
}
