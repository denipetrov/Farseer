import { classColorVar, type ClassInput } from '@/lib/wow/classes';
import { classOfSpec, resolveSpec, specIconUrl, type SpecInput } from '@/lib/wow/specs';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface SpecIconProps {
  /** Any API spec shape: id, slug, name, `{ id, name }` or a ladder name */
  spec: SpecInput;
  /** Needed when `spec` is a slug or name ("holy" is Paladin or Priest) */
  cls?: ClassInput;
  size?: IconSize;
}

/** A spec icon framed in its class colour, labelled "Fire Mage". Renders nothing when unknown. */
export function SpecIcon({ spec, cls, size }: SpecIconProps) {
  const url = specIconUrl(spec, cls);
  const sp = resolveSpec(spec, cls);
  if (!url || !sp) return null;

  return (
    <GameIcon
      src={url}
      label={`${sp.name} ${classOfSpec(sp).name}`}
      size={size}
      borderColor={classColorVar(sp.classSlug)}
    />
  );
}
