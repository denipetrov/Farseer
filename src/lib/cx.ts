/** Joins class names, skipping empty ones: `cx(styles.row, active && styles.active)`. */
export const cx = (...names: (string | false | null | undefined)[]): string =>
  names.filter(Boolean).join(' ');
