import styled from 'styled-components';

/**
 * A widget's width in the page's widget grid (the user's design, 2026-11-26):
 * - `small`: three side by side;
 * - `medium`: two side by side;
 * - `large`: the full width.
 * Narrower areas step down: smalls go two across when the grid is under 1000px wide (a small one
 * needs ~320px for names to read), and
 * everything takes the full width under 600px. These follow the grid's own width (a
 * container query), not the window's: the left menu takes 17.5rem of the window.
 */
export type WidgetSize = 'small' | 'medium' | 'large';

/** The grid widgets sit in: six columns, so thirds and halves both fit. */
export const WidgetGrid = styled.div`
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-6);

  > [data-size='small'] {
    grid-column: span 2;
  }

  > [data-size='medium'] {
    grid-column: span 3;
  }

  > [data-size='large'] {
    grid-column: span 6;
  }

  @container (max-width: 999px) {
    > [data-size='small'] {
      grid-column: span 3;
    }
  }

  @container (max-width: 599px) {
    > [data-size] {
      grid-column: span 6;
    }
  }
`;

/** A widget's frame: a panel with an accent line along its top, as in the user's example. */
export const WidgetFrame = styled.section`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-trim-muted);
  border-top: 2px solid var(--color-accent);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
`;

export const WidgetHeader = styled.header`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid var(--color-border-muted);
`;

export const WidgetTitle = styled.h2`
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  margin: 0;
  color: var(--color-text-highlight);
  font-size: var(--font-size-lg);
  font-weight: 700;
  white-space: nowrap;

  > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const WidgetFooter = styled.footer`
  display: flex;
  justify-content: center;
  padding: var(--space-3) var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-border-muted);
`;
