import { fetchLiveData } from '../schedule/live-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
 const { readable, writable } = new TransformStream<any, Uint8Array>();
 const writer = writable.getWriter();
 const encoder = new TextEncoder();
 let closed=false;
 let inFlight=false;

 const sendEvent=(event:string,obj:any)=>{
  if(closed) return;
  try{writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(obj)}\n\n`));}catch{}
 };

 const sendSnapshot=async()=>{
  if(inFlight||closed) return;
  inFlight=true;
  try{
   const payload=await fetchLiveData();
   sendEvent('snapshot',{payload});
  }finally{
   inFlight=false;
  }
 };

 await sendSnapshot();

 const interval=setInterval(async()=>{
  await sendSnapshot();
  sendEvent('heartbeat',{ts:Date.now()});
 },10000);

 const cleanup=()=>{
  if(closed) return;
  closed=true;
  clearInterval(interval);
  try{writer.close();}catch{}
 };

 req.signal.addEventListener('abort',cleanup);

 return new Response(readable,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform',Connection:'keep-alive','Access-Control-Allow-Origin':'*'}});
}
