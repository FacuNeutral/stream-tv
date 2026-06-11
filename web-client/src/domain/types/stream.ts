export interface StreamToken {
  url: string
}

export interface TokenRequest {
  url: string
}

export interface StreamConfig {
  baseUrl: string
  tokenEndpoint: string
  referer: string
}

export interface StreamQuality {
  label: string
  resolution: string
  bandwidth: number
}

export type StreamStatus = 'idle' | 'loading' | 'playing' | 'error'

export interface StreamState {
  status: StreamStatus
  url: string | null
  error: string | null
  lastTokenRefresh: number | null
}
