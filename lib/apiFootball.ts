import type { Match, MatchPrediction, MatchStatus, Team } from '@/types/tournament';

const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const DEFAULT_LEAGUE_ID = '1';
const DEFAULT_SEASON = '2026';

interface ApiFootballEnvelope<T> {
  errors?: unknown;
  response?: T;
}

interface ApiFootballTeam {
  id: number;
  name: string;
  code?: string | null;
  logo?: string | null;
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue?: { name?: string | null };
  };
  league: { round?: string | null };
  teams: {
    home: ApiFootballTeam;
    away: ApiFootballTeam;
  };
  goals: { home: number | null; away: number | null };
  score?: { fulltime?: { home: number | null; away: number | null } };
}

const statusMap: Record<string, MatchStatus> = {
  TBD: 'upcoming',
  NS: 'upcoming',
  '1H': 'live',
  HT: 'live',
  '2H': 'live',
  ET: 'live',
  BT: 'live',
  P: 'live',
  SUSP: 'live',
  INT: 'live',
  FT: 'completed',
  AET: 'completed',
  PEN: 'completed',
};

const emptyPrediction: MatchPrediction = {
  homeScore: null,
  awayScore: null,
  winnerId: null,
  confidence: 50,
  notes: '',
};

export async function fetchLiveTournamentData() {
  const apiKey = process.env.API_FOOTBALL_KEY ?? process.env.APISPORTS_KEY;
  if (!apiKey) {
    throw new Error('Missing API_FOOTBALL_KEY or APISPORTS_KEY environment variable.');
  }

  const league = process.env.API_FOOTBALL_LEAGUE_ID ?? DEFAULT_LEAGUE_ID;
  const season = process.env.API_FOOTBALL_SEASON ?? DEFAULT_SEASON;
  const fixtures = await apiFootballRequest<ApiFootballFixture[]>(
    '/fixtures',
    { league, season },
    apiKey,
  );

  const teamsById = new Map<string, Team>();
  const matches = fixtures.map((fixture) => mapFixture(fixture, teamsById));

  return {
    source: 'api-football',
    league,
    season,
    updatedAt: new Date().toISOString(),
    teams: [...teamsById.values()],
    matches,
  };
}

async function apiFootballRequest<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<T> {
  const url = new URL(`${API_FOOTBALL_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: { 'x-apisports-key': apiKey },
    next: { revalidate: Number(process.env.API_FOOTBALL_REVALIDATE_SECONDS ?? 60) },
  });

  if (!response.ok) {
    throw new Error(`API-Football request failed with ${response.status}`);
  }

  const payload = (await response.json()) as ApiFootballEnvelope<T>;
  if (payload.errors && Object.keys(payload.errors as object).length > 0) {
    throw new Error(`API-Football returned errors: ${JSON.stringify(payload.errors)}`);
  }

  return payload.response ?? ([] as T);
}

function mapFixture(fixture: ApiFootballFixture, teamsById: Map<string, Team>): Match {
  const homeTeam = upsertTeam(fixture.teams.home, fixture.league.round, teamsById);
  const awayTeam = upsertTeam(fixture.teams.away, fixture.league.round, teamsById);
  const homeScore = fixture.goals.home ?? fixture.score?.fulltime?.home ?? null;
  const awayScore = fixture.goals.away ?? fixture.score?.fulltime?.away ?? null;
  const status = statusMap[fixture.fixture.status.short] ?? 'upcoming';

  return {
    id: String(fixture.fixture.id),
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    kickoff: fixture.fixture.date,
    venue: fixture.fixture.venue?.name ?? 'TBD',
    group: extractGroup(fixture.league.round),
    round: fixture.league.round?.includes('Group') ? 'Group Stage' : 'Round of 32',
    status,
    predictionPercentages: { home: 34, draw: 32, away: 34 },
    prediction: {
      ...emptyPrediction,
      homeScore: status === 'completed' || status === 'live' ? homeScore : null,
      awayScore: status === 'completed' || status === 'live' ? awayScore : null,
      winnerId:
        homeScore === null || awayScore === null || homeScore === awayScore
          ? null
          : homeScore > awayScore
            ? homeTeam.id
            : awayTeam.id,
      notes: fixture.fixture.status.long,
    },
  };
}

function upsertTeam(
  team: ApiFootballTeam,
  round: string | null | undefined,
  teamsById: Map<string, Team>,
) {
  const id = String(team.id);
  const existing = teamsById.get(id);
  if (existing) return existing;

  const nextTeam: Team = {
    id,
    name: team.name,
    shortName: team.code ?? team.name.slice(0, 3).toUpperCase(),
    flag: team.logo ?? '',
    group: extractGroup(round),
    rating: 80,
  };
  teamsById.set(id, nextTeam);
  return nextTeam;
}

function extractGroup(round: string | null | undefined) {
  const match = round?.match(/Group\s+([A-Z])/i);
  return match?.[1]?.toUpperCase() ?? 'Live';
}
