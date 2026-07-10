import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sprout, LogOut, ChevronLeft, ChevronRight, Cpu, CloudRain, Database, BarChart3, 
  LayoutDashboard, ShieldCheck, Search, Info, RefreshCw, ClipboardList, Bell, FileText, CheckCircle, Plus
} from 'lucide-react';
import api from '../services/api';

// Reuse modular tab components
import OverviewTab from '../components/dashboard/OverviewTab';
import IrrigationTab from '../components/dashboard/IrrigationTab';
import SensorsTab from '../components/dashboard/SensorsTab';
import WaterTab from '../components/dashboard/WaterTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';

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

export default function TechnicianDashboardPage() {
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

  // Navigation sidebar states
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    setActiveTab(tab || 'overview');
  }, [tab]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Deployed hardware data states
  const [motors, setMotors] = useState<any[]>([]);
  const [isLoadingMotors, setIsLoadingMotors] = useState(false);

  const [tanks, setTanks] = useState<any[]>([]);
  const [isLoadingTanks, setIsLoadingTanks] = useState(false);

  const [sensorDevices, setSensorDevices] = useState<any[]>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);

  // Hardware Diagnostic Scan states
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [scanReport, setScanReport] = useState<string[]>([]);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanSummary, setScanSummary] = useState({ warnings: 0, errors: 0, ok: 0 });

  // Farm-to-Zone finder states
  const [finderFarmId, setFinderFarmId] = useState('');
  const [finderZones, setFinderZones] = useState<Zone[]>([]);
  const [finderLoading, setFinderLoading] = useState(false);

  // Maintenance & Alerts states
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([
    { id: 'm1', farmName: 'Florax Main Farm', targetName: 'Sensor FX-AUX-D2', category: 'Sensor Replacement', notes: 'Replaced faulty offline node with fresh serial, synced successfully.', status: 'Completed', date: '2026-07-06' },
    { id: 'm2', farmName: 'Florax Main Farm', targetName: 'Main Pump A', category: 'Actuator Maintenance', notes: 'Serviced pump contactor and verified standard operating pressure.', status: 'Completed', date: '2026-07-07' }
  ]);

  useEffect(() => {
    // 1. Guard check: must be a logged-in technician
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userJson) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userJson);
    if (user.roleId !== '33333333-3333-3333-3333-333333333333') {
      // Redirect non-technicians back to their main dashboard
      navigate('/dashboard');
      return;
    }

    setCurrentUser(user);

    const storedLogs = localStorage.getItem('maintenance_logs');
    if (storedLogs) {
      setMaintenanceLogs(JSON.parse(storedLogs));
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch core summary and farms
      const summaryRes = await api.get('api/v1/dashboard/summary');
      setSummary(summaryRes.data.data);

      const farmsRes = await api.get('api/v1/farms');
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
        await handleFarmSelect(farmData[0]);
        setFinderFarmId(farmData[0].id);
        fetchFinderZones(farmData[0].id);
      }

      // Concurrently load diagnostic hardware metrics
      await Promise.all([
        fetchMotors(),
        fetchTanks(),
        fetchSensors(),
        fetchAlerts()
      ]);
    } catch (err) {
      console.error('Error fetching technician metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const res = await api.get('api/v1/notifications');
      const list = res.data.data || [];
      setAlerts(list.filter((n: any) => !n.isRead));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.put(`api/v1/notifications/${alertId}/resolve`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      alert('Alert resolved and dismissed successfully!');
    } catch (err: any) {
      console.error('Failed to resolve alert:', err);
      alert(err.response?.data?.message || 'Failed to resolve alert.');
    }
  };

  const handleCreateMaintenanceReport = (report: any) => {
    const updated = [report, ...maintenanceLogs];
    setMaintenanceLogs(updated);
    localStorage.setItem('maintenance_logs', JSON.stringify(updated));
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
        await handleZoneSelect(zoneData[0]);
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

  const fetchFinderZones = async (farmId: string) => {
    if (!farmId) {
      setFinderZones([]);
      return;
    }
    setFinderLoading(true);
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      setFinderZones(res.data.data || []);
    } catch (err) {
      console.error('Failed to load zones for finder:', err);
    } finally {
      setFinderLoading(false);
    }
  };

  const handleFinderFarmChange = (farmId: string) => {
    setFinderFarmId(farmId);
    fetchFinderZones(farmId);
  };

  const fetchMotors = async () => {
    setIsLoadingMotors(true);
    try {
      const res = await api.get('api/v1/motors');
      const data = res.data.data || [];
      setMotors(data.map((m: any) => ({
        id: m.id,
        motorName: m.motorName,
        powerRating: m.powerRating,
        status: m.status,
        runtimeHours: m.runtimeHours
      })));
    } catch (err) {
      console.error('Failed fetching motors:', err);
    } finally {
      setIsLoadingMotors(false);
    }
  };

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

  const handleToggleMotor = (motorId: string) => {
    setMotors(motors.map(m => {
      if (m.id === motorId) {
        const isRunning = m.status === 'Running';
        const newStatus = isRunning ? 'Idle' : 'Running';
        return { ...m, status: newStatus };
      }
      return m;
    }));
  };

  const handleToggleValve = (zoneName: string, isOpen: boolean) => {
    console.log(`Valve toggled for ${zoneName}: ${isOpen}`);
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

  const handleTriggerIrrigation = () => {
    if (!selectedZone) return;
    setTriggering(true);
    setTimeout(() => {
      setTriggering(false);
      alert('Manual irrigation triggered successfully!');
    }, 1200);
  };

  const handleRunDiagnostics = () => {
    setScanning(true);
    setScanCompleted(false);
    setScanReport([]);
    
    const steps = [
      { msg: 'Initialing diagnostic bus sweep...', delay: 200 },
      { msg: 'Scanning active IoT sensor nodes...', delay: 600 },
      { msg: 'Auditing storage volumes for reservoirs...', delay: 1000 },
      { msg: 'Verifying pump motor circuit status...', delay: 1400 },
      { msg: 'Finalizing hardware diagnostics report...', delay: 1800 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setScanProgress(step.msg);
      }, step.delay);
    });

    setTimeout(() => {
      // Compile live diagnostic logs
      const logs: string[] = [];
      let okCount = 0;
      let warnCount = 0;
      let errCount = 0;

      // 1. Audit Sensors
      logs.push(`[INFO] Telemetry Bus scan detected ${sensorDevices.length} registered hardware nodes.`);
      sensorDevices.forEach(s => {
        if (s.status === 'Offline') {
          logs.push(`[ERROR] IoT Node ${s.deviceSerial} has status OFFLINE! Inspection required.`);
          errCount++;
        } else if (s.batteryPercentage < 30) {
          logs.push(`[WARNING] IoT Node ${s.deviceSerial} has low battery (${s.batteryPercentage}%). Replacement recommended.`);
          warnCount++;
        } else {
          logs.push(`[OK] IoT Node ${s.deviceSerial} operating normally (Battery: ${s.batteryPercentage}%, Signal: ${s.signalStrength}%).`);
          okCount++;
        }
      });

      // 2. Audit Tanks
      logs.push(`[INFO] Water Asset scan detected ${tanks.length} active reservoirs.`);
      tanks.forEach(t => {
        if (t.status === 'Critically Low' || t.currentLevel < t.capacity * 0.1) {
          logs.push(`[ERROR] Reservoir ${t.name} storage critically low (${t.currentLevel} L / ${t.capacity} L)!`);
          errCount++;
        } else if (t.status === 'Low' || t.currentLevel < t.capacity * 0.25) {
          logs.push(`[WARNING] Reservoir ${t.name} storage low (${t.currentLevel} L / ${t.capacity} L).`);
          warnCount++;
        } else {
          logs.push(`[OK] Reservoir ${t.name} storage level stable (${t.currentLevel} L).`);
          okCount++;
        }
      });

      // 3. Audit Motors
      logs.push(`[INFO] Motor bus scan detected ${motors.length} pump actuator coils.`);
      motors.forEach(m => {
        if (m.status === 'Running') {
          logs.push(`[OK] Actuator ${m.motorName} is actively pumping water. Runtime: ${m.runtimeHours} hrs.`);
          okCount++;
        } else {
          logs.push(`[OK] Actuator ${m.motorName} is standing by (Idle).`);
          okCount++;
        }
      });

      setScanReport(logs);
      setScanSummary({ ok: okCount, warnings: warnCount, errors: errCount });
      setScanning(false);
      setScanCompleted(true);
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Technician Diagnostics';
      case 'irrigation': return 'Hardware & Valve Override Console';
      case 'sensors': return 'IoT Telemetry Sensors';
      case 'water': return 'Reservoirs & Tanks Capacity';
      case 'maintenance': return 'Maintenance, Reports & Active Alerts';
      case 'analytics': return 'Telemetry Testing & Logs';
      case 'diagnostic': return 'Hardware Sweep & Zone Inspector';
      default: return 'Technician Console';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'overview': return 'Live telemetry review, sensor moisture metrics, and diagnostics.';
      case 'irrigation': return 'Actuator status overrides for active pipeline flow valves and water pump motors.';
      case 'sensors': return 'Hardware status, battery diagnostics, and calibration serial configurations.';
      case 'water': return 'Water storage volumes, flow valve limits, and reservoir metrics.';
      case 'maintenance': return 'Create maintenance logs, view task history, and resolve active hardware warnings.';
      case 'analytics': return 'Inject diagnostic mock moisture entries and inspect CSV database reports.';
      case 'diagnostic': return 'Run instant hardware checks, export log streams, and locate zones.';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium font-semibold text-xs">Syncing hardware telemetry...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'diagnostic', label: 'Diagnostic Scan', icon: ShieldCheck },
    { id: 'irrigation', label: 'Valve & Pump Override', icon: CloudRain },
    { id: 'sensors', label: 'IoT Node Diagnostics', icon: Cpu },
    { id: 'water', label: 'Reservoirs & Tanks', icon: Database },
    { id: 'maintenance', label: 'Maintenance & Alerts', icon: ClipboardList },
    { id: 'analytics', label: 'Telemetry Simulator', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <aside className={`h-screen sticky top-0 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 border-b border-slate-200/70 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex-shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-sm bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wider truncate uppercase">
                Florax Tech
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
                onClick={() => navigate('/technician-dashboard/' + item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-slate-200/70 bg-slate-50/50">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            {!isSidebarCollapsed && currentUser && (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {currentUser.fullName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{currentUser.fullName}</p>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide leading-tight mt-0.5">Field Technician</p>
                </div>
              </div>
            )}
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition cursor-pointer flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">{getTabTitle()}</h1>
            <p className="text-xs text-slate-400 font-medium">{getTabDescription()}</p>
          </div>
          
          {/* Active Farm Quick Indicator Badge */}
          {selectedFarm && (
            <span className="px-3 py-1.5 bg-blue-50 border border-blue-150 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <Sprout className="h-4 w-4 text-blue-600" />
              <span>Diagnostic Feed: {selectedFarm.farmName}</span>
            </span>
          )}
        </header>

        {/* Tab View Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/40">
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
              onNavigateToTab={(t) => navigate('/technician-dashboard/' + t)}
            />
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Diagnostic sweep control card */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Hardware Diagnostics Scan</h3>
                    <p className="text-xs text-slate-400 font-medium">Verify battery registers, Wifi signals, and actuator switches.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleRunDiagnostics}
                      disabled={scanning}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer disabled:opacity-50 transition flex items-center gap-2"
                    >
                      {scanning ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>{scanProgress}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Run Diagnostics Sweep</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Summary grid */}
                  {scanCompleted && (
                    <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                      <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl">
                        <p className="text-[10px] text-emerald-700 font-bold uppercase">Optimal</p>
                        <h4 className="text-lg font-black text-emerald-800 mt-0.5">{scanSummary.ok}</h4>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-150 p-3 rounded-xl">
                        <p className="text-[10px] text-yellow-700 font-bold uppercase">Warnings</p>
                        <h4 className="text-lg font-black text-yellow-800 mt-0.5">{scanSummary.warnings}</h4>
                      </div>
                      <div className="bg-red-50 border border-red-150 p-3 rounded-xl">
                        <p className="text-[10px] text-red-700 font-bold uppercase">Errors</p>
                        <h4 className="text-lg font-black text-red-800 mt-0.5">{scanSummary.errors}</h4>
                      </div>
                    </div>
                  )}

                  {/* Scan report output logs */}
                  {scanCompleted && (
                    <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-64 overflow-y-auto shadow-inner border border-slate-950">
                      <p className="text-slate-400 border-b border-slate-800 pb-1.5 mb-2 font-semibold flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-blue-400" />
                        DIAGNOSTIC SCAN LOG STREAM -- {new Date().toLocaleString()}
                      </p>
                      {scanReport.map((line, i) => {
                        const isErr = line.includes('[ERROR]');
                        const isWarn = line.includes('[WARNING]');
                        const isOk = line.includes('[OK]');
                        
                        return (
                          <p key={i} className={isErr ? 'text-red-400' : isWarn ? 'text-yellow-400' : isOk ? 'text-emerald-400' : 'text-slate-300'}>
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Farm/Zone Finder panel */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-slate-400" />
                      Farm & Zone Inspector
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Select a farm to find and trace all active sub-zones.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Farm</label>
                      <select
                        value={finderFarmId}
                        onChange={e => handleFinderFarmChange(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-semibold"
                      >
                        <option value="">-- Choose Farm --</option>
                        {farms.map(f => (
                          <option key={f.id} value={f.id}>{f.farmName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-2.5 max-h-72 overflow-y-auto">
                      {finderLoading ? (
                        <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-400">
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Querying zones...</span>
                        </div>
                      ) : finderZones.length === 0 ? (
                        <p className="text-slate-400 text-xs py-4 text-center">No zones linked to this farm.</p>
                      ) : (
                        finderZones.map(zone => {
                          const linkedSensors = sensorDevices.filter(d => d.zoneId === zone.id);
                          return (
                            <div key={zone.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-xs text-slate-800">{zone.zoneName}</h4>
                                <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black border ${
                                  zone.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                                }`}>
                                  {zone.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">Crop: <strong className="text-slate-600">{zone.cropType}</strong> | Soil: <strong className="text-slate-600">{zone.soilType}</strong></p>
                              
                              {/* Display linked sensor node info */}
                              {linkedSensors.length > 0 ? (
                                <div className="space-y-1 pt-1 border-t border-slate-200/50 mt-1">
                                  {linkedSensors.map(sensor => (
                                    <div key={sensor.id} className="flex justify-between text-[9px] font-semibold text-slate-500">
                                      <span className="text-blue-600">Serial: {sensor.deviceSerial}</span>
                                      <span className="text-slate-400">Bat: {sensor.batteryPercentage}% | Sig: {sensor.signalStrength}%</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[9px] text-slate-400 italic pt-1">No sensor node allocated</p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'irrigation' && (
            <IrrigationTab 
              motors={motors}
              zones={zones}
              farms={farms}
              activityLogs={[]}
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

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Alerts */}
                <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Bell className="h-4 w-4 text-amber-500 animate-bounce" />
                        Active System Alerts
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Unresolved hardware threshold events.</p>
                    </div>
                    <button 
                      onClick={fetchAlerts}
                      disabled={isLoadingAlerts}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition animate-none"
                      type="button"
                      title="Refresh Alerts"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {isLoadingAlerts ? (
                      <div className="flex items-center gap-2 py-8 justify-center text-xs text-slate-400">
                        <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing alerts...</span>
                      </div>
                    ) : alerts.length === 0 ? (
                      <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50/50">
                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-slate-500 font-semibold text-xs">All Systems Optimal</p>
                        <p className="text-[10px] text-slate-400">No pending alerts reported.</p>
                      </div>
                    ) : (
                      alerts.map((alertItem: any) => (
                        <div 
                          key={alertItem.id} 
                          className={`p-3.5 border rounded-xl flex flex-col gap-2.5 transition ${
                            alertItem.type === 'Error' 
                              ? 'bg-red-50/40 border-red-100' 
                              : alertItem.type === 'Warning' 
                                ? 'bg-yellow-50/40 border-yellow-100' 
                                : 'bg-blue-50/40 border-blue-100'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              alertItem.type === 'Error'
                                ? 'bg-red-100 border-red-200 text-red-700'
                                : alertItem.type === 'Warning'
                                  ? 'bg-yellow-100 border-yellow-200 text-yellow-700'
                                  : 'bg-blue-100 border-blue-200 text-blue-700'
                            }`}>
                              {alertItem.type}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">
                              {new Date(alertItem.created || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">{alertItem.title}</h4>
                            <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">{alertItem.message}</p>
                          </div>
                          <button
                            onClick={() => handleResolveAlert(alertItem.id)}
                            className="w-full mt-1.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Resolve Alert</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Create Report & Logs History */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Create Report Form */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-655" />
                        Create Maintenance Report
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Log field installations, replacements, calibrations, or firmware upgrades.</p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const fd = new FormData(form);
                        
                        const farmName = fd.get('farmName') as string;
                        const targetName = fd.get('targetName') as string;
                        const category = fd.get('category') as string;
                        const notes = fd.get('notes') as string;
                        const status = fd.get('status') as string;

                        if (!farmName || !targetName || !notes) {
                          alert('Please fill out all required fields.');
                          return;
                        }

                        const newLog = {
                          id: 'm_' + Date.now(),
                          farmName,
                          targetName,
                          category,
                          notes,
                          status,
                          date: new Date().toISOString().split('T')[0]
                        };

                        handleCreateMaintenanceReport(newLog);
                        form.reset();
                        alert('Maintenance report logged and saved successfully!');
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Farm</label>
                          <select
                            name="farmName"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="">-- Choose Farm --</option>
                            {farms.map(f => (
                              <option key={f.id} value={f.farmName}>{f.farmName}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Asset/Device</label>
                          <input 
                            type="text" 
                            name="targetName"
                            required
                            placeholder="e.g. Sensor FX-SOIL-N2 or Pump Valve B"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Activity Category</label>
                          <select
                            name="category"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="Calibration">Sensor Calibration</option>
                            <option value="Device Installation">Device Installation</option>
                            <option value="Battery Replacement">Battery Replacement</option>
                            <option value="Sensor Replacement">Sensor Replacement</option>
                            <option value="Firmware Upgrade">Firmware Upgrade</option>
                            <option value="Actuator Maintenance">Actuator Maintenance</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Maintenance Logs & Notes</label>
                          <input 
                            type="text"
                            name="notes"
                            required
                            placeholder="Enter detailed description of calibration steps or physical replacements performed..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completion Status</label>
                          <select
                            name="status"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-semibold"
                          >
                            <option value="Completed">Completed</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Pending Parts">Pending Parts</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer font-semibold"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Submit Maintenance Log</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* History List */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Maintenance Activity History</h3>
                      <p className="text-xs text-slate-400 font-medium">Historical audit list of all field technician activities.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                            <th className="pb-3 font-semibold">Date</th>
                            <th className="pb-3 font-semibold">Farm</th>
                            <th className="pb-3 font-semibold">Target Asset</th>
                            <th className="pb-3 font-semibold">Category</th>
                            <th className="pb-3 font-semibold">Description</th>
                            <th className="pb-3 font-semibold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                          {maintenanceLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition">
                              <td className="py-3 text-slate-400 font-bold">{log.date}</td>
                              <td className="py-3 font-bold text-slate-800">{log.farmName}</td>
                              <td className="py-3 text-slate-600 font-semibold">{log.targetName}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 bg-slate-100 border rounded font-semibold text-[10px] text-slate-600">
                                  {log.category}
                                </span>
                              </td>
                              <td className="py-3 text-slate-500 font-medium max-w-[200px] truncate" title={log.notes}>
                                {log.notes}
                              </td>
                              <td className="py-3 text-right">
                                <span className={`inline-flex px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider border ${
                                  log.status === 'Completed'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                    : log.status === 'Scheduled'
                                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                                      : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
        </div>
      </main>
    </div>
  );
}
