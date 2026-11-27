import { Link } from '@tanstack/react-router';
import { useId, useRef, useState, type CSSProperties } from 'react';
import type { PvpBoard, PvpBracket } from '@/api/pvp';
import { HoverCard } from '@/components/HoverCard';
import { SpecIcon } from '@/components/SpecIcon';
import { useI18n } from '@/i18n/useI18n';
import { niceAxis, type ShownSpec } from '@/lib/representation';
import { useSite } from '@/lib/site';
import { classColorKey } from '@/lib/wow/classes';
import { classOfSpec } from '@/lib/wow/specs';
import styles from './SpecBarChart.module.css';

/**
 * Players per spec as vertical bars, most first (the user's example, 2026-11-27):
 * - each bar in its class colour, 4px rounded at the top, on recessive gridlines;
 * - the spec's icon under its bar, the direct label (no rotated names);
 * - on hover or focus a card: the spec, its players and share, and its hero talents;
 * - each bar links to the spec's ladder on the bracket, in the region.
 * Heights (`--h`) and gridline places (`--at`) are custom properties: values only the data
 * knows (the inline-style exception). It scrolls sideways when the page is narrow.
 */
export function SpecBarChart({
  specs,
  classified,
  bracket,
  region,
  compact = false,
}: {
  specs: readonly ShownSpec[];
  /** The snapshot's players with a known spec: shares are of them */
  classified: number;
  bracket: PvpBracket;
  region: PvpBoard;
  /** A shorter plot, for the home's widgets */
  compact?: boolean;
}) {
  const { t, name, locale } = useI18n();
  const site = useSite();
  const cardId = useId();
  const anchor = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<ShownSpec | null>(null);
  const { top, ticks } = niceAxis(specs[0]?.entry.count ?? 0);
  const num = (n: number) => n.toLocaleString(locale.htmlLang);
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, { style: 'percent', maximumFractionDigits: 1 });
  const specName = ({ sp }: ShownSpec) =>
    t('spec.label', {
      spec: name('specs', sp.id, sp.name),
      class: name('classes', classOfSpec(sp).id, classOfSpec(sp).name),
    });
  const show = (s: ShownSpec) => (e: { currentTarget: HTMLElement }) => {
    anchor.current = e.currentTarget;
    setHovered(s);
  };

  return (
    <div className={styles.chart} data-compact={compact || undefined}>
      <span className={styles.axisTitle}>{t('rep.players')}</span>
      {/* The axis: its values beside the gridlines */}
      <ol className={styles.axis} aria-hidden>
        {/* Unseen, in the flow: widens the column to the widest value ("2,000"), which the
            placed values can't (absolute), so they never run into the axis title */}
        <li className={styles.sizer}>{num(top)}</li>
        {ticks.map((v) => (
          <li key={v} style={{ '--at': v / top } as CSSProperties}>
            {num(v)}
          </li>
        ))}
      </ol>
      <div className={styles.scroll}>
        <div className={styles.plot}>
          <div className={styles.grid} aria-hidden>
            {ticks.map((v) => (
              <span key={v} style={{ '--at': v / top } as CSSProperties} />
            ))}
          </div>
          <ol className={styles.bars}>
            {specs.map((s) => {
              const label = `${specName(s)}: ${num(s.entry.count)} (${pct(s.entry.count / (classified || 1))})`;
              return (
                <li key={`${s.sp.classSlug}-${s.sp.slug}`} className={styles.column}>
                  <Link
                    to="/$game/$locale/pvp/leaderboards/$bracket/$class/$spec"
                    params={{ ...site, bracket, class: s.sp.classSlug, spec: s.sp.slug }}
                    search={region === 'world' ? {} : { region }}
                    className={styles.bar}
                    data-class-color={classColorKey(s.sp.classSlug)}
                    style={{ '--h': s.entry.count / top } as CSSProperties}
                    aria-label={label}
                    aria-describedby={hovered === s ? cardId : undefined}
                    onMouseEnter={show(s)}
                    onFocus={show(s)}
                    onMouseLeave={() => setHovered(null)}
                    onBlur={() => setHovered(null)}
                  />
                  <span className={styles.icon} aria-hidden>
                    <SpecIcon spec={s.sp.id} size="sm" />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      {hovered && (
        <HoverCard anchor={anchor} id={cardId}>
          <span className={styles.cardTitle} data-class-color={classColorKey(hovered.sp.classSlug)}>
            <SpecIcon spec={hovered.sp.id} size="sm" />
            {specName(hovered)}
          </span>
          <span className={styles.cardLine}>
            <strong>{t('rep.playersCount', { count: num(hovered.entry.count) })}</strong>
            {pct(hovered.entry.count / (classified || 1))}
          </span>
          {hovered.entry.heroTalents.map((h) => (
            <span key={h.id} className={styles.cardHero}>
              {h.name} <span>{pct(h.share)}</span>
            </span>
          ))}
        </HoverCard>
      )}
    </div>
  );
}
