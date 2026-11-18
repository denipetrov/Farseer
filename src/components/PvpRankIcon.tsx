import { pvpRankIconUrl, type PvpRank } from '@/lib/wow/pvpRank';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface PvpRankIconProps {
  /** From `rankForRating()` (current rating) or `rankOfHistoryEntry()` (a past title) */
  rank: PvpRank | null | undefined;
  /** Accessible label; defaults to the rank name. Pass the title for history ("Duelist: Midnight Season 2") */
  label?: string;
  size?: IconSize;
}

/** A rated PvP rank icon. Renders nothing without a rank. */
export function PvpRankIcon({ rank, label, size }: PvpRankIconProps) {
  const url = rank ? pvpRankIconUrl(rank) : undefined;
  if (!rank || !url) return null;
  return <GameIcon src={url} label={label ?? rank.name} size={size} />;
}
