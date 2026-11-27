/**
 * Raw colour palette — the single source of hex values.
 * Components should NOT import this directly; use the CSS variables
 * defined in `tokens.css` (e.g. `var(--color-text)`) instead.
 */
export const palette = {
  neutral: {
    950: '#07090d',
    900: '#0d1117', // app background
    850: '#11161d',
    800: '#161b22', // surfaces
    750: '#1c232c',
    700: '#21262d', // raised surfaces / hover
    600: '#30363d', // borders
    500: '#484f58',
    400: '#6e7681',
    300: '#8b949e', // muted text
    200: '#b1bac4',
    100: '#e6edf3', // primary text
    0: '#ffffff', // highlight text
  },
  /*
   * Faction colours, sampled from the faction emblems (src/assets/icons/factions).
   * 700 is the emblem colour itself; the other steps keep its hue and change
   * lightness only, so lighter accents stay readable on the dark background.
   */
  horde: {
    300: '#f87777', // text/links on dark (7.1:1)
    400: '#f42525',
    500: '#cc0000', // accent: 3.2:1 on bg, white text on it 5.9:1
    600: '#ad0000',
    700: '#930000', // emblem red
    900: '#290000',
  },
  alliance: {
    300: '#77b5f8', // text/links on dark (8.8:1)
    400: '#2589f4',
    500: '#0062cc', // accent: 3.3:1 on bg, white text on it 5.8:1
    600: '#004fa3',
    700: '#002853', // emblem blue
    900: '#001429',
  },
  /* Emblem trims: Alliance frames in gold, Horde in silver (see `factionTrim`) */
  gold: {
    300: '#e6bf4a',
    400: '#d19f0b', // emblem highlight
    500: '#b67b11', // emblem gold
    600: '#a9610e', // emblem shadow
    700: '#6b4a10',
    900: '#2a1d07',
  },
  silver: {
    300: '#d6d1ce',
    400: '#b0aaa7', // emblem highlight
    500: '#8f8986',
    600: '#746e6c', // emblem silver
    700: '#4d4947',
    900: '#1f1d1d',
  },
  status: {
    success: '#3fb950',
    warning: '#d29922',
    danger: '#f85149',
    info: '#58a6ff',
  },
  /** In-game item quality colours */
  quality: {
    poor: '#9d9d9d',
    common: '#ffffff',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000',
    artifact: '#e6cc80',
    heirloom: '#00ccff',
  },
  /** In-game tooltip colours: a spell's description is gold (Wowhead's `.q`) */
  tooltip: {
    description: '#ffd100',
  },
  /** In-game class colours */
  class: {
    deathKnight: '#c41e3a',
    demonHunter: '#a330c9',
    druid: '#ff7c0a',
    evoker: '#33937f',
    hunter: '#aad372',
    mage: '#3fc7eb',
    monk: '#00ff98',
    paladin: '#f48cba',
    priest: '#ffffff',
    rogue: '#fff468',
    shaman: '#0070dd',
    warlock: '#8788ee',
    warrior: '#c69b6d',
  },
  /**
   * Rated PvP ranks (pvpRank.ts): each rankedpvp icon's main tone, lightened to read on the
   * panels (contrast 5.8–11 : 1 on the surface), picked 2026-11-26.
   */
  rank: {
    unranked: '#b8927f',
    combatant: '#c3c8d0',
    challenger: '#e2b85b',
    rival: '#a9cdef',
    duelist: '#4cb0f0',
    elite: '#b47cf2',
    gladiator: '#ffc53d',
    rankOne: '#ff8a24',
  },
  /** Ladder roles, as in the user's Rank One example (2026-11-27): the role split's bars */
  role: {
    melee: '#f0524f',
    ranged: '#58a6ff',
    healer: '#3fb950',
    tank: '#d07cf2',
  },
} as const;

export type Faction = 'horde' | 'alliance';

/** The metal each faction's emblem is framed in: used for borders and outlines. */
export const factionTrim = { alliance: 'gold', horde: 'silver' } as const satisfies Record<
  Faction,
  'gold' | 'silver'
>;
