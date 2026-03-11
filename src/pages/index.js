import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const MOOD = {
  epic:        { bg:"rgba(180,60,30,0.18)",  border:"rgba(220,100,60,0.5)",  text:"#ff9f7a" },
  melancholic: { bg:"rgba(55,75,185,0.18)",  border:"rgba(100,130,230,0.5)", text:"#a0b8ff" },
  tense:       { bg:"rgba(190,28,28,0.18)",  border:"rgba(230,60,60,0.5)",   text:"#ff8a8a" },
  dreamy:      { bg:"rgba(125,55,185,0.18)", border:"rgba(180,100,230,0.5)", text:"#dda0ff" },
  cozy:        { bg:"rgba(168,118,38,0.18)", border:"rgba(210,155,60,0.5)",  text:"#ffc85a" },
  dark:        { bg:"rgba(35,35,95,0.25)",   border:"rgba(100,100,180,0.5)", text:"#b0b0e8" },
  energetic:   { bg:"rgba(28,168,75,0.15)",  border:"rgba(60,210,110,0.5)",  text:"#6ee896" },
  romantic:    { bg:"rgba(178,38,88,0.18)",  border:"rgba(220,70,120,0.5)",  text:"#ff90bb" },
  peaceful:    { bg:"rgba(38,128,128,0.15)", border:"rgba(70,180,180,0.5)",  text:"#7adcdc" },
  mysterious:  { bg:"rgba(88,38,140,0.20)",  border:"rgba(140,70,200,0.5)",  text:"#c87aff" },
  default:     { bg:"rgba(232,168,56,0.12)", border:"rgba(232,168,56,0.4)",  text:"#ffcc55" },
};

let gCloseEmbed = null;

// ── WEEKLY ROTATION ──
// All books/manga pools — rotates every week automatically
const ALL_BOOKS = [
  { title:"Atomic Habits",               author:"James Clear",        genre:"Self-Help",  emoji:"⚛️",
    covers:["https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg","https://covers.openlibrary.org/b/id/8739161-L.jpg"] },
  { title:"Fourth Wing",                 author:"Rebecca Yarros",     genre:"Fantasy",    emoji:"🐉",
    covers:["https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg","https://covers.openlibrary.org/b/id/12808052-L.jpg"] },
  { title:"The Housemaid",               author:"Freida McFadden",    genre:"Thriller",   emoji:"🔪",
    covers:["https://covers.openlibrary.org/b/isbn/9781538742570-L.jpg","https://covers.openlibrary.org/b/id/12545916-L.jpg"] },
  { title:"It Ends with Us",             author:"Colleen Hoover",     genre:"Romance",    emoji:"🌸",
    covers:["https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg","https://covers.openlibrary.org/b/id/9257333-L.jpg"] },
  { title:"A Court of Thorns and Roses", author:"Sarah J. Maas",      genre:"Fantasy",    emoji:"🌹",
    covers:["https://covers.openlibrary.org/b/isbn/9781635575569-L.jpg","https://covers.openlibrary.org/b/id/8228691-L.jpg"] },
  { title:"The 48 Laws of Power",        author:"Robert Greene",      genre:"Non-Fiction",emoji:"👑",
    covers:["https://covers.openlibrary.org/b/isbn/9780140280197-L.jpg","https://covers.openlibrary.org/b/id/8231032-L.jpg"] },
  { title:"Dune",                        author:"Frank Herbert",       genre:"Sci-Fi",     emoji:"🏜️",
    covers:["https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg","https://covers.openlibrary.org/b/id/8231856-L.jpg"] },
  { title:"Harry Potter and the Sorcerer's Stone", author:"J.K. Rowling", genre:"Fantasy", emoji:"🧙",
    covers:["https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg","https://covers.openlibrary.org/b/id/8228691-L.jpg"] },
  { title:"The Alchemist",               author:"Paulo Coelho",        genre:"Fiction",    emoji:"✨",
    covers:["https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg","https://covers.openlibrary.org/b/id/8231032-L.jpg"] },
  { title:"Throne of Glass",             author:"Sarah J. Maas",       genre:"Fantasy",    emoji:"🗡️",
    covers:["https://covers.openlibrary.org/b/isbn/9781599906959-L.jpg","https://covers.openlibrary.org/b/id/7892742-L.jpg"] },
  { title:"The Great Gatsby",            author:"F. Scott Fitzgerald",  genre:"Classic",   emoji:"🥂",
    covers:["https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg","https://covers.openlibrary.org/b/id/7222246-L.jpg"] },
  { title:"1984",                        author:"George Orwell",        genre:"Dystopia",  emoji:"👁️",
    covers:["https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg","https://covers.openlibrary.org/b/id/8575708-L.jpg"] },
  { title:"The Hunger Games",            author:"Suzanne Collins",      genre:"Dystopia",  emoji:"🏹",
    covers:["https://covers.openlibrary.org/b/isbn/9780439023481-L.jpg","https://covers.openlibrary.org/b/id/8228023-L.jpg"] },
  { title:"Sapiens",                     author:"Yuval Noah Harari",    genre:"Non-Fiction",emoji:"🦴",
    covers:["https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg","https://covers.openlibrary.org/b/id/8739161-L.jpg"] },
];

