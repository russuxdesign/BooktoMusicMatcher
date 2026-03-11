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
    covers:["https://covers.openlibrary.org/b/isbn/9781591161899-L.jpg","https://covers.openlibrary.org/b/isbn/9781421504513-L.jpg","https://covers.openlibrary.org/b/isbn/9781421528458-L.jpg","https://covers.openlibrary.org/b/id/240726-L.jpg","https://covers.openlibrary.org/b/id/8231856-L.jpg"] },
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

// Persistent cover cache so we never fetch the same title twice
const coverCache = {};

function CoverImgFallback({ emoji, title, fill, size }) {
  const COLORS = {
    "🌙":"#1a1a3e,#2a2a5e","⚔️":"#3e1a1a,#5e2a2a","🏴‍☠️":"#0a1628,#1a2e4a",
    "👁️":"#1a0a28,#3a1a4e","🪚":"#281a0a,#4e3a1a","🌊":"#0a2028,#1a3a4e",
    "⚡":"#28280a,#4e4e1a","🍥":"#280a0a,#4e1a1a","🐉":"#0a280a,#1a4e1a",
    "💥":"#280a0a,#5e1a1a","💀":"#141414,#1e1e1e","📓":"#0a0a28,#1a1a4e",
    "🪓":"#1e180a,#3e300a","⚗️":"#0a1e1e,#1a3e3e","🌸":"#2e0a1a,#4e1a2e",
    "🌹":"#2e0808,#4e1010","⚛️":"#0a1e2e,#1a3e4e","🏹":"#1e1e0a,#3e3e1a",
    "🦴":"#2e2e2e,#1a1a1a","🧙":"#1a0a2e,#2e1a4e","✨":"#2e2a0a,#4e461a",
    "🗡️":"#1e1e2e,#2e2e4e","🥂":"#2e280a,#4e401a","⚡":"#282808,#4e4e18",
  };
  const [c1,c2] = (COLORS[emoji]||"#1a1a2e,#2e2e4e").split(",");
  const base = { background:`linear-gradient(145deg,${c1},${c2})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6 };
  const style = fill ? {...base,position:"absolute",inset:0} : {...base,width:size,height:size*1.4,borderRadius:6};
  return (
    <div style={style}>
      <span style={{fontSize:fill?28:Math.max(14,size*0.33)}}>{emoji||"📖"}</span>
      <span style={{color:"#9090b8",fontSize:fill?9:7,fontFamily:"monospace",textAlign:"center",padding:"0 5px",lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
        {(title||"").replace(" Vol. 1","")}
      </span>
    </div>
  );
}

// Fetches the best available cover from Open Library search — works for ANY book/manga
async function fetchCoverUrl(title, author) {
  const key = (title+"|"+(author||"")).toLowerCase();
  if (coverCache[key] !== undefined) return coverCache[key];
  coverCache[key] = null; // mark as in-flight
  try {
    const q = encodeURIComponent(title + (author ? " " + author : ""));
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=5&fields=cover_i,isbn`);
    const data = await res.json();
    // Try cover_i first (most reliable)
    for (const doc of (data.docs||[])) {
      if (doc.cover_i) {
        const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        coverCache[key] = url;
        return url;
      }
    }
    // Try ISBNs
    for (const doc of (data.docs||[])) {
      for (const isbn of (doc.isbn||[]).slice(0,3)) {
        const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
        coverCache[key] = url;
        return url;
      }
    }
  } catch {}
  coverCache[key] = ""; // nothing found
  return "";
}

function CoverImg({ cover, covers, title, author, emoji, size = 72 }) {
  const staticSources = covers || (cover ? [cover] : []);
  const [failIdx, setFailIdx] = useState(0);
  const [dynUrl, setDynUrl] = useState("");
  const fetchedRef = useRef(false);
  const fill = size === "fill";

  const imgStyle = fill
    ? {position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block"}
    : {width:size,height:size*1.4,objectFit:"cover",borderRadius:6,display:"block"};

  // Called when every static URL has failed — fetch the real cover from Open Library
  const handleAllStaticFailed = () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const q = encodeURIComponent((title||"") + (author ? " "+author : ""));
    fetch("https://openlibrary.org/search.json?q="+q+"&limit=5&fields=cover_i,isbn")
      .then(r => r.json())
      .then(data => {
        for (const doc of (data.docs||[])) {
          if (doc.cover_i) { setDynUrl("https://covers.openlibrary.org/b/id/"+doc.cover_i+"-L.jpg"); return; }
        }
        for (const doc of (data.docs||[])) {
          for (const isbn of (doc.isbn||[]).slice(0,3)) {
            setDynUrl("https://covers.openlibrary.org/b/isbn/"+isbn+"-L.jpg"); return;
          }
        }
      })
      .catch(() => {});
  };

  const allStaticFailed = failIdx >= staticSources.length;

  if (allStaticFailed) {
    if (dynUrl) return <img src={dynUrl} alt={title} onError={()=>setDynUrl("")} style={imgStyle} />;
    handleAllStaticFailed();
    return <CoverImgFallback emoji={emoji} title={title} fill={fill} size={size} />;
  }

  return (
    <img
      src={staticSources[failIdx]}
      alt={title}
      onError={() => setFailIdx(n => n + 1)}
      style={imgStyle}
    />
  );
}

