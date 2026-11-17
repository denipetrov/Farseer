import { beforeEach, describe, expect, it } from 'vitest';
import { createTokenManager, type TokenManagerOptions } from './tokenManager';
import { ApiError } from '../errors';

const TOKEN_URL = 'http://api.test/oidc/token';
const KEY = 'test:auth';

/** A token endpoint that behaves like Soulseeker's: refresh tokens rotate, reuse revokes. */
function fakeSoulseeker() {
  let seq = 0;
  const liveRefreshTokens = new Set<string>();
  const calls: string[] = [];
  let failNextWith: number | null = null;

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const issue = () => {
    seq += 1;
    const refresh = `rt-${seq}`;
    liveRefreshTokens.add(refresh);
    return json(200, {
      access_token: `at-${seq}`,
      refresh_token: refresh,
      expires_in: 600,
      token_type: 'Bearer',
    });
  };

  const fetch: typeof globalThis.fetch = async (_url, init) => {
    const form = new URLSearchParams(String(init?.body));
    const grant = form.get('grant_type')!;
    calls.push(grant === 'refresh_token' ? `refresh:${form.get('refresh_token')}` : 'anonymous');
    await Promise.resolve(); // let concurrent callers pile up

    if (failNextWith) {
      const status = failNextWith;
      failNextWith = null;
      return json(status, { error: 'server_error', error_description: 'down' });
    }
    if (grant === 'refresh_token') {
      const rt = form.get('refresh_token')!;
      if (!liveRefreshTokens.delete(rt)) {
        liveRefreshTokens.clear(); // reuse revokes the session
        return json(400, { error: 'invalid_grant', error_description: 'grant request is invalid' });
      }
    }
    return issue();
  };

  return {
    fetch,
    calls,
    failNext: (status: number) => {
      failNextWith = status;
    },
  };
}

/** Serialises callbacks per lock name, like navigator.locks. */
function fakeLocks(): LockManager {
  const tails = new Map<string, Promise<unknown>>();
  return {
    request: ((name: string, cb: () => Promise<unknown>) => {
      const run = (tails.get(name) ?? Promise.resolve()).then(cb, cb);
      tails.set(
        name,
        run.catch(() => undefined),
      );
      return run;
    }) as LockManager['request'],
    query: async () => ({ held: [], pending: [] }),
  };
}

describe('token manager', () => {
  let server: ReturnType<typeof fakeSoulseeker>;
  let clock: number;

  const make = (extra: Partial<TokenManagerOptions> = {}) =>
    createTokenManager({
      tokenUrl: TOKEN_URL,
      clientId: 'soulseeker-web',
      fetch: server.fetch,
      storage: localStorage,
      storageKey: KEY,
      now: () => clock,
      ...extra,
    });

  beforeEach(() => {
    localStorage.clear();
    server = fakeSoulseeker();
    clock = 1_000_000;
  });

  it('gets an anonymous token on first use and reuses it while fresh', async () => {
    const auth = make();
    expect(await auth.getAccessToken()).toBe('at-1');
    expect(await auth.getAccessToken()).toBe('at-1');
    expect(server.calls).toEqual(['anonymous']);
  });

  it('shares one grant between concurrent callers', async () => {
    const auth = make();
    const tokens = await Promise.all([1, 2, 3, 4].map(() => auth.getAccessToken()));
    expect(new Set(tokens)).toEqual(new Set(['at-1']));
    expect(server.calls).toEqual(['anonymous']);
  });

  it('refreshes shortly before expiry, using the rotated refresh token each time', async () => {
    const auth = make();
    await auth.getAccessToken();

    clock += 571_000; // 29 s left: inside the 30 s margin
    expect(await auth.getAccessToken()).toBe('at-2');
    clock += 600_000;
    expect(await auth.getAccessToken()).toBe('at-3');

    expect(server.calls).toEqual(['anonymous', 'refresh:rt-1', 'refresh:rt-2']);
  });

  it('survives a reload: a new instance uses the stored tokens', async () => {
    await make().getAccessToken();
    expect(await make().getAccessToken()).toBe('at-1');
    expect(server.calls).toEqual(['anonymous']);
  });

  it('renews once when several requests are rejected with the same token', async () => {
    const auth = make();
    const rejected = await auth.getAccessToken();

    const retried = await Promise.all([1, 2, 3].map(() => auth.handleUnauthorized(rejected)));
    expect(new Set(retried)).toEqual(new Set(['at-2']));
    // A late 401 for the old token reuses the renewed one
    expect(await auth.handleUnauthorized(rejected)).toBe('at-2');
    expect(server.calls).toEqual(['anonymous', 'refresh:rt-1']);
  });

  it('starts a new anonymous session when the refresh token is dead', async () => {
    const auth = make();
    await auth.getAccessToken();
    // Someone else used rt-1 (e.g. a stale copy), so the session is revoked.
    localStorage.setItem(
      KEY,
      JSON.stringify({ accessToken: 'at-1', refreshToken: 'rt-gone', expiresAt: clock }),
    );

    expect(await auth.handleUnauthorized('at-1')).toBe('at-2');
    expect(server.calls).toEqual(['anonymous', 'refresh:rt-gone', 'anonymous']);
  });

  it('keeps the refresh token when renewal fails for another reason', async () => {
    const auth = make();
    await auth.getAccessToken();
    clock += 600_000;

    server.failNext(503);
    await expect(auth.getAccessToken()).rejects.toMatchObject({ status: 503 });
    expect(await auth.getAccessToken()).toBe('at-2'); // rt-1 was still good
    expect(server.calls).toEqual(['anonymous', 'refresh:rt-1', 'refresh:rt-1']);
  });

  it('surfaces token endpoint errors as ApiError', async () => {
    server.failNext(500);
    const err = await make()
      .getAccessToken()
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 500, code: 'server_error', message: 'down' });
  });

  it('two tabs never refresh with the same refresh token', async () => {
    const locks = fakeLocks();
    const tabA = make({ locks });
    const tabB = make({ locks });
    await tabA.getAccessToken();
    await tabB.getAccessToken(); // adopts at-1 from storage, no request

    clock += 600_000; // both expired; both renew at once
    const [a, b] = await Promise.all([tabA.getAccessToken(), tabB.getAccessToken()]);

    expect(a).toBe('at-2');
    expect(b).toBe('at-2'); // B waited for the lock, then adopted A's token
    expect(server.calls).toEqual(['anonymous', 'refresh:rt-1']);
  });

  it('clear() forgets the session', async () => {
    const auth = make();
    await auth.getAccessToken();
    auth.clear();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(await auth.getAccessToken()).toBe('at-2');
    expect(server.calls).toEqual(['anonymous', 'anonymous']);
  });
});
