const FALLBACK_TRACKS = {
  manga: [
    { title: "Kaisen Battle Theme", artist: "Anime Soundtracks", genre: "Shonen High-Energy" },
    { title: "Dark Fantasy Atmosphere", artist: "Tokyo Ambient", genre: "Dark Orchestral" },
    { title: "Neo-Tokyo Beats", artist: "Lo-Fi Collective", genre: "Chill Lo-Fi" }
  ],
  fantasy: [
    { title: "Elven Sanctuary", artist: "Hearthside Audio", genre: "Fantasy Ambient" },
    { title: "Ancient Ruins", artist: "Medieval Soundscapes", genre: "Acoustic Folk" }
  ],
  default: [
    { title: "Deep Focus Ambient", artist: "Study Soundtracks", genre: "Ambient" },
    { title: "Reading Room Lo-Fi", artist: "Chillhop Music", genre: "Lo-Fi" },
    { title: "Atmospheric Soundscapes", artist: "Mindfulness Audio", genre: "Instrumental" }
  ]
};

export default async function handler(req, res) {
  try {
    const { book } = req.body || req.query || {};
    
    const subjects = (book?.subjects || []).join(' ').toLowerCase();
    const title = (book?.title || '').toLowerCase();

    // 1. Return Manga tracks
    if (
      subjects.includes('manga') ||
      title.includes('jujutsu') ||
      title.includes('vinland') ||
      title.includes('titan') ||
      title.includes('berserk')
    ) {
      return res.status(200).json({ tracks: FALLBACK_TRACKS.manga });
    }

    // 2. Return Fantasy tracks
    if (subjects.includes('fantasy') || subjects.includes('magic')) {
      return res.status(200).json({ tracks: FALLBACK_TRACKS.fantasy });
    }

    // 3. Fallback: Always return music!
    return res.status(200).json({ tracks: FALLBACK_TRACKS.default });
  } catch (error) {
    return res.status(200).json({ tracks: FALLBACK_TRACKS.default });
  }
}
