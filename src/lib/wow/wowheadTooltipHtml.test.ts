import { describe, expect, it } from 'vitest';
import { wowheadTooltipHtml } from './wowheadTooltipHtml';

describe('wowheadTooltipHtml', () => {
  it("keeps Wowhead's layout and classes, unwraps links, drops comments", () => {
    const html = wowheadTooltipHtml(
      '<table><tr><td><a class="whtt-name" href="/spell=1/x"><b class="whtt-name">Name</b></a>' +
        '<div class="q0">Talent</div><th><!--cooldownText-->5 min<!--x--></th></td></tr></table>' +
        '<div class="q">Text<br />more</div>',
    )!;
    expect(html).toContain('<b class="whtt-name">Name</b>');
    expect(html).toContain('<div class="q0">Talent</div>');
    expect(html).toContain('<div class="q">Text<br>more</div>');
    expect(html).not.toContain('href');
    expect(html).not.toContain('<a');
    expect(html).not.toContain('<!--');
  });

  it('removes anything that can run or load', () => {
    const html = wowheadTooltipHtml(
      '<div class="q evil" onclick="x()" style="color:red">ok<script>alert(1)</script>' +
        '<img src=x onerror="alert(1)"><iframe src="//x"></iframe><svg onload="x()"></svg></div>',
    )!;
    expect(html).toBe('<div class="q">ok</div>');
  });

  it('is null when nothing readable is left', () => {
    expect(wowheadTooltipHtml('<script>alert(1)</script>')).toBeNull();
    expect(wowheadTooltipHtml('')).toBeNull();
  });
});
