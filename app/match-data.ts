export type Outcome = 'home' | 'away' | 'draw';

export type Match = {
  id: string;
  home: string;
  away: string;
  date: string;
  group: string;
  status: 'upcoming' | 'completed';
  result?: Outcome;
};

export type GroupDefinition = {
  letter: string;
  teams: string[];
};

export type TeamStanding = {
  team: string;
  group: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
};

export const groups: GroupDefinition[] = [
  { letter: 'A', teams: ['Canada', 'Mexico', 'Costa Rica', 'Uruguay'] },
  { letter: 'B', teams: ['USA', 'Wales', 'England', 'Iran'] },
  { letter: 'C', teams: ['Brazil', 'Argentina', 'Chile', 'Peru'] },
  { letter: 'D', teams: ['Germany', 'Spain', 'Italy', 'Switzerland'] },
  { letter: 'E', teams: ['France', 'Portugal', 'Netherlands', 'Belgium'] },
  { letter: 'F', teams: ['Japan', 'South Korea', 'Australia', 'Saudi Arabia'] },
  { letter: 'G', teams: ['Senegal', 'Cameroon', 'Morocco', 'Ghana'] },
  { letter: 'H', teams: ['Croatia', 'Serbia', 'Poland', 'Denmark'] }
];

export const initialMatches: Match[] = [
  // Group A
  { id: 'A1', home: 'Canada', away: 'Mexico', group: 'A', date: '2026-06-11T20:00:00Z', status: 'upcoming' },
  { id: 'A2', home: 'Costa Rica', away: 'Uruguay', group: 'A', date: '2026-06-12T18:00:00Z', status: 'completed', result: 'away' },
  { id: 'A3', home: 'Uruguay', away: 'Canada', group: 'A', date: '2026-06-13T18:00:00Z', status: 'upcoming' },
  { id: 'A4', home: 'Mexico', away: 'Costa Rica', group: 'A', date: '2026-06-13T20:00:00Z', status: 'completed', result: 'draw' },
  { id: 'A5', home: 'Canada', away: 'Costa Rica', group: 'A', date: '2026-06-17T18:00:00Z', status: 'upcoming' },
  { id: 'A6', home: 'Mexico', away: 'Uruguay', group: 'A', date: '2026-06-18T20:00:00Z', status: 'upcoming' },
  // Group B
  { id: 'B1', home: 'USA', away: 'Wales', group: 'B', date: '2026-06-12T20:00:00Z', status: 'upcoming' },
  { id: 'B2', home: 'England', away: 'Iran', group: 'B', date: '2026-06-13T20:00:00Z', status: 'completed', result: 'home' },
  { id: 'B3', home: 'Iran', away: 'USA', group: 'B', date: '2026-06-14T18:00:00Z', status: 'upcoming' },
  { id: 'B4', home: 'Wales', away: 'England', group: 'B', date: '2026-06-14T20:00:00Z', status: 'upcoming' },
  { id: 'B5', home: 'England', away: 'USA', group: 'B', date: '2026-06-18T18:00:00Z', status: 'upcoming' },
  { id: 'B6', home: 'Wales', away: 'Iran', group: 'B', date: '2026-06-19T20:00:00Z', status: 'upcoming' },
  // Group C
  { id: 'C1', home: 'Brazil', away: 'Argentina', group: 'C', date: '2026-06-14T20:00:00Z', status: 'upcoming' },
  { id: 'C2', home: 'Chile', away: 'Peru', group: 'C', date: '2026-06-15T18:00:00Z', status: 'upcoming' },
  { id: 'C3', home: 'Argentina', away: 'Chile', group: 'C', date: '2026-06-16T18:00:00Z', status: 'upcoming' },
  { id: 'C4', home: 'Peru', away: 'Brazil', group: 'C', date: '2026-06-16T20:00:00Z', status: 'upcoming' },
  { id: 'C5', home: 'Brazil', away: 'Chile', group: 'C', date: '2026-06-20T18:00:00Z', status: 'upcoming' },
  { id: 'C6', home: 'Argentina', away: 'Peru', group: 'C', date: '2026-06-21T20:00:00Z', status: 'upcoming' },
  // Group D
  { id: 'D1', home: 'Germany', away: 'Spain', group: 'D', date: '2026-06-15T20:00:00Z', status: 'upcoming' },
  { id: 'D2', home: 'Italy', away: 'Switzerland', group: 'D', date: '2026-06-16T16:00:00Z', status: 'upcoming' },
  { id: 'D3', home: 'Spain', away: 'Italy', group: 'D', date: '2026-06-18T18:00:00Z', status: 'upcoming' },
  { id: 'D4', home: 'Switzerland', away: 'Germany', group: 'D', date: '2026-06-18T20:00:00Z', status: 'upcoming' },
  { id: 'D5', home: 'Germany', away: 'Italy', group: 'D', date: '2026-06-22T18:00:00Z', status: 'upcoming' },
  { id: 'D6', home: 'Spain', away: 'Switzerland', group: 'D', date: '2026-06-23T20:00:00Z', status: 'upcoming' },
  // Group E
  { id: 'E1', home: 'France', away: 'Portugal', group: 'E', date: '2026-06-17T20:00:00Z', status: 'upcoming' },
  { id: 'E2', home: 'Netherlands', away: 'Belgium', group: 'E', date: '2026-06-18T16:00:00Z', status: 'upcoming' },
  { id: 'E3', home: 'Portugal', away: 'Netherlands', group: 'E', date: '2026-06-20T20:00:00Z', status: 'upcoming' },
  { id: 'E4', home: 'Belgium', away: 'France', group: 'E', date: '2026-06-21T18:00:00Z', status: 'upcoming' },
  { id: 'E5', home: 'France', away: 'Netherlands', group: 'E', date: '2026-06-24T18:00:00Z', status: 'upcoming' },
  { id: 'E6', home: 'Portugal', away: 'Belgium', group: 'E', date: '2026-06-24T20:00:00Z', status: 'upcoming' },
  // Group F
  { id: 'F1', home: 'Japan', away: 'South Korea', group: 'F', date: '2026-06-17T18:00:00Z', status: 'upcoming' },
  { id: 'F2', home: 'Australia', away: 'Saudi Arabia', group: 'F', date: '2026-06-18T20:00:00Z', status: 'upcoming' },
  { id: 'F3', home: 'South Korea', away: 'Australia', group: 'F', date: '2026-06-20T18:00:00Z', status: 'upcoming' },
  { id: 'F4', home: 'Saudi Arabia', away: 'Japan', group: 'F', date: '2026-06-21T20:00:00Z', status: 'upcoming' },
  { id: 'F5', home: 'Japan', away: 'Australia', group: 'F', date: '2026-06-24T20:00:00Z', status: 'upcoming' },
  { id: 'F6', home: 'South Korea', away: 'Saudi Arabia', group: 'F', date: '2026-06-25T18:00:00Z', status: 'upcoming' },
  // Group G
  { id: 'G1', home: 'Senegal', away: 'Cameroon', group: 'G', date: '2026-06-19T18:00:00Z', status: 'upcoming' },
  { id: 'G2', home: 'Morocco', away: 'Ghana', group: 'G', date: '2026-06-19T20:00:00Z', status: 'upcoming' },
  { id: 'G3', home: 'Cameroon', away: 'Morocco', group: 'G', date: '2026-06-22T20:00:00Z', status: 'upcoming' },
  { id: 'G4', home: 'Ghana', away: 'Senegal', group: 'G', date: '2026-06-23T18:00:00Z', status: 'upcoming' },
  { id: 'G5', home: 'Senegal', away: 'Morocco', group: 'G', date: '2026-06-25T20:00:00Z', status: 'upcoming' },
  { id: 'G6', home: 'Cameroon', away: 'Ghana', group: 'G', date: '2026-06-26T18:00:00Z', status: 'upcoming' },
  // Group H
  { id: 'H1', home: 'Croatia', away: 'Serbia', group: 'H', date: '2026-06-20T20:00:00Z', status: 'upcoming' },
  { id: 'H2', home: 'Poland', away: 'Denmark', group: 'H', date: '2026-06-21T18:00:00Z', status: 'upcoming' },
  { id: 'H3', home: 'Serbia', away: 'Poland', group: 'H', date: '2026-06-24T18:00:00Z', status: 'upcoming' },
  { id: 'H4', home: 'Denmark', away: 'Croatia', group: 'H', date: '2026-06-24T20:00:00Z', status: 'upcoming' },
  { id: 'H5', home: 'Croatia', away: 'Poland', group: 'H', date: '2026-06-26T20:00:00Z', status: 'upcoming' },
  { id: 'H6', home: 'Serbia', away: 'Denmark', group: 'H', date: '2026-06-27T18:00:00Z', status: 'upcoming' }
];

