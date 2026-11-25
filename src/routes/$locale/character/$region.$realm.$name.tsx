import { createFileRoute, redirect } from '@tanstack/react-router';

/** The character page's old address (before the PvE menu): now `/<lang>/pve/character/…`. */
export const Route = createFileRoute('/$locale/character/$region/$realm/$name')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$locale/pve/character/$region/$realm/$name', params, replace: true });
  },
});
