# User-Driven Utility & Expense Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SmartLedger from a passive demo into a production-grade, end-to-end user-driven household utility and expense management system where all metrics and charts are calculated strictly from real user inputs with zero mock data.

**Architecture:** A dual-layer architecture combining Spring Boot REST endpoints (`ApiController.java`) with relational JPA persistence and an offline-resilient TypeScript calculation mirror (`api.ts`). A global Quick-Add modal and contextual slide-over forms capture real everyday bills and expenses with live formula feedback, while modern interactive Recharts graphs display dynamic trends and distributions.

**Tech Stack:** Java 21, Spring Boot 3.3.4, Spring Data JPA, H2/MySQL, React 19, TypeScript, Recharts, Tailwind CSS, Lucide React.

**Spec:** [`docs/superpowers/specs/2026-09-23-user-driven-utility-management-design.md`](file:///c:/Users/rithi/OneDrive/Desktop/SHUMS.java/docs/superpowers/specs/2026-09-23-user-driven-utility-management-design.md)

## Global Constraints
- Zero mock data fallback: when a ledger is empty, all metrics, charts, and tables must show true zero states.
- All calculations must strictly run on user-submitted values.
- Travel tracking models everyday household realities: fuel fill-ups (fuel type, vehicle, amount spent) and ticket bookings (destination, passenger, mode, fare).
- Every ledger table must provide a delete action to remove individual records and trigger dynamic recalculation.

## Review Focus
1. User enters 0 units consumed in electricity: prevent divide-by-zero, display ₹0.00 effective rate.
2. User enters an empty date earlier than cylinder connected date: reject with validation error.
3. User deletes all records across all pillars: dashboard displays ₹0 without crashing charts or falling back to canned demo numbers.
4. User logs multiple recharges for the same family member: aggregate correctly in telecom member spend chart.
5. User enters fuel expense with no distance: calculate total fare correctly into mobility spend.

---

### Task 1: Backend REST Endpoints & Deletion Support

**Files:**
- Modify: `src/main/java/com/smartledger/controller/ApiController.java`
- Modify: `src/main/java/com/smartledger/service/ElectricityService.java`
- Modify: `src/main/java/com/smartledger/service/GasService.java`
- Modify: `src/main/java/com/smartledger/service/TelecomService.java`
- Modify: `src/main/java/com/smartledger/service/TransportService.java`
- Modify: `src/main/java/com/smartledger/service/GroceryService.java`
- Modify: `src/main/java/com/smartledger/service/DashboardSummaryService.java`

**Interfaces:**
- Consumes: `User`, `ElectricityRecordRepository`, `GasRecordRepository`, `TelecomRecordRepository`, `TransportRecordRepository`, `GroceryRecordRepository`.
- Produces: 
  - `POST /api/analytics/electricity/add`
  - `DELETE /api/analytics/electricity/{id}`
  - `POST /api/analytics/gas/finish`
  - `DELETE /api/analytics/gas/{id}`
  - `POST /api/analytics/telecom/add`
  - `DELETE /api/analytics/telecom/{id}`
  - `POST /api/analytics/transport/add`
  - `DELETE /api/analytics/transport/{id}`
  - `POST /api/analytics/grocery/add`
  - `DELETE /api/analytics/grocery/{id}`
  - All endpoints return `ResponseEntity<Map<String, Object>>` with refreshed `OverviewData`.

- [ ] **Step 1: Add deletion methods to Service classes**
Add `deleteRecord(User user, Long recordId)` in `ElectricityService`, `GasService`, `TelecomService`, `TransportService`, and `GroceryService` checking user ownership.

- [ ] **Step 2: Add REST endpoints to `ApiController.java`**
Implement the POST and DELETE mappings for each utility, passing parameters to services and returning `dashboardSummaryService.getDetailedOverview(user)`.

- [ ] **Step 3: Update `DashboardSummaryService.java` for Gas finish and empty-state resilience**
Ensure `finishGas(User user, LocalDate finishedDate)` sets the active cylinder to finished, computes burn rate, and recalculates forecast.

- [ ] **Step 4: Verify with `mvn test-compile`**
Run: `mvn test-compile`
Expected: BUILD SUCCESS

- [ ] **Step 5: Commit backend changes**
```bash
git add src/main/java/com/smartledger/
git commit -m "feat(api): add REST endpoints for utility mutations and deletions"
```

---

### Task 2: Backend Controller & Integration Automated Tests

**Files:**
- Modify: `src/test/java/com/smartledger/controller/ApiControllerTest.java`

- [ ] **Step 1: Write integration tests for new REST endpoints**
Add test cases in `ApiControllerTest.java` verifying:
  - Adding an electricity record recalculates overview.
  - Adding a telecom recharge with family member name.
  - Adding a fuel transport entry and a ticket booking entry.
  - Adding a grocery invoice.
  - Deleting an entry updates the overview.

- [ ] **Step 2: Run test to verify**
Run: `mvn test -Dtest=ApiControllerTest`
Expected: Tests run: 5+, Failures: 0, Errors: 0

- [ ] **Step 3: Commit test updates**
```bash
git add src/test/java/com/smartledger/controller/ApiControllerTest.java
git commit -m "test(api): verify mutation and deletion endpoints"
```

---

### Task 3: Frontend API Service & Resilient Calculation Mirror

**Files:**
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/types/analytics.ts`

- [ ] **Step 1: Update TypeScript types in `analytics.ts`**
Add types for Travel entries (supporting fuel details or ticket details), Family Member spend items, and mutation payload interfaces.

- [ ] **Step 2: Implement mutations and calculation engine in `api.ts`**
  - Implement `addElectricity(...)`, `deleteElectricity(id)`
  - Implement `connectGas(...)`, `finishGas(date)`, `deleteGas(id)`
  - Implement `addTelecom(...)`, `deleteTelecom(id)`
  - Implement `addTransport(...)`, `deleteTransport(id)`
  - Implement `addGrocery(...)`, `deleteGrocery(id)`
  - Replace static `BASELINE_DATA` with a persistent browser `localStorage` engine: if backend is offline, execute real mathematical formulas on user data and save to `localStorage`.

- [ ] **Step 3: Run TypeScript check**
Run: `cd frontend; npx tsc --noEmit`
Expected: Clean compilation with 0 errors.

- [ ] **Step 4: Commit frontend api updates**
```bash
git add frontend/src/services/api.ts frontend/src/types/analytics.ts
git commit -m "feat(frontend): add real API mutations and calculation mirror"
```

---

### Task 4: Interactive Modals for User Input

**Files:**
- Create: `frontend/src/components/modals/AddElectricityModal.tsx`
- Create: `frontend/src/components/modals/ConnectGasModal.tsx`
- Create: `frontend/src/components/modals/AddTelecomModal.tsx`
- Create: `frontend/src/components/modals/AddTravelModal.tsx`
- Create: `frontend/src/components/modals/AddGroceryModal.tsx`
- Create: `frontend/src/components/modals/QuickAddModal.tsx`

- [ ] **Step 1: Build `AddElectricityModal.tsx`**
Inputs: Month, Bill Amount Paid (₹), Units Used (kWh), optional Tenant units. Live calculation preview showing Effective Rate (₹/kWh) and Fair-split share before submit.

- [ ] **Step 2: Build `ConnectGasModal.tsx` & Finish Gas trigger**
Inputs: Cylinder Price Paid (₹), Net Weight (kg), Start Date. Live preview of estimated burn rate and lifespan.

- [ ] **Step 3: Build `AddTelecomModal.tsx`**
Inputs: Family Member Name (quick presets: Self, Dad, Mom, Sister, or custom), Provider (Jio, Airtel, Vi, BSNL), Recharge Amount (₹), Recharge Date, Validity Days. Live preview of expiry date and countdown badge.

- [ ] **Step 4: Build `AddTravelModal.tsx`**
Tabbed selector:
  - Tab 1: Fuel Refill (Vehicle, Fuel type Petrol/Diesel/CNG, Amount Paid ₹, Date)
  - Tab 2: Ticket Booking (Passenger, Journey/Route, Mode Train/Bus/Metro/Flight/Cab, Fare Amount ₹, Date).

- [ ] **Step 5: Build `AddGroceryModal.tsx`**
Inputs: Store Name, Category (Staples, Dairy, Snacks, Household), Amount Paid (₹), Date, Notes.

- [ ] **Step 6: Build `QuickAddModal.tsx`**
Universal launcher allowing user to pick any utility category and switch directly to its form.

- [ ] **Step 7: Verify compilation**
Run: `cd frontend; npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 8: Commit modals**
```bash
git add frontend/src/components/modals/
git commit -m "feat(ui): add interactive input modals with live formula previews"
```

---

### Task 5: Interactive Recharts Graphs (shadcn / 21st.dev Aesthetic)

**Files:**
- Create: `frontend/src/components/charts/ElectricityTrendChart.tsx`
- Create: `frontend/src/components/charts/GasLifespanChart.tsx`
- Create: `frontend/src/components/charts/TelecomMemberSpendChart.tsx`
- Create: `frontend/src/components/charts/TravelSplitChart.tsx`
- Create: `frontend/src/components/charts/GroceryCategoryChart.tsx`

- [ ] **Step 1: Build `ElectricityTrendChart.tsx`**
Dual-axis Bar (kWh consumed) + Line (Bill paid ₹) with dark theme tooltip, gradients, and monthly ticks.

- [ ] **Step 2: Build `GasLifespanChart.tsx`**
Bar chart comparing days lasted across past cylinders vs. active cylinder days elapsed.

- [ ] **Step 3: Build `TelecomMemberSpendChart.tsx`**
Horizontal bar chart showing telecom spending allocated per family member, plus carrier distribution badge breakdown.

- [ ] **Step 4: Build `TravelSplitChart.tsx`**
Stacked bar and donut chart illustrating Fuel Refills vs Ticket Bookings spend.

- [ ] **Step 5: Build `GroceryCategoryChart.tsx`**
Categorical donut & horizontal distribution chart with essential vs discretionary markers.

- [ ] **Step 6: Verify compilation**
Run: `cd frontend; npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit charts**
```bash
git add frontend/src/components/charts/
git commit -m "feat(charts): add interactive Recharts components with dark glassmorphism"
```

---

### Task 6: Wire Pages, Delete Actions & Navigation

**Files:**
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Modify: `frontend/src/pages/ElectricityPage.tsx`
- Modify: `frontend/src/pages/GasPage.tsx`
- Modify: `frontend/src/pages/TelecomPage.tsx`
- Modify: `frontend/src/pages/MobilityPage.tsx`
- Modify: `frontend/src/pages/PantryPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Update `Header.tsx` with `+ Quick Add` button**
Add prominent `+ Add Expense` button in header opening `QuickAddModal`.

- [ ] **Step 2: Integrate into `ElectricityPage.tsx`**
Add "Log Electricity Bill" button, `ElectricityTrendChart`, and Delete button on table rows.

- [ ] **Step 3: Integrate into `GasPage.tsx`**
Add "Connect Cylinder" modal, "Mark as Empty" button for active cylinder, `GasLifespanChart`, and Delete actions.

- [ ] **Step 4: Integrate into `TelecomPage.tsx`**
Add "Add Recharge" modal, `TelecomMemberSpendChart`, family member badges, and Delete actions.

- [ ] **Step 5: Integrate into `MobilityPage.tsx`**
Add "Log Travel / Fuel" modal, `TravelSplitChart`, fuel vs ticket summary KPIs, and Delete actions.

- [ ] **Step 6: Integrate into `PantryPage.tsx`**
Add "Add Grocery Invoice" modal, `GroceryCategoryChart`, essential spend breakdown, and Delete actions.

- [ ] **Step 7: Integrate into `DashboardPage.tsx`**
Ensure Macro KPIs and Spend Trajectory dynamically react to user entries and deletions.

- [ ] **Step 8: Build frontend bundle to verify**
Run: `cd frontend; npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 9: Commit integrated pages**
```bash
git add frontend/src/
git commit -m "feat(pages): connect input modals, interactive charts, and delete actions"
```

---

### Task 7: Full System Verification & End-to-End Walkthrough

**Files:**
- Verify: Full stack application running live.
- Create: `walkthrough.md`

- [ ] **Step 1: Run Maven test suite**
Run: `mvn clean test`
Expected: All tests pass.

- [ ] **Step 2: Run frontend production build**
Run: `cd frontend; npm run build`
Expected: Zero build or lint errors.

- [ ] **Step 3: Test user workflow**
Verify adding an electricity bill, connecting and finishing a gas cylinder, adding family member recharges, logging fuel refills and ticket bookings, and logging grocery receipts. Confirm zero mock data leakage and live reactive calculations.

- [ ] **Step 4: Commit and finalize walkthrough**
```bash
git add .
git commit -m "chore: complete user-driven utility & expense management implementation"
```
