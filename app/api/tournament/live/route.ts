import { NextResponse } from 'next/server';
import { fetchLiveTournamentData } from '@/lib/apiFootball';

export async function GET() {
  try {
    const data = await fetchLiveTournamentData();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load live tournament data.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
