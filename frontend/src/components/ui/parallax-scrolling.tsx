'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Brain, Code2, Cpu, Network, Sparkles, TerminalSquare } from 'lucide-react';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 1.5, // Smooth the scrubbing to reduce jitter
        }
      });

      const layers = [
        { layer: "1", yPercent: 40 },
        { layer: "2", yPercent: 30 },
        { layer: "3", yPercent: 20 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none",
            force3D: true // Force hardware acceleration
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      // Clean up GSAP and ScrollTrigger instances
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative h-[150vh] w-full bg-[#08090b] overflow-hidden" ref={parallaxRef}>
      <section className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Overflow masking line details */}
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent z-30" />
        
        {/* Static Background Glows - Removed from Parallax to save GPU */}
        <div className="absolute top-[30%] left-[20%] w-48 h-48 bg-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[60%] right-[15%] w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div data-parallax-layers className="absolute inset-0 w-full h-full flex items-center justify-center">
          
          {/* LAYER 1: Deepest Background Background */}
          <div data-parallax-layer="1" className="absolute inset-x-0 -top-[20%] h-[140%] w-full opacity-30 will-change-transform">
            <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop" 
              loading="lazy" 
              alt="Cyber Space Grid" 
              className="w-full h-full object-cover" 
            />
            {/* Dark overlay to merge with theme */}
            <div className="absolute inset-0 bg-[#08090b]/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[#08090b]/40" />
          </div>

          {/* LAYER 2: Slow floating midground items */}
          <div data-parallax-layer="2" className="absolute top-0 inset-x-0 h-full w-full pointer-events-none will-change-transform">
             <Network className="absolute top-[25%] left-[22%] w-16 h-16 text-brand-cyan/30 mix-blend-screen" strokeWidth={1} />
             <TerminalSquare className="absolute top-[65%] right-[20%] w-20 h-20 text-blue-400/30 mix-blend-screen" strokeWidth={1} />
          </div>

          {/* LAYER 3: Title and Focus */}
          <div data-parallax-layer="3" className="relative z-10 flex flex-col items-center text-center will-change-transform">
            <div className="px-4 py-2 border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
              Total Immersion
            </div>
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-2xl">
              REALISTIC <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-blue-500 shadow-brand-cyan/20">
                SCENARIOS
              </span>
            </h2>
          </div>

          {/* LAYER 4: Fastest extreme-foreground items */}
          <div data-parallax-layer="4" className="absolute bottom-[-10%] inset-x-0 h-full w-full pointer-events-none will-change-transform">
             <Cpu className="absolute bottom-[35%] right-[25%] w-24 h-24 text-brand-cyan/50 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" strokeWidth={1.5} />
             <Brain className="absolute top-[20%] right-[30%] w-12 h-12 text-blue-300/40 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" strokeWidth={1.5} />
             <Code2 className="absolute bottom-[40%] left-[15%] w-20 h-20 text-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" strokeWidth={1.5} />
             <Sparkles className="absolute top-[45%] left-[35%] w-8 h-8 text-brand-cyan/60 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" strokeWidth={2} />
          </div>
        </div>

        {/* Cinematic Fades on ends */}
        <div className="absolute top-0 inset-x-0 w-full h-32 bg-gradient-to-b from-[#08090b] via-[#08090b]/80 to-transparent z-20" />
        <div className="absolute bottom-0 inset-x-0 w-full h-32 bg-gradient-to-t from-[#08090b] via-[#08090b]/80 to-transparent z-20" />
      </section>
    </div>
  );
}