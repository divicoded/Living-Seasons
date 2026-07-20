import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useClock from '../hooks/useClock';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import './hero.css';

export default function Hero() {
  const clock = useClock();
  const name = useStore((s) => s.name);
  const season = useStore((s) => s.season);
  const theme = getSeason(season);
  const ref = useRef<HTMLDivElement>(null);

  const greetingWords = `${clock.greeting}, ${name}`.split(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.4}px)`;
      el.style.opacity = `${Math.max(0, 1 - y / 600)}`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="hero" ref={ref}>
      <motion.h1
        className="hero-greeting"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {greetingWords.map((w, i) => (
          <span className="word" key={i} style={{ transitionDelay: `${i * 0.08}s` }}>
            {w}
          </span>
        ))}
      </motion.h1>

      <motion.p
        className="hero-sub gradient-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {theme.mood} · {theme.weather}
      </motion.p>

      <div className="hero-time">
        <span className="flip-time">
          {String(clock.hours12).padStart(2, '0')}
          <i>:</i>
          {String(clock.minutes).padStart(2, '0')}
        </span>
        <span className="hero-ampm">{clock.ampm}</span>
      </div>

      <p className="hero-date">
        {clock.day}, {clock.month} {clock.date} · {clock.year}
      </p>

      <div className="hero-season">
        <img src={theme.icon} alt="" className="hero-season-icon" />
        <span>{theme.name} · {theme.hindi}</span>
      </div>
    </section>
  );
}
