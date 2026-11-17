import { queryOptions } from '@tanstack/react-query';
import { api } from '.';

/** GET /session: who the current token says we are. */
export interface Session {
  subject: string;
  anonymous: boolean;
  scopes: string[];
}

export const sessionQuery = queryOptions({
  queryKey: ['session'],
  queryFn: ({ signal }) => api.get<Session>('/session', undefined, signal),
  staleTime: 5 * 60_000,
});
