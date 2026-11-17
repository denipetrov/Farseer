/**
 * Raw colour palette — the single source of hex values.
 * Components should NOT import this directly; use the CSS variables
 * defined in `tokens.ts` (e.g. `var(--color-text)`) instead.
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
  horde: {
    300: '#ff8f87',
    400: '#f2554c',
    500: '#d93a32',
    600: '#b3241d',
    700: '#7d1712',
    900: '#2a0b09',
  },
  alliance: {
    300: '#8cb8ff',
    400: '#4d90fe',
    500: '#2f72e8',
    600: '#1f56bd',
    700: '#163c82',
    900: '#0a1a33',
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
} as const;

export type Faction = 'horde' | 'alliance';
