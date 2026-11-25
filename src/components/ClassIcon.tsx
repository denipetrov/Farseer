import { hasStyledAsset } from '@/lib/assets';
import {
  CLASS_ICON_ART_FILL,
  classIconUrl,
  resolveClass,
  type ClassInput,
} from '@/lib/wow/classes';
import { useI18n } from '@/i18n/useI18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface ClassIconProps {
  /** Any API class shape: slug, name, id, or { id, name } */
  cls: ClassInput;
  size?: IconSize;
}

/**
 * A round class icon in the user's chosen asset style (its rim is in the class colour).
 * Modern files pad the art, so they are scaled to fill the same circle as other icons.
 * Renders nothing for an unknown class.
 */
export function ClassIcon({ cls, size }: ClassIconProps) {
  const { preferences } = usePreferences();
  const { name } = useI18n();
  const c = resolveClass(cls);
  const url = classIconUrl(cls, { style: preferences.assetStyle });
  if (!c || !url) return null;

  // The file shown may be the other style's (fallback): scale by the style actually used.
  const style = hasStyledAsset('classes', preferences.assetStyle, c.slug)
    ? preferences.assetStyle
    : preferences.assetStyle === 'modern'
      ? 'classic'
      : 'modern';

  return (
    <GameIcon
      src={url}
      label={name('classes', c.id, c.name)}
      size={size}
      shape="round"
      artFill={CLASS_ICON_ART_FILL[style]}
    />
  );
}
