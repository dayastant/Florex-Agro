import axios from 'axios';
import { Platform } from 'react-native';

const HOST_IP = '172.20.97.36';
const BASE_URL = Platform.OS === 'web' ? 'http://localhost:5222' : `http://${HOST_IP}:5222`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken: string | null = null;
let loggedUser: any = null;

export const setAuthToken = (token: string | null) => { authToken = token; };
export const setLoggedUser = (user: any) => { loggedUser = user; };
export const getLoggedUser = () => loggedUser;

apiClient.interceptors.request.use(
  (config) => {
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    const { data } = response.data;
    if (data?.token) setAuthToken(data.token);
    if (data?.user)  setLoggedUser(data.user);
    return response.data;
  },
  logout: () => { setAuthToken(null); setLoggedUser(null); },
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get('/api/v1/dashboard/summary');
    return response.data;
  },
};

// ─── Farms ────────────────────────────────────────────────────────────────
export const farmService = {
  getFarms: async (ownerId?: string) => {
    const url = ownerId ? `/api/v1/farms?ownerId=${ownerId}` : '/api/v1/farms';
    const response = await apiClient.get(url);
    return response.data;
  },
  getFarm: async (farmId: string) => {
    const response = await apiClient.get(`/api/v1/farms/${farmId}`);
    return response.data;
  },

  // ── Zones ────────────────────────────────────────────────────────────────
  getZonesByFarm: async (farmId: string) => {
    const response = await apiClient.get(`/api/v1/irrigationzones/farm/${farmId}`);
    return response.data;
  },
  getZone: async (zoneId: string) => {
    const response = await apiClient.get(`/api/v1/irrigationzones/${zoneId}`);
    return response.data;
  },
  createZone: async (data: {
    farmId: string;
    zoneName: string;
    cropType?: string;
    soilType?: string;
    area?: number;
  }) => {
    const response = await apiClient.post('/api/v1/irrigationzones', data);
    return response.data;
  },
  updateZone: async (zoneId: string, data: {
    zoneName?: string;
    cropType?: string;
    soilType?: string;
    area?: number;
  }) => {
    const response = await apiClient.put(`/api/v1/irrigationzones/${zoneId}`, data);
    return response.data;
  },
  deleteZone: async (zoneId: string) => {
    const response = await apiClient.delete(`/api/v1/irrigationzones/${zoneId}`);
    return response.data;
  },
};

// ─── Telemetry / Valve control ────────────────────────────────────────────
export const telemetryService = {
  getMoistureReadings: async (zoneId: string) => {
    const response = await apiClient.get(`/api/v1/soilmoisture/zone/${zoneId}`);
    return response.data;
  },
  createMoistureReading: async (sensorId: string, zoneId: string, moisturePercentage: number) => {
    const response = await apiClient.post('/api/v1/soilmoisture', { sensorId, zoneId, moisturePercentage });
    return response.data;
  },
  updateValveStatus: async (zoneId: string, status: string) => {
    const response = await apiClient.put(`/api/v1/irrigationzones/${zoneId}/status`, { status });
    return response.data;
  },
};

// ─── Irrigation / Schedules ───────────────────────────────────────────────
export const irrigationService = {
  startManual: async (zoneId: string, durationMinutes: number) => {
    const response = await apiClient.post('/api/v1/irrigation/manual/start', { zoneId, durationMinutes });
    return response.data;
  },
  stopManual: async (zoneId: string) => {
    const response = await apiClient.post('/api/v1/irrigation/manual/stop', { zoneId });
    return response.data;
  },
  getSchedules: async (farmId?: string) => {
    const url = farmId ? `/api/v1/irrigationschedules?farmId=${farmId}` : '/api/v1/irrigationschedules';
    const response = await apiClient.get(url);
    return response.data;
  },
  createSchedule: async (data: {
    zoneId: string;
    startTime: string;
    durationMinutes: number;
    daysOfWeek: string[];
    isEnabled: boolean;
  }) => {
    const response = await apiClient.post('/api/v1/irrigationschedules', data);
    return response.data;
  },
  toggleSchedule: async (scheduleId: string, isEnabled: boolean) => {
    const response = await apiClient.patch(`/api/v1/irrigationschedules/${scheduleId}`, { isEnabled });
    return response.data;
  },
  deleteSchedule: async (scheduleId: string) => {
    const response = await apiClient.delete(`/api/v1/irrigationschedules/${scheduleId}`);
    return response.data;
  },
};

// ─── Hardware ─────────────────────────────────────────────────────────────
export const hardwareService = {
  getMotors: async (farmId?: string) => {
    const url = farmId ? `/api/v1/motors?farmId=${farmId}` : '/api/v1/motors';
    const response = await apiClient.get(url);
    return response.data;
  },
  updateMotor: async (motorId: string, isRunning: boolean, speed?: number) => {
    const response = await apiClient.patch(`/api/v1/motors/${motorId}`, { isRunning, speed });
    return response.data;
  },
  getValves: async (farmId?: string) => {
    const url = farmId ? `/api/v1/valvecontrollers?farmId=${farmId}` : '/api/v1/valvecontrollers';
    const response = await apiClient.get(url);
    return response.data;
  },
  updateValve: async (valveId: string, isOpen: boolean) => {
    const response = await apiClient.patch(`/api/v1/valvecontrollers/${valveId}`, { isOpen });
    return response.data;
  },
  getTanks: async (farmId?: string) => {
    const url = farmId ? `/api/v1/watertanks?farmId=${farmId}` : '/api/v1/watertanks';
    const response = await apiClient.get(url);
    return response.data;
  },
  getSensors: async (farmId?: string) => {
    const url = farmId ? `/api/v1/sensordevices?farmId=${farmId}` : '/api/v1/sensordevices';
    const response = await apiClient.get(url);
    return response.data;
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportService = {
  getWaterUsage: async (farmId?: string) => {
    const url = farmId ? `/api/v1/reports/waterusage?farmId=${farmId}` : '/api/v1/reports/waterusage';
    const response = await apiClient.get(url);
    return response.data;
  },
  getMoistureHistory: async (zoneId: string, days = 7) => {
    const response = await apiClient.get(`/api/v1/soilmoisture/zone/${zoneId}?days=${days}`);
    return response.data;
  },
  getIrrigationEvents: async (farmId?: string) => {
    const url = farmId ? `/api/v1/reports/irrigationevents?farmId=${farmId}` : '/api/v1/reports/irrigationevents';
    const response = await apiClient.get(url);
    return response.data;
  },
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationService = {
  getAll: async () => {
    const response = await apiClient.get('/api/v1/notifications');
    return response.data;
  },
  markRead: async (id: string) => {
    const response = await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await apiClient.post('/api/v1/notifications/mark-all-read');
    return response.data;
  },
};

// ─── Users / Profile ──────────────────────────────────────────────────────
export const userService = {
  getUsers: async () => {
    const response = await apiClient.get('/api/v1/users');
    return response.data;
  },
  updateUser: async (id: string, fullName: string, email: string, phone: string, roleId: string, status: string) => {
    const response = await apiClient.put(`/api/v1/users/${id}`, { id, fullName, email, phone, roleId, status });
    return response.data;
  },
  updateProfile: async (id: string, data: { fullName?: string; phone?: string }) => {
    const response = await apiClient.patch(`/api/v1/users/${id}/profile`, data);
    return response.data;
  },
  changePassword: async (id: string, currentPassword: string, newPassword: string) => {
    const response = await apiClient.post(`/api/v1/users/${id}/change-password`, { currentPassword, newPassword });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};

export default apiClient;
