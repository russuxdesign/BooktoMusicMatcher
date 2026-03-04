async function geminiJSON(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini API error");
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { action, query, book, chapter } = req.body;

    if (action === "search") {
      const result = await geminiJSON(
        `List 6 real books or manga matching "${query}". Only real published titles.
Return ONLY a raw JSON array. No markdown. No explanation. No code fences.
[{"title":"...","author":"...","genre":"...","emoji":"📖","chapterCount":0}]
Rules:
- emoji: one emoji fitting the genre
- chapterCount: total number of chapters as a single integer (e.g. Berserk=364, One Piece=1110, Naruto=700, Bleach=686, novels with no chapters=0)`
      );
      return res.status(200).json(Array.isArray(result) ? result : []);
    }

    if (action === "recommend") {
      const result = await geminiJSON(
        `You are a music curator. Recommend 4 Spotify playlists for someone reading this book.
Book: "${book.title}" by ${book.author} (${book.genre})
${chapter ? `Reader is on chapter: ${chapter}` : ""}
Return ONLY a raw JSON object. No markdown. No explanation. No code fences.
{"playlists":[{"name":"Short Name","description":"One sentence max 12 words.","mood":"epic|melancholic|tense|dreamy|cozy|dark|energetic|romantic|peaceful|mysterious","spotifyQuery":"spotify search terms"}],"gradient":{"color1":"#hex","color2":"#hex","color3":"#hex","label":"Word"}}
Gradient must match the book world: Dune=amber/sand/rust, Berserk=black/crimson/iron, One Piece=ocean/coral/teal, Harry Potter=purple/gold/blue, Romance=rose/blush/gold, Horror=void/green, Scifi=electric blue/teal.`
      );
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Books API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
