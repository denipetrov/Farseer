import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { specRepresentationQuery, type PvpBoard, type PvpBracket } from '@/api/pvp';
import { WidgetFooter, WidgetFrame, WidgetHeader, WidgetTitle } from '@/components/widgets/Widget';
import { regionLabel } from '@/i18n/labels';
import { useI18n } from '@/i18n/useI18n';
import { shownSpecs } from '@/lib/representation';
import { useSite } from '@/lib/site';
import { SpecBarChart } from './SpecBarChart';
import styles from './RepresentationWidget.module.css';

/** The home widget's rating: the page's default */
const RATING = 2100;

/** How many specs a widget of each size has room for at 1080p (26px a bar with its icon) */
const BARS = { small: 11, medium: 18 } as const;

/**
 * A bracket's spec representation on the PvP home, under its ladder (the user, 2026-11-27):
 * the most played specs at 2100+ today, as many as the widget has room for, in the region
 * the ladder shows; the full page (Stats → Spec Representation) has every spec and the
 * controls. Nothing on a failed load: the ladder does not depend on it.
 */
export function RepresentationWidget({
  bracket,
  region,
  size,
}: {
  bracket: PvpBracket;
  region: PvpBoard;
  size: 'small' | 'medium';
}) {
  const { t, locale } = useI18n();
  const site = useSite();
  const { data, isError } = useQuery(specRepresentationQuery(region, bracket, RATING, 'latest'));
  const specs = data ? shownSpecs(data.specs, 'all').slice(0, BARS[size]) : [];
  const date = data
    ? new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date(`${data.date}T00:00:00Z`),
      )
    : null;

  return (
    <WidgetFrame size={size} aria-label={t('nav.representation')} className={styles.frame}>
      <WidgetHeader className={styles.header}>
        <WidgetTitle className={styles.title}>{t('nav.representation')}</WidgetTitle>
        <span className={styles.meta}>
          {[`${RATING.toLocaleString(locale.htmlLang)}+`, regionLabel(t, region), date]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </WidgetHeader>
      <div className={styles.body}>
        {isError ? (
          <p className={styles.message}>{t('widget.unavailable')}</p>
        ) : !data ? (
          <div className={styles.skeleton} aria-busy />
        ) : specs.length === 0 ? (
          <p className={styles.message}>{t('rep.noSpecs')}</p>
        ) : (
          <SpecBarChart
            specs={specs}
            classified={data.classified}
            bracket={bracket}
            region={region}
            compact
          />
        )}
      </div>
      <WidgetFooter>
        <span className={styles.fullLink}>
          <Link
            to="/$game/$locale/pvp/stats/representation"
            params={site}
            search={{
              bracket: bracket === 'shuffle' ? undefined : bracket,
              region: region === 'world' ? undefined : region,
            }}
          >
            {t('rep.viewFull')}
            <span aria-hidden>→</span>
          </Link>
        </span>
      </WidgetFooter>
    </WidgetFrame>
  );
}
