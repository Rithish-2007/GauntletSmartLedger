# Engineering Specification: User-Driven Utility & Expense Management Engine

**Date:** 2026-09-23  
**Status:** DRAFT (Under Review)  
**System:** SmartLedger / SHUMS (Smart Home Utility Management System)  
**Target:** Production-Grade End-to-End User Experience with Zero Mock Data Leakage  

---

## 1. Executive Summary & Problem Formulation

### 1.1 Problem Statement
The current system relied on hardcoded baseline numbers and passive simulations. Real households managing domestic utilities and daily expenses require:
1. **Direct, frictionless user input** across all utility pillars.
2. **Deterministic, dynamic mathematical calculations** derived strictly from user inputs rather than canned demo payloads.
3. **Everyday practical models:**
   - **Electricity:** Monthly bill paid (₹) and units consumed (kWh) with submeter fair-split.
   - **Gas (LPG):** Cylinder booking price paid, start date, and real-time lifecycle tracking (marking when it runs empty) to compute real burn rates and countdowns.
   - **Telecom:** Family member assignment with individual recharge validity clocks.
   - **Travel & Fuel:** Practical daily fuel fill-ups (e.g. ₹200 petrol, ₹400 diesel) and ticket bookings (who, destination, fare) instead of unrealistic odometer mathematics.
   - **Grocery / Pantry:** Itemized receipts categorized into essential vs. discretionary provisions.
4. **Interactive Visualizations:** Modern, theme-adaptive interactive graphs inspired by 21st.dev and shadcn/ui charts (powered by Recharts) providing instant visual feedback.

---

## 2. Pillar-by-Pillar Specifications & Mathematical Models

### 2.1 Electricity Pillar
* **User Inputs:**
  * `billingMonth`: e.g. `2026-09`
  * `totalEbAmount`: Total bill amount paid (₹)
  * `myUnits`: Units consumed by user (kWh)
  * `otherSubmeterUnits` (Optional): Units consumed by tenant / other floors
  * `paidDate`: Date of payment
* **Mathematical Calculations:**
  * If shared meter:
    $$\text{Total Submeter Units} = U_{\text{my}} + U_{\text{other}}$$
    $$\text{My Fair Share} = \text{Total EB Bill} \times \left( \frac{U_{\text{my}}}{U_{\text{my}} + U_{\text{other}}} \right)$$
  * If individual meter:
    $$\text{My Fair Share} = \text{Total EB Bill}$$
  * Effective Cost per Unit:
    $$\text{Rate per kWh} = \frac{\text{My Fair Share}}{U_{\text{my}}}$$
* **Interactive Graphs (shadcn / 21st.dev style):**
  * **Monthly Trend Bar & Line Chart:** Units consumed (bar) vs. Bill paid (line) over time with custom glassmorphic tooltip.

---

### 2.2 Gas (LPG) Pillar
* **User Inputs:**
  * `bookingCost`: Amount paid for the cylinder (₹, e.g. ₹850.00)
  * `cylinderWeightKg`: Net gas weight (kg, default 14.2 kg)
  * `connectedDate`: Date cylinder installation started
  * `finishedDate`: Date cylinder ran empty (updated via a single-click "Mark as Empty" action)
* **Mathematical Calculations:**
  * For completed past cylinders:
    $$\Delta t = \text{DAYS}(\text{connectedDate}, \text{finishedDate})$$
    $$\text{Burn Rate } R = \frac{W_{\text{net}}}{\Delta t} \quad (\text{kg/day})$$
    $$\text{Daily Cost} = \frac{\text{Cost}}{\Delta t} \quad (₹\text{/day})$$
  * For the active cylinder:
    $$R_{\text{avg}} = \text{average}(R_{\text{past}}) \quad (\text{or 0.45 kg/day baseline if first cylinder})$$
    $$\text{Estimated Total Days} = \text{round}\left(\frac{W_{\text{net}}}{R_{\text{avg}}}\right)$$
    $$\text{Days Remaining} = \max(0, \text{Estimated Total Days} - \text{DAYS}(\text{connectedDate}, \text{today}))$$
    $$\text{Refill Alert} = (\text{Days Remaining} \le 5)$$
* **Interactive Graphs:**
  * **Cylinder Lifespan Comparison Bar Chart:** Days lasted per cylinder across billing history.
  * **Radial Burn Gauge:** Visual depletion ring showing % gas remaining with days-left countdown.

---

