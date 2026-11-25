import { describe, expect, it } from 'vitest';

const svgs = import.meta.glob<string>('/src/assets/**/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
});

describe('SVG assets', () => {
  // A browser shows nothing for an SVG that isn't well-formed XML: no error, just a blank icon.
  // The usual cause is `--` inside a comment (`<!-- uses var(--color-trim) -->`).
  it.each(Object.entries(svgs))('%s is well-formed XML', (_path, source) => {
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.documentElement.nodeName).toBe('svg');
  });
});
