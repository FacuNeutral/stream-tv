import type { StreamConfig } from '../types/stream'
import type { Channel } from '../types/channel'

export const TELEFE_STREAM_CONFIG: StreamConfig = {
  baseUrl:
    'https://telefeappmitelefe1.akamaized.net/hls/live/2037985/appmitelefe/TOK/master.m3u8',
  tokenEndpoint: '/api/tokenize',
  referer: 'https://mitelefe.com/vivo',
}

export const TELEFE_CHANNEL: Channel = {
  id: 'telefe',
  name: 'Telefe',
  logo: '/telefe-logo.svg',
  description: 'Televisión Federal - Canal 11 Buenos Aires',
  streamBaseUrl:
    'https://telefeappmitelefe1.akamaized.net/hls/live/2037985/appmitelefe/TOK/master.m3u8',
}

export const TOKEN_REFRESH_INTERVAL_MS = 90 * 60 * 1000 // 90 minutes
