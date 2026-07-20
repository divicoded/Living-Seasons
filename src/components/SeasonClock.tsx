import useClock from '../hooks/useClock';
import { getSeason } from '../data/seasons';
import { useStore } from '../store/useStore';
import './clock.css';

/* Each season gets a distinct clock silhouette + motion language. */
export default function SeasonClock() {
  const c = useClock();
  const season = useStore((s) => s.season);
  const theme = getSeason(season);

  const hh = String(c.hours12).padStart(2, '0');
  const mm = String(c.minutes).padStart(2, '0');
  const ss = String(c.seconds).padStart(2, '0');

  const R = 100;
  const cx = 100, cy = 100;
  const hourX = cx + 52 * Math.sin((c.hourAngle * Math.PI) / 180);
  const hourY = cy - 52 * Math.cos((c.hourAngle * Math.PI) / 180);
  const minX = cx + 74 * Math.sin((c.minuteAngle * Math.PI) / 180);
  const minY = cy - 74 * Math.cos((c.minuteAngle * Math.PI) / 180);
  const secX = cx + 84 * Math.sin((c.secondAngle * Math.PI) / 180);
  const secY = cy - 84 * Math.cos((c.secondAngle * Math.PI) / 180);

  // 60 tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 * Math.PI) / 180;
    const r1 = i % 5 === 0 ? 84 : 90;
    const r2 = 96;
    return {
      x1: cx + r1 * Math.sin(a),
      y1: cy - r1 * Math.cos(a),
      x2: cx + r2 * Math.sin(a),
      y2: cy - r2 * Math.cos(a),
      major: i % 5 === 0,
    };
  });

  return (
    <div className={`season-clock clock-${season}`}>
      <svg viewBox="0 0 200 200" className="clock-svg">
        <defs>
          <linearGradient id="cring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--seed)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <radialGradient id="cdial" cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--seed) 22%, var(--surface-2))" />
            <stop offset="100%" stopColor="var(--surface-1)" />
          </radialGradient>
        </defs>

        {/* base dial */}
        <circle cx={cx} cy={cy} r={R} fill="url(#cdial)" stroke="var(--surface-3)" strokeWidth={2} />

        {/* season-specific decorative ring */}
        {season === 'vasant' && (
          <g className="ring-petals">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const px = cx + 100 * Math.sin(a);
              const py = cy - 100 * Math.cos(a);
              return (
                <ellipse key={i} cx={px} cy={py} rx={5} ry={9}
                  fill="var(--seed)" opacity={0.55}
                  transform={`rotate(${(i * 30)} ${px} ${py})`} />
              );
            })}
          </g>
        )}
        {season === 'grishma' && (
          <circle cx={cx} cy={cy} r={R - 6} fill="none" stroke="var(--accent)" strokeWidth={3}
            strokeDasharray="2 10" className="ring-sun" opacity={0.8} />
        )}
        {season === 'varsha' && (
          <g className="ring-rain" opacity={0.7}>
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i * 15 * Math.PI) / 180;
              const px = cx + 100 * Math.sin(a);
              const py = cy - 100 * Math.cos(a);
              return <line key={i} x1={px} y1={py - 4} x2={px - 3} y2={py + 4}
                stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />;
            })}
          </g>
        )}
        {season === 'sharad' && (
          <g className="ring-leaves" opacity={0.7}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * 45 * Math.PI) / 180;
              const px = cx + 100 * Math.sin(a);
              const py = cy - 100 * Math.cos(a);
              return <path key={i}
                d={`M${px},${py - 6} q6,6 0,12 q-6,-6 0,-12 Z`}
                fill="var(--seed)" transform={`rotate(${i * 45} ${px} ${py})`} />;
            })}
          </g>
        )}
        {season === 'hemant' && (
          <circle cx={cx} cy={cy} r={R - 4} fill="none" stroke="var(--accent)" strokeWidth={1.5}
            strokeDasharray="1 6" opacity={0.7} className="ring-mist" />
        )}
        {season === 'shishir' && (
          <g className="ring-snow" opacity={0.8}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i * 60 * Math.PI) / 180;
              const px = cx + 100 * Math.sin(a);
              const py = cy - 100 * Math.cos(a);
              return (
                <g key={i} transform={`translate(${px} ${py})`}>
                  {Array.from({ length: 6 }, (_, k) => (
                    <line key={k} x1={0} y1={0} x2={0} y2={6}
                      stroke="var(--accent)" strokeWidth={1.4}
                      transform={`rotate(${k * 60})`} />
                  ))}
                </g>
              );
            })}
          </g>
        )}

        {/* ticks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? 'var(--primary)' : 'var(--text-3)'}
            strokeWidth={t.major ? 2 : 1} strokeLinecap="round" />
        ))}

        {/* progress arc (minutes) */}
        <circle cx={cx} cy={cy} r={R - 12} fill="none" stroke="url(#cring)" strokeWidth={4}
          strokeLinecap="round" strokeDasharray={`${(c.minutes / 60) * 552} 552`}
          transform="rotate(-90 100 100)" className="clock-progress" />

        {/* hands */}
        <line x1={cx} y1={cy} x2={hourX} y2={hourY} stroke="var(--text-1)" strokeWidth={5} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={minX} y2={minY} stroke="var(--primary)" strokeWidth={3.5} strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={secX} y2={secY} stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round" className="clock-second" />
        <circle cx={cx} cy={cy} r={5} fill="var(--seed)" />
      </svg>

      <div className="clock-readout">
        <span className="clock-digits">
          {hh}<i>:</i>{mm}
        </span>
        <span className="clock-ampm">{c.ampm}</span>
        <span className="clock-sec">{ss}</span>
      </div>
      <span className="clock-season">{theme.name} · {theme.hindi}</span>
    </div>
  );
}
