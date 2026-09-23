# Project Specification: Smart Home Utility & Household Resource Management System (SmartLedger)

**Academic Context:** College Project-Based Learning (PBL)  
**Domain:** Enterprise Java Application / Domestic Resource Optimization & Billing  
**Primary Tech Stack:** Java 17+, MySQL / H2, Spring Boot (or JavaFX Desktop), Chart.js / JavaFX Charts  

---

## 1. Executive Summary & Problem Statement

### 1.1 The Real-World Problem
Modern households do not suffer from a lack of utility services; they suffer from **operational fragmentation and billing opacity**:
1. **The Shared Meter Dilemma:** In multi-tenant houses or duplexes, multiple families frequently share a single government Electric Board (EB) connection with intermediate sub-meters. Because power boards enforce progressive tier slab pricing (where cost per unit spikes steeply at higher tiers), a simple 50/50 split or flat-rate multiplication unfairly penalizes low-consumption tenants.
2. **Disconnected Ledger Systems:** Families track LPG bookings via SMS, electricity via paper stubs, vehicle fuel in their heads, grocery receipts in physical bags, and multiple family members' mobile recharges through separate carrier apps.
3. **Hardware Dependence Fallacy:** Commercial "smart home" platforms demand expensive IoT hardware, smart plugs, and telemetry sensors that are impractical for average households.

### 1.2 The Solution
The **Smart Home Utility & Household Resource Management System** is a sensorless, user-reported operational ledger. It converts manual billing and meter entries into **predictive consumption analytics, fair-split sub-metering calculations, recharge countdown matrices, vehicle efficiency curves, and visual expense breakdown charts**.

---

## 2. Core Pillars & Value Proposition (What Makes It Unique)

| Pillar | Industry Reality | Standard Student Project | Our Standout Approach |
| :--- | :--- | :--- | :--- |
| **Electricity** | Shared EB meters with steep progressive slabs | Manual unit count multiplied by a flat ₹6.00 | **Fair-Split Sub-meter Algorithm:** Distributes tiered EB bills strictly proportional to relative sub-meter consumption. |
| **Gas (LPG)** | Unpredictable run-out days causing emergency bookings | Only records purchase price | **Burn-Rate & Depletion Predictor:** Computes consumption speed ($\text{kg/day}$) and projects exact run-out dates. |
| **Internet & Mobile** | Diverse plan durations (28, 56, 84 days) across family members | Static bill payment tracker | **Multi-Member Plan Matrix:** Active countdown clocks, zero-day blackout alerts, and historical carrier spend. |
| **Transport** | Volatile fuel prices and varying commute patterns | Only enters ticket price | **Dual-Mode Mobility Engine:** Computes real vehicle mileage ($\text{km/L}$), travel cost per km, and public transit comparisons. |
| **Groceries** | Unchecked inflation and discretionary leakage | Simple item lists | **Categorical Budget Burn Index:** Essential vs. discretionary spending categorization with visual budget distribution. |

---

## 3. Mathematical & Algorithmic Models

### 3.1 Fair-Split Shared Electricity Board Algorithm
Let $U_1, U_2, \dots, U_n$ be the sub-meter units consumed by individual households during a billing cycle.  
The total household consumption recorded across all sub-meters is:
$$U_{\text{sub\_total}} = \sum_{i=1}^n U_i$$

Let $U_{\text{EB}}$ be the actual units billed by the electricity board on the master meter (including any shared common area lighting, line losses, or discrepancies).  
Let $T(u)$ be the progressive slab tariff function evaluated on total EB units:

$$T(u) = \sum_{k=1}^{m} \text{units in slab } k \times \text{rate}_k + \text{Fixed Charges}$$

The fair monetary share $C_i$ allocated to household $i$ is calculated by distributing the total progressive bill $B_{\text{total}} = T(U_{\text{EB}})$ proportionally to each household's share of total sub-metered consumption:

$$C_i = B_{\text{total}} \times \left( \frac{U_i}{U_{\text{sub\_total}}} \right)$$

*Result:* No household gets penalized by the higher slab rate unilaterally, nor does a low-energy household subsidize a high-energy household.

---

### 3.2 LPG Cylinder Burn-Rate & Depletion Prediction
Given:
* Cylinder gas net weight: $W_{\text{net}} = 14.2\text{ kg}$
* Installation date: $D_{\text{start}}$
* Cylinder empty date: $D_{\text{end}}$

