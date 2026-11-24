import { iconUrl } from '@/lib/assets';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

const UNKNOWN = iconUrl('info/unknown');

/**
 * `info/unknown.png` (the red question mark in the round DPS frame): stands in for an icon
 * the data doesn't give, or whose value has no file, so a row keeps its shape.
 */
export function UnknownIcon({ label, size }: { label: string; size?: IconSize }) {
  if (!UNKNOWN) return null;
  return <GameIcon src={UNKNOWN} label={label} size={size} shape="round" />;
}
