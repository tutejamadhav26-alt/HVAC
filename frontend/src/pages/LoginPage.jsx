import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import MagicRings from './MagicRings';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  Building2,
  Wrench, 
  BarChart3,
  UserCheck
} from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail, userPwd) => {
    setEmail(userEmail);
    setPassword(userPwd);
    setError(null);
    setLoading(true);
    try {
      await login(userEmail, userPwd);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 px-4 relative">
      
      {/* Background Decorative Ambient Gradients */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tr from-purple-500/10 via-indigo-500/10 to-emerald-500/5 blur-3xl pointer-events-none -z-20" />

      {/* Magic Rings Full-Screen Interactive Background */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-auto -z-10 flex items-center justify-center">
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
          <MagicRings
            color="#A855F7"
            colorTwo="#6366F1"
            motion="pulse"
            ringCount={6}
            speed={1}
            lineThickness={2}
            glow={1}
            hoverScale={1.2}
            clickBurst={true}
          />
        </div>
      </div>

      {/* Centered Sign In Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto bg-white/90 dark:bg-[#121212]/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 w-24 h-24 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-gradient-to-tr from-amber-500/20 via-orange-500/15 to-blue-500/25 rounded-full blur-xl pointer-events-none" />
            <img 
              src="/logo-icon-transparent.png" 
              alt="AirconIQ Emblem" 
              className="relative w-16 h-16 sm:w-20 sm:h-20 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-[0_6px_16px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_8px_20px_rgba(59,130,246,0.3)]"
            />
          </div>
          
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Aircon<span className="text-emerald-500 font-extrabold">IQ</span>
          </h1>
          <p className="text-[11px] font-bold tracking-widest text-amber-500 dark:text-amber-400 uppercase mt-0.5">
            PREDICT • PREVENT • PERFORM
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              1-Click Demo Access:
            </span>
            <span className="text-[10px] text-zinc-400">Role-Based Authorization</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@airconiq.ai', 'admin123')}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-[#181818] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/80 dark:border-zinc-800 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Facility Director
                  </p>
                  <p className="text-[10px] text-zinc-500">admin@airconiq.ai (Full Access)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Admin
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tech@airconiq.ai', 'tech123')}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-[#181818] hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-zinc-200/80 dark:border-zinc-800 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    Chief Diagnostic Engineer
                  </p>
                  <p className="text-[10px] text-zinc-500">tech@airconiq.ai (Diagnostics & Remote)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Technician
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('auditor@airconiq.ai', 'audit123')}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-[#181818] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/80 dark:border-zinc-800 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    ESG Energy Auditor
                  </p>
                  <p className="text-[10px] text-zinc-500">auditor@airconiq.ai (Energy & ROI)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Auditor
              </span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>OAuth2 JWT Authentication • AES-256 Cloud Token</span>
        </div>
      </motion.div>
    </div>
  );
}


