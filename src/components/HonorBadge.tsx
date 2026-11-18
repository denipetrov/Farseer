import { honorBadgeUrl, honorLevel, type HonorInput } from '@/lib/wow/honor';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface HonorBadgeProps {
  /** The character's `honor` object, or the level itself */
  honor: HonorInput;
  size?: IconSize;
}

/** The PvP badge for a character's honor level. Renders nothing below the first threshold. */
export function HonorBadge({ honor, size }: HonorBadgeProps) {
  const url = honorBadgeUrl(honor);
  if (!url) return null;

  return <GameIcon src={url} label={`Honor level ${honorLevel(honor)}`} size={size} />;
}
