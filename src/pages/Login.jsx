import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // If already logged in, skip login
  useEffect(() => {
    if (token) navigate('/', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in all credentials.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.admin);
        showNotification('Signed in successfully! Welcome back.', 'success');
        navigate('/', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 p-4">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="w-full max-w-md"
      >
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-3xl shadow-2xl mb-4">
            🛍️
          </div>
          <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-brand-400 to-violet-300 bg-clip-text text-transparent uppercase">
            Tobeque Console
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium mt-1">
            Sign in to manage catalog, orders, and system logs
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card bg-slate-950/40 dark:bg-slate-950/40 border-slate-800/40 dark:border-slate-800/40 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="admin@tobeque.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="form-input pl-10 bg-slate-900/60 border-slate-800 dark:bg-slate-900/60 dark:border-slate-800 text-white focus:ring-brand-500/30"
                />
              </div>
            </div>

            <div>
              <label className="form-label text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="form-input pl-10 bg-slate-900/60 border-slate-800 dark:bg-slate-900/60 dark:border-slate-800 text-white focus:ring-brand-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 mt-2 text-sm font-semibold rounded-xl"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer row */}
        <div className="text-center mt-6 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
          Tobeque E-commerce Admin Systems &copy; 2026
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
