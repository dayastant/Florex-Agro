import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, Smartphone, Apple, ArrowRight, ChevronRight, Download, Leaf } from 'lucide-react';
import api from '../services/api';

export default function FarmerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('api/v1/auth/login', { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/farmer-app/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 flex flex-col">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 backdrop-blur rounded-xl border border-emerald-400/30">
            <Sprout className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide">FLORAX</p>
            <p className="text-emerald-400 text-[9px] font-semibold uppercase tracking-widest">Farmer Portal</p>
          </div>
        </div>
        <a href="/login" className="text-emerald-300/70 text-xs hover:text-emerald-200 transition flex items-center gap-1">
          Admin Login <ChevronRight className="h-3 w-3" />
        </a>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">

          {/* Hero Text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full mb-3">
              <Leaf className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-emerald-300 text-xs font-semibold">Smart Farm Management</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome Back, <span className="text-emerald-400">Farmer</span>
            </h1>
            <p className="text-emerald-200/60 text-sm">Sign in to manage your farms, zones, and irrigation schedules.</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200/80 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-200/80 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-300/50" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-xs">
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button type="button" className="text-xs text-emerald-300/70 hover:text-emerald-300 transition">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Farm Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Download App Section */}
          <div className="bg-white/8 backdrop-blur border border-white/12 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/20">
                <Smartphone className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">FLORAX Farmer App</p>
                <p className="text-emerald-300/60 text-[11px]">Full features • Offline mode • Real-time alerts</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* App Store */}
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl transition cursor-pointer group"
              >
                <Apple className="h-5 w-5 text-white flex-shrink-0" />
                <div className="text-left">
                  <p className="text-white/50 text-[9px]">Download on the</p>
                  <p className="text-white font-bold text-xs">App Store</p>
                </div>
              </button>

              {/* Google Play */}
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2.5 px-3 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl transition cursor-pointer group"
              >
                <Download className="h-5 w-5 text-white flex-shrink-0" />
                <div className="text-left">
                  <p className="text-white/50 text-[9px]">Get it on</p>
                  <p className="text-white font-bold text-xs">Google Play</p>
                </div>
              </button>
            </div>

            <p className="text-center text-white/30 text-[10px]">
              Available for iOS 14+ and Android 10+
            </p>
          </div>

        </div>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-xs w-full text-center space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-3 bg-emerald-50 rounded-2xl inline-flex">
              <Smartphone className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="font-black text-slate-800 text-lg">Download FLORAX App</h3>
            <div className="w-36 h-36 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300">
              {/* QR code placeholder */}
              <div className="grid grid-cols-4 gap-0.5 p-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-sm ${Math.random() > 0.4 ? 'bg-slate-800' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-xs">Scan QR code with your phone camera to download the FLORAX Farmer App</p>
            <button
              onClick={() => setShowQR(false)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
