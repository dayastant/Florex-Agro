# FLORAX AGROPIX - MOBILE APPLICATION BUILD PROMPT & SPECIFICATION

This document outlines the prompt and technical specification for building the mobile version of **FLORAX Agropix** (compatible with iOS and Android). Use this specification as a blueprint or system prompt for an AI agent or developers to build the app from scratch.

---

## 1. Project Context & Objectives
**FLORAX Agropix** is an IoT-powered smart agriculture and precision irrigation platform. The mobile application should allow farmers, administrators, and field technicians to monitor soil moisture, manage farm zones, override pump motors, manage water assets, trace sensor diagnostics, and configure automated irrigation parameters directly from their mobile devices.

---

## 2. Tech Stack Requirements
- **Framework**: React Native with **Expo SDK 54** (using Expo prebuild/development builds).
- **Navigation & Routing**: **Expo Router** (file-based routing, tab-based layouts in `app/(tabs)`).
- **Language**: TypeScript (fully typed interfaces for all API payloads and states).
- **Styling**: **NativeWind v4** (Tailwind CSS for React Native) for custom styling utility classes.
- **State Management**: **Zustand** for lightweight client-side state storage.
- **Networking**: Axios (configured with interceptors to automatically append JWT bearer token from secure storage).
- **Secure Storage**: `expo-secure-store` for persistent storage of user credentials and JWT auth tokens.
- **Micro-interactions**: `expo-haptics` for tactile vibration feedback when toggling pump motors and valves.
- **Charts**: `react-native-wagmi-charts` or `react-native-chart-kit` for interactive moisture telemetry charts.
- **Icons**: `@expo/vector-icons` using Lucide glyphs.

---

## 3. UI/UX & Design Guidelines
- **Color Palette**: 
  - Primary: Emerald Green (`#059669` / `#10B981`)
  - Secondary: Teal/Cyan (`#0D9488` / `#06B6D4`)
  - Accent/Alert: Water Blue (`#2563EB`), Critical dry (`#EF4444`), Warning/Low battery (`#F59E0B`)
  - Backgrounds: Premium dark/light themes supported. By default, clean white cards on a soft slate background (`#F8FAFC`).
- **Typography**: Clean, readable sans-serif (e.g., Inter, Outfit).
- **Interactions**: Haptic feedback on toggling water pumps or valves, smooth transitions between tab screens, pull-to-refresh on all list views.

---

## 4. User Personas & Permissions
The mobile app must support roles with adaptive dashboards:
1. **Administrators / Farmers**: Full control over Farm creation, zone allocation, telemetry threshold settings, motor/valve overrides, and team inviting.
2. **Field Technicians**: Access to hardware-specific tab (Diagnostics Sweep, sensor details, device battery, and offline log tracking).

---

## 5. Screen-by-Screen Feature Specification

### Screen 1: Authentication & Launch Flow
- **Splash Screen**: Animated Florax Sprout logo.
- **Sign In Screen**:
  - Inputs: Email and Password.
  - Features: "Remember Me" toggle, password visibility toggle.
  - Action: Connects to `/api/v1/auth/login` to retrieve the JWT token and user profile, persisting it to SecureStore (iOS) / EncryptedSharedPreferences (Android).

### Screen 2: Dashboard Overview (Main Home)
- **Aggregated Summary Cards**:
  - System Status: Healthy (green) / Attention needed (orange/red).
  - Total Farms & Zones count.
  - Active Sensors count.
  - Average Soil Moisture indicator (e.g. Circular progress meter indicating `65.5%`).
- **Zone Selector**: Dropdown or horizontal card list of user's active zones (e.g., North Orchard, Vineyard).
- **Live Telemetry Meter**: Displays the most recent moisture level for the selected zone with color indicators (Optimal vs Critical Dry).
- **Quick Actions**:
  - "Trigger Manual Irrigation" button (triggers a timed irrigation cycle for the current zone).

