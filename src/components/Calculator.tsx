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

/** Compact BMI display for the hero row. */
function BmiCard({ bmi, delay = 0 }: { bmi: BmiResult; delay?: number }) {
  // Position the marker on the scale (BMI 15-40 maps to 0-100%)
  const markerPos = Math.min(100, Math.max(0, ((bmi.value - 15) / 25) * 100));

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
      {/* Multi-color BMI scale with position marker */}
      <div className="bmi-scale">
        <div className="bmi-scale__bar">
          <div className="bmi-scale__segment bmi-scale__under" />
          <div className="bmi-scale__segment bmi-scale__normal" />
          <div className="bmi-scale__segment bmi-scale__over" />
          <div className="bmi-scale__segment bmi-scale__obese" />
          <div
            className="bmi-scale__marker"
            style={{ left: `${markerPos}%` }}
            aria-label={`Your BMI: ${bmi.value}`}
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
      <p className="bmi-card__ideal">
        Ideal weight for your height: <strong>{bmi.idealRange.min} - {bmi.idealRange.max} kg</strong>
      </p>
    </div>
  );
}

/**
 * Full BMI detail panel — educational breakdown with weight scale and risks.
 * Shows where the user falls, what each category means, and weight targets.
 */
function BmiDetailPanel({ bmi, currentWeight }: { bmi: BmiResult; currentWeight: number }) {
  const [open, setOpen] = useState(false);
  const { thresholds } = bmi;

  // Calculate difference from ideal range
  const diff = bmi.value < 18.5
    ? thresholds.underweight - currentWeight
    : bmi.value >= 25
      ? currentWeight - thresholds.normalEnd
      : 0;
  const diffRounded = Math.round(diff * 10) / 10;

  // Category data for the scale
  const categories = [
    {
      label: "Underweight",
      range: `< ${thresholds.underweight} kg`,
      bmiRange: "< 18.5",
      color: "var(--accent)",
      active: bmi.value < 18.5,
      risks: "Weakened immune system, nutrient deficiencies, bone density loss, fertility issues, muscle wasting.",
    },
    {
      label: "Normal",
      range: `${thresholds.underweight} - ${thresholds.normalEnd} kg`,
      bmiRange: "18.5 - 24.9",
      color: "var(--secondary)",
      active: bmi.value >= 18.5 && bmi.value < 25,
      risks: "",
    },
    {
      label: "Overweight",
      range: `${Math.round(thresholds.normalEnd + 0.1)} - ${thresholds.overweightEnd} kg`,
      bmiRange: "25 - 29.9",
      color: "var(--accent)",
      active: bmi.value >= 25 && bmi.value < 30,
      risks: "Increased risk of type 2 diabetes, high blood pressure, sleep apnea, joint strain, and elevated LDL cholesterol.",
    },
    {
      label: "Obese",
      range: `> ${thresholds.obeseStart} kg`,
      bmiRange: "30+",
      color: "var(--error)",
      active: bmi.value >= 30,
      risks: "Significantly higher risk of heart disease, stroke, type 2 diabetes, certain cancers, fatty liver disease, and reduced life expectancy.",
    },
  ];

  return (
    <div className="bmi-detail stagger-in" style={{ animationDelay: "0.35s" }}>
      {/* Toggle header — always visible */}
      <button
        type="button"
        className="bmi-detail__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>Understanding Your BMI</span>
        <svg
          className={`bmi-detail__chevron ${open ? "bmi-detail__chevron--open" : ""}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Collapsible body */}
      <div className={`bmi-detail__body ${open ? "bmi-detail__body--open" : ""}`}>
        <p className="bmi-detail__intro">
          BMI (Body Mass Index) is a screening tool that estimates body fat based on your weight and height.
          It doesn't measure body fat directly — muscular people may score higher without health risk.
          Use it as a general guide alongside other health markers.
        </p>

        {/* Weight recommendation */}
        {bmi.category === "Normal weight" ? (
          <div className="bmi-detail__recommendation bmi-detail__recommendation--good">
            <strong>You're in the healthy range.</strong> Your weight of {currentWeight} kg
            falls within the ideal BMI range for your height.
            Maintain this with balanced nutrition and regular activity.
          </div>
        ) : (
          <div className="bmi-detail__recommendation bmi-detail__recommendation--action">
            <strong>
              {bmi.value < 18.5
                ? `You are ${diffRounded} kg below the healthy range.`
                : `You are ${diffRounded} kg above the healthy range.`}
            </strong>{" "}
            Your ideal weight range is{" "}
            <strong>{bmi.idealRange.min} - {bmi.idealRange.max} kg</strong> for your height.
            {bmi.value < 18.5
              ? " Focus on nutrient-dense foods and gradual, healthy weight gain."
              : " A gradual loss of 0.5-1 kg per week through diet and exercise is considered safe."}
          </div>
        )}

        {/* Category scale with weights */}
        <div className="bmi-detail__scale">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`bmi-detail__cat ${cat.active ? "bmi-detail__cat--active" : ""}`}
              style={{ borderLeftColor: cat.color }}
            >
              <div className="bmi-detail__cat-header">
                <span className="bmi-detail__cat-name" style={cat.active ? { color: cat.color } : undefined}>
                  {cat.label}
                  {cat.active && " (You)"}
                </span>
                <span className="bmi-detail__cat-bmi">BMI {cat.bmiRange}</span>
              </div>
              <span className="bmi-detail__cat-weight">{cat.range}</span>
              {cat.risks && (
                <p className="bmi-detail__cat-risks">
                  <strong>Risks:</strong> {cat.risks}
                </p>
              )}
              {cat.label === "Normal" && (
                <p className="bmi-detail__cat-risks" style={{ color: "var(--secondary)" }}>
                  Lowest risk of chronic disease. Best range for longevity, energy, and metabolic health.
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="bmi-detail__note">
          BMI has limitations: it does not distinguish between muscle and fat mass,
          and may be less accurate for athletes, elderly individuals, or certain ethnic groups.
          Always consult a healthcare provider for a complete health assessment.
        </p>
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
    weight: number;
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

    setResult({ nutrition, portions, bmi, goal, weight });

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

          {/* ── BMI Detail Panel ── */}
          <BmiDetailPanel bmi={result.bmi} currentWeight={result.weight} />

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
