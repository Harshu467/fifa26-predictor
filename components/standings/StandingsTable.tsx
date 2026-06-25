import { QualificationBadge } from '@/components/common/QualificationBadge';
import { TeamFlag } from '@/components/common/TeamFlag';
import type { StandingRow } from '@/types/tournament';
import styles from './StandingsTable.module.css';

export function StandingsTable({ standings }: { standings: Record<string, StandingRow[]> }) {
  return (
    <section className={styles.grid}>
      {Object.entries(standings).map(([group, rows]) => (
        <article className={styles.card} key={group}>
          <h3>Group {group}</h3>
          <div className={styles.table}>
            {rows.map((row) => (
              <div className={styles.row} key={row.team.id}>
                <span>
                  <TeamFlag team={row.team} compact /> {row.team.shortName}
                </span>
                <b>{row.points}</b>
                <small>{row.played}P</small>
                <small>
                  {row.goalDifference > 0 ? '+' : ''}
                  {row.goalDifference}
                </small>
                <QualificationBadge status={row.qualification} />
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
