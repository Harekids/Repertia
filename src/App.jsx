import { useState, useRef, useEffect } from "react";

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
const KEYS = ["ハ長調","ニ長調","ホ長調","ヘ長調","ト長調","イ長調","ロ長調","変ロ長調","変ホ長調","変イ長調","変ニ長調","嬰ヘ長調","イ短調","ロ短調","ハ短調","ニ短調","ホ短調","ヘ短調","ト短調","嬰ト短調","変ロ短調","嬰ハ短調","嬰ヘ短調","変ホ短調"];
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
  { id:1,  title:"平均律クラヴィーア第1巻 BWV846", composer:"J.S.バッハ",     year:1722, country:"ドイツ",      key:"ハ長調",   duration:4,  readiness:90, difficulty:3, rarity:1, form:"前奏曲", era:"baroque"   },
  { id:2,  title:"フランス組曲 第5番 BWV816",       composer:"J.S.バッハ",     year:1722, country:"ドイツ",      key:"ト長調",   duration:18, readiness:75, difficulty:4, rarity:2, form:"組曲",   era:"baroque"   },
  { id:3,  title:"ピアノソナタ K.331",              composer:"モーツァルト",   year:1783, country:"オーストリア", key:"イ長調",   duration:22, readiness:85, difficulty:3, rarity:1, form:"ソナタ", era:"classical" },
  { id:4,  title:"ピアノソナタ 第8番「悲愴」",      composer:"ベートーヴェン", year:1799, country:"ドイツ",      key:"ハ短調",   duration:20, readiness:70, difficulty:4, rarity:1, form:"ソナタ", era:"classical" },
  { id:5,  title:"バラード 第1番 Op.23",            composer:"ショパン",       year:1835, country:"ポーランド",  key:"ト短調",   duration:10, readiness:60, difficulty:5, rarity:1, form:"バラード",era:"romantic"  },
  { id:6,  title:"夜想曲 Op.9 No.2",               composer:"ショパン",       year:1832, country:"ポーランド",  key:"変ホ長調", duration:5,  readiness:95, difficulty:3, rarity:1, form:"夜想曲", era:"romantic"  },
  { id:7,  title:"愛の夢 第3番",                    composer:"リスト",         year:1850, country:"ハンガリー",  key:"変イ長調", duration:5,  readiness:80, difficulty:4, rarity:1, form:"小品",   era:"romantic"  },
  { id:8,  title:"子供の情景 Op.15",                composer:"シューマン",     year:1838, country:"ドイツ",      key:"ト長調",   duration:17, readiness:65, difficulty:3, rarity:1, form:"小品",   era:"romantic"  },
  { id:9,  title:"月の光",                          composer:"ドビュッシー",   year:1905, country:"フランス",    key:"変ニ長調", duration:5,  readiness:88, difficulty:3, rarity:1, form:"小品",   era:"modern"    },
  { id:10, title:"ソナタ第7番 Op.83",               composer:"プロコフィエフ", year:1942, country:"ロシア",      key:"変ロ長調", duration:20, readiness:50, difficulty:5, rarity:2, form:"ソナタ", era:"modern"    },
  { id:11, title:"マズルカ Op.17 No.4",             composer:"ショパン",       year:1833, country:"ポーランド",  key:"イ短調",   duration:4,  readiness:72, difficulty:3, rarity:2, form:"舞曲",   era:"romantic"  },
  { id:12, title:"クリスマス・ツリー組曲",           composer:"リスト",         year:1876, country:"ハンガリー",  key:"ト長調",   duration:25, readiness:45, difficulty:5, rarity:3, form:"組曲",   era:"romantic"  },
];

const EMPTY_PIECE = { title:"", composer:"", year:1900, yearText:"1900", country:"ドイツ", key:"ハ長調", duration:10, durationSecs:0, difficulty:3, rarity:2, frequency:3, keywords:"", form:"小品", era:"romantic", fav:false, candidate:false };

