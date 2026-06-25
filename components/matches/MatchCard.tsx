'use client';

import { motion } from 'framer-motion';
import { TeamFlag } from '@/components/common/TeamFlag';
import type { Match, Team } from '@/types/tournament';
import { PredictionBar } from './PredictionBar';
import styles from './MatchCard.module.css';

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  onSelect,
}: {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onSelect: () => void;
}) {
  const score =
    match.prediction.homeScore === null
      ? 'Predict'
      : `${match.prediction.homeScore} - ${match.prediction.awayScore}`;
  return (
    <motion.button
      className={styles.card}
      onClick={onSelect}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className={styles.topline}>
        <span>
          {match.round} · Group {match.group}
        </span>
        <strong className={styles[match.status]}>{match.status}</strong>
      </div>
      <div className={styles.teams}>
        <div>
          <TeamFlag team={homeTeam} />
          <strong>{homeTeam.name}</strong>
          <small>{match.predictionPercentages.home}% win</small>
        </div>
        <div className={styles.score}>
          {score}
          <small>{match.predictionPercentages.draw}% draw</small>
        </div>
        <div>
          <TeamFlag team={awayTeam} />
          <strong>{awayTeam.name}</strong>
          <small>{match.predictionPercentages.away}% win</small>
        </div>
      </div>
      <PredictionBar percentages={match.predictionPercentages} />
      <footer className={styles.footer}>
        <span>
          {new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }).format(new Date(match.kickoff))}
        </span>
        <span>{match.venue}</span>
      </footer>
    </motion.button>
  );
}
