import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";

// ── カラーテーマ (紺×ゴールド) ─────────────────────────────────────────────
const C = {
  bgDeep:    "#0F1A33",   // ページ背景・濃い紺
  bgCard:    "#15233F",   // カード・入力欄背景
  bgSub:     "#1E2A45",   // ボーダー・区切り・サブ背景
  bgHover:   "#2A3F6A",   // ホバー・強調ボーダー
  gold:      "#C8A860",   // ゴールド（アクセント・ボタン）
  goldLight: "#E0C074",   // 明るめゴールド
  textMain:  "#EDE6D6",   // メインテキスト（ほぼ白）
  textSub:   "#94A3BE",   // サブテキスト（青みグレー）
  textMuted: "#4A5A7A",   // 薄いサブ
  bordeaux:  "#C0556A",   // お気に入り♡
  success:   "#2A7A3A",   // 保存成功
  danger:    "#C0405A",   // エラー・削除
  warning:   "#C8A030",   // 警告
};

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};
const SANS = "'Zen Kaku Gothic New','Noto Sans JP',sans-serif";
const FONT = "'Montserrat','Zen Kaku Gothic New','Noto Sans JP',sans-serif";

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
const COUNTRY_LIST = [{ja:"日本",en:"Japan"},{ja:"アメリカ合衆国",en:"United States"},{ja:"イギリス",en:"United Kingdom"},{ja:"ドイツ",en:"Germany"},{ja:"フランス",en:"France"},{ja:"イタリア",en:"Italy"},{ja:"スペイン",en:"Spain"},{ja:"オーストリア",en:"Austria"},{ja:"スイス",en:"Switzerland"},{ja:"オランダ",en:"Netherlands"},{ja:"ベルギー",en:"Belgium"},{ja:"ポーランド",en:"Poland"},{ja:"ロシア",en:"Russia"},{ja:"ウクライナ",en:"Ukraine"},{ja:"チェコ",en:"Czech Republic"},{ja:"スロバキア",en:"Slovakia"},{ja:"ハンガリー",en:"Hungary"},{ja:"ルーマニア",en:"Romania"},{ja:"ブルガリア",en:"Bulgaria"},{ja:"ギリシャ",en:"Greece"},{ja:"ポルトガル",en:"Portugal"},{ja:"デンマーク",en:"Denmark"},{ja:"スウェーデン",en:"Sweden"},{ja:"ノルウェー",en:"Norway"},{ja:"フィンランド",en:"Finland"},{ja:"アイスランド",en:"Iceland"},{ja:"アイルランド",en:"Ireland"},{ja:"クロアチア",en:"Croatia"},{ja:"セルビア",en:"Serbia"},{ja:"スロベニア",en:"Slovenia"},{ja:"エストニア",en:"Estonia"},{ja:"ラトビア",en:"Latvia"},{ja:"リトアニア",en:"Lithuania"},{ja:"ルクセンブルク",en:"Luxembourg"},{ja:"モナコ",en:"Monaco"},{ja:"リヒテンシュタイン",en:"Liechtenstein"},{ja:"マルタ",en:"Malta"},{ja:"キプロス",en:"Cyprus"},{ja:"アルバニア",en:"Albania"},{ja:"北マケドニア",en:"North Macedonia"},{ja:"ボスニア・ヘルツェゴビナ",en:"Bosnia and Herzegovina"},{ja:"モンテネグロ",en:"Montenegro"},{ja:"モルドバ",en:"Moldova"},{ja:"ベラルーシ",en:"Belarus"},{ja:"アンドラ",en:"Andorra"},{ja:"サンマリノ",en:"San Marino"},{ja:"バチカン市国",en:"Vatican City"},{ja:"中国",en:"China"},{ja:"韓国",en:"South Korea"},{ja:"北朝鮮",en:"North Korea"},{ja:"台湾",en:"Taiwan"},{ja:"香港",en:"Hong Kong"},{ja:"モンゴル",en:"Mongolia"},{ja:"インド",en:"India"},{ja:"パキスタン",en:"Pakistan"},{ja:"バングラデシュ",en:"Bangladesh"},{ja:"スリランカ",en:"Sri Lanka"},{ja:"ネパール",en:"Nepal"},{ja:"タイ",en:"Thailand"},{ja:"ベトナム",en:"Vietnam"},{ja:"フィリピン",en:"Philippines"},{ja:"インドネシア",en:"Indonesia"},{ja:"マレーシア",en:"Malaysia"},{ja:"シンガポール",en:"Singapore"},{ja:"ミャンマー",en:"Myanmar"},{ja:"カンボジア",en:"Cambodia"},{ja:"ラオス",en:"Laos"},{ja:"ブルネイ",en:"Brunei"},{ja:"カザフスタン",en:"Kazakhstan"},{ja:"ウズベキスタン",en:"Uzbekistan"},{ja:"アゼルバイジャン",en:"Azerbaijan"},{ja:"ジョージア",en:"Georgia"},{ja:"アルメニア",en:"Armenia"},{ja:"トルコ",en:"Turkey"},{ja:"イスラエル",en:"Israel"},{ja:"サウジアラビア",en:"Saudi Arabia"},{ja:"アラブ首長国連邦",en:"United Arab Emirates"},{ja:"イラン",en:"Iran"},{ja:"イラク",en:"Iraq"},{ja:"ヨルダン",en:"Jordan"},{ja:"レバノン",en:"Lebanon"},{ja:"シリア",en:"Syria"},{ja:"クウェート",en:"Kuwait"},{ja:"カタール",en:"Qatar"},{ja:"バーレーン",en:"Bahrain"},{ja:"オマーン",en:"Oman"},{ja:"イエメン",en:"Yemen"},{ja:"エジプト",en:"Egypt"},{ja:"モロッコ",en:"Morocco"},{ja:"アルジェリア",en:"Algeria"},{ja:"チュニジア",en:"Tunisia"},{ja:"リビア",en:"Libya"},{ja:"スーダン",en:"Sudan"},{ja:"エチオピア",en:"Ethiopia"},{ja:"ケニア",en:"Kenya"},{ja:"タンザニア",en:"Tanzania"},{ja:"ウガンダ",en:"Uganda"},{ja:"ナイジェリア",en:"Nigeria"},{ja:"ガーナ",en:"Ghana"},{ja:"南アフリカ",en:"South Africa"},{ja:"ジンバブエ",en:"Zimbabwe"},{ja:"ザンビア",en:"Zambia"},{ja:"セネガル",en:"Senegal"},{ja:"コートジボワール",en:"Ivory Coast"},{ja:"カメルーン",en:"Cameroon"},{ja:"コンゴ民主共和国",en:"DR Congo"},{ja:"アンゴラ",en:"Angola"},{ja:"モザンビーク",en:"Mozambique"},{ja:"マダガスカル",en:"Madagascar"},{ja:"ルワンダ",en:"Rwanda"},{ja:"ボツワナ",en:"Botswana"},{ja:"ナミビア",en:"Namibia"},{ja:"モーリシャス",en:"Mauritius"},{ja:"カナダ",en:"Canada"},{ja:"メキシコ",en:"Mexico"},{ja:"グアテマラ",en:"Guatemala"},{ja:"コスタリカ",en:"Costa Rica"},{ja:"パナマ",en:"Panama"},{ja:"キューバ",en:"Cuba"},{ja:"ジャマイカ",en:"Jamaica"},{ja:"ドミニカ共和国",en:"Dominican Republic"},{ja:"ブラジル",en:"Brazil"},{ja:"アルゼンチン",en:"Argentina"},{ja:"チリ",en:"Chile"},{ja:"ペルー",en:"Peru"},{ja:"コロンビア",en:"Colombia"},{ja:"ベネズエラ",en:"Venezuela"},{ja:"エクアドル",en:"Ecuador"},{ja:"ボリビア",en:"Bolivia"},{ja:"パラグアイ",en:"Paraguay"},{ja:"ウルグアイ",en:"Uruguay"},{ja:"オーストラリア",en:"Australia"},{ja:"ニュージーランド",en:"New Zealand"},{ja:"フィジー",en:"Fiji"}];
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

const EMPTY_PIECE = { title:"", composer:"", year:0, yearText:"", country:"ー", key:"ー", duration:0, durationSecs:0, difficulty:0, frequency:0, keywords:"", form:"ー", era:"romantic", fav:false, candidate:false };

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
      <span key={i} style={{ color:i<value?color:"#94A3BE" }}>●</span>
    ))}
  </span>
);

const EmojiRating = ({ label, value, max=5, filled, empty="◯" }) => (
  <span style={{fontFamily:SANS,fontSize:11,color:"#94A3BE",display:"inline-flex",alignItems:"center",gap:3}}>
    <span style={{color:"#94A3BE",fontSize:10}}>{label}</span>
    <span>{Array.from({length:max}).map((_,i)=><span key={i}>{i<value?filled:empty}</span>)}</span>
  </span>
);

const fmtDuration = (mins, secs) => {
  if (!secs) return mins + "分";
  return mins + "分" + (secs < 10 ? "0" : "") + secs + "秒";
};

