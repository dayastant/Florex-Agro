import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, X, Check, Droplets } from 'lucide-react';
import api from '../../services/api';

interface Farm {
  id: string;
  farmName: string;
  district: string;
  province: string;
  totalArea: number;
}

interface Tank {
  id: string;
  farmId: string;
  name: string;
  capacity: number;
  currentLevel: number;
  status: string;
  inletOpen?: boolean;
  outletOpen?: boolean;
}

interface WaterTabProps {
  tanks: Tank[];
  farms: Farm[];
  selectedFarmId: string;
  onToggleInlet: (tankId: string) => void;
  onToggleOutlet: (tankId: string) => void;
  onTankCreated: () => void;
  isLoading: boolean;
}

export default function WaterTab({ 
  tanks, 
  farms,
  selectedFarmId, 
  onToggleInlet, 
  onToggleOutlet, 
  onTankCreated, 
  isLoading 
}: WaterTabProps) {
  const [isAddingTank, setIsAddingTank] = useState(false);
  const [newTankName, setNewTankName] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(10000);
  const [newLevel, setNewLevel] = useState<number>(5000);
  const [newStatus, setNewStatus] = useState('Normal');
  const [selectedRegFarmId, setSelectedRegFarmId] = useState('');

  // Sync selected farm ID from props as default for new reservoir form
  useEffect(() => {
    if (selectedFarmId) {
      setSelectedRegFarmId(selectedFarmId);
    }
  }, [selectedFarmId]);

  // Edit states
  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const [editTankName, setEditTankName] = useState('');
  const [editCapacity, setEditCapacity] = useState<number>(0);
  const [editLevel, setEditLevel] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('Normal');

  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankName.trim() || !selectedRegFarmId) {
      alert('Please enter a name and select a farm.');
      return;
    }

    try {
      await api.post('api/v1/watertanks', {
        farmId: selectedRegFarmId,
        tankName: newTankName,
        capacityLiters: parseFloat(newCapacity.toString()) || 10000,
        currentLevel: parseFloat(newLevel.toString()) || 0,
        status: newStatus
      });

      setNewTankName('');
      setNewCapacity(10000);
      setNewLevel(5000);
      setNewStatus('Normal');
      setIsAddingTank(false);
      onTankCreated();
      alert('Water reservoir registered successfully!');
    } catch (err: any) {
      console.error('Error creating water tank:', err);
      alert(err.response?.data?.message || 'Failed to create reservoir.');
    }
  };

  const startEditTank = (tank: Tank) => {
    setEditingTankId(tank.id);
    setEditTankName(tank.name);
    setEditCapacity(tank.capacity);
    setEditLevel(tank.currentLevel);
    setEditStatus(tank.status);
  };

  const handleUpdateTank = async (e: React.FormEvent, tankId: string) => {
    e.preventDefault();
    if (!editTankName.trim()) return;

    try {
      await api.put(`api/v1/watertanks/${tankId}`, {
        id: tankId,
        tankName: editTankName,
        capacityLiters: parseFloat(editCapacity.toString()) || 10000,
        currentLevel: parseFloat(editLevel.toString()) || 0,
        status: editStatus
      });

      setEditingTankId(null);
      onTankCreated();
      alert('Reservoir details updated successfully!');
    } catch (err: any) {
      console.error('Error updating water tank:', err);
      alert(err.response?.data?.message || 'Failed to update reservoir details.');
    }
  };

  const handleDeleteTank = async (tankId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this water tank/reservoir?')) return;

    try {
      await api.delete(`api/v1/watertanks/${tankId}`);
      onTankCreated();
      alert('Reservoir deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting water tank:', err);
      alert(err.response?.data?.message || 'Failed to delete reservoir.');
    }
  };

  const getFarmDisplayIdByFarmId = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return 'Unknown Farm';
    const match = farm.farmName.match(/^\[(.*?)\]/);
    return match ? match[1] : farm.farmName;
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Water Assets & Reservoir Levels</h3>
          <p className="text-xs text-slate-400">Monitor storage volumes, capacity meters, and flow valves.</p>
        </div>
        <button
          onClick={() => setIsAddingTank(!isAddingTank)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-100/30"
        >
          <Plus className="h-4 w-4" />
          <span>{isAddingTank ? 'Close Form' : 'Register Reservoir'}</span>
        </button>
      </div>

      {/* Add Tank Form */}
      {isAddingTank && (
        <form onSubmit={handleCreateTank} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 w-full">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">New Water Reservoir Registry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reservoir Name</label>
              <input 
                type="text" 
                required 
                value={newTankName} 
                onChange={e => setNewTankName(e.target.value)} 
                placeholder="e.g. Reservoir East B"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Capacity (Liters)</label>
              <input 
                type="number" 
                required 
                value={newCapacity || ''} 
                onChange={e => setNewCapacity(parseFloat(e.target.value) || 0)} 
                placeholder="e.g. 10000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Initial Level (Liters)</label>
              <input 
                type="number" 
                required 
                value={newLevel || ''} 
                onChange={e => setNewLevel(parseFloat(e.target.value) || 0)} 
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select 
                value={newStatus} 
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="Critically Low">Critically Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Allocate Farm ID / Code</label>
              <select 
                value={selectedRegFarmId} 
                onChange={e => setSelectedRegFarmId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
              >
                <option value="">-- Select Farm --</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{getFarmDisplayIdByFarmId(f.id)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsAddingTank(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Save Reservoir
            </button>
          </div>
        </form>
      )}

      {/* Reservoirs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 flex items-center gap-2 py-12 justify-center text-xs text-slate-400">
            <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing water levels...</span>
          </div>
        ) : tanks.length === 0 ? (
          <div className="col-span-2 text-slate-400 text-xs py-8 text-center border rounded-xl bg-slate-50/50">
            No water storage tanks detected for this farm.
          </div>
        ) : (
          tanks.map(tank => {
            const isEditing = editingTankId === tank.id;
            const capacity = tank.capacity || 10000;
            const level = tank.currentLevel || 0;
            const percent = Math.min(100, Math.round((level / capacity) * 100));
            
            return (
              <div key={tank.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
                {isEditing ? (
                  /* Edit Mode Form */
                  <form onSubmit={(e) => handleUpdateTank(e, tank.id)} className="space-y-4">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Edit Reservoir Details</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Reservoir Name</label>
                        <input 
                          type="text" 
                          required
                          value={editTankName} 
                          onChange={e => setEditTankName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Capacity (Liters)</label>
                        <input 
                          type="number" 
                          required
                          value={editCapacity} 
                          onChange={e => setEditCapacity(parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Current Level (Liters)</label>
                        <input 
                          type="number" 
                          required
                          value={editLevel} 
                          onChange={e => setEditLevel(parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">Status</label>
                        <select 
                          value={editStatus} 
                          onChange={e => setEditStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Low">Low</option>
                          <option value="Critically Low">Critically Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button 
                        type="button" 
                        onClick={() => setEditingTankId(null)}
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
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Read Mode Layout */
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                          <Droplets className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          {tank.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">Total Capacity: <span className="font-semibold text-slate-600">{capacity} Liters</span></p>
                          <span className="text-slate-350 text-[10px]">•</span>
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                            {getFarmDisplayIdByFarmId(tank.farmId)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          tank.status === 'Normal' ? 'bg-emerald-50 border-emerald-150 text-emerald-700' : 'bg-amber-50 border-amber-150 text-amber-700'
                        }`}>
                          {tank.status}
                        </span>
                        
                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 border-l pl-2 border-slate-200">
                          <button
                            onClick={() => startEditTank(tank)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition"
                            title="Edit Reservoir Details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTank(tank.id)}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-650 transition"
                            title="Delete Reservoir"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Visual Fluid Gauge */}
                    <div className="flex items-center gap-6">
                      {/* Static Cylinder Tank View */}
                      <div className="relative w-20 h-28 border-2 border-slate-350 rounded-b-xl rounded-t bg-slate-50 flex flex-col justify-end overflow-hidden flex-shrink-0 shadow-inner">
                        <div 
                          className="bg-blue-500 w-full transition-all duration-300 relative flex items-center justify-center animate-pulse" 
                          style={{ height: `${percent}%` }}
                        >
                          <span className="absolute top-2 text-[10px] font-bold text-white">{percent}%</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Current level</p>
                            <p className="text-xs font-extrabold text-slate-700 mt-0.5">{level} L</p>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Remaining</p>
                            <p className="text-xs font-extrabold text-slate-700 mt-0.5">{Math.max(0, capacity - level)} L</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-semibold text-slate-500">Inlet Valve Control:</span>
                          <button
                            onClick={() => onToggleInlet(tank.id)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                              tank.inletOpen ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-550'
                            }`}
                          >
                            {tank.inletOpen ? 'OPEN' : 'CLOSED'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Outlet Valve Control:</span>
                          <button
                            onClick={() => onToggleOutlet(tank.id)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                              tank.outletOpen ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-555'
                            }`}
                          >
                            {tank.outletOpen ? 'OPEN' : 'CLOSED'}
                          </button>
                        </div>
                      </div>
                    </div>
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
