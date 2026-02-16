import type { Goal, MacroRatios, FoodItem, GoalInfo } from "./types";

// Mifflin-St Jeor Equation coefficients
export const BMR = {
  WEIGHT_COEFFICIENT: 10,
  HEIGHT_COEFFICIENT: 6.25,
  AGE_COEFFICIENT: 5,
  MALE_OFFSET: 5,
  FEMALE_OFFSET: -161,
} as const;

// Calories per gram of macronutrient
export const CALORIES_PER_GRAM = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
} as const;

// Portion sizes in grams of macro per portion
export const PORTION_SIZES = {
  PROTEIN_PER_PALM: 25,
  CARBS_PER_FIST: 40,
  FAT_PER_THUMB: 12,
} as const;

// Water calculation
export const WATER = {
  ML_PER_KG: 0.033,
  ML_PER_CUP: 250,
  MINIMUM_CUPS: 8,
} as const;

// Calorie adjustments by goal
export const CALORIE_ADJUSTMENTS: Record<Goal, number> = {
  maintain: 0,
  lose: -500,
  gain: 500,
  sugar: -200,
  cholesterol: -200,
  pressure: -200,
};

// Macro ratio distributions by goal
export const MACRO_RATIOS: Record<Goal, MacroRatios> = {
  maintain: { protein: 0.25, fat: 0.25, carbs: 0.5, saturatedFat: 0.1 },
  lose: { protein: 0.25, fat: 0.25, carbs: 0.5, saturatedFat: 0.1 },
  gain: { protein: 0.25, fat: 0.25, carbs: 0.5, saturatedFat: 0.1 },
  sugar: { protein: 0.3, fat: 0.35, carbs: 0.35, saturatedFat: 0.08 },
  cholesterol: { protein: 0.25, fat: 0.25, carbs: 0.5, saturatedFat: 0.06 },
  pressure: { protein: 0.2, fat: 0.3, carbs: 0.5, saturatedFat: 0.07 },
};

// Goal-specific health tips as structured data (not HTML strings).
// React components will decide how to render these.
export const GOAL_INFO: Record<Goal, GoalInfo> = {
  maintain: {
    label: "Wellness Recommendation",
    text: "Drink at least 2L of water daily and aim for 5 servings of vegetables as per UK NHS guidelines.",
  },
  lose: {
    label: "Wellness Recommendation",
    text: "Drink at least 2L of water daily and aim for 5 servings of vegetables as per UK NHS guidelines.",
  },
  gain: {
    label: "Wellness Recommendation",
    text: "Drink at least 2L of water daily and aim for 5 servings of vegetables as per UK NHS guidelines.",
  },
  sugar: {
    label: "Health Tip",
    text: "Focus on Low Glycemic Index (GI) carbs like legumes, oats, and leafy greens. Avoid simple sugars and refined white flour.",
  },
  cholesterol: {
    label: "Heart Health",
    text: "Limit saturated fats (butter, fatty meats) to <6% of total kcal. Increase soluble fiber (beans, apples) to lower LDL.",
  },
  pressure: {
    label: "DASH Principle",
    text: "Prioritize high-potassium foods (bananas, potatoes, spinach) and magnesium. Keep sodium below 1,500mg daily.",
  },
};

// Food data
export const PROTEIN_FOODS: FoodItem[] = [
  { name: "Chicken Breast", amount: "100g raw / 1 small breast" },
  { name: "Tofu / Tempeh", amount: "150g block" },
  { name: "White Fish", amount: "120g raw fillet" },
  { name: "Eggs", amount: "2 large eggs (whole)" },
  { name: "Greek Yogurt", amount: "200g (small tub)" },
  { name: "Lean Beef", amount: "100g raw mince" },
  { name: "Protein Powder", amount: "1 scoop (30g)" },
];

export const CARB_FOODS: FoodItem[] = [
  { name: "Rice (White/Brown)", amount: "40g dry / 120g cooked" },
  { name: "Pasta", amount: "50g dry / 1 cup cooked" },
  { name: "Rolled Oats", amount: "40g dry" },
  { name: "Potato", amount: "1 med. (150g)" },
  { name: "Sweet Potato", amount: "1 med. (150g)" },
  { name: "Bread (Wholegrain)", amount: "2 slices" },
  { name: "Banana", amount: "1 large" },
];

export const FAT_FOODS: FoodItem[] = [
  { name: "Avocado", amount: "1/2 medium" },
  { name: "Nuts (Original)", amount: "20g (small handful)" },
  { name: "Olive Oil", amount: "1 tbsp" },
  { name: "Butter", amount: "10g (pat)" },
  { name: "Chia Seeds", amount: "2 tbsp" },
  { name: "Cheese", amount: "30g (matchbox)" },
  { name: "Peanut Butter", amount: "1 heaped tsp" },
];
