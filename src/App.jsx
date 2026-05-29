import React, { useState, useRef, useEffect } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Sans+JP:wght@400;500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};
const SANS = "'Noto Sans JP','Hiragino Kaku Gothic Pro','Yu Gothic',sans-serif";
const FONT = "'Cormorant Garamond','Hiragino Mincho Pro','Yu Mincho',serif";

// ── Data ──────────────────────────────────────────────────────────────────────
const ERAS = {
  baroque:      { label:"バロック",  short:"バロック",  color:"#8B5E3C", bg:"#FDF5ED", year:[1600,1750] },
  classical:    { label:"古典派",   short:"古典派",   color:"#2C6B82", bg:"#EDF5FB", year:[1750,1820] },
  romantic:     { label:"ロマン派", short:"ロマン派", color:"#7A2E5A", bg:"#FBEdf5", year:[1820,1900] },
  modern:       { label:"近現代",   short:"近現代",   color:"#2E6B3A", bg:"#EDF8EF", year:[1900,2000] },
  contemporary: { label:"現代",     short:"現代",     color:"#5A3A8A", bg:"#F3EDF8", year:[2000,2030] },
};
const ERA_ORDER = ["baroque","classical","romantic","modern","contemporary"];

const COUNTRIES = ["ドイツ","オーストリア","フランス","ポーランド","ロシア","イタリア","スペイン","ノルウェー","フィンランド","ハンガリー","チェコ","アメリカ","日本","その他"];
const KEYS = ["ー","ハ長調","ニ長調","ホ長調","ヘ長調","ト長調","イ長調","ロ長調","変ロ長調","変ホ長調","変イ長調","変ニ長調","嬰ヘ長調","イ短調","ロ短調","ハ短調","ニ短調","ホ短調","ヘ短調","ト短調","嬰ト短調","変ロ短調","嬰ハ短調","嬰ヘ短調","変ホ短調"];
const FORMS = ["ソナタ","組曲","変奏曲","バラード","スケルツォ","夜想曲","即興曲","練習曲","前奏曲","幻想曲","舞曲","協奏曲","小品","その他"];

// Composer birth years for born-year sorting
const COMPOSER_BORN = {
  "J.S.バッハ":1685, "バッハ":1685, "Bach":1685,
  "ヘンデル":1685, "Handel":1685,
  "ヴィヴァルディ":1678, "Vivaldi":1678,
  "スカルラッティ":1685, "Scarlatti":1685,
  "ハイドン":1732, "Haydn":1732,
  "モーツァルト":1756, "Mozart":1756,
  "ベートーヴェン":1770, "Beethoven":1770,
  "シューベルト":1797, "Schubert":1797,
  "メンデルスゾーン":1809, "Mendelssohn":1809,
  "ショパン":1810, "Chopin":1810,
  "シューマン":1810, "Schumann":1810,
  "リスト":1811, "Liszt":1811,
  "ブラームス":1833, "Brahms":1833,
  "サン＝サーンス":1835, "Saint-Saëns":1835,
  "チャイコフスキー":1840, "Tchaikovsky":1840,
  "グリーグ":1843, "Grieg":1843,
  "ファリャ":1876, "Falla":1876,
  "ラフマニノフ":1873, "Rachmaninoff":1873,
  "スクリャービン":1872, "Scriabin":1872,
  "ドビュッシー":1862, "Debussy":1862,
  "ラヴェル":1875, "Ravel":1875,
  "フォーレ":1845, "Fauré":1845,
  "シベリウス":1865, "Sibelius":1865,
  "バルトーク":1881, "Bartók":1881,
  "プロコフィエフ":1891, "Prokofiev":1891,
  "ショスタコーヴィチ":1906, "Shostakovich":1906,
};

const SAMPLE_PIECES = [
  { id:1,  title:"平均律クラヴィーア第1巻 BWV846", composer:"J.S.バッハ",     year:1722, country:"ドイツ",      key:"ハ長調",   duration:4,  readiness:90, difficulty:3, form:"前奏曲", era:"baroque"   },
  { id:2,  title:"フランス組曲 第5番 BWV816",       composer:"J.S.バッハ",     year:1722, country:"ドイツ",      key:"ト長調",   duration:18, readiness:75, difficulty:4, form:"組曲",   era:"baroque"   },
  { id:3,  title:"ピアノソナタ K.331",              composer:"モーツァルト",   year:1783, country:"オーストリア", key:"イ長調",   duration:22, readiness:85, difficulty:3, form:"ソナタ", era:"classical" },
  { id:4,  title:"ピアノソナタ 第8番「悲愴」",      composer:"ベートーヴェン", year:1799, country:"ドイツ",      key:"ハ短調",   duration:20, readiness:70, difficulty:4, form:"ソナタ", era:"classical" },
  { id:5,  title:"バラード 第1番 Op.23",            composer:"ショパン",       year:1835, country:"ポーランド",  key:"ト短調",   duration:10, readiness:60, difficulty:5, form:"バラード",era:"romantic"  },
  { id:6,  title:"夜想曲 Op.9 No.2",               composer:"ショパン",       year:1832, country:"ポーランド",  key:"変ホ長調", duration:5,  readiness:95, difficulty:3, form:"夜想曲", era:"romantic"  },
  { id:7,  title:"愛の夢 第3番",                    composer:"リスト",         year:1850, country:"ハンガリー",  key:"変イ長調", duration:5,  readiness:80, difficulty:4, form:"小品",   era:"romantic"  },
  { id:8,  title:"子供の情景 Op.15",                composer:"シューマン",     year:1838, country:"ドイツ",      key:"ト長調",   duration:17, readiness:65, difficulty:3, form:"小品",   era:"romantic"  },
  { id:9,  title:"月の光",                          composer:"ドビュッシー",   year:1905, country:"フランス",    key:"変ニ長調", duration:5,  readiness:88, difficulty:3, form:"小品",   era:"modern"    },
  { id:10, title:"ソナタ第7番 Op.83",               composer:"プロコフィエフ", year:1942, country:"ロシア",      key:"変ロ長調", duration:20, readiness:50, difficulty:5, form:"ソナタ", era:"modern"    },
  { id:11, title:"マズルカ Op.17 No.4",             composer:"ショパン",       year:1833, country:"ポーランド",  key:"イ短調",   duration:4,  readiness:72, difficulty:3, form:"舞曲",   era:"romantic"  },
  { id:12, title:"クリスマス・ツリー組曲",           composer:"リスト",         year:1876, country:"ハンガリー",  key:"ト長調",   duration:25, readiness:45, difficulty:5, form:"組曲",   era:"romantic"  },
];

const EMPTY_PIECE = { title:"", composer:"", year:0, yearText:"ー", country:"ー", key:"ー", duration:0, durationSecs:0, difficulty:0, frequency:0, keywords:"", form:"ー", era:"romantic", fav:false, candidate:false };

const EMPTY_PROGRAM = (id) => ({ id, name:"新しいプログラム", maxDuration:40, maxPieces:999, pieceIds:[], intervalSecs:30 });

// ── Multilingual Search Aliases ───────────────────────────────────────────────
const SEARCH_ALIASES = {
  // J.S. Bach
  "J.S.バッハ":  ["bach","バッハ","j.s.bach","ヨハン・ゼバスティアン・バッハ","バッハ・ヨハン","johannes sebastian"],
  // Mozart
  "モーツァルト": ["mozart","モーツアルト","ヴォルフガング・アマデウス","wolfgangamadjus","amadeus"],
  // Beethoven
  "ベートーヴェン":["beethoven","ベートーベン","ベートーヴェン","ludwig","ルートヴィヒ"],
  // Chopin
  "ショパン":     ["chopin","frédéric","frederic","フレデリック","フリデリク"],
  // Liszt
  "リスト":       ["liszt","franz","フランツ","フェレンツ"],
  // Schumann
  "シューマン":   ["schumann","robert","ロベルト"],
  // Debussy
  "ドビュッシー": ["debussy","claude","クロード","debussi"],
  // Ravel
  "ラヴェル":     ["ravel","maurice","モーリス"],
  // Rachmaninoff
  "ラフマニノフ":  ["rachmaninoff","rachmaninov","sergei","セルゲイ"],
  // Prokofiev
  "プロコフィエフ":["prokofiev","sergei","セルゲイ"],
  // Schubert
  "シューベルト": ["schubert","franz","フランツ"],
  // Brahms
  "ブラームス":   ["brahms","johannes","ヨハネス"],
  // Haydn
  "ハイドン":     ["haydn","joseph","ヨーゼフ"],
  // Scriabin
  "スクリャービン":["scriabin","alexander","アレクサンドル"],
  // Bartók
  "バルトーク":   ["bartok","bartók","béla","bela","ベーラ"],
  // Grieg
  "グリーグ":     ["grieg","edvard","エドヴァルド"],
  // Fauré
  "フォーレ":     ["faure","fauré","gabriel","ガブリエル"],
  // Sibelius
  "シベリウス":   ["sibelius","jean","ジャン"],
  // Scarlatti
  "スカルラッティ":["scarlatti","domenico","ドメニコ"],
  // Handel
  "ヘンデル":     ["handel","george frideric","ゲオルク"],
  // Vivaldi
  "ヴィヴァルディ":["vivaldi","antonio","アントニオ"],
  // Tchaikovsky
  "チャイコフスキー":["tchaikovsky","pyotr","ピョートル","peter"],
  // Saint-Saëns
  "サン＝サーンス":["saint-saens","saint-saëns","camille","カミーユ"],
  // Shostakovich
  "ショスタコーヴィチ":["shostakovich","dmitri","ドミトリ"],
};

// Title aliases (alternate/popular names)
const TITLE_ALIASES = {
  "月の光":              ["clair de lune","クレール・ド・リュンヌ","moonlight"],
  "愛の夢":              ["liebestraum","リープトラウム","dream of love"],
  "英雄":                ["heroique","ポロネーズ英雄"],
  "革命":                ["revolution","étude op.10 no.12"],
  "別れの曲":            ["tristesse","op.10 no.3"],
  "幻想即興曲":          ["fantasie-impromptu","fantaisie impromptu"],
  "子犬のワルツ":        ["minute waltz","小犬のワルツ"],
  "雨だれ":              ["raindrop prelude","op.28 no.15"],
  "悲愴":                ["pathetique","pathétique"],
  "月光":                ["moonlight sonata","op.27 no.2"],
  "田園":                ["pastorale","pastoral"],
  "テンペスト":          ["tempest","storm","嵐"],
  "熱情":                ["appassionata"],
  "春":                  ["frühling","printemps","spring"],
  "子供の情景":          ["kinderszenen","scenes from childhood","scenes d'enfants"],
};

const searchMatch = (p, q) => {
  if (!q.trim()) return true;
  const lower = q.toLowerCase().trim();
  const title = p.title.toLowerCase();
  const composer = p.composer.toLowerCase();

  // Direct match
  if (title.includes(lower) || composer.includes(lower)) return true;

  // Title alias match
  for (const [canonical, aliases] of Object.entries(TITLE_ALIASES)) {
    if (canonical.includes(q) || p.title.includes(canonical)) {
      if (aliases.some(a => a.includes(lower) || lower.includes(a.substring(0,3)))) return true;
    }
    if (aliases.some(a => a.includes(lower) || title.includes(a))) return true;
  }

  // Composer alias match
  for (const [canonical, aliases] of Object.entries(SEARCH_ALIASES)) {
    if (p.composer.includes(canonical) || canonical.includes(p.composer)) {
      if (aliases.some(a => a.includes(lower) || lower.includes(a.substring(0,3)))) return true;
    }
  }
  return false;
};

const eraFromYear = (y) => {
  for (const k of ERA_ORDER) { const v=ERAS[k]; if(y>=v.year[0]&&y<v.year[1]) return k; }
  return "modern";
};

const DotRating = ({ value, max=5, color }) => (
  <span style={{ letterSpacing:1, fontSize:11 }}>
    {Array.from({length:max}).map((_,i)=>(
      <span key={i} style={{ color:i<value?color:"#D8D0C0" }}>●</span>
    ))}
  </span>
);

const EmojiRating = ({ label, value, max=5, filled, empty="◯" }) => (
  <span style={{fontFamily:SANS,fontSize:11,color:"#6A5030",display:"inline-flex",alignItems:"center",gap:3}}>
    <span style={{color:"#A09070",fontSize:10}}>{label}</span>
    <span>{Array.from({length:max}).map((_,i)=><span key={i}>{i<value?filled:empty}</span>)}</span>
  </span>
);

const fmtDuration = (mins, secs) => {
  if (!secs) return mins + "分";
  return mins + "分" + (secs < 10 ? "0" : "") + secs + "秒";
};

