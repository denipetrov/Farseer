import { createFileRoute, redirect } from '@tanstack/react-router';

/** The guild page's old address (before the PvE menu): now `/<lang>/pve/guild/…`. */
export const Route = createFileRoute('/$locale/guild/$region/$realm/$name')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pve/guild/$region/$realm/$name', params, replace: true });
  },
});
