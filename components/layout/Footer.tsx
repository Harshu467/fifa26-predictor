import styles from './Footer.module.css';
export function Footer() {
  return (
    <footer className={styles.footer}>
      Designed for extensibility: cloud saves, leaderboards, AI predictions, and live integrations
      can plug into the same tournament engine.
    </footer>
  );
}
