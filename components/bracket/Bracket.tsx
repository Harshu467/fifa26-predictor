import { TeamFlag } from '@/components/common/TeamFlag';
import type { BracketMatch } from '@/types/tournament';
import styles from './Bracket.module.css';

export function Bracket({ matches }: { matches: BracketMatch[] }) {
  const rounds = matches.reduce<Record<string, BracketMatch[]>>((accumulator, match) => {
    accumulator[match.round] = [...(accumulator[match.round] ?? []), match];
    return accumulator;
  }, {});
  return (
    <section className={styles.bracket}>
      {Object.entries(rounds).map(([round, roundMatches]) => (
        <div className={styles.round} key={round}>
          <h3>{round}</h3>
          {roundMatches.map((match) => (
            <article className={styles.match} key={match.id}>
              <TeamSlot team={match.homeTeam} winner={match.winner?.id === match.homeTeam?.id} />
              <TeamSlot team={match.awayTeam} winner={match.winner?.id === match.awayTeam?.id} />
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
function TeamSlot({ team, winner }: { team: BracketMatch['homeTeam']; winner: boolean }) {
  return (
    <div className={winner ? styles.winner : styles.slot}>
      {team ? (
        <>
          <TeamFlag team={team} compact />
          <span>{team.shortName}</span>
        </>
      ) : (
        <span>TBD</span>
      )}
    </div>
  );
}
