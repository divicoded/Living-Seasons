import type { ReactNode } from 'react';

/**
 * Splits text into per-word spans that rise + fade in with a stagger.
 * Renders a span; place it inside the desired heading/element.
 */
export default function TextReveal({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(' ');
  return (
    <span className={`text-reveal ${className}`}>
      {words.map((w, i) => (
        <span className="word" style={{ ['--i' as string]: i }} key={i}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
