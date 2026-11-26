import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';

export const Route = createFileRoute('/$game/$locale/pve/')({
  component: () => <ModeHome mode="pve" />,
});
