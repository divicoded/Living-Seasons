import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import TextReveal from './TextReveal';
import { useFeedback } from '../hooks/useFeedback';
import './gifstrip.css';

const BASE = import.meta.env.BASE_URL;

const GIFS = [
  { src: BASE + 'assets/GIFs/anim1.gif', caption: 'build' },
  { src: BASE + 'assets/GIFs/anim2.gif', caption: 'ship' },
  { src: BASE + 'assets/GIFs/anim3.gif', caption: 'learn' },
  { src: BASE + 'assets/GIFs/anim4.gif', caption: 'play' },
  { src: BASE + 'assets/GIFs/anim5.gif', caption: 'rest' },
  { src: BASE + 'assets/GIFs/anim6.gif', caption: 'repeat' },
  { src: BASE + 'assets/GIFs/anim7.gif', caption: 'dream' },
];

export default function GifStrip() {
  const season = useStore((s) => s.season);
  const theme = getSeason(season);
  const { feedback } = useFeedback();
  const trackRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    feedback('select', 8);
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <section className="gifstrip-section">
      <h2 className="section-title gradient-text">
        <TextReveal text="In motion" />
      </h2>

      <div className="gifstrip-quote">
        <span className="gifstrip-quote-mark">“</span>
        <p>{theme.description}</p>
      </div>

      <div className="gifstrip">
        <button className="gifstrip-nav prev" onClick={() => nudge(-1)} aria-label="Scroll left">
          ‹
        </button>

        <div className="gifstrip-track" ref={trackRef}>
          {GIFS.map((g, i) => (
            <motion.figure
              className="gifstrip-item"
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              <img src={g.src} alt={g.caption} draggable={false} />
              <figcaption>{g.caption}</figcaption>
            </motion.figure>
          ))}
        </div>

        <button className="gifstrip-nav next" onClick={() => nudge(1)} aria-label="Scroll right">
          ›
        </button>
      </div>
    </section>
  );
}
