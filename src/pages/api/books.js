export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json({ books: [] });
  }

  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=7&fields=title,author_name,cover_i,subject`
    );
    const data = await response.json();

    if (!data.docs) {
      return res.status(200).json({ books: [] });
    }

    const books = data.docs.map((doc) => ({
      title: doc.title,
      author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      subjects: doc.subject ? doc.subject.slice(0, 5) : ['General']
    }));

    return res.status(200).json({ books });
  } catch (error) {
    console.error("Error querying Open Library API:", error);
    return res.status(500).json({ books: [], error: "Failed to search books" });
  }
}
