"use client";
import React, { useState, useEffect } from "react";
import { SpiralAnimation } from "./ui/spiral-animation";
import { motion } from "framer-motion";
import { ArrowRight, Star, Cpu, Rocket, ShieldCheck } from "lucide-react";

export function SpiralSection() {
  const [startVisible, setStartVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    { title: "Neural Profile Sync", desc: "AI scans your resume and targets the ideal seniority level.", icon: Rocket },
    { title: "Quantum Mock Session", desc: "Face dynamic, high-pressure follow-up questions.", icon: Cpu },
    { title: "Strategic Scorecard", desc: "Instant granular report on body language and content.", icon: ShieldCheck }
  ];

  return (
    <section className="relative w-full min-h-screen bg-[#08090b] overflow-hidden py-32">
      {/* Background Spiral */}
      <div className="absolute inset-0 opacity-100 pointer-events-none">
        <SpiralAnimation />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 space-y-6">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full"
           >
             <Star className="w-3 h-3 text-brand-cyan" fill="currentColor" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan">The Neural Path</span>
           </motion.div>
           <h2 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.85] uppercase">
             Your Journey to <br /> <span className="text-brand-cyan italic">Architect Level.</span>
           </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
           {steps.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.2 }}
               viewport={{ once: true }}
               className="bg-[#0a0b0d]/60 backdrop-blur-xl border border-white/5 p-12 rounded-[48px] group hover:border-brand-cyan/20 transition-all hover:bg-[#0a0b0d]/80"
             >
                <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan mb-10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                   <step.icon size={32} />
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-widest font-black text-white/20">Phase 0{i+1}</div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight uppercase group-hover:text-brand-cyan transition-colors">{step.title}</h3>
                  <p className="text-white/40 font-medium leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-cyan">
                     Learn Protocol <ArrowRight size={14} />
                   </button>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
      
      {/* Footer System Status */}
      <div className="absolute bottom-12 inset-x-0 px-12 flex justify-between items-center opacity-10">
         <div className="text-[10px] font-black uppercase tracking-[0.4em]">Proprietary Simulation Eng.</div>
         <div className="flex gap-4">
           {[1,2,3].map(j => <div key={j} className="h-4 w-px bg-white/40" />)}
         </div>
      </div>
    </section>
  );
}
