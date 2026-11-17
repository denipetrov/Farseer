import { usePreferences } from '@/preferences/PreferencesProvider';
import { classColorVar, classIconUrl, resolveClass, type ClassInput } from '@/lib/wow/classes';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface ClassIconProps {
  /** Any API class shape: slug, name, id, or { id, name } */
  cls: ClassInput;
  size?: IconSize;
}

/** A class icon in the user's chosen asset style, framed in the class colour. Renders nothing for an unknown class. */
export function ClassIcon({ cls, size }: ClassIconProps) {
  const { preferences } = usePreferences();
  const url = classIconUrl(cls, { style: preferences.assetStyle });
  if (!url) return null;

  return (
    <GameIcon
      src={url}
      label={resolveClass(cls)!.name}
      size={size}
      borderColor={classColorVar(cls)}
    />
  );
}
