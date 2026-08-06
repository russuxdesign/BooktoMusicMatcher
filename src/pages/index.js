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
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <h1 className="title">Book to Music Matcher</h1>
          <p className="subtitle">
            Find the perfect soundtrack for whatever you're reading.
          </p>
        </header>

        {/* Search Section */}
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any real book or manga title..."
            className="search-input"
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectBook(item)}
                  className="suggestion-item"
                >
                  {item.coverUrl ? (
                    <img
                      src={`/api/covers?url=${encodeURIComponent(item.coverUrl)}`}
                      alt={item.title}
                      className="suggestion-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="suggestion-no-cover" style={{ display: item.coverUrl ? 'none' : 'flex' }}>
                    No Cover
                  </div>
                  <div>
                    <p className="suggestion-title">{item.title}</p>
                    <p className="suggestion-author">{item.author}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected Book & Playlist Display */}
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">Matching soundtrack to book...</p>
          </div>
        ) : selectedBook && (
          <div className="selected-book-card">
            <div className="selected-book-header">
              <h2 className="selected-book-title">{selectedBook.title}</h2>
              <p className="selected-book-author">by {selectedBook.author}</p>
            </div>
            
            <h3 className="soundtrack-heading">Suggested Soundtrack</h3>
            <div className="tracks-list">
              {playlist.map((track, i) => (
                <div key={i} className="track-item">
                  <div>
                    <p className="track-title">{track.title}</p>
                    <p className="track-artist">{track.artist}</p>
                  </div>
                  <span className="track-genre">
                    {track.genre || 'Ambient'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Manga Grid */}
        <section className="manga-section">
          <h3 className="section-heading">Popular Manga</h3>
          <div className="manga-grid">
            {MANGA_RECOMMENDATIONS.map((manga, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectBook(manga)}
                className="manga-card"
              >
                <div className="manga-cover-container">
                  <img
                    src={`/api/covers?url=${encodeURIComponent(manga.coverUrl)}`}
                    alt={manga.title}
                    className="manga-cover-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="manga-cover-fallback" style={{ display: 'none' }}>
                    {manga.title}
                  </div>
                </div>
                <p className="manga-title">{manga.title}</p>
                <p className="manga-author">{manga.author}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
