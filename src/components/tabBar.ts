/**
 * The class names of the site's tab bars (TabBar.module.css), shared by every bar so they
 * look the same: `bar` holds the groups, `group` a row of tabs, `tab` one tab, a link
 * (`aria-current="page"` when it is the page) or a button (`aria-pressed`).
 */
import styles from './TabBar.module.css';

export const tabBar = {
  bar: styles.bar!,
  group: styles.group!,
  tab: styles.tab!,
};
