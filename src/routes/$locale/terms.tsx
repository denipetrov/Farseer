import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/LegalPage';
import { loadLegalDocument } from '@/legal/load';

export const Route = createFileRoute('/$locale/terms')({
  loader: ({ context }) => loadLegalDocument(context.locale.slug, 'terms'),
  component: function Page() {
    return <LegalPage title="legal.terms" loaded={Route.useLoaderData()} />;
  },
});
