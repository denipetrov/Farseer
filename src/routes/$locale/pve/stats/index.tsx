import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/<lang>/pve/stats` has no page of its own: open Mythic+ Spec Representation. */
export const Route = createFileRoute('/$locale/pve/stats/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pve/stats/mythic-plus/representation', params, replace: true });
  },
});
