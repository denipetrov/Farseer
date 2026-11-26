import { useRef, type KeyboardEvent } from 'react';
import { cx } from '@/lib/cx';
import type { IconSize } from '@/styles/iconSizes';
import type { Faction } from '@/styles/palette';
import styles from './IconToggle.module.css';

export interface IconToggleOption<T extends string> {
  value: T;
  /** Accessible name and hover title */
  label: string;
  icon: string | undefined;
  /** The bar under the chosen option in this faction's colour; defaults to the accent */
  underline?: Faction;
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
    <div role="radiogroup" aria-label={label} className={cx(styles.group, styles[size])}>
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            className={styles.option}
            data-underline={o.underline}
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
          >
            {o.icon && <img src={o.icon} alt="" draggable={false} />}
          </button>
        );
      })}
    </div>
  );
}
