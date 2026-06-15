"use client";

import { useMemo, useState } from 'react';
import {
  Outcome,
  Match,
  initialMatches,
  groups,
  stats,
  formatMatchDate,
  calculateGroupRankings,
  roundOf16Schedule,
  getMatchResult
} from './match-data';

const predictionMap: Record<Outcome, string> = {
  home: 'Home Win',
  away: 'Away Win',
  draw: 'Tie'
};

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [predictions, setPredictions] = useState<Record<string, Outcome>>({});

  const upcomingMatches = useMemo(
    () => matches.filter((match) => match.status === 'upcoming'),
    [matches]
  );

  const completedMatches = useMemo(
    () => matches.filter((match) => match.status === 'completed'),
    [matches]
  );

  const groupRankings = useMemo(
    () => calculateGroupRankings(matches, predictions),
    [matches, predictions]
  );

  const groupStandings = useMemo(
    () => groups.map((group) => ({ letter: group.letter, standings: groupRankings[group.letter] })),
    [groupRankings]
  );

  const roundOf16 = useMemo(() => {
    const seedMap: Record<string, string> = {};
    Object.entries(groupRankings).forEach(([group, teams]) => {
      if (teams[0]) seedMap[`${group}1`] = teams[0].team;
      if (teams[1]) seedMap[`${group}2`] = teams[1].team;
    });

    return roundOf16Schedule.map((match) => ({
      label: match.label,
      home: seedMap[match.homeSeed] ?? match.homeSeed,
      away: seedMap[match.awaySeed] ?? match.awaySeed
    }));
  }, [groupRankings]);

  function handlePrediction(matchId: string, value: Outcome) {
    setPredictions((prev) => ({ ...prev, [matchId]: value }));
  }

  function applyPredictions() {
    setMatches((prev) =>
      prev.map((match) =>
        match.status === 'upcoming' && predictions[match.id]
          ? {
              ...match,
              status: 'completed',
              result: predictions[match.id]
            }
          : match
      )
    );
  }

  return (
    <main>
      <div className="section-heading">
        <div>
          <h1>FIFA World Cup 2026 Predictor</h1>
          <p className="small-text">Pick match results, view past scores, group standings, and the projected Round of 16 bracket.</p>
        </div>
        <button className="button-primary" type="button" onClick={applyPredictions}>
          Finalize Predictions
        </button>
      </div>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Upcoming Group Stage Matches</h2>
            <p className="small-text">Choose the predicted result and watch the standings update live.</p>
          </div>
        </div>

        <div className="grid">
          {upcomingMatches.map((match) => (
            <div className="match-card" key={match.id}>
              <div className="match-meta">
                <strong>{match.home} vs {match.away}</strong>
                <span>{formatMatchDate(match.date)}</span>
                <span className="tag">Group {match.group}</span>
              </div>
              <div className="match-actions">
                <div className="select-wrapper">
                  <label htmlFor={`select-${match.id}`} className="small-text">Prediction</label>
                  <select
                    id={`select-${match.id}`}
                    value={predictions[match.id] ?? 'home'}
                    onChange={(event) => handlePrediction(match.id, event.target.value as Outcome)}
                  >
                    <option value="home">{match.home} Win</option>
                    <option value="away">{match.away} Win</option>
                    <option value="draw">Tie</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Projected Round of 16</h2>
            <p className="small-text">Seeded bracket uses the top two teams from each group after predictions.</p>
          </div>
        </div>

        <div className="grid grid-2">
          {roundOf16.map((item) => (
            <div className="match-card" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.home} vs {item.away}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Past Matches</h2>
            <p className="small-text">Completed matches are disabled and show final results.</p>
          </div>
        </div>

        <div className="grid">
          {completedMatches.map((match) => (
            <div className="match-card" key={match.id}>
              <div className="match-meta">
                <strong>{match.home} vs {match.away}</strong>
                <span>{formatMatchDate(match.date)}</span>
                <span className="tag">Result: {match.result ? predictionMap[match.result] : 'N/A'}</span>
              </div>
              <button className="button-secondary button-disabled" type="button" disabled>
                Match Completed
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Stats</h2>
            <p className="small-text">Watch top player stats and group performance as predictions are applied.</p>
          </div>
        </div>

        <div className="grid grid-3">
          {stats.map((stat) => (
            <div className="stats-item" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <h2>Group Standings</h2>
            <p className="small-text">Standings are calculated from completed matches and your predictions.</p>
          </div>
        </div>

        <div className="grid grid-2">
          {groupStandings.map((group) => (
            <div className="card" key={group.letter}>
              <h3>Group {group.letter}</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((row) => (
                    <tr key={row.team}>
                      <td>{row.team}</td>
                      <td>{row.played}</td>
                      <td>{row.win}</td>
                      <td>{row.draw}</td>
                      <td>{row.loss}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
