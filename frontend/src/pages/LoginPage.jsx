import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  Wrench, 
  BarChart3,
  Sparkles
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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative">
      
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-[#121212] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <motion.div 
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-block p-2 rounded-2xl bg-black border border-zinc-800 shadow-md mb-3"
          >
            <img 
              src="/logo-icon.png" 
              alt="AirconIQ" 
              className="w-12 h-12 object-contain"
            />
          </motion.div>
          
          <h1 className="text-2xl font-black tracking-wider text-zinc-900 dark:text-zinc-50">
            AIRCONIQ
          </h1>
          <p className="text-[10px] font-bold tracking-widest text-amber-500 uppercase mt-0.5">
            PREDICT • PREVENT • PERFORM
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Enterprise HVAC Operations & Autonomous Diagnostics
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              1-Click Demo Access:
            </span>
            <span className="text-[10px] text-zinc-400">Role-Based Authorization</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@airconiq.ai', 'admin123')}
              className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-[#181818] hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-zinc-200/80 dark:border-zinc-800 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Facility Director
                  </p>
                  <p className="text-[10px] text-zinc-500">admin@airconiq.ai (Full Access)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
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
