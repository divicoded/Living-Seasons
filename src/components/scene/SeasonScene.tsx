import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../../store/useStore';
import { getSeason } from '../../data/seasons';
import './scene.css';

type Kind = 'petal' | 'dust' | 'leaf' | 'rain' | 'mist' | 'snow' | 'dewdrop' | 'spark';

interface P {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: number;
  spin: number;
  scale: number;
  z: number;
  wind: number;
  kind: Kind;
}

const W = 18, H = 14;
const SCALE = 0.014; // maps original px-space forces into 3D units

// Shared pointer (normalized -1..1) for wind interaction
const pointer = { x: 0, y: 0 };

/* ---------- sprite textures (white shapes, tinted by material color) ---------- */
const texCache: Partial<Record<Kind, THREE.Texture>> = {};

function drawShape(ctx: CanvasRenderingContext2D, kind: Kind) {
  ctx.clearRect(0, 0, 64, 64);
  ctx.translate(32, 32);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  if (kind === 'petal' || kind === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.bezierCurveTo(20, -22, 20, 22, 0, 22);
    ctx.bezierCurveTo(-20, 22, -20, -22, 0, -22);
    ctx.fill();
  } else if (kind === 'snow') {
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 24);
      ctx.stroke();
      for (let j = 1; j <= 2; j++) {
        const bp = j * 8;
        ctx.beginPath();
        ctx.moveTo(0, bp);
        ctx.lineTo(5, bp + 4);
        ctx.moveTo(0, bp);
        ctx.lineTo(-5, bp + 4);
        ctx.stroke();
      }
      ctx.restore();
    }
  } else if (kind === 'rain') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 3.5, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'dust' || kind === 'dewdrop') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'mist') {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function getTexture(kind: Kind): THREE.Texture {
  if (texCache[kind]) return texCache[kind]!;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  drawShape(ctx, kind);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  texCache[kind] = tex;
  return tex;
}

/* ---------- per-season layers (counts + colors from the original engine) ---------- */
interface LayerDef {
  kind: Kind;
  count: number;
  color: string;
  size: number;
  opacity: number;
  additive: boolean;
}

const LAYERS: Record<string, LayerDef[]> = {
  vasant: [{ kind: 'petal', count: 70, color: '#ffc8dc', size: 0.55, opacity: 0.95, additive: true }],
  grishma: [
    { kind: 'dust', count: 90, color: '#ffcd6e', size: 0.16, opacity: 0.8, additive: true },
    { kind: 'leaf', count: 16, color: '#ffb45a', size: 0.7, opacity: 0.95, additive: true },
  ],
  varsha: [{ kind: 'rain', count: 170, color: '#aad2f0', size: 0.22, opacity: 0.9, additive: true }],
  sharad: [{ kind: 'leaf', count: 95, color: '#ffaa50', size: 0.7, opacity: 0.95, additive: true }],
  hemant: [
    { kind: 'mist', count: 7, color: '#ffffff', size: 5, opacity: 0.1, additive: false },
    { kind: 'dewdrop', count: 70, color: '#dcf0ff', size: 0.22, opacity: 0.9, additive: true },
  ],
  shishir: [{ kind: 'snow', count: 75, color: '#f0f8ff', size: 0.5, opacity: 0.95, additive: true }],
};

function spawn(kind: Kind): P {
  const r = Math.random;
  return {
    pos: new THREE.Vector3((r() - 0.5) * W, (r() - 0.5) * H, (r() - 0.5) * 8),
    vel: new THREE.Vector3(0, 0, 0),
    rot: r() * Math.PI * 2,
    spin: (r() - 0.5) * 0.4,
    scale: 0.6 + r() * 0.8,
    z: 0.4 + r() * 0.8,
    wind: r() * Math.PI * 2,
    kind,
  };
}

function Layer({ def, quality }: { def: LayerDef; quality: number }) {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => getTexture(def.kind), [def.kind]);
  const count = Math.max(6, Math.round(def.count * quality));

  const data = useMemo(() => Array.from({ length: count }, () => spawn(def.kind)), [def.kind, count]);

  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    data.forEach((p, i) => {
      a[i * 3] = p.pos.x;
      a[i * 3 + 1] = p.pos.y;
      a[i * 3 + 2] = p.pos.z;
    });
    return a;
  }, [data, count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(0.05, delta);
    const f = dt * 60; // normalize to per-frame (60fps) steps
    const pos = ref.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!pos) return;
    const arr = pos.array as Float32Array;
    const windX = pointer.x * 0.0012 * f;
    const windY = -pointer.y * 0.0008 * f;

    for (let i = 0; i < count; i++) {
      const p = data[i];
      const k = p.kind;
      if (k === 'petal') {
        p.vel.x += Math.sin(p.rot * 0.7 + t * 0.5) * 0.01 * SCALE * f;
        p.vel.y += 0.006 * SCALE * f;
        p.rot += p.spin * 0.01 * f;
      } else if (k === 'dust') {
        p.vel.x += Math.sin((p.pos.y / H) * 6 + t * 0.8) * 0.02 * SCALE * f;
        p.vel.y += 0.002 * SCALE * f;
      } else if (k === 'leaf') {
        p.vel.x += Math.sin((p.pos.y / H) * 8 + p.rot) * 0.035 * SCALE * f;
        p.vel.y += 0.008 * SCALE * f;
        p.rot += p.spin * 0.018 * f;
      } else if (k === 'rain') {
        p.vel.x += Math.sin(t * 0.5 + p.wind) * 0.02 * SCALE * f;
        p.vel.y += 0.03 * SCALE * f;
      } else if (k === 'mist') {
        p.vel.x += 0.004 * SCALE * f;
      } else if (k === 'dewdrop') {
        p.vel.y += 0.004 * SCALE * f;
      } else if (k === 'snow') {
        p.vel.x += Math.sin(t * 0.6 + p.pos.y * 0.02) * 0.006 * SCALE * f;
        p.vel.y += 0.004 * SCALE * f;
        p.rot += p.spin * 0.01 * f;
      } else {
        p.vel.y += 0.006 * SCALE * f;
      }
      p.vel.x += windX;
      p.vel.y += windY;
      p.vel.x *= 0.995;
      p.vel.y *= 0.997;
      p.pos.x += p.vel.x * f * p.z;
      p.pos.y += p.vel.y * f * p.z;
      if (p.pos.y < -H / 2) {
        p.pos.y = H / 2;
        p.pos.x = (Math.random() - 0.5) * W;
      }
      if (p.pos.x > W / 2) p.pos.x = -W / 2;
      if (p.pos.x < -W / 2) p.pos.x = W / 2;
      arr[i * 3] = p.pos.x;
      arr[i * 3 + 1] = p.pos.y;
      arr[i * 3 + 2] = p.pos.z;
    }
    pos.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        map={tex}
        transparent
        color={def.color}
        size={def.size}
        sizeAttenuation
        depthWrite={false}
        opacity={def.opacity}
        blending={def.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </Points>
  );
}

