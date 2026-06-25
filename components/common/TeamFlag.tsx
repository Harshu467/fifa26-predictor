import type { Team } from '@/types/tournament';
import styles from './TeamFlag.module.css';

export function TeamFlag({ team, compact = false }: { team: Team; compact?: boolean }) {
  const className = compact ? styles.compact : styles.flag;
  const isLogo = team.flag.startsWith('http');

  return (
    <span className={className} aria-label={`${team.name} flag`}>
      {isLogo ? <img src={team.flag} alt="" /> : team.flag}
    </span>
  );
}
