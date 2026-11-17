/**
 * Display sizes for game icons (races, classes, later specs). Every family uses the
 * same scale, so icons line up side by side whatever their source files are.
 *
 *   sm  24px  inline with text: table rows, lists, tooltips
 *   md  40px  clickable: filter pickers. The button around it adds padding to reach
 *             a 48px hit target (WCAG 2.5.5 asks 44px; Material uses 48px)
 *   lg  64px  feature: character and guild headers
 *
 * Source files should be 128x128, twice the largest size, so they stay sharp on
 * high-density (2x) screens.
 */
export const ICON_SIZES = { sm: 24, md: 40, lg: 64 } as const;
export type IconSize = keyof typeof ICON_SIZES;
