import { Readable } from 'stream';
import { initialMatches } from '../../../match-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function createStream() {
  const stream = new Readable({ read() {} });
  return stream;
}

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // send periodic updates (mocked). In production, poll the provider and push changes.
  const send = (obj: any) => writer.write(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

  // initial snapshot
  send({ type: 'snapshot', matches: initialMatches });

  const interval = setInterval(() => {
    // for demo, send a heartbeat update; real implementation would diff provider data
    send({ type: 'heartbeat', ts: Date.now() });
  }, 5000);

  // close on client disconnect
  const abort = (err?: any) => {
    clearInterval(interval);
    try { writer.close(); } catch (e) {}
  };

  try {
    // attach abort handler if available
    (req as any).signal?.addEventListener?.('abort', abort);
  } catch (e) {}

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
