"use client";
import React,{useEffect,useMemo,useState} from 'react';
import {initialMatches,groups,calculateGroupRankings,roundOf16Schedule,stats,news as sampleNews,Outcome,Match} from './match-data';
import useLiveData from './hooks/useLiveData';
import {MatchCard} from './components';

export default function HomePage(){
const[matches,setMatches]=useState<Match[]>(initialMatches);
const[predictions,setPredictions]=useState<Record<string,Outcome>>({});
const[theme,setTheme]=useState<'dark'|'light'>('dark');
const live=useLiveData();
useEffect(()=>{document.documentElement.classList.toggle('theme-light',theme==='light')},[theme]);
useEffect(()=>{if(live?.matches)setMatches(live.matches as Match[])},[live]);
const standings=useMemo(()=>calculateGroupRankings(matches,predictions),[matches,predictions]);
const upcoming=matches.filter(m=>m.status==='upcoming');
const r16=useMemo(()=>{const seeds:any={};Object.entries(standings).forEach(([g,t]:any)=>{if(t[0])seeds[g+'1']=t[0].team;if(t[1])seeds[g+'2']=t[1].team});return roundOf16Schedule.map((m:any)=>({...m,home:seeds[m.homeSeed]||m.homeSeed,away:seeds[m.awaySeed]||m.awaySeed}));},[standings]);
if(!live)return <main><div className='card'>Loading live data...</div></main>;
return <main><div style={{position:'sticky',top:0,zIndex:20}} className='card'><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><strong>🔴 LIVE</strong><div className='ticker' aria-label='Upcoming matches ticker'>{upcoming.slice(0,5).map(m=>`${m.home} vs ${m.away}`).join(' • ')}</div><button className='button-secondary' onClick={()=>setTheme(theme==='dark'?'light':'dark')}>Theme</button></div></div><h1>🏆 FIFA 2026 Predictor</h1><div className='card'><span>🟢 Live Data Connected</span></div><section id='matches' className='card'><h2>Matches</h2>{upcoming.map(m=><MatchCard key={m.id} match={m} value={predictions[m.id]} onSelect={(o)=>setPredictions(p=>({...p,[m.id]:o}))}/> )}</section><section id='standings' className='card'><h2>Standings</h2>{groups.map(g=><div key={g.letter}><h3>Group {g.letter}</h3>{(standings[g.letter]||[]).map((r,i)=><div key={r.team} className='stats-item'><span>{['🥇','🥈','🥉','4️⃣'][i]||'•'} {r.team}</span><strong>{r.points} pts</strong></div>)}</div>)}</section><section id='bracket' className='card'><h2>Knockout Bracket</h2><div className='grid grid-2'>{r16.map((m:any)=><div key={m.label} className='match-card'><strong>🏳️ {m.home}</strong><span>vs</span><strong>🏳️ {m.away}</strong></div>)}</div></section><section className='card'><h2>News</h2>{sampleNews.slice(0,3).map((n:any)=><div key={n.id}>{n.title}</div>)}</section><section className='card'><h2>Stats</h2><div className='grid grid-3'>{stats.map(s=><div key={s.label} className='stats-item'><span>{s.label}</span><strong>{s.value}</strong></div>)}</div></section><nav style={{position:'fixed',bottom:0,left:0,right:0,display:'flex',justifyContent:'space-around',padding:12,background:'var(--card-bg)'}}><a href='#matches'>Matches</a><a href='#standings'>Standings</a><a href='#bracket'>Bracket</a></nav></main>
}