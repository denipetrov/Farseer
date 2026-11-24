import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { gameModeOfPath, type GameMode } from '@/lib/gameMode';
import { usePreferences } from './PreferencesProvider';

/**
 * The current game mode and a way to switch it.
 *
 * Under `/pvp/...` or `/pve/...` the URL decides, and the choice is remembered, so a
 * shared link also sets the mode. Elsewhere (character, guild, leaderboards) the
 * remembered choice applies. Switching remembers the mode and opens its home.
 */
export function useGameMode(): [GameMode, (mode: GameMode) => void] {
  const { preferences, setPreference } = usePreferences();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fromPath = gameModeOfPath(pathname);

  useEffect(() => {
    if (fromPath && fromPath !== preferences.gameMode) setPreference('gameMode', fromPath);
  }, [fromPath, preferences.gameMode, setPreference]);

  const switchTo = useCallback(
    (mode: GameMode) => {
      setPreference('gameMode', mode);
      void navigate({ to: `/${mode}` });
    },
    [navigate, setPreference],
  );

  return [fromPath ?? preferences.gameMode, switchTo];
}
