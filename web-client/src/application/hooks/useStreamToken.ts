import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchStreamToken } from '../../infrastructure/api/tokenService'
import { TOKEN_REFRESH_INTERVAL_MS } from '../../domain/constants/streamConfig'

interface UseStreamTokenReturn {
  streamUrl: string | null
  isLoading: boolean
  error: string | null
  refreshToken: () => Promise<void>
}

export function useStreamToken(): UseStreamTokenReturn {
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = await fetchStreamToken()
      setStreamUrl(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener el token del stream'
      setError(message)
      console.error('Token fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshToken()

    intervalRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshToken])

  return { streamUrl, isLoading, error, refreshToken }
}
