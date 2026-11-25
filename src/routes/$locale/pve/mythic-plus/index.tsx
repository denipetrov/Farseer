import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/<lang>/pve/mythic-plus` has no page of its own: open the character leaderboard. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pve/mythic-plus/characters', params, replace: true });
  },
});
