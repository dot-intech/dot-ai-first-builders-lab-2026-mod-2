export type NutrientBreakdown = {
  carbohidratos: number;
  proteinas: number;
  grasas: number;
  otrosNutrientes: number;
};

export type AnalyzeResult = {
  description: string;
  calories: number;
  confidence: number;
  breakdown: NutrientBreakdown;
};
