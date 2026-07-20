import { useCallback } from 'react';
import { useStore } from '../store/useStore';

/**
 * Shared haptics + sound feedback.
 * Haptics respect the `haptics` setting; sound respects the `sound` setting
 * and only plays after a user gesture (browser autoplay policy).
 */

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

type Tone = 'tap' | 'soft' | 'open' | 'close' | 'select';

const TONES: Record<Tone, { freq: number; type: OscillatorType; dur: number; gain: number }> = {
  tap: { freq: 520, type: 'sine', dur: 0.05, gain: 0.04 },
  soft: { freq: 360, type: 'sine', dur: 0.08, gain: 0.03 },
  open: { freq: 440, type: 'triangle', dur: 0.18, gain: 0.05 },
  close: { freq: 300, type: 'triangle', dur: 0.16, gain: 0.045 },
  select: { freq: 660, type: 'sine', dur: 0.07, gain: 0.05 },
};

export function useFeedback() {
  const haptics = useStore((s) => s.settings.haptics);
  const sound = useStore((s) => s.settings.sound);

  const buzz = useCallback(
    (pattern: number | number[] = 8) => {
      if (!haptics) return;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch {
          /* ignore */
        }
      }
    },
    [haptics]
  );

  const play = useCallback(
    (tone: Tone = 'tap') => {
      if (!sound) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const t = TONES[tone];
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = t.type;
        osc.frequency.setValueAtTime(t.freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(t.freq * 1.5, ctx.currentTime + t.dur);
        gain.gain.setValueAtTime(t.gain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + t.dur + 0.02);
      } catch {
        /* ignore */
      }
    },
    [sound]
  );

  /** Fire both haptic + sound together for a UI event. */
  const feedback = useCallback(
    (tone: Tone = 'tap', pattern: number | number[] = 8) => {
      buzz(pattern);
      play(tone);
    },
    [buzz, play]
  );

  return { buzz, play, feedback };
}
