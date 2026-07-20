import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useStore } from '../store/useStore';

export default function Reveal({
  children,
  delay = 0,
  y = 48,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduced = useStore((s) => s.settings.reducedMotion);
  if (reduced) return <div>{children}</div>;

  // Animate in on mount so content is always visible (scroll-reveal is a bonus,
  // never a blocker). `whileInView` was unreliable with Lenis smooth scroll.
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.98, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
