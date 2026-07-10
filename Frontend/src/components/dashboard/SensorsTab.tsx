import React, { useState, useEffect } from 'react';
import { Battery, Signal, Plus, Cpu, Pencil, Trash, X, Check, Wrench } from 'lucide-react';
import api from '../../services/api';

interface Farm {
  id: string;
  farmName: string;
  district: string;
  province: string;
  totalArea: number;
}

interface SensorDevice {
  id: string;
  zoneId: string;
  deviceSerial: string;
  sensorType: string;
  firmwareVersion: string;
  batteryPercentage: number;
  signalStrength: number;
  status: string;
  installedAt: string;
}

interface Zone {
  id: string;
  zoneName: string;
  cropType: string;
  status: string;
}

interface SensorsTabProps {
  sensorDevices: SensorDevice[];
  farms: Farm[];
  onSensorCreated: () => void;
  isLoading: boolean;
}

export default function SensorsTab({ sensorDevices, farms, onSensorCreated, isLoading }: SensorsTabProps) {
  const [isAddingSensor, setIsAddingSensor] = useState(false);
  const [deviceSerial, setDeviceSerial] = useState('');
  const [sensorType, setSensorType] = useState('Soil Moisture');
  const [signalStrength, setSignalStrength] = useState<number>(90);
  const [batteryPercentage, setBatteryPercentage] = useState<number>(100);
  const [status, setStatus] = useState('Online');
  const [firmwareVersion, setFirmwareVersion] = useState('v1.0.0');

  // Form selected farm and dynamic zones
  const [selectedRegFarmId, setSelectedRegFarmId] = useState('');
  const [regZones, setRegZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState('');

  // Row-level farm selection tracking
  const [rowSelectedFarm, setRowSelectedFarm] = useState<Record<string, string>>({});
  const [allZones, setAllZones] = useState<Record<string, Zone[]>>({});

  // Editing Sensor States
  const [editingSensorId, setEditingSensorId] = useState<string | null>(null);
  const [editSerial, setEditSerial] = useState('');
  const [editType, setEditType] = useState('Soil Moisture');
  const [editSignal, setEditSignal] = useState<number>(90);
  const [editBattery, setEditBattery] = useState<number>(100);
  const [editStatus, setEditStatus] = useState('Online');
  const [editFirmware, setEditFirmware] = useState('v1.0.0');

  useEffect(() => {
    if (farms.length > 0) {
      fetchAllZonesOfAllFarms(farms);
    }
  }, [farms]);

  const fetchAllZonesOfAllFarms = async (farmsList: Farm[]) => {
    const zonesMap: Record<string, Zone[]> = {};
    for (const farm of farmsList) {
      try {
        const res = await api.get(`api/v1/irrigationzones/farm/${farm.id}`);
        zonesMap[farm.id] = res.data.data || [];
      } catch (err) {
        console.error(`Failed to fetch zones for farm ${farm.id}:`, err);
      }
    }
    setAllZones(zonesMap);
  };

  const handleRegFarmChange = async (farmId: string) => {
    setSelectedRegFarmId(farmId);
    setSelectedZoneId('');
    if (!farmId) {
      setRegZones([]);
      return;
    }
    try {
      const res = await api.get(`api/v1/irrigationzones/farm/${farmId}`);
      setRegZones(res.data.data || []);
    } catch (err) {
      console.error('Failed to load zones for selected farm:', err);
    }
  };

  const handleRowFarmChange = (deviceId: string, farmId: string) => {
    setRowSelectedFarm(prev => ({ ...prev, [deviceId]: farmId }));
  };

  const handleCreateSensor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceSerial.trim() || !selectedZoneId) {
      alert('Please fill out all required fields and select an allocation zone.');
      return;
    }

    try {
      await api.post('api/v1/sensordevices', {
        zoneId: selectedZoneId,
        deviceSerial: deviceSerial.trim(),
        sensorType: sensorType,
        firmwareVersion: firmwareVersion.trim(),
        status: status,
        batteryPercentage: parseInt(batteryPercentage.toString()) || 100,
        signalStrength: parseInt(signalStrength.toString()) || 90
      });

      setDeviceSerial('');
      setSensorType('Soil Moisture');
      setSignalStrength(90);
      setBatteryPercentage(100);
      setStatus('Online');
      setFirmwareVersion('v1.0.0');
      setSelectedZoneId('');
      setSelectedRegFarmId('');
      setRegZones([]);
      setIsAddingSensor(false);
      
      onSensorCreated();
      alert('IoT Sensor Node registered successfully!');
    } catch (err: any) {
      console.error('Failed to create sensor node:', err);
      alert(err.response?.data?.message || 'Failed to create sensor node.');
    }
  };

  const handleAllocateSensorToZone = async (deviceId: string, zoneId: string) => {
    try {
      const targetZoneId = zoneId || '00000000-0000-0000-0000-000000000000';
      await api.put(`api/v1/sensordevices/${deviceId}/allocate`, {
        sensorDeviceId: deviceId,
        zoneId: targetZoneId
      });
      onSensorCreated();
      alert('Sensor zone allocation updated successfully!');
    } catch (err: any) {
      console.error('Failed to allocate sensor to zone:', err);
      alert(err.response?.data?.message || 'Failed to update sensor allocation.');
    }
  };

  const startEditSensor = (device: SensorDevice) => {
    setEditingSensorId(device.id);
    setEditSerial(device.deviceSerial);
    setEditType(device.sensorType);
    setEditSignal(device.signalStrength);
    setEditBattery(device.batteryPercentage);
    setEditStatus(device.status);
    setEditFirmware(device.firmwareVersion);
  };

  const handleUpdateSensor = async (deviceId: string) => {
    if (!editSerial.trim()) return;

    try {
      await api.put(`api/v1/sensordevices/${deviceId}`, {
        id: deviceId,
        deviceSerial: editSerial.trim(),
        sensorType: editType,
        firmwareVersion: editFirmware.trim() || 'v1.0.0',
        status: editStatus,
        batteryPercentage: parseInt(editBattery.toString()) || 100,
        signalStrength: parseInt(editSignal.toString()) || 90
      });

      setEditingSensorId(null);
      onSensorCreated();
      alert('Sensor details updated successfully!');
    } catch (err: any) {
      console.error('Failed to update sensor node:', err);
      alert(err.response?.data?.message || 'Failed to update sensor node.');
    }
  };

  const handleDeleteSensor = async (deviceId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this sensor node?')) return;

    try {
      await api.delete(`api/v1/sensordevices/${deviceId}`);
      onSensorCreated();
      alert('Sensor node deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete sensor node:', err);
      alert(err.response?.data?.message || 'Failed to delete sensor node.');
    }
  };

  const handleCalibrateSensor = async (device: SensorDevice) => {
    if (!window.confirm(`Are you sure you want to run calibration routine for sensor ${device.deviceSerial}?`)) return;
    try {
      await api.put(`api/v1/sensordevices/${device.id}`, {
        id: device.id,
        deviceSerial: device.deviceSerial,
        sensorType: device.sensorType,
        firmwareVersion: device.firmwareVersion,
        status: 'Online',
        batteryPercentage: 100,
        signalStrength: 95
      });
      onSensorCreated();
      alert(`Calibration successful! Sensor ${device.deviceSerial} values adjusted to optimal defaults (Battery: 100%, Signal: 95%).`);
    } catch (err: any) {
      console.error('Failed to calibrate sensor:', err);
      alert(err.response?.data?.message || 'Failed to calibrate sensor.');
    }
  };

  const getFarmDisplayId = (name: string) => {
    const match = name.match(/^\[(.*?)\]/);
    return match ? match[1] : name;
  };

  const findFarmIdByZoneId = (zoneId: string) => {
    for (const [farmId, zonesList] of Object.entries(allZones)) {
      if (zonesList.some(z => z.id === zoneId)) {
        return farmId;
      }
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-white p-4 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Telemetry Sensor Array</h3>
          <p className="text-xs text-slate-400">List of deployed physical nodes, signal metrics, and firmware statuses.</p>
        </div>
        <button
          onClick={() => setIsAddingSensor(!isAddingSensor)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-100/30"
        >
          <Plus className="h-4 w-4" />
          <span>{isAddingSensor ? 'Close Form' : 'Register Sensor'}</span>
        </button>
      </div>

      {/* Add Sensor Form */}
      {isAddingSensor && (
        <form onSubmit={handleCreateSensor} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4 w-full">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2">New IoT Sensor Node Registry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Node Serial</label>
              <input 
                type="text" 
                required 
                value={deviceSerial} 
                onChange={e => setDeviceSerial(e.target.value)} 
                placeholder="e.g. FX-SOIL-N5"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Sensor Type</label>
              <select 
                value={sensorType} 
                onChange={e => setSensorType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Soil Moisture">Soil Moisture</option>
                <option value="Temperature">Temperature</option>
                <option value="Humidity">Humidity</option>
                <option value="Flow Rate">Flow Rate</option>
                <option value="Ambient Light">Ambient Light</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Signal Strength (%)</label>
              <input 
                type="number" 
                required 
                min="0" 
                max="100" 
                value={signalStrength || ''} 
                onChange={e => setSignalStrength(parseInt(e.target.value) || 0)} 
                placeholder="e.g. 85"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Battery Status (%)</label>
              <input 
                type="number" 
                required 
                min="0" 
                max="100" 
                value={batteryPercentage || ''} 
                onChange={e => setBatteryPercentage(parseInt(e.target.value) || 0)} 
                placeholder="e.g. 95"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Diagnostic Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Firmware Version</label>
              <input 
                type="text" 
                required 
                value={firmwareVersion} 
                onChange={e => setFirmwareVersion(e.target.value)} 
                placeholder="e.g. v1.0.3"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Allocate Farm ID / Code</label>
              <select 
                value={selectedRegFarmId} 
                onChange={e => handleRegFarmChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer font-medium"
              >
                <option value="">-- Choose Farm --</option>
                {farms.map(f => (
                  <option key={f.id} value={f.id}>{getFarmDisplayId(f.farmName)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Allocate Irrigation Zone</label>
              <select 
                value={selectedZoneId} 
                onChange={e => setSelectedZoneId(e.target.value)}
                disabled={!selectedRegFarmId}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer disabled:opacity-50 font-medium"
              >
                <option value="">-- Choose Zone --</option>
                {regZones.map(z => (
                  <option key={z.id} value={z.id}>{z.zoneName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsAddingSensor(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 text-xs font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Save Sensor Node
            </button>
          </div>
        </form>
      )}

      {/* Sensor List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        {isLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-xs text-slate-400">
            <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Syncing sensor nodes...</span>
          </div>
        ) : sensorDevices.length === 0 ? (
          <div className="text-slate-400 text-xs py-8 text-center border rounded-xl bg-slate-50/50">
            No sensor nodes found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Node Serial</th>
                  <th className="pb-3 font-semibold">Sensor Type</th>
                  <th className="pb-3 font-semibold">Allocate Farm ID</th>
                  <th className="pb-3 font-semibold">Allocate Irrigation Zone</th>
                  <th className="pb-3 font-semibold">Signal Level</th>
                  <th className="pb-3 font-semibold">Battery Status</th>
                  <th className="pb-3 font-semibold">Diagnostic</th>
                  <th className="pb-3 font-semibold">Firmware</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                {sensorDevices.map(device => {
                  const isEditing = editingSensorId === device.id;
                  const currentFarmId = findFarmIdByZoneId(device.zoneId);
                  const activeFarmId = rowSelectedFarm[device.id] !== undefined ? rowSelectedFarm[device.id] : currentFarmId;
                  const rowZonesList = allZones[activeFarmId] || [];

                  return (
                    <tr key={device.id} className="hover:bg-slate-50/50 transition">
                      {isEditing ? (
                        /* Inline Row Edit Mode */
                        <>
                          <td className="py-2.5">
                            <input 
                              type="text" 
                              required
                              value={editSerial} 
                              onChange={e => setEditSerial(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-emerald-500 font-bold"
                            />
                          </td>
                          <td className="py-2.5">
                            <select 
                              value={editType} 
                              onChange={e => setEditType(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-full bg-white focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Soil Moisture">Soil Moisture</option>
                              <option value="Temperature">Temperature</option>
                              <option value="Humidity">Humidity</option>
                              <option value="Flow Rate">Flow Rate</option>
                              <option value="Ambient Light">Ambient Light</option>
                            </select>
                          </td>
                          <td className="py-2.5">
                            {/* Handled out-of-line to prevent dynamic zone selection clashing with update handler */}
                            <span className="text-slate-400 text-xs italic pl-2.5">Edit farm below</span>
                          </td>
                          <td className="py-2.5">
                            <span className="text-slate-400 text-xs italic pl-2.5">Edit zone below</span>
                          </td>
                          <td className="py-2.5">
                            <input 
                              type="number" 
                              required
                              min="0"
                              max="100"
                              value={editSignal} 
                              onChange={e => setEditSignal(parseInt(e.target.value) || 0)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-20 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2.5">
                            <input 
                              type="number" 
                              required
                              min="0"
                              max="100"
                              value={editBattery} 
                              onChange={e => setEditBattery(parseInt(e.target.value) || 0)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-20 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2.5">
                            <select 
                              value={editStatus} 
                              onChange={e => setEditStatus(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-full bg-white focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Online">Online</option>
                              <option value="Offline">Offline</option>
                              <option value="Maintenance">Maintenance</option>
                            </select>
                          </td>
                          <td className="py-2.5">
                            <input 
                              type="text" 
                              required
                              value={editFirmware} 
                              onChange={e => setEditFirmware(e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs w-full focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2.5 text-right flex items-center justify-end gap-1.5 pt-3.5">
                            <button
                              onClick={() => handleUpdateSensor(device.id)}
                              className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 transition animate-pulse"
                              title="Save Changes"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingSensorId(null)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-500 transition"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </>
                      ) : (
                        /* Read Mode Row */
                        <>
                          <td className="py-3.5 font-bold text-slate-800 flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-slate-400" />
                            {device.deviceSerial}
                          </td>
                          <td className="py-3.5 text-slate-500 font-semibold">{device.sensorType}</td>
                          <td className="py-3.5">
                            <select
                              value={activeFarmId}
                              onChange={(e) => handleRowFarmChange(device.id, e.target.value)}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer max-w-[120px] truncate font-medium"
                            >
                              <option value="">-- Choose Farm --</option>
                              {farms.map(f => (
                                <option key={f.id} value={f.id}>{getFarmDisplayId(f.farmName)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5">
                            <select
                              value={device.zoneId || ''}
                              onChange={(e) => handleAllocateSensorToZone(device.id, e.target.value)}
                              disabled={!activeFarmId}
                              className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer max-w-[130px] truncate disabled:opacity-50 font-medium"
                            >
                              <option value="00000000-0000-0000-0000-000000000000">-- Choose Zone --</option>
                              {rowZonesList.map(z => (
                                <option key={z.id} value={z.id}>{z.zoneName}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Signal className="h-3.5 w-3.5 text-emerald-500" />
                              <span>{device.signalStrength}% ({
                                device.signalStrength > 80 ? 'Excellent' : device.signalStrength > 50 ? 'Good' : 'Poor'
                              })</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <Battery className={`h-4.5 w-4.5 ${device.batteryPercentage > 50 ? 'text-emerald-500' : device.batteryPercentage > 20 ? 'text-amber-500' : 'text-red-500'}`} />
                              <span className="font-semibold text-slate-700">{device.batteryPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider border ${
                              device.status === 'Online' || device.status === 'Active'
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                              {device.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-400 font-semibold">{device.firmwareVersion}</td>
                          <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCalibrateSensor(device)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition"
                              title="Calibrate Sensor"
                            >
                              <Wrench className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => startEditSensor(device)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-655 transition"
                              title="Edit Sensor Details"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSensor(device.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-655 transition"
                              title="Delete Sensor"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
