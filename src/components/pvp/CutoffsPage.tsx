import { Link } from '@tanstack/react-router';
import {
  CUTOFF_REGIONS,
  PVP_BRACKETS,
  isTitleBracket,
  type CutoffRegion,
  type TitleBracket,
} from '@/api/pvp';
import { GameIcon } from '@/components/GameIcon';
import { Page, PageTitle } from '@/components/Page';
import { tabBar } from '@/components/tabBar';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { regionLabel } from '@/i18n/labels';
import type { MessageKey } from '@/i18n/messages';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { useSite } from '@/lib/site';
import { RankOneCutoffs } from './RankOneCutoffs';
import styles from './CutoffsPage.module.css';

/** The ladders with a title, in the menus' order (Solo, 3v3, Blitz, RBG) */
const BRACKETS = PVP_BRACKETS.filter(isTitleBracket);

const SHORT: Partial<Record<TitleBracket, MessageKey>> = {
  blitz: 'bracketShort.blitz',
  rbg: 'bracketShort.rbg',
};

/**
 * The standalone Rank One cutoffs page (Stats → Cutoffs; the user, 2026-11-27): "Solo
 * Shuffle Rank One Cutoffs" with the bracket's icon, a bar of the ladders with a title and
 * the regions (no World: Blizzard sets cutoffs per region), then the widget the leaderboard
 * pages show under their ladder, here unfiltered.
 */
export function CutoffsPage({ bracket, region }: { bracket: TitleBracket; region: CutoffRegion }) {
  const { t } = useI18n();
  const site = useSite();
  const art = iconUrl(`pvp/brackets/${bracket}`);
  return (
    <Page>
      <PageTitle className={styles.title}>
        {art && <GameIcon src={art} label="" size="md" shape="round" />}
        <span>{t('cutoffs.pageTitle', { bracket: t(`bracket.${bracket}`) })}</span>
      </PageTitle>
      <div className={tabBar.bar}>
        <nav className={tabBar.group} aria-label={t('tabs.brackets')}>
          {BRACKETS.map((b) => {
            const bArt = iconUrl(`pvp/brackets/${b}`);
            return (
              <Link
                key={b}
                className={tabBar.tab}
                to="/$game/$locale/pvp/stats/cutoffs"
                params={site}
                search={{ bracket: b, region }}
                aria-current={b === bracket ? 'page' : undefined}
              >
                {bArt && <GameIcon src={bArt} label="" shape="round" />}
                <span title={SHORT[b] ? t(`bracket.${b}`) : undefined}>
                  {t(SHORT[b] ?? `bracket.${b}`)}
                </span>
              </Link>
            );
          })}
        </nav>
        <nav className={tabBar.group} aria-label={t('widget.region')}>
          {CUTOFF_REGIONS.map((r) => (
            <Link
              key={r}
              className={tabBar.tab}
              to="/$game/$locale/pvp/stats/cutoffs"
              params={site}
              search={{ bracket, region: r }}
              aria-current={r === region ? 'page' : undefined}
            >
              {regionLabel(t, r)}
            </Link>
          ))}
        </nav>
      </div>
      <WidgetGrid>
        <RankOneCutoffs bracket={bracket} region={region} />
      </WidgetGrid>
    </Page>
  );
}
