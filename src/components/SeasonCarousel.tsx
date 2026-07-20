import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { SEASONS } from '../data/seasons';
import { useFeedback } from '../hooks/useFeedback';
import TextReveal from './TextReveal';
import './carousel.css';

const SUBTITLES: Record<string, string> = {
  vasant: 'Spring', grishma: 'Summer', varsha: 'Monsoon', sharad: 'Autumn', hemant: 'Pre-Winter', shishir: 'Winter',
};

export default function SeasonCarousel() {
  const season = useStore((s) => s.season);
  const setSeason = useStore((s) => s.setSeason);
  const { feedback } = useFeedback();
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);

  const order = SEASONS.map((s) => s.id);
  const idx = order.indexOf(season);

  const go = (next: number) => {
    const wrapped = (next + order.length) % order.length;
    if (wrapped === idx) return;
    setSeason(order[wrapped]);
    feedback('select', 12);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    const dt = Date.now() - touch.current.t;
    touch.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4 && dt < 700) {
      go(idx + (dx < 0 ? 1 : -1));
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) > 30) go(idx + (d > 0 ? 1 : -1));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(idx + 1);
    if (e.key === 'ArrowLeft') go(idx - 1);
  };

  // Tap anywhere on the active tab (or the nav track) to advance to the next season.
  const onNavClick = (e: React.MouseEvent) => {
    // Ignore clicks that landed on a specific tab button (those set the season directly).
    if ((e.target as HTMLElement).closest('.nav-tab')) return;
    go(idx + 1);
  };

  return (
    <section className="carousel-section">
      <h2 className="section-title">
        <TextReveal text="Seasons" />
      </h2>
      <div
        className="carousel-nav"
        role="tablist"
        aria-label="Season selector"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        onKeyDown={onKey}
        onClick={onNavClick}
        tabIndex={0}
      >
        {SEASONS.map((s) => {
          const active = s.id === season;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              className={`nav-tab ${active ? 'active' : ''}`}
              onClick={() => {
                setSeason(s.id);
                feedback('select', 12);
              }}
              data-cursor="hover"
              style={{
                ['--seed' as string]: s.seed,
                ['--accent' as string]: s.accent,
                ['--light' as string]: s.light,
              }}
            >
              <span className="tab-icon">
                <img src={s.icon} alt="" />
              </span>
              <span className="tab-content">
                <span className="tab-title">{s.name}</span>
                <span className="tab-desc">{SUBTITLES[s.id]}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="carousel-hint">swipe · scroll · tap to shift the world</p>
    </section>
  );
}
