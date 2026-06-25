import type { Team } from '@/types/tournament';
import styles from './TeamFlag.module.css';

export function TeamFlag({ team, compact = false }: { team: Team; compact?: boolean }) {
  return (
    <span className={compact ? styles.compact : styles.flag} aria-label={`${team.name} flag`}>
      {team.flag}
    </span>
  );
}
