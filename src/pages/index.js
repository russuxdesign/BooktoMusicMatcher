import React, { useState, useEffect, useRef } from 'react';

const MANGA_RECOMMENDATIONS = [
  {
    title: "Jujutsu Kaisen, Vol. 1",
    author: "Gege Akutami",
    coverUrl: "https://covers.openlibrary.org/b/id/12869066-M.jpg",
    subjects: ["manga", "action", "supernatural"]
  },
  {
    title: "Vinland Saga, Vol. 1",
    author: "Makoto Yukimura",
    coverUrl: "https://covers.openlibrary.org/b/id/8354780-M.jpg",
    subjects: ["manga", "historical", "action"]
  },
  {
    title: "Attack on Titan, Vol. 1",
    author: "Hajime Isayama",
    coverUrl: "https://covers.openlibrary.org/b/id/8361139-M.jpg",
    subjects: ["manga", "dark fantasy", "action"]
  },
  {
    title: "Berserk, Vol. 1",
    author: "Kentaro Miura",
    coverUrl: "https://covers.openlibrary.org/b/id/13289061-M.jpg",
    subjects: ["manga", "dark fantasy", "seinen"]
  }
];

export default function Home() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.books || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelectBook = async (book) => {
    setSelectedBook(book);
    setSuggestions([]);
    setQuery(book.title);
    setLoading(true);

    try {
      const res = await fetch('/api/spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book })
      });
      const data = await res.json();
      setPlaylist(data.tracks || []);
    } catch (err) {
      console.error("Music fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col items-center justify-between p-6 md:p-12">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-indigo-400 mb-2">
            Book to Music Matcher
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Find the perfect soundtrack for whatever you're reading.
          </p>
        </header>

        {/* Search Section */}
        <div className="relative w-full mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any real book or manga title..."
            className="w-full px-5 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-lg"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectBook(item)}
                  className="p-3.5 hover:bg-gray-800 cursor-pointer border-b border-gray-800/50 flex items-center gap-4 transition"
                >
                  {item.coverUrl ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 rounded text-center">
                      No Cover
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-100">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.author}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Book & Playlist Display */}
        {loading ? (
          <div className="my-12 text-center">
            <p className="text-indigo-400 font-medium animate-pulse">Matching soundtrack to book...</p>
          </div>
        ) : selectedBook && (
          <div className="w-full bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-800 shadow-xl mb-12">
            <div className="border-b border-gray-800 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-indigo-300">{selectedBook.title}</h2>
              <p className="text-gray-400 text-sm">by {selectedBook.author}</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Suggested Soundtrack</h3>
            <div className="space-y-3">
              {playlist.map((track, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-800/60 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition">
                  <div>
                    <p className="font-semibold text-sm text-white">{track.title}</p>
                    <p className="text-xs text-gray-400">{track.artist}</p>
                  </div>
                  <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800/60 font-medium">
                    {track.genre || 'Ambient'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Manga Grid */}
        <section className="w-full mt-4">
          <h3 className="text-xl font-bold mb-4 text-gray-200">Popular Manga</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MANGA_RECOMMENDATIONS.map((manga, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectBook(manga)}
                className="bg-gray-900 p-3 rounded-xl border border-gray-800 hover:border-indigo-500 cursor-pointer transition flex flex-col group"
              >
                <div className="w-full h-56 bg-gray-800 rounded-lg overflow-hidden mb-3 relative flex items-center justify-center">
                  <img
                    src={manga.coverUrl}
                    alt={manga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <p className="font-semibold text-sm truncate text-white">{manga.title}</p>
                <p className="text-xs text-gray-400">{manga.author}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
