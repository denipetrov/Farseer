import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { NavGlyph } from '@/components/NavGlyph';
import { useI18n } from '@/i18n/useI18n';
import styles from './ComingSoonPage.module.css';

interface ComingSoonPageProps {
  title: string;
  subtitle?: string;
  /** A single-colour icon beside the title: its path under `icons/` (`nav/cutoffs`) */
  icon?: string;
}

/** A page whose content is not built yet: its title and icon, and a short note. */
export function ComingSoonPage({ title, subtitle, icon }: ComingSoonPageProps) {
  const { t } = useI18n();
  return (
    <Page>
      <header className={styles.heading}>
        {icon && (
          <span className={styles.badge}>
            <NavGlyph icon={icon} size="lg" />
          </span>
        )}
        <div>
          <PageTitle>{title}</PageTitle>
          {subtitle && <Muted>{subtitle}</Muted>}
        </div>
      </header>
      <Panel>
        <Muted>{t('page.comingSoon')}</Muted>
      </Panel>
    </Page>
  );
}
