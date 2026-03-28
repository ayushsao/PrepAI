import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Code2, 
  Activity, 
  Flame, 
  AlertTriangle, 
  Video, 
  Eye, 
  BarChart3, 
  BookOpen, 
  Trophy,
  Circle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
        const res = await fetch(`${API_BASE}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  const readiness = analytics?.readiness || 0;
  const breakdown = analytics?.breakdown || { technical: 0, communication: 0, behavioral: 0 };
  const streak = analytics?.streak || 0;

  return (
    <div className="h-screen w-full flex bg-[#08090b] text-white overflow-hidden font-sans">
      <Sidebar />

      {/* Main Dashboard Content */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#08090b]">
        {/* Header Greeting */}
        <header className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
           <div className="space-y-2">
             <h1 className="text-4xl font-black tracking-tight leading-none text-nowrap">Welcome back, {user?.name.split(' ')[0]}.</h1>
             <p className="text-lg text-white/40 max-w-xl font-medium leading-relaxed">
               Your interview readiness score is up <span className="text-brand-cyan font-black">15%</span> this week. You're approaching peak performance.
             </p>
           </div>
           <div className="flex gap-4">
             <Link to="/interview" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center">
               Resume Last Session
             </Link>
             <Link to="/interview" className="px-8 py-4 bg-brand-cyan text-brand-dark rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_10px_30px_rgba(34,211,238,0.3)]">
               Start New Interview
             </Link>
           </div>
        </header>

        {/* Top Grid: Readiness Breakdown & Status */}
        <div className="grid grid-cols-12 gap-8 mb-12">
          {/* Readiness Gauge */}
          <div className="col-span-12 lg:col-span-7 bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-12 group hover:border-brand-cyan/20 transition-all duration-500 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="relative w-52 h-52 shrink-0 group-hover:scale-105 transition-transform duration-500">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                   <circle className="text-white/[0.03]" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                   <motion.circle 
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: readiness / 100 }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="text-brand-cyan" strokeWidth="8" strokeDasharray="251.2" strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-5xl font-black tracking-tight">{readiness}%</span>
                   <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Readiness</span>
                </div>
             </div>

             <div className="flex-1 w-full space-y-6">
                <h3 className="text-base font-black uppercase tracking-widest text-white/60">Readiness Breakdown</h3>
                {[
                  { label: 'Technical Proficiency', score: breakdown.technical },
                  { label: 'Communication Score', score: breakdown.communication },
                  { label: 'Behavioral Confidence', score: breakdown.behavioral }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span>{item.label}</span>
                      <span className="text-brand-cyan">{item.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full bg-brand-cyan shadow-[0_0_10px_rgba(0,255,255,0.2)]" />
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
            <div className="bg-[#0a0b0d] border border-white/5 rounded-[32px] p-8 flex-1 group transition-all hover:bg-white/[0.01]">
               <div className="flex justify-between items-start mb-6">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Active Status</span>
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                   <span className="text-[9px] font-bold text-brand-cyan uppercase tracking-widest italic">AI analyzing...</span>
                 </div>
               </div>
               <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 mb-1">Last session focus</h3>
               <p className="text-2xl font-black tracking-tight leading-tight">{analytics?.recentSessions?.[0]?.role || "No Sessions Yet"}</p>
            </div>

            <div className="bg-[#0a0b0d] border border-white/5 rounded-[32px] p-8 group transition-all flex justify-between items-center hover:bg-white/[0.01]">
               <div>
                 <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Weekly Streak</h3>
                 <p className="text-4xl font-black tracking-tighter">{streak} Days</p>
               </div>
               <div className="p-4 bg-brand-cyan/10 rounded-2xl text-brand-cyan shadow-[0_0_20px_rgba(34,211,238,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all">
                 <Flame size={32} />
               </div>
            </div>
          </div>
        </div>

        {/* Middle Grid: Main Analytics & Improvement */}
        <div className="grid grid-cols-12 gap-8 mb-12">
          {/* Performance Analytics Scatter Plot Area */}
          <div className="col-span-12 lg:col-span-8 bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 min-h-[440px] flex flex-col shadow-2xl relative">
             <header className="flex justify-between items-center mb-10">
               <h3 className="text-lg font-black tracking-tight uppercase tracking-widest text-white/80">Performance Analytics</h3>
               <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                   <span className="text-[9px] font-black uppercase tracking-tighter text-white/30 text-nowrap">Technical</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500/40" />
                   <span className="text-[9px] font-black uppercase tracking-tighter text-white/30 text-nowrap">Behavioral</span>
                 </div>
               </div>
             </header>

             <div className="flex-1 relative flex items-end">
               <div className="absolute inset-0 flex flex-col justify-between py-2 border-l border-b border-white/[0.03]">
                 {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-white/[0.03] border-dashed border-white/5" />)}
               </div>
               
               <div className="w-full flex justify-between px-6 pb-2 relative z-10 pt-4">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <span key={day} className="text-[9px] font-black text-white/10 tracking-widest">{day}</span>
                  ))}
               </div>

               <div className="absolute inset-0 flex justify-between px-8 pt-10 pb-12 h-full items-end">
                  {[35, 60, 50, 80, 70, 90, 85].map((val, i) => (
                    <div key={i} className="relative flex flex-col items-center group h-full justify-end">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${val}%` }}
                         transition={{ duration: 1, delay: i * 0.05 }}
                         className="w-[2px] bg-gradient-to-t from-transparent via-brand-cyan/10 to-brand-cyan/20 rounded-full relative"
                       >
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-cyan rounded-full shadow-[0_0_12px_rgba(0,255,255,0.4)] transition-transform group-hover:scale-125 cursor-help" />
                         <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500/30 rounded-full" />
                       </motion.div>
                    </div>
                  ))}
               </div>
             </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             <h3 className="text-lg font-black tracking-widest text-white/60 ml-4">Needs Improvement</h3>
             {[
               { title: 'Filler Words', desc: "Frequency observed: \"um\", \"like\".", icon: AlertTriangle, color: 'text-orange-400', action: 'Launch Drill' },
               { title: 'Dynamic Programming', desc: "Difficulty identifying optimal moves.", icon: BarChart3, color: 'text-brand-cyan', action: 'Study Concept' },
               { title: 'Eye Contact', desc: "Frequent eye gaze shifts detected.", icon: Eye, color: 'text-blue-400', action: 'Review UI' }
             ].map((item, i) => (
               <div key={i} className="bg-[#0a0b0d] border border-white/5 rounded-[24px] p-5 group transition-all hover:bg-white/[0.01]">
                  <div className="flex items-start gap-4 mb-2">
                    <div className={`p-2.5 rounded-lg bg-white/5 ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight mb-0.5">{item.title}</h4>
                      <p className="text-[10px] text-white/30 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-cyan hover:text-white transition-colors ml-12">
                    {item.action}
                  </button>
               </div>
             ))}
          </div>
        </div>



        <footer className="mt-12 py-8 border-t border-white/5 flex justify-between items-center opacity-20">
           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em]">
             <span>PREPAI</span>
             <Circle size={4} />
             <span>Systems Operational.</span>
           </div>
           <div className="text-[9px] font-bold tracking-[0.3em]">© 2026 PREPAI.</div>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
