import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { realmLabel } from '@/lib/wow/regions';
import { usePreferences } from '@/preferences/PreferencesProvider';

/**
 * A guild: `/<lang>/pve/guild/<region>/<realm slug>/<name>`. Opening one makes it the menu
 * Guild link's target (preference `lastPveGuild`).
 */
export const Route = createFileRoute('/$locale/pve/guild/$region/$realm/$name')({
  component: GuildPage,
});

function GuildPage() {
  const { region, realm, name } = Route.useParams();
  const { t } = useI18n();
  const { setPreference } = usePreferences();

  useEffect(() => {
    setPreference('lastPveGuild', { region, realm, name });
  }, [region, realm, name, setPreference]);

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
