'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TeamFlag } from '@/components/common/TeamFlag';
import { useTournamentStore } from '@/store/tournamentStore';
import type { Match, Team } from '@/types/tournament';
import styles from './PredictionModal.module.css';

export function PredictionModal({
  match,
  homeTeam,
  awayTeam,
}: {
  match: Match | null;
  homeTeam: Team | null;
  awayTeam: Team | null;
}) {
  const { selectMatch, savePrediction } = useTournamentStore();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [confidence, setConfidence] = useState(55);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!match) return;
    setHomeScore(match.prediction.homeScore ?? 0);
    setAwayScore(match.prediction.awayScore ?? 0);
    setConfidence(match.prediction.confidence);
    setNotes(match.prediction.notes);
  }, [match]);

  return (
    <AnimatePresence>
      {match && homeTeam && awayTeam && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className={styles.modal}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onSubmit={(event) => {
              event.preventDefault();
              savePrediction(match.id, { homeScore, awayScore, winnerId: null, confidence, notes });
            }}
          >
            <header>
              <span>
                {match.round} · {match.venue}
              </span>
              <button type="button" onClick={() => selectMatch(null)}>
                ×
              </button>
            </header>
            <div className={styles.scoreRow}>
              <TeamPanel team={homeTeam} value={homeScore} onChange={setHomeScore} />
              <strong>vs</strong>
              <TeamPanel team={awayTeam} value={awayScore} onChange={setAwayScore} />
            </div>
            <label>
              Confidence <b>{confidence}%</b>
              <input
                type="range"
                min="1"
                max="100"
                value={confidence}
                onChange={(event) => setConfidence(Number(event.target.value))}
              />
            </label>
            <label>
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add tactical notes, injuries, or reasoning..."
              />
            </label>
            <footer>
              <button type="button" onClick={() => selectMatch(null)}>
                Cancel
              </button>
              <button type="submit">Save Prediction</button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TeamPanel({
  team,
  value,
  onChange,
}: {
  team: Team;
  value: number;
  onChange: (score: number) => void;
}) {
  return (
    <div className={styles.team}>
      <TeamFlag team={team} />
      <strong>{team.name}</strong>
      <input
        type="number"
        min="0"
        max="20"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
