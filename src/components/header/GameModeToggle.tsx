import { iconUrl } from '@/lib/assets';
import { GAME_MODES, GAME_MODE_LABELS } from '@/lib/gameMode';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import { IconToggle } from './IconToggle';

const OPTIONS = GAME_MODES.map((mode) => ({
  value: mode,
  label: GAME_MODE_LABELS[mode],
  // The art carries its own "PvP" / "PvE" label underneath
  icon: iconUrl(`game-modes/${mode}`),
}));

/** PvP / PvE switch: remembers the choice and opens that mode's home. */
export function GameModeToggle() {
  const [mode, switchTo] = useGameMode();
  const { t } = useI18n();
  return (
    <IconToggle
      label={t('header.gameMode')}
      value={mode}
      options={OPTIONS}
      onChange={(m) => m !== mode && switchTo(m)}
      size="lg"
    />
  );
}
