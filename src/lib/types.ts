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
