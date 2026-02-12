import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import type { StreamStatus } from '../../domain/types/stream'

interface UseHlsPlayerOptions {
  autoPlay?: boolean
}

interface UseHlsPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  status: StreamStatus
  error: string | null
  retry: () => void
  qualityLevels: QualityLevel[]
  currentQuality: number
  setQuality: (index: number) => void
}

interface QualityLevel {
  index: number
  height: number
  width: number
  bitrate: number
  label: string
}

export function useHlsPlayer(
  streamUrl: string | null,
  options: UseHlsPlayerOptions = {}
): UseHlsPlayerReturn {
  const { autoPlay = true } = options
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [currentQuality, setCurrentQuality] = useState(-1)

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const initPlayer = useCallback(() => {
    if (!streamUrl || !videoRef.current) return

    destroyHls()
    setStatus('loading')
    setError(null)

    const video = videoRef.current

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
        liveDurationInfinity: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false
        },
      })

      hlsRef.current = hls

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels: QualityLevel[] = data.levels.map((level, index) => ({
          index,
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          label: `${level.height}p`,
        }))
        setQualityLevels(levels)

        if (autoPlay) {
          // Ensure muted for autoplay policy compliance
          video.muted = true
          video.play().catch(() => {
            // Autoplay blocked even muted — retry on user interaction
          })
        }
      })

      hls.on(Hls.Events.FRAG_LOADED, () => {
        setStatus('playing')
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentQuality(data.level)
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS Error:', data)

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Error de red. Reintentando...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Error de medio. Recuperando...')
              hls.recoverMediaError()
              break
            default:
              setError('Error fatal del reproductor')
              setStatus('error')
              destroyHls()
              break
          }
        }
      })

      hls.loadSource(streamUrl)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = streamUrl
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().catch(() => {})
        }
      })
      setStatus('playing')
    } else {
      setError('Tu navegador no soporta reproducción HLS')
      setStatus('error')
    }
  }, [streamUrl, autoPlay, destroyHls])

  const setQuality = useCallback((index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index
      setCurrentQuality(index)
    }
  }, [])

  const retry = useCallback(() => {
    initPlayer()
  }, [initPlayer])

  useEffect(() => {
    initPlayer()
    return destroyHls
  }, [initPlayer, destroyHls])

  return {
    videoRef,
    status,
    error,
    retry,
    qualityLevels,
    currentQuality,
    setQuality,
  }
}
