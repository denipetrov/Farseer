import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { gameModeOfPath, type GameMode } from '@/lib/gameMode';
import { usePreferences } from './PreferencesProvider';

/**
 * The current game mode and a way to switch it.
 *
 * Under `/<lang>/pvp/...` or `/<lang>/pve/...` the URL decides, and the choice is remembered, so a
 * shared link also sets the mode. Elsewhere (character, guild, leaderboards) the
 * remembered choice applies. Switching remembers the mode and opens its home, in the
 * current language (`/de/pve`).
 */
export function useGameMode(): [GameMode, (mode: GameMode) => void] {
  const { preferences, setPreference } = usePreferences();
  const navigate = useNavigate();
  const { locale } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fromPath = gameModeOfPath(pathname);

  useEffect(() => {
    if (fromPath && fromPath !== preferences.gameMode) setPreference('gameMode', fromPath);
  }, [fromPath, preferences.gameMode, setPreference]);

  const switchTo = useCallback(
    (mode: GameMode) => {
      setPreference('gameMode', mode);
      void navigate({ href: `/${locale.slug}/${mode}` });
    },
    [navigate, setPreference, locale.slug],
  );

  return [fromPath ?? preferences.gameMode, switchTo];
}
