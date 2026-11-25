import { Link } from '@tanstack/react-router';
import styled from 'styled-components';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import { FactionToggle } from './FactionToggle';
import { AssetStyleToggle } from './header/AssetStyleToggle';
import { GameModeToggle } from './header/GameModeToggle';
import { LanguageSelect } from './header/LanguageSelect';
import { MobileMenu } from './header/MobileMenu';
import { SearchBar } from './header/SearchBar';

/**
 * Desktop: left, the logo (home of the current game mode), the language dropdown and the
 * PvP / PvE switch; centre, the search; right, the icon style and faction switches. Three
 * grid columns, the outer two equal, so the search stays centred whatever the sides hold.
 * Below 1100px the search moves to a row of its own.
 *
 * Mobile (820px and below): the menu button and the search only. Everything else is in the
 * menu's drawer, one below the other (`MobileMenu`), with the left menu once it exists.
 */
export function AppHeader() {
  const [mode] = useGameMode();
  const { locale, t } = useI18n();

  return (
    <Header>
      <Inner>
        <Menu>
          <MobileMenu />
        </Menu>

        <Start>
          <Brand to={`/${locale.slug}/${mode}`} aria-label={t('app.home')}>
            <img src={logoUrl} alt="Rankwarden" />
          </Brand>
          <LanguageSelect />
          <GameModeToggle />
        </Start>

        <Center>
          <SearchBar />
        </Center>

        <End>
          <AssetStyleToggle />
          <Divider aria-hidden />
          <FactionToggle />
        </End>
      </Inner>
    </Header>
  );
}

const Header = styled.header`
  --header-bg: var(--color-surface);

  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--header-bg);
  border-bottom: 1px solid var(--color-trim-muted);
  box-shadow: inset 0 -2px 0 var(--color-accent);
`;

const Inner = styled.div`
  display: grid;
  /* The sides never shrink below their content, so nothing overlaps the search */
  grid-template-columns: minmax(max-content, 1fr) minmax(16rem, 36rem) minmax(max-content, 1fr);
  grid-template-areas: 'start center end';
  align-items: center;
  gap: var(--space-4) var(--space-6);
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-2) var(--space-6);

  /* Too narrow for three columns: search on a row of its own */
  @media (max-width: 1100px) {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'start end'
      'center center';
    padding-bottom: var(--space-3);
  }

  /* Mobile: the menu button, then the search, on one row */
  @media (max-width: 820px) {
    grid-template-columns: auto 1fr;
    grid-template-areas: 'menu center';
    column-gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
  }
`;

/** The mobile menu button: only on mobile */
const Menu = styled.div`
  grid-area: menu;
  display: none;

  @media (max-width: 820px) {
    display: flex;
  }
`;

const Start = styled.div`
  grid-area: start;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;

  /* Mobile: in the menu's drawer instead */
  @media (max-width: 820px) {
    display: none;
  }
`;

const Center = styled.div`
  grid-area: center;
  min-width: 0;
`;

const End = styled.div`
  grid-area: end;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);

  /* Mobile: in the menu's drawer instead */
  @media (max-width: 820px) {
    display: none;
  }
`;

const Brand = styled(Link)`
  display: flex;
  flex: none;
  border-radius: var(--radius-md);

  img {
    display: block;
    height: 52px;
    width: auto;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 32px;
  background: var(--color-trim-muted);
`;
