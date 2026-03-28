import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  MessageSquare,
  Brain,
  ChevronRight,
  Calendar,
  Filter
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const Analytics = () => {
  const { user, token } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_BASE = (import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')).replace(/\/$/, '');
        const res = await fetch(`${API_BASE}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);

  // Integrated metrics using real backend data or fallback
  const metrics = [
      { label: 'Avg. Confidence', value: data?.metrics?.confidence?.value || '-', change: data?.metrics?.confidence?.change || '-', icon: Zap, color: 'text-brand-cyan' },
      { label: 'Technical Depth', value: data?.metrics?.technical?.value || '-', change: data?.metrics?.technical?.change || '-', icon: Brain, color: 'text-blue-400' },
      { label: 'Content Quality', value: data?.metrics?.content?.value || '-', change: data?.metrics?.content?.change || '-', icon: Target, color: 'text-green-400' },
      { label: 'Filler Freq', value: data?.metrics?.filler?.value || '-', change: data?.metrics?.filler?.change || '-', icon: MessageSquare, color: 'text-orange-400' }
    ];

    const skillProficiency = data?.skillProficiency || [];

    // Dynamic progression data points mapping
    const targetPoints = data?.progressionData?.targetPoints || [0, 0, 0, 0, 0];
    const baselinePoints = data?.progressionData?.baselinePoints || [0, 0, 0, 0, 0];
    const graphLabels = data?.progressionData?.labels || ["", "", "", "", ""];
  const generatePath = (pts: number[]) => {
    if (!pts || pts.length === 0) return "";
    let d = `M0,${pts[0]} `;
    for (let i = 1; i < pts.length; i++) {
        const xPrev = (i - 1) * (100 / (pts.length - 1));
        const x = i * (100 / (pts.length - 1));
        const ctrlX1 = xPrev + (x - xPrev) * 0.4;
        const ctrlX2 = x - (x - xPrev) * 0.4;
        d += `C ${ctrlX1},${pts[i-1]} ${ctrlX2},${pts[i]} ${x},${pts[i]} `;
    }
    return d;
  };

  const targetPath = generatePath(targetPoints);
  const targetCurve = `${targetPath} L100,100 L0,100 Z`;
  const baselinePath = generatePath(baselinePoints);

  return (
    <div className="h-screen w-full flex bg-[#08090b] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#08090b]">
        <header className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
           <div className="space-y-2">
             <h1 className="text-4xl font-black tracking-tight leading-none uppercase tracking-widest text-white/90">Performance Analytics</h1>
             <p className="text-lg text-white/40 max-w-xl font-medium leading-relaxed">
               Comprehensive intelligence on your behavioral and technical progress.
             </p>
           </div>
           <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
             {['7d', '30d', 'All'].map(range => (
               <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-brand-cyan text-brand-dark shadow-lg' : 'text-white/30 hover:text-white'}`}
               >
                 {range}
               </button>
             ))}
           </div>
        </header>

        {/* High-Level Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
           {metrics.map((m, i) => (
             <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0a0b0d] border border-white/5 rounded-3xl p-6 group hover:border-brand-cyan/20 transition-all shadow-xl"
             >
               <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-xl bg-white/5 ${m.color}`}>
                   <m.icon size={20} />
                 </div>
                 <span className={`text-[10px] font-black ${m.change.startsWith('+') ? 'text-green-400' : m.change.startsWith('-') ? 'text-brand-cyan' : 'text-white/20'}`}>
                   {m.change}
                 </span>
               </div>
               <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-1">{m.label}</h3>
               <p className="text-2xl font-black tracking-tighter">{m.value}</p>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-12 gap-8 mb-12">
          {/* Readiness Progression Chart (SVG) */}
          <div className="col-span-12 lg:col-span-8 bg-[#0a0b0d] border border-white/5 rounded-[40px] p-10 min-h-[440px] flex flex-col shadow-2xl relative">
             <div className="flex justify-between items-center mb-12">
               <h3 className="text-lg font-black tracking-widest uppercase text-white/80">Readiness Progression</h3>
               <div className="flex gap-4">
                 <span className="flex items-center gap-2 text-[9px] font-black uppercase text-white/20">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan" /> Target
                 </span>
                 <span className="flex items-center gap-2 text-[9px] font-black uppercase text-white/20">
                   <div className="w-2.5 h-2.5 rounded-full bg-blue-500/30" /> Baseline
                 </span>
               </div>
             </div>

             <div className="flex-1 relative">
                {/* Dynamically Generated Graph */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <defs>
                     <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.3" />
                       <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                     </linearGradient>
                     <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                       <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                     </linearGradient>
                   </defs>

                   {/* Grid */}
                   {[0, 25, 50, 75, 100].map(p => (
                     <line key={p} x1="0" y1={`${p}`} x2="100" y2={`${p}`} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                   ))}

                   {/* Baseline Path */}
                   <motion.path
                     initial={{ pathLength: 0, opacity: 0 }}
                     animate={{ pathLength: 1, opacity: 1 }}
                     transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                     d={baselinePath}
                     fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4 4"
                     vectorEffect="non-scaling-stroke"
                   />

                   {/* Main Target Curve Area */}
                   <motion.path
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                     d={targetCurve}
                     fill="url(#curveGradient)"
                   />
                   
                   {/* Main Target Line */}
                   <motion.path
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                     d={targetPath}
                     fill="none" stroke="rgb(34, 211, 238)" strokeWidth="3"
                     vectorEffect="non-scaling-stroke"
                   />

                   {/* baseline Nodes */}
                   {baselinePoints.map((val, i) => (
                      <circle key={`baseline-${i}`} cx={`${(i * 100) / (baselinePoints.length - 1)}`} cy={`${val}`} r="2" fill="rgb(59, 130, 246)" className="opacity-50" vectorEffect="non-scaling-stroke" />
                   ))}

                   {/* Target Nodes */}
                   {targetPoints.map((val, i) => (
                      <circle key={`target-${i}`} cx={`${(i * 100) / (targetPoints.length - 1)}`} cy={`${val}`} r="4" fill="rgb(34, 211, 238)" className="shadow-[0_0_10px_rgba(34,211,238,0.8)]" vectorEffect="non-scaling-stroke" />
                   ))}
                </svg>

                <div className="flex justify-between mt-8 text-[9px] font-black text-white/20 tracking-[.3em] uppercase">
                  {graphLabels.map((l: string, i: number) => <span key={i}>{l}</span>)}
                </div>
             </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
             <div className="bg-[#0a0b0d] border border-white/5 rounded-[40px] p-8 min-h-[440px] flex flex-col shadow-2xl relative overflow-hidden">
                <h3 className="text-lg font-black tracking-widest uppercase text-white/80 mb-8">Skill Mastery</h3>
                
                <div className="space-y-8 flex-1">
                  {skillProficiency.map((skill, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/40">{skill.skill}</span>
                        <span className="text-brand-cyan">{skill.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${skill.score}%` }}
                           transition={{ duration: 1, delay: i * 0.1 }}
                           className="h-full bg-brand-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                         />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-[10px] font-bold text-white/30 leading-relaxed italic">
                    {data?.aiInsight || "AI Insight: Focus on System Design scenarios to improve your architectural depth score."}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Recent Performance Log */}
        <section className="pb-12">
           <h3 className="text-xl font-black tracking-widest uppercase text-white/90 mb-8 group flex items-center gap-4">
             Interview Intelligence Log
             <div className="h-px flex-1 bg-white/5" />
           </h3>

           <div className="space-y-4">
             {data?.recentSessions && data.recentSessions.length > 0 ? (
               data.recentSessions.map((session: any, i: number) => (
                 <div key={i} className="bg-[#0a0b0d] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-cyan/10 transition-all">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-dark transition-all">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight">{session.role}</h4>
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{session.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/20 block mb-1">AI-SCORE</span>
                       <span className="text-xl font-black text-brand-cyan">{session.score}</span>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5">
                       {session.status}
                    </div>
                    <button className="p-3 hover:bg-white/5 rounded-2xl transition-colors">
                      <ChevronRight className="text-white/20" />
                    </button>
                  </div>
                 </div>
               ))
             ) : (
               <div className="bg-[#0a0b0d] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 mb-4">
                   <Calendar size={28} />
                 </div>
                 <h4 className="text-white font-bold tracking-tight mb-2">No intelligence logs found</h4>
                 <p className="text-[13px] text-white/40 max-w-sm">Complete a mock interview session to unlock your highly granular analytics and evaluations.</p>
               </div>
             )}
           </div>
        </section>
      </main>
    </div>
  );
};

export default Analytics;
