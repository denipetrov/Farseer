import { usePreferences } from '@/preferences/PreferencesProvider';
import type { FactionInput } from '@/lib/wow/factions';
import {
  raceIconUrl,
  resolveGender,
  resolveRace,
  type GenderInput,
  type RaceInput,
} from '@/lib/wow/races';
import { useI18n } from '@/i18n/useI18n';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface RaceIconProps {
  /** Any API race shape: id, name, or { id, name } */
  race: RaceInput;
  /** Any API gender shape; Mythic+ data has none */
  gender?: GenderInput;
  /** The character's faction: picks the faction-framed portrait of a race both factions play */
  faction?: FactionInput;
  size?: IconSize;
}

/** A round race/gender portrait in the user's chosen asset style, framed in faction colours. Renders nothing for an unknown race. */
export function RaceIcon({ race, gender, faction, size }: RaceIconProps) {
  const { preferences } = usePreferences();
  const { t, name } = useI18n();
  const url = raceIconUrl(race, gender, { style: preferences.assetStyle, faction });
  if (!url) return null;

  const r = resolveRace(race)!;
  const g = resolveGender(gender);
  // The data's own race id names the variant (Pandaren 25/26); our first id is the fallback
  const raceName = name('races', raceIdOf(race) ?? r.ids[0], r.name);
  const label = g ? t('race.label', { race: raceName, gender: t(`gender.${g}`) }) : raceName;
  return <GameIcon src={url} label={label} size={size} shape="round" />;
}

/** The Blizzard race id in an API race value, if it carries one. */
function raceIdOf(race: RaceInput): number | null {
  if (typeof race === 'number') return race;
  if (typeof race === 'object' && race?.id != null) return race.id;
  return null;
}
