import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import './loading.css';

const FLOWER =
  'M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z';

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const season = useStore((s) => s.season);

  useEffect(() => {
    let v = 0;
    let done = false;
    const id = setInterval(() => {
      v += Math.random() * 14 + 5;
      if (v >= 100) {
        v = 100;
        clearInterval(id);
        if (!done) {
          done = true;
          setTimeout(onDone, 650);
        }
      }
      setPct(Math.min(100, Math.floor(v)));
    }, 170);
    return () => clearInterval(id);
    // onDone is stable (wrapped in useCallback in App), so this runs once.
  }, [onDone]);

  const g1 = `lg-${season}-1`;

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: pct >= 100 ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      style={{ pointerEvents: pct >= 100 ? 'none' : 'auto' }}
    >
      <div className="loader-flowers">
        <svg className="loader-flower f1" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id={g1} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'var(--seed)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)' }} />
            </linearGradient>
          </defs>
          <path d={FLOWER} fill={`url(#${g1})`} />
        </svg>
        <svg className="loader-flower f2" viewBox="0 0 100 100" aria-hidden>
          <path d={FLOWER} fill={`url(#${g1})`} />
        </svg>
        <svg className="loader-flower f3" viewBox="0 0 100 100" aria-hidden>
          <path d={FLOWER} fill={`url(#${g1})`} />
        </svg>
      </div>

      <div className="loader-pct">{pct}%</div>
      <div className="loader-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="loader-text">Living Seasons</p>
      <span className="loader-hint">blooming the world…</span>
    </motion.div>
  );
}
