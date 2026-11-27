import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { HoverCard } from '@/components/HoverCard';
import { HeroTalentIcon } from '@/components/HeroTalentIcon';
import { SpecIcon } from '@/components/SpecIcon';
import { useI18n } from '@/i18n/useI18n';
import { fotmItemName, spreadLabels, type FotmItem, type FotmSeries } from '@/lib/fotm';
import { niceAxis } from '@/lib/representation';
import { classColorKey } from '@/lib/wow/classes';
import styles from './FotmChart.module.css';

/** The chart's height at least; more when the lines' end icons need it ("All") */
const MIN_HEIGHT = 340;
const PAD = { top: 12, right: 40, bottom: 28, left: 48 };
/** End labels (spec icons) no closer than this */
const LABEL_GAP = 22;
/** How near the pointer must be to a line's point to pick that line (px) */
const PICK = 14;

/**
 * The FOTM chart (the user, 2026-11-27): each spec's share by day over the month, a line in
 * its class colour.
 * - Two specs (or trees) of one class share a colour, so each line ends in its icon (spread
 *   apart so they never overlap), and the page's legend names them.
 * - A day without a snapshot breaks the line rather than bridging it; a point with no
 *   neighbour is a dot.
 * - On hover a crosshair on the nearest day, a card with every shown spec's share that
 *   day, and the line nearest the pointer drawn over the others (the rest dimmed). The
 *   legend's hover does the same. Clicks pin lines, several at once (`pinned`).
 * Drawn in an SVG sized to its box (ResizeObserver): lines stay 2px whatever the width.
 */
