import { useState, useRef, useEffect } from "react";
import Head from "next/head";

// WCAG AA compliant mood colors (contrast ratio >= 4.5:1 on dark bg)
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

// Global embed tracker — only one open at a time
let gCloseEmbed = null;

// SVG favicon: book morphing into music note
const FAVICON_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
  <rect x='4' y='8' width='36' height='44' rx='4' fill='%23e8a838' opacity='0.9'/>
  <rect x='8' y='12' width='28' height='3' rx='1.5' fill='%23000' opacity='0.4'/>
  <rect x='8' y='18' width='22' height='3' rx='1.5' fill='%23000' opacity='0.4'/>
  <rect x='8' y='24' width='25' height='3' rx='1.5' fill='%23000' opacity='0.4'/>
  <rect x='4' y='8' width='4' height='44' rx='2' fill='%23c8820a'/>
  <circle cx='48' cy='50' r='8' fill='%231db954'/>
  <rect x='54' y='22' width='4' height='30' rx='2' fill='%231db954'/>
  <rect x='44' y='22' width='14' height='6' rx='3' fill='%231db954'/>
</svg>`;

function PlaylistCard({ rec, index }) {
  const [hov, setHov] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const ms = MOOD[rec.mood?.toLowerCase()] || MOOD.default;
  const playlistId = rec.playlist?.id;
  const myClose = useRef(null);

  // Register close function globally so other cards can close this one
  useEffect(() => {
    myClose.current = () => setShowEmbed(false);
  });

  const handlePreview = (e) => {
    e.stopPropagation();
    if (showEmbed) {
      setShowEmbed(false);
      gCloseEmbed = null;
    } else {
      // Close previously open embed
      if (gCloseEmbed) gCloseEmbed();
      setShowEmbed(true);
      gCloseEmbed = () => myClose.current?.();
    }
  };

  // Auto-play: use autoplay=1 in iframe src when opened
  const embedSrc = playlistId
    ? `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`
    : null;

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ borderRadius:13, border:`1px solid ${hov?ms.border:"rgba(255,255,255,0.12)"}`, background:hov?ms.bg:"rgba(0,0,0,0.35)", boxShadow:hov?"0 10px 36px rgba(0,0,0,0.5)":"0 2px 10px rgba(0,0,0,0.3)", transform:hov?"translateY(-2px)":"none", transition:"all 0.25s ease", animation:`fadeUp 0.4s ease ${index*0.08}s both`, backdropFilter:"blur(10px)", overflow:"hidden" }}>

      <div style={{ display:"flex" }}>
        {/* Thumbnail */}
        <div style={{ width:96, height:96, flexShrink:0, background:ms.bg, overflow:"hidden" }}>
          {rec.loading
            ? <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:20,height:20,border:`2px solid ${ms.text}44`,borderTopColor:ms.text,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /></div>
            : rec.thumbnail
            ? <img src={rec.thumbnail} alt={rec.name} style={{ width:96,height:96,objectFit:"cover",display:"block" }} />
            : <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>🎵</div>}
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0, padding:"11px 13px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:hov?ms.text:"#f0f0e8", transition:"color 0.2s" }}>{rec.name}</span>
              <span style={{ background:ms.bg, border:`1px solid ${ms.border}`, color:ms.text, fontSize:9, fontFamily:"'DM Mono',monospace", padding:"2px 7px", borderRadius:20, letterSpacing:"1.5px", textTransform:"uppercase", flexShrink:0 }}>{rec.mood}</span>
            </div>
            <div style={{ color:"#b0b0a8", fontSize:13, fontFamily:"'Crimson Text',serif", fontStyle:"italic", lineHeight:1.4 }}>{rec.description}</div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
            {playlistId && !rec.loading && (
              <button onClick={handlePreview}
                style={{ display:"flex", alignItems:"center", gap:5, background:showEmbed?"#1db954":ms.bg, border:`1px solid ${showEmbed?"#1db954":ms.border}`, borderRadius:20, padding:"6px 13px", cursor:"pointer", transition:"all 0.22s", flexShrink:0 }}>
                <span style={{ fontSize:10 }}>{showEmbed ? "⏹" : "▶"}</span>
                <span style={{ color:showEmbed?"#000":ms.text, fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
                  {showEmbed ? "Close" : "Preview"}
                </span>
              </button>
            )}
            {rec.playlist?.url && (
              <a href={rec.playlist.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                style={{ display:"flex", alignItems:"center", gap:5, background:hov?"#1db954":"rgba(29,185,84,0.1)", border:"1px solid rgba(29,185,84,0.4)", borderRadius:20, padding:"6px 11px", textDecoration:"none", transition:"all 0.22s", flexShrink:0 }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill={hov?"#000":"#1db954"}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span style={{ color:hov?"#000":"#1db954", fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>Open</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Spotify embed — auto-clicks play after load */}
      {showEmbed && embedSrc && (
        <div style={{ borderTop:`1px solid ${ms.border}` }}>
          <iframe
            key={embedSrc}
            src={embedSrc}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            style={{ display:"block" }}
            onLoad={e => {
              try {
                const frame = e.target;
                frame.focus();
                frame.contentWindow?.focus();
                const evt = new KeyboardEvent("keydown", { key:" ", code:"Space", keyCode:32, bubbles:true });
                frame.contentWindow?.document?.body?.dispatchEvent(evt);
              } catch {}
              setTimeout(() => {
                try {
                  e.target.focus();
                  e.target.contentWindow?.document?.querySelector("[data-testid='play-button']")?.click();
                } catch {}
              }, 800);
            }}
          />
        </div>
      )}
    </div>
  );
}

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
  const debounce = useRef(null);
  const inputRef  = useRef(null);

  // Load history on mount
  useEffect(() => {
    fetch("/api/history").then(r=>r.json()).then(data => {
      if (Array.isArray(data)) setHistory(data);
    }).catch(()=>{});
  }, []);

  // Book search debounce
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

  const pickBook = (book) => {
    setSelected(book); setQuery(book.title); setSugg([]); setError("");
  };

  const loadFromHistory = (entry) => {
    setSelected(entry.book);
    setGradient(entry.gradient || null);
    setRecs((entry.playlists || []).map(p => ({ ...p, loading:false })));
    setPhase("results");
  };

  const submit = async () => {
    if (!selected) { setError("Please pick a book."); return; }
    setError(""); setPhase("loading");

    let aiResult;
    try {
      const res = await fetch("/api/books", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"recommend", book:selected, noLyrics }),
      });
      aiResult = await res.json();
    } catch { setError("Failed to get recommendations."); setPhase("search"); return; }

    const aiPlaylists = aiResult.playlists || [];
    setGradient(aiResult.gradient || null);
    setRecs(aiPlaylists.map(p => ({ ...p, loading:true, thumbnail:null, playlist:null })));
    setPhase("results");

    // Fetch Spotify data
    let spotifyResults = [];
    try {
      const res = await fetch("/api/spotify", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ queries: aiPlaylists.map(p => p.spotifyQuery) }),
      });
      const data = await res.json();
      spotifyResults = data.results || [];
    } catch {}

    const finalRecs = aiPlaylists.map((p, i) => ({
      ...p, loading:false,
      thumbnail: spotifyResults[i]?.playlist?.thumbnail || null,
      playlist:  spotifyResults[i]?.playlist  || null,
    }));
    setRecs(finalRecs);

    // Save to history
    try {
      await fetch("/api/history", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ book:selected, playlists:finalRecs, gradient:aiResult.gradient }),
      });
      const h = await fetch("/api/history").then(r=>r.json());
      if (Array.isArray(h)) setHistory(h);
    } catch {}
  };

  const reset = () => {
    gCloseEmbed = null;
    setPhase("search"); setSelected(null); setQuery("");
    setRecs([]); setError(""); setSugg([]); setGradient(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const bg = gradient
    ? `radial-gradient(ellipse at 15% 5%, ${gradient.color1}bb 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, ${gradient.color2}99 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${gradient.color3}55 0%, transparent 65%), #07070f`
    : "radial-gradient(ellipse at 15% 0%,rgba(50,18,90,0.5) 0%,transparent 52%),radial-gradient(ellipse at 88% 100%,rgba(10,32,55,0.4) 0%,transparent 52%),#07070f";

  const faviconUrl = `data:image/svg+xml,${FAVICON_SVG}`;

  return (
    <>
      <Head>
        <title>Soundtrack for Readers</title>
        <meta name="description" content="Find the perfect Spotify playlist for any book or manga" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={faviconUrl} />
      </Head>

      <div style={{ minHeight:"100vh", background:bg, transition:"background 1.4s ease" }}>
        {/* Header */}
        <header style={{ borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(12px)",background:"rgba(0,0,0,0.3)" }}>
          <div onClick={reset} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}>
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="8" width="36" height="44" rx="4" fill="#e8a838" opacity="0.9"/>
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

          {/* ── SEARCH / LOADING ── */}
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

              {/* Search input */}
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",color:"#c0c0d0",fontSize:10,letterSpacing:2,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:8 }}>Book or Manga Title</label>
                <div style={{ position:"relative" }}>
                  <input ref={inputRef} value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(null); setSugg([]); }}
                    onKeyDown={e => e.key==="Enter" && selected && submit()}
                    placeholder="e.g. Berserk, Dune, One Piece…"
                    disabled={phase==="loading"}
                    style={{ width:"100%",background:"rgba(0,0,0,0.45)",border:`1px solid ${selected?"rgba(232,168,56,0.6)":"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:"14px 46px 14px 16px",fontSize:16,fontFamily:"'Crimson Text',serif",color:"#f0f0e8",backdropFilter:"blur(6px)",transition:"border-color 0.2s" }}
                    onFocus={e => { if(!selected) e.target.style.borderColor="rgba(255,255,255,0.3)"; }}
                    onBlur={e  => { if(!selected) e.target.style.borderColor="rgba(255,255,255,0.15)"; }}
                  />
                  <div style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
                    {searching
                      ? <div style={{ width:16,height:16,border:"2px solid #181826",borderTopColor:"#e8a838",borderRadius:"50%",animation:"spin 0.6s linear infinite" }} />
                      : selected ? <span style={{ color:"#e8a838",fontSize:16 }}>✓</span>
                      : <span style={{ color:"#888" }}>🔍</span>}
                  </div>

                  {/* Suggestions dropdown — scrollable, 15 items */}
                  {suggestions.length>0 && !selected && (
                    <div style={{ position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:100,background:"#0d0d20",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,overflow:"hidden",boxShadow:"0 22px 60px rgba(0,0,0,0.9)",maxHeight:400,overflowY:"auto" }}>
                      {suggestions.map((book,i) => (
                        <div key={i} onMouseDown={e => { e.preventDefault(); pickBook(book); }}
                          style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",borderBottom:i<suggestions.length-1?"1px solid rgba(255,255,255,0.06)":"none",transition:"background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(232,168,56,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
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

              {/* Selected book chip */}
              {selected && phase==="search" && (
                <div style={{ marginBottom:16,display:"flex",alignItems:"center",gap:12,background:"rgba(232,168,56,0.08)",border:"1px solid rgba(232,168,56,0.25)",borderRadius:8,padding:"10px 14px" }}>
                  <span style={{ fontSize:22 }}>{selected.emoji||"📖"}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:"#ffcc55",fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{selected.title}</div>
                    <div style={{ color:"#a0a0a8",fontSize:12,fontStyle:"italic" }}>by {selected.author} · {selected.genre}</div>
                  </div>
                  <button onClick={() => { setSelected(null); setQuery(""); setSugg([]); }}
                    style={{ background:"transparent",border:"none",color:"#888",cursor:"pointer",fontSize:20,lineHeight:1,flexShrink:0 }}>×</button>
                </div>
              )}

              {/* No Lyrics checkbox — only when book selected */}
              {selected && phase==="search" && (
                <div style={{ marginBottom:18,display:"flex",alignItems:"center",gap:10,animation:"fadeUp 0.3s ease both" }}>
                  <input
                    type="checkbox"
                    id="noLyrics"
                    checked={noLyrics}
                    onChange={e => setNoLyrics(e.target.checked)}
                    style={{ width:18,height:18,accentColor:"#e8a838",cursor:"pointer",flexShrink:0 }}
                  />
                  <label htmlFor="noLyrics" style={{ color:"#d0d0c0",fontSize:14,fontFamily:"'Crimson Text',serif",cursor:"pointer",userSelect:"none" }}>
                    No Lyrics <span style={{ color:"#888",fontSize:12 }}>— instrumental music only</span>
                  </label>
                </div>
              )}

              {error && <div style={{ color:"#ff8a8a",fontSize:13,fontFamily:"'DM Mono',monospace",marginBottom:14,padding:"9px 13px",background:"rgba(180,40,40,0.12)",borderRadius:6,border:"1px solid rgba(220,60,60,0.3)" }}>⚠ {error}</div>}

              {phase==="search" && (
                <button onClick={submit} disabled={!selected}
                  style={{ width:"100%",padding:16,background:selected?"linear-gradient(135deg,#e8a838,#cc9030)":"rgba(255,255,255,0.04)",border:selected?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:10,cursor:selected?"pointer":"not-allowed",color:selected?"#000":"#555",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,transition:"all 0.22s" }}
                  onMouseEnter={e => { if(selected){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 7px 24px rgba(232,168,56,0.35)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
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

              {/* Previously searched books — below the button */}
              {phase==="search" && history.length>0 && (
                <div style={{ marginTop:36 }}>
                  <div style={{ color:"#888",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:12 }}>Previously Searched</div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {history.map((entry,i) => (
                      <div key={i}
                        onClick={() => loadFromHistory(entry)}
                        style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,cursor:"pointer",transition:"all 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.background="rgba(232,168,56,0.07)"; e.currentTarget.style.borderColor="rgba(232,168,56,0.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}>
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

          {/* ── RESULTS ── */}
          {phase==="results" && (
            <div style={{ animation:"fadeUp 0.5s ease both" }}>
              <button onClick={reset}
                style={{ background:"transparent",border:"none",color:"#888",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",letterSpacing:1,marginBottom:26,padding:0,display:"flex",alignItems:"center",gap:6,transition:"color 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.color="#e8a838"}
                onMouseLeave={e => e.currentTarget.style.color="#888"}>← search again</button>

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
                {recs.some(r=>r.loading) && <span style={{ color:"#555",marginLeft:8 }}>· fetching from Spotify…</span>}
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:22 }}>
                {recs.map((rec,i) => <PlaylistCard key={i} rec={rec} index={i} />)}
              </div>

              <div style={{ textAlign:"center" }}>
                <button onClick={reset}
                  style={{ background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:"#a0a0a0",padding:"10px 22px",borderRadius:6,cursor:"pointer",fontFamily:"'Crimson Text',serif",fontSize:14,fontStyle:"italic",transition:"all 0.18s" }}
                  onMouseEnter={e => { e.target.style.borderColor="rgba(232,168,56,0.35)"; e.target.style.color="#ffcc55"; }}
                  onMouseLeave={e => { e.target.style.borderColor="rgba(255,255,255,0.1)"; e.target.style.color="#a0a0a0"; }}>
                  Try another book
                </button>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)",padding:14,textAlign:"center",color:"#444",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px" }}>
          SOUNDTRACK FOR READERS · GROQ AI + SPOTIFY
        </footer>
      </div>
    </>
  );
}
