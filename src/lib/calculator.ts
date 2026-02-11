import type { Goal, UserProfile, NutritionResult, PortionResult } from "./types";
import {
  BMR,
  CALORIES_PER_GRAM,
  PORTION_SIZES,
  WATER,
  CALORIE_ADJUSTMENTS,
  MACRO_RATIOS,
  GOAL_INFO_HTML,
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

export function getGoalInfoHtml(goal: Goal): string {
  return GOAL_INFO_HTML[goal] ?? GOAL_INFO_HTML.maintain;
}

export function getGoalExtraMissionsHtml(goal: Goal): string {
  if (goal === "sugar") {
    return `
      <div class="mission-card mission-sugar">
        <div class="mission-icon" role="img" aria-label="No sugary drinks">🚫</div>
        <div class="mission-details">
          <h4>No sugary drinks</h4>
          <p>0g added sugar from beverages.</p>
        </div>
      </div>
    `;
  }

  if (goal === "cholesterol") {
    return `
       <div class="mission-card" style="border-color: var(--accent);">
        <div class="mission-icon" role="img" aria-label="Oily fish">🐟</div>
        <div class="mission-details">
          <h4>Eat Oily Fish x2/week</h4>
          <p>Salmon/Mackerel for Omega-3.</p>
        </div>
      </div>
    `;
  }

  return "";
}
