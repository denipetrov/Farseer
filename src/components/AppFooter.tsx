import '@fontsource/caveat/400.css';
import '@fontsource/ma-shan-zheng/400.css';
import '@fontsource/nanum-pen-script/400.css';
import { Link } from '@tanstack/react-router';
import logoUrl from '@/assets/images/logo/rankwarden-logo.svg';
import { useI18n } from '@/i18n/useI18n';
import { useGameMode } from '@/preferences/useGameMode';
import styles from './AppFooter.module.css';
import { useSite } from '@/lib/site';

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
  const { t } = useI18n();
  const site = useSite();
  const [mode] = useGameMode();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to={`/$game/$locale/${mode}`} params={site} aria-label={t('app.home')}>
            <img src={logoUrl} alt="Rankwarden" />
          </Link>
          <p className={styles.slogan}>{t('footer.slogan')}</p>
        </div>

        <nav className={styles.legal} aria-label={t('footer.legal')}>
          <Link to="/$game/$locale/privacy" params={site}>
            {t('legal.privacy')}
          </Link>
          <Link to="/$game/$locale/terms" params={site}>
            {t('legal.terms')}
          </Link>
        </nav>
      </div>

      <div className={styles.notice}>
        <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        <p>{t('footer.notAffiliated')}</p>
      </div>
    </footer>
  );
}
