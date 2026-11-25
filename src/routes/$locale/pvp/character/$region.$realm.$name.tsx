import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { realmLabel } from '@/lib/wow/regions';
import { usePreferences } from '@/preferences/PreferencesProvider';

/**
 * A PvP character: `/<lang>/pvp/character/<region>/<realm slug>/<name>`. Opening one makes
 * it the menu Character link's target (preference `lastPvpCharacter`).
 */
export const Route = createFileRoute('/$locale/pvp/character/$region/$realm/$name')({
  component: CharacterPage,
});

function CharacterPage() {
  const { region, realm, name } = Route.useParams();
  const { t } = useI18n();
  const { setPreference } = usePreferences();

  useEffect(() => {
    setPreference('lastPvpCharacter', { region, realm, name });
  }, [region, realm, name, setPreference]);

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
