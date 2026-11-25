import type { ClassInput } from '@/lib/wow/classes';
import { classOfSpec, resolveSpec, specIconUrl, type SpecInput } from '@/lib/wow/specs';
import { useI18n } from '@/i18n/useI18n';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

interface SpecIconProps {
  /** Any API spec shape: id, slug, name, `{ id, name }` or a ladder name */
  spec: SpecInput;
  /** Needed when `spec` is a slug or name ("holy" is Paladin or Priest) */
  cls?: ClassInput;
  size?: IconSize;
}

/** A round spec icon (its rim is in the class colour), labelled "Fire Mage". Renders nothing when unknown. */
export function SpecIcon({ spec, cls, size }: SpecIconProps) {
  const { t, name } = useI18n();
  const url = specIconUrl(spec, cls);
  const sp = resolveSpec(spec, cls);
  if (!url || !sp) return null;

  return (
    <GameIcon
      src={url}
      label={t('spec.label', {
        spec: name('specs', sp.id, sp.name),
        class: name('classes', classOfSpec(sp).id, classOfSpec(sp).name),
      })}
      size={size}
      shape="round"
    />
  );
}
