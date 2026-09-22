# SmartLedger Specification: Smart Home Utility & Household Resource Management System

**Document Type:** System Architecture & Design Specification  
**Academic Context:** College Project-Based Learning (PBL) / Viva Defense  
**Domain:** Java Enterprise Web Application & Domestic Resource Optimization  
**Target Platform:** Java 21, Spring Boot 3, Spring Data JPA, MySQL 8.x / JDBC, Thymeleaf, Chart.js  

---

## 1. System Intent & Objectives

### 1.1 Problem Statement
Modern households face operational fragmentation and billing opacity when managing domestic utilities:
1. **Shared Electric Board (EB) Metering**: Multi-tenant homes sharing one main government EB meter with intermediate sub-meters face progressive tariff penalty. High total consumption pushes the bill into upper rate slabs; dividing bills 50/50 or using a flat rate unfairly penalizes low-consuming tenants.
2. **Disconnected Manual Tracking**: LPG gas, internet/mobile plans, vehicle fuel, and grocery spending are tracked through disparate paper slips, SMS messages, or mental notes.
3. **Hardware Barrier**: Commercial IoT smart home systems require expensive hardware sensors that are economically unviable for typical households.

### 1.2 The Solution: SmartLedger
SmartLedger is a **sensorless, user-reported telemetry and financial ledger** built in Java that transforms manual meter and expense entries into:
- Fair-split sub-meter electricity cost allocation across tiered slabs.
- LPG gas cylinder moving average burn-rate ($\text{kg/day}$) and depletion prediction.
- Family telecom validity countdown matrix with blackout alerts.
- Commute mileage ($\text{km/L}$) and travel cost-per-km efficiency curve.
- Essential vs. Discretionary grocery budget burn breakdown.
- Interactive glassmorphic dashboard with live Chart.js visualizations.

---

## 2. Academic Syllabus & OOP Concepts Mapping

To showcase core Java fundamentals for college evaluators and viva defense, the system explicitly incorporates:

| Syllabus Concept | Implementation in SmartLedger | File / Artifact Reference |
| :--- | :--- | :--- |
| **Abstraction & Inheritance** | `abstract class BaseUtilityRecord` defining polymorphic template methods (`calculateMonthlyBurn()`, `validateRecord()`, `generateSummaryReport()`) inherited by all 5 domain entities. | `com.smartledger.domain.BaseUtilityRecord` |
| **Interfaces & Strategy Pattern** | `TariffCalculationStrategy` interface implemented by `ProgressiveSlabTariffStrategy` and `CommercialFlatTariffStrategy`, injected into `ElectricityCalculationEngine`. | `com.smartledger.service.tariff.*` |
| **Encapsulation & Validation** | Private fields with strict domain validation rules in entity setters and service boundaries; custom checked/unchecked exception hierarchy. | `com.smartledger.exception.*` |
| **Collections & Java Streams** | Java Streams API (`filter`, `map`, `collect(groupingBy)`, `summingDouble`) for computing aggregate metrics, categorical splits, and moving averages. | `com.smartledger.service.*` |
| **Modern Java Features** | Java `record` for immutable calculation results (`SubMeterShareResult`, `DepletionForecast`, `CommuteMetric`); `java.time` API (`LocalDate`, `ChronoUnit.DAYS`). | `com.smartledger.dto.*` |
| **Test-Driven Development (TDD)**| 100% of mathematical engines and business rules verified with JUnit 5 and AssertJ using Red-Green-Refactor cycles prior to implementation. | `src/test/java/com/smartledger/*` |

---

## 3. Mathematical & Algorithmic Engine Specifications

### 3.1 Fair-Split Shared Electricity Slab Algorithm
1. **Total Master Bill Calculation**:
   Given EB master units $U_{\text{EB}}$, progressive slabs $S_k = [\text{start}_k, \text{end}_k, \text{rate}_k]$:
   $$B_{\text{total}} = \sum_{k=1}^m \text{units in slab}_k \times \text{rate}_k + \text{Fixed Charges}$$
   *Default Domestic Slab Model*:
   - 0 – 100 units: ₹0.00 / unit (subsidized free allowance)
   - 101 – 200 units: ₹2.25 / unit
   - 201 – 500 units: ₹4.50 / unit
   - Above 500 units: ₹6.00 / unit
   - Fixed Monthly Meter Charge: ₹50.00

