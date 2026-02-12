export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch('https://mitelefe.com/vidya/tokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://mitelefe.com/vivo',
        'Origin': 'https://mitelefe.com',
      },
      body: JSON.stringify(req.body),
    })

    if (!response.ok) {
      return res.status(response.status).send(await response.text())
    }

    const data = await response.text()
    res.setHeader('Content-Type', 'text/plain')
    return res.status(200).send(data)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch token' })
  }
}
