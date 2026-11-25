import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { Page, PageTitle, Muted } from '@/components/Page';
import { resolveLocaleSlug } from '@/i18n/locales';
import { preferredLocale } from '@/i18n/preferredLocale';
import { useI18n } from '@/i18n/useI18n';

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
  /**
   * Every page lives under a language. A path whose first segment names none (`/pvp`,
   * `/character/eu/x/y`, an old link) gets the preferred language put in front. Here, not in
   * the `$locale` route: a path like `/character/eu/x/y` matches no route under `$locale`, so
   * its checks would never run. `/` is the index route's own redirect.
   */
  beforeLoad: ({ location }) => {
    const first = location.pathname.split('/')[1];
    if (first && !resolveLocaleSlug(first)) {
      throw redirect({
        href: `/${preferredLocale()}${location.pathname}${location.searchStr}`,
        replace: true,
      });
    }
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
