import { createFileRoute } from '@tanstack/react-router';
import { ModeHome } from '@/components/ModeHome';

export const Route = createFileRoute('/pve/')({
  component: () => <ModeHome mode="pve" />,
});
