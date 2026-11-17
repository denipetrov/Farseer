export interface ValidationIssue {
  path: string;
  message: string;
}

/** Any non-2xx answer from Soulseeker, token endpoint included. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    /** OAuth `error` code (`invalid_token`, `invalid_grant`, `too_many_requests`, ...) or `http_<status>` */
    readonly code: string,
    message: string,
    /** From `Retry-After` on 429 and 503 */
    readonly retryAfterSeconds?: number,
    /** Validation problems on a 400 */
    readonly issues?: ValidationIssue[],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: Record<string, unknown> = {};
    try {
      body = (await res.json()) as Record<string, unknown>;
    } catch {
      // not JSON: keep the status line
    }
    const retryAfter = Number(res.headers.get('retry-after'));
    const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
    // OAuth-style codes are snake_case; Nest's `"error": "Not Found"` is not one.
    const oauthCode = str(body.error);

    return new ApiError(
      res.status,
      oauthCode && /^[a-z_]+$/.test(oauthCode) ? oauthCode : `http_${res.status}`,
      str(body.error_description) ?? str(body.message) ?? `${res.status} ${res.statusText}`,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      Array.isArray(body.issues) ? (body.issues as ValidationIssue[]) : undefined,
    );
  }
}
