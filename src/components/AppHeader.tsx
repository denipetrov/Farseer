import styled from 'styled-components';
import { Link } from '@tanstack/react-router';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { FactionToggle } from './FactionToggle';

export function AppHeader() {
  return (
    <Header>
      <Inner>
        <Brand to="/" aria-label="Rankwarden home">
          <img src={logoUrl} alt="Rankwarden" height={52} />
        </Brand>
        <Nav>
          <NavLink to="/leaderboards">Leaderboards</NavLink>
        </Nav>
        <FactionToggle />
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
  display: flex;
  align-items: center;
  gap: var(--space-6);
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-3) var(--space-6);
`;

const Brand = styled(Link)`
  display: flex;
  flex: none;

  img {
    display: block;
    height: 52px;
    width: auto;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: var(--space-4);
  flex: 1;
`;

const NavLink = styled(Link)`
  color: var(--color-text-muted);
  font-weight: 500;

  &:hover,
  &[data-status='active'] {
    color: var(--color-text-highlight);
  }

  &[data-status='active'] {
    text-decoration: underline;
    text-decoration-color: var(--color-accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 6px;
  }
`;
