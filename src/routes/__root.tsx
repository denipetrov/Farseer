import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import styled from 'styled-components';
import { usePveCatalogue } from '@/api/pve';
import { AppFooter } from '@/components/AppFooter';
import { AppHeader } from '@/components/AppHeader';
import { hasSideNav } from '@/components/nav/pvpNav';
import { SideNav } from '@/components/nav/SideNav';
import { ScrollTopButton } from '@/components/ScrollTopButton';
import { Page, PageTitle, Muted } from '@/components/Page';
import { resolveLocaleSlug } from '@/i18n/locales';
import { preferredLocale } from '@/i18n/preferredLocale';
import { useI18n } from '@/i18n/useI18n';
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
  const [mode] = useGameMode();
  // Raids and Mythic+ seasons: needed across the PvE side (menu, pages), fetched on entering it
  usePveCatalogue(mode === 'pve');
  return (
    <>
      <AppHeader />
      <Body>
        {hasSideNav(mode) && (
          <Sidebar>
            <SidebarInner>
              <SideNav />
            </SidebarInner>
          </Sidebar>
        )}
        <Content>
          <Outlet />
        </Content>
      </Body>
      <AppFooter />
      <ScrollTopButton />
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  );
}

/** Grows between header and footer, so the footer sits at the bottom of short pages */
const Body = styled.div`
  display: flex;
  flex: 1 0 auto;
`;

/**
 * Desktop: the mode's left menu. The column runs the full height between header and
 * footer (so its border never stops short); the menu inside stays in view below the sticky
 * header (whose height the header publishes as --header-height) and scrolls on its own if
 * taller than the window. Mobile: hidden, the menu is in the header's drawer.
 */
const Sidebar = styled.aside`
  flex: none;
  width: 17.5rem;
  border-right: 1px solid var(--color-trim-muted);

  @media (max-width: 820px) {
    display: none;
  }
`;

const SidebarInner = styled.div`
  position: sticky;
  top: var(--header-height, 90px);
  max-height: calc(100vh - var(--header-height, 90px));
  overflow-y: auto;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;
