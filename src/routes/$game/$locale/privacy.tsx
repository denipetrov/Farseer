import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/LegalPage';
import { loadLegalDocument } from '@/legal/load';

export const Route = createFileRoute('/$game/$locale/privacy')({
  loader: ({ context }) => loadLegalDocument(context.locale.slug, 'privacy'),
  component: function Page() {
    return <LegalPage title="legal.privacy" loaded={Route.useLoaderData()} />;
  },
});
