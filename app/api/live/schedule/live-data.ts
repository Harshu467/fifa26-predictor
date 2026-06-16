import { initialMatches, stats, news, Match } from '../../../match-data';

export interface LivePayload {
  matches: Match[];
  stats: typeof stats;
  news: typeof news;
  source: 'provider' | 'fallback' | 'rate-limit-cache' | 'cache';
  error?: string;
}

const cache:{data:LivePayload|null;ts:number}={data:null,ts:0};
const CACHE_TTL=5000;
const RATE_LIMIT_WINDOW=60000;
const MAX_REQUESTS_PER_WINDOW=10;
const requestLog:number[]=[];

function isRateLimited(){const now=Date.now();while(requestLog.length&&requestLog[0]<now-RATE_LIMIT_WINDOW)requestLog.shift();if(requestLog.length>=MAX_REQUESTS_PER_WINDOW)return true;requestLog.push(now);return false;}

function transformApiFootballResponse(data:any):Match[]{
 if(!data?.response||!Array.isArray(data.response)) return [];
 return data.response.map((m:any,idx:number)=>{
 const fixture=m.fixture||{}; const teams=m.teams||{}; const goals=m.goals||{};
 const short=fixture.status?.short;
 let status:any='upcoming';
 if(['1H','HT','2H','ET','BT','P'].includes(short)) status='live';
 else if(['FT','AET','PEN'].includes(short)) status='completed';
 return {
 id:`match-${fixture.id||idx}`,
 home:teams.home?.name||'Home',
 away:teams.away?.name||'Away',
 date:fixture.date?new Date(fixture.date).toISOString():new Date().toISOString(),
 group:'World Cup',
 status,
 homeScore:goals.home??0,
 awayScore:goals.away??0,
 minute:fixture.status?.elapsed,
 result:status==='completed'?((goals.home??0)>(goals.away??0)?'home':(goals.away??0)>(goals.home??0)?'away':'draw'):undefined
 } as Match;
 });
}

async function fetchFromApiFootball(key:string){
 try{
 const leagueId=process.env.FIFA_WORLD_CUP_LEAGUE_ID;
 const url=leagueId
 ? `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=2026`
 : 'https://v3.football.api-sports.io/fixtures?season=2026';
 const res=await fetch(url,{headers:{'x-apisports-key':key}});
 if(!res.ok) return null;
 return await res.json();
 }catch{return null;}
}

function createFallbackPayload(error?:string):LivePayload{
 return {matches:[],stats,news,source:'fallback',error};
}

export async function fetchLiveData():Promise<LivePayload>{
 const provider=process.env.LIVE_API_PROVIDER?.trim();
 const key=process.env.LIVE_API_KEY?.trim();
 if(!provider||!key) return createFallbackPayload('Missing API configuration');
 if(isRateLimited()) return cache.data?{...cache.data,source:'rate-limit-cache'}:{...createFallbackPayload('Rate limit exceeded'),source:'rate-limit-cache'};
 const now=Date.now();
 if(cache.data&&now-cache.ts<CACHE_TTL) return {...cache.data,source:cache.data.source==='provider'?'cache':cache.data.source};
 let matches:Match[]=[]; let source:LivePayload['source']='provider'; let error:string|undefined;
 if(provider==='api-football'){
 const data=await fetchFromApiFootball(key);
 if(data?.response) matches=transformApiFootballResponse(data); else {source='fallback'; error='Unable to fetch provider data';}
 }
 const result={matches,stats,news,source,error};
 cache.data=result; cache.ts=now; return result;
}
