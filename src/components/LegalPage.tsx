import { useNavigate } from '@tanstack/react-router';
import type { MouseEvent, ReactNode } from 'react';
import { Muted, Page, PageTitle } from '@/components/Page';
import { localeBySlug } from '@/i18n/locales';
import { useI18n } from '@/i18n/useI18n';
import type { LoadedLegalDocument } from '@/legal/load';
import type { LegalBlock } from '@/legal/types';
import styles from './LegalPage.module.css';

interface LegalPageProps {
  title: 'legal.privacy' | 'legal.terms';
  loaded: LoadedLegalDocument;
}

/**
 * A legal page (`/<lang>/privacy`, `/<lang>/terms`): title, last-updated date, contents,
 * then each section with its one-line summary ("In short") and its text.
 *
 * A language without a translation shows the English text, with a note in the reader's
 * language; English is the authoritative version.
 */
export function LegalPage({ title, loaded }: LegalPageProps) {
  const { t, locale } = useI18n();
  const { doc, slug: docSlug } = loaded;
  const docLang = localeBySlug(docSlug).htmlLang;
  const date = new Intl.DateTimeFormat(locale.htmlLang, { dateStyle: 'long' }).format(
    new Date(`${doc.updated}T00:00:00`),
  );

  return (
    <Page>
      <header>
        <PageTitle>{t(title)}</PageTitle>
        <Muted>{t('legal.updated', { date })}</Muted>
      </header>

      {docSlug !== locale.slug && (
        <p className={styles.note} role="note">
          {t('legal.englishOnly')}
        </p>
      )}

      <article className={styles.doc} lang={docLang}>
        {doc.intro.map((b, i) => (
          <Block key={i} block={b} />
        ))}

        <nav className={styles.contents} aria-labelledby="legal-contents">
          <h2 className={styles.contentsTitle} id="legal-contents">
            {t('legal.contents')}
          </h2>
          <ol>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s, i) => (
          <section key={s.id} className={styles.section} id={s.id} aria-labelledby={`${s.id}-h`}>
            <h2 id={`${s.id}-h`}>
              <span className={styles.num}>{i + 1}.</span> {s.heading}
            </h2>
            {s.summary && (
              <p className={styles.summary}>
                <strong>{t('legal.inShort')}</strong> {s.summary}
              </p>
            )}
            {s.blocks.map((b, j) => (
              <Block key={j} block={b} />
            ))}
          </section>
        ))}
      </article>
    </Page>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if ('list' in block) {
    return (
      <ul>
        {block.list.map((item, i) => (
          <li key={i}>
            <Inline text={item} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p>
      <Inline text={block.p} />
    </p>
  );
}

/** Text with `[label](url)` links (mailto:, https:, or a site path like `/privacy`) and `**bold**`. */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      m[3] !== undefined ? (
        <strong key={m.index}>{m[3]}</strong>
      ) : (
        <DocLink key={m.index} href={m[2]!} label={m[1]!} />
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function DocLink({ href, label }: { href: string; label: string }) {
  const { locale } = useI18n();
  const navigate = useNavigate();

  if (href.startsWith('/')) {
    const local = `/${locale.slug}${href}`;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      void navigate({ href: local });
    };
    return (
      <a href={local} onClick={onClick}>
        {label}
      </a>
    );
  }
  const external = href.startsWith('http');
  return (
    <a href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })}>
      {label}
    </a>
  );
}
