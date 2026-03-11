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

// Hardcoded trending items with real Open Library cover IDs
const TRENDING_BOOKS = [
  { title:"Atomic Habits",       author:"James Clear",       genre:"Self-Help",  emoji:"⚛️",  coverId:"8739161"  },
  { title:"Fourth Wing",         author:"Rebecca Yarros",    genre:"Fantasy",    emoji:"🐉",  coverId:"12808052" },
  { title:"The Housemaid",       author:"Freida McFadden",   genre:"Thriller",   emoji:"🔪",  coverId:"12545916" },
  { title:"Intermezzo",          author:"Sally Rooney",      genre:"Fiction",    emoji:"🎻",  coverId:"14818055" },
  { title:"James",               author:"Percival Everett",  genre:"Fiction",    emoji:"📖",  coverId:"14682521" },
];

const TRENDING_MANGA = [
  { title:"One Piece",           author:"Eiichiro Oda",      genre:"Manga",      emoji:"🏴‍☠️", coverId:"8362550"  },
  { title:"Jujutsu Kaisen",      author:"Gege Akutami",      genre:"Manga",      emoji:"👁️",  coverId:"12496218" },
  { title:"Berserk",             author:"Kentaro Miura",     genre:"Manga",      emoji:"⚔️",  coverId:"8502396"  },
  { title:"Chainsaw Man",        author:"Tatsuki Fujimoto",  genre:"Manga",      emoji:"🪚",  coverId:"12148266" },
  { title:"Demon Slayer",        author:"Koyoharu Gotouge",  genre:"Manga",      emoji:"🌊",  coverId:"10361629" },
];

