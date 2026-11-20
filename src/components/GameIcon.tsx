import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { ICON_SIZES, type IconSize } from '@/styles/iconSizes';

interface GameIconProps {
  src: string;
  /** Accessible name; also the hover title */
  label: string;
  size?: IconSize;
  /** Border colour, e.g. a class colour var; defaults to --color-trim-muted. Square only. */
  borderColor?: string;
  /**
   * `square` (default): the shared box, with background and a CSS border.
   * `round`: for art that is round and carries its own frame (classes, hero talents,
   * races): a circle with no box border or background, so only the art's frame shows.
   */
  shape?: 'square' | 'round';
}

/**
 * The shared box for every game icon family (races, classes, specs): same sizes,
 * shape and border, so icons from different families and styles line up.
 * Round, self-framed art uses `shape="round"`.
 */
export function GameIcon({
  src,
  label,
  size = 'sm',
  borderColor,
  shape = 'square',
}: GameIconProps) {
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
      $round={shape === 'round'}
      style={
        {
          '--game-icon-size': `var(--icon-size-${size})`,
          ...(borderColor && { '--game-icon-border': borderColor }),
        } as CSSProperties
      }
    />
  );
}

const Img = styled.img<{ $round: boolean }>`
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
  border: 1px solid var(--game-icon-border, var(--color-trim-muted));

  ${({ $round }) =>
    $round &&
    `
    /* The art is round and framed already: no box, no CSS border */
    border: none;
    border-radius: 50%;
    background: none;
  `}
`;
