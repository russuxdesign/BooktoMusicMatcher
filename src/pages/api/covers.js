// Server-side cover lookup — no CORS issues, runs on Vercel
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h
  const { title, author } = req.query;
  if (!title) return res.status(400).json({ error: "title required" });

  try {
    const q = encodeURIComponent(title + (author ? " " + author : ""));
    const r = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=5&fields=cover_i,isbn,title`);
    const data = await r.json();
    for (const doc of (data.docs || [])) {
      if (doc.cover_i) {
        return res.status(200).json({ url: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` });
      }
    }
    for (const doc of (data.docs || [])) {
      for (const isbn of (doc.isbn || []).slice(0, 3)) {
        return res.status(200).json({ url: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` });
      }
    }
    return res.status(404).json({ error: "not found" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
