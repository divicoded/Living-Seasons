import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import './season-particles-2d.css';

/**
 * 2D canvas background particles - the original Yokoso engine's sakura petals
 * (spring) and drifting leaves (autumn) - rendered behind the 3D scene for
 * vasant and sharad only, as requested. Uses the original draw routines.
 */

type Kind = 'sakura' | 'leaf';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  ang: number;
  spin: number;
  alpha: number;
  z: number;
  color: string;
  sway: number;
}

function drawSakura(ctx: CanvasRenderingContext2D, size: number, rot: number) {
  ctx.save();
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.bezierCurveTo(size / 2, -size / 2, size / 2, size / 2, 0, size / 2);
  ctx.bezierCurveTo(-size / 2, size / 2, -size / 2, -size / 2, 0, -size / 2);
  ctx.fillStyle = 'rgba(255, 200, 220, 0.9)';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -size / 3);
  ctx.lineTo(0, size / 3);
  ctx.strokeStyle = 'rgba(255, 150, 180, 0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, r: number, rot: number) {
  ctx.save();
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -r / 2);
  ctx.bezierCurveTo(r * 1.2, -r, r * 1.1, r, 0, r * 1.2);
  ctx.bezierCurveTo(-r * 1.1, r, -r * 1.2, -r, 0, -r / 2);
  ctx.fillStyle = 'rgba(255, 170, 80, 0.95)';
  ctx.fill();
  ctx.restore();
}

export default function SeasonParticles2D() {
  const season = useStore((s) => s.season);
  const particlesOn = useStore((s) => s.settings.particles);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<P[]>([]);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const kind: Kind | null =
    season === 'vasant' ? 'sakura' : season === 'sharad' ? 'leaf' : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rnd = (a: number, b: number) => Math.random() * (b - a) + a;
    const count = isMobile ? (kind === 'sakura' ? 34 : 40) : kind === 'sakura' ? 70 : 80;

    const spawn = (): P => {
      if (kind === 'sakura') {
        return {
          x: rnd(0, W),
          y: rnd(-60, H + 60),
          vx: rnd(-0.28, 0.35),
          vy: rnd(0.18, 0.55),
          r: rnd(4, 8),
          ang: rnd(0, Math.PI * 2),
          spin: rnd(-0.06, 0.06),
          alpha: rnd(0.6, 0.95),
          z: rnd(0.5, 1.2),
          color: '',
          sway: rnd(0, Math.PI * 2),
        };
      }
      return {
        x: rnd(0, W),
        y: rnd(-60, H + 60),
        vx: rnd(-0.6, 0.45),
        vy: rnd(0.25, 0.7),
        r: rnd(6, 13),
        ang: rnd(0, Math.PI * 2),
        spin: rnd(-0.3, 0.3),
        alpha: rnd(0.7, 1),
        z: rnd(0.5, 1.2),
        color: '',
        sway: rnd(0, Math.PI * 2),
      };
    };

    partsRef.current = Array.from({ length: count }, spawn);

    const onMove = (e: PointerEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('resize', resize);

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      ctx.clearRect(0, 0, W, H);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      for (const p of partsRef.current) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy) || 1;
        const infl = Math.max(0, 1 - dist / 180);
        p.vx += (-dx / dist) * 0.04 * infl;
        p.vy += (-dy / dist) * 0.02 * infl;

        if (kind === 'sakura') {
          p.vx += Math.sin(p.sway + now * 0.0005) * 0.01;
          p.vy += 0.006 * (dt / 16);
          p.ang += p.spin * 0.01;
        } else {
          p.vx += Math.sin(p.y / H * 8 + p.ang) * 0.035;
          p.vy += 0.008 * (dt / 16);
          p.ang += p.spin * 0.018;
        }

        p.vx *= 0.995;
        p.vy *= 0.997;
        p.x += p.vx * (dt / 16) * p.z;
        p.y += p.vy * (dt / 16) * p.z;

        if (p.y > H + 40 || p.x < -60 || p.x > W + 60) {
          Object.assign(p, spawn(), { y: -40, x: rnd(0, W) });
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.alpha;
        if (kind === 'sakura') drawSakura(ctx, p.r * 2, p.ang);
        else drawLeaf(ctx, p.r, Math.sin(p.ang) * 0.6);
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    // Particles run continuously while enabled — they are only stopped when
    // the "Ambient particles" toggle is off. The `motion` setting controls
    // entrance/parallax animations elsewhere, not the ambient particle loop.
    if (kind && particlesOn) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, [kind, particlesOn]);

  if (!kind) return null;

  return <canvas ref={canvasRef} className="season-particles-2d" aria-hidden />;
}
