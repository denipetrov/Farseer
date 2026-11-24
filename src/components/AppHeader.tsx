import { Link } from '@tanstack/react-router';
import styled from 'styled-components';
import emblemUrl from '@/assets/images/logo/rankwarden-emblem.svg';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useGameMode } from '@/preferences/useGameMode';
import { FactionToggle } from './FactionToggle';
import { AssetStyleToggle } from './header/AssetStyleToggle';
import { GameModeToggle } from './header/GameModeToggle';
import { SearchBar } from './header/SearchBar';

/**
 * Left: the logo (home of the current game mode) and the PvP / PvE switch.
 * Centre: the search. Right: the icon style and faction switches.
 *
 * Three grid columns, the outer two equal, so the search stays centred whatever the
 * sides hold. Below `--header-stack` the search moves to a row of its own.
 */
export function AppHeader() {
  const [mode] = useGameMode();

  return (
    <Header>
      <Inner>
        <Start>
          <Brand to={`/${mode}`} aria-label="Rankwarden home">
            <picture>
              <source media="(max-width: 600px)" srcSet={emblemUrl} />
              <img src={logoUrl} alt="Rankwarden" />
            </picture>
          </Brand>
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

  @media (max-width: 600px) {
    padding-inline: var(--space-3);
    column-gap: var(--space-2);
  }
`;

const Start = styled.div`
  grid-area: start;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;

  /* Phones: the mode art drops to the middle size so both sides fit one row */
  @media (max-width: 600px) {
    gap: var(--space-2);

    [role='radiogroup'] {
      --toggle-icon-size: var(--icon-size-md);
    }
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

  /* Phones: the style art drops to the middle size, as the mode art does */
  @media (max-width: 600px) {
    [role='radiogroup'] {
      --toggle-icon-size: var(--icon-size-md);
    }
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
