import { useState } from 'react';
import { Activity, Play, Square, Sliders, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import api from '../../services/api';

interface Motor {
  id: string;
  motorName: string;
  powerRating: string;
  status: string;
  runtimeHours: number;
}

interface Zone {
  id: string;
  zoneName: string;
  cropType: string;
  status: string;
}

interface ActivityLog {
  id: number;
  time: string;
  event: string;
  user: string;
}

interface IrrigationTabProps {
  motors: Motor[];
  zones: Zone[];
  farms: any[];
  activityLogs: ActivityLog[];
  onToggleMotor: (motorId: string) => void;
  onToggleValve: (zoneName: string, isOpen: boolean) => void;
  onMotorCreated: () => void;
  onValveCreated: () => void;
  isLoading: boolean;
}

export default function IrrigationTab({ 
  motors, 
  zones, 
  farms,
  activityLogs, 
  onToggleMotor, 
  onToggleValve, 
  onMotorCreated,
  onValveCreated,
  isLoading 
}: IrrigationTabProps) {
  // Local state to track which solenoid valves are currently open/closed
  const [valveStates, setValveStates] = useState<Record<string, boolean>>({});

  const [isAddingMotor, setIsAddingMotor] = useState(false);
  const [isAddingValve, setIsAddingValve] = useState(false);
  
  const [newMotorName, setNewMotorName] = useState('');
  const [newMotorPower, setNewMotorPower] = useState('15 HP');
  const [newMotorFarmId, setNewMotorFarmId] = useState('');

  const [newValveSerial, setNewValveSerial] = useState('');
  const [newValveZoneId, setNewValveZoneId] = useState('');
  const [selectedFarmIdForValve, setSelectedFarmIdForValve] = useState('');
  const [zonesForSelectedFarm, setZonesForSelectedFarm] = useState<any[]>([]);
  const [isLoadingZonesForValve, setIsLoadingZonesForValve] = useState(false);

  const handleFarmChangeForValve = async (farmId: string) => {
    setSelectedFarmIdForValve(farmId);
    setNewValveZoneId('');
    if (!farmId) {
      setZonesForSelectedFarm([]);
      return;
    }
    setIsLoadingZonesForValve(true);
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      const rawZones = res.data.data || [];
      // Normalize PascalCase → camelCase for zone fields
      const normalized = rawZones.map((z: any) => ({
        id: z.Id ?? z.id,
        zoneName: z.ZoneName ?? z.zoneName,
        cropType: z.CropType ?? z.cropType,
        status: z.Status ?? z.status,
      }));
      setZonesForSelectedFarm(normalized);
    } catch (err) {
      console.error('Failed to load zones for farm:', err);
      setZonesForSelectedFarm([]);
    } finally {
      setIsLoadingZonesForValve(false);
    }
  };

  const handleToggleValveState = (zoneId: string, zoneName: string) => {
    const nextState = !valveStates[zoneId];
    setValveStates(prev => ({ ...prev, [zoneId]: nextState }));
    onToggleValve(zoneName, nextState);
  };

  const handleCreateMotor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMotorName.trim() || !newMotorFarmId) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.post('api/v1/motors', {
        farmId: newMotorFarmId,
        motorName: newMotorName.trim(),
        powerRating: newMotorPower.trim()
      });
      setNewMotorName('');
      setNewMotorPower('15 HP');
      setNewMotorFarmId('');
      setIsAddingMotor(false);
      onMotorCreated();
      alert('Pump motor registered successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to register motor.');
    }
  };

  const handleCreateValve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValveSerial.trim() || !newValveZoneId) {
      alert('Please fill out all fields.');
      return;
    }
    try {
      await api.post('api/v1/valvecontrollers', {
        zoneId: newValveZoneId,
        deviceSerial: newValveSerial.trim()
      });
      setNewValveSerial('');
      setNewValveZoneId('');
      setSelectedFarmIdForValve('');
      setZonesForSelectedFarm([]);
      setIsAddingValve(false);
      onValveCreated();
      alert('Solenoid valve registered successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to register valve.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actuators Panel: Motors & Solenoid Valves */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pump Motors */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Water Pump Actuators</h3>
                <p className="text-xs text-slate-400">Monitor and switch physical irrigation pump nodes.</p>
              </div>
              <button
                onClick={() => setIsAddingMotor(!isAddingMotor)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm font-semibold"
                type="button"
              >
                <Plus className="h-3 w-3" />
                <span>{isAddingMotor ? 'Close Form' : 'Add Motor'}</span>
              </button>
            </div>

            {isAddingMotor && (
              <form onSubmit={handleCreateMotor} className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl space-y-3 w-full">
                <h4 className="text-xs font-bold text-slate-700">New Pump Motor</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Farm</label>
                    <select
                      value={newMotorFarmId}
                      onChange={e => setNewMotorFarmId(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-750"
                    >
                      <option value="">-- Choose Farm --</option>
                      {farms.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.farmName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motor Name</label>
                    <input 
                      type="text" 
                      required
                      value={newMotorName}
                      onChange={e => setNewMotorName(e.target.value)}
                      placeholder="e.g. Main Pump B"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none font-semibold text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Power Rating</label>
                    <input 
                      type="text" 
                      required
                      value={newMotorPower}
                      onChange={e => setNewMotorPower(e.target.value)}
                      placeholder="e.g. 15 HP"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none font-semibold text-slate-700 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm font-semibold cursor-pointer"
                  >
                    Save Motor
                  </button>
                </div>
              </form>
            )}
            
            {isLoading ? (
              <div className="flex items-center gap-2 py-8 justify-center text-xs text-slate-400">
                <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing pump data...</span>
              </div>
            ) : motors.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center border rounded-xl bg-slate-50/50">
                No active water pump motors detected in the database.
              </div>
            ) : (
              <div className="space-y-4">
                {motors.map(motor => (
                  <div key={motor.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-150 rounded-2xl gap-4 hover:bg-slate-50/30 transition">
                    <div className="flex gap-3 items-center">
                      <div className={`p-3 rounded-xl border ${motor.status === 'Running' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{motor.motorName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Rating: <strong className="text-slate-500">{motor.powerRating || '15 HP'}</strong></p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                          <span>Runtime: <strong className="text-slate-600">{motor.runtimeHours} Hours</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] uppercase font-extrabold px-3 py-1 rounded border ${
                        motor.status === 'Running' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-550'
                      }`}>
                        {motor.status}
                      </span>
                      <button
                        onClick={() => onToggleMotor(motor.id)}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          motor.status === 'Running' 
                            ? 'bg-red-50 hover:bg-red-150 text-red-600 border-red-200' 
                            : 'bg-emerald-50 hover:bg-emerald-150 text-emerald-600 border-emerald-200'
                        }`}
                        title={motor.status === 'Running' ? 'Stop Motor' : 'Start Motor'}
                      >
                        {motor.status === 'Running' ? <Square className="h-4 w-4 fill-red-600 text-red-600" /> : <Play className="h-4 w-4 fill-emerald-600 text-emerald-600" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solenoid Valves */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Solenoid Flow Valves</h3>
                <p className="text-xs text-slate-400">Regulate high-precision pipeline flow to individual zones.</p>
              </div>
              <button
                onClick={() => setIsAddingValve(!isAddingValve)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer shadow-sm font-semibold"
                type="button"
              >
                <Plus className="h-3 w-3" />
                <span>{isAddingValve ? 'Close Form' : 'Add Valve'}</span>
              </button>
            </div>

            {isAddingValve && (
              <form onSubmit={handleCreateValve} className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl space-y-3 w-full">
                <h4 className="text-xs font-bold text-slate-700">New Flow Valve</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Farm</label>
                    <select
                      value={selectedFarmIdForValve}
                      onChange={e => handleFarmChangeForValve(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-750"
                    >
                      <option value="">-- Choose Farm --</option>
                      {farms.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.farmName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Zone</label>
                    <select
                      value={newValveZoneId}
                      onChange={e => setNewValveZoneId(e.target.value)}
                      required
                      disabled={!selectedFarmIdForValve || isLoadingZonesForValve}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-750 disabled:opacity-50"
                    >
                      <option value="">
                        {isLoadingZonesForValve ? 'Loading zones...' : '-- Choose Zone --'}
                      </option>
                      {zonesForSelectedFarm.map((z: any) => (
                        <option key={z.id} value={z.id}>{z.zoneName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Device Serial</label>
                    <input 
                      type="text" 
                      required
                      value={newValveSerial}
                      onChange={e => setNewValveSerial(e.target.value)}
                      placeholder="e.g. FX-VALVE-A4"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none font-semibold text-slate-700 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm font-semibold cursor-pointer"
                  >
                    Save Valve
                  </button>
                </div>
              </form>
            )}

            {zones.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center border rounded-xl bg-slate-50/50">
                Select a farm with active zones to view solenoid valves.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zones.map(zone => {
                  const isOpen = !!valveStates[zone.id];
                  
                  return (
                    <div key={zone.id} className="p-4 border border-slate-150 rounded-2xl flex items-center justify-between hover:bg-slate-50/30 transition">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{zone.zoneName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Crop: <span className="font-medium text-slate-550">{zone.cropType}</span></p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          isOpen ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {isOpen ? 'OPEN' : 'CLOSED'}
                        </span>
                        <button
                          onClick={() => handleToggleValveState(zone.id, zone.zoneName)}
                          className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          title={isOpen ? 'Close Solenoid Valve' : 'Open Solenoid Valve'}
                        >
                          {isOpen ? (
                            <ToggleRight className="h-6 w-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-350" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* System Operations log column */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Irrigation Event Log</h3>
              <p className="text-xs text-slate-400">Operations timeline of water valves and pumps.</p>
            </div>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {activityLogs.map((log, index) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {index !== activityLogs.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <p className="text-xs font-semibold text-slate-700 leading-normal">{log.event}</p>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between font-medium">
                            <span>Operator: <strong>{log.user}</strong></span>
                            <span>{log.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
