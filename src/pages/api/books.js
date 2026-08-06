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
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  const text = data.choices?.[0]?.message?.content || "";
  const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
  const firstArr = cleaned.indexOf("[");
  const firstObj = cleaned.indexOf("{");
  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
    return JSON.parse(cleaned.slice(firstArr, cleaned.lastIndexOf("]") + 1));
  }
  if (firstObj !== -1) {
    return JSON.parse(cleaned.slice(firstObj, cleaned.lastIndexOf("}") + 1));
  }
  throw new Error("No JSON found in response");
}

// Map Open Library subjects to genre string
function getGenre(subjects) {
  if (!subjects || !subjects.length) return "Fiction";
  const s = subjects.slice(0, 20).join(" ").toLowerCase();
  if (s.includes("manga") || s.includes("comic book") || s.includes("graphic novel")) return "Manga";
  if (s.includes("fantasy")) return "Fantasy";
  if (s.includes("science fiction") || s.includes("sci-fi")) return "Sci-Fi";
  if (s.includes("mystery") || s.includes("detective") || s.includes("crime")) return "Mystery";
  if (s.includes("thriller") || s.includes("suspense")) return "Thriller";
  if (s.includes("romance") || s.includes("love stories")) return "Romance";
  if (s.includes("horror")) return "Horror";
  if (s.includes("biography") || s.includes("memoir") || s.includes("autobiography")) return "Biography";
  if (s.includes("history") || s.includes("historical fiction")) return "Historical";
  if (s.includes("self-help") || s.includes("personal development") || s.includes("motivation")) return "Self-Help";
  if (s.includes("children") || s.includes("young adult")) return "Young Adult";
  return "Fiction";
}

function getEmoji(genre) {
  const map = {
    "Manga":"⛩️","Fantasy":"🐉","Sci-Fi":"🌌","Mystery":"🕵️","Thriller":"🔪",
    "Romance":"🌸","Horror":"💀","Biography":"📝","Historical":"⚔️",
    "Self-Help":"✨","Young Adult":"🌟","Fiction":"📖",
  };
  return map[genre] || "📖";
}

// Primary search: Open Library — guaranteed real books, no hallucination
async function searchOpenLibrary(query) {
  const q = encodeURIComponent(query);
  const url = `https://openlibrary.org/search.json?q=${q}&limit=15&fields=title,author_name,subject,cover_i,key`;
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`OL HTTP ${res.status}`);
  const data = await res.json();
  const docs = (data.docs || []).filter(d => d.title && d.author_name?.length);
  if (docs.length === 0) throw new Error("No results from Open Library");
  return docs.slice(0, 10).map(d => {
    const genre = getGenre(d.subject);
    return {
      title:  d.title,
      author: d.author_name[0],
      genre,
      emoji:  getEmoji(genre),
      cover:  d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
    };
  });
}

// Fallback search: Groq AI — only real books from training data, strict prompt
async function searchGroq(query) {
  const prompt = `List exactly 10 real published books or manga that match the search query: "${query}"

RULES — you must follow these exactly:
- ONLY include books that genuinely exist and were published. Zero fictional titles.
- If the query matches a real book title exactly or partially, that book MUST be first.
- Include the author's real name. Do not invent authors.
- Return ONLY this JSON array, nothing else, no markdown:
[{"title":"Exact Book Title","author":"Real Author Name","genre":"Fantasy","emoji":"🐉"}]
Genre options: Fantasy, Manga, Thriller, Romance, Sci-Fi, Horror, Mystery, Non-Fiction, Classic, Biography, Self-Help, Fiction
Emoji: one matching the genre.`;
  const result = await groqJSON(prompt, 1200);
  if (!Array.isArray(result) || result.length === 0) throw new Error("Empty groq search");
  return result.slice(0, 10).map(d => ({
    title:  d.title  || "Unknown",
    author: d.author || "Unknown",
    genre:  d.genre  || "Fiction",
    emoji:  d.emoji  || getEmoji(d.genre),
    cover:  null,
  }));
}

