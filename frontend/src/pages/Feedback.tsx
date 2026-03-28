import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Feedback = () => {
  return (
    <div className="h-screen w-full flex bg-[#08090b] text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen relative flex items-center justify-center">
        {/* Background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-cyan/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center relative z-10"
        >
          <div className="w-24 h-24 bg-brand-cyan/10 border border-brand-cyan/20 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            <Wrench className="w-12 h-12 text-brand-cyan animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-400">Maintenance</span>
          </h1>
          
          <p className="text-lg text-white/50 leading-relaxed mb-10">
            We are upgrading our feedback processing core to provide you with even more granular, neural-net driven insights on your performance. 
          </p>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4 text-left">
            <Sparkles className="w-6 h-6 text-brand-cyan shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase text-white/80 mb-2">What's coming</h3>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-cyan" /> Frame-by-face micro-expression analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-cyan" /> Algorithmic logic gap detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-cyan" /> Tone and pacing correlation graphs
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Feedback;
