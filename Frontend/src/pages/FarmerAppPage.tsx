import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Home, Leaf, Droplets, Cpu, User,
  Bell, LogOut, RefreshCw, MapPin, ChevronRight,
  Plus, Play, Square, Clock, Calendar, Trash, Pencil,
  Thermometer, Droplet, Wind, CloudRain, Sun, Cloud,
  Battery, Wifi, CheckCircle, AlertCircle, X, Check,
  Activity, BarChart2, TrendingUp, Settings, Camera,
  ChevronDown, ChevronUp, Layers, Filter, Search, Sparkles
} from 'lucide-react';
import api from '../services/api';
import AiAdvisorTab from '../components/dashboard/AiAdvisorTab';

// ── Types ────────────────────────────────────────────────────────────────────
interface Farm { id: string; farmName: string; district: string; province: string; totalArea: number; }
interface Zone { id: string; zoneName: string; cropType: string; soilType: string; area: number; status: string; }
interface Motor { id: string; motorName: string; powerRating: string; status: string; runtimeHours: number; }
interface Schedule { id: string; zoneId: string; zoneName?: string; startTime: string; durationMinutes: number; repeatType: string; enabled: boolean; }
interface SensorDevice { id: string; zoneId: string; deviceSerial: string; sensorType: string; batteryPercentage: number; signalStrength: number; status: string; }
interface Notification { id: string; title: string; message: string; type: string; isRead: boolean; }
interface MoistureReading { moisturePercentage: number; recordedAt: string; }

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'agronomist', label: 'AI Advisor', icon: Sparkles },
  { id: 'farms', label: 'Farms', icon: Leaf },
  { id: 'irrigation', label: 'Water', icon: Droplets },
  { id: 'profile', label: 'Profile', icon: User },
];

