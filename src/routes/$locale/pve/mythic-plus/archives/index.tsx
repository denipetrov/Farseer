import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/<lang>/pve/mythic-plus/archives` has no page of its own: open the character board. */
export const Route = createFileRoute('/$locale/pve/mythic-plus/archives/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pve/mythic-plus/archives/characters', params, replace: true });
  },
});
