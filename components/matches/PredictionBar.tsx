import type { PredictionPercentages } from '@/types/tournament';
import styles from './PredictionBar.module.css';

export function PredictionBar({ percentages }: { percentages: PredictionPercentages }) {
  return (
    <div className={styles.wrap} aria-label="Prediction probability bar">
      <span className={styles.home} style={{ width: `${percentages.home}%` }} />
      <span className={styles.draw} style={{ width: `${percentages.draw}%` }} />
      <span className={styles.away} style={{ width: `${percentages.away}%` }} />
    </div>
  );
}
