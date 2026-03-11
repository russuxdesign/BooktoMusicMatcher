async function groqJSON(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  const text = data.choices?.[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { action, query, book, noLyrics } = req.body;

    if (action === "search") {
      const result = await groqJSON(
        `A user typed "${query}" into a book/manga search box. List 15 real books or manga that best match what they typed.
IMPORTANT: If "${query}" is itself a real book or manga title, it MUST appear first in the list as an exact match.
Include exact title matches, close matches, and related titles.
Return ONLY a raw JSON array. No markdown. No explanation. No code fences.
[{"title":"...","author":"...","genre":"...","emoji":"📖"}]
- emoji: one emoji fitting the genre (📖🗡️⚔️🌸🔮🌌🕵️💀🐉🧙🏔️🌊🔥🌹)
- Include the exact typed title first if it is a real published work`
      );
      return res.status(200).json(Array.isArray(result) ? result : []);
    }

    if (action === "recommend") {
      const lyricsNote = noLyrics
        ? "IMPORTANT: All recommended playlists must be instrumental only — NO songs with lyrics. Focus on ambient, classical, lo-fi instrumental, film scores, post-rock, or jazz."
        : "Playlists may include songs with or without lyrics.";

      const result = await groqJSON(
        `You are a music curator. Recommend 4 Spotify playlists for someone reading this book.
Book: "${book.title}" by ${book.author} (${book.genre})
${lyricsNote}
Return ONLY a raw JSON object. No markdown. No explanation. No code fences.
{"playlists":[{"name":"Short Name","description":"One sentence max 12 words.","mood":"epic|melancholic|tense|dreamy|cozy|dark|energetic|romantic|peaceful|mysterious","spotifyQuery":"spotify search terms${noLyrics ? " instrumental" : ""}"}],"gradient":{"color1":"#hex","color2":"#hex","color3":"#hex","label":"Word"}}
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
