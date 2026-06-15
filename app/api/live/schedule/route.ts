import { NextResponse } from 'next/server';
import { fetchLiveData } from './live-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
