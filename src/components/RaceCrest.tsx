import { resolveFaction, type FactionInput } from '@/lib/wow/factions';
import { raceCrestUrl, resolveRace, type RaceInput } from '@/lib/wow/races';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface RaceCrestProps {
  /** Any API race shape: id, name, or { id, name } */
  race: RaceInput;
  /** The character's faction; picks the trim, and the crest for two-faction races */
  faction?: FactionInput;
  size?: IconSize;
}

/**
 * A race's crest (one look, no modern/classic), framed in the faction's own trim
 * when the faction is known. Renders nothing for an unknown race.
 */
export function RaceCrest({ race, faction, size }: RaceCrestProps) {
  const url = raceCrestUrl(race, faction);
  if (!url) return null;

  const r = resolveRace(race)!;
  return (
    <GameIcon
      src={url}
      label={`${r.name} crest`}
      size={size}
      frame={resolveFaction(r.faction ?? faction)?.slug}
    />
  );
}
