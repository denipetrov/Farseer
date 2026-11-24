import styled from 'styled-components';

/**
 * The shared layout of a listed character or guild (`CharacterLine`, `GuildLine`):
 *
 *   [icons]  Name <extra>        [end]
 *            Realm · Region
 */
export const Row = styled.span`
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
`;

/** The faction, pushed to the far right of the row */
export const End = styled.span`
  display: flex;
  flex: none;
  margin-left: auto;
`;

export const Icons = styled.span`
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-1);
`;

export const Text = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
`;

export const First = styled.span`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
  white-space: nowrap;
`;

export const Name = styled.span`
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
`;

export const Guild = styled.span`
  overflow: hidden;
  color: var(--color-text-muted);
  text-overflow: ellipsis;
`;

export const Second = styled.span`
  overflow: hidden;
  color: var(--color-text-subtle);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
`;
