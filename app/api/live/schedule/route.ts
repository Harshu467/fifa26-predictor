import { NextResponse } from 'next/server';
import { initialMatches, stats, news } from '../../../match-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/live/schedule
export async function GET() {
  const provider = process.env.LIVE_API_PROVIDER;
  const key = process.env.LIVE_API_KEY;

  // If an external provider is configured, proxy the request (user must configure env)
  if (key && provider === 'api-football') {
    try {
      // Example endpoint - users should update to the chosen provider and endpoint
      const res = await fetch('https://v3.football.api-sports.io/fixtures?season=2026&league=1', {
        headers: { 'x-apisports-key': key }
      });
      const data = await res.json();
      return NextResponse.json({ source: 'provider', data });
    } catch (e) {
      // fallback to mock
    }
  }

  // Default: return the in-repo match data as a snapshot
  return NextResponse.json({ source: 'mock', matches: initialMatches, stats, news });
}
