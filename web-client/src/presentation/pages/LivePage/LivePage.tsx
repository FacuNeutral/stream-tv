import { useStreamToken } from '../../../application/hooks/useStreamToken'
import { Header } from '../../components/Header'
import { VideoPlayer } from '../../components/VideoPlayer'
import { ChannelInfo } from '../../components/ChannelInfo'
import styles from './LivePage.module.css'

export function LivePage() {
  const { streamUrl, isLoading, error, refreshToken } = useStreamToken()

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        {error && !streamUrl && (
          <div className={styles.globalError}>
            <p>⚠️ {error}</p>
            <button onClick={refreshToken} className={styles.retryBtn}>
              Reintentar conexión
            </button>
          </div>
        )}

        <VideoPlayer streamUrl={streamUrl} isLoading={isLoading} />

        <ChannelInfo onRefreshToken={refreshToken} isLoading={isLoading} />
      </main>

      <footer className={styles.footer}>
        <p>Señal en vivo de TV pública argentina • Telefe</p>
      </footer>
    </div>
  )
}
