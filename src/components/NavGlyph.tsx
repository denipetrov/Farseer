import styled from 'styled-components';
import { iconUrl } from '@/lib/assets';
import { opticalScale } from '@/lib/iconOptics';
import { inlineSvg } from '@/lib/inlineIcons';

/**
 * A single-colour icon (an SVG drawn in `currentColor`, e.g. `nav/home` or
 * `pvp/brackets/svg/2v2`), as a mask in the surrounding text colour, so it follows hover,
 * active and accent states. `icon` is its path under `icons/`, without extension.
 * Multi-colour icons (`src/lib/inlineIcons.ts`) are drawn inline instead.
 *
 * The `url("…")` value is built in TypeScript: Vite inlines small SVGs as data: URLs with
 * single quotes, and Prettier rewrites quotes inside styled-components CSS.
 */
export function NavGlyph({ icon, size = 22 }: { icon: string; size?: number }) {
  // Narrow shapes are drawn larger so every icon looks the same size (iconOptics.ts)
  const scale = opticalScale(icon);
  const box = { width: size, height: size, ...(scale !== 1 && { transform: `scale(${scale})` }) };

  const svg = inlineSvg(icon);
  if (svg) {
    // Our own files, bundled at build time: safe to insert as markup
    return <Inline aria-hidden style={box} dangerouslySetInnerHTML={{ __html: svg }} />;
  }

  const url = iconUrl(icon);
  if (!url) return null;
  return (
    <Glyph
      aria-hidden
      style={{ ...box, maskImage: `url("${url}")`, WebkitMaskImage: `url("${url}")` }}
    />
  );
}

const Glyph = styled.span`
  display: inline-block;
  flex: none;
  background: currentColor;
  mask-position: center;
  mask-size: contain;
  mask-repeat: no-repeat;
`;

const Inline = styled.span`
  display: inline-block;
  flex: none;

  > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;
