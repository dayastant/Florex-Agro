# FLORAX Agropix - Smart Precision Irrigation Platform

FLORAX Agropix is an enterprise-grade IoT-powered Smart Precision Agriculture and Irrigation Management System. This repository contains the full monorepo codebase submitted for the **Monetise with IdeaMart APIs Challenge**.

---

## 🏆 Challenge Track & Integration Map

*   **Chosen Track**: **Carrier Billing / OTP & Best Omni AI Integration**
*   **IdeaMart APIs Integrated**:
    1.  **IdeaMart Omni AI API** (`/omniai/api`): Powers our Premium AI Agronomist Advisor to generate dynamic crop schedules, moisture telemetry audits, and soil preserve directives.
    2.  **IdeaMart Charging API (Carrier Billing)**: Simulated direct balance debit payment flow (daily subscription at 5 LKR/day) to gate premium advisor content.
    3.  **IdeaMart OTP API**: Simulated One-Time PIN verification check allowing users to activate a free 30-day trial securely.

---

## 🏗️ Tech Stack

*   **Backend API Core**: ASP.NET Core Web API (.NET 10) built following Clean Architecture principles (Domain, Application, Infrastructure, API).
*   **Web Client Dashboard**: React, TypeScript, and Vite styled with premium modern utilities.
*   **Mobile Client App**: Expo SDK 54, React Native, and Zustand state storage.

---

## 📂 Project Structure

```
├── Backend/               # ASP.NET Core Clean Architecture Web API
│   ├── src/
│   │   ├── FLORAX.API/          # Controllers, Endpoints, and Swagger
│   │   ├── FLORAX.Application/  # CQRS Handlers, MediatR, and DTOs
│   │   ├── FLORAX.Infrastructure/# EF Core Persistence, SQL seed, MQTT
│   │   └── FLORAX.Domain/       # Domain Rules, Entities, and Events
│   └── tests/                   # Backend Unit & Integration Tests
│
├── Frontend/              # React Web Client Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       └── AiAdvisorTab.tsx # Premium Paywall & Omni AI Integration
│   │   └── pages/
│   │       └── DashboardPage.tsx    # Main Sidebar Dashboard Shell
│   └── .env.local         # Local environment key (Ignored by Git)
│
├── Mobile/                # Cross-platform Expo Mobile Client
└── docs/                  # Architecture overview, ERD diagrams, and PUML
```

---

## 🔐 Security & Keys Policy

To satisfy security criteria and prevent API credential exposure:
1. No API keys, secrets, or tokens are committed to this repository or exposed in client bundles.
2. The live IdeaMart Omni AI key is read strictly at runtime from `Frontend/.env.local`.
3. The environment file is excluded from git control via the `.gitignore` policy.

---

## 🚀 Local Setup & Run Instructions

### 1. Configure Keys
Create a file named `.env.local` inside the `Frontend/` folder:
```env
VITE_IDEAMART_OMNI_AI_KEY=app_<yourKeyId>.<yourKeyValue>
```
*(If no key is configured, the application falls back to a sandbox simulator mode with sample advisory output, ensuring it never crashes).*

### 2. Run the Frontend Web Dashboard
1. Navigate to the `Frontend/` directory:
   ```bash
   cd Frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173/` (or the terminal's reported URL).

### 3. Run the Backend API Core (Optional)
1. Navigate to the `Backend/` directory:
   ```bash
   cd Backend
   ```
2. Build the Clean Architecture solution:
   ```bash
   dotnet build
   ```
3. Run the Web API:
   ```bash
   dotnet run --project src/FLORAX.API/FLORAX.API.csproj
   ```