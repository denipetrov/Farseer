/**
 * Wowhead's tooltip HTML, made safe to show on our page. It comes from another site, so it
 * is rebuilt from an allow-list instead of inserted as it is:
 * - kept: the layout tags Wowhead uses (tables, div, span, b, br), with only the classes
 *   our tooltip styles (`whtt-name`, `q`, `q0`–`q9`, `wowhead-tooltip-requirements`);
 * - links are unwrapped to their text (the slot itself is the link to Wowhead);
 * - every other attribute (`href`, `style`, `on…`) and every comment are dropped;
 * - any other tag goes with its content when it can run or load something (script, style,
 *   iframe, img, svg…), and is unwrapped to its content otherwise.
 */

const KEEP = new Set(['TABLE', 'TBODY', 'THEAD', 'TR', 'TD', 'TH', 'DIV', 'SPAN', 'B', 'BR']);
const UNWRAP = new Set(['A', 'I', 'EM', 'STRONG', 'SMALL', 'P', 'FONT', 'U']);
const CLASS = /^(whtt-name|q\d?|wowhead-tooltip-requirements)$/;

function rebuild(source: Node, into: Node, doc: Document): void {
  for (const node of Array.from(source.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      into.appendChild(doc.createTextNode(node.textContent ?? ''));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue; // comments and the rest
    const el = node as Element;
    if (KEEP.has(el.tagName)) {
      const copy = doc.createElement(el.tagName.toLowerCase());
      const classes = (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => CLASS.test(c));
      if (classes.length) copy.setAttribute('class', classes.join(' '));
      rebuild(el, copy, doc);
      into.appendChild(copy);
    } else if (UNWRAP.has(el.tagName)) {
      rebuild(el, into, doc);
    }
  }
}

/** The safe HTML of a Wowhead tooltip; null when nothing readable is left */
export function wowheadTooltipHtml(raw: string): string | null {
  const parsed = new DOMParser().parseFromString(raw, 'text/html');
  const out = document.implementation.createHTMLDocument('');
  const root = out.createElement('div');
  rebuild(parsed.body, root, out);
  return root.textContent?.trim() ? root.innerHTML : null;
}
