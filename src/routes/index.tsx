import { createFileRoute, Link } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';
import { ApiStatus } from '@/components/ApiStatus';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <Page>
      <PageTitle>Farseer</PageTitle>
      <Muted>Leaderboards, characters, guilds and more — powered by Soulseeker.</Muted>
      <ApiStatus />
      <Panel>
        <Link to="/leaderboards" search={{ region: 'eu' }}>
          Browse leaderboards →
        </Link>
      </Panel>
    </Page>
  );
}
