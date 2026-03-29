import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NeuralBackground from '../components/ui/flow-field-background';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      if (!formData.name.trim()) {
        setError('Please enter your full name.');
        setIsLoading(false);
        return;
      }
      result = await signup(formData.name, formData.email, formData.password);
    }

    setIsLoading(false);

    if (result.success) {
      setSuccess(isLogin ? 'Welcome back!' : 'Account created!');
      setTimeout(() => navigate('/dashboard'), 600);
    } else {
      setError(result.message || 'Something went wrong.');
    }
  };

  const switchMode = () => {
    setIsLogin(prev => !prev);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen w-full flex bg-[#08090b] text-white font-sans overflow-hidden relative">
      {/* Background Flow Field */}
      <div className="absolute inset-0 z-0">
        <NeuralBackground 
          color="#22d3ee" // brand-cyan
          scale={1}
          trailOpacity={0.15}
          speed={0.8}
        />
      </div>

      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-cyan/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-brand-cyan/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-10 transition-transform hover:scale-105 active:scale-95 group">
          <div className="w-10 h-10 bg-brand-cyan rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.3)] group-hover:rotate-12 transition-all">
            <Layout className="w-6 h-6 text-brand-dark" />
          </div>
          <span className="text-2xl font-black tracking-tighter">PrepAI</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0a0b0d] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-30" />

          <div className="text-center mb-10">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              {isLogin ? 'Sign in to your PrepAI account' : 'Start your AI interview journey'}
            </p>
          </div>

          {/* Error / Success Banners */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs font-bold"
              >
                <CheckCircle2 size={16} className="shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (signup only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                        placeholder="Enter your name"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-sm focus:outline-none focus:border-brand-cyan/50 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                  placeholder={isLogin ? 'Your password' : 'Min. 6 characters'}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-brand-cyan transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-brand-cyan text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_40px_rgba(0,255,255,0.2)] glow-button disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="mt-8 text-xs font-bold text-white/20 uppercase tracking-widest">
          {isLogin ? 'No account yet?' : 'Already have an account?'}
          <button
            onClick={switchMode}
            className="ml-2 text-brand-cyan hover:underline transition-all"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>

      <footer className="absolute bottom-6 inset-x-0 text-center opacity-10 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] pointer-events-none">
        <span>© 2026 PREPAI</span>
        <div className="w-1 h-1 rounded-full bg-white" />
        <span>Architect: Ayush Kumar Sao</span>
      </footer>
    </div>
  );
};

export default Auth;
