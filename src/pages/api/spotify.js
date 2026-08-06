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

async function searchPlaylist(token, query) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.playlists?.items?.find(p => p && p.id && p.images?.length > 0)
    || data.playlists?.items?.find(p => p && p.id)
    || null;
}

// Guaranteed fallbacks by mood — these ALWAYS return Spotify results
const MOOD_FALLBACKS = {
  epic:        ["epic orchestral", "hans zimmer soundtrack", "cinematic epic"],
  melancholic: ["melancholic piano", "sad instrumental", "rainy day piano"],
  tense:       ["tense thriller music", "dark suspense", "crime jazz"],
  dreamy:      ["dreamy ambient", "chillwave beats", "ethereal ambient"],
  cozy:        ["cozy coffee shop", "lofi hip hop", "warm jazz cafe"],
  dark:        ["dark ambient", "dark electronic", "atmospheric dark"],
  energetic:   ["energetic workout", "pump up music", "high energy beats"],
  romantic:    ["romantic piano", "love songs instrumental", "valentine jazz"],
  peaceful:    ["peaceful ambient", "calm piano", "nature sounds focus"],
  mysterious:  ["mysterious ambient", "mystical soundtrack", "dark mysterious"],
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { queries, moods } = req.body;
    const token = await getSpotifyToken();

    const results = await Promise.all(queries.map(async (query, idx) => {
      const mood = (moods?.[idx] || "peaceful").toLowerCase();
      const moodFallbacks = MOOD_FALLBACKS[mood] || MOOD_FALLBACKS.peaceful;

      const attempts = [
        query,
        query.split(" ").slice(0, 3).join(" "),
        query.split(" ").slice(0, 2).join(" "),
        ...moodFallbacks,
        "lofi hip hop",
        "focus music",
      ];

      let playlist = null;
      for (const attempt of attempts) {
        if (!attempt.trim()) continue;
        playlist = await searchPlaylist(token, attempt);
        if (playlist) break;
      }

      if (!playlist) return { query, playlist: null };

      return {
        query,
        playlist: {
          id: playlist.id,
          name: playlist.name,
          url: playlist.external_urls?.spotify,
          thumbnail: playlist.images?.[0]?.url || null,
        },
      };
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error("Spotify error:", err);
    return res.status(500).json({ error: err.message });
  }
}