// Fallback playlists — never return empty results
function fallbackPlaylists(book) {
  const g = (book?.genre || "").toLowerCase();
  const isManga    = g.includes("manga");
  const isScifi    = g.includes("sci");
  const isFantasy  = g.includes("fantasy");
  const isThriller = g.includes("thriller") || g.includes("mystery");
  const isRomance  = g.includes("romance");
  const isHorror   = g.includes("horror");

  let playlists;
  if (isManga) {
    playlists = [
      { name:"Epic Battle Scores",   description:"Intense orchestral for action-packed manga.",  mood:"epic",        spotifyQuery:"epic battle anime orchestral" },
      { name:"Emotional Anime OSTs", description:"Heartfelt themes from beloved anime series.",  mood:"melancholic", spotifyQuery:"emotional anime ost piano" },
      { name:"Focus & Read",         description:"Lo-fi beats to read manga by.",                mood:"cozy",        spotifyQuery:"lofi hip hop reading focus" },
      { name:"Dark Fantasy",         description:"Brooding orchestral for dark manga series.",   mood:"dark",        spotifyQuery:"dark fantasy orchestral cinematic" },
    ];
  } else if (isHorror) {
    playlists = [
      { name:"Horror Ambience",      description:"Unsettling sounds for terrifying reads.",      mood:"dark",        spotifyQuery:"horror ambient dark unsettling" },
      { name:"Gothic Atmosphere",    description:"Dark classical for gothic horror.",            mood:"mysterious",  spotifyQuery:"gothic classical dark atmosphere" },
      { name:"Tense Suspense",       description:"Building dread for frightening moments.",      mood:"tense",       spotifyQuery:"tense suspense horror cinematic" },
      { name:"Eerie Silence",        description:"Minimal soundscapes for psychological horror.",mood:"mysterious",  spotifyQuery:"eerie minimal ambient horror" },
    ];
  } else if (isScifi) {
    playlists = [
      { name:"Sci-Fi Atmospheres",   description:"Ambient electronic soundscapes for space.",   mood:"mysterious",  spotifyQuery:"sci fi ambient electronic space" },
      { name:"Epic Space Opera",     description:"Grand orchestral for galactic adventures.",    mood:"epic",        spotifyQuery:"epic space opera orchestral" },
      { name:"Futuristic Lo-Fi",     description:"Chill beats for reading on a starship.",       mood:"cozy",        spotifyQuery:"futuristic lofi chill beats" },
      { name:"Tense Suspense",       description:"Building tension for high-stakes scenes.",     mood:"tense",       spotifyQuery:"tense suspense cinematic thriller" },
    ];
  } else if (isFantasy) {
    playlists = [
      { name:"Epic Fantasy Scores",  description:"Grand orchestral adventure themes.",           mood:"epic",        spotifyQuery:"epic fantasy orchestral adventure" },
      { name:"Magical Atmospheres",  description:"Enchanting ambient soundscapes.",              mood:"dreamy",      spotifyQuery:"magical fantasy ambient enchanting" },
      { name:"Battle & Glory",       description:"Intense music for fantasy wars.",              mood:"epic",        spotifyQuery:"epic battle fantasy orchestral" },
      { name:"Medieval Folk",        description:"Folk music from ancient worlds.",              mood:"cozy",        spotifyQuery:"medieval folk fantasy acoustic" },
    ];
  } else if (isThriller) {
    playlists = [
      { name:"Dark Suspense",        description:"Brooding scores for psychological thrillers.", mood:"tense",       spotifyQuery:"dark suspense psychological thriller" },
      { name:"Crime Drama Scores",   description:"Noir-influenced instrumental tracks.",         mood:"dark",        spotifyQuery:"crime drama noir instrumental" },
      { name:"Mystery Ambience",     description:"Atmospheric music for unraveling secrets.",    mood:"mysterious",  spotifyQuery:"mystery atmospheric ambient dark" },
      { name:"Cinematic Tension",    description:"Building dread and anticipation.",             mood:"tense",       spotifyQuery:"cinematic tension orchestral thriller" },
    ];
  } else if (isRomance) {
    playlists = [
      { name:"Romantic Piano",       description:"Tender melodies for love stories.",            mood:"romantic",    spotifyQuery:"romantic piano love songs" },
      { name:"Indie Love Songs",     description:"Heartfelt indie tracks for romance.",          mood:"dreamy",      spotifyQuery:"indie romantic love songs" },
      { name:"Coffee Shop Romance",  description:"Warm acoustic for cozy love stories.",         mood:"cozy",        spotifyQuery:"cozy coffee shop acoustic guitar" },
      { name:"Emotional Journey",    description:"Moving scores for emotional moments.",         mood:"melancholic", spotifyQuery:"emotional cinematic orchestral piano" },
    ];
  } else {
    playlists = [
      { name:"Literary Focus",       description:"Calm instrumental perfect for reading.",       mood:"peaceful",    spotifyQuery:"reading focus classical instrumental" },
      { name:"Emotional Journey",    description:"Moving scores that follow a story arc.",       mood:"melancholic", spotifyQuery:"emotional cinematic orchestral piano" },
      { name:"Cozy Reading",         description:"Warm acoustic for an afternoon read.",         mood:"cozy",        spotifyQuery:"cozy acoustic cafe reading" },
      { name:"Dramatic Moments",     description:"Sweeping orchestral for pivotal scenes.",      mood:"epic",        spotifyQuery:"dramatic orchestral cinematic" },
    ];
  }

  return {
    playlists,
    gradient: {
      color1: "#e8a838", color2: "#7b3fbe", color3: "#1a1a2e",
      label: (book?.title || "Reading").split(" ")[0].toUpperCase(),
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, query, book, noLyrics } = req.body;

  // ── SEARCH ──
  if (action === "search") {
    if (!query || query.trim().length < 2) return res.status(200).json([]);
    try {
      // Try Open Library first — real books guaranteed
      const results = await searchOpenLibrary(query.trim());
      return res.status(200).json(results);
    } catch (e) {
      console.error("Open Library search failed, falling back to Groq:", e.message);
      try {
        // Groq fallback — strict prompt to avoid hallucination
        const results = await searchGroq(query.trim());
        return res.status(200).json(results);
      } catch (e2) {
        console.error("Groq search also failed:", e2.message);
        return res.status(200).json([]);
      }
    }
  }

  // ── RECOMMEND ──
  if (action === "recommend") {
    const lyricsNote = noLyrics
      ? "CRITICAL: ALL playlists MUST be instrumental only — no songs with lyrics. Use: ambient, classical, lo-fi instrumental, film scores, post-rock, jazz, neoclassical."
      : "Playlists may include songs with or without lyrics.";

    const prompt = `You are a music curator. Recommend exactly 4 Spotify playlists for someone reading this book.
Book: "${book.title}" by ${book.author || "Unknown"} (${book.genre || "Fiction"})
${lyricsNote}

Return ONLY a raw JSON object with no extra text, no markdown, no explanation:
{"playlists":[{"name":"3-5 word name","description":"One sentence why it fits (max 12 words).","mood":"epic|melancholic|tense|dreamy|cozy|dark|energetic|romantic|peaceful|mysterious","spotifyQuery":"2-5 words to search on Spotify${noLyrics ? " add instrumental" : ""}"}],"gradient":{"color1":"#hexcolor","color2":"#hexcolor","color3":"#darkHexcolor","label":"OneWord"}}
Match gradient colors to the book's world and mood. Good spotifyQuery examples: "dark souls ost", "studio ghibli piano", "nordic folk metal", "lofi beats study".`;

    let result;
    try {
      result = await groqJSON(prompt, 1500);
      if (!result?.playlists?.length) throw new Error("Empty playlists");
      // Pad to 4 if needed
      if (result.playlists.length < 4) {
        const fb = fallbackPlaylists(book);
        while (result.playlists.length < 4) {
          result.playlists.push(fb.playlists[result.playlists.length]);
        }
      }
    } catch (e) {
      console.error("Recommend AI failed, using fallback:", e.message);
      result = fallbackPlaylists(book);
    }

    if (noLyrics && result.playlists) {
      result.playlists = result.playlists.map(p => ({
        ...p,
        spotifyQuery: p.spotifyQuery?.includes("instrumental")
          ? p.spotifyQuery
          : (p.spotifyQuery || "") + " instrumental",
      }));
    }

    return res.status(200).json(result);
  }

  return res.status(400).json({ error: "Unknown action" });
}