$$\Delta t = \text{ChronoUnit.DAYS.between}(D_{\text{start}}, D_{\text{end}})$$
$$\text{Burn Rate } R = \frac{W_{\text{net}}}{\Delta t} \quad (\text{kg/day})$$

For the currently active cylinder installed on $D_{\text{active}}$, the estimated depletion date $D_{\text{deplete}}$ is:
$$D_{\text{deplete}} = D_{\text{active}} + \text{round}\left( \frac{W_{\text{net}}}{R_{\text{moving\_avg}}} \right) \text{ days}$$

When $(D_{\text{deplete}} - D_{\text{today}}) \le 5\text{ days}$, the system automatically flags a **"Refill Booking Recommended"** status.

---

### 3.3 Vehicle Fuel Mileage & Cost Efficiency
Given trip odometer readings and fuel fills:
$$\text{Distance Traveled } \Delta K = K_{\text{current}} - K_{\text{previous}} \quad (\text{km})$$
$$\text{Mileage } M = \frac{\Delta K}{V_{\text{liters}}} \quad (\text{km/L})$$
$$\text{Commute Cost per Kilometer} = \frac{\text{Fuel Cost Paid}}{\Delta K} \quad (\text{Currency/km})$$

---

## 4. Software Architecture & OOP Design

### 4.1 System Architecture Diagram
```
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|  [Futuristic Glassmorphic Auth Portal]  <--->  [Interactive Dashboard]  |
|  [Electricity Sub-Meter View]                  [Gas Depletion Clock]    |
|  [Family Telecom Matrix]                       [Mobility & Fuel Curve]  |
|  [Categorical Grocery Ledger]                  [Chart.js / JFX Visuals] |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                                SERVICE LAYER                            |
|  * Authentication & Session Management                                  |
|  * BillingCalculationEngine (Progressive Slab Calculator)               |
|  * SubMeterFairSplitter                                                 |
|  * DepletionPredictionService (LPG Burn Rate)                           |
|  * CommuteEfficiencyService (Fuel & Ticket Analytics)                   |
|  * ExpiryNotificationMatrix (Telecom Countdown)                         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                                 DOMAIN LAYER                            |
|  <<abstract>> BaseUtility                                               |
|       ^                                                                 |
|       +-- ElectricityReading (kWh, subMeterId, isShared)                |
|       +-- GasCylinderEntry (weightKg, installDate, emptyDate)           |
|       +-- TelecomRecharge (memberName, operator, validityDays)          |
|       +-- TransportExpense (type: FUEL/TICKET, km, liters, fare)        |
|       +-- GroceryRecord (category: ESSENTIAL/DISCRETIONARY, amount)     |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                              PERSISTENCE LAYER                          |
|  Spring Data JPA / Hibernate  <--->  MySQL Database                     |
+-------------------------------------------------------------------------+
```

### 4.2 Object-Oriented Principles Applied
* **Abstraction:** An abstract `UtilityService` declaring polymorphic methods like `calculateMonthlyBurn()`, `validateInput()`, and `generateReport()`.
* **Polymorphism:** Distinct slab algorithms and expense aggregation rules dynamically executed through common interfaces.
* **Encapsulation:** Enforcing business rules inside domain entities (e.g., rejecting negative meter readings, ensuring end dates occur strictly after start dates).
* **Strategy Pattern:** Interchangeable electricity slab calculators based on state electricity provider policies.

---

## 5. Relational Database Schema (MySQL)

