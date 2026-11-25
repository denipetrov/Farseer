import type { ClassInput } from '@/lib/wow/classes';
import { roleText } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { roleIconFile, roleOfSpec, resolveRoleKind } from '@/lib/wow/roles';
import type { SpecInput } from '@/lib/wow/specs';
import { iconUrl } from '@/lib/assets';
import type { IconSize } from '@/styles/iconSizes';
import { GameIcon } from './GameIcon';

type RoleIconProps = {
  size?: IconSize;
} & (
  | {
      /** `tank`, `healer`, `dps`, or Raider.io's `TANK` / `HEALING` / `DPS` */
      role: string | null | undefined;
      /** `melee` or `ranged`; implies dps */
      subRole?: string | null;
      spec?: never;
      cls?: never;
    }
  | {
      /** Any API spec shape; the icon shows that spec's role and melee/ranged split */
      spec: SpecInput;
      /** Needed when `spec` is a slug or name ("holy" is Paladin or Priest) */
      cls?: ClassInput;
      role?: never;
      subRole?: never;
    }
);

/** A role icon (Tank, Healer, DPS, Melee DPS, Ranged DPS). Renders nothing when unknown. */
export function RoleIcon({ size, ...props }: RoleIconProps) {
  const { t } = useI18n();
  const kind =
    props.spec !== undefined
      ? roleOfSpec(props.spec, props.cls)
      : resolveRoleKind(props.role, props.subRole);
  const url = kind ? iconUrl(`roles/${roleIconFile(kind)}`) : undefined;
  if (!kind || !url) return null;

  return <GameIcon src={url} label={roleText(t, kind)} size={size} />;
}
