import type { Goal, UserProfile, NutritionResult, PortionResult, GoalInfo, Mission } from "./types";
import {
  BMR,
  CALORIES_PER_GRAM,
  PORTION_SIZES,
  WATER,
  CALORIE_ADJUSTMENTS,
  MACRO_RATIOS,
  GOAL_INFO,
} from "./constants";

export function calculateBMR(
  sex: string,
  weight: number,
  height: number,
  age: number,
): number {
  const base =
    BMR.WEIGHT_COEFFICIENT * weight +
    BMR.HEIGHT_COEFFICIENT * height -
    BMR.AGE_COEFFICIENT * age;
  return sex === "male" ? base + BMR.MALE_OFFSET : base + BMR.FEMALE_OFFSET;
}

export function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

export function calculateNutrition(profile: UserProfile): NutritionResult {
  const bmr = calculateBMR(
    profile.sex,
    profile.weight,
    profile.height,
    profile.age,
  );
  const tdee = calculateTDEE(bmr, profile.activity);
  const targetKcal = tdee + CALORIE_ADJUSTMENTS[profile.goal];
  const ratios = MACRO_RATIOS[profile.goal];

  return {
    targetKcal: Math.round(targetKcal),
    proteinGrams: Math.round(
      (targetKcal * ratios.protein) / CALORIES_PER_GRAM.PROTEIN,
    ),
    fatGrams: Math.round((targetKcal * ratios.fat) / CALORIES_PER_GRAM.FAT),
    carbGrams: Math.round(
      (targetKcal * ratios.carbs) / CALORIES_PER_GRAM.CARBS,
    ),
    saturatedFatGrams: Math.round(
      (targetKcal * ratios.saturatedFat) / CALORIES_PER_GRAM.FAT,
    ),
  };
}

export function calculatePortions(
  nutrition: NutritionResult,
  weightKg: number,
): PortionResult {
  return {
    proteinPortions: Math.round(
      nutrition.proteinGrams / PORTION_SIZES.PROTEIN_PER_PALM,
    ),
    carbPortions: Math.round(
      nutrition.carbGrams / PORTION_SIZES.CARBS_PER_FIST,
    ),
    fatPortions: Math.round(nutrition.fatGrams / PORTION_SIZES.FAT_PER_THUMB),
    waterCups: Math.max(
      WATER.MINIMUM_CUPS,
      Math.round((weightKg * WATER.ML_PER_KG * 1000) / WATER.ML_PER_CUP),
    ),
  };
}

/**
 * Returns structured goal info data (not HTML).
 * The React component will decide how to render this.
 */
export function getGoalInfo(goal: Goal): GoalInfo {
  return GOAL_INFO[goal] ?? GOAL_INFO.maintain;
}

/**
 * Returns an array of extra mission objects for specific goals.
 * Sugar and cholesterol goals have bonus missions; others return empty array.
 */
export function getGoalExtraMissions(goal: Goal): Mission[] {
  if (goal === "sugar") {
    return [
      {
        icon: "🚫",
        ariaLabel: "No sugary drinks",
        title: "No sugary drinks",
        description: "0g added sugar from beverages.",
      },
    ];
  }

  if (goal === "cholesterol") {
    return [
      {
        icon: "🐟",
        ariaLabel: "Oily fish",
        title: "Eat Oily Fish x2/week",
        description: "Salmon/Mackerel for Omega-3.",
      },
    ];
  }

  return [];
}
