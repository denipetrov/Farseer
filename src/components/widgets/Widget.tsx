import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';
import type { WidgetSize } from './WidgetGrid';
import styles from './Widget.module.css';

/** A widget's frame, sized for the WidgetGrid (`data-size`) */
export function WidgetFrame({
  size,
  className,
  ...props
}: ComponentProps<'section'> & { size: WidgetSize }) {
  return <section data-size={size} className={cx(styles.frame, className)} {...props} />;
}

export function WidgetHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cx(styles.header, className)} {...props} />;
}

export function WidgetTitle({ className, ...props }: ComponentProps<'h2'>) {
  return <h2 className={cx(styles.title, className)} {...props} />;
}

export function WidgetFooter({ className, ...props }: ComponentProps<'footer'>) {
  return <footer className={cx(styles.footer, className)} {...props} />;
}
