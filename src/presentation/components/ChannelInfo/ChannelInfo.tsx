import { TELEFE_CHANNEL } from '../../../domain/constants/streamConfig'
import styles from './ChannelInfo.module.css'

interface ChannelInfoProps {
  onRefreshToken: () => void
  isLoading: boolean
}

export function ChannelInfo({ onRefreshToken, isLoading }: ChannelInfoProps) {
  return (
    <div className={styles.channelInfo}>
      <div className={styles.channelDetails}>
        <div className={styles.channelHeader}>
          <div className={styles.channelLogo}>
            <span className={styles.circle} style={{ background: '#00a0e1' }} />
            <span className={styles.circle} style={{ background: '#4caf50' }} />
            <span className={styles.circle} style={{ background: '#e91e63' }} />
          </div>
          <div>
            <h2 className={styles.channelName}>{TELEFE_CHANNEL.name}</h2>
            <p className={styles.channelDescription}>
              {TELEFE_CHANNEL.description}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.refreshButton}
          onClick={onRefreshToken}
          disabled={isLoading}
          title="Renovar conexión con la señal"
        >
          {isLoading ? '⏳' : '🔄'} Renovar señal
        </button>
      </div>
    </div>
  )
}