### 2.3 Telecom Pillar (Family Member Multi-Carrier Matrix)
* **User Inputs:**
  * `familyMemberName`: Passenger/member (e.g. "Rithish (Self)", "Dad", "Mom", "Sister", or custom)
  * `serviceProvider`: Jio, Airtel, Vi, BSNL, or Other
  * `planAmount`: Recharge amount paid (₹)
  * `rechargeDate`: Date recharge was performed
  * `validityDays`: Plan validity period (e.g. 28, 56, 84, 365 days)
* **Mathematical Calculations:**
  $$\text{Expiry Date} = \text{rechargeDate} + \text{validityDays}$$
  $$\text{Days Remaining} = \text{DAYS}(\text{today}, \text{Expiry Date})$$
  $$\text{Status} = \begin{cases} \text{ACTIVE}, & \text{Days Remaining} > 3 \\ \text{EXPIRING\_SOON}, & 0 \le \text{Days Remaining} \le 3 \\ \text{EXPIRED\_BLACKOUT}, & \text{Days Remaining} < 0 \end{cases}$$
* **Interactive Graphs:**
  * **Per-Member Spend Horizontal Bar Chart:** Aggregated telecom expense assigned to each family member.
  * **Carrier Distribution Donut Chart:** Share of spend across service providers.

---

### 2.4 Travel & Fuel Pillar (Everyday Household Reality)
* **User Inputs:**
  * **Mode A: Daily Fuel Refills:**
    * `commuteType = FUEL`
    * `vehicle`: Bike, Car, Scooter
    * `fuelType`: Petrol, Diesel, CNG
    * `totalFareCost`: Amount spent (e.g. ₹200, ₹400)
    * `entryDate`: Date of refill
    * `notes`: Optional description
  * **Mode B: Ticket Bookings:**
    * `commuteType = PUBLIC_TICKET`
    * `personName`: Family member / Passenger
    * `originPoint` & `destinationPoint`: Route / Journey description (e.g. "Chennai to Bangalore")
    * `transitType`: Train, Bus, Metro, Flight, Cab/Auto
    * `totalFareCost`: Ticket fare paid (₹)
    * `entryDate`: Date of journey
* **Mathematical Calculations:**
  $$\text{Total Travel Spend} = \sum \text{Fuel Costs} + \sum \text{Ticket Fares}$$
  $$\text{Fuel vs Ticket Split} = \left(\frac{\sum \text{Fuel}}{\text{Total}}, \frac{\sum \text{Tickets}}{\text{Total}}\right)$$
* **Interactive Graphs:**
  * **Fuel vs. Transit Area/Bar Chart:** Monthly spend breakdown between vehicle fuel and ticket bookings.
  * **Vehicle / Passenger Breakdown Chart:** Where mobility funds are distributed.

---

### 2.5 Grocery & Pantry Pillar
* **User Inputs:**
  * `storeName`: Supermarket or provision store name
  * `category`: `ESSENTIAL_STAPLE`, `DAIRY_PRODUCE`, `SNACKS_DISCRETIONARY`, `HOUSEHOLD_PROVISION`
  * `totalAmount`: Invoice amount paid (₹)
  * `purchaseDate`: Date of receipt
  * `receiptNotes`: Notes or item list
* **Mathematical Calculations:**
  $$\text{Total Grocery Spend} = \sum \text{All Invoices}$$
  $$\text{Discretionary Spend} = \sum \text{Invoices}_{\text{SNACKS\_DISCRETIONARY}}$$
  $$\text{Essential Spend} = \text{Total} - \text{Discretionary}$$
* **Interactive Graphs:**
  * **Categorical Donut & Stacked Bar Chart:** Proportional distribution across staples, dairy, discretionary snacks, and household supplies.

---

### 2.6 Executive Macro Dashboard
* **Consolidated Spend:**
  $$\text{Total Monthly Spend} = \text{Electricity} + \text{Gas} + \text{Telecom} + \text{Travel} + \text{Grocery}$$
* **Interactive Graphs:**
  * **Interactive Spend Trajectory Chart:** Monthly consolidated expenditure area chart with interactive 3-month / 6-month / all-time zoom and category filtering.
  * **Capital Allocation Donut Chart:** High-definition responsive donut chart with hover callouts and percentage legends.
  * **Top Header "+ Quick Add Expense" Modal:** One-click launcher from anywhere in the app to record an expense for any pillar.

---

## 3. Architecture & Data Flow

