import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useAnimationControls } from 'framer-motion';
import useClock from '../hooks/useClock';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import TextReveal from './TextReveal';
import { IoLogoGithub } from 'react-icons/io5';
import { useFeedback } from '../hooks/useFeedback';
import './profile.css';

// Identity is fixed to the GitHub profile — the Settings "Your name" field
// no longer affects this card.
const GITHUB_NAME = 'Div';
const GITHUB_URL = 'https://github.com/divicoded';

const MOOD_ICON: Record<string, string> = {
  Blooming: '🌸',
  Radiant: '☀️',
  Monsoon: '🌧️',
  Crisp: '🍂',
  Still: '🌙',
  Frozen: '❄️',
};

export default function ProfileCard() {
  const season = useStore((s) => s.season);
  const photo = useStore((s) => s.photo);
  const theme = getSeason(season);
  const clock = useClock();
  const { feedback } = useFeedback();
  const ref = useRef<HTMLDivElement>(null);

  // ── Magnetic attraction (desktop) + gyro tilt (mobile) ──
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 200, damping: 18, mass: 0.4 });
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  // ── Long-press flip easter egg ──
  const flip = useAnimationControls();
  const pressTimer = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const within =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (within) {
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rx.set((0.5 - py) * 10);
        ry.set((px - 0.5) * 10);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      } else {
        rx.set(0);
        ry.set(0);
      }
      // Magnetic pull toward the cursor when nearby.
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(r.width, r.height) * 1.3;
      if (dist < radius) {
        mx.set(dx * 0.16);
        my.set(dy * 0.16);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
      rx.set(0);
      ry.set(0);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      ry.set(Math.max(-16, Math.min(16, e.gamma * 0.5)));
      rx.set(Math.max(-16, Math.min(16, (e.beta - 45) * 0.35)));
    };

    if (!coarse) {
      window.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    } else if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((s: string) => {
          if (s === 'granted') window.addEventListener('deviceorientation', onOrient);
        })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientation', onOrient);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, [mx, my, rx, ry]);

  const startPress = () => {
    if (pressTimer.current) return;
    pressTimer.current = window.setTimeout(() => {
      feedback('select', 24);
      flip.start({
        scale: [1, 1.6, 1.6, 1],
        rotateY: [0, 0, 360, 360],
        transition: { duration: 1.1, times: [0, 0.15, 0.85, 1], ease: 'easeInOut' },
      });
    }, 500);
  };
  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const time = `${String(clock.hours12).padStart(2, '0')}:${String(clock.minutes).padStart(2, '0')} ${clock.ampm}`;
  const initials = GITHUB_NAME.charAt(0).toUpperCase();
  const moodIcon = MOOD_ICON[theme.mood] ?? '✨';

  const chips = [
    { icon: moodIcon, label: theme.mood, highlight: true },
    { icon: '🌤️', label: theme.weather },
    { icon: '🕙', label: time },
    { icon: '🌡️', label: theme.mood },
    { icon: '📍', label: 'India' },
    { icon: '✨', label: theme.name },
  ];

  return (
    <section className="profile-section">
      <h2 className="section-title gradient-text">
        <TextReveal text="Me" />
      </h2>
      <motion.div
        className="profile-card-wrap"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          ref={ref}
          className="profile-card glass"
          style={{
            ['--seed' as string]: theme.seed,
            ['--light' as string]: theme.light,
            x: sx,
            y: sy,
            rotateX: srx,
            rotateY: sry,
          }}
        >
          <div className="profile-light" />

          <div className="profile-cover">
            <div className="profile-cover-glow" />
            <span className="profile-badge">{moodIcon} {theme.name}</span>
          </div>

          <div className="profile-avatar-row">
            <div className="profile-id">
              <h3 className="profile-name">{GITHUB_NAME}</h3>
              <a className="profile-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
                <IoLogoGithub size={14} /> github.com/divicoded
              </a>
            </div>

            <motion.div
              className="profile-avatar"
              animate={flip}
              onPointerDown={startPress}
              onPointerUp={endPress}
              onPointerLeave={endPress}
              onContextMenu={(e) => e.preventDefault()}
              title="Long-press me"
            >
              <span className="profile-ring" />
              <span className="profile-ring-inner" />
              {photo ? <img src={photo} alt={GITHUB_NAME} className="profile-photo" draggable={false} /> : initials}
              <span className="profile-online" title="online" />
            </motion.div>
          </div>

        <div className="profile-status">
          <span className="profile-status-icon">{moodIcon}</span>
          <div className="profile-status-text">
            <span className="profile-status-label">Currently experiencing</span>
            <div className="profile-status-main">
              <span className="profile-status-season">{theme.name}</span>
              <span className="profile-status-mood">{theme.mood}</span>
            </div>
            <span className="profile-status-desc">{theme.weather}</span>
          </div>
        </div>

        <div className="profile-chips">
          {chips.map((c, i) => (
            <span key={i} className={`profile-chip ${c.highlight ? 'profile-chip--hl' : ''}`}>
              <span className="profile-chip-icon">{c.icon}</span>
              {c.label}
            </span>
          ))}
        </div>

        <div className="profile-quote">
          <span className="profile-quote-divider" />
          <span className="profile-quote-label">Today's reflection</span>
          <p className="profile-quote-text">“{theme.description}”</p>
        </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
