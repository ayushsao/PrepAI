"use client";
import React from "react";
import { Radar, IconContainer } from "./ui/radar-effect";
import { 
  FileText, 
  BarChart2, 
  UploadCloud, 
  Coins, 
  Database, 
  FileSearch, 
  Cpu 
} from "lucide-react";
import { motion } from "framer-motion";

export function RadarEffectDemo() {
  return (
    <section className="relative w-full py-32 bg-[#08090b] overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      
      <div className="max-w-4xl mx-auto text-center mb-16 relative z-10 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-black text-brand-cyan">Neural Intelligence Scanner</span>
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Autonomous Interview <br /> <span className="text-brand-cyan italic">Evaluation.</span></h2>
          <p className="text-white/40 max-w-xl mx-auto font-medium">
            Our AI scans every dimension of your response—from technical depth to behavioral alignment—in real-time.
          </p>
      </div>

      <div className="relative flex h-[500px] w-full flex-col items-center justify-center space-y-4 overflow-hidden px-4">
        {/* Row 1 */}
        <div className="mx-auto w-full max-w-3xl relative z-50">
          <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0 px-20">
            <IconContainer
              text="Sentiment Analysis"
              delay={0.2}
              icon={<FileText className="h-6 w-6 text-brand-cyan" />}
            />
            <IconContainer
              delay={0.4}
              text="Market Alignment"
              icon={<Coins className="h-6 w-6 text-brand-cyan" />}
            />
            <IconContainer
              text="Response Integrity"
              delay={0.3}
              icon={<Database className="h-6 w-6 text-brand-cyan" />}
            />
          </div>
        </div>
        {/* Row 2 */}
        <div className="mx-auto w-full max-w-md relative z-50">
          <div className="flex w-full items-center justify-center space-x-12 md:justify-between md:space-x-0">
            <IconContainer
              text="Behavioral Match"
              delay={0.5}
              icon={<BarChart2 className="h-6 w-6 text-brand-cyan" />}
            />
            <IconContainer
              text="Real-time Stream"
              delay={0.8}
              icon={<UploadCloud className="h-6 w-6 text-brand-cyan" />}
            />
          </div>
        </div>
        {/* Row 3 */}
        <div className="mx-auto w-full max-w-3xl relative z-50">
          <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0 px-24">
            <IconContainer
              delay={0.6}
              text="Skill Correlation"
              icon={<FileSearch className="h-6 w-6 text-brand-cyan" />}
            />
            <IconContainer
              delay={0.7}
              text="Architecture Sync"
              icon={<Cpu className="h-6 w-6 text-brand-cyan" />}
            />
          </div>
        </div>

        {/* The Radar Sweep */}
        <Radar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-60 scale-150 md:scale-100" />
        <div className="absolute bottom-0 z-[41] h-px w-full bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </section>
  );
}
