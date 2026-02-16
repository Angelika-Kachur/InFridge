import { describe, test, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateNutrition,
  calculatePortions,
  calculateBMI,
  getGoalInfo,
  getGoalExtraMissions,
} from "./calculator";
import type { Goal, NutritionResult } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// calculateBMR
// ─────────────────────────────────────────────────────────────────────────────

describe("calculateBMR", () => {
  test("calculates BMR for a 30yo male, 80kg, 180cm", () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calculateBMR("male", 80, 180, 30)).toBe(1780);
  });

  test("calculates BMR for a 30yo female, 80kg, 180cm", () => {
    // 10*80 + 6.25*180 - 5*30 + (-161) = 800 + 1125 - 150 - 161 = 1614
    expect(calculateBMR("female", 80, 180, 30)).toBe(1614);
  });

  test("older age reduces BMR", () => {
    const young = calculateBMR("male", 75, 175, 25);
    const old = calculateBMR("male", 75, 175, 55);
    expect(young).toBeGreaterThan(old);
    // Difference should be 5 * (55-25) = 150
    expect(young - old).toBe(150);
  });

  test("heavier weight increases BMR", () => {
    const light = calculateBMR("male", 60, 175, 30);
    const heavy = calculateBMR("male", 90, 175, 30);
    expect(heavy).toBeGreaterThan(light);
    // Difference should be 10 * (90-60) = 300
    expect(heavy - light).toBe(300);
  });

  test("male BMR is higher than female for same stats", () => {
    const male = calculateBMR("male", 75, 175, 30);
    const female = calculateBMR("female", 75, 175, 30);
    // Difference should be 5 - (-161) = 166
    expect(male - female).toBe(166);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateTDEE
// ─────────────────────────────────────────────────────────────────────────────

describe("calculateTDEE", () => {
  test("sedentary multiplier (1.2)", () => {
    expect(calculateTDEE(1780, 1.2)).toBeCloseTo(2136);
  });

  test("very active multiplier (1.725)", () => {
    expect(calculateTDEE(1780, 1.725)).toBeCloseTo(3070.5);
  });

  test("TDEE is always greater than BMR", () => {
    expect(calculateTDEE(1500, 1.2)).toBeGreaterThan(1500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateNutrition
// ─────────────────────────────────────────────────────────────────────────────

describe("calculateNutrition", () => {
  const baseProfile = {
    sex: "male" as const,
    age: 30,
    weight: 75,
    height: 175,
    activity: 1.55 as const,
    goal: "maintain" as Goal,
  };

  test("returns correct structure with all fields", () => {
    const result = calculateNutrition(baseProfile);
    expect(result).toHaveProperty("targetKcal");
    expect(result).toHaveProperty("proteinGrams");
    expect(result).toHaveProperty("fatGrams");
    expect(result).toHaveProperty("carbGrams");
    expect(result).toHaveProperty("saturatedFatGrams");
  });

  test("all values are positive integers (rounded)", () => {
    const result = calculateNutrition(baseProfile);
    expect(Number.isInteger(result.targetKcal)).toBe(true);
    expect(Number.isInteger(result.proteinGrams)).toBe(true);
    expect(Number.isInteger(result.fatGrams)).toBe(true);
    expect(Number.isInteger(result.carbGrams)).toBe(true);
    expect(Number.isInteger(result.saturatedFatGrams)).toBe(true);
    expect(result.targetKcal).toBeGreaterThan(0);
  });

  test("lose goal reduces calories by 500", () => {
    const maintain = calculateNutrition({ ...baseProfile, goal: "maintain" });
    const lose = calculateNutrition({ ...baseProfile, goal: "lose" });
    expect(maintain.targetKcal - lose.targetKcal).toBe(500);
  });

  test("gain goal increases calories by 500", () => {
    const maintain = calculateNutrition({ ...baseProfile, goal: "maintain" });
    const gain = calculateNutrition({ ...baseProfile, goal: "gain" });
    expect(gain.targetKcal - maintain.targetKcal).toBe(500);
  });

  test("cholesterol goal has lower saturated fat ratio", () => {
    const maintain = calculateNutrition({ ...baseProfile, goal: "maintain" });
    const chol = calculateNutrition({ ...baseProfile, goal: "cholesterol" });
    expect(chol.saturatedFatGrams).toBeLessThan(maintain.saturatedFatGrams);
  });

  test("sugar goal shifts macros toward more protein and fat", () => {
    const maintain = calculateNutrition({ ...baseProfile, goal: "maintain" });
    const sugar = calculateNutrition({ ...baseProfile, goal: "sugar" });
    // Sugar goal: 30% protein vs 25% for maintain (adjusted for lower kcal)
    // protein ratio is higher so grams per kcal is higher
    const maintainProteinRatio = maintain.proteinGrams / maintain.targetKcal;
    const sugarProteinRatio = sugar.proteinGrams / sugar.targetKcal;
    expect(sugarProteinRatio).toBeGreaterThan(maintainProteinRatio);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculatePortions
// ─────────────────────────────────────────────────────────────────────────────

describe("calculatePortions", () => {
  const sampleNutrition: NutritionResult = {
    targetKcal: 2500,
    proteinGrams: 150,
    fatGrams: 70,
    carbGrams: 300,
    saturatedFatGrams: 28,
  };

  test("returns correct structure", () => {
    const result = calculatePortions(sampleNutrition, 75);
    expect(result).toHaveProperty("proteinPortions");
    expect(result).toHaveProperty("carbPortions");
    expect(result).toHaveProperty("fatPortions");
    expect(result).toHaveProperty("waterCups");
  });

  test("protein portions: 150g / 25g per palm = 6", () => {
    const result = calculatePortions(sampleNutrition, 75);
    expect(result.proteinPortions).toBe(6);
  });

  test("carb portions: 300g / 40g per fist = 8 (rounded)", () => {
    const result = calculatePortions(sampleNutrition, 75);
    expect(result.carbPortions).toBe(8);
  });

  test("fat portions: 70g / 12g per thumb = 6 (rounded)", () => {
    const result = calculatePortions(sampleNutrition, 75);
    expect(result.fatPortions).toBe(6);
  });

  test("water cups: 75kg * 0.033 * 1000 / 250 = 9.9 → 10", () => {
    const result = calculatePortions(sampleNutrition, 75);
    expect(result.waterCups).toBe(10);
  });

  test("water cups never below 8 (minimum)", () => {
    // Very light person: 30kg * 0.033 * 1000 / 250 = 3.96 → should still be 8
    const result = calculatePortions(sampleNutrition, 30);
    expect(result.waterCups).toBe(8);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// calculateBMI
// ─────────────────────────────────────────────────────────────────────────────

describe("calculateBMI", () => {
  test("normal weight: 70kg, 175cm → BMI ~22.9", () => {
    const result = calculateBMI(70, 175);
    expect(result.value).toBe(22.9);
    expect(result.category).toBe("Normal weight");
    expect(result.color).toBe("var(--secondary)");
  });

  test("underweight: 45kg, 175cm → BMI ~14.7", () => {
    const result = calculateBMI(45, 175);
    expect(result.value).toBe(14.7);
    expect(result.category).toBe("Underweight");
    expect(result.color).toBe("var(--accent)");
  });

  test("overweight: 85kg, 170cm → BMI ~29.4", () => {
    const result = calculateBMI(85, 170);
    expect(result.value).toBe(29.4);
    expect(result.category).toBe("Overweight");
    expect(result.color).toBe("var(--accent)");
  });

  test("obese: 110kg, 175cm → BMI ~35.9", () => {
    const result = calculateBMI(110, 175);
    expect(result.value).toBe(35.9);
    expect(result.category).toBe("Obese");
    expect(result.color).toBe("var(--error)");
  });

  test("boundary: exactly BMI 25 is Overweight", () => {
    // For 180cm: BMI 25 → weight = 25 * 1.8^2 = 81kg
    const result = calculateBMI(81, 180);
    expect(result.value).toBe(25);
    expect(result.category).toBe("Overweight");
  });

  test("boundary: BMI 18.5 is Normal weight", () => {
    // For 180cm: BMI 18.5 → weight = 18.5 * 3.24 = 59.94
    const result = calculateBMI(59.9, 180);
    // 59.9 / 3.24 = 18.488... → rounds to 18.5
    expect(result.value).toBe(18.5);
    expect(result.category).toBe("Normal weight");
  });

  test("includes thresholds based on height", () => {
    const result = calculateBMI(70, 175);
    // 175cm → height² = 3.0625m²
    expect(result.thresholds.underweight).toBe(56.7); // 18.5 * 3.0625
    expect(result.thresholds.obeseStart).toBeCloseTo(91.9, 0);
    expect(result.idealRange.min).toBe(result.thresholds.underweight);
    expect(result.idealRange.max).toBe(result.thresholds.normalEnd);
  });

  test("ideal range is always min < max", () => {
    const result = calculateBMI(70, 175);
    expect(result.idealRange.min).toBeLessThan(result.idealRange.max);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getGoalInfo
// ─────────────────────────────────────────────────────────────────────────────

describe("getGoalInfo", () => {
  test("returns structured data for each goal", () => {
    const goals: Goal[] = ["maintain", "lose", "gain", "sugar", "cholesterol", "pressure"];
    for (const goal of goals) {
      const info = getGoalInfo(goal);
      expect(info).toHaveProperty("label");
      expect(info).toHaveProperty("text");
      expect(info.label.length).toBeGreaterThan(0);
      expect(info.text.length).toBeGreaterThan(0);
    }
  });

  test("sugar goal mentions Low GI", () => {
    const info = getGoalInfo("sugar");
    expect(info.text).toContain("Low Glycemic Index");
  });

  test("pressure goal mentions DASH / potassium", () => {
    const info = getGoalInfo("pressure");
    expect(info.label).toBe("DASH Principle");
    expect(info.text).toContain("potassium");
  });

  test("falls back to maintain for invalid goal", () => {
    const info = getGoalInfo("invalid" as Goal);
    expect(info).toEqual(getGoalInfo("maintain"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getGoalExtraMissions
// ─────────────────────────────────────────────────────────────────────────────

describe("getGoalExtraMissions", () => {
  test("sugar goal returns 1 extra mission (no sugary drinks)", () => {
    const missions = getGoalExtraMissions("sugar");
    expect(missions).toHaveLength(1);
    expect(missions[0].title).toBe("No sugary drinks");
  });

  test("cholesterol goal returns 1 extra mission (oily fish)", () => {
    const missions = getGoalExtraMissions("cholesterol");
    expect(missions).toHaveLength(1);
    expect(missions[0].title).toContain("Oily Fish");
  });

  test("maintain/lose/gain/pressure return empty array", () => {
    expect(getGoalExtraMissions("maintain")).toHaveLength(0);
    expect(getGoalExtraMissions("lose")).toHaveLength(0);
    expect(getGoalExtraMissions("gain")).toHaveLength(0);
    expect(getGoalExtraMissions("pressure")).toHaveLength(0);
  });

  test("extra missions have all required fields", () => {
    const missions = getGoalExtraMissions("sugar");
    const m = missions[0];
    expect(m).toHaveProperty("icon");
    expect(m).toHaveProperty("ariaLabel");
    expect(m).toHaveProperty("title");
    expect(m).toHaveProperty("description");
  });
});
