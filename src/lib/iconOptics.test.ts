import { describe, expect, it } from 'vitest';
import { iconUrl } from './assets';
import { ICON_OPTICAL_SCALE, opticalScale } from './iconOptics';

describe('icon optical sizing', () => {
  it('names only icons that exist, with factors between 1 and 1.4', () => {
    for (const [icon, factor] of Object.entries(ICON_OPTICAL_SCALE)) {
      expect(iconUrl(icon), icon).toBeDefined();
      expect(factor, icon).toBeGreaterThan(1);
      expect(factor, icon).toBeLessThanOrEqual(1.4);
    }
  });

  it('leaves every other icon at its normal size', () => {
    expect(opticalScale('nav/home')).toBe(1);
    expect(opticalScale('nav/character')).toBe(1.4);
  });
});
