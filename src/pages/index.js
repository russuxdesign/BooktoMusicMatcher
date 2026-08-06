import React, { useState } from 'react';
import BookSearch from '../components/BookSearch';
import MangaSection from '../components/MangaSection';

export default function Home() {
  const [selectedBook, setSelectedBook] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSelectBook = async (book) => {
    setSelectedBook(book);
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

      {/* Real Autocomplete Search */}
      <BookSearch onSelectBook={handleSelectBook} />

      {/* Music Playlist Output */}
      {loading ? (
        <p className="text-indigo-400 my-8">Finding music matches...</p>
      ) : selectedBook && (
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-800 my-8">
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

      {/* Manga Carousel */}
      <MangaSection onSelectBook={handleSelectBook} />
    </main>
  );
}
