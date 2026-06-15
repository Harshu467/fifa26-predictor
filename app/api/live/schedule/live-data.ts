import { initialMatches, stats, news, Match } from '../../../match-data';

export interface LivePayload {
  matches: Match[];
  stats: typeof stats;
  news: typeof news;
  source: 'provider' | 'fallback' | 'rate-limit-cache' | 'cache';
  error?: string;
}

const cache: { data: LivePayload | null; ts: number } = { data: null, ts: 0 };
const CACHE_TTL = 15000; // 15 seconds
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT_WINDOW) {
    requestLog.shift();
  }
  if (requestLog.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  requestLog.push(now);
  return false;
}

function transformApiFootballResponse(data: any): Match[] {
  if (!data?.response || !Array.isArray(data.response)) {
    return initialMatches;
  }

  return data.response.map((match: any, idx: number) => {
    const fixture = match.fixture || {};
    const teams = match.teams || {};
    const goals = match.goals || {};
    const homeTeam = teams.home?.name || 'Team A';
    const awayTeam = teams.away?.name || 'Team B';

    return {
      id: `match-${fixture.id || idx}`,
      home: homeTeam,
      away: awayTeam,
      date: fixture.date ? new Date(fixture.date).toISOString() : new Date().toISOString(),
      group: fixture.league?.name?.includes('Group') ? fixture.league.name.split(' ')[1] : 'N/A',
      status:
        fixture.status?.short === 'FT' || fixture.status?.short === 'AET' || fixture.status?.short === 'PEN'
          ? 'completed'
          : 'upcoming',
      result:
        fixture.status?.short === 'FT' || fixture.status?.short === 'AET'
          ? (goals.home ?? 0) > (goals.away ?? 0)
            ? 'home'
            : (goals.away ?? 0) > (goals.home ?? 0)
            ? 'away'
            : 'draw'
          : undefined
    } as Match;
  });
}

async function fetchFromApiFootball(key: string): Promise<any> {
  try {
    const url = 'https://v3.football.api-sports.io/fixtures?season=2026&league=1';
    const res = await fetch(url, {
      headers: { 'x-apisports-key': key }
    });

    if (!res.ok) {
      console.error('API Football error:', res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

function createFallbackPayload(error?: string): LivePayload {
  return {
    matches: initialMatches,
    stats,
    news,
    source: 'fallback',
    error
  };
}

export async function fetchLiveData(): Promise<LivePayload> {
  const provider = process.env.LIVE_API_PROVIDER?.trim();
  const key = process.env.LIVE_API_KEY?.trim();

  if (!provider || !key) {
    return createFallbackPayload('No LIVE_API_PROVIDER or LIVE_API_KEY configured');
  }

  if (isRateLimited()) {
    console.warn('Rate limit exceeded, returning cached data');
    if (cache.data) {
      return { ...cache.data, source: 'rate-limit-cache' };
    }
    return { ...createFallbackPayload('Rate limit exceeded'), source: 'rate-limit-cache' };
  }

  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return { ...cache.data, source: cache.data.source === 'provider' ? 'cache' : cache.data.source };
  }

  let matches: Match[] = initialMatches;
  let source: LivePayload['source'] = 'provider';
  let error: string | undefined;

  if (provider === 'api-football') {
    const data = await fetchFromApiFootball(key);
    if (data && data.response) {
      matches = transformApiFootballResponse(data);
      if (!matches.length) {
        source = 'fallback';
        error = 'Provider returned no matches';
      }
    } else {
      source = 'fallback';
      error = 'Unable to fetch live provider data';
    }
  } else {
    source = 'fallback';
    error = `Unsupported provider: ${provider}`;
  }

  const result: LivePayload = {
    matches,
    stats,
    news,
    source,
    error
  };

  cache.data = result;
  cache.ts = now;

  return result;
}
