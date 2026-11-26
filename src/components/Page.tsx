import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';
import styles from './Page.module.css';

/** Basic page layout primitives shared by routes. Each takes its element's usual props. */
export function Page({ className, ...props }: ComponentProps<'main'>) {
  return <main className={cx(styles.page, className)} {...props} />;
}

export function PageTitle({ className, ...props }: ComponentProps<'h1'>) {
  return <h1 className={cx(styles.title, className)} {...props} />;
}

export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return <section className={cx(styles.panel, className)} {...props} />;
}

export function Muted({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cx(styles.muted, className)} {...props} />;
}
