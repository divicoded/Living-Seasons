import type { SeasonId } from '../store/useStore';

// Vite injects the configured base (e.g. '/Living-Seasons/') so asset paths
// resolve correctly on GitHub Pages project sites served from a subpath.
const BASE = import.meta.env.BASE_URL;

export interface SeasonTheme {
  id: SeasonId;
  name: string;
  hindi: string;
  icon: string;
  /** Material You seed color used to derive the whole palette */
  seed: string;
  /** Secondary accent */
  accent: string;
  /** Mood descriptor */
  mood: string;
  weather: string;
  description: string;
  /** Particle kind for the 3D scene */
  particle: 'petal' | 'spark' | 'rain' | 'leaf' | 'snow' | 'frost';
  /** Background gradient stops */
  gradient: [string, string, string];
  /** Ambient light color for the 3D scene */
  light: string;
}

export const SEASONS: SeasonTheme[] = [
  {
    id: 'vasant',
    name: 'Vasant',
    hindi: 'वसंत',
    icon: BASE + 'assets/Icons/vasant.png',
    seed: '#ff7eb6',
    accent: '#ffd166',
    mood: 'Blooming',
    weather: 'Mild & floral',
    description: 'Spring awakens the world in soft pinks and the scent of new blossoms.',
    particle: 'petal',
    gradient: ['#2a1530', '#5a1f4d', '#1a0f2e'],
    light: '#ff9ec7',
  },
  {
    id: 'grishma',
    name: 'Grishma',
    hindi: 'ग्रीष्म',
    icon: BASE + 'assets/Icons/grishma.png',
    seed: '#ff8a3d',
    accent: '#ffd23f',
    mood: 'Radiant',
    weather: 'Hot & bright',
    description: 'Summer blazes with golden light and the hum of a restless sun.',
    particle: 'spark',
    gradient: ['#3a1c0a', '#7a3a0c', '#1f0f06'],
    light: '#ffb15c',
  },
  {
    id: 'varsha',
    name: 'Varsha',
    hindi: 'वर्षा',
    icon: BASE + 'assets/Icons/varsha.png',
    seed: '#4cc9f0',
    accent: '#80ffea',
    mood: 'Monsoon',
    weather: 'Rain & thunder',
    description: 'The monsoon pours life into the earth with silver sheets of rain.',
    particle: 'rain',
    gradient: ['#0a1f2a', '#0c3a4a', '#06121a'],
    light: '#7fd8ff',
  },
  {
    id: 'sharad',
    name: 'Sharad',
    hindi: 'शरद',
    icon: BASE + 'assets/Icons/sharad.png',
    seed: '#c77dff',
    accent: '#ffc6ff',
    mood: 'Crisp',
    weather: 'Clear & cool',
    description: 'Autumn glows with amber harvest moons and a sky washed clean.',
    particle: 'leaf',
    gradient: ['#2a1530', '#4a2a5a', '#160a1f'],
    light: '#d9a3ff',
  },
  {
    id: 'hemant',
    name: 'Hemant',
    hindi: 'हेमंत',
    icon: BASE + 'assets/Icons/hemant.png',
    seed: '#90e0ef',
    accent: '#caf0f8',
    mood: 'Still',
    weather: 'Cool & calm',
    description: 'Late autumn settles into a quiet hush beneath a pale, low sun.',
    particle: 'frost',
    gradient: ['#0a1a2a', '#16384a', '#06101a'],
    light: '#a8e6ff',
  },
  {
    id: 'shishir',
    name: 'Shishir',
    hindi: 'शिशिर',
    icon: BASE + 'assets/Icons/shishir.png',
    seed: '#cfe8ff',
    accent: '#e0f7ff',
    mood: 'Frozen',
    weather: 'Cold & still',
    description: 'Winter wraps the world in frost and the silence of falling snow.',
    particle: 'snow',
    gradient: ['#101a2a', '#243a5a', '#0a0f1a'],
    light: '#d6ecff',
  },
];

export const getSeason = (id: SeasonId): SeasonTheme =>
  SEASONS.find((s) => s.id === id) ?? SEASONS[0];
