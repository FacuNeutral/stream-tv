import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <div className={styles.logoCircles}>
            <span className={styles.circle} style={{ background: '#00a0e1' }} />
            <span className={styles.circle} style={{ background: '#4caf50' }} />
            <span className={styles.circle} style={{ background: '#e91e63' }} />
          </div>
          <h1 className={styles.title}>Telefe en Vivo</h1>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveIndicator} />
          EN VIVO
        </div>
      </div>
    </header>
  )
}
