/**
 * The Mythic+ placeholder pages, shared by the current season (`/pve/mythic-plus/…`) and the
 * archives (`/pve/mythic-plus/archives/…`): the same title and icon, with "Archives" in the
 * subtitle on an archived one.
 */
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { PVE_ICONS } from '@/components/nav/pveNav';
import { roleText } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { ALL } from '@/lib/mplusParams';
import { resolveClass } from '@/lib/wow/classes';
import { roleKindOfSlug } from '@/lib/wow/roles';
import { classOfSpec, resolveSpec } from '@/lib/wow/specs';

interface Section {
  /** An archived season's page */
  archive?: boolean;
}

/** "Mythic+ · Archives · Specs": where the page sits in the menu */
function useTrail(archive: boolean | undefined, ...keys: MessageKey[]) {
  const { t } = useI18n();
  return [
    t('nav.mythicPlus'),
    ...(archive ? [t('nav.archives')] : []),
    ...keys.map((k) => t(k)),
  ].join(' · ');
}

const BOARDS = {
  characters: { title: 'nav.mplusCharacters', icon: PVE_ICONS.mplusCharacters },
  runs: { title: 'nav.mplusRuns', icon: PVE_ICONS.mplusRuns },
} as const;

/** All Characters or Runs */
export function MplusBoardPage({ board, archive }: Section & { board: keyof typeof BOARDS }) {
  const { t } = useI18n();
  const trail = useTrail(archive, 'nav.leaderboards');
  return (
    <ComingSoonPage title={t(BOARDS[board].title)} subtitle={trail} icon={BOARDS[board].icon} />
  );
}

/** One spec's board */
export function SpecBoardPage({ cls, spec, archive }: Section & { cls: string; spec: string }) {
  const { name } = useI18n();
  const trail = useTrail(archive, 'nav.leaderboards', 'nav.mplusSpecs');
  if (spec === ALL) return <WholeClassPage cls={cls} trail={trail} />;
  const sp = resolveSpec(spec, cls);
  if (!sp) return null;
  const c = classOfSpec(sp);
  return (
    <ComingSoonPage
      title={`${name('specs', sp.id, sp.name)} · ${name('classes', c.id, c.name)}`}
      subtitle={trail}
      icon={PVE_ICONS.mplusSpecs}
    />
  );
}

/** One class in one role */
export function ClassRoleBoardPage({
  cls,
  role,
  archive,
}: Section & { cls: string; role: string }) {
  const { t, name } = useI18n();
  const trail = useTrail(archive, 'nav.leaderboards', 'nav.mplusClassRoles');
  if (role === ALL) return <WholeClassPage cls={cls} trail={trail} />;
  const c = resolveClass(cls);
  const kind = roleKindOfSlug(role);
  if (!c || !kind) return null;
  return (
    <ComingSoonPage
      title={`${name('classes', c.id, c.name)} · ${roleText(t, kind)}`}
      subtitle={trail}
      icon={PVE_ICONS.mplusClassRoles}
    />
  );
}

/** A whole class's board (the "All" row under a class, in Specs or in Classes & Roles) */
function WholeClassPage({ cls, trail }: { cls: string; trail: string }) {
  const { name } = useI18n();
  const c = resolveClass(cls);
  if (!c) return null;
  return (
    <ComingSoonPage
      title={name('classes', c.id, c.name)}
      subtitle={trail}
      icon={PVE_ICONS.mplusSpecs}
    />
  );
}

const STATS = {
  representation: { title: 'nav.representation', icon: PVE_ICONS.representation },
  compositions: { title: 'nav.compositions', icon: PVE_ICONS.compositions },
  cutoffs: { title: 'nav.cutoffs', icon: PVE_ICONS.cutoffs },
} as const;

/** Spec Representation, Compositions or Cutoffs, for the current season or an archived one */
export function MplusStatsPage({ stat, archive }: Section & { stat: keyof typeof STATS }) {
  const { t } = useI18n();
  const trail = useTrail(archive, 'nav.stats');
  return <ComingSoonPage title={t(STATS[stat].title)} subtitle={trail} icon={STATS[stat].icon} />;
}
