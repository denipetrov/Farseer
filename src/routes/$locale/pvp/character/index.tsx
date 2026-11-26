import { createFileRoute, redirect } from '@tanstack/react-router';
import { currentSeasonQuery, leaderboardQuery } from '@/api/pvp';
import { Muted, Page, Panel } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { readPreferences } from '@/preferences/storage';

/**
 * The menu's Character link: `/<lang>/pvp/character` has no page of its own.
 *
 * It opens the last PvP character this visitor viewed (preference `lastPvpCharacter`). With
 * none, it opens the World Solo Shuffle #1: `/pvp/cutoffs` gives the current season, and the
 * board's first row the character.
 */
export const Route = createFileRoute('/$locale/pvp/character/')({
  beforeLoad: ({ params }) => {
    const last = readPreferences().lastPvpCharacter;
    if (last) {
      throw redirect({
        to: '/$locale/pvp/character/$region/$realm/$name',
        params: { locale: params.locale, ...last },
        replace: true,
      });
    }
  },
  loader: async ({ context, params }) => {
    const { seasonId } = await context.queryClient.fetchQuery(
      currentSeasonQuery('world', 'shuffle'),
    );
    const board = await context.queryClient.fetchQuery(
      leaderboardQuery({ region: 'world', seasonId, bracket: 'shuffle', pageSize: 10 }),
    );
    // A character Blizzard gives no name or realm can't be opened: take the first that has both
    const top = board.entries.find((e) => e.characterName && e.realmSlug);
    if (!top?.characterName || !top.realmSlug) throw new Error('The Solo Shuffle board is empty');
    throw redirect({
      to: '/$locale/pvp/character/$region/$realm/$name',
      params: {
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
      <Muted role="status">{t('character.finding', { bracket: t('bracket.shuffle') })}</Muted>
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
