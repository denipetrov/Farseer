import { ASSET_STYLES, iconUrl } from '@/lib/assets';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { IconToggle } from './IconToggle';

/**
 * Modern / classic switch for every styled icon family.
 *
 * Each option shows `icons/styles/<style>-<faction>.png`: a class icon, a race portrait and
 * the faction emblem in that style, picked for the user's faction. The art is never
 * filtered (it holds the dark Horde emblem); the chosen style is marked by a bar in the
 * faction accent, like the faction switch.
 */
export function AssetStyleToggle() {
  const { preferences, setPreference } = usePreferences();
  const { t } = useI18n();
  const options = ASSET_STYLES.map((style) => ({
    value: style,
    label: t(`header.iconStyle.${style}`),
    icon: iconUrl(`styles/${style}-${preferences.faction}`),
  }));

  return (
    <IconToggle
      label={t('header.iconStyle')}
      value={preferences.assetStyle}
      options={options}
      onChange={(style) => setPreference('assetStyle', style)}
      // Three pieces of art per icon: the same size as the PvP / PvE switch, to stay legible
      size="lg"
    />
  );
}
