import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      // 401s are already renewed and retried once by the API client. 4xx will
      // not change on a retry, and 429/503 say how long to wait (Retry-After),
      // so only network failures and other 5xx are retried.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.status < 500 || error.status === 503)) return false;
        return failureCount < 2;
      },
    },
  },
});
