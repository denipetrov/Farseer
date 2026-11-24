import { useState } from 'react';
import { factionIconUrl, type FactionInput } from '@/lib/wow/factions';
import { realmLabel, regionName } from '@/lib/wow/regions';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { IconSize } from '@/styles/iconSizes';
import { FactionIcon } from './FactionIcon';
import { GameIcon } from './GameIcon';
import { End, First, Icons, Name, Row, Second, Text } from './lineParts';
import { UnknownIcon } from './UnknownIcon';

export interface GuildLineProps {
  name: string;
  /** Display name, or the slug when the data has no name */
  realm: string;
  /** API region code: `us`, `eu`, `kr`, `tw`, `cn` */
  region: string;
  /** The guild's logo URL from the data (Raider.io's CDN) */
  logo?: string | null;
  /**
   * The guild's faction, from sources that carry one (search suggestions, PvE raid and
   * boss boards). `null` shows `unknown.png`; leave it out (`undefined`) when the source
   * has no faction field, and the faction slot is not shown.
   */
  faction?: FactionInput;
  size?: IconSize;
}

/**
 * How a guild is shown everywhere, in the same shape as `CharacterLine`:
 *
 *   [logo]  Guild name          [faction]
 *           Realm · Region
 *
 * The logo is the URL the data gives; with none, or one that fails to load, it is
 * `info/unknown.png`. The faction slot is shown only when the source carries a faction.
 */
export function GuildLine({ name, realm, region, logo, faction, size = 'sm' }: GuildLineProps) {
  const { assetStyle: style } = usePreferences().preferences;
  const [failed, setFailed] = useState<string | null>(null);
  const showLogo = !!logo && failed !== logo;

  return (
    <Row>
      <Icons>
        {showLogo ? (
          <GameIcon src={logo} label={`${name} logo`} size={size} onError={() => setFailed(logo)} />
        ) : (
          <UnknownIcon label="Unknown guild logo" size={size} />
        )}
      </Icons>
      <Text>
        <First>
          <Name>{name}</Name>
        </First>
        <Second>
          {realmLabel(realm)} · {regionName(region)}
        </Second>
      </Text>
      {faction !== undefined && (
        <End>
          {factionIconUrl(faction, { style }) ? (
            <FactionIcon faction={faction} size={size} />
          ) : (
            <UnknownIcon label="Unknown faction" size={size} />
          )}
        </End>
      )}
    </Row>
  );
}
