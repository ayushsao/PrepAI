import React, { useEffect, useRef } from 'react';

// ─── Draw Functions ────────────────────────────────────────────────────────────

function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, text: string, fg: string, bg: string) {
  ctx.beginPath(); ctx.arc(x, y, s * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = bg; ctx.fill();
  ctx.strokeStyle = fg; ctx.lineWidth = s * 0.06; ctx.stroke();
  ctx.fillStyle = fg;
  const fs = text.length > 3 ? s * 0.22 : s * 0.3;
  ctx.font = `bold ${fs}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawMongo(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'MDB', '#00ED64', '#001a0d');
}
function drawExpress(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'EXP', '#ffffff', '#111111');
}
function drawReact(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.strokeStyle = '#61DAFB'; ctx.lineWidth = s * 0.06;
  ctx.beginPath(); ctx.arc(x, y, s * 0.2, 0, Math.PI * 2); ctx.fillStyle = '#61DAFB'; ctx.fill();
  for (let a = 0; a < Math.PI; a += Math.PI / 3) {
    ctx.beginPath(); ctx.ellipse(x, y, s * 0.44, s * 0.17, a, 0, Math.PI * 2); ctx.stroke();
  }
}
function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'NODE', '#339933', '#0a1a0a');
}
function drawDocker(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'DOCK', '#2496ED', '#00111f');
}
function drawAWS(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'AWS', '#FF9900', '#1a0d00');
}
function drawGit(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'GIT', '#F05032', '#1a0800');
}
function drawK8s(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'K8S', '#326CE5', '#00091a');
}
function drawTS(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const h = s * 0.9;
  ctx.fillStyle = '#3178C6';
  ctx.fillRect(x - h/2, y - h/2, h, h);
  ctx.fillStyle = '#fff'; ctx.font = `bold ${s * 0.4}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('TS', x, y + s * 0.04);
}
function drawNginx(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawLabel(ctx, x, y, s, 'NGX', '#009900', '#001200');
}

// ─── Skill Definitions ─────────────────────────────────────────────────────────
// 3 rings: MERN (inner) | Cloud+DevOps (middle) | TS+extras (outer)

const RINGS = [
  // Inner ring: MERN stack
  { radius: 52,  speed: 0.7,  color: '#22d3ee', skills: [
    { label: 'MongoDB',   color: '#00ED64', phase: 0,                   draw: drawMongo },
    { label: 'Express',   color: '#ffffff', phase: Math.PI / 2,         draw: drawExpress },
    { label: 'React',     color: '#61DAFB', phase: Math.PI,             draw: drawReact },
    { label: 'Node.js',   color: '#339933', phase: Math.PI * 1.5,       draw: drawNode },
  ]},
  // Middle ring: Cloud + DevOps
  { radius: 95,  speed: -0.45, color: '#a855f7', skills: [
    { label: 'Docker',    color: '#2496ED', phase: 0,                   draw: drawDocker },
    { label: 'AWS',       color: '#FF9900', phase: Math.PI * 2/3,       draw: drawAWS },
    { label: 'Git',       color: '#F05032', phase: Math.PI * 4/3,       draw: drawGit },
  ]},
  // Outer ring: engineering tools
  { radius: 138, speed: 0.3,  color: '#22d3ee', skills: [
    { label: 'Kubernetes',color: '#326CE5', phase: 0,                   draw: drawK8s },
    { label: 'TypeScript',color: '#3178C6', phase: Math.PI * 2/3,       draw: drawTS },
    { label: 'Nginx',     color: '#009900', phase: Math.PI * 4/3,       draw: drawNginx },
  ]},
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OrbitingSkills({ size = 340 }: { size?: number; scale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>();
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const iconSize = size * 0.11;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw orbit rings
      RINGS.forEach(ring => {
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `${ring.color}18`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Central core
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      grad.addColorStop(0, 'rgba(34,211,238,0.5)');
      grad.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(34,211,238,0.9)'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();

      // Draw each ring's icons
      RINGS.forEach(ring => {
        ring.skills.forEach(skill => {
          const angle = timeRef.current * ring.speed + skill.phase;
          const ix = cx + Math.cos(angle) * ring.radius;
          const iy = cy + Math.sin(angle) * ring.radius;

          // icon glow
          const glow = ctx.createRadialGradient(ix, iy, 0, ix, iy, iconSize);
          glow.addColorStop(0, skill.color + '28');
          glow.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(ix, iy, iconSize, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();

          ctx.save();
          ctx.translate(ix - iconSize / 2, iy - iconSize / 2);
          skill.draw(ctx, iconSize / 2, iconSize / 2, iconSize);
          ctx.restore();
        });
      });

      timeRef.current += 0.01;
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: 'block' }} />;
}