// ── PieceCard ─────────────────────────────────────────────────────────────────
const PieceCard = ({ piece, inProgram, canAdd, onAdd, onRemove, expanded, onToggleExpand, isAI, onToggleFav, onToggleCandidate }) => {
  const era = ERAS[piece.era] || ERAS.modern;
  return (
    <div style={{ background:inProgram?"#F5F0E6":"white", border:"1.5px solid "+(inProgram?"#C8B890":"#E8E0D0"), borderLeft:"4px solid "+era.color, borderRadius:6, marginBottom:5, overflow:"hidden", opacity:inProgram?0.55:1, transition:"opacity 0.2s" }}>
      <div style={{ padding:"9px 12px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onToggleExpand}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, color:"#2A2010", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {piece.fav && <span style={{marginRight:4,fontSize:11}}>♥</span>}
            {piece.candidate && <span style={{marginRight:4,fontSize:11,color:"#C8A030"}}>★</span>}
            {piece.title}
            {isAI && <span style={{ marginLeft:6, fontSize:9, background:"#EDF5FB", color:"#2C6B82", padding:"1px 6px", borderRadius:8, border:"1px solid #BDD5E5" }}>AI</span>}
          </div>
          <div style={{ fontSize:11, color:"#8A7050", display:"flex", gap:6, flexWrap:"wrap", fontFamily:SANS }}>
            <span>{piece.composer}</span><span style={{color:"#D8D0C0"}}>·</span>
            <span>{piece.year}年</span><span style={{color:"#D8D0C0"}}>·</span>
            <span>{piece.key}</span><span style={{color:"#D8D0C0"}}>·</span>
            <span>{piece.duration}分</span>
          </div>
        </div>
        <div style={{ flexShrink:0, display:"flex", gap:4, alignItems:"center" }}>
          {onToggleFav && (
            <button onClick={e=>{e.stopPropagation();onToggleFav();}}
              title="お気に入り"
              style={{ background:"none", border:"none", color:piece.fav?"#C03050":"#D8D0C0", fontSize:13, cursor:"pointer", padding:"0 1px", lineHeight:1 }}>♥</button>
          )}
          {onToggleCandidate && (
            <button onClick={e=>{e.stopPropagation();onToggleCandidate();}}
              title="候補に追加"
              style={{ background:"none", border:"none", color:piece.candidate?"#C8A030":"#D8D0C0", fontSize:13, cursor:"pointer", padding:"0 1px", lineHeight:1 }}>★</button>
          )}
          {inProgram
            ? <button onClick={e=>{e.stopPropagation();onRemove();}} style={{ background:"#FFF0EE", border:"1px solid #E8C0B0", color:"#A04030", width:24, height:24, borderRadius:"50%", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>×</button>
            : <button onClick={e=>{e.stopPropagation();onAdd();}} disabled={!canAdd} style={{ background:canAdd?"#2A2010":"#EDE8DC", border:"none", color:canAdd?"#E8D090":"#B0A080", width:24, height:24, borderRadius:"50%", cursor:canAdd?"pointer":"not-allowed", fontSize:17, fontFamily:"inherit", lineHeight:"24px", textAlign:"center" }}>+</button>
          }
          <span style={{ color:"#C8B890", fontSize:10 }}>{expanded?"▲":"▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding:"8px 12px 12px", borderTop:"1px solid #F0EAE0", background:"#FDFAF6" }}>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap", marginBottom:8 }}>
            <div><div style={{ fontSize:9, color:"#A09070", letterSpacing:2, marginBottom:3, fontFamily:SANS }}>難易度</div><DotRating value={piece.difficulty} max={5} color="#E05030" /></div>
            
            <div><div style={{ fontSize:9, color:"#A09070", letterSpacing:2, marginBottom:3, fontFamily:SANS }}>仕上がり</div><span style={{ fontSize:12, color:piece.readiness>=80?"#2A7A3A":piece.readiness>=60?"#8A7020":"#B03020", fontWeight:"bold" }}>{piece.readiness}%</span></div>
            <div><div style={{ fontSize:9, color:"#A09070", letterSpacing:2, marginBottom:3, fontFamily:SANS }}>形式</div><span style={{ fontSize:12, color:"#5A4A2A" }}>{piece.form}</span></div>
            <div><div style={{ fontSize:9, color:"#A09070", letterSpacing:2, marginBottom:3, fontFamily:SANS }}>国</div><span style={{ fontSize:12, color:"#5A4A2A" }}>{piece.country}</span></div>
          </div>
          {piece.reason && <div style={{ fontSize:12, color:"#6A5030", fontStyle:"italic", lineHeight:1.6, borderTop:"1px solid #F0EAE0", paddingTop:8, marginBottom:8, fontFamily:SANS }}>💡 {piece.reason}</div>}
          <div style={{ display:"flex", gap:6 }}>
            {[
              [`https://ja.wikipedia.org/wiki/${encodeURIComponent(piece.composer)}`,"Wikipedia","#2C6B82","#BDD5E5"],
              [`https://imslp.org/wiki/Special:Search/${encodeURIComponent(piece.title)}`,"IMSLP","#5A3A8A","#C5B5D5"],
              [`https://www.youtube.com/results?search_query=${encodeURIComponent(piece.title+" "+piece.composer)}`,"YouTube ▶","#A03020","#E0B0A0"],
            ].map(([href,label,color,border])=>(
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontSize:11, color, textDecoration:"none", border:"1px solid "+border, padding:"2px 8px", borderRadius:4, fontFamily:SANS }}>{label}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Era Ruler ─────────────────────────────────────────────────────────────────
const EraRuler = ({ pieces }) => {
  const [heights, setHeights] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    // Measure actual card heights from the sibling list
    const newH = {};
    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) newH[id] = el.getBoundingClientRect().height;
    });
    setHeights(newH);
  });

  if (!pieces.length) return null;
  const groups = [];
  let cur = null;
  pieces.forEach(p => {
    if (!cur || cur.era !== p.era) { cur = { era:p.era, ids:[p.id] }; groups.push(cur); }
    else cur.ids.push(p.id);
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", width:34, flexShrink:0, marginRight:4 }}>
      {groups.map((g, i) => {
        const era = ERAS[g.era] || ERAS.modern;
        // Sum measured heights; fallback to 57px per card
        const FALLBACK = 57;
        const h = g.ids.reduce((s, id) => s + (heights[id] || FALLBACK), 0);
        return (
          <div key={i} style={{ height:h, background:era.bg, border:"1px solid "+era.color+"33", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative", flexShrink:0 }}>
            <div style={{ writingMode:"vertical-lr", textOrientation:"mixed", fontSize:10, color:era.color, fontWeight:"bold", letterSpacing:2, userSelect:"none", fontFamily:SANS }}>
              {era.short}
            </div>
            {i < groups.length-1 && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:era.color, opacity:0.3 }} />}
          </div>
        );
      })}
    </div>
  );
};

// Wrapper to attach refs for ruler height measurement
const PieceCardWithRef = ({ piece, rulerRef, ...props }) => {
  return (
    <div ref={el => { if (rulerRef) rulerRef.current[piece.id] = el; }}>
      <PieceCard piece={piece} {...props} />
    </div>
  );
};

// ── Multilingual composer prefix map (③ for fast prefix search) ──────────────
const COMPOSER_PREFIXES = [
  // C
  { prefix:["c","ch","cho","chop","chopin"], name:"ショパン",  aliases:["Chopin","フレデリック"] },
  { prefix:["c","cz","cze","czer","czern"], name:"ツェルニー", aliases:["Czerny","Carl"] },
  { prefix:["c","cl","cla","clau"],          name:"ドビュッシー",aliases:["Claude","Debussy"] },
  { prefix:["c","co","cor"],                 name:"コレッリ",   aliases:["Corelli"] },
  // B
  { prefix:["b","ba","bac","bach"],          name:"J.S.バッハ", aliases:["Bach","Johann"] },
  { prefix:["b","be","bee","beet"],          name:"ベートーヴェン",aliases:["Beethoven","Ludwig"] },
  { prefix:["b","br","bra","brah"],          name:"ブラームス", aliases:["Brahms","Johannes"] },
  { prefix:["b","bo","bor"],                 name:"ボロディン",  aliases:["Borodin"] },
  // S
  { prefix:["s","sc","sch","schu","schub"],  name:"シューベルト",aliases:["Schubert","Franz"] },
  { prefix:["s","sc","sch","schu","schum"],  name:"シューマン",  aliases:["Schumann","Robert"] },
  { prefix:["s","sc","scr","scri"],          name:"スクリャービン",aliases:["Scriabin","Alexander"] },
  { prefix:["s","sa","sai"],                 name:"サン＝サーンス",aliases:["Saint-Saens"] },
  { prefix:["s","si","sib"],                 name:"シベリウス",  aliases:["Sibelius","Jean"] },
  { prefix:["s","sk","ska","skal"],          name:"スカルラッティ",aliases:["Scarlatti","Domenico"] },
  // M
  { prefix:["m","mo","moz","moza"],          name:"モーツァルト",aliases:["Mozart","Wolfgang"] },
  { prefix:["m","me","men","mend"],          name:"メンデルスゾーン",aliases:["Mendelssohn","Felix"] },
  // L
  { prefix:["l","li","lis","lisz"],          name:"リスト",      aliases:["Liszt","Franz"] },
  // R
  { prefix:["r","ra","rav","rave"],          name:"ラヴェル",    aliases:["Ravel","Maurice"] },
  { prefix:["r","ra","rac","rach"],          name:"ラフマニノフ", aliases:["Rachmaninoff","Sergei"] },
  // H
  { prefix:["h","ha","hay","hayd"],          name:"ハイドン",    aliases:["Haydn","Joseph"] },
  { prefix:["h","ha","han","hand"],          name:"ヘンデル",    aliases:["Handel","George"] },
  // D
  { prefix:["d","de","deb","debu"],          name:"ドビュッシー",aliases:["Debussy","Claude"] },
  // P
  { prefix:["p","pr","pro","prok"],          name:"プロコフィエフ",aliases:["Prokofiev","Sergei"] },
  // T
  { prefix:["t","tc","tch","tcha"],          name:"チャイコフスキー",aliases:["Tchaikovsky","Pyotr"] },
  // G
  { prefix:["g","gr","gri","grie"],          name:"グリーグ",    aliases:["Grieg","Edvard"] },
  // F
  { prefix:["f","fa","fau","faur"],          name:"フォーレ",    aliases:["Fauré","Gabriel"] },
  // V
  { prefix:["v","vi","viv","viva"],          name:"ヴィヴァルディ",aliases:["Vivaldi","Antonio"] },
];

const buildSuggestions = (q, pool) => {
  if (!q.trim()) return [];
  const lower = q.toLowerCase().trim();

  // ③ prefix-based composer matches (works for "c"→Chopin/Czerny etc.)
  const prefixComposers = COMPOSER_PREFIXES
    .filter(entry => entry.prefix.some(p => lower === p || lower.startsWith(p) || p.startsWith(lower)))
    .map(entry => entry.name)
    .filter(name => pool.some(p => p.composer.includes(name) || name.includes(p.composer.split("").slice(0,2).join(""))));

  // existing searchMatch-based matches
  const matched = pool.filter(p => searchMatch(p, q));
  const matchedComposers = [...new Set(matched.map(p=>p.composer))];

  // merge, deduplicate
  const allComposers = [...new Set([...prefixComposers, ...matchedComposers])].slice(0,4);
  const titles = matched.slice(0,5).map(p=>({type:"piece", piece:p}));

  return [
    ...allComposers.map(c=>({type:"composer", label:c})),
    ...titles,
  ].slice(0,8);
};

// ② Fixed SearchBox — IME-safe (composition events) + stable English input
const SearchBox = ({ searchQ, setSearchQ, allPool }) => {
  const [open, setOpen]       = useState(false);
  const [cursor, setCursor]   = useState(-1);
  const [displayVal, setDisplayVal] = useState(searchQ);
  const composing = useRef(false); // ① track IME composition
  const boxRef    = useRef(null);

  const candidates = buildSuggestions(displayVal, allPool);

  const handleChange = (e) => {
    const v = e.target.value;
    setDisplayVal(v);
    // ① only propagate when NOT mid-IME
    if (!composing.current) {
      setSearchQ(v);
      setOpen(true);
      setCursor(-1);
    }
  };

  // ① IME start: mark composing
  const handleCompositionStart = () => { composing.current = true; };

  // ① IME end: now safe to propagate
  const handleCompositionEnd = (e) => {
    composing.current = false;
    const v = e.target.value;
    setDisplayVal(v);
    setSearchQ(v);
    setOpen(true);
    setCursor(-1);
  };

  const handleKey = (e) => {
    if (composing.current) return; // ① ignore keys during IME
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setCursor(c=>Math.min(c+1,(candidates.length||1)-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c=>Math.max(c-1,-1)); }
    else if (e.key === "Enter") {
      if (cursor >= 0 && candidates[cursor]) {
        const item = candidates[cursor];
        const val = item.type==="composer" ? item.label : (item.piece?.title||"");
        setDisplayVal(val); setSearchQ(val); setOpen(false); setCursor(-1);
      } else { setOpen(false); }
    } else if (e.key === "Escape") { setOpen(false); setCursor(-1); }
  };

  const selectItem = (item) => {
    const val = item.type==="composer" ? item.label : (item.piece?.title||"");
    setDisplayVal(val); setSearchQ(val); setOpen(false); setCursor(-1);
  };

  const handleClear = () => { setDisplayVal(""); setSearchQ(""); setOpen(false); };
  const handleBlur  = (e) => { if (!boxRef.current?.contains(e.relatedTarget)) { setOpen(false); setCursor(-1); } };

  return (
    <div ref={boxRef} style={{position:"relative",width:200}} onBlur={handleBlur}>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <span style={{position:"absolute",left:8,fontSize:11,color:"#A09070",pointerEvents:"none"}}>🔍</span>
        <input
          value={displayVal}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={()=>setOpen(true)}
          onKeyDown={handleKey}
          placeholder="曲名・作曲家を検索…"
          autoComplete="off"
          style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",
            padding:"4px 24px 4px 26px",fontFamily:SANS,fontSize:12,borderRadius:4,
            width:"100%",boxSizing:"border-box",outline:"none"}}
        />
        {displayVal && (
          <span onClick={handleClear} style={{position:"absolute",right:7,fontSize:12,color:"#B0A080",cursor:"pointer",userSelect:"none"}}>×</span>
        )}
      </div>
      {open && candidates.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1.5px solid #D4A574",
          borderRadius:6,zIndex:200,boxShadow:"0 4px 16px rgba(0,0,0,0.13)",maxHeight:280,overflowY:"auto",marginTop:2}}>
          {candidates.map((item,i) => {
            const isActive = i===cursor;
            if (item.type==="composer") return (
              <div key={i} tabIndex={-1} onClick={()=>selectItem(item)} onMouseEnter={()=>setCursor(i)}
                style={{padding:"7px 12px",cursor:"pointer",fontSize:12,color:"#2A2010",
                  background:isActive?"#FDF5ED":"white",display:"flex",alignItems:"center",gap:8,
                  borderBottom:"1px solid #F0EAE0",fontFamily:SANS}}>
                <span style={{fontSize:10,color:"#A09070",background:"#F0EAE0",padding:"1px 6px",borderRadius:8}}>作曲家</span>
                <span style={{fontWeight:500}}>{item.label}</span>
              </div>
            );
            const p = item.piece; const era = ERAS[p.era]||ERAS.modern;
            return (
              <div key={i} tabIndex={-1} onClick={()=>selectItem(item)} onMouseEnter={()=>setCursor(i)}
                style={{padding:"7px 12px",cursor:"pointer",background:isActive?"#FDF5ED":"white",
                  display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #F0EAE0"}}>
                <div style={{width:3,height:30,background:era.color,borderRadius:2,flexShrink:0}} />
                <div>
                  <div style={{fontSize:12,color:"#2A2010"}}>{p.title}</div>
                  <div style={{fontSize:10,color:"#8A7050",fontFamily:SANS}}>{p.composer}　{p.year}年</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// ── AddPieceForm — fully self-contained, no App state dependency ──────────────
const AddPieceForm = ({ onAdd, onCancel }) => {
  const [piece, setPiece]                     = useState(EMPTY_PIECE);
  const [composerSuggestions, setComposerSuggestions] = useState([]);
  const [composerLocked, setComposerLocked]   = useState(false);
  const [suggestions, setSuggestions]         = useState([]);
  const [sugLoading, setSugLoading]           = useState(false);
  const [durationEdited, setDurationEdited]   = useState(false);
  const sugTimer = useRef(null);

  const onComposerChange = (val) => {
    setPiece(p=>({...p, composer:val, title:""}));
    setComposerLocked(false); setSuggestions([]); setComposerSuggestions([]);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (!val.trim()) return;
    sugTimer.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:`「${val}」で始まるまたは含むクラシックピアノ作曲家を6名挙げてください。JSONのみ:{"composers":["名前1","名前2","名前3","名前4","名前5","名前6"]}`}]})});
        const data = await res.json();
        const text = data.content.map(b=>b.text||"").join("");
        setComposerSuggestions(JSON.parse(text.replace(/```json|```/g,"").trim()).composers||[]);
      } catch(e){ console.error(e); }
      setSugLoading(false);
    }, 400);
  };

  const selectComposer = (name) => {
    setPiece(p=>({...p, composer:name, title:""}));
    setComposerSuggestions([]); setComposerLocked(true);
  };

  const onTitleChange = (val) => {
    setPiece(p=>({...p, title:val})); setSuggestions([]);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (!val.trim()) return;
    sugTimer.current = setTimeout(async () => {
      setSugLoading(true);
      try {
        const composerStr = piece.composer ? "作曲家: "+piece.composer+"の" : "";
        const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`${composerStr}クラシックピアノ曲で「${val}」を含む曲を最大6曲挙げてください。JSONのみ:{"pieces":[{"title":"正式な曲名","composer":"作曲家名","year":作曲年数値,"country":"出身国","key":"調性（日本語）","duration":標準的な演奏時間分数数値,"difficulty":難易度1-5数値,"era":"baroque/classical/romantic/modern/contemporary"}]}`}]})});
        const data = await res.json();
        const text = data.content.map(b=>b.text||"").join("");
        setSuggestions(JSON.parse(text.replace(/```json|```/g,"").trim()).pieces||[]);
      } catch(e){ console.error(e); }
      setSugLoading(false);
    }, 500);
  };

  const selectSuggestion = (s) => {
    setPiece(p=>({...p, ...s, yearText: String(s.year||""), frequency: s.frequency ?? 3}));
    setDurationEdited(false); setSuggestions([]);
  };

  const handleAdd = () => {
    if (!piece.title || !piece.composer) return;
    // yearText → year の変換（不明・範囲対応）
    let yearNum = piece.year;
    const yt = (piece.yearText||"").trim();
    if (yt === "不明") yearNum = 0;
    else if (/^\d{4}-\d{4}$/.test(yt)) yearNum = parseInt(yt.split("-")[0]);
    else if (/^\d{4}$/.test(yt)) yearNum = parseInt(yt);
    onAdd({...piece, year:yearNum, yearText: yt||String(yearNum)});
    setPiece(EMPTY_PIECE); setComposerSuggestions([]); setSuggestions([]);
    setComposerLocked(false); setDurationEdited(false);
  };

  const inp2 = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel2 = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  return (
    <div style={{background:"#FDFAF6",border:"2px solid #D4A574",borderRadius:10,padding:22}}>
      <div style={{fontSize:15,letterSpacing:3,color:"#6A5030",marginBottom:16,fontFamily:SANS,fontWeight:600}}>Add Piece</div>

      {/* 1列目: 作曲家・曲名 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:11,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>作曲家</div>
          <div style={{position:"relative"}}>
            <input value={piece.composer} onChange={e=>onComposerChange(e.target.value)}
              placeholder="作曲家名を入力…" autoComplete="off"
              style={{...inp2(), borderColor:composerLocked?"#C4A870":"#D8D0C0", background:composerLocked?"#FDFAF2":"white"}} />
            {composerLocked && <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#C4A870"}}>✓</span>}
            {composerSuggestions.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1.5px solid #D4A574",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                {composerSuggestions.map((name,i)=>(
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectComposer(name)}
                    style={{padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#2A2010",borderBottom:"1px solid #F0EAE0",fontFamily:SANS}}
                    onMouseEnter={e=>e.currentTarget.style.background="#FDF5ED"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>{name}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>曲名</div>
          <div style={{position:"relative"}}>
            <input value={piece.title} onChange={e=>onTitleChange(e.target.value)}
              placeholder={piece.composer?piece.composer+"の曲を検索…":"曲名を入力…"}
              autoComplete="off" style={{...inp2(), opacity:piece.composer?1:0.5}} />
            {sugLoading && <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#8A7050",fontFamily:SANS}}>検索中…</div>}
            {suggestions.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1.5px solid #D4A574",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",maxHeight:300,overflowY:"auto"}}>
                {suggestions.map((s,i)=>{ const era=ERAS[s.era]||ERAS.modern; return (
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectSuggestion(s)}
                    style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #F0EAE0",display:"flex",alignItems:"center",gap:10}}
                    onMouseEnter={e=>e.currentTarget.style.background="#FDF5ED"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <div style={{width:3,height:34,background:era.color,borderRadius:2,flexShrink:0}} />
                    <div>
                      <div style={{fontSize:13,color:"#2A2010",marginBottom:2}}>{s.title}</div>
                      <div style={{fontSize:11,color:"#8A7050",fontFamily:SANS}}>{s.composer}　{s.year}年　{s.key}　{s.duration}分</div>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2列目: 国・作曲年・調性・演奏時間 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <div>
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>国</div>
          <select value={piece.country} onChange={e=>setPiece({...piece,country:e.target.value})} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div>
          {/* 作曲年: 不明・範囲・通常 */}
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>作曲年</div>
          <input value={piece.yearText||String(piece.year)}
            onChange={e=>setPiece({...piece, yearText:e.target.value})}
            placeholder="例: 1810 / 1815-1820 / 不明"
            style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
        </div>
        <div>
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>調性</div>
          <select value={piece.key} onChange={e=>setPiece({...piece,key:e.target.value})} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}>{KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
        </div>
        <div>
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>
            演奏時間
            {!durationEdited && piece.title && <span style={{fontSize:9,color:"#C8A030",background:"#FFF8E0",padding:"0 4px",borderRadius:3,marginLeft:4}}>※</span>}
          </div>
          <div style={{position:"relative"}}>
            <input
              defaultValue={(piece.duration||0)+"分"+(piece.durationSecs>0?(piece.durationSecs+"秒"):"")}
              key={piece.title}
              onFocus={e=>e.target.select()}
              onBlur={e=>{
                const raw=e.target.value.trim();
                const colonMatch=raw.match(/^(\d+):(\d+)$/);
                const mMatch=raw.match(/(\d+)\s*分/);
                const sMatch=raw.match(/(\d+)\s*秒/);
                let m=piece.duration, s=0;
                if(colonMatch){
                  m=parseInt(colonMatch[1]); s=parseInt(colonMatch[2]);
                }else if(mMatch||sMatch){
                  if(mMatch) m=parseInt(mMatch[1]);
                  if(sMatch) s=parseInt(sMatch[1]);
                }else{
                  const n=parseInt(raw); if(!isNaN(n)) m=n;
                }
                setPiece({...piece,duration:m,durationSecs:s});
                setDurationEdited(true);
                e.target.value=m+"分"+(s>0?(s+"秒"):"");
              }}
              placeholder="例: 5分30秒 / 5:30 / 5"
              style={{background:"white",border:"1px solid "+(!durationEdited&&piece.title?"#C8A030":"#D8D0C0"),color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}
            />
          </div>
        </div>
      </div>

      {/* 3列目: 難易度・演奏頻度・キーワード 1行横並び */}
      <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:24,flexWrap:"wrap"}}>
        {[
          ["difficulty","難易度","#C8963C"],
          ["frequency", "演奏頻度","#5B7FA6"],
        ].map(([field,label,dotColor])=>(
          <div key={field} style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:11,color:"#6A5030",fontFamily:SANS,flexShrink:0}}>{label}</span>
            <div style={{display:"flex",gap:0,letterSpacing:0}}>
              {/* ⑧ 0=未設定、クリックでトグル */}
              {[1,2,3,4,5].map(n=>(
                <span key={n} onClick={()=>setPiece({...piece,[field]:piece[field]===n?0:n})}
                  style={{width:14,height:14,borderRadius:"50%",
                    background:piece[field]>0&&piece[field]>=n?dotColor:"transparent",
                    border:"1.5px solid "+(piece[field]>0?dotColor:"#D8D0C0"),
                    cursor:"pointer",display:"inline-block",
                    marginRight:3}}>
                </span>
              ))}
            </div>
          </div>
        ))}
        {/* ⑨ キーワード候補タグ + 自由入力 */}
        <div style={{flex:1,minWidth:120}}>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
            {["明るい","暗い","重い","軽い","激しい","穏やか","切ない","力強い","繊細","華やか","発表会","コンクール","入試","アンコール","その他"].map(tag=>(
              <button key={tag} type="button"
                onClick={()=>setPiece({...piece,keywords:piece.keywords?(piece.keywords.includes(tag)?piece.keywords:piece.keywords+", "+tag):tag})}
                style={{background:(piece.keywords||"").includes(tag)?"#2A2010":"white",
                  border:"1px solid "+((piece.keywords||"").includes(tag)?"#2A2010":"#D8D0C0"),
                  color:(piece.keywords||"").includes(tag)?"#C8A860":"#8A7050",
                  padding:"2px 7px",cursor:"pointer",fontSize:9,fontFamily:SANS,borderRadius:10,lineHeight:1.4}}>
                {tag}
              </button>
            ))}
          </div>
          <input value={piece.keywords||""} onChange={e=>setPiece({...piece,keywords:e.target.value})}
            placeholder="自由入力（カンマ区切り）"
            style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
        </div>
      </div>

      <div style={{display:"flex",gap:24,justifyContent:"center",paddingTop:8,paddingBottom:4}}>
        <button onClick={handleAdd} style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"8px 22px",cursor:"pointer",fontSize:11,letterSpacing:2,fontFamily:SANS,borderRadius:4}}>追加する</button>
        <button onClick={onCancel} style={{background:"white",border:"1px solid #D8D0C0",color:"#8A7050",padding:"8px 16px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>キャンセル</button>
      </div>
    </div>
  );
};


