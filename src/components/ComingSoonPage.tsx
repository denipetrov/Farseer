import styled from 'styled-components';
import { Muted, Page, PageTitle, Panel } from '@/components/Page';
import { NavGlyph } from '@/components/NavGlyph';
import type { NavIcon } from '@/components/nav/pvpNav';
import { useI18n } from '@/i18n/useI18n';

interface ComingSoonPageProps {
  title: string;
  subtitle?: string;
  /** The page's menu icon, shown beside the title */
  icon?: NavIcon;
}

/** A page whose content is not built yet: its title and icon, and a short note. */
export function ComingSoonPage({ title, subtitle, icon }: ComingSoonPageProps) {
  const { t } = useI18n();
  return (
    <Page>
      <Heading>
        {icon && (
          <Badge>
            <NavGlyph icon={icon} size={32} />
          </Badge>
        )}
        <div>
          <PageTitle>{title}</PageTitle>
          {subtitle && <Muted>{subtitle}</Muted>}
        </div>
      </Heading>
      <Panel>
        <Muted>{t('page.comingSoon')}</Muted>
      </Panel>
    </Page>
  );
}

const Heading = styled.header`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const Badge = styled.span`
  display: grid;
  flex: none;
  place-items: center;
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  border: 1px solid var(--color-trim-muted);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-accent-strong);
`;
