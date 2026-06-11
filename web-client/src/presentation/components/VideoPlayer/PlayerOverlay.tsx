import styles from './VideoPlayer.module.css'

interface PlayerOverlayProps {
  status: string
  isTokenLoading: boolean
  error: string | null
  onRetry: () => void
}

export function PlayerOverlay({
  status,
  isTokenLoading,
  error,
  onRetry,
}: PlayerOverlayProps) {
  if (status === 'playing' && !isTokenLoading) return null

  return (
    <div className={styles.overlay}>
      {isTokenLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Conectando con la señal en vivo...</p>
        </div>
      )}

      {status === 'loading' && !isTokenLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Cargando transmisión...</p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error || 'Error desconocido'}</p>
          <button className={styles.retryButton} onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
