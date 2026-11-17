import { createFileRoute } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';

export const Route = createFileRoute('/guild/$region/$realm/$name')({
  component: GuildPage,
});

function GuildPage() {
  const { region, realm, name } = Route.useParams();

  return (
    <Page>
      <PageTitle>&lt;{name}&gt;</PageTitle>
      <Muted>
        {realm} · {region.toUpperCase()}
      </Muted>
      <Panel>
        <Muted>Guild data will load here.</Muted>
      </Panel>
    </Page>
  );
}
