import styled from 'styled-components';

/** Basic page layout primitives shared by routes. */
export const Page = styled.main`
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
`;

export const PageTitle = styled.h1`
  font-size: var(--font-size-2xl);
`;

export const Panel = styled.section`
  --panel-bg: var(--color-surface);
  --panel-border: var(--color-border-muted);

  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
`;

export const Muted = styled.p`
  color: var(--color-text-muted);
`;
