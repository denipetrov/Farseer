import frameSvg from '@/assets/icons/pvp/pvp-talent-frame.svg?raw';
import { useEffect, useId, useRef, useState } from 'react';
import { HoverCard } from '@/components/HoverCard';
import { useI18n } from '@/i18n/useI18n';
import { iconUrl } from '@/lib/assets';
import { wowheadSpellUrl, type PvpTalent } from '@/lib/wow/talents';
import { useSpellTooltip } from '@/lib/wow/wowheadSpell';
import styles from './PvpTalentSlot.module.css';
import tipStyles from './WowheadTooltip.module.css';

const EMPTY_URL = iconUrl('pvp/pvp-talent-empty');

/**
 * One PvP talent slot, after the game's (the user's design, 2026-11-27):
 * - nothing known (an empty slot, or no data yet): `pvp-talent-empty.svg` as it is, green;
 * - a talent: `pvp-talent-frame.svg`, its outline in the class colour (`classColor`, through
 *   `data-class-color` and the frame's `currentColor`; drawn inline so its gold arrows keep
 *   their own colour), with the talent's Wowhead icon inside, linking to its Wowhead page.
 *   On hover or focus it shows Wowhead's tooltip in the site's language (cost, cast,
 *   cooldown, description: `HoverCard`, the HTML made safe by `wowheadTooltipHtml`); until
 *   that loads, or if Wowhead has none, the name (Soulseeker's English one as a last
 *   resort) is the plain hover text.
 */
export function PvpTalentSlot({
  talent,
  classColor,
}: {
  talent: PvpTalent | null;
  classColor: string | undefined;
}) {
  const { t, locale } = useI18n();
  const tooltip = useSpellTooltip(talent?.spellId ?? null, locale.slug).data;
  const anchor = useRef<HTMLElement | null>(null);
  const setAnchor = (el: HTMLElement | null) => {
    anchor.current = el;
  };
  const tipId = useId();
  const [open, setOpen] = useState(false);

  // A fixed card would drift from its slot on scroll: close it instead
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', close, { capture: true });
  }, [open]);

  if (!talent) {
    const label = t('widget.pvpTalentEmpty');
    return (
      <span className={styles.slot} role="img" aria-label={label} title={label}>
        <img className={styles.empty} src={EMPTY_URL} alt="" draggable={false} />
      </span>
    );
  }

  const name = tooltip?.name ?? talent.name;
  const html = tooltip?.html;
  const hover = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    // The rich card replaces the browser's plain hover text once it is there
    title: html ? undefined : name,
    'aria-describedby': html && open ? tipId : undefined,
  };
  const content = (
    <>
      <TalentIcon icon={tooltip?.icon} />
      <span className={styles.frame} aria-hidden dangerouslySetInnerHTML={{ __html: frameSvg }} />
      {html && open && (
        <HoverCard anchor={anchor} id={tipId}>
          {/* Rebuilt from an allow-list by wowheadTooltipHtml: no links, scripts or attributes */}
          <div className={tipStyles.tooltip} dangerouslySetInnerHTML={{ __html: html }} />
        </HoverCard>
      )}
    </>
  );
  return talent.spellId != null ? (
    <a
      ref={setAnchor}
      className={styles.slot}
      data-class-color={classColor}
      href={wowheadSpellUrl(talent.spellId, locale.slug)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      {...hover}
    >
      {content}
    </a>
  ) : (
    <span
      ref={setAnchor}
      className={styles.slot}
      data-class-color={classColor}
      role="img"
      aria-label={name}
      {...hover}
    >
      {content}
    </span>
  );
}

/** The talent's picture, clipped to the frame's octagon; a dark field until it loads */
function TalentIcon({ icon }: { icon: string | null | undefined }) {
  return (
    <span className={styles.field}>
      {icon && <img className={styles.icon} src={icon} alt="" draggable={false} />}
    </span>
  );
}
