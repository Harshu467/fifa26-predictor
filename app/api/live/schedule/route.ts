import { NextResponse } from 'next/server';
import { initialMatches, stats, news, Match } from '../../../match-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory cache with TTL
const cache: { data: any; ts: number } = { data: null, ts: 0 };
const CACHE_TTL = 15000; // 15 seconds
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove old requests outside the window
  while (requestLog.length > 0 && requestLog[0] < now - RATE_LIMIT_WINDOW) {
    requestLog.shift();
  }
  // Check if we've exceeded the limit
  if (requestLog.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  requestLog.push(now);
  return false;
}

function transformApiFootballResponse(data: any): Match[] {
  // API-Football response format: { response: [{ fixture, teams, goals }, ...] }
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
      status: fixture.status?.short === 'FT' || fixture.status?.short === 'AET' || fixture.status?.short === 'PEN' ? 'completed' : 'upcoming',
      result: fixture.status?.short === 'FT' || fixture.status?.short === 'AET' ? (
        (goals.home ?? 0) > (goals.away ?? 0) ? 'home' : (goals.away ?? 0) > (goals.home ?? 0) ? 'away' : 'draw'
      ) : undefined
    } as Match;
  });
}

async function fetchFromApiFootball(key: string): Promise<any> {
  try {
    // Fetch World Cup 2026 matches
    const url = 'https://v3.football.api-sports.io/fixtures?season=2026&league=1';
    const res = await fetch(url, {
      headers: { 'x-apisports-key': key }
    });

    if (!res.ok) {
      console.error('API Football error:', res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

async function fetchLiveData(): Promise<{ matches: Match[]; stats: any; news: any }> {
  const provider = process.env.LIVE_API_PROVIDER;
  const key = process.env.LIVE_API_KEY;

  // No provider configured, return mock
  if (!provider || !key) {
    return { matches: initialMatches, stats, news };
  }

  // Check rate limit
  if (isRateLimited()) {
    console.warn('Rate limit exceeded, returning cached data');
    return cache.data || { matches: initialMatches, stats, news };
  }

  // Check in-memory cache
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  // Fetch from provider
  let matches: Match[] = initialMatches;
  if (provider === 'api-football') {
    const data = await fetchFromApiFootball(key);
    if (data) {
      matches = transformApiFootballResponse(data);
    }
  }

  const result = { matches, stats, news };
  cache.data = result;
  cache.ts = now;

  return result;
}

// GET /api/live/schedule
export async function GET(req: Request) {
  const data = await fetchLiveData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-cache, must-revalidate',
      'Content-Type': 'application/json'
    }
  });
}
