import { usePreferences } from '@/preferences/PreferencesProvider';
import {
  raceIconUrl,
  resolveGender,
  resolveRace,
  type GenderInput,
  type RaceInput,
} from '@/lib/wow/races';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface RaceIconProps {
  /** Any API race shape: id, name, or { id, name } */
  race: RaceInput;
  /** Any API gender shape; Mythic+ data has none */
  gender?: GenderInput;
  size?: IconSize;
}

/** A race/gender portrait in the user's chosen asset style. Renders nothing for an unknown race. */
export function RaceIcon({ race, gender, size }: RaceIconProps) {
  const { preferences } = usePreferences();
  const url = raceIconUrl(race, gender, { style: preferences.assetStyle });
  if (!url) return null;

  const r = resolveRace(race)!;
  const g = resolveGender(gender);
  return <GameIcon src={url} label={g ? `${r.name}, ${g}` : r.name} size={size} />;
}
