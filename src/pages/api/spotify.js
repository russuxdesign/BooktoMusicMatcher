let cachedToken = null;
let tokenExpiry = 0;

async function getSpotifyToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const creds = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get Spotify token: " + JSON.stringify(data));
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { queries } = req.body;
    const token = await getSpotifyToken();

    const results = await Promise.all(queries.map(async (query) => {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const searchData = await searchRes.json();
      const playlist = searchData.playlists?.items?.[0];
      if (!playlist) return { query, playlist: null, preview: null };

      const tracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=20&fields=items(track(name,preview_url,artists))`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tracksData = await tracksRes.json();
      const trackWithPreview = tracksData.items?.find((item) => item?.track?.preview_url)?.track;

      return {
        query,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          url: playlist.external_urls?.spotify,
          thumbnail: playlist.images?.[0]?.url || playlist.images?.[1]?.url || null,
        },
        preview: trackWithPreview ? {
          url: trackWithPreview.preview_url,
          trackName: trackWithPreview.name,
          artist: trackWithPreview.artists?.[0]?.name,
        } : null,
      };
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error("Spotify error:", err);
    return res.status(500).json({ error: err.message });
  }
}