// ── PieceCardUnified (共通カードコンポーネント) ────────────────────────────────
// 全箇所で使い回す唯一の曲カード定義
// props:
//   p           - pieceオブジェクト
//   expanded    - 展開中かどうか
//   onToggleExpand - クリック時のコールバック
//   inProgram   - プログラムに追加済み
//   canAdd      - プログラムに追加可能か
//   onAdd/onRemove - プログラム追加/削除
//   onToggleFav - お気に入りトグル
//   onToggleCandidate - 候補トグル
//   isAI        - AI提案曲か
//   showControls - ボタン類を表示するか（デフォルトtrue）
const PieceCardUnified = ({ p, expanded, onToggleExpand, inProgram, canAdd, onAdd, onRemove, onToggleFav, onToggleCandidate, isAI=false, showControls=true, onUpdatePiece, learningIds=[] }) => {
  const era = ERAS[p.era] || ERAS.modern;
  const isLearning = !isAI && Array.isArray(learningIds) && learningIds.includes(p.id);
  const statusBg = isAI ? "#9FB3C8" : isLearning ? "#E8E0CE" : null; // AI=青み銀 / Learning=クリーム / それ以外=紺(null)
  const statusText = statusBg ? "#15233F" : null; // 色つき背景の上は濃紺
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({});

  React.useEffect(() => {
    if (!expanded) setEditing(false);
  }, [expanded]);

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft({
      title:p.title, composer:p.composer, key:p.key||"",
      yearText:p.yearText||"", duration:p.duration||0, durationSecs:p.durationSecs||0,
      memo:p.memo||"", keywords:p.keywords||"",
    });
    setEditing(true);
  };
  const saveEdit = (e) => {
    e.stopPropagation();
    if (onUpdatePiece) onUpdatePiece({...p,...draft});
    setEditing(false);
  };
  const cancelEditFn = (e) => { e.stopPropagation(); setEditing(false); };
  const cancelEdit = (e) => { e.stopPropagation(); setEditing(false); };

  const yearStr = (p.yearText==="不明"||(p.year||0)===0) ? "作曲年不明" : (p.yearText||p.year)+"年";

  return (
    <div style={{
      background: expanded ? "#1C2E4A" : statusBg ? statusBg : inProgram ? "#15233F" : "transparent",
      borderBottom: "1px solid #1E2A45",
      position: "relative",
      opacity: inProgram ? 0.6 : 1,
      transition: "all 0.2s",
      boxShadow: expanded ? "0 6px 20px rgba(0,0,0,0.5)" : "none",
      transform: expanded ? "scale(1.015)" : "scale(1)",
      zIndex: expanded ? 2 : 1,
    }}>
      {/* 帯: 絶対配置の短い棒 */}
      <div style={{
        position:"absolute", left:0,
        top: expanded ? 4 : 5,
        bottom: expanded ? 4 : 5,
        width: 3,
        background: expanded ? "#C8A860" : era.color,
        borderRadius: 0,
      }} />

      {/* ── 1行目（常に表示） ── */}
      <div style={{padding:"10px 12px 8px 13px",display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}
        onClick={onToggleExpand}>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"baseline",gap:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {/* ②作曲家名に最小幅。一般的な名前(〜12文字)が収まる幅で縦線が揃う */}
          <span style={{fontSize:14,color:expanded?"#F0E8D0":(statusText||"#EDE6D6"),fontFamily:SANS,width:"10em",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.composer}</span>
          {expanded ? <span style={{width:1,alignSelf:"stretch",background:"#7A8FB5",flexShrink:0,margin:"0 4px",display:"inline-block"}} /> : <span style={{fontSize:13,color:"#7A8FB5",flexShrink:0,margin:"0 4px"}}>｜</span>}
          <span style={{fontSize:14,color:expanded?"#F0E8D0":(statusText||"#EDE6D6"),fontFamily:SANS,overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
          {p.key && <span style={{fontSize:14,color:expanded?"#F0E8D0":(statusText||"#EDE6D6"),fontFamily:SANS,flexShrink:0,marginLeft:2}}>{p.key}</span>}
          {isAI && <span style={{flexShrink:0,fontSize:9,background:"#1E2A45",color:"#94A3BE",padding:"1px 5px",borderRadius:6,border:"1px solid #2A3F6A",marginLeft:4}}>AI</span>}
        </div>
        {/* ③演奏時間: 1行目と同書式 */}
        <span style={{fontSize:14,color:expanded?"#F0E8D0":(statusText||"#EDE6D6"),fontFamily:SANS,flexShrink:0,marginRight:6}}>{fmtDuration(p.duration, p.durationSecs)}</span>
        {showControls && (
          <div style={{flexShrink:0,display:"flex",gap:2,alignItems:"center"}}>
            {/* ①★候補を有効化・♥お気に入り・▼開閉は寝かせ中 */}
            {onToggleCandidate && (
              <button onClick={e=>{e.stopPropagation();onToggleCandidate();}}
                title="選ぶ（出力・プログラム用）"
                style={{background:"none",border:"none",color:p.candidate?"#C8A860":"#4A5A7A",fontSize:13,cursor:"pointer",padding:"2px 3px",lineHeight:1}}>★</button>
            )}
            {/* ♥お気に入り: 揃える日まで寝かせ中
            {onToggleFav && (
              <button onClick={e=>{e.stopPropagation();onToggleFav();}}
                title="お気に入り"
                style={{background:"none",border:"none",color:p.fav?"#C0556A":"#4A5A7A",fontSize:14,cursor:"pointer",padding:"2px 3px",lineHeight:1}}>♥</button>
            )}
            */}
            {inProgram !== undefined && (
              inProgram
                ? <button onClick={e=>{e.stopPropagation();onRemove&&onRemove();}}
                    style={{background:"none",border:"1px solid #C0405A",color:"#C0405A",width:22,height:22,borderRadius:"50%",cursor:"pointer",fontSize:12,lineHeight:"20px",textAlign:"center"}}>×</button>
                : <button onClick={e=>{e.stopPropagation();onAdd&&onAdd();}} disabled={!canAdd}
                    style={{background:canAdd?"#C8A860":"#1E2A45",border:"none",color:canAdd?"#0F1A33":"#4A5A7A",width:22,height:22,borderRadius:"50%",cursor:canAdd?"pointer":"not-allowed",fontSize:16,lineHeight:"22px",textAlign:"center",fontWeight:"bold"}}>+</button>
            )}
            {/* ①▼開閉非表示（機能は保持: onToggleExpandで動作）*/}
          </div>
        )}
      </div>

      {/* ── 展開部分 ── */}
      {expanded && (
        <div style={{padding:"0 12px 10px 13px",background:"#1C2E4A"}} onClick={onToggleExpand}>
          {!editing ? (
            <>
              {/* 左右2カラム: 左=作曲家列(縦線まで)、右=曲の全情報 */}
              <div style={{display:"flex",alignItems:"stretch",gap:0}} onClick={e=>e.stopPropagation()}>
                {/* 左カラム: 縦線＋編集ボタン */}
                {/* ②幅を calc(9em+4px) に調整して1行目の｜と揃える */}
                <div style={{width:"10em",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-start",paddingTop:8,borderRight:"1px solid #7A8FB5"}}>
                  {/* ①編集ボタン: 左寄せ */}
                  <button onClick={startEdit}
                    style={{background:"none",border:"1px solid #C8A860",color:"#C8A860",
                      padding:"2px 8px",borderRadius:3,cursor:"pointer",fontSize:11,fontFamily:SANS,
                      position:"relative",zIndex:1}}>
                    編集
                  </button>
                </div>
                {/* 右カラム: 曲の全情報（同じ左端から） */}
                <div style={{flex:1,minWidth:0,paddingTop:8,paddingBottom:2,paddingLeft:8}}>
                  {/* ③時代情報行＋リンクを同じ行に */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",fontSize:12,color:"#C8D4E8",fontFamily:SANS,marginBottom:6}}>
                    <span style={{color:era.color}}>{era.label}</span>
                    <span style={{color:"#7A8FB5"}}>·</span>
                    <span>{yearStr}</span>
                    <span style={{color:"#7A8FB5"}}>·</span>
                    <span>{p.difficulty ? "Lv."+p.difficulty : <span style={{color:"#7A8FB5"}}>Lv. 育成中</span>}</span>
                    <span style={{color:"#7A8FB5"}}>·</span>
                    <span style={{color:"#7A8FB5"}}>Pop. 育成中</span>
                    {/* ③リンクをPop.の後に1em空けて続ける */}
                    <span style={{marginLeft:"1em",display:"inline-flex",gap:4}}>
                      {[
                        ["https://ja.wikipedia.org/wiki/"+encodeURIComponent(p.composer),"W","Wikipedia"],
                        ["https://imslp.org/wiki/Special:Search/"+encodeURIComponent(p.title),"I","International Music Score Library Project"],
                        ["https://www.youtube.com/results?search_query="+encodeURIComponent(p.title+" "+p.composer),"▶","YouTube"],
                      ].map(([href,mark,ttl])=>(
                        <a key={ttl} href={href} target="_blank" rel="noreferrer" title={ttl}
                          style={{width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",
                            fontSize:11,color:"#94A3BE",textDecoration:"none",
                            border:"1px solid #2A3F6A",borderRadius:3,fontFamily:SANS,flexShrink:0}}
                          onClick={e=>e.stopPropagation()}>{mark}</a>
                      ))}
                    </span>
                  </div>
                  {/* メモ(ある時だけ) */}
                  {(p.memo||p.reason) && (
                    <div style={{fontSize:12,color:"#94A3BE",lineHeight:1.7,marginBottom:8,fontFamily:SANS}}>
                      {p.memo && <div>{p.memo}</div>}
                      {p.reason && <div style={{fontStyle:"italic",marginTop:p.memo?4:0}}>💡 {p.reason}</div>}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ── 第3形態: インライン編集フォーム ── */
            <div style={{padding:"8px 0 4px",position:"relative"}} onClick={e=>e.stopPropagation()}>
              {/* ④右上✕ */}
              <button onClick={cancelEditFn} title="キャンセル"
                style={{position:"absolute",top:0,right:0,background:"none",border:"none",color:"#6B7A90",fontSize:16,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
              {/* 1行目: 作曲家(1):曲名(2) */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:8,marginBottom:8}}>
                {[["作曲家","composer"],["曲名","title"]].map(([label,field])=>(
                  <div key={field}>
                    <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>{label}</div>
                    <input value={draft[field]||""} onChange={e=>setDraft({...draft,[field]:e.target.value})}
                      style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box"}} />
                  </div>
                ))}
              </div>
              {/* 2行目: 5列均等グリッド */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8,marginBottom:8}}>
                <div>
                  <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>調性</div>
                  <input value={draft.key||""} onChange={e=>setDraft({...draft,key:e.target.value})}
                    style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box"}} />
                </div>
                <div>
                  <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>作曲年</div>
                  <input value={draft.yearText||""} onChange={e=>setDraft({...draft,yearText:e.target.value})}
                    placeholder="例: 1810"
                    style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box"}} />
                </div>
                <div>
                  <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>演奏時間</div>
                  <input
                    defaultValue={(draft.duration||0)+"分"+(draft.durationSecs>0?(draft.durationSecs+"秒"):"")}
                    onBlur={e=>{
                      const raw=e.target.value.trim();
                      const colonMatch=raw.match(/^(\d+):(\d+)$/);
                      const mMatch=raw.match(/(\d+)\s*分/);
                      const sMatch=raw.match(/(\d+)\s*秒/);
                      let m=draft.duration||0, s=0;
                      if(colonMatch){m=parseInt(colonMatch[1]);s=parseInt(colonMatch[2]);}
                      else if(mMatch||sMatch){if(mMatch)m=parseInt(mMatch[1]);if(sMatch)s=parseInt(sMatch[1]);}
                      else{const n=parseInt(raw);if(!isNaN(n))m=n;}
                      setDraft({...draft,duration:m,durationSecs:s});
                      e.target.value=m+"分"+(s>0?(s+"秒"):"");
                    }}
                    placeholder="例: 5分30秒"
                    style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box"}} />
                </div>
                {/* Lv.・Pop.: 育成中(入力不可) */}
                <div>
                  <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>Lv.</div>
                  <input value="育成中" disabled readOnly style={{background:"#F0F2F5",border:"1px solid #C8CEDB",color:"#94A3BE",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box",cursor:"default"}} />
                </div>
                <div>
                  <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>Pop.</div>
                  <input value="育成中" disabled readOnly style={{background:"#F0F2F5",border:"1px solid #C8CEDB",color:"#94A3BE",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box",cursor:"default"}} />
                </div>
              </div>
              {/* メモ */}
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>メモ</div>
                <textarea value={draft.memo||""} onChange={e=>setDraft({...draft,memo:e.target.value})}
                  style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box",minHeight:50,resize:"vertical"}} />
              </div>
              {/* キーワード */}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>キーワード</div>
                <input value={draft.keywords||""} onChange={e=>setDraft({...draft,keywords:e.target.value})}
                  placeholder="カンマ区切り"
                  style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:3,width:"100%",boxSizing:"border-box"}} />
              </div>
              {/* 保存ボタン */}
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
                <button onClick={saveEdit}
                  style={{background:"#C8A860",border:"none",color:"#fff",padding:"5px 18px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:SANS}}>保存</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 後方互換用（旧PieceCardをPieceCardUnifiedに委譲）
const PieceCard = ({ piece, inProgram, canAdd, onAdd, onRemove, expanded, onToggleExpand, isAI, onToggleFav, onToggleCandidate }) => (
  <PieceCardUnified p={piece} expanded={expanded} onToggleExpand={onToggleExpand}
    inProgram={inProgram} canAdd={canAdd} onAdd={onAdd} onRemove={onRemove}
    onToggleFav={onToggleFav} onToggleCandidate={onToggleCandidate} isAI={isAI} />
);

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
        <span style={{position:"absolute",left:8,fontSize:11,color:"#94A3BE",pointerEvents:"none"}}>🔍</span>
        <input
          value={displayVal}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={()=>setOpen(true)}
          onKeyDown={handleKey}
          placeholder="曲名・作曲家を検索…"
          autoComplete="off"
          style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",
            padding:"4px 24px 4px 26px",fontFamily:SANS,fontSize:12,borderRadius:4,
            width:"100%",boxSizing:"border-box",outline:"none"}}
        />
        {displayVal && (
          <span onClick={handleClear} style={{position:"absolute",right:7,fontSize:12,color:"#4A5A7A",cursor:"pointer",userSelect:"none"}}>×</span>
        )}
      </div>
      {open && candidates.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#15233F",border:"1.5px solid #D4A574",
          borderRadius:6,zIndex:200,boxShadow:"0 4px 16px rgba(0,0,0,0.13)",maxHeight:280,overflowY:"auto",marginTop:2}}>
          {candidates.map((item,i) => {
            const isActive = i===cursor;
            if (item.type==="composer") return (
              <div key={i} tabIndex={-1} onClick={()=>selectItem(item)} onMouseEnter={()=>setCursor(i)}
                style={{padding:"7px 12px",cursor:"pointer",fontSize:12,color:"#EDE6D6",
                  background:isActive?"#FDF5ED":"white",display:"flex",alignItems:"center",gap:8,
                  borderBottom:"1px solid #15233F",fontFamily:SANS}}>
                <span style={{fontSize:10,color:"#94A3BE",background:"#15233F",padding:"1px 6px",borderRadius:8}}>作曲家</span>
                <span style={{fontWeight:500}}>{item.label}</span>
              </div>
            );
            const p = item.piece; const era = ERAS[p.era]||ERAS.modern;
            return (
              <div key={i} tabIndex={-1} onClick={()=>selectItem(item)} onMouseEnter={()=>setCursor(i)}
                style={{padding:"7px 12px",cursor:"pointer",background:isActive?"#FDF5ED":"white",
                  display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #15233F"}}>
                <div style={{width:3,height:30,background:era.color,borderRadius:2,flexShrink:0}} />
                <div>
                  <div style={{fontSize:12,color:"#EDE6D6"}}>{p.title}</div>
                  <div style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>{p.composer}　{p.year}年</div>
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

  const inp2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  return (
    <div style={{background:"#EEF1F5",border:"1px solid #D0D6DF",borderRadius:10,padding:22,position:"relative"}}>
      {/* ④ 右上✕ボタン */}
      <button onClick={onCancel} title="キャンセル"
        style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:"#6B7A90",fontSize:18,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
      <div style={{fontSize:15,letterSpacing:3,color:"#6B7A90",marginBottom:16,fontFamily:SANS,fontWeight:600}}>Add Piece</div>

      {/* 1行目: 作曲家・曲名 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>作曲家</div>
          <div style={{position:"relative"}}>
            <input value={piece.composer} onChange={e=>onComposerChange(e.target.value)}
              placeholder="作曲家名を入力…" autoComplete="off"
              style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",borderColor:composerLocked?"#8BAED4":"#C8CEDB",background:composerLocked?"#F0F5FF":"white",color:"#15233F"}} />
            {composerLocked && <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B9AC4"}}>✓</span>}
            {composerSuggestions.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1px solid #C8CEDB",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
                {composerSuggestions.map((name,i)=>(
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectComposer(name)}
                    style={{padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#15233F",borderBottom:"1px solid #E8ECF2",fontFamily:SANS}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F0F4FA"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>{name}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>曲名</div>
          <div style={{position:"relative"}}>
            <input value={piece.title} onChange={e=>onTitleChange(e.target.value)}
              placeholder={piece.composer?piece.composer+"の曲を検索…":"曲名を入力…"}
              autoComplete="off" style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",opacity:piece.composer?1:0.5}} />
            {sugLoading && <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#6B7A90",fontFamily:SANS}}>検索中…</div>}
            {suggestions.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1px solid #C8CEDB",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.10)",maxHeight:300,overflowY:"auto"}}>
                {suggestions.map((s,i)=>{ const era=ERAS[s.era]||ERAS.modern; return (
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectSuggestion(s)}
                    style={{padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #E8ECF2",display:"flex",alignItems:"center",gap:10}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F0F4FA"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <div style={{width:3,height:34,background:era.color,borderRadius:2,flexShrink:0}} />
                    <div>
                      <div style={{fontSize:13,color:"#15233F",marginBottom:2}}>{s.title}</div>
                      <div style={{fontSize:11,color:"#6B7A90",fontFamily:SANS}}>{s.composer}　{s.year}年　{s.key}　{s.duration}分</div>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2行目: 調性・作曲年・演奏時間(国を削除) */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>調性</div>
          <select value={piece.key} onChange={e=>setPiece({...piece,key:e.target.value})} style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}>{KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>作曲年</div>
          <input value={piece.yearText||(piece.year>0?String(piece.year):"")}
            onChange={e=>setPiece({...piece, yearText:e.target.value})}
            placeholder="例: 1810 / 1815-1820 / 不明"
            style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:SANS,textAlign:"left"}}>
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
              style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",borderColor:!durationEdited&&piece.title?"#C8A030":"#C8CEDB"}}
            />
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:24,justifyContent:"center",paddingTop:24,paddingBottom:4}}>
        <button onClick={handleAdd} style={{background:"transparent",border:"1.5px solid #C8A860",color:"#15233F",padding:"8px 28px",cursor:"pointer",fontSize:13,letterSpacing:2,fontFamily:SANS,borderRadius:4}}>追加する</button>
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
  const {saveProfile, profileSaveMsg} = props;
  const {documents, setDocuments, saveDocuments} = props;
  const {docSaveMsg, setDocSaveMsg} = props;
  const {scratchItems, setScratchItems} = props;
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [bioCheck, setBioCheck] = useState({ basic:true, education:true, teacher:true });
  const [showBioPanel, setShowBioPanel] = useState(false);
  const [scratchDragId, setScratchDragId] = useState(null);
  const [scratchOverId, setScratchOverId] = useState(null);
  const onScratchDragEnd = () => {
    if (scratchDragId==null||scratchOverId==null||scratchDragId===scratchOverId) { setScratchDragId(null); setScratchOverId(null); return; }
    const arr=[...scratchItems];
    const from=arr.findIndex(x=>x.id===scratchDragId), to=arr.findIndex(x=>x.id===scratchOverId);
    const moved=arr[from];
    arr.splice(from,1); arr.splice(to,0,moved);
    setScratchItems(arr);
    setScratchDragId(null); setScratchOverId(null);
  };

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

  const buildBio = (lang) => {
    const p = profile;
    const name = lang==="ja" ? (p.nameJa||p.nameEn||"") : (p.nameEn||p.nameJa||"");
    if (!name) return "";
    const yr = s => { const m=(s||"").match(/[0-9]{4}/); return m?m[0]:""; };
    const origin = p.city || (p.nationality && p.nationality!=="ー" ? p.nationality : "");
    const birthYear = yr(p.birthDate||"");
    const intro = lang==="ja"
      ? name+String.fromCharCode(10)+(birthYear?birthYear+"年、":"")+(origin?origin+"出身。":"")
      : name+String.fromCharCode(10)+"Born"+(origin?" in "+origin:"")+(birthYear?" in "+birthYear:"")+". ";
    const allEvts = [...(contestEvents||[]),...(concertEvents||[])].filter(e=>(e.title||e.venue||"").trim()).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
    const middle = allEvts.length>0
      ? allEvts.map(e=> lang==="ja" ? yr(e.date)+"年、"+(e.title||e.venue||"")+(e.notes?"（"+e.notes+"）":"") : yr(e.date)+", "+(e.title||e.venue||"")).join(lang==="ja"?"。"+String.fromCharCode(10):". ")+(lang==="ja"?"。":"")
      : "";
    const teacherNames = (p.teachers||[]).map(t=>t.name).filter(Boolean);
    const teacherStr = teacherNames.length>0 ? (lang==="ja"?"これまでに、"+teacherNames.join("、")+"の各氏に師事。":"Studied with "+teacherNames.join(", ")+". ") : "";
    const eduList = (p.educations||[]).filter(e=>e.school);
    const eduStr = eduList.length>0 ? (lang==="ja"?eduList.map(e=>e.school+(e.status||"")).join("、")+"。":eduList.map(e=>(e.status?e.status+", ":"")+e.school).join(", ")) : "";
    return [intro,middle,teacherStr+eduStr].filter(Boolean).join(String.fromCharCode(10));
  };

  // ── Helpers ──
  const inpS = {background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const lblS = {fontSize:10,color:"#94A3BE",marginBottom:4,fontFamily:SANS};
  const secTitle = (t) => (
    <div style={{fontSize:11,letterSpacing:3,color:"#94A3BE",fontFamily:SANS,marginBottom:10,marginTop:20,borderBottom:"1px solid #1E2A45",paddingBottom:4}}>{t}</div>
  );
  const addBtn = (label,onClick) => (
    <button onClick={onClick} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginTop:6}}>
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
      const ct = contestEvents.map(e=>(e.date.slice(0,4)+"年 "+(e.title||e.venue||"")+(e.notes?" "+e.notes:"")).trim()).join("。"+String.fromCharCode(10));
      parts.push(outLang==="ja"?"【コンクール歴】"+String.fromCharCode(10)+ct+"。":"[Competitions]"+String.fromCharCode(10)+ct+".");
    }
    if (outItems.performances && concertEvents.length>0) {
      const pf = concertEvents.slice(0,10).map(e=>(e.date.slice(0,4)+"年 "+(e.title||e.venue||"")).trim()).join("。"+String.fromCharCode(10));
      parts.push(outLang==="ja"?"【演奏活動】"+String.fromCharCode(10)+pf+"。":"[Performances]"+String.fromCharCode(10)+pf+".");
    }
    if (outItems.upcoming && futureEvents.length>0) {
      const up = futureEvents.map(e=>(e.date+" "+(e.title||e.venue||"")).trim()).join("。"+String.fromCharCode(10));
      parts.push(outLang==="ja"?"【今後の予定】"+String.fromCharCode(10)+up+"。":"[Upcoming]"+String.fromCharCode(10)+up+".");
    }
    if (outItems.repertoire && pieces.length>0) {
      const rep = pieces.slice(0,20).map(p=>p.composer+" / "+p.title).join(outLang==="ja"?"、":", ");
      parts.push(outLang==="ja"?"【レパートリー】"+rep:"[Repertoire] "+rep);
    }
    if (outItems.program) {
      const pgm = prog.pieceIds.map((id,i)=>{const p=allPool.find(x=>x.id===id);return p?(i+1)+". "+p.composer+" / "+p.title:"";}).filter(Boolean).join(String.fromCharCode(10));
      parts.push(outLang==="ja"?"【プログラム】"+String.fromCharCode(10)+pgm:"[Program]"+String.fromCharCode(10)+pgm);
    }

    setOutText(parts.join(String.fromCharCode(10)+String.fromCharCode(10)));
    setOutStep(4);
  };

  const COUNTRIES = ["ー","日本","ドイツ","オーストリア","フランス","イタリア","ロシア","ポーランド","ハンガリー","チェコ","スペイン","イギリス","アメリカ","アルゼンチン","ブラジル","中国","韓国","その他"];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Inner tabs */}
      <div style={{background:"#1E2A45",borderBottom:"2px solid #1E2A45",padding:"0 24px",display:"flex",gap:0,flexShrink:0}}>
        {[["profile","Profile"],["output","Output"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPortfolioTab(k)}
            style={{background:"none",border:"none",
              borderBottom:portfolioTab===k?"3px solid #8B5E3C":"3px solid transparent",
              color:portfolioTab===k?"#0F1A33":"#94A3BE",
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

            <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",marginBottom:16}}>
              {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS,marginRight:8}}>{docSaveMsg}</span>}
              <button onClick={()=>setShowBioPanel(!showBioPanel)}
                style={{background:"transparent",border:"1px solid #C8A860",color:"#C8A860",padding:"8px 18px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                📦 ドキュメント作成
              </button>
            </div>
            {showBioPanel && (
              <div style={{marginTop:10,marginBottom:16,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:SANS,marginBottom:10}}>出力する項目を選んでください</div>
                <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,fontFamily:SANS,color:"#C8CEDB"}}>
                  <label style={{cursor:"pointer"}}><input type="checkbox" checked={bioCheck.basic} onChange={e=>setBioCheck(c=>({...c,basic:e.target.checked}))} style={{accentColor:"#C8A860"}}/> 基本情報</label>
                  <label style={{cursor:"pointer"}}><input type="checkbox" checked={bioCheck.education} onChange={e=>setBioCheck(c=>({...c,education:e.target.checked}))} style={{accentColor:"#C8A860"}}/> 学歴</label>
                  <label style={{cursor:"pointer"}}><input type="checkbox" checked={bioCheck.teacher} onChange={e=>setBioCheck(c=>({...c,teacher:e.target.checked}))} style={{accentColor:"#C8A860"}}/> 師事</label>
                </div>
                <button onClick={()=>{
                  const p = profile;
                  const yr = s => { const m=(s||"").match(/[0-9]{4}/); return m?m[0]:""; };
                  const lines = [];
                  if (bioCheck.basic) {
                    const origin = (p.nationality && p.nationality!=="ー") ? p.nationality : "";
                    const by = yr(p.birthDate||"");
                    lines.push((p.nameJa||p.nameEn||"") + String.fromCharCode(10) + (by?by+"年、":"") + (origin?origin+"出身。":""));
                  }
                  if (bioCheck.education) {
                    const eduList = (p.educations||[]).filter(e=>e.school);
                    if (eduList.length>0) lines.push("【学歴】"+String.fromCharCode(10)+eduList.map(e=>(e.period?e.period+" ":"")+e.school+(e.status||"")).join(String.fromCharCode(10)));
                  }
                  if (bioCheck.teacher) {
                    const tNames = (p.teachers||[]).map(t=>t.name).filter(Boolean);
                    if (tNames.length>0) lines.push("【師事】"+String.fromCharCode(10)+tNames.join("、")+"に師事。");
                  }
                  const text = lines.filter(Boolean).join(String.fromCharCode(10)+String.fromCharCode(10));
                  if (!text) {
                    window.alert("該当するデータがありません");
                    return;
                  }
                  if (text) {
                    const labels = [];
                    if (bioCheck.basic) labels.push("基本情報");
                    if (bioCheck.education) labels.push("学歴");
                    if (bioCheck.teacher) labels.push("師事");
                    const defaultName = labels.length>0 ? labels.join("・") : "プロフィール";
                    const inputName = window.prompt("ドキュメントの名前を入力してください", defaultName);
                    if (inputName===null) return;
                    const finalName = inputName.trim() || defaultName;
                    const doc = { id: Date.now(), name: finalName, text: text };
                    const next = [doc, ...documents];
                    setDocuments(next);
                    saveDocuments(next);
                    setDocSaveMsg("ドキュメントを作成しました ✓");
                    setTimeout(() => setDocSaveMsg(""), 3000);
                    setShowBioPanel(false);
                  }
                }}
                  style={{background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%",fontWeight:600}}>
                  ✓ チェックした項目で、ドキュメント作成
                </button>
              </div>
            )}

            {/* ── アカウント情報 ── */}
            <div style={{fontSize:13,letterSpacing:2,color:"#A8B4C8",fontWeight:600,marginBottom:12,marginTop:4,fontFamily:SANS}}>アカウント情報</div>
            <div style={{display:"flex",flexDirection:"column",gap:18,marginBottom:28}}>
              {[
                ["ニックネーム",   <input value={profile.nameJa} onChange={e=>setProfile(p=>({...p,nameJa:e.target.value}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["メールアドレス", <input value={profile.contact.email} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,email:e.target.value}}))} placeholder="email@example.com" style={{...inpS,flex:1}}/>],
                ["パスワード",     <button disabled style={{background:"none",border:"1px solid #C8CEDB",color:"#A8B4C8",padding:"6px 16px",borderRadius:4,cursor:"not-allowed",fontSize:12,fontFamily:SANS}}>変更（準備中）</button>],
              ].map(([label, input])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:0}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,width:130,flexShrink:0}}>{label}</div>
                  {input}
                </div>
              ))}
            </div>

            {/* ── プロフィール詳細 ── */}
            <div style={{fontSize:13,letterSpacing:2,color:"#A8B4C8",fontWeight:600,marginBottom:12,fontFamily:SANS}}>プロフィール詳細</div>
            <div style={{display:"flex",flexDirection:"column",gap:18}}>
              {[
                ["氏名（日本語）", <input value={profile.nameJa} onChange={e=>setProfile(p=>({...p,nameJa:e.target.value}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["氏名（英語）",   <input value={profile.nameEn} onChange={e=>setProfile(p=>({...p,nameEn:e.target.value}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["生年月日",       <input type="date" value={profile.birthDate} onChange={e=>setProfile(p=>({...p,birthDate:e.target.value}))} style={{...inpS,flex:1}}/>],
                ["国籍",           <div style={{flex:1,position:"relative"}}>
                  <input value={profile.nationality||""} onChange={e=>setProfile(p=>({...p,nationality:e.target.value}))} placeholder="国名を入力（例：Ja → Japan）" style={{...inpS,width:"100%"}}/>
                  {(profile.nationality||"").trim().length>0 && !COUNTRY_LIST.some(c=>c.ja===profile.nationality||c.en===profile.nationality) && (
                    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#16243F",border:"1px solid #2A3A5A",borderRadius:6,zIndex:20,maxHeight:160,overflowY:"auto"}}>
                      {COUNTRY_LIST.filter(c=>{const q=(profile.nationality||"").toLowerCase();return c.ja.toLowerCase().includes(q)||c.en.toLowerCase().includes(q);}).slice(0,8).map(c=>(
                        <div key={c.en} onClick={()=>setProfile(p=>({...p,nationality:c.ja+" / "+c.en}))} style={{padding:"6px 10px",cursor:"pointer",fontSize:13,color:"#EDE6D6",fontFamily:SANS}}>{c.ja} / {c.en}</div>
                      ))}
                    </div>
                  )}
                </div>],
                ["郵便番号",       <input value={profile.postalCode||""} onChange={e=>setProfile(p=>({...p,postalCode:e.target.value}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["住所",           <input value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["電話",           <input value={profile.contact.tel} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,tel:e.target.value}}))} placeholder="" style={{...inpS,flex:1}}/>],
                ["SNS",            <input value={profile.contact.sns} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,sns:e.target.value}}))} placeholder="" style={{...inpS,flex:1}}/>],
              ].map(([label, input])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:0}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,width:130,flexShrink:0}}>{label}</div>
                  {input}
                </div>
              ))}
            </div>

            {/* ①②③④⑤ 学歴・師事者をgap:16統合コンテナで揃える */}
            <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:16}}>
              {(profile.educations||[]).map((ed,idx)=>(
                <div key={ed.id} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,width:130,flexShrink:0}}>{idx===0?"学歴":""}</div>
                  <input value={ed.period||""} onChange={e=>updateListItem("educations",ed.id,{period:e.target.value})} placeholder="期間" style={{...inpS,flex:"0 0 100px"}}/>
                  <input value={ed.school} onChange={e=>updateListItem("educations",ed.id,{school:e.target.value})} placeholder="大学・高校・教室名" style={{...inpS,flex:2}}/>
                  <select value={ed.status||""} onChange={e=>updateListItem("educations",ed.id,{status:e.target.value})} style={{...inpS,flex:"0 0 80px"}}>
                    <option value="">ー</option>
                    <option value="入学">入学</option>
                    <option value="在学中">在学中</option>
                    <option value="在籍中">在籍中</option>
                    <option value="卒業">卒業</option>
                    <option value="修了">修了</option>
                  </select>
                  <button onClick={()=>removeListItem("educations",ed.id)} style={{background:"none",border:"none",color:"#94A3BE",cursor:"pointer",fontSize:14,flexShrink:0,padding:"0 4px"}}>×</button>
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:130,flexShrink:0}}/>
                {addBtn("学歴を追加",()=>addListItem("educations",{period:"",school:"",status:""}))}
              </div>
              {(profile.teachers||[]).map((t,idx)=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,width:130,flexShrink:0}}>{idx===0?"師事者":""}</div>
                  <input value={t.period||""} onChange={e=>updateListItem("teachers",t.id,{period:e.target.value})} placeholder="期間" style={{...inpS,flex:"0 0 100px"}}/>
                  <input value={t.name} onChange={e=>updateListItem("teachers",t.id,{name:e.target.value})} placeholder="師事者名" style={{...inpS,flex:1}}/>
                  <input value={t.note||""} onChange={e=>updateListItem("teachers",t.id,{note:e.target.value})} placeholder="備考" style={{...inpS,flex:2}}/>
                  <button onClick={()=>removeListItem("teachers",t.id)} style={{background:"none",border:"none",color:"#94A3BE",cursor:"pointer",fontSize:14,flexShrink:0,padding:"0 4px"}}>×</button>
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:130,flexShrink:0}}/>
                {addBtn("師事者を追加",()=>addListItem("teachers",{period:"",name:"",note:""}))}
              </div>
            </div>

            {/* 保存ボタン */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:8,paddingTop:16,borderTop:"1px solid #1E2A45"}}>
              {profileSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{profileSaveMsg}</span>}
              <button onClick={saveProfile}
                style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",
                  borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:SANS}}>
                保存
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── OUTPUT ── */}
      {portfolioTab==="output" && (
        <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>
          <div style={{maxWidth:680,margin:"0 auto",display:"flex",flexDirection:"column",gap:20}}>

            {/* ⑤ 全ステップを1ページに */}

            {/* ▼▼ STEP 1〜3 を眠らせています（false で非表示・将来復活可能） ▼▼ */}
            {false && (<React.Fragment>
            {/* STEP 1: 出力したい項目を選ぶ */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:10}}>STEP 1　出力したい項目を選んでください（複数選択可）</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  ["profile","プロフィール"],
                  ["repertoire","レパートリー"],
                  ["program","プログラム"],
                  ["contests","コンクール歴"],
                  ["performances","演奏活動"],
                  ["upcoming","現在の活動"],
                ].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                    background:outItems[k]?"#F4F6F9":"#15233F",
                    border:outItems[k]?"1.5px solid #C8A860":"1px solid #1E2A45",
                    borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:SANS,
                    color:outItems[k]?"#15233F":"#94A3BE"}}>
                    <input type="checkbox" checked={outItems[k]||false}
                      onChange={e=>setOutItems(prev=>({...prev,[k]:e.target.checked}))}
                      style={{accentColor:"#C8A860"}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* STEP 2: レパートリー選択 */}
            {outItems.repertoire && (
              <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS}}>STEP 2　レパートリーの内容を選ぶ</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setOutRepIds(pieces.map(p=>p.id))}
                      style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>すべて選択</button>
                    <button onClick={()=>setOutRepIds([])}
                      style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>すべて解除</button>
                  </div>
                </div>
                <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
                  {pieces.map(p=>{
                    const era=ERAS[p.era]||ERAS.modern;
                    const checked=outRepIds.includes(p.id);
                    return (
                      <label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",
                        background:checked?"#F4F6F9":"#15233F",borderRadius:4,cursor:"pointer",
                        border:checked?"1.5px solid #C8A860":"1px solid #1E2A45",
                        fontSize:12,fontFamily:SANS,color:checked?"#15233F":"#94A3BE"}}>
                        <input type="checkbox" checked={checked}
                          onChange={e=>setOutRepIds(prev=>e.target.checked?[...prev,p.id]:prev.filter(x=>x!==p.id))}
                          style={{accentColor:"#C8A860"}}/>
                        <span style={{fontSize:9,color:era.color,flexShrink:0}}>●</span>
                        <span style={{fontSize:10,flexShrink:0}}>{p.composer}</span>
                        <span style={{flex:1}}>{p.title}</span>
                        <span style={{fontSize:10,color:"#94A3BE"}}>{p.duration}分{p.durationSecs>0?p.durationSecs+"秒":""}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: 出力言語 */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:10,textAlign:"center"}}>STEP 3　出力言語</div>
              <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
                {[["ja","日本語"],["en","English"]].map(([v,l])=>(
                  <label key={v} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",
                    background:outLang===v?"#F4F6F9":"#15233F",
                    border:outLang===v?"1.5px solid #C8A860":"1px solid #1E2A45",
                    borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:SANS,
                    color:outLang===v?"#15233F":"#94A3BE"}}>
                    <input type="radio" value={v} checked={outLang===v} onChange={()=>setOutLang(v)} style={{accentColor:"#C8A860"}}/>
                    {l}
                  </label>
                ))}
                <button onClick={()=>{
                    const p=profile;
                    const name=outLang==="ja"?(p.nameJa||p.nameEn||""):(p.nameEn||p.nameJa||"");
                    const parts=[];
                    if(outItems.profile&&name){const yr=s=>{const m=(s||"").match(/[0-9]{4}/);return m?m[0]:"";};const origin=p.city||(p.nationality&&p.nationality!=="ー"?p.nationality:"");const birthYear=yr(p.birthDate||"");const intro=outLang==="ja"?name+String.fromCharCode(10)+(birthYear?birthYear+"年、":"")+(origin?origin+"出身。":""):name+String.fromCharCode(10)+"Born"+(origin?" in "+origin:"")+(birthYear?" in "+birthYear:".")+". ";const allEvts=[...(contestEvents||[]),...(concertEvents||[])].filter(e=>(e.title||e.venue||"").trim()).sort((a,b)=>(a.date||"").localeCompare(b.date||""));const middle=allEvts.length>0?allEvts.map(e=>outLang==="ja"?yr(e.date)+"年、"+(e.title||e.venue||"")+(e.notes?"（"+e.notes+"）":""):yr(e.date)+", "+(e.title||e.venue||"")).join(outLang==="ja"?"。"+String.fromCharCode(10):"."+" ")+(outLang==="ja"?"。":""):"";const teacherNames=(p.teachers||[]).map(t=>t.name).filter(Boolean);const teacherStr=teacherNames.length>0?(outLang==="ja"?"これまでに、"+teacherNames.join("、")+"の各氏に師事。":"Studied with "+teacherNames.join(", ")+". "):"";const eduList=(p.educations||[]).filter(e=>e.school);const eduStr=eduList.length>0?(outLang==="ja"?eduList.map(e=>e.school+(e.status||"")).join("、")+"。":eduList.map(e=>(e.status?e.status+", ":"")+e.school).join(", ")):"";const bio=[intro,middle,teacherStr+eduStr].filter(Boolean).join(String.fromCharCode(10));parts.push(bio);}
                    if(outItems.repertoire&&outRepIds.length>0){const rep=pieces.filter(p=>outRepIds.includes(p.id)).map(p=>p.composer+" / "+p.title).join(String.fromCharCode(10));parts.push(outLang==="ja"?"【レパートリー】"+String.fromCharCode(10)+rep:"[Repertoire]"+String.fromCharCode(10)+rep);}
                    if(outItems.contests&&contestEvents.length>0){const ct=contestEvents.map(e=>e.date.slice(0,7)+" "+(e.title||e.venue||"")).join("。"+String.fromCharCode(10));parts.push(outLang==="ja"?"【コンクール歴】"+String.fromCharCode(10)+ct:"[Competitions]"+String.fromCharCode(10)+ct);}
                    if(outItems.performances&&concertEvents.length>0){const pf=concertEvents.slice(0,10).map(e=>e.date.slice(0,7)+" "+(e.title||e.venue||"")).join("。"+String.fromCharCode(10));parts.push(outLang==="ja"?"【演奏活動】"+String.fromCharCode(10)+pf:"[Performances]"+String.fromCharCode(10)+pf);}
                    if(outItems.upcoming&&futureEvents.length>0){const up=futureEvents.map(e=>e.date+" "+(e.title||e.venue||"")).join("。"+String.fromCharCode(10));parts.push(outLang==="ja"?"【今後の予定】"+String.fromCharCode(10)+up:"[Upcoming]"+String.fromCharCode(10)+up);}
                    if(outItems.program){const found=prog.pieceIds.map(id=>allPool.find(x=>x.id===id)).filter(Boolean);const pgm=found.map((px,i)=>(i+1)+". "+px.composer+" / "+px.title).join(String.fromCharCode(10));parts.push(outLang==="ja"?"【プログラム】"+String.fromCharCode(10)+pgm:"[Program]"+String.fromCharCode(10)+pgm);}
                    setOutText(parts.join(String.fromCharCode(10)+String.fromCharCode(10)));
                  }}
                  style={{marginLeft:"auto",background:"#C8A860",border:"none",color:"#0F1A33",padding:"7px 20px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,fontWeight:"bold"}}>
                  生成する
                </button>
              </div>
            </div>
            </React.Fragment>)}
            {/* ▲▲ STEP 1〜3 ここまで眠り ▲▲ */}

            {/* 🎨 スクラッチ（組み立て） */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px",marginTop:12}}>
              <div style={{fontSize:13,color:"#E8ECF4",fontFamily:SANS,marginBottom:12,letterSpacing:1}}>🎨 スクラッチ（組み立て）</div>
              <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,marginBottom:10}}>ボックスのパーツを並べて、1つの書類に組み立てます</div>
              {scratchItems.length===0 ? (
                <div style={{fontSize:12,color:"#5A6B8C",fontFamily:SANS,textAlign:"center",padding:"12px 0"}}>
                  下の「＋ボックスから追加」で、パーツを足してください
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {scratchItems.map((item,idx)=>(
                    <div key={item.id} draggable
                      onDragStart={()=>setScratchDragId(item.id)}
                      onDragEnter={()=>setScratchOverId(item.id)}
                      onDragEnd={onScratchDragEnd}
                      onDragOver={e=>e.preventDefault()}
                      style={{display:"flex",alignItems:"center",gap:8,background:scratchOverId===item.id?"#1A2740":"#0F1A33",border:"1px solid #1E2A45",borderRadius:4,padding:"8px 10px",cursor:"grab"}}>
                      <span style={{color:"#6B7A90",fontSize:13,cursor:"grab"}}>⠿</span>
                      <span style={{fontSize:12,color:"#6B7A90",fontFamily:SANS,minWidth:18}}>{idx+1}</span>
                      <span style={{flex:1,fontSize:12,color:"#C8CEDB",fontFamily:SANS,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</span>
                      <button onClick={()=>setScratchItems(scratchItems.filter((_,i)=>i!==idx))}
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                        外す
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={()=>{
                  if(documents.length===0){ window.alert("先にボックスにドキュメントを保存してください"); return; }
                  setShowAddPanel(!showAddPanel);
                }}
                style={{marginTop:10,background:"transparent",border:"1px dashed #C8A860",color:"#C8A860",padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%"}}>
                ＋ ボックスから追加
              </button>
              {showAddPanel && (
                <div style={{marginTop:8,background:"#0F1A33",border:"1px solid #1E2A45",borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:SANS,marginBottom:8}}>追加したいパーツをクリック</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {documents.map(doc=>(
                      <button key={doc.id} onClick={()=>{
                          setScratchItems([...scratchItems, {id:Date.now()+"_"+doc.id, name:doc.name, text:doc.text}]);
                        }}
                        style={{textAlign:"left",background:"#15233F",border:"1px solid #2A3A5A",color:"#C8CEDB",padding:"7px 10px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                        ＋ {doc.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setShowAddPanel(false)}
                    style={{marginTop:8,background:"transparent",border:"none",color:"#6B7A90",padding:"4px 0",cursor:"pointer",fontSize:11,fontFamily:SANS}}>
                    閉じる
                  </button>
                </div>
              )}
              {scratchItems.length>0 && (
                <button onClick={()=>{
                    const combined = scratchItems.map(it=>it.text).join(String.fromCharCode(10)+String.fromCharCode(10));
                    setOutText(combined);
                    window.scrollTo({top:0, behavior:"smooth"});
                  }}
                  style={{marginTop:10,background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%",fontWeight:600}}>
                  ▲ この順番で、編集画面に送る
                </button>
              )}
            </div>

            {/* STEP 4: 編集 */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:6,textAlign:"center"}}>編集</div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
                <span style={{fontSize:11,color:"#94A3BE",fontFamily:SANS}}>{outText.length} 文字</span>
              </div>
              <textarea value={outText} onChange={e=>setOutText(e.target.value)}
                style={{width:"100%",minHeight:200,background:"#F4F6F9",border:"1px solid #C8CEDB",
                  color:"#15233F",padding:"10px",fontFamily:SANS,fontSize:13,borderRadius:4,
                  lineHeight:1.8,resize:"vertical",boxSizing:"border-box"}}/>
            </div>

            {/* STEP 5: 出力 */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:12,textAlign:"center"}}>出力</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
                <button onClick={()=>{const w=window.open("","_blank");const html=outText.split(String.fromCharCode(10)).join("<br>");w.document.write("<html><body style='font-family:serif;padding:40px;line-height:1.9;color:#0F1A33'>"+html+"</body></html>");w.document.close();w.print();}}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  🖨 PDF / 印刷
                </button>
                <button onClick={()=>{const blob=new Blob(["<html><body style='font-family:serif;font-size:12pt;line-height:1.8;'>"+outText.split(String.fromCharCode(10)).join("<br>")+"</body></html>"],{type:"application/msword"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="repertia_output.doc";a.click();}}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  📄 Word でダウンロード
                </button>
                <button onClick={()=>navigator.clipboard.writeText(outText).catch(()=>{})}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  📋 コピー
                </button>
                <button onClick={()=>{
                    if(!outText||!outText.trim()) return;
                    const firstLine = outText.slice(0,18).split(String.fromCharCode(10)).join(" ");
                    const doc = {id:Date.now(), name:(firstLine||"無題")+" / "+new Date().toLocaleDateString(), text:outText};
                    const next=[doc,...documents];
                    setDocuments(next); saveDocuments(next);
                    setDocSaveMsg("ボックスに保存しました ✓");
                    setTimeout(() => setDocSaveMsg(""), 3000);
                  }}
                  style={{background:"#1E2A45",border:"1px solid #C8A860",color:"#E8ECF4",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4}}>
                  📦 ボックスに保存
                </button>
                {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS,marginLeft:8,alignSelf:"center"}}>{docSaveMsg}</span>}
              </div>
              <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#94A3BE",fontFamily:SANS}}>
                Googleドキュメント等に貼り付けて編集できます
              </div>
            </div>

            {/* 📦 ドキュメントボックス */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px",marginTop:12}}>
              <div style={{fontSize:13,color:"#E8ECF4",fontFamily:SANS,marginBottom:12,letterSpacing:1}}>📦 ドキュメントボックス</div>
              {documents.length===0 ? (
                <div style={{fontSize:12,color:"#5A6B8C",fontFamily:SANS,textAlign:"center",padding:"12px 0"}}>
                  保存した書類がここに溜まります
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {documents.map(doc=>(
                    <div key={doc.id} style={{display:"flex",alignItems:"center",gap:8,background:"#0F1A33",border:"1px solid #1E2A45",borderRadius:4,padding:"8px 10px"}}>
                      <span style={{flex:1,fontSize:12,color:"#C8CEDB",fontFamily:SANS,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</span>
                      <button onClick={()=>setOutText(doc.text)}
                        style={{background:"transparent",border:"1px solid #C8A860",color:"#C8A860",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                        読込
                      </button>
                      <button onClick={()=>{
                          const nm = window.prompt("ドキュメントの名前", doc.name);
                          if (nm !== null && nm.trim() !== "") {
                            const next = documents.map(d => d.id===doc.id ? {...d, name: nm.trim()} : d);
                            setDocuments(next);
                            saveDocuments(next);
                          }
                        }}
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                        名前変更
                      </button>
                      <button onClick={()=>{const next=documents.filter(d=>d.id!==doc.id); setDocuments(next); saveDocuments(next);}}
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
    <div style={{borderBottom:"1px solid #1E2A45",background:"#15233F",flexShrink:0}}>
      <div style={{padding:"8px 12px",display:"flex",gap:6,alignItems:"center"}}>
        <SearchBox searchQ={searchQ} setSearchQ={setSearchQ} allPool={pool} />
        <div style={{display:"flex",gap:0,alignItems:"stretch"}}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{...sel(),fontFamily:SANS,fontSize:11,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
            <option value="" disabled>並べ替え</option>
            <option value="composer">作曲家</option>
            <option value="duration">演奏時間</option>
            <option value="year">作曲年</option>
            <option value="difficulty">Lv.</option>
            <option value="frequency">Pop.</option>
          </select>
          <button onClick={()=>setSortAsc(v=>!v)}
            style={{background:"#15233F",border:"1px solid #1E2A45",color:"#94A3BE",padding:"0 8px",
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
      <text x={cx} y={cy-5} textAnchor="middle" fontSize={20} fontWeight="bold" fill="#0F1A33">{piecesTotal}</text>
      <text x={cx} y={cy+13} textAnchor="middle" fontSize={9} fill="#94A3BE" fontFamily={SANS}>曲</text>
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
          <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>{d.count}</span>
          <div style={{width:"100%",background:d.color,borderRadius:"3px 3px 0 0",height:Math.max(6,(d.count/maxCount)*80)+"px"}}/>
          <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,textAlign:"center",lineHeight:1.2}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── ManagePage (top-level) ──────────────────────────────────────────────────
const ManagePage = (props) => {
  const {pieces, setPieces, poolFiltered, showAdd, setShowAdd} = props;
  const {documents, setDocuments, saveDocuments} = props;
  const {docSaveMsg, setDocSaveMsg} = props;
  const {editMode, setEditMode, onAddPiece, toggleFav} = props;
  const {filterMark, setFilterMark, sortBy, setSortBy, sortAsc, setSortAsc} = props;
  const {searchQ, setSearchQ, sel, fmtDuration} = props;
  const {dashData, dashTotal} = props;
  const {dashAxis, setDashAxis, dashChart, setDashChart} = props;
  const {libraryTab, setLibraryTab, poolMode, setPoolMode} = props;
  const {toggleCandidate, onUpdatePiece} = props;
  const {composerFilter, setComposerFilter, titleFilter, setTitleFilter} = props;
  const {eraFilter, setEraFilter, yearMin, setYearMin, yearMax, setYearMax} = props;
  const {durMin, setDurMin, durMax, setDurMax} = props;
  const {diffMin, setDiffMin, diffMax, setDiffMax} = props;
  const {freqMin, setFreqMin, freqMax, setFreqMax, kwFilter, setKwFilter} = props;
  const {aiPieces, setAiPieces, aiLoading, askAI, toggle, canAdd, prog} = props;
  const {learningIds, setLearningIds, expandedId, setExpandedId} = props;
  const [showRepDocPanel, setShowRepDocPanel] = useState(false);
  const [repDocIds, setRepDocIds] = useState([]);
  return (
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* ② Library タブバー */}
    <div style={{background:"#1E2A45",borderBottom:"2px solid #1E2A45",padding:"0 20px",display:"flex",alignItems:"stretch",flexShrink:0}}>
      {[["repertoire","Repertoire ✦"],["learning","Learning ✧"]].map(([k,l])=>(
        <button key={k} onClick={()=>setLibraryTab(k)}
          style={{background:"none",border:"none",
            borderBottom:libraryTab===k?"3px solid #8B5E3C":"3px solid transparent",
            color:libraryTab===k?"#0F1A33":"#94A3BE",
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
        <div style={{padding:"10px 14px",borderBottom:"1px solid #1E2A45",background:"#15233F",flexShrink:0}}>
          <div style={{fontSize:12,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:10,fontWeight:600}}>Search Piece</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
            <div>
              <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>作曲家</div>
              <input value={composerFilter} onChange={e=>setComposerFilter(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
            <div>
              <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>曲名</div>
              <input value={titleFilter} onChange={e=>setTitleFilter(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
            <div>
              <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>時代</div>
              <select value={eraFilter} onChange={e=>setEraFilter(e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%"}}>
                <option value="">ー</option>
                {ERA_ORDER.filter(k=>k!=="contemporary").map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>キーワード</div>
              <input value={kwFilter} onChange={e=>setKwFilter(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>作曲年</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={yearMin} onChange={e=>setYearMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                <input value={yearMax} onChange={e=>setYearMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>演奏時間（分）</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={durMin} onChange={e=>setDurMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                <input value={durMax} onChange={e=>setDurMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>難易度</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select value={diffMin} onChange={e=>setDiffMin(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                <select value={diffMax} onChange={e=>setDiffMax(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>演奏頻度</span>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select value={freqMin} onChange={e=>setFreqMin(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                  <option value={0}>ー</option>
                  {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                <select value={freqMax} onChange={e=>setFreqMax(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
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
                background:poolMode==="ai"?"#0F1A33":"white",
                border:"2px solid "+(poolMode==="ai"?"#0F1A33":"#2A3F6A"),
                color:poolMode==="ai"?"#C8A860":"#94A3BE",
                cursor:aiLoading?"wait":"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600}}>
              {aiLoading?"…":"New from Database"}
            </button>
          </div>
        </div>
        {/* 結果一覧 */}
        <div style={{flex:1,overflowY:"auto",padding:"14px 12px 8px"}}>
          {poolMode!=="ai" && aiPieces.length===0 && (
            <div style={{textAlign:"center",color:"#4A5A7A",padding:"32px 12px",fontSize:12,lineHeight:2,fontFamily:SANS}}>
              「New from Database」で追加した曲はLearningリストに保存されます
            </div>
          )}
          {aiLoading && (
            <div style={{textAlign:"center",color:"#94A3BE",padding:"24px",fontSize:12,fontFamily:SANS}}>✧ 検索中…</div>
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
                  background:"#15233F",border:"1px solid #1E2A45",borderLeft:"3px solid "+era.color,borderRadius:5}}>
                  <span style={{fontSize:11,color:"#A0A0A8",flexShrink:0}}>✧</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:"#EDE6D6",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</div>
                    <div style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>{p.composer} / {p.key} / {p.duration}分{p.durationSecs>0?p.durationSecs+"秒":""}</div>
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
                    style={{background:inProg?"#1E2A45":"#0F1A33",border:"none",color:inProg?"#4A5A7A":"#E8D090",
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
      <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:10,padding:"18px 20px",marginBottom:20}}>
        {/* 総レパートリー数 + グラフ切り替えボタン */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span style={{fontSize:36,fontWeight:700,color:"#EDE6D6",fontFamily:FONT,lineHeight:1}}>{pieces.length}</span>
            <span style={{fontSize:13,color:"#94A3BE",fontFamily:SANS}}>曲</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            {/* 軸切り替え */}
            {[["era","時代別"],["difficulty","難易度別"],["frequency","演奏頻度別"]].map(([k,l])=>(
              <button key={k} onClick={()=>setDashAxis(k)}
                style={{background:dashAxis===k?"#0F1A33":"white",border:"1px solid "+(dashAxis===k?"#0F1A33":"#1E2A45"),color:dashAxis===k?"#C8A860":"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                {l}
              </button>
            ))}
            <div style={{width:1,height:16,background:"#1E2A45",margin:"0 2px"}}/>
            {/* グラフ種別 */}
            {[["pie","●"],["bar","▬"]].map(([k,icon])=>(
              <button key={k} onClick={()=>setDashChart(k)}
                style={{background:dashChart===k?"#0F1A33":"white",border:"1px solid "+(dashChart===k?"#0F1A33":"#1E2A45"),color:dashChart===k?"#C8A860":"#94A3BE",padding:"4px 9px",cursor:"pointer",fontSize:13,borderRadius:4}}>
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
                <span style={{fontSize:11,color:"#EDE6D6",fontFamily:SANS,flex:1}}>{d.label}</span>
                <span style={{fontSize:11,color:"#94A3BE",fontFamily:SANS}}>{d.count}曲</span>
                <span style={{fontSize:10,color:"#4A5A7A",fontFamily:SANS,width:32,textAlign:"right"}}>{Math.round(d.count/dashTotal*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ② ボタン行 — 右端に寄せる */}
      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10,marginBottom:20,marginTop:8}}>
        {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS,marginRight:4}}>{docSaveMsg}</span>}
        <button onClick={()=>{
            if (poolFiltered.length===0) { window.alert("該当するデータがありません"); return; }
            setShowRepDocPanel(!showRepDocPanel);
          }}
          style={{background:"#0F1A33",border:"none",color:"#C8A860",
            padding:"10px 24px",cursor:"pointer",fontSize:14,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
          📦 ドキュメント作成
        </button>
        <button onClick={()=>{ setShowAdd(!showAdd); setEditMode(false); }}
          style={{background:"#0F1A33",border:"none",color:"#C8A860",
            padding:"10px 24px",cursor:"pointer",fontSize:14,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
          ＋ 曲を追加
        </button>
      </div>

      {showRepDocPanel && (
        <div style={{marginTop:10,marginBottom:20,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:SANS}}>出力する曲を選んでください</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setRepDocIds(poolFiltered.map(p=>p.id))}
                style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>すべて選択</button>
              <button onClick={()=>setRepDocIds([])}
                style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>すべて解除</button>
            </div>
          </div>
          <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {poolFiltered.map(p=>{
              const checked=repDocIds.includes(p.id);
              return (
                <label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",
                  background:checked?"#F4F6F9":"#15233F",borderRadius:4,cursor:"pointer",
                  border:checked?"1.5px solid #C8A860":"1px solid #1E2A45",
                  fontSize:12,fontFamily:SANS,color:checked?"#15233F":"#94A3BE"}}>
                  <input type="checkbox" checked={checked}
                    onChange={e=>setRepDocIds(prev=>e.target.checked?[...prev,p.id]:prev.filter(x=>x!==p.id))}
                    style={{accentColor:"#C8A860"}}/>
                  <span style={{fontSize:10,flexShrink:0}}>{p.composer}</span>
                  <span style={{flex:1}}>{p.title}</span>
                </label>
              );
            })}
          </div>
          <button onClick={()=>{
              const sel = poolFiltered.filter(p=>repDocIds.includes(p.id));
              if (sel.length===0) { window.alert("該当するデータがありません"); return; }
              const body = sel.map(p=>p.composer+" / "+p.title).join(String.fromCharCode(10));
              const text = "【レパートリー】"+String.fromCharCode(10)+body;
              const defaultName = "レパートリー（"+sel.length+"曲）";
              const inputName = window.prompt("ドキュメントの名前を入力してください", defaultName);
              if (inputName===null) return;
              const finalName = inputName.trim() || defaultName;
              const doc = { id: Date.now(), name: finalName, text: text };
              const next = [doc, ...documents];
              setDocuments(next);
              saveDocuments(next);
              setShowRepDocPanel(false);
              setRepDocIds([]);
              setDocSaveMsg("ドキュメントを作成しました ✓");
              setTimeout(() => setDocSaveMsg(""), 3000);
            }}
            style={{marginTop:10,background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%",fontWeight:600}}>
            ✓ チェックした曲で、ドキュメント作成
          </button>
        </div>
      )}

      {/* 曲追加フォーム — 境界線で視覚的に分離 */}
      {showAdd && (
        <div style={{marginBottom:24}}>
          <AddPieceForm onAdd={onAddPiece} onCancel={()=>setShowAdd(false)} />
        </div>
      )}

      {/* 一覧エリア — フォームと分ける境界 */}
      <div style={{background:"#15233F",borderRadius:8,border:"1px solid #1E2A45",overflow:"hidden"}}>
        <FilterBar pool={pieces} searchQ={searchQ} setSearchQ={setSearchQ} sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc} filterMark={filterMark} setFilterMark={setFilterMark} poolFiltered={poolFiltered} editMode={editMode} setEditMode={setEditMode} sel={sel} SANS={SANS} />
        <div style={{padding:"8px 8px"}}>
          {poolFiltered.map(p => (
            <div key={p.id}>
              <PieceCardUnified
                p={p}
                expanded={expandedId===p.id}
                onToggleExpand={()=>setExpandedId(expandedId===p.id?null:p.id)}
                inProgram={undefined}
                onToggleFav={()=>toggleFav(p.id)}
                onToggleCandidate={()=>toggleCandidate&&toggleCandidate(p.id)}
                showControls={true}
                onUpdatePiece={onUpdatePiece}
                learningIds={learningIds}
              />
              {editMode && expandedId===p.id && (
                <div style={{padding:"4px 12px 8px",background:"#15233F"}}>
                  <button onClick={async()=>{setPieces(ps=>ps.filter(x=>x.id!==p.id));await supabase.from('pieces').delete().eq('id',p.id);}}
                    style={{background:"none",border:"1px solid #C0405A",color:"#C0405A",padding:"3px 12px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:SANS}}>
                    削除
                  </button>
                </div>
              )}
            </div>
          ))}
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
const EventsPage = ({events, setEvents, FONT, SANS, toggle, onDragEnd, prog, saveEvents, eventsSaveMsg, documents, setDocuments, saveDocuments, docSaveMsg, setDocSaveMsg}) => {
  const [evtCheck, setEvtCheck] = useState({ contest:true, concert:true, recital:true, other:true });
  const [showEvtPanel, setShowEvtPanel] = useState(false);
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
    openTime:"", startTime:"", contact:"", otherLabel:"",
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

  const inpE={background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const selE={background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,width:"100%"};
  const secLbl=(t)=>(<div style={{fontSize:10,color:"#94A3BE",letterSpacing:2,fontFamily:SANS,marginBottom:6,marginTop:14,borderBottom:"1px solid #15233F",paddingBottom:3}}>{t}</div>);

  // ── Event detail card ──
  const EventDetail = ({ev, compact=false}) => {
    const et = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
    return (
      <div style={{borderTop:"1px solid #15233F",paddingTop:8,fontSize:12,color:"#94A3BE",fontFamily:SANS,display:"flex",flexDirection:"column",gap:5}}>
        {ev.organizer && <div><span style={{color:"#94A3BE"}}>主催：</span>{ev.organizer}</div>}
        {(ev.openTime||ev.startTime) && (
          <div><span style={{color:"#94A3BE"}}>時間：</span>
            {ev.openTime?"開場 "+ev.openTime:""}
            {ev.openTime&&ev.startTime?" / ":""}
            {ev.startTime?"開演 "+ev.startTime:""}
          </div>
        )}
        {ev.contact && <div><span style={{color:"#94A3BE"}}>問い合わせ：</span>{ev.contact}</div>}
        {ev.items&&ev.items.length>0 && (
          <div>
            <div style={{color:"#94A3BE",marginBottom:3}}>曲目：</div>
            {ev.items.map((it,idx)=>(
              <div key={it.id} style={{paddingLeft:8,marginBottom:2,fontSize:11}}>
                {it.kind==="break"
                  ? <span style={{color:"#94A3BE",fontStyle:"italic"}}>― 休憩 ―</span>
                  : <span>{idx+1}. {it.performer&&<span style={{color:"#94A3BE"}}>{it.performer}　</span>}{it.pieceTitle}{it.duration&&<span style={{color:"#94A3BE"}}>　{it.duration}</span>}</span>
                }
              </div>
            ))}
          </div>
        )}
        {ev.notes && <div><span style={{color:"#94A3BE"}}>メモ：</span>{ev.notes}</div>}
        {ev.videoUrl && <div><span style={{color:"#94A3BE"}}>動画：</span><a href={ev.videoUrl} target="_blank" rel="noreferrer" style={{color:"#5B7FA6"}}>{ev.videoUrl}</a></div>}
        {ev.posterUrl && <img src={ev.posterUrl} alt="poster" style={{width:80,height:80,objectFit:"cover",borderRadius:4,border:"1px solid #1E2A45",alignSelf:"flex-start",marginTop:4}}/>}
        {!compact && (
          <div style={{display:"flex",gap:8,marginTop:4,justifyContent:"flex-end"}}>
            <button onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"2px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:3}}>✎ 編集</button>
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
          <span style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS}}>{label}</span>
          <span style={{fontSize:10,color:"#4A5A7A",fontFamily:SANS}}>({evs.length}件)</span>
          <span style={{fontSize:11,color:"#2A3F6A"}}>{open?"▲":"▼"}</span>
        </button>
        {open && (
          <div style={{position:"relative",paddingLeft:36}}>
            <div style={{position:"absolute",left:12,top:0,bottom:0,width:2,background:"#1E2A45"}}/>
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
                    style={{background:"#15233F",border:"1px solid #1E2A45",borderLeft:"3px solid "+et.color,
                      borderRadius:6,padding:"9px 12px",cursor:"pointer",
                      boxShadow:isSelected?"0 2px 10px rgba(0,0,0,0.08)":"none",
                      transition:"box-shadow 0.2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      
                      <span style={{fontSize:12,color:"#EDE6D6",fontFamily:FONT,fontWeight:600}}>{ev.date}</span>
                      {ev.title && <span style={{fontSize:12,color:"#EDE6D6",fontFamily:SANS}}>{ev.title}</span>}
                      {ev.venue && <span style={{fontSize:11,color:"#94A3BE",fontFamily:SANS}}>{ev.venue}</span>}
                      <span style={{marginLeft:"auto",fontSize:10,color:"#2A3F6A"}}>{isSelected?"▲":"▼"}</span>
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
            <div key={ev.id} style={{background:"#15233F",border:"1px solid #1E2A45",borderLeft:"4px solid "+et.color,borderRadius:6,marginBottom:6,overflow:"hidden"}}>
              <div onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:et.color,flexShrink:0}}></div>
                <span style={{fontSize:12,color:"#94A3BE",fontFamily:SANS,flexShrink:0}}>{ev.date}</span>
                <span style={{fontSize:13,color:"#EDE6D6",fontFamily:SANS,flex:1,fontWeight:500}}>{ev.title||"（無題）"}</span>
                {ev.venue && <span style={{fontSize:11,color:"#94A3BE",fontFamily:SANS}}>{ev.venue}</span>}
                <span style={{fontSize:11,color:"#2A3F6A"}}>{isSelected?"▲":"▼"}</span>
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
        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:10,marginBottom:10}}>
          {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS,marginRight:4}}>{docSaveMsg}</span>}
          <button onClick={()=>setShowEvtPanel(!showEvtPanel)}
            style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 20px",
              cursor:"pointer",fontSize:13,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
            📦 ドキュメント作成
          </button>
          <button onClick={openAdd}
            style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 20px",
              cursor:"pointer",fontSize:13,fontFamily:SANS,borderRadius:4,letterSpacing:0.5,fontWeight:"bold"}}>
            ＋ イベントを追加
          </button>
        </div>
        {showEvtPanel && (
          <div style={{marginBottom:10,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
            <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:SANS,marginBottom:10}}>出力する種類を選んでください</div>
            <div style={{display:"flex",gap:14,marginBottom:12,fontSize:12,fontFamily:SANS,color:"#C8CEDB",flexWrap:"wrap"}}>
              <label style={{cursor:"pointer"}}><input type="checkbox" checked={evtCheck.contest} onChange={e=>setEvtCheck(c=>({...c,contest:e.target.checked}))} style={{accentColor:"#C8A860"}}/> コンクール</label>
              <label style={{cursor:"pointer"}}><input type="checkbox" checked={evtCheck.concert} onChange={e=>setEvtCheck(c=>({...c,concert:e.target.checked}))} style={{accentColor:"#C8A860"}}/> コンサート</label>
              <label style={{cursor:"pointer"}}><input type="checkbox" checked={evtCheck.recital} onChange={e=>setEvtCheck(c=>({...c,recital:e.target.checked}))} style={{accentColor:"#C8A860"}}/> 発表会</label>
              <label style={{cursor:"pointer"}}><input type="checkbox" checked={evtCheck.other} onChange={e=>setEvtCheck(c=>({...c,other:e.target.checked}))} style={{accentColor:"#C8A860"}}/> その他</label>
            </div>
            <button onClick={()=>{
              const today = new Date().toISOString().slice(0,10);
              const yr = s => { const m=(s||"").match(/[0-9]{4}/); return m?m[0]:""; };
              const past = events.filter(e=>(e.date||"")<=today);
              const contest = past.filter(e=>e.type==="contest").sort((a,b)=>(a.date||"").localeCompare(b.date||""));
              const concert = past.filter(e=>e.type==="concert").sort((a,b)=>(a.date||"").localeCompare(b.date||""));
              const recital = past.filter(e=>e.type==="recital").sort((a,b)=>(a.date||"").localeCompare(b.date||""));
              const other   = past.filter(e=>e.type==="other").sort((a,b)=>(a.date||"").localeCompare(b.date||""));
              const fmt = arr => arr.map(e=>yr(e.date)+"年 "+(e.title||e.venue||"")+(e.notes?" "+e.notes:"")).join(String.fromCharCode(10));
              const blocks = [];
              if (evtCheck.contest && contest.length>0) blocks.push("【コンクール歴】"+String.fromCharCode(10)+fmt(contest));
              if (evtCheck.concert && concert.length>0) blocks.push("【コンサート】"+String.fromCharCode(10)+fmt(concert));
              if (evtCheck.recital && recital.length>0) blocks.push("【発表会】"+String.fromCharCode(10)+fmt(recital));
              if (evtCheck.other && other.length>0)     blocks.push("【その他】"+String.fromCharCode(10)+fmt(other));
              if (blocks.length===0) {
                window.alert("該当するデータがありません");
                return;
              }
              if (blocks.length>0) {
                const text = blocks.join(String.fromCharCode(10)+String.fromCharCode(10));
                const labels = [];
                if (evtCheck.contest && contest.length>0) labels.push("コンクール歴");
                if (evtCheck.concert && concert.length>0) labels.push("コンサート");
                if (evtCheck.recital && recital.length>0) labels.push("発表会");
                if (evtCheck.other && other.length>0) labels.push("その他");
                const defaultName = labels.length>0 ? labels.join("・") : "演奏歴";
                const inputName = window.prompt("ドキュメントの名前を入力してください", defaultName);
                if (inputName===null) return;
                const finalName = inputName.trim() || defaultName;
                const doc = { id: Date.now(), name: finalName, text: text };
                const next = [doc, ...documents];
                setDocuments(next);
                saveDocuments(next);
                setDocSaveMsg("ドキュメントを作成しました ✓");
                setTimeout(() => setDocSaveMsg(""), 3000);
                setShowEvtPanel(false);
              }
            }}
              style={{background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%",fontWeight:600}}>
              ✓ チェックした種類で、ドキュメント作成
            </button>
          </div>
        )}
        {/* ⑤ 2行目：検索・フィルター */}
        <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
          <input
            value={evSearch} onChange={e=>setEvSearch(e.target.value)}
            placeholder="キーワードで検索"
            style={{background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"6px 10px",fontFamily:SANS,fontSize:12,borderRadius:4,width:160}}
          />
          <select value={evTypeFilter} onChange={e=>setEvTypeFilter(e.target.value)}
            style={{background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"6px 8px",fontFamily:SANS,fontSize:12,borderRadius:4}}>
            <option value="">すべての種別</option>
            {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <div style={{background:"#EEF1F5",border:"1px solid #D0D6DF",borderRadius:10,padding:18,marginBottom:20}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#94A3BE",marginBottom:14,fontFamily:SANS,fontWeight:600}}>
              {editingId ? "✎ イベントを編集" : "Add Event"}
            </div>

            {/* ① 日付・種別・内容・場所 を1行に */}
            <div style={{display:"grid",gridTemplateColumns:"120px auto 1fr 1fr",gap:8,marginBottom:12,alignItems:"end"}}>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>日付</div><input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{...inpE,fontSize:11,padding:"4px 6px"}}/></div>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>種別</div>
                <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={{...inpE,width:"auto",fontSize:11,padding:"4px 6px"}}>
                  <option value="">ー</option>
                  {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              {newEvent.type==="other" && (
                <div style={{marginTop:6}}>
                  <div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>どんな催し？（自由入力）</div>
                  <input
                    value={newEvent.otherLabel||""}
                    onChange={e=>setNewEvent({...newEvent,otherLabel:e.target.value})}
                    placeholder="例：マスタークラス、サロンコンサート など"
                    style={inpE}
                  />
                </div>
              )}
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>内容</div><input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="公演タイトル" style={inpE}/></div>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>場所</div><input value={newEvent.venue} onChange={e=>setNewEvent({...newEvent,venue:e.target.value})} placeholder="会場名" style={inpE}/></div>
            </div>

            {/* ②③ 詳細を追加 — トグルボタン、常に表示、openAddしても状態維持 */}
            <div style={{marginBottom:8}}>
              <button onClick={()=>setNewEvent(ev=>({...ev,showDetail:!ev.showDetail}))}
                style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 14px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginBottom:newEvent.showDetail?8:0}}>
                {newEvent.showDetail ? "▲ 詳細を閉じる" : "＋ 詳細を追加"}
              </button>
              {newEvent.showDetail && (
                <div style={{background:"#15233F",borderRadius:6,padding:"10px 12px"}}>
                  {/* ④ 備考を詳細の中に移動 */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>共演者</div><input value={newEvent.performers||""} onChange={e=>setNewEvent({...newEvent,performers:e.target.value})} placeholder="共演者・伴奏者" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>主催</div><input value={newEvent.organizer} onChange={e=>setNewEvent({...newEvent,organizer:e.target.value})} placeholder="主催者名" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>開演</div><input value={newEvent.startTime} onChange={e=>setNewEvent({...newEvent,startTime:e.target.value})} placeholder="14:00" style={inpE}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:SANS}}>備考</div>
                    <textarea value={newEvent.notes} onChange={e=>setNewEvent({...newEvent,notes:e.target.value})}
                      placeholder="備考" style={{...inpE,minHeight:48,resize:"vertical"}}/>
                  </div>
                </div>
              )}
            </div>

            {/* ⑧ プログラム */}
            <div style={{marginTop:16,marginBottom:8}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:8}}>プログラム</div>
              {newEvent.items.map((it,idx)=>(
                <div key={it.id} draggable
                  onDragStart={()=>setDragItemId(it.id)}
                  onDragEnter={()=>setDragOverId(it.id)}
                  onDragEnd={onItemDragEnd}
                  onDragOver={e=>e.preventDefault()}
                  style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,
                    background:dragOverId===it.id?"#FDF5ED":"white",
                    border:"1px solid #1E2A45",borderRadius:4,padding:"5px 7px",cursor:"grab"}}>
                  <span style={{color:"#2A3F6A",fontSize:12,flexShrink:0}}>⣿</span>
                  <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS,flexShrink:0,width:18,textAlign:"right"}}>{idx+1}</span>
                  {/* ⑥ 作曲・曲目・時間・演奏者 の順に */}
                  <input value={it.composer||""} onChange={e=>updateItem(it.id,{composer:e.target.value})} placeholder="作曲" style={{...inpE,flex:"0 0 90px"}}/>
                  <input value={it.pieceTitle} onChange={e=>updateItem(it.id,{pieceTitle:e.target.value})} placeholder="曲目" style={{...inpE,flex:1}}/>
                  <input value={it.duration} onChange={e=>updateItem(it.id,{duration:e.target.value})} placeholder="時間" style={{...inpE,flex:"0 0 48px"}}/>
                  <input value={it.performer} onChange={e=>updateItem(it.id,{performer:e.target.value})} placeholder="演奏者" style={{...inpE,flex:"0 0 100px"}}/>
                  <button onClick={()=>removeItem(it.id)} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,padding:"0 2px",flexShrink:0}}>×</button>
                </div>
              ))}
              {/* ⑤ 休憩ボタン削除 */}
              <button onClick={()=>addItem("piece")} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>＋ 曲を追加</button>
            </div>

            <div style={{marginTop:16,marginBottom:14}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:8}}>Archive</div>
              {(newEvent.archives||[]).map((arc,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                  <input value={arc.title} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],title:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="タイトル" style={{...inpE,flex:1}}/>
                  <input value={arc.url} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],url:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="URL" style={{...inpE,flex:2}}/>
                  <button onClick={()=>{const a=(newEvent.archives||[]).filter((_,j)=>j!==i);setNewEvent({...newEvent,archives:a});}} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,flexShrink:0}}>×</button>
                </div>
              ))}
              <button onClick={()=>setNewEvent({...newEvent,archives:[...(newEvent.archives||[]),{title:"",url:""}]})}
                style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>
                ＋ リンクを追加
              </button>
            </div>

            {/* ⑦ 追加・キャンセルボタン前後の行間を広げる */}
            <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:20,paddingTop:16,borderTop:"1px solid #15233F"}}>
              <button onClick={saveEvent} style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,letterSpacing:1}}>
                {editingId ? "更新する" : "追加する"}
              </button>
              <button onClick={()=>{setShowForm(false);setEditingId(null);setNewEvent(EMPTY_EVENT);}} style={{background:"#15233F",border:"1px solid #1E2A45",color:"#94A3BE",padding:"9px 18px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4}}>キャンセル</button>
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
                  <span style={{fontSize:11,color:"#94A3BE",fontFamily:SANS}}>{l.label}</span>
                </div>
              ))}
            </div>
            {filteredFuture.length>0 && <TimelineSection label="UPCOMING" evs={filteredFuture} defaultOpen={true}/>}
            {filteredPast.length>0 && <TimelineSection label="HISTORY" evs={filteredPast} defaultOpen={true}/>}
          </>
        )}

        {/* 保存ボタン */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:16,paddingTop:16,borderTop:"1px solid #1E2A45"}}>
          {eventsSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{eventsSaveMsg}</span>}
          <button onClick={saveEvents}
            style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",
              borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:SANS}}>
            保存
          </button>
        </div>

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
  const {documents, setDocuments, saveDocuments} = props;
  const {docSaveMsg, setDocSaveMsg} = props;
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
  const {savePrograms, programsSaveMsg} = props;
  const [progDocIds, setProgDocIds] = useState([]);
  const [showProgDocPanel, setShowProgDocPanel] = useState(false);
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

  const inp2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"4px 7px",fontFamily:SANS,fontSize:11,borderRadius:4,boxSizing:"border-box",...ex});
  const sel2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"4px 6px",fontFamily:SANS,fontSize:11,borderRadius:4,...ex});

  // ── Program Piece Card (compact) ──
  const ProgPieceCard = ({p, isAI=false}) => {
    const era = ERAS[p.era]||ERAS.modern;
    const inProg = prog.pieceIds.includes(p.id);
    return (
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",marginBottom:4,
        background:inProg?"#F5F0E6":"white",
        border:"1px solid "+(inProg?era.color+"66":"#1E2A45"),
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
          <div style={{fontSize:12,color:"#EDE6D6",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>

            {p.title}
          </div>
          <div style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>{p.composer} / {p.key} / {p.duration}分{p.durationSecs>0?p.durationSecs+"秒":""}</div>
        </div>
        {inProg
          ? <button onClick={()=>toggle(p.id)}
              style={{background:"#FFF0EE",border:"1px solid #E8C0B0",color:"#A04030",width:20,height:20,borderRadius:"50%",cursor:"pointer",fontSize:11,flexShrink:0}}>×</button>
          : <button onClick={()=>toggle(p.id)} disabled={!canAdd(p)}
              style={{background:canAdd(p)?"#0F1A33":"#1E2A45",border:"none",color:canAdd(p)?"#E8D090":"#4A5A7A",width:20,height:20,borderRadius:"50%",cursor:canAdd(p)?"pointer":"not-allowed",fontSize:15,lineHeight:"20px",textAlign:"center",flexShrink:0}}>+</button>
        }
      </div>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>

      {/* Program tabs row */}
      <div style={{background:"#1E2A45",borderBottom:"2px solid #1E2A45",padding:"0 16px",display:"flex",alignItems:"center",gap:0,flexShrink:0,overflowX:"auto"}}>
        {programs.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",borderBottom:p.id===activeProgramId?"3px solid #8B5E3C":"3px solid transparent",padding:"7px 0",marginRight:2}}>
            {editingProgramId===p.id
              ? <input value={editingName} onChange={e=>setEditingName(e.target.value)}
                  onBlur={()=>{updateProg({name:editingName});setEditingProgramId(null);}}
                  onKeyDown={e=>{if(e.key==="Enter"){setPrograms(ps=>ps.map(x=>x.id===p.id?{...x,name:editingName}:x));setEditingProgramId(null);}}}
                  autoFocus style={{background:"#15233F",border:"1px solid #C8A860",color:"#EDE6D6",padding:"2px 7px",fontSize:11,fontFamily:SANS,borderRadius:3,width:120}} />
              : <button onClick={()=>setActiveProgramId(p.id)}
                  onDoubleClick={()=>{setEditingProgramId(p.id);setEditingName(p.name);}}
                  style={{background:"none",border:"none",color:p.id===activeProgramId?"#0F1A33":"#94A3BE",cursor:"pointer",fontSize:12,fontFamily:SANS,padding:"0 10px",whiteSpace:"nowrap"}}>
                  {p.name}
                </button>
            }
            {programs.length>1 && <button onClick={()=>deleteProgram(p.id)} style={{background:"none",border:"none",color:"#C0A080",cursor:"pointer",fontSize:12,padding:"0 3px"}}>×</button>}
          </div>
        ))}
        <button onClick={addProgram} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",cursor:"pointer",fontSize:11,fontFamily:SANS,padding:"3px 10px",borderRadius:4,marginLeft:6,whiteSpace:"nowrap",flexShrink:0}}>＋ 新規</button>
      </div>

      {/* 2-column main area */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── LEFT: 設定 + タイムライン ── */}
        <div style={{width:"38%",minWidth:260,borderRight:"2px solid #1E2A45",display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* 左上: プログラム設定 */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1E2A45",background:"#F0EBE0",flexShrink:0}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#94A3BE",fontFamily:SANS,marginBottom:8}}>プログラム設定</div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>合計</span>
                <input type="number" min={1} value={prog.maxDuration} onChange={e=>updateProg({maxDuration:Math.max(1,+e.target.value)})}
                  style={{width:44,background:"#15233F",border:"1px solid #2A3F6A",color:"#EDE6D6",fontSize:12,fontFamily:FONT,textAlign:"center",padding:"3px 4px",borderRadius:4}} />
                <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>分</span>
              </div>
              <div style={{width:1,height:16,background:"#1E2A45"}}/>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>曲数</span>
                <select value={prog.maxPieces===999?"unlimited":String(prog.maxPieces)} onChange={e=>updateProg({maxPieces:e.target.value==="unlimited"?999:Math.max(0,+e.target.value)})}
                  style={{background:"#15233F",border:"1px solid #2A3F6A",color:"#EDE6D6",fontSize:11,fontFamily:SANS,padding:"3px 5px",borderRadius:4}}>
                  <option value="unlimited">制限なし</option>
                  {[...Array(21)].map((_,i)=><option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{width:1,height:16,background:"#1E2A45"}}/>
              <button style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:4}}>
                ＋ 曲間を追加
              </button>
            </div>
          </div>

          {/* 左下: タイムライン */}
          <div style={{flex:1,overflowY:"auto",padding:"10px 12px"}}>
            <div style={{fontSize:12,letterSpacing:2,color:"#EDE6D6",fontFamily:SANS,fontWeight:700,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>Program</span>
              <button onClick={()=>{
                const newFromDB = programPieces.filter(p=>learningIds.includes(p.id));
                const isOver = remaining < 0;
                let msg = "プログラムを確定しますか？";
                if(newFromDB.length>0) msg += "\n（Databaseからの曲"+newFromDB.length+"曲がLearningに追加されます）";
                if(isOver){const overSecs=Math.round(Math.abs(remaining)*60);const overMin=Math.floor(overSecs/60);const overS=overSecs%60;msg += "\n⚠️ 時間が"+(overMin>0?overMin+"分":"")+(overS>0?overS+"秒":"")+"超過しています";}
                window.confirm(msg);
              }}
                style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"4px 12px",
                  cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:4,fontWeight:600}}>
                確定
              </button>
              <span style={{fontSize:12,color:remaining<0?"#C0405A":remaining<=5?"#C8A030":"#2A7A3A",fontWeight:"bold",letterSpacing:0}}>
                {(()=>{const m=Math.floor(totalDuration);const s=Math.round((totalDuration-m)*60);return m+"分"+(s>0?s+"秒":"");})()}  / {prog.maxDuration}分
                <span style={{fontSize:10,fontWeight:"normal",color:remaining<0?"#C0405A":"#94A3BE",fontFamily:SANS}}>
                  {remaining>0?(()=>{const s=Math.round(remaining*60);const m=Math.floor(s/60);const sec=s%60;return " 残り"+(m>0?m+"分":"")+(sec>0?sec+"秒":"");})():remaining===0?" ちょうど":(()=>{const s=Math.round(Math.abs(remaining)*60);const m=Math.floor(s/60);const sec=s%60;return " "+(m>0?m+"分":"")+(sec>0?sec+"秒":"0秒")+"超過";})()}
                </span>
              </span>
            </div>
            {/* Progress bar */}
            <div style={{height:4,background:"#1E2A45",borderRadius:2,overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:Math.min((totalDuration/prog.maxDuration)*100,100)+"%",
                background:remaining<0?"#C04030":remaining<=5?"#C09030":"#3A8A4A",borderRadius:2,transition:"width 0.4s"}}/>
            </div>
            {/* Stacked bar */}
            {programPieces.length>0 && (
              <div style={{display:"flex",gap:1,height:20,borderRadius:3,overflow:"hidden",marginBottom:10,border:"1px solid #1E2A45"}}>
                {programPieces.map(p=>{ const era=ERAS[p.era]||ERAS.modern; return (
                  <div key={p.id} style={{width:((p.duration/prog.maxDuration)*100)+"%",background:era.color,minWidth:2,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"rgba(255,255,255,0.8)"}}>{p.duration}m</div>
                ); })}
                {remaining>0&&<div style={{flex:1,background:"#1E2A45"}}/>}
              </div>
            )}
            {/* Piece list with interval tabs */}
            {programPieces.length===0
              ? <div style={{textAlign:"center",color:"#4A5A7A",padding:"30px 12px",border:"2px dashed #1E2A45",borderRadius:8,fontSize:12,lineHeight:2,fontFamily:SANS}}>右の一覧から曲を追加</div>
              : programPieces.map((p,i)=>{ const era=ERAS[p.era]||ERAS.modern;
                // ①② 曲間タブ（2曲目以降の前に表示）
                const intervalKey = "interval-"+i;
                const hasInterval = i > 0;
                const intervalSecs = (prog.intervals||{})[intervalKey]||0;
                return (
                  <React.Fragment key={p.id}>
                    {hasInterval && (
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 8px",marginBottom:3,
                        background:"#0F1A33",border:"1px dashed #1E2A45",borderRadius:4,fontSize:10,color:"#94A3BE",fontFamily:SANS}}>
                        <span style={{color:"#2A3F6A",fontSize:10}}>⏱</span>
                        <span style={{flex:1}}>曲間</span>
                        <input type="number" min={0} max={300}
                          value={intervalSecs}
                          onChange={e=>updateProg({intervals:{...(prog.intervals||{}),[intervalKey]:Math.max(0,+e.target.value)}})}
                          style={{width:36,background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",fontSize:10,textAlign:"center",padding:"1px 3px",borderRadius:3}}
                        />
                        <span style={{color:"#94A3BE"}}>秒</span>
                        <button onClick={()=>{const iv={...(prog.intervals||{})};delete iv[intervalKey];updateProg({intervals:iv});}}
                          style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:11,padding:"0 1px"}}>×</button>
                      </div>
                    )}
                    <div draggable onDragStart={()=>dragId.current=p.id} onDragEnter={()=>dragOver.current=p.id} onDragEnd={onDragEnd} onDragOver={e=>e.preventDefault()}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",background:"#15233F",
                        border:"1px solid "+era.color+"33",borderLeft:"3px solid "+era.color,
                        borderRadius:5,marginBottom:3,cursor:"grab"}}>
                      <span style={{color:"#2A3F6A",fontSize:11}}>⠿</span>
                      <div style={{width:18,height:18,borderRadius:"50%",background:era.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#EDE6D6",flexShrink:0}}>{i+1}</div>
                      {/* ③ Library と同じ表記 */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:1}}>
                          <span style={{fontSize:10,color:"#94A3BE",fontFamily:SANS,flexShrink:0}}>{p.composer}</span>
                          <span style={{fontSize:12,color:"#EDE6D6",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</span>
                        </div>
                        <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,display:"flex",gap:4}}>
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
            {/* 保存ボタン */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:16,paddingTop:12,borderTop:"1px solid #1E2A45"}}>
              {programsSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{programsSaveMsg}</span>}
              <button onClick={()=>{
                  if (programs.length===0) { window.alert("該当するデータがありません"); return; }
                  setShowProgDocPanel(!showProgDocPanel);
                }}
                style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",
                  borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:SANS}}>
                📦 ドキュメント作成
              </button>
              {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{docSaveMsg}</span>}
              <button onClick={savePrograms}
                style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",
                  borderRadius:6,cursor:"pointer",fontSize:13,fontFamily:SANS}}>
                保存
              </button>
            </div>
            {showProgDocPanel && (
              <div style={{marginTop:10,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px",textAlign:"left"}}>
                <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:SANS,marginBottom:8}}>出力するプログラムを選んでください（複数可）</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {programs.map(pg=>{
                    const checked=progDocIds.includes(pg.id);
                    const cnt=(pg.pieceIds||[]).length;
                    return (
                      <label key={pg.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",
                        background:checked?"#F4F6F9":"#15233F",borderRadius:4,cursor:"pointer",
                        border:checked?"1.5px solid #C8A860":"1px solid #1E2A45",
                        fontSize:12,fontFamily:SANS,color:checked?"#15233F":"#C8CEDB"}}>
                        <input type="checkbox" checked={checked}
                          onChange={e=>setProgDocIds(prev=>e.target.checked?[...prev,pg.id]:prev.filter(x=>x!==pg.id))}
                          style={{accentColor:"#C8A860"}}/>
                        <span style={{flex:1}}>{pg.name||"無題"}</span>
                        <span style={{fontSize:10,color:"#94A3BE"}}>{cnt}曲</span>
                      </label>
                    );
                  })}
                </div>
                <button onClick={()=>{
                    const targets = programs.filter(pg=>progDocIds.includes(pg.id));
                    if (targets.length===0) { window.alert("該当するデータがありません"); return; }
                    const blocks = targets.map(pg=>{
                      const found = (pg.pieceIds||[]).map(id=>allPool.find(x=>x.id===id)).filter(Boolean);
                      const body = found.map((px,i)=>(i+1)+". "+px.composer+" / "+px.title).join(String.fromCharCode(10));
                      return "【"+(pg.name||"プログラム")+"】"+String.fromCharCode(10)+body;
                    });
                    const text = blocks.join(String.fromCharCode(10)+String.fromCharCode(10));
                    const defaultName = targets.length>1 ? "プログラム比較（"+targets.length+"件）" : "プログラム "+(targets[0].name||"");
                    const inputName = window.prompt("ドキュメントの名前を入力してください", defaultName);
                    if (inputName===null) return;
                    const finalName = inputName.trim() || defaultName;
                    const doc = { id: Date.now(), name: finalName, text: text };
                    const next = [doc, ...documents];
                    setDocuments(next);
                    saveDocuments(next);
                    setShowProgDocPanel(false);
                    setProgDocIds([]);
                    setDocSaveMsg("ドキュメントを作成しました ✓");
                    setTimeout(() => setDocSaveMsg(""), 3000);
                  }}
                  style={{marginTop:10,background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,width:"100%",fontWeight:600}}>
                  ✓ チェックしたプログラムで、ドキュメント作成
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: 曲目詳細設定 + 一覧 ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* 右上: 詳細フィルター */}
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1E2A45",background:"#15233F",flexShrink:0}}>
            <div style={{fontSize:12,letterSpacing:2,color:"#94A3BE",fontFamily:SANS,marginBottom:10,fontWeight:600}}>Search Piece</div>
            {/* ⑦ Search Piece - labeled fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>作曲家</div>
                <input value={composerFilter} onChange={e=>setComposerFilter(e.target.value)}
                  placeholder="例: ショパン" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
              <div>
                <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>曲名</div>
                <input value={titleFilter} onChange={e=>setTitleFilter(e.target.value)}
                  placeholder="例: ノクターン" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
              <div>
                <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>時代</div>
                <select value={eraFilter} onChange={e=>setEraFilter(e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%"}}>
                  <option value="">ー</option>
                  {ERA_ORDER.filter(k=>k!=="contemporary").map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:9,color:"#94A3BE",fontFamily:SANS,marginBottom:2}}>キーワード</div>
                <input value={kwFilter} onChange={e=>setKwFilter(e.target.value)}
                  placeholder="例: 発表会向け" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>作曲年</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={yearMin} onChange={e=>setYearMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                  <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                  <input value={yearMax} onChange={e=>setYearMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>演奏時間（分）</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <input value={durMin} onChange={e=>setDurMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                  <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                  <input value={durMax} onChange={e=>setDurMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1,boxSizing:"border-box"}} />
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>難易度</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <select value={diffMin} onChange={e=>setDiffMin(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                  <select value={diffMax} onChange={e=>setDiffMax(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <span style={{fontSize:9,color:"#94A3BE",fontFamily:SANS}}>演奏頻度</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  <select value={freqMin} onChange={e=>setFreqMin(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
                    <option value={0}>ー</option>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  <span style={{fontSize:10,color:"#94A3BE"}}>〜</span>
                  <select value={freqMax} onChange={e=>setFreqMax(+e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:12,borderRadius:4,flex:1}}>
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
                  background:(poolMode==="repertoire"||poolMode==="both")?"#0F1A33":"white",
                  border:"2px solid "+((poolMode==="repertoire"||poolMode==="both")?"#0F1A33":"#2A3F6A"),
                  color:(poolMode==="repertoire"||poolMode==="both")?"#C8A860":"#94A3BE",
                  cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600,
                  letterSpacing:0.3}}>
                from Repertoire
              </button>
              <button onClick={()=>{ setPoolMode(m=>m==="ai"?"none":m==="repertoire"?"both":m==="both"?"repertoire":"ai"); if(poolMode==="none"||poolMode==="repertoire") askAI(); }}
                disabled={aiLoading}
                style={{flex:"0 0 30%",padding:"12px 6px",
                  background:(poolMode==="ai"||poolMode==="both")?"#0F1A33":"white",
                  border:"2px solid "+((poolMode==="ai"||poolMode==="both")?"#0F1A33":"#2A3F6A"),
                  color:(poolMode==="ai"||poolMode==="both")?"#C8A860":"#94A3BE",
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
                  style={{background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"3px 6px",fontFamily:SANS,fontSize:10,borderRadius:"4px 0 0 4px",borderRight:"none"}}>
                  <option value="" disabled>並べ替え</option>
                  <option value="era">時代</option>
                  <option value="year">作曲年</option>
                  <option value="duration">演奏時間</option>
                  <option value="difficulty">難易度</option>
                  <option value="frequency">演奏頻度</option>
                </select>
                <button onClick={()=>setLocalSortAsc(v=>!v)}
                  style={{background:"#15233F",border:"1px solid #1E2A45",color:"#94A3BE",padding:"0 7px",
                    cursor:"pointer",fontSize:10,fontFamily:SANS,borderRadius:"0 4px 4px 0",
                    display:"flex",alignItems:"center"}}>
                  {localSortAsc?"▲":"▼"}
                </button>
              </div>
              {/* ✦✧ お気に入りフィルター */}
              <button onClick={()=>setShowFavOnly(v=>!v)}
                title="お気に入りのみ"
                style={{background:showFavOnly?"#FFF8E8":"white",
                  border:"1px solid "+(showFavOnly?"#C8963C":"#1E2A45"),
                  color:showFavOnly?"#C8963C":"#94A3BE",
                  padding:"4px 9px",cursor:"pointer",fontSize:12,fontFamily:SANS,borderRadius:4,
                  display:"flex",alignItems:"center",gap:2,flexShrink:0}}>
                {showFavOnly?"✦":"✧"} お気に入り
              </button>
            </div>

            {poolMode==="none" && (
              <div style={{textAlign:"center",color:"#4A5A7A",padding:"32px 12px",fontSize:12,lineHeight:2,fontFamily:SANS}}>
                「New from Database」で追加した曲はLearningリストに保存されます
              </div>
            )}

            {/* MY 一覧 */}
            {showMy && (
              <div style={{marginBottom:showAI&&aiPool.length>0?16:0}}>
                {poolMode==="both" && <div style={{fontSize:9,letterSpacing:2,color:"#C8963C",marginBottom:5,fontFamily:SANS}}>✦ MY REPERTOIRE ({myPool.length}曲)</div>}
                {myPool.length===0
                  ? <div style={{textAlign:"center",color:"#4A5A7A",padding:"16px",fontSize:11,fontFamily:SANS}}>該当する曲がありません</div>
                  : myPool.map(p=><ProgPieceCard key={p.id} p={p} isAI={false}/>)
                }
              </div>
            )}

            {/* AI 一覧 */}
            {showAI && (
              <div>
                {poolMode==="both" && <div style={{fontSize:9,letterSpacing:2,color:"#8A8AAA",marginBottom:5,fontFamily:SANS}}>✧ AI SUGGESTIONS ({aiPool.length}件)</div>}
                {aiPool.length===0&&!aiLoading && (
                  <div style={{textAlign:"center",color:"#4A5A7A",padding:"16px",fontSize:11,fontFamily:SANS}}>
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





// ── Auth Component ────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const SANS = "'Noto Sans JP', sans-serif";
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inpS = { width:"100%", padding:"10px 12px", border:"1px solid #1E2A45",
    borderRadius:6, fontSize:14, fontFamily:SANS, color:"#EDE6D6",
    background:"#15233F", boxSizing:"border-box", outline:"none" };

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("確認メールを送信しました。メールをご確認ください。");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("メールアドレスまたはパスワードが正しくありません。");
    }
    setLoading(false);
  };

  return (
    <div style={{height:"100vh",background:"#0F1A33",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#15233F",borderRadius:12,padding:"40px 36px",width:"100%",maxWidth:400,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:22,fontWeight:"bold",color:"#EDE6D6",fontFamily:SANS,letterSpacing:2}}>Repertia</div>
          <div style={{fontSize:12,color:"#94A3BE",fontFamily:SANS,marginTop:4}}>クラシック音楽レパートリー管理</div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[["login","ログイン"],["signup","新規登録"]].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m);setError("");setMessage("");}}
              style={{flex:1,padding:"8px",border:"1.5px solid "+(mode===m?"#0F1A33":"#1E2A45"),
                borderRadius:6,background:mode===m?"#0F1A33":"white",
                color:mode===m?"#C8A860":"#94A3BE",fontFamily:SANS,fontSize:13,cursor:"pointer"}}>
              {label}
            </button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="メールアドレス" style={inpS}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="パスワード（6文字以上）" style={inpS}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
        </div>
        {error && <div style={{marginTop:12,fontSize:12,color:"#C0405A",fontFamily:SANS}}>{error}</div>}
        {message && <div style={{marginTop:12,fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{message}</div>}
        <button onClick={handleSubmit} disabled={loading}
          style={{width:"100%",marginTop:20,padding:"11px",background:"#0F1A33",border:"none",
            color:"#C8A860",borderRadius:6,fontSize:14,fontFamily:SANS,cursor:"pointer",
            opacity:loading?0.6:1}}>
          {loading?"処理中...":(mode==="login"?"ログイン":"アカウント作成")}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageState, setPage] = useState("manage");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  if (authLoading) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F1A33",color:"#94A3BE",fontFamily:"'Noto Sans JP', sans-serif"}}>読み込み中...</div>;
  if (!user) return <AuthPage />;
  return <MainApp user={user} handleLogout={handleLogout} pageState={pageState} setPage={setPage} />;
}

function MainApp({ user, handleLogout, pageState, setPage }) {
  const page = pageState;
  const [pieces, setPieces]                   = useState([]);
  const [piecesLoading, setPiecesLoading]     = useState(true);
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
  const [documents, setDocuments]              = useState([]); // 📦 ドキュメントボックス
  const [scratchItems, setScratchItems]        = useState([]); // 🎨 スクラッチ組み立て中のパーツ
  const [analysisAxis, setAnalysisAxis]        = useState("era");
  const [chartType, setChartType]              = useState("pie");
  const [profile, setProfile]                  = useState({
    nameJa:"", nameEn:"", birthDate:"", nationality:"ー", city:"",
    photoUrl:"",
    educations:[{id:1,period:"",school:"",status:""}],
    teachers:[{id:1,period:"",name:"",note:""}],
    competitions:[],
    contact:{email:"", website:"", tel:"", sns:""},
  });
  const [profileSaveMsg, setProfileSaveMsg]    = useState("");
  const [programsSaveMsg, setProgramsSaveMsg]  = useState("");
  const [eventsSaveMsg, setEventsSaveMsg]      = useState("");
  const [docSaveMsg, setDocSaveMsg]            = useState(""); // 📦 ドキュメント作成の共通メッセージ
  const sugTimer  = useRef(null);
  const nextId    = useRef(100);
  const dragId    = useRef(null);
  const dragOver  = useRef(null);

  // ── Supabase: プロフィール読み込み ──
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', user.id)
        .single();
      if (data?.data) setProfile(prev => {
        const d = data.data;
        return {
          ...prev,
          ...d,
          educations: (d.educations && d.educations.length > 0) ? d.educations : prev.educations,
          teachers:   (d.teachers   && d.teachers.length   > 0) ? d.teachers   : prev.teachers,
          contact:    { ...prev.contact, ...(d.contact || {}) },
        };
      });
    };
    loadProfile();
  }, [user.id]);

  // ── Supabase: プロフィール保存 ──
  const saveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, data: profile, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' });
    if (!error) {
      setProfileSaveMsg("保存しました ✓");
      setTimeout(() => setProfileSaveMsg(""), 3000);
    }
  };

  const savePrograms = async () => {
    const { error } = await supabase.from('programs')
      .upsert({ user_id: user.id, data: programs }, { onConflict: 'user_id' });
    if (!error) {
      setProgramsSaveMsg("保存しました ✓");
      setTimeout(() => setProgramsSaveMsg(""), 3000);
    }
  };

  const saveEvents = async () => {
    const { error } = await supabase.from('events')
      .upsert({ user_id: user.id, data: events }, { onConflict: 'user_id' });
    if (!error) {
      setEventsSaveMsg("保存しました ✓");
      setTimeout(() => setEventsSaveMsg(""), 3000);
    }
  };

  const saveDocuments = async (docs) => {
    await supabase.from('documents')
      .upsert({ user_id: user.id, data: docs }, { onConflict: 'user_id' });
  };

  // ── Supabase: piecesの読み込み ──
  useEffect(() => {
    const loadPieces = async () => {
      setPiecesLoading(true);
      const { data, error } = await supabase
        .from('pieces')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setPieces(data.map(p => ({
          id: p.id,
          title: p.title,
          composer: p.composer || '',
          year: p.year || 0,
          era: p.era || 'modern',
          duration: p.duration || 5,
          difficulty: p.difficulty || 3,
          readiness: p.readiness || 50,
          key: p.key || '',
          form: p.form || '',
          country: p.country || '',
          memo: p.memo || '',
          fav: p.is_fav || false,
          candidate: p.is_candidate || false,
          mine: true,
        })));
      }
      setPiecesLoading(false);
    };
    loadPieces();
  }, [user.id]);

  // ── Supabase: programs読み込み ──
  useEffect(() => {
    const loadPrograms = async () => {
      const { data } = await supabase
        .from('programs')
        .select('data')
        .eq('user_id', user.id)
        .single();
      if (data?.data) setPrograms(data.data);
    };
    loadPrograms();
  }, [user.id]);

  // ── Supabase: events読み込み ──
  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('data')
        .eq('user_id', user.id)
        .single();
      if (data?.data) setEvents(data.data);
    };
    loadEvents();
  }, [user.id]);

  // ── Supabase: documents読み込み ──
  useEffect(() => {
    const loadDocuments = async () => {
      const { data } = await supabase
        .from('documents')
        .select('data')
        .eq('user_id', user.id)
        .single();
      if (data?.data) setDocuments(data.data);
    };
    loadDocuments();
  }, [user.id]);
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
  const totalDuration  = programPieces.reduce((s,p)=>s+p.duration+(p.durationSecs||0)/60, 0) + totalIntervalSecs/60;
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

  // ── カード内インライン編集の保存 ──
  const onUpdatePiece = async (updated) => {
    setPieces(ps=>ps.map(p=>p.id===updated.id?{...p,...updated}:p));
    await supabase.from('pieces').update({
      title: updated.title,
      composer: updated.composer,
      key: updated.key||'',
      year: updated.year||0,
      duration: updated.duration||0,
      durationSecs: updated.durationSecs||0,
      memo: updated.memo||'',
      keywords: updated.keywords||'',
    }).eq('id', updated.id);
  };

  const toggleFav = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    const newFav = !piece.fav;
    setPieces(ps=>ps.map(p=>p.id===id?{...p,fav:newFav}:p));
    await supabase.from('pieces').update({is_fav: newFav}).eq('id', id);
  };
  const toggleCandidate = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (piece && piece.candidate) {
      // ✧を外す → Learningからも削除確認
      if (learningIds.includes(id)) {
        if (window.confirm("Learningからも削除しますか？")) {
          setLearningIds(prev=>prev.filter(x=>x!==id));
          setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:false}:p));
          await supabase.from('pieces').update({is_candidate: false}).eq('id', id);
        }
      } else {
        setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:false}:p));
        await supabase.from('pieces').update({is_candidate: false}).eq('id', id);
      }
    } else {
      setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:true}:p));
      await supabase.from('pieces').update({is_candidate: true}).eq('id', id);
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
${programPieces.length===0?"（空）":programPieces.map(p=>`- ${p.title}（${p.composer}、${p.year}年）${p.key} ${p.duration}分`).join(String.fromCharCode(10))}
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
  const inpS={background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const lblS={fontSize:10,color:"#94A3BE",marginBottom:4,fontFamily:SANS};
  const secTitle=(t)=>( <div style={{fontSize:11,letterSpacing:3,color:"#94A3BE",fontFamily:SANS,marginBottom:10,marginTop:20,borderBottom:"1px solid #1E2A45",paddingBottom:4}}>{t}</div> );
  const addBtn=(label,onClick)=>(
    <button onClick={onClick} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:SANS,borderRadius:4,marginTop:6}}>
      ＋ {label}
    </button>
  );


  const printSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const w = window.open("","_blank");
    w.document.write("<html><head><style>body{font-family:serif;padding:40px;color:#0F1A33;}h2{letter-spacing:3px;color:#94A3BE;}</style></head><body>"+el.innerHTML+"</body></html>");
    w.document.close(); w.print();
  };


  const onAddPiece = async (piece) => {
    const era = eraFromYear(piece.year);
    const { data, error } = await supabase.from('pieces').insert({
      user_id: user.id,
      title: piece.title,
      composer: piece.composer || '',
      year: piece.year || null,
      era: era,
      duration: piece.duration || 5,
      difficulty: piece.difficulty || 3,
      readiness: piece.readiness || 50,
      key: piece.key || '',
      form: piece.form || '',
      country: piece.country || '',
      memo: piece.memo || '',
      is_fav: false,
      is_candidate: false,
    }).select().single();
    if (!error && data) {
      setPieces(ps => [...ps, {
        id: data.id, title: data.title, composer: data.composer,
        year: data.year, era: data.era, duration: data.duration,
        difficulty: data.difficulty, readiness: data.readiness,
        key: data.key, form: data.form, country: data.country,
        memo: data.memo, fav: false, candidate: false, mine: true,
      }]);
    }
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
      if      (sortBy==="composer")   d = (a.composer||"").localeCompare(b.composer||"");
      else if (sortBy==="year")       { if(!ay && by2) return 1; if(ay && !by2) return -1; d=ay-by2; }
      else if (sortBy==="duration")   d = a.duration - b.duration;
      else if (sortBy==="difficulty") d = a.difficulty - b.difficulty;
      else if (sortBy==="frequency")  d = (a.frequency||0) - (b.frequency||0);
      return sortAsc ? d : -d;
    });

  const aiFiltered     = aiPieces.filter(p => searchMatch(p, searchQ));
  const showRuler      = sortBy==="year" && filterEra==="";
  const inp = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  // ── Shared header (① stable, ② bigger nav) ──────────────────────────────────
  const Header = () => (
    <header style={{background:"#0F1A33",display:"flex",alignItems:"stretch",flexShrink:0,height:54}}>
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
              color: page===p ? "#0F1A33" : "#9A8868",
              padding:"0 24px",cursor:"pointer",
              fontSize:14,letterSpacing:0.3,
              fontFamily:"'Cormorant Garamond',serif",
              fontWeight: page===p ? 600 : 400,
              transition:"color 0.15s"}}>
            {l}
          </button>
        ))}
      </nav>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",paddingRight:16}}>
        
        <button onClick={handleLogout}
          style={{background:"none",border:"1px solid #1E2A45",color:"#9A8868",padding:"4px 12px",
            borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:"'Noto Sans JP',sans-serif"}}>
          ログアウト
        </button>
      </div>
    </header>
  );

  // ── Filter bar ───────────────────────────────────────────────────────────────

  // ── PieceCardRow → PieceCardUnifiedのラッパー ───────────────────────────────
  const PieceCardRow = ({p, showControls=true, onUpdatePiece}) => {
    const inProg = prog.pieceIds.includes(p.id);
    const isExpanded = expandedId===p.id;
    return (
      <PieceCardUnified
        p={p}
        expanded={isExpanded}
        onToggleExpand={()=>setExpandedId(isExpanded?null:p.id)}
        inProgram={inProg}
        canAdd={canAdd(p)}
        onAdd={()=>toggle(p.id)}
        onRemove={()=>toggle(p.id)}
        onToggleFav={()=>toggleFav(p.id)}
        onToggleCandidate={()=>toggleCandidate(p.id)}
        showControls={showControls}
        onUpdatePiece={onUpdatePiece}
        learningIds={learningIds}
      />
    );
  };



  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────
  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────

  // ── SINGLE return ─────────────────────────────────────────────────────────────
  if (piecesLoading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F1A33",color:"#94A3BE",fontFamily:"'Noto Sans JP', sans-serif"}}>
      レパートリーを読み込み中...
    </div>
  );
  return (
    <div style={{height:"100vh",background:"#0F1A33",fontFamily:FONT,color:"#EDE6D6",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <FontLoader />
      <Header />
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {page==="manage" && <ManagePage
          pieces={pieces} setPieces={setPieces} poolFiltered={poolFiltered}
          documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg}
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
          toggleCandidate={toggleCandidate}
          onUpdatePiece={onUpdatePiece}
          dashData={getDashData()} dashTotal={getDashData().reduce((s,d)=>s+d.count,0)||pieces.length}
          dashAxis={dashAxis} setDashAxis={setDashAxis}
          dashChart={dashChart} setDashChart={setDashChart}
        />}
        {page==="print"  && <PrintPage prog={prog} allPool={allPool} programs={programs} pieces={pieces} activeProgramId={activeProgramId} setActiveProgramId={setActiveProgramId} profile={profile} setProfile={setProfile} events={events} portfolioTab={portfolioTab} setPortfolioTab={setPortfolioTab} addListItem={addListItem} updateListItem={updateListItem} removeListItem={removeListItem} handlePhoto={handlePhoto} photoInputRef={photoInputRef} generateBio={generateBio} inpS={inpS} lblS={lblS} secTitle={secTitle} addBtn={addBtn} printSection={printSection} saveProfile={saveProfile} profileSaveMsg={profileSaveMsg} documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg} scratchItems={scratchItems} setScratchItems={setScratchItems} />}
        {page==="home" && <HomePage
          prog={prog} updateProg={updateProg}
          documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg}
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
          savePrograms={savePrograms} programsSaveMsg={programsSaveMsg}
        />}
        {page==="events" && <EventsPage events={events} setEvents={setEvents} FONT={FONT} SANS={SANS} toggle={toggle} onDragEnd={onDragEnd} prog={prog} saveEvents={saveEvents} eventsSaveMsg={eventsSaveMsg} documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg} />}
      </div>
    </div>
  );
}




