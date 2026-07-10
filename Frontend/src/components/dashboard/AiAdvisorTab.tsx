import { useState, useEffect } from 'react';
import { 
  Sparkles, Lock, Unlock, Phone, Coins, Loader2, 
  CheckCircle, ShieldAlert, Cpu, Send, Droplets, BookOpen, ChevronRight, Check
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
  // Load persistent subscription state from localStorage ("another time no ask")
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('florex_premium_active') === 'true';
  });

  const [isChargingModalOpen, setIsChargingModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dialog inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // AI query states
  const [querying, setQuerying] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);

  // Persistence triggers
  const unlockPremium = (method: string) => {
    localStorage.setItem('florex_premium_active', 'true');
    setIsUnlocked(true);
    alert(`Success! Premium access unlocked via ${method}. You will not need to authenticate again.`);
  };

  const lockPremium = () => {
    localStorage.removeItem('florex_premium_active');
    setIsUnlocked(false);
    setAiResponse(null);
    alert('Demo reset: Premium features locked.');
  };

  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid Dialog number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsChargingModalOpen(false);
      unlockPremium('Dialog Carrier Billing (5 LKR/day)');
      setPhoneNumber('');
      setPinNumber('');
    }, 1800);
  };

  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      alert('SMS verification code sent! Enter code "5839" to verify.');
    }, 1200);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '5839') {
      alert('Invalid code. Please enter code "5839" for test bypass.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsOtpModalOpen(false);
      setOtpSent(false);
      setOtpCode('');
      setPhoneNumber('');
      unlockPremium('30-Day Free Trial OTP verification');
    }, 1200);
  };

  const handleConsultAi = async () => {
    if (!selectedZone) {
      alert('Please select a zone to inspect.');
      return;
    }

    setQuerying(true);
    setSandboxMode(false);

    const crop = selectedZone.cropType || 'Apples';
    const soil = selectedZone.soilType || 'Clay Loam';
    const moisture = (Math.random() * 15 + 32).toFixed(1);
    const temp = (Math.random() * 6 + 28).toFixed(1);

    const omniAiKey = import.meta.env.VITE_IDEAMART_OMNI_AI_KEY;

    if (!omniAiKey || omniAiKey.includes('mockapikey') || omniAiKey === '') {
      setTimeout(() => {
        setAiResponse(generateFallbackAdvisory(selectedZone.zoneName, crop, soil, moisture, temp));
        setSandboxMode(true);
        setQuerying(false);
      }, 1500);
      return;
    }

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
Current Ambient Temperature: ${temp}°C.
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
          timeout: 10000
        }
      );

      const aiText = response.data?.choices?.[0]?.message?.content;
      if (aiText) {
        setAiResponse(aiText);
      } else {
        throw new Error('Malformed AI response.');
      }
    } catch (err: any) {
      setAiResponse(generateFallbackAdvisory(selectedZone.zoneName, crop, soil, moisture, temp));
      setSandboxMode(true);
    } finally {
      setQuerying(false);
    }
  };

  const generateFallbackAdvisory = (zone: string, crop: string, soil: string, moisture: string, temp: string) => {
    const moistureNum = parseFloat(moisture);
    const isDry = moistureNum < 40;
    
    return `### 🌾 Agronomy Audit: ${zone}
*   **Crop:** ${crop} | **Soil:** ${soil}

#### 📊 Telemetry Diagnostics
*   **Moisture Index:** ${moisture}% (${isDry ? 'CRITICAL DRY' : 'OPTIMAL'})
*   **Ambient Temp:** ${temp}°C
*   *Verdict:* ${isDry ? 'Immediate pump irrigation required. Moisture is below wilting limit.' : 'Optimal level. Postpone scheduled irrigation to save water assets.'}

#### 💧 Water Management Plan
*   **Directive:** ${isDry ? '🔴 TRIGGER IRRIGATION' : '🟢 HOLD IRRIGATION'}
*   **Optimal Duration:** ${isDry ? '35 mins' : '0 mins'}
*   **Solenoid Valve:** ${isDry ? 'OPEN' : 'CLOSE'}

#### 🌱 Soil Preservation
*   For **${soil}**: ${soil === 'Clay Loam' ? 'Implement pulse-watering to avoid waterlogging and compaction.' : 'Sandy loam drains fast. Use micro-drips to maintain constant humidity.'}`;
  };

  return (
    <div className="space-y-4 w-full text-slate-800">
      
      {/* Mobile Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between">
        <div className="space-y-1 max-w-[70%]">
          <h3 className="text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
            AI Advisor
          </h3>
          <p className="text-[10px] text-emerald-100 font-semibold leading-relaxed">
            Instant crop scheduling & moisture diagnostics.
          </p>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-md border border-white/5">
          {isUnlocked ? (
            <>
              <Check className="h-3 w-3 text-emerald-300" />
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-200">Unlocked</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 text-emerald-100/60" />
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-100/60">Locked</span>
            </>
          )}
        </div>
      </div>

      {!isUnlocked ? (
        /* ================= PREMIUM MOBILE PAYWALL ================= */
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 text-center space-y-5 shadow-sm">
          <div className="mx-auto h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
            <Lock className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800">Unlock Agronomic Advisor</h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-xs mx-auto">
              Get precision crop diagnostics & weather-aware schedules. Authenticate once via OTP for a free trial or subscribe.
            </p>
          </div>

          {/* Pricing Options Stack (Vertically Stacked for perfect Mobile UI) */}
          <div className="space-y-3 pt-2">
            
            {/* OTP trial option */}
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between text-left hover:border-emerald-500/30 transition">
              <div className="space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-800">OTP Verification</span>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                  Verify number for a **30-Day Free Trial**. No daily subscription required.
                </p>
              </div>
              <button 
                onClick={() => setIsOtpModalOpen(true)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
              >
                Verify
              </button>
            </div>

            {/* Carrier billing option */}
            <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between text-left hover:border-emerald-500/30 transition">
              <div className="space-y-1 max-w-[70%]">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-800">Dialog Carrier Billing</span>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                  Subscribe daily directly from your Dialog phone balance. **5 LKR / day**.
                </p>
              </div>
              <button 
                onClick={() => setIsChargingModalOpen(true)}
                className="px-3 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
              >
                Pay
              </button>
            </div>
            
          </div>
        </div>
      ) : (
        /* ================= PREMIUM MOBILE ACTIVE ADVISOR ================= */
        <div className="space-y-4">
          
          {/* Controls Card */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                Select Crop Zone
              </h4>
              <button
                onClick={lockPremium}
                className="text-[9px] text-slate-400 hover:text-red-500 font-black uppercase tracking-wider cursor-pointer"
              >
                Lock Demo
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <select
                  value={selectedZone?.id || ''}
                  onChange={(e) => {
                    const z = zones.find(item => item.id === e.target.value);
                    if (z) onZoneSelect(z);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] bg-white focus:outline-none cursor-pointer font-bold text-slate-700"
                >
                  <option value="">-- Choose Target Zone --</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zoneName} ({z.cropType})
                    </option>
                  ))}
                </select>
              </div>

              {selectedZone && (
                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/30 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-semibold">Crop Type:</span>
                    <p className="font-bold text-slate-700">{selectedZone.cropType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Soil Profile:</span>
                    <p className="font-bold text-slate-700">{selectedZone.soilType}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleConsultAi}
                disabled={!selectedZone || querying}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                {querying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing Soil...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Request AI Diagnostics
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Output (Card layout, optimized for single-column mobile) */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm min-h-[180px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostics Output</span>
              {sandboxMode && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[8px] font-black uppercase">
                  Sandbox Active
                </span>
              )}
            </div>

            {querying ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-8">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <p className="text-[10px] font-semibold text-slate-400">Processing live telemetry...</p>
              </div>
            ) : aiResponse ? (
              <div className="flex-1 text-slate-700 text-[11px] leading-relaxed space-y-3 whitespace-pre-line font-medium">
                {aiResponse}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <BookOpen className="h-6 w-6 opacity-60" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold">Waiting for request</p>
                  <p className="text-[9px] max-w-xs mx-auto opacity-70">
                    Choose a crop sector above and execute the AI diagnostics sweep.
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      )}

      {/* ================= OTP VERIFICATION MODAL ================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-emerald-600" />
                OTP Verification
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal">Confirm Dialog number to active the 30d trial.</p>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <p className="text-[10px] font-bold text-slate-500">Contacting OTP broker...</p>
              </div>
            ) : !otpSent ? (
              <form onSubmit={handleOtpRequest} className="space-y-3">
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dialog Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. 0771234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false);
                      setPhoneNumber('');
                    }}
                    className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Get Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-3">
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-[9px] text-blue-700 font-semibold leading-normal">
                  🔒 **Sandbox Mode**: Type test OTP **5839** to complete free verification.
                </div>

                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Enter OTP PIN</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 5839"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-center tracking-widest font-black text-slate-700 bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Confirm OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= CARRIER BILLING MODAL ================= */}
      {isChargingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleChargeSubmit}
            className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative"
          >
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-emerald-600 animate-bounce" />
                Dialog Direct Billing
              </h4>
              <p className="text-[10px] text-slate-400">Subscribe for 5 LKR / day billed directly to your SIM balance.</p>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <p className="text-[10px] font-bold text-slate-500">Contacting Charging API...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="tel"
                        required
                        placeholder="e.g. 0771234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Password</label>
                    <input 
                      type="password"
                      placeholder="••••"
                      maxLength={4}
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsChargingModalOpen(false);
                      setPhoneNumber('');
                      setPinNumber('');
                    }}
                    className="flex-1 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold transition hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Pay 5 LKR
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

    </div>
  );
}