const ALL_MANGA = [
  { title:"One Piece Vol. 1",            author:"Eiichiro Oda",        genre:"Manga",      emoji:"🏴‍☠️",
    covers:["https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg","https://covers.openlibrary.org/b/id/8362550-L.jpg"] },
  { title:"Jujutsu Kaisen Vol. 1",       author:"Gege Akutami",        genre:"Manga",      emoji:"👁️",
    covers:["https://covers.openlibrary.org/b/isbn/9781974709083-L.jpg","https://covers.openlibrary.org/b/isbn/9781974720002-L.jpg","https://covers.openlibrary.org/b/id/10521849-L.jpg"] },
  { title:"Berserk Vol. 1",              author:"Kentaro Miura",       genre:"Manga",      emoji:"⚔️",
    covers:["https://covers.openlibrary.org/b/isbn/9781593070205-L.jpg","https://covers.openlibrary.org/b/id/8502396-L.jpg"] },
  { title:"Chainsaw Man Vol. 1",         author:"Tatsuki Fujimoto",    genre:"Manga",      emoji:"🪚",
    covers:["https://covers.openlibrary.org/b/isbn/9781974709939-L.jpg","https://covers.openlibrary.org/b/id/12148266-L.jpg"] },
  { title:"Demon Slayer Vol. 1",         author:"Koyoharu Gotouge",    genre:"Manga",      emoji:"🌊",
    covers:["https://covers.openlibrary.org/b/isbn/9781974700523-L.jpg","https://covers.openlibrary.org/b/id/10361629-L.jpg"] },
  { title:"Attack on Titan Vol. 1",      author:"Hajime Isayama",      genre:"Manga",      emoji:"⚡",
    covers:["https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg","https://covers.openlibrary.org/b/id/8504671-L.jpg"] },
  { title:"Naruto Vol. 1",               author:"Masashi Kishimoto",   genre:"Manga",      emoji:"🍥",
    covers:["https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg","https://covers.openlibrary.org/b/id/8362550-L.jpg"] },
  { title:"Dragon Ball Vol. 1",          author:"Akira Toriyama",      genre:"Manga",      emoji:"🐉",
    covers:["https://covers.openlibrary.org/b/isbn/9781569319574-L.jpg","https://covers.openlibrary.org/b/id/8228691-L.jpg"] },
  { title:"Fullmetal Alchemist Vol. 1",  author:"Hiromu Arakawa",      genre:"Manga",      emoji:"⚗️",
    covers:["https://covers.openlibrary.org/b/isbn/9781591169208-L.jpg","https://covers.openlibrary.org/b/id/8231032-L.jpg"] },
  { title:"My Hero Academia Vol. 1",     author:"Kohei Horikoshi",     genre:"Manga",      emoji:"💥",
    covers:["https://covers.openlibrary.org/b/isbn/9781421582696-L.jpg","https://covers.openlibrary.org/b/id/9257333-L.jpg"] },
  { title:"Tokyo Ghoul Vol. 1",          author:"Sui Ishida",          genre:"Manga",      emoji:"💀",
    covers:["https://covers.openlibrary.org/b/isbn/9781421580364-L.jpg","https://covers.openlibrary.org/b/id/8504671-L.jpg"] },
  { title:"Death Note Vol. 1",           author:"Tsugumi Ohba",        genre:"Manga",      emoji:"📓",
    covers:["https://covers.openlibrary.org/b/isbn/9781421501680-L.jpg","https://covers.openlibrary.org/b/id/8231856-L.jpg"] },
  { title:"Vinland Saga Vol. 1",         author:"Makoto Yukimura",     genre:"Manga",      emoji:"🪓",
    covers:["https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg","https://covers.openlibrary.org/b/id/8228023-L.jpg"] },
  { title:"Bleach Vol. 1",               author:"Tite Kubo",           genre:"Manga",      emoji:"🌙",
    covers:["https://covers.openlibrary.org/b/isbn/9781591161899-L.jpg","https://covers.openlibrary.org/b/isbn/9781421504513-L.jpg","https://covers.openlibrary.org/b/isbn/9781591169116-L.jpg","https://covers.openlibrary.org/b/id/8231856-L.jpg"] },
];

