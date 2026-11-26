import type { IconSize } from '@/styles/iconSizes';
import type { Faction } from '@/styles/palette';
import { ICON_SIZES } from '@/styles/iconSizes';
import { cx } from '@/lib/cx';
import styles from './GameIcon.module.css';

interface GameIconProps {
  src: string;
  /** Accessible name; also the hover title */
  label: string;
  size?: IconSize;
  /** Frames a square icon in this faction's trim (Alliance gold, Horde silver) */
  frame?: Faction;
  /**
   * `square` (default): the shared box, with background and a CSS border.
   * `round`: for art that is round and carries its own frame (classes, hero talents,
   * races): a circle with no box border or background, so only the art's frame shows.
   */
  shape?: 'square' | 'round';
  /**
   * The art is padded inside its file (modern class icons: a 63 px circle in an 88 px
   * canvas): it is scaled so it fills the box like every other icon, untouched.
   */
  padded?: boolean;
  /** The image failed to load (an external URL from the data): show a fallback instead */
  onError?: () => void;
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
  frame,
  shape = 'square',
  padded = false,
  onError,
}: GameIconProps) {
  const px = ICON_SIZES[size];
  return (
    <img
      className={cx(
        styles.icon,
        styles[size],
        shape === 'round' && styles.round,
        padded && styles.padded,
      )}
      data-frame={frame}
      src={src}
      alt={label}
      title={label}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      onError={onError}
    />
  );
}
