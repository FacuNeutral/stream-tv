import { TELEFE_STREAM_CONFIG } from '../../domain/constants/streamConfig'

export async function fetchStreamToken(): Promise<string> {
  const response = await fetch(TELEFE_STREAM_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: TELEFE_STREAM_CONFIG.baseUrl,
    }),
  })

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.text()

  // The API may return the URL directly as text or as JSON
  try {
    const json = JSON.parse(data)
    return json.url || json
  } catch {
    return data.trim().replace(/^"|"$/g, '')
  }
}
