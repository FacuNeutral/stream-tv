import { useHlsPlayer } from '../../../application/hooks/useHlsPlayer'
import { QualitySelector } from './QualitySelector'
import { PlayerOverlay } from './PlayerOverlay'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  streamUrl: string | null
  isLoading: boolean
}

export function VideoPlayer({ streamUrl, isLoading }: VideoPlayerProps) {
  const {
    videoRef,
    status,
    error,
    retry,
    qualityLevels,
    currentQuality,
    setQuality,
  } = useHlsPlayer(streamUrl)

  return (
    <div className={styles.playerContainer}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          controls
          autoPlay
          muted
          playsInline
        />

        <PlayerOverlay
          status={status}
          isTokenLoading={isLoading}
          error={error}
          onRetry={retry}
        />

        {qualityLevels.length > 0 && (
          <QualitySelector
            levels={qualityLevels}
            currentLevel={currentQuality}
            onSelect={setQuality}
          />
        )}
      </div>
    </div>
  )
}
