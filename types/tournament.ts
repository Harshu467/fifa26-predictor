export type MatchStatus = 'live' | 'completed' | 'upcoming';
export type TournamentRound =
  | 'Group Stage'
  | 'Round of 32'
  | 'Round of 16'
  | 'Quarter Finals'
  | 'Semi Finals'
  | 'Final';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flag: string;
  group: string;
  rating: number;
}

export interface PredictionPercentages {
  home: number;
  draw: number;
  away: number;
}

export interface MatchPrediction {
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  confidence: number;
  notes: string;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string;
  venue: string;
  group: string;
  round: TournamentRound;
  status: MatchStatus;
  predictionPercentages: PredictionPercentages;
  prediction: MatchPrediction;
}

export interface StandingRow {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualification: 'qualified' | 'not-qualified' | 'na';
}

export interface BracketMatch {
  id: string;
  round: Exclude<TournamentRound, 'Group Stage'>;
  homeTeam: Team | null;
  awayTeam: Team | null;
  winner: Team | null;
}
