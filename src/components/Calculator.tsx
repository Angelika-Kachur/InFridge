import { useState } from "react";
import type { FormEvent } from "react";

import { calculateNutrition, calculatePortions, getGoalInfo, getGoalExtraMissions } from "../lib/calculator";
import { PROTEIN_FOODS, CARB_FOODS, FAT_FOODS, PORTION_SIZES } from "../lib/constants";
import type { Goal, ActivityLevel, NutritionResult, PortionResult, FoodItem, Mission } from "../lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SUB-COMPONENTS
// Each one is a simple function that receives props and returns JSX.
// Breaking the UI into small pieces makes each part easy to understand and test.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ResultTile — displays one result metric (e.g., "Daily kcal: 2200").
 *
 * Props explained:
 * - label: the heading text (e.g., "Daily kcal")
 * - value: the number to display
 * - unit: optional unit text (e.g., "grams")
 */
function ResultTile({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="result-tile">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {/* Conditional rendering: only show unit span if `unit` is provided */}
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

/**
 * MissionCard — one daily mission (e.g., "Eat 4 Palms of Protein").
 *
 * This replaces the big innerHTML template literal that built mission HTML.
 * Now each mission is a clean, typed component.
 */
function MissionCard({ icon, ariaLabel, title, description, style }: Mission & { style?: React.CSSProperties }) {
  return (
    <div className="mission-card" style={style}>
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

/**
 * FoodCategory — one column in the food guide (Proteins, Carbs, or Fats).
 *
 * Demonstrates list rendering with .map():
 * Instead of building an HTML string with .map().join(""),
 * React maps each item to a JSX element. The `key` prop tells React
 * which list item is which, so it can efficiently update the DOM.
 */
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
        <strong>~{portionSize}g of {portionUnit}</strong> per portion
      </p>
      <div className="food-list-header">
        <span>Food Item</span>
        <span>Portion Size</span>
      </div>
      <ul className="food-list">
        {/* List rendering: .map() creates one <li> per food item */}
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
// This is the "parent" that manages all state and composes the sub-components.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculator — the main exported component.
 *
 * STATE MANAGEMENT:
 * Using a single `result` state that is either `null` (no calculation yet)
 * or an object with all computed values. When the form is submitted, 
 * everything calculates and setResult() is called. React then re-renders, and
 * since `result` is no longer null, all the result sections appear.
 *
 * 
 */
export default function Calculator() {
  // ── STATE ──────────────────────────────────────────────────────────────
  // useState<Type | null>(null) means:
  // - The type can be our result object OR null
  // - It starts as null (no results yet)
  // - When we call setResult({...}), React re-renders this component
  const [result, setResult] = useState<{
    nutrition: NutritionResult;
    portions: PortionResult;
    goal: Goal;
  } | null>(null);

  // ── EVENT HANDLER ─────────────────────────────────────────────────────
  // This function runs when the form is submitted.
  // It reads values from the form, runs calculations, and updates state.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    // Prevent the browser from reloading the page (default form behavior)
    e.preventDefault();

    // FormData is a native browser API that reads all form field values.
    // We use the `name` attribute on each input/select to identify fields.
    const formData = new FormData(e.currentTarget);

    const sex = formData.get("sex") as "male" | "female";
    const age = Number(formData.get("age"));
    const weight = Number(formData.get("weight"));
    const height = Number(formData.get("height"));
    const activity = Number(formData.get("activity")) as ActivityLevel;
    const goal = formData.get("goal") as Goal;

    // Run the same calculation functions as before — zero changes to logic
    const nutrition = calculateNutrition({ sex, age, weight, height, activity, goal });
    const portions = calculatePortions(nutrition, weight);

    // Update state — this triggers a re-render, showing all result sections
    setResult({ nutrition, portions, goal });

    // Smooth scroll to results after a tiny delay (let React render first)
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);
  }

  // ── DERIVED DATA ──────────────────────────────────────────────────────
  // These values are computed from the result state.
  // They're only used when `result` is not null (inside the conditional render below).
  const goalInfo = result ? getGoalInfo(result.goal) : null;
  const extraMissions = result ? getGoalExtraMissions(result.goal) : [];

  // Build the standard missions list from portions data.
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

  // Combine base missions + any goal-specific bonus missions
  const allMissions = [...baseMissions, ...extraMissions];

  // ── JSX (THE UI) ──────────────────────────────────────────────────────
  // Everything below describes what the component looks like.
  // React converts this JSX into actual DOM elements.
  return (
    <div className="glass-card animate-fade">
      <h2 className="text-gradient">Personal Nutrition Calculator</h2>
      <p style={{ marginBottom: "2rem", color: "var(--text-muted)" }}>
        Enter your data for a personalized nutrition plan based on 2020-2025 guidelines.
      </p>

      {/*
        THE FORM
        - `onSubmit={handleSubmit}` connects the handler to the form's submit event
        - Each field uses `name` attribute so FormData can read values
        - `defaultValue` sets the initial value without React controlling every keystroke
          (called an "uncontrolled" form)
      */}
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

      {/*
        CONDITIONAL RENDERING:
        {result && (...)} means: "only render this block if `result` is not null".
        This replaces the old pattern of toggling a .hidden CSS class.
        When `result` is null, React simply doesn't render any of this.
        When the user submits the form, setResult() is called, result becomes
        non-null, and React renders the entire results section.
      */}
      {result && (
        <div id="results" className="results-container" role="region" aria-label="Calculation results" aria-live="polite">
          {/* ── Result Tiles ── */}
          <div className="results-grid">
            <ResultTile label="Daily kcal" value={result.nutrition.targetKcal} />
            <ResultTile label="Proteins" value={result.nutrition.proteinGrams} unit="grams" />
            <ResultTile label="Carbs" value={result.nutrition.carbGrams} unit="grams" />
            <ResultTile label="Fats" value={result.nutrition.fatGrams} unit="grams" />
            <ResultTile label="Saturated Fat" value={result.nutrition.saturatedFatGrams} unit="grams, maximum" />
          </div>

          {/* ── Daily Missions ── */}
          <div className="missions-container">
            <h3 className="mission-title">
              <span role="img" aria-label="Target">🎯</span> Your Daily Missions
            </h3>
            <div className="mission-list">
              {/*
                LIST RENDERING with .map():
                For each mission in the array, render a MissionCard component.
                The `key` prop is required — it helps React identify which items
                have changed, been added, or removed. Use a stable unique value.

                The spread syntax {...mission} passes all mission properties as
                individual props. It's shorthand for:
                icon={mission.icon} ariaLabel={mission.ariaLabel} title={mission.title} ...
              */}
              {allMissions.map((mission) => (
                <MissionCard
                  key={mission.title}
                  {...mission}
                  style={
                    mission.ariaLabel === "Oily fish"
                      ? { borderColor: "var(--accent)" }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>

          {/* ── Food Guide ── */}
          <div className="food-options-container">
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

          {/* ── Goal-Specific Info ── */}
          {goalInfo && (
            <div className="additional-info">
              <strong>{goalInfo.label}:</strong> {goalInfo.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
