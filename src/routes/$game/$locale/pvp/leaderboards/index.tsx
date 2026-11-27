import { createFileRoute, redirect } from '@tanstack/react-router';
import { PVP_BRACKETS } from '@/api/pvp';

/** `/<lang>/pvp/leaderboards` has no page of its own: it opens the first bracket (Solo Shuffle). */
export const Route = createFileRoute('/$game/$locale/pvp/leaderboards/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$game/$locale/pvp/leaderboards/$bracket',
      params: { ...params, bracket: PVP_BRACKETS[0] },
      replace: true,
    });
  },
});
