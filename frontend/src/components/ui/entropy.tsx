'use client';
import React, { useEffect, useRef } from 'react';

interface EntropyProps {
  className?: string;
  size?: number;
}

export function Entropy({ className = "", size = 1200 }: EntropyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive setup
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;
      
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const particleColor = '#22d3ee'; // Brand Cyan

    class Particle {
      x: number;
      y: number;
      size: number;
      order: boolean;
      velocity: { x: number; y: number };
      originalX: number;
      originalY: number;
      influence: number;
      neighbors: Particle[];

      constructor(x: number, y: number, order: boolean) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.size = 1.4; // Slightly smaller and softer
        this.order = order;
        this.velocity = {
          x: (Math.random() - 0.5) * 0.4, // Slower, more 'airy'
          y: (Math.random() - 0.5) * 0.4
        };
        this.influence = 0;
        this.neighbors = [];
      }

      update(width: number, height: number) {
        if (this.order) {
          const dx = this.originalX - this.x;
          const dy = this.originalY - this.y;

          const chaosInfluence = { x: 0, y: 0 };
          this.neighbors.forEach(neighbor => {
            if (!neighbor.order) {
              const distance = Math.hypot(this.x - neighbor.x, this.y - neighbor.y);
              const strength = Math.max(0, 1 - distance / 150);
              chaosInfluence.x += (neighbor.velocity.x * strength);
              chaosInfluence.y += (neighbor.velocity.y * strength);
              this.influence = Math.max(this.influence, strength);
            }
          });

          this.x += dx * 0.02 * (1 - this.influence) + chaosInfluence.x * this.influence;
          this.y += dy * 0.02 * (1 - this.influence) + chaosInfluence.y * this.influence;
          this.influence *= 0.98;
        } else {
          this.velocity.x += (Math.random() - 0.5) * 0.2;
          this.velocity.y += (Math.random() - 0.5) * 0.2;
          this.velocity.x *= 0.98;
          this.velocity.y *= 0.98;
          this.x += this.velocity.x;
          this.y += this.velocity.y;

          if (this.x < 0 || this.x > width) this.velocity.x *= -1;
          if (this.y < 0 || this.y > height) this.velocity.y *= -1;
          this.x = Math.max(0, Math.min(width, this.x));
          this.y = Math.max(0, Math.min(height, this.y));
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = this.order ? 0.35 - this.influence * 0.15 : 0.25; // Striking yet balanced
        ctx.fillStyle = `${particleColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const density = 40; // Increased back for more visibility
    
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const x = (width / (density - 1)) * i;
        const y = (height / (density - 1)) * j;
        const order = Math.random() > 0.3;
        particles.push(new Particle(x, y, order));
      }
    }

    function updateNeighbors() {
      particles.forEach(particle => {
        particle.neighbors = particles.filter(other => {
          if (other === particle) return false;
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          return distance < 100;
        });
      });
    }

    let time = 0;
    let animationId: number;
    
    function animate() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      if (time % 60 === 0) updateNeighbors();

      particles.forEach(particle => {
        particle.update(w, h);
        particle.draw(ctx);

        particle.neighbors.forEach(neighbor => {
          const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
          if (distance < 100) {
            const alpha = 0.06 * (1 - distance / 100); // Clearer neural paths
            ctx.strokeStyle = `${particleColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(neighbor.x, neighbor.y);
            ctx.stroke();
          }
        });
      });

      time++;
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="opacity-100" />
    </div>
  );
}
