import { describe, expect, it } from 'vitest';
import { REFERENCE_TOP, SCORE_COLORS, scoreColor } from './mplusScoreColor';

describe('scoreColor', () => {
  it("gives the table's colours when the top is the table's own", () => {
    expect(scoreColor(4350, REFERENCE_TOP)).toBe('#ff8000');
    expect(scoreColor(4349, REFERENCE_TOP)).toBe('#fe7e16');
    expect(scoreColor(3450, REFERENCE_TOP)).toBe('#a335ee');
    expect(scoreColor(3075, REFERENCE_TOP)).toBe('#0070dd');
    expect(scoreColor(2200, REFERENCE_TOP)).toBe('#1eff00');
    expect(scoreColor(150, REFERENCE_TOP)).toBe('#ffffff');
  });

  it('moves every threshold with the season’s top', () => {
    // A top of 4407 (×1.0131): orange from 4407, epic purple from ~3495
    expect(scoreColor(4407, 4407)).toBe('#ff8000');
    expect(scoreColor(4400, 4407)).toBe('#fe7e16');
    expect(scoreColor(3500, 4407)).toBe('#a335ee');
    expect(scoreColor(3460, 4407)).toBe('#9d3ced');
    // Early in a season (top 2500), 2500 is already orange
    expect(scoreColor(2500, 2500)).toBe('#ff8000');
  });

  it('uses the table as it is while the top is unknown', () => {
    expect(scoreColor(4350, null)).toBe('#ff8000');
  });

  it('keeps the table highest first', () => {
    const scores = SCORE_COLORS.map(([s]) => s);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
