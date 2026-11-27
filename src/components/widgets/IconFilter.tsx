import type { ReactNode } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { filterRows, nextFilterPath } from '@/lib/filterPath';
import { WidgetFrame } from './Widget';
import styles from './IconFilter.module.css';

/**
 * One choice in an icon filter: what it is (`id`, the value it puts in the path), its name
 * (the button's accessible name and hover text), its picture, and the choices below it.
 */
export interface FilterOption {
  id: string;
  label: string;
  icon: ReactNode;
  children?: readonly FilterOption[];
  /**
   * The kind of choice it is, when a row mixes kinds (the classes, then the roles): a thin
   * divider goes between groups. Still one pick per row.
   */
  group?: string;
}

/**
 * A filter of icon rows, for any tree of choices (the user's design, 2026-11-27): class →
 * spec, class → role, dungeons, raid → boss…
 *
 * The first row holds the top choices. Picking one brightens it, dims the rest of its row,
 * and opens a row of its children below; and so on, as deep as the tree goes. Picking the
 * picked one again unpicks it (and everything below); the × clears the whole filter.
 *
 * `value` is the picked path, top first (`['mage', 'fire']`, `[]` for none); `onChange`
 * gets the new one. `levels` names each row for screen readers ("Class", "Specialization").
 */
export function IconFilter({
  options,
  value,
  onChange,
  levels,
  label,
}: {
  options: readonly FilterOption[];
  value: readonly string[];
  onChange: (path: string[]) => void;
  levels: readonly string[];
  /** The filter's name for screen readers ("Filter the leaderboard") */
  label: string;
}) {
  const { t } = useI18n();

  const rows = filterRows(options, value);
  const pick = (level: number, id: string) => onChange(nextFilterPath(value, level, id));

  return (
    <WidgetFrame size="large" className={styles.frame} aria-label={label}>
      {rows.map(({ choices, picked }, level) => (
        <div
          key={level}
          className={styles.row}
          // The top row's icons are a little larger than the rows below (the user, 2026-11-27)
          data-level={Math.min(level, 1)}
          role="group"
          aria-label={levels[level] ?? levels.at(-1)}
        >
          {choices.map((c, i) => [
            // A divider where the row moves to another group (classes | roles)
            i > 0 && c.group !== choices[i - 1]!.group && (
              <span key={`divider-${c.id}`} className={styles.divider} aria-hidden />
            ),
            <button
              key={c.id}
              type="button"
              className={styles.choice}
              aria-pressed={picked === c.id}
              aria-label={c.label}
              title={c.label}
              // The rest of a row with a pick is dimmed (the user's design)
              data-dimmed={(picked !== undefined && picked !== c.id) || undefined}
              onClick={() => pick(level, c.id)}
            >
              {c.icon}
            </button>,
          ])}
          {/* The ×, at the end of the deepest row, once something is picked */}
          {level === rows.length - 1 && value.length > 0 && (
            <button
              type="button"
              className={styles.clear}
              aria-label={t('filter.clear')}
              title={t('filter.clear')}
              onClick={() => onChange([])}
            >
              {/* Drawn in CSS: a font's × sits off its box's centre */}
              <span className={styles.cross} aria-hidden />
            </button>
          )}
        </div>
      ))}
    </WidgetFrame>
  );
}
