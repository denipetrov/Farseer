import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { sessionQuery } from '@/api/session';

/** Shows whether we hold a working Soulseeker session. */
export function ApiStatus() {
  const { data, error, isPending } = useQuery(sessionQuery);

  const state = isPending ? 'pending' : error ? 'error' : 'ok';
  const label = isPending
    ? 'Connecting to Soulseeker…'
    : error
      ? `Soulseeker unavailable: ${error.message}`
      : `Connected · ${data?.anonymous ? 'anonymous session' : data?.subject}`;

  return (
    <Status $state={state} role="status">
      <Dot />
      {label}
    </Status>
  );
}

const Status = styled.p<{ $state: 'pending' | 'ok' | 'error' }>`
  --status-color: ${(p) =>
    p.$state === 'ok'
      ? 'var(--color-success)'
      : p.$state === 'error'
        ? 'var(--color-danger)'
        : 'var(--color-text-subtle)'};

  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-color);
`;
