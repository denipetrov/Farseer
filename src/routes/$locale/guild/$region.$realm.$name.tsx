import { createFileRoute } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { realmLabel } from '@/lib/wow/regions';

export const Route = createFileRoute('/$locale/guild/$region/$realm/$name')({
  component: GuildPage,
});

function GuildPage() {
  const { region, realm, name } = Route.useParams();
  const { t } = useI18n();

  return (
    <Page>
      <PageTitle>&lt;{name}&gt;</PageTitle>
      <Muted>
        {realmLabel(realm)} · {regionLabel(t, region)}
      </Muted>
      <Panel>
        <Muted>{t('guild.placeholder')}</Muted>
      </Panel>
    </Page>
  );
}