function Flares({ color }: { color: string }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const flares = useMemo(
    () =>
      Array.from({ length: 3 }, () => ({
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.3) * 6,
        r: 2 + Math.random() * 2,
        t: Math.random() * Math.PI * 2,
      })),
    []
  );
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    flares.forEach((f, i) => {
      const m = refs.current[i];
      if (!m) return;
      const cx = f.x + Math.cos(f.t + time * 0.2) * 1.5;
      const cy = f.y + Math.sin(f.t + time * 0.2) * 0.8;
      m.position.set(cx, cy, -1);
      const s = 1 + Math.sin(time * 0.8 + i) * 0.15;
      m.scale.setScalar(f.r * s);
    });
  });
  return (
    <>
      {flares.map((f, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }}>
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function SceneContents() {
  const season = useStore((s) => s.season);
  const perf = useStore((s) => s.settings.perfMode);
  const theme = getSeason(season);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const quality = (isMobile ? 0.5 : 1) * (perf ? 0.5 : 1);
  const layers = LAYERS[season] ?? LAYERS.vasant;

  return (
    <>
      <ambientLight intensity={0.6} color={theme.light} />
      <pointLight position={[0, 4, 4]} intensity={2} color={theme.light} />
      {layers.map((def, i) => (
        <Layer key={i} def={def} quality={quality} />
      ))}
      {season === 'grishma' && <Flares color={theme.accent} />}
      {!perf && !isMobile && (
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.2} mipmapBlur />
          <ChromaticAberration offset={[0.0008, 0.0008]} blendFunction={BlendFunction.NORMAL} />
          <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}

export default function SeasonScene() {
  const particles = useStore((s) => s.settings.particles);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // R3F's resize observer can miss the initial size when the Canvas mounts
  // lazily inside a Suspense boundary. Nudge it once after mount.
  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    return () => window.clearTimeout(id);
  }, []);

  if (!particles) return null;
  return (
    <div className="scene-canvas" aria-hidden>
      <Canvas camera={{ position: [0, 0, 9], fov: 60 }} dpr={isMobile ? [1, 1.5] : [1, 1.8]}>
        <SceneContents />
      </Canvas>
    </div>
  );
}
