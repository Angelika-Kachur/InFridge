export type Sex = "male" | "female";

export type Goal =
  | "maintain"
  | "lose"
  | "gain"
  | "sugar"
  | "cholesterol"
  | "pressure";

export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

export interface UserProfile {
  sex: Sex;
  age: number;
  weight: number; // kg
  height: number; // cm
  activity: ActivityLevel;
  goal: Goal;
}

export interface MacroRatios {
  protein: number;
  fat: number;
  carbs: number;
  saturatedFat: number;
}

export interface NutritionResult {
  targetKcal: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
  saturatedFatGrams: number;
}

export interface PortionResult {
  proteinPortions: number;
  carbPortions: number;
  fatPortions: number;
  waterCups: number;
}

export interface FoodItem {
  name: string;
  amount: string;
}

/**
 * Structured data for goal-specific health tips.
 * Previously this was raw HTML — now it's data that React components render.
 */
/**
 * BMI result with the numeric value and a human-readable category.
 * BMI = weight(kg) / height(m)^2
 */
export interface BmiResult {
  value: number;         // e.g. 24.5
  category: string;      // e.g. "Normal weight"
  color: string;         // CSS variable name for visual indicator
}

export interface GoalInfo {
  label: string; // e.g. "Wellness Recommendation"
  text: string;  // the actual advice text
}

/**
 * Structured data for a single "mission" card (the daily tasks shown after calculation).
 */
export interface Mission {
  icon: string;       // emoji like "🥩"
  ariaLabel: string;  // accessible label for the emoji
  title: string;      // e.g. "Eat 4 Palms of Protein"
  description: string; // e.g. "~25g each (Chicken breast, Tofu block)"
}