const EMPTY_PROGRAM = (id) => ({ id, name:"新しいプログラム", maxDuration:40, maxPieces:5, pieceIds:[], intervalSecs:30 });

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
    <div style={{ background:inProgram?"#F5F0E6":"white", border:"1.5px solid "+(inProgram?"#C8B890":"#E8E0D0"), borderLeft:`4px solid ${era.color}`, borderRadius:6, marginBottom:5, overflow:"hidden", opacity:inProgram?0.55:1, transition:"opacity 0.2s" }}>
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
            <div><div style={{ fontSize:9, color:"#A09070", letterSpacing:2, marginBottom:3, fontFamily:SANS }}>レア度</div><DotRating value={piece.rarity} max={3} color="#E08030" /></div>
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
              <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontSize:11, color, textDecoration:"none", border:`1px solid ${border}`, padding:"2px 8px", borderRadius:4, fontFamily:SANS }}>{label}</a>
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
        const composerStr = piece.composer ? `作曲家: ${piece.composer}の` : "";
        const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`${composerStr}クラシックピアノ曲で「${val}」を含む曲を最大6曲挙げてください。JSONのみ:{"pieces":[{"title":"正式な曲名","composer":"作曲家名","year":作曲年数値,"country":"出身国","key":"調性（日本語）","duration":標準的な演奏時間分数数値,"difficulty":難易度1-5数値,"rarity":レア度1-3数値,"era":"baroque/classical/romantic/modern/contemporary"}]}`}]})});
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
      <div style={{fontSize:15,letterSpacing:3,color:"#6A5030",marginBottom:16,fontFamily:SANS,fontWeight:600}}>NEW PIECE</div>

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
              placeholder={piece.composer?`${piece.composer}の曲を検索…`:"曲名を入力…"}
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
          <select value={piece.country} onChange={e=>setPiece({...piece,country:e.target.value})} style={sel2({width:"100%"})}>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div>
          {/* 作曲年: 不明・範囲・通常 */}
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>作曲年</div>
          <input value={piece.yearText||String(piece.year)}
            onChange={e=>setPiece({...piece, yearText:e.target.value})}
            placeholder="例: 1810 / 1815-1820 / 不明"
            style={inp2({padding:"6px 8px",fontSize:12})} />
        </div>
        <div>
          <div style={{fontSize:10,color:"#6A5030",marginBottom:5,fontFamily:SANS}}>調性</div>
          <select value={piece.key} onChange={e=>setPiece({...piece,key:e.target.value})} style={sel2({width:"100%"})}>{KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
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
              style={sel2({width:"100%",borderColor:!durationEdited&&piece.title?"#C8A030":"#D8D0C0"})}
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
              {[1,2,3,4,5].map(n=>(
                <span key={n} onClick={()=>setPiece({...piece,[field]:n})}
                  style={{width:14,height:14,borderRadius:"50%",
                    background:piece[field]>=n?dotColor:"transparent",
                    border:"1.5px solid "+dotColor,
                    cursor:"pointer",display:"inline-block",
                    marginRight:3}}>
                </span>
              ))}
            </div>
          </div>
        ))}
        <div style={{flex:1,minWidth:120}}>
          <input value={piece.keywords||""} onChange={e=>setPiece({...piece,keywords:e.target.value})}
            placeholder="キーワード（例: 抒情的）"
            style={inp2({padding:"5px 8px",fontSize:12})} />
        </div>
      </div>

      <div style={{display:"flex",gap:24,justifyContent:"center",paddingTop:8,paddingBottom:4}}>
        <button onClick={handleAdd} style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"8px 22px",cursor:"pointer",fontSize:11,letterSpacing:2,fontFamily:SANS,borderRadius:4}}>追加する</button>
        <button onClick={onCancel} style={{background:"white",border:"1px solid #D8D0C0",color:"#8A7050",padding:"8px 16px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>キャンセル</button>
      </div>
    </div>
  );
};

const NOTATION_STYLES = {
  ja:     { label:"日本語（標準）",   example:"バラード 第1番 ト短調 Op.23" },
  ja_op:  { label:"日本語（Op.先）",  example:"バラード Op.23 No.1 ト短調" },
  en:     { label:"English",          example:"Ballade No.1 in G minor, Op.23" },
  formal: { label:"曲名のみ",         example:"バラード 第1番" },
};

const formatPieceTitle = (p, style) => {
  const title = p.title;
  const key = p.key;
  const year = p.year;
  if (style==="ja")     return `${title}　${key}`;
  if (style==="ja_op")  return title;
  if (style==="en")     return title;
  if (style==="formal") return title;
  return title;
};

