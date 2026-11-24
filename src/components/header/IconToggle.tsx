import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import type { IconSize } from '@/styles/iconSizes';

export interface IconToggleOption<T extends string> {
  value: T;
  /** Accessible name and hover title */
  label: string;
  icon: string | undefined;
  /** Colour of the bar under the chosen option; defaults to the faction accent */
  underline?: string;
}

interface IconToggleProps<T extends string> {
  /** Accessible name of the group ("Game mode") */
  label: string;
  value: T;
  options: readonly IconToggleOption<T>[];
  onChange: (value: T) => void;
  size?: IconSize;
}

/**
 * A row of icon buttons of which one is chosen, for the header's switches. The art is
 * never filtered, so it stays crisp and true to its file: the chosen option is marked by
 * a bar underneath, the others are only fainter (still in colour) until hovered. The user
 * rejected greyscale, glow, outlines and plates on the art (the dark Horde emblem
 * disappears or blurs under them).
 *
 * A radio group: Tab reaches the chosen option, arrow keys move the choice.
 */
export function IconToggle<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
}: IconToggleProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  };

  return (
    <Group role="radiogroup" aria-label={label} $size={size}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <Option
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={o.label}
            title={o.label}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            style={
              o.underline ? ({ '--toggle-underline': o.underline } as CSSProperties) : undefined
            }
          >
            {o.icon && <img src={o.icon} alt="" draggable={false} />}
          </Option>
        );
      })}
    </Group>
  );
}

/** The icon size is a CSS var on the group, so a layout can shrink it (`--toggle-icon-size`). */
const Group = styled.div<{ $size: IconSize }>`
  --toggle-icon-size: var(--icon-size-${(p) => p.$size});

  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
`;

const Option = styled.button`
  position: relative;
  display: grid;
  place-items: center;
  padding: var(--space-1);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;

  img {
    display: block;
    width: var(--toggle-icon-size);
    height: var(--toggle-icon-size);
    object-fit: contain;
    opacity: 0.6;
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);
  }

  &:hover img,
  &[aria-checked='true'] img {
    opacity: 1;
  }

  &[aria-checked='true']::after {
    content: '';
    position: absolute;
    left: 20%;
    right: 20%;
    bottom: -2px;
    height: 3px;
    border-radius: 2px;
    background: var(--toggle-underline, var(--color-accent));
  }

  &:active img {
    transform: scale(0.94);
  }
`;
