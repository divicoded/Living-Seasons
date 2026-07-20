import { useEffect, useState } from 'react';
import './scroll-progress.css';

export default function ScrollProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden>
      <span className="scroll-progress-fill" style={{ transform: `scaleX(${p})` }} />
      <span className="scroll-progress-dot" style={{ left: `${p * 100}%` }} />
    </div>
  );
}
