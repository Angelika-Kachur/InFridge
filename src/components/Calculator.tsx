import { useState } from "react";
import type { FormEvent } from "react";

import {
  calculateNutrition,
  calculatePortions,
  calculateBMI,
  getGoalInfo,
  getGoalExtraMissions,
} from "../lib/calculator";
import { PROTEIN_FOODS, CARB_FOODS, FAT_FOODS, PORTION_SIZES } from "../lib/constants";
import type {
  Goal,
  ActivityLevel,
  NutritionResult,
  PortionResult,
  BmiResult,
  FoodItem,
  Mission,
} from "../lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** The hero kcal number — large and prominent at the top of results. */
function KcalHero({ kcal, delay = 0 }: { kcal: number; delay?: number }) {
  return (
    <div className="kcal-hero stagger-in" style={{ animationDelay: `${delay * 0.08}s` }}>
      <span className="kcal-hero__label">Your Daily Target</span>
      <span className="kcal-hero__value">{kcal}</span>
      <span className="kcal-hero__unit">kcal / day</span>
    </div>
  );
}

/** BMI display card with colored indicator. */
function BmiCard({ bmi, delay = 0 }: { bmi: BmiResult; delay?: number }) {
  return (
    <div className="bmi-card stagger-in" style={{ animationDelay: `${delay * 0.08}s` }}>
      <div className="bmi-card__header">
        <span className="bmi-card__label">BMI</span>
        <span className="bmi-card__value" style={{ color: bmi.color }}>
          {bmi.value}
        </span>
      </div>
      <span className="bmi-card__category" style={{ color: bmi.color }}>
        {bmi.category}
      </span>
      {/* Visual BMI scale bar */}
      <div className="bmi-scale">
        <div className="bmi-scale__track">
          <div
            className="bmi-scale__fill"
            style={{
              // Map BMI 15-40 to 0-100%
              width: `${Math.min(100, Math.max(0, ((bmi.value - 15) / 25) * 100))}%`,
              background: bmi.color,
            }}
          />
        </div>
        <div className="bmi-scale__labels">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>
    </div>
  );
}

/** A single macro nutrient tile (protein, carbs, fats, sat fat). */
function MacroTile({
  label,
  value,
  unit,
  accent,
  delay = 0,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: string;
  delay?: number;
}) {
  return (
    <div className="macro-tile stagger-in" style={{ animationDelay: `${delay * 0.08}s` }}>
      {accent && <div className="macro-tile__accent" style={{ background: accent }} />}
      <span className="macro-tile__value">{value}<span className="macro-tile__unit">g</span></span>
      <span className="macro-tile__label">{label}</span>
      <span className="macro-tile__sub">{unit}</span>
    </div>
  );
}

