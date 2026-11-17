import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Page, PageTitle, Muted } from '@/components/Page';

export interface RouterContext {
  queryClient: QueryClient;
}

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ]);
      return {
        default: () => (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ),
      };
    })
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => (
    <Page>
      <PageTitle>Not found</PageTitle>
      <Muted>The page you are looking for does not exist.</Muted>
    </Page>
  ),
  errorComponent: ({ error }) => (
    <Page>
      <PageTitle>Something went wrong</PageTitle>
      <Muted>{error instanceof Error ? error.message : String(error)}</Muted>
    </Page>
  ),
});

function RootLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  );
}
