import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sprout, LogOut, ChevronLeft, ChevronRight, Layers, Cpu, 
  BarChart3, Users, Sliders, LayoutDashboard, Pencil, Trash, 
  Plus, Check, X, CreditCard, Terminal, Sparkles
} from 'lucide-react';
import api from '../services/api';
import AiAdvisorTab from '../components/dashboard/AiAdvisorTab';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: string;
  assignedFarmId?: string;
  assignedFarmName?: string;
}

interface FarmItem {
  id: string;
  farmName: string;
  district: string;
  province: string;
  totalArea: number;
  ownerId: string;
}

interface ZoneItem {
  id: string;
  farmId: string;
  zoneName: string;
  cropType: string;
  soilType: string;
  area: number;
  status: string;
}

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  farmName: string;
  plan: string;
  price: string;
  status: string;
  renewalDate: string;
}

export default function SuperAdminDashboardPage() {
  const { tab } = useParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [tab]);

  // System Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalFarmers: 0,
    totalTechs: 0,
    totalFarms: 0,
    totalZones: 0,
    totalDevices: 0,
    systemUptime: '99.98%'
  });

  // Data Lists
  const [users, setUsers] = useState<UserItem[]>([]);
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [motors, setMotors] = useState<any[]>([]);
  const [valves, setValves] = useState<any[]>([]);

  // Subscriptions Mock Database (persisted in localStorage)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Add/Edit User States
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('22222222-2222-2222-2222-222222222222'); // default Farmer

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // Add/Edit Farm States
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmDistrict, setNewFarmDistrict] = useState('');
  const [newFarmProvince, setNewFarmProvince] = useState('');
  const newFarmArea = 10;
  const [newFarmOwnerId, setNewFarmOwnerId] = useState('');

  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [editFarmName, setEditFarmName] = useState('');
  const [editFarmDistrict, setEditFarmDistrict] = useState('');
  const [editFarmProvince, setEditFarmProvince] = useState('');
  const [editFarmOwnerId, setEditFarmOwnerId] = useState('');

  // Add/Edit Zone States
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFarmId, setNewZoneFarmId] = useState('');
  const [newZoneCrop, setNewZoneCrop] = useState('Citrus');
  const [newZoneSoil, setNewZoneSoil] = useState('Loam');
  const newZoneArea = 5;

  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneFarmId, setEditZoneFarmId] = useState('');
  const [editZoneCrop, setEditZoneCrop] = useState('');
  const [editZoneSoil, setEditZoneSoil] = useState('');

  const [selectedFarm, setSelectedFarm] = useState<FarmItem | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneItem | null>(null);

  const handleZoneSelect = (zone: any) => {
    setSelectedZone(zone);
    const farm = farms.find(f => f.id === zone.farmId);
    if (farm) {
      setSelectedFarm(farm);
    }
  };

  // Platform Config Settings
  const [config, setConfig] = useState({
    apiRateLimit: 500,
    smtpServer: 'smtp.florax.com',
    dataRetentionDays: 90,
    mqttBrokerUrl: 'mqtt://broker.florax.com:1883',
    billingCurrency: 'USD ($)'
  });

  const navigate = useNavigate();

  // Role GUID Constants
  const ROLE_ADMIN_ID = '11111111-1111-1111-1111-111111111111';
  const ROLE_FARMER_ID = '22222222-2222-2222-2222-222222222222';
  const ROLE_TECH_ID = '33333333-3333-3333-3333-333333333333';
  const ROLE_SUPER_ADMIN_ID = '44444444-4444-4444-4444-444444444444';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        // Protect role
        if (u.roleId !== ROLE_SUPER_ADMIN_ID) {
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, farmsRes, devicesRes, motorsRes, valvesRes] = await Promise.all([
        api.get('api/v1/users'),
        api.get('api/v1/farms'),
        api.get('api/v1/sensordevices'),
        api.get('api/v1/motors'),
        api.get('api/v1/valvecontrollers')
      ]);

      const fetchedUsers = usersRes.data.data || [];
      const fetchedFarms = farmsRes.data.data || [];
      const fetchedDevices = devicesRes.data.data || [];
      const fetchedMotors = motorsRes.data.data || [];
      const fetchedValves = valvesRes.data.data || [];

      // Fetch all zones for all farms in parallel
      const zonesData: ZoneItem[] = [];
      await Promise.all(
        fetchedFarms.map(async (f: any) => {
          try {
            const res = await api.get(`api/v1/irrigationzones/farm/${f.id}`);
            if (res.data.data) {
              zonesData.push(...res.data.data);
            }
          } catch (e) {
            console.error(e);
          }
        })
      );

      setUsers(fetchedUsers.map((u: any) => {
        const farm = fetchedFarms.find((f: any) => f.ownerId === u.id);
        return {
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: u.roleId,
          phone: u.phone,
          status: u.status || 'Active',
          assignedFarmId: farm?.id,
          assignedFarmName: farm?.farmName
        };
      }));

      setFarms(fetchedFarms);
      setZones(zonesData);
      setDevices(fetchedDevices);
      setMotors(fetchedMotors);
      setValves(fetchedValves);

      if (fetchedFarms.length > 0) {
        setSelectedFarm(fetchedFarms[0]);
      }
      if (zonesData.length > 0) {
        setSelectedZone(zonesData[0]);
      }

      // Setup Subscriptions database (localStorage cache or default seed)
      const cachedSubs = localStorage.getItem('superadmin_subscriptions');
      if (cachedSubs) {
        setSubscriptions(JSON.parse(cachedSubs));
      } else {
        const seededSubs = fetchedUsers
          .filter((u: any) => u.roleId === ROLE_FARMER_ID)
          .map((u: any, idx: number) => {
            const plans = ['Gold Premium', 'Silver Pro', 'Bronze Starter'];
            const prices = ['$99.00/mo', '$49.00/mo', '$19.00/mo'];
            const farm = fetchedFarms.find((f: any) => f.ownerId === u.id);
            return {
              id: `SUB-${idx + 100}`,
              userId: u.id,
              userName: u.fullName,
              farmName: farm?.farmName || 'Pending Farm Allocation',
              plan: plans[idx % plans.length],
              price: prices[idx % prices.length],
              status: 'Active',
              renewalDate: '2026-08-01'
            };
          });
        setSubscriptions(seededSubs);
        localStorage.setItem('superadmin_subscriptions', JSON.stringify(seededSubs));
      }

      // Calculate Stats
      const admins = fetchedUsers.filter((u: any) => u.roleId === ROLE_ADMIN_ID).length;
      const farmers = fetchedUsers.filter((u: any) => u.roleId === ROLE_FARMER_ID).length;
      const techs = fetchedUsers.filter((u: any) => u.roleId === ROLE_TECH_ID).length;

      setStats({
        totalUsers: fetchedUsers.length,
        totalAdmins: admins,
        totalFarmers: farmers,
        totalTechs: techs,
        totalFarms: fetchedFarms.length,
        totalZones: zonesData.length,
        totalDevices: fetchedDevices.length + fetchedMotors.length + fetchedValves.length,
        systemUptime: '99.98%'
      });

    } catch (err) {
      console.error('Failed loading superadmin diagnostic data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // User Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;
    try {
      await api.post('api/v1/auth/register', {
        fullName: newUserName,
        email: newUserEmail,
        phone: newUserPhone || '+905550000000',
        password: newUserPassword,
        roleId: newUserRole
      });
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      setIsAddingUser(false);
      loadInitialData();
      alert('User created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register user.');
    }
  };

  const startEditUser = (member: UserItem) => {
    setEditingUserId(member.id);
    setEditFullName(member.name);
    setEditEmail(member.email);
    setEditPhone(member.phone);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditPassword('');
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      await api.put(`api/v1/users/${userId}`, {
        id: userId,
        fullName: editFullName,
        email: editEmail,
        phone: editPhone || '+905554443322',
        roleId: editRole,
        status: editStatus,
        password: editPassword.trim() || undefined
      });
      setEditingUserId(null);
      loadInitialData();
      alert('User details updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Delete user account permanently?')) return;
    try {
      await api.delete(`api/v1/users/${userId}`);
      loadInitialData();
      alert('User deleted.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  // Farm Actions
  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim() || !newFarmDistrict.trim() || !newFarmProvince.trim()) return;
    try {
      await api.post('api/v1/farms', {
        farmName: newFarmName,
        district: newFarmDistrict,
        province: newFarmProvince,
        totalArea: newFarmArea,
        ownerId: newFarmOwnerId || '99999999-9999-9999-9999-999999999999'
      });
      setNewFarmName('');
      setNewFarmDistrict('');
      setNewFarmProvince('');
      setNewFarmOwnerId('');
      setIsAddingFarm(false);
      loadInitialData();
      alert('Farm created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create farm.');
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!window.confirm('Delete farm sector permanently?')) return;
    try {
      await api.delete(`api/v1/farms/${farmId}`);
      loadInitialData();
      alert('Farm deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete farm.');
    }
  };

  const startEditFarm = (farm: FarmItem) => {
    setEditingFarmId(farm.id);
    setEditFarmName(farm.farmName);
    setEditFarmDistrict(farm.district);
    setEditFarmProvince(farm.province);
    setEditFarmOwnerId(farm.ownerId);
  };

  const handleUpdateFarm = async (farmId: string) => {
    try {
      await api.put(`api/v1/farms/${farmId}`, {
        id: farmId,
        farmName: editFarmName,
        district: editFarmDistrict,
        province: editFarmProvince,
        totalArea: 10
      });
      if (editFarmOwnerId) {
        await api.put(`api/v1/farms/${farmId}/allocate`, {
          ownerId: editFarmOwnerId
        });
      }
      setEditingFarmId(null);
      loadInitialData();
      alert('Farm details updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update farm.');
    }
  };

  // Zone Actions
  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneFarmId) return;
    try {
      await api.post('api/v1/irrigationzones', {
        farmId: newZoneFarmId,
        zoneName: newZoneName,
        cropType: newZoneCrop,
        soilType: newZoneSoil,
        area: newZoneArea
      });
      setNewZoneName('');
      setNewZoneFarmId('');
      setIsAddingZone(false);
      loadInitialData();
      alert('Zone created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create zone.');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!window.confirm('Delete zone?')) return;
    try {
      await api.delete(`api/v1/irrigationzones/${zoneId}`);
      loadInitialData();
      alert('Zone deleted.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete zone.');
    }
  };

  const startEditZone = (zone: ZoneItem) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.zoneName);
    setEditZoneFarmId(zone.farmId);
    setEditZoneCrop(zone.cropType);
    setEditZoneSoil(zone.soilType);
  };

  const handleUpdateZone = async (zoneId: string) => {
    try {
      await api.put(`api/v1/irrigationzones/${zoneId}`, {
        id: zoneId,
        farmId: editZoneFarmId,
        zoneName: editZoneName,
        cropType: editZoneCrop,
        soilType: editZoneSoil,
        area: 5
      });
      setEditingZoneId(null);
      loadInitialData();
      alert('Zone details updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update zone.');
    }
  };


  // Subscription Actions
  const handleUpgradeSubscription = (subId: string, nextPlan: string, price: string) => {
    const updated = subscriptions.map(s => s.id === subId ? { ...s, plan: nextPlan, price } : s);
    setSubscriptions(updated);
    localStorage.setItem('superadmin_subscriptions', JSON.stringify(updated));
    alert(`Subscription plan updated to ${nextPlan}`);
  };

  const handleToggleSubStatus = (subId: string, status: string) => {
    const updated = subscriptions.map(s => s.id === subId ? { ...s, status } : s);
    setSubscriptions(updated);
    localStorage.setItem('superadmin_subscriptions', JSON.stringify(updated));
    alert(`Subscription status set to ${status}`);
  };

  const getRoleName = (roleId: string) => {
    if (roleId === ROLE_ADMIN_ID) return 'Admin';
    if (roleId === ROLE_FARMER_ID) return 'Farmer';
    if (roleId === ROLE_TECH_ID) return 'Technician';
    if (roleId === ROLE_SUPER_ADMIN_ID) return 'Super Admin';
    return 'User';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold">Decrypting SuperAdmin workspace...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Console Hub', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'farms', label: 'Farms & Land', icon: Layers },
    { id: 'hardware', label: 'IoT Hardware Hub', icon: Cpu },
    { id: 'billing', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Engine Diagnostics', icon: BarChart3 },
    { id: 'settings', label: 'Platform Config', icon: Sliders },
    { id: 'agronomist', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans animate-fade-in">
      
      {/* SuperAdmin Premium Light Sidebar */}
      <aside className={`h-screen sticky top-0 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 flex-shrink-0">
              <Sprout className="h-5 w-5 animate-pulse" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-black text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent tracking-widest truncate uppercase">
                SUPER CORE
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition cursor-pointer"
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
                onClick={() => navigate('/superadmin-dashboard/' + item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/10 border border-indigo-600/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={item.label}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span className={isActive ? 'text-white' : 'text-slate-600'}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-xs flex-shrink-0">
              {currentUser?.FullName ? currentUser.FullName.split(' ').map((n: string) => n[0]).join('') : 'SA'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-slate-800 truncate">{currentUser?.FullName || 'Root Operator'}</p>
                <p className="text-[10px] text-slate-450 truncate">{currentUser?.Email || 'superadmin@florax.com'}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-slate-400 transition cursor-pointer"
                title="Disconnect"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Viewport Core */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {activeTab === 'overview' && 'SUPERADMIN OVERWATCH CONSOLE'}
              {activeTab === 'users' && 'GLOBAL OPERATORS DIRECTORY'}
              {activeTab === 'farms' && 'FARMS & LAND SECTOR CONTROL'}
              {activeTab === 'hardware' && 'IOT TELEMETRY ACTUATORS'}
              {activeTab === 'billing' && 'BILLING & SUBSCRIPTION PROFILES'}
              {activeTab === 'analytics' && 'PLATFORM CPU DIAGNOSTICS'}
              {activeTab === 'settings' && 'SYSTEM CONFIG REGISTRY'}
              {activeTab === 'agronomist' && 'AGRONOMIC AI ADVISOR'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-bold text-indigo-600">
              <span className="h-2 w-2 bg-indigo-500 rounded-full animate-ping"></span>
              <span>ROOT ACCESS MODE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 w-full">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm shadow-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total System Users</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Admins: {stats.totalAdmins} | Farmers: {stats.totalFarmers}</p>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm shadow-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Farms Managed</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{stats.totalFarms}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Zones Allocated: {stats.totalZones}</p>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm shadow-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IoT Hardware Nodes</p>
                  <p className="text-2xl font-black text-teal-600 mt-1">{stats.totalDevices}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Active telemetry streams</p>
                </div>
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm shadow-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">API Core Uptime</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{stats.systemUptime}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Zero down-time target</p>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/85 p-6 rounded-2xl space-y-4 shadow-sm shadow-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-indigo-600" />
                      Manage Accounts
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Control credentials, deactivations, and role boundaries.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/superadmin-dashboard/users')}
                    className="w-full py-2.5 bg-indigo-55 border border-indigo-150 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Launch User Registry
                  </button>
                </div>
                <div className="bg-white border border-slate-200/85 p-6 rounded-2xl space-y-4 shadow-sm shadow-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-purple-600" />
                      Land Sectors
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Edit farm coordinates, land area sizes, and crop zones.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/superadmin-dashboard/farms')}
                    className="w-full py-2.5 bg-purple-50 border border-purple-150 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Configure Sectors
                  </button>
                </div>
                <div className="bg-white border border-slate-200/85 p-6 rounded-2xl space-y-4 shadow-sm shadow-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      Subscription SaaS
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Control pricing tiers, farmer billing subscriptions, and limits.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/superadmin-dashboard/billing')}
                    className="w-full py-2.5 bg-emerald-50 border border-emerald-150 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Manage Billing & Plans
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGING USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center bg-white p-4 border border-slate-200/85 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System User Registry</h3>
                  <p className="text-[10px] text-slate-500">Manage all administrators, farm owners, and field technicians.</p>
                </div>
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAddingUser ? 'Close Form' : 'Register New User'}</span>
                </button>
              </div>

              {isAddingUser && (
                <form onSubmit={handleCreateUser} className="bg-white border border-slate-200 p-6 space-y-4 w-full rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">New Operator Credentials</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                      <input 
                        type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Clara Oswald"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                      <input 
                        type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="e.g. clara@florax.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                      <input 
                        type="password" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} placeholder="••••••••"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                      <input 
                        type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)} placeholder="e.g. +905553332211"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Allocation</label>
                      <select 
                        value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value={ROLE_FARMER_ID}>Farmer</option>
                        <option value={ROLE_TECH_ID}>Technician</option>
                        <option value={ROLE_ADMIN_ID}>Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer">
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {/* Users Grid */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40">
                        <th className="pb-3 pt-2 pl-2 font-semibold">User</th>
                        <th className="pb-3 pt-2 font-semibold">Contact Email</th>
                        <th className="pb-3 pt-2 font-semibold">Role</th>
                        <th className="pb-3 pt-2 font-semibold">Status / Reset Pwd</th>
                        <th className="pb-3 pt-2 pr-2 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {users.map(member => {
                        const isEditing = editingUserId === member.id;
                        return (
                          <tr key={member.id} className="hover:bg-slate-50/40">
                            {isEditing ? (
                              <>
                                <td className="py-2.5 pl-2">
                                  <input 
                                    type="text" required value={editFullName} onChange={e => setEditFullName(e.target.value)}
                                    className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:bg-white"
                                  />
                                </td>
                                <td className="py-2.5">
                                  <input 
                                    type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)}
                                    className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:bg-white"
                                  />
                                </td>
                                <td className="py-2.5">
                                  <select 
                                    value={editRole} onChange={e => setEditRole(e.target.value)}
                                    className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full focus:outline-none cursor-pointer"
                                  >
                                    <option value={ROLE_FARMER_ID}>Farmer</option>
                                    <option value={ROLE_TECH_ID}>Technician</option>
                                    <option value={ROLE_ADMIN_ID}>Administrator</option>
                                    <option value={ROLE_SUPER_ADMIN_ID}>Super Admin</option>
                                  </select>
                                </td>
                                <td className="py-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <select 
                                      value={editStatus} onChange={e => setEditStatus(e.target.value)}
                                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none cursor-pointer"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Inactive">Inactive</option>
                                      <option value="Deactivated">Deactivated</option>
                                    </select>
                                    <input 
                                      type="password" placeholder="New pwd" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                                      className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-24 focus:outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 pr-2 text-right flex items-center justify-end gap-1.5 pt-3.5">
                                  <button onClick={() => handleUpdateUser(member.id)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition" title="Save">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setEditingUserId(null)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition" title="Cancel">
                                    <X className="h-4 w-4" />
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3.5 pl-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 text-indigo-600 font-black flex items-center justify-center text-[10px]">
                                      {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="font-bold text-slate-800">{member.name}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 text-slate-500 font-medium">{member.email}</td>
                                <td className="py-3.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                                    member.role === ROLE_SUPER_ADMIN_ID 
                                      ? 'bg-purple-50 border-purple-100 text-purple-700' 
                                      : member.role === ROLE_ADMIN_ID
                                      ? 'bg-blue-55 border-blue-100 text-blue-700'
                                      : member.role === ROLE_TECH_ID
                                      ? 'bg-amber-50 border-amber-100 text-amber-700'
                                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  }`}>
                                    {getRoleName(member.role)}
                                  </span>
                                </td>
                                <td className="py-3.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                                    member.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                                  }`}>
                                    {member.status}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-2 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button onClick={() => startEditUser(member)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition" title="Edit">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteUser(member.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition" title="Delete">
                                      <Trash className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FARMS & ZONES */}
          {activeTab === 'farms' && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Farms Panel */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Farms Register</h3>
                      <p className="text-[10px] text-slate-500">Configure land areas and allocate owners.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingFarm(!isAddingFarm)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-[10px] font-bold text-white rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isAddingFarm ? 'Close' : 'Add Farm'}</span>
                    </button>
                  </div>

                  {isAddingFarm && (
                    <form onSubmit={handleCreateFarm} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Farm Name</label>
                          <input 
                            type="text" required value={newFarmName} onChange={e => setNewFarmName(e.target.value)} placeholder="e.g. North Orchard"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Owner Farmer</label>
                          <select
                            value={newFarmOwnerId} onChange={e => setNewFarmOwnerId(e.target.value)} required
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Choose Owner --</option>
                            {users.filter(u => u.role === ROLE_FARMER_ID).map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">District</label>
                          <input 
                            type="text" required value={newFarmDistrict} onChange={e => setNewFarmDistrict(e.target.value)} placeholder="e.g. Silifke"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Province</label>
                          <input 
                            type="text" required value={newFarmProvince} onChange={e => setNewFarmProvince(e.target.value)} placeholder="e.g. Mersin"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg cursor-pointer">
                          Save Farm
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {farms.map(f => {
                      const isEditing = editingFarmId === f.id;
                      const owner = users.find(u => u.id === f.ownerId);
                      return (
                        <div key={f.id} className="p-3 border border-slate-150 rounded-xl hover:bg-slate-50/50 bg-slate-50/20">
                          {isEditing ? (
                            <div className="space-y-2 w-full">
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" required value={editFarmName} onChange={e => setEditFarmName(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="Farm Name"
                                />
                                <select
                                  value={editFarmOwnerId} onChange={e => setEditFarmOwnerId(e.target.value)} required
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none cursor-pointer"
                                >
                                  <option value="">-- Choose Owner --</option>
                                  {users.filter(u => u.role === ROLE_FARMER_ID).map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                  ))}
                                </select>
                                <input 
                                  type="text" required value={editFarmDistrict} onChange={e => setEditFarmDistrict(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="District"
                                />
                                <input 
                                  type="text" required value={editFarmProvince} onChange={e => setEditFarmProvince(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="Province"
                                />
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                                <button onClick={() => handleUpdateFarm(f.id)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition cursor-pointer" title="Save">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button onClick={() => setEditingFarmId(null)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition cursor-pointer" title="Cancel">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <h4 className="font-bold text-xs text-slate-800">{f.farmName}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">{f.district}, {f.province} | Owner: <strong className="text-slate-650">{owner?.name || 'Unassigned'}</strong></p>
                              </div>
                              <div className="flex gap-1.5">
                                <button onClick={() => startEditFarm(f)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer" title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDeleteFarm(f.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer" title="Delete">
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Zones Panel */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Crop Zones Register</h3>
                      <p className="text-[10px] text-slate-500">Configure irrigation sub-sectors.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddingZone(!isAddingZone)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-bold text-white rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{isAddingZone ? 'Close' : 'Add Zone'}</span>
                    </button>
                  </div>

                  {isAddingZone && (
                    <form onSubmit={handleCreateZone} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Zone Name</label>
                          <input 
                            type="text" required value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="e.g. Sector C"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Select Farm</label>
                          <select
                            value={newZoneFarmId} onChange={e => setNewZoneFarmId(e.target.value)} required
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none cursor-pointer"
                          >
                            <option value="">-- Choose Farm --</option>
                            {farms.map(f => (
                              <option key={f.id} value={f.id}>{f.farmName}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Crop Type</label>
                          <input 
                            type="text" required value={newZoneCrop} onChange={e => setNewZoneCrop(e.target.value)} placeholder="e.g. Almonds"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-505 uppercase mb-1">Soil Type</label>
                          <input 
                            type="text" required value={newZoneSoil} onChange={e => setNewZoneSoil(e.target.value)} placeholder="e.g. Clay loam"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-808 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg cursor-pointer">
                          Save Zone
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {zones.map(z => {
                      const isEditing = editingZoneId === z.id;
                      const farm = farms.find(f => f.id === z.farmId);
                      return (
                        <div key={z.id} className="p-3 border border-slate-150 rounded-xl hover:bg-slate-50/50 bg-slate-50/20">
                          {isEditing ? (
                            <div className="space-y-2 w-full">
                              <div className="grid grid-cols-2 gap-2">
                                <input 
                                  type="text" required value={editZoneName} onChange={e => setEditZoneName(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="Zone Name"
                                />
                                <select
                                  value={editZoneFarmId} onChange={e => setEditZoneFarmId(e.target.value)} required
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none cursor-pointer"
                                >
                                  <option value="">-- Choose Farm --</option>
                                  {farms.map(f => (
                                    <option key={f.id} value={f.id}>{f.farmName}</option>
                                  ))}
                                </select>
                                <input 
                                  type="text" required value={editZoneCrop} onChange={e => setEditZoneCrop(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="Crop Type"
                                />
                                <input 
                                  type="text" required value={editZoneSoil} onChange={e => setEditZoneSoil(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-full focus:outline-none focus:border-indigo-500"
                                  placeholder="Soil Type"
                                />
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                                <button onClick={() => handleUpdateZone(z.id)} className="p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition cursor-pointer" title="Save">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button onClick={() => setEditingZoneId(null)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition cursor-pointer" title="Cancel">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <h4 className="font-bold text-xs text-slate-800">{z.zoneName}</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5">Farm: <strong className="text-slate-600">{farm?.farmName}</strong> | Crop: <strong className="text-slate-650">{z.cropType}</strong></p>
                              </div>
                              <div className="flex gap-1.5">
                                <button onClick={() => startEditZone(z)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer" title="Edit">
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDeleteZone(z.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition cursor-pointer" title="Delete">
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: IOT HARDWARE HUB */}
          {activeTab === 'hardware' && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Sensors column */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">IoT Sensor Devices ({devices.length})</h3>
                  <div className="space-y-3">
                    {devices.map(d => (
                      <div key={d.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/40">
                        <h4 className="font-extrabold text-[11px] text-slate-808">{d.deviceSerial}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Status: <span className="text-teal-600 font-bold">{d.status}</span> | Battery: <span className="text-slate-500 font-semibold">{d.batteryPercentage}%</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pumps Column */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">Water Pump Motors ({motors.length})</h3>
                  <div className="space-y-3">
                    {motors.map(m => (
                      <div key={m.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/40 flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-[11px] text-slate-808">{m.motorName}</h4>
                          <p className="text-[10px] text-slate-500 mt-1">Status: <span className={m.status === 'Running' ? 'text-emerald-600 font-bold' : 'text-slate-500'}>{m.status}</span></p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-lg">{m.powerRating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Valves Column */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider">Flow Solenoid Valves ({valves.length})</h3>
                  <div className="space-y-3">
                    {valves.map(v => (
                      <div key={v.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/40">
                        <h4 className="font-extrabold text-[11px] text-slate-808">{v.deviceSerial}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Flow Rate: <span className="text-blue-600 font-bold">{v.flowRate} L/min</span> | State: <strong className="text-slate-655">{v.state}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: BILLING & SUBSCRIPTIONS */}
          {activeTab === 'billing' && (
            <div className="space-y-6 w-full">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Farmer Billing Subscription Plans</h3>
                  <p className="text-[10px] text-slate-500">Upgrade plans, revoke licenses, and audit SaaS subscriptions.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/40">
                        <th className="pb-3 pt-2 pl-2 font-semibold">Sub ID</th>
                        <th className="pb-3 pt-2 font-semibold">Farmer</th>
                        <th className="pb-3 pt-2 font-semibold">Allocated Sector</th>
                        <th className="pb-3 pt-2 font-semibold">Current Plan</th>
                        <th className="pb-3 pt-2 font-semibold">Pricing</th>
                        <th className="pb-3 pt-2 font-semibold">Billing Status</th>
                        <th className="pb-3 pt-2 pr-2 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {subscriptions.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/40">
                          <td className="py-3 pl-2 font-mono font-bold text-indigo-650">{sub.id}</td>
                          <td className="py-3 font-bold text-slate-800">{sub.userName}</td>
                          <td className="py-3 font-semibold text-slate-500">{sub.farmName}</td>
                          <td className="py-3 font-extrabold text-slate-700">{sub.plan}</td>
                          <td className="py-3 font-mono font-semibold text-slate-650">{sub.price}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                              sub.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleUpgradeSubscription(sub.id, 'Gold Premium', '$99.00/mo')}
                                className="px-2 py-1 bg-slate-50 text-[10px] font-bold rounded-lg text-indigo-600 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                              >
                                Gold
                              </button>
                              <button 
                                onClick={() => handleUpgradeSubscription(sub.id, 'Silver Pro', '$49.00/mo')}
                                className="px-2 py-1 bg-slate-50 text-[10px] font-bold rounded-lg text-purple-650 border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                              >
                                Silver
                              </button>
                              <button 
                                onClick={() => handleToggleSubStatus(sub.id, sub.status === 'Active' ? 'Suspended' : 'Active')}
                                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                                  sub.status === 'Active' 
                                    ? 'bg-red-50 border-red-150 text-red-650 hover:bg-red-100' 
                                    : 'bg-emerald-50 border-emerald-150 text-emerald-650 hover:bg-emerald-100'
                                }`}
                              >
                                {sub.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DIAGNOSTICS & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Engine Health Console */}
                <div className="md:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-805 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4 w-4 text-indigo-650" />
                      Live Diagnostics Log
                    </h3>
                    <span className="text-[10px] font-bold text-indigo-655 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">SYS LOGS: CONNECTED</span>
                  </div>
                  
                  {/* Keep log console dark for premium developer code readability */}
                  <div className="font-mono text-[10px] bg-slate-900 border border-slate-850 p-4 rounded-xl text-emerald-400 space-y-2 h-[300px] overflow-y-auto w-full scrollbar-thin">
                    <p className="text-slate-400">[05:12:11] info: FLORAX.API.Middleware.RequestLoggingMiddleware - HTTP OPTIONS /api/v1/watertanks</p>
                    <p className="text-slate-400">[05:12:12] info: Microsoft.EntityFrameworkCore.Database.Command - Executed DbCommand SELECT * FROM `WaterTanks`</p>
                    <p className="text-indigo-400">[05:12:15] info: FLORAX.Application - Started execution of GetWaterTanksQuery (Duration: 12ms)</p>
                    <p className="text-slate-400">[05:12:20] info: FLORAX.API.Middleware.RequestLoggingMiddleware - HTTP GET /api/v1/sensordevices</p>
                    <p className="text-yellow-500">[05:12:22] warn: LuckyPennySoftware.MediatR.License - Dev mode license active.</p>
                    <p className="text-slate-400">[05:12:25] info: Microsoft.EntityFrameworkCore.Database.Command - Executed DbCommand SELECT * FROM `SensorDevices`</p>
                    <p className="text-indigo-400">[05:12:28] info: FLORAX.Application - Finished execution of GetAllSensorDevicesQuery (Duration: 29ms)</p>
                    <p className="text-emerald-400">[05:12:45] info: System.Net.Http.Sockets - Port 5222 active and listening on http://0.0.0.0</p>
                  </div>
                </div>

                {/* System CPU / DB Metrics */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-805 border-b border-slate-100 pb-2 uppercase tracking-wider">Engine Performance</h3>
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>CPU Core Usage</span>
                        <span>14%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-indigo-650 h-1.5 rounded-full" style={{ width: '14%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>DB Buffer Cache Hit</span>
                        <span>98.6%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-teal-505 h-1.5 rounded-full" style={{ width: '98.6%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                        <span>Active Connections</span>
                        <span>42 / 100</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-purple-650 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS CONFIG */}
          {activeTab === 'settings' && (
            <div className="space-y-6 w-full">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('System platform configurations successfully saved.');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 w-full shadow-sm"
              >
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b border-slate-100 pb-2">Global Platform Registry Config</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-505 mb-1">API Rate Limit (Requests/minute)</label>
                    <input 
                      type="number" value={config.apiRateLimit} onChange={e => setConfig({ ...config, apiRateLimit: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-805 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-550 mb-1">MQTT Telemetry Broker URL</label>
                    <input 
                      type="text" value={config.mqttBrokerUrl} onChange={e => setConfig({ ...config, mqttBrokerUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-805 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-550 mb-1">SMTP Mail Relay Gateway</label>
                    <input 
                      type="text" value={config.smtpServer} onChange={e => setConfig({ ...config, smtpServer: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-550 mb-1">SaaS Billing Currency</label>
                    <input 
                      type="text" value={config.billingCurrency} onChange={e => setConfig({ ...config, billingCurrency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button type="submit" className="px-4 py-2 bg-indigo-650 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer">
                    Commit Config Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 8: AI ADVISOR */}
          {activeTab === 'agronomist' && (
            <AiAdvisorTab 
              farms={farms}
              zones={zones}
              selectedFarm={selectedFarm}
              selectedZone={selectedZone}
              onZoneSelect={handleZoneSelect}
            />
          )}

        </main>
      </div>
    </div>
  );
}
