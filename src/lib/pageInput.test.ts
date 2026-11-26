import { describe, expect, it } from 'vitest';
import { typedPage } from './pageInput';

describe('typedPage', () => {
  it('reads a whole number, trimmed', () => {
    expect(typedPage('42', 100)).toBe(42);
    expect(typedPage(' 7 ', 100)).toBe(7);
  });

  it('brings out-of-range pages to the nearest end', () => {
    expect(typedPage('0', 100)).toBe(1);
    expect(typedPage('9999', 4000)).toBe(4000);
  });

  it('ignores anything else', () => {
    for (const v of ['', 'abc', '-3', '2.5', '1e3']) expect(typedPage(v, 100)).toBeNull();
  });
});
