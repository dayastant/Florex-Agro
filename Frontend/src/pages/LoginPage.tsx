import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@florax.com');
  const [password, setPassword] = useState('admin123'); // seed password helper
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('api/v1/auth/login', { email, password });
      
      if (response.data.succeeded) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.roleId === '44444444-4444-4444-4444-444444444444') {
          navigate('/superadmin-dashboard');
        } else if (user.roleId === '33333333-3333-3333-3333-333333333333') {
          navigate('/technician-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials or database connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-50 via-slate-100 to-emerald-50/40 text-slate-800">
      <div className="w-full max-w-md space-y-8 bg-white/90 backdrop-blur-xl border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-xl text-emerald-600 mb-4 border border-emerald-100">
            <Sprout className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            FLORAX AGROPIX
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Smart Irrigation & Telemetry Platform
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl text-sm font-medium">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="Administrator Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-emerald-100/50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
