import { createGlobalStyle } from 'styled-components';
import { tokens } from './tokens';

export const GlobalStyle = createGlobalStyle`
  ${tokens}

  *, *::before, *::after { box-sizing: border-box; }

  html, body { height: 100%; }

  /*
   * min-height, never height: #root contains the sticky header, and a sticky element only
   * sticks within its parent. A fixed-height #root (one window tall) let the header scroll
   * away after the first screen.
   */
  #root {
    min-height: 100%;
    /* A column: header, content (grows), footer at the bottom of short pages */
    display: flex;
    flex-direction: column;
  }

  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-size: var(--font-size-md);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* Korean wraps between words, not inside them (the browser default splits syllables) */
  :lang(ko) { word-break: keep-all; overflow-wrap: anywhere; }

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
