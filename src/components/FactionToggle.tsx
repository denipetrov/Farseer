import { FACTIONS, factionIconUrl } from '@/lib/wow/factions';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { IconToggle } from './header/IconToggle';

/**
 * Horde / Alliance switch, shown as the faction emblems in the chosen icon style.
 * The choice sets the site's accent and trim colours.
 */
export function FactionToggle() {
  const { preferences, setPreference } = usePreferences();
  const { t } = useI18n();
  const options = FACTIONS.map((f) => ({
    value: f.slug,
    label: t(`faction.${f.slug}`),
    icon: factionIconUrl(f.slug, { style: preferences.assetStyle }),
    // The chosen emblem is marked by a bar in its own faction colour; the art is never filtered
    underline: `var(--color-${f.slug})`,
  }));

  return (
    <IconToggle
      label={t('header.faction')}
      value={preferences.faction}
      options={options}
      onChange={(faction) => setPreference('faction', faction)}
      // The same size as the PvP / PvE and icon style switches
      size="lg"
    />
  );
}
