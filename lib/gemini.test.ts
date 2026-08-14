import { describe, expect, it } from "vitest";
import { parseAnalyzeResponse } from "./gemini";

const VALID_RESPONSE = {
  description: "Milanesa con puré (napolitana)",
  calories: 650,
  confidence: 0.82,
  breakdown: {
    carbohidratos: 40,
    proteinas: 35,
    grasas: 20,
    otrosNutrientes: 5,
  },
};

describe("parseAnalyzeResponse", () => {
  it("parsea una respuesta válida del modelo", () => {
    const result = parseAnalyzeResponse(JSON.stringify(VALID_RESPONSE));
    expect(result).toEqual(VALID_RESPONSE);
  });

  it("rechaza texto que no es JSON", () => {
    expect(() => parseAnalyzeResponse("esto no es json")).toThrow();
  });

  it("rechaza JSON válido que no es un objeto (array)", () => {
    expect(() => parseAnalyzeResponse("[1, 2, 3]")).toThrow();
  });

  it("rechaza JSON válido que no es un objeto (null)", () => {
    expect(() => parseAnalyzeResponse("null")).toThrow();
  });

  it("rechaza cuando falta la descripción", () => {
    const withoutDescription = {
      calories: VALID_RESPONSE.calories,
      confidence: VALID_RESPONSE.confidence,
      breakdown: VALID_RESPONSE.breakdown,
    };
    expect(() =>
      parseAnalyzeResponse(JSON.stringify(withoutDescription)),
    ).toThrow();
  });

  it("rechaza cuando calories no es un número", () => {
    const invalid = { ...VALID_RESPONSE, calories: "650" };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });

  it("rechaza cuando confidence no es un número", () => {
    const invalid = { ...VALID_RESPONSE, confidence: "alta" };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });

  it("rechaza cuando falta el breakdown", () => {
    const withoutBreakdown = {
      description: VALID_RESPONSE.description,
      calories: VALID_RESPONSE.calories,
      confidence: VALID_RESPONSE.confidence,
    };
    expect(() =>
      parseAnalyzeResponse(JSON.stringify(withoutBreakdown)),
    ).toThrow();
  });

  it("rechaza cuando el breakdown tiene un campo con tipo incorrecto", () => {
    const invalid = {
      ...VALID_RESPONSE,
      breakdown: { ...VALID_RESPONSE.breakdown, grasas: "veinte" },
    };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });

  it("rechaza cuando al breakdown le falta un campo requerido", () => {
    const invalid = {
      ...VALID_RESPONSE,
      breakdown: {
        carbohidratos: VALID_RESPONSE.breakdown.carbohidratos,
        proteinas: VALID_RESPONSE.breakdown.proteinas,
        grasas: VALID_RESPONSE.breakdown.grasas,
      },
    };
    expect(() => parseAnalyzeResponse(JSON.stringify(invalid))).toThrow();
  });
});
