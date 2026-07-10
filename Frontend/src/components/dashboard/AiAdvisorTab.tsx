import { useState } from 'react';
import { 
  Sparkles, Lock, Unlock, Phone, Coins, Loader2, 
  CheckCircle, ShieldAlert, Cpu, Send, Droplets, BookOpen 
} from 'lucide-react';
import axios from 'axios';

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

interface AiAdvisorTabProps {
  farms: Farm[];
  zones: Zone[];
  selectedFarm: Farm | null;
  selectedZone: Zone | null;
  onZoneSelect: (zone: Zone) => void;
}

export default function AiAdvisorTab({
  farms,
  zones,
  selectedFarm,
  selectedZone,
  onZoneSelect
}: AiAdvisorTabProps) {
  // Paywall & Subscription State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChargingModalOpen, setIsChargingModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Input fields for Dialog flows
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // AI Request States
  const [querying, setQuerying] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger simulated carrier billing payment
  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid Dialog mobile number.');
      return;
    }
    setLoading(true);
    // Simulate IdeaMart Charging API request
    setTimeout(() => {
      setLoading(false);
      setIsUnlocked(true);
      setIsChargingModalOpen(false);
      setPhoneNumber('');
      setPinNumber('');
      alert('Payment Successful! Premium access unlocked via Dialog Carrier Billing (5 LKR/day).');
    }, 2000);
  };

  // Trigger simulated OTP dispatch
  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    // Simulate calling IdeaMart OTP API
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      alert('Dialog OTP code "5839" sent to your mobile phone (Sandbox test code).');
    }, 1500);
  };

  // Verify OTP submission
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '5839') {
      alert('Invalid OTP code. Please enter "5839" for Sandbox validation.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsUnlocked(true);
      setIsOtpModalOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setPhoneNumber('');
      alert('OTP Verified! 30-Day Free Trial activated.');
    }, 1500);
  };

  // Call IdeaMart Omni AI Chat Completions
  const handleConsultAi = async () => {
    if (!selectedZone) {
      alert('Please select an active agricultural zone to analyze.');
      return;
    }

    setQuerying(true);
    setErrorMsg(null);
    setSandboxMode(false);

    // Context preparation
    const crop = selectedZone.cropType || 'Apples';
    const soil = selectedZone.soilType || 'Clay Loam';
    const moisture = (Math.random() * 20 + 35).toFixed(1); // Simulated live telemetry moisture percentage (e.g. 35% - 55%)
    const temperature = (Math.random() * 8 + 26).toFixed(1); // Weather sensor input (e.g. 26C - 34C)

    const omniAiKey = import.meta.env.VITE_IDEAMART_OMNI_AI_KEY;

    // Check if the key is default or missing
    if (!omniAiKey || omniAiKey.includes('mockapikey') || omniAiKey === '') {
      // Offline fallback sandbox simulation (Basic error resilience)
      setTimeout(() => {
        setAiResponse(generateFallbackAdvisory(selectedZone.zoneName, crop, soil, moisture, temperature));
        setSandboxMode(true);
        setQuerying(false);
      }, 1500);
      return;
    }

    // Call live IdeaMart Omni AI Endpoint
    try {
      const response = await axios.post(
        'https://api.ideamart.io/omniai/api/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an agronomic expert system for FLORAX Agropix smart irrigation. Provide precision watering, soil preservation, and crop diagnostics advice. Keep recommendations structured, concise, and direct.'
            },
            {
              role: 'user',
              content: `Analyze this agricultural zone:
Zone Name: ${selectedZone.zoneName}
Crop: ${crop}
Soil Type: ${soil}
Current Soil Moisture Telemetry: ${moisture}%
Current Ambient Temperature: ${temperature}°C.
Please provide:
1. Soil Moisture Assessment (Optimal, Dry, or Critical).
2. Direct watering recommendation (Start pumps, delay cycle, or hold status).
3. Practical advice on soil structure management for this soil type.`
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': omniAiKey
          },
          timeout: 10000 // 10 second safety timeout
        }
      );

      const aiText = response.data?.choices?.[0]?.message?.content;
      if (aiText) {
        setAiResponse(aiText);
      } else {
        throw new Error('Malformed AI response format.');
      }
    } catch (err: any) {
      console.warn('Omni AI Request Failed:', err.message);
      // Fail-safe protection: Use the robust fallback advisory
      setAiResponse(generateFallbackAdvisory(selectedZone.zoneName, crop, soil, moisture, temperature));
      setSandboxMode(true);
    } finally {
      setQuerying(false);
    }
  };

  // Fallback content generator
  const generateFallbackAdvisory = (
    zoneName: string, 
    crop: string, 
    soil: string, 
    moisture: string, 
    temperature: string
  ) => {
    const moistureNum = parseFloat(moisture);
    const isDry = moistureNum < 40;
    
    return `### 🌾 Agronomic Advisory Report for ${zoneName}
**Crop Type:** ${crop} | **Soil Composition:** ${soil}

---

#### 1. Soil Moisture & Environmental Audit
*   **Moisture Index:** ${moisture}% (${isDry ? 'CRITICAL DRY' : 'OPTIMAL'})
*   **Ambient Temperature:** ${temperature}°C
*   *Analysis:* At ${moisture}%, the moisture availability is ${isDry ? 'insufficient' : 'fully adequate'} for root absorption. ${isDry ? 'Immediate pump override is recommended to prevent wilting.' : 'Transpiration rates remain steady. Keep irrigation suspended to avoid waterlogging.'}

---

#### 2. Precision Irrigation Directive
*   **Action Plan:** ${isDry ? '🔴 TRIGGER IRRIGATION' : '🟢 HOLD IRRIGATION'}
*   **Target Duration:** ${isDry ? '35 minutes' : 'N/A'}
*   **Water Allocation:** ${isDry ? 'approx. 14,000 Liters per acre' : '0 Liters'}
*   *Schedule Override:* Solenoid Valve should be ${isDry ? 'opened' : 'closed'}. If rain is forecast, delay the manual pump cycle by 4 hours.

---

#### 3. Soil Conservation Advice (${soil})
*   *Characteristics:* ${soil} requires careful monitoring. ${soil === 'Clay Loam' ? 'Avoid overwatering to prevent root compaction. Utilize brief interval pulse cycles to maintain aerated root conditions.' : 'Gravel/Sandy configurations drain rapidly. Implement micro-drip networks to deliver sustained moisture without wasting water assets.'}
*   *Nutrient Protocol:* Organic compost application is advised to increase humus density and retain water retention.`;
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            AI Agronomist Advisor
          </h2>
          <p className="text-sm text-emerald-100 max-w-lg">
            Smart crop diagnostics, soil health calculations, and automated weather-aware watering guidance powered by Dialog IdeaMart Omni AI.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md">
          {isUnlocked ? (
            <>
              <Unlock className="h-5 w-5 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Premium Active</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 text-emerald-100/60" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100/60">Premium Locked</span>
            </>
          )}
        </div>
      </div>

      {!isUnlocked ? (
        /* ================= PAYWALL VIEW ================= */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
            <Lock className="h-6 w-6" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">Unlock Agronomic Intelligence</h3>
            <p className="text-xs text-slate-500">
              Access real-time AI crop diagnostics and weather-integrated schedules. Choose one of the Dialog IdeaMart payment/verification flows below to unlock premium access instantly.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto text-left pt-2">
            {/* Carrier billing option */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/50 transition bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Carrier Billing</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">Daily Subscription</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Subscribe to the advisor portal directly from your Dialog phone balance. Billed daily, cancel anytime.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-slate-800">5 LKR <span className="text-[10px] font-normal text-slate-400">/ day</span></span>
                <button 
                  onClick={() => setIsChargingModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </div>

            {/* OTP trial option */}
            <div className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-500/50 transition bg-slate-50/50 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">OTP Verification</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">30-Day Free Trial</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Verify your Dialog mobile number via SMS One-Time PIN (OTP) code to unlock free trial access.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-black text-slate-800">FREE <span className="text-[10px] font-normal text-slate-400">for 30d</span></span>
                <button 
                  onClick={() => setIsOtpModalOpen(true)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Verify Number
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= PREMIUM ACTIVE UNLOCKED VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls column */}
          <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-emerald-600" />
                Agronomy Controller
              </h3>
              <p className="text-xs text-slate-400 font-medium">Select a zone to execute the AI audit.</p>
            </div>

            <div className="space-y-4">
              {/* Select Zone */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Sub-Zone</label>
                <select
                  value={selectedZone?.id || ''}
                  onChange={(e) => {
                    const z = zones.find(item => item.id === e.target.value);
                    if (z) onZoneSelect(z);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none cursor-pointer font-semibold text-slate-700"
                >
                  <option value="">-- Choose Active Zone --</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zoneName} ({z.cropType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status context cards */}
              {selectedZone && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/40 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Crop:</span>
                    <span className="font-bold text-slate-700">{selectedZone.cropType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Soil Profile:</span>
                    <span className="font-bold text-slate-700">{selectedZone.soilType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">System status:</span>
                    <span className="font-bold text-emerald-600 uppercase tracking-wider text-[10px]">Healthy</span>
                  </div>
                </div>
              )}

              {/* AI Trigger button */}
              <button
                onClick={handleConsultAi}
                disabled={!selectedZone || querying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {querying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Querying Omni AI...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Run AI Diagnosis
                  </>
                )}
              </button>

              <button
                onClick={() => setIsUnlocked(false)}
                className="w-full py-2 border border-dashed border-slate-200 text-slate-400 hover:text-red-500 rounded-xl text-[10px] font-bold transition uppercase tracking-wider cursor-pointer"
              >
                Simulate Lock (Reset Demo)
              </button>
            </div>
          </div>

          {/* Results column */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Recommendation Output</span>
              {sandboxMode && (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Sandbox Fallback
                </span>
              )}
            </div>

            {querying ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500 animate-pulse">Contacting IdeaMart Omni AI broker...</p>
              </div>
            ) : aiResponse ? (
              <div className="flex-1 text-slate-700 text-xs leading-relaxed space-y-4 whitespace-pre-line font-medium">
                {aiResponse}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <BookOpen className="h-8 w-8 text-slate-300" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500">No report generated</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Select a zone and click "Run AI Diagnosis" to analyze live sensor data and receive optimization directives.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CARRIER BILLING MODAL ================= */}
      {isChargingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleChargeSubmit}
            className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-600 animate-bounce" />
                Dialog Carrier Billing
              </h3>
              <p className="text-xs text-slate-400">Subscribe for 5.00 LKR + tax daily directly to your mobile account.</p>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Initiating IdeaMart Charging request...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="tel"
                        required
                        placeholder="e.g. 0771234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">PIN / Password (Optional)</label>
                    <input 
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChargingModalOpen(false);
                      setPhoneNumber('');
                      setPinNumber('');
                    }}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Confirm Biling
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* ================= OTP VERIFICATION MODAL ================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-600" />
                OTP Trial Verification
              </h3>
              <p className="text-xs text-slate-400">Verify your phone number via IdeaMart OTP API to activate trial access.</p>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Processing OTP request...</p>
              </div>
            ) : !otpSent ? (
              <form onSubmit={handleOtpRequest} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. 0771234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false);
                      setPhoneNumber('');
                    }}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Request OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-semibold leading-normal">
                  🔒 **Sandbox Mode**: Type the validation code **5839** to complete the mock IdeaMart verification.
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Verification Code</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter 4-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-center tracking-widest font-black focus:outline-none text-slate-700 bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
