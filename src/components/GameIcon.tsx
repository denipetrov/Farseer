import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { ICON_SIZES, type IconSize } from '@/styles/iconSizes';

interface GameIconProps {
  src: string;
  /** Accessible name; also the hover title */
  label: string;
  size?: IconSize;
  /** Border colour, e.g. a class colour var; defaults to --color-border */
  borderColor?: string;
}

/**
 * The shared box for every game icon family (races, classes, specs): same sizes,
 * shape and border, so icons from different families and styles line up.
 */
export function GameIcon({ src, label, size = 'sm', borderColor }: GameIconProps) {
  const px = ICON_SIZES[size];
  return (
    <Img
      src={src}
      alt={label}
      title={label}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      style={
        {
          '--game-icon-size': `var(--icon-size-${size})`,
          ...(borderColor && { '--game-icon-border': borderColor }),
        } as CSSProperties
      }
    />
  );
}

const Img = styled.img`
  --game-icon-radius: var(--radius-sm);

  display: inline-block;
  flex: none;
  vertical-align: middle;
  width: var(--game-icon-size);
  height: var(--game-icon-size);
  /* Square box for every source; non-square art is letterboxed, never cropped */
  object-fit: contain;
  background: var(--color-bg-sunken);
  border-radius: var(--game-icon-radius);
  border: 1px solid var(--game-icon-border, var(--color-border));
`;
