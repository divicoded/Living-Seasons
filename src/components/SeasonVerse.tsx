import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import './verse.css';

const VERSES: Record<string, { title: string; lines: string[] }> = {
  vasant: {
    title: 'A Spring Verse',
    lines: ['Something small unclenches in the light,', 'a bud forgives the frost that held it,', 'and softness finds its courage again.'],
  },
  grishma: {
    title: 'A Summer Verse',
    lines: ['The afternoon leans slow against the wall,', 'even the shade feels warm and kind,', 'and time forgets to hurry anywhere.'],
  },
  varsha: {
    title: 'A Monsoon Verse',
    lines: ['Rain falls like something finally forgiven,', 'the dry earth softens without a word,', 'and every leaf remembers how to shine.'],
  },
  sharad: {
    title: 'An Autumn Verse',
    lines: ['The light turns gentle as it says goodbye,', 'a leaf lets go without any grief,', 'and the moon keeps watch, unhurried and full.'],
  },
  hemant: {
    title: 'A Late-Autumn Verse',
    lines: ['The world grows quiet, not empty,', 'a hush settles like a hand on the shoulder,', 'and stillness feels like being held.'],
  },
  shishir: {
    title: 'A Winter Verse',
    lines: ['The cold outside makes the inside softer,', 'snow falls like a small, patient kindness,', 'and even silence feels like warmth.'],
  },
};

export default function SeasonVerse() {
  const season = useStore((s) => s.season);
  const theme = getSeason(season);
  const verse = VERSES[season];

  return (
    <section className="verse-section">
      <span className="verse-kicker">{theme.name} · {theme.hindi}</span>
      <h2 className="verse-title">{verse.title}</h2>
      <p className="verse-lines">
        {verse.lines.map((l, i) => (
          <span key={i} className="verse-line" style={{ transitionDelay: `${i * 0.12}s` }}>
            {l}
          </span>
        ))}
      </p>
    </section>
  );
}
