import styled from 'styled-components';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { Faction } from '@/styles/palette';

const FACTIONS: { id: Faction; label: string }[] = [
  { id: 'horde', label: 'Horde' },
  { id: 'alliance', label: 'Alliance' },
];

export function FactionToggle() {
  const { preferences, setPreference } = usePreferences();

  return (
    <Group role="radiogroup" aria-label="Faction">
      {FACTIONS.map((f) => (
        <Option
          key={f.id}
          role="radio"
          aria-checked={preferences.faction === f.id}
          $faction={f.id}
          onClick={() => setPreference('faction', f.id)}
        >
          {f.label}
        </Option>
      ))}
    </Group>
  );
}

const Group = styled.div`
  --toggle-bg: var(--color-bg-sunken);
  --toggle-border: var(--color-border);

  display: inline-flex;
  padding: 2px;
  gap: 2px;
  background: var(--toggle-bg);
  border: 1px solid var(--toggle-border);
  border-radius: var(--radius-md);
`;

const Option = styled.button<{ $faction: Faction }>`
  /* Each option uses its own faction colour, independent of the active accent */
  --option-color: var(--color-${(p) => p.$faction});

  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  padding: var(--space-1) var(--space-3);
  border-radius: calc(var(--radius-md) - 2px);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);

  &:hover {
    color: var(--color-text-highlight);
  }

  &[aria-checked='true'] {
    background: var(--option-color);
    color: var(--color-text-on-accent);
  }
`;
