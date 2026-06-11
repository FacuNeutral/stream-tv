export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const defaultUrl = 'https://telefeappmitelefe1.akamaized.net/hls/live/2037985/appmitelefe/TOK/master.m3u8';
  let streamUrl = defaultUrl;

  try {
    // 1. Scrape the live stream URL from the main vivo page
    const pageResponse = await fetch('https://www.mitelefe.com/vivo', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (pageResponse.ok) {
      const html = await pageResponse.text();
      const match = html.match(/data-player-url="([^"]+)"/);
      if (match) {
        streamUrl = match[1];
      }
    }
  } catch (scrapeError) {
    console.error('Failed to scrape vivo page:', scrapeError);
  }

  // Fallback to request body url if scrape failed and we have it
  if (streamUrl === defaultUrl && req.body && req.body.url) {
    streamUrl = req.body.url;
  }

  try {
    // 2. Tokenize the URL using the correct www endpoint and headers
    const response = await fetch('https://www.mitelefe.com/vidya/tokenize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://www.mitelefe.com/vivo',
        'Origin': 'https://www.mitelefe.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({ url: streamUrl }),
    })

    if (!response.ok) {
      return res.status(response.status).send(await response.text())
    }

    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Failed to tokenize stream URL:', error);
    return res.status(500).json({ error: 'Failed to fetch token' })
  }
}
