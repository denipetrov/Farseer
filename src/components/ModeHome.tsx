import type { ReactNode } from 'react';
import heroUrl from '@/assets/images/backgrounds/home-hero.webp';
import wordmarkUrl from '@/assets/images/logo/rankwarden-wordmark.svg';
import { Page } from '@/components/Page';
import { useI18n } from '@/i18n/useI18n';
import { GAME_MODE_LABELS, type GameMode } from '@/lib/gameMode';
import { SITE_SLOGANS } from '@/lib/slogans';
import styles from './ModeHome.module.css';

/**
 * Home of a game mode (`/<lang>/pvp`, `/<lang>/pve`): a hero (the user's design,
 * 2026-11-28), then its widgets (`children`).
 *
 * The hero: the Rankwarden wordmark large (no emblem: the user, 2026-11-28), a slogan under
 * it (one of `SLOGANS`, at random each load), and behind them the
 * user's art (`images/backgrounds/home-hero.webp`) fading into the page: dimmed, and masked
 * away towards the bottom and the sides in CSS, so the file itself stays as given.
 */
export function ModeHome({ mode, children }: { mode: GameMode; children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <Page className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.art} src={heroUrl} alt="" aria-hidden draggable={false} />
        <h1 className={styles.title}>
          <img className={styles.logo} src={wordmarkUrl} alt="Rankwarden" draggable={false} />
          <span className="sr-only">{GAME_MODE_LABELS[mode]}</span>
        </h1>
        <p className={styles.intro}>{t(SITE_SLOGANS.hero)}</p>
      </section>
      {children}
    </Page>
  );
}
