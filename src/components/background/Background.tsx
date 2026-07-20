import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { getSeason } from '../../data/seasons';
import './background.css';

export default function Background() {
  const season = useStore((s) => s.season);
  const blur = useStore((s) => s.settings.blur);
  const theme = getSeason(season);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      if (lightRef.current) {
        lightRef.current.style.setProperty('--mx', `${x}%`);
        lightRef.current.style.setProperty('--my', `${y}%`);
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="bg-scene" aria-hidden>
      <div
        className="bg-mesh"
        style={{
          background: `radial-gradient(120% 120% at 20% 10%, ${theme.gradient[1]} 0%, transparent 55%),
                       radial-gradient(120% 120% at 85% 80%, ${theme.gradient[2]} 0%, transparent 60%),
                       linear-gradient(160deg, ${theme.gradient[0]}, ${theme.gradient[2]})`,
        }}
      />
      <div className="bg-blobs">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
      </div>
      <div ref={lightRef} className="bg-mouselight" />
      <div className="bg-noise" />
      <div className="bg-fog" />
      {blur && <div className="bg-blur" />}
      <div className="bg-vignette" />
    </div>
  );
}
