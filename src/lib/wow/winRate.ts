/**
 * The win rate's colour band (the user's rule, 2026-11-26): `low` (red) below 50%, `even`
 * (grey) from 50% to 55%, `high` (green) above 55%. On the exact rate: 49.6%, shown as 50%,
 * is still low.
 */
export const winRateTier = (ratio: number): 'low' | 'even' | 'high' =>
  ratio < 0.5 ? 'low' : ratio > 0.55 ? 'high' : 'even';
