import type { NutrientBreakdown } from "./types";

const CATEGORIES = [
  "carbohidratos",
  "proteinas",
  "grasas",
  "otrosNutrientes",
] as const;

// RF-07c: normaliza el desglose a 4 porcentajes enteros cuya suma sea exactamente 100,
// usando el método del resto mayor (largest remainder) para minimizar el error de redondeo.
export function normalizeBreakdown(raw: NutrientBreakdown): NutrientBreakdown {
  const values = CATEGORIES.map((category) => Math.max(0, raw[category]));
  const total = values.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return { carbohidratos: 0, proteinas: 0, grasas: 0, otrosNutrientes: 100 };
  }

  const exact = values.map((value) => (value / total) * 100);
  const floors = exact.map(Math.floor);
  const remainders = exact.map((value, index) => value - floors[index]);

  const distributionOrder = remainders
    .map((remainder, index) => ({ index, remainder }))
    .sort((a, b) => b.remainder - a.remainder)
    .map((entry) => entry.index);

  const pointsToDistribute = 100 - floors.reduce((sum, value) => sum + value, 0);
  const result = [...floors];
  for (let i = 0; i < pointsToDistribute; i++) {
    result[distributionOrder[i]] += 1;
  }

  // Salvaguarda ante imprecisión de punto flotante: garantiza que la suma dé exactamente 100.
  const diff = 100 - result.reduce((sum, value) => sum + value, 0);
  if (diff !== 0) {
    const maxIndex = result.indexOf(Math.max(...result));
    result[maxIndex] += diff;
  }

  const [carbohidratos, proteinas, grasas, otrosNutrientes] = result;
  return { carbohidratos, proteinas, grasas, otrosNutrientes };
}
