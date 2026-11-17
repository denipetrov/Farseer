/**
 * Soulseeker HTTP client. Every request carries a bearer token; a 401 renews
 * the token once and retries once.
 */
import { ApiError } from './errors';
import type { TokenManager } from './auth/tokenManager';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface ApiClientOptions {
  baseUrl: string;
  auth: TokenManager;
  fetch?: typeof fetch;
}

export interface ApiClient {
  get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T>;
}

export function createApiClient({ baseUrl, auth, fetch: fetchFn }: ApiClientOptions): ApiClient {
  const doFetch = fetchFn ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));

  const send = (url: URL, token: string, signal?: AbortSignal) =>
    doFetch(url, {
      signal,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });

  return {
    async get<T>(path: string, params?: QueryParams, signal?: AbortSignal): Promise<T> {
      const url = new URL(path, baseUrl);
      for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
      }

      let token = await auth.getAccessToken();
      let res = await send(url, token, signal);

      // Expired or revoked token: renew and retry once. A scope problem would
      // not be fixed by a new token, so it is not retried.
      if (
        res.status === 401 &&
        !res.headers.get('www-authenticate')?.includes('insufficient_scope')
      ) {
        token = await auth.handleUnauthorized(token);
        res = await send(url, token, signal);
      }

      if (!res.ok) throw await ApiError.fromResponse(res);
      return (await res.json()) as T;
    },
  };
}
