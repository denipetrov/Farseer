import type { CSSProperties } from 'react';
import { iconUrl } from '@/lib/assets';
import { cx } from '@/lib/cx';
import { inlineSvg } from '@/lib/inlineIcons';
import styles from './NavGlyph.module.css';

/** sm 22px (deep menu rows), md 26px (the menu), lg 32px (page headings) */
export type GlyphSize = 'sm' | 'md' | 'lg';

/**
 * A single-colour icon (an SVG drawn in `currentColor`, e.g. `nav/home` or
 * `pvp/brackets/svg/2v2`), as a mask in the surrounding text colour, so it follows hover,
 * active and accent states. `icon` is its path under `icons/`, without extension.
 * Multi-colour icons (`src/lib/inlineIcons.ts`) are drawn inline instead.
 *
 * Narrow shapes are drawn larger so every icon looks the same size: `data-optical` picks its
 * factor in iconOptics.css. The file's URL is the one value set from here (`--glyph-url`):
 * Vite hashes asset names at build time, so CSS can't name the file.
 */
export function NavGlyph({ icon, size = 'sm' }: { icon: string; size?: GlyphSize }) {
  const svg = inlineSvg(icon);
  if (svg) {
    return (
      <span
        aria-hidden
        className={cx(styles.glyph, styles[size], styles.inline)}
        data-optical={icon}
        // Our own files, bundled at build time: safe to insert as markup
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  const url = iconUrl(icon);
  if (!url) return null;
  return (
    <span
      aria-hidden
      className={cx(styles.glyph, styles[size], styles.mask)}
      data-optical={icon}
      style={{ '--glyph-url': `url("${url}")` } as CSSProperties}
    />
  );
}
