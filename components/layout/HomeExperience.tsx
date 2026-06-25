'use client';

import { useEffect, useMemo } from 'react';
import { Bracket } from '@/components/bracket/Bracket';
import { MatchCard } from '@/components/matches/MatchCard';
import { PredictionModal } from '@/components/prediction/PredictionModal';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { useTournamentStore } from '@/store/tournamentStore';
import type { Match, Team } from '@/types/tournament';
import {
  calculateStandings,
  generateBracket,
  getTournamentProgress,
} from '@/utils/tournamentEngine';
import { Footer } from './Footer';
import { Header } from './Header';
import styles from './HomeExperience.module.css';

export function HomeExperience() {
  const {
    teams,
    matches,
    selectedMatchId,
    liveDataStatus,
    liveDataError,
    liveDataUpdatedAt,
    selectMatch,
    resetPredictions,
    refreshLiveData,
  } = useTournamentStore();
  const teamById = useMemo(
    () => new Map<string, Team>(teams.map((team: Team) => [team.id, team])),
    [teams],
  );
  const standings = calculateStandings(matches, teams);
  const bracket = generateBracket(standings);
  const progress = getTournamentProgress(matches);
  const selectedMatch = matches.find((match: Match) => match.id === selectedMatchId) ?? null;

  useEffect(() => {
    void refreshLiveData();
  }, [refreshLiveData]);

  return (
    <main className={styles.shell}>
      <Header />
      <section className={styles.progress}>
        <div>
          <b>{progress}%</b>
          <span>Tournament predicted</span>
        </div>
        <button onClick={resetPredictions}>Reset</button>
        <button onClick={() => void refreshLiveData()}>Refresh live data</button>
        <small>
          {liveDataStatus === 'loading'
            ? 'Loading API-Football...'
            : liveDataStatus === 'error'
              ? `Using fallback data: ${liveDataError}`
              : liveDataUpdatedAt
                ? `Live data updated ${new Intl.DateTimeFormat('en', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(liveDataUpdatedAt))}`
                : 'Fallback schedule loaded'}
        </small>
        <i style={{ width: `${progress}%` }} />
      </section>
      <MatchSection
        title="Sticky Live Matches"
        matches={matches.filter((match: Match) => match.status === 'live')}
        sticky
        onSelect={selectMatch}
        teamById={teamById}
      />
      <MatchSection
        title="Completed Matches"
        matches={matches.filter((match: Match) => match.status === 'completed')}
        onSelect={selectMatch}
        teamById={teamById}
      />
      <MatchSection
        title="Upcoming Matches"
        matches={matches.filter((match: Match) => match.status === 'upcoming')}
        onSelect={selectMatch}
        teamById={teamById}
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
  teamById,
}: {
  title: string;
  matches: Match[];
  sticky?: boolean;
  onSelect: (id: string) => void;
  teamById: Map<string, Team>;
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
