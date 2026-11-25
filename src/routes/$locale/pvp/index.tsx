import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';

export const Route = createFileRoute('/$locale/pvp/')({
  component: () => <ModeHome mode="pvp" />,
});
