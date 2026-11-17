/**
 * Soulseeker access tokens: get, keep, renew.
 *
 * - Anonymous grant on first use; refresh grant when the access token is about
 *   to expire (it lives 600 s) or the API rejects it.
 * - Refresh tokens rotate on every use and a reused one revokes the session, so
 *   a refresh must never run twice with the same token:
 *     - within a tab, concurrent callers share one in-flight renewal;
 *     - across tabs, renewals take turns under a Web Lock, and a tab adopts a
 *       token another tab already stored instead of refreshing again.
 * - Tokens are persisted, so a reload does not spend a new anonymous grant
 *   (Soulseeker allows 10 issuances per IP per minute).
 * - A dead session (refresh answers 400 invalid_grant) falls back to a new
 *   anonymous grant.
 */
import { ApiError } from '../errors';

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  /** Epoch ms */
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface TokenManagerOptions {
  /** e.g. https://api.rankwarden.gg/oidc/token */
  tokenUrl: string;
  clientId: string;
  fetch?: typeof fetch;
  /** null = keep tokens in memory only */
  storage?: Storage | null;
  storageKey?: string;
  locks?: LockManager | null;
  now?: () => number;
  /** Renew this long before expiry, so a token never expires in flight */
  expiryMarginMs?: number;
}

export interface TokenManager {
  /** A valid access token, renewing first if needed. */
  getAccessToken(): Promise<string>;
  /** The API answered 401 to `rejected`: returns the token to retry with. */
  handleUnauthorized(rejected: string): Promise<string>;
  /** Forget the session locally (e.g. logout). */
  clear(): void;
}

const ANONYMOUS_GRANT = 'urn:soulseeker:grant-type:anonymous';

export function createTokenManager(options: TokenManagerOptions): TokenManager {
  const {
    tokenUrl,
    clientId,
    fetch: fetchFn = (...args) => globalThis.fetch(...args),
    storage = null,
    storageKey = 'farseer:auth',
    locks = null,
    now = Date.now,
    expiryMarginMs = 30_000,
  } = options;

  let current: TokenSet | null = load();
  let inflight: Promise<TokenSet> | null = null;

  // Another tab renewed: pick its tokens up so we never refresh with a used one.
  if (storage && typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey) current = load();
    });
  }

  function load(): TokenSet | null {
    if (!storage) return current;
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return null;
      const t = JSON.parse(raw) as Partial<TokenSet>;
      return typeof t.accessToken === 'string' && typeof t.expiresAt === 'number'
        ? {
            accessToken: t.accessToken,
            refreshToken: t.refreshToken ?? null,
            expiresAt: t.expiresAt,
          }
        : null;
    } catch {
      return null;
    }
  }

  function save(tokens: TokenSet | null): TokenSet | null {
    current = tokens;
    try {
      if (tokens) storage?.setItem(storageKey, JSON.stringify(tokens));
      else storage?.removeItem(storageKey);
    } catch {
      // storage full or disabled: memory still works for this tab
    }
    return tokens;
  }

  const isFresh = (t: TokenSet | null): t is TokenSet =>
    !!t && t.expiresAt - expiryMarginMs > now();

  async function requestToken(params: Record<string, string>): Promise<TokenSet> {
    const res = await fetchFn(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ client_id: clientId, ...params }),
    });
    if (!res.ok) throw await ApiError.fromResponse(res);
    const body = (await res.json()) as TokenResponse;
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token ?? null,
      expiresAt: now() + body.expires_in * 1000,
    };
  }

  async function renewUnderLock(rejected?: string): Promise<TokenSet> {
    // Read storage, not memory: another tab may have renewed while we waited.
    const latest = storage ? load() : current;
    if (isFresh(latest) && latest.accessToken !== rejected) {
      current = latest;
      return latest;
    }

    if (latest?.refreshToken) {
      try {
        return save(
          await requestToken({ grant_type: 'refresh_token', refresh_token: latest.refreshToken }),
        )!;
      } catch (err) {
        // 400 invalid_grant: the session is gone (expired, revoked, or the token
        // was reused). Anything else (network, 429, 5xx) is passed on as is.
        if (!(err instanceof ApiError && err.status === 400)) throw err;
        save(null);
      }
    }

    return save(await requestToken({ grant_type: ANONYMOUS_GRANT }))!;
  }

  function renew(rejected?: string): Promise<TokenSet> {
    inflight ??= (
      locks
        ? locks.request(`${storageKey}:renew`, () => renewUnderLock(rejected))
        : renewUnderLock(rejected)
    ).finally(() => {
      inflight = null;
    });
    return inflight;
  }

  return {
    async getAccessToken() {
      if (isFresh(current)) return current.accessToken;
      return (await renew()).accessToken;
    },

    async handleUnauthorized(rejected) {
      // Another request already renewed: just retry with the new token.
      if (isFresh(current) && current.accessToken !== rejected) return current.accessToken;
      return (await renew(rejected)).accessToken;
    },

    clear() {
      save(null);
    },
  };
}