2. **Fair Proportional Distribution**:
   Let $U_{\text{sub\_total}} = U_{\text{user}} + U_{\text{others}}$.  
   The user's fair allocated cost $C_{\text{user}}$:
   $$C_{\text{user}} = B_{\text{total}} \times \left( \frac{U_{\text{user}}}{U_{\text{sub\_total}}} \right)$$
   *Effective Cost Per Unit*:
   $$R_{\text{eff}} = \frac{C_{\text{user}}}{U_{\text{user}}}$$

### 3.2 LPG Cylinder Burn-Rate & Depletion Predictor
- Standard domestic cylinder weight: $W_{\text{net}} = 14.2\text{ kg}$
- For completed cylinders:
  $$\Delta t = \text{ChronoUnit.DAYS.between}(D_{\text{connected}}, D_{\text{finished}})$$
  $$\text{Burn Rate } R = \frac{W_{\text{net}}}{\Delta t} \quad (\text{kg/day})$$
- Moving Average Burn Rate:
  $$R_{\text{avg}} = \frac{1}{N}\sum_{j=1}^N R_j$$
  *(If no past history exists, system uses default domestic baseline $R_0 = 0.45\text{ kg/day}$)*
- Active Cylinder Depletion Date:
  $$D_{\text{deplete}} = D_{\text{active}} + \text{round}\left(\frac{W_{\text{net}}}{R_{\text{avg}}}\right)\text{ days}$$
- Days Remaining:
  $$\Delta d = \text{ChronoUnit.DAYS.between}(D_{\text{today}}, D_{\text{deplete}})$$
  - If $\Delta d \le 5$ days: Trigger `REFILL_BOOKING_RECOMMENDED` banner.
  - Current estimated remaining weight: $\max(0, W_{\text{net}} - (\text{days elapsed} \times R_{\text{avg}}))$.

### 3.3 Family Telecom Validity Matrix
- Days Remaining:
  $$\Delta d = \text{ChronoUnit.DAYS.between}(D_{\text{today}}, D_{\text{expiry}})$$
- Status Categories:
  - $\Delta d > 3$: **ACTIVE** (Badge: Green)
  - $0 \le \Delta d \le 3$: **EXPIRING_SOON** (Badge: Amber)
  - $\Delta d < 0$: **EXPIRED_BLACKOUT** (Badge: Red)

### 3.4 Mobility Fuel & Commute Cost Engine
- For `FUEL` entries:
  $$\text{Distance } \Delta K = K_{\text{current}} - K_{\text{previous}} \quad (\text{km})$$
  $$\text{Mileage } M = \frac{\Delta K}{V_{\text{liters}}} \quad (\text{km/L})$$
  $$\text{Cost per km} = \frac{\text{Fuel Cost}}{\Delta K} \quad (₹/\text{km})$$
- For `PUBLIC_TICKET` entries:
  $$\text{Cost per km} = \frac{\text{Ticket Fare}}{\text{Distance } (\text{km})}$$

### 3.5 Grocery Categorical Budget Index
- Enum Categories:
  - `ESSENTIAL_STAPLE` (Grains, pulses, spices, oils)
  - `DAIRY_PRODUCE` (Milk, eggs, vegetables, fruits)
  - `SNACKS_DISCRETIONARY` (Sweets, packaged food, dining out)
  - `HOUSEHOLD_CARE` (Cleaning supplies, toiletries)
- Essential Ratio:
  $$\text{Essential \%} = \frac{\sum (\text{ESSENTIAL\_STAPLE} + \text{DAIRY\_PRODUCE})}{\text{Total Grocery Spend}} \times 100$$

---

## 4. Software Architecture & Database Schema

