import { createGlobalStyle } from 'styled-components';
import { tokens } from './tokens';

export const GlobalStyle = createGlobalStyle`
  ${tokens}

  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root { height: 100%; }

  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: var(--font-size-md);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 { color: var(--color-text-highlight); margin: 0; line-height: 1.2; }
  p { margin: 0; }

  a { color: var(--color-accent-strong); text-decoration: none; }
  a:hover { color: var(--color-text-highlight); }

  button { font: inherit; color: inherit; }

  :focus-visible {
    outline: 2px solid var(--color-trim);
    outline-offset: 2px;
  }

  ::selection { background: var(--color-accent-muted); color: var(--color-text-highlight); }
`;
