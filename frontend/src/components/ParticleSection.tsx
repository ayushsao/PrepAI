"use client";
import React from "react";
import { ParticleTextEffect } from "./ui/particle-text-effect";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";

export function ParticleSection() {
  return (
    <section className="relative w-full py-32 bg-[#090a0c] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-16 space-y-6">
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20"
           >
             <MessageSquare className="w-3 h-3 text-brand-cyan" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-cyan">Neural Comm Channel</span>
           </motion.div>
           <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
             Dialogue <span className="text-brand-cyan italic">Reinvented.</span>
           </h2>
           <p className="text-white/40 max-w-lg mx-auto font-medium">
             Our AI doesn't just evaluate—it understands. Experience the future of neural communication.
           </p>
        </div>

        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-8 md:p-12 shadow-2xl group transition-all hover:border-brand-cyan/20 relative overflow-hidden">
           {/* Decorative background scanline */}
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent" />
           
           <ParticleTextEffect 
             words={["PREPAI", "AYUSH KUMAR", "BUILD WITH CARE", "FUTURE"]} 
             className="relative z-10"
           />
           
           <div className="absolute bottom-6 right-10 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Sparkles size={14} className="text-brand-cyan" />
              <span className="text-[10px] font-black uppercase tracking-widest">Scanning Active...</span>
           </div>
        </div>
      </div>
      
      {/* Dynamic Floor Gradient */}
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-brand-cyan/5 to-transparent pointer-events-none" />
    </section>
  );
}
