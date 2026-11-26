import { useQuery } from '@tanstack/react-query';
import { sessionQuery } from '@/api/session';
import { useI18n } from '@/i18n/useI18n';
import styles from './ApiStatus.module.css';

/** Shows whether we hold a working Soulseeker session. */
export function ApiStatus() {
  const { data, error, isPending } = useQuery(sessionQuery);
  const { t } = useI18n();

  const state = isPending ? 'pending' : error ? 'error' : 'ok';
  const label = isPending
    ? t('api.connecting')
    : error
      ? t('api.unavailable', { message: error.message })
      : t('api.connected', { who: data?.anonymous ? t('api.anonymous') : (data?.subject ?? '') });

  return (
    <p className={styles.status} data-state={state} role="status">
      <span className={styles.dot} />
      {label}
    </p>
  );
}