// ── PORTFOLIO PAGE ────────────────────────────────────────────────────────────
const NAV  = [["manage","Library"],["home","Program"],["events","Events"],["print","Portfolio"]];

const NOTATION_STYLES = {
  ja:     { label:"日本語（標準）",   example:"バラード 第1番 ト短調 Op.23" },
  ja_op:  { label:"日本語（Op.先）",  example:"バラード Op.23 No.1 ト短調" },
  en:     { label:"English",          example:"Ballade No.1 in G minor, Op.23" },
  formal: { label:"曲名のみ",         example:"バラード 第1番" },
};

const PrintPage = (props) => {
  const {prog, allPool, programs, pieces} = props;
  const {activeProgramId, setActiveProgramId} = props;
  const {profile, setProfile, events} = props;
  const {portfolioTab, setPortfolioTab} = props;
  const {addListItem, updateListItem, removeListItem} = props;
  const {handlePhoto, photoInputRef} = props;

  // ── Output state ──
  const [outFormat, setOutFormat]   = React.useState("single");  // "single"|"bio"
  const [outItems,  setOutItems]    = React.useState({
    profile:false, repertoire:false, program:false,
    contests:false, performances:false, upcoming:false
  });
  const [outRepIds, setOutRepIds]   = React.useState([]);
  const [outText,   setOutText]     = React.useState("");
  const [outLang,   setOutLang]     = React.useState("ja");

  // ── Derived from events ──
  const today = new Date().toISOString().slice(0,10);
  const pastEvents   = events.filter(e=>e.date<=today).sort((a,b)=>b.date.localeCompare(a.date));
  const futureEvents = events.filter(e=>e.date>today).sort((a,b)=>a.date.localeCompare(b.date));
  const contestEvents = pastEvents.filter(e=>e.type==="contest");
  const concertEvents = pastEvents.filter(e=>e.type!=="contest");

  // ── Helpers ──
  const inpS = {background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const lblS = {fontSize:10,color:"#6A5030",marginBottom:4,fontFamily:SANS};
  const secTitle = (t) => (
    <div style={{fontSize:11,letterSpacing:3,color:"#8A7050",fontFamily:SANS,marginBottom:10,marginTop:20,borderBottom:"1px solid #E8E0D0",paddingBottom:4}}>{t}</div>
  );
  const addBtn = (label,onClick) => (
    <button onClick={onClick} style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginTop:6}}>
      ＋ {label}
    </button>
  );

  // ── Generate output text ──
  const generateOutput = () => {
    const p = profile;
    const name = outLang==="ja" ? (p.nameJa||p.nameEn||"") : (p.nameEn||p.nameJa||"");
    const parts = [];

    if (outItems.personal && name) {
      if (outLang==="ja") {
        parts.push(name + (p.birthDate?"（"+p.birthDate+"生まれ）":"") + (p.nationality&&p.nationality!=="ー"?"、"+p.nationality+"出身":"") + "。");
      } else {
        parts.push(name + (p.birthDate?", born "+p.birthDate:"") + (p.nationality&&p.nationality!=="ー"?", "+p.nationality:"") + ".");
      }
    }
    if (outItems.education) {
      const edu = (p.educations||[]).map(e=>e.school+(e.degree?" "+e.degree:"")+(e.year?" ("+e.year+")":"")).join(outLang==="ja"?"、":", ");
      const teach = (p.teachers||[]).map(t=>t.name+(t.role?" ("+t.role+")":"")).join(outLang==="ja"?"、":", ");
      if (edu) parts.push(outLang==="ja"?"【学歴】"+edu+"。":"[Education] "+edu+".");
      if (teach) parts.push(outLang==="ja"?"【師事】"+teach+"に師事。":"[Study] Studied with "+teach+".");
    }
    if (outItems.contests && contestEvents.length>0) {
      const ct = contestEvents.map(e=>(e.date.slice(0,4)+"年 "+(e.title||e.venue||"")+(e.notes?" "+e.notes:"")).trim()).join(outLang==="ja"?"。\n":".\n");
      parts.push(outLang==="ja"?"【コンクール歴】\n"+ct+"。":"[Competitions]\n"+ct+".");
    }
    if (outItems.performances && concertEvents.length>0) {
      const pf = concertEvents.slice(0,10).map(e=>(e.date.slice(0,4)+"年 "+(e.title||e.venue||"")).trim()).join(outLang==="ja"?"。\n":".\n");
      parts.push(outLang==="ja"?"【演奏活動】\n"+pf+"。":"[Performances]\n"+pf+".");
    }
    if (outItems.upcoming && futureEvents.length>0) {
      const up = futureEvents.map(e=>(e.date+" "+(e.title||e.venue||"")).trim()).join(outLang==="ja"?"。\n":".\n");
      parts.push(outLang==="ja"?"【今後の予定】\n"+up+"。":"[Upcoming]\n"+up+".");
    }
    if (outItems.repertoire && pieces.length>0) {
      const rep = pieces.slice(0,20).map(p=>p.composer+" / "+p.title).join(outLang==="ja"?"、":", ");
      parts.push(outLang==="ja"?"【レパートリー】"+rep:"[Repertoire] "+rep);
    }
    if (outItems.program) {
      const pgm = prog.pieceIds.map((id,i)=>{const p=allPool.find(x=>x.id===id);return p?(i+1)+". "+p.composer+" / "+p.title:"";}).filter(Boolean).join("\n");
      parts.push(outLang==="ja"?"【プログラム】\n"+pgm:"[Program]\n"+pgm);
    }

    setOutText(parts.join("\n\n"));
    setOutStep(4);
  };

  const COUNTRIES = ["ー","日本","ドイツ","オーストリア","フランス","イタリア","ロシア","ポーランド","ハンガリー","チェコ","スペイン","イギリス","アメリカ","アルゼンチン","ブラジル","中国","韓国","その他"];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Inner tabs */}
      <div style={{background:"#EDE8DC",borderBottom:"2px solid #D8D0C0",padding:"0 24px",display:"flex",gap:0,flexShrink:0}}>
        {[["profile","Profile"],["output","Output"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPortfolioTab(k)}
            style={{background:"none",border:"none",
              borderBottom:portfolioTab===k?"3px solid #8B5E3C":"3px solid transparent",
              color:portfolioTab===k?"#2A2010":"#8A7050",
              padding:"10px 22px",cursor:"pointer",fontSize:13,
              fontFamily:"'Cormorant Garamond',serif",letterSpacing:1,
              fontWeight:portfolioTab===k?600:400}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {portfolioTab==="profile" && (
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>
          <div style={{maxWidth:720,margin:"0 auto"}}>

            {/* 写真 */}
            <div style={{display:"flex",gap:20,alignItems:"flex-start",marginBottom:20}}>
              <div style={{flexShrink:0}}>
                <div onClick={()=>photoInputRef.current?.click()}
                  style={{width:80,height:80,borderRadius:"50%",border:"2px dashed #C8B890",
                    background:profile.photoUrl?"transparent":"#F8F4EE",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {profile.photoUrl
                    ? <img src={profile.photoUrl} alt="photo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <span style={{fontSize:24,color:"#C8B890"}}>👤</span>}
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                <div style={{fontSize:9,color:"#A09070",textAlign:"center",marginTop:3,fontFamily:SANS}}>変更</div>
              </div>
              <div style={{flex:1}}/>
            </div>

            {/* ① 各項目を1行ずつ・左揃え・ボックスサイズ統一 */}
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                ["氏名（日本語）", <input value={profile.nameJa} onChange={e=>setProfile(p=>({...p,nameJa:e.target.value}))} placeholder="ー" style={{...inpS,flex:1}}/>],
                ["氏名（英語）",   <input value={profile.nameEn} onChange={e=>setProfile(p=>({...p,nameEn:e.target.value}))} placeholder="ー" style={{...inpS,flex:1}}/>],
                ["生年月日",       <input type="date" value={profile.birthDate} onChange={e=>setProfile(p=>({...p,birthDate:e.target.value}))} style={{...inpS,flex:1}}/>],
                ["国籍",           <select value={profile.nationality} onChange={e=>setProfile(p=>({...p,nationality:e.target.value}))} style={{...inpS,flex:1}}>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select>],
                ["住所",           <input value={profile.city||""} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} placeholder="東京都" style={{...inpS,flex:1}}/>],
                ["メール",         <input value={profile.contact.email} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,email:e.target.value}}))} placeholder="email@example.com" style={{...inpS,flex:1}}/>],
                ["電話",           <input value={profile.contact.tel||""} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,tel:e.target.value}}))} placeholder="090-0000-0000" style={{...inpS,flex:1}}/>],
                ["SNS",            <input value={profile.contact.sns} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,sns:e.target.value}}))} placeholder="@username" style={{...inpS,flex:1}}/>],
              ].map(([label, input])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:0,marginBottom:8}}>
                  <div style={{fontSize:11,color:"#6A5030",fontFamily:SANS,width:130,flexShrink:0}}>{label}</div>
                  {input}
                </div>
              ))}
            </div>

            {/* 学歴（＋追加） */}
            {secTitle("学歴")}
            {(profile.educations||[]).map(ed=>(
              <div key={ed.id} style={{display:"flex",alignItems:"center",gap:0,marginBottom:8}}>
                <div style={{fontSize:11,color:"#6A5030",fontFamily:SANS,width:130,flexShrink:0}}>学歴</div>
                <input value={ed.school} onChange={e=>updateListItem("educations",ed.id,{school:e.target.value})} placeholder="学校名・学部" style={{...inpS,flex:2}}/>
                <input value={ed.degree} onChange={e=>updateListItem("educations",ed.id,{degree:e.target.value})} placeholder="学位" style={{...inpS,flex:1,marginLeft:6}}/>
                <input value={ed.year} onChange={e=>updateListItem("educations",ed.id,{year:e.target.value})} placeholder="年" style={{...inpS,width:56,marginLeft:6}}/>
                <button onClick={()=>removeListItem("educations",ed.id)} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:16,flexShrink:0,marginLeft:4}}>×</button>
              </div>
            ))}
            {addBtn("学歴を追加",()=>addListItem("educations",{school:"",degree:"",year:""}))}

            {/* 師事者（＋追加） */}
            {secTitle("師事者")}
            {(profile.teachers||[]).map(t=>(
              <div key={t.id} style={{display:"flex",alignItems:"center",gap:0,marginBottom:8}}>
                <div style={{fontSize:11,color:"#6A5030",fontFamily:SANS,width:130,flexShrink:0}}>師事者</div>
                <input value={t.name} onChange={e=>updateListItem("teachers",t.id,{name:e.target.value})} placeholder="先生のお名前" style={{...inpS,flex:2}}/>
                <input value={t.role} onChange={e=>updateListItem("teachers",t.id,{role:e.target.value})} placeholder="ピアノ/声楽など" style={{...inpS,flex:1,marginLeft:6}}/>
                <button onClick={()=>removeListItem("teachers",t.id)} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:16,flexShrink:0,marginLeft:4}}>×</button>
              </div>
            ))}
            {addBtn("師事者を追加",()=>addListItem("teachers",{name:"",role:""}))}

          </div>
        </div>
      )}

      {/* ── OUTPUT ── */}
      {portfolioTab==="output" && (
        <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>

            {/* ⑤ 全ステップを1ページに */}

            {/* STEP1: 出力形式 */}
            <div style={{background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS,marginBottom:10}}>STEP 1　出力形式</div>
              <div style={{display:"flex",gap:10}}>
                {[["single","1項目ずつ出力"],["bio","経歴としてまとめて出力"]].map(([v,l])=>(
                  <label key={v} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",
                    background:outFormat===v?"#2A2010":"white",
                    border:"1.5px solid "+(outFormat===v?"#2A2010":"#D8D0C0"),
                    borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:SANS,
                    color:outFormat===v?"#C8A860":"#6A5030"}}>
                    <input type="radio" value={v} checked={outFormat===v} onChange={()=>setOutFormat(v)} style={{accentColor:"#8B5E3C"}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* STEP2: 出力項目 ⑥ */}
            <div style={{background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS,marginBottom:10}}>STEP 2　出力項目</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  ["profile","プロフィール（Profileから）"],
                  ["repertoire","レパートリー（Repertoireから）"],
                  ["program","プログラム（Programから）"],
                  ["contests","コンクール歴（Historyから）"],
                  ["performances","演奏活動（Historyから）"],
                  ["upcoming","現在の活動（Upcomingから）"],
                ].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                    background:outItems[k]?"#F5F0E6":"white",
                    border:"1px solid "+(outItems[k]?"#C8B080":"#E8E0D0"),
                    borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:SANS,color:"#2A2010"}}>
                    <input type="checkbox" checked={outItems[k]||false}
                      onChange={e=>setOutItems(prev=>({...prev,[k]:e.target.checked}))}
                      style={{accentColor:"#8B5E3C"}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* STEP3: レパートリー選択 ⑦ */}
            {outItems.repertoire && (
              <div style={{background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS}}>STEP 3　レパートリー選択</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setOutRepIds(pieces.map(p=>p.id))}
                      style={{background:"none",border:"1px solid #D8D0C0",color:"#6A5030",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>
                      すべて選択
                    </button>
                    <button onClick={()=>setOutRepIds([])}
                      style={{background:"none",border:"1px solid #D8D0C0",color:"#6A5030",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>
                      すべて解除
                    </button>
                  </div>
                </div>
                <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                  {pieces.map(p=>{
                    const era=ERAS[p.era]||ERAS.modern;
                    const checked=outRepIds.includes(p.id);
                    return (
                      <label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",
                        background:checked?"#F5F0E6":"white",borderRadius:4,cursor:"pointer",
                        border:"1px solid "+(checked?"#C8B080":"#E8E0D0"),fontSize:12,fontFamily:SANS,color:"#2A2010"}}>
                        <input type="checkbox" checked={checked}
                          onChange={e=>setOutRepIds(prev=>e.target.checked?[...prev,p.id]:prev.filter(x=>x!==p.id))}
                          style={{accentColor:"#8B5E3C"}}/>
                        <span style={{fontSize:9,color:era.color,flexShrink:0}}>●</span>
                        <span style={{color:"#8A7050",fontSize:10,flexShrink:0}}>{p.composer}</span>
                        <span style={{flex:1}}>{p.title}</span>
                        <span style={{fontSize:10,color:"#A09070"}}>{p.duration}分</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 言語選択 */}
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8}}>
              <span style={{fontSize:11,color:"#8A7050",fontFamily:SANS}}>出力言語：</span>
              {[["ja","日本語"],["en","English"]].map(([v,l])=>(
                <label key={v} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:13,fontFamily:SANS,color:"#2A2010"}}>
                  <input type="radio" value={v} checked={outLang===v} onChange={()=>setOutLang(v)} style={{accentColor:"#8B5E3C"}}/>{l}
                </label>
              ))}
              <button onClick={()=>{
                  // Generate output
                  const p=profile;
                  const name=outLang==="ja"?(p.nameJa||p.nameEn||""):(p.nameEn||p.nameJa||"");
                  const parts=[];
                  if(outItems.profile&&name){
                    parts.push(outLang==="ja"
                      ? name+(p.birthDate?"（"+p.birthDate+"生まれ）":"")+(p.nationality&&p.nationality!=="ー"?"、"+p.nationality+"出身":"")+"。"
                      : name+(p.birthDate?", born "+p.birthDate:"")+(p.nationality&&p.nationality!=="ー"?", "+p.nationality:"")+". "
                        +((p.educations||[]).map(e=>e.school).join(", ")));
                  }
                  if(outItems.repertoire&&outRepIds.length>0){
                    const rep=pieces.filter(p=>outRepIds.includes(p.id)).map(p=>p.composer+" / "+p.title).join(outLang==="ja"?"、":", ");
                    parts.push(outLang==="ja"?"【レパートリー】"+rep:"[Repertoire] "+rep);
                  }
                  if(outItems.contests&&contestEvents.length>0){
                    const ct=contestEvents.map(e=>e.date.slice(0,7)+" "+(e.title||e.venue||"")).join("\u3002\n");
                    parts.push(outLang==="ja"?"【コンクール歴】\n"+ct:"[Competitions]\n"+ct);
                  }
                  if(outItems.performances&&concertEvents.length>0){
                    const pf=concertEvents.slice(0,10).map(e=>e.date.slice(0,7)+" "+(e.title||e.venue||"")).join("\u3002\n");
                    parts.push(outLang==="ja"?"【演奏活動】\n"+pf:"[Performances]\n"+pf);
                  }
                  if(outItems.upcoming&&futureEvents.length>0){
                    const up=futureEvents.map(e=>e.date+" "+(e.title||e.venue||"")).join("\u3002\n");
                    parts.push(outLang==="ja"?"【今後の予定】\n"+up:"[Upcoming]\n"+up);
                  }
                  if(outItems.program){
                    const pgm=prog.pieceIds.map((id,i)=>{const px=allPool.find(x=>x.id===id);return px?(i+1)+". "+px.composer+" / "+px.title:"";}).filter(Boolean).join("\n");
                    parts.push(outLang==="ja"?"【プログラム】\n"+pgm:"[Program]\n"+pgm);
                  }
                  setOutText(parts.join("\n\n"));
                }}
                style={{marginLeft:"auto",background:"#2A2010",border:"none",color:"#C8A860",padding:"7px 20px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                生成する
              </button>
            </div>

            {/* STEP4: 編集（字数カウンター＋コピーアイコン） */}
            <div style={{background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8,padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS}}>STEP 4　編集</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:11,color:"#A09070",fontFamily:SANS}}>{outText.length} 文字</span>
                  {/* ③ コピーアイコン */}
                  <button onClick={()=>navigator.clipboard.writeText(outText).catch(()=>{})}
                    title="コピー"
                    style={{background:"none",border:"1px solid #D8D0C0",color:"#8A7050",padding:"3px 8px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,display:"flex",alignItems:"center",gap:4}}>
                    📋 コピー
                  </button>
                </div>
              </div>
              <textarea value={outText} onChange={e=>setOutText(e.target.value)}
                style={{width:"100%",minHeight:200,background:"white",border:"1px solid #D8D0C0",
                  color:"#2A2010",padding:"10px",fontFamily:SANS,fontSize:13,borderRadius:4,
                  lineHeight:1.8,resize:"vertical",boxSizing:"border-box"}}/>
            </div>

            {/* STEP5: 出力 ④ コピー・PDF・保存 */}
            <div style={{background:"#F8F4EE",border:"1px solid #E8E0D0",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS,marginBottom:10}}>STEP 5　出力</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>navigator.clipboard.writeText(outText).catch(()=>{})}
                  style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"9px 18px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  📋 コピー
                </button>
                <button onClick={()=>{const w=window.open("","_blank");w.document.write("<html><body style='font-family:serif;padding:40px;line-height:1.9;color:#2A2010'>"+outText.replace(/\n/g,"<br>")+"</body></html>");w.document.close();w.print();}}
                  style={{background:"white",border:"1px solid #D8D0C0",color:"#6A5030",padding:"9px 18px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  🖨 PDF
                </button>
                <button onClick={()=>{const a=document.createElement("a");a.href="data:text/plain;charset=utf-8,"+encodeURIComponent(outText);a.download="portfolio.txt";a.click();}}
                  style={{background:"white",border:"1px solid #D8D0C0",color:"#6A5030",padding:"9px 18px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  💾 保存
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// ── HomePage (top-level) ────────────────────────

// ── FilterBar / PieChart / BarChart / ManagePage (top-level) ──────────────
const FilterBar = ({pool, searchQ, setSearchQ, sortBy, setSortBy, sortAsc, setSortAsc, filterMark, setFilterMark, poolFiltered, editMode, setEditMode, sel, SANS}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",flexShrink:0}}>
      <div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
        <SearchBox searchQ={searchQ} setSearchQ={setSearchQ} allPool={pool} />
        <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{...sel(),fontFamily:SANS,fontSize:11,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
            <option value="" disabled>並べ替え</option>
            <option value="year">作曲年</option>
            <option value="duration">演奏時間</option>
            <option value="difficulty">難易度</option>
            <option value="frequency">演奏頻度</option>
          </select>
          <button onClick={()=>setSortAsc(v=>!v)}
            style={{background:"white",border:"1px solid #D8D0C0",color:"#5A4A2A",padding:"0 8px",
              cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:"0 4px 4px 0",
              display:"flex",alignItems:"center"}}>
            {sortAsc?"▲":"▼"}
          </button>
        </div>
        <span style={{flex:1}}/>
  
        <button onClick={()=>setFilterMark(filterMark==="fav"?"all":"fav")}
          title="お気に入りのみ"
          style={{background:"none",border:"none",color:filterMark==="fav"?"#B85C72":"#C8B8C0",
            fontSize:17,cursor:"pointer",padding:"3px 5px",lineHeight:1,
            width:28,height:28,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,lineHeight:1}}>{filterMark==="fav"?"♥":"♡"}</span>
        </button>
        <button onClick={()=>setEditMode(!editMode)}
          title={editMode?"削除モード終了":"削除モード"}
          style={{background:"none",border:"none",color:editMode?"#8A8A8A":"#C8C8C8",
            fontSize:15,cursor:"pointer",padding:"3px 5px",lineHeight:1,fontWeight:editMode?"bold":"normal"}}>
          ➖
        </button>
      </div>

    </div>
  );
};

// ── PieChart (top-level) ────────────────────────────────────────────────────
const PieChart = ({dashData, dashTotal, piecesTotal}) => {
  const angle2=[-90]; // mutable via array
  const cx=70,cy=70,r=54;
  const toXY=(deg,rad=r)=>({x:cx+rad*Math.cos(deg*Math.PI/180),y:cy+rad*Math.sin(deg*Math.PI/180)});
  const slices=dashData.map(d=>{const deg=(d.count/dashTotal)*360;const s=angle2[0];angle2[0]+=deg;return{...d,startDeg:s,deg};});
  return (
    <svg viewBox="0 0 140 140" style={{width:130,height:130,flexShrink:0}}>
      {slices.map((s,i)=>{
        const s1=toXY(s.startDeg),s2=toXY(s.startDeg+s.deg);
        const large=s.deg>180?1:0;
        return <path key={i} d={"M "+cx+" "+cy+" L "+s1.x+" "+s1.y+" A "+r+" "+r+" 0 "+large+" 1 "+s2.x+" "+s2.y+" Z"} fill={s.color} stroke="white" strokeWidth={1.5}/>;
      })}
      <text x={cx} y={cy-5} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#2A2010">{piecesTotal}</text>
      <text x={cx} y={cy+13} textAnchor="middle" fontSize={9} fill="#8A7050" fontFamily={SANS}>曲</text>
    </svg>
  );
};

// ── BarChart (top-level) ────────────────────────────────────────────────────
const BarChart = ({dashData}) => {
  const maxCount=Math.max(...dashData.map(d=>d.count),1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:100,flex:1}}>
      {dashData.map((d,i)=>(
        <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,gap:3}}>
          <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>{d.count}</span>
          <div style={{width:"100%",background:d.color,borderRadius:"3px 3px 0 0",height:Math.max(6,(d.count/maxCount)*80)+"px"}}/>
          <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS,textAlign:"center",lineHeight:1.2}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── ManagePage (top-level) ──────────────────────────────────────────────────
const ManagePage = (props) => {
  const {pieces, setPieces, poolFiltered, showAdd, setShowAdd} = props;
  const {editMode, setEditMode, onAddPiece, toggleFav} = props;
  const {filterMark, setFilterMark, sortBy, setSortBy, sortAsc, setSortAsc} = props;
  const {searchQ, setSearchQ, sel, fmtDuration} = props;
  const {dashData, dashTotal} = props;
  const {dashAxis, setDashAxis, dashChart, setDashChart} = props;
  const {libraryTab, setLibraryTab, poolMode, setPoolMode} = props;
  const {composerFilter, setComposerFilter, titleFilter, setTitleFilter} = props;
  const {eraFilter, setEraFilter, yearMin, setYearMin, yearMax, setYearMax} = props;
  const {durMin, setDurMin, durMax, setDurMax} = props;
  const {diffMin, setDiffMin, diffMax, setDiffMax} = props;
  const {freqMin, setFreqMin, freqMax, setFreqMax, kwFilter, setKwFilter} = props;
  const {aiPieces, setAiPieces, aiLoading, askAI, toggle, canAdd, prog} = props;
  const {learningIds, setLearningIds, expandedId, setExpandedId} = props;
  return (
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* ② Library タブバー */}
    <div style={{background:"#EDE8DC",borderBottom:"2px solid #D8D0C0",padding:"0 20px",display:"flex",alignItems:"stretch",flexShrink:0}}>
      {[["repertoire","Repertoire ✦"],["learning","Learning ✧"]].map(([k,l])=>(
        <button key={k} onClick={()=>setLibraryTab(k)}
          style={{background:"none",border:"none",
            borderBottom:libraryTab===k?"3px solid #8B5E3C":"3px solid transparent",
            color:libraryTab===k?"#2A2010":"#8A7050",
            padding:"10px 20px",cursor:"pointer",fontSize:13,
            fontFamily:"'Cormorant Garamond',serif",letterSpacing:1,
            fontWeight:libraryTab===k?600:400}}>
          {l}
        </button>
      ))}
    </div>

    {/* Learning タブ（プレースホルダー） */}
    {libraryTab==="learning" && (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Search Piece パネル */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",flexShrink:0}}>
          <div style={{fontSize:12,letterSpacing:2,color:"#6A5030",fontFamily:SANS,marginBottom:10,fontWeight:600}}>Search Piece</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            <div>
              <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>作曲家</div>
              <input value={composerFilter} onChange={e=>setComposerFilter(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
            <div>
              <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>曲名</div>
              <input value={titleFilter} onChange={e=>setTitleFilter(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
            <div>
              <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>時代</div>
              <select value={eraFilter} onChange={e=>setEraFilter(e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%"}}>
                <option value="">ー</option>
                {ERA_ORDER.filter(k=>k!=="contemporary").map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>キーワード</div>
              <input value={kwFilter} onChange={e=>setKwFilter(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>作曲年</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={yearMin} onChange={e=>setYearMin(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                <input value={yearMax} onChange={e=>setYearMax(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>演奏時間（分）</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={durMin} onChange={e=>setDurMin(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                <input value={durMax} onChange={e=>setDurMax(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>難易度</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select value={diffMin} onChange={e=>setDiffMin(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                <select value={diffMax} onChange={e=>setDiffMax(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>演奏頻度</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select value={freqMin} onChange={e=>setFreqMin(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                <select value={freqMax} onChange={e=>setFreqMax(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
                      <div style={{display:"flex",gap:16,marginTop:16,marginBottom:16,justifyContent:"center"}}>
            <button onClick={()=>{ setAiPieces([]); if(poolMode!=="ai") setPoolMode("ai"); askAI(); }}
              disabled={aiLoading}
              style={{flex:"0 0 30%",padding:"12px 6px",
                background:poolMode==="ai"?"#2A2010":"white",
                border:"2px solid "+(poolMode==="ai"?"#2A2010":"#C8B890"),
                color:poolMode==="ai"?"#C8A860":"#8A7050",
                cursor:aiLoading?"wait":"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600}}>
              {aiLoading?"…":"New from Database"}
            </button>
          </div>
        </div>
        {/* 結果一覧 */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 12px 8px"}}>
          {poolMode!=="ai" && aiPieces.length===0 && (
            <div style={{textAlign:"center",color:"#B0A080",padding:"32px 12px",fontSize:12,lineHeight:2,fontFamily:SANS}}>
              「New from Database」で追加した曲はLearningリストに保存されます
            </div>
          )}
          {aiLoading && (
            <div style={{textAlign:"center",color:"#8A7050",padding:"24px",fontSize:12,fontFamily:SANS}}>✧ 検索中…</div>
          )}
          {aiPieces
            .filter(p=>!composerFilter||p.composer.includes(composerFilter))
            .filter(p=>!titleFilter||p.title.includes(titleFilter))
            .filter(p=>!eraFilter||p.era===eraFilter)
            .filter(p=>!kwFilter||(p.keywords||"").includes(kwFilter))
            .map(p=>{
              const era=ERAS[p.era]||ERAS.modern;
              const inProg=prog.pieceIds.includes(p.id);
              return (
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",marginBottom:4,
                  background:"white",border:"1px solid #E8E0D0",borderLeft:"3px solid "+era.color,borderRadius:5}}>
                  <span style={{fontSize:11,color:"#A0A0A8",flexShrink:0}}>✧</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:"#2A2010",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</div>
                    <div style={{fontSize:10,color:"#8A7050",fontFamily:SANS}}>{p.composer} / {p.key} / {p.duration}分</div>
                  </div>
                  {/* ③ 昇格ボタン */}
                  <button onClick={()=>{
                      if(window.confirm(p.title+" をRepertoireに昇格しますか？（✦になります）")){
                        setPieces(ps=>ps.map(x=>x.id===p.id?{...x,candidate:false,fav:true}:x));
                        setLearningIds(prev=>prev.filter(x=>x!==p.id));
                      }
                    }}
                    title="Repertoireに昇格（✦）"
                    style={{background:"none",border:"1px solid #C8963C",color:"#C8963C",
                      width:20,height:20,borderRadius:"50%",cursor:"pointer",fontSize:10,
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    ✦
                  </button>
                  <button onClick={()=>{
                      if(!learningIds.includes(p.id)){
                        setLearningIds(prev=>[...prev,p.id]);
                        setPieces(ps=>ps.map(x=>x.id===p.id?{...x,candidate:true}:x));
                      }
                      toggle(p.id);
                    }}
                    disabled={inProg}
                    style={{background:inProg?"#EDE8DC":"#2A2010",border:"none",color:inProg?"#B0A080":"#E8D090",
                      width:22,height:22,borderRadius:"50%",cursor:inProg?"not-allowed":"pointer",
                      fontSize:15,lineHeight:"22px",textAlign:"center",flexShrink:0}}>
                    {inProg?"✓":"+"}
                  </button>
                </div>
              );
            })
          }
        </div>
      </div>
    )}


    {/* Repertoire タブ */}
    {libraryTab==="repertoire" && (
    <div style={{flex:1,overflowY:"auto"}}>
    <div style={{maxWidth:960,margin:"0 auto",padding:"20px 28px"}}>

      {/* ① Dashboard セクション */}
      <div style={{background:"white",border:"1px solid #E8E0D0",borderRadius:10,padding:"18px 20px",marginBottom:20}}>
        {/* 総レパートリー数 + グラフ切り替えボタン */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span style={{fontSize:36,fontWeight:700,color:"#2A2010",fontFamily:FONT,lineHeight:1}}>{pieces.length}</span>
            <span style={{fontSize:13,color:"#8A7050",fontFamily:SANS}}>曲</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {/* 軸切り替え */}
            {[["era","時代別"],["difficulty","難易度別"],["frequency","演奏頻度別"]].map(([k,l])=>(
              <button key={k} onClick={()=>setDashAxis(k)}
                style={{background:dashAxis===k?"#2A2010":"white",border:"1px solid "+(dashAxis===k?"#2A2010":"#D8D0C0"),color:dashAxis===k?"#C8A860":"#6A5030",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                {l}
              </button>
            ))}
            <div style={{width:1,height:16,background:"#D8D0C0",margin:"0 2px"}}/>
            {/* グラフ種別 */}
            {[["pie","●"],["bar","▬"]].map(([k,icon])=>(
              <button key={k} onClick={()=>setDashChart(k)}
                style={{background:dashChart===k?"#2A2010":"white",border:"1px solid "+(dashChart===k?"#2A2010":"#D8D0C0"),color:dashChart===k?"#C8A860":"#6A5030",padding:"4px 9px",cursor:"pointer",fontSize:13,borderRadius:4}}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* グラフ + 凡例 */}
        <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
          {dashChart==="pie" ? <PieChart dashData={dashData} dashTotal={dashTotal} piecesTotal={pieces.length}/> : <BarChart dashData={dashData}/>}
          <div style={{display:"flex",flexDirection:"column",gap:5,flex:1}}>
            {dashData.map((d,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:9,height:9,borderRadius:"50%",background:d.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:"#2A2010",fontFamily:SANS,flex:1}}>{d.label}</span>
                <span style={{fontSize:11,color:"#8A7050",fontFamily:SANS}}>{d.count}曲</span>
                <span style={{fontSize:10,color:"#B0A080",fontFamily:SANS,width:32,textAlign:"right"}}>{Math.round(d.count/dashTotal*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ② ボタン行 — 右端に寄せる */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20,marginTop:8}}>
        <button onClick={()=>{ setShowAdd(!showAdd); setEditMode(false); }}
          style={{background:"#2A2010",border:"none",color:"#C8A860",
            padding:"10px 24px",cursor:"pointer",fontSize:14,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
          ＋ 曲を追加
        </button>
      </div>

      {/* 曲追加フォーム — 境界線で視覚的に分離 */}
      {showAdd && (
        <div style={{marginBottom:24}}>
          <AddPieceForm onAdd={onAddPiece} onCancel={()=>setShowAdd(false)} />
        </div>
      )}

      {/* 一覧エリア — フォームと分ける境界 */}
      <div style={{background:"#F8F4EE",borderRadius:8,border:"1px solid #E8E0D0",overflow:"hidden"}}>
        <FilterBar pool={pieces} searchQ={searchQ} setSearchQ={setSearchQ} sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc} filterMark={filterMark} setFilterMark={setFilterMark} poolFiltered={poolFiltered} editMode={editMode} setEditMode={setEditMode} sel={sel} SANS={SANS} />
        <div style={{padding:"8px 8px"}}>
          {poolFiltered.map(p => {
            const era = ERAS[p.era]||ERAS.modern;
            return (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",
                background:"white",border:"1.5px solid #E8E0D0",borderLeft:"4px solid "+era.color,
                borderRadius:6,marginBottom:4}}>

                <div style={{flex:1,minWidth:0}}>
                  {/* 上段: 作曲家 + 曲名 — 大きめ */}
                  <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:2,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"#8A7050",fontFamily:SANS,flexShrink:0}}>{p.composer}</span>
                    <span style={{fontSize:14,color:"#2A2010",fontWeight:600,fontFamily:FONT}}>
                      {p.mine ? <span style={{fontSize:10,color:"#8A8080",marginRight:3}} title="自分で追加">✏️</span> : null}{p.title}
                    </span>
                  </div>
                  {/* 下段: バロック / 1722年 / ハ長調 / 4分 / 🔴🔴🔴◯◯ / 🟡🟡🟡🟡🟡 */}
                  <div style={{fontSize:11,color:"#8A7050",display:"flex",gap:0,flexWrap:"wrap",fontFamily:SANS,alignItems:"center"}}>
                    {[
                      era.label,
                      (p.yearText||p.year)+"年",
                      p.key,
                      fmtDuration(p.duration, p.durationSecs),
                      <span key="diff" style={{display:"inline-flex",gap:0}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{width:10,height:10,borderRadius:"50%",background:n<=p.difficulty?"#C8963C":"transparent",border:"1.5px solid #C8963C",display:"inline-block",marginRight:2}}></span>))}</span>,
                      <span key="freq" style={{display:"inline-flex",gap:0}}>{[1,2,3,4,5].map(n=>(<span key={n} style={{width:10,height:10,borderRadius:"50%",background:n<=(p.frequency||0)?"#5B7FA6":"transparent",border:"1.5px solid #5B7FA6",display:"inline-block",marginRight:2}}></span>))}</span>,
                    ].map((item,i)=>(
                      <span key={i} style={{display:"flex",alignItems:"center"}}>
                        {i>0 && <span style={{margin:"0 4px",color:"#D8D0C0"}}>/</span>}
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 右端: 🤍 + 削除 */}
                <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                  <button onClick={()=>toggleFav(p.id)}
                    title={p.fav?"お気に入り解除":"お気に入りに追加"}
                    style={{background:"none",border:"none",
                      color:p.fav?"#B85C72":"#C8B8C0",
                      fontSize:17,cursor:"pointer",padding:"2px 2px",lineHeight:1}}>
                    <span style={{fontSize:16,lineHeight:1}}>{p.fav?"♥":"♡"}</span>
                  </button>
                  {editMode && (
                    <button onClick={()=>setPieces(ps=>ps.filter(x=>x.id!==p.id))}
                      style={{background:"#8A8A8A",border:"none",color:"white",width:20,height:20,
                        borderRadius:"50%",cursor:"pointer",fontSize:12,flexShrink:0,
                        display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>－</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
    )}
  </div>
);
};


// ── EventsPage (top-level) ──────────────────────

// ── EventsPage (top-level) ──────────────────────────────────────────────────



// ── EventsPage (top-level) ──────────────────────────────────────────────────
const EventsPage = ({events, setEvents, FONT, SANS, toggle, onDragEnd, prog}) => {
  const EVENT_TYPES = {
    recital: {label:"発表会",    color:"#C8963C"},
    contest: {label:"コンクール", color:"#5B7FA6"},
    concert: {label:"コンサート", color:"#B85C72"},
    other:   {label:"その他",    color:"#8A8A8A"},
  };
  // ① 凡例データ
  const LEGEND = [
    {color:"#C8963C", label:"発表会"},
    {color:"#5B7FA6", label:"コンクール"},
    {color:"#B85C72", label:"コンサート"},
    {color:"#8A8A8A", label:"その他"},
  ];
  const EMPTY_EVENT = {
    date:"", type:"recital", title:"", organizer:"", venue:"",
    openTime:"", startTime:"", contact:"",
    items:[], notes:"", videoUrl:"", posterUrl:"",
  };

  const [evSearch, setEvSearch]        = useState("");
  const [evTypeFilter, setEvTypeFilter] = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [newEvent, setNewEvent]       = useState(EMPTY_EVENT);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dragItemId, setDragItemId]   = useState(null);
  const [dragOverId, setDragOverId]   = useState(null);
  const posterRef  = useRef(null);
  const today      = new Date().toISOString().slice(0,10);
  const filteredEvents = events
    .filter(e=>!evTypeFilter||e.type===evTypeFilter)
    .filter(e=>!evSearch||(e.title||"").includes(evSearch)||(e.venue||"").includes(evSearch)||(e.notes||"").includes(evSearch));
  const filteredPast   = filteredEvents.filter(e=>e.date<=today).sort((a,b)=>b.date.localeCompare(a.date));
  const filteredFuture = filteredEvents.filter(e=>e.date>today).sort((a,b)=>a.date.localeCompare(b.date));
  const past   = events.filter(e=>e.date <= today).sort((a,b)=>b.date.localeCompare(a.date));
  const future = events.filter(e=>e.date >  today).sort((a,b)=>a.date.localeCompare(b.date));

  // ── Form helpers ──
  const openAdd = () => { setNewEvent(EMPTY_EVENT); setEditingId(null); setShowForm(true); setSelectedEvent(null); };
  const openEdit = (ev) => { setNewEvent({...ev}); setEditingId(ev.id); setShowForm(true); setSelectedEvent(null); };

  const saveEvent = () => {
    if (!newEvent.date) return;
    if (editingId) {
      setEvents(prev=>prev.map(e=>e.id===editingId?{...newEvent,id:editingId}:e).sort((a,b)=>a.date.localeCompare(b.date)));
    } else {
      setEvents(prev=>[...prev,{...newEvent,id:Date.now()}].sort((a,b)=>a.date.localeCompare(b.date)));
    }
    setShowForm(false); setEditingId(null); setNewEvent(EMPTY_EVENT);
  };

  const deleteEvent = (id) => {
    if (!window.confirm("このイベントを削除しますか？")) return;
    setEvents(prev=>prev.filter(e=>e.id!==id)); setSelectedEvent(null);
  };

  const addItem = (kind="piece") =>
    setNewEvent(ev=>({...ev,items:[...ev.items,{id:Date.now(),kind,performer:"",pieceTitle:"",duration:""}]}));
  const updateItem = (id,patch) =>
    setNewEvent(ev=>({...ev,items:ev.items.map(it=>it.id===id?{...it,...patch}:it)}));
  const removeItem = (id) =>
    setNewEvent(ev=>({...ev,items:ev.items.filter(it=>it.id!==id)}));
  const onItemDragEnd = () => {
    if (dragItemId==null||dragOverId==null||dragItemId===dragOverId) { setDragItemId(null); setDragOverId(null); return; }
    setNewEvent(ev=>{
      const arr=[...ev.items];
      const from=arr.findIndex(x=>x.id===dragItemId), to=arr.findIndex(x=>x.id===dragOverId);
      arr.splice(from,1); arr.splice(to,0,ev.items[from]);
      return {...ev,items:arr};
    });
    setDragItemId(null); setDragOverId(null);
  };
  const handlePoster = (e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev2=>setNewEvent(ev=>({...ev,posterUrl:ev2.target.result}));
    reader.readAsDataURL(file);
  };

  const inpE={background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const selE={background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%"};
  const secLbl=(t)=>(<div style={{fontSize:10,color:"#8A7050",letterSpacing:2,fontFamily:SANS,marginBottom:6,marginTop:14,borderBottom:"1px solid #F0EAE0",paddingBottom:3}}>{t}</div>);

  // ── Event detail card ──
  const EventDetail = ({ev, compact=false}) => {
    const et = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
    return (
      <div style={{borderTop:"1px solid #F0EAE0",paddingTop:8,fontSize:12,color:"#6A5030",fontFamily:SANS,display:"flex",flexDirection:"column",gap:5}}>
        {ev.organizer && <div><span style={{color:"#A09070"}}>主催：</span>{ev.organizer}</div>}
        {(ev.openTime||ev.startTime) && (
          <div><span style={{color:"#A09070"}}>時間：</span>
            {ev.openTime?"開場 "+ev.openTime:""}
            {ev.openTime&&ev.startTime?" / ":""}
            {ev.startTime?"開演 "+ev.startTime:""}
          </div>
        )}
        {ev.contact && <div><span style={{color:"#A09070"}}>問い合わせ：</span>{ev.contact}</div>}
        {ev.items&&ev.items.length>0 && (
          <div>
            <div style={{color:"#A09070",marginBottom:3}}>曲目：</div>
            {ev.items.map((it,idx)=>(
              <div key={it.id} style={{paddingLeft:8,marginBottom:2,fontSize:11}}>
                {it.kind==="break"
                  ? <span style={{color:"#A09070",fontStyle:"italic"}}>― 休憩 ―</span>
                  : <span>{idx+1}. {it.performer&&<span style={{color:"#8A7050"}}>{it.performer}　</span>}{it.pieceTitle}{it.duration&&<span style={{color:"#A09070"}}>　{it.duration}</span>}</span>
                }
              </div>
            ))}
          </div>
        )}
        {ev.notes && <div><span style={{color:"#A09070"}}>メモ：</span>{ev.notes}</div>}
        {ev.videoUrl && <div><span style={{color:"#A09070"}}>動画：</span><a href={ev.videoUrl} target="_blank" rel="noreferrer" style={{color:"#5B7FA6"}}>{ev.videoUrl}</a></div>}
        {ev.posterUrl && <img src={ev.posterUrl} alt="poster" style={{width:80,height:80,objectFit:"cover",borderRadius:4,border:"1px solid #E8E0D0",alignSelf:"flex-start",marginTop:4}}/>}
        {!compact && (
          <div style={{display:"flex",gap:8,marginTop:4,justifyContent:"flex-end"}}>
            <button onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{background:"none",border:"1px solid #D8D0C0",color:"#6A5030",padding:"2px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>✎ 編集</button>
            <button onClick={e=>{e.stopPropagation();deleteEvent(ev.id);}} style={{background:"none",border:"1px solid #E8C0C0",color:"#C09090",padding:"2px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>削除</button>
          </div>
        )}
      </div>
    );
  };

  // ── Timeline section ──
  const TimelineSection = ({label, evs, defaultOpen=true}) => {
    const [open, setOpen] = useState(defaultOpen);
    if (!evs.length) return null;
    return (
      <div style={{marginBottom:24}}>
        <button onClick={()=>setOpen(v=>!v)}
          style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:6,cursor:"pointer",marginBottom:open?12:0}}>
          <span style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS}}>{label}</span>
          <span style={{fontSize:10,color:"#B0A080",fontFamily:SANS}}>({evs.length}件)</span>
          <span style={{fontSize:11,color:"#C8B890"}}>{open?"▲":"▼"}</span>
        </button>
        {open && (
          <div style={{position:"relative",paddingLeft:36}}>
            <div style={{position:"absolute",left:12,top:0,bottom:0,width:2,background:"#E8E0D0"}}/>
            {evs.map(ev=>{
              const et=EVENT_TYPES[ev.type]||EVENT_TYPES.other;
              const isSelected=selectedEvent===ev.id;
              return (
                <div key={ev.id} style={{position:"relative",marginBottom:14}}>
                  {/* Teardrop marker */}
                  <div onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                    style={{position:"absolute",left:-28,top:2,width:18,height:18,cursor:"pointer",
                      display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:16,height:16,borderRadius:"50% 50% 50% 0",
                      transform:"rotate(-45deg)",background:et.color,
                      border:"2px solid white",boxShadow:"0 2px 5px rgba(0,0,0,0.18)"}}/>
                  </div>
                  {/* Card */}
                  <div onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                    style={{background:"white",border:"1px solid #E8E0D0",borderLeft:"3px solid "+et.color,
                      borderRadius:6,padding:"9px 12px",cursor:"pointer",
                      boxShadow:isSelected?"0 2px 10px rgba(0,0,0,0.08)":"none",
                      transition:"box-shadow 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      
                      <span style={{fontSize:12,color:"#2A2010",fontFamily:FONT,fontWeight:600}}>{ev.date}</span>
                      {ev.title && <span style={{fontSize:12,color:"#2A2010",fontFamily:SANS}}>{ev.title}</span>}
                      {ev.venue && <span style={{fontSize:11,color:"#8A7050",fontFamily:SANS}}>{ev.venue}</span>}
                      <span style={{marginLeft:"auto",fontSize:10,color:"#C8B890"}}>{isSelected?"▲":"▼"}</span>
                    </div>
                    {isSelected && <EventDetail ev={ev}/>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── List view ──
  const ListView = () => (
    <div>
      {events.length===0
        ? <div style={{textAlign:"center",padding:"40px 0",color:"#C0B090",fontSize:13,fontFamily:SANS,border:"2px dashed #E0D8C8",borderRadius:8}}>イベントがまだ登録されていません</div>
        : events.map(ev=>{
          const et=EVENT_TYPES[ev.type]||EVENT_TYPES.other;
          const isSelected=selectedEvent===ev.id;
          return (
            <div key={ev.id} style={{background:"white",border:"1px solid #E8E0D0",borderLeft:"4px solid "+et.color,borderRadius:6,marginBottom:6,overflow:"hidden"}}>
              <div onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:et.color,flexShrink:0}}></div>
                <span style={{fontSize:12,color:"#8A7050",fontFamily:SANS,flexShrink:0}}>{ev.date}</span>
                <span style={{fontSize:13,color:"#2A2010",fontFamily:SANS,flex:1,fontWeight:500}}>{ev.title||"（無題）"}</span>
                {ev.venue && <span style={{fontSize:11,color:"#A09070",fontFamily:SANS}}>{ev.venue}</span>}
                <span style={{fontSize:11,color:"#C8B890"}}>{isSelected?"▲":"▼"}</span>
              </div>
              {isSelected && (
                <div style={{padding:"0 14px 12px"}}>
                  <EventDetail ev={ev}/>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
      <div style={{maxWidth:820,margin:"0 auto"}}>

        {/* Top bar ④ 1行目：追加ボタン */}
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
          <button onClick={openAdd}
            style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"9px 20px",
              cursor:"pointer",fontSize:13,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
            ＋ イベントを追加
          </button>
        </div>
        {/* ⑤ 2行目：検索・フィルター */}
        <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
          <input
            value={evSearch} onChange={e=>setEvSearch(e.target.value)}
            placeholder="キーワードで検索"
            style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 10px",fontFamily:SANS,fontSize:12,borderRadius:4,width:160}}
          />
          <select value={evTypeFilter} onChange={e=>setEvTypeFilter(e.target.value)}
            style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 8px",fontFamily:SANS,fontSize:12,borderRadius:4}}>
            <option value="">すべての種別</option>
            {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div style={{background:"#FDFAF6",border:"2px solid #D4A574",borderRadius:8,padding:18,marginBottom:20}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#6A5030",marginBottom:14,fontFamily:SANS,fontWeight:600}}>
              {editingId ? "✎ イベントを編集" : "Add Event"}
            </div>

            {/* ① 日付・種別・内容・場所 を1行に */}
            <div style={{display:"grid",gridTemplateColumns:"120px auto 1fr 1fr",gap:8,marginBottom:12,alignItems:"end"}}>
              <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>日付</div><input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{...inpE,fontSize:11,padding:"4px 6px"}}/></div>
              <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>種別</div>
                <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={{...inpE,width:"auto",fontSize:11,padding:"4px 6px"}}>
                  <option value="">ー</option>
                  {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>内容</div><input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="公演タイトル" style={inpE}/></div>
              <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>場所</div><input value={newEvent.venue} onChange={e=>setNewEvent({...newEvent,venue:e.target.value})} placeholder="会場名" style={inpE}/></div>
            </div>

            {/* ②③ 詳細を追加 — トグルボタン、常に表示、openAddしても状態維持 */}
            <div style={{marginBottom:8}}>
              <button onClick={()=>setNewEvent(ev=>({...ev,showDetail:!ev.showDetail}))}
                style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"4px 14px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginBottom:newEvent.showDetail?8:0}}>
                {newEvent.showDetail ? "▲ 詳細を閉じる" : "＋ 詳細を追加"}
              </button>
              {newEvent.showDetail && (
                <div style={{background:"#F8F4EE",borderRadius:6,padding:"10px 12px"}}>
                  {/* ④ 備考を詳細の中に移動 */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>共演者</div><input value={newEvent.performers||""} onChange={e=>setNewEvent({...newEvent,performers:e.target.value})} placeholder="共演者・伴奏者" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>主催</div><input value={newEvent.organizer} onChange={e=>setNewEvent({...newEvent,organizer:e.target.value})} placeholder="主催者名" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>開演</div><input value={newEvent.startTime} onChange={e=>setNewEvent({...newEvent,startTime:e.target.value})} placeholder="14:00" style={inpE}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6A5030",marginBottom:3,fontFamily:SANS}}>備考</div>
                    <textarea value={newEvent.notes} onChange={e=>setNewEvent({...newEvent,notes:e.target.value})}
                      placeholder="備考" style={{...inpE,minHeight:48,resize:"vertical"}}/>
                  </div>
                </div>
              )}
            </div>

            {/* ⑧ プログラム */}
            <div style={{marginTop:16,marginBottom:8}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS,marginBottom:8}}>プログラム</div>
              {newEvent.items.map((it,idx)=>(
                <div key={it.id} draggable
                  onDragStart={()=>setDragItemId(it.id)}
                  onDragEnter={()=>setDragOverId(it.id)}
                  onDragEnd={onItemDragEnd}
                  onDragOver={e=>e.preventDefault()}
                  style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,
                    background:dragOverId===it.id?"#FDF5ED":"white",
                    border:"1px solid #E8E0D0",borderRadius:4,padding:"5px 7px",cursor:"grab"}}>
                  <span style={{color:"#C8B890",fontSize:12,flexShrink:0}}>⣿</span>
                  <span style={{fontSize:10,color:"#A09070",fontFamily:SANS,flexShrink:0,width:18,textAlign:"right"}}>{idx+1}</span>
                  {/* ⑥ 作曲・曲目・時間・演奏者 の順に */}
                  <input value={it.composer||""} onChange={e=>updateItem(it.id,{composer:e.target.value})} placeholder="作曲" style={{...inpE,flex:"0 0 90px"}}/>
                  <input value={it.pieceTitle} onChange={e=>updateItem(it.id,{pieceTitle:e.target.value})} placeholder="曲目" style={{...inpE,flex:1}}/>
                  <input value={it.duration} onChange={e=>updateItem(it.id,{duration:e.target.value})} placeholder="時間" style={{...inpE,flex:"0 0 48px"}}/>
                  <input value={it.performer} onChange={e=>updateItem(it.id,{performer:e.target.value})} placeholder="演奏者" style={{...inpE,flex:"0 0 100px"}}/>
                  <button onClick={()=>removeItem(it.id)} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,padding:"0 2px",flexShrink:0}}>×</button>
                </div>
              ))}
              {/* ⑤ 休憩ボタン削除 */}
              <button onClick={()=>addItem("piece")} style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>＋ 曲を追加</button>
            </div>

            <div style={{marginTop:16,marginBottom:14}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#8A7050",fontFamily:SANS,marginBottom:8}}>Archive</div>
              {(newEvent.archives||[]).map((arc,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                  <input value={arc.title} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],title:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="タイトル" style={{...inpE,flex:1}}/>
                  <input value={arc.url} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],url:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="URL" style={{...inpE,flex:2}}/>
                  <button onClick={()=>{const a=(newEvent.archives||[]).filter((_,j)=>j!==i);setNewEvent({...newEvent,archives:a});}} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,flexShrink:0}}>×</button>
                </div>
              ))}
              <button onClick={()=>setNewEvent({...newEvent,archives:[...(newEvent.archives||[]),{title:"",url:""}]})}
                style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                ＋ リンクを追加
              </button>
            </div>

            {/* ⑦ 追加・キャンセルボタン前後の行間を広げる */}
            <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:20,paddingTop:16,borderTop:"1px solid #F0EAE0"}}>
              <button onClick={saveEvent} style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"9px 28px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,letterSpacing:1}}>
                {editingId ? "更新する" : "追加する"}
              </button>
              <button onClick={()=>{setShowForm(false);setEditingId(null);setNewEvent(EMPTY_EVENT);}} style={{background:"white",border:"1px solid #D8D0C0",color:"#8A7050",padding:"9px 18px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>キャンセル</button>
            </div>
          </div>
        )}

        {/* Content — タイムラインのみ表示 */}
        {filteredEvents.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"#C0B090",fontSize:13,fontFamily:SANS,border:"2px dashed #E0D8C8",borderRadius:8}}>
            {events.length===0 ? "「＋ イベントを追加」からコンサートや発表会を記録しましょう" : "該当するイベントがありません"}
          </div>
        ) : (
          <>
            {/* 凡例 */}
            <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
              {LEGEND.map(l=>(
                <div key={l.color} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:12,height:12,borderRadius:"50% 50% 50% 0",transform:"rotate(-45deg)",background:l.color,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"#6A5030",fontFamily:SANS}}>{l.label}</span>
                </div>
              ))}
            </div>
            {filteredFuture.length>0 && <TimelineSection label="UPCOMING" evs={filteredFuture} defaultOpen={true}/>}
            {filteredPast.length>0 && <TimelineSection label="HISTORY" evs={filteredPast} defaultOpen={filteredFuture.length===0}/>}
          </>
        )}

      </div>
    </div>
  );
};

// ── ManagePage helpers ──
// Dashboard data helpers



// ── HomePage (top-level) ────────────────────────────────────────────────────

// ── HomePage (top-level) ────────────────────────

const HomePage = (props) => {
  const {prog, updateProg, programs, activeProgramId, setActiveProgramId} = props;
  const {editingProgramId, setEditingProgramId, editingName, setEditingName} = props;
  const {setPrograms, addProgram, deleteProgram} = props;
  const {programPieces, totalDuration, remaining} = props;
  const {toggle, toggleFav, toggleCandidate, dragId, dragOver, onDragEnd} = props;
  const {poolMode, setPoolMode} = props;
  const {composerFilter, setComposerFilter, titleFilter, setTitleFilter} = props;
  const {eraFilter, setEraFilter, yearMin, setYearMin, yearMax, setYearMax} = props;
  const {durMin, setDurMin, durMax, setDurMax} = props;
  const {diffMin, setDiffMin, diffMax, setDiffMax} = props;
  const {freqMin, setFreqMin, freqMax, setFreqMax} = props;
  const {kwFilter, setKwFilter, showFavOnly, setShowFavOnly} = props;
  const {localSortBy, setLocalSortBy, localSortAsc, setLocalSortAsc} = props;
  const {learningIds, setLearningIds, pieces, setPieces} = props;
  const {canAdd, aiPieces, aiLoading, askAI} = props;
  const {allPool, sortBy, setSortBy, sortAsc, setSortAsc, filterMark, setFilterMark, sel} = props;
  // ── Local state for detail filter ──
  // filter states moved to App

  // ── Filtered pool ──
  const filterPieces = (pool) => pool
    .filter(p => !composerFilter || p.composer.includes(composerFilter))
    .filter(p => !titleFilter    || p.title.includes(titleFilter))
    .filter(p => !eraFilter      || p.era===eraFilter)
    .filter(p => !yearMin        || (p.year||0) >= +yearMin)
    .filter(p => !yearMax        || (p.year||0) <= +yearMax)
    .filter(p => !durMin         || p.duration >= +durMin)
    .filter(p => !durMax         || p.duration <= +durMax)
    .filter(p => p.difficulty >= diffMin && p.difficulty <= diffMax)
    .filter(p => (p.frequency||0) >= freqMin && (p.frequency||0) <= freqMax)
    .filter(p => !kwFilter       || (p.keywords||"").includes(kwFilter))
    .filter(p => !showFavOnly    || p.candidate);

  const sortPool = (pool) => {
    if (!localSortBy) return pool;
    return [...pool].sort((a,b)=>{
      let d=0;
      if      (localSortBy==="year")       d=(a.year||0)-(b.year||0);
      else if (localSortBy==="duration")   d=a.duration-b.duration;
      else if (localSortBy==="difficulty") d=a.difficulty-b.difficulty;
      else if (localSortBy==="frequency")  d=(a.frequency||0)-(b.frequency||0);
      else if (localSortBy==="rarity")     d=(a.rarity||0)-(b.rarity||0);
      else if (localSortBy==="era")        d=ERA_ORDER.indexOf(a.era)-ERA_ORDER.indexOf(b.era);
      return localSortAsc?d:-d;
    });
  };

  const myPool  = sortPool(filterPieces(pieces));
  const aiPool  = sortPool(filterPieces(aiPieces.filter(a=>!pieces.find(p=>p.id===a.id))));
  const showMy  = poolMode==="repertoire"||poolMode==="both";
  const showAI  = poolMode==="ai"||poolMode==="both";

  const inp2 = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"4px 7px",fontFamily:SANS,fontSize:11,borderRadius:4,boxSizing:"border-box",...ex});
  const sel2 = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"4px 6px",fontFamily:SANS,fontSize:11,borderRadius:4,...ex});

  // ── Program Piece Card (compact) ──
  const ProgPieceCard = ({p, isAI=false}) => {
    const era = ERAS[p.era]||ERAS.modern;
    const inProg = prog.pieceIds.includes(p.id);
    return (
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",marginBottom:4,
        background:inProg?"#F5F0E6":"white",
        border:"1px solid "+(inProg?era.color+"66":"#E8E0D0"),
        borderLeft:"3px solid "+era.color,
        borderRadius:5,opacity:inProg?0.65:1,transition:"opacity 0.15s"}}>
        {/* ⑤ ✧無色 → クリックで✦ゴールド（MY only） */}
        <span
          onClick={e=>{ if(!isAI){ e.stopPropagation(); toggleCandidate(p.id); }}}
          title={isAI?"AI提案":(p.candidate?"お気に入り解除":"お気に入りに追加")}
          style={{fontSize:12,color:isAI?"#B0B0B8":p.candidate?"#C8963C":"#C8C0B0",
            flexShrink:0,fontWeight:"bold",cursor:isAI?"default":"pointer",
            transition:"color 0.15s"}}>
          {isAI?"✧":p.candidate?"✦":"✧"}
        </span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:"#2A2010",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>

            {p.title}
          </div>
          <div style={{fontSize:10,color:"#8A7050",fontFamily:SANS}}>{p.composer} / {p.key} / {p.duration}分</div>
        </div>
        {inProg
          ? <button onClick={()=>toggle(p.id)}
              style={{background:"#FFF0EE",border:"1px solid #E8C0B0",color:"#A04030",width:20,height:20,borderRadius:"50%",cursor:"pointer",fontSize:11,flexShrink:0}}>×</button>
          : <button onClick={()=>toggle(p.id)} disabled={!canAdd(p)}
              style={{background:canAdd(p)?"#2A2010":"#EDE8DC",border:"none",color:canAdd(p)?"#E8D090":"#B0A080",width:20,height:20,borderRadius:"50%",cursor:canAdd(p)?"pointer":"not-allowed",fontSize:15,lineHeight:"20px",textAlign:"center",flexShrink:0}}>+</button>
        }
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>

      {/* Program tabs row */}
      <div style={{background:"#EDE8DC",borderBottom:"2px solid #D8D0C0",padding:"0 16px",display:"flex",alignItems:"center",gap:0,flexShrink:0,overflowX:"auto"}}>
        {programs.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",borderBottom:p.id===activeProgramId?"3px solid #8B5E3C":"3px solid transparent",padding:"7px 0",marginRight:2}}>
            {editingProgramId===p.id
              ? <input value={editingName} onChange={e=>setEditingName(e.target.value)}
                  onBlur={()=>{updateProg({name:editingName});setEditingProgramId(null);}}
                  onKeyDown={e=>{if(e.key==="Enter"){setPrograms(ps=>ps.map(x=>x.id===p.id?{...x,name:editingName}:x));setEditingProgramId(null);}}}
                  autoFocus style={{background:"white",border:"1px solid #C8A860",color:"#2A2010",padding:"2px 7px",fontSize:11,fontFamily:SANS,borderRadius:3,width:120}} />
              : <button onClick={()=>setActiveProgramId(p.id)}
                  onDoubleClick={()=>{setEditingProgramId(p.id);setEditingName(p.name);}}
                  style={{background:"none",border:"none",color:p.id===activeProgramId?"#2A2010":"#8A7050",cursor:"pointer",fontSize:12,fontFamily:SANS,padding:"0 10px",whiteSpace:"nowrap"}}>
                  {p.name}
                </button>
            }
            {programs.length>1 && <button onClick={()=>deleteProgram(p.id)} style={{background:"none",border:"none",color:"#C0A080",cursor:"pointer",fontSize:12,padding:"0 3px"}}>×</button>}
          </div>
        ))}
        <button onClick={addProgram} style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",cursor:"pointer",fontSize:11,fontFamily:SANS,padding:"3px 10px",borderRadius:4,marginLeft:6,whiteSpace:"nowrap",flexShrink:0}}>＋ 新規</button>
      </div>

      {/* 2-column main area */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── LEFT: 設定 + タイムライン ── */}
        <div style={{width:"38%",minWidth:260,borderRight:"2px solid #D8D0C0",display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* 左上: プログラム設定 */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid #E8E0D0",background:"#F0EBE0",flexShrink:0}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#8A7050",fontFamily:SANS,marginBottom:8}}>プログラム設定</div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>合計</span>
                <input type="number" min={1} value={prog.maxDuration} onChange={e=>updateProg({maxDuration:Math.max(1,+e.target.value)})}
                  style={{width:44,background:"white",border:"1px solid #C8B890",color:"#2A2010",fontSize:12,fontFamily:FONT,textAlign:"center",padding:"3px 4px",borderRadius:4}} />
                <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>分</span>
              </div>
              <div style={{width:1,height:16,background:"#D8D0C0"}}/>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>曲数</span>
                <select value={prog.maxPieces===999?"unlimited":String(prog.maxPieces)} onChange={e=>updateProg({maxPieces:e.target.value==="unlimited"?999:Math.max(0,+e.target.value)})}
                  style={{background:"white",border:"1px solid #C8B890",color:"#2A2010",fontSize:11,fontFamily:SANS,padding:"3px 5px",borderRadius:4}}>
                  <option value="unlimited">制限なし</option>
                  {[...Array(21)].map((_,i)=><option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{width:1,height:16,background:"#D8D0C0"}}/>
              <button style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:4}}>
                ＋ 曲間を追加
              </button>
            </div>
          </div>

          {/* 左下: タイムライン */}
          <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
            <div style={{fontSize:12,letterSpacing:2,color:"#2A2010",fontFamily:SANS,fontWeight:700,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Program</span>
              <button onClick={()=>{
                const newFromDB = programPieces.filter(p=>learningIds.includes(p.id));
                const isOver = remaining < 0;
                let msg = "プログラムを確定しますか？";
                if(newFromDB.length>0) msg += "\n（Databaseからの曲"+newFromDB.length+"曲がLearningに追加されます）";
                if(isOver) msg += "\n⚠️ 時間が"+Math.abs(remaining)+"分超過しています";
                if(window.confirm(msg)) alert("プログラムを確定しました！");
              }}
                style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"4px 12px",
                  cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:4,fontWeight:600}}>
                確定
              </button>
              <span style={{fontSize:12,color:remaining<0?"#B03020":remaining<=5?"#A07020":"#2A6A3A",fontWeight:"bold",letterSpacing:0}}>
                {(()=>{const m=Math.floor(totalDuration);const s=Math.round((totalDuration-m)*60);return m+"分"+(s>0?s+"秒":"");})()}  / {prog.maxDuration}分
                <span style={{fontSize:10,fontWeight:"normal",color:remaining<0?"#B03020":"#8A7050",fontFamily:SANS}}>
                  {remaining>0?" 残り"+remaining+"分":remaining===0?" ちょうど":" "+Math.abs(remaining)+"分超過"}
                </span>
              </span>
            </div>
            {/* Progress bar */}
            <div style={{height:4,background:"#D8D0C0",borderRadius:2,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:Math.min((totalDuration/prog.maxDuration)*100,100)+"%",
                background:remaining<0?"#C04030":remaining<=5?"#C09030":"#3A8A4A",borderRadius:2,transition:"width 0.4s"}}/>
            </div>
            {/* Stacked bar */}
            {programPieces.length>0 && (
              <div style={{display:"flex",gap:1,height:20,borderRadius:3,overflow:"hidden",marginBottom:10,border:"1px solid #D8D0C0"}}>
                {programPieces.map(p=>{ const era=ERAS[p.era]||ERAS.modern; return (
                  <div key={p.id} style={{width:((p.duration/prog.maxDuration)*100)+"%",background:era.color,minWidth:2,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"rgba(255,255,255,0.8)"}}>{p.duration}m</div>
                ); })}
                {remaining>0&&<div style={{flex:1,background:"#EDE8DC"}}/>}
              </div>
            )}
            {/* Piece list with interval tabs */}
            {programPieces.length===0
              ? <div style={{textAlign:"center",color:"#B0A080",padding:"30px 12px",border:"2px dashed #D8D0C0",borderRadius:8,fontSize:12,lineHeight:2,fontFamily:SANS}}>右の一覧から曲を追加</div>
              : programPieces.map((p,i)=>{ const era=ERAS[p.era]||ERAS.modern;
                // ①② 曲間タブ（2曲目以降の前に表示）
                const intervalKey = "interval-"+i;
                const hasInterval = i > 0;
                const intervalSecs = (prog.intervals||{})[intervalKey]||0;
                return (
                  <React.Fragment key={p.id}>
                    {hasInterval && (
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",marginBottom:3,
                        background:"#F5F0E8",border:"1px dashed #D8D0C0",borderRadius:4,fontSize:10,color:"#A09070",fontFamily:SANS}}>
                        <span style={{color:"#C8B890",fontSize:10}}>⏱</span>
                        <span style={{flex:1}}>曲間</span>
                        <input type="number" min={0} max={300}
                          value={intervalSecs}
                          onChange={e=>updateProg({intervals:{...(prog.intervals||{}),[intervalKey]:Math.max(0,+e.target.value)}})}
                          style={{width:36,background:"white",border:"1px solid #D8D0C0",color:"#2A2010",fontSize:10,textAlign:"center",padding:"1px 3px",borderRadius:3}}
                        />
                        <span style={{color:"#A09070"}}>秒</span>
                        <button onClick={()=>{const iv={...(prog.intervals||{})};delete iv[intervalKey];updateProg({intervals:iv});}}
                          style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:11,padding:"0 1px"}}>×</button>
                      </div>
                    )}
                    <div draggable onDragStart={()=>dragId.current=p.id} onDragEnter={()=>dragOver.current=p.id} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",background:"white",
                        border:"1px solid "+era.color+"33",borderLeft:"3px solid "+era.color,
                        borderRadius:5,marginBottom:3,cursor:"grab"}}>
                      <span style={{color:"#C8B890",fontSize:11}}>⠿</span>
                      <div style={{width:18,height:18,borderRadius:"50%",background:era.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"white",flexShrink:0}}>{i+1}</div>
                      {/* ③ Library と同じ表記 */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:1}}>
                          <span style={{fontSize:10,color:"#8A7050",fontFamily:SANS,flexShrink:0}}>{p.composer}</span>
                          <span style={{fontSize:12,color:"#2A2010",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
                        </div>
                        <div style={{fontSize:9,color:"#A09070",fontFamily:SANS,display:"flex",gap:4}}>
                          <span>{era.label}</span>
                          <span>{p.key}</span>
                          <span>{fmtDuration(p.duration,p.durationSecs)}</span>
                        </div>
                      </div>
                      <button onClick={()=>toggle(p.id)} style={{background:"none",border:"none",color:"#C8A0A0",cursor:"pointer",fontSize:13,padding:"0 2px",flexShrink:0}}>×</button>
                    </div>
                  </React.Fragment>
                ); })
            }
          </div>
        </div>

        {/* ── RIGHT: 曲目詳細設定 + 一覧 ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* 右上: 詳細フィルター */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",flexShrink:0}}>
            <div style={{fontSize:12,letterSpacing:2,color:"#6A5030",fontFamily:SANS,marginBottom:10,fontWeight:600}}>Search Piece</div>
            {/* ⑦ Search Piece - labeled fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>作曲家</div>
                <input value={composerFilter} onChange={e=>setComposerFilter(e.target.value)}
                  placeholder="例: ショパン" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
              <div>
                <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>曲名</div>
                <input value={titleFilter} onChange={e=>setTitleFilter(e.target.value)}
                  placeholder="例: ノクターン" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
              <div>
                <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>時代</div>
                <select value={eraFilter} onChange={e=>setEraFilter(e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}>
                  <option value="">ー</option>
                  {ERA_ORDER.filter(k=>k!=="contemporary").map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:9,color:"#8A7050",fontFamily:SANS,marginBottom:2}}>キーワード</div>
                <input value={kwFilter} onChange={e=>setKwFilter(e.target.value)}
                  placeholder="例: 発表会向け" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>作曲年</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={yearMin} onChange={e=>setYearMin(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                  <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                  <input value={yearMax} onChange={e=>setYearMax(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>演奏時間（分）</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={durMin} onChange={e=>setDurMin(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                  <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                  <input value={durMax} onChange={e=>setDurMax(e.target.value)} placeholder="ー" style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>難易度</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <select value={diffMin} onChange={e=>setDiffMin(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                  <select value={diffMax} onChange={e=>setDiffMax(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#8A7050",fontFamily:SANS}}>演奏頻度</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <select value={freqMin} onChange={e=>setFreqMin(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{fontSize:10,color:"#A09070"}}>〜</span>
                  <select value={freqMax} onChange={e=>setFreqMax(+e.target.value)} style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* ⑥ ボタン行 */}
            <div style={{display:"flex",gap:16,marginTop:16,marginBottom:16,justifyContent:"center"}}>
              <button onClick={()=>setPoolMode(m=>m==="repertoire"?"none":m==="ai"?"both":m==="both"?"ai":"repertoire")}
                style={{flex:"0 0 30%",padding:"12px 6px",
                  background:(poolMode==="repertoire"||poolMode==="both")?"#2A2010":"white",
                  border:"2px solid "+((poolMode==="repertoire"||poolMode==="both")?"#2A2010":"#C8B890"),
                  color:(poolMode==="repertoire"||poolMode==="both")?"#C8A860":"#8A7050",
                  cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600,
                  letterSpacing:0.3}}>
                from Repertoire
              </button>
              <button onClick={()=>{ setPoolMode(m=>m==="ai"?"none":m==="repertoire"?"both":m==="both"?"repertoire":"ai"); if(poolMode==="none"||poolMode==="repertoire") askAI(); }}
                disabled={aiLoading}
                style={{flex:"0 0 30%",padding:"12px 6px",
                  background:(poolMode==="ai"||poolMode==="both")?"#2A2010":"white",
                  border:"2px solid "+((poolMode==="ai"||poolMode==="both")?"#2A2010":"#C8B890"),
                  color:(poolMode==="ai"||poolMode==="both")?"#C8A860":"#8A7050",
                  cursor:aiLoading?"wait":"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600,
                  letterSpacing:0.3}}>
                {aiLoading?"…":"New from Database"}
              </button>
            </div>
          </div>

          {/* 右下: 曲目一覧 */}
          <div style={{flex:1,overflowY:"auto",padding:"14px 12px 8px"}}>
            {/* ⑪ 並べ替え右寄せ・小さく */}
            <div style={{display:"flex",gap:4,alignItems:"stretch",marginBottom:8,justifyContent:"flex-end"}}>
              <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
                <select value={localSortBy} onChange={e=>setLocalSortBy(e.target.value)}
                  style={{background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"3px 6px",fontFamily:SANS,fontSize:10,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
                  <option value="" disabled>並べ替え</option>
                  <option value="era">時代</option>
                  <option value="year">作曲年</option>
                  <option value="duration">演奏時間</option>
                  <option value="difficulty">難易度</option>
                  <option value="frequency">演奏頻度</option>
                </select>
                <button onClick={()=>setLocalSortAsc(v=>!v)}
                  style={{background:"white",border:"1px solid #D8D0C0",color:"#5A4A2A",padding:"0 7px",
                    cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:"0 4px 4px 0",
                    display:"flex",alignItems:"center"}}>
                  {localSortAsc?"▲":"▼"}
                </button>
              </div>
              {/* ✦✧ お気に入りフィルター */}
              <button onClick={()=>setShowFavOnly(v=>!v)}
                title="お気に入りのみ"
                style={{background:showFavOnly?"#FFF8E8":"white",
                  border:"1px solid "+(showFavOnly?"#C8963C":"#D8D0C0"),
                  color:showFavOnly?"#C8963C":"#A09070",
                  padding:"4px 9px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,
                  display:"flex",alignItems:"center",gap:2,flexShrink:0}}>
                {showFavOnly?"✦":"✧"} お気に入り
              </button>
            </div>

            {poolMode==="none" && (
              <div style={{textAlign:"center",color:"#B0A080",padding:"32px 12px",fontSize:12,lineHeight:2,fontFamily:SANS}}>
                「New from Database」で追加した曲はLearningリストに保存されます
              </div>
            )}

            {/* MY 一覧 */}
            {showMy && (
              <div style={{marginBottom:showAI&&aiPool.length>0?16:0}}>
                {poolMode==="both" && <div style={{fontSize:9,letterSpacing:2,color:"#C8963C",marginBottom:5,fontFamily:SANS}}>✦ MY REPERTOIRE ({myPool.length}曲)</div>}
                {myPool.length===0
                  ? <div style={{textAlign:"center",color:"#B0A080",padding:"16px",fontSize:11,fontFamily:SANS}}>該当する曲がありません</div>
                  : myPool.map(p=><ProgPieceCard key={p.id} p={p} isAI={false}/>)
                }
              </div>
            )}

            {/* AI 一覧 */}
            {showAI && (
              <div>
                {poolMode==="both" && <div style={{fontSize:9,letterSpacing:2,color:"#8A8AAA",marginBottom:5,fontFamily:SANS}}>✧ AI SUGGESTIONS ({aiPool.length}件)</div>}
                {aiPool.length===0&&!aiLoading && (
                  <div style={{textAlign:"center",color:"#B0A080",padding:"16px",fontSize:11,fontFamily:SANS}}>
                    「New from Database」で追加した曲はLearningリストに保存されます
                  </div>
                )}
                {aiPool.map(p=><ProgPieceCard key={p.id} p={p} isAI={true}/>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};





export default function App() {
  // ── state ──
  const [page, setPage]                       = useState("manage");
  const [pieces, setPieces]                   = useState(SAMPLE_PIECES);
  const [aiPieces, setAiPieces]               = useState([]);
  const [programs, setPrograms]               = useState([{ ...EMPTY_PROGRAM(1), name:"プログラム 1" }]);
  const [activeProgramId, setActiveProgramId] = useState(1);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [editingName, setEditingName]         = useState("");
  const [expandedId, setExpandedId]           = useState(null);
  const [sortBy, setSortBy]                   = useState("year");
  const [sortAsc, setSortAsc]                 = useState(true);
  const [filterEra, setFilterEra]             = useState("");
  const [filterMark, setFilterMark]           = useState("all"); // ④ "all"|"fav"|"candidate"
  const [searchQ, setSearchQ]                 = useState("");
  const [poolMode, setPoolMode]               = useState("none");
  // ── Search/Filter states (shared between Program & Learning) ──
  const [composerFilter, setComposerFilter]   = useState("");
  const [titleFilter,    setTitleFilter]      = useState("");
  const [eraFilter,      setEraFilter]        = useState("");
  const [yearMin,        setYearMin]          = useState("");
  const [yearMax,        setYearMax]          = useState("");
  const [durMin,         setDurMin]           = useState("");
  const [durMax,         setDurMax]           = useState("");
  const [diffMin,        setDiffMin]          = useState(0);
  const [diffMax,        setDiffMax]          = useState(5);
  const [freqMin,        setFreqMin]          = useState(0);
  const [freqMax,        setFreqMax]          = useState(5);
  const [kwFilter,       setKwFilter]         = useState("");
  const [showFavOnly,    setShowFavOnly]      = useState(false);
  const [localSortBy,    setLocalSortBy]      = useState("");
  const [localSortAsc,   setLocalSortAsc]     = useState(true);
  const [compareMode, setCompareMode]         = useState(false); // ③ 比較モード
  const [comparePieces, setComparePieces]     = useState([]); // ③ 比較対象
  const [editMode, setEditMode]               = useState(false); // ⑦ manage page edit mode
  const [aiLoading, setAiLoading]             = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [constraints, setConstraints]         = useState({ requireEras:[] });
  const [libraryTab, setLibraryTab]           = useState("repertoire");
  const [dashAxis, setDashAxis]               = useState("era");
  const [dashChart, setDashChart]             = useState("pie");

  const getDashData = () => {
    if (dashAxis==="era") {
      return ERA_ORDER.map(k=>({label:ERAS[k].label,color:ERAS[k].color,count:pieces.filter(p=>p.era===k).length})).filter(d=>d.count>0);
    }
    if (dashAxis==="difficulty") {
      return [1,2,3,4,5].map(n=>({label:"難易度"+n,color:["#A8D5A2","#7EC8A4","#C8963C","#B85C72","#5B7FA6"][n-1],count:pieces.filter(p=>p.difficulty===n).length})).filter(d=>d.count>0);
    }
    if (dashAxis==="frequency") {
      return [1,2,3,4,5].map(n=>({label:"頻度"+n,color:["#BDD5E5","#7EC8A4","#C8963C","#B85C72","#5B7FA6"][n-1],count:pieces.filter(p=>(p.frequency||0)===n).length})).filter(d=>d.count>0);
    }
    return [];
  };
  const dashData  = getDashData();
  const dashTotal = dashData.reduce((s,d)=>s+d.count,0)||pieces.length;

  // SVG Pie

  // Bar chart
  const [learningIds, setLearningIds]           = useState([]); // ② Learning管理
  const [showAdd, setShowAdd]                 = useState(false);
  const [portfolioTab, setPortfolioTab]        = useState("profile"); // "profile"|"output"
  const [events, setEvents]                    = useState([]);
  const [analysisAxis, setAnalysisAxis]        = useState("era");
  const [chartType, setChartType]              = useState("pie");
  const [profile, setProfile]                  = useState({
    nameJa:"ー", nameEn:"ー", birthDate:"", nationality:"ー",
    photoUrl:"",
    educations:[],   // {id, school, degree, year}
    teachers:[],     // {id, name, role}
    competitions:[],  // {id, name, year, result}
    contact:{email:"", website:"", sns:""},
  });
  const sugTimer  = useRef(null);
  const nextId    = useRef(100);
  const dragId    = useRef(null);
  const dragOver  = useRef(null);

  // ── derived ──
  const prog           = programs.find(p=>p.id===activeProgramId) || programs[0];
  const allPool        = [...pieces, ...aiPieces.filter(a=>!pieces.find(p=>p.id===a.id))];
  const programPieces  = prog.pieceIds.map(id=>allPool.find(p=>p.id===id)).filter(Boolean);
  const totalIntervalSecs = programPieces.length>1
    ? programPieces.slice(1).reduce((sum,_,i)=>{
        const key="interval-"+(i+1);
        const iv=(prog.intervals||{})[key];
        return sum+(iv!=null?iv:0);
      },0)
    : 0;
  const totalDuration  = programPieces.reduce((s,p)=>s+p.duration,0) + Math.round(totalIntervalSecs/60*10)/10;
  const remaining      = prog.maxDuration - totalDuration;

  const updateProg = (u) => setPrograms(ps=>ps.map(p=>p.id===prog.id?{...p,...u}:p));

  const canAdd = (piece) =>
    // ⑤ 時間オーバーでも追加可能（赤アラートのみ）
    (prog.maxPieces>=999 || prog.pieceIds.length < prog.maxPieces) &&
    !prog.pieceIds.includes(piece.id);

  const toggle = (id) => {
    const piece = allPool.find(p=>p.id===id);
    if (!piece) return;
    if (prog.pieceIds.includes(id)) { updateProg({pieceIds:prog.pieceIds.filter(x=>x!==id)}); return; }
    if (canAdd(piece)) updateProg({pieceIds:[...prog.pieceIds,id]});
  };

  const toggleFav       = (id) => setPieces(ps=>ps.map(p=>p.id===id?{...p,fav:!p.fav}:p));
  const toggleCandidate = (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (piece && piece.candidate) {
      // ✧を外す → Learningからも削除確認
      if (learningIds.includes(id)) {
        if (window.confirm("Learningからも削除しますか？")) {
          setLearningIds(prev=>prev.filter(x=>x!==id));
          setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:false}:p));
        }
      } else {
        setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:false}:p));
      }
    } else {
      setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:true}:p));
    }
  };

  const onDragEnd = () => {
    if (dragId.current==null||dragOver.current==null||dragId.current===dragOver.current) return;
    const arr=[...prog.pieceIds];
    const from=arr.indexOf(dragId.current), to=arr.indexOf(dragOver.current);
    arr.splice(from,1); arr.splice(to,0,dragId.current);
    updateProg({pieceIds:arr});
    dragId.current=null; dragOver.current=null;
  };

  const addProgram    = () => { const id=++nextId.current; setPrograms(ps=>[...ps,{...EMPTY_PROGRAM(id),name:`プログラム ${ps.length+1}`}]); setActiveProgramId(id); };
  const deleteProgram = (id) => { if(programs.length<=1)return; setPrograms(ps=>ps.filter(p=>p.id!==id)); if(activeProgramId===id) setActiveProgramId(programs.find(p=>p.id!==id)?.id); };

  const askAI = async () => {
    setAiLoading(true);
    // show ai section automatically
    setPoolMode(m => m==="repertoire" ? "both" : m==="none" ? "ai" : m);
    const prompt = `クラシックピアノのプログラム編成の専門家として、以下の条件で曲を4曲提案してください。
【現在のプログラム: ${prog.name}】
${programPieces.length===0?"（空）":programPieces.map(p=>`- ${p.title}（${p.composer}、${p.year}年）${p.key} ${p.duration}分`).join("\n")}
【条件】
- 残り時間: 約${remaining}分以内
- 残り曲数: ${prog.maxPieces>=999?"制限なし":prog.maxPieces-prog.pieceIds.length+"曲以内"}
${constraints.requireEras.length>0?`- 必須の時代: ${constraints.requireEras.map(e=>ERAS[e]?.label).join("、")}`:""}
JSONのみ返してください:
{"suggestions":[{"title":"曲名","composer":"作曲家","year":作曲年数値,"country":"出身国","key":"調性","duration":分数数値,"form":"形式","difficulty":1-5数値,"era":"baroque/classical/romantic/modern/contemporary","reason":"推薦理由1文"}]}`;
    try {
      const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const text = data.content.map(b=>b.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const newAI = (parsed.suggestions||[]).map((s,i)=>({...s,id:Date.now()+i,readiness:0,mine:false}));
      setAiPieces(prev=>[...prev,...newAI]);
    } catch(e){ console.error(e); }
    setAiLoading(false);
  };

  const photoInputRef = useRef(null);

  // ── helpers for editable lists ──
  const addListItem = (field, empty) =>
    setProfile(p=>({...p,[field]:[...p[field],{id:Date.now(),...empty}]}));
  const updateListItem = (field, id, patch) =>
    setProfile(p=>({...p,[field]:p[field].map(x=>x.id===id?{...x,...patch}:x)}));
  const removeListItem = (field, id) =>
    setProfile(p=>({...p,[field]:p[field].filter(x=>x.id!==id)}));

  const handlePhoto = (e) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev2=>setProfile(p=>({...p,photoUrl:ev2.target.result}));
    reader.readAsDataURL(file);
  };

  // ── Output: generate bio text ──
  const generateBio = (length) => {
    const p = profile;
    const name = p.nameJa || p.nameEn || "（氏名未入力）";
    const edu  = p.educations.map(e=>e.school+(e.degree?" "+e.degree:"")+(e.year?" ("+e.year+")":"")).join("、");
    const teach = p.teachers.map(t=>t.name+(t.role?" ("+t.role+")":"")).join("、");
    const comp  = p.competitions.map(c=>c.name+(c.year?" "+c.year+"年":"")+(c.result?" "+c.result:"")).join("。");

    if (length==="short") {
      return name+"は"+(edu?edu+"を経て、":"")+(teach?""+teach+"に師事。":"")+"現在演奏活動を行っている。";
    }
    if (length==="medium") {
      return name+"。"+(p.birthDate?p.birthDate+"生まれ。":"")+
        (edu?"学歴："+edu+"。":"")+
        (teach?teach+"に師事。":"")+
        (comp?"コンクール等："+comp+"。":"");
    }
    return name+"。"+(p.birthDate?p.birthDate+"生まれ、"+p.nationality+"出身。":"")+
      (edu?"\n\n【学歴】"+edu+"。":"")+
      (teach?"\n\n【師事】"+teach+"。":"")+
      (comp?"\n\n【コンクール歴・入賞歴】"+comp+"。":"")+
      (p.contact.email?"\n\n【連絡先】"+p.contact.email:"");
  };

  // ── Styles ──
  const inpS={background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const lblS={fontSize:10,color:"#6A5030",marginBottom:4,fontFamily:SANS};
  const secTitle=(t)=>( <div style={{fontSize:11,letterSpacing:3,color:"#8A7050",fontFamily:SANS,marginBottom:10,marginTop:20,borderBottom:"1px solid #E8E0D0",paddingBottom:4}}>{t}</div> );
  const addBtn=(label,onClick)=>(
    <button onClick={onClick} style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginTop:6}}>
      ＋ {label}
    </button>
  );


  const printSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const w = window.open("","_blank");
    w.document.write("<html><head><style>body{font-family:serif;padding:40px;color:#2A2010;}h2{letter-spacing:3px;color:#6A5030;}</style></head><body>"+el.innerHTML+"</body></html>");
    w.document.close(); w.print();
  };


    const onAddPiece = (piece) => {
    const era = eraFromYear(piece.year);
    setPieces(p=>[...p,{...piece,era,id:Date.now(),mine:true}]);
    setShowAdd(false);
  };

  // ── filtered/sorted pool ──
  const poolFiltered = pieces
    .filter(p => !filterEra || p.era===filterEra)
    .filter(p => filterMark==="fav" ? p.fav : filterMark==="candidate" ? p.candidate : true)
    .filter(p => searchMatch(p, searchQ))
    .sort((a,b) => {
      let d = 0;
      const ay = a.year||0, by2 = b.year||0;
      if      (sortBy==="year")       { if(!ay && by2) return 1; if(ay && !by2) return -1; d=ay-by2; }
      else if (sortBy==="duration")   d = a.duration - b.duration;
      else if (sortBy==="difficulty") d = a.difficulty - b.difficulty;
      else if (sortBy==="frequency")  d = (a.frequency||0) - (b.frequency||0);
      return sortAsc ? d : -d;
    });

  const aiFiltered     = aiPieces.filter(p => searchMatch(p, searchQ));
  const showRuler      = sortBy==="year" && filterEra==="";
  const inp = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  // ── Shared header (① stable, ② bigger nav) ──────────────────────────────────
  const Header = () => (
    <header style={{background:"#2A2010",display:"flex",alignItems:"stretch",flexShrink:0,height:54}}>
      <div onClick={()=>setPage("manage")}
        style={{cursor:"pointer",userSelect:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          padding:"0 22px 0 24px",borderRight:"1px solid #3A3020",flexShrink:0}}>
        <span style={{fontSize:21,color:"#C8A860",letterSpacing:3,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,lineHeight:1.1}}>𝄞 Repertia</span>
        <span style={{fontSize:8,color:"#7A6840",letterSpacing:4,fontFamily:"'Cormorant Garamond',serif",marginTop:1}}>REPERTIA</span>
      </div>
      {/* ② bigger nav — same height as header, underline indicator */}
      <nav style={{display:"flex",alignItems:"stretch"}}>
        {NAV.map(([p,l]) => (
          <button key={p} onClick={()=>setPage(p)}
            style={{background:"none",border:"none",
              borderBottom: page===p ? "3px solid #C8A860" : "3px solid transparent",
              borderTop:    "3px solid transparent",
              color: page===p ? "#F5F0E8" : "#9A8868",
              padding:"0 24px",cursor:"pointer",
              fontSize:14,letterSpacing:0.3,
              fontFamily:"'Cormorant Garamond',serif",
              fontWeight: page===p ? 600 : 400,
              transition:"color 0.15s"}}>
            {l}
          </button>
        ))}
      </nav>
    </header>
  );

  // ── Filter bar ───────────────────────────────────────────────────────────────

  // ── PieceCardRow (used in both pool and manage list) ─────────────────────────
  const PieceCardRow = ({p, showControls=true}) => {
    const era = ERAS[p.era]||ERAS.modern;
    const inProg = prog.pieceIds.includes(p.id);
    // ⑤ badge
    const badge = p.mine
      ? <span title="自分の曲" style={{fontSize:11,marginRight:3}}>🎹</span>
      : (!p.mine && p.id > 99)
        ? <span title="AI提案" style={{fontSize:10,color:"#5A3A8A",marginRight:3,fontWeight:"bold"}}>✦</span>
        : null;
    return (
      <div style={{background:inProg?"#F5F0E6":"white",border:"1.5px solid "+(inProg?"#C8B890":"#E8E0D0"),
        borderLeft:"4px solid "+era.color,borderRadius:6,marginBottom:5,overflow:"hidden",
        opacity:inProg?0.6:1,transition:"opacity 0.2s"}}>
        <div style={{padding:"9px 12px",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}
          onClick={()=>setExpandedId(expandedId===p.id?null:p.id)}>
          <div style={{flex:1,minWidth:0}}>
            {/* 上段: 作曲家 + 曲名 — 大きめ */}
            <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:2,flexWrap:"wrap"}}>
              <span style={{fontSize:12,color:"#8A7050",fontFamily:SANS,flexShrink:0,fontWeight:500}}>{p.composer}</span>
              <span style={{fontSize:14,color:"#2A2010",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:FONT}}>
                {badge}{p.fav && <span style={{color:"#C03050",fontSize:12,marginRight:2}}>❤️</span>}{p.title}
              </span>
            </div>
            {/* 下段: 詳細 — 小さめ */}
            <div style={{fontSize:10,color:"#A09070",display:"flex",gap:5,flexWrap:"wrap",fontFamily:SANS,alignItems:"center"}}>
              <span style={{background:era.bg,color:era.color,padding:"0 5px",borderRadius:8,border:"1px solid "+era.color+"33"}}>{era.label}</span>
              <span>{(p.yearText==="不明"||(p.year||0)===0)?"作曲年不明":(p.yearText||p.year)+"年"}</span>
              <span>{p.key}</span>
              <span>{p.duration}分</span>
              <DotRating value={p.difficulty} max={5} color="#E05030" />
            </div>
          </div>
          {showControls && (
            <div style={{flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
              {/* ③ 🟡🔵 自分でつけるマーク */}
              <button onClick={e=>{e.stopPropagation();toggleCandidate(p.id);}}
                title="🟡マーク"
                style={{background:"none",border:"none",fontSize:13,cursor:"pointer",padding:"0 1px",lineHeight:1,
                  opacity:p.candidate?1:0.25}}>🟡</button>
              <button onClick={e=>{e.stopPropagation();toggleFav(p.id);}}
                title="🔵マーク"
                style={{background:"none",border:"none",fontSize:13,cursor:"pointer",padding:"0 1px",lineHeight:1,
                  opacity:p.fav?1:0.25}}>🔵</button>
              {/* ③ 比較モード時に「比較に追加」ボタン */}
              {compareMode && (
                <button onClick={e=>{e.stopPropagation();setComparePieces(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id]);}}
                  style={{background:comparePieces.includes(p.id)?"#5B7FA6":"white",
                    border:"1px solid #5B7FA6",color:comparePieces.includes(p.id)?"white":"#5B7FA6",
                    padding:"2px 6px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>
                  {comparePieces.includes(p.id)?"✓":"比較"}
                </button>
              )}
              {inProg
                ? <button onClick={e=>{e.stopPropagation();toggle(p.id);}}
                    style={{background:"#FFF0EE",border:"1px solid #E8C0B0",color:"#A04030",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:13}}>×</button>
                : <button onClick={e=>{e.stopPropagation();toggle(p.id);}} disabled={!canAdd(p)}
                    style={{background:canAdd(p)?"#2A2010":"#EDE8DC",border:"none",color:canAdd(p)?"#E8D090":"#B0A080",width:24,height:24,borderRadius:"50%",cursor:canAdd(p)?"pointer":"not-allowed",fontSize:17,lineHeight:"24px",textAlign:"center"}}>+</button>
              }
              <span style={{color:"#C8B890",fontSize:10}}>{expandedId===p.id?"▲":"▼"}</span>
            </div>
          )}
        </div>
        {expandedId===p.id && (
          <div style={{padding:"8px 12px 12px",borderTop:"1px solid #F0EAE0",background:"#FDFAF6"}}>
            <div style={{display:"flex",gap:18,flexWrap:"wrap",marginBottom:8}}>
              <div><div style={{fontSize:9,color:"#A09070",letterSpacing:2,marginBottom:3,fontFamily:SANS}}>難易度</div><DotRating value={p.difficulty} max={5} color="#E05030" /></div>
              <div><div style={{fontSize:9,color:"#A09070",letterSpacing:2,marginBottom:3,fontFamily:SANS}}>仕上がり</div><span style={{fontSize:12,color:p.readiness>=80?"#2A7A3A":p.readiness>=60?"#8A7020":"#B03020",fontWeight:"bold"}}>{p.readiness}%</span></div>
              <div><div style={{fontSize:9,color:"#A09070",letterSpacing:2,marginBottom:3,fontFamily:SANS}}>形式</div><span style={{fontSize:12,color:"#5A4A2A"}}>{p.form}</span></div>
            </div>
            {p.reason && <div style={{fontSize:12,color:"#6A5030",fontStyle:"italic",lineHeight:1.6,borderTop:"1px solid #F0EAE0",paddingTop:8,marginBottom:8,fontFamily:SANS}}>💡 {p.reason}</div>}
            <div style={{display:"flex",gap:6}}>
              {[
                [`https://ja.wikipedia.org/wiki/${encodeURIComponent(p.composer)}`,"Wikipedia","#2C6B82","#BDD5E5"],
                [`https://imslp.org/wiki/Special:Search/${encodeURIComponent(p.title)}`,"IMSLP","#5A3A8A","#C5B5D5"],
                [`https://www.youtube.com/results?search_query=${encodeURIComponent(p.title+" "+p.composer)}`,"YouTube ▶","#A03020","#E0B0A0"],
              ].map(([href,label,color,border])=>(
                <a key={label} href={href} target="_blank" rel="noreferrer"
                  style={{fontSize:11,color,textDecoration:"none",border:"1px solid "+border,padding:"2px 8px",borderRadius:4,fontFamily:SANS}}>{label}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────
  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────

  // ── SINGLE return ─────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",background:"#F5F0E8",fontFamily:FONT,color:"#2A2010",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <FontLoader />
      <Header />
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {page==="manage" && <ManagePage
          pieces={pieces} setPieces={setPieces} poolFiltered={poolFiltered}
          showAdd={showAdd} setShowAdd={setShowAdd} editMode={editMode} setEditMode={setEditMode}
          onAddPiece={onAddPiece} toggleFav={toggleFav} filterMark={filterMark} setFilterMark={setFilterMark}
          sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc}
          searchQ={searchQ} setSearchQ={setSearchQ} sel={sel} fmtDuration={fmtDuration}
          ERAS={ERAS} ERA_ORDER={ERA_ORDER} SANS={SANS} FONT={FONT}
          dashData={dashData} dashTotal={dashTotal} PieChart={PieChart} BarChart={BarChart}
          dashAxis={dashAxis} setDashAxis={setDashAxis} dashChart={dashChart} setDashChart={setDashChart}
          libraryTab={libraryTab} setLibraryTab={setLibraryTab}
          poolMode={poolMode} setPoolMode={setPoolMode}
          composerFilter={composerFilter} setComposerFilter={setComposerFilter}
          titleFilter={titleFilter} setTitleFilter={setTitleFilter}
          eraFilter={eraFilter} setEraFilter={setEraFilter}
          yearMin={yearMin} setYearMin={setYearMin} yearMax={yearMax} setYearMax={setYearMax}
          durMin={durMin} setDurMin={setDurMin} durMax={durMax} setDurMax={setDurMax}
          diffMin={diffMin} setDiffMin={setDiffMin} diffMax={diffMax} setDiffMax={setDiffMax}
          freqMin={freqMin} setFreqMin={setFreqMin} freqMax={freqMax} setFreqMax={setFreqMax}
          kwFilter={kwFilter} setKwFilter={setKwFilter}
          aiPieces={aiPieces} setAiPieces={setAiPieces} aiLoading={aiLoading} askAI={askAI}
          toggle={toggle} canAdd={canAdd} prog={prog}
          learningIds={learningIds} setLearningIds={setLearningIds}
          expandedId={expandedId} setExpandedId={setExpandedId}
          dashData={getDashData()} dashTotal={getDashData().reduce((s,d)=>s+d.count,0)||pieces.length}
          dashAxis={dashAxis} setDashAxis={setDashAxis}
          dashChart={dashChart} setDashChart={setDashChart}
        />}
        {page==="print"  && <PrintPage prog={prog} allPool={allPool} programs={programs} pieces={pieces} activeProgramId={activeProgramId} setActiveProgramId={setActiveProgramId} profile={profile} setProfile={setProfile} events={events} portfolioTab={portfolioTab} setPortfolioTab={setPortfolioTab} addListItem={addListItem} updateListItem={updateListItem} removeListItem={removeListItem} handlePhoto={handlePhoto} photoInputRef={photoInputRef} generateBio={generateBio} inpS={inpS} lblS={lblS} secTitle={secTitle} addBtn={addBtn} printSection={printSection} />}
        {page==="home" && <HomePage
          prog={prog} updateProg={updateProg}
          programs={programs} activeProgramId={activeProgramId} setActiveProgramId={setActiveProgramId}
          editingProgramId={editingProgramId} setEditingProgramId={setEditingProgramId}
          editingName={editingName} setEditingName={setEditingName}
          setPrograms={setPrograms} addProgram={addProgram} deleteProgram={deleteProgram}
          programPieces={programPieces} totalDuration={totalDuration} remaining={remaining}
          toggle={toggle} toggleFav={toggleFav} toggleCandidate={toggleCandidate}
          dragId={dragId} dragOver={dragOver} onDragEnd={onDragEnd}
          poolMode={poolMode} setPoolMode={setPoolMode}
          composerFilter={composerFilter} setComposerFilter={setComposerFilter}
          titleFilter={titleFilter} setTitleFilter={setTitleFilter}
          eraFilter={eraFilter} setEraFilter={setEraFilter}
          yearMin={yearMin} setYearMin={setYearMin} yearMax={yearMax} setYearMax={setYearMax}
          durMin={durMin} setDurMin={setDurMin} durMax={durMax} setDurMax={setDurMax}
          diffMin={diffMin} setDiffMin={setDiffMin} diffMax={diffMax} setDiffMax={setDiffMax}
          freqMin={freqMin} setFreqMin={setFreqMin} freqMax={freqMax} setFreqMax={setFreqMax}
          kwFilter={kwFilter} setKwFilter={setKwFilter}
          showFavOnly={showFavOnly} setShowFavOnly={setShowFavOnly}
          localSortBy={localSortBy} setLocalSortBy={setLocalSortBy}
          localSortAsc={localSortAsc} setLocalSortAsc={setLocalSortAsc}
          learningIds={learningIds} setLearningIds={setLearningIds}
          pieces={pieces} setPieces={setPieces}
          canAdd={canAdd} aiPieces={aiPieces} aiLoading={aiLoading} askAI={askAI}
          allPool={allPool} sortBy={sortBy} setSortBy={setSortBy}
          sortAsc={sortAsc} setSortAsc={setSortAsc} filterMark={filterMark} setFilterMark={setFilterMark}
          sel={sel}
        />}
        {page==="events" && <EventsPage events={events} setEvents={setEvents} FONT={FONT} SANS={SANS} toggle={toggle} onDragEnd={onDragEnd} prog={prog} />}
      </div>
    </div>
  );
}