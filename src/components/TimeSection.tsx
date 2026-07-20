import useClock from '../hooks/useClock';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import SeasonClock from './SeasonClock';
import TextReveal from './TextReveal';
import './time.css';

const MOMENTS: Record<string, { label: string; line: string }> = {
  vasant: { label: 'First light', line: 'Petals open before the world wakes.' },
  grishma: { label: 'High sun', line: 'The afternoon hums with golden heat.' },
  varsha: { label: 'After the rain', line: 'The earth exhales a silver calm.' },
  sharad: { label: 'Harvest moon', line: 'Amber light, a sky washed clean.' },
  hemant: { label: 'Quiet dusk', line: 'Stillness settles beneath a pale sun.' },
  shishir: { label: 'Deep night', line: 'Frost holds its breath in the dark.' },
};

const Flip = ({ value, label }: { value: string; label: string }) => (
  <div className="flip">
    <div className="flip-digits">
      {value.split('').map((ch, i) => (
        <div className="flip-card" key={`${label}-${i}`}>
          <span className="flip-num" key={ch}>{ch}</span>
        </div>
      ))}
    </div>
    <span className="flip-label">{label}</span>
  </div>
);

export default function TimeSection() {
  const c = useClock();
  const season = useStore((s) => s.season);
  const theme = getSeason(season);
  const moment = MOMENTS[season];

  const hh = String(c.hours12).padStart(2, '0');
  const mm = String(c.minutes).padStart(2, '0');

  return (
    <section className="time-section">
      <h2 className="section-title gradient-text">
        <TextReveal text="The Hour" />
      </h2>

      <SeasonClock />

      <div className="time-flip-row">
        <Flip value={hh} label="hours" />
        <span className="flip-colon">:</span>
        <Flip value={mm} label="minutes" />
        <span className="flip-ampm">{c.ampm}</span>
      </div>

      <div className="time-date glass">
        <span className="time-date-day">{c.day}</span>
        <span className="time-date-num">
          {c.month} {c.date}, {c.year}
        </span>
      </div>

      <div className="time-moment glass">
        <span className="time-moment-label">{moment.label}</span>
        <p className="time-moment-line">{moment.line}</p>
        <span className="time-moment-meta">{theme.weather}</span>
      </div>
    </section>
  );
}
