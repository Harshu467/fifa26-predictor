import styles from './Header.module.css';
export function Header() {
  return (
    <header className={styles.header}>
      <div>
        <span>FIFA 26 Predictor</span>
        <h1>Build your World Cup story.</h1>
        <p>Predict scores, watch tables shift, and send teams through a living knockout bracket.</p>
      </div>
      <a href="#matches">Start Predicting</a>
    </header>
  );
}
