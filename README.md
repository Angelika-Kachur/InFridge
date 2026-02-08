# 🧊 InFridge | Personal Nutrition Assistant

**InFridge** is a modern, privacy-focused web application designed to simplify personal nutrition. It helps users calculate their daily caloric and macro needs based on specific health goals (like lowering cholesterol or blood pressure) and translates those numbers into actionable "Daily Missions" and real-food portion guides.

## ✨ Features

### 🧮 Smart Nutrition Calculator
- **Scientifically Backed:** Uses the *Mifflin-St Jeor* equation for accurate BMR/TDEE calculations.
- **Goal-Oriented:** tailored adjustments for:
  - Weight Loss / Gain / Maintenance
  - Lowering Sugar (Pre-diabetic focus)
  - Lowering LDL Cholesterol (Heart health focus)
  - Lowering Blood Pressure (DASH approach)

### 🎮 Gamified Daily Missions
- Automatically converts abstract gram targets (e.g., "140g Protein") into tangible missions (e.g., "Eat 6 Palms of Protein").
- Tracks Water, Veggies, Proteins, Carbs, and Fats in simple, visual units (Palms, Fists, Thumbs).

### 🍽️ Dynamic Menu Builder
- A cheat sheet that instantly generates a list of foods matching your specific daily targets.
- distinct columns for Proteins, Carb sources, and Healthy Fats.

### 📚 Comprehensive Health Guides
- **Kitchen Guide:** What to stock in your fridge for success.
- **Critical Alerts:** Warnings about Red Meat limits, Processed Meats (Nitrates), and Ultra-Processed Foods.
- **Vitamins & Minerals:** A detailed breakdown of Calcium, Iron, Magnesium, etc., with top food sources.
- **Clean Fifteen:** A guide to produce with the lowest pesticide residues to save money on organic buying.
- **Portion Guide:** Visual comparisons (Deck of cards, Tennis ball) to estimate food amounts without a scale.

## 🛠️ Tech Stack

- **Framework:** [Astro](https://astro.build/) (v5) - For blazing fast performance and zero-JS default.
- **Styling:** Vanilla CSS with a custom **Glassmorphism** design system.
- **Language:** TypeScript / JavaScript.
- **Deployment:** Static Site Generation (SSG) ready.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/InFridge.git
   cd InFridge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:4321` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

## ⚠️ Disclaimer
This application provides information based on general guidelines (USDA 2020-2025, NHS). It is not a substitute for professional medical advice. Always consult with a doctor or registered dietitian before making drastic changes to your diet, especially if you have underlying health conditions.
