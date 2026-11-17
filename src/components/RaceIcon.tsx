import styled from 'styled-components';
import { usePreferences } from '@/preferences/PreferencesProvider';
import {
  raceIconUrl,
  resolveGender,
  resolveRace,
  type GenderInput,
  type RaceInput,
} from '@/lib/wow/races';

interface RaceIconProps {
  /** Any API race shape: id, name, or { id, name } */
  race: RaceInput;
  /** Any API gender shape; Mythic+ data has none */
  gender?: GenderInput;
  /** px */
  size?: number;
}

/** A race/gender portrait in the user's chosen asset style. Renders nothing for an unknown race. */
export function RaceIcon({ race, gender, size = 24 }: RaceIconProps) {
  const { preferences } = usePreferences();
  const url = raceIconUrl(race, gender, { style: preferences.assetStyle });
  if (!url) return null;

  const r = resolveRace(race)!;
  const g = resolveGender(gender);
  const label = g ? `${r.name}, ${g}` : r.name;

  return <Img src={url} alt={label} title={label} width={size} height={size} loading="lazy" />;
}

const Img = styled.img`
  --race-icon-radius: var(--radius-sm);
  --race-icon-border: var(--color-border);

  display: inline-block;
  vertical-align: middle;
  object-fit: cover;
  border-radius: var(--race-icon-radius);
  border: 1px solid var(--race-icon-border);
`;
