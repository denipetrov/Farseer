import { createFileRoute } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';

export const Route = createFileRoute('/character/$region/$realm/$name')({
  component: CharacterPage,
});

function CharacterPage() {
  const { region, realm, name } = Route.useParams();

  return (
    <Page>
      <PageTitle>{name}</PageTitle>
      <Muted>
        {realm} · {region.toUpperCase()}
      </Muted>
      <Panel>
        <Muted>Character data will load here.</Muted>
      </Panel>
    </Page>
  );
}
