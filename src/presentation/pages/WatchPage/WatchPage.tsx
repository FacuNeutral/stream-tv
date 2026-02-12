import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStreamToken } from '../../../application/hooks/useStreamToken'
import { useHlsPlayer } from '../../../application/hooks/useHlsPlayer'
import styles from './WatchPage.module.css'

export function WatchPage() {
  const location = useLocation()
  const cameFromLanding = location.state?.fromLanding === true
  const { streamUrl, isLoading, error, refreshToken } = useStreamToken()
  const {
    videoRef,
    status,
    error: playerError,
    retry,
    qualityLevels,
    currentQuality,
    setQuality,
  } = useHlsPlayer(streamUrl)

  const [showControls, setShowControls] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [qualityOpen, setQualityOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [started, setStarted] = useState(cameFromLanding)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false)
      setQualityOpen(false)
    }, 2000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer])

  // Only start playing when user clicks the start button
  const handleStart = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.volume = 1
    video.play().then(() => {
      setStarted(true)
      setIsMuted(false)
    }).catch(() => {
      video.muted = true
      video.play().then(() => {
        setStarted(true)
        setIsMuted(true)
      }).catch(() => {})
    })
  }

  // Auto-unmute when coming from landing page
  useEffect(() => {
    if (!cameFromLanding) return
    const video = videoRef.current
    if (!video || status !== 'playing') return

    video.volume = 1
    video.muted = false
    video.play().then(() => {
      setIsMuted(false)
    }).catch(() => {
      video.muted = true
      setIsMuted(true)
      video.play().catch(() => {})
    })
  }, [cameFromLanding, videoRef, status])

  const handleMouseMove = () => resetHideTimer()
  const handleMouseLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false)
      setQualityOpen(false)
    }, 800)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const next = !videoRef.current.muted
      videoRef.current.muted = next
      setIsMuted(next)
      if (!next) {
        videoRef.current.volume = 1
        videoRef.current.play().catch(() => {})
      }
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch { /* ignore */ }
  }

  // Listen for fullscreen changes (e.g. user presses Esc)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const currentLabel =
    currentQuality === -1
      ? 'Auto'
      : qualityLevels.find((l) => l.index === currentQuality)?.label || 'Auto'

  const displayError = playerError || (error && !streamUrl ? error : null)

  return (
    <div
      ref={containerRef}
      className={`${styles.watchPage} ${!showControls ? styles.hideCursor : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay={cameFromLanding}
        muted={cameFromLanding}
        playsInline
      />

      {/* Start overlay - always shown until user clicks */}
      {!started && (
        <div className={styles.playOverlay} onClick={handleStart}>
          <button className={styles.playButton}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <p>Comenzar a reproducir</p>
        </div>
      )}

      {/* Loading overlay */}
      {(isLoading || status === 'loading') && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p>{isLoading ? 'Conectando con la señal...' : 'Cargando transmisión...'}</p>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && displayError && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorIcon}>⚠️</div>
          <p>{displayError}</p>
          <button className={styles.retryBtn} onClick={error ? refreshToken : retry}>
            Reintentar
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className={`${styles.topBar} ${showControls ? styles.visible : styles.hidden}`}>
        <Link to="/" className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>
        <div className={styles.liveTag}>
          <span className={styles.liveDot} />
          EN VIVO — Telefe
        </div>
      </div>

      {/* Right side controls */}
      <div className={`${styles.sideControls} ${showControls ? styles.visible : styles.hidden}`}>
        {/* Fullscreen toggle */}
        <button className={styles.controlBtn} onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
          {isFullscreen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>

        {/* Mute toggle */}
        <button className={styles.controlBtn} onClick={toggleMute} title={isMuted ? 'Activar sonido' : 'Silenciar'}>
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Quality selector */}
        {qualityLevels.length > 0 && (
          <div className={styles.qualityWrapper}>
            <button
              className={styles.controlBtn}
              onClick={() => setQualityOpen(!qualityOpen)}
              title="Calidad de video"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className={styles.qualityBadge}>{currentLabel}</span>
            </button>

            {qualityOpen && (
              <div className={styles.qualityMenu}>
                <div className={styles.qualityMenuTitle}>Calidad</div>
                <button
                  className={`${styles.qualityOption} ${currentQuality === -1 ? styles.qualityActive : ''}`}
                  onClick={() => { setQuality(-1); setQualityOpen(false) }}
                >
                  Auto
                </button>
                {qualityLevels
                  .sort((a, b) => b.height - a.height)
                  .map((level) => (
                    <button
                      key={level.index}
                      className={`${styles.qualityOption} ${currentQuality === level.index ? styles.qualityActive : ''}`}
                      onClick={() => { setQuality(level.index); setQualityOpen(false) }}
                    >
                      {level.label}
                      <span className={styles.bitrate}>{(level.bitrate / 1000).toFixed(0)}k</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom center - MiTelefe logo */}
      <div className={`${styles.bottomBar} ${showControls ? styles.visible : styles.hidden}`}>
        <a
          href="https://mitelefe.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.telefeLogo}
          title="Visitar MiTelefe"
        >
          <span className={styles.telefeText}>
            mi<span style={{ color: '#00a0e1' }}>te</span><span style={{ color: '#4caf50' }}>le</span><span style={{ color: '#e91e63' }}>fe</span><span style={{ color: '#ffffff' }}>.com</span>
          </span>
        </a>
      </div>
    </div>
  )
}
