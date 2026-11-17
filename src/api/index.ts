/** The app's Soulseeker client and token manager, wired from runtime config. */
import { config } from '@/config';
import { createTokenManager } from './auth/tokenManager';
import { createApiClient } from './client';

const baseUrl = config.soulseekerApiUrl || window.location.origin;

const safeStorage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null; // blocked (privacy mode): tokens live in memory
  }
})();

export const auth = createTokenManager({
  tokenUrl: new URL('/oidc/token', baseUrl).toString(),
  clientId: 'soulseeker-web',
  storage: safeStorage,
  locks: typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks : null,
});

export const api = createApiClient({ baseUrl, auth });

export { ApiError } from './errors';
export type { QueryParams } from './client';
