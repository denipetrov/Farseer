import { classColorKey, classIconUrl, type ClassInput } from '@/lib/wow/classes';
import { factionIconUrl, type FactionInput } from '@/lib/wow/factions';
import { heroTreeIconUrl, type HeroTreeInput } from '@/lib/wow/heroTalents';
import { raceIconUrl, type GenderInput, type RaceInput } from '@/lib/wow/races';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { realmLabel } from '@/lib/wow/regions';
import { specIconUrl, type SpecInput } from '@/lib/wow/specs';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { IconSize } from '@/styles/iconSizes';
import { ClassIcon } from './ClassIcon';
import { FactionIcon } from './FactionIcon';
import { HeroTalentIcon } from './HeroTalentIcon';
import { RaceIcon } from './RaceIcon';
import { SpecIcon } from './SpecIcon';
import styles from './lineParts.module.css';
import { UnknownIcon } from './UnknownIcon';

export interface CharacterLineProps {
  name: string;
  /** Shown as `<span className={styles.guild}>` after the name, when the data has one */
  guild?: string | null;
  /** Display name, or the slug when the data has no name ("burning-legion" → "Burning Legion") */
  realm: string;
  /** API region code: `us`, `eu`, `kr`, `tw`, `cn` */
  region: string;
  faction?: FactionInput;
  race?: RaceInput;
  /** Absent on Mythic+ data and search suggestions: the portrait falls back to male */
  gender?: GenderInput;
  /** Prefer the id (`classId`) */
  cls?: ClassInput;
  /** Prefer the id (`specId`); a name needs `cls` */
  spec?: SpecInput;
  /** Prefer the id (`heroTalentId`); null on Mythic+ characters */
  heroTalent?: HeroTreeInput;
  /**
   * Whether the hero talent slot is shown. PvE characters leave it out: the API never
   * gives their hero talent, and it isn't needed there.
   */
  showHeroTalent?: boolean;
  size?: IconSize;
}

/**
 * How a character is shown everywhere (search, boards, rosters):
 *
 *   [race] [class] [spec] [hero talent]  Name <span className={styles.guild}>          [faction]
 *                                        Realm · Region
 *
 * PvE leaves out the hero talent slot (`showHeroTalent={false}`).
 *
 * Every slot is always filled: an icon the data doesn't give (an unenriched PvP character
 * has no race, class or spec), or a value with no file, shows
 * `info/unknown.png`. So rows keep one shape and names line up in lists. The faction sits
 * at the far right of the row. The name is in the class colour.
 */
export function CharacterLine({
  name,
  guild,
  realm,
  region,
  faction,
  race,
  gender,
  cls,
  spec,
  heroTalent,
  showHeroTalent = true,
  size = 'sm',
}: CharacterLineProps) {
  const { assetStyle: style } = usePreferences().preferences;
  const { t } = useI18n();
  const unknown = (key: MessageKey) => <UnknownIcon label={t(key)} size={size} />;

  return (
    <span className={styles.row}>
      <span className={styles.icons}>
        {raceIconUrl(race, gender, { style, faction }) ? (
          <RaceIcon race={race} gender={gender} faction={faction} size={size} />
        ) : (
          unknown('unknown.race')
        )}
        {classIconUrl(cls, { style }) ? (
          <ClassIcon cls={cls} size={size} />
        ) : (
          unknown('unknown.class')
        )}
        {specIconUrl(spec, cls) ? (
          <SpecIcon spec={spec} cls={cls} size={size} />
        ) : (
          unknown('unknown.spec')
        )}
        {!showHeroTalent ? null : heroTreeIconUrl(heroTalent) ? (
          <HeroTalentIcon tree={heroTalent} size={size} />
        ) : (
          unknown('unknown.heroTalent')
        )}
      </span>
      <span className={styles.text}>
        <span className={styles.first}>
          <span className={styles.name} data-class-color={classColorKey(cls)}>
            {name}
          </span>
          {guild && <span className={styles.guild}>&lt;{guild}&gt;</span>}
        </span>
        <span className={styles.second}>
          {realmLabel(realm)} · {regionLabel(t, region)}
        </span>
      </span>
      <span className={styles.end}>
        {factionIconUrl(faction, { style }) ? (
          <FactionIcon faction={faction} size={size} />
        ) : (
          unknown('unknown.faction')
        )}
      </span>
    </span>
  );
}
