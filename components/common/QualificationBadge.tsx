import type { StandingRow } from '@/types/tournament';
import styles from './QualificationBadge.module.css';

const labels = { qualified: 'Qualified', 'not-qualified': 'Not Qualified', na: 'N/A' } as const;

export function QualificationBadge({ status }: { status: StandingRow['qualification'] }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{labels[status]}</span>;
}
