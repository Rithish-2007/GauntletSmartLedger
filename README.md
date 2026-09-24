# ⚡ GauntletSmartLedger

> **Smart Home Utility & Household Resource Management System**  
> *A sensorless, enterprise-grade Java web application for equitable shared billing, predictive domestic resource tracking, and household expense optimization.*

[![Java](https://img.shields.io/badge/Java-17%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-56%20Passed%20(100%25)-brightgreen?style=for-the-badge&logo=junit5&logoColor=white)](https://junit.org/junit5/)
[![Tariff Compliance](https://img.shields.io/badge/Tariff-TNEB%20LT--IA%20Compliant-gold?style=for-the-badge)](https://www.tnebltd.gov.in/)

---

## 📌 Table of Contents
- [Overview & The Real-World Problem](#-overview--the-real-world-problem)
- [Key Pillars & Standout Features](#-key-pillars--standout-features)
- [Mathematical & Algorithmic Engines](#-mathematical--algorithmic-engines)
  - [1. TNEB LT-IA Progressive Slab Tariff](#1-tneb-lt-ia-progressive-slab-tariff-engine)
  - [2. Sub-Meter Fair-Split Formulation](#2-sub-meter-fair-split-formulation)
  - [3. LPG Thermodynamic Burn-Rate Predictor](#3-lpg-thermodynamic-burn-rate-predictor)
  - [4. Vehicle Efficiency & Commute Cost](#4-vehicle-efficiency--commute-cost)
- [Security & Authentication](#-security--authentication)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [REST API Endpoints](#-rest-api-endpoints)
- [Automated Testing Suite (56/56 Tests)](#-automated-testing-suite-5656-tests)
- [Academic Context](#-academic-context)

---

## 💡 Overview & The Real-World Problem

Modern urban households, multi-tenant properties, and shared duplexes face significant operational fragmentation and billing disputes:

1. **The Shared Master Meter Inequity:** Multiple families frequently share a single electricity board (EB) connection with intermediate sub-meters. Because government utilities enforce steep **progressive slab tariffs** (where unit rates jump steeply at higher consumption tiers), simple 50/50 splits or flat-rate multiplication unfairly penalize low-consumption tenants while subsidizing heavy consumers.
2. **Fragmented Domestic Tracking:** LPG gas depletion is tracked through guesswork, resulting in emergency run-outs; family telecom validity periods (28/56/84 days) expire unexpectedly; commute mileage costs remain unmonitored; and grocery budgets suffer unchecked discretionary inflation.
3. **The Sensor Hardware Fallacy:** Commercial "smart home" IoT devices require expensive current clamps and smart plugs (often exceeding ₹15,000) that are non-viable for average households.

### The Solution: GauntletSmartLedger
**GauntletSmartLedger** is a zero-hardware, user-reported operational utility ledger that translates meter entries into **predictive consumption analytics, equitable fair-split allocations, recharge countdown matrices, and vehicle efficiency curves**.

---

## ⚡ Key Pillars & Standout Features

| Pillar | Real-World Challenge | Traditional Approach | GauntletSmartLedger Standout Engine |
| :--- | :--- | :--- | :--- |
| **⚡ Electricity** | Shared meters with progressive governmental tariff tiers | Multiplying units by a flat rate (e.g. ₹6.00) | **Fair-Split Sub-Meter Algorithm:** Proportional allocation of the master progressive bill + Official TNEB LT-IA dual-category calculation engine. |
| **🛢️ Gas (LPG)** | Unpredictable run-outs causing emergency booking delays | Only recording cylinder purchase price | **Thermodynamic Burn-Rate Engine:** Computes consumption velocity ($\text{kg/day}$) and projects depletion dates with automated 5-day refill warnings. |
| **📱 Telecom** | Varied plan validity cycles (28, 56, 84 days) across family members | Static bill payment tracker | **Family Expiration Matrix:** Active countdown clocks, multi-carrier tracking, and zero-day blackout alerts. |
| **🚗 Transport** | Volatile fuel prices and varying commute patterns | Recording total petrol bill only | **Dual-Mode Mobility Engine:** Calculates true vehicle mileage ($\text{km/L}$), commute cost per kilometer, and public transit comparisons. |
| **🛒 Groceries** | Unchecked inflation and discretionary leakage | Simple shopping lists | **Categorical Budget Burn Index:** Essential vs. discretionary spending breakdown with configurable monthly budget ceilings. |

---

## 📐 Mathematical & Algorithmic Engines

### 1. TNEB LT-IA Progressive Slab Tariff Engine
Strictly adheres to official Tamil Nadu Electricity Board (TNEB) domestic rates with a **₹50.00 fixed meter charge**:

* **Category A (Consumption $\le 500$ units):**
  * `0 – 100 units`: **FREE** (₹0.00)
  * `101 – 200 units`: **₹2.35 / unit**
  * `201 – 400 units`: **₹4.70 / unit**
  * `401 – 500 units`: **₹6.30 / unit**

* **Category B (Consumption $> 500$ units):**
  * `0 – 100 units`: **FREE** (₹0.00)
  * `101 – 400 units`: **₹4.70 / unit**
  * `401 – 500 units`: **₹6.30 / unit**
  * `501 – 600 units`: **₹8.40 / unit**
  * `601 – 800 units`: **₹9.45 / unit**
  * `801 – 1000 units`: **₹10.50 / unit**
  * `Above 1000 units`: **₹11.55 / unit**

### 2. Sub-Meter Fair-Split Formulation
For $n$ sub-metered households with readings $u_1, u_2, \dots, u_n$:
$$U_{\text{sub\_total}} = \sum_{i=1}^{n} u_i$$
Given the total master EB progressive bill $B_{\text{total}} = T(U_{\text{master}})$, each tenant's fair share is:
$$C_i = B_{\text{total}} \times \left( \frac{u_i}{U_{\text{sub\_total}}} \right)$$
*Result:* No household is unilaterally penalized by higher progressive slab tiers.

### 3. LPG Thermodynamic Burn-Rate Predictor
For standard domestic cylinders ($W_{\text{net}} = 14.2\text{ kg}$):
$$\text{Burn Velocity } R = \frac{14.2}{\text{Days Between Install and Empty}} \quad (\text{kg/day})$$
$$\text{Projected Depletion Date} = \text{Date}_{\text{installed}} + \text{round}\left( \frac{14.2}{R_{\text{moving\_avg}}} \right) \text{ days}$$
When days remaining $\le 5$, the system automatically issues a **"Refill Booking Recommended"** priority alert.

### 4. Vehicle Efficiency & Commute Cost
$$\text{Mileage } M = \frac{\text{Odometer}_{\text{current}} - \text{Odometer}_{\text{previous}}}{\text{Fuel Liters Filled}} \quad (\text{km/L})$$
$$\text{Cost per km} = \frac{\text{Fuel Cost Paid (₹)}}{\Delta \text{km}}$$

---

## 🔒 Security & Authentication

- **Traditional Password Complexity Enforcement:** Built-in validation rule requiring:
  - Minimum **8 characters**
  - At least **1 uppercase letter** (`A-Z`)
  - At least **1 lowercase letter** (`a-z`)
  - At least **1 numeric digit** (`0-9`)
  - At least **1 special character** (`@$!%*?&#^`)
- **Interactive UI Password Strength Meter:** Visual 5-segment strength meter (Weak $\to$ Fair $\to$ Good $\to$ Strong) with real-time requirement checkmarks.
- **Cryptographic Protection:** Passwords securely hashed using **Spring Security BCrypt** with unique salt generation.
- **Session Management:** Secure HTTP session tokens with role-based endpoint isolation.

---

## 🏗️ System Architecture

```
                                  USER INTERFACE (React 19 + Vite)
      +---------------------------------------------------------------------------------------+
      |  [Golden Thunder Navigation]            [Traditional Password Auth]                   |
      |  [Live TNEB Simulation Slider]          [Sub-Meter Proportional Splitter]             |
      |  [LPG Gas Depletion Gauge]              [Family Telecom Matrix Cards]                 |
      |  [Mobility & Fuel Curve]                [Categorical Pantry Spend Chart]              |
      +-------------------------------------------+-------------------------------------------+
                                                  | HTTP / JSON REST APIs
                                                  v
                              APPLICATION CONTROLLER & SECURITY LAYER
      +---------------------------------------------------------------------------------------+
      |  - RestAuthController       (/api/auth)      -> Register, Login, Session Status       |
      |  - ApiController            (/api/...)       -> Multi-tenant CRUD operations          |
      |  - AnalyticsController      (/api/analytics) -> Aggregated KPI Overview               |
      +-------------------------------------------+-------------------------------------------+
                                                  |
                                                  v
                                     SERVICE BUSINESS LOGIC
      +---------------------------------------------------------------------------------------+
      |  - PasswordValidator            -> Regex traditional complexity verification         |
      |  - ElectricityService           -> Progressive TNEB LT-IA dual-tier calculation       |
      |  - GasService                   -> ChronoUnit moving average depletion velocity       |
      |  - TelecomService               -> Validity countdowns & zero-day blackout alerts     |
      |  - TransportService             -> Odometer delta, mileage (km/L) and cost/km        |
      |  - GroceryService               -> Essential vs. discretionary spend categorization   |
      +-------------------------------------------+-------------------------------------------+
                                                  |
                                                  v
                                     DATA PERSISTENCE (JPA / H2)
      +---------------------------------------------------------------------------------------+
      |  - UserRepository, ElectricityRecordRepository, GasRecordRepository                   |
      |  - TelecomRecordRepository, TransportRecordRepository, GroceryRecordRepository        |
      +---------------------------------------------------------------------------------------+
```

---

## 💻 Technology Stack

### Backend
- **Language:** Java 17 LTS
- **Framework:** Spring Boot 3.3.4 (Spring Web, Spring Security, Spring Data JPA, Validation)
- **Database:** Embedded H2 Database (File persistent / MySQL 8 compatible)
- **Build System:** Apache Maven 3.9+
- **Testing:** JUnit 5 Jupiter, Mockito, Spring Boot Test (`@WebMvcTest`, `@SpringBootTest`)

### Frontend
- **Framework:** React 19 (TypeScript)
- **Tooling:** Vite 5
- **Styling:** Tailwind CSS 3.4 (Obsidian Dark Glassmorphism Design System)
- **Icons:** Lucide React
- **HTTP Client:** Native Fetch with Session Credentials

---

## 🚀 Getting Started

### Prerequisites
- **JDK 17 or higher** installed (`java -version`)
- **Node.js 18+ and npm** installed (`node -v`, `npm -v`)
- **Git** installed

### Backend Setup (Spring Boot)
1. Clone the repository:
   ```bash
   git clone https://github.com/Rithish-2007/GauntletSmartLedger.git
   cd GauntletSmartLedger
   ```
2. Run the Spring Boot application:
   ```bash
   # On Windows
   .\mvnw.cmd spring-boot:run

   # On Linux / macOS
   ./mvnw spring-boot:run
   ```
   The backend server starts at **`http://localhost:8080`**.

### Frontend Setup (React + Vite)
1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. The user interface will launch at **`http://localhost:5173`**.

### Default Demo Credentials
- **Username:** `admin`
- **Password:** `Admin@12345`

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user with traditional password validation |
| `POST` | `/api/auth/login` | Authenticate user session |
| `POST` | `/api/auth/logout` | Invalidate user session |
| `GET` | `/api/auth/status` | Check current authenticated user session |
| `GET` | `/api/analytics/overview` | Aggregated dashboard KPIs across all 5 utility pillars |
| `POST` | `/api/electricity/calculate` | Compute TNEB slab breakdown and sub-meter fair shares |
| `GET` | `/api/gas/active` | Get active LPG cylinder status and projected empty date |
| `GET` | `/api/telecom/matrix` | Get all family telecom recharge countdowns |
| `POST` | `/api/transport/mileage` | Calculate vehicle mileage (km/L) and cost per km |
| `GET` | `/api/groceries/summary` | Pantry spend breakdown and essential vs. discretionary ratio |

---

## 🧪 Automated Testing Suite (56/56 Tests)

GauntletSmartLedger features a comprehensive automated test suite with **100% pass rate**:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.smartledger.security.PasswordValidatorTest           -> 9 passed
[INFO] Running com.smartledger.service.ElectricityCalculationEngineTest -> 15 passed
[INFO] Running com.smartledger.service.GasDepletionEngineTest           -> 8 passed
[INFO] Running com.smartledger.service.TelecomMatrixEngineTest          -> 6 passed
[INFO] Running com.smartledger.service.TransportAnalyticsEngineTest     -> 6 passed
[INFO] Running com.smartledger.controller.RestAuthControllerTest        -> 6 passed
[INFO] Running com.smartledger.controller.ApiControllerTest             -> 6 passed
[INFO] 
[INFO] Results: Tests run: 56, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Run tests locally anytime with:
```bash
.\mvnw.cmd test
```

---

## 🎓 Academic Context

- **Institution:** Chennai Institute of Technology (Autonomous), Affiliated to Anna University, Chennai
- **Program:** Bachelor of Engineering (B.E.) in Computer Science and Engineering
- **Component:** Project-Based Learning (PBL) — Java Programming
- **Project Report:** A complete 8-chapter Project-Based Learning report is available in [`plan.md`](plan.md).

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
