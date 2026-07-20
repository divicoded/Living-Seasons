import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getSeason } from '../data/seasons';
import type { SeasonId } from '../store/useStore';

/** Maps the current month (0-11) to its Indian season. */
function seasonForMonth(month: number): SeasonId {
  // Vasant: Mar-Apr, Grishma: May-Jun, Varsha: Jul-Aug,
  // Sharad: Sep-Oct, Hemant: Nov-Dec, Shishir: Jan-Feb
  const map: SeasonId[] = [
    'shishir', 'shishir', // Jan, Feb
    'vasant', 'vasant',   // Mar, Apr
    'grishma', 'grishma', // May, Jun
    'varsha', 'varsha',   // Jul, Aug
    'sharad', 'sharad',   // Sep, Oct
    'hemant', 'hemant',   // Nov, Dec
  ];
  return map[month];
}

/** Syncs the active season's Material You seed palette onto :root. */
export function useSeasonSync() {
  const season = useStore((s) => s.season);
  const dynamic = useStore((s) => s.settings.dynamicColor);

  // Always open on the current month's season.
  useEffect(() => {
    useStore.getState().setSeason(seasonForMonth(new Date().getMonth()));
  }, []);

  useEffect(() => {
    const theme = getSeason(season);
    const root = document.documentElement;
    if (dynamic) {
      root.style.setProperty('--seed', theme.seed);
      root.style.setProperty('--accent', theme.accent);
      root.style.setProperty('--light', theme.light);
    }
    document.body.dataset.season = season;
  }, [season, dynamic]);
}
