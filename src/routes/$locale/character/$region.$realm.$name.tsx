import { createFileRoute } from '@tanstack/react-router';
import { Page, PageTitle, Panel, Muted } from '@/components/Page';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { realmLabel } from '@/lib/wow/regions';

export const Route = createFileRoute('/$locale/character/$region/$realm/$name')({
  component: CharacterPage,
});

function CharacterPage() {
  const { region, realm, name } = Route.useParams();
  const { t } = useI18n();

  return (
    <Page>
      <PageTitle>{name}</PageTitle>
      <Muted>
        {realmLabel(realm)} · {regionLabel(t, region)}
      </Muted>
      <Panel>
        <Muted>{t('character.placeholder')}</Muted>
      </Panel>
    </Page>
  );
}
