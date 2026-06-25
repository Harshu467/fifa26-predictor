import { initialMatches } from '@/data/matches';
import { teams } from '@/data/teams';
import type { BracketMatch, Match, MatchPrediction, StandingRow, Team } from '@/types/tournament';

export const teamById = new Map(teams.map((team) => [team.id, team]));

export function resolveWinner(match: Match, prediction: MatchPrediction): string | null {
  if (prediction.homeScore === null || prediction.awayScore === null) return null;
  if (prediction.homeScore === prediction.awayScore) return null;
  return prediction.homeScore > prediction.awayScore ? match.homeTeamId : match.awayTeamId;
}

export function calculateStandings(matches: Match[]): Record<string, StandingRow[]> {
  const grouped = teams.reduce<Record<string, Team[]>>((accumulator, team) => {
    accumulator[team.group] = [...(accumulator[team.group] ?? []), team];
    return accumulator;
  }, {});

  return Object.fromEntries(
    Object.entries(grouped).map(([group, groupTeams]) => {
      const rows = groupTeams.map((team) => emptyStanding(team));
      const byTeam = new Map(rows.map((row) => [row.team.id, row]));

      matches
        .filter((match) => match.round === 'Group Stage' && match.group === group)
        .forEach((match) => applyMatchToRows(match, byTeam));

      const sorted = rows.sort(compareStandingRows);
      return [
        group,
        sorted.map((row, index) => ({
          ...row,
          qualification: row.played === 0 ? 'na' : index < 2 ? 'qualified' : 'not-qualified',
        })),
      ];
    }),
  );
}

export function generateBracket(standings: Record<string, StandingRow[]>): BracketMatch[] {
  const qualifiers = Object.keys(standings)
    .sort()
    .flatMap((group) => standings[group].slice(0, 2).map((row) => row.team));

  const roundOf32 = pairQualifiers(qualifiers, 'Round of 32');
  const winners = roundOf32
    .map((match) => match.winner)
    .filter((team): team is Team => Boolean(team));
  const roundOf16 = pairQualifiers(winners, 'Round of 16');
  const quarterWinners = roundOf16
    .map((match) => match.winner)
    .filter((team): team is Team => Boolean(team));
  const quarters = pairQualifiers(quarterWinners, 'Quarter Finals');
  const semiWinners = quarters
    .map((match) => match.winner)
    .filter((team): team is Team => Boolean(team));
  const semis = pairQualifiers(semiWinners, 'Semi Finals');
  const finalists = semis
    .map((match) => match.winner)
    .filter((team): team is Team => Boolean(team));
  const final = pairQualifiers(finalists, 'Final');

  return [...roundOf32, ...roundOf16, ...quarters, ...semis, ...final];
}

export function getTournamentProgress(matches: Match[]) {
  const completed = matches.filter(
    (match) => match.prediction.homeScore !== null && match.prediction.awayScore !== null,
  ).length;
  return Math.round((completed / matches.length) * 100);
}

export const getInitialMatches = () =>
  initialMatches.map((match) => ({ ...match, prediction: { ...match.prediction } }));

function emptyStanding(team: Team): StandingRow {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    qualification: 'na',
  };
}

function applyMatchToRows(match: Match, rows: Map<string, StandingRow>) {
  const { homeScore, awayScore } = match.prediction;
  if (homeScore === null || awayScore === null) return;
  const home = rows.get(match.homeTeamId);
  const away = rows.get(match.awayTeamId);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;
  home.goalDifference = home.goalsFor - home.goalsAgainst;
  away.goalDifference = away.goalsFor - away.goalsAgainst;

  if (homeScore > awayScore) {
    home.wins += 1;
    away.losses += 1;
    home.points += 3;
  } else if (awayScore > homeScore) {
    away.wins += 1;
    home.losses += 1;
    away.points += 3;
  } else {
    home.draws += 1;
    away.draws += 1;
    home.points += 1;
    away.points += 1;
  }
}

function compareStandingRows(a: StandingRow, b: StandingRow) {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    b.team.rating - a.team.rating
  );
}

function pairQualifiers(qualifiers: Team[], round: BracketMatch['round']): BracketMatch[] {
  const matches: BracketMatch[] = [];
  for (let index = 0; index < qualifiers.length; index += 2) {
    const homeTeam = qualifiers[index] ?? null;
    const awayTeam = qualifiers[index + 1] ?? null;
    const winner =
      homeTeam && awayTeam
        ? homeTeam.rating >= awayTeam.rating
          ? homeTeam
          : awayTeam
        : (homeTeam ?? null);
    matches.push({ id: `${round}-${index / 2}`, round, homeTeam, awayTeam, winner });
  }
  return matches;
}
