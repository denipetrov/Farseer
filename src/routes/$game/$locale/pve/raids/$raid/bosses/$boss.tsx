import type { QueryClient } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { bossName, raidName, raidsQuery } from '@/api/pve';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { PVE_ICONS } from '@/components/nav/pveNav';
import { useI18n } from '@/i18n/useI18n';

/** One boss's first kills: `/<lang>/pve/raids/<raid slug>/bosses/<boss slug>` (`/pve/bosses`). */
export const Route = createFileRoute('/$game/$locale/pve/raids/$raid/bosses/$boss')({
  loader: async ({ context, params }) => {
    const raid = await catalogueRaid(context.queryClient, params.raid);
    const boss = raid.encounters.find((e) => e.slug === params.boss);
    if (!boss) throw notFound();
    return { raid, boss };
  },
  component: BossPage,
});

/** The raid in the catalogue (fetched once, shared with the menu), or a 404 */
async function catalogueRaid(queryClient: QueryClient, slug: string) {
  const { raids } = await queryClient.ensureQueryData(raidsQuery());
  const raid = raids.find((r) => r.slug === slug);
  if (!raid) throw notFound();
  return raid;
}

function BossPage() {
  const { raid, boss } = Route.useLoaderData();
  const { t, names } = useI18n();
  return (
    <ComingSoonPage
      title={bossName(names, raid, boss)}
      subtitle={`${raidName(names, raid)} · ${t('nav.bossRankings')}`}
      icon={PVE_ICONS.bossRankings}
    />
  );
}
