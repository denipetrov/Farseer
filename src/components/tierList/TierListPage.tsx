import type { ReactNode } from 'react';
import type { PvpBoard, PvpBracket } from '@/api/pvp';
import type { PveBoard } from '@/api/pve';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { TierListTabs } from './TierListTabs';
import styles from './TierListPage.module.css';

/**
 * A standalone tier list page (`/pvp/tier-list`, `/pve/tier-list`): "Solo Shuffle Tier
 * List" with the bracket's icon, the bracket and region bar, then the list.
 */
export function TierListPage({
  active,
  region,
  children,
}: {
  active: PvpBracket | 'mplus';
  region: PvpBoard | PveBoard;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const art = iconUrl(active === 'mplus' ? 'game-modes/mplus' : `pvp/brackets/${active}`);
  const bracket = active === 'mplus' ? t('nav.mythicPlus') : t(`bracket.${active}`);
  return (
    <Page>
      <PageTitle className={styles.title}>
        {art && <GameIcon src={art} label="" size="md" shape="round" />}
        <span>{t('tier.pageTitle', { bracket })}</span>
      </PageTitle>
      <TierListTabs active={active} region={region} />
      <WidgetGrid>{children}</WidgetGrid>
    </Page>
  );
}
