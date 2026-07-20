import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { useSeasonSync } from './hooks/useSeasonSync';
import Background from './components/background/Background';
import SeasonParticles2D from './components/background/SeasonParticles2D';
import Hero from './components/Hero';
import SeasonVerse from './components/SeasonVerse';
import SeasonCarousel from './components/SeasonCarousel';
import TimeSection from './components/TimeSection';
import Quotes from './components/Quotes';
import ProfileCard from './components/ProfileCard';
import GifStrip from './components/GifStrip';
import SettingsSheet from './components/SettingsSheet';
import EasterEgg from './components/EasterEgg';
import LoadingScreen from './components/LoadingScreen';
import ScrollProgress from './components/ScrollProgress';
import Reveal from './components/Reveal';
import './styles/global.css';

const SeasonScene = lazy(() => import('./components/scene/SeasonScene'));

export default function App() {
  const [loaded, setLoaded] = useState(false);
  useSeasonSync();
  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <LoadingScreen onDone={handleLoaded} />}
      <Background />
      <SeasonParticles2D />
      <Suspense fallback={null}>
        <SeasonScene />
      </Suspense>
      <ScrollProgress />

      <main className="app-main">
        <Hero />
        <Reveal><SeasonVerse /></Reveal>
        <Reveal><SeasonCarousel /></Reveal>
        <Reveal><TimeSection /></Reveal>
        <Reveal><Quotes /></Reveal>
        <Reveal><ProfileCard /></Reveal>
        <Reveal><GifStrip /></Reveal>
      </main>

      <SettingsSheet />
      <EasterEgg />
    </>
  );
}
