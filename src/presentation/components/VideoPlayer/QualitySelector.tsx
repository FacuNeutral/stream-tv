import { useState } from 'react'
import styles from './VideoPlayer.module.css'

interface QualityLevel {
  index: number
  height: number
  width: number
  bitrate: number
  label: string
}

interface QualitySelectorProps {
  levels: QualityLevel[]
  currentLevel: number
  onSelect: (index: number) => void
}

export function QualitySelector({
  levels,
  currentLevel,
  onSelect,
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLabel =
    currentLevel === -1
      ? 'Auto'
      : levels.find((l) => l.index === currentLevel)?.label || 'Auto'

  return (
    <div className={styles.qualitySelector}>
      <button
        className={styles.qualityButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Calidad de video"
      >
        <span className={styles.qualityIcon}>⚙️</span>
        <span className={styles.qualityLabel}>{currentLabel}</span>
      </button>

      {isOpen && (
        <div className={styles.qualityMenu}>
          <button
            className={`${styles.qualityOption} ${currentLevel === -1 ? styles.qualityActive : ''}`}
            onClick={() => {
              onSelect(-1)
              setIsOpen(false)
            }}
          >
            Auto
          </button>
          {levels
            .sort((a, b) => b.height - a.height)
            .map((level) => (
              <button
                key={level.index}
                className={`${styles.qualityOption} ${currentLevel === level.index ? styles.qualityActive : ''}`}
                onClick={() => {
                  onSelect(level.index)
                  setIsOpen(false)
                }}
              >
                {level.label}
                <span className={styles.bitrate}>
                  {(level.bitrate / 1000).toFixed(0)} kbps
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
