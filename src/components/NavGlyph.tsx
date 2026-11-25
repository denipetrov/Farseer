import styled from 'styled-components';
import { iconUrl } from '@/lib/assets';
import { opticalScale } from '@/lib/iconOptics';

/**
 * A single-colour icon (an SVG drawn in `currentColor`, e.g. `nav/home` or
 * `pvp/brackets/svg/2v2`), as a mask in the surrounding text colour, so it follows hover,
 * active and accent states. `icon` is its path under `icons/`, without extension.
 *
 * The `url("…")` value is built in TypeScript: Vite inlines small SVGs as data: URLs with
 * single quotes, and Prettier rewrites quotes inside styled-components CSS.
 */
export function NavGlyph({ icon, size = 22 }: { icon: string; size?: number }) {
  const url = iconUrl(icon);
  if (!url) return null;
  // Narrow shapes are drawn larger so every icon looks the same size (iconOptics.ts)
  const scale = opticalScale(icon);
  return (
    <Glyph
      aria-hidden
      style={{
        width: size,
        height: size,
        maskImage: `url("${url}")`,
        WebkitMaskImage: `url("${url}")`,
        ...(scale !== 1 && { transform: `scale(${scale})` }),
      }}
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
