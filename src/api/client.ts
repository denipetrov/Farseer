/**
 * Base HTTP client for the Soulseeker API.
 * Endpoint-specific query functions/hooks will live next to this file
 * (e.g. `api/leaderboards.ts`) once we explore the Soulseeker endpoints.
 */
import { config } from '@/config';

const BASE_URL = config.soulseekerApiUrl;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, BASE_URL || window.location.origin);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new ApiError(res.status, `${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
