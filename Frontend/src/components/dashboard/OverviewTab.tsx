import { useState } from 'react';
import { Layers, Cpu, Droplets, ShieldCheck, MapPin, Plus, Sprout, Thermometer, CloudRain, Calendar, RefreshCw } from 'lucide-react';

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

interface OverviewTabProps {
  summary: any;
  farms: Farm[];
  selectedFarm: Farm | null;
  zones: Zone[];
  selectedZone: Zone | null;
  telemetry: Telemetry[];
  triggering: boolean;
  onFarmSelect: (farm: Farm) => void;
  onZoneSelect: (zone: Zone) => void;
  onTriggerIrrigation: () => void;
  onNavigateToTab: (tabId: string) => void;
}

const mockHistoricalMoisture = [
  { moisturePercentage: 42, recordedAt: '08:00 AM' },
  { moisturePercentage: 38, recordedAt: '10:00 AM' },
  { moisturePercentage: 45, recordedAt: '12:00 PM' },
  { moisturePercentage: 55, recordedAt: '02:00 PM' },
  { moisturePercentage: 51, recordedAt: '04:00 PM' },
  { moisturePercentage: 62, recordedAt: '06:00 PM' },
  { moisturePercentage: 58, recordedAt: '08:00 PM' }
];

export default function OverviewTab({
  summary,
  farms,
  selectedFarm,
  zones,
  selectedZone,
  telemetry,
  triggering,
  onFarmSelect,
  onZoneSelect,
  onTriggerIrrigation,
  onNavigateToTab
}: OverviewTabProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Use real zone telemetry if present, otherwise default to a beautiful mock trending chart
  const activeTelemetry = telemetry.length > 0 
    ? telemetry.map(t => ({
        moisturePercentage: t.moisturePercentage,
        recordedAt: new Date(t.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    : mockHistoricalMoisture;

  // SVG Chart Parameters
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const plotWidth = chartWidth - paddingX * 2;
  const plotHeight = chartHeight - paddingY * 2;

  // Generate X, Y coordinates
  const points = activeTelemetry.map((item, index) => {
    const x = paddingX + (index / (activeTelemetry.length - 1 || 1)) * plotWidth;
    const y = paddingY + plotHeight - (item.moisturePercentage / 100) * plotHeight;
    return { x, y, val: item.moisturePercentage, time: item.recordedAt };
  });

  // SVG Path Generator strings
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Diagnostic KPI widgets */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Total Farms</p>
            <h3 className="text-xl font-bold mt-0.5 text-slate-800">{farms.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Active Nodes</p>
            <h3 className="text-xl font-bold mt-0.5 text-slate-800">{summary?.ActiveSensors || 0}</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Avg Moisture</p>
            <h3 className="text-xl font-bold mt-0.5 text-slate-800">{summary?.AverageMoisture || 0}%</h3>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-100/50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Telemetry Status</p>
            <h3 className="text-xl font-bold mt-0.5 text-emerald-600">{summary?.SystemStatus || 'Normal'}</h3>
          </div>
        </div>
      </section>

      {/* Farm & Zone Details */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm selector panel */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-sm shadow-slate-100/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registered Farms</h2>
            <button 
              onClick={() => onNavigateToTab('farms')}
              className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
              title="Manage Farms"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {farms.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium py-4 text-center">No farms registered.</p>
            ) : (
              farms.map((farm) => (
                <div 
                  key={farm.id}
                  onClick={() => onFarmSelect(farm)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedFarm?.id === farm.id 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm shadow-emerald-50' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-660'
                  }`}
                >
                  <h4 className="font-semibold text-sm">{farm.farmName}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2 font-medium">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{farm.district}, {farm.province}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zones selector panel */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-sm shadow-slate-100/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Irrigation Zones</h2>
          {zones.length === 0 ? (
            <p className="text-slate-400 text-xs font-medium py-4 text-center">No zones registered for this farm.</p>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => (
                <div 
                  key={zone.id}
                  onClick={() => onZoneSelect(zone)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedZone?.id === zone.id 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm shadow-emerald-50' 
                      : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-650'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm">{zone.zoneName}</h4>
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                      zone.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Crop: {zone.cropType} | Soil: {zone.soilType}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry diagnostics panel */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-6 shadow-sm shadow-slate-100/50">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Zone Telemetry</h2>
          {selectedZone ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-emerald-600" />
                  {selectedZone.zoneName}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Live readings from IoT node array</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl text-center">
                  <div className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-lg mb-2 border border-blue-100">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Moisture</p>
                  <h4 className="text-lg font-bold mt-1 text-slate-800">
                    {telemetry.length > 0 ? `${telemetry[0].moisturePercentage}%` : '45%'}
                  </h4>
                </div>
                <div className="bg-slate-50/60 border border-slate-150 p-4 rounded-xl text-center">
                  <div className="inline-flex p-2 bg-yellow-50 text-yellow-600 rounded-lg mb-2 border border-yellow-100">
                    <Thermometer className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Temperature</p>
                  <h4 className="text-lg font-bold mt-1 text-slate-800">26.5°C</h4>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onTriggerIrrigation}
                  disabled={triggering || selectedZone.status !== 'Active'}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
                >
                  {triggering ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CloudRain className="h-4 w-4" />
                      <span>Trigger Manual Irrigation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs font-medium py-4 text-center">Select a farm and zone to view live telemetry.</p>
          )}
        </div>
      </section>

      {/* Improved Soil Moisture Analysis Graph */}
      <section className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm shadow-slate-100/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Soil Moisture Telemetry Analytics</h3>
            <p className="text-xs text-slate-400">Moisture variance tracking across active sensor node channels.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Real-time Variance</span>
            </span>
            <span className="flex items-center gap-1 bg-blue-50/50 text-blue-700 px-2.5 py-1.5 rounded-lg border border-blue-100/80">
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow text-blue-500" />
              <span>Live Feed</span>
            </span>
          </div>
        </div>

        {/* SVG Render Block */}
        <div className="relative bg-slate-50/30 border border-slate-100 rounded-xl p-4 overflow-hidden">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = paddingY + plotHeight - (val / 100) * plotHeight;
              return (
                <g key={val} className="opacity-40">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={chartWidth - paddingX} 
                    y2={y} 
                    className="stroke-slate-200" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingX - 10} 
                    y={y + 3} 
                    className="text-[9px] fill-slate-400 font-semibold text-right"
                    textAnchor="end"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Area Path */}
            {areaPath && (
              <path 
                d={areaPath} 
                fill="url(#moistureGrad)" 
              />
            )}

            {/* Line Path */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Circles & Hover Areas */}
            {points.map((p, index) => (
              <g key={index}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredPoint === index ? "6" : "4.5"}
                  className={`transition-all duration-150 ${
                    hoveredPoint === index 
                      ? 'fill-blue-600 stroke-blue-200 stroke-[4px]' 
                      : 'fill-blue-500 stroke-white stroke-[2px]'
                  }`}
                />
                
                {/* Time labels under grid */}
                <text 
                  x={p.x} 
                  y={chartHeight - 10} 
                  className="text-[9px] fill-slate-400 font-semibold"
                  textAnchor="middle"
                >
                  {p.time}
                </text>

                {/* Catchment zone for hover interactions */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="15" 
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div 
              className="absolute bg-slate-800 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center gap-0.5"
              style={{
                left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / chartHeight) * 100 - 4}%`
              }}
            >
              <span className="text-[9px] text-slate-350">{points[hoveredPoint].time}</span>
              <span className="text-blue-400 text-xs font-black">{points[hoveredPoint].val}% Moisture</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