export function FotmChart({
  dates,
  series,
  hoveredKey,
  onHighlight,
  pinned,
  onPin,
}: {
  dates: readonly string[];
  series: readonly FotmSeries[];
  /** The line under the pointer (or the legend chip hovered): highlighted while it lasts */
  hoveredKey: string | null;
  onHighlight: (key: string | null) => void;
  /**
   * The lines kept highlighted after a click on them or their end icons, as many as are
   * clicked (the user, 2026-11-27)
   */
  pinned: ReadonlySet<string>;
  /** A click on a line or its icon: pins it, or unpins it when it already is */
  onPin: (key: string) => void;
}) {
  const { t, name, locale } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLSpanElement>(null);
  const cardId = useId();
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  // Drawn over the rest: the pinned lines, and the one hovered
  const on = new Set(pinned);
  if (hoveredKey) on.add(hoveredKey);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? 0));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(0, ...series.flatMap((s) => s.points.map((p) => (p ? p.share : 0))));
  const { top, ticks } = niceAxis(Math.ceil(max * 100));
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  // Tall enough for every line's end icon, LABEL_GAP apart (the user: "All" grows the chart)
  const HEIGHT = Math.max(MIN_HEIGHT, series.length * LABEL_GAP + PAD.top + PAD.bottom);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (dates.length > 1 ? (i * plotW) / (dates.length - 1) : plotW / 2);
  const y = (share: number) => PAD.top + plotH - ((share * 100) / top) * plotH;

  const dayText = (iso: string, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale.htmlLang, {
      timeZone: 'UTC',
      ...(style === 'short' ? { month: 'short', day: 'numeric' } : { dateStyle: 'medium' }),
    }).format(new Date(`${iso}T00:00:00Z`));
  const pct = (n: number) =>
    n.toLocaleString(locale.htmlLang, { style: 'percent', maximumFractionDigits: 1 });
  const itemName = (s: FotmSeries) => fotmItemName(s.item, name, t);

  // A day label every ~70px
  const every = Math.max(1, Math.ceil(dates.length / Math.max(1, Math.floor(plotW / 70))));

  // Each line as segments between gaps; a lone point is a dot
  const lines = series.map((s) => {
    let d = '';
    const dots: number[] = [];
    s.points.forEach((p, i) => {
      if (!p) return;
      const prev = s.points[i - 1];
      const next = s.points[i + 1];
      d += `${prev ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.share).toFixed(1)}`;
      if (!prev && !next) dots.push(i);
    });
    return { s, d, dots };
  });

  // End labels: at each line's last point, spread apart
  const last = series.map((s) => {
    for (let i = s.points.length - 1; i >= 0; i--) {
      const p = s.points[i];
      if (p) return y(p.share);
    }
    return PAD.top + plotH;
  });
  const labelY = spreadLabels(last, LABEL_GAP, PAD.top + plotH);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (px < PAD.left - 8 || px > PAD.left + plotW + 8 || !dates.length) return;
    const i = Math.round(((px - PAD.left) / (plotW || 1)) * (dates.length - 1));
    const index = Math.min(dates.length - 1, Math.max(0, i));
    setHover(index);
    // The line nearest the pointer on that day, if near enough
    let best: string | null = null;
    let dist = PICK;
    for (const s of series) {
      const p = s.points[index];
      if (!p) continue;
      const dd = Math.abs(y(p.share) - py);
      if (dd < dist) [best, dist] = [s.key, dd];
    }
    onHighlight(best);
  };

  const hovered =
    hover == null
      ? []
      : series
          .map((s) => ({ s, p: s.points[hover] }))
          .filter((v): v is { s: FotmSeries; p: NonNullable<typeof v.p> } => !!v.p)
          .sort((a, b) => b.p.share - a.p.share);

  return (
    <div ref={box} className={styles.chart} data-highlight={on.size ? '' : undefined}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          className={styles.svg}
          role="img"
          aria-label={t('fotm.chartLabel')}
          onPointerMove={onMove}
          onPointerLeave={() => {
            setHover(null);
            onHighlight(null);
          }}
          // A click picks the line under the pointer, as its icon does
          onClick={() => hoveredKey && onPin(hoveredKey)}
        >
          {/* Gridlines and the share axis */}
          {ticks.map((v) => (
            <g key={v} className={styles.tick}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(v / 100)} y2={y(v / 100)} />
              <text x={PAD.left - 8} y={y(v / 100)} dy="0.35em" textAnchor="end">
                {pct(v / 100)}
              </text>
            </g>
          ))}
          {/* The days */}
          {dates.map((d, i) =>
            i % every === 0 || i === dates.length - 1 ? (
              <text
                key={d}
                className={styles.day}
                x={x(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? 'start' : i === dates.length - 1 ? 'end' : 'middle'}
              >
                {dayText(d, 'short')}
              </text>
            ) : null,
          )}
          {hover != null && (
            <line
              className={styles.crosshair}
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
            />
          )}
          {/* The lines, the highlighted ones last (on top) */}
          {[...lines]
            .sort((a, b) => Number(on.has(a.s.key)) - Number(on.has(b.s.key)))
            .map(({ s, d, dots }) => (
              <g
                key={s.key}
                className={styles.series}
                data-class-color={classColorKey(s.classSlug)}
                data-on={on.has(s.key) || undefined}
              >
                <path d={d} />
                {dots.map((i) => (
                  <circle key={i} cx={x(i)} cy={y(s.points[i]!.share)} r={3.5} />
                ))}
                {hover != null && s.points[hover] && (
                  <circle
                    className={styles.marker}
                    cx={x(hover)}
                    cy={y(s.points[hover]!.share)}
                    r={4}
                  />
                )}
              </g>
            ))}
        </svg>
      )}

      {/* The lines' icons at their ends (--y from the data): a click pins the line */}
      {series.map((s, i) => (
        <button
          key={s.key}
          type="button"
          className={styles.end}
          data-on={on.has(s.key) || undefined}
          style={{ '--y': `${labelY[i]}px` } as CSSProperties}
          aria-pressed={pinned.has(s.key)}
          aria-label={itemName(s)}
          title={itemName(s)}
          onClick={() => onPin(s.key)}
          onMouseEnter={() => onHighlight(s.key)}
          onMouseLeave={() => onHighlight(null)}
          onFocus={() => onHighlight(s.key)}
          onBlur={() => onHighlight(null)}
        >
          <FotmIcon item={s.item} />
        </button>
      ))}

      {/* The hovered day's card, anchored at the crosshair's top: --x from the pointer */}
      {hover != null && (
        <>
          <span
            ref={anchor}
            className={styles.anchor}
            style={{ '--x': `${x(hover)}px`, '--y': `${PAD.top}px` } as CSSProperties}
          />
          <HoverCard anchor={anchor} id={cardId}>
            <span className={styles.cardDate}>{dayText(dates[hover]!, 'long')}</span>
            {hovered.length ? (
              <ul className={styles.cardList}>
                {hovered.slice(0, 12).map(({ s, p }) => (
                  <li
                    key={s.key}
                    data-class-color={classColorKey(s.classSlug)}
                    data-on={on.has(s.key) || undefined}
                  >
                    <FotmIcon item={s.item} />
                    <span className={styles.cardName}>{itemName(s)}</span>
                    <span className={styles.cardShare}>{pct(p.share)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={styles.cardNone}>{t('fotm.noDay')}</span>
            )}
          </HoverCard>
        </>
      )}
    </div>
  );
}

/** A line's icon: its spec's, or its hero talent tree's */
export function FotmIcon({ item }: { item: FotmItem }) {
  return item.kind === 'spec' ? (
    <SpecIcon spec={item.sp.id} size="sm" />
  ) : (
    <HeroTalentIcon tree={item.tree.id} size="sm" />
  );
}
