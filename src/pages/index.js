import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";

const MOOD = {
  epic:        { bg:"rgba(180,60,30,0.14)",  border:"rgba(210,85,45,0.4)",  text:"#e07858" },
  melancholic: { bg:"rgba(55,75,185,0.14)",  border:"rgba(80,105,215,0.4)", text:"#7898ee" },
  tense:       { bg:"rgba(190,28,28,0.14)",  border:"rgba(215,38,38,0.4)",  text:"#e06060" },
  dreamy:      { bg:"rgba(125,55,185,0.14)", border:"rgba(158,78,215,0.4)", text:"#cc88ee" },
  cozy:        { bg:"rgba(168,118,38,0.14)", border:"rgba(200,145,52,0.4)", text:"#d8a858" },
  dark:        { bg:"rgba(35,35,95,0.22)",   border:"rgba(75,75,138,0.4)",  text:"#9898cc" },
  energetic:   { bg:"rgba(28,168,75,0.12)",  border:"rgba(38,200,92,0.4)",  text:"#48cc78" },
  romantic:    { bg:"rgba(178,38,88,0.14)",  border:"rgba(210,52,108,0.4)", text:"#e068a0" },
  peaceful:    { bg:"rgba(38,128,128,0.12)", border:"rgba(52,158,158,0.4)", text:"#58cccc" },
  mysterious:  { bg:"rgba(88,38,140,0.17)",  border:"rgba(118,52,168,0.4)", text:"#aa68dd" },
  default:     { bg:"rgba(232,168,56,0.09)", border:"rgba(232,168,56,0.3)", text:"#e8a838" },
};

const G = { audio: null, stop: null };
function stopGlobal() {
  if (G.audio) { G.audio.pause(); G.audio = null; }
  if (G.stop)  { G.stop(); G.stop = null; }
}

