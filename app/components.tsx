import React from 'react';
import { Outcome, Match } from './match-data';

const predictionMap: Record<Outcome, string> = {
  home: 'Home Win',
  away: 'Away Win',
  draw: 'Tie'
};

export function TeamCard({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
  function handleKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }
  return (
    <div
      className={`team-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onKeyDown={handleKey}
    >
      <strong>{name}</strong>
    </div>
  );
}

export function MatchCard({ match, value, onSelect }: { match: Match; value?: Outcome; onSelect: (o: Outcome) => void }) {
  const isCompleted = match.status === 'completed';
  return (
    <div className="match-card animate-float">
      <div>
        <div className="match-meta">
          <strong>{match.home} vs {match.away}</strong>
          <span>{match.group}</span>
          <span>{match.date}</span>
        </div>
      </div>
      <div className="match-actions">
        {isCompleted ? (
          <span>{value && predictionMap[value]}</span>
        ) : (
          <>
            <TeamCard
              name={match.home}
              selected={value === 'home'}
              onClick={() => onSelect('home')}
            />
            <span className="vs-pill">vs</span>
            <TeamCard
              name={match.away}
              selected={value === 'away'}
              onClick={() => onSelect('away')}
            />
            <TeamCard
              name="Tie"
              selected={value === 'draw'}
              onClick={() => onSelect('draw')}
            />
          </>
        )}
      </div>
    </div>
  );
}
