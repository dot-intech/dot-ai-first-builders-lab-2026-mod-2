import { describe, expect, it } from "vitest";
import { normalizeBreakdown } from "./breakdown";
import type { NutrientBreakdown } from "./types";

function sum(b: NutrientBreakdown): number {
  return b.carbohidratos + b.proteinas + b.grasas + b.otrosNutrientes;
}

describe("normalizeBreakdown", () => {
  it("deja igual un desglose que ya suma 100", () => {
    const result = normalizeBreakdown({
      carbohidratos: 40,
      proteinas: 35,
      grasas: 20,
      otrosNutrientes: 5,
    });
    expect(result).toEqual({
      carbohidratos: 40,
      proteinas: 35,
      grasas: 20,
      otrosNutrientes: 5,
    });
  });

  it("reparte el resto de un empate a tercios usando el resto mayor", () => {
    const result = normalizeBreakdown({
      carbohidratos: 33.333,
      proteinas: 33.333,
      grasas: 33.333,
      otrosNutrientes: 0,
    });
    expect(sum(result)).toBe(100);
    expect(result).toEqual({
      carbohidratos: 34,
      proteinas: 33,
      grasas: 33,
      otrosNutrientes: 0,
    });
  });

  it("cuando todo es cero, asigna el 100% a otros nutrientes en vez de dividir por cero", () => {
    const result = normalizeBreakdown({
      carbohidratos: 0,
      proteinas: 0,
      grasas: 0,
      otrosNutrientes: 0,
    });
    expect(result).toEqual({
      carbohidratos: 0,
      proteinas: 0,
      grasas: 0,
      otrosNutrientes: 100,
    });
  });

  it("clampea valores negativos a cero antes de prorratear", () => {
    const result = normalizeBreakdown({
      carbohidratos: -5,
      proteinas: 50,
      grasas: 50,
      otrosNutrientes: 5,
    });
    expect(sum(result)).toBe(100);
    expect(result.carbohidratos).toBe(0);
  });

  it("es invariante a la escala: fracciones que suman 1 dan el mismo resultado que porcentajes que suman 100", () => {
    const result = normalizeBreakdown({
      carbohidratos: 0.4,
      proteinas: 0.35,
      grasas: 0.2,
      otrosNutrientes: 0.05,
    });
    expect(result).toEqual({
      carbohidratos: 40,
      proteinas: 35,
      grasas: 20,
      otrosNutrientes: 5,
    });
  });

  it("resuelve un empate a 4 partes iguales", () => {
    const result = normalizeBreakdown({
      carbohidratos: 1,
      proteinas: 1,
      grasas: 1,
      otrosNutrientes: 1,
    });
    expect(result).toEqual({
      carbohidratos: 25,
      proteinas: 25,
      grasas: 25,
      otrosNutrientes: 25,
    });
  });

  it("siempre suma exactamente 100 con valores decimales arbitrarios", () => {
    const samples: NutrientBreakdown[] = [
      { carbohidratos: 12.5, proteinas: 12.5, grasas: 12.5, otrosNutrientes: 12.5 },
      { carbohidratos: 100, proteinas: 0, grasas: 0, otrosNutrientes: 0 },
      { carbohidratos: 1, proteinas: 2, grasas: 3, otrosNutrientes: 94 },
      { carbohidratos: 17.7, proteinas: 33.3, grasas: 12.1, otrosNutrientes: 36.9 },
      { carbohidratos: 0.1, proteinas: 0.1, grasas: 0.1, otrosNutrientes: 0.1 },
    ];

    for (const sample of samples) {
      const result = normalizeBreakdown(sample);
      expect(sum(result)).toBe(100);
      expect(result.carbohidratos).toBeGreaterThanOrEqual(0);
      expect(result.proteinas).toBeGreaterThanOrEqual(0);
      expect(result.grasas).toBeGreaterThanOrEqual(0);
      expect(result.otrosNutrientes).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result.carbohidratos)).toBe(true);
      expect(Number.isInteger(result.proteinas)).toBe(true);
      expect(Number.isInteger(result.grasas)).toBe(true);
      expect(Number.isInteger(result.otrosNutrientes)).toBe(true);
    }
  });
});