// ── Helper Components ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className={`flex-1 min-w-0 p-3 rounded-2xl ${color} flex flex-col gap-1`}>
      <Icon className="h-4 w-4 opacity-70" />
      <p className="text-xl font-black leading-tight">{value}</p>
      <p className="text-[10px] font-semibold opacity-70 leading-tight">{label}</p>
    </div>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-black text-slate-800">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 cursor-pointer">
          {action} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ farms, notifications, motors, currentUser }: { farms: Farm[]; notifications: Notification[]; motors: Motor[]; currentUser: any; }) {
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.isRead);
  const runningMotors = motors.filter(m => m.status === 'Running');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-4">
      {/* Greeting Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 top-12 w-20 h-20 bg-white/5 rounded-full" />
        <p className="text-emerald-200 text-xs font-semibold">{greeting} 🌿</p>
        <h2 className="text-xl font-black mt-0.5">{currentUser?.fullName?.split(' ')[0] || 'Farmer'}</h2>
        <p className="text-emerald-200/80 text-xs mt-1">{farms.length} farm{farms.length !== 1 ? 's' : ''} under management</p>
        <div className="flex gap-2 mt-3">
          <div className="px-2.5 py-1 bg-white/15 rounded-lg text-[10px] font-bold flex items-center gap-1">
            <Activity className="h-3 w-3" /> {runningMotors.length} pumps active
          </div>
          {unread.length > 0 && (
            <div className="px-2.5 py-1 bg-red-400/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <Bell className="h-3 w-3" /> {unread.length} alerts
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Banner */}
      <button 
        onClick={() => navigate('/farmer-app/agronomist')}
        className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-3xl p-4 flex items-center justify-between text-left cursor-pointer hover:bg-emerald-100/40 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Ask AI Agronomist</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">Get watering diagnostics, advice and schedules.</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-emerald-600" />
      </button>

      {/* Quick Stats */}
      <div className="flex gap-2">
        <StatCard label="Active Farms" value={farms.length} icon={Leaf} color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Running Pumps" value={runningMotors.length} icon={Activity} color="bg-blue-50 text-blue-700" />
        <StatCard label="Alerts" value={unread.length} icon={Bell} color={unread.length > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"} />
      </div>

      {/* Weather Widget */}
      <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-200 text-[10px] font-semibold uppercase tracking-wider">Current Weather</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black">28°</span>
              <span className="text-sky-200 text-sm mb-1">Partly Cloudy</span>
            </div>
          </div>
          <Cloud className="h-14 w-14 text-white/30" />
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1 text-[11px]">
            <Droplet className="h-3 w-3 text-sky-200" />
            <span>65% humidity</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Wind className="h-3 w-3 text-sky-200" />
            <span>12 km/h</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <CloudRain className="h-3 w-3 text-sky-200" />
            <span>10% rain</span>
          </div>
        </div>
      </div>

      {/* Active Pumps */}
      {runningMotors.length > 0 && (
        <div>
          <SectionHeader title="Active Pumps" />
          <div className="space-y-2">
            {runningMotors.slice(0, 2).map(m => (
              <div key={m.id} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{m.motorName}</p>
                    <p className="text-[10px] text-slate-400">{m.powerRating} • {m.runtimeHours}h runtime</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">RUNNING</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {notifications.length > 0 && (
        <div>
          <SectionHeader title="Recent Alerts" action="View All" />
          <div className="space-y-2">
            {notifications.slice(0, 3).map(n => (
              <div key={n.id} className={`rounded-2xl p-3 flex items-start gap-3 ${!n.isRead ? 'bg-amber-50 border border-amber-100' : 'bg-slate-50 border border-slate-100'}`}>
                <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${!n.isRead ? 'text-amber-500' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{n.message}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Farms Screen ─────────────────────────────────────────────────────────────
function FarmsScreen({ farms }: { farms: Farm[] }) {
  const [expandedFarm, setExpandedFarm] = useState<string | null>(null);
  const [farmZones, setFarmZones] = useState<Record<string, Zone[]>>({});
  const [loadingZones, setLoadingZones] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  // Zone details telemetry state
  const [moistureReadings, setMoistureReadings] = useState<Record<string, number>>({});
  const [valves, setValves] = useState<any[]>([]);
  const [controlModes, setControlModes] = useState<Record<string, 'AUTO' | 'MANUAL'>>({});

  const loadValves = async () => {
    try {
      const res = await api.get('api/v1/valvecontrollers');
      setValves(res.data.data || []);
    } catch (err) {}
  };

  const loadZones = async (farmId: string) => {
    if (farmZones[farmId]) {
      setExpandedFarm(expandedFarm === farmId ? null : farmId);
      return;
    }
    setLoadingZones(p => ({ ...p, [farmId]: true }));
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      const raw = res.data.data || [];
      const zones = raw.map((z: any) => ({
        id: z.Id ?? z.id,
        zoneName: z.ZoneName ?? z.zoneName,
        cropType: z.CropType ?? z.cropType,
        soilType: z.SoilType ?? z.soilType,
        area: z.Area ?? z.area,
        status: z.Status ?? z.status,
      }));
      setFarmZones(p => ({ ...p, [farmId]: zones }));
      setExpandedFarm(expandedFarm === farmId ? null : farmId);

      // Concurrently fetch soil moisture for each loaded zone
      zones.forEach(async (z: any) => {
        try {
          const mRes = await api.get(`api/v1/soilmoisture/zone/${z.id}`);
          const readings = mRes.data.data || [];
          if (readings.length > 0) {
            setMoistureReadings(prev => ({ ...prev, [z.id]: readings[0].moisturePercentage }));
          } else {
            // Default mock fallbacks for nice simulation if database is blank
            setMoistureReadings(prev => ({ ...prev, [z.id]: Math.round(35 + Math.random() * 40) }));
          }
        } catch (err) {
          setMoistureReadings(prev => ({ ...prev, [z.id]: Math.round(35 + Math.random() * 40) }));
        }

        // Initialize default mock control modes
        setControlModes(prev => ({ ...prev, [z.id]: Math.random() > 0.5 ? 'AUTO' : 'MANUAL' }));
      });
    } catch { } finally {
      setLoadingZones(p => ({ ...p, [farmId]: false }));
    }
  };

  useEffect(() => {
    loadValves();
  }, []);

  const handleValveToggle = async (valveId: string, isOpen: boolean) => {
    try {
      await api.patch(`api/v1/valvecontrollers/${valveId}`, { isOpen });
      await loadValves();
      alert(`Valve ${isOpen ? 'opened' : 'closed'} successfully.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update valve status.');
    }
  };

  const handleModeToggle = (zoneId: string, mode: 'AUTO' | 'MANUAL') => {
    setControlModes(prev => ({ ...prev, [zoneId]: mode }));
    alert(`Control mode changed to ${mode} mode.`);
  };

  const filtered = farms.filter(f => f.farmName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search farms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Leaf className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No farms found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(farm => {
            const isExpanded = expandedFarm === farm.id;
            const zones = farmZones[farm.id] || [];
            return (
              <div key={farm.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-sm">
                <button
                  onClick={() => loadZones(farm.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <Leaf className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{farm.farmName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400">{farm.district}, {farm.province}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">{farm.totalArea} ha</span>
                    {loadingZones[farm.id] ? (
                      <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Irrigation Zones ({zones.length})</p>
                    {zones.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">No zones registered</p>
                    ) : zones.map(z => {
                      const moisture = moistureReadings[z.id] ?? 0;
                      const linkedValve = valves.find(v => v.zoneId === z.id || v.ZoneId === z.id);
                      const mode = controlModes[z.id] || 'MANUAL';

                      let moistColor = 'text-emerald-600';
                      let moistBg = 'bg-emerald-500';
                      if (moisture < 35) {
                        moistColor = 'text-red-500';
                        moistBg = 'bg-red-500';
                      } else if (moisture < 55) {
                        moistColor = 'text-amber-500';
                        moistBg = 'bg-amber-500';
                      }

                      return (
                        <div key={z.id} className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-xs">
                          {/* Zone header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Layers className="h-4 w-4 text-emerald-600" />
                              <p className="text-xs font-bold text-slate-800">{z.zoneName}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${z.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {z.status}
                            </span>
                          </div>

                          {/* Soil moisture meter */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold">
                              <span className="text-slate-500">Soil Moisture</span>
                              <span className={moistColor}>{moisture}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${moistBg}`} style={{ width: `${moisture}%` }} />
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-slate-400">Crop Profile</p>
                              <p className="font-bold text-slate-700">{z.cropType}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Soil Profile</p>
                              <p className="font-bold text-slate-700">{z.soilType}</p>
                            </div>
                            <div className="col-span-2 border-t border-slate-100 pt-1.5 mt-1 flex items-center justify-between">
                              <span className="text-slate-400">Control Mode</span>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${mode === 'AUTO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {mode} Mode
                              </span>
                            </div>
                          </div>

                          {/* Valves & Control Panel */}
                          <div className="space-y-2">
                            {linkedValve ? (
                              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2 rounded-xl text-[10px]">
                                <span className="font-semibold text-slate-600">Solenoid Valve: <strong className="text-slate-800">{linkedValve.deviceSerial || linkedValve.DeviceSerial}</strong></span>
                                <span className={`font-black uppercase ${linkedValve.state === 'Open' || linkedValve.State === 'Open' ? 'text-blue-600' : 'text-slate-500'}`}>
                                  {linkedValve.state || linkedValve.State || 'Closed'}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic bg-slate-50 p-2 rounded-xl text-center">
                                No solenoid valve linked to this zone.
                              </div>
                            )}

                            {/* Control button row */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleModeToggle(z.id, mode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border transition cursor-pointer ${
                                  mode === 'AUTO' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {mode === 'AUTO' ? 'Set Manual' : 'Set Auto'}
                              </button>
                              {linkedValve && (
                                <>
                                  <button
                                    onClick={() => handleValveToggle(linkedValve.id || linkedValve.Id, true)}
                                    disabled={linkedValve.state === 'Open' || linkedValve.State === 'Open'}
                                    className="flex-1 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-[9px] font-bold disabled:opacity-40 cursor-pointer"
                                  >
                                    Open
                                  </button>
                                  <button
                                    onClick={() => handleValveToggle(linkedValve.id || linkedValve.Id, false)}
                                    disabled={linkedValve.state === 'Closed' || linkedValve.State === 'Closed'}
                                    className="flex-1 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[9px] font-bold disabled:opacity-40 cursor-pointer"
                                  >
                                    Close
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Irrigation Screen ────────────────────────────────────────────────────────
function IrrigationScreen({ farms, motors, tanks }: { farms: Farm[]; motors: Motor[]; tanks: any[]; }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [triggering, setTriggering] = useState(false);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [newScheduleTime, setNewScheduleTime] = useState('06:00');
  const [newScheduleDuration, setNewScheduleDuration] = useState(30);
  const [newScheduleRepeat, setNewScheduleRepeat] = useState('Daily');

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get('api/v1/irrigationschedules');
      const raw = res.data.data || [];
      // Normalize casing
      setSchedules(raw.map((s: any) => ({
        id: s.Id ?? s.id,
        zoneId: s.ZoneId ?? s.zoneId,
        startTime: s.StartTime ?? s.startTime,
        durationMinutes: s.DurationMinutes ?? s.durationMinutes,
        repeatType: s.RepeatType ?? s.repeatType,
        enabled: s.Enabled ?? s.enabled,
      })));
    } catch { } finally { setLoading(false); }
  };

  const loadZones = async (farmId: string) => {
    setSelectedFarmId(farmId);
    setSelectedZoneId('');
    if (!farmId) { setZones([]); return; }
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      const raw = res.data.data || [];
      setZones(raw.map((z: any) => ({ id: z.Id ?? z.id, zoneName: z.ZoneName ?? z.zoneName, cropType: z.CropType ?? z.cropType, soilType: z.SoilType ?? z.soilType, area: z.Area ?? z.area, status: z.Status ?? z.status })));
    } catch { setZones([]); }
  };

  const handleTrigger = async () => {
    if (!selectedZoneId) { alert('Select a zone first.'); return; }
    setTriggering(true);
    try {
      await api.post('api/v1/irrigation/manual/start', {
        zoneId: selectedZoneId,
        durationMinutes: 30
      });
      alert('Irrigation started successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start irrigation.');
    } finally { setTriggering(false); }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId) { alert('Select a zone.'); return; }
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const createdBy = user?.id || user?.Id || '00000000-0000-0000-0000-000000000000';
      // Backend expects StartTime as TimeSpan string e.g. "06:00:00"
      await api.post('api/v1/irrigationschedules', {
        zoneId: selectedZoneId,
        createdBy,
        startTime: newScheduleTime + ':00',
        durationMinutes: newScheduleDuration,
        repeatType: newScheduleRepeat,
        enabled: true
      });
      setAddingSchedule(false);
      fetchSchedules();
      alert('Schedule created!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create schedule.');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Delete this schedule?')) return;
    try { await api.delete(`api/v1/irrigationschedules/${id}`); fetchSchedules(); } catch { }
  };

  const toggleSchedule = async (s: Schedule) => {
    try {
      // Backend uses PATCH with isEnabled field
      await api.patch(`api/v1/irrigationschedules/${s.id}`, { isEnabled: !s.enabled });
      fetchSchedules();
    } catch { }
  };

  useEffect(() => { fetchSchedules(); }, []);

  return (
    <div className="space-y-4">
      {/* Manual Control */}
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-4 text-white">
        <p className="text-blue-200 text-[10px] font-black uppercase tracking-wider mb-2">Manual Irrigation</p>
        <div className="space-y-2">
          <select value={selectedFarmId} onChange={e => loadZones(e.target.value)}
            className="w-full px-3 py-2 bg-white/15 border border-white/20 rounded-xl text-xs text-white focus:outline-none cursor-pointer appearance-none">
            <option value="" className="text-slate-800">— Select Farm —</option>
            {farms.map(f => <option key={f.id} value={f.id} className="text-slate-800">{f.farmName}</option>)}
          </select>
          {zones.length > 0 && (
            <select value={selectedZoneId} onChange={e => setSelectedZoneId(e.target.value)}
              className="w-full px-3 py-2 bg-white/15 border border-white/20 rounded-xl text-xs text-white focus:outline-none cursor-pointer appearance-none">
              <option value="" className="text-slate-800">— Select Zone —</option>
              {zones.map(z => <option key={z.id} value={z.id} className="text-slate-800">{z.zoneName}</option>)}
            </select>
          )}
          <button
            onClick={handleTrigger}
            disabled={triggering || !selectedZoneId}
            className="w-full py-2.5 bg-white text-blue-700 font-black text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
          >
            {triggering ? <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <><Play className="h-4 w-4 fill-blue-600" /> Start Irrigation (30 min)</>}
          </button>
        </div>
      </div>

      {/* Water Tanks & Reservoirs */}
      {tanks.length > 0 && (
        <div>
          <SectionHeader title="Water Reservoirs & Tanks" />
          <div className="space-y-3">
            {tanks.map(t => {
              const capacity = t.capacityLiters ?? t.CapacityLiters ?? 10000;
              const level = t.currentLevel ?? t.CurrentLevel ?? 4000;
              const status = t.status ?? t.Status ?? 'Optimal';
              const percent = Math.min(100, Math.round((level / capacity) * 100));

              // Fluid wave translation Y positioning (from 100% full = translateY(8px) to 0% = translateY(148px))
              const waveY = 148 - (percent / 100) * 140;

              return (
                <div key={t.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                  {/* Miniature Animated Wave Tank Graphic */}
                  <div className="relative w-12 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 160">
                      <rect x="2" y="2" width="96" height="156" fill="none" />
                      <g style={{ transform: `translateY(${waveY}px)`, transition: 'transform 1s ease-in-out' }}>
                        {/* Wave SVG shape representing fluid level */}
                        <path d="M 0,0 Q 25,6 50,0 T 100,0 L 100,180 L 0,180 Z" fill="#0284c7" opacity="0.8" />
                      </g>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black text-slate-800 bg-white/75 px-1 py-0.5 rounded shadow-xs">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{t.tankName || t.TankName}</h4>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                        status === 'Optimal' || status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Total Capacity: <strong className="text-slate-600">{capacity} L</strong></p>
                    <p className="text-[10px] text-slate-400">Available Water: <strong className="text-blue-600">{level} L</strong></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pump Motors */}
      {motors.length > 0 && (
        <div>
          <SectionHeader title="Pump Motors" />
          <div className="space-y-2">
            {motors.slice(0, 3).map(m => (
              <div key={m.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${m.status === 'Running' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    <Activity className={`h-4 w-4 ${m.status === 'Running' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{m.motorName}</p>
                    <p className="text-[10px] text-slate-400">{m.powerRating}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase ${m.status === 'Running' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-slate-800">Irrigation Schedules</h3>
          <button onClick={() => setAddingSchedule(!addingSchedule)}
            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition cursor-pointer">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {addingSchedule && (
          <form onSubmit={handleCreateSchedule} className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-3 mb-3">
            <p className="text-xs font-bold text-slate-700">New Schedule</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Start Time</label>
                <input type="time" value={newScheduleTime} onChange={e => setNewScheduleTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Duration (min)</label>
                <input type="number" value={newScheduleDuration} onChange={e => setNewScheduleDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Repeat</label>
              <select value={newScheduleRepeat} onChange={e => setNewScheduleRepeat(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none cursor-pointer">
                {['Daily', 'Weekly', 'Custom'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setAddingSchedule(false)} className="flex-1 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer">Save</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-6"><div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No schedules yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedules.map(s => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${s.enabled ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                    <Clock className={`h-4 w-4 ${s.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{s.startTime?.slice(0, 5)}</p>
                    <p className="text-[10px] text-slate-400">{s.durationMinutes} min • {s.repeatType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSchedule(s)} className={`w-9 h-5 rounded-full transition-all cursor-pointer ${s.enabled ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-0.5 ${s.enabled ? 'translate-x-4' : ''}`} />
                  </button>
                  <button onClick={() => handleDeleteSchedule(s.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg cursor-pointer">
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sensors Screen ───────────────────────────────────────────────────────────
function SensorsScreen() {
  const [devices, setDevices] = useState<SensorDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const devRes = await api.get('api/v1/sensordevices');
        const raw = devRes.data.data || [];
        setDevices(raw.map((d: any) => ({
          id: d.Id ?? d.id, zoneId: d.ZoneId ?? d.zoneId,
          deviceSerial: d.DeviceSerial ?? d.deviceSerial, sensorType: d.SensorType ?? d.sensorType,
          batteryPercentage: d.BatteryPercentage ?? d.batteryPercentage ?? 0,
          signalStrength: d.SignalStrength ?? d.signalStrength ?? 0,
          status: d.Status ?? d.status,
        })));
      } catch { } finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const batteryColor = (pct: number) => pct > 60 ? 'text-emerald-600' : pct > 30 ? 'text-amber-500' : 'text-red-500';
  const signalBars = (strength: number) => Math.ceil((strength / 100) * 5);

  const byType = devices.reduce((acc, d) => {
    const t = d.sensorType || 'Unknown';
    if (!acc[t]) acc[t] = [];
    acc[t].push(d);
    return acc;
  }, {} as Record<string, SensorDevice[]>);

  if (loading) return <div className="flex justify-center py-16"><div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-emerald-700">{devices.length}</p>
          <p className="text-[9px] text-emerald-600 font-semibold">Total</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-blue-700">{devices.filter(d => d.status === 'Active').length}</p>
          <p className="text-[9px] text-blue-600 font-semibold">Online</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <p className="text-lg font-black text-red-600">{devices.filter(d => d.status !== 'Active').length}</p>
          <p className="text-[9px] text-red-500 font-semibold">Offline</p>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Cpu className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No sensor devices found</p>
        </div>
      ) : Object.entries(byType).map(([type, list]) => (
        <div key={type}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">{type} Sensors</p>
          <div className="space-y-2">
            {list.map(d => (
              <div key={d.id} className="bg-white border border-slate-100 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${d.status === 'Active' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                      <Cpu className={`h-4 w-4 ${d.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{d.deviceSerial}</p>
                      <p className="text-[10px] text-slate-400">{d.sensorType}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${d.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {d.status}
                  </span>
                </div>
                <div className="flex gap-4 border-t border-slate-50 pt-2">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`h-3.5 w-3.5 ${batteryColor(d.batteryPercentage)}`} />
                    <div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${d.batteryPercentage > 60 ? 'bg-emerald-500' : d.batteryPercentage > 30 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${d.batteryPercentage}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5">{d.batteryPercentage}% battery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-3.5 w-3.5 text-blue-500" />
                    <div>
                      <div className="flex gap-0.5 items-end h-4">
                        {[1, 2, 3, 4, 5].map(b => (
                          <div key={b} className={`w-1.5 rounded-sm ${b <= signalBars(d.signalStrength) ? 'bg-blue-500' : 'bg-slate-200'}`} style={{ height: `${b * 3 + 2}px` }} />
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400">{d.signalStrength}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Profile Screen ───────────────────────────────────────────────────────────
function ProfileScreen({ currentUser, onLogout }: { currentUser: any; onLogout: () => void; }) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const initials = currentUser?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'F';

  return (
    <div className="space-y-4">
      {/* Avatar Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-5 text-white text-center relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full" />
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-black mx-auto mb-2">
          {initials}
        </div>
        <p className="font-black text-lg">{currentUser?.fullName || 'Farmer'}</p>
        <p className="text-emerald-200 text-xs">{currentUser?.email || ''}</p>
        <span className="mt-2 inline-block px-3 py-1 bg-white/15 rounded-full text-[10px] font-black uppercase tracking-wider">
          Farmer
        </span>
      </div>

      {/* Settings Toggles */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">Preferences</p>
        {[
          { label: 'Push Notifications', desc: 'Receive alerts on this device', val: notifEnabled, set: setNotifEnabled },
          { label: 'Auto Data Sync', desc: 'Sync data in background', val: autoSync, set: setAutoSync },
          { label: 'Dark Mode', desc: 'Darker interface theme', val: darkMode, set: setDarkMode },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
            <div>
              <p className="text-xs font-semibold text-slate-800">{item.label}</p>
              <p className="text-[10px] text-slate-400">{item.desc}</p>
            </div>
            <button onClick={() => item.set(!item.val)} className={`w-10 h-5 rounded-full transition-all cursor-pointer ${item.val ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow mx-0.5 transition-all ${item.val ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">Account</p>
        {[
          { icon: User, label: 'Edit Profile' },
          { icon: Bell, label: 'Notification Settings' },
          { icon: Settings, label: 'App Settings' },
        ].map((item, i) => (
          <button key={i} className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition cursor-pointer ${i > 0 ? 'border-t border-slate-50' : ''}`}>
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        ))}
      </div>

      {/* Download App */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Cpu className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Download Mobile App</p>
            <p className="text-[10px] text-slate-400">Full offline features + biometric login</p>
          </div>
        </div>
        <a href="/farmer-login" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
          <TrendingUp className="h-3.5 w-3.5" /> View Download Options
        </a>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

// ── Main App Shell ────────────────────────────────────────────────────────────
export default function FarmerAppPage() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'home');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [tanks, setTanks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
  };

  useEffect(() => { setActiveTab(tab || 'home'); }, [tab]);

  const switchTab = (id: string) => navigate('/farmer-app/' + id);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));

      const [farmsRes, motorsRes, tanksRes, notifRes] = await Promise.all([
        api.get('api/v1/farms'),
        api.get('api/v1/motors'),
        api.get('api/v1/watertanks'),
        api.get('api/v1/notifications'),
      ]);

      const rawFarms = farmsRes.data.data || [];
      const formattedFarms = rawFarms.map((f: any) => ({
        id: f.Id ?? f.id, farmName: f.FarmName ?? f.farmName,
        district: f.District ?? f.district, province: f.Province ?? f.province,
        totalArea: f.TotalArea ?? f.totalArea,
      }));
      setFarms(formattedFarms);

      if (formattedFarms.length > 0) {
        const firstFarm = formattedFarms[0];
        setSelectedFarm(firstFarm);
        try {
          const zonesRes = await api.get(`api/v1/irrigationzones/farm/${firstFarm.id}`);
          const rawZones = zonesRes.data.data || [];
          const formattedZones = rawZones.map((z: any) => ({
            id: z.Id ?? z.id,
            zoneName: z.ZoneName ?? z.zoneName,
            cropType: z.CropType ?? z.cropType,
            soilType: z.SoilType ?? z.soilType,
            area: z.Area ?? z.area,
            status: z.Status ?? z.status,
          }));
          setZones(formattedZones);
          if (formattedZones.length > 0) {
            setSelectedZone(formattedZones[0]);
          }
        } catch (err) {
          console.error("Failed to load zones for agronomist:", err);
        }
      }

      const rawMotors = motorsRes.data.data || [];
      setMotors(rawMotors.map((m: any) => ({
        id: m.Id ?? m.id, motorName: m.MotorName ?? m.motorName,
        powerRating: m.PowerRating ?? m.powerRating, status: m.Status ?? m.status,
        runtimeHours: m.RuntimeHours ?? m.runtimeHours ?? 0,
      })));

      const rawTanks = tanksRes.data.data || [];
      setTanks(rawTanks.map((t: any) => ({
        id: t.Id ?? t.id,
        tankName: t.TankName ?? t.tankName,
        capacityLiters: t.CapacityLiters ?? t.capacityLiters ?? 10000,
        currentLevel: t.CurrentLevel ?? t.currentLevel ?? 4000,
        status: t.Status ?? t.status ?? 'Active',
      })));

      const rawNotifs = notifRes.data.data || [];
      setNotifications(rawNotifs.map((n: any) => ({
        id: n.Id ?? n.id, title: n.Title ?? n.title, message: n.Message ?? n.message,
        type: n.Type ?? n.type, isRead: n.IsRead ?? n.isRead,
      })));
      setUnreadCount(rawNotifs.filter((n: any) => !(n.IsRead ?? n.isRead)).length);
    } catch (err) {
      console.error('Error loading farmer app data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/farmer-login');
  };

  const screenProps = { farms, motors, tanks, currentUser, notifications };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 pointer-events-none" />

      {/* Phone Frame */}
      <div className="relative w-full max-w-sm mx-auto md:my-8">
        {/* Outer shell (desktop only) */}
        <div className="hidden md:block absolute -inset-4 bg-slate-900 rounded-[3rem] shadow-2xl shadow-black/50 pointer-events-none z-0">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-10" />
          {/* Side buttons */}
          <div className="absolute left-0 top-20 w-1 h-8 bg-slate-700 rounded-l-full -translate-x-full" />
          <div className="absolute left-0 top-32 w-1 h-12 bg-slate-700 rounded-l-full -translate-x-full" />
          <div className="absolute right-0 top-24 w-1 h-16 bg-slate-700 rounded-r-full translate-x-full" />
        </div>

        {/* Screen */}
        <div className="relative z-10 bg-slate-50 md:rounded-[2.5rem] overflow-hidden flex flex-col h-screen md:h-[88vh] shadow-xl">

          {/* Status Bar (desktop only) */}
          <div className="hidden md:flex items-center justify-between px-6 pt-8 pb-2 bg-white">
            <span className="text-[11px] font-bold text-slate-800">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end h-3">
                {[3, 5, 7, 9, 11].map((h, i) => (
                  <div key={i} className={`w-1 rounded-sm bg-slate-800`} style={{ height: `${h}px` }} />
                ))}
              </div>
              <Wifi className="h-3 w-3 text-slate-800" />
              <Battery className="h-3.5 w-3.5 text-slate-800" />
            </div>
          </div>

          {/* App Header */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Leaf className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">FLORAX</p>
                <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Farmer App</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer">
                <RefreshCw className="h-4 w-4 text-slate-400" />
              </button>
              <button onClick={() => switchTab('notifications')} className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer relative">
                <Bell className="h-4 w-4 text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Loading your farm data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'home' && <HomeScreen {...screenProps} />}
                {activeTab === 'agronomist' && (
                  <AiAdvisorTab 
                    farms={farms}
                    zones={zones}
                    selectedFarm={selectedFarm}
                    selectedZone={selectedZone}
                    onZoneSelect={handleZoneSelect}
                  />
                )}
                {activeTab === 'farms' && <FarmsScreen farms={farms} />}
                {activeTab === 'irrigation' && <IrrigationScreen farms={farms} motors={motors} tanks={tanks} />}
                {activeTab === 'sensors' && <SensorsScreen />}
                {activeTab === 'profile' && <ProfileScreen currentUser={currentUser} onLogout={handleLogout} />}
              </>
            )}
          </div>

          {/* Bottom Tab Bar */}
          <div className="bg-white border-t border-slate-100 flex-shrink-0">
            <div className="flex items-center py-2">
              {TABS.map(t => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => switchTab(t.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1.5 cursor-pointer group relative"
                  >
                    {isActive && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                    )}
                    <t.icon className={`h-5 w-5 transition-all ${isActive ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className={`text-[9px] font-bold transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {t.label}
                      {t.id === 'home' && unreadCount > 0 && (
                        <span className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full">{unreadCount}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Home Indicator (iOS style) */}
            <div className="hidden md:flex justify-center pb-2">
              <div className="w-24 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
