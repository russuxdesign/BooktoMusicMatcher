export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    // Fetch the image from the external source, spoofing a normal browser User-Agent
    // to bypass hotlink protection and bot-blocking.
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Forward the content type from the original image (or default to jpeg)
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    
    // Cache the image for 30 days on Vercel's Edge CDN so it loads instantly
    res.setHeader('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=86400');

    return res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Failed to load proxy image' });
  }
}
