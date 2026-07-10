import { useState, useEffect } from 'react';
import { Database, RefreshCw, BarChart, Sliders, CheckCircle } from 'lucide-react';
import api from '../../services/api';

interface Farm {
  id: string;
  farmName: string;
}

interface Zone {
  id: string;
  zoneName: string;
  soilType: string;
  farmId: string;
}

interface SensorDevice {
  id: string;
  zoneId: string;
  deviceSerial: string;
  sensorType: string;
}

interface HistoricalReading {
  id: string;
  recordedAt: string;
  zoneName: string;
  soilType: string;
  moisturePercentage: number;
  sensorSerial: string;
}

interface AnalyticsTabProps {
  farms: Farm[];
  sensorDevices: SensorDevice[];
}

export default function AnalyticsTab({ farms, sensorDevices }: AnalyticsTabProps) {
  const [logs, setLogs] = useState<HistoricalReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Manual logging form state
  const [selectedSensorId, setSelectedSensorId] = useState('');
  const [moistureValue, setMoistureValue] = useState<number>(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (farms.length > 0) {
      loadAllHistoricalLogs();
    }
  }, [farms, sensorDevices]);

  const loadAllHistoricalLogs = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch zones for all farms
      const allZones: Zone[] = [];
      for (const farm of farms) {
        try {
          const res = await api.get(`api/v1/irrigationzones/farm/${farm.id}`);
          const farmZones = res.data.data || [];
          allZones.push(...farmZones);
        } catch (err) {
          console.error(`Error loading zones for farm ${farm.id}:`, err);
        }
      }

      // 2. Fetch moisture readings for each zone
      const aggregatedLogs: HistoricalReading[] = [];
      for (const zone of allZones) {
        try {
          const res = await api.get(`api/v1/soilmoisture/zone/${zone.id}`);
          const readings = res.data.data || [];
          
          readings.forEach((r: any) => {
            const sensor = sensorDevices.find(s => s.id === r.sensorId);
            aggregatedLogs.push({
              id: r.id,
              recordedAt: r.recordedAt,
              zoneName: zone.zoneName,
              soilType: zone.soilType,
              moisturePercentage: r.moisturePercentage,
              sensorSerial: sensor ? sensor.deviceSerial : 'Unknown Sensor'
            });
          });
        } catch (err) {
          console.error(`Error loading moisture readings for zone ${zone.id}:`, err);
        }
      }

      // 3. Sort by recorded time descending
      aggregatedLogs.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
      setLogs(aggregatedLogs);
    } catch (err) {
      console.error('Failed to load historical analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    const sensor = sensorDevices.find(s => s.id === selectedSensorId);
    if (!sensor || !sensor.zoneId) {
      alert('Please select an active IoT sensor node linked to a zone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('api/v1/soilmoisture', {
        sensorId: selectedSensorId,
        zoneId: sensor.zoneId,
        moisturePercentage: parseFloat(moistureValue.toString())
      });

      setSelectedSensorId('');
      setMoistureValue(45);
      
      // Reload logs table
      await loadAllHistoricalLogs();
      alert('Manual telemetry moisture log injected into DB successfully!');
    } catch (err: any) {
      console.error('Telemetry simulation failed:', err);
      alert(err.response?.data?.message || 'Failed to simulate telemetry reading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No data logs available to export.');
      return;
    }

    // Build simple CSV string
    const headers = ['Timestamp', 'Zone Name', 'Sensor Serial', 'Soil Profile', 'Moisture Level (%)'];
    const rows = logs.map(l => [
      l.recordedAt,
      l.zoneName,
      l.sensorSerial,
      l.soilType,
      `${l.moisturePercentage}%`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `florax_telemetry_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Simulation and Logging Panel */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-600" />
              Manual Telemetry Logging Simulator
            </h3>
            <p className="text-xs text-slate-400">Injected diagnostic moisture data directly into the active telemetry pipe.</p>
          </div>
        </div>

        <form onSubmit={handleSimulateTelemetry} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Active IoT Node</label>
            <select
              value={selectedSensorId}
              onChange={e => setSelectedSensorId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- Choose Deployed Sensor --</option>
              {sensorDevices
                .filter(s => s.zoneId && s.zoneId !== '00000000-0000-0000-0000-000000000000')
                .map(s => (
                  <option key={s.id} value={s.id}>{s.deviceSerial} ({s.sensorType})</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Moisture Level: <span className="font-extrabold text-emerald-650">{moistureValue}%</span></label>
            <input
              type="range"
              min="0"
              max="100"
              value={moistureValue}
              onChange={e => setMoistureValue(parseInt(e.target.value) || 0)}
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 my-3"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !selectedSensorId}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Simulate Telemetry Log</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Historical Telemetry Readings Table */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              Historical Telemetry Database Archive
            </h3>
            <p className="text-xs text-slate-400">Database archive of soil moisture sensor records.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllHistoricalLogs}
              className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition text-slate-500 cursor-pointer"
              title="Refresh database logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExportCSV}
              className="px-4 py-2 border border-emerald-250 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <BarChart className="h-3.5 w-3.5" />
              <span>Export Logs (.CSV)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && logs.length === 0 ? (
            <div className="flex items-center gap-2 py-12 justify-center text-xs text-slate-400">
              <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Querying historical readings...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-slate-400 text-xs py-12 text-center border rounded-xl bg-slate-50/50">
              No historical sensor data logged in the database. Use the simulator above to log readings.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Zone</th>
                  <th className="pb-3 font-semibold">Sensor Serial</th>
                  <th className="pb-3 font-semibold">Moisture Level</th>
                  <th className="pb-3 font-semibold">Soil Type</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {logs.map(log => {
                  const isOptimal = log.moisturePercentage >= 35 && log.moisturePercentage <= 75;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/40">
                      <td className="py-3 text-slate-500 font-medium">
                        {new Date(log.recordedAt).toLocaleString()}
                      </td>
                      <td className="py-3 font-bold text-slate-800">{log.zoneName}</td>
                      <td className="py-3 text-slate-550 font-semibold">{log.sensorSerial}</td>
                      <td className="py-3 text-blue-600 font-extrabold">{log.moisturePercentage}%</td>
                      <td className="py-3 font-medium text-slate-500">{log.soilType}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded border ${
                          isOptimal 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-red-50 border-red-150 text-red-700'
                        }`}>
                          {isOptimal ? 'OPTIMAL' : 'CRITICAL DRY'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