export const formatMatchDate = (dateIso: string) => {
  const date = new Date(dateIso);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).format(date) + ' UTC';
};

export const getMatchResult = (match: Match, predicted: Outcome | undefined): Outcome | undefined => {
  if (match.status === 'completed') {
    return match.result;
  }

  return predicted;
};

export const calculateGroupRankings = (
  matches: Match[],
  predictions: Record<string, Outcome>
): Record<string, TeamStanding[]> => {
  const standings: Record<string, Record<string, TeamStanding>> = {};

  groups.forEach((group) => {
    standings[group.letter] = {};
    group.teams.forEach((team) => {
      standings[group.letter][team] = {
        team,
        group: group.letter,
        played: 0,
        win: 0,
        draw: 0,
        loss: 0,
        points: 0
      };
    });
  });

  matches.forEach((match) => {
    const outcome = getMatchResult(match, predictions[match.id]);
    if (!outcome) return;

    const homeTeam = standings[match.group][match.home];
    const awayTeam = standings[match.group][match.away];

    homeTeam.played += 1;
    awayTeam.played += 1;

    if (outcome === 'home') {
      homeTeam.win += 1;
      homeTeam.points += 3;
      awayTeam.loss += 1;
    } else if (outcome === 'away') {
      awayTeam.win += 1;
      awayTeam.points += 3;
      homeTeam.loss += 1;
    } else {
      homeTeam.draw += 1;
      awayTeam.draw += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  });

  const rankedGroups: Record<string, TeamStanding[]> = {};
  Object.entries(standings).forEach(([group, teams]) => {
    rankedGroups[group] = Object.values(teams).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.win !== a.win) return b.win - a.win;
      return a.team.localeCompare(b.team);
    });
  });

  return rankedGroups;
};

export const roundOf16Schedule = [
  { label: 'A1 vs B2', homeSeed: 'A1', awaySeed: 'B2' },
  { label: 'C1 vs D2', homeSeed: 'C1', awaySeed: 'D2' },
  { label: 'E1 vs F2', homeSeed: 'E1', awaySeed: 'F2' },
  { label: 'G1 vs H2', homeSeed: 'G1', awaySeed: 'H2' },
  { label: 'B1 vs A2', homeSeed: 'B1', awaySeed: 'A2' },
  { label: 'D1 vs C2', homeSeed: 'D1', awaySeed: 'C2' },
  { label: 'F1 vs E2', homeSeed: 'F1', awaySeed: 'E2' },
  { label: 'H1 vs G2', homeSeed: 'H1', awaySeed: 'G2' }
];

export const stats: { label: string; value: string }[] = [
  { label: 'Highest scorer', value: 'Kylian Mbappé (France) - 4 goals' },
  { label: 'Most assists', value: 'Kevin De Bruyne (Belgium) - 3 assists' },
  { label: 'Top MVP', value: 'Lionel Messi (Argentina)' },
  { label: 'Most saves', value: 'Gianluigi Donnarumma (Italy) - 14 saves' }
];