const PrintSettings = ({ prog, allPool }) => {
  const [style, setStyle] = useState("ja");
  const [eventName, setEventName] = useState("");
  const [performer, setPerformer] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [showYear, setShowYear] = useState(false);
  const [showKey, setShowKey] = useState(true);
  const [showDuration, setShowDuration] = useState(false);
  const [notes, setNotes] = useState({});

  const programPieces = prog.pieceIds.map(id=>allPool.find(p=>p.id===id)).filter(Boolean);

  const generateText = () => {
    const lines = [];
    if (eventName) lines.push(eventName, "");
    if (performer) lines.push(performer);
    if (venue || date) lines.push([venue,date].filter(Boolean).join("　"));
    if (lines.length) lines.push("","─────────────────","");
    programPieces.forEach((p,i) => {
      lines.push(p.composer);
      let titleLine = formatPieceTitle(p, style);
      if (showKey && style!=="ja") titleLine += `　${p.key}`;
      if (showYear) titleLine += `　(${p.year})`;
      if (showDuration) titleLine += `　[${p.duration}分]`;
      lines.push(titleLine);
      if (notes[p.id]) lines.push(`　${notes[p.id]}`);
      lines.push("");
    });
    return lines.join("\n");
  };

  const copyText = () => {
    navigator.clipboard.writeText(generateText());
  };

  const downloadPDF = () => {
    // Inject print styles and trigger browser print-to-PDF
    const existing = document.getElementById("__repertia_print_style__");
    if (existing) existing.remove();
    const style = document.createElement("style");
    style.id = "__repertia_print_style__";
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #repertia-print-area { display: block !important; position: fixed; top:0; left:0; width:100%; z-index:99999; }
      }
    `;
    document.head.appendChild(style);

    // Build print content
    const existing2 = document.getElementById("repertia-print-area");
    if (existing2) existing2.remove();
    const div = document.createElement("div");
    div.id = "repertia-print-area";
    div.style.cssText = "display:none; font-family:'Cormorant Garamond','EB Garamond',serif; color:#2A2010; padding:60px 80px; background:white; min-height:100vh;";

    let html = "";
    if (eventName) html += `<h1 style="font-size:26px;font-weight:400;letter-spacing:4px;text-align:center;margin-bottom:8px;">${eventName}</h1>`;
    if (performer) html += `<p style="font-size:15px;text-align:center;color:#5A4A2A;margin:0 0 4px;">${performer}</p>`;
    if (venue||date) html += `<p style="font-size:13px;text-align:center;color:#8A7050;margin:0 0 32px;">${[venue,date].filter(Boolean).join("　")}</p>`;
    html += `<hr style="border:none;border-top:1px solid #D8D0C0;margin-bottom:32px;">`;
    programPieces.forEach((p,i) => {
      const eraColor = (ERAS[p.era]||ERAS.modern).color;
      html += `<div style="margin-bottom:28px;padding-bottom:28px;${i<programPieces.length-1?"border-bottom:1px solid #F0EAE0;":""}">`;
      html += `<div style="font-size:11px;color:${eraColor};letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">${p.composer}</div>`;
      let titleLine = formatPieceTitle(p, style);
      if (showKey && style!=="ja") titleLine += `　${p.key}`;
      if (showYear) titleLine += `　(${p.year})`;
      if (showDuration) titleLine += `　[${p.duration}分]`;
      html += `<div style="font-size:17px;margin-bottom:4px;line-height:1.5;">${titleLine}</div>`;
      if (style==="ja") html += `<div style="font-size:12px;color:#A09070;">${p.key}　${p.year}年</div>`;
      if (notes[p.id]) html += `<div style="font-size:12px;color:#6A5030;font-style:italic;margin-top:4px;">${notes[p.id]}</div>`;
      html += `</div>`;
    });
    const total = programPieces.reduce((s,p2)=>s+p2.duration,0);
    html += `<hr style="border:none;border-top:1px solid #E8E0D0;margin-top:16px;">`;
    html += `<div style="display:flex;justify-content:space-between;padding-top:12px;font-size:11px;color:#C0B090;letter-spacing:2px;"><span>Repertia</span><span>合計 ${total}分</span></div>`;
    div.innerHTML = html;
    document.body.appendChild(div);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        div.remove();
        style.remove();
      }, 500);
    }, 100);
  };

  const inp2 = {background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"6px 10px",fontFamily:"'Cormorant Garamond','EB Garamond','Palatino Linotype',Palatino,serif",fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Notation style */}
      <div style={{background:"white",border:"1px solid #E8E0D0",borderRadius:8,padding:18}}>
        <div style={{fontSize:11,color:"#6A5030",marginBottom:10}}>曲目表記スタイル</div>
        {Object.entries(NOTATION_STYLES).map(([k,v])=>(
          <label key={k} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8,cursor:"pointer"}}>
            <input type="radio" name="style" value={k} checked={style===k} onChange={()=>setStyle(k)} style={{marginTop:2}} />
            <div>
              <div style={{fontSize:12,color:"#2A2010"}}>{v.label}</div>
              <div style={{fontSize:11,color:"#8A7050",fontStyle:"italic"}}>{v.example}</div>
            </div>
          </label>
        ))}
      </div>

      {/* Event info */}
      <div style={{background:"white",border:"1px solid #E8E0D0",borderRadius:8,padding:18}}>
        <div style={{fontSize:11,color:"#6A5030",marginBottom:10}}>公演情報</div>
        {[["eventName","公演名・タイトル",eventName,setEventName],["performer","演奏者名",performer,setPerformer],["venue","会場",venue,setVenue],["date","日時",date,setDate]].map(([k,l,v,s])=>(
          <div key={k} style={{marginBottom:8}}>
            <div style={{fontSize:10,color:"#8A7050",marginBottom:3}}>{l}</div>
            <input value={v} onChange={e=>s(e.target.value)} style={inp2} />
          </div>
        ))}
      </div>

      {/* Display options */}
      <div style={{background:"white",border:"1px solid #E8E0D0",borderRadius:8,padding:18}}>
        <div style={{fontSize:11,color:"#6A5030",marginBottom:10}}>表示オプション</div>
        {[[showKey,setShowKey,"調性を表示"],[showYear,setShowYear,"作曲年を表示"],[showDuration,setShowDuration,"演奏時間を表示"]].map(([v,s,l],i)=>(
          <label key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,cursor:"pointer"}}>
            <input type="checkbox" checked={v} onChange={e=>s(e.target.checked)} />
            <span style={{fontSize:12,color:"#2A2010"}}>{l}</span>
          </label>
        ))}
      </div>

      {/* Action buttons */}
      <button onClick={copyText} style={{background:"#2A2010",border:"none",color:"#C8A860",padding:"12px",cursor:"pointer",fontSize:12,letterSpacing:3,fontFamily:"'Palatino Linotype',Palatino,serif",borderRadius:6}}>
        📋　テキストをコピー
      </button>
      <button onClick={downloadPDF} disabled={programPieces.length===0} style={{background:programPieces.length===0?"#EDE8DC":"#5A3A1A",border:"none",color:programPieces.length===0?"#B0A080":"#F5E8C8",padding:"12px",cursor:programPieces.length===0?"not-allowed":"pointer",fontSize:12,letterSpacing:3,fontFamily:"'Palatino Linotype',Palatino,serif",borderRadius:6}}>
        🖨️　PDFとして保存
      </button>
      <div style={{fontSize:11,color:"#8A7050",textAlign:"center",lineHeight:1.7}}>
        テキストはWordやメモ帳へ貼り付け可<br/>
        <span style={{color:"#A09070"}}>PDF保存：印刷ダイアログで「PDFに保存」を選択</span>
      </div>

      {/* Hidden state passthrough for preview */}
      <PrintPreviewData style={style} showKey={showKey} showYear={showYear} showDuration={showDuration} eventName={eventName} performer={performer} venue={venue} date={date} prog={prog} allPool={allPool} />
    </div>
  );
};