function MissionCard({
  icon,
  ariaLabel,
  title,
  description,
  style,
  delay = 0,
}: Mission & { style?: React.CSSProperties; delay?: number }) {
  return (
    <div
      className="mission-card stagger-in"
      style={{ ...style, animationDelay: `${delay * 0.08}s` }}
    >
      <div className="mission-icon" role="img" aria-label={ariaLabel}>
        {icon}
      </div>
      <div className="mission-details">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

function FoodCategory({
  title,
  target,
  targetLabel,
  portionSize,
  portionUnit,
  foods,
}: {
  title: string;
  target: number;
  targetLabel: string;
  portionSize: number;
  portionUnit: string;
  foods: FoodItem[];
}) {
  return (
    <div className="food-category">
      <div className="category-header">
        <h4>{title}</h4>
        <span className="target-badge">
          {targetLabel}: {target}/day
        </span>
      </div>
      <p className="category-desc">
        <strong>
          ~{portionSize}g of {portionUnit}
        </strong>{" "}
        per portion
      </p>
      <div className="food-list-header">
        <span>Food Item</span>
        <span>Portion Size</span>
      </div>
      <ul className="food-list">
        {foods.map((food) => (
          <li key={food.name}>
            <span className="food-name">{food.name}: </span>
            <span className="food-amount">{food.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALCULATOR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Calculator() {
  const [result, setResult] = useState<{
    nutrition: NutritionResult;
    portions: PortionResult;
    bmi: BmiResult;
    goal: Goal;
  } | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const sex = formData.get("sex") as "male" | "female";
    const age = Number(formData.get("age"));
    const weight = Number(formData.get("weight"));
    const height = Number(formData.get("height"));
    const activity = Number(formData.get("activity")) as ActivityLevel;
    const goal = formData.get("goal") as Goal;

    const nutrition = calculateNutrition({ sex, age, weight, height, activity, goal });
    const portions = calculatePortions(nutrition, weight);
    const bmi = calculateBMI(weight, height);

    setResult({ nutrition, portions, bmi, goal });

    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);
  }

  const goalInfo = result ? getGoalInfo(result.goal) : null;
  const extraMissions = result ? getGoalExtraMissions(result.goal) : [];

  const baseMissions: Mission[] = result
    ? [
        {
          icon: "🥩",
          ariaLabel: "Protein",
          title: `Eat ${result.portions.proteinPortions} Palms of Protein`,
          description: `~${PORTION_SIZES.PROTEIN_PER_PALM}g each (Chicken breast, Tofu block)`,
        },
        {
          icon: "🍚",
          ariaLabel: "Carbs",
          title: `Eat ${result.portions.carbPortions} Fists of Carbs`,
          description: `~${PORTION_SIZES.CARBS_PER_FIST}g each (Rice, Potato, Oats)`,
        },
        {
          icon: "🥑",
          ariaLabel: "Fats",
          title: `Limit to ${result.portions.fatPortions} Thumbs of Fat`,
          description: `~${PORTION_SIZES.FAT_PER_THUMB}g each (Oils, Nuts, Butter)`,
        },
        {
          icon: "🥬",
          ariaLabel: "Vegetables",
          title: "Eat 5+ Vegetable Servings",
          description: "80g is one serving (1 handful)",
        },
        {
          icon: "💧",
          ariaLabel: "Water",
          title: `Drink ${result.portions.waterCups} Glasses`,
          description: "~250ml per glass. Stay hydrated!",
        },
      ]
    : [];

  const allMissions = [...baseMissions, ...extraMissions];

  return (
    <div className="glass-card animate-fade">
      <h2 className="text-gradient">Personal Nutrition Calculator</h2>
      <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>
        Enter your data for a personalized nutrition plan based on 2020-2025 guidelines.
      </p>

      <form onSubmit={handleSubmit} className="grid-form">
        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <select id="sex" name="sex" required>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="age">Age (years)</label>
          <input type="number" id="age" name="age" min={15} max={100} defaultValue={30} required />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input type="number" id="weight" name="weight" min={30} max={300} defaultValue={75} required />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (cm)</label>
          <input type="number" id="height" name="height" min={100} max={250} defaultValue={175} required />
        </div>

        <div className="form-group form-group--wide">
          <label htmlFor="activity">Activity Level</label>
          <select id="activity" name="activity" required defaultValue="1.375">
            <option value="1.2">Sedentary (Little/no exercise)</option>
            <option value="1.375">Lightly Active (1-3 days/week)</option>
            <option value="1.55">Moderately Active (3-5 days/week)</option>
            <option value="1.725">Very Active (6-7 days/week)</option>
            <option value="1.9">Extra Active (Athletic/Physical job)</option>
          </select>
        </div>

        <div className="form-group form-group--wide">
          <label htmlFor="goal">Health Goal</label>
          <select id="goal" name="goal" required>
            <option value="maintain">Maintain Weight</option>
            <option value="lose">Weight Loss</option>
            <option value="gain">Weight Gain</option>
            <option value="sugar">Lower Sugar / Pre-diabetic</option>
            <option value="cholesterol">Lower LDL Cholesterol</option>
            <option value="pressure">Lower Blood Pressure</option>
          </select>
        </div>

        <div className="form-submit">
          <button type="submit" className="btn-primary">
            Calculate My Needs
          </button>
        </div>
      </form>

      {result && (
        <div id="results" className="results-container" role="region" aria-label="Calculation results" aria-live="polite">
          {/* ── Section Title ── */}
          <h3 className="results-heading stagger-in">Your Personalized Plan</h3>

          {/* ── Hero row: big kcal number + BMI ── */}
          <div className="results-hero-row">
            <KcalHero kcal={result.nutrition.targetKcal} delay={1} />
            <BmiCard bmi={result.bmi} delay={2} />
          </div>

          {/* ── Macro breakdown ── */}
          <div className="macro-grid">
            <MacroTile label="Protein" value={result.nutrition.proteinGrams} unit="daily target" accent="var(--secondary)" delay={3} />
            <MacroTile label="Carbs" value={result.nutrition.carbGrams} unit="daily target" accent="var(--primary)" delay={4} />
            <MacroTile label="Fats" value={result.nutrition.fatGrams} unit="daily target" accent="var(--accent)" delay={5} />
            <MacroTile label="Saturated Fat" value={result.nutrition.saturatedFatGrams} unit="maximum" accent="var(--error)" delay={6} />
          </div>

          {/* ── Goal-Specific Info ── */}
          {goalInfo && (
            <div className="additional-info stagger-in" style={{ animationDelay: "0.4s" }}>
              <strong>{goalInfo.label}:</strong> {goalInfo.text}
            </div>
          )}

          {/* ── Daily Missions ── */}
          <div className="missions-container">
            <h3 className="mission-title">
              <span role="img" aria-label="Target">
                🎯
              </span>{" "}
              Your Daily Missions
            </h3>
            <div className="mission-list">
              {allMissions.map((mission, index) => (
                <MissionCard
                  key={mission.title}
                  {...mission}
                  delay={index}
                  style={
                    mission.ariaLabel === "Oily fish" ? { borderColor: "var(--accent)" } : undefined
                  }
                />
              ))}
            </div>
          </div>

          {/* ── Food Guide ── */}
          <div className="food-options-container stagger-in" style={{ animationDelay: "0.3s" }}>
            <div className="food-section-header">
              <h3 className="section-title">Food Guide</h3>
              <p className="section-subtitle">Build your daily menu from these options</p>
            </div>

            <div className="food-options-grid">
              <FoodCategory
                title="Proteins"
                target={result.portions.proteinPortions}
                targetLabel="Target"
                portionSize={PORTION_SIZES.PROTEIN_PER_PALM}
                portionUnit="protein"
                foods={PROTEIN_FOODS}
              />
              <FoodCategory
                title="Carbs"
                target={result.portions.carbPortions}
                targetLabel="Target"
                portionSize={PORTION_SIZES.CARBS_PER_FIST}
                portionUnit="carbs"
                foods={CARB_FOODS}
              />
              <FoodCategory
                title="Fats"
                target={result.portions.fatPortions}
                targetLabel="Limit"
                portionSize={PORTION_SIZES.FAT_PER_THUMB}
                portionUnit="fat"
                foods={FAT_FOODS}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
