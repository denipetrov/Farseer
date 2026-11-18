import { css } from 'styled-components';
import { ICON_SIZES } from './iconSizes';
import { factionTrim, palette, type Faction } from './palette';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Everything that changes with the faction: accent (emblem colour) and trim (emblem metal). */
const accentVars = (faction: Faction) => {
  const c = palette[faction];
  const t = palette[factionTrim[faction]];
  return css`
    --color-accent: ${c[500]};
    --color-accent-hover: ${c[400]};
    --color-accent-active: ${c[600]};
    --color-accent-strong: ${c[300]};
    --color-accent-muted: ${c[700]};
    --color-accent-subtle: ${c[900]};
    --color-accent-emblem: ${c[700]};

    /* Frames and outlines: gold for Alliance, silver for Horde */
    --color-trim: ${t[500]};
    --color-trim-strong: ${t[300]};
    --color-trim-muted: ${t[700]};
  `;
};

/**
 * Shared design tokens exposed as CSS custom properties.
 * Accent and trim colours switch with `<html data-faction="horde|alliance">`.
 *
 * Borders: --color-trim* for frames and outlines (panels, icons, controls, focus
 * rings); --color-border* stays neutral for dividers inside content (table rows).
 * Components may define their own local vars that default to these, e.g.
 *   --button-bg: var(--color-accent);
 */
export const tokens = css`
  :root {
    /* Surfaces */
    --color-bg: ${palette.neutral[900]};
    --color-bg-sunken: ${palette.neutral[950]};
    --color-surface: ${palette.neutral[800]};
    --color-surface-raised: ${palette.neutral[700]};
    --color-surface-hover: ${palette.neutral[750]};
    --color-border: ${palette.neutral[600]};
    --color-border-muted: ${palette.neutral[700]};

    /* Text */
    --color-text: ${palette.neutral[100]};
    --color-text-highlight: ${palette.neutral[0]};
    --color-text-muted: ${palette.neutral[300]};
    --color-text-subtle: ${palette.neutral[400]};
    --color-text-on-accent: ${palette.neutral[0]};

    /* Status */
    --color-success: ${palette.status.success};
    --color-warning: ${palette.status.warning};
    --color-danger: ${palette.status.danger};
    --color-info: ${palette.status.info};

    /* Faction colours (always available, regardless of the active faction) */
    --color-horde: ${palette.horde[500]};
    --color-alliance: ${palette.alliance[500]};
    --color-horde-trim: ${palette[factionTrim.horde][700]};
    --color-alliance-trim: ${palette[factionTrim.alliance][700]};

    /* Item quality & class colours: --color-quality-epic, --color-class-death-knight, ... */
    ${Object.entries(palette.quality).map(([k, v]) => `--color-quality-${kebab(k)}: ${v};`)}
    ${Object.entries(palette.class).map(([k, v]) => `--color-class-${kebab(k)}: ${v};`)}

    /* Typography */
    --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    --font-mono: ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, monospace;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-2xl: 2rem;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;

    /* Game icon sizes: --icon-size-sm, -md, -lg (see iconSizes.ts) */
    ${Object.entries(ICON_SIZES).map(([k, v]) => `--icon-size-${k}: ${v}px;`)}

    /* Shape & motion */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --shadow-md: 0 4px 16px rgb(0 0 0 / 0.4);
    --transition-fast: 120ms ease;

    --layout-max-width: 1280px;

    ${accentVars('horde')}
  }

  :root[data-faction='alliance'] {
    ${accentVars('alliance')}
  }
`;
