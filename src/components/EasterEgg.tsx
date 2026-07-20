import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './easteregg.css';

const BASE = import.meta.env.BASE_URL;

/**
 * A small floating memento that links back to the original Yokoso 2.0
 * prototype (the plain HTML/CSS/JS build this app grew out of).
 */
export default function EasterEgg() {
  const [open, setOpen] = useState(false);

  return (
    <div className="egg">
      <motion.button
        className="egg-fab"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Where it all began"
        title="Where it all began"
      >
        <span className="egg-dot" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.a
            className="egg-pop"
            href={BASE + 'prototype/index.html'}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <span className="egg-pop-kicker">memory</span>
            <span className="egg-pop-title">Yokoso 2.0 - the original</span>
            <span className="egg-pop-sub">the HTML/CSS/JS prototype this app grew from →</span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
