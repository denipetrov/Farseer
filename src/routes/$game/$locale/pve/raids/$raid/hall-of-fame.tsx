import type { QueryClient } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { raidName, raidsQuery } from '@/api/pve';
import { ComingSoonPage } from '@/components/ComingSoonPage';
import { PVE_ICONS } from '@/components/nav/pveNav';
import { useI18n } from '@/i18n/useI18n';

/** A raid's top guilds: `/<lang>/pve/raids/<raid slug>/hall-of-fame` (`/pve/raid`). */
export const Route = createFileRoute('/$game/$locale/pve/raids/$raid/hall-of-fame')({
  loader: ({ context, params }) => catalogueRaid(context.queryClient, params.raid),
  component: HallOfFamePage,
});

/** The raid in the catalogue (fetched once, shared with the menu), or a 404 */
async function catalogueRaid(queryClient: QueryClient, slug: string) {
  const { raids } = await queryClient.ensureQueryData(raidsQuery());
  const raid = raids.find((r) => r.slug === slug);
  if (!raid) throw notFound();
  return raid;
}

function HallOfFamePage() {
  const raid = Route.useLoaderData();
  const { t, names } = useI18n();
  return (
    <ComingSoonPage
      title={raidName(names, raid)}
      subtitle={t('nav.hallOfFame')}
      icon={PVE_ICONS.hallOfFame}
    />
  );
}
