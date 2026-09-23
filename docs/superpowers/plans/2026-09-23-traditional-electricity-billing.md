# Traditional Utility Management, Normalized Cylinder Tracking & Configurable Pantry Ceiling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 
1. Transform Electricity into traditional single-household billing & domestic TNEB bi-monthly tariff calculator (eliminating multi-tenant submeter splits).
2. Normalize Gas Cylinder tracking to factual lifecycle tracking (days in use, real finished duration & burn rate; no speculative guesswork or mock estimates).
3. Add configurable manual budget ceiling setting for Pantry / Groceries with persistence and live budget adherence calculation.

**Architecture:**
- **Electricity**: Single household units (kWh) and bill amount (₹). `TraditionalTnebCalculator` replaces 3-slider submeter simulator with single slider and standard slab breakdown.
- **Gas**: Active cylinder displays exact days in use (`today - connectedDate`). Lifecycle burn rate computed strictly upon marking empty (`finishedDate`).
- **Pantry**: Configurable monthly budget ceiling with inline editor, stored in user preferences / localStorage, dynamically driving budget adherence progress bars and remaining runway calculations.

**Tech Stack:** Java 21, Spring Boot 3.3.4, React 19, TypeScript, Tailwind CSS, Recharts, Lucide React.

---

## Proposed Tasks

### Task 1: Backend Traditional Electricity & Simplified Mutation Endpoint
- Modify `ElectricityCalculationEngine.java`: add `calculateTraditionalBill(double units)` delegating to `tariffStrategy.calculateMasterBill(units)`.
- Modify `ElectricityService.java`: support adding bill with `myUnits = units`, `otherUnits = 0`, `isShared = false`, `totalEbAmount = amount`.
- Modify `ApiController.java`: make `otherUnits` optional on `/api/analytics/electricity/add`.
- Test: `ElectricityCalculationEngineTest.java`.

### Task 2: Frontend Types & Traditional Tariff API Mirror
- Modify `frontend/src/types/analytics.ts`: add `TraditionalTariffBreakdown`, add optional `pantryCeiling` to user preferences.
- Modify `frontend/src/services/api.ts`: implement `calculateTnebBill(units)` pure function, add `getPantryCeiling()` and `setPantryCeiling(ceiling: number)`.

### Task 3: Traditional TNEB Domestic Slab Calculator Component
- Create `frontend/src/components/TraditionalTnebCalculator.tsx`:
  - Single interactive slider: **Household Consumption (kWh)** (0–1000 kWh).
  - Visual slab progress bar: 0–100 Free, 101–200 @ ₹2.25, 201–500 @ ₹4.50, >500 @ ₹6.00.
  - Summary cards: Estimated Bill (₹), Effective Rate (₹/kWh), Gov Subsidy Savings (₹).
  - Presets: "90U (Free Tier)", "180U (Nominal)", "350U (Standard)", "650U (Heavy AC)".

### Task 4: Simplified Traditional Electricity Modal
- Modify `frontend/src/components/modals/AddElectricityModal.tsx`:
  - 4 clean fields: Billing Month, Units Consumed (kWh), Bill Paid Amount (₹), Paid Date.
  - Remove tenant submeter checkbox and inputs.
  - Live calculation: Effective Rate (₹/kWh).

### Task 5: Normalize LPG Cylinder Tracking (No Speculative Estimation)
- Modify `frontend/src/components/GasDepletionGauge.tsx`:
  - When active: display factual days in use (`Connected on YYYY-MM-DD • X days in active use`).
  - If historical burn rate exists from finished cylinders, show historical benchmark burn rate; if no finished cylinder yet, display "First active cylinder (measuring burn rate upon completion)".
  - When empty marked: compute exact burn rate `weight / days`.
- Modify `frontend/src/pages/GasPage.tsx` and `frontend/src/components/MacroKpiCards.tsx`:
  - Remove speculative countdown guesswork; display factual status and lifecycle progress.

### Task 6: Configurable Manual Pantry Budget Ceiling
- Modify `frontend/src/pages/PantryPage.tsx`:
  - Add inline "Edit Budget Ceiling" trigger & input (e.g. ₹3,000 / ₹5,000 / ₹8,000 / Custom).
  - Persist custom ceiling in localStorage (`smartledger_pantry_ceiling`).
  - Progress bar and "Remaining Runway" dynamically calculate against the user's custom ceiling.
- Modify `frontend/src/components/TransportGroceryOverview.tsx`:
  - Use dynamic pantry ceiling from user settings instead of hardcoded numbers.

### Task 7: Electricity Page & Chart Integration
- Modify `frontend/src/pages/ElectricityPage.tsx`:
  - Page title: "Household Electricity & TNEB Tariff Management".
  - Replace submeter simulator with `TraditionalTnebCalculator`.
  - KPI Cards: Latest Bill Paid (₹), Units Consumed (kWh), Effective Rate (₹/kWh).
  - History Table: Month, Units Consumed (kWh), Bill Paid (₹), Rate (₹/kWh), Paid Date, Delete.
- Modify `frontend/src/components/charts/ElectricityTrendChart.tsx`:
  - Axis and tooltips: "Household Units (kWh)" vs "Bill Paid (₹)".

### Task 8: Verification & Automated Tests
- Run `.\mvnw.cmd test`
- Run `npm run build` in `frontend/`
- Update `walkthrough.md`
