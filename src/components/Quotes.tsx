import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import { useFeedback } from '../hooks/useFeedback';
import TextReveal from './TextReveal';
import './quotes.css';

const QUOTES: Record<string, { text: string; author: string }[]> = {
  vasant: [
    { text: 'No winter lasts forever; no spring skips its turn.', author: 'Hal Borland' },
    { text: 'Blossom by blossom the spring begins.', author: 'Algernon Charles Swinburne' },
    { text: 'In the spring, at the end of the day, you should smell like dirt.', author: 'Margaret Atwood' },
  ],
  grishma: [
    { text: 'Summer afternoon — to me those have always been the two most beautiful words.', author: 'Henry James' },
    { text: 'Live in the sunshine, swim the sea, drink the wild air.', author: 'Ralph Waldo Emerson' },
    { text: 'And so with the sunshine and the great bursts of leaves growing on the trees, I had that familiar conviction that life was beginning over again.', author: 'F. Scott Fitzgerald' },
  ],
  varsha: [
    { text: 'Some people feel the rain, others just get wet.', author: 'Bob Marley' },
    { text: 'Let the rain kiss you.', author: 'Langston Hughes' },
    { text: 'The rain falls on the just and the unjust, but mostly on the just because the unjust have stolen the just’s umbrella.', author: 'Robert Byrne' },
  ],
  sharad: [
    { text: 'Autumn is a second spring when every leaf is a flower.', author: 'Albert Camus' },
    { text: 'Season of mists and mellow fruitfulness.', author: 'John Keats' },
    { text: 'Delicious autumn! My very soul is wedded to it.', author: 'George Eliot' },
  ],
  hemant: [
    { text: 'Calmness of mind is a beautiful jewel of wisdom.', author: 'James Allen' },
    { text: 'Quiet minds cannot be perplexed.', author: 'Robert Louis Stevenson' },
    { text: 'The world is full of magic things, patiently waiting for our senses to grow sharper.', author: 'W.B. Yeats' },
  ],
  shishir: [
    { text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.', author: 'Albert Camus' },
    { text: 'Winter is the time for comfort, for good food and warmth.', author: 'Edith Sitwell' },
    { text: 'If winter comes, can spring be far behind?', author: 'Percy Bysshe Shelley' },
  ],
};

export default function Quotes() {
  const season = useStore((s) => s.season);
  const theme = getSeason(season);
  const list = QUOTES[season];
  const [idx, setIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { feedback } = useFeedback();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0]);

  const current = list[idx];
  const next = list[(idx + 1) % list.length];

  const swipe = async (direction: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    feedback('select', 10);

    // fling the card fully off screen, keeping whatever rotation/drag it had
    await animate(x, direction * (window.innerWidth || 900), {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    });

    // swap content once it's off screen, then snap it back to center instantly
    setIdx((i) => (i + 1) % list.length);
    x.set(0);
    y.set(0);
    setIsAnimating(false);
  };

  return (
    <section className="quotes-section">
      <h2 className="section-title">
        <TextReveal text="A Thought" />
      </h2>

      <div className="quotes-grid">
        <div className="quote-dots" aria-hidden>
          {list.map((_, i) => (
            <span key={i} className={`quote-dot ${i === idx ? 'active' : ''}`} />
          ))}
        </div>

        <div className="quote-card-stage">
          {/* next card, peeking behind, static */}
          <div
            className="quote-card glass quote-card-behind"
            style={{ ['--seed' as string]: theme.seed, ['--accent' as string]: theme.accent }}
          >
            <span className="quote-mark">“</span>
            <div className="quote-body">
              <p className="quote-text">{next.text}</p>
              <span className="quote-author">— {next.author}</span>
            </div>
          </div>

          {/* active card, draggable */}
          <div className="quote-card-float">
            <motion.div
              className="quote-card glass"
              style={{
                x,
                y,
                rotate,
                ['--seed' as string]: theme.seed,
                ['--accent' as string]: theme.accent,
              }}
              drag={!isAnimating}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={1}
              onDragStart={() => {
  window.getSelection()?.removeAllRanges();
}}
              onDragEnd={(_, info) => {
                const flungFar = Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 500;
                if (flungFar) {
                  swipe(info.offset.x > 0 ? 1 : -1);
                } else {
                  animate(x, 0, { type: 'spring', stiffness: 420, damping: 32 });
                  animate(y, 0, { type: 'spring', stiffness: 420, damping: 32 });
                }
              }}
              onClick={() => swipe(1)}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span className="quote-grad quote-grad-like" style={{ opacity: likeOpacity }} aria-hidden />
              <motion.span className="quote-grad quote-grad-nope" style={{ opacity: nopeOpacity }} aria-hidden />
              <span className="quote-glow" aria-hidden />

              <span className="quote-mark">“</span>
              <div className="quote-body">
                <p className="quote-text">{current.text}</p>
                <span className="quote-author">— {current.author}</span>
              </div>

              <span className="quote-season-tag">{theme.name}</span>
            </motion.div>
          </div>
        </div>

        <div className="quote-controls">
          <button className="quote-arrow" aria-label="Nope" onClick={() => swipe(-1)}>
            ‹
          </button>
          <button className="quote-shuffle" onClick={() => swipe(1)}>
            shuffle
          </button>
          <button className="quote-arrow" aria-label="Like" onClick={() => swipe(1)}>
            ›
          </button>
        </div>
      </div>

      <p className="quotes-hint">swipe · tap · drag to shuffle a thought</p>
    </section>
  );
}