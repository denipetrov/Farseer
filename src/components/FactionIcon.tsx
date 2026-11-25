import { usePreferences } from '@/preferences/PreferencesProvider';
import {
  factionColorVars,
  factionIconUrl,
  resolveFaction,
  type FactionInput,
} from '@/lib/wow/factions';
import { useI18n } from '@/i18n/useI18n';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface FactionIconProps {
  /** Any API faction shape: "horde", "HORDE", or { type, name } */
  faction: FactionInput;
  size?: IconSize;
}

/**
 * A faction emblem in the user's chosen asset style, framed in that faction's own
 * trim (silver for Horde, gold for Alliance), whatever faction the user picked.
 * Renders nothing for an unknown or neutral faction.
 */
export function FactionIcon({ faction, size }: FactionIconProps) {
  const { preferences } = usePreferences();
  const { t } = useI18n();
  const url = factionIconUrl(faction, { style: preferences.assetStyle });
  if (!url) return null;

  return (
    <GameIcon
      src={url}
      label={t(`faction.${resolveFaction(faction)!.slug}`)}
      size={size}
      borderColor={factionColorVars(faction)!.trim}
    />
  );
}