// Dummy component - preview is handled inline
const PrintPreviewData = () => null;

const PrintPreview = ({ prog, allPool }) => {
  const programPieces = prog.pieceIds.map(id=>allPool.find(p=>p.id===id)).filter(Boolean);
  const total = programPieces.reduce((s,p)=>s+p.duration,0);

  return (
    <div style={{background:"white",border:"1px solid #D8D0C0",borderRadius:8,padding:"40px 36px",minHeight:500,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
      {/* Program header */}
      <div style={{textAlign:"center",marginBottom:36,paddingBottom:24,borderBottom:"1px solid #E8E0D0"}}>
        <div style={{fontSize:18,letterSpacing:4,color:"#2A2010",marginBottom:8,fontWeight:"normal"}}>{prog.name}</div>
        <div style={{fontSize:12,color:"#8A7050",letterSpacing:2}}>Piano Recital</div>
      </div>

      {/* Piece list */}
      {programPieces.length===0
        ? <div style={{textAlign:"center",color:"#C0B090",fontSize:13,padding:"40px 0"}}>プログラムに曲を追加してください</div>
        : programPieces.map((p,i)=>{
            const era=ERAS[p.era]||ERAS.modern;
            return (
              <div key={p.id} style={{marginBottom:24,paddingBottom:24,borderBottom:i<programPieces.length-1?"1px solid #F0EAE0":"none"}}>
                <div style={{fontSize:11,color:era.color,letterSpacing:3,marginBottom:4,textTransform:"uppercase"}}>{p.composer}</div>
                <div style={{fontSize:15,color:"#2A2010",marginBottom:4,lineHeight:1.5}}>{p.title}</div>
                <div style={{fontSize:11,color:"#A09070",letterSpacing:1}}>{p.key}　{p.year}年　{p.duration}分</div>
              </div>
            );
          })
      }

      {/* Footer */}
      {programPieces.length>0 && (
        <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid #E8E0D0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:11,color:"#C0B090",letterSpacing:2}}>Repertia</div>
          <div style={{fontSize:11,color:"#8A7050"}}>合計 {total}分</div>
        </div>
      )}
    </div>
  );
};


// ── Main App ──────────────────────────────────────────────────────────────────
const FONT = "'Cormorant Garamond','EB Garamond','Palatino Linotype',Palatino,serif";
const NAV  = [["manage","レパートリー"],["home","プログラム"],["print","Portfolio"]];

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
  const [editMode, setEditMode]               = useState(false); // ⑦ manage page edit mode
  const [aiLoading, setAiLoading]             = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [constraints, setConstraints]         = useState({ requireEras:[] });
  const [showAdd, setShowAdd]                 = useState(false);
  const sugTimer  = useRef(null);
  const nextId    = useRef(100);
  const dragId    = useRef(null);
  const dragOver  = useRef(null);

  // ── derived ──
  const prog           = programs.find(p=>p.id===activeProgramId) || programs[0];
  const allPool        = [...pieces, ...aiPieces.filter(a=>!pieces.find(p=>p.id===a.id))];
  const programPieces  = prog.pieceIds.map(id=>allPool.find(p=>p.id===id)).filter(Boolean);
  const totalDuration  = programPieces.reduce((s,p)=>s+p.duration,0);
  const remaining      = prog.maxDuration - totalDuration;

  const updateProg = (u) => setPrograms(ps=>ps.map(p=>p.id===prog.id?{...p,...u}:p));

  const canAdd = (piece) =>
    totalDuration+piece.duration <= prog.maxDuration &&
    (prog.maxPieces>=999 || prog.pieceIds.length < prog.maxPieces) &&
    !prog.pieceIds.includes(piece.id);

  const toggle = (id) => {
    const piece = allPool.find(p=>p.id===id);
    if (!piece) return;
    if (prog.pieceIds.includes(id)) { updateProg({pieceIds:prog.pieceIds.filter(x=>x!==id)}); return; }
    if (canAdd(piece)) updateProg({pieceIds:[...prog.pieceIds,id]});
  };

  const toggleFav       = (id) => setPieces(ps=>ps.map(p=>p.id===id?{...p,fav:!p.fav}:p));
  const toggleCandidate = (id) => setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:!p.candidate}:p));

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
{"suggestions":[{"title":"曲名","composer":"作曲家","year":作曲年数値,"country":"出身国","key":"調性","duration":分数数値,"form":"形式","difficulty":1-5数値,"rarity":1-3数値,"era":"baroque/classical/romantic/modern/contemporary","reason":"推薦理由1文"}]}`;
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
      if      (sortBy==="year")         d = (a.year||0) - (b.year||0);
      else if (sortBy==="composerBorn") d = (COMPOSER_BORN[a.composer]??9999) - (COMPOSER_BORN[b.composer]??9999);
      else if (sortBy==="duration")     d = a.duration - b.duration;
      else if (sortBy==="difficulty")   d = a.difficulty - b.difficulty;
      else if (sortBy==="frequency")    d = (a.frequency||0) - (b.frequency||0);
      else if (sortBy==="rarity")       d = a.rarity - b.rarity;
      else if (sortBy==="composer")     d = a.composer.localeCompare(b.composer,"ja");
      return sortAsc ? d : -d;
    });

  const aiFiltered     = aiPieces.filter(p => searchMatch(p, searchQ));
  const showRuler      = sortBy==="year" && filterEra==="";
  const inp = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel = (ex={}) => ({background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  // ── Shared header (① stable, ② bigger nav) ──────────────────────────────────
  const Header = () => (
    <header style={{background:"#2A2010",display:"flex",alignItems:"stretch",flexShrink:0,height:54}}>
      <span onClick={()=>setPage("manage")}
        style={{fontSize:21,color:"#C8A860",letterSpacing:3,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,
          cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",
          padding:"0 22px 0 24px",borderRight:"1px solid #3A3020",flexShrink:0}}>
        𝄞 Repertia
      </span>
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
  const FilterBar = ({pool}) => (
    <div style={{padding:"8px 12px",borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",
      display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
      <SearchBox searchQ={searchQ} setSearchQ={setSearchQ} allPool={pool} />
      {/* ⑦ 並べ替え（初期値「並べ替え」） */}
      <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{...sel(),fontFamily:SANS,fontSize:11,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
          <option value="" disabled>並べ替え</option>
          <option value="year">作曲年</option>
          <option value="duration">演奏時間</option>
          <option value="difficulty">難易度</option>
          <option value="frequency">演奏頻度</option>
          <option value="rarity">レア度</option>
        </select>
        <button onClick={()=>setSortAsc(v=>!v)}
          style={{background:"white",border:"1px solid #D8D0C0",color:"#5A4A2A",padding:"0 8px",
            cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:"0 4px 4px 0",
            display:"flex",alignItems:"center"}}>
          {sortAsc?"▲":"▼"}
        </button>
      </div>
      <span style={{flex:1}} />
      {/* ⑥ 🤍と➖を右端に並べて */}
      <button onClick={()=>setFilterMark(filterMark==="fav"?"all":"fav")}
        title="お気に入りのみ"
        style={{background:"none",border:"none",
          color:filterMark==="fav"?"#B85C72":"#C8B8C0",
          fontSize:17,cursor:"pointer",padding:"3px 5px",lineHeight:1}}>
        <span style={{fontSize:16,lineHeight:1}}>{filterMark==="fav"?"♥":"♡"}</span>
      </button>
      <button onClick={()=>setEditMode(!editMode)}
        title={editMode?"削除モード終了":"削除モード"}
        style={{background:"none",border:"none",
          color:editMode?"#8A8A8A":"#C8C8C8",
          fontSize:15,cursor:"pointer",padding:"3px 5px",lineHeight:1,
          fontWeight:editMode?"bold":"normal"}}>
        ➖
      </button>
    </div>
  );

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
              <span>{p.yearText||p.year}年</span>
              <span>{p.key}</span>
              <span>{p.duration}分</span>
              <DotRating value={p.difficulty} max={5} color="#E05030" />
            </div>
          </div>
          {showControls && (
            <div style={{flexShrink:0,display:"flex",gap:4,alignItems:"center"}}>
              {p.mine && <>
                <button onClick={e=>{e.stopPropagation();toggleFav(p.id);}}
                  style={{background:"none",border:"none",color:p.fav?"#C03050":"#D8D0C0",fontSize:13,cursor:"pointer",padding:"0 1px",lineHeight:1}}>❤️</button>
                <button onClick={e=>{e.stopPropagation();toggleCandidate(p.id);}}
                  style={{background:"none",border:"none",color:p.candidate?"#C8A030":"#D8D0C0",fontSize:13,cursor:"pointer",padding:"0 1px",lineHeight:1}}>⭐️</button>
              </>}
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
              <div><div style={{fontSize:9,color:"#A09070",letterSpacing:2,marginBottom:3,fontFamily:SANS}}>レア度</div><DotRating value={p.rarity} max={3} color="#E08030" /></div>
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

  const ManagePage = () => (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"20px 28px"}}>

        {/* ボタン行 — 「曲を追加」のみ */}
        <div style={{display:"flex",gap:8,marginBottom:20,marginTop:8,alignItems:"center"}}>
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
          <FilterBar pool={pieces} />
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
                        {p.mine ? "🎹 " : "✦ "}{p.title}
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
  );

  // ── PRINT PAGE ────────────────────────────────────────────────────────────────
  const PrintPage = () => (
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:"#8A7050",marginBottom:16,fontFamily:SANS}}>設定</div>
          <div style={{background:"white",border:"1px solid #E8E0D0",borderRadius:8,padding:18,marginBottom:14}}>
            <div style={{fontSize:11,color:"#6A5030",marginBottom:8,fontFamily:SANS}}>プログラム</div>
            <select value={activeProgramId} onChange={e=>setActiveProgramId(+e.target.value)}
              style={{width:"100%",background:"white",border:"1px solid #D8D0C0",color:"#2A2010",padding:"7px 10px",fontFamily:SANS,fontSize:13,borderRadius:4}}>
              {programs.map(p=><option key={p.id} value={p.id}>{p.name}（{p.pieceIds.length}曲）</option>)}
            </select>
          </div>
          <PrintSettings prog={prog} allPool={allPool} />
        </div>
        <div>
          <div style={{fontSize:11,letterSpacing:4,color:"#8A7050",marginBottom:16,fontFamily:SANS}}>プレビュー</div>
          <PrintPreview prog={prog} allPool={allPool} />
        </div>
      </div>
    </div>
  );

  // ── HOME PAGE ─────────────────────────────────────────────────────────────────
  const HomePage = () => (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      {/* Program tabs */}
      <div style={{background:"#EDE8DC",borderBottom:"2px solid #D8D0C0",padding:"0 20px",display:"flex",alignItems:"center",gap:0,flexShrink:0,overflowX:"auto"}}>
        {programs.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",borderBottom:p.id===activeProgramId?"3px solid #8B5E3C":"3px solid transparent",padding:"8px 0",marginRight:4}}>
            {editingProgramId===p.id
              ? <input value={editingName} onChange={e=>setEditingName(e.target.value)}
                  onBlur={()=>{updateProg({name:editingName});setEditingProgramId(null);}}
                  onKeyDown={e=>{if(e.key==="Enter"){setPrograms(ps=>ps.map(x=>x.id===p.id?{...x,name:editingName}:x));setEditingProgramId(null);}}}
                  autoFocus style={{background:"white",border:"1px solid #C8A860",color:"#2A2010",padding:"2px 8px",fontSize:12,fontFamily:SANS,borderRadius:3,width:140}} />
              : <button onClick={()=>setActiveProgramId(p.id)}
                  onDoubleClick={()=>{setEditingProgramId(p.id);setEditingName(p.name);}}
                  style={{background:"none",border:"none",color:p.id===activeProgramId?"#2A2010":"#8A7050",cursor:"pointer",fontSize:12,fontFamily:SANS,padding:"0 10px",whiteSpace:"nowrap"}}>
                  {p.name}
                </button>
            }
            {programs.length>1 && <button onClick={()=>deleteProgram(p.id)} style={{background:"none",border:"none",color:"#C0A080",cursor:"pointer",fontSize:13,padding:"0 4px"}}>×</button>}
          </div>
        ))}
        <button onClick={addProgram} style={{background:"none",border:"1px dashed #C8B890",color:"#8A7050",cursor:"pointer",fontSize:11,fontFamily:SANS,padding:"4px 12px",borderRadius:4,marginLeft:8,whiteSpace:"nowrap"}}>＋ 新規</button>
      </div>

      {/* 2-column */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* LEFT: Program panel */}
        <div style={{width:"42%",borderRight:"2px solid #D8D0C0",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Settings bar */}
          <div style={{padding:"8px 14px",borderBottom:"1px solid #E8E0D0",background:"#F0EBE0",display:"flex",gap:10,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>TIME</span>
              <input type="number" min={1} value={prog.maxDuration} onChange={e=>updateProg({maxDuration:Math.max(1,+e.target.value)})}
                style={{width:48,background:"white",border:"1px solid #C8B890",color:"#2A2010",fontSize:13,fontFamily:FONT,textAlign:"center",padding:"3px 4px",borderRadius:4}} />
              <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>分</span>
            </div>
            <div style={{width:1,height:18,background:"#D8D0C0"}} />
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>曲数</span>
              <select value={prog.maxPieces===999?"unlimited":String(prog.maxPieces)} onChange={e=>updateProg({maxPieces:e.target.value==="unlimited"?999:Math.max(0,+e.target.value)})}
                style={{background:"white",border:"1px solid #C8B890",color:"#2A2010",fontSize:12,fontFamily:SANS,padding:"3px 6px",borderRadius:4}}>
                <option value="unlimited">制限なし</option>
                {[...Array(21)].map((_,i)=><option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div style={{width:1,height:18,background:"#D8D0C0"}} />
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:10,color:"#6A5030",fontFamily:SANS}}>曲間</span>
              <select value={prog.intervalSecs!=null?prog.intervalSecs:30} onChange={e=>updateProg({intervalSecs:+e.target.value})}
                style={{background:"white",border:"1px solid #C8B890",color:"#2A2010",fontSize:12,fontFamily:SANS,padding:"3px 6px",borderRadius:4}}>
                <option value={0}>なし</option>
                <option value={15}>15秒</option>
                <option value={30}>30秒</option>
                <option value={45}>45秒</option>
                <option value={60}>1分</option>
                <option value={90}>1分30秒</option>
                <option value={120}>2分</option>
              </select>
            </div>
            <div style={{width:1,height:18,background:"#D8D0C0"}} />
            <button onClick={()=>setShowConstraints(!showConstraints)}
              style={{background:showConstraints?"#8B5E3C":"white",border:"1px solid "+(showConstraints?"#8B5E3C":"#C8B890"),color:showConstraints?"white":"#6A5030",padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:4}}>
              縛り{showConstraints?" ▲":" ▼"}
            </button>
          </div>
          {showConstraints && (
            <div style={{background:"#EDE8DC",borderBottom:"1px solid #D8D0C0",padding:"8px 14px",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",flexShrink:0}}>
              <span style={{fontSize:10,color:"#8A7050",fontFamily:SANS}}>必須の時代：</span>
              {Object.entries(ERAS).map(([k,v])=>(
                <button key={k} onClick={()=>setConstraints(c=>({...c,requireEras:c.requireEras.includes(k)?c.requireEras.filter(x=>x!==k):[...c.requireEras,k]}))}
                  style={{background:constraints.requireEras.includes(k)?v.color:"white",border:"1px solid "+v.color,color:constraints.requireEras.includes(k)?"white":v.color,padding:"2px 8px",cursor:"pointer",fontSize:10,borderRadius:4,fontFamily:SANS}}>
                  {v.label}
                </button>
              ))}
            </div>
          )}
          {/* Duration bar */}
          <div style={{padding:"8px 14px",borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:10,letterSpacing:2,color:"#8A7050",fontFamily:SANS}}>{prog.pieceIds.length}{prog.maxPieces===999?"":"/"+prog.maxPieces}曲</span>
              <span style={{fontSize:13,color:remaining<0?"#B03020":remaining<5?"#A07020":"#2A6A3A",fontWeight:"bold"}}>
                {totalDuration}分 / {prog.maxDuration}分
                <span style={{fontSize:11,fontWeight:"normal",color:remaining<0?"#B03020":"#8A7050",fontFamily:SANS}}>　{remaining>=0?"残り"+remaining+"分":Math.abs(remaining)+"分超過"}</span>
              </span>
            </div>
            <div style={{height:5,background:"#D8D0C0",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:Math.min((totalDuration/prog.maxDuration)*100,100)+"%",background:remaining<0?"#C04030":remaining<5?"#C09030":"#3A8A4A",borderRadius:3,transition:"width 0.4s"}} />
            </div>
          </div>
          {/* Program list */}
          <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
            {programPieces.length>0 && (
              <div style={{display:"flex",gap:2,height:24,borderRadius:4,overflow:"hidden",marginBottom:12,border:"1px solid #D8D0C0"}}>
                {programPieces.map(p=>{ const era=ERAS[p.era]||ERAS.modern; return (
                  <div key={p.id} style={{width:((p.duration/prog.maxDuration)*100)+"%",background:era.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"rgba(255,255,255,0.9)",minWidth:2,overflow:"hidden"}}>{p.duration}m</div>
                ); })}
                {remaining>0 && <div style={{flex:1,background:"#EDE8DC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#B0A080"}}>{remaining}m</div>}
              </div>
            )}
            {programPieces.length===0
              ? <div style={{textAlign:"center",color:"#B0A080",padding:"40px 16px",border:"2px dashed #D8D0C0",borderRadius:8,fontSize:13,lineHeight:2,fontFamily:SANS}}>右のボタンで曲を探して<br/>プログラムを組み立てましょう</div>
              : programPieces.map((p,i)=>{ const era=ERAS[p.era]||ERAS.modern; return (
                <div key={p.id} draggable onDragStart={()=>dragId.current=p.id} onDragEnter={()=>dragOver.current=p.id} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",background:"white",border:"1.5px solid "+era.color+"22",borderLeft:"4px solid "+era.color,borderRadius:6,marginBottom:5,cursor:"grab"}}>
                  <span style={{color:"#C8B890",fontSize:12}}>⠿</span>
                  <div style={{width:22,height:22,borderRadius:"50%",background:era.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"white",flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:"#2A2010",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                      {p.mine ? "🎹 " : "✦ "}{p.title}
                    </div>
                    <div style={{fontSize:10,color:"#8A7050",fontFamily:SANS}}>{p.composer}　{p.key}　{p.duration}分</div>
                  </div>
                  <button onClick={()=>toggle(p.id)} style={{background:"none",border:"none",color:"#C8A0A0",cursor:"pointer",fontSize:15,padding:"0 2px"}}>×</button>
                </div>
              ); })
            }
            {programPieces.length>0 && (
              <div style={{marginTop:14,padding:12,background:"white",border:"1px solid #E8E0D0",borderRadius:8}}>
                <div style={{fontSize:9,letterSpacing:3,color:"#8A7050",marginBottom:8,fontFamily:SANS}}>バランス</div>
                {ERA_ORDER.map(k=>{ const v=ERAS[k]; const d=programPieces.filter(p=>p.era===k).reduce((s,p)=>s+p.duration,0); if(!d) return null; return (
                  <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                    <div style={{width:48,fontSize:10,color:v.color,fontFamily:SANS}}>{v.label}</div>
                    <div style={{flex:1,height:4,background:"#EDE8DC",borderRadius:2}}><div style={{height:"100%",width:((d/totalDuration)*100)+"%",background:v.color,borderRadius:2}} /></div>
                    <div style={{fontSize:10,color:"#8A7050",width:22,textAlign:"right",fontFamily:SANS}}>{d}分</div>
                  </div>
                ); })}
                <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:4}}>
                  {programPieces.map(p=>(<span key={p.id} style={{fontSize:10,background:"#FDF5ED",border:"1px solid #D4A574",color:"#8B5E3C",padding:"1px 7px",borderRadius:10}}>{p.key}</span>))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ③ RIGHT: 条件設定 → 2ボタン → 結果 */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* Step 1: 条件設定 */}
          <div style={{padding:"10px 16px",borderBottom:"1px solid #E8E0D0",background:"#F8F4EE",flexShrink:0}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#8A7050",marginBottom:8,fontFamily:SANS}}>STEP 1　条件を設定</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              <SearchBox searchQ={searchQ} setSearchQ={setSearchQ} allPool={allPool} />
              <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{...sel(),fontFamily:SANS,fontSize:11,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
                  <option value="" disabled>並べ替え</option>
                  <option value="year">作曲年</option>
                  <option value="duration">演奏時間</option>
                  <option value="difficulty">難易度</option>
                  <option value="frequency">演奏頻度</option>
                  <option value="rarity">レア度</option>
                </select>
                <button onClick={()=>setSortAsc(v=>!v)}
                  style={{background:"white",border:"1px solid #D8D0C0",color:"#5A4A2A",padding:"0 8px",
                    cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:"0 4px 4px 0",
                    display:"flex",alignItems:"center"}}>
                  {sortAsc?"▲":"▼"}
                </button>
              </div>
              <select value={filterEra} onChange={e=>setFilterEra(e.target.value)} style={{...sel(),fontFamily:SANS,fontSize:11}}>
                <option value="">全時代</option>
                {ERA_ORDER.map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
              </select>
              {/* ④ ♥★ まとめてプルダウン */}
              <select value={filterMark} onChange={e=>setFilterMark(e.target.value)} style={{...sel(),fontFamily:SANS,fontSize:11,minWidth:88}}>
                <option value="all">すべて</option>
                <option value="fav">❤️ お気に入り</option>
                <option value="candidate">⭐️ 候補</option>
              </select>
            </div>
          </div>

          {/* Step 2: 2ボタン */}
          <div style={{padding:"10px 16px",borderBottom:"1px solid #E8E0D0",background:"#F0EBE0",display:"flex",gap:8,flexShrink:0}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#8A7050",display:"flex",alignItems:"center",marginRight:4,fontFamily:SANS}}>STEP 2</div>
            <button onClick={()=>setPoolMode(m=>m==="repertoire"?"none":m==="ai"?"both":m==="both"?"ai":"repertoire")}
              style={{flex:1,padding:"8px 0",background:(poolMode==="repertoire"||poolMode==="both")?"#2A2010":"white",
                border:"1.5px solid "+((poolMode==="repertoire"||poolMode==="both")?"#2A2010":"#C8B890"),
                color:(poolMode==="repertoire"||poolMode==="both")?"#C8A860":"#6A5030",
                cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:5,letterSpacing:0.3}}>
              🎹 レパートリーから探す
            </button>
            <button onClick={()=>{ setPoolMode(m=>m==="ai"?"none":m==="repertoire"?"both":m==="both"?"repertoire":"ai"); if(poolMode==="none"||poolMode==="repertoire") askAI(); }}
              disabled={aiLoading}
              style={{flex:1,padding:"8px 0",background:(poolMode==="ai"||poolMode==="both")?"#2A2010":"white",
                border:"1.5px solid "+((poolMode==="ai"||poolMode==="both")?"#2A2010":"#C8B890"),
                color:(poolMode==="ai"||poolMode==="both")?"#C8A860":"#6A5030",
                cursor:aiLoading?"wait":"pointer",fontSize:11,fontFamily:SANS,borderRadius:5,letterSpacing:0.3}}>
              {aiLoading ? "✦ 考えています…" : "✦ AIに提案してもらう"}
            </button>
          </div>

          {/* Step 3: 結果 */}
          <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
            {poolMode==="none" && (
              <div style={{textAlign:"center",color:"#B0A080",padding:"48px 16px",fontSize:13,lineHeight:2,fontFamily:SANS}}>
                上のボタンで曲を探してみましょう
              </div>
            )}

            {/* レパートリー結果 */}
            {(poolMode==="repertoire"||poolMode==="both") && (
              <div style={{marginBottom: poolMode==="both"?16:0}}>
                {poolMode==="both" && <div style={{fontSize:10,letterSpacing:2,color:"#8B5E3C",marginBottom:6,fontFamily:SANS}}>🎹 レパートリー ({poolFiltered.length}曲)</div>}
                {poolFiltered.length===0
                  ? <div style={{textAlign:"center",color:"#B0A080",padding:"24px",fontSize:13,fontFamily:SANS}}>該当する曲がありません</div>
                  : <div style={{display:"flex",gap:0}}>
                      {showRuler && <EraRuler pieces={poolFiltered} />}
                      <div style={{flex:1}}>
                        {poolFiltered.map(p=><PieceCardRow key={p.id} p={p} />)}
                      </div>
                    </div>
                }
              </div>
            )}

            {/* AI結果 */}
            {(poolMode==="ai"||poolMode==="both") && (
              <div>
                {poolMode==="both" && <div style={{fontSize:10,letterSpacing:2,color:"#5A3A8A",marginBottom:6,fontFamily:SANS}}>✦ AI提案 ({aiFiltered.length}件)</div>}
                {aiFiltered.length===0 && !aiLoading && (
                  <div style={{textAlign:"center",color:"#B0A080",padding:"24px 16px",border:"2px dashed #D8D0C0",borderRadius:8,fontSize:13,lineHeight:2,fontFamily:SANS}}>
                    「AIに提案してもらう」を押してください
                  </div>
                )}
                {aiFiltered.map(p=><PieceCardRow key={p.id} p={p} showControls={true} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ── SINGLE return ─────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",background:"#F5F0E8",fontFamily:FONT,color:"#2A2010",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <FontLoader />
      <Header />
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {page==="manage" && <ManagePage />}
        {page==="print"  && <PrintPage />}
        {page==="home"   && <HomePage />}
      </div>
    </div>
  );
}