import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/<lang>/pvp/stats` has no page of its own: Stats opens Spec Representation. */
export const Route = createFileRoute('/$locale/pvp/stats/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pvp/stats/representation', params, replace: true });
  },
});
