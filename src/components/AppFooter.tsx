import '@fontsource/caveat/400.css';
import '@fontsource/ma-shan-zheng/400.css';
import '@fontsource/nanum-pen-script/400.css';
import { Link } from '@tanstack/react-router';
import styled from 'styled-components';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';

/**
 * The site footer: the logo (home of the current game mode) with the slogan below it, and
 * the legal links: Privacy Policy and Terms of Service. Below, the copyright and the
 * Blizzard trademark notice (the year is the current one).
 *
 * The slogan, "Chaos is a ladder." (the user's choice), is in quotes (each language's own
 * marks, part of the message: “…”, „…“, « … », «…»), grey, in a handwritten font. The
 * fonts are self-hosted (fontsource, OFL): Caveat for Latin and Cyrillic, Nanum Pen Script
 * for Korean, Ma Shan Zheng for Chinese. Each is split by character range, so a page
 * downloads only the glyphs it shows.
 *
 * It sits at the bottom of the window on short pages: `#root` is a column and the page
 * content between header and footer grows (`__root.tsx`).
 */
export function AppFooter() {
  const { locale, t } = useI18n();
  const [mode] = useGameMode();

  return (
    <Footer>
      <Inner>
        <Brand>
          <Link to={`/$locale/${mode}`} params={{ locale: locale.slug }} aria-label={t('app.home')}>
            <img src={logoUrl} alt="Rankwarden" />
          </Link>
          <Slogan>{t('footer.slogan')}</Slogan>
        </Brand>

        <Legal aria-label={t('footer.legal')}>
          <Link to="/$locale/privacy" params={{ locale: locale.slug }}>
            {t('legal.privacy')}
          </Link>
          <Link to="/$locale/terms" params={{ locale: locale.slug }}>
            {t('legal.terms')}
          </Link>
        </Legal>
      </Inner>

      <Notice>
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <p>{t('footer.notAffiliated')}</p>
      </Notice>
    </Footer>
  );
}

const Footer = styled.footer`
  --footer-bg: var(--color-surface);

  background: var(--footer-bg);
  border-top: 1px solid var(--color-trim-muted);
  box-shadow: inset 0 2px 0 var(--color-accent);
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-6);

  /* Narrow: logo and slogan above the links, all centred */
  @media (max-width: 820px) {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-3);
    text-align: center;
  }
`;

/** Logo with the slogan below it */
const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);

  a {
    display: flex;
    border-radius: var(--radius-md);
  }

  img {
    display: block;
    height: 44px;
    width: auto;
  }

  @media (max-width: 820px) {
    align-items: center;
  }
`;

const Slogan = styled.p`
  /* Under the logo's wordmark, not its emblem */
  padding-left: 52px;
  color: var(--color-text-subtle);
  font-family: 'Caveat', 'Nanum Pen Script', cursive;
  font-size: 1.5rem;
  line-height: 1.2;

  /*
   * Korean: its own font first, quote marks included (Caveat's small “ was hidden by the
   * first Hangul glyph). Chinese: its own font first (the Korean font would draw the Han).
   */
  :root:lang(ko) & {
    font-family: 'Nanum Pen Script', 'Caveat', cursive;
  }

  :root:lang(zh) & {
    font-family: 'Ma Shan Zheng', 'Caveat', cursive;
    font-size: 1.35rem;
  }

  @media (max-width: 820px) {
    padding-left: 0;
  }
`;

/** Copyright and trademark notice: a small centred row under a thin divider */
const Notice = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: var(--space-3) var(--space-6) var(--space-4);
  border-top: 1px solid var(--color-border-muted);
  color: var(--color-text-subtle);
  font-size: var(--font-size-xs);
  text-align: center;

  @media (max-width: 820px) {
    padding-inline: var(--space-3);
  }
`;

const Legal = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2) var(--space-6);

  a {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);

    &:hover,
    &[data-status='active'] {
      color: var(--color-text-highlight);
    }

    &[data-status='active'] {
      text-decoration: underline;
      text-decoration-color: var(--color-accent);
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
    }
  }
`;
