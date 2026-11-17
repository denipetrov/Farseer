# Farseer

Front-end for WoW leaderboards, characters, guilds and widgets, using data from the Soulseeker API.

## Stack
- React 19 + TypeScript, built with Vite
- TanStack Query for server state
- TanStack Router (file-based, `src/routes/`). URL search params act as data filters.
- styled-components, with no UI library
- localStorage for user preferences (`src/preferences/`)

## Getting started
```bash
npm install
cp .env.example .env.local   # set VITE_SOULSEEKER_API_URL
npm run dev                  # http://localhost:5173
```

## Styling conventions
1. **`src/styles/palette.ts`**: the only place raw hex values live.
2. **`src/styles/tokens.ts`**: maps the palette to shared CSS variables (`--color-bg`, `--color-text`, `--color-accent`, `--space-4`, ...).
   `--color-accent*` changes with `<html data-faction="horde|alliance">`, which is set from the user's preference.
3. **Components** declare their own local vars that default to shared tokens, so you can override them per component:
   ```ts
   const Panel = styled.section`
     --panel-bg: var(--color-surface);
     background: var(--panel-bg);
   `;
   ```
