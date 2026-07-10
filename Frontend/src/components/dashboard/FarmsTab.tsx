import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Layers, Pencil, Trash, X, Check } from 'lucide-react';
import api from '../../services/api';

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

interface SensorDevice {
  id: string;
  zoneId: string;
  deviceSerial: string;
  sensorType: string;
  status: string;
}

interface FarmsTabProps {
  farms: Farm[];
  currentUser: any;
  onFarmCreated: () => void;
}

// Predefined location mappings for select input dropdowns
const PROVINCES_MAP: Record<string, string[]> = {
  'Istanbul': ['Kadikoy', 'Besiktas', 'Uskudar', 'Fatih'],
  'Ankara': ['Cankaya', 'Kecioren', 'Yenimahalle', 'Mamak'],
  'Izmir': ['Karsiyaka', 'Bornova', 'Konak', 'Buca'],
  'Antalya': ['Muratpasa', 'Konyaalti', 'Kepez', 'Alanya']
};

export default function FarmsTab({ farms, currentUser, onFarmCreated }: FarmsTabProps) {
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmCode, setNewFarmCode] = useState('');
  const [newFarmProvince, setNewFarmProvince] = useState('Istanbul');
  const [newFarmDistrict, setNewFarmDistrict] = useState('Kadikoy');
  const [newFarmArea, setNewFarmArea] = useState<number>(0);

  // Edit Farm states
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [editFarmName, setEditFarmName] = useState('');
  const [editFarmCode, setEditFarmCode] = useState('');
  const [editFarmProvince, setEditFarmProvince] = useState('Istanbul');
  const [editFarmDistrict, setEditFarmDistrict] = useState('Kadikoy');
  const [editFarmArea, setEditFarmArea] = useState<number>(0);

  // Expanded farm cards to load zones
  const [expandedFarms, setExpandedFarms] = useState<Record<string, boolean>>({});
  const [farmZones, setFarmZones] = useState<Record<string, Zone[]>>({});
  const [loadingZones, setLoadingZones] = useState<Record<string, boolean>>({});

  // Sensor Devices list for allocation select options
  const [sensorDevices, setSensorDevices] = useState<SensorDevice[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState('');

  // Adding Zone states
  const [addingZoneForFarmId, setAddingZoneForFarmId] = useState<string | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCrop, setNewZoneCrop] = useState('');
  const [newZoneSoil, setNewZoneSoil] = useState('');
  const [newZoneArea, setNewZoneArea] = useState<number>(0);

  // Edit Zone states
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editZoneCrop, setEditZoneCrop] = useState('');
  const [editZoneSoil, setEditZoneSoil] = useState('');
  const [editZoneArea, setEditZoneArea] = useState<number>(0);

  // Automatically expand the first farm on load
  useEffect(() => {
    if (farms.length > 0 && Object.keys(expandedFarms).length === 0) {
      handleToggleFarmExpand(farms[0].id);
    }
    fetchSensorDevices();
  }, [farms]);

  const fetchSensorDevices = async () => {
    try {
      const res = await api.get('api/v1/sensordevices');
      setSensorDevices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sensor devices:', err);
    }
  };

  const handleToggleFarmExpand = async (farmId: string) => {
    // If editing, don't expand/collapse
    if (editingFarmId === farmId) return;

    const isNowExpanded = !expandedFarms[farmId];
    setExpandedFarms(prev => ({ ...prev, [farmId]: isNowExpanded }));

    if (isNowExpanded && !farmZones[farmId]) {
      await fetchZonesForFarm(farmId);
    }
  };

  const fetchZonesForFarm = async (farmId: string) => {
    setLoadingZones(prev => ({ ...prev, [farmId]: true }));
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      setFarmZones(prev => ({ ...prev, [farmId]: res.data.data || [] }));
    } catch (err) {
      console.error(`Failed to fetch zones for farm ${farmId}:`, err);
    } finally {
      setLoadingZones(prev => ({ ...prev, [farmId]: false }));
    }
  };

  const handleProvinceChange = (province: string) => {
    setNewFarmProvince(province);
    const districts = PROVINCES_MAP[province] || [];
    setNewFarmDistrict(districts[0] || '');
  };

  const handleEditProvinceChange = (province: string) => {
    setEditFarmProvince(province);
    const districts = PROVINCES_MAP[province] || [];
    setEditFarmDistrict(districts[0] || '');
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName.trim()) return;

    try {
      const ownerId = currentUser?.Id || "99999999-9999-9999-9999-999999999999";
      
      const formattedName = newFarmCode.trim() 
        ? `[${newFarmCode.trim()}] ${newFarmName.trim()}` 
        : newFarmName.trim();

      await api.post('api/v1/farms', {
        farmName: formattedName,
        district: newFarmDistrict,
        province: newFarmProvince,
        latitude: 39.92,
        longitude: 32.85,
        totalArea: parseFloat(newFarmArea.toString()) || 0,
        ownerId: ownerId
      });

      setNewFarmName('');
      setNewFarmCode('');
      setNewFarmProvince('Istanbul');
      setNewFarmDistrict('Kadikoy');
      setNewFarmArea(0);
      setIsAddingFarm(false);
      onFarmCreated();
      alert('Farm registered successfully!');
    } catch (err: any) {
      console.error('Error creating farm:', err);
      alert(err.response?.data?.message || 'Failed to create farm.');
    }
  };

  const startEditFarm = (e: React.MouseEvent, farm: Farm) => {
    e.stopPropagation();
    setEditingFarmId(farm.id);
    
    const match = farm.farmName.match(/^\[(.*?)\]/);
    if (match) {
      setEditFarmCode(match[1]);
      setEditFarmName(farm.farmName.replace(/^\[.*?\]\s*/, ''));
    } else {
      setEditFarmCode('');
      setEditFarmName(farm.farmName);
    }
    
    setEditFarmArea(farm.totalArea);
    setEditFarmProvince(farm.province);
    setEditFarmDistrict(farm.district);
  };

  const handleUpdateFarm = async (e: React.FormEvent, farmId: string) => {
    e.preventDefault();
    if (!editFarmName.trim()) return;

    try {
      const formattedName = editFarmCode.trim() 
        ? `[${editFarmCode.trim()}] ${editFarmName.trim()}` 
        : editFarmName.trim();

      await api.put(`api/v1/farms/${farmId}`, {
        id: farmId,
        farmName: formattedName,
        district: editFarmDistrict,
        province: editFarmProvince,
        totalArea: parseFloat(editFarmArea.toString()) || 0
      });

      setEditingFarmId(null);
      onFarmCreated();
      alert('Farm details updated successfully!');
    } catch (err: any) {
      console.error('Error updating farm:', err);
      alert(err.response?.data?.message || 'Failed to update farm details.');
    }
  };

  const handleDeleteFarm = async (e: React.MouseEvent, farmId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this farm and all its sub-zones?')) return;

    try {
      await api.delete(`api/v1/farms/${farmId}`);
      onFarmCreated();
      alert('Farm deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting farm:', err);
      alert(err.response?.data?.message || 'Failed to delete farm.');
    }
  };

  const handleCreateZone = async (e: React.FormEvent, farmId: string) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    try {
      // 1. Create Zone
      const zoneRes = await api.post('api/v1/irrigationzones', {
        farmId: farmId,
        zoneName: newZoneName,
        cropType: newZoneCrop,
        soilType: newZoneSoil,
        area: parseFloat(newZoneArea.toString()) || 0,
        status: 'Active'
      });

      const newZoneId = zoneRes.data.data;

      // 2. Allocate selected IoT Sensor device if defined
      if (selectedSensorId) {
        await api.put(`api/v1/sensordevices/${selectedSensorId}/allocate`, {
          sensorDeviceId: selectedSensorId,
          zoneId: newZoneId
        });
      }

      setNewZoneName('');
      setNewZoneCrop('');
      setNewZoneSoil('');
      setNewZoneArea(0);
      setSelectedSensorId('');
      setAddingZoneForFarmId(null);
      
      // Refresh local sensors cache and farm zones list
      await fetchSensorDevices();
      await fetchZonesForFarm(farmId);
      alert('Irrigation zone registered and IoT node allocated successfully!');
    } catch (err: any) {
      console.error('Error creating zone:', err);
      alert(err.response?.data?.message || 'Failed to create irrigation zone.');
    }
  };

  const handleDeleteZone = async (zoneId: string, farmId: string) => {
    if (!window.confirm('Delete this irrigation zone permanently?')) return;
    try {
      await api.delete(`api/v1/irrigationzones/${zoneId}`);
      await fetchZonesForFarm(farmId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete zone.');
    }
  };

  const startEditZone = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setEditZoneName(zone.zoneName);
    setEditZoneCrop(zone.cropType);
    setEditZoneSoil(zone.soilType);
    setEditZoneArea(zone.area);
  };

  const handleUpdateZone = async (e: React.FormEvent, zoneId: string, farmId: string) => {
    e.preventDefault();
    if (!editZoneName.trim()) return;
    try {
      await api.put(`api/v1/irrigationzones/${zoneId}`, {
        id: zoneId,
        farmId,
        zoneName: editZoneName,
        cropType: editZoneCrop,
        soilType: editZoneSoil,
        area: parseFloat(editZoneArea.toString()) || 0
      });
      setEditingZoneId(null);
      await fetchZonesForFarm(farmId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update zone.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Control Bar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Geographical Farm Directory</h3>
          <p className="text-xs text-slate-400">Configure land coordinates, surface areas, and irrigation sectors.</p>
        </div>
        <button
          onClick={() => setIsAddingFarm(!isAddingFarm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-100/30"
        >
          <Plus className="h-4 w-4" />
          <span>{isAddingFarm ? 'Close Form' : 'Register Farm'}</span>
        </button>
      </div>

      {/* Add Farm Form */}
      {isAddingFarm && (
        <form onSubmit={handleCreateFarm} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 w-full">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">New Farm Registry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pb-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Farm Name</label>
              <input 
                type="text" 
                required 
                value={newFarmName} 
                onChange={e => setNewFarmName(e.target.value)} 
                placeholder="e.g. Sunny Valley Fields"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Farm ID / Code</label>
              <input 
                type="text" 
                value={newFarmCode} 
                onChange={e => setNewFarmCode(e.target.value)} 
                placeholder="e.g. FARM001"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Total Area (Hectares)</label>
              <input 
                type="number" 
                required 
                value={newFarmArea || ''} 
                onChange={e => setNewFarmArea(parseFloat(e.target.value) || 0)} 
                placeholder="e.g. 15.5"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Province</label>
              <select 
                value={newFarmProvince} 
                onChange={e => handleProvinceChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {Object.keys(PROVINCES_MAP).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">District</label>
              <select 
                value={newFarmDistrict} 
                onChange={e => setNewFarmDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {(PROVINCES_MAP[newFarmProvince] || []).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsAddingFarm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Save Farm
            </button>
          </div>
        </form>
      )}

      {/* Farms List */}
      <div className="space-y-4">
        {farms.length === 0 ? (
          <div className="bg-white border p-8 text-center rounded-2xl text-slate-400 font-medium text-xs">
            No farms registered in the system yet. Click the "Register Farm" button to add one.
          </div>
        ) : (
          farms.map(farm => {
            const isEditing = editingFarmId === farm.id;
            const isExpanded = expandedFarms[farm.id];
            const zonesList = farmZones[farm.id] || [];
            const isLoading = loadingZones[farm.id];
            
            return (
              <div key={farm.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                {isEditing ? (
                  /* Edit Farm Inline Form */
                  <form onSubmit={(e) => handleUpdateFarm(e, farm.id)} className="p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Edit Farm Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Farm Name</label>
                        <input 
                          type="text" 
                          required
                          value={editFarmName} 
                          onChange={e => setEditFarmName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Farm ID / Code</label>
                        <input 
                          type="text" 
                          value={editFarmCode} 
                          onChange={e => setEditFarmCode(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Total Area (Ha)</label>
                        <input 
                          type="number" 
                          required
                          value={editFarmArea} 
                          onChange={e => setEditFarmArea(parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Province</label>
                        <select 
                          value={editFarmProvince} 
                          onChange={e => handleEditProvinceChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                        >
                          {Object.keys(PROVINCES_MAP).map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">District</label>
                        <select 
                          value={editFarmDistrict} 
                          onChange={e => setEditFarmDistrict(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                        >
                          {(PROVINCES_MAP[editFarmProvince] || []).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1.5">
                      <button 
                        type="button" 
                        onClick={() => setEditingFarmId(null)}
                        className="px-3 py-1.5 border text-slate-500 text-[10px] font-semibold rounded-lg hover:bg-slate-50 flex items-center gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                      <button 
                        type="submit" 
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Card Layout */
                  <>
                    <div 
                      onClick={() => handleToggleFarmExpand(farm.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-base text-slate-800">{farm.farmName}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{farm.district}, {farm.province}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 text-slate-650 text-xs font-semibold rounded-full border border-slate-200">
                          {farm.totalArea} Hectares
                        </span>
                        
                        {/* CRUD Buttons */}
                        <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200/80">
                          <button
                            onClick={(e) => startEditFarm(e, farm)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            title="Edit Farm Details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteFarm(e, farm.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-655 transition"
                            title="Delete Farm"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-slate-400 text-xs font-medium border-l pl-3 border-slate-200/80">
                          {isExpanded ? 'Hide Sectors' : 'Show Sectors'}
                        </span>
                      </div>
                    </div>

                    {/* Sub-Zones Section */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/20 p-5 space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sub-irrigation Sectors (Zones)</span>
                          <button
                            onClick={() => setAddingZoneForFarmId(addingZoneForFarmId === farm.id ? null : farm.id)}
                            className="px-3 py-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg transition"
                          >
                            {addingZoneForFarmId === farm.id ? 'Close Add Form' : 'Add Irrigation Zone'}
                          </button>
                        </div>

                        {/* Add Zone Form */}
                        {addingZoneForFarmId === farm.id && (
                          <form onSubmit={(e) => handleCreateZone(e, farm.id)} className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-3 w-full animate-fade-in">
                            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b">New Irrigation Zone Form</h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Zone Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={newZoneName} 
                                  onChange={e => setNewZoneName(e.target.value)} 
                                  placeholder="e.g. Zone East 3"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Area (Hectares)</label>
                                <input 
                                  type="number" 
                                  required 
                                  value={newZoneArea || ''} 
                                  onChange={e => setNewZoneArea(parseFloat(e.target.value) || 0)} 
                                  placeholder="e.g. 4.2"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Crop Type</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={newZoneCrop} 
                                  onChange={e => setNewZoneCrop(e.target.value)} 
                                  placeholder="e.g. Tomatoes"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Soil Type</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={newZoneSoil} 
                                  onChange={e => setNewZoneSoil(e.target.value)} 
                                  placeholder="e.g. Silt Loam"
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Allocate IoT Sensor Node (Serial)</label>
                                <select 
                                  value={selectedSensorId} 
                                  onChange={e => setSelectedSensorId(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
                                >
                                  <option value="">-- No Sensor Allocated --</option>
                                  {sensorDevices.map(d => (
                                    <option key={d.id} value={d.id}>
                                      {d.deviceSerial} ({d.sensorType})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-1.5 justify-end pt-2 border-t border-slate-100 mt-2">
                              <button 
                                type="button" 
                                onClick={() => setAddingZoneForFarmId(null)}
                                className="px-3 py-1.5 border text-slate-500 text-[10px] font-semibold rounded-lg hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg"
                              >
                                Add Zone
                              </button>
                            </div>
                          </form>
                        )}

                        {isLoading ? (
                          <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-400">
                            <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading zones data...</span>
                          </div>
                        ) : zonesList.length === 0 ? (
                          <p className="text-slate-400 text-xs py-2 text-center">No irrigation zones registered for this farm yet.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {zonesList.map(zone => {
                              const linkedSensor = sensorDevices.find(d => d.zoneId === zone.id);
                              const isEditingZone = editingZoneId === zone.id;

                              return (
                                <div key={zone.id} className="bg-white border border-slate-150 p-4 rounded-xl shadow-xs">
                                  {isEditingZone ? (
                                    <form onSubmit={(e) => handleUpdateZone(e, zone.id, farm.id)} className="space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Zone Name</label>
                                          <input type="text" required value={editZoneName} onChange={e => setEditZoneName(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Area (Ha)</label>
                                          <input type="number" required value={editZoneArea || ''} onChange={e => setEditZoneArea(parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Crop Type</label>
                                          <input type="text" required value={editZoneCrop} onChange={e => setEditZoneCrop(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Soil Type</label>
                                          <input type="text" required value={editZoneSoil} onChange={e => setEditZoneSoil(e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                                        <button type="submit" className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition cursor-pointer" title="Save">
                                          <Check className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => setEditingZoneId(null)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition cursor-pointer" title="Cancel">
                                          <X className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1 flex-1 min-w-0">
                                        <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                          <Layers className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                                          <span className="truncate">{zone.zoneName}</span>
                                        </h5>
                                        <p className="text-[10px] text-slate-400">Area: <strong className="text-slate-600">{zone.area} Ha</strong> | Crop: <strong className="text-slate-600">{zone.cropType}</strong></p>
                                        <p className="text-[10px] text-slate-400">Soil: <strong className="text-slate-550">{zone.soilType}</strong></p>
                                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                                            zone.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-yellow-50 border-yellow-100 text-yellow-700 border border-yellow-200'
                                          }`}>
                                            {zone.status}
                                          </span>
                                          {linkedSensor && (
                                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-150 text-blue-700 text-[9px] font-extrabold rounded uppercase tracking-wider">
                                              {linkedSensor.deviceSerial}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 flex-shrink-0 ml-2">
                                        <button onClick={() => startEditZone(zone)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer" title="Edit Zone">
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteZone(zone.id, farm.id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition cursor-pointer" title="Delete Zone">
                                          <Trash className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