function PlayButton({ previewUrl, mood }) {
  const ms = MOOD[mood] || MOOD.default;
  const [st, setSt] = useState("idle");
  const [prog, setProg] = useState(0);
  const audioRef = useRef(null);
  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = useCallback(() => {
    if (!previewUrl) return;
    if (st === "playing" || st === "loading") {
      audioRef.current?.pause(); audioRef.current = null;
      G.audio = null; G.stop = null; setSt("idle"); setProg(0); return;
    }
    stopGlobal(); setSt("loading");
    const a = new Audio(previewUrl);
    a.crossOrigin = "anonymous";
    a.ontimeupdate = () => setProg((a.currentTime / (a.duration || 30)) * 100);
    a.oncanplaythrough = () => { setSt("playing"); a.play().catch(() => setSt("failed")); };
    a.onended = () => { setSt("idle"); setProg(0); G.audio = null; G.stop = null; };
    a.onerror = () => { setSt("failed"); G.audio = null; G.stop = null; };
    a.load();
    audioRef.current = a; G.audio = a;
    G.stop = () => { a.pause(); setSt("idle"); setProg(0); };
  }, [previewUrl, st]);

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <button onClick={e => { e.stopPropagation(); toggle(); }} disabled={!previewUrl || st==="failed"}
        style={{ width:30, height:30, borderRadius:"50%", border:`1.5px solid ${previewUrl&&st!=="failed"?ms.border:"rgba(255,255,255,0.08)"}`, background:st==="playing"?ms.bg:"transparent", cursor:previewUrl&&st!=="failed"?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
        {st==="loading" ? <div style={{ width:11,height:11,border:`2px solid ${ms.text}44`,borderTopColor:ms.text,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
        : st==="playing" ? <span style={{ color:ms.text,fontSize:9 }}>⏸</span>
        : st==="failed"  ? <span style={{ color:"#333",fontSize:10 }}>✕</span>
        : <span style={{ color:previewUrl?ms.text:"#2a2a3a",fontSize:9,marginLeft:1 }}>▶</span>}
      </button>
      <div style={{ flex:1,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${prog}%`,background:ms.text,borderRadius:2,transition:"width 0.2s linear" }} />
      </div>
      <span style={{ color:"#444",fontSize:9,fontFamily:"'DM Mono',monospace",flexShrink:0 }}>
        {st==="failed"?"unavail":previewUrl?"30s":"—"}
      </span>
    </div>
  );
}

function PlaylistCard({ rec, index }) {
  const [hov, setHov] = useState(false);
  const ms = MOOD[rec.mood?.toLowerCase()] || MOOD.default;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex",overflow:"hidden",borderRadius:13,border:`1px solid ${hov?ms.border:"rgba(255,255,255,0.08)"}`,background:hov?ms.bg:"rgba(0,0,0,0.28)",boxShadow:hov?"0 10px 36px rgba(0,0,0,0.5)":"0 2px 10px rgba(0,0,0,0.3)",transform:hov?"translateY(-2px)":"none",transition:"all 0.25s ease",animation:`fadeUp 0.4s ease ${index*0.08}s both`,backdropFilter:"blur(10px)" }}>
      <div style={{ width:96,height:96,flexShrink:0,background:ms.bg,overflow:"hidden" }}>
        {rec.loading
          ? <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:20,height:20,border:`2px solid ${ms.text}44`,borderTopColor:ms.text,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /></div>
          : rec.thumbnail
          ? <img src={rec.thumbnail} alt={rec.name} style={{ width:96,height:96,objectFit:"cover",display:"block" }} />
          : <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,opacity:0.4 }}>🎵</div>}
      </div>
      <div style={{ flex:1,minWidth:0,padding:"11px 13px",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:hov?ms.text:"#ccc",transition:"color 0.2s" }}>{rec.name}</span>
            <span style={{ background:ms.bg,border:`1px solid ${ms.border}`,color:ms.text,fontSize:8,fontFamily:"'DM Mono',monospace",padding:"2px 6px",borderRadius:20,letterSpacing:"1.5px",textTransform:"uppercase",flexShrink:0 }}>{rec.mood}</span>
          </div>
          <div style={{ color:"#666",fontSize:12,fontFamily:"'Crimson Text',serif",fontStyle:"italic",lineHeight:1.35 }}>{rec.description}</div>
          {rec.preview?.trackName && <div style={{ color:"#333",fontSize:10,fontFamily:"'DM Mono',monospace",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>♪ {rec.preview.trackName}{rec.preview.artist?` — ${rec.preview.artist}`:""}</div>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
          <PlayButton previewUrl={rec.preview?.url} mood={rec.mood?.toLowerCase()} />
          {rec.playlist?.url && (
            <a href={rec.playlist.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
              style={{ display:"flex",alignItems:"center",gap:5,background:hov?"#1db954":"rgba(29,185,84,0.08)",border:"1px solid rgba(29,185,84,0.28)",borderRadius:20,padding:"5px 10px",textDecoration:"none",transition:"all 0.22s",flexShrink:0 }}>
              <svg width={10} height={10} viewBox="0 0 24 24" fill={hov?"#000":"#1db954"}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              <span style={{ color:hov?"#000":"#1db954",fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace",transition:"color 0.22s" }}>Open</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AdBanner() {
  return (
    <div style={{ background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,200,100,0.07)",borderRadius:8,padding:"10px 16px",display:"flex",alignItems:"center",gap:12,margin:"20px 0",backdropFilter:"blur(6px)" }}>
      <span style={{ color:"#252535",fontSize:9,letterSpacing:2,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",flexShrink:0 }}>Ad</span>
      <div style={{ color:"#555",fontSize:13,fontFamily:"'Crimson Text',serif",fontStyle:"italic",flex:1,textAlign:"center" }}>📚 Audible — Unlimited audiobooks. Try free for 30 days.</div>
      <button style={{ background:"#e8a838",color:"#000",border:"none",borderRadius:4,padding:"5px 11px",fontSize:10,fontWeight:800,cursor:"pointer",letterSpacing:1,flexShrink:0 }}>TRY FREE</button>
    </div>
  );
}

function buildChapterOptions(count) {
  if (!count || count <= 0) return [];
  const opts = [];
  if (count <= 50) {
    for (let i = 1; i <= count; i++) opts.push(i);
  } else {
    for (let i = 1; i <= Math.min(30, count); i++) opts.push(i);
    const step = count > 500 ? 25 : count > 200 ? 10 : 5;
    for (let i = Math.min(30, count) + step; i < count; i += step) opts.push(i);
    opts.push(count);
  }
  return opts;
}

export default function Home() {
  const [query, setQuery]         = useState("");
  const [suggestions, setSugg]    = useState([]);
  const [selected, setSelected]   = useState(null);
  const [chapter, setChapter]     = useState("");
  const [phase, setPhase]         = useState("search");
  const [recs, setRecs]           = useState([]);
  const [gradient, setGradient]   = useState(null);
  const [error, setError]         = useState("");
  const [searching, setSearching] = useState(false);
  const debounce = useRef(null);
  const inputRef  = useRef(null);

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
    setSelected(book); setQuery(book.title); setSugg([]); setChapter(""); setError("");
  };

  const submit = async () => {
    if (!selected) { setError("Please pick a book."); return; }
    setError(""); setPhase("loading"); stopGlobal();

    let aiResult;
    try {
      const res = await fetch("/api/books", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"recommend", book:selected, chapter }),
      });
      aiResult = await res.json();
    } catch { setError("Failed to get recommendations."); setPhase("search"); return; }

    const aiPlaylists = aiResult.playlists || [];
    setGradient(aiResult.gradient || null);
    setRecs(aiPlaylists.map(p => ({ ...p, loading:true, thumbnail:null, playlist:null, preview:null })));
    setPhase("results");

    try {
      const res = await fetch("/api/spotify", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ queries: aiPlaylists.map(p => p.spotifyQuery) }),
      });
      const { results } = await res.json();
      setRecs(prev => prev.map((rec, i) => ({
        ...rec, loading:false,
        thumbnail: results[i]?.playlist?.thumbnail || null,
        playlist:  results[i]?.playlist  || null,
        preview:   results[i]?.preview   || null,
      })));
    } catch {
      setRecs(prev => prev.map(r => ({ ...r, loading:false })));
    }
  };

  const reset = () => {
    stopGlobal();
    setPhase("search"); setSelected(null); setQuery(""); setChapter("");
    setRecs([]); setError(""); setSugg([]); setGradient(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const chapterOptions = buildChapterOptions(selected?.chapterCount || 0);

  const bg = gradient
    ? `radial-gradient(ellipse at 15% 5%, ${gradient.color1}aa 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, ${gradient.color2}88 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${gradient.color3}44 0%, transparent 65%), #07070f`
    : "radial-gradient(ellipse at 15% 0%,rgba(50,18,90,0.5) 0%,transparent 52%),radial-gradient(ellipse at 88% 100%,rgba(10,32,55,0.4) 0%,transparent 52%),#07070f";

  return (
    <>
      <Head>
        <title>Soundtrack for Readers</title>
        <meta name="description" content="Find the perfect Spotify playlist for any book or manga" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight:"100vh", background:bg, transition:"background 1.4s ease" }}>
        <header style={{ borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",backdropFilter:"blur(12px)",background:"rgba(0,0,0,0.22)" }}>
          <div onClick={reset} style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}>
            <span style={{ fontSize:20 }}>📖</span>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900,background:"linear-gradient(120deg,#e8a838,#f0d070)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Soundtrack</div>
              <div style={{ color:"#333",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace" }}>for readers</div>
            </div>
          </div>
          {gradient && <div style={{ color:"#555",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:2,textTransform:"uppercase" }}>✦ {gradient.label}</div>}
        </header>

        <main style={{ maxWidth:600,margin:"0 auto",padding:"38px 20px 60px" }}>
          {(phase==="search"||phase==="loading") && (
            <div style={{ animation:"fadeUp 0.5s ease both" }}>
              {phase==="search" && (
                <>
                  <div style={{ textAlign:"center",marginBottom:32 }}>
                    <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,8vw,50px)",fontWeight:900,lineHeight:1.1,letterSpacing:"-1.5px",marginBottom:11 }}>
                      <span style={{ color:"#d0d0c8" }}>Music for </span>
                      <span style={{ fontStyle:"italic",background:"linear-gradient(120deg,#e8a838,#f5d880)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>every book.</span>
                    </h1>
                    <p style={{ color:"#505060",fontSize:15,fontStyle:"italic",lineHeight:1.6 }}>Search any book or manga. Get real Spotify playlists matched to its mood — with 30s audio previews.</p>
                  </div>
                  <AdBanner />
                </>
              )}

              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block",color:"#484858",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:8 }}>Book or Manga Title</label>
                <div style={{ position:"relative" }}>
                  <input ref={inputRef} value={query}
                    onChange={e => { setQuery(e.target.value); setSelected(null); setSugg([]); }}
                    onKeyDown={e => e.key==="Enter" && selected && submit()}
                    placeholder="e.g. Berserk, Dune, One Piece…"
                    disabled={phase==="loading"}
                    style={{ width:"100%",background:"rgba(0,0,0,0.32)",border:`1px solid ${selected?"rgba(232,168,56,0.42)":"rgba(255,255,255,0.09)"}`,borderRadius:10,padding:"14px 46px 14px 16px",fontSize:16,fontFamily:"'Crimson Text',serif",color:"#e0e0d8",backdropFilter:"blur(6px)",transition:"border-color 0.2s" }}
                    onFocus={e => { if(!selected) e.target.style.borderColor="rgba(255,255,255,0.2)"; }}
                    onBlur={e  => { if(!selected) e.target.style.borderColor="rgba(255,255,255,0.09)"; }}
                  />
                  <div style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }}>
                    {searching
                      ? <div style={{ width:16,height:16,border:"2px solid #181826",borderTopColor:"#e8a838",borderRadius:"50%",animation:"spin 0.6s linear infinite" }} />
                      : selected ? <span style={{ color:"#e8a838" }}>✓</span>
                      : <span style={{ color:"#303040" }}>🔍</span>}
                  </div>

                  {suggestions.length>0 && !selected && (
                    <div style={{ position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:100,background:"#0b0b1c",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,overflow:"hidden",boxShadow:"0 22px 60px rgba(0,0,0,0.9)" }}>
                      {suggestions.map((book,i) => (
                        <div key={i} onMouseDown={e => { e.preventDefault(); pickBook(book); }}
                          style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",cursor:"pointer",borderBottom:i<suggestions.length-1?"1px solid rgba(255,255,255,0.05)":"none",transition:"background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(232,168,56,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{book.emoji||"📖"}</span>
                          <div style={{ minWidth:0 }}>
                            <div style={{ color:"#d0d0c8",fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{book.title}</div>
                            <div style={{ color:"#484858",fontSize:12,fontStyle:"italic" }}>{book.author} · {book.genre}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selected && phase==="search" && chapterOptions.length>0 && (
                <div style={{ marginBottom:18,animation:"fadeUp 0.3s ease both" }}>
                  <label style={{ display:"block",color:"#484858",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:8 }}>
                    Chapter <span style={{ color:"#2a2a38",fontSize:11,textTransform:"none",letterSpacing:0,fontFamily:"'Crimson Text',serif",fontStyle:"italic" }}>— optional</span>
                  </label>
                  <select value={chapter} onChange={e => setChapter(e.target.value)}
                    style={{ background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:"11px 36px 11px 14px",fontSize:14,fontFamily:"'DM Mono',monospace",color:chapter?"#e0e0d8":"#484858",backdropFilter:"blur(6px)",cursor:"pointer",appearance:"none",WebkitAppearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23555' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",minWidth:180 }}
                    onFocus={e => e.target.style.borderColor="rgba(255,255,255,0.2)"}
                    onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.09)"}>
                    <option value="">— any chapter —</option>
                    {chapterOptions.map(n => <option key={n} value={String(n)}>Chapter {n}</option>)}
                  </select>
                </div>
              )}

              {selected && phase==="search" && (
                <div style={{ marginBottom:16,display:"flex",alignItems:"center",gap:12,background:"rgba(232,168,56,0.06)",border:"1px solid rgba(232,168,56,0.15)",borderRadius:8,padding:"10px 14px" }}>
                  <span style={{ fontSize:22 }}>{selected.emoji||"📖"}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ color:"#e8a838",fontSize:14,fontFamily:"'Playfair Display',serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{selected.title}</div>
                    <div style={{ color:"#484848",fontSize:12,fontStyle:"italic" }}>by {selected.author} · {selected.genre}{selected.chapterCount>0?` · ${selected.chapterCount} ch.`:""}</div>
                  </div>
                  <button onClick={() => { setSelected(null); setQuery(""); setSugg([]); setChapter(""); }}
                    style={{ background:"transparent",border:"none",color:"#484848",cursor:"pointer",fontSize:18,lineHeight:1,flexShrink:0 }}>×</button>
                </div>
              )}

              {error && <div style={{ color:"#d05050",fontSize:13,fontFamily:"'DM Mono',monospace",marginBottom:14,padding:"9px 13px",background:"rgba(180,40,40,0.08)",borderRadius:6,border:"1px solid rgba(180,40,40,0.22)" }}>⚠ {error}</div>}

              {phase==="search" && (
                <button onClick={submit} disabled={!selected}
                  style={{ width:"100%",padding:16,background:selected?"linear-gradient(135deg,#e8a838,#cc9030)":"rgba(255,255,255,0.03)",border:selected?"none":"1px solid rgba(255,255,255,0.07)",borderRadius:10,cursor:selected?"pointer":"not-allowed",color:selected?"#000":"#252535",fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,transition:"all 0.22s" }}
                  onMouseEnter={e => { if(selected){ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 7px 24px rgba(232,168,56,0.28)"; }}}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
                  {selected?"✦ Find My Soundtrack":"Select a book from the list above"}
                </button>
              )}

              {phase==="loading" && (
                <div style={{ textAlign:"center",padding:"60px 0" }}>
                  <div style={{ width:38,height:38,border:"3px solid #141420",borderTopColor:"#e8a838",borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto 16px" }} />
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:18,color:"#666",fontStyle:"italic",marginBottom:5 }}>Curating your soundtrack…</div>
                  <div style={{ color:"#2a2a3a",fontSize:12,fontFamily:"'DM Mono',monospace" }}>{selected?.title}</div>
                </div>
              )}
            </div>
          )}

          {phase==="results" && (
            <div style={{ animation:"fadeUp 0.5s ease both" }}>
              <button onClick={reset}
                style={{ background:"transparent",border:"none",color:"#404050",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",letterSpacing:1,marginBottom:26,padding:0,display:"flex",alignItems:"center",gap:6,transition:"color 0.18s" }}
                onMouseEnter={e => e.currentTarget.style.color="#e8a838"}
                onMouseLeave={e => e.currentTarget.style.color="#404050"}>← search again</button>

              <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:6 }}>
                <span style={{ fontSize:36 }}>{selected?.emoji||"📖"}</span>
                <div>
                  <div style={{ color:"#383848",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:3 }}>Now reading</div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#d0d0c8",lineHeight:1.15 }}>{selected?.title}</div>
                  <div style={{ color:"#484858",fontSize:13,fontStyle:"italic" }}>by {selected?.author}</div>
                  {chapter && <div style={{ marginTop:5,display:"inline-block",background:"rgba(232,168,56,0.07)",border:"1px solid rgba(232,168,56,0.15)",borderRadius:20,padding:"2px 10px",color:"#e8a838",fontSize:10,fontFamily:"'DM Mono',monospace" }}>Chapter {chapter}</div>}
                </div>
              </div>

              <AdBanner />

              <div style={{ color:"#383848",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Mono',monospace",marginBottom:11 }}>
                Recommended Playlists
                {recs.some(r=>r.loading) && <span style={{ color:"#2a2a3a",marginLeft:8 }}>· fetching from Spotify…</span>}
              </div>

              <div style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:22 }}>
                {recs.map((rec,i) => <PlaylistCard key={i} rec={rec} index={i} />)}
              </div>

              <div style={{ textAlign:"center" }}>
                <button onClick={reset}
                  style={{ background:"transparent",border:"1px solid rgba(255,255,255,0.07)",color:"#484858",padding:"9px 20px",borderRadius:6,cursor:"pointer",fontFamily:"'Crimson Text',serif",fontSize:14,fontStyle:"italic",transition:"all 0.18s" }}
                  onMouseEnter={e => { e.target.style.borderColor="rgba(232,168,56,0.25)"; e.target.style.color="#e8a838"; }}
                  onMouseLeave={e => { e.target.style.borderColor="rgba(255,255,255,0.07)"; e.target.style.color="#484858"; }}>
                  Try another book
                </button>
              </div>
            </div>
          )}
        </main>

        <footer style={{ borderTop:"1px solid rgba(255,255,255,0.03)",padding:14,textAlign:"center",color:"#181828",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px" }}>
          SOUNDTRACK FOR READERS · GEMINI AI + SPOTIFY
        </footer>
      </div>
    </>
  );
}
