'use client';

import { Bracket } from '@/components/bracket/Bracket';
import { MatchCard } from '@/components/matches/MatchCard';
import { PredictionModal } from '@/components/prediction/PredictionModal';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { useTournamentStore } from '@/store/tournamentStore';
import {
  calculateStandings,
  generateBracket,
  getTournamentProgress,
  teamById,
} from '@/utils/tournamentEngine';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './HomeExperience.module.css';

export function HomeExperience() {
  const { matches, selectedMatchId, selectMatch, resetPredictions } = useTournamentStore();
  const standings = calculateStandings(matches);
  const bracket = generateBracket(standings);
  const progress = getTournamentProgress(matches);
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? null;

  return (
    <main className={styles.shell}>
      <Header />
      <section className={styles.progress}>
        <div>
          <b>{progress}%</b>
          <span>Tournament predicted</span>
        </div>
        <button onClick={resetPredictions}>Reset</button>
        <i style={{ width: `${progress}%` }} />
      </section>
      <MatchSection
        title="Sticky Live Matches"
        matches={matches.filter((match) => match.status === 'live')}
        sticky
        onSelect={selectMatch}
      />
      <MatchSection
        title="Completed Matches"
        matches={matches.filter((match) => match.status === 'completed')}
        onSelect={selectMatch}
      />
      <MatchSection
        title="Upcoming Matches"
        matches={matches.filter((match) => match.status === 'upcoming')}
        onSelect={selectMatch}
      />
      <Section title="Group Standings">
        <StandingsTable standings={standings} />
      </Section>
      <Section title="Knockout Bracket">
        <Bracket matches={bracket} />
      </Section>
      <Footer />
      <PredictionModal
        match={selectedMatch}
        homeTeam={selectedMatch ? (teamById.get(selectedMatch.homeTeamId) ?? null) : null}
        awayTeam={selectedMatch ? (teamById.get(selectedMatch.awayTeamId) ?? null) : null}
      />
    </main>
  );
}

function MatchSection({
  title,
  matches,
  sticky = false,
  onSelect,
}: {
  title: string;
  matches: import('@/types/tournament').Match[];
  sticky?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Section title={title} sticky={sticky}>
      <div id="matches" className={styles.matchGrid}>
        {matches.map((match) => {
          const homeTeam = teamById.get(match.homeTeamId);
          const awayTeam = teamById.get(match.awayTeamId);
          return homeTeam && awayTeam ? (
            <MatchCard
              key={match.id}
              match={match}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              onSelect={() => onSelect(match.id)}
            />
          ) : null;
        })}
      </div>
    </Section>
  );
}

function Section({
  title,
  children,
  sticky = false,
}: {
  title: string;
  children: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <section className={sticky ? styles.stickySection : styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
