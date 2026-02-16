# InFridge

Personal nutrition calculator and health guide built with Astro and React.

Helps users calculate daily caloric and macro needs based on specific health goals, then translates those numbers into actionable daily missions and real-food portion guides.

---

## Features

**Nutrition Calculator** — Uses the Mifflin-St Jeor equation for BMR/TDEE. Supports 6 health goals: weight loss, gain, maintenance, lower sugar (pre-diabetic), lower LDL cholesterol, lower blood pressure (DASH).

**BMI Analysis** — Calculates BMI with personalized weight thresholds for your height, category breakdown with health risks, and a collapsible educational panel.

**Daily Missions** — Converts gram targets into visual portions (palms of protein, fists of carbs, thumbs of fat) so you can follow your plan without a food scale.

**Food Guide** — Generates a cheat sheet of foods matching your daily targets, split into protein, carb, and fat columns with portion sizes.

**Health Guides** (static, zero-JS pages):
- Kitchen Guide — what to stock, plus alerts on red meat limits, processed meats, UPFs, dirty dozen pesticides, mercury in fish
- Vitamins & Minerals — daily targets and top food sources for 8 key micronutrients, plus the Clean Fifteen list
- Portions & Rules — USDA 2020-2025 and NHS guidelines with visual portion comparisons

---

## Live DEMO

👉 Deployed at: https://infridge-app.vercel.app/

---

## Preview

![App Screenshot](./screenshot.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 5](https://astro.build/) — static site generation, zero JS by default |
| Interactive UI | [React 19](https://react.dev/) — used only on the Calculator page via Astro Islands (`client:load`) |
| Language | TypeScript — strict types, no `any` |
| Styling | Vanilla CSS — glassmorphism design system, light/dark themes, CSS custom properties |
| Testing | [Vitest](https://vitest.dev/) — 36 unit tests covering all calculation logic |

Static pages (Guide, Vitamins, Portions) ship **zero JavaScript** to the browser.

---

## Project Structure

```
src/
  components/
    Calculator.tsx          React calculator (only interactive component)
    NutritionalInfo.astro   Kitchen guide (static)
    VitaminsMinerals.astro  Vitamins reference (static)
    Guidelines.astro        Portions & rules (static)
  lib/
    calculator.ts           Pure calculation functions (BMR, TDEE, BMI, macros)
    calculator.test.ts      Unit tests
    constants.ts            Formulas, macro ratios, food data
    types.ts                TypeScript interfaces
  layouts/
    Layout.astro            Shared layout (header, nav, footer, theme toggle)
  pages/
    index.astro             Calculator page
    guide.astro             Kitchen Guide
    vitamins.astro          Vitamins & Minerals
    guidelines.astro        Portions & Rules
    404.astro               Custom error page
  styles/
    global.css              Design system (theming, glassmorphism, responsive)
```

---

## Getting Started

```bash
git clone https://github.com/yourusername/InFridge.git
cd InFridge
npm install
npm run dev          # dev server at localhost:4321
```

Other commands:

```bash
npm run build        # production build → dist/
npm run preview      # preview production build
npm test             # run unit tests
npm run test:watch   # tests in watch mode
```

---

## Architecture Decisions

**Why Astro + React (not just React)?** — Only the Calculator page needs interactivity. The 3 guide pages are pure content. Astro renders them as static HTML with no JavaScript bundle. React hydrates only where needed.

**Why one `useState` object?** — The Calculator stores all results (`nutrition`, `portions`, `bmi`, `goal`, `weight`) in a single state object. When it's `null`, only the form shows. When populated, all result components render. This avoids syncing multiple state variables.

**Why uncontrolled form?** — The form uses `FormData` on submit instead of controlled inputs. We don't need to track every keystroke — only the final values matter. This avoids 6 separate `useState` calls.

**Why separate `calculator.ts` from `Calculator.tsx`?** — Calculation logic is pure math with no UI dependencies. It can be unit tested without rendering React, reused in other contexts, and reasoned about independently.

---

## Testing

36 unit tests cover the entire `calculator.ts` module:

- `calculateBMR` — male/female offsets, age/weight/height effects
- `calculateTDEE` — activity multiplier math
- `calculateNutrition` — goal adjustments, macro ratios, rounding
- `calculatePortions` — palm/fist/thumb conversions, water minimum floor
- `calculateBMI` — all 4 WHO categories, boundary values, height-based thresholds
- `getGoalInfo` — content checks, fallback for invalid input
- `getGoalExtraMissions` — goal-specific extras, empty arrays for others

```bash
npm test
```

---

## Disclaimer

This application provides information based on general guidelines (USDA 2020-2025, NHS Eatwell Guide, WHO). It is not a substitute for professional medical advice. Consult a doctor or registered dietitian before making significant changes to your diet, especially with underlying health conditions.

---

## Sources

- [USDA Dietary Guidelines 2020-2025](https://www.dietaryguidelines.gov/)
- [NHS Eatwell Guide](https://www.nhs.uk/live-well/eat-well/)
- [WHO Healthy Diet Fact Sheet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet)
- [Mifflin-St Jeor Equation (PubMed)](https://pubmed.ncbi.nlm.nih.gov/15883556/)
- [EWG Dirty Dozen & Clean Fifteen](https://www.ewg.org/foodnews/)
