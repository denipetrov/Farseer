import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './client';
import { ApiError } from './errors';
import type { TokenManager } from './auth/tokenManager';

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const unauthorized = (error: string) =>
  json(
    401,
    { error, error_description: 'nope' },
    { 'www-authenticate': `Bearer error="${error}"` },
  );

function setup(...responses: Response[]) {
  const auth: TokenManager = {
    getAccessToken: vi.fn(async () => 'token-1'),
    handleUnauthorized: vi.fn(async () => 'token-2'),
    clear: vi.fn(),
  };
  const fetch = vi.fn<typeof globalThis.fetch>();
  for (const r of responses) fetch.mockResolvedValueOnce(r);
  const api = createApiClient({ baseUrl: 'http://api.test', auth, fetch });
  const authHeader = (call: number) =>
    (fetch.mock.calls[call]![1]!.headers as Record<string, string>).Authorization;
  return { api, auth, fetch, authHeader };
}

describe('api client', () => {
  it('sends the bearer token and builds the query string', async () => {
    const { api, fetch, authHeader } = setup(json(200, { ok: true }));

    expect(
      await api.get('/pvp/leaderboard', { region: 'eu', seasonId: 42, class: undefined }),
    ).toEqual({ ok: true });
    expect(String(fetch.mock.calls[0]![0])).toBe(
      'http://api.test/pvp/leaderboard?region=eu&seasonId=42',
    );
    expect(authHeader(0)).toBe('Bearer token-1');
  });

  it('on an expired token: renews once and retries with the new token', async () => {
    const { api, auth, fetch, authHeader } = setup(
      unauthorized('invalid_token'),
      json(200, { subject: 'anon:1' }),
    );

    expect(await api.get('/session')).toEqual({ subject: 'anon:1' });
    expect(auth.handleUnauthorized).toHaveBeenCalledWith('token-1');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(authHeader(1)).toBe('Bearer token-2');
  });

  it('gives up after one retry', async () => {
    const { api, fetch } = setup(unauthorized('invalid_token'), unauthorized('invalid_token'));

    await expect(api.get('/session')).rejects.toMatchObject({ status: 401, code: 'invalid_token' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not renew on insufficient_scope', async () => {
    const { api, auth, fetch } = setup(unauthorized('insufficient_scope'));

    await expect(api.get('/session')).rejects.toMatchObject({ code: 'insufficient_scope' });
    expect(auth.handleUnauthorized).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('maps error bodies to ApiError', async () => {
    const { api } = setup(
      json(400, {
        message: 'Invalid query',
        issues: [{ path: 'seasonId', message: 'is required' }],
      }),
    );
    const err = await api.get('/pvp/leaderboard').catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 400,
      code: 'http_400',
      message: 'Invalid query',
      issues: [{ path: 'seasonId', message: 'is required' }],
    });
  });

  it('reads Retry-After on 503', async () => {
    const { api } = setup(json(503, { message: 'budget spent' }, { 'retry-after': '60' }));
    await expect(api.get('/pve/character')).rejects.toMatchObject({
      status: 503,
      retryAfterSeconds: 60,
    });
  });
});