function CoverImg({ coverId, title, size = 72 }) {
  const [err, setErr] = useState(false);
  if (err || !coverId) {
    return (
      <div style={{ width:size, height:size*1.4, background:"rgba(255,255,255,0.05)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
        📖
      </div>
    );
  }
  return (
    <img
      src={`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`}
      alt={title}
      onError={() => setErr(true)}
      style={{ width:size, height:size*1.4, objectFit:"cover", borderRadius:6, display:"block" }}
    />
  );
}

// ── SHARE CARD MODAL ──
function ShareModal({ book, recs, gradient, onClose }) {
  const cardRef = useRef(null);
  const [copying, setCopying] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const siteUrl = "booktomusicmatcher.vercel.app";

  const moodTags = [...new Set(recs.map(r => r.mood).filter(Boolean))].slice(0, 4);

  const gc1 = gradient?.color1 || "#e8a838";
  const gc2 = gradient?.color2 || "#7b3fbe";
  const gc3 = gradient?.color3 || "#1a1a2e";

  const downloadImage = async () => {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `${book.title.replace(/\s+/g,"-")}-soundtrack.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://${siteUrl}`);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const shareTargets = [
    { label:"Instagram",  icon:"📸", color:"#e1306c", url: null /* download then share */ },
    { label:"TikTok",     icon:"🎵", color:"#010101", url: null },
    { label:"WhatsApp",   icon:"💬", color:"#25d366", url:`https://wa.me/?text=${encodeURIComponent(`🎵 My reading soundtrack for "${book.title}" — find yours at https://${siteUrl}`)}` },
    { label:"Facebook",   icon:"📘", color:"#1877f2", url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://${siteUrl}`)}` },
    { label:"Messenger",  icon:"💙", color:"#0084ff", url:`https://www.facebook.com/dialog/send?link=${encodeURIComponent(`https://${siteUrl}`)}&app_id=181477555943165` },
    { label:"X / Twitter",icon:"🐦", color:"#1da1f2", url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 My reading soundtrack for "${book.title}" — find yours at https://${siteUrl}`)}` },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",borderRadius:16,background:"#0d0d1e",border:"1px solid rgba(255,255,255,0.12)",padding:24 }}>

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ color:"#f0f0e0",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700 }}>Share your soundtrack</div>
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:"#888",fontSize:22,cursor:"pointer",lineHeight:1 }}>×</button>
        </div>

        {/* The shareable card */}
        <div ref={cardRef} style={{
          borderRadius:14,
          overflow:"hidden",
          background:`linear-gradient(135deg, ${gc3} 0%, ${gc2}88 50%, ${gc1}55 100%)`,
          padding:28,
          position:"relative",
          marginBottom:20,
          border:"1px solid rgba(255,255,255,0.1)",
        }}>
          {/* Background texture */}
          <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at 10% 10%, ${gc1}44 0%, transparent 60%), radial-gradient(ellipse at 90% 90%, ${gc2}44 0%, transparent 60%)`,pointerEvents:"none" }} />

          <div style={{ position:"relative",zIndex:1 }}>
            {/* Book emoji + title */}
            <div style={{ fontSize:40,marginBottom:10,textAlign:"center" }}>{book.emoji || "📖"}</div>
            <div style={{ fontFamily:"'Georgia',serif",fontSize:22,fontWeight:700,color:"#fff",textAlign:"center",marginBottom:4,textShadow:"0 2px 8px rgba(0,0,0,0.5)",lineHeight:1.2 }}>{book.title}</div>
            <div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,textAlign:"center",marginBottom:18,fontStyle:"italic" }}>by {book.author}</div>

            {/* Mood tags */}
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20 }}>
              {moodTags.map(m => {
                const ms = MOOD[m.toLowerCase()] || MOOD.default;
                return (
                  <span key={m} style={{ background:"rgba(0,0,0,0.4)",border:`1px solid ${ms.border}`,color:ms.text,fontSize:10,fontFamily:"monospace",padding:"3px 10px",borderRadius:20,letterSpacing:1,textTransform:"uppercase" }}>{m}</span>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height:1,background:"rgba(255,255,255,0.15)",marginBottom:16 }} />

            {/* Playlist names */}
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:20 }}>
              {recs.filter(r=>r.name).slice(0,4).map((r,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ color:"rgba(255,255,255,0.4)",fontSize:11,fontFamily:"monospace",width:16,textAlign:"right" }}>{i+1}</span>
                  <span style={{ color:"rgba(255,255,255,0.85)",fontSize:13,fontFamily:"'Georgia',serif" }}>{r.name}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ color:"rgba(255,255,255,0.45)",fontSize:10,fontFamily:"monospace",letterSpacing:1 }}>MADE WITH</div>
              <div style={{ color:"rgba(255,255,255,0.7)",fontSize:11,fontFamily:"monospace",fontWeight:700,letterSpacing:1 }}>📖 BOOK TO MUSIC MATCHER</div>
              <div style={{ color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"monospace" }}>{siteUrl}</div>
            </div>
          </div>
        </div>

        {/* Download image button */}
        <button onClick={downloadImage}
          style={{ width:"100%",padding:"12px 0",background:"linear-gradient(135deg,#e8a838,#cc9030)",border:"none",borderRadius:10,cursor:"pointer",color:"#000",fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:16,transition:"opacity 0.2s" }}>
          {downloaded ? "✓ Downloaded!" : "⬇ Download Image"}
        </button>

        {/* Share targets */}
        <div style={{ color:"#888",fontSize:9,letterSpacing:2,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10 }}>Share to</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
          {shareTargets.map(t => (
            <button key={t.label}
              onClick={() => {
                if (t.url) window.open(t.url, "_blank");
                else downloadImage(); // Instagram/TikTok: download image to share manually
              }}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 6px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",transition:"all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor=t.color+"88"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ color:"#bbb",fontSize:9,fontFamily:"monospace",letterSpacing:0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Copy link */}
        <button onClick={copyLink}
          style={{ width:"100%",padding:"10px 0",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,cursor:"pointer",color:copying?"#6ee896":"#bbb",fontFamily:"monospace",fontSize:12,transition:"all 0.2s" }}>
          {copying ? "✓ Copied!" : "🔗 Copy link"}
        </button>
      </div>
    </div>
  );
}

// ── PLAYLIST CARD ──
function PlaylistCard({ rec, index, onShare, book, recs, gradient }) {
  const [hov, setHov] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const ms = MOOD[rec.mood?.toLowerCase()] || MOOD.default;
  const playlistId = rec.playlist?.id;
  const myClose = useRef(null);

  useEffect(() => { myClose.current = () => setShowEmbed(false); });

  const handlePreview = (e) => {
    e.stopPropagation();
    if (showEmbed) {
      setShowEmbed(false); gCloseEmbed = null;
    } else {
      if (gCloseEmbed) gCloseEmbed();
      setShowEmbed(true);
      gCloseEmbed = () => myClose.current?.();
    }
  };

  const embedSrc = playlistId
    ? `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`
    : null;

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ borderRadius:13,border:`1px solid ${hov?ms.border:"rgba(255,255,255,0.12)"}`,background:hov?ms.bg:"rgba(0,0,0,0.35)",boxShadow:hov?"0 10px 36px rgba(0,0,0,0.5)":"0 2px 10px rgba(0,0,0,0.3)",transform:hov?"translateY(-2px)":"none",transition:"all 0.25s ease",animation:`fadeUp 0.4s ease ${index*0.08}s both`,backdropFilter:"blur(10px)",overflow:"hidden" }}>

      <div style={{ display:"flex" }}>
        <div style={{ width:96,height:96,flexShrink:0,background:ms.bg,overflow:"hidden" }}>
          {rec.loading
            ? <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:20,height:20,border:`2px solid ${ms.text}44`,borderTopColor:ms.text,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /></div>
            : rec.thumbnail
            ? <img src={rec.thumbnail} alt={rec.name} style={{ width:96,height:96,objectFit:"cover",display:"block" }} />
            : <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>🎵</div>}
        </div>

        <div style={{ flex:1,minWidth:0,padding:"11px 13px",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:hov?ms.text:"#f0f0e8",transition:"color 0.2s" }}>{rec.name}</span>
              <span style={{ background:ms.bg,border:`1px solid ${ms.border}`,color:ms.text,fontSize:9,fontFamily:"'DM Mono',monospace",padding:"2px 7px",borderRadius:20,letterSpacing:"1.5px",textTransform:"uppercase",flexShrink:0 }}>{rec.mood}</span>
            </div>
            <div style={{ color:"#b0b0a8",fontSize:13,fontFamily:"'Crimson Text',serif",fontStyle:"italic",lineHeight:1.4 }}>{rec.description}</div>
          </div>

          <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap" }}>
            {playlistId && !rec.loading && (
              <button onClick={handlePreview}
                style={{ display:"flex",alignItems:"center",gap:5,background:showEmbed?"#1db954":ms.bg,border:`1px solid ${showEmbed?"#1db954":ms.border}`,borderRadius:20,padding:"6px 13px",cursor:"pointer",transition:"all 0.22s",flexShrink:0 }}>
                <span style={{ fontSize:10 }}>{showEmbed?"⏹":"▶"}</span>
                <span style={{ color:showEmbed?"#000":ms.text,fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>{showEmbed?"Close":"Preview"}</span>
              </button>
            )}
            {rec.playlist?.url && (
              <a href={rec.playlist.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                style={{ display:"flex",alignItems:"center",gap:5,background:hov?"#1db954":"rgba(29,185,84,0.1)",border:"1px solid rgba(29,185,84,0.4)",borderRadius:20,padding:"6px 11px",textDecoration:"none",transition:"all 0.22s",flexShrink:0 }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill={hov?"#000":"#1db954"}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span style={{ color:hov?"#000":"#1db954",fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>Open</span>
              </a>
            )}
            {/* Share button */}
            <button onClick={e=>{e.stopPropagation();onShare();}}
              style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 11px",cursor:"pointer",transition:"all 0.22s",flexShrink:0,marginLeft:"auto" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";}}>
              <span style={{ fontSize:11 }}>↗</span>
              <span style={{ color:"#c0c0c0",fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>Share</span>
            </button>
          </div>
        </div>
      </div>

      {showEmbed && embedSrc && (
        <div style={{ borderTop:`1px solid ${ms.border}` }}>
          <iframe key={embedSrc} src={embedSrc} width="100%" height="152" frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager" style={{ display:"block" }} />
        </div>
      )}
    </div>
  );
}

// ── TRENDING ROW ──
function TrendingRow({ label, items, onPick }) {
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:6 }}>
        {items.map((item,i) => (
          <div key={i} onClick={()=>onPick(item)}
            style={{ flexShrink:0,cursor:"pointer",transition:"transform 0.18s",textAlign:"center",width:72 }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px) scale(1.04)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{ borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 4px 12px rgba(0,0,0,0.5)",marginBottom:5 }}>
              <CoverImg coverId={item.coverId} title={item.title} size={72} />
            </div>
            <div style={{ color:"#d0d0c0",fontSize:10,fontFamily:"'Crimson Text',serif",lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:72 }}>{item.title}</div>
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

  const runRecommend = async (book, nolyr) => {
    setError(""); setPhase("loading"); gCloseEmbed = null;
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
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26 }}>
                <button onClick={reset}
                  style={{ background:"transparent",border:"none",color:"#888",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",letterSpacing:1,padding:0,display:"flex",alignItems:"center",gap:6,transition:"color 0.18s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="#e8a838"}
                  onMouseLeave={e=>e.currentTarget.style.color="#888"}>← search again</button>
                <button onClick={()=>setShareOpen(true)}
                  style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(232,168,56,0.1)",border:"1px solid rgba(232,168,56,0.3)",borderRadius:20,padding:"7px 14px",cursor:"pointer",transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(232,168,56,0.2)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(232,168,56,0.1)";}}>
                  <span style={{ fontSize:12 }}>↗</span>
                  <span style={{ color:"#ffcc55",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>Share Soundtrack</span>
                </button>
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
