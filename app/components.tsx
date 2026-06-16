import React from 'react';
import { Outcome, Match } from './match-data';

const predictionMap: Record<Outcome, string> = { home: 'Home Win', away: 'Away Win', draw: 'Tie' };

export function TeamCard({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
 return <div className={`team-card ${selected ? 'selected' : ''}`} onClick={onClick} role="button" tabIndex={0}><strong>{name}</strong></div>;
}

export function MatchCard({ match, value, onSelect }: { match: Match; value?: Outcome; onSelect: (o: Outcome) => void }) {
 const m:any=match;
 const isCompleted = match.status === 'completed';
 const scoreAvailable = typeof m.homeScore==='number' && typeof m.awayScore==='number';
 return (
 <div className="match-card animate-float" style={{display:'flex',flexDirection:'column',gap:12}}>
  <div>
   <div className="match-meta" style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
    <strong>{match.home} vs {match.away}</strong>
    <span>{match.group}</span>
    {scoreAvailable && <span style={{fontWeight:700}}>{m.homeScore} - {m.awayScore}</span>}
    {m.minute && <span style={{padding:'2px 8px',borderRadius:999}}>⏱ {m.minute}'</span>}
   </div>
   <div style={{fontSize:'0.9rem',opacity:0.8,wordBreak:'break-word'}}>{match.date}</div>
  </div>
  <div className="match-actions" style={{display:'flex',flexWrap:'wrap',gap:8}}>
   {isCompleted ? <span>{predictionMap[match.result as Outcome] || 'Finished'}</span> : <>
    <TeamCard name={match.home} selected={value==='home'} onClick={()=>onSelect('home')} />
    <TeamCard name={match.away} selected={value==='away'} onClick={()=>onSelect('away')} />
    <TeamCard name='Tie' selected={value==='draw'} onClick={()=>onSelect('draw')} />
   </>}
  </div>
 </div>);
}
