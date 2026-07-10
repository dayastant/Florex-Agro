# FLORAX AGROPIX - MOBILE APP FEATURES INDEX (USERS GUIDE)

This document catalogs all the features available to users in the **FLORAX Agropix Mobile App**, categorized by role-based modules.

---

## 📱 User Modules & Screens

### 🔐 1. Authentication & Profile
- **Secure Log In / Registration**: Access account using secure credentials.
- **Persistent Sessions**: "Remember Me" keeps you signed in securely using device-level encryption.
- **User Role Identification**: Dashboard layout adapts dynamically based on whether you are logged in as a **Farmer/Admin** or a **Field Technician**.
- **Dark Mode Support**: Toggle between Light and Dark mode directly from Settings.

---

### 📊 2. Live Agronomic Dashboard
- **Average Soil Moisture Progress**: Circular gauge illustrating real-time farm-wide average moisture percentage.
- **System Health Status Alert**: Visual banner showing overall hardware grid health (`Healthy`, `Low battery warnings`, or `Critical offline nodes`).
- **Interactive Zone Quick-Selector**: Easily flip through your agricultural zones (e.g. North Orchard, Vineyards).
- **Recent Telemetry Metrics**: Instantly view the latest moisture level indicator matching the selected zone.

---

### 🌱 3. Farm & Zone Manager
- **Geographic Farms Overview**: View list of registered farms with district, province, and total area coverage.
- **Crop Profile Management**: Edit crop type classifications (e.g. Apples, Grapes) and soil types (e.g. Clay Loam, Sandy Loam) for each sub-zone.
- **IoT Node Association**: Allocate or assign physical IoT sensor devices to specific fields/zones.

---

### 💧 4. Irrigation Control Switchboard
- **Water Pump Actuator Controls**:
  - Live status indicator (Idle/Running) for each water pump motor.
  - One-tap override switch to manually turn pumps on or off.
  - Runtime log to track how long pumps have been running.
- **Zone Pipeline Solenoid Valves**: Toggle individual solenoid valves to control direct water flow to specific sections.
- **Audit Activity Logs**: Feed of recent triggers showing who (or what schedule) performed irrigation actions.
- **One-Touch Manual Cycle**: Run a temporary irrigation cycle for any zone, which turns off automatically.

---

### 🛢️ 5. Water Reservoirs & Tanks
- **Live Volumetric Tracking**: Fluid-filled capacity meters showing exactly how many liters of water remain in reservoirs.
- **Low Water Alarm**: Immediate alerts when water level drops below critical margins.
- **Tank Inlet & Outlet Controls**: Open or close intake valves for water tanks directly from the app.

---

### 🛠️ 6. Hardware Diagnostics Sweep
- **Hardware Inventory Table**: Complete list of sensor device serial codes, types, and statuses.
- **IoT Battery Diagnostics**: Real-time percentage indicator of sensor node battery status. Warning highlights appear for levels under 30%.
- **Wifi Connection Strengths**: Signal strength logs for all deployed devices.
- **Technician Diagnostics Sweep**:
  - Perform an instant hardware diagnostic sweeps.
  - Live log console detailing operational status of all micro-pumps, sensors, and water tanks.

---

### 📈 7. Telemetry Trends & Export
- **Agronomic Charts**: Interactive line graphs tracking moisture changes over the last 24 hours, week, or month.
- **Historical Logs Archive**: Review every single moisture reading event.
- **CSV Log Exports**: Download data archives directly to your phone storage to open in Excel or share.

---

## ⚙️ 8. Alarm Threshold Configurations
- **Soil Moisture Limits**: Set minimum moisture percentages to alert you before soil becomes critically dry.
- **Temperature & Weather Adjustments**: Set maximum temperature flags to automatically prompt irrigation adjustments during hot spells.
- **Broker Configuration**: Configure communication paths (MQTT) for custom hardware settings.
