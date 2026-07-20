import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SeasonId = 'vasant' | 'grishma' | 'varsha' | 'sharad' | 'hemant' | 'shishir';

export interface Settings {
  particles: boolean;
  sound: boolean;
  haptics: boolean;
  status: string;
  motion: boolean;
  blur: boolean;
  perfMode: boolean;
  dynamicColor: boolean;
  reducedMotion: boolean;
}

interface AppState {
  season: SeasonId;
  name: string;
  photo: string | null;
  tagline: string;
  settings: Settings;
  setSeason: (s: SeasonId) => void;
  setName: (n: string) => void;
  setPhoto: (p: string | null) => void;
  setTagline: (t: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  particles: true,
  sound: false,
  haptics: true,
  status: 'Building in the open',
  motion: true,
  blur: true,
  perfMode: false,
  dynamicColor: true,
  reducedMotion: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      season: 'vasant',
      name: 'DIV',
      photo: 'https://avatars.githubusercontent.com/u/217160893?v=4',
      tagline: 'Wanderer of the seasons',
      settings: defaultSettings,
      setSeason: (season) => set({ season }),
      setName: (name) => set({ name }),
      setPhoto: (photo) => set({ photo }),
      setTagline: (tagline) => set({ tagline }),
      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    {
      name: 'living-seasons',
      version: 2,
      migrate: (persisted: any) => {
        // Reset identity to the new GitHub defaults; keep other settings.
        return {
          ...persisted,
          name: 'DIV',
          photo: 'https://avatars.githubusercontent.com/u/217160893?v=4',
          tagline: 'Wanderer of the seasons',
        };
      },
      partialize: (state) => ({
        season: state.season,
        name: state.name,
        photo: state.photo,
        tagline: state.tagline,
        settings: state.settings,
      }),
    }
  )
);
