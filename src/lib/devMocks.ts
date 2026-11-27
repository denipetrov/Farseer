/**
 * Mocked data for pages Rankwarden can't fill yet, on localhost only (the user, 2026-11-27):
 * dev builds served from this machine, never production (`import.meta.env.DEV` is false
 * there, so this all folds away). Off by default; the page's toggle turns it on, kept in
 * localStorage. The mocks themselves live in `src/api/mocks/` and are loaded on demand.
 */
const KEY = 'farseer:dev-mock-fotm';

/** Whether this is a dev build on localhost: the only place the mock toggle shows */
export const DEV_MOCKS_AVAILABLE =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

/** The FOTM history mock is on (localhost only) */
export function readMockFotm(): boolean {
  if (!DEV_MOCKS_AVAILABLE) return false;
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function writeMockFotm(on: boolean): void {
  if (!DEV_MOCKS_AVAILABLE) return;
  try {
    if (on) window.localStorage.setItem(KEY, '1');
    else window.localStorage.removeItem(KEY);
  } catch {
    // storage off: the toggle lasts the visit
  }
}
