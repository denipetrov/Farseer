import { describe, expect, it } from 'vitest';
import { filterRows, nextFilterPath } from './filterPath';

const tree = [
  { id: 'mage', children: [{ id: 'arcane' }, { id: 'fire' }] },
  { id: 'warrior', children: [{ id: 'arms' }] },
  { id: 'none' },
];
const shown = (path: string[]) =>
  filterRows(tree, path).map((r) => `${r.choices.map((c) => c.id).join(',')}:${r.picked ?? '-'}`);

describe('icon filter rows', () => {
  it('shows the top row, then the children of each pick', () => {
    expect(shown([])).toEqual(['mage,warrior,none:-']);
    expect(shown(['mage'])).toEqual(['mage,warrior,none:mage', 'arcane,fire:-']);
    expect(shown(['mage', 'fire'])).toEqual(['mage,warrior,none:mage', 'arcane,fire:fire']);
  });

  it('adds no row under a pick without children, and ignores unknown ids', () => {
    expect(shown(['none'])).toEqual(['mage,warrior,none:none']);
    expect(shown(['bard', 'x'])).toEqual(['mage,warrior,none:-']);
  });
});

describe('icon filter clicks', () => {
  it('picks, swaps and drops deeper picks', () => {
    expect(nextFilterPath([], 0, 'mage')).toEqual(['mage']);
    expect(nextFilterPath(['mage'], 1, 'fire')).toEqual(['mage', 'fire']);
    expect(nextFilterPath(['mage', 'fire'], 0, 'warrior')).toEqual(['warrior']);
    expect(nextFilterPath(['mage', 'fire'], 1, 'arcane')).toEqual(['mage', 'arcane']);
  });

  it('unpicks a pick and everything below it', () => {
    expect(nextFilterPath(['mage', 'fire'], 1, 'fire')).toEqual(['mage']);
    expect(nextFilterPath(['mage', 'fire'], 0, 'mage')).toEqual([]);
  });
});