// ── SHARE ICONS (top-level — never defined inside a component) ──
function ShareIgIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/><circle cx="12" cy="12" r="4.5" stroke="#E1306C" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1" fill="#E1306C"/></svg>; }
function ShareTkIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.73a8.14 8.14 0 004.77 1.52V6.79a4.85 4.85 0 01-1-.1z"/></svg>; }
function ShareWaIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>; }
function ShareFbIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function ShareMsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#0084FF"><path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259L10.733 8l3.13 3.259L19.752 8l-6.559 6.963z"/></svg>; }
function ShareXIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>; }

// ── SHARE MODAL ──
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
    const canvas = await html2canvas(cardRef.current, { scale:2, useCORS:true, backgroundColor:null, logging:false });
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
    { label:"Instagram",   Icon:ShareIgIcon, color:"#E1306C", url:null },
    { label:"TikTok",      Icon:ShareTkIcon, color:"#010101", url:null },
    { label:"WhatsApp",    Icon:ShareWaIcon, color:"#25D366", url:`https://wa.me/?text=${encodeURIComponent(`🎵 My reading soundtrack for "${book.title}" — find yours at https://${siteUrl}`)}` },
    { label:"Facebook",    Icon:ShareFbIcon, color:"#1877F2", url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://${siteUrl}`)}` },
    { label:"Messenger",   Icon:ShareMsIcon, color:"#0084FF", url:`https://www.facebook.com/dialog/send?link=${encodeURIComponent(`https://${siteUrl}`)}&app_id=181477555943165` },
    { label:"X / Twitter", Icon:ShareXIcon,  color:"#000000", url:`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎵 My reading soundtrack for "${book.title}" — find yours at https://${siteUrl}`)}` },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",borderRadius:16,background:"#0d0d1e",border:"1px solid rgba(255,255,255,0.12)",padding:24 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div style={{ color:"#f0f0e0",fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700 }}>Share your soundtrack</div>
          <button onClick={onClose} style={{ background:"transparent",border:"none",color:"#888",fontSize:22,cursor:"pointer",lineHeight:1 }}>×</button>
        </div>

        {/* Share card */}
        <div ref={cardRef} style={{ borderRadius:14,overflow:"hidden",background:gc3,padding:28,position:"relative",marginBottom:20,border:"1px solid rgba(255,255,255,0.1)",minHeight:280 }}>
          {book.cover && <div style={{ position:"absolute",inset:0,backgroundImage:`url(${book.cover})`,backgroundSize:"cover",backgroundPosition:"center top",opacity:0.55,pointerEvents:"none" }} />}
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.82) 75%, rgba(0,0,0,0.95) 100%)",pointerEvents:"none" }} />
          <div style={{ position:"absolute",inset:0,background:`linear-gradient(135deg, ${gc1}22 0%, transparent 50%, ${gc2}22 100%)`,pointerEvents:"none" }} />
          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ fontSize:40,marginBottom:10,textAlign:"center" }}>{book.emoji||"📖"}</div>
            <div style={{ fontFamily:"'Georgia',serif",fontSize:22,fontWeight:700,color:"#fff",textAlign:"center",marginBottom:4,textShadow:"0 2px 8px rgba(0,0,0,0.5)",lineHeight:1.2 }}>{book.title}</div>
            <div style={{ color:"rgba(255,255,255,0.6)",fontSize:13,textAlign:"center",marginBottom:18,fontStyle:"italic" }}>by {book.author}</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20 }}>
              {moodTags.map(m => { const ms=MOOD[m.toLowerCase()]||MOOD.default; return <span key={m} style={{ background:"rgba(0,0,0,0.4)",border:`1px solid ${ms.border}`,color:ms.text,fontSize:10,fontFamily:"monospace",padding:"3px 10px",borderRadius:20,letterSpacing:1,textTransform:"uppercase" }}>{m}</span>; })}
            </div>
            <div style={{ height:1,background:"rgba(255,255,255,0.15)",marginBottom:16 }} />
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:20 }}>
              {recs.filter(r=>r.name).slice(0,4).map((r,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ color:"rgba(255,255,255,0.4)",fontSize:11,fontFamily:"monospace",width:16,textAlign:"right" }}>{i+1}</span>
                  <span style={{ color:"rgba(255,255,255,0.85)",fontSize:13,fontFamily:"'Georgia',serif" }}>{r.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ color:"rgba(255,255,255,0.45)",fontSize:10,fontFamily:"monospace",letterSpacing:1 }}>MADE WITH</div>
              <div style={{ color:"rgba(255,255,255,0.7)",fontSize:11,fontFamily:"monospace",fontWeight:700,letterSpacing:1 }}>📖 BOOK TO MUSIC MATCHER</div>
              <div style={{ color:"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"monospace" }}>{siteUrl}</div>
            </div>
          </div>
        </div>

        <button onClick={downloadImage} style={{ width:"100%",padding:"12px 0",background:"linear-gradient(135deg,#e8a838,#cc9030)",border:"none",borderRadius:10,cursor:"pointer",color:"#000",fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,marginBottom:16 }}>
          {downloaded?"✓ Downloaded!":"⬇ Download Image"}
        </button>

        <div style={{ color:"#888",fontSize:9,letterSpacing:2,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10 }}>Share to</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16 }}>
          {shareTargets.map(t => (
            <button key={t.label} onClick={()=>{ if(t.url) window.open(t.url,"_blank"); else downloadImage(); }}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"10px 6px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,cursor:"pointer",transition:"all 0.18s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.09)";e.currentTarget.style.borderColor=t.color+"88";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
              <div style={{ width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center" }}><t.Icon /></div>
              <span style={{ color:"#bbb",fontSize:9,fontFamily:"monospace",letterSpacing:0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>

        <button onClick={copyLink} style={{ width:"100%",padding:"10px 0",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,cursor:"pointer",color:copying?"#6ee896":"#bbb",fontFamily:"monospace",fontSize:12,transition:"all 0.2s" }}>
          {copying?"✓ Copied!":"🔗 Copy link"}
        </button>
      </div>
    </div>
  );
}

// ── PLAYLIST CARD ──
function PlaylistCard({ rec, index, onShare }) {
  const [hov, setHov] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const ms = MOOD[rec.mood?.toLowerCase()] || MOOD.default;
  const playlistId = rec.playlist?.id;
  const myClose = useRef(null);
  useEffect(() => { myClose.current = () => setShowEmbed(false); });

  const handlePreview = (e) => {
    e.stopPropagation();
    if (showEmbed) { setShowEmbed(false); gCloseEmbed = null; }
    else { if (gCloseEmbed) gCloseEmbed(); setShowEmbed(true); gCloseEmbed = () => myClose.current?.(); }
  };

  const embedSrc = playlistId ? `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1` : null;

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ borderRadius:13,border:`1px solid ${hov?ms.border:"rgba(255,255,255,0.12)"}`,background:hov?ms.bg:"rgba(0,0,0,0.35)",boxShadow:hov?"0 10px 36px rgba(0,0,0,0.5)":"0 2px 10px rgba(0,0,0,0.3)",transform:hov?"translateY(-2px)":"none",transition:"all 0.25s ease",animation:`fadeUp 0.4s ease ${index*0.08}s both`,backdropFilter:"blur(10px)",overflow:"hidden" }}>
      <div style={{ display:"flex" }}>
        <div style={{ width:96,height:96,flexShrink:0,background:ms.bg,overflow:"hidden" }}>
          {rec.loading
            ? <div style={{ width:96,height:96,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:20,height:20,border:`2px solid ${ms.text}44`,borderTopColor:ms.text,borderRadius:"50%",animation:"spin 0.7s linear infinite" }} /></div>
            : rec.thumbnail ? <img src={rec.thumbnail} alt={rec.name} style={{ width:96,height:96,objectFit:"cover",display:"block" }} />
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
              <button onClick={handlePreview} style={{ display:"flex",alignItems:"center",gap:5,background:showEmbed?"#1db954":ms.bg,border:`1px solid ${showEmbed?"#1db954":ms.border}`,borderRadius:20,padding:"6px 13px",cursor:"pointer",transition:"all 0.22s",flexShrink:0 }}>
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
            <button onClick={e=>{e.stopPropagation();onShare();}}
              style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 11px",cursor:"pointer",transition:"all 0.22s",flexShrink:0,marginLeft:"auto" }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.borderColor="rgba(255,255,255,0.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span style={{ color:"#ffffff",fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>Share</span>
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
