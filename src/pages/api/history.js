// Simple in-memory history store per IP
// For production, replace with a real DB (Vercel KV, Supabase, etc.)
const history = new Map();

export default function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

  if (req.method === "GET") {
    const books = history.get(ip) || [];
    return res.status(200).json(books);
  }

  if (req.method === "POST") {
    const { book, playlists, gradient } = req.body;
    if (!book) return res.status(400).json({ error: "No book" });

    const existing = history.get(ip) || [];
    // Remove duplicate if same title exists
    const filtered = existing.filter(h => h.book.title !== book.title);
    // Add to front, keep last 10
    const updated = [{ book, playlists, gradient, savedAt: Date.now() }, ...filtered].slice(0, 10);
    history.set(ip, updated);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
