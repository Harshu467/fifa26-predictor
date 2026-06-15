"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Outcome,
  Match,
  initialMatches,
  groups,
  stats,
  formatMatchDate,
  calculateGroupRankings,
  roundOf16Schedule,
  news as sampleNews,
  getMatchResult
} from './match-data';
import useLiveData from './hooks/useLiveData';

const predictionMap: Record<Outcome, string> = {
  home: 'Home Win',
  away: 'Away Win',
  draw: 'Tie'
};

function TeamCard({ name, selected, onClick }: { name: string; selected: boolean; onClick: () => void }) {
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

function MatchCard({ match, value, onSelect }: { match: Match; value?: Outcome; onSelect: (o: Outcome) => void }) {
  const isCompleted = match.status === 'completed';
  return (
    <div className="match-card animate-float">
      <div>
        <div className="match-meta">
          <strong>{match.home} vs {match.away}</strong>
          <span>{formatMatchDate(match.date)}</span>
          <span className="tag">Group {match.group}</span>
        </div>
      </div>
      <div className="match-actions">
        <TeamCard name={match.home} selected={(value ?? match.result) === 'home'} onClick={() => !isCompleted && onSelect('home')} />
        <div className="vs-pill">VS</div>
        <TeamCard name={match.away} selected={(value ?? match.result) === 'away'} onClick={() => !isCompleted && onSelect('away')} />
        <div style={{ width: 12 }} />
        <button className="button-secondary" onClick={() => !isCompleted && onSelect('draw')}>Tie</button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [predictions, setPredictions] = useState<Record<string, Outcome>>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('predictions') : null;
      return raw ? (JSON.parse(raw) as Record<string, Outcome>) : {};
    } catch (e) {
      return {};
    }
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (typeof window !== 'undefined' && localStorage.getItem('theme')) === 'light' ? 'light' : 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  const live = useLiveData();
  useEffect(() => {
    if (live) {
      // provider returns { matches, stats, news } or similar
      if (live.matches) setMatches(live.matches as Match[]);
    }
  }, [live]);

  useEffect(() => {
    try {
      localStorage.setItem('predictions', JSON.stringify(predictions));
    } catch (e) {
      // ignore
    }
  }, [predictions]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // show past matches first
  const pastMatches = useMemo(() => matches.filter((m) => m.status === 'completed').sort((a, b) => +new Date(b.date) - +new Date(a.date)), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((m) => m.status === 'upcoming').sort((a, b) => +new Date(a.date) - +new Date(b.date)), [matches]);

  const groupRankings = useMemo(() => calculateGroupRankings(matches, predictions), [matches, predictions]);

  function handlePrediction(matchId: string, value: Outcome) {
    setPredictions((prev) => ({ ...prev, [matchId]: value }));
  }

  function applyPredictions() {
    setMatches((prev) => prev.map((m) => (m.status === 'upcoming' && predictions[m.id] ? { ...m, status: 'completed', result: predictions[m.id] } : m)));
  }

  // Round of 16 mapping
  const roundOf16 = useMemo(() => {
    const seedMap: Record<string, string> = {};
    Object.entries(groupRankings).forEach(([group, teams]) => {
      if (teams[0]) seedMap[`${group}1`] = teams[0].team;
      if (teams[1]) seedMap[`${group}2`] = teams[1].team;
    });
    return roundOf16Schedule.map((s) => ({ ...s, home: seedMap[s.homeSeed] ?? s.homeSeed, away: seedMap[s.awaySeed] ?? s.awaySeed }));
  }, [groupRankings]);

  // component for knockout selection with penalties
  function KnockoutMatch({ label, home, away }: { label: string; home: string; away: string }) {
    const [choice, setChoice] = useState<Outcome | undefined>(undefined);
    const [homePen, setHomePen] = useState<number | ''>('');
    const [awayPen, setAwayPen] = useState<number | ''>('');

    useEffect(() => { if (choice !== 'draw') { setHomePen(''); setAwayPen(''); } }, [choice]);

    const winner = (() => {
      if (choice === 'home') return home;
      if (choice === 'away') return away;
      if (choice === 'draw' && homePen !== '' && awayPen !== '') {
        if ((homePen as number) > (awayPen as number)) return home;
        if ((awayPen as number) > (homePen as number)) return away;
        return 'Tie';
      }
      return undefined;
    })();

    return (
      <div className="match-card">
        <div>
          <strong>{label}</strong>
          <div className="small-text">{home} vs {away}</div>
          <div className="small-text">Winner: {winner ?? 'TBD'}</div>
        </div>
        <div className="match-actions">
          <button className={`button-secondary ${choice === 'home' ? 'selected' : ''}`} onClick={() => setChoice('home')}>{home}</button>
          <div className="vs-pill">VS</div>
          <button className={`button-secondary ${choice === 'away' ? 'selected' : ''}`} onClick={() => setChoice('away')}>{away}</button>
          <div style={{ width: 8 }} />
          <button className={`button-secondary ${choice === 'draw' ? 'selected' : ''}`} onClick={() => setChoice('draw')}>Decide on penalties</button>
          {choice === 'draw' && (
            <div style={{ display: 'flex', gap: 8, marginLeft: 12, alignItems: 'center' }}>
              <input type="number" min={0} max={10} value={homePen as any} onChange={(e) => setHomePen(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 56 }} />
              <span className="small-text">-</span>
              <input type="number" min={0} max={10} value={awayPen as any} onChange={(e) => setAwayPen(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: 56 }} />
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderGroupGraph(letter: string) {
    const rows = groupRankings[letter] ?? [];
    const maxPts = Math.max(1, ...rows.map((r) => r.points));
    return (
      <div style={{ paddingTop: 12 }}>
        {rows.map((r) => (
          <div key={r.team} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 120 }}>{r.team}</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', height: 10, borderRadius: 6 }}>
              <div style={{ width: `${(r.points / maxPts) * 100}%`, background: 'linear-gradient(90deg,var(--accent-1),var(--accent-2))', height: '100%', borderRadius: 6 }} />
            </div>
            <div style={{ width: 36, textAlign: 'right' }}>{r.points}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main>
      <div className="section-heading">
        <div>
          <h1>FIFA World Cup 2026 Predictor</h1>
          <p className="small-text">Interactive predictions — past matches are shown first. Use the theme toggle to switch visuals.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="button-secondary" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>Toggle theme</button>
          <button className="button-primary" type="button" onClick={applyPredictions}>Finalize Predictions</button>
        </div>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Past Matches</h2>
            <p className="small-text">Most recent first.</p>
          </div>
        </div>
        <div className="grid">
          {pastMatches.map((m) => (
            <MatchCard key={m.id} match={m} value={predictions[m.id]} onSelect={(o) => handlePrediction(m.id, o)} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Upcoming Matches</h2>
            <p className="small-text">Choose the predicted result and watch standings update live.</p>
          </div>
        </div>
        <div className="grid">
          {upcomingMatches.map((m) => (
            <MatchCard key={m.id} match={m} value={predictions[m.id]} onSelect={(o) => handlePrediction(m.id, o)} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Projected Round of 16 (R-32)</h2>
            <p className="small-text">Decide winners or use penalty shootout for ties.</p>
          </div>
        </div>
        <div className="grid grid-2">
          {roundOf16.map((r) => (
            <KnockoutMatch key={r.label} label={r.label} home={r.home} away={r.away} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Group Standings & Round-Robin Graphs</h2>
            <p className="small-text">Standings update with your predictions.</p>
          </div>
        </div>
        <div className="grid grid-2">
          {groups.map((g) => (
            <div className="card" key={g.letter}>
              <h3>Group {g.letter}</h3>
              {renderGroupGraph(g.letter)}
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>News</h2>
            <p className="small-text">Latest tournament updates.</p>
          </div>
        </div>
        <div className="grid">
          {sampleNews.map((n) => (
            <div key={n.id} className="match-card">
              <div>
                <strong>{n.title}</strong>
                <div className="small-text">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Stats</h2>
            <p className="small-text">Top players.</p>
          </div>
        </div>
        <div className="grid grid-3">
          {stats.map((s) => (
            <div key={s.label} className="stats-item">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export { TeamCard, MatchCard };