### Screen 3: Farms & Zones Management
- **Farms List**: View all registered farms (Farm Name, District, Province, Total Area).
- **Zone Details (Nested view)**:
  - Add a new Zone or edit crop type (e.g., Apples, Grapes), soil profile (e.g., Clay Loam, Sandy Loam), and area.
  - Associate sensor devices to specific zones.

### Screen 4: Irrigation Pumps & Valve Overrides
- **Pump Motor Switchboard**:
  - List of active pumps (e.g., Main Irrigation Pump A, West Booster Pump B) with power ratings (e.g., `15 HP`).
  - Interactive **Toggle Switches** to instantly start/stop pump motors.
  - Real-time **Runtime Hours** counter.
- **Solenoid Valve Overrides**:
  - Interactive valve list to open/close water flow valves for specific zones.
- **Live Activity Logs**: Scrollable feed showing recent triggers (e.g. `Main Pump A started cycle for North Orchard at 07:45 AM by Auto-Schedule`).

### Screen 5: Water Assets & Reservoir Monitoring
- **Tanks & Reservoirs List**:
  - Visual water level cards indicating tank capacity (e.g., `14200 L / 20000 L`) using fluid fill animations.
  - Low water alarm flags.
- **Inlet & Outlet Solenoid Valves**: Toggle switches to open/close inlet and outlet pipelines for filling or draining reservoirs.

### Screen 6: IoT Sensor Node Diagnostics
- **Sensor Registry**: Detailed list of deployed hardware nodes (e.g., `FX-SOIL-N1`, `FX-AUX-D2`).
- **Real-Time Health Metrics**:
  - Battery levels (`%` battery indicator with warning colors under `30%`).
  - Wifi Signal strength indicator (`%` signal strength).
  - Firmware Version and installation date.
  - Online/Offline status badge.
- **Diagnostics Sweep (Technician Special)**:
  - Button to request an instant hardware sweep.
  - Live console terminal view logging status updates (e.g., `Scanning sensor nodes... OK`, `Reservoir capacity sweep... OK`).

### Screen 7: Historical Telemetry Analytics & Trends
- **Moisture Level Line Chart**: Interactive graph showing soil moisture levels over time (last 24 hours, last 7 days, last 30 days).
- **Historical Database Archive**:
  - Detailed table list of individual soil moisture logs with timestamp, zone, sensor, and state indicator (OPTIMAL vs CRITICAL DRY).
- **CSV Data Export**: Button to export current logs into a downloadable CSV report.

### Screen 8: Settings & Threshold Parameters
- **Agronomic Threshold Parameters**:
  - Minimum Soil Moisture threshold slider (e.g. default `35%`).
  - Maximum Temperature threshold slider.
- **IoT & Network Configuration**:
  - MQTT Broker configuration endpoint.
  - Target email addresses for alert routing.
- **Profile / App Settings**:
  - Language selection (English, Turkish, etc.).
  - Dark Mode theme toggle.
  - Log Out button.

---

## 6. Backend API Integration Map

The mobile app must connect to the following REST API endpoints:

| Endpoint | HTTP Method | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | `POST` | Authenticate user and fetch token | `{ "email": "tech@florax.com", "password": "..." }` |
| `/api/v1/dashboard/summary` | `GET` | Retrieve summary totals | *(None)* |
| `/api/v1/farms` | `GET` / `POST` | Fetch or register farms | `{ "farmName": "...", "totalArea": 12.5 }` |
| `/api/v1/irrigationzones/farm/{farmId}` | `GET` | Get zones linked to a farm | *(None)* |
| `/api/v1/soilmoisture/zone/{zoneId}` | `GET` | Fetch moisture readings | *(None)* |
| `/api/v1/soilmoisture` | `POST` | Inject/log simulated reading | `{ "sensorId": "...", "zoneId": "...", "moisturePercentage": 45.0 }` |
| `/api/v1/motors` | `GET` | Fetch pump actuators status | *(None)* |
| `/api/v1/watertanks` | `GET` | Fetch water levels and valves | *(None)* |
| `/api/v1/sensordevices` | `GET` | Get IoT sensor list and battery | *(None)* |
