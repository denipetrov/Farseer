/**
 * A page typed by the visitor (`"42"`, `" 7 "`, `"1e3"`), as a page between 1 and `last`:
 * out-of-range numbers are brought to the nearest end. Null for anything that isn't a whole
 * number (empty, letters), so nothing happens.
 */
export function typedPage(input: string, last: number): number | null {
  const v = input.trim();
  if (!/^\d+$/.test(v)) return null;
  return Math.min(Math.max(1, Number(v)), Math.max(1, last));
}
