import { createFileRoute, redirect } from '@tanstack/react-router';
import { raidBoardQuery } from '@/api/pve';
import { Muted, Page, Panel } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { readPreferences } from '@/preferences/storage';

/**
 * The menu's Guild link: `/<lang>/pve/guild` has no page of its own.
 *
 * It opens the last guild this visitor viewed (preference `lastPveGuild`). With none, it
 * opens the World #1 of the current raid on Mythic (`/pve/raid?raidSlug=current`).
 */
export const Route = createFileRoute('/$locale/pve/guild/')({
  beforeLoad: ({ params }) => {
    const last = readPreferences().lastPveGuild;
    if (last) {
      throw redirect({
        to: '/$locale/pve/guild/$region/$realm/$name',
        params: { locale: params.locale, ...last },
        replace: true,
      });
    }
  },
  loader: async ({ context, params }) => {
    const board = await context.queryClient.fetchQuery(raidBoardQuery({ raidSlug: 'current' }));
    // A guild Soulseeker has not stored has only its id: take the first one with an address
    const top = board.guilds.map((g) => g.guild).find((g) => g.name && g.realmSlug && g.region);
    if (!top?.name || !top.realmSlug || !top.region) throw new Error('The raid board is empty');
    throw redirect({
      to: '/$locale/pve/guild/$region/$realm/$name',
      params: { locale: params.locale, region: top.region, realm: top.realmSlug, name: top.name },
      replace: true,
    });
  },
  pendingComponent: Finding,
  errorComponent: Unavailable,
});

function Finding() {
  const { t } = useI18n();
  return (
    <Page>
      <Muted role="status">{t('guild.finding')}</Muted>
    </Page>
  );
}

function Unavailable() {
  const { t } = useI18n();
  return (
    <Page>
      <Panel>
        <Muted>{t('guild.unavailable')}</Muted>
      </Panel>
    </Page>
  );
}
