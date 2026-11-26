import { createFileRoute, redirect } from '@tanstack/react-router';
import { mplusLeaderboardQuery } from '@/api/pve';
import { Muted, Page, Panel } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { readPreferences } from '@/preferences/storage';

/**
 * The menu's Character link: `/<lang>/pve/character` has no page of its own.
 *
 * It opens the last PvE character this visitor viewed (preference `lastPveCharacter`). With
 * none, it opens the World Mythic+ #1 of the current season (`/pve/mplus-leaderboard`).
 */
export const Route = createFileRoute('/$game/$locale/pve/character/')({
  beforeLoad: ({ params }) => {
    const last = readPreferences().lastPveCharacter;
    if (last) {
      throw redirect({
        to: '/$game/$locale/pve/character/$region/$realm/$name',
        params: { game: params.game, locale: params.locale, ...last },
        replace: true,
      });
    }
  },
  loader: async ({ context, params }) => {
    const board = await context.queryClient.fetchQuery(mplusLeaderboardQuery({ pageSize: 1 }));
    const top = board.entries[0];
    if (!top) throw new Error('The Mythic+ board is empty');
    throw redirect({
      to: '/$game/$locale/pve/character/$region/$realm/$name',
      params: {
        game: params.game,
        locale: params.locale,
        region: top.region,
        realm: top.realmSlug,
        name: top.characterName,
      },
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
      <Muted role="status">{t('character.finding', { bracket: t('nav.mythicPlus') })}</Muted>
    </Page>
  );
}

function Unavailable() {
  const { t } = useI18n();
  return (
    <Page>
      <Panel>
        <Muted>{t('character.unavailable')}</Muted>
      </Panel>
    </Page>
  );
}