// Seeded shuffle — same result for the whole week, changes every Monday
function weeklySlice(arr, count) {
  const now = new Date();
  const weekNum = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / 604800000);
  const seed = now.getFullYear() * 100 + weekNum;
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = ((seed * 9301 + 49297 * (i + 1)) % 233280) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const TRENDING_BOOKS = weeklySlice(ALL_BOOKS, 7);
const TRENDING_MANGA = weeklySlice(ALL_MANGA, 7);

function CoverImgFallback({ emoji, title, fill, size }) {
  const COLORS = {
    "🌙":"#1a1a3e,#2a2a5e", "⚔️":"#3e1a1a,#5e2a2a", "🏴‍☠️":"#0a1628,#1a2e4a",
    "👁️":"#1a0a28,#3a1a4e", "🪚":"#281a0a,#4e3a1a", "🌊":"#0a2028,#1a3a4e",
    "⚡":"#28280a,#4e4e1a", "🍥":"#280a0a,#4e1a1a", "🐉":"#0a280a,#1a4e1a",
    "💥":"#280a0a,#5e1a1a", "💀":"#141414,#1e1e1e", "📓":"#0a0a28,#1a1a4e",
    "🪓":"#1e180a,#3e300a", "⚗️":"#0a1e1e,#1a3e3e", "🌸":"#2e0a1a,#4e1a2e",
    "🌹":"#2e0808,#4e1010", "⚛️":"#0a1e2e,#1a3e4e", "🐉":"#0a2e0a,#1a4e1a",
    "🏹":"#1e1e0a,#3e3e1a", "🦴":"#2e2e2e,#1a1a1a", "🧙":"#1a0a2e,#2e1a4e",
    "✨":"#2e2a0a,#4e461a", "🗡️":"#1e1e2e,#2e2e4e", "🥂":"#2e280a,#4e401a",
  };
  const [c1, c2] = (COLORS[emoji] || "#1a1a2e,#2e2e4e").split(",");
  const baseStyle = {
    background: `linear-gradient(145deg,${c1},${c2})`,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 6,
  };
  const style = fill
    ? { ...baseStyle, position:"absolute", inset:0 }
    : { ...baseStyle, width:size, height:size*1.4, borderRadius:6 };
  return (
    <div style={style}>
      <span style={{ fontSize: fill ? 28 : Math.max(14, size*0.33) }}>{emoji || "📖"}</span>
      <span style={{ color:"#9090b8", fontSize: fill ? 9 : 7, fontFamily:"monospace",
        textAlign:"center", padding:"0 5px", lineHeight:1.3,
        display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
        {(title||"").replace(" Vol. 1","")}
      </span>
    </div>
  );
}

function CoverImg({ cover, covers, title, emoji, size = 72 }) {
  const sources = covers || (cover ? [cover] : []);
  const [failCount, setFailCount] = useState(0);
  const fill = size === "fill";

  if (!sources.length || failCount >= sources.length) {
    return <CoverImgFallback emoji={emoji} title={title} fill={fill} size={size} />;
  }

  return (
    <img
      src={sources[failCount]}
      alt={title}
      onError={() => setFailCount(n => n + 1)}
      style={fill
        ? { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }
        : { width:size, height:size*1.4, objectFit:"cover", borderRadius:6, display:"block" }}
    />
  );
}


function TrendingRow({ label, items, onPick }) {
  const count = items.length;
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex",justifyContent:"space-between",gap:6 }}>
        {items.map((item,i) => (
          <div key={i} onClick={()=>onPick(item)}
            style={{ flex:1,minWidth:0,cursor:"pointer",transition:"transform 0.18s",textAlign:"center" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px) scale(1.04)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{ borderRadius:7,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 4px 12px rgba(0,0,0,0.5)",marginBottom:5,aspectRatio:"2/3",position:"relative" }}>
              <CoverImg covers={item.covers} cover={item.cover} title={item.title} emoji={item.emoji} size="fill" />
            </div>
            <div style={{ color:"#c8c8b8",fontSize:9,fontFamily:"'Crimson Text',serif",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.title.replace(" Vol. 1","")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── MAIN ──
export default function Home() {
  const [query, setQuery]         = useState("");
  const [suggestions, setSugg]    = useState([]);
  const [selected, setSelected]   = useState(null);
  const [phase, setPhase]         = useState("search");
  const [recs, setRecs]           = useState([]);
  const [gradient, setGradient]   = useState(null);
  const [error, setError]         = useState("");
  const [searching, setSearching] = useState(false);
  const [noLyrics, setNoLyrics]   = useState(true);
  const [history, setHistory]     = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const debounce = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    fetch("/api/history").then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setHistory(d); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (query.length < 2) { setSugg([]); return; }
    if (selected && query === selected.title) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch("/api/books", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ action:"search", query }),
        });
        const data = await res.json();
        setSugg(Array.isArray(data) ? data : []);
      } catch { setSugg([]); }
      setSearching(false);
    }, 480);
  }, [query, selected]);

  const pickBook = (book) => { setSelected(book); setQuery(book.title); setSugg([]); setError(""); };

  const loadFromHistory = (entry) => {
    setSelected(entry.book); setGradient(entry.gradient||null);
    setRecs((entry.playlists||[]).map(p=>({...p,loading:false}))); setPhase("results");
  };

  // Fetch a cover image URL for any book via Open Library search
  const fetchBookCover = async (title, author) => {
    try {
      const q = encodeURIComponent(`${title} ${author}`);
      const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i`);
      const data = await res.json();
      const coverId = data.docs?.[0]?.cover_i;
      if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    } catch {}
    return null;
  };

  const runRecommend = async (book, nolyr) => {
    setError(""); setPhase("loading"); gCloseEmbed = null;

    // Fetch cover for ANY book (trending ones already have it, others need lookup)
    if (!book.cover) {
      const fetchedCover = await fetchBookCover(book.title, book.author || "");
      if (fetchedCover) book = { ...book, cover: fetchedCover };
    }
    setSelected(book);

    let aiResult;
    try {
      const res = await fetch("/api/books", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"recommend", book, noLyrics: nolyr }),
      });
      aiResult = await res.json();
    } catch { setError("Failed to get recommendations."); setPhase("search"); return; }

    const aiPlaylists = aiResult.playlists || [];
    setGradient(aiResult.gradient||null);
    setRecs(aiPlaylists.map(p=>({...p,loading:true,thumbnail:null,playlist:null})));
    setPhase("results");

    let spotifyResults = [];
    try {
      const res = await fetch("/api/spotify", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          queries: aiPlaylists.map(p=>p.spotifyQuery),
          moods:   aiPlaylists.map(p=>p.mood),
        }),
      });
      const data = await res.json();
      spotifyResults = data.results || [];
    } catch {}

    const finalRecs = aiPlaylists.map((p,i) => ({
      ...p, loading:false,
      thumbnail: spotifyResults[i]?.playlist?.thumbnail || null,
      playlist:  spotifyResults[i]?.playlist || null,
    }));
    setRecs(finalRecs);

    try {
      await fetch("/api/history", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ book, playlists:finalRecs, gradient:aiResult.gradient }),
      });
      const h = await fetch("/api/history").then(r=>r.json());
      if(Array.isArray(h)) setHistory(h);
    } catch {}
  };

  const submit = () => { if (selected) runRecommend(selected, noLyrics); else setError("Please pick a book."); };

  const reset = () => {
    gCloseEmbed = null; setPhase("search"); setSelected(null); setQuery("");
    setRecs([]); setError(""); setSugg([]); setGradient(null); setShareOpen(false);
    setTimeout(()=>inputRef.current?.focus(), 80);
  };

  const bg = gradient
    ? `radial-gradient(ellipse at 15% 5%, ${gradient.color1}bb 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, ${gradient.color2}99 0%, transparent 50%), #07070f`
    : "radial-gradient(ellipse at 15% 0%,rgba(50,18,90,0.5) 0%,transparent 52%),radial-gradient(ellipse at 88% 100%,rgba(10,32,55,0.4) 0%,transparent 52%),#07070f";

  return (
    <>
      <Head>
        <title>Book to Music Matcher</title>
        <meta name="description" content="Find the perfect Spotify playlist for any book or manga" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect x='4' y='8' width='36' height='44' rx='4' fill='%23e8a838'/><rect x='4' y='8' width='4' height='44' rx='2' fill='%23c8820a'/><circle cx='48' cy='50' r='9' fill='%231db954'/><rect x='54' y='20' width='4' height='32' rx='2' fill='%231db954'/><rect x='44' y='20' width='15' height='7' rx='3' fill='%231db954'/></svg>" />
      </Head>

      {shareOpen && <ShareModal book={selected} recs={recs} gradient={gradient} onClose={()=>setShareOpen(false)} />}

      <div style={{ minHeight:"100vh", background:bg, transition:"background 1.4s ease" }}>
        <header style={{ borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(12px)",background:"rgba(0,0,0,0.3)" }}>
          <div onClick={reset} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}>
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="8" width="36" height="44" rx="4" fill="#e8a838"/>
              <rect x="8" y="14" width="28" height="3" rx="1.5" fill="#000" opacity="0.35"/>
              <rect x="8" y="21" width="22" height="3" rx="1.5" fill="#000" opacity="0.35"/>
              <rect x="8" y="28" width="25" height="3" rx="1.5" fill="#000" opacity="0.35"/>
              <rect x="4" y="8" width="4" height="44" rx="2" fill="#c8820a"/>
              <circle cx="48" cy="50" r="9" fill="#1db954"/>
              <rect x="54" y="20" width="4" height="32" rx="2" fill="#1db954"/>
              <rect x="44" y="20" width="15" height="7" rx="3" fill="#1db954"/>
            </svg>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,background:"linear-gradient(120deg,#e8a838,#f0d070)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Soundtrack</div>
              <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace" }}>for readers</div>
            </div>
          </div>
          {gradient && <div style={{ color:"#aaa",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:2,textTransform:"uppercase" }}>✦ {gradient.label}</div>}
        </header>

        <main style={{ maxWidth:620,margin:"0 auto",padding:"38px 20px 60px" }}>

          {(phase==="search"||phase==="loading") && (
            <div style={{ animation:"fadeUp 0.5s ease both" }}>
              {phase==="search" && (
                <div style={{ textAlign:"center",marginBottom:32 }}>
                  <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,8vw,50px)",fontWeight:900,lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:11 }}>
                    <span style={{ color:"#f0f0e0" }}>Music for </span>
                    <span style={{ fontStyle:"italic",background:"linear-gradient(120deg,#e8a838,#f5d880)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>every book.</span>
                  </h1>
                  <p style={{ color:"#a0a0b0",fontSize:15,fontStyle:"italic",lineHeight:1.6 }}>Search any book or manga. Get real Spotify playlists matched to its mood.</p>
                </div>
              )}

              {/* Search */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",color:"#c0c0d0",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:8 }}>Book or Manga Title</label>
                <div style={{ position:"relative" }}>
                  <input ref={inputRef} value={query}
                    onChange={e=>{setQuery(e.target.value);setSelected(null);setSugg([]);}}
                    onKeyDown={e=>e.key==="Enter"&&selected&&submit()}
                    placeholder="e.g. Berserk, Dune, One Piece…"
                    disabled={phase==="loading"}
                    style={{ width:"100%",background:"rgba(0,0,0,0.45)",border:`1px solid ${selected?"rgba(232,168,56,0.6)":"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:"14px 46px 14px 16px",fontSize:16,fontFamily:"'Crimson Text',serif",color:"#f0f0e8",backdropFilter:"blur(6px)",transition:"border-color 0.2s" }}
                    onFocus={e=>{if(!selected)e.target.style.borderColor="rgba(255,255,255,0.3)";}}
                    onBlur={e=>{if(!selected)e.target.style.borderColor="rgba(255,255,255,0.15)";}}
                  />
                  <div style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
                    {searching
                      ? <div style={{ width:16,height:16,border:"2px solid #181826",borderTopColor:"#e8a838",borderRadius:"50%",animation:"spin 0.6s linear infinite" }} />
                      : selected ? <span style={{ color:"#e8a838",fontSize:16 }}>✓</span>
                      : <span style={{ color:"#888" }}>🔍</span>}
                  </div>

                  {suggestions.length>0 && !selected && (
                    <div style={{ position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:100,background:"#0d0d20",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,overflow:"hidden",boxShadow:"0 22px 60px rgba(0,0,0,0.9)",maxHeight:420,overflowY:"auto" }}>
                      {suggestions.map((book,i)=>(
                        <div key={i} onMouseDown={e=>{e.preventDefault();pickBook(book);}}
                          style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",borderBottom:i<suggestions.length-1?"1px solid rgba(255,255,255,0.06)":"none",transition:"background 0.12s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(232,168,56,0.1)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{book.emoji||"📖"}</span>
                          <div style={{ minWidth:0 }}>
                            <div style={{ color:"#f0f0e8",fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{book.title}</div>
                            <div style={{ color:"#a0a0b8",fontSize:12,fontStyle:"italic" }}>{book.author} · {book.genre}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected chip */}
              {selected && phase==="search" && (
                <div style={{ marginBottom:16,display:"flex",alignItems:"center",gap:12,background:"rgba(232,168,56,0.08)",border:"1px solid rgba(232,168,56,0.25)",borderRadius:8,padding:"10px 14px" }}>
                  <span style={{ fontSize:22 }}>{selected.emoji||"📖"}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:"#ffcc55",fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{selected.title}</div>
                    <div style={{ color:"#a0a0a8",fontSize:12,fontStyle:"italic" }}>by {selected.author} · {selected.genre}</div>
                  </div>
                  <button onClick={()=>{setSelected(null);setQuery("");setSugg([]);}} style={{ background:"transparent",border:"none",color:"#888",cursor:"pointer",fontSize:20,lineHeight:1 }}>×</button>
                </div>
              )}

              {/* No Lyrics checkbox */}
              {selected && phase==="search" && (
                <div style={{ marginBottom:18,display:"flex",alignItems:"center",gap:10,animation:"fadeUp 0.3s ease both" }}>
                  <input type="checkbox" id="noLyrics" checked={noLyrics} onChange={e=>setNoLyrics(e.target.checked)}
                    style={{ width:18,height:18,accentColor:"#e8a838",cursor:"pointer",flexShrink:0 }} />
                  <label htmlFor="noLyrics" style={{ color:"#d0d0c0",fontSize:14,fontFamily:"'Crimson Text',serif",cursor:"pointer",userSelect:"none" }}>
                    No Lyrics <span style={{ color:"#888",fontSize:12 }}>— instrumental music only</span>
                  </label>
                </div>
              )}

              {error && <div style={{ color:"#ff8a8a",fontSize:13,fontFamily:"'DM Mono',monospace",marginBottom:14,padding:"9px 13px",background:"rgba(180,40,40,0.12)",borderRadius:6,border:"1px solid rgba(220,60,60,0.3)" }}>⚠ {error}</div>}

              {phase==="search" && (
                <button onClick={submit} disabled={!selected}
                  style={{ width:"100%",padding:16,background:selected?"linear-gradient(135deg,#e8a838,#cc9030)":"rgba(255,255,255,0.04)",border:selected?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:10,cursor:selected?"pointer":"not-allowed",color:selected?"#000":"#555",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,transition:"all 0.22s" }}
                  onMouseEnter={e=>{if(selected){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 7px 24px rgba(232,168,56,0.35)";}}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                  {selected?"✦ Find My Soundtrack":"Select a book from the list above"}
                </button>
              )}

              {phase==="loading" && (
                <div style={{ textAlign:"center",padding:"60px 0" }}>
                  <div style={{ width:38,height:38,border:"3px solid #141420",borderTopColor:"#e8a838",borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto 16px" }} />
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:"#a0a0b0",fontStyle:"italic",marginBottom:5 }}>Curating your soundtrack…</div>
                  <div style={{ color:"#555",fontSize:12,fontFamily:"'DM Mono',monospace" }}>{selected?.title}</div>
                </div>
              )}

              {/* Trending rows + History — only on search phase */}
              {phase==="search" && (
                <div style={{ marginTop:36 }}>
                  <TrendingRow label="Trending Books 📚" items={TRENDING_BOOKS} onPick={book=>{ pickBook(book); setTimeout(()=>runRecommend(book,noLyrics),100); }} />
                  <div style={{ marginTop:24 }}>
                    <TrendingRow label="Trending Manga ⛩️" items={TRENDING_MANGA} onPick={book=>{ pickBook(book); setTimeout(()=>runRecommend(book,noLyrics),100); }} />
                  </div>

                  {history.length>0 && (
                    <div style={{ marginTop:28 }}>
                      <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:12 }}>Previously Searched</div>
                      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                        {history.map((entry,i)=>(
                          <div key={i} onClick={()=>loadFromHistory(entry)}
                            style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,cursor:"pointer",transition:"all 0.18s" }}
                            onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,168,56,0.07)";e.currentTarget.style.borderColor="rgba(232,168,56,0.2)";}}
                            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
                            <span style={{ fontSize:20,flexShrink:0 }}>{entry.book.emoji||"📖"}</span>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ color:"#e0e0d0",fontSize:13,fontFamily:"'Playfair Display',serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{entry.book.title}</div>
                              <div style={{ color:"#888",fontSize:11,fontStyle:"italic" }}>{entry.book.author}</div>
                            </div>
                            <span style={{ color:"#555",fontSize:10,fontFamily:"'DM Mono',monospace",flexShrink:0 }}>→</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* RESULTS */}
          {phase==="results" && (
            <div style={{ animation:"fadeUp 0.5s ease both" }}>
              <div style={{ marginBottom:26 }}>
                <button onClick={reset}
                  style={{ background:"transparent",border:"none",color:"#888",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",letterSpacing:1,padding:0,display:"flex",alignItems:"center",gap:6,transition:"color 0.18s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#e8a838"}
                  onMouseLeave={e=>e.currentTarget.style.color="#888"}>← search again</button>
              </div>

              <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:20 }}>
                <span style={{ fontSize:36 }}>{selected?.emoji||"📖"}</span>
                <div>
                  <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:3 }}>Now reading</div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f0f0e0",lineHeight:1.15 }}>{selected?.title}</div>
                  <div style={{ color:"#a0a0b0",fontSize:13,fontStyle:"italic" }}>by {selected?.author}</div>
                </div>
              </div>

              <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:11 }}>
                Recommended Playlists
                {recs.some(r=>r.loading)&&<span style={{ color:"#555",marginLeft:8 }}>· fetching from Spotify…</span>}
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:22 }}>
                {recs.map((rec,i)=>(
                  <PlaylistCard key={i} rec={rec} index={i}
                    onShare={()=>setShareOpen(true)}
                    book={selected} recs={recs} gradient={gradient} />
                ))}
              </div>

              <div style={{ textAlign:"center" }}>
                <button onClick={reset}
                  style={{ background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:"#a0a0a0",padding:"10px 22px",borderRadius:6,cursor:"pointer",fontFamily:"'Crimson Text',serif",fontSize:14,fontStyle:"italic",transition:"all 0.18s" }}
                  onMouseEnter={e=>{e.target.style.borderColor="rgba(232,168,56,0.35)";e.target.style.color="#ffcc55";}}
                  onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.color="#a0a0a0";}}>
                  Try another book
                </button>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)",padding:14,textAlign:"center",color:"#444",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px" }}>
          BOOK TO MUSIC MATCHER · GROQ AI + SPOTIFY
        </footer>
      </div>
    </>
  );
}
