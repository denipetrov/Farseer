/**
 * The logic of IconFilter, apart from its looks: which rows a picked path shows, and the
 * path a click makes.
 */
export interface FilterNode {
  id: string;
  children?: readonly FilterNode[];
}

/** The rows shown for a path: the top one, then the children of each pick that has any */
export function filterRows<T extends FilterNode>(
  options: readonly T[],
  path: readonly string[],
): { choices: readonly T[]; picked: string | undefined }[] {
  const rows: { choices: readonly T[]; picked: string | undefined }[] = [];
  let choices: readonly T[] | undefined = options;
  for (let level = 0; choices?.length; level++) {
    const picked: T | undefined = choices.find((c) => c.id === path[level]);
    rows.push({ choices, picked: picked?.id });
    choices = picked?.children as readonly T[] | undefined;
  }
  return rows;
}

/** A click on `id` in row `level`: picks it (dropping deeper picks), or unpicks it if picked */
export const nextFilterPath = (path: readonly string[], level: number, id: string): string[] =>
  path[level] === id ? path.slice(0, level) : [...path.slice(0, level), id];
