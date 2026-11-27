import type { CSSProperties } from 'react';
import { RoleIcon } from '@/components/RoleIcon';
import styles from './RolePie.module.css';

export type PieRole = 'melee' | 'ranged' | 'healer' | 'tank';

export interface PieSlice {
  role: PieRole;
  count: number;
  /** "Melee 25 (53%)": the slice's hover text */
  label: string;
}

/** Slices smaller than this share of the pie have no room for their icon (the legend has it) */
const ICON_MIN_SHARE = 0.08;
const R = 48;
const ICON_R = 29;

/** A point on the circle at a share of a turn, clockwise from 12 o'clock (viewBox 0–100) */
const at = (share: number, r: number) => {
  const a = share * 2 * Math.PI - Math.PI / 2;
  return { x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a) };
};

/**
 * The role split as a pie (the user's request, 2026-11-27): each role's slice in its colour
 * (`--color-role-*`, from data-role) with its role icon on it, so a role is never told by
 * colour alone (red and green melee/healer sit close for colour-blind readers). A 2px gap in
 * the surface colour between slices. The slice's count and share on hover; the legend beside
 * it names them in text. Slices start at 12 o'clock, in the order given.
 */
export function RolePie({ slices }: { slices: PieSlice[] }) {
  const parts = slices.filter((s) => s.count > 0);
  const total = parts.reduce((n, s) => n + s.count, 0);
  if (!total) return null;

  // Each slice's start, as a share of the turn: the shares before it
  const starts = parts.map((_, i) => parts.slice(0, i).reduce((n, p) => n + p.count / total, 0));
  const shapes = parts.map((s, i) => {
    const share = s.count / total;
    const from = starts[i] ?? 0;
    const to = from + share;
    const a = at(from, R);
    const b = at(to, R);
    const mid = at(from + share / 2, ICON_R);
    return {
      ...s,
      share,
      mid,
      // The whole pie is a circle: an arc can't start and end at the same point
      d:
        share >= 1
          ? null
          : `M50 50 L${a.x} ${a.y} A${R} ${R} 0 ${share > 0.5 ? 1 : 0} 1 ${b.x} ${b.y} Z`,
    };
  });

  return (
    <div className={styles.pie}>
      <svg viewBox="0 0 100 100" className={styles.svg} role="img" aria-hidden>
        {shapes.map((s) =>
          s.d ? (
            <path key={s.role} d={s.d} data-role={s.role} className={styles.slice}>
              <title>{s.label}</title>
            </path>
          ) : (
            <circle key={s.role} cx={50} cy={50} r={R} data-role={s.role} className={styles.slice}>
              <title>{s.label}</title>
            </circle>
          ),
        )}
      </svg>
      {/* The icons over their slices' middles: --x and --y (percent) come from the data */}
      {shapes
        .filter((s) => s.share >= ICON_MIN_SHARE)
        .map((s) => (
          <span
            key={s.role}
            className={styles.icon}
            style={
              {
                '--x': `${s.share >= 1 ? 50 : s.mid.x}%`,
                '--y': `${s.share >= 1 ? 50 : s.mid.y}%`,
              } as CSSProperties
            }
            aria-hidden
          >
            <PieRoleIcon role={s.role} />
          </span>
        ))}
    </div>
  );
}

/** The role's icon: melee and ranged are damage dealers of that reach */
export function PieRoleIcon({ role }: { role: PieRole }) {
  return role === 'melee' || role === 'ranged' ? (
    <RoleIcon role="dps" subRole={role} size="sm" />
  ) : (
    <RoleIcon role={role} size="sm" />
  );
}
