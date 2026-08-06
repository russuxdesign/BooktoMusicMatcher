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

  // Calls our backend API route (/api/books) for real non-hallucinated autocomplete
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
    <main className="min-h-screen bg-gray-950 text-white p-6 max-w-4xl mx-auto flex flex-col items-center font-sans">
      <h1 className="text-4xl font-extrabold mb-2 text-indigo-400">Book to Music Matcher</h1>
      <p className="text-gray-400 mb-8">Find the perfect soundtrack for whatever you're reading.</p>

      {/* Autocomplete Input */}
      <div className="relative w-full max-w-xl mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any real book or manga title..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectBook(item)}
                className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 flex items-center gap-3"
              >
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt={item.title} className="w-8 h-12 object-cover rounded" />
                ) : (
                  <div className="w-8 h-12 bg-gray-800 flex items-center justify-center text-[10px] text-gray-500 rounded">No Cover</div>
                )}
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.author}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected Book & Music Display */}
      {loading ? (
        <p className="text-indigo-400 my-8">Finding music matches...</p>
      ) : selectedBook && (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 mb-10">
          <h2 className="text-2xl font-bold text-indigo-300">{selectedBook.title}</h2>
          <p className="text-gray-400 text-sm mb-4">by {selectedBook.author}</p>
          
          <h3 className="text-lg font-semibold mb-3">Suggested Soundtrack</h3>
          <div className="space-y-2">
            {playlist.map((track, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <div>
                  <p className="font-medium text-sm text-white">{track.title}</p>
                  <p className="text-xs text-gray-400">{track.artist}</p>
                </div>
                <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded border border-indigo-800">
                  {track.genre || 'Ambient'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manga Section */}
      <div className="w-full mt-auto">
        <h3 className="text-xl font-bold mb-4 text-gray-200">Popular Manga</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MANGA_RECOMMENDATIONS.map((manga, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectBook(manga)}
              className="bg-gray-900 p-3 rounded-lg border border-gray-800 hover:border-indigo-500 cursor-pointer transition"
            >
              <div className="w-full h-56 bg-gray-800 rounded overflow-hidden mb-2 relative flex items-center justify-center">
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-semibold text-sm truncate text-white">{manga.title}</p>
              <p className="text-xs text-gray-400">{manga.author}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
