'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Set initial position and hardware acceleration
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50, force3D: true });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Fast tiny dot using quickSetter
    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    
    // Highly performant quickTo for trailing circle
    const followerX = gsap.quickTo(follower, "x", { duration: 0.15, ease: "power2.out" });
    const followerY = gsap.quickTo(follower, "y", { duration: 0.15, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update fast dot immediately
      xSet(mouseX);
      ySet(mouseY);
      
      // Update slow follower via quickTo
      followerX(mouseX);
      followerY(mouseY);
    };

    // Use event delegation for hover states
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, [role="button"]');
      
      if (isInteractive) {
        gsap.to(cursor, { scale: 1.5, opacity: 0.5, duration: 0.15, overwrite: "auto", force3D: true });
        gsap.to(follower, { scale: 1.5, borderColor: 'rgba(34,211,238,0.5)', backgroundColor: 'rgba(34,211,238,0.1)', duration: 0.15, overwrite: "auto", force3D: true });
      } else {
        gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.15, overwrite: "auto", force3D: true });
        gsap.to(follower, { scale: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'transparent', duration: 0.15, overwrite: "auto", force3D: true });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // Hide cursor if it leaves document
    const handleMouseLeave = () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.3, overwrite: "auto" });
    };
    const handleMouseEnter = () => {
      gsap.to([cursor, follower], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };

    document.documentElement.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.documentElement.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-2 h-2 bg-brand-cyan rounded-full pointer-events-none z-[100] mix-blend-screen shadow-[0_0_10px_#22d3ee]"
      />
      <div 
        ref={followerRef} 
        style={{ willChange: 'transform' }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-white/10 pointer-events-none z-[99]"
      />
    </>
  );
}