### 4.1 Package Architecture
```
com.smartledger
├── config/                  # SecurityConfig, WebMvcConfig, PersistenceConfig
├── domain/                  # JPA Entities
│   ├── BaseUtilityRecord    # Abstract base class
│   ├── User                 # User credentials & session profile
│   ├── ElectricityRecord    # EB & sub-meter records
│   ├── GasRecord            # LPG cylinders
│   ├── TelecomRecord        # Family recharge tracking
│   ├── TransportRecord      # Commute & fuel entries
│   └── GroceryRecord        # Categorized domestic purchases
├── repository/              # Spring Data JPA repositories
├── service/                 # Business logic & math engines
│   ├── tariff/              # Strategy pattern for electricity tariffs
│   ├── UserService
│   ├── ElectricityService
│   ├── GasDepletionService
│   ├── TelecomMatrixService
│   ├── TransportAnalyticsService
│   ├── GroceryAnalyticsService
│   └── DashboardSummaryService
├── controller/              # MVC and REST endpoints
│   ├── AuthController       # Login, register, logout
│   ├── ViewController       # Serves Thymeleaf pages
│   └── ApiController        # JSON analytics data for Chart.js
├── dto/                     # Java records for calculation output & request forms
└── exception/               # Custom domain exceptions & @ControllerAdvice handler
```

### 4.2 Database Schema (MySQL 8.x)

```sql
-- 1. Users
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Electricity Records
CREATE TABLE electricity_records (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    billing_month VARCHAR(7) NOT NULL, -- YYYY-MM
    master_eb_units DOUBLE NOT NULL,
    total_eb_amount DOUBLE NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    my_submeter_units DOUBLE NOT NULL,
    other_submeter_units DOUBLE DEFAULT 0.0,
    calculated_my_share DOUBLE NOT NULL,
    paid_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. LPG Gas Records
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

-- 4. Telecom Records
CREATE TABLE telecom_records (
    recharge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    family_member_name VARCHAR(100) NOT NULL,
    service_provider VARCHAR(50) NOT NULL,
    plan_amount DOUBLE NOT NULL,
    recharge_date DATE NOT NULL,
    validity_days INT NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Transport Records
CREATE TABLE transport_records (
    trip_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    commute_type VARCHAR(20) NOT NULL, -- FUEL or PUBLIC_TICKET
    person_name VARCHAR(100) NOT NULL,
    origin_point VARCHAR(100),
    destination_point VARCHAR(100),
    distance_km DOUBLE,
    liters_filled DOUBLE,
    total_fare_cost DOUBLE NOT NULL,
    mileage_calculated DOUBLE,
    cost_per_km DOUBLE,
    entry_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Grocery Records
CREATE TABLE grocery_records (
    grocery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    store_name VARCHAR(120),
    category VARCHAR(30) NOT NULL, -- ESSENTIAL_STAPLE, DAIRY_PRODUCE, etc.
    total_amount DOUBLE NOT NULL,
    purchase_date DATE NOT NULL,
    receipt_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 5. User Interface & Chart.js Visualizations

### 5.1 Glassmorphic Visual Theme
- **Styling**: Modern dark glassmorphic palette (`#0d1117`, card background `rgba(22, 27, 34, 0.75)`, backdrop blur `12px`, border `1px solid rgba(255, 255, 255, 0.1)`).
- **Typography**: Clean Google Font (`Inter` / `Outfit`).
- **Cards & Badges**: Glowing indicator badges for active vs. expiring services, dynamic progress bars for LPG cylinder capacity.

### 5.2 Interactive Visual Charts (Powered by Chart.js)
1. **Electricity Dashboard**: Grouped vertical bar chart comparing Master EB units vs. User's sub-meter units across billing months.
2. **LPG Gauge**: Semi-circle progress gauge showing % remaining in active cylinder and days until run-out.
3. **Telecom Matrix**: Horizontal timeline/Gantt chart displaying validity windows for each family member.
4. **Mobility Efficiency**: Dual-axis line chart tracking vehicle mileage ($\text{km/L}$) over sequential fuel refills.
5. **Macro Household Hub**: Central donut chart displaying current month's percentage allocation across all 5 utility pillars.

---

## 6. Verification & Quality Assurance (TDD Focus)

- All mathematical engines (`ElectricityCalculationEngine`, `GasDepletionEngine`, `TelecomMatrixEngine`, `TransportAnalyticsEngine`, `GroceryAnalyticsEngine`) must be built strictly using Test-Driven Development:
  1. Write failing JUnit 5 test asserting specific input/output.
  2. Verify test fails.
  3. Write minimal domain/service code to pass.
  4. Verify test passes.
  5. Refactor and commit.
- Integration tests using Spring `@SpringBootTest` and mock MVC tests for controller routing and security validation.
- SQL seed data provided in `src/main/resources/data.sql` to provide instant viva demonstration data upon application launch.
