import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { usePveCatalogue } from '@/api/pve';
import { AppLayout } from '@/components/AppLayout';
import { Page, PageTitle, Muted } from '@/components/Page';
import { preferredLocale } from '@/i18n/preferredLocale';
import { useI18n } from '@/i18n/useI18n';
import { canonicalPath } from '@/lib/sitePath';
import { useGameMode } from '@/preferences/useGameMode';

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
            {/* Bottom left, beside React Query's button: bottom right is the back-to-top button */}
            <TanStackRouterDevtools
              position="bottom-left"
              toggleButtonProps={{ style: { left: '84px' } }}
            />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </>
        ),
      };
    })
  : () => null;

export const Route = createRootRouteWithContext<RouterContext>()({
  /**
   * Every page lives under its game and language: `/retail/en/pvp/…`. Any other address (an
   * old `/en/pvp/…` link, `/pvp`, `/forever/…` while Forever is off, `/retail/de_DE/…`) is
   * redirected to its canonical form (`canonicalPath`). Here, not in a child route: a path
   * that matches no route would never reach a child's checks. `/` is the index route's own.
   */
  beforeLoad: ({ location }) => {
    const path = canonicalPath(location.pathname, preferredLocale());
    if (path) throw redirect({ href: `${path}${location.searchStr}`, replace: true });
  },
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => <ErrorPage error={error} />,
});

function NotFound() {
  const { t } = useI18n();
  return (
    <Page>
      <PageTitle>{t('page.notFound.title')}</PageTitle>
      <Muted>{t('page.notFound.text')}</Muted>
    </Page>
  );
}

function ErrorPage({ error }: { error: unknown }) {
  const { t } = useI18n();
  return (
    <Page>
      <PageTitle>{t('page.error.title')}</PageTitle>
      <Muted>{error instanceof Error ? error.message : String(error)}</Muted>
    </Page>
  );
}

function RootLayout() {
  const [mode] = useGameMode();
  // Raids and Mythic+ seasons: needed across the PvE side (menu, pages), fetched on entering it
  usePveCatalogue(mode === 'pve');
  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  );
}
