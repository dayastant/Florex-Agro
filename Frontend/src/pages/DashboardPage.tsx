import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sprout, LogOut, ChevronLeft, ChevronRight, Layers, Cpu, CloudRain, Database, BarChart3, Users, Sliders, LayoutDashboard, Clock, Plus, Trash, RefreshCw, Calendar
} from 'lucide-react';
import api from '../services/api';

// Import Tab Components
import OverviewTab from '../components/dashboard/OverviewTab';
import FarmsTab from '../components/dashboard/FarmsTab';
import IrrigationTab from '../components/dashboard/IrrigationTab';
import SensorsTab from '../components/dashboard/SensorsTab';
import WaterTab from '../components/dashboard/WaterTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import TeamTab from '../components/dashboard/TeamTab';
import SettingsTab from '../components/dashboard/SettingsTab';

interface Farm {
  id: string;
  farmName: string;
  district: string;
  province: string;
  totalArea: number;
}

interface Zone {
  id: string;
  zoneName: string;
  cropType: string;
  soilType: string;
  area: number;
  status: string;
}

interface Telemetry {
  moisturePercentage: number;
  recordedAt: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const navigate = useNavigate();
  const { tab } = useParams();

  // Navigation and sidebar collapse
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setActiveTab(tab || 'overview');
  }, [tab]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modular data states loaded from API
  const [motors, setMotors] = useState<any[]>([]);
  const [isLoadingMotors, setIsLoadingMotors] = useState(false);

  const [tanks, setTanks] = useState<any[]>([]);
  const [isLoadingTanks, setIsLoadingTanks] = useState(false);

  const [sensorDevices, setSensorDevices] = useState<any[]>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const [selectedFarmIdForSchedule, setSelectedFarmIdForSchedule] = useState('');
  const [zonesForSelectedFarmSchedule, setZonesForSelectedFarmSchedule] = useState<any[]>([]);
  const [isLoadingZonesForSchedule, setIsLoadingZonesForSchedule] = useState(false);

  const handleFarmChangeForSchedule = async (farmId: string) => {
    setSelectedFarmIdForSchedule(farmId);
    if (!farmId) {
      setZonesForSelectedFarmSchedule([]);
      return;
    }
    setIsLoadingZonesForSchedule(true);
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      setZonesForSelectedFarmSchedule(res.data.data || []);
    } catch (err) {
      console.error('Failed to load zones for schedule:', err);
      setZonesForSelectedFarmSchedule([]);
    } finally {
      setIsLoadingZonesForSchedule(false);
    }
  };

  // Settings state
  const [settings, setSettings] = useState({
    minMoistureThreshold: 35,
    maxTempThreshold: 38,
    leakDetection: true,
    mqttBroker: 'mqtt://localhost:1883',
    alertEmails: 'admin@florax.com, alerts@florax.com'
  });

  // Client activities timeline log
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, time: '07:45 AM', event: 'Main Pump A started cycle for North Orchard', user: 'System Schedule' },
    { id: 2, time: '06:12 AM', event: 'Manual override: West Booster Pump set to IDLE', user: 'Clara Oswald' },
    { id: 3, time: 'Yesterday', event: 'Completed 2-hour drip cycle on Greenhouse 2', user: 'Auto-schedule' }
  ]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed parsing stored user', err);
      }
    }
  }, []);

  // Fetch contextual module data depending on active tab
  useEffect(() => {
    if (activeTab === 'irrigation') {
      fetchMotors();
    } else if (activeTab === 'water') {
      fetchTanks();
    } else if (activeTab === 'sensors') {
      fetchSensors();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'schedules') {
      fetchSchedules();
    }
  }, [activeTab, zones]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, farmsRes] = await Promise.all([
        api.get('api/v1/dashboard/summary'),
        api.get('api/v1/farms')
      ]);

      setSummary(summaryRes.data.data);
      const rawFarms = farmsRes.data.data || [];
      // Normalize PascalCase API response → camelCase for consistent JSX use
      const farmData: Farm[] = rawFarms.map((f: any) => ({
        id: f.Id ?? f.id,
        farmName: f.FarmName ?? f.farmName,
        district: f.District ?? f.district,
        province: f.Province ?? f.province,
        totalArea: f.TotalArea ?? f.totalArea,
      }));
      setFarms(farmData);

      if (farmData.length > 0) {
        handleFarmSelect(farmData[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSelect = async (farm: Farm) => {
    setSelectedFarm(farm);
    setSelectedZone(null);
    setTelemetry([]);
    try {
      const zonesRes = await api.get(`api/v1/irrigationzones/farm/${farm.id}`);
      const zoneData = zonesRes.data.data || [];
      setZones(zoneData);
      
      if (zoneData.length > 0) {
        handleZoneSelect(zoneData[0]);
      }
    } catch (err) {
      console.error('Error loading zones:', err);
    }
  };

  const handleZoneSelect = async (zone: Zone) => {
    setSelectedZone(zone);
    try {
      const readingRes = await api.get(`api/v1/soilmoisture/zone/${zone.id}`);
      setTelemetry(readingRes.data.data || []);
    } catch (err) {
      console.error('Error loading moisture telemetry:', err);
    }
  };

  // API Call: Fetch Motors from backend service
  const fetchMotors = async () => {
    setIsLoadingMotors(true);
    try {
      const res = await api.get('api/v1/motors');
      const data = res.data.data || [];
      setMotors(data.map((m: any) => ({
        id: m.id,
        motorName: m.motorName,
        powerRating: m.powerRating || '15 HP',
        status: m.status,
        runtimeHours: m.runtimeHours
      })));
    } catch (err) {
      console.error('Failed fetching motors:', err);
    } finally {
      setIsLoadingMotors(false);
    }
  };

  // API Call: Fetch Tanks from backend service
  const fetchTanks = async () => {
    setIsLoadingTanks(true);
    try {
      const res = await api.get('api/v1/watertanks');
      const data = res.data.data || [];
      setTanks(data.map((t: any) => ({
        id: t.id,
        farmId: t.farmId,
        name: t.tankName,
        capacity: t.capacityLiters,
        currentLevel: t.currentLevel,
        status: t.status,
        inletOpen: false,
        outletOpen: false
      })));
    } catch (err) {
      console.error('Failed fetching tanks:', err);
    } finally {
      setIsLoadingTanks(false);
    }
  };

  // API Call: Fetch Sensors from backend service
  const fetchSensors = async () => {
    setIsLoadingSensors(true);
    try {
      const res = await api.get('api/v1/sensordevices');
      const data = res.data.data || [];
      setSensorDevices(data.map((d: any) => ({
        id: d.id,
        zoneId: d.zoneId,
        deviceSerial: d.deviceSerial,
        sensorType: d.sensorType,
        firmwareVersion: d.firmwareVersion,
        batteryPercentage: d.batteryPercentage,
        signalStrength: d.signalStrength,
        status: d.status,
        installedAt: d.installedAt
      })));
    } catch (err) {
      console.error('Failed fetching sensors:', err);
    } finally {
      setIsLoadingSensors(false);
    }
  };

  // API Call: Fetch Users from backend service
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const [usersRes, farmsRes] = await Promise.all([
        api.get('api/v1/users'),
        api.get('api/v1/farms')
      ]);

      const latestFarms = farmsRes.data.data || [];
      setFarms(latestFarms);

      const data = usersRes.data.data || [];
      setTeamMembers(data.map((u: any) => {
        const assignedFarm = latestFarms.find((f: any) => f.ownerId === u.id);
        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: u.roleId,
          phone: u.phone,
          status: u.status,
          assignedFarmId: assignedFarm?.id,
          assignedFarmName: assignedFarm?.farmName
        };
      }));
    } catch (err) {
      console.error('Failed fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchSchedules = async () => {
    if (zones.length === 0) {
      setSchedules([]);
      return;
    }
    setIsLoadingSchedules(true);
    try {
      const results = await Promise.all(
        zones.map(async (zone) => {
          try {
            const res = await api.get(`api/v1/irrigationschedules/zone/${zone.id}`);
            return (res.data.data || []).map((s: any) => ({
              ...s,
              zoneName: zone.zoneName
            }));
          } catch {
            return [];
          }
        })
      );
      setSchedules(results.flat());
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, isEnabled: boolean) => {
    try {
      await api.patch(`api/v1/irrigationschedules/${scheduleId}`, {
        isEnabled
      });
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, enabled: isEnabled } : s));
      alert(`Schedule ${isEnabled ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: any) {
      console.error('Failed to toggle schedule:', err);
      alert(err.response?.data?.message || 'Failed to toggle schedule.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await api.delete(`api/v1/irrigationschedules/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      alert('Schedule deleted successfully.');
    } catch (err: any) {
      console.error('Failed to delete schedule:', err);
      alert(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  const handleCreateSchedule = async (zoneId: string, startTime: string, durationMinutes: number, repeatType: string) => {
    try {
      await api.post('api/v1/irrigationschedules', {
        zoneId,
        startTime,
        durationMinutes,
        repeatType,
        isEnabled: true,
        createdBy: currentUser?.id || '99999999-9999-9999-9999-999999999999'
      });
      fetchSchedules();
      alert('Schedule created successfully!');
    } catch (err: any) {
      console.error('Failed to create schedule:', err);
      alert(err.response?.data?.message || 'Failed to create schedule.');
    }
  };

  const handleTriggerIrrigation = async () => {
    if (!selectedZone) return;
    setTriggering(true);
    setTimeout(() => {
      setTriggering(false);
      alert(`Irrigation cycle triggered successfully for zone: ${selectedZone.zoneName}`);
      
      const newLog = {
        id: Date.now(),
        time: 'Just Now',
        event: `Manual irrigation triggered on ${selectedZone.zoneName}`,
        user: currentUser?.FullName || 'Admin User'
      };
      setActivityLogs([newLog, ...activityLogs]);
    }, 1500);
  };

  const handleToggleMotor = (motorId: string) => {
    setMotors(motors.map(m => {
      if (m.id === motorId) {
        const isRunning = m.status === 'Running';
        const newStatus = isRunning ? 'Idle' : 'Running';
        
        const log = {
          id: Date.now(),
          time: 'Just Now',
          event: `${m.motorName} set status to ${newStatus.toUpperCase()}`,
          user: currentUser?.FullName || 'Admin User'
        };
        setActivityLogs([log, ...activityLogs]);

        return {
          ...m,
          status: newStatus
        };
      }
      return m;
    }));
  };

  const handleToggleValve = (zoneName: string, isOpen: boolean) => {
    const log = {
      id: Date.now(),
      time: 'Just Now',
      event: `Solenoid Valve for ${zoneName} set to ${isOpen ? 'OPEN' : 'CLOSED'}`,
      user: currentUser?.FullName || 'Admin User'
    };
    setActivityLogs([log, ...activityLogs]);
  };

  const handleToggleTankInlet = (tankId: string) => {
    setTanks(tanks.map(t => {
      if (t.id === tankId) {
        return { ...t, inletOpen: !t.inletOpen };
      }
      return t;
    }));
  };

  const handleToggleTankOutlet = (tankId: string) => {
    setTanks(tanks.map(t => {
      if (t.id === tankId) {
        return { ...t, outletOpen: !t.outletOpen };
      }
      return t;
    }));
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview Diagnostics';
      case 'farms': return 'Farm Management';
      case 'irrigation': return 'Irrigation & Motor Controls';
      case 'sensors': return 'IoT Sensor Devices';
      case 'water': return 'Water Assets & Reservoir levels';
      case 'schedules': return 'Irrigation Schedules';
      case 'analytics': return 'Telemetry Logs & Trends';
      case 'users': return 'Team Directory';
      case 'settings': return 'System Settings';
      default: return 'Dashboard';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'overview': return 'Live agronomic status overview, metrics, and immediate telemetry controls.';
      case 'farms': return 'Register and manage geographical farm sectors, areas, and zones.';
      case 'irrigation': return 'Interactive control switches for active pump motors, solenoid valves, and logs.';
      case 'sensors': return 'Real-time battery metrics and diagnostic status of nodes.';
      case 'water': return 'Monitor reservoir storage volumes, capacity meters, and flow valves.';
      case 'schedules': return 'Configure daily, weekly, or interval automatic crop watering timers.';
      case 'analytics': return 'Examine moisture progress data tables and export historical report logs.';
      case 'users': return 'Manage platform permissions, email notifications, and invite technicians.';
      case 'settings': return 'Adjust telemetry trigger boundaries, broker configurations, and service credentials.';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading agronomic data...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'farms', label: 'Farms & Zones', icon: Layers },
    { id: 'irrigation', label: 'Irrigation Pumps', icon: CloudRain },
    { id: 'sensors', label: 'IoT Sensors', icon: Cpu },
    { id: 'water', label: 'Water Assets', icon: Database },
    { id: 'schedules', label: 'Schedules', icon: Clock },
    { id: 'analytics', label: 'Analytics & Logs', icon: BarChart3 },
    { id: 'users', label: 'Team Directory', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <aside className={`h-screen sticky top-0 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 border-b border-slate-200/70 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100 flex-shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-sm bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent tracking-wider truncate uppercase">
                Florax Agropix
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate('/dashboard/' + item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/70 bg-slate-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              {currentUser?.FullName ? currentUser.FullName.split(' ').map((n: string) => n[0]).join('') : 'AD'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{currentUser?.FullName || 'Florax Admin'}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.Email || 'admin@florax.com'}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSidebarCollapsed && (
            <button 
              onClick={handleLogout}
              className="w-full py-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 flex justify-center transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-base font-bold text-slate-800">{getTabTitle()}</h2>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">{getTabDescription()}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
              <span>API Gateway Connected</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewTab 
              summary={summary}
              farms={farms}
              selectedFarm={selectedFarm}
              zones={zones}
              selectedZone={selectedZone}
              telemetry={telemetry}
              triggering={triggering}
              onFarmSelect={handleFarmSelect}
              onZoneSelect={handleZoneSelect}
              onTriggerIrrigation={handleTriggerIrrigation}
              onNavigateToTab={(t) => navigate('/dashboard/' + t)}
            />
          )}

          {activeTab === 'farms' && (
            <FarmsTab 
              farms={farms}
              currentUser={currentUser}
              onFarmCreated={fetchDashboardData}
            />
          )}

          {activeTab === 'irrigation' && (
            <IrrigationTab 
              motors={motors}
              zones={zones}
              farms={farms}
              activityLogs={activityLogs}
              onToggleMotor={handleToggleMotor}
              onToggleValve={handleToggleValve}
              onMotorCreated={fetchMotors}
              onValveCreated={fetchMotors}
              isLoading={isLoadingMotors}
            />
          )}

          {activeTab === 'sensors' && (
            <SensorsTab 
              sensorDevices={sensorDevices}
              farms={farms}
              onSensorCreated={fetchSensors}
              isLoading={isLoadingSensors}
            />
          )}

          {activeTab === 'water' && (
            <WaterTab 
              tanks={tanks.filter(t => t.farmId === selectedFarm?.id)}
              farms={farms}
              selectedFarmId={selectedFarm?.id || ''}
              onToggleInlet={handleToggleTankInlet}
              onToggleOutlet={handleToggleTankOutlet}
              onTankCreated={fetchTanks}
              isLoading={isLoadingTanks}
            />
          )}

          {activeTab === 'schedules' && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Create Schedule Form */}
                <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Configure Schedule
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Create automatic timers for zone irrigation.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const fd = new FormData(form);
                      const zoneId = fd.get('zoneId') as string;
                      const startTime = fd.get('startTime') as string;
                      const durationMinutes = parseInt(fd.get('durationMinutes') as string) || 15;
                      const repeatType = fd.get('repeatType') as string;

                      if (!zoneId || !startTime) {
                        alert('Please select a zone and specify start time.');
                        return;
                      }

                      const timeStr = startTime.length === 5 ? `${startTime}:00` : startTime;
                      handleCreateSchedule(zoneId, timeStr, durationMinutes, repeatType);
                      form.reset();
                      setSelectedFarmIdForSchedule('');
                      setZonesForSelectedFarmSchedule([]);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Farm</label>
                      <select
                        value={selectedFarmIdForSchedule}
                        onChange={e => handleFarmChangeForSchedule(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="">-- Choose Farm --</option>
                        {farms.map((f: any) => (
                          <option key={f.id} value={f.id}>{f.farmName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Zone</label>
                      <select
                        name="zoneId"
                        required
                        disabled={!selectedFarmIdForSchedule || isLoadingZonesForSchedule}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-700 disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingZonesForSchedule ? 'Loading zones...' : '-- Choose Zone --'}
                        </option>
                        {zonesForSelectedFarmSchedule.map(z => (
                          <option key={z.id} value={z.id}>{z.zoneName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Time (24h)</label>
                      <input 
                        type="time"
                        name="startTime"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration (minutes)</label>
                      <input 
                        type="number"
                        name="durationMinutes"
                        required
                        min="1"
                        max="240"
                        defaultValue="15"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Repeat Cadence</label>
                      <select
                        name="repeatType"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-700"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Interval">Every 2 Days</option>
                      </select>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer font-semibold"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Schedule</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Schedules List */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Active Automatic Timers</h3>
                      <p className="text-xs text-slate-400 font-medium">List of all scheduled irrigation events for {selectedFarm?.farmName}.</p>
                    </div>
                    <button 
                      onClick={fetchSchedules}
                      disabled={isLoadingSchedules}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Refresh Schedules"
                      type="button"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSchedules ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    {isLoadingSchedules ? (
                      <div className="flex items-center gap-2 py-8 justify-center text-xs text-slate-400">
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading schedules...</span>
                      </div>
                    ) : schedules.length === 0 ? (
                      <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50/50">
                        <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-550 font-bold text-xs">No Active Schedules</p>
                        <p className="text-[10px] text-slate-400">Configure a schedule on the left to get started.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Zone</th>
                            <th className="pb-3 font-semibold">Start Time</th>
                            <th className="pb-3 font-semibold">Duration</th>
                            <th className="pb-3 font-semibold">Repeat Cadence</th>
                            <th className="pb-3 font-semibold">Status</th>
                            <th className="pb-3 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-650">
                          {schedules.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition">
                              <td className="py-3 font-bold text-slate-800">{item.zoneName}</td>
                              <td className="py-3 font-semibold text-slate-600">{item.startTime}</td>
                              <td className="py-3 font-medium text-slate-550">{item.durationMinutes} minutes</td>
                              <td className="py-3 font-semibold text-slate-500">{item.repeatType}</td>
                              <td className="py-3">
                                <button
                                  onClick={() => handleToggleSchedule(item.id, !item.enabled)}
                                  className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border cursor-pointer ${
                                    item.enabled 
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                      : 'bg-slate-100 border-slate-200 text-slate-500'
                                  }`}
                                >
                                  {item.enabled ? 'ENABLED' : 'DISABLED'}
                                </button>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleDeleteSchedule(item.id)}
                                  className="p-1 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition cursor-pointer"
                                  title="Delete Schedule"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab 
              farms={farms}
              sensorDevices={sensorDevices}
            />
          )}

          {activeTab === 'users' && (
            <TeamTab 
              teamMembers={teamMembers}
              farms={farms}
              onUserCreated={fetchUsers}
              isLoading={isLoadingUsers}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings}
              onUpdateSettings={setSettings}
              teamMembers={teamMembers}
            />
          )}
        </main>
      </div>
    </div>
  );
}