```
[User Browser: React 19 + Recharts + Tailwind]
      |
      |-- 1. User inputs bill/expense via Interactive Slide-over Form
      |-- 2. Live preview computes mathematical output on keystroke
      |-- 3. User submits form
      |
      v
[Spring Boot 3.3.4 REST Layer: ApiController]
      |
      |-- POST /api/analytics/{utility}/add
      |-- DELETE /api/analytics/{utility}/{id}
      |
      v
[Service Layer & Algorithmic Engines]
      |-- ElectricityCalculationEngine (Fair-Split & Rates)
      |-- GasDepletionEngine (Burn Rate & Days Remaining)
      |-- TelecomMatrixEngine (Validity & Expiry Clocks)
      |-- TransportAnalyticsEngine (Fuel vs Tickets)
      |-- GroceryAnalyticsEngine (Essential vs Discretionary)
      |
      v
[Database Layer (H2 / MySQL)]
      |-- Persists real user entity
      |
      v
[Reactive Response: Full OverviewData JSON]
      |
      v
[Frontend State Update]
      |-- Ledgers update immediately with newly recorded row
      |-- Macro KPIs and Interactive Recharts re-render dynamically
      |-- Offline Mirror saves to localStorage if disconnected
```

---

## 4. API Endpoints (`ApiController.java`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/overview` | Fetches consolidated user data and calculations |
| `POST` | `/api/analytics/electricity/add` | Records electricity bill and computes fair-split |
| `DELETE`| `/api/analytics/electricity/{id}` | Deletes electricity record |
| `POST` | `/api/analytics/gas/connect` | Connects new LPG cylinder with cost and start date |
| `POST` | `/api/analytics/gas/finish` | Marks active cylinder as empty and computes burn rate |
| `DELETE`| `/api/analytics/gas/{id}` | Deletes cylinder record |
| `POST` | `/api/analytics/telecom/add` | Adds member recharge with carrier, cost, validity |
| `DELETE`| `/api/analytics/telecom/{id}` | Deletes telecom record |
| `POST` | `/api/analytics/transport/add` | Logs fuel refill or ticket booking |
| `DELETE`| `/api/analytics/transport/{id}` | Deletes travel record |
| `POST` | `/api/analytics/grocery/add` | Adds grocery invoice and updates categorical spend |
| `DELETE`| `/api/analytics/grocery/{id}` | Deletes grocery record |
| `POST` | `/api/analytics/clear` | Clears all records to provide clean zero-state for new users |

---

## 5. UI Component Hierarchy (Frontend)

* `Header.tsx`: Includes global `+ Add Expense` button and navigation pills.
* `QuickAddModal.tsx`: Universal drawer allowing users to quickly pick any category and log an expense.
* `pages/ElectricityPage.tsx`:
  * Bill Breakdown KPI summary
  * `AddElectricityModal.tsx`: Inputs for bill paid, units, submeters
  * `ElectricityTrendChart.tsx`: Interactive Recharts dual-axis bar & line graph
  * Itemized bill history table with Delete action
* `pages/GasPage.tsx`:
  * Active Cylinder Status Card & "Mark as Empty" quick action
  * `ConnectGasModal.tsx`: Inputs for cylinder price, start date
  * `GasLifespanChart.tsx`: Interactive bar chart of cylinder duration (days)
  * History table with Delete action
* `pages/TelecomPage.tsx`:
  * Member Matrix Cards with countdown badges
  * `AddTelecomModal.tsx`: Inputs for family member name, provider, amount, validity
  * `TelecomMemberSpendChart.tsx`: Per-member spending bar graph
  * SIM Ledger table with Delete action
* `pages/MobilityPage.tsx`:
  * Fuel vs Ticket spend breakdown
  * `AddTravelModal.tsx`: Tabbed form: (A) Fuel Fill-up or (B) Ticket Booking
  * `TravelSplitChart.tsx`: Fuel vs Ticket expenditure interactive chart
  * Logged journeys table with Delete action
* `pages/PantryPage.tsx`:
  * Budget ceiling & essential spend gauge
  * `AddGroceryModal.tsx`: Store, category, amount, date, notes
  * `GroceryCategoryChart.tsx`: Donut & horizontal categorical distribution
  * Invoices table with Delete action

---

## 6. Verification & Acceptance Criteria
1. **Zero Mock Enforced:** Starting from a clean database displays ₹0 across all metrics without synthetic mock fallback.
2. **Dynamic Mathematical Accuracy:** Entering values updates every metric and chart strictly through the mathematical formulas.
3. **Delete Integrity:** Deleting any entry immediately recalculates macro metrics, percentages, and chart datasets.
4. **Offline Resilience:** If Spring Boot is offline, user actions persist cleanly in the browser mirror without losing inputs or reverting to mock defaults.