```sql
-- 1. User Profiles & Credentials
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Electricity & Sub-meter Ledger
CREATE TABLE electricity_records (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    billing_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    master_eb_units DOUBLE NOT NULL,
    total_eb_amount DOUBLE NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    my_submeter_units DOUBLE NOT NULL,
    other_submeter_units DOUBLE DEFAULT 0.0,
    calculated_my_share DOUBLE NOT NULL,
    paid_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. LPG Gas Cylinder Logs
CREATE TABLE gas_records (
    cylinder_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cylinder_weight_kg DOUBLE DEFAULT 14.2,
    booking_cost DOUBLE NOT NULL,
    connected_date DATE NOT NULL,
    finished_date DATE,
    burn_rate_per_day DOUBLE,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Family Internet & Telecom Recharges
CREATE TABLE telecom_records (
    recharge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_name VARCHAR(100) NOT NULL,
    service_provider VARCHAR(50) NOT NULL, -- e.g., Airtel, Jio, BSNL
    plan_amount DOUBLE NOT NULL,
    recharge_date DATE NOT NULL,
    validity_days INT NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Transport & Commute Expense Ledger
CREATE TABLE transport_records (
    trip_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    commute_type ENUM('FUEL', 'PUBLIC_TICKET') NOT NULL,
    person_name VARCHAR(100) NOT NULL,
    origin_point VARCHAR(100),
    destination_point VARCHAR(100),
    distance_km DOUBLE,
    liters_filled DOUBLE DEFAULT NULL,
    total_fare_cost DOUBLE NOT NULL,
    mileage_calculated DOUBLE DEFAULT NULL,
    cost_per_km DOUBLE DEFAULT NULL,
    entry_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Grocery & Domestic Purchase Records
CREATE TABLE grocery_records (
    grocery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    store_name VARCHAR(120),
    category ENUM('ESSENTIAL_STAPLE', 'DAIRY_PRODUCE', 'SNACKS_DISCRETIONARY', 'HOUSEHOLD_CARE') NOT NULL,
    total_amount DOUBLE NOT NULL,
    purchase_date DATE NOT NULL,
    receipt_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 6. Visual Data & Graphical Presentation Plan

Every manual entry module drives a corresponding visual chart:

1. **Electricity Dashboard:**
   * *Visual:* Multi-bar chart showing total EB units vs. individual household sub-meter consumption over the last 6 months.
   * *Metric Card:* Effective cost per unit paid after slab calculations.
2. **Gas Depletion Visual:**
   * *Visual:* A radial/gauge chart or progress bar showing current cylinder capacity (0% to 100%) and a predicted "Days Remaining" counter badge.
3. **Telecom Expiry Timeline:**
   * *Visual:* Horizontal timeline/Gantt-style tracker for each family member, turning green when active, amber under 3 days, and red when expired.
4. **Mobility Efficiency Curve:**
   * *Visual:* Dual-axis line chart plotting fuel cost paid against vehicle mileage ($\text{km/L}$) over sequential fill-ups.
5. **Macro Household Breakdown (Home Hub):**
   * *Visual:* Central Donut Chart displaying current month's percentage allocation across Electricity, Gas, Telecom, Mobility, and Groceries.

---

## 7. Project Implementation Roadmap (4-Week Sprint)

```
[Week 1: Foundations] ──────────> [Week 2: Math Engine] ──────────> [Week 3: Front-End UI] ──────────> [Week 4: Charts & Polishing]
  • Schema & Entities Setup         • Slab Algorithm Implementation   • Futuristic Login & Register       • Chart.js / Visual Integration
  • Spring Security / Sessions      • Fair-Split Sub-meter Logic      • Module Entry Forms (5 utilities)  • Edge-case Validation
  • CRUD Repositories               • Gas & Fuel Predictor Logic      • Central Analytics Dashboard       • Presentation & Demo Deck
```

### Week 1: Environment & Entity Setup
* Configure Spring Boot project dependencies (`Spring Web`, `Spring Data JPA`, `MySQL Driver`, `Thymeleaf` or REST API with modern UI template).
* Define entity classes and link foreign-key relationships.
* Implement user registration, password hashing (BCrypt), and session login.

### Week 2: Business Logic & Predictive Calculations
* Code the tiered electricity tariff engine with configurable slab tiers.
* Implement the fair-split sub-meter logic for shared electric boards.
* Create unit tests verifying burn-rate prediction formulas for LPG and vehicle mileage tracking.

### Week 3: User Interface & Form Handling
* Design a futuristic, glassmorphic login and dashboard interface.
* Build intuitive forms for all 5 utility domains with strict front-end validation (preventing negative numbers or logically invalid dates).
* Implement individual module summary tables with quick-edit actions.

### Week 4: Data Visualization & Presentation Preparation
* Integrate Chart.js to render real-time month-over-month consumption trends.
* Add warning banners (e.g., LPG cylinder running low, family recharge expiring soon).
* Prepare demo dataset showcasing the shared EB sub-meter split in action for college evaluators.

---

## 8. College Viva & Evaluation Defense Points

When presenting to evaluators, highlight these core points:
1. **Why not IoT sensors?**
   * *"Real-world domestic adoption fails when hardware costs exceed utility savings. SmartLedger proves that high-value intelligence can be derived from pure user-reported telemetry without any hardware investment."*
2. **How does the system handle fair sharing on a single board?**
   * *"We model progressive tier escalation. By calculating the total bill from the master meter and weighting individual costs by relative sub-meter ratios, neither family is penalized unfairly by the upper tariff brackets."*
3. **What demonstrates predictive computing?**
   * *"The LPG burn-rate engine dynamically tracks consumption intervals, predicting depletion dates and automatically triggering proactive refill advisories."*