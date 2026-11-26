import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/<lang>/pvp/leaderboards` has no page of its own: it opens the first bracket, 2v2. */
export const Route = createFileRoute('/$game/$locale/pvp/leaderboards/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/$game/$locale/pvp/leaderboards/$bracket',
      params: { ...params, bracket: '2v2' },
      replace: true,
    });
  },
});
