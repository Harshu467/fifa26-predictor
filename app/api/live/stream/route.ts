import { fetchLiveData } from '../schedule/live-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let lastSnapshot: any = { matches: [], stats: [], news: [], source: 'fallback', ts: Date.now() };

export async function GET(req: Request) {
  const { readable, writable } = new TransformStream<any, Uint8Array>();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = (event: string, obj: any) => {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(obj)}\n\n`;
      writer.write(encoder.encode(payload));
    } catch (e) {
      // Stream closed or disconnected
    }
  };

  const sendSnapshot = async () => {
    const payload = await fetchLiveData();
    lastSnapshot = payload;
    sendEvent('snapshot', { payload });
  };

  await sendSnapshot();

  const interval = setInterval(async () => {
    await sendSnapshot();
    sendEvent('heartbeat', { ts: Date.now() });
  }, 10000);

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
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
