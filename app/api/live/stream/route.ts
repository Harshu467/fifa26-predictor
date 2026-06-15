import { initialMatches } from '../../../match-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let lastSnapshot = { matches: initialMatches, ts: Date.now() };

export async function GET(req: Request) {
  // Create a ReadableStream for SSE
  const { readable, writable } = new TransformStream<any, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const send = (obj: any) => {
    try {
      const encoded = encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);
      writer.write(encoded);
    } catch (e) {
      // Stream closed
    }
  };

  // Send initial snapshot
  send({ type: 'snapshot', payload: lastSnapshot });

  // Periodic heartbeat and refresh (every 10 seconds)
  const interval = setInterval(() => {
    send({ type: 'heartbeat', ts: Date.now() });
  }, 10000);

  // Handle client disconnect
  const cleanup = () => {
    clearInterval(interval);
    try {
      writer.close();
    } catch (e) {
      // Already closed
    }
  };

  req.signal.addEventListener('abort', cleanup);

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
