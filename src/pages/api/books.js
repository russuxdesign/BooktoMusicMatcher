async function groqJSON(prompt, maxTokens = 2048) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  const text = data.choices?.[0]?.message?.content || "";
  // Strip any markdown fences, extract first JSON structure
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  // Find first [ or { and last ] or }
  const firstArr = cleaned.indexOf("[");
  const firstObj = cleaned.indexOf("{");
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    const lastArr = cleaned.lastIndexOf("]");
    return JSON.parse(cleaned.slice(firstArr, lastArr + 1));
  }
  if (firstObj !== -1) {
    const lastObj = cleaned.lastIndexOf("}");
    return JSON.parse(cleaned.slice(firstObj, lastObj + 1));
  }
  throw new Error("No JSON found in response");
}

// Fallback playlists if AI fails — never show empty results
function fallbackPlaylists(book) {
  const title = book?.title || "Unknown";
  const genre = (book?.genre || "").toLowerCase();
  const isManga = genre.includes("manga") || genre.includes("anime");
  const isFantasy = genre.includes("fantasy");
  const isScifi = genre.includes("sci");
  const isThriller = genre.includes("thriller") || genre.includes("mystery");

  let playlists;
  if (isManga) {
    playlists = [
      { name: "Epic Battle Scores", description: "Intense orchestral music for action manga.", mood: "epic", spotifyQuery: "epic battle anime soundtrack orchestral" },
      { name: "Emotional Anime OSTs", description: "Heartfelt themes from beloved series.", mood: "melancholic", spotifyQuery: "emotional anime ost piano" },
      { name: "Focus & Read", description: "Lo-fi beats to read manga by.", mood: "cozy", spotifyQuery: "lofi hip hop manga reading" },
      { name: "Dark Fantasy Themes", description: "Brooding orchestral for dark series.", mood: "dark", spotifyQuery: "dark fantasy orchestral cinematic" },
    ];
  } else if (isScifi) {
    playlists = [
      { name: "Sci-Fi Atmospheres", description: "Ambient electronic soundscapes for space voyages.", mood: "mysterious", spotifyQuery: "sci fi ambient electronic space" },
      { name: "Epic Space Opera", description: "Grand orchestral themes for galactic adventures.", mood: "epic", spotifyQuery: "epic space opera orchestral soundtrack" },
      { name: "Futuristic Lo-Fi", description: "Chill beats for reading on a starship.", mood: "cozy", spotifyQuery: "futuristic lofi chill beats" },
      { name: "Tense Suspense", description: "Building tension for high-stakes moments.", mood: "tense", spotifyQuery: "tense suspense cinematic thriller" },
    ];
  } else if (isThriller) {
    playlists = [
      { name: "Dark Suspense", description: "Brooding scores for psychological thrillers.", mood: "tense", spotifyQuery: "dark suspense psychological thriller score" },
      { name: "Crime Drama Scores", description: "Noir-influenced instrumental tracks.", mood: "dark", spotifyQuery: "crime drama noir instrumental" },
      { name: "Mystery Ambience", description: "Atmospheric music for unraveling secrets.", mood: "mysterious", spotifyQuery: "mystery atmospheric ambient dark" },
      { name: "Cinematic Tension", description: "Building dread and anticipation.", mood: "tense", spotifyQuery: "cinematic tension orchestral thriller" },
    ];
  } else if (isFantasy) {
    playlists = [
      { name: "Epic Fantasy Scores", description: "Grand orchestral adventure themes.", mood: "epic", spotifyQuery: "epic fantasy orchestral adventure" },
      { name: "Magical Atmospheres", description: "Enchanting ambient soundscapes.", mood: "dreamy", spotifyQuery: "magical fantasy ambient enchanting" },
      { name: "Battle & Glory", description: "Intense battle music for fantasy wars.", mood: "epic", spotifyQuery: "epic battle fantasy orchestral" },
      { name: "Medieval Folk", description: "Folk and bardic music from ancient worlds.", mood: "cozy", spotifyQuery: "medieval folk fantasy bardic acoustic" },
    ];
  } else {
    playlists = [
      { name: "Literary Focus", description: "Calm instrumental music perfect for reading.", mood: "peaceful", spotifyQuery: "reading focus classical instrumental piano" },
      { name: "Emotional Journey", description: "Moving scores that follow a story arc.", mood: "melancholic", spotifyQuery: "emotional cinematic piano orchestral" },
      { name: "Cozy Reading", description: "Warm acoustic music for an afternoon read.", mood: "cozy", spotifyQuery: "cozy acoustic cafe reading" },
      { name: "Dramatic Moments", description: "Sweeping orchestral for pivotal scenes.", mood: "epic", spotifyQuery: "dramatic orchestral cinematic sweeping" },
    ];
  }

  return {
    playlists,
    gradient: { color1: "#e8a838", color2: "#7b3fbe", color3: "#1a1a2e", label: title.split(" ")[0].toUpperCase() },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { action, query, book, noLyrics } = req.body;

    // ── SEARCH ──
    if (action === "search") {
      const prompt = `A user typed "${query}" into a book/manga search box.
List exactly 15 real, published books or manga that best match this query.
Rules:
- ONLY include real published works that actually exist. Do not hallucinate fake titles.
- If "${query}" exactly matches a real book/manga title, it MUST be first in the list.
- Include close title matches, books by the same author, and thematically related titles.
- For partial queries, prioritize books whose titles start with the typed text.
Return ONLY a raw JSON array, no markdown, no explanation:
[{"title":"exact title","author":"Author Name","genre":"Genre","emoji":"📖"}]
Genre examples: Fantasy, Manga, Thriller, Romance, Sci-Fi, Horror, Mystery, Non-Fiction, Classic, Literary Fiction
Emoji: one emoji matching genre (📖🗡️⚔️🌸🔮🌌🕵️💀🐉🧙🏔️🌊🔥🌹🎭🧬🏹)`;

      try {
        const result = await groqJSON(prompt, 1500);
        return res.status(200).json(Array.isArray(result) ? result.slice(0, 15) : []);
      } catch (e) {
        console.error("Search error:", e);
        return res.status(200).json([]);
      }
    }

    // ── RECOMMEND ──
    if (action === "recommend") {
      const lyricsNote = noLyrics
        ? "CRITICAL: ALL playlists must be instrumental only — NO lyrics. Focus on: ambient, classical, lo-fi instrumental, film scores, post-rock, jazz, neoclassical."
        : "Playlists may include songs with or without lyrics.";

      const prompt = `You are a music curator. Recommend exactly 4 Spotify playlists for someone reading this book.
Book: "${book.title}" by ${book.author || "Unknown"} (${book.genre || "Fiction"})
${lyricsNote}

Return ONLY a raw JSON object. No markdown. No explanation. No code fences. No extra text before or after.
{
  "playlists": [
    {
      "name": "Playlist Name (3-5 words)",
      "description": "One sentence describing the mood and why it fits this book (max 15 words).",
      "mood": "choose one: epic|melancholic|tense|dreamy|cozy|dark|energetic|romantic|peaceful|mysterious",
      "spotifyQuery": "2-6 word spotify search query that will find real playlists${noLyrics ? " add: instrumental" : ""}"
    }
  ],
  "gradient": {
    "color1": "#hexcolor matching book's world/mood",
    "color2": "#hexcolor complementary",
    "color3": "#hexcolor dark background tone",
    "label": "OneWord"
  }
}
Examples of good spotifyQueries: "dark souls soundtrack", "studio ghibli piano", "epic battle orchestra", "nordic folk metal", "lofi hip hop beats"
Match the gradient to the book's world: dark fantasy=black/crimson, ocean adventure=teal/coral, romance=rose/gold, sci-fi=electric blue, horror=void/green.`;

      let result;
      try {
        result = await groqJSON(prompt, 2048);
        // Validate we got playlists
        if (!result?.playlists || !Array.isArray(result.playlists) || result.playlists.length === 0) {
          throw new Error("Empty playlists from AI");
        }
        // Ensure exactly 4 playlists
        if (result.playlists.length < 4) {
          const fallback = fallbackPlaylists(book);
          while (result.playlists.length < 4) {
            result.playlists.push(fallback.playlists[result.playlists.length]);
          }
        }
      } catch (e) {
        console.error("Recommend AI error, using fallback:", e.message);
        result = fallbackPlaylists(book);
      }

      // Add noLyrics to spotifyQuery if needed
      if (noLyrics && result.playlists) {
        result.playlists = result.playlists.map(p => ({
          ...p,
          spotifyQuery: p.spotifyQuery?.includes("instrumental") ? p.spotifyQuery : p.spotifyQuery + " instrumental",
        }));
      }

      return res.status(200).json(result);
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    console.error("Books API error:", err);
    // Even on total failure, return fallback playlists for recommend
    if (req.body?.action === "recommend") {
      return res.status(200).json(fallbackPlaylists(req.body?.book));
    }
    return res.status(500).json({ error: err.message });
  }
}
