/**
 * Optical sizing for single-colour icons. Every icon is drawn in the same square, but a
 * tall, thin shape (a helm, a sword) covers far less of it than a wide one (a podium, a
 * graph) and reads as smaller. These factors draw the narrow ones larger, so all icons look
 * the same size. The art is never stretched or cropped; only its scale changes, and the
 * layout box stays the same.
 *
 * Measured 2026-11-26 (the user chose "equal visual size"): each SVG rendered at 256px, the
 * box its drawing covers as a share of the canvas (width × height), then
 *   factor = min(1.4, 0.87 / √(width × height))
 * where 0.87 is a typical full icon. Factors under 1.02 are left out.
 *
 *   nav/character        0.39 × 0.97  → 1.40   pvp/brackets/svg/shuffle 0.24 × 0.91 → 1.40
 *   nav/flavour-of-the-month 0.69 × 0.84 → 1.14  nav/archives        0.69 × 0.92 → 1.09
 *   nav/talents          0.73 × 0.88  → 1.09   pvp/brackets/svg/blitz   0.93 × 0.71 → 1.07
 *   pvp/brackets/svg/2v2 0.96 × 0.72  → 1.05
 *
 * Re-measure when an icon is added or redrawn (SKILLS.md, "The left menu").
 */
export const ICON_OPTICAL_SCALE: Readonly<Record<string, number>> = {
  'nav/character': 1.4,
  'pvp/brackets/svg/shuffle': 1.4,
  'nav/flavour-of-the-month': 1.14,
  'nav/archives': 1.09,
  'nav/talents': 1.09,
  'pvp/brackets/svg/blitz': 1.07,
  'pvp/brackets/svg/2v2': 1.05,
};

/** How much larger to draw an icon (by its path under `icons/`) so it looks as big as the rest. */
export const opticalScale = (icon: string): number => ICON_OPTICAL_SCALE[icon] ?? 1;
