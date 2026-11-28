import type { MplusSeason, PveBoard } from '@/api/pve';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { mplusSeasonName, tierCutoffs } from '@/lib/mplusBoard';
import styles from './MplusSeasonInfo.module.css';

const SHIELDS = {
  p999: iconUrl('pve/ranks/zeropointonepercent'),
  p990: iconUrl('pve/ranks/onepercent'),
};

/**
 * The live Mythic+ season under the board's heading (the user, 2026-11-28; the PvP pages'
 * SeasonInfo): its name, its start and end in the region shown (World: the first region's
 * start, the last end, or in progress while any region plays it), and the region's top
 * 0.1% and top 1% scores beside their shields. Those are per region, so World has none.
 */
export function MplusSeasonInfo({ season, region }: { season: MplusSeason; region: PveBoard }) {
  const { t, locale } = useI18n();
  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium' }).format(new Date(iso));
  const regions =
    region === 'world' ? (Object.keys(season.starts) as (keyof typeof season.starts)[]) : [region];
  const starts = regions
    .map((r) => season.starts[r])
    .filter((s): s is string => !!s)
    .sort();
  const ends = regions.map((r) => season.ends[r]);
  // Running anywhere it started: no end yet
  const running = ends.some((e) => !e);
  const end = running
    ? null
    : (ends
        .filter((e): e is string => !!e)
        .sort()
        .at(-1) ?? null);
  const cutoffs = region === 'world' ? null : tierCutoffs(season, region);
  const score = (n: number) =>
    `${n.toLocaleString(locale.htmlLang, { maximumFractionDigits: 1 })}+`;

  return (
    <dl className={styles.facts}>
      <div>
        <dt>{t('season.label')}</dt>
        <dd>{mplusSeasonName(season)}</dd>
      </div>
      {starts[0] && (
        <div>
          <dt>{t('season.started')}</dt>
          <dd>
            <time dateTime={starts[0]}>{date(starts[0])}</time>
          </dd>
        </div>
      )}
      <div>
        <dt>{t('season.ended')}</dt>
        <dd>
          {end ? (
            <time dateTime={end}>{date(end)}</time>
          ) : (
            <span className={styles.live}>{t('season.ongoing')}</span>
          )}
        </dd>
      </div>
      {(['p999', 'p990'] as const).map((tier) =>
        cutoffs?.[tier] != null ? (
          <div key={tier}>
            <dt>{t(tier === 'p999' ? 'mplus.factTop01' : 'mplus.factTop1')}</dt>
            <dd>
              {SHIELDS[tier] && (
                <img className={styles.shield} src={SHIELDS[tier]} alt="" draggable={false} />
              )}
              <span data-tier={tier}>{score(cutoffs[tier]!)}</span>
            </dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}
