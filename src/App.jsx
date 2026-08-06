import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";

// v313: スマホ幅判定フック（640px以下＝スマホ）。全面インラインstyleに馴染むJS判定（案A）。
//   今後のスマホ調整でも再利用する土台。リサイズにも追従する。
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
};

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
// v319: 本文フォントをOS標準（SF/ヒラギノ系）に統一。＋追加カードと一覧カードの
//   本文書体差（OS初期 vs Zen Kaku）を解消。見出しFONT（Montserrat＝"らしさ"）は現状維持。
//   ログイン画面のSANS（別定義）・配色（紺）・太さ（600）は今回対象外。
const SANS = "-apple-system, BlinkMacSystemFont, sans-serif";
const FONT = "'Montserrat','Zen Kaku Gothic New','Noto Sans JP',sans-serif";

// ── Repertiaフォーム共通土台（v354・案A）───────────────────────────────────────
// 全フォーム（AddEvent/イベント編集/ピース編集/AddPiece/検索カード）の入力欄・ラベル・
// セクション見出し・ボタンの土台を一箇所に定義。AddEvent画面の現状値を基準（見本）とする。
// 色の塗り分けは当面なし＝Add/編集はタイトル・文言で区別する。
// input/label は fontSize がスマホ/PCで変わるため関数で受ける（FORM.input(isMobile)）。
const FORM = {
  input: (isMobile) => ({
    background:"#F4F6F9", border:"1px solid #C8CEDB", color:"#15233F",
    padding:"5px 8px", fontFamily:FONT, fontSize:isMobile?16:12,
    borderRadius:4, width:"100%", boxSizing:"border-box"
  }),
  label: {
    fontFamily:FONT, fontSize:10, color:"#94A3BE", marginBottom:3, textAlign:"left"
  },
  sectionLabel: {
    fontSize:10, color:"#94A3BE", letterSpacing:2, fontFamily:FONT,
    marginBottom:6, marginTop:14, borderBottom:"1px solid #15233F", paddingBottom:3
  },
  // v356 ⑥: ボタンは意味で3色（グレー統一は編集ボタンと被るため不可）。全フォームがここを参照。
  //   primary=主アクション（金）／danger=危険（赤枠）／secondary=副次（青枠・文字も青）。
  button: {
    base: {
      cursor:"pointer", fontFamily:FONT, borderRadius:4, boxSizing:"border-box"
    },
    primary: {
      background:"#C8A860", border:"none", color:"#fff",
      padding:"5px 18px", fontSize:12
    },
    danger: {
      background:"none", border:"1px solid #C0405A", color:"#C0405A",
      padding:"5px 14px", fontSize:11
    },
    secondary: {
      background:"none", border:"1px solid #4A6FA5", color:"#4A6FA5",
      padding:"5px 14px", fontSize:11
    }
  },
  // v355: フォームカード背景（フォーム全体が乗る面）。AddEvent基調＝明るい面に統一。
  card: {
    background:"#EEF1F5", border:"1px solid #D0D6DF", borderRadius:10,
    padding:18, boxSizing:"border-box"
  }
};

// ── Data ──────────────────────────────────────────────────────────────────────
const ERAS = {
  baroque:      { label:"バロック",  short:"バロック",  abbr:"Ba", color:"#9B3045", bg:"#FDF5ED", year:[1600,1750] },
  classical:    { label:"古典派",   short:"古典派",   abbr:"Cl", color:"#BA6F12", bg:"#EDF5FB", year:[1750,1820] },
  romantic:     { label:"ロマン派", short:"ロマン派", abbr:"Ro", color:"#8C327A", bg:"#FBEdf5", year:[1820,1900] },
  modern:       { label:"近現代",   short:"近現代",   abbr:"Mo", color:"#3A3A9A", bg:"#EDF8EF", year:[1900,2000] },
  contemporary: { label:"現代",     short:"現代",     abbr:"Co", color:"#6A6A7A", bg:"#F3EDF8", year:[2000,2030] },
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
  const title = (p.title||"").toLowerCase();
  const composer = (p.composer||"").toLowerCase();

  // Direct match（直接の部分一致：これは従来通り）
  if (title.includes(lower) || composer.includes(lower)) return true;

  // エイリアス照合は3文字以上の入力のみ（短い入力での暴発を防ぐ）
  if (lower.length < 3) return false;

  // Title alias match：その曲の正式名が canonical を含むときだけ、別名を照合
  for (const [canonical, aliases] of Object.entries(TITLE_ALIASES)) {
    const canon = canonical.toLowerCase();
    if (title.includes(canon) || canon.includes(title)) {
      if (aliases.some(a => a.toLowerCase().includes(lower))) return true;
    }
  }

  // Composer alias match：その曲の作曲家が canonical を含むときだけ、別名を照合
  for (const [canonical, aliases] of Object.entries(SEARCH_ALIASES)) {
    const canon = canonical.toLowerCase();
    if (composer.includes(canon) || canon.includes(composer)) {
      if (aliases.some(a => a.toLowerCase().includes(lower))) return true;
    }
  }
  return false;
};

const eraFromYear = (y) => {
  for (const k of ERA_ORDER) { const v=ERAS[k]; if(y>=v.year[0]&&y<v.year[1]) return k; }
  return "modern";
};

// v276: メニューを外クリック（とEsc）で閉じる共通フック。
// 対象はメニューのみ。Add Piece / Search Piece の入力パネルには使わない
// （v266の方針：入力途中の誤クリックで内容が消えるのを防ぐため、✕かページ移動でのみ閉じる）。
const useCloseOnOutsideClick = (isOpen, onClose) => {
  const ref = useRef(null);
  const cbRef = useRef(onClose);
  cbRef.current = onClose; // 毎レンダーで最新の閉じる処理を保持（購読を貼り直さないため）
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) cbRef.current(); };
    const onKey  = (e) => { if (e.key === "Escape") cbRef.current(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);
  return ref;
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
function LinkIcon({ type }) {
  const common = { width:13, height:13, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.6, strokeLinecap:"round", strokeLinejoin:"round" };
  if (type === "desc") return <span style={{fontStyle:"italic",fontFamily:"Georgia,serif",fontSize:12}}>i</span>;
  if (type === "score") return (<svg {...common}><path d="M12 5v14"/><path d="M12 5C10 3.5 6.5 3.5 4 4.5v13c2.5-1 6-1 8 .5"/><path d="M12 5c2-1.5 5.5-1.5 8-.5v13c-2.5-1-6-1-8 .5"/></svg>);
  if (type === "audio") return (<svg {...common}><path d="M5 9v6h4l5 4V5L9 9H5z"/><path d="M17 8c1.2 1.2 1.2 6.8 0 8"/></svg>);
  if (type === "video") return (<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 5v14l11-7z"/></svg>);
  return null;
}

// v298: Repertia独自の確認モーダル（中央・暗幕＋紺ボックス・既存トーストのトーン）。
//   ブラウザ標準confirmを置き換える。移動（RP⇄LP）と削除で共用。
//   2択で選ぶUI（キャンセル/実行）。✕は付けない（キャンセルボタンがその役割）。
//   line1 = 「作曲家：曲名」／ line2 = 本文（「〜から〜に移動しますか？」等）。
//   confirmLabel = 実行ボタンの文言／ confirmColor = 実行ボタンの色（削除=赤・移動=青）。
const ConfirmModal = ({ SANS, line1, line2, note, confirmLabel, confirmColor, onConfirm, onCancel }) => {
  // v299: 祖先カードに transform:scale が掛かっており、その内側だと position:fixed が
  //   カード基準になってスクロール追従・メニューバー下に潜る。→ body直下にPortalで出す。
  //   さらに開いている間は背景スクロールを止める（後ろのリストが動かない）。
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  const modal = (
    <div onClick={onCancel}
      style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(6,12,24,0.6)",
        zIndex:2147483000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#16243F",border:"1px solid #2A3A5A",borderRadius:10,
          boxShadow:"0 8px 28px rgba(0,0,0,0.4)",maxWidth:360,width:"100%",padding:"20px 22px 16px",boxSizing:"border-box"}}>
        <div style={{color:"#EDE6D6",fontSize:13,fontWeight:600,fontFamily:SANS,marginBottom:6,wordBreak:"break-word"}}>{line1}</div>
        <div style={{color:"#C8CEDB",fontSize:13,fontFamily:SANS,lineHeight:1.6,marginBottom:note?8:18,wordBreak:"break-word"}}>{line2}</div>
        {note && <div style={{color:"#8A97AD",fontSize:11,fontFamily:SANS,lineHeight:1.6,marginBottom:18,wordBreak:"break-word"}}>{note}</div>}
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
          <button onClick={onCancel}
            style={{background:"none",border:"1px solid #3A4A6A",color:"#A8B4C8",padding:"6px 16px",borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:SANS}}>キャンセル</button>
          <button onClick={onConfirm}
            style={{background:confirmColor,border:"none",color:"#fff",padding:"6px 18px",borderRadius:5,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:SANS}}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
  // Portal先はbody。SSRなど無い通常ブラウザ環境なのでdocument.bodyで安全。
  return (typeof document !== "undefined" && document.body)
    ? createPortal(modal, document.body)
    : modal;
};

const PieceCardUnified = ({ p, expanded, onToggleExpand, inProgram, canAdd, onAdd, onRemove, onToggleFav, onToggleCandidate, isAI=false, showControls=true, onUpdatePiece, learningIds=[], eventsForPiece=[], onDeletePiece, composers=[], onToggleMarkNote, onToggleMarkRest, onPromote, onDemote }) => {
  const era = ERAS[p.era] || ERAS.modern;
  // v290: 左カラム（作曲家層）。pieces.composer を display として composers を引く。
  //   引けたら fullName / era / years / wiki_ja / wiki_en / imslp を左カラムに出す。
  //   引けない（手入力composer＝行が無い）なら display だけ出し、他は出さない（エラーにしない）。
  const composerRow = (Array.isArray(composers) ? composers : []).find(c => c && c.display === p.composer) || null;
  // v291: composers.era は頭文字（B/Cl/R/M/C）で格納されている。変換せずそのまま表示する。
  //   ホバー用の時代名だけ、頭文字→ラベルの対応表で引く。
  //   pieces 側 p.era はフルワード（romantic 等）なので、フォールバック時だけ ERA_INITIAL で頭文字化する。
  const ERA_INITIAL = { baroque:"B", classical:"Cl", romantic:"R", modern:"M", contemporary:"C" };
  const ERA_LABEL_BY_INITIAL = { B:"バロック", Cl:"古典派", R:"ロマン派", M:"近現代", C:"現代" };
  const composerEraInitial = (composerRow && composerRow.era)
    ? composerRow.era
    : (ERA_INITIAL[p.era] || "");
  const composerEraLabel = ERA_LABEL_BY_INITIAL[composerEraInitial] || "";
  const isLearning = !isAI && Array.isArray(learningIds) && learningIds.includes(p.id);
  const isMobile = useIsMobile(640); // v313: スマホ幅なら閉じたカード1行目を縦レイアウトに
  // v354: フォーム共通土台FORMのエイリアス（この編集フォームで参照）。
  const fInput = FORM.input(isMobile);
  const fLabel = FORM.label;
  // v155 工程D-1: 反転をやめ、地は紺で統一。状態は「文字色」と「AI=メモ用紙」で出す。
  // AI候補=メモ茶 / Learning=銀 / Repertoire(通常)=金
  const txtColor = isAI ? "#5A564A" : isLearning ? "#C8CEDB" : "#C8A860";
  // AI候補だけメモ用紙の地。それ以外は紺(透明)のまま。
  const memoBg = "#ECE9DF";
  const memoRule = "repeating-linear-gradient(180deg, transparent, transparent 27px, #E4E0D1 27px, #E4E0D1 28px)";
  const statusBg = isAI ? memoBg : null;
  const statusText = isAI ? txtColor : null; // AIメモ地の上は茶系文字
  // 1行目の文字色：AIは常にメモ茶。金銀は通常時=状態色、展開時=明るいクリーム。
  const mainTxtExpanded = isLearning ? "#E2E7F0" : "#E0C888"; // v169: 展開時も身分色を保つ（金は金・銀は銀）
  const mainTxt = isAI ? txtColor : (expanded ? mainTxtExpanded : txtColor);
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({});
  const [eraEditedDraft, setEraEditedDraft] = React.useState(false); // v273: 編集画面で時代を手で選び直したか（handleAddのeraEditedと同じ作り）
  // v347: ⋯メニュー廃止（♪𝄽は展開エリアへ・編集は直置き）。関連state/ref/effectも削除。
  // v298: 確認モーダルの状態。null＝閉じ。'move'＝RP⇄LP移動確認 / 'delete'＝削除確認。
  const [confirmKind, setConfirmKind] = React.useState(null);

  React.useEffect(() => {
    if (!expanded) setEditing(false);
  }, [expanded]);

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft({
      title:p.title, composer:p.composer, key:p.key||"",
      yearText:p.yearText||"", duration:p.duration||0, durationSecs:p.durationSecs||0,
      era:p.era||"", // v272: 時代を編集可能に
      memo:p.memo||"", keywords:p.keywords||"",
      links: Array.isArray(p.links) ? p.links.map(l=>({...l})) : [],
    });
    setEraEditedDraft(false); // v273: 編集を開くたびに未編集から
    setEditing(true);
  };
  const saveEdit = (e) => {
    e.stopPropagation();
    // v273: yearText → year の変換（不明・範囲対応）。handleAddと同じ実装
    let yearNum = p.year;
    const yt = (draft.yearText||"").trim();
    if (yt === "不明") yearNum = 0;
    else if (/^\d{4}-\d{4}$/.test(yt)) yearNum = parseInt(yt.split("-")[0]);
    else if (/^\d{4}$/.test(yt)) yearNum = parseInt(yt);
    // v273: 時代は手で選び直したときだけその値を使う。触っていなければ作曲年から補完（handleAddと同じ考え方）
    const eraVal = eraEditedDraft ? draft.era : eraFromYear(yearNum);
    if (onUpdatePiece) onUpdatePiece({...p, ...draft, year:yearNum, yearText: yt||String(yearNum), era: eraVal});
    setEditing(false);
  };
  const cancelEditFn = (e) => { e.stopPropagation(); setEditing(false); };
  const cancelEdit = (e) => { e.stopPropagation(); setEditing(false); };

  const yearStr = (p.yearText==="不明"||(p.year||0)===0) ? "作曲年不明" : (p.yearText||p.year)+"年";

  // v350 ②③: スマホ閉じカード2行目＝作曲家 / 作曲 YYYY(-YYYY) / 調号 / 演奏時間。
  //   「作曲」前置で生没年との誤読を防ぐ（③）。範囲はそのまま・「年」は付けない。空の項目は出さない（/ が増えすぎないよう）。
  const composeYearStr = (p.yearText==="不明"||(p.year||0)===0) ? "" : "作曲 "+(p.yearText||p.year);
  const keyStr = (p.key && p.key!=="ー") ? p.key : "";
  const durStr = fmtDuration(p.duration, p.durationSecs);
  const line2Parts = [p.composer, composeYearStr, keyStr, durStr].filter(x=>x && String(x).trim()!=="");

  return (
    <div style={{
      background: expanded ? (isAI ? memoBg : "#18283F") : isAI ? memoBg : inProgram ? "#15233F" : "transparent",
      backgroundImage: isAI ? memoRule : "none",
      borderRadius: 5,
      marginBottom: 6,
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
        background: era.color,
        borderRadius: 0,
      }} />

      {/* 作曲家列の貫通縦線（1行目〜展開部を1本で貫く・v177）。
           v309: 編集中(editing)は出さない。編集フォームは縦積みで境界線が入力欄を貫くだけのため。
           v315: スマホ(isMobile)も出さない。スマホは曲名上・作曲家下の縦積みで、
                 作曲家列/曲列を分ける縦線が意味を失い、何も区切らない1本になるため。 */}
      {!editing && !isMobile && (
        <div style={{
          position:"absolute",
          left: 157,
          top: expanded ? 14 : 10,
          bottom: expanded ? 14 : 10,
          width: 1,
          background: isAI ? "#B5AF9A" : "#7A8FB5",
        }} />
      )}

      {/* ── 1行目（常に表示） ── */}
      <div style={{padding:"10px 12px 8px 13px",display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}
        onClick={onToggleExpand}>
        {isMobile ? (
          /* v313: スマホ幅＝縦レイアウト。曲名を上に大きく（折り返して全部見える）／作曲家・時間を下に小さく。
             調は出さない（案イ・v293維持）。切れずに全体が見える。 */
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:6}}>
              <span style={{
                flex:1,minWidth:0,
                fontSize:14,fontWeight:500,
                color:mainTxt,
                fontFamily:FONT,lineHeight:1.35,
                ...(expanded
                  ? {wordBreak:"break-word"}
                  : {whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"})
              }}>{p.title}</span>
              {isAI && <span style={{flexShrink:0,fontSize:9,background:"#DDD8C8",color:"#7A7460",padding:"1px 5px",borderRadius:6,border:"1px dashed #B5AF9A",marginTop:2}}>AI</span>}
            </div>
            <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {line2Parts.join(" / ")}
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div style={{flex:1,minWidth:0,display:"flex",alignItems:"baseline",gap:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {/* ②作曲家名に最小幅。一般的な名前(〜12文字)が収まる幅で縦線が揃う */}
              <span title={expanded && composerRow && composerRow.fullName ? composerRow.fullName : undefined} style={{fontSize:14,color:mainTxt,fontFamily:FONT,width:"11em",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}}>{p.composer}</span>
              <span style={{fontSize:14,color:mainTxt,fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",marginLeft:20}}>{p.title}</span>
              {isAI && <span style={{flexShrink:0,fontSize:9,background:"#DDD8C8",color:"#7A7460",padding:"1px 5px",borderRadius:6,border:"1px dashed #B5AF9A",marginLeft:4}}>AI</span>}
            </div>
            {/* ③演奏時間: 1行目と同書式。v349修正: PCは「分」だけを見た目1文字分右へ（transform）。
                 レイアウト幅は動かさないので2マークのはみ出しは起きない。分のmarginRightは元の6に戻す。 */}
            <span style={{fontSize:14,color:mainTxt,fontFamily:FONT,flexShrink:0,marginRight:6,transform:isMobile?"none":"translateX(14px)"}}>{fmtDuration(p.duration, p.durationSecs)}</span>
          </React.Fragment>
        )}
        {/* v346 ①③: ♪𝄽は選択時のみ金色で表示（未選択は非表示＝一覧のノイズを減らす）。
             片方だけ選択時は右端アンカーに寄せ、カード間で縦一直線に揃う。両方選択時は横並び。
             v348: PCは♪𝄽スロットを固定幅で常に確保（マーク有無で「分」の位置がずれないよう縦揃え）。
                   スマホは従来どおりマークがある時だけ表示（狭いので空きスロットを作らない）。 */}
        {!isAI && (!isMobile || p.markNote || p.markRest) && (
          <div style={{flexShrink:0,width:isMobile?"auto":40,display:"flex",gap:2,alignItems:"center",justifyContent:"flex-end",marginRight:-6}}>
            {p.markNote && (
              <span style={{fontSize:19,lineHeight:1,fontFamily:"RepertiaMusic, sans-serif",position:"relative",top:"-2px",color:"#C8A860",padding:"0 0 0 3px"}}>{"\u266A"}</span>
            )}
            {p.markRest && (
              <span style={{fontSize:15,lineHeight:1,fontFamily:"RepertiaMusic, sans-serif",position:"relative",top:"2px",color:"#C8A860",padding:"0 0 0 3px"}}>{"\u{1D13D}"}</span>
            )}
          </div>
        )}
        {showControls && (
          <div style={{flexShrink:0,display:"flex",gap:2,alignItems:"center"}}>
            {/* ★candidate・♥favは⋯メニューへ移行のため普段表示から削除（candidate機能はコード温存）*/}
            {inProgram !== undefined && (
              inProgram
                ? <button onClick={e=>{e.stopPropagation();onRemove&&onRemove();}}
                    style={{background:"none",border:"1px solid #C0405A",color:"#C0405A",width:22,height:22,borderRadius:"50%",cursor:"pointer",fontSize:12,lineHeight:"20px",textAlign:"center"}}>×</button>
                : <button onClick={e=>{e.stopPropagation();onAdd&&onAdd();}} disabled={!canAdd}
                    style={{background:canAdd?"#C8A860":"#1E2A45",border:"none",color:canAdd?"#0F1A33":"#4A5A7A",width:22,height:22,borderRadius:"50%",cursor:canAdd?"pointer":"not-allowed",fontSize:16,lineHeight:"22px",textAlign:"center",fontWeight:"bold"}}>+</button>
            )}
          </div>
        )}
      </div>

      {/* ── 展開部分 ── */}
      {expanded && (
        <div style={{padding:"0 12px 10px 13px",background:isAI?memoBg:"#18283F"}} onClick={onToggleExpand}>
          {!editing ? (
            <>
              {/* 左右2カラム: 左=作曲家列(縦線まで)、右=曲の全情報 */}
              <div style={{display:"flex",alignItems:"stretch",gap:0}}>
                {/* 左カラム: 作曲家層（v290）。3行構成。composersを引けた時だけ2・3行目を出す。 */}
                {/* v291: 1行目の名前は最上段の作曲家名がその役割を果たすため、ここでは出さない（重複解消）。
                     この左カラムは最上段の名前の真下に来るので、視覚的に「名前／時代年／リンク」の3行に見える。
                     fullNameのホバーは最上段の作曲家名に付けた。 */}
                <div style={{width:"11em",flexShrink:0,paddingTop:8,paddingRight:8,boxSizing:"border-box"}}>
                  {/* v351 ①: 生没年表示（時代頭文字＋years）を削除。生没年は「人の情報」で曲情報ではない。
                       作曲家情報は下のWikiリンク(W/I)で辿れるため、カードには載せない。 */}
                  {/* 3行目: W / I リンク（ホバーで名称）。空欄の列は出さない（空欄も情報）。
                       v290: Wは wiki_ja 優先→無ければ wiki_en。両方無ければWを出さない。
                       表示は区別せず「W」。押せば読める方（日本語優先）が開く。 */}
                  {composerRow && (composerRow.wiki_ja || composerRow.wiki_en || composerRow.imslp) && (
                    <div style={{marginTop:5,display:"flex",gap:4}}>
                      {(composerRow.wiki_ja || composerRow.wiki_en) && (
                        <a href={composerRow.wiki_ja || composerRow.wiki_en} target="_blank" rel="noreferrer" title="Wikipedia"
                          onClick={e=>e.stopPropagation()}
                          style={{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#94A3BE",textDecoration:"none",border:"1px solid #2A3F6A",borderRadius:3,fontFamily:FONT,flexShrink:0}}>W</a>
                      )}
                      {composerRow.imslp && (
                        <a href={composerRow.imslp} target="_blank" rel="noreferrer" title="IMSLP"
                          onClick={e=>e.stopPropagation()}
                          style={{width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#94A3BE",textDecoration:"none",border:"1px solid #2A3F6A",borderRadius:3,fontFamily:FONT,flexShrink:0}}>I</a>
                      )}
                    </div>
                  )}
                </div>
                {/* 右カラム: 曲層（v294）。曲名・演奏時間・♪𝄽は見出し行が担当するため、右カラムは2行。 */}
                <div style={{flex:1,minWidth:0,paddingTop:8,paddingBottom:2,paddingLeft:3}}>
                  {/* v351 ②: 調号・作曲年の表示を削除（2行目に集約済みでダブりのため）。
                       リンクは操作行(♪𝄽・編集の行)へ移動。ここはキーワード/メモのみ残す。 */}
                  {/* 2行目: キーワード → メモ の順（キーワード＝将来の共有・集合知、メモ＝個人的。共有可能→個人的の順）。 */}
                  {(p.keywords || p.memo || p.reason) && (
                    <div style={{fontSize:12,color:isAI?"#5A564A":"#94A3BE",lineHeight:1.7,marginBottom:8,fontFamily:FONT}}>
                      {p.keywords && <div style={{marginBottom:(p.memo||p.reason)?4:0}}>{p.keywords}</div>}
                      {p.memo && <div>{p.memo}</div>}
                      {p.reason && <div style={{fontStyle:"normal",marginTop:(p.memo||p.keywords)?4:0,color:isAI?"#5A564A":"#94A3BE"}}>💡 {p.reason}</div>}
                    </div>
                  )}
                </div>
              </div>
              {/* v347 ②④: 展開エリアに♪𝄽トグル（グレー=未選択/金=選択・タップで付け外し・async）を直置き。
                   編集ボタンも直置き（展開→編集の二重階段を解消）。⋯メニューは廃止。
                   v348: PCは♪𝄽を右カラムの左下に揃える（左カラム幅11em分インデント）。スマホは全幅のまま。
                   v351 ③: 操作系を1行に集約＝♪𝄽(左)／リンク(中・設定済みのみ)／編集(右端)。
                   v352: 境界線を撤去・上の行間を詰める。♪↔𝄽=半角/𝄽↔リンク=全角1字/リンク群は左寄せ/編集は右寄せ。 */}
              <div style={{display:"flex",alignItems:"center",marginTop:2,paddingLeft:isMobile?0:"11em"}}>
                {/* 左：♪𝄽（♪↔𝄽は半角スペース相当）。v353: 編集ボタンの中央線に合わせて少し上げる（光学中央調整）。 */}
                <div style={{display:"flex",gap:2,alignItems:"center",flexShrink:0,position:"relative",top:"-2px"}}>
                  {onToggleMarkNote && (
                    <button onClick={async e=>{e.stopPropagation();await onToggleMarkNote();}}
                      title={p.markNote?"♪を外す":"♪に追加"}
                      style={{background:"none",border:"none",cursor:"pointer",padding:"2px 3px",fontSize:20,lineHeight:1,fontFamily:"RepertiaMusic, sans-serif",position:"relative",top:"-2px",color:p.markNote?"#C8A860":"#4A5A7A"}}>{"\u266A"}</button>
                  )}
                  {onToggleMarkRest && (
                    <button onClick={async e=>{e.stopPropagation();await onToggleMarkRest();}}
                      title={p.markRest?"𝄽を外す":"𝄽に追加"}
                      style={{background:"none",border:"none",cursor:"pointer",padding:"2px 3px",fontSize:16,lineHeight:1,fontFamily:"RepertiaMusic, sans-serif",position:"relative",top:"2px",color:p.markRest?"#C8A860":"#4A5A7A"}}>{"\u{1D13D}"}</button>
                  )}
                </div>
                {/* 𝄽とリンクの間＝全角1文字分 */}
                <span style={{width:"1em",flexShrink:0,display:"inline-block"}} />
                {/* 中：リンク（記号・設定済みのみ・左寄せ）。YouTube検索は常時／カスタムリンクは有る時だけ。 */}
                <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
                  <a href={"https://www.youtube.com/results?search_query="+encodeURIComponent(p.title+" "+p.composer)} target="_blank" rel="noreferrer" title="YouTube"
                    style={{width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#94A3BE",textDecoration:"none",border:"1px solid #2A3F6A",borderRadius:3,fontFamily:FONT,flexShrink:0}}
                    onClick={e=>e.stopPropagation()}>▶</a>
                  {Array.isArray(p.links) && p.links.map((lk,i)=>(
                    <a key={"lk"+i} href={lk.url} target="_blank" rel="noreferrer" title={lk.title||lk.url}
                      style={{width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#94A3BE",textDecoration:"none",border:"1px solid #2A3F6A",borderRadius:3,fontFamily:FONT,flexShrink:0}}
                      onClick={e=>e.stopPropagation()}><LinkIcon type={lk.type} /></a>
                  ))}
                </div>
                {/* リンクの数で可変：残りを吸って編集を右へ */}
                <div style={{flex:1,minWidth:"1em"}} />
                {/* 右：編集（右寄せ） */}
                <button onClick={e=>{e.stopPropagation();startEdit(e);}}
                  style={{background:"none",border:"1px solid #2E3E5E",color:"#C8CEDB",fontSize:12,fontFamily:FONT,padding:"5px 16px",cursor:"pointer",borderRadius:4,flexShrink:0}}>編集</button>
              </div>
            </>
          ) : (
            /* ── 第3形態: インライン編集フォーム ── */
            <div style={{...FORM.card,position:"relative",marginTop:8,marginBottom:4}} onClick={e=>e.stopPropagation()}>
              {/* v354: フォーム共通土台FORMを参照（純白→#F4F6F9・角丸3→4・ラベル色A8B4C8→#94A3BE のズレを解消）。
                   v355: フォームカード背景をFORM.card（AddEvent基調の明るい面）に統一。 */}
              {/* ④右上✕ */}
              <button onClick={cancelEditFn} title="キャンセル"
                style={{position:"absolute",top:0,right:0,background:"none",border:"none",color:"#6B7A90",fontSize:16,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
              {/* 1行目: 作曲家(1):曲名(2) */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:8,marginBottom:8}}>
                {[["作曲家","composer"],["曲名","title"]].map(([label,field])=>(
                  <div key={field}>
                    <div style={fLabel}>{label}</div>
                    <input value={draft[field]||""} onChange={e=>setDraft({...draft,[field]:e.target.value})}
                      style={fInput} />
                  </div>
                ))}
              </div>
              {/* 2行目: 6列均等グリッド。v356 ①: 並びを 時代・作曲年・調性・演奏時間・Lv.・Pop. に（カード2行目の表示順と整合）。
                   v356 ③: alignItems:start で各セル上端を揃える（Lv.の縦ずれ解消）。 */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:8,marginBottom:8,alignItems:"start"}}>
                <div>
                  {/* v272: 時代（Add Pieceと同じERA_ORDER・同じ挙動） */}
                  <div style={fLabel}>時代</div>
                  <select value={draft.era||"romantic"} onChange={e=>{setDraft({...draft,era:e.target.value}); setEraEditedDraft(true);}}
                    style={fInput}>
                    {ERA_ORDER.map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={fLabel}>作曲年</div>
                  <input value={draft.yearText||""} onChange={e=>setDraft({...draft,yearText:e.target.value})}
                    placeholder="例: 1810"
                    style={fInput} />
                </div>
                <div>
                  <div style={fLabel}>調性</div>
                  <input value={draft.key||""} onChange={e=>setDraft({...draft,key:e.target.value})}
                    style={fInput} />
                </div>
                <div>
                  <div style={fLabel}>演奏時間</div>
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
                    style={fInput} />
                </div>
                {/* Lv.・Pop.: 育成中(入力不可)。v357: 両者を同一スタイルに統一（fInputベース＋無効欄の色）。 */}
                <div>
                  <div style={fLabel}>Lv.</div>
                  <input value="育成中" disabled readOnly style={{...fInput,color:"#94A3BE",cursor:"default"}} />
                </div>
                <div>
                  <div style={fLabel}>Pop.</div>
                  <input value="育成中" disabled readOnly style={{...fInput,color:"#94A3BE",cursor:"default"}} />
                </div>
              </div>
              {/* v357 順序: 3行目リンク → 4行目キーワード → 5行目メモ */}
              {/* リンク（最大3個）。v357: 「演奏リンク」→「リンク」 */}
              <div style={{marginBottom:10}}>
                <div style={fLabel}>リンク（最大3個）</div>
                {(draft.links||[]).map((lk,i)=>(
                  <div key={"edit-lk"+i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                    <div style={{display:"flex",gap:3,flexShrink:0}}>
                      {/* v357: desc は内部名だと分かりにくいので information に。他はそのまま。 */}
                      {["desc","score","audio","video"].map(t=>(
                        <button key={t} type="button" title={t==="desc"?"information":t}
                          onClick={()=>{const nl=(draft.links||[]).map((x,j)=>j===i?{...x,type:t}:x);setDraft({...draft,links:nl});}}
                          style={{width:26,height:26,display:"inline-flex",alignItems:"center",justifyContent:"center",
                            background:(lk.type||"video")===t?"#DCE4F0":"white",
                            border:(lk.type||"video")===t?"1px solid #5B7FA6":"1px solid #C8CEDB",
                            color:"#15233F",borderRadius:3,cursor:"pointer",padding:0,flexShrink:0}}>
                          <LinkIcon type={t} />
                        </button>
                      ))}
                    </div>
                    <input value={lk.url||""} placeholder="URL" onChange={e=>{const nl=(draft.links||[]).map((x,j)=>j===i?{...x,url:e.target.value}:x);setDraft({...draft,links:nl});}}
                      style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:FONT,fontSize:12,borderRadius:3,flex:2,minWidth:0,boxSizing:"border-box"}} />
                    <input value={lk.title||""} placeholder="タイトル" onChange={e=>{const nl=(draft.links||[]).map((x,j)=>j===i?{...x,title:e.target.value}:x);setDraft({...draft,links:nl});}}
                      style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:FONT,fontSize:12,borderRadius:3,flex:1,minWidth:0,boxSizing:"border-box"}} />
                    <button onClick={()=>{const nl=(draft.links||[]).filter((x,j)=>j!==i);setDraft({...draft,links:nl});}}
                      style={{background:"none",border:"none",color:"#C0405A",cursor:"pointer",fontSize:14,flexShrink:0,padding:"0 4px"}}>✕</button>
                  </div>
                ))}
                {(draft.links||[]).length < 3 && (
                  <button onClick={()=>{setDraft({...draft,links:[...(draft.links||[]),{type:"video",url:"",title:""}]});}}
                    style={{background:"none",border:"1px dashed #C8CEDB",color:"#5B7FA6",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:3,padding:"4px 10px",marginTop:2}}>＋ リンクを追加</button>
                )}
              </div>
              {/* キーワード */}
              <div style={{marginBottom:10}}>
                <div style={fLabel}>キーワード</div>
                <input value={draft.keywords||""} onChange={e=>setDraft({...draft,keywords:e.target.value})}
                  placeholder="カンマ区切り"
                  style={fInput} />
              </div>
              {/* メモ */}
              <div style={{marginBottom:8}}>
                <div style={fLabel}>メモ</div>
                <textarea value={draft.memo||""} onChange={e=>setDraft({...draft,memo:e.target.value})}
                  rows={1}
                  style={{...fInput,resize:"vertical"}} />
              </div>
              {Array.isArray(eventsForPiece) && eventsForPiece.length>0 && (
                <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #D0D6DF"}}>
                  {/* v356 ④: 見出しの♪（markNoteと被る）を外しテキストのみ。 */}
                  <div style={{color:"#7A8AA8",fontSize:10,letterSpacing:1,marginBottom:8,fontFamily:FONT}}>
                    演奏したイベント
                  </div>
                  {/* v356 ⑤/v357: 帯を薄く・左端アクセントなし・文字は保存ボタンと同じ白。紺は薄めに。 */}
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {eventsForPiece.map(ev => (
                      <div key={ev.id} style={{display:"flex",alignItems:"baseline",gap:10,padding:"5px 10px",background:"#3A4A66",borderRadius:4}}>
                        <span style={{color:"#fff",fontSize:11,fontWeight:600,minWidth:80,flexShrink:0,fontFamily:FONT}}>{ev.date}</span>
                        <span style={{color:"#fff",fontSize:11,fontFamily:FONT}}>{ev.title||"（無題）"}</span>
                        {ev.venue && <span style={{color:"#C0C8D6",fontSize:10,fontFamily:FONT}}>{ev.venue}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,gap:12}}>
                {/* 左：破壊的操作（削除・赤）。単独で左端に置き、他と離す。FORM.button.danger参照。 */}
                {onDeletePiece ? (
                  <button onClick={()=>setConfirmKind('delete')}
                    style={{...FORM.button.base,...FORM.button.danger,flexShrink:0}}>この曲を削除</button>
                ) : <span/>}
                {/* 右：非破壊的操作（移動＝青／保存＝金）をまとめ、削除から離す。 */}
                <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
                  {/* v298: RP⇄LP 移動ボタン。isLearningで文言を出し分け。押すと確認モーダル。
                       v356 ②: 文言「移動する」→「移動」／文字色を枠と同じ青に（FORM.button.secondary）。 */}
                  {!isAI && ((isLearning && onPromote) || (!isLearning && onDemote)) && (
                    <button onClick={()=>setConfirmKind('move')}
                      style={{...FORM.button.base,...FORM.button.secondary}}>
                      {isLearning ? "Repertoireに移動" : "Learningに移動"}
                    </button>
                  )}
                  <button onClick={saveEdit}
                    style={{...FORM.button.base,...FORM.button.primary}}>保存</button>
                </div>
              </div>
              {/* v298: 確認モーダル（移動／削除で共用）。RP/LPはモーダル内だけカタカナ表記。 */}
              {confirmKind==='move' && (
                <ConfirmModal SANS={SANS}
                  line1={(p.composer? p.composer+"：" : "")+p.title}
                  line2={isLearning
                    ? "この曲をラーニングからレパートリーに移動しますか？"
                    : "この曲をレパートリーからラーニングに移動しますか？"}
                  confirmLabel="移動" confirmColor="#4A6FA5"
                  onCancel={()=>setConfirmKind(null)}
                  onConfirm={async()=>{
                    setConfirmKind(null);
                    if (isLearning) { if(onPromote) await onPromote(); }
                    else { if(onDemote) await onDemote(); }
                  }} />
              )}
              {confirmKind==='delete' && (
                <ConfirmModal SANS={SANS}
                  line1={(p.composer? p.composer+"：" : "")+p.title}
                  line2={isLearning ? "この曲をラーニングから削除しますか？" : "この曲をレパートリーから削除しますか？"}
                  note={(Array.isArray(eventsForPiece)&&eventsForPiece.length>0)
                    ? "※イベントで演奏した記録は消えず、Historyに残ります。" : undefined}
                  confirmLabel="削除" confirmColor="#C0405A"
                  onCancel={()=>setConfirmKind(null)}
                  onConfirm={()=>{ setConfirmKind(null); if(onDeletePiece) onDeletePiece(); }} />
              )}
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
            <div style={{ writingMode:"vertical-lr", textOrientation:"mixed", fontSize:10, color:era.color, fontWeight:"bold", letterSpacing:2, userSelect:"none", fontFamily:FONT }}>
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

// v263: composers（293人マスタ）を reading / display / fullName の3列で照合
const matchComposerRow = (row, lower) => {
  const disp = (row.display  || "").toLowerCase();
  const read = (row.reading  || "").toLowerCase();
  const full = (row.fullName || "").toLowerCase();
  return disp.includes(lower) || read.includes(lower) || full.includes(lower);
};

// v265: 関連度スコア。企画決定に対応
//   ① 前方一致(startsWith)を、途中一致(includes)より上に
//   ② 列の重み：display ＞ reading ＞ fullName
//   0 を返したらマッチなし（＝候補から除外）
//   同点は呼び出し側の安定ソートで元の display 昇順が保たれる（③）
const scoreComposerRow = (row, lower) => {
  const disp = (row.display  || "").toLowerCase();
  const read = (row.reading  || "").toLowerCase();
  const full = (row.fullName || "").toLowerCase();
  // display のイニシャル接頭辞（"F." "W.A." 等）を除いた姓部分。
  // 例：F.Chopin → chopin、C.Chaminade → chaminade。
  // 「ch」で Chopin/Chaminade を前方一致扱いにするため（企画①）。
  const surname = disp.replace(/^([a-z]\.)+/i, "");
  // 前方一致ボーナスは display（＝姓含む）/ reading のみ。
  // fullName は「含む」判定だけ（下の名前で始まっても優遇しない）。
  if (disp.startsWith(lower) || surname.startsWith(lower)) return 60;
  if (read.startsWith(lower)) return 50;
  if (disp.includes(lower))   return 30;
  if (read.includes(lower))   return 20;
  if (full.includes(lower))   return 10;
  return 0;
};

// v265: スコア順に並べ替えて上位を返す共通ヘルパー。
// Search側・AddPiece側で同じ並び順にするため一本化。
// 安定ソートのため score 同点時は元の index（display昇順）を保つ。
const rankComposers = (composerPool, lower, limit) => {
  return composerPool
    .map((row, idx) => ({ row, score: scoreComposerRow(row, lower), idx }))
    .filter(x => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (a.idx - b.idx))
    .slice(0, limit)
    .map(x => x.row);
};

const buildSuggestions = (q, pool, composerPool = []) => {
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

  // v263: composersマスタ（293人）からの照合。display をキーに、reading を添える
  // v265: rankComposers で関連度順に並べる（前方一致優先・列重み付け）
  const masterMatched = rankComposers(composerPool, lower, 6);
  const masterComposers = masterMatched
    .map(row => ({ type:"composer", label: row.display, reading: row.reading || "" }));

  // 既存pool由来（登録曲の作曲家名・文字列）
  const poolComposerLabels = [...new Set([...prefixComposers, ...matchedComposers])];
  // マスタに既に出ている display と重複しないものだけ残す
  const masterLabelSet = new Set(masterComposers.map(c=>c.label));
  const poolComposers = poolComposerLabels
    .filter(c => !masterLabelSet.has(c))
    .map(c => ({ type:"composer", label:c, reading:"" }));

  // マスタ優先 → 既存pool の順で最大4件
  const allComposers = [...masterComposers, ...poolComposers].slice(0,4);
  const titles = matched.slice(0,5).map(p=>({type:"piece", piece:p}));

  return [
    ...allComposers,
    ...titles,
  ].slice(0,8);
};

// ② Fixed SearchBox — IME-safe (composition events) + stable English input
const SearchBox = ({ searchQ, setSearchQ, allPool, composerPool = [], flex = false, compact = false }) => {
  const [open, setOpen]       = useState(false);
  const [cursor, setCursor]   = useState(-1);
  const [displayVal, setDisplayVal] = useState(searchQ);
  const composing = useRef(false); // ① track IME composition
  const boxRef    = useRef(null);

  const candidates = buildSuggestions(displayVal, allPool, composerPool);

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
    <div ref={boxRef} style={{position:"relative",width:flex?"auto":160,flex:flex?"1 1 0%":"none",minWidth:0}} onBlur={handleBlur}>
      <div style={{position:"relative",display:"flex",alignItems:"center"}}>
        <span style={{position:"absolute",left:8,fontSize:11,color:"#94A3BE",pointerEvents:"none"}}>🔍</span>
        <input
          value={displayVal}
          onChange={handleChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocus={()=>setOpen(true)}
          onKeyDown={handleKey}
          placeholder="作曲家・曲名で検索"
          autoComplete="off"
          className="rp-search"
          style={{background:compact?"#1B2942":"#F4F6F9",border:compact?"1px solid #35456380":"1px solid #C8CEDB",color:compact?"#EDE6D6":"#15233F",
            padding:compact?"2px 24px 2px 26px":"4px 24px 4px 26px",fontFamily:FONT,fontSize:12,lineHeight:1.2,borderRadius:4,
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
                  borderBottom:"1px solid #15233F",fontFamily:FONT}}>
                <span style={{fontSize:10,color:"#94A3BE",background:"#15233F",padding:"1px 6px",borderRadius:8}}>作曲家</span>
                <span style={{fontWeight:500}}>{item.label}</span>
                {item.reading && <span style={{fontSize:10,color:"#94A3BE",fontFamily:FONT}}>{item.reading}</span>}
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
                  <div style={{fontSize:10,color:"#94A3BE",fontFamily:FONT}}>{p.composer}　{p.year}年</div>
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
const AddPieceForm = ({ onAdd, onCancel, composerPool = [] }) => {
  const [piece, setPiece]                     = useState(EMPTY_PIECE);
  const [composerSuggestions, setComposerSuggestions] = useState([]);
  const [composerLocked, setComposerLocked]   = useState(false);
  const [suggestions, setSuggestions]         = useState([]);
  const [sugLoading, setSugLoading]           = useState(false);
  const [durationEdited, setDurationEdited]   = useState(false);
  const [eraEdited, setEraEdited]             = useState(false); // v271: 時代を手で選び直したか（durationEditedと同じ作り）
  const [pendingComposers, setPendingComposers] = useState([]); // v280: AI曲名から入ったときの曖昧候補
  const [composerDoubt, setComposerDoubt]       = useState(false); // v281: AIが自分の回答を否定したか（！の表示）
  const sugTimer = useRef(null);
  const reqIdComposer = useRef(0); // v264以降未使用（作曲家欄はcomposers参照化）。曲名側reqIdTitleは現役
  const reqIdTitle    = useRef(0); // v150: レース対策（最新の返事だけ採用）
  const reqIdVerify   = useRef(0); // v281: 照合後の裏取り。レース対策（最新の返事だけ採用）

  const onComposerChange = (val) => {
    // v279: selectComposerと同じ判断。作曲家を打ち始めただけで曲名を消さない。
    // 「作曲家→曲名」の順しかなかった時点の前提が、v278で更新された。
    // 既に確定済み（composerLocked）の作曲家を別のものに打ち替えたときだけクリアする。
    setPiece(p=>{
      const changed = composerLocked && p.composer && p.composer !== val;
      return {...p, composer:val, title: changed ? "" : p.title};
    });
    setComposerLocked(false); setSuggestions([]); setComposerSuggestions([]); setPendingComposers([]); setComposerDoubt(false);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (!val.trim()) return;
    // v264: AI生成 → composers（293人マスタ）参照に切り替え。
    // matchComposerRow が display/reading/fullName を全て toLowerCase 照合するため
    // 大文字小文字は非区別（chopin / Chopin / CHOPIN すべてヒット）。
    // v265: rankComposers で関連度順（前方一致優先・列重み付け）。Search側と同じ並び。
    sugTimer.current = setTimeout(() => {
      const lower = val.toLowerCase().trim();
      const matched = rankComposers(composerPool, lower, 8)
        .map(row => ({ label: row.display, reading: row.reading || "" }));
      setComposerSuggestions(matched);
    }, 200);
  };

  const selectComposer = (name) => {
    // v279: 前提の更新漏れの是正。
    // title:"" は「作曲家→曲名」の順しかなかった時点では正しい設計だった
    // （作曲家が変われば曲も変わるため）。v278で「曲名→作曲家」の順ができ、前提が変わった。
    // 設計意図（A→Bの変更なら曲名は無効）は保ちつつ、空→入力では消さない。
    // 打鍵中の文字列（例:"Beethoven"）と確定形（例:"L.v.Beethoven"）は必ず違うため、
    // 文字列比較では確定した瞬間に「変わった」と誤判定する。
    // onComposerChangeと同じく、確定済み(composerLocked)からの選び直しだけをA→Bとみなす。
    setPiece(p=>{
      const changed = composerLocked && p.composer && p.composer !== name;
      return {...p, composer:name, title: changed ? "" : p.title};
    });
    setComposerSuggestions([]); setComposerLocked(true); setComposerDoubt(false);
  };

  const onTitleChange = (val) => {
    setPiece(p=>({...p, title:val})); setSuggestions([]);
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (!val.trim()) return;
    sugTimer.current = setTimeout(async () => {
      const myId = ++reqIdTitle.current; // この検索の世代番号
      setSugLoading(true);
      try {
        const composerStr = piece.composer ? "作曲家: "+piece.composer+"の" : "";
        const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:3000,messages:[{role:"user",content:`${composerStr}クラシックピアノ曲で「${val}」を含む曲を10曲以上挙げてください。代表的な曲だけでなく、マイナーな曲・知られていない曲も含めてください。JSONのみ:{"pieces":[{"title":"曲名は英語表記(例:Nocturne Op.9 No.2)。ただしClair de lune等の仏語原題はそのまま尊重","composer":"F.姓形式(例F.Chopin。名の頭文字+ドット+姓、スペース無)","year":作曲年数値,"country":"出身国","key":"調性（日本語）","duration":標準的な演奏時間分数数値,"difficulty":難易度1-5数値,"era":"baroque/classical/romantic/modern/contemporary"}]}`}]})});
        const data = await res.json();
        if (myId !== reqIdTitle.current) return; // 自分が最新でなければ捨てる
        const text = data.content.map(b=>b.text||"").join("");
        try {
          setSuggestions(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}")+1)).pieces||[]);
        } catch(parseErr){ console.error("title parse失敗:",parseErr); setSuggestions([]); }
      } catch(e){ if(myId===reqIdTitle.current){ console.error(e); setSuggestions([]); } }
      if (myId===reqIdTitle.current) setSugLoading(false);
    }, 500);
  };

  const selectSuggestion = (s) => {
    // v278: AIが返した composer は「登録する値」としては使わない（照合キーだから）。
    // 作曲家名は composers（293人マスタ）と突き合わせるもので、表記そのものが意味を持つ。
    // F.Chopin と Frédéric Chopin が別人になると、検索と並べ替えが壊れる。
    // 他の項目（曲名・作曲年・調性・演奏時間・時代）は突き合わせる先がないのでそのまま使う。
    //
    // v280: ただし「検索キー」としては使う（RAGと同じ構造：AIに答えさせて、典拠で確かめる）。
    // AIの文字列で composers を rankComposers で引き、ヒットしたらリスト側の display を入れる。
    // AIの文字列そのものは捨てる。AIは「誰の曲か」を知っている。「どう書くか」はリストが持っている。
    // プロンプトの「F.姓形式」指定は当てにしない（ヒントであって保証ではない）。
    // 何が返ってきても必ず照合を通す。通らなければ空欄。
    const { composer, ...rest } = s;
    const key  = (composer || "").toLowerCase().trim();
    const hits = key ? rankComposers(composerPool, key, 8) : [];
    // 一意に決まったときだけ自動で入れる。複数ヒットで1位を自動採用すると「AIが決めた」に戻る。
    const decided = hits.length === 1 ? hits[0].display : "";
    setPiece(p=>({...p, ...rest, composer: decided, yearText: String(s.year||""), frequency: s.frequency ?? 3}));
    setComposerLocked(hits.length === 1);
    // 複数ヒットのときだけ候補を出してユーザーに選ばせる。0件は空欄（＝未登録作曲家の材料）。
    setPendingComposers(hits.length > 1 ? hits.map(row => ({ label: row.display, reading: row.reading || "" })) : []);
    setDurationEdited(false); setEraEdited(false); setSuggestions([]); setComposerDoubt(false);
    // v281: 照合が通ったときだけ裏取りする。空欄・候補提示中は確かめる対象がない。
    if (hits.length === 1) verifyComposer(decided, rest.title || "");
  };

  // v281: AIの人違いに摩擦を作る。
  // v280 が守るのは「表記の正しさ」であって「事実の正しさ」ではない。
  // AIが Holiday Diary を A.Benjamin の曲だと間違えても、A.Benjamin がリストに居れば✓が付く。
  // そこで、照合が通った直後に AI へ1問だけ聞き直し、AIが自分の回答を否定したら ！ を出す。
  //
  // これは判定ではない。AIの答えを採用して作曲家を消したり書き換えたりはしない（それはv269の逆行）。
  // 出すのは印だけで、直すかどうかはユーザーが決める。
  // 「いつもと違う挙動になれば、人間もアレ！？となる」— 判定を任せるのではなく、摩擦を作る。
  const verifyComposer = async (name, title) => {
    if (!name || !title) return;
    const myId = ++reqIdVerify.current; // この裏取りの世代番号
    try {
      const q = "クラシックピアノの曲「" + title + "」は、作曲家 " + name + " の作品ですか。"
        + "JSONのみ:{\"match\":true または false}。"
        + "確信が持てない場合や、別の作曲家の作品である可能性が高い場合は false。";
      const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:200,messages:[{role:"user",content:q}]})});
      const data = await res.json();
      if (myId !== reqIdVerify.current) return; // 自分が最新でなければ捨てる
      const text = data.content.map(b=>b.text||"").join("");
      try {
        const parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}")+1));
        // AIが明示的に false と言ったときだけ！。返事が壊れていたら何もしない（黙って✓のまま）。
        setComposerDoubt(parsed.match === false);
      } catch(parseErr){ console.error("verify parse失敗:",parseErr); }
    } catch(e){ if(myId===reqIdVerify.current) console.error(e); }
  };

  // v280: 曖昧ヒット時の候補からユーザーが選んだとき。
  // selectComposer と違い composerLocked の履歴を見ない（空欄→確定なので曲名は消さない）。
  const selectPendingComposer = (name) => {
    setPiece(p=>({...p, composer:name}));
    setPendingComposers([]); setComposerLocked(true);
    // v281: ここも照合が通った瞬間なので裏取りする（selectSuggestionと対で存在する処理）。
    setComposerDoubt(false);
    verifyComposer(name, piece.title || "");
  };

  const handleAdd = () => {
    if (!piece.title || !piece.composer) return;
    // yearText → year の変換（不明・範囲対応）
    let yearNum = piece.year;
    const yt = (piece.yearText||"").trim();
    if (yt === "不明") yearNum = 0;
    else if (/^\d{4}-\d{4}$/.test(yt)) yearNum = parseInt(yt.split("-")[0]);
    else if (/^\d{4}$/.test(yt)) yearNum = parseInt(yt);
    // v271: 時代は手で選び直したときだけその値を送る。触っていなければ作曲年から補完（durationEditedと同じ考え方）
    onAdd({...piece, year:yearNum, yearText: yt||String(yearNum), era: eraEdited ? piece.era : eraFromYear(yearNum)});
    setPiece(EMPTY_PIECE); setComposerSuggestions([]); setSuggestions([]);
    setComposerLocked(false); setDurationEdited(false); setEraEdited(false); setPendingComposers([]); setComposerDoubt(false);
  };

  const inp2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel2 = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  return (
    <div style={{background:"#EEF1F5",border:"1px solid #D0D6DF",borderRadius:10,padding:22,position:"relative"}}>
      {/* ④ 右上✕ボタン */}
      <button onClick={onCancel} title="キャンセル"
        style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:"#6B7A90",fontSize:18,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
      <div style={{fontSize:15,letterSpacing:3,color:"#6B7A90",marginBottom:16,fontFamily:FONT,fontWeight:600}}>Add Piece</div>

      {/* 1行目: 作曲家・曲名（v270: 幅比 1:2） */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>作曲家</div>
          <div style={{position:"relative"}}>
            <input value={piece.composer} onChange={e=>onComposerChange(e.target.value)}
              placeholder="作曲家名（例：F.Chopin）" autoComplete="off"
              style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",borderColor:composerDoubt?"#D96B6B":(composerLocked?"#8BAED4":"#C8CEDB"),background:composerDoubt?"white":(composerLocked?"#F0F5FF":"white"),color:"#15233F"}} />
            {composerLocked && !composerDoubt && <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:12,color:"#6B9AC4"}}>✓</span>}
            {composerDoubt && <span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#C0392B",fontWeight:500}}>!</span>}
            {pendingComposers.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1px solid #C8CEDB",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
                <div style={{padding:"5px 14px",fontSize:10,color:"#6B7A90",fontFamily:FONT,background:"#F0F4FA",borderBottom:"1px solid #E8ECF2"}}>作曲家を選んでください</div>
                {pendingComposers.map((item,i)=>(
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectPendingComposer(item.label)}
                    style={{padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#15233F",borderBottom:"1px solid #E8ECF2",fontFamily:FONT,display:"flex",alignItems:"baseline",gap:8}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F0F4FA"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <span>{item.label}</span>
                    {item.reading && <span style={{fontSize:11,color:"#94A3BE"}}>{item.reading}</span>}
                  </div>
                ))}
              </div>
            )}
            {composerSuggestions.length>0 && (
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",border:"1px solid #C8CEDB",borderRadius:6,zIndex:100,boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
                {composerSuggestions.map((item,i)=>(
                  <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectComposer(item.label)}
                    style={{padding:"8px 14px",cursor:"pointer",fontSize:13,color:"#15233F",borderBottom:"1px solid #E8ECF2",fontFamily:FONT,display:"flex",alignItems:"baseline",gap:8}}
                    onMouseEnter={e=>e.currentTarget.style.background="#F0F4FA"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <span>{item.label}</span>
                    {item.reading && <span style={{fontSize:11,color:"#94A3BE"}}>{item.reading}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {composerDoubt && <div style={{fontSize:10,color:"#C0392B",marginTop:4,fontFamily:FONT,textAlign:"left"}}>作曲家が違う可能性があります</div>}
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>曲名</div>
          <div style={{position:"relative"}}>
            <input value={piece.title} onChange={e=>onTitleChange(e.target.value)}
              placeholder={piece.composer?piece.composer+"の曲を検索…":"曲名を入力…"}
              autoComplete="off" style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",opacity:piece.composer?1:0.5}} />
            {sugLoading && <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"#6B7A90",fontFamily:FONT}}>検索中…</div>}
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
                      <div style={{fontSize:11,color:"#6B7A90",fontFamily:FONT}}>{s.composer}　{s.year}年　{s.key}　{s.duration}分</div>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2行目: 調性・時代・作曲年・演奏時間（v270: 均等4分割） */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>調性</div>
          <select value={piece.key} onChange={e=>setPiece({...piece,key:e.target.value})} style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%"}}>{KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
        </div>
        <div>
          {/* v270: 時代を表示・編集可に（保存ロジックはv271。現状はeraFromYearの結果が保存される） */}
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>時代</div>
          <select value={piece.era||"romantic"} onChange={e=>{setPiece({...piece,era:e.target.value}); setEraEdited(true);}} style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%"}}>{ERA_ORDER.map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}</select>
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>作曲年</div>
          <input value={piece.yearText||(piece.year>0?String(piece.year):"")}
            onChange={e=>setPiece({...piece, yearText:e.target.value})}
            placeholder="例: 1810 / 1815-1820 / 不明"
            style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
        </div>
        <div>
          <div style={{fontSize:10,color:"#A8B4C8",marginBottom:3,fontFamily:FONT,textAlign:"left"}}>
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
              style={{background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 8px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box",borderColor:!durationEdited&&piece.title?"#C8A030":"#C8CEDB"}}
            />
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:24,justifyContent:"center",paddingTop:24,paddingBottom:4}}>
        <button onClick={handleAdd} style={{background:"transparent",border:"1.5px solid #C8A860",color:"#15233F",padding:"8px 28px",cursor:"pointer",fontSize:13,letterSpacing:2,fontFamily:FONT,borderRadius:4}}>追加する</button>
      </div>
    </div>
  );
};


// ── PORTFOLIO PAGE ────────────────────────────────────────────────────────────
const NAV  = [["manage","Library"],["events","Events"],["print","Portfolio"]];
const CONTENT_W = 1000; // v164: 全ページ共通のコンテンツ幅（ここ1か所で全体幅を調整）

const NOTATION_STYLES = {
  ja:     { label:"日本語（標準）",   example:"バラード 第1番 ト短調 Op.23" },
  ja_op:  { label:"日本語（Op.先）",  example:"バラード Op.23 No.1 ト短調" },
  en:     { label:"English",          example:"Ballade No.1 in G minor, Op.23" },
  formal: { label:"曲名のみ",         example:"バラード 第1番" },
};

const PrintPage = (props) => {
  const {allPool, pieces} = props;
  const {profile, setProfile, events} = props;
  // v156: パスワード変更
  const [pwOpen, setPwOpen] = useState(false);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwShow, setPwShow] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false); // v165: プロフィール詳細の開閉（普段は畳む）
  const handleChangePassword = async () => {
    setPwErr(""); setPwMsg("");
    if (pwNew.length < 6) { setPwErr("6文字以上にしてください"); return; }
    if (pwNew !== pwConfirm) { setPwErr("確認用パスワードが一致しません"); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    if (error) {
      // Secure password change / 再認証が必要な場合に分かりやすく
      const m = (error.message||"").toLowerCase();
      if (m.includes("reauth") || m.includes("session") || m.includes("recent") || m.includes("again")) {
        setPwErr("セキュリティのため、一度ログインし直してから変更してください。");
      } else {
        setPwErr("変更に失敗しました: " + error.message);
      }
    } else {
      setPwMsg("パスワードを変更しました。");
      setPwNew(""); setPwConfirm("");
      setPwOpen(false); // ★変更完了後はフォームを閉じる（謎の入力欄・ボタンを残さない）
    }
    setPwLoading(false);
  };
  const {portfolioTab, setPortfolioTab} = props;
  const {addListItem, updateListItem, removeListItem} = props;
  const {handlePhoto, photoInputRef} = props;
  const {saveProfile, profileSaveMsg} = props;
  const {handleLogout} = props; // v167: ログアウト（ヘッダーから移設）
  const {documents, setDocuments, saveDocuments} = props;
  const {docSaveMsg, setDocSaveMsg} = props;
  const {scratchItems, setScratchItems} = props;
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [bioCheck, setBioCheck] = useState({ basic:true, education:true, teacher:true });
  const [showBioPanel, setShowBioPanel] = useState(false);
  const [hamPfOpen, setHamPfOpen] = useState(false); // v196: Portfolioの三線メニュー
  const hamPfRef = useCloseOnOutsideClick(hamPfOpen, () => setHamPfOpen(false)); // v276
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
    profile:false, repertoire:false,
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
  const inpS = {background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"6px 9px",fontFamily:FONT,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const lblS = {fontSize:10,color:"#94A3BE",marginBottom:4,fontFamily:FONT};
  const secTitle = (t) => (
    <div style={{fontSize:11,letterSpacing:3,color:"#94A3BE",fontFamily:FONT,marginBottom:10,marginTop:20,borderBottom:"1px solid #1E2A45",paddingBottom:4}}>{t}</div>
  );
  const addBtn = (label,onClick) => (
    <button onClick={onClick} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4,marginTop:6}}>
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
    // v285(③-1): プログラム出力を廃止（Atelierは別アプリへ分離）。

    setOutText(parts.join(String.fromCharCode(10)+String.fromCharCode(10)));
    setOutStep(4);
  };

  const COUNTRIES = ["ー","日本","ドイツ","オーストリア","フランス","イタリア","ロシア","ポーランド","ハンガリー","チェコ","スペイン","イギリス","アメリカ","アルゼンチン","ブラジル","中国","韓国","その他"];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Inner tabs（インデックスタブ v213：Libraryと統一） */}
      <div style={{background:"transparent",padding:"0 28px",flexShrink:0,width:"100%",maxWidth:CONTENT_W,margin:"6px auto 24px",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:4}}>
          {[["profile","Profile"],["output","Documents"]].map(([k,l])=>(
            <button key={k} onClick={()=>setPortfolioTab(k)}
              style={{
                background:portfolioTab===k?"#C8A860":"transparent",
                border:"none",
                color:portfolioTab===k?"#1A1206":"#94A3BE",
                padding:portfolioTab===k?"7px 18px":"7px 14px",
                cursor:"pointer",fontSize:13,fontFamily:FONT,letterSpacing:1,
                fontWeight:portfolioTab===k?700:400,
                borderRadius:"6px 6px 0 0",
                transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{height:1.5,background:"#C8A860",width:"100%"}}/>
      </div>

      {/* ── PROFILE ── */}
      {portfolioTab==="profile" && (
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
          <div style={{maxWidth:CONTENT_W,margin:"0 auto",padding:"28px 28px 140px",boxSizing:"border-box"}}>


            {/* ── アカウント情報 ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2px solid #4A5A7A",paddingBottom:13,marginBottom:40,marginTop:19}}>
              <span style={{fontSize:15,fontWeight:600,color:"#EDE6D6",fontFamily:FONT,letterSpacing:"0.05em"}}>Account</span>
              <button onClick={handleLogout}
                style={{background:"none",border:"none",color:"#9A8868",cursor:"pointer",fontSize:12,fontFamily:FONT,padding:0,letterSpacing:"0.03em"}}>
                ログアウト
              </button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:28,marginBottom:56}}>
              {[
                ["表示名",   <input value={profile.nameJa} onChange={e=>setProfile(p=>({...p,nameJa:e.target.value}))} placeholder="" style={{...inpS,flex:1,maxWidth:360}}/>],
                ["メールアドレス", <input value={profile.contact.email} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,email:e.target.value}}))} placeholder="email@example.com" style={{...inpS,flex:1,maxWidth:360}}/>],
                ["パスワード",     <div style={{flex:1}}>
                  {!pwOpen ? (
                    <button onClick={()=>{setPwOpen(true);setPwErr("");setPwMsg("");}} style={{background:"none",border:"1px solid #C8A860",color:"#C8A860",padding:"6px 16px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:FONT}}>変更する</button>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{position:"relative"}}>
                        <input type={pwShow?"text":"password"} value={pwNew} onChange={e=>setPwNew(e.target.value)} placeholder="新しいパスワード（6文字以上）" style={{...inpS,paddingRight:52}}/>
                        <button onClick={()=>setPwShow(!pwShow)} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#7A8FA8",fontSize:11,fontFamily:FONT,cursor:"pointer",padding:0}}>{pwShow?"隠す":"表示"}</button>
                      </div>
                      <div style={{position:"relative"}}>
                        <input type={pwShow?"text":"password"} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} placeholder="新しいパスワード（確認）" style={{...inpS,paddingRight:52}}/>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={handleChangePassword} disabled={pwLoading} style={{background:"#C8A860",border:"none",color:"#0F1A33",padding:"6px 16px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:FONT,fontWeight:600,opacity:pwLoading?0.6:1}}>{pwLoading?"処理中...":"変更を保存"}</button>
                        <button onClick={()=>{setPwOpen(false);setPwNew("");setPwConfirm("");setPwErr("");setPwMsg("");}} style={{background:"none",border:"1px solid #C8CEDB",color:"#A8B4C8",padding:"6px 16px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:FONT}}>キャンセル</button>
                      </div>
                      {pwErr && <div style={{fontSize:11,color:"#C0405A",fontFamily:FONT}}>{pwErr}</div>}
                    </div>
                  )}
                  {pwMsg && <div style={{fontSize:11,color:"#2A7A3A",fontFamily:FONT,marginTop:6}}>{pwMsg}</div>}
                </div>],
              ].map(([label, input])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:0}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,width:130,flexShrink:0,textAlign:"right",paddingRight:14,boxSizing:"border-box"}}>{label}</div>
                  {input}
                </div>
              ))}
            </div>

            {showBioPanel && (
              <div style={{marginTop:10,marginBottom:16,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:FONT,marginBottom:10}}>出力する項目を選んでください</div>
                <div style={{display:"flex",gap:16,marginBottom:12,fontSize:12,fontFamily:FONT,color:"#C8CEDB"}}>
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
                  style={{background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4,width:"100%",fontWeight:600}}>
                  ✓ チェックした項目で、ドキュメント作成
                </button>
              </div>
            )}
            {/* ── プロフィール詳細（v165: 畳む・使う人だけ開く） ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"2px solid #4A5A7A",paddingBottom:7,marginBottom:40,marginTop:19}}>
              <div onClick={()=>setShowProfileDetail(v=>!v)}
                style={{fontSize:15,fontWeight:600,color:"#EDE6D6",fontFamily:FONT,letterSpacing:"0.05em",cursor:"pointer",display:"flex",alignItems:"center",gap:8,userSelect:"none"}}>
                <span>Biography</span>
                <span style={{fontSize:10,color:"#7A8FA8"}}>{showProfileDetail?"▲":"▼"}</span>
              </div>
              <div style={{position:"relative"}} ref={hamPfRef}>
                <button onClick={()=>setHamPfOpen(v=>!v)}
                  title="メニュー"
                  style={{background:"none",border:"none",color:"#94A3BE",fontSize:16,cursor:"pointer",
                    padding:"3px 5px",lineHeight:1,width:28,height:28,display:"inline-flex",
                    alignItems:"center",justifyContent:"center"}}>
                  ≡
                </button>
                {hamPfOpen && (
                  <div style={{position:"absolute",right:0,top:"110%",background:"#1C2E4A",
                    border:"1px solid #2A3F6A",borderRadius:6,zIndex:50,minWidth:160,
                    boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
                    <button onClick={()=>{setShowBioPanel(true);setHamPfOpen(false);}}
                      style={{display:"block",width:"100%",textAlign:"left",background:"none",
                        border:"none",color:"#EDE6D6",padding:"10px 14px",cursor:"pointer",
                        fontSize:12,fontFamily:FONT}}>
                      📦 ドキュメントを作成
                    </button>
                  </div>
                )}
              </div>
            </div>
            {showProfileDetail && (<React.Fragment>
            <div style={{display:"flex",flexDirection:"column",gap:28}}>
              {[
                ["氏名（日本語）", <input value={profile.nameJa} onChange={e=>setProfile(p=>({...p,nameJa:e.target.value}))} placeholder="" style={{...inpS,flex:1,maxWidth:360}}/>],
                ["氏名（英語）",   <input value={profile.nameEn} onChange={e=>setProfile(p=>({...p,nameEn:e.target.value}))} placeholder="" style={{...inpS,flex:1,maxWidth:360}}/>],
                ["生年月日",       <input type="date" value={profile.birthDate} onChange={e=>setProfile(p=>({...p,birthDate:e.target.value}))} style={{...inpS,flex:1,maxWidth:200}}/>],
                ["国籍",           <div style={{flex:1,position:"relative"}}>
                  <input value={profile.nationality||""} onChange={e=>setProfile(p=>({...p,nationality:e.target.value}))} placeholder="国名を入力（例：Ja → Japan）" style={{...inpS,width:"100%",maxWidth:240}}/>
                  {(profile.nationality||"").trim().length>0 && COUNTRY_LIST.filter(c=>{const q=(profile.nationality||"").toLowerCase();return c.ja.toLowerCase().includes(q)||c.en.toLowerCase().includes(q);}).length>0 && !COUNTRY_LIST.some(c=>(c.ja+" / "+c.en)===profile.nationality) && (
                    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#16243F",border:"1px solid #2A3A5A",borderRadius:6,zIndex:20,maxHeight:160,overflowY:"auto"}}>
                      {COUNTRY_LIST.filter(c=>{const q=(profile.nationality||"").toLowerCase();return c.ja.toLowerCase().includes(q)||c.en.toLowerCase().includes(q);}).slice(0,8).map(c=>(
                        <div key={c.en} onClick={()=>setProfile(p=>({...p,nationality:c.ja+" / "+c.en}))} style={{padding:"6px 10px",cursor:"pointer",fontSize:13,color:"#EDE6D6",fontFamily:FONT}}>{c.ja} / {c.en}</div>
                      ))}
                    </div>
                  )}
                </div>],
                ["郵便番号",       <input value={profile.postalCode||""} onChange={e=>setProfile(p=>({...p,postalCode:e.target.value}))} placeholder="" style={{...inpS,flex:1,maxWidth:160}}/>],
                ["住所",           <input value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))} placeholder="" style={{...inpS,flex:1,maxWidth:520}}/>],
                ["電話",           <input value={profile.contact.tel} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,tel:e.target.value}}))} placeholder="" style={{...inpS,flex:1,maxWidth:240}}/>],
                ["SNS",            <input value={profile.contact.sns} onChange={e=>setProfile(p=>({...p,contact:{...p.contact,sns:e.target.value}}))} placeholder="" style={{...inpS,flex:1,maxWidth:360}}/>],
              ].map(([label, input])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:0}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,width:130,flexShrink:0,textAlign:"right",paddingRight:14,boxSizing:"border-box"}}>{label}</div>
                  {input}
                </div>
              ))}
            </div>

            {/* ①②③④⑤ 学歴・師事者をgap:16統合コンテナで揃える */}
            <div style={{display:"flex",flexDirection:"column",gap:18,marginTop:28}}>
              {(profile.educations||[]).map((ed,idx)=>(
                <div key={ed.id} style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,width:130,flexShrink:0,textAlign:"right",paddingRight:14,boxSizing:"border-box"}}>{idx===0?"学歴":""}</div>
                  <input value={ed.period||""} onChange={e=>updateListItem("educations",ed.id,{period:e.target.value})} placeholder="期間" style={{...inpS,flex:"0 0 130px"}}/>
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
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,marginTop:idx===0?10:0,flexWrap:"wrap"}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,width:130,flexShrink:0,textAlign:"right",paddingRight:14,boxSizing:"border-box"}}>{idx===0?"師事者":""}</div>
                  <input value={t.period||""} onChange={e=>updateListItem("teachers",t.id,{period:e.target.value})} placeholder="期間" style={{...inpS,flex:"0 0 130px"}}/>
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
            </React.Fragment>)}

            {/* v165: 自動保存に移行（手動保存ボタン・上の下線を引退）。保存表示だけ残す。 */}
            {/* v166: 保存トースト（右上にふわっと・数秒で消える） */}
            {profileSaveMsg && (
              <div style={{position:"fixed",top:20,right:20,zIndex:9999,background:"#16243F",border:"1px solid #2A3A5A",color:"#EDE6D6",padding:"10px 18px",borderRadius:8,fontSize:13,fontFamily:FONT,boxShadow:"0 4px 16px rgba(0,0,0,0.25)"}}>
                {profileSaveMsg}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── OUTPUT ── */}
      {portfolioTab==="output" && (
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{maxWidth:CONTENT_W,margin:"0 auto",padding:"20px 28px 140px",display:"flex",flexDirection:"column",gap:20}}>

            {/* ⑤ 全ステップを1ページに */}

            {/* ▼▼ STEP 1〜3 を眠らせています（false で非表示・将来復活可能） ▼▼ */}
            {false && (<React.Fragment>
            {/* STEP 1: 出力したい項目を選ぶ */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:10}}>STEP 1　出力したい項目を選んでください（複数選択可）</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  ["profile","プロフィール"],
                  ["repertoire","レパートリー"],
                  ["contests","コンクール歴"],
                  ["performances","演奏活動"],
                  ["upcoming","現在の活動"],
                ].map(([k,l])=>(
                  <label key={k} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                    background:outItems[k]?"#F4F6F9":"#15233F",
                    border:outItems[k]?"1.5px solid #C8A860":"1px solid #1E2A45",
                    borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:FONT,
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
                  <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT}}>STEP 2　レパートリーの内容を選ぶ</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setOutRepIds(pieces.map(p=>p.id))}
                      style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:FONT,borderRadius:3}}>すべて選択</button>
                    <button onClick={()=>setOutRepIds([])}
                      style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:FONT,borderRadius:3}}>すべて解除</button>
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
                        fontSize:12,fontFamily:FONT,color:checked?"#15233F":"#94A3BE"}}>
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
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:10,textAlign:"center"}}>STEP 3　出力言語</div>
              <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
                {[["ja","日本語"],["en","English"]].map(([v,l])=>(
                  <label key={v} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 20px",
                    background:outLang===v?"#F4F6F9":"#15233F",
                    border:outLang===v?"1.5px solid #C8A860":"1px solid #1E2A45",
                    borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:FONT,
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
                    setOutText(parts.join(String.fromCharCode(10)+String.fromCharCode(10)));
                  }}
                  style={{marginLeft:"auto",background:"#C8A860",border:"none",color:"#0F1A33",padding:"7px 20px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4,fontWeight:"bold"}}>
                  生成する
                </button>
              </div>
            </div>
            </React.Fragment>)}
            {/* ▲▲ STEP 1〜3 ここまで眠り ▲▲ */}

            {/* 🎨 スクラッチ（組み立て） */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px",marginTop:12}}>
              <div style={{fontSize:13,color:"#E8ECF4",fontFamily:FONT,marginBottom:12,letterSpacing:1}}>🎨 スクラッチ（組み立て）</div>
              <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,marginBottom:10}}>ボックスのパーツを並べて、1つの書類に組み立てます</div>
              {scratchItems.length===0 ? (
                <div style={{fontSize:12,color:"#5A6B8C",fontFamily:FONT,textAlign:"center",padding:"12px 0"}}>
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
                      <span style={{fontSize:12,color:"#6B7A90",fontFamily:FONT,minWidth:18}}>{idx+1}</span>
                      <span style={{flex:1,fontSize:12,color:"#C8CEDB",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</span>
                      <button onClick={()=>setScratchItems(scratchItems.filter((_,i)=>i!==idx))}
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>
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
                style={{marginTop:10,background:"transparent",border:"1px dashed #C8A860",color:"#C8A860",padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4,width:"100%"}}>
                ＋ ボックスから追加
              </button>
              {showAddPanel && (
                <div style={{marginTop:8,background:"#0F1A33",border:"1px solid #1E2A45",borderRadius:6,padding:"8px 10px"}}>
                  <div style={{fontSize:11,color:"#94A3BE",fontFamily:FONT,marginBottom:8}}>追加したいパーツをクリック</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {documents.map(doc=>(
                      <button key={doc.id} onClick={()=>{
                          setScratchItems([...scratchItems, {id:Date.now()+"_"+doc.id, name:doc.name, text:doc.text}]);
                        }}
                        style={{textAlign:"left",background:"#15233F",border:"1px solid #2A3A5A",color:"#C8CEDB",padding:"7px 10px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4}}>
                        ＋ {doc.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>setShowAddPanel(false)}
                    style={{marginTop:8,background:"transparent",border:"none",color:"#6B7A90",padding:"4px 0",cursor:"pointer",fontSize:11,fontFamily:FONT}}>
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
                  style={{marginTop:10,background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4,width:"100%",fontWeight:600}}>
                  ▲ この順番で、編集画面に送る
                </button>
              )}
            </div>

            {/* STEP 4: 編集 */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:6,textAlign:"center"}}>編集</div>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
                <span style={{fontSize:11,color:"#94A3BE",fontFamily:FONT}}>{outText.length} 文字</span>
              </div>
              <textarea value={outText} onChange={e=>setOutText(e.target.value)}
                style={{width:"100%",minHeight:200,background:"#F4F6F9",border:"1px solid #C8CEDB",
                  color:"#15233F",padding:"10px",fontFamily:FONT,fontSize:13,borderRadius:4,
                  lineHeight:1.8,resize:"vertical",boxSizing:"border-box"}}/>
            </div>

            {/* STEP 5: 出力 */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:12,textAlign:"center"}}>出力</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
                <button onClick={()=>{const w=window.open("","_blank");const html=outText.split(String.fromCharCode(10)).join("<br>");w.document.write("<html><body style='font-family:serif;padding:40px;line-height:1.9;color:#0F1A33'>"+html+"</body></html>");w.document.close();w.print();}}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4}}>
                  🖨 PDF / 印刷
                </button>
                <button onClick={()=>{const blob=new Blob(["<html><body style='font-family:serif;font-size:12pt;line-height:1.8;'>"+outText.split(String.fromCharCode(10)).join("<br>")+"</body></html>"],{type:"application/msword"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="repertia_output.doc";a.click();}}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4}}>
                  📄 Word でダウンロード
                </button>
                <button onClick={()=>navigator.clipboard.writeText(outText).catch(()=>{})}
                  style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4}}>
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
                  style={{background:"#1E2A45",border:"1px solid #C8A860",color:"#E8ECF4",padding:"10px 24px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4}}>
                  📦 ボックスに保存
                </button>
                {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:FONT,marginLeft:8,alignSelf:"center"}}>{docSaveMsg}</span>}
              </div>
              <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#94A3BE",fontFamily:FONT}}>
                Googleドキュメント等に貼り付けて編集できます
              </div>
            </div>

            {/* 📦 ドキュメントボックス */}
            <div style={{background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px",marginTop:12}}>
              <div style={{fontSize:13,color:"#E8ECF4",fontFamily:FONT,marginBottom:12,letterSpacing:1}}>📦 ドキュメントボックス</div>
              {documents.length===0 ? (
                <div style={{fontSize:12,color:"#5A6B8C",fontFamily:FONT,textAlign:"center",padding:"12px 0"}}>
                  保存した書類がここに溜まります
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {documents.map(doc=>(
                    <div key={doc.id} style={{display:"flex",alignItems:"center",gap:8,background:"#0F1A33",border:"1px solid #1E2A45",borderRadius:4,padding:"8px 10px"}}>
                      <span style={{flex:1,fontSize:12,color:"#C8CEDB",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</span>
                      <button onClick={()=>setOutText(doc.text)}
                        style={{background:"transparent",border:"1px solid #C8A860",color:"#C8A860",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>
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
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>
                        名前変更
                      </button>
                      <button onClick={()=>{const next=documents.filter(d=>d.id!==doc.id); setDocuments(next); saveDocuments(next);}}
                        style={{background:"transparent",border:"1px solid #3A4660",color:"#94A3BE",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>
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
const FilterBar = ({pool, searchQ, setSearchQ, sortBy, setSortBy, sortAsc, setSortAsc, filterMark, setFilterMark, filterNote, setFilterNote, filterRest, setFilterRest, poolFiltered, editMode, setEditMode, sel, SANS, onAdd, onDoc, composerPool=[]}) => {
  const [expanded, setExpanded] = useState(false);
  const [hamOpen, setHamOpen] = useState(false);
  const hamRef = useCloseOnOutsideClick(hamOpen, () => setHamOpen(false)); // v276
  const [viewOpen, setViewOpen] = useState(false); // v346 ④: 「表示」ドロップダウン（並び順＋絞り込み）
  const viewRef = useCloseOnOutsideClick(viewOpen, () => setViewOpen(false));
  const isMobile = useIsMobile(640); // v342: スマホは操作列をエラバー幅いっぱいに（検索ボックスがflex:1で余白を吸う）
  const SORT_OPTS = [["composer","作曲家"],["year","作曲年"],["duration","演奏時間"]];
  return (
    <div style={{background:"transparent",flexShrink:0,width:isMobile?"100%":"auto"}}>
      <div style={{display:"flex",gap:6,alignItems:"center",justifyContent:"flex-end",flexWrap:isMobile?"nowrap":"wrap"}}>
        <SearchBox searchQ={searchQ} setSearchQ={setSearchQ} allPool={pool} composerPool={composerPool} flex={isMobile} compact={isMobile} />
        {/* v346 ④: 「並べ替え」→「表示」ドロップダウン。並び順(排他)＋絞り込み(♪𝄽独立トグルOR)を2セクションで同居。
             v346 ⑤: 操作列にあった♪𝄽トグルは撤去（ここ「表示」内に移設）。空いた幅は検索ボックス(flex:1)が吸収。 */}
        <div style={{position:"relative",flexShrink:0}} ref={viewRef}>
          <button onClick={()=>setViewOpen(v=>!v)}
            style={{background:isMobile?"#1B2942":"#F4F6F9",border:isMobile?"1px solid #35456380":"1px solid #C8CEDB",color:isMobile?"#C8CEDB":"#15233F",padding:isMobile?"2px 10px":"4px 10px",
              cursor:"pointer",fontSize:12,fontFamily:FONT,lineHeight:1.2,borderRadius:4,boxSizing:"border-box",
              display:"flex",alignItems:"center",justifyContent:"center",gap:5,whiteSpace:"nowrap",minWidth:isMobile?84:"auto"}}>
            表示
            <span style={{fontSize:9,color:isMobile?"#8A94A8":"#8A94A8"}}>▼</span>
          </button>
          {viewOpen && (
            <div style={{position:"absolute",right:0,top:"110%",background:"#1C2E4A",border:"1px solid #2E3E5E",borderRadius:6,boxShadow:"0 4px 12px rgba(0,0,0,0.3)",zIndex:60,minWidth:isMobile?120:180,overflow:"hidden"}}>
              {/* 並び順（排他・1つ選択）。▲▼を見出しの隣に置く（選択中を金） */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px 4px"}}>
                <span style={{fontSize:10,color:"#8A94A8",fontFamily:FONT,letterSpacing:1}}>並び順</span>
                <span style={{display:"flex",gap:10}}>
                  <span onClick={()=>setSortAsc(true)} title="昇順"
                    style={{fontSize:12,cursor:"pointer",color:sortAsc?"#C8A860":"#8A94A8"}}>▲</span>
                  <span onClick={()=>setSortAsc(false)} title="降順"
                    style={{fontSize:12,cursor:"pointer",color:!sortAsc?"#C8A860":"#8A94A8"}}>▼</span>
                </span>
              </div>
              {SORT_OPTS.map(([val,label])=>(
                <button key={val} onClick={()=>setSortBy(val)}
                  style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",textAlign:"left",background:"none",border:"none",color:sortBy===val?"#C8A860":"#C8CEDB",fontSize:12,fontFamily:FONT,padding:"8px 14px",cursor:"pointer"}}>
                  <span>{label}</span>
                  {sortBy===val && <span style={{fontSize:11,color:"#C8A860"}}>✓</span>}
                </button>
              ))}
              {/* 絞り込み（独立ON/OFF・♪𝄽・記号のみ） */}
              <div style={{padding:"8px 14px 4px",fontSize:10,color:"#8A94A8",fontFamily:FONT,letterSpacing:1,borderTop:"1px solid #2E3E5E"}}>絞り込み</div>
              <button onClick={()=>setFilterNote(v=>!v)}
                style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",textAlign:"left",background:"none",border:"none",color:filterNote?"#C8A860":"#C8CEDB",fontSize:12,fontFamily:FONT,padding:"8px 14px",cursor:"pointer"}}>
                <span style={{fontFamily:"RepertiaMusic, sans-serif",fontSize:15}}>{"\u266A"}</span>
                {filterNote && <span style={{fontSize:11,color:"#C8A860"}}>✓</span>}
              </button>
              <button onClick={()=>setFilterRest(v=>!v)}
                style={{display:"flex",width:"100%",alignItems:"center",justifyContent:"space-between",textAlign:"left",background:"none",border:"none",color:filterRest?"#C8A860":"#C8CEDB",fontSize:12,fontFamily:FONT,padding:"8px 14px",cursor:"pointer"}}>
                <span style={{fontFamily:"RepertiaMusic, sans-serif",fontSize:13}}>{"\u{1D13D}"}</span>
                {filterRest && <span style={{fontSize:11,color:"#C8A860"}}>✓</span>}
              </button>
            </div>
          )}
        </div>
        <div style={{position:"relative",flexShrink:0,display:"flex",alignItems:"center"}} ref={hamRef}>
          <button onClick={()=>setHamOpen(v=>!v)}
            title="メニュー"
            style={{background:"none",border:"none",color:"#94A3BE",fontSize:16,cursor:"pointer",
              padding:isMobile?"3px 0 3px 6px":"3px 5px",lineHeight:1,width:isMobile?"auto":28,height:28,display:"inline-flex",
              alignItems:"center",justifyContent:"center"}}>
            ≡
          </button>
          {hamOpen && (
            <div style={{position:"absolute",right:0,top:"110%",background:"#1C2E4A",
              border:"1px solid #2A3F6A",borderRadius:6,zIndex:50,minWidth:140,
              boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
              {onAdd && (
                <button onClick={()=>{onAdd();setHamOpen(false);}}
                  style={{display:"block",width:"100%",textAlign:"left",background:"none",
                    border:"none",color:"#EDE6D6",padding:"10px 14px",cursor:"pointer",
                    fontSize:12,fontFamily:FONT}}>
                  ＋ 曲を追加
                </button>
              )}
              {onDoc && (
                <button onClick={()=>{onDoc();setHamOpen(false);}}
                  style={{display:"block",width:"100%",textAlign:"left",background:"none",
                    border:"none",color:"#EDE6D6",padding:"10px 14px",cursor:"pointer",
                    fontSize:12,fontFamily:FONT}}>
                  📦 ドキュメントを作成
                </button>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ── PieChart (top-level) ────────────────────────────────────────────────────
const EraBar = ({pieces, learning=false, filterBar=null}) => {
  const isMobile = useIsMobile(640); // v341: スマホのみヘッダー再配置（PCは現状維持）
  const pool = learning ? pieces.filter(p=>p.learning) : pieces.filter(p=>!p.learning);
  const total = pool.length;
  if (total===0) return null;
  const counts = ERA_ORDER.map(k=>({key:k, ...ERAS[k], count:pool.filter(p=>p.era===k).length})).filter(d=>d.count>0);
  const stops = [];
  let pct = 0;
  counts.forEach((d,i)=>{
    const w = d.count/total*100;
    const s = Math.max(0, pct-4).toFixed(1);
    const e = Math.min(100, pct+w+4).toFixed(1);
    if (i===0) stops.push(d.color+" 0%");
    else stops.push(d.color+" "+s+"%");
    stops.push(d.color+" "+e+"%");
    pct += w;
  });
  if (stops.length>0) stops[stops.length-1] = counts[counts.length-1].color+" 100%";
  const grad = "linear-gradient(to right, "+stops.join(", ")+")";
  // 部品：タイトル＋件数 / 凡例（時代内訳）。PC/スマホで置き場所だけ変える。
  const titleBlock = (
    <div style={{display:"flex",alignItems:"baseline",gap:8}}>
      <span style={{fontSize:15,fontWeight:600,color:"#EDE6D6",fontFamily:FONT,letterSpacing:"0.05em"}}>{learning?"Learning":"Repertoire"}</span>
      <span style={{fontSize:18,fontWeight:700,color:"#EDE6D6",fontFamily:FONT}}>{total}</span>
    </div>
  );
  const legendBlock = (
    <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",justifyContent:"flex-end"}}>
      {counts.map(d=>(
        <div key={d.key} style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:d.color,flexShrink:0}}/>
          <span style={{fontSize:11,color:"#94A3BE",fontFamily:FONT}}>{d.label} {d.count}</span>
        </div>
      ))}
    </div>
  );
  // v341: スマホ用の内訳＝英字略号(abbr)＋色分け・色丸なし。
  //   時代名は元色・少し太め(weight600)／数字は凡例と同じグレー・細め。1行に収まる。
  const legendMobile = (
    <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"baseline",justifyContent:"flex-end"}}>
      {counts.map(d=>(
        <span key={d.key} style={{fontSize:11,fontFamily:FONT}}>
          <span style={{color:d.color,fontWeight:600}}>{d.abbr}</span>
          <span style={{color:"#94A3BE",fontWeight:400}}> {d.count}</span>
        </span>
      ))}
    </div>
  );
  // v341: スマホ＝「上に情報(タイトル＋内訳＋バー)／下に操作」。
  //   1行目: 左タイトル・右内訳（両端振り分け）／ 直下にエラバー ／ その下に操作列を右寄せ。
  if (isMobile) {
    return (
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12,marginBottom:10}}>
          {titleBlock}
          <div style={{flex:1,minWidth:0,display:"flex",justifyContent:"flex-end"}}>{legendMobile}</div>
        </div>
        <div style={{height:10,borderRadius:5,background:grad}}/>
        {filterBar && (
          <div style={{marginTop:10}}>{filterBar}</div>
        )}
      </div>
    );
  }
  // PC＝現状維持（1行目: 左タイトル・右操作列／エラバー／下に凡例）。
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
        {titleBlock}
        {filterBar}
      </div>
      <div style={{height:10,borderRadius:5,background:grad}}/>
      <div style={{marginTop:6}}>{legendBlock}</div>
    </div>
  );
};

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
          <span style={{fontSize:10,color:"#94A3BE",fontFamily:FONT}}>{d.count}</span>
          <div style={{width:"100%",background:d.color,borderRadius:"3px 3px 0 0",height:Math.max(6,(d.count/maxCount)*80)+"px"}}/>
          <span style={{fontSize:9,color:"#94A3BE",fontFamily:FONT,textAlign:"center",lineHeight:1.2}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── ManagePage (top-level) ──────────────────────────────────────────────────
const ManagePage = (props) => {
  const {pieces, setPieces, poolFiltered, learningPoolFiltered, addPiecesFromProgram, showAdd, setShowAdd} = props;
  const {composers=[]} = props; // v263: 293人マスタ（検索用）
  const {documents, setDocuments, saveDocuments} = props;
  const {docSaveMsg, setDocSaveMsg} = props;
  const {editMode, setEditMode, onAddPiece, toggleFav} = props;
  const {promoteToRepertoire, demoteToLearning} = props; // v298: RP⇄LP 往復ハンドラ（App由来）
  const {toggleMarkNote, toggleMarkRest} = props; // v293: ♪𝄽
  const {filterMark, setFilterMark, sortBy, setSortBy, sortAsc, setSortAsc} = props;
  const {filterNote, setFilterNote, filterRest, setFilterRest} = props; // v340: ♪𝄽 絞り込みトグル
  const {searchQ, setSearchQ, sel, fmtDuration} = props;
  const {dashData, dashTotal} = props;
  const {dashAxis, setDashAxis, dashChart, setDashChart} = props;
  const {libraryTab, setLibraryTab, poolMode, setPoolMode} = props;
  const {toggleCandidate, onUpdatePiece} = props;
  const {composerFilter, setComposerFilter, titleFilter, setTitleFilter} = props;
  const {eraFilter, setEraFilter, yearMin, setYearMin, yearMax, setYearMax} = props;
  const {keyFilter, setKeyFilter} = props; // v270: LP調性フィルタ
  const {durMin, setDurMin, durMax, setDurMax} = props;
  const {diffMin, setDiffMin, diffMax, setDiffMax} = props;
  const {freqMin, setFreqMin, freqMax, setFreqMax, kwFilter, setKwFilter} = props;
  const {aiPieces, setAiPieces, aiLoading, askAILearning} = props;
  const {learningIds, setLearningIds, expandedId, setExpandedId} = props;
  const {events=[]} = props; // 逆引き用（この曲どのイベントで弾いた？）
  const [showRepDocPanel, setShowRepDocPanel] = useState(false);
  const [repDocIds, setRepDocIds] = useState([]);
  const [showLearnSearch, setShowLearnSearch] = useState(false); // Learning検索パネルの開閉（普段は閉じ）
  const [addedAiIds, setAddedAiIds] = useState([]); // 候補欄で「追加済み」にした曲のID（候補側の仮ID）
  // ★ Search Piece の AIサジェスト（作曲家・曲名）
  const [sugComposers, setSugComposers] = useState([]);
  const [sugPieces, setSugPieces] = useState([]);
  const [sugLoadingC, setSugLoadingC] = useState(false);
  const [sugLoadingT, setSugLoadingT] = useState(false);
  const sugTimerC = useRef(null);
  const sugTimerT = useRef(null);
  const reqIdC = useRef(0); // v150: レース対策
  // v266: Search Piece を閉じる＆入力内容を全クリア
  const clearLearnSearchFields = () => {
    setComposerFilter(""); setTitleFilter(""); setEraFilter("");
    setKeyFilter(""); // v270
    setYearMin(""); setYearMax("");
    setDurMin(""); setDurMax("");
    setDiffMin(0); setDiffMax(5);
    setSugComposers([]); setSugPieces([]);
    setAiPieces([]);
  };
  const closeAndClearLearnSearch = () => {
    setShowLearnSearch(false);
    clearLearnSearchFields();
  };
  // v266: ページ移動（ManagePageのアンマウント）時にも入力内容をクリア
  useEffect(() => {
    return () => { clearLearnSearchFields(); };
  }, []);
  const onComposerSearchChange = (val) => {
    setComposerFilter(val); setSugComposers([]);
    if (sugTimerC.current) clearTimeout(sugTimerC.current);
    if (!val.trim()) return;
    sugTimerC.current = setTimeout(async () => {
      const myId = ++reqIdC.current;
      setSugLoadingC(true);
      try {
        const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:800,messages:[{role:"user",content:"「"+val+"」で始まるまたは含むクラシックピアノ作曲家を8〜10名挙げてください。JSONのみ:{\"composers\":[\"名前1\",\"名前2\",\"名前3\",\"名前4\",\"名前5\",\"名前6\"]}"}]})});
        const data = await res.json();
        if (myId !== reqIdC.current) return;
        const text = data.content.map(b=>b.text||"").join("");
        try {
          setSugComposers(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}")+1)).composers||[]);
        } catch(parseErr){ console.error("composer parse失敗:",parseErr); setSugComposers([]); }
      } catch(e){ if(myId===reqIdC.current){ console.error(e); setSugComposers([]); } }
      if (myId===reqIdC.current) setSugLoadingC(false);
    }, 400);
  };
  const selectSugComposer = (name) => {
    setComposerFilter(name); setSugComposers([]);
  };
  // 逆引き：この曲(pieceId)が使われたイベントを返す
  // 過去=historyItems(スナップショット)のid照合／未来=items[].pieceId照合
  // v302: 演奏履歴の逆引きは「承認済み（in_history:true）かつ historyItems に含まれる曲」だけを見る。
  //   案A改（企画確定）：承認して初めて演奏履歴に載る。未承認イベント（History タブにいるが
  //   「History に登録」未押下・in_history:false・items のみ）の曲は演奏履歴に出さない。
  //   金庫「無い歴史を作ってはいけない」（v289）に一貫＝承認前は「まだ弾いた記録ではない」。
  //   従来は ev.items も見ていたため未承認の予定が演奏履歴に混入していた（★過負荷＝
  //   1つの逆引きが「演奏履歴」と「使用中警告」の2目的を抱えて干渉）。用途を演奏履歴に限定して解消。
  //   ※「予定含めた使用中警告」は現状これを使う箇所が無いため別関数は作らない（必要時に追加）。
  const findEventsForPiece = (pieceId) => {
    const pid = String(pieceId);
    return (events||[]).filter(ev => {
      if (!ev.in_history) return false; // 未承認は演奏履歴に出さない
      return Array.isArray(ev.historyItems) && ev.historyItems.some(s => String(s.id)===pid);
      // v286(③-2): programId経由の逆引きを廃止（Atelierは別アプリへ分離）。
    }).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  };
  return (
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* ② Library タブバー（インデックスタブ v212：金塗り＋細い金ライン1本・箱なし） */}
    <div style={{background:"transparent",padding:"0 28px",flexShrink:0,width:"100%",maxWidth:CONTENT_W,margin:"6px auto 24px",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,position:"relative"}}>
        {[["repertoire","Repertoire"],["learning","Learning"]].map(([k,l])=>(
          <button key={k} onClick={()=>setLibraryTab(k)}
            style={{
              background:libraryTab===k?"#C8A860":"transparent",
              border:"none",
              color:libraryTab===k?"#1A1206":"#94A3BE",
              padding:libraryTab===k?"7px 18px":"7px 14px",
              cursor:"pointer",fontSize:13,fontFamily:FONT,letterSpacing:1,
              fontWeight:libraryTab===k?700:400,
              borderRadius:"6px 6px 0 0",
              transition:"all 0.15s"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{height:1.5,background:"#C8A860",width:"100%"}}/>
    </div>

    {/* Learning タブ（プレースホルダー） */}
    {libraryTab==="learning" && (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* +曲を追加はFilterBarの三線メニューに移動（v195） */}

        {/* My Learning（棚の中身・銀の曲）— Repertoireと同じ作り */}
        <div style={{flex:1,overflowY:"auto"}}>
        <div style={{maxWidth:CONTENT_W,margin:"0 auto",padding:"40px 28px 140px"}}>
          <EraBar pieces={pieces} learning={true} filterBar={
            <FilterBar pool={pieces.filter(p=>p.learning)} searchQ={searchQ} setSearchQ={setSearchQ} sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc} filterMark={filterMark} setFilterMark={setFilterMark} filterNote={filterNote} setFilterNote={setFilterNote} filterRest={filterRest} setFilterRest={setFilterRest} poolFiltered={learningPoolFiltered} editMode={editMode} setEditMode={setEditMode} sel={sel} SANS={SANS} onAdd={()=>{setShowLearnSearch(!showLearnSearch);setEditMode(false);}} composerPool={composers} />
          } />
        {showLearnSearch && (<React.Fragment>
        {/* v268: RPと同じ並び（EraBarの下）。幅は親のCONTENT_Wを継承 */}
        <div style={{marginTop:10,marginBottom:20}}>
        {/* Search Piece パネル */}
        <div style={{background:"#EEF1F5",border:"1px solid #D0D6DF",borderRadius:10,padding:22,position:"relative",flexShrink:0}}>
          <button onClick={closeAndClearLearnSearch} title="キャンセル"
            style={{position:"absolute",top:10,right:12,background:"none",border:"none",color:"#6B7A90",fontSize:18,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>✕</button>
          <div style={{fontSize:15,letterSpacing:3,color:"#6B7A90",marginBottom:16,fontFamily:SANS,fontWeight:600}}>Search Piece</div>
          {/* v270: 1行目 作曲家・曲名（幅比 1:2） */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:6,marginBottom:8}}>
            <div>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>作曲家</div>
              <div style={{position:"relative"}}>
                <input value={composerFilter} onChange={e=>onComposerSearchChange(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
                {sugLoadingC && <div style={{position:"absolute",right:8,top:6,fontSize:10,color:"#94A3BE"}}>…</div>}
                {sugComposers.length>0 && (
                  <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#16243F",border:"1px solid #2A3A5A",borderRadius:6,zIndex:30,maxHeight:180,overflowY:"auto"}}>
                    {sugComposers.map((name,i)=>(
                      <div key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>selectSugComposer(name)}
                        style={{padding:"6px 10px",cursor:"pointer",fontSize:12,color:"#EDE6D6",fontFamily:SANS}}>{name}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>曲名</div>
              <input value={titleFilter} onChange={e=>setTitleFilter(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div>
            {/* v204: キーワード（感情タグ）は育成中のため一時非表示。データがたまったら復活 */}
            {/* <div>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>キーワード</div>
              <input value={kwFilter} onChange={e=>setKwFilter(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
            </div> */}
          </div>
          {/* v270: 2行目 6分割 — 調性(1)・時代(1)・作曲年〜(2)・演奏時間〜(2)。難易度はv269でLv/Popを外したため除外 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:10,alignItems:"end"}}>
            <div>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>調性</div>
              <select value={keyFilter} onChange={e=>setKeyFilter(e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}}>
                {KEYS.map(k=><option key={k} value={k==="ー"?"":k}>{k}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>時代</div>
              <select value={eraFilter} onChange={e=>setEraFilter(e.target.value)} style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}}>
                <option value="">ー</option>
                {ERA_ORDER.filter(k=>k!=="contemporary").map(k=><option key={k} value={k}>{ERAS[k].label}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>作曲年</div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={yearMin} onChange={e=>setYearMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#94A3BE",flexShrink:0}}>〜</span>
                <input value={yearMax} onChange={e=>setYearMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
            </div>
            <div style={{gridColumn:"span 2"}}>
              <div style={{fontSize:10,color:"#A8B4C8",fontFamily:SANS,marginBottom:2}}>演奏時間（分）</div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input value={durMin} onChange={e=>setDurMin(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
                <span style={{fontSize:10,color:"#94A3BE",flexShrink:0}}>〜</span>
                <input value={durMax} onChange={e=>setDurMax(e.target.value)} placeholder="ー" style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 7px",fontFamily:SANS,fontSize:13,borderRadius:4,width:"100%",boxSizing:"border-box"}} />
              </div>
            </div>
          </div>
                      <div style={{display:"flex",gap:16,marginTop:16,marginBottom:16,justifyContent:"center"}}>
            <button onClick={()=>{ setAiPieces([]); if(poolMode!=="ai") setPoolMode("ai"); askAILearning(); }}
              disabled={aiLoading}
              style={{flex:"0 0 30%",padding:"12px 6px",
                background:poolMode==="ai"?"#0F1A33":"white",
                border:"2px solid "+(poolMode==="ai"?"#0F1A33":"#2A3F6A"),
                color:poolMode==="ai"?"#C8A860":"#94A3BE",
                cursor:aiLoading?"wait":"pointer",fontSize:12,fontFamily:SANS,borderRadius:6,fontWeight:600}}>
              {aiLoading?"…":"検索結果を表示"}
            </button>
          </div>
        </div>
        </div>
        {/* 結果一覧 */}
        <div style={{marginBottom:20}}>
        <div style={{padding:"14px 0 8px"}}>
          {poolMode!=="ai" && aiPieces.length===0 && (
            <div style={{textAlign:"center",color:"#4A5A7A",padding:"32px 12px",fontSize:12,lineHeight:2,fontFamily:SANS}}>
              「検索結果を表示」で追加した曲はLearningリストに保存されます
            </div>
          )}
          {aiLoading && (
            <div style={{textAlign:"center",color:"#94A3BE",padding:"24px",fontSize:12,fontFamily:SANS}}>検索中…</div>
          )}
          {aiPieces
            .map(p=>{
              const era=ERAS[p.era]||ERAS.modern;
              const added=addedAiIds.includes(p.id)
                || pieces.some(x => x.title===p.title && x.composer===p.composer && x.learning);
              return (
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",marginBottom:4,
                  background:"#15233F",border:"1px solid #1E2A45",borderLeft:"3px solid "+era.color,borderRadius:5}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:"#EDE6D6",fontWeight:500,fontFamily:FONT,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.title}</div>
                    <div style={{fontSize:10,color:"#94A3BE",fontFamily:SANS}}>{p.composer} / {p.key} / {p.duration}分{p.durationSecs>0?p.durationSecs+"秒":""}</div>
                  </div>
                  <button onClick={async()=>{
                      if(addedAiIds.includes(p.id)) return;
                      // v278: 登録時にcomposerを空にするため、重複判定も空基準に揃える（曲名で照合）
                      if(pieces.some(x => x.title===p.title && x.learning)) return;
                      setAddedAiIds(prev=>[...prev,p.id]);
                      // v296: AI検索結果を Learning に追加する経路にも composers 照合を通す（症状②の修正）。
                      //   Add Piece 側の selectSuggestion と同じ方針（案A）：
                      //   AIが返した composer 文字列は「検索キー」としてのみ使い、値としては捨てる。
                      //   rankComposers で composers を引き、一意（1件）に決まったときだけ display を入れる。
                      //   複数ヒット・0件は空欄のまま（「推測しない・検索1位を無条件採用しない・空欄も情報」）。
                      const key = (p.composer || "").toLowerCase().trim();
                      const hits = key ? rankComposers(composers, key, 8) : [];
                      const decided = hits.length === 1 ? hits[0].display : "";
                      await addPiecesFromProgram([{...p, composer: decided}], {silent:true});
                    }}
                    disabled={added}
                    style={{background:added?"#1E2A45":"#0F1A33",border:"none",color:added?"#7A8AAA":"#E8D090",
                      padding:"5px 12px",borderRadius:4,cursor:added?"default":"pointer",
                      fontSize:11,fontFamily:SANS,fontWeight:600,flexShrink:0,whiteSpace:"nowrap"}}>
                    {added?"✓ 追加済み":"＋ 追加"}
                  </button>
                </div>
              );
            })
          }
        </div>
        </div>
        </React.Fragment>)}
          <div style={{background:"transparent",overflow:"hidden"}}>
            <div style={{padding:"2px 8px"}}>
              {learningPoolFiltered.length===0 ? (
                // v277: 「リストが空」と「検索結果がゼロ」は別の状態。同じメッセージを出さない
                pieces.filter(p=>p.learning).length===0 ? (
                  <div style={{textAlign:"center",color:"#5A6B8C",padding:"24px",fontSize:12,fontFamily:SANS}}>まだLearningの曲がありません。上で曲を探して追加してください。</div>
                ) : (
                  <div style={{textAlign:"center",color:"#5A6B8C",padding:"24px",fontSize:12,fontFamily:SANS}}>該当する曲はありません。</div>
                )
              ) : learningPoolFiltered.map(p => (
                <div key={p.id}>
                  <PieceCardUnified
                    p={p}
                    expanded={expandedId===p.id}
                    onToggleExpand={()=>setExpandedId(expandedId===p.id?null:p.id)}
                    inProgram={undefined}
                    onToggleFav={()=>toggleFav(p.id)}
                    onToggleMarkNote={()=>toggleMarkNote(p.id)}
                    onToggleMarkRest={()=>toggleMarkRest(p.id)}
                    onPromote={()=>promoteToRepertoire(p.id)}
                    onDemote={()=>demoteToLearning(p.id)}
                    onToggleCandidate={()=>toggleCandidate&&toggleCandidate(p.id)}
                    showControls={true}
                    onUpdatePiece={onUpdatePiece}
                    learningIds={learningIds}
                    composers={composers}
                    eventsForPiece={findEventsForPiece(p.id)}
                    onDeletePiece={async()=>{setPieces(ps=>ps.filter(x=>x.id!==p.id));setLearningIds(prev=>prev.filter(x=>x!==p.id));setExpandedId(null);await supabase.from('pieces').delete().eq('id',p.id);}}
                  />
                  {editMode && expandedId===p.id && (
                    <div style={{padding:"4px 12px 8px",background:"#15233F"}}>
                      <button onClick={async()=>{setPieces(ps=>ps.filter(x=>x.id!==p.id));setLearningIds(prev=>prev.filter(x=>x!==p.id));await supabase.from('pieces').delete().eq('id',p.id);}}
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
      </div>
    )}
    {/* Repertoire タブ */}
    {libraryTab==="repertoire" && (
    <div style={{flex:1,overflowY:"auto"}}>
    <div style={{maxWidth:CONTENT_W,margin:"0 auto",padding:"40px 28px 140px"}}>

      {/* ① EraBar（検索類をタイトル行に相乗り v211） */}
      <EraBar pieces={pieces} learning={false} filterBar={
        <FilterBar pool={pieces} searchQ={searchQ} setSearchQ={setSearchQ} sortBy={sortBy} setSortBy={setSortBy} sortAsc={sortAsc} setSortAsc={setSortAsc} filterMark={filterMark} setFilterMark={setFilterMark} filterNote={filterNote} setFilterNote={setFilterNote} filterRest={filterRest} setFilterRest={setFilterRest} poolFiltered={poolFiltered} editMode={editMode} setEditMode={setEditMode} sel={sel} SANS={SANS} onAdd={()=>{setShowAdd(!showAdd);setEditMode(false);}} onDoc={()=>{if(poolFiltered.length===0){window.alert("該当するデータがありません");return;}setShowRepDocPanel(!showRepDocPanel);}} composerPool={composers} />
      } />

      {/* ② ボタン行はFilterBarの三線メニューに移動（v195） */}

      {showRepDocPanel && (
        <div style={{marginTop:10,marginBottom:20,background:"transparent",borderBottom:"1px solid #1E2A45",padding:"0 2px 14px"}}>
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
          <AddPieceForm onAdd={onAddPiece} onCancel={()=>setShowAdd(false)} composerPool={composers} />
        </div>
      )}

      {/* 一覧エリア — フォームと分ける境界（FilterBarはEraBarへ移動 v211） */}
      <div style={{background:"transparent",overflow:"hidden"}}>
        <div style={{padding:"2px 8px"}}>
          {poolFiltered.length===0 ? (
            // v277: LPと同じ判断。0件で真っ白にせず、状態を分けて伝える
            pieces.filter(p=>!p.learning).length===0 ? (
              <div style={{textAlign:"center",color:"#5A6B8C",padding:"24px",fontSize:12,fontFamily:SANS}}>まだRepertoireの曲がありません。上で曲を追加してください。</div>
            ) : (
              <div style={{textAlign:"center",color:"#5A6B8C",padding:"24px",fontSize:12,fontFamily:SANS}}>該当する曲はありません。</div>
            )
          ) : poolFiltered.map(p => (
            <div key={p.id}>
              <PieceCardUnified
                p={p}
                expanded={expandedId===p.id}
                onToggleExpand={()=>setExpandedId(expandedId===p.id?null:p.id)}
                inProgram={undefined}
                onToggleFav={()=>toggleFav(p.id)}
                onToggleMarkNote={()=>toggleMarkNote(p.id)}
                onToggleMarkRest={()=>toggleMarkRest(p.id)}
                onPromote={()=>promoteToRepertoire(p.id)}
                onDemote={()=>demoteToLearning(p.id)}
                onToggleCandidate={()=>toggleCandidate&&toggleCandidate(p.id)}
                showControls={true}
                onUpdatePiece={onUpdatePiece}
                learningIds={learningIds}
                composers={composers}
                eventsForPiece={findEventsForPiece(p.id)}
                onDeletePiece={async()=>{setPieces(ps=>ps.filter(x=>x.id!==p.id));setExpandedId(null);await supabase.from('pieces').delete().eq('id',p.id);}}
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
const EventsPage = ({events, setEvents, FONT, SANS, allPool, pieces, learningIds, addPiecesFromProgram, registerEventToHistory, saveEvents, eventsSaveMsg, documents, setDocuments, saveDocuments, docSaveMsg, setDocSaveMsg}) => {
  const isMobile = useIsMobile(640); // v317: EventsPage内のinpEもisMobileを参照するため（v316の真っ白バグ修正）
  const [evtCheck, setEvtCheck] = useState({ contest:true, concert:true, recital:true, other:true });
  const [showEvtPanel, setShowEvtPanel] = useState(false);
  const [eventsTab, setEventsTab] = useState("history"); // v222: History先・Upcoming後（確定した歴史が主役）
  // v324: 色（表示）とデータ（種別）を分離。
  //   JEWEL_PALETTE = Repertiaが用意する色の選択肢（ユーザーが各種別に割り当てる／フェーズ2でUI化）。
  //   ※実機で最終調整する暫定値。差し替えはここ一箇所で済む。
  const JEWEL_PALETTE = {
    ruby:     "#A02D5C", // ルビー
    emerald:  "#1E7A5E", // エメラルド
    amethyst: "#4A3B8C", // アメジスト
    topaz:    "#B8860B", // トパーズ／ゴールド
    sapphire: "#1F5F8B", // サファイア
    garnet:   "#9C4722", // ガーネット／琥珀
    smoke:    "#5A5A6E", // スモークグレー
  };
  //   EVENT_TYPE_DEFAULT_COLOR = 現状の各種別に割り当てるデフォルト色（パレットのキーで指定）。
  //   種別リストは未確定（フェーズ2で拡充）。当面は現状4種別にデフォルトを割り当てて動かす。
  //   ユーザー割り当ては未実装（フェーズ2）。今はこのデフォルトが常に使われる。
  const EVENT_TYPE_DEFAULT_COLOR = {
    recital: "topaz",    // 発表会
    contest: "sapphire", // コンクール
    concert: "ruby",     // コンサート
    other:   "smoke",    // その他
  };
  //   種別データ（label＝表示名。抽出・フィルタはこのキーで動く）。色は持たない＝データと表示の分離。
  const EVENT_TYPE_LABELS = {
    recital: "発表会",
    contest: "コンクール",
    concert: "コンサート",
    other:   "その他",
  };
  //   互換ヘルパ：既存コードは EVENT_TYPES[type].color / .label を参照している。
  //   分離した3定義から、従来と同じ {label, color} を組み立てて返す（既存表示を壊さない）。
  const EVENT_TYPES = Object.fromEntries(
    Object.keys(EVENT_TYPE_LABELS).map(k => [k, {
      label: EVENT_TYPE_LABELS[k],
      color: JEWEL_PALETTE[EVENT_TYPE_DEFAULT_COLOR[k]] || JEWEL_PALETTE.smoke,
    }])
  );
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
  const [evSearchDebounced, setEvSearchDebounced] = useState(""); // 検索に使う値（入力が落ち着いてから追従）
  // v282: イベントへの曲づけをRP/LPインポート（pieceId参照）に一本化。
  // 手入力（経路B=死んだ文字列）を廃止。曲を選ぶピッカーの開閉と絞り込み検索。
  const [pickerOpen, setPickerOpen]    = useState(false);
  const [pickerQuery, setPickerQuery]  = useState("");
  const evComposingRef = React.useRef(false); // 日本語変換中フラグ
  React.useEffect(() => {
    // 変換中は待つ。入力が止まって300msで検索値を更新
    if (evComposingRef.current) return;
    const t = setTimeout(() => setEvSearchDebounced(evSearch), 300);
    return () => clearTimeout(t);
  }, [evSearch]);
  const [hamEvOpen, setHamEvOpen]      = useState(false); // v196: Eventsの三線メニュー
  const hamEvRef = useCloseOnOutsideClick(hamEvOpen, () => setHamEvOpen(false)); // v276
  const [evTypeFilter, setEvTypeFilter] = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [newEvent, setNewEvent]       = useState(EMPTY_EVENT);
  // v303: 「変更があるときだけ確認」（案ウ）用。編集/追加を開いた時点の内容を基準に保持し、
  //   タブ移動時に現在値と比較して、変わっていれば破棄確認を出す。
  const [editBaseline, setEditBaseline] = useState(null);
  // v303: タブ移動を保留しておく箱。破棄確認でOKされたら、この移動を実行する。
  const [pendingTab, setPendingTab]   = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // v338 ⑩-2: 削除確認モーダルの状態。null＝閉じ。イベントのidを入れると確認モーダルが開く。
  //   標準confirmを廃止し、ピースカードと同じ自前ConfirmModalにそろえる。
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [dragItemId, setDragItemId]   = useState(null);
  const [dragOverId, setDragOverId]   = useState(null);
  const posterRef  = useRef(null);
  const today      = new Date().toISOString().slice(0,10);
  const filteredEvents = events
    .filter(e=>!evTypeFilter||e.type===evTypeFilter)
    .filter(e=>!evSearchDebounced||(e.title||"").includes(evSearchDebounced)||(e.venue||"").includes(evSearchDebounced)||(e.notes||"").includes(evSearchDebounced));
  const filteredPast   = filteredEvents.filter(e=>e.date<=today).sort((a,b)=>b.date.localeCompare(a.date));
  const filteredFuture = filteredEvents.filter(e=>e.date>today).sort((a,b)=>a.date.localeCompare(b.date));
  const past   = events.filter(e=>e.date <= today).sort((a,b)=>b.date.localeCompare(a.date));
  const future = events.filter(e=>e.date >  today).sort((a,b)=>a.date.localeCompare(b.date));

  // ── Form helpers ──
  const openAdd = () => { setNewEvent(EMPTY_EVENT); setEditBaseline(EMPTY_EVENT); setEditingId(null); setShowForm(true); setSelectedEvent(null); };
  const openEdit = (ev) => { setNewEvent({...ev}); setEditBaseline({...ev}); setEditingId(ev.id); setShowForm(true); setSelectedEvent(null); };
  // v303: 編集/追加フォームを閉じて状態を捨てる（既存キャンセルと同じ内容を一箇所に）。
  const closeEditForm = () => { setShowForm(false); setEditingId(null); setNewEvent(EMPTY_EVENT); setEditBaseline(null); };
  // v303: 開いた時点から内容が変わっているか（案ウの判定）。JSON比較で十分（同一構造の素データ）。
  const isEditDirty = () => {
    if (!showForm) return false;
    try { return JSON.stringify(newEvent) !== JSON.stringify(editBaseline); }
    catch (e) { return true; } // 比較不能なら安全側（変更ありとみなして確認を出す）
  };
  // v303: History⇔Upcoming タブ移動の入口。編集中で変更があれば破棄確認、無ければ黙って閉じて移動。
  //   これで①(過去記録の意図せぬ書き換え)を根から断つ＝タブをまたぐと編集が生き残らない。
  const requestEventsTab = (k) => {
    if (k === eventsTab) return;
    if (isEditDirty()) { setPendingTab(k); return; } // 確認モーダルを出す
    closeEditForm();
    setEventsTab(k);
  };

  const saveEvent = () => {
    if (!newEvent.date) return;
    const nextEvents = editingId
      ? events.map(e=>e.id===editingId?{...newEvent,id:editingId}:e).sort((a,b)=>a.date.localeCompare(b.date))
      : [...events,{...newEvent,id:Date.now()}].sort((a,b)=>a.date.localeCompare(b.date));
    setEvents(nextEvents);
    saveEvents(nextEvents);

    // v284: プログラム経由（programId）の「白い曲」本登録を廃止。
    //   新導線ではRP/LPに既に存在する曲だけをID参照で選ぶため、白い曲が発生しない。
    //   ※読み取り側（逆引き2091・History登録4352）は③まで両対応のまま残す。

    closeEditForm();
  };

  // v338 ⑩-2: 実際の削除処理。確認モーダルでOKされてから呼ばれる（自前で確認はしない）。
  //   DBに触るため async。次の配列を作ってから setEvents と saveEvents の両方に渡す
  //   （従来は setEvents だけでDB保存が漏れていた＝削除がDBに反映されなかった。ここで直す）。
  const deleteEvent = async (id) => {
    // v303 ⑤: 編集中のイベントを削除したら、宙に浮くのでフォームを閉じる。
    if (editingId === id) closeEditForm();
    const nextEvents = events.filter(e=>e.id!==id);
    setEvents(nextEvents);
    setSelectedEvent(null);
    await saveEvents(nextEvents);
  };

  // v282: RP/LPの曲をID参照で追加する。文字列（composer/pieceTitle）は持たせない。
  // pieceId が逆引き（findEventsForPiece）の照合キーになる。performer だけイベント固有情報として残す。
  const addPieceItem = (pieceId) =>
    setNewEvent(ev=>({...ev,items:[...ev.items,{id:Date.now(),kind:"piece",pieceId,performer:""}]}));
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

  // v316: スマホは入力欄を16pxに（iOSはinput<16pxでフォーカス時に自動ズームするため）。PCは12pxのまま。
  const inpE={background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"5px 8px",fontFamily:FONT,fontSize:isMobile?16:12,borderRadius:4,width:"100%",boxSizing:"border-box"};
  const selE={background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:FONT,fontSize:12,borderRadius:4,width:"100%"};
  const secLbl=(t)=>(<div style={{fontSize:10,color:"#94A3BE",letterSpacing:2,fontFamily:FONT,marginBottom:6,marginTop:14,borderBottom:"1px solid #15233F",paddingBottom:3}}>{t}</div>);

  // ── Event detail card ──
  const EventDetail = ({ev, compact=false, allPool}) => {
    const et = EVENT_TYPES[ev.type]||EVENT_TYPES.other;
    return (
      <div style={{paddingTop:8,fontSize:12,color:"#94A3BE",fontFamily:FONT,display:"flex",flexDirection:"column",gap:5}}>
        {ev.organizer && <div><span style={{color:"#94A3BE"}}>主催：</span>{ev.organizer}</div>}
        {(ev.openTime||ev.startTime) && (
          <div><span style={{color:"#94A3BE"}}>時間：</span>
            {ev.openTime?"開場 "+ev.openTime:""}
            {ev.openTime&&ev.startTime?" / ":""}
            {ev.startTime?"開演 "+ev.startTime:""}
          </div>
        )}
        {ev.contact && <div><span style={{color:"#94A3BE"}}>問い合わせ：</span>{ev.contact}</div>}
        {/* v289: History と Upcoming で表示を排他にする（二重表示の整理）。
              Upcoming = items（これから弾く予定）／History = historyItems（弾いた記録）のみ。
              History で items を出さないのは、見せるべきが「そのとき何を弾いたか」であって
              現在のライブラリの状態ではないため。 */}
        {!ev.in_history && ev.items&&ev.items.length>0 && (
          <div>
            <div style={{color:"#94A3BE",marginBottom:3}}>曲目：</div>
            {ev.items.map((it,idx)=>{
              // v282: pieceId から曲を解決して表示。旧データ（pieceTitle文字列）も後方互換で拾う。
              const pc = it.pieceId ? (allPool||[]).find(x=>String(x.id)===String(it.pieceId)) : null;
              const shownTitle = pc ? pc.title : (it.pieceTitle||"");
              const shownComposer = pc ? pc.composer : (it.composer||"");
              const shownDur = pc ? (pc.duration?pc.duration+"分":"") : (it.duration||"");
              return (
              <div key={it.id} style={{paddingLeft:8,marginBottom:2,fontSize:11}}>
                {it.kind==="break"
                  ? <span style={{color:"#94A3BE",fontStyle:"italic"}}>― 休憩 ―</span>
                  : <span>{idx+1}. {it.performer&&<span style={{color:"#94A3BE"}}>{it.performer}　</span>}{shownComposer&&<span style={{color:"#7A8FB5"}}>{shownComposer} </span>}{shownTitle}{shownDur&&<span style={{color:"#94A3BE"}}>　{shownDur}</span>}</span>
                }
              </div>
              );
            })}
          </div>
        )}
        {ev.in_history && (
          <div style={{marginTop:6}}>
            <div style={{color:"#94A3BE",marginBottom:3}}>演奏した曲（記録）：</div>
            {Array.isArray(ev.historyItems) && ev.historyItems.length>0
              ? ev.historyItems.map((s,i)=>(
                  <div key={i} style={{paddingLeft:8,marginBottom:2,fontSize:11,color:"#EDE6D6"}}>
                    {(i+1)+". "}{s.performer&&<span style={{color:"#94A3BE"}}>{s.performer}　</span>}{s.composer+" / "+s.title}
                  </div>
                ))
              : (
                  /* v289: items にフォールバックしない。
                     「歴史は消えてはいけない」の裏側は「無い歴史を作ってはいけない」。
                     記録が無いことを、記録が有るように見せない。 */
                  <div style={{paddingLeft:8,marginBottom:2,fontSize:11,color:"#94A3BE",fontStyle:"italic"}}>
                    （記録なし）
                  </div>
                )}
          </div>
        )}
        {/* v286(③-2): programId経由のプログラム内容表示を廃止（Atelierは別アプリへ分離）。 */}
        {ev.date <= today && !ev.in_history && (
          <button onClick={async(e)=>{e.stopPropagation(); if(registerEventToHistory) await registerEventToHistory(ev);}}
            style={{marginTop:8,background:"#5E1F28",border:"1px solid #8A4048",color:"#E7C4CA",
              padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4,
              display:"inline-flex",alignItems:"center",gap:6,alignSelf:"flex-start"}}>
            <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#C0405A",flexShrink:0}}/>
            History に登録する
          </button>
        )}
        {ev.notes && <div><span style={{color:"#94A3BE"}}>メモ：</span>{ev.notes}</div>}
        {ev.videoUrl && <div><span style={{color:"#94A3BE"}}>動画：</span><a href={ev.videoUrl} target="_blank" rel="noreferrer" style={{color:"#5B7FA6"}}>{ev.videoUrl}</a></div>}
        {ev.posterUrl && <img src={ev.posterUrl} alt="poster" style={{width:80,height:80,objectFit:"cover",borderRadius:4,border:"1px solid #1E2A45",alignSelf:"flex-start",marginTop:4}}/>}
        {/* v338 ⑩-1/⑩-4: 展開時は「編集」ボタンだけ（削除は編集フォームの中へ移した）。
             サクッと消せないように＝歴史は消えてはいけない。 */}
        {!compact && (
          <div style={{display:"flex",gap:8,marginTop:4,justifyContent:"flex-end"}}>
            <button onClick={e=>{e.stopPropagation();openEdit(ev);}} style={{background:"none",border:"1px solid #1E2A45",color:"#94A3BE",padding:"2px 10px",cursor:"pointer",fontSize:10,fontFamily:FONT,borderRadius:3}}>✎ 編集</button>
          </div>
        )}
      </div>
    );
  };

  // ── 検索行（タイトル行の右側に相乗り：Repertoireのfilterと同じ思想）──
  const eventSearchRow = (
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <input
        key="event-search-input"
        value={evSearch} onChange={e=>setEvSearch(e.target.value)}
        onCompositionStart={()=>{evComposingRef.current=true;}}
        onCompositionEnd={e=>{evComposingRef.current=false;setEvSearch(e.target.value);setEvSearchDebounced(e.target.value);}}
        placeholder="キーワードで検索"
        style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#15233F",padding:"4px 10px",fontFamily:FONT,fontSize:12,borderRadius:4,width:160}}
      />
      <select value={evTypeFilter} onChange={e=>setEvTypeFilter(e.target.value)}
        style={{background:"#F4F6F9",border:"1px solid #C8CEDB",color:"#8A94A8",padding:"4px 8px",fontFamily:FONT,fontSize:12,borderRadius:4}}>
        <option value="">すべての種別</option>
        {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
      </select>
      {docSaveMsg && <span style={{fontSize:12,color:"#2A7A3A",fontFamily:FONT,marginRight:4}}>{docSaveMsg}</span>}
      <div style={{position:"relative",flexShrink:0}} ref={hamEvRef}>
        <button onClick={()=>setHamEvOpen(v=>!v)}
          title="メニュー"
          style={{background:"none",border:"none",color:"#94A3BE",fontSize:16,cursor:"pointer",
            padding:"3px 5px",lineHeight:1,width:28,height:28,display:"inline-flex",
            alignItems:"center",justifyContent:"center"}}>
          ≡
        </button>
        {hamEvOpen && (
          <div style={{position:"absolute",right:0,top:"110%",background:"#1C2E4A",
            border:"1px solid #2A3F6A",borderRadius:6,zIndex:50,minWidth:160,
            boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
            <button onClick={()=>{openAdd();setHamEvOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",background:"none",
                border:"none",color:"#EDE6D6",padding:"10px 14px",cursor:"pointer",
                fontSize:12,fontFamily:FONT}}>
              ＋ イベントを追加
            </button>
            <button onClick={()=>{setShowEvtPanel(v=>!v);setHamEvOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",background:"none",
                border:"none",color:"#EDE6D6",padding:"10px 14px",cursor:"pointer",
                fontSize:12,fontFamily:FONT}}>
              📦 ドキュメントを作成
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Timeline section ──
  // v325B(案B): カード面＝紺の下地にジュエル色を半透明で重ねたトーン（派手さを抑え、文字を読みやすく）。
  //   ジュエル色HEXをrgbaにして、紺(#18283F)の上に alpha で乗せる。alphaは実機で調整。
  // v333 ③: ISO日付(YYYY-MM-DD)を「◯月◯日」に整形（表示層のみ・データはISO一本）。
  const fmtJPDate = (iso) => {
    if (!iso || iso.length < 10) return iso || "";
    const m = parseInt(iso.slice(5,7),10), d = parseInt(iso.slice(8,10),10);
    if (!m || !d) return iso;
    return m + "月" + d + "日";
  };
  // v333 ①: History未登録フラグの赤丸。絵文字🔴の光沢をやめ、フラット単色の丸に。
  const RedDot = () => (
    <span title="History未登録" style={{display:"inline-block",width:9,height:9,borderRadius:"50%",
      background:"#C0405A",flexShrink:0,verticalAlign:"middle"}}/>
  );
  const jewelFill = (hex) => {
    const a = 0.60; // ジュエル色の濃さ（0=紺だけ〜1=ジュエル色そのまま）。実機で調整
    const h = (hex||"#5A5A6E").replace("#","");
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    // 紺下地の上にrgba半透明を重ねた合成色を返す（下地#18283F=24,40,63）
    const base=[24,40,63];
    const mix=(c,i)=>Math.round(base[i]*(1-a)+c*a);
    return "rgb("+mix(r,0)+","+mix(g,1)+","+mix(b,2)+")";
  };

  const TimelineSection = ({label, evs, defaultOpen=true}) => {
    return (
      <div style={{paddingTop:40,marginBottom:24}}>
        {/* タイトル行：左=タイトル+件数、右=検索（Repertoireと同骨格）*/}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
          <div style={{display:"flex",alignItems:"baseline",gap:8}}>
            <span style={{fontSize:15,fontWeight:600,color:"#EDE6D6",fontFamily:FONT,letterSpacing:"0.05em"}}>{label}</span>
            <span style={{fontSize:18,fontWeight:700,color:"#EDE6D6",fontFamily:FONT}}>{evs.length}</span>
          </div>
          {eventSearchRow}
        </div>
        {/* 臙脂の帯（EraBarと同サイズ：height:10,borderRadius:5／将来のイベントバーの器）v233:紫寄りの赤紫臙脂 */}
        <div style={{height:10,borderRadius:5,background:"#8B2A50",marginBottom:16}}/>
        {evs.length===0 ? (
          <div style={{padding:"32px 0",textAlign:"center",color:"#94A3BE",fontSize:13,fontFamily:FONT}}>
            該当するイベントがありません
          </div>
        ) : (
          /* v326: 年レイアウト（案C）。年でグループ化し、年ラベルをその年の最初のイベントの左・上そろえで固定。
             縦線・涙型マーカーは撤去（グルーピングは年ラベル＋インデントで成立）。
             カード面の塗り・形状はv325で仕上げる（今回はレイアウト骨格のみ）。 */
          <div>
            {(() => {
              // 年ごとにまとめる（evsは既に日付ソート済みの前提を保つ）
              const groups = [];
              let cur = null;
              evs.forEach(ev => {
                const y = (ev.date||"").slice(0,4) || "----";
                if (!cur || cur.year !== y) { cur = {year:y, items:[]}; groups.push(cur); }
                cur.items.push(ev);
              });
              return groups.map(g => (
                <div key={g.year} style={{display:"flex",alignItems:"flex-start",marginBottom:18}}>
                  {/* v337: 年ラベルの頭＝えんじ境界線の左端（画面左マージン）に揃える。marginLeft撤去。
                       年とカードの間＝1文字分（marginRight）。 */}
                  <div style={{flexShrink:0,marginRight:10,paddingTop:8,fontSize:15,fontWeight:600,color:"#EDE6D6",fontFamily:FONT}}>
                    {g.year}
                  </div>
                  {/* その年のイベント群 */}
                  <div style={{flex:1,minWidth:0}}>
                    {g.items.map(ev=>{
                      const et=EVENT_TYPES[ev.type]||EVENT_TYPES.other;
                      const isSelected=selectedEvent===ev.id;
                      const md=(ev.date||"").slice(5); // MM-DD
                      return (
                        <div key={ev.id} onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                          style={{background:jewelFill(et.color),
                            borderRadius:5,padding:"9px 12px",marginBottom:8,cursor:"pointer",
                            boxShadow:isSelected?"0 6px 20px rgba(0,0,0,0.5)":"none",
                            transform:isSelected?"scale(1.015)":"scale(1)",
                            transition:"all 0.2s"}}>
                          <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"nowrap",minWidth:0}}>
                            <span style={{fontSize:14,color:"#EDE6D6",fontFamily:FONT,flexShrink:0,width:"5em"}}>{fmtJPDate(ev.date)}</span>
                            {ev.title && <span style={{fontSize:14,color:"#EDE6D6",fontFamily:FONT,marginLeft:isMobile?11:20,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0,flex:"0 1 auto"}}>{ev.title}</span>}
                            {!isMobile && ev.venue && <span style={{fontSize:14,color:"#EDE6D6",fontFamily:FONT,marginLeft:20,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flexShrink:0,maxWidth:"40%"}}>{ev.venue}</span>}
                            <span style={{flex:"1 1 auto",minWidth:8}}/>
                            {ev.date<=today && !ev.in_history && <RedDot/>}
                          </div>
                          {isSelected && <EventDetail ev={ev} allPool={allPool}/>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    );
  };

  // ── List view ──
  const ListView = () => (
    <div>
      {events.length===0
        ? <div style={{textAlign:"center",padding:"40px 0",color:"#C0B090",fontSize:13,fontFamily:FONT,border:"2px dashed #E0D8C8",borderRadius:8}}>イベントがまだ登録されていません</div>
        : events.map(ev=>{
          const et=EVENT_TYPES[ev.type]||EVENT_TYPES.other;
          const isSelected=selectedEvent===ev.id;
          return (
            <div key={ev.id} style={{background:isSelected?"#1C2E4A":"transparent",borderLeft:"4px solid "+et.color,borderRadius:6,marginBottom:6,overflow:"hidden",boxShadow:isSelected?"0 6px 20px rgba(0,0,0,0.5)":"none",transition:"all 0.2s"}}>
              <div onClick={()=>setSelectedEvent(isSelected?null:ev.id)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:et.color,flexShrink:0}}></div>
                <span style={{fontSize:12,color:"#94A3BE",fontFamily:FONT,flexShrink:0}}>{ev.date}</span>
                {ev.date<=today && !ev.in_history && <RedDot/>}
                <span style={{fontSize:13,color:"#EDE6D6",fontFamily:FONT,flex:1,fontWeight:500}}>{ev.title||"（無題）"}</span>
                {ev.venue && <span style={{fontSize:11,color:"#94A3BE",fontFamily:FONT}}>{ev.venue}</span>}
              </div>
              {isSelected && (
                <div style={{padding:"0 14px 12px"}}>
                  <EventDetail ev={ev} allPool={allPool}/>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );

  // v310: 案B統一。サブタブ(History/Upcoming)を固定領域に出し、本体だけスクロール。
  //   Library/Portfolio と同じ「flexShrink:0の固定サブタブ ＋ flex:1 overflowY:autoの本体」構造。
  return (
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

    {/* Events サブタブ（固定・Libraryのタブバーと同じ配置） */}
    <div style={{background:"transparent",padding:"0 28px",flexShrink:0,width:"100%",maxWidth:CONTENT_W,margin:"6px auto 24px",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:4}}>
        {[["history","History"],["upcoming","Upcoming"]].map(([k,l])=>(
          <button key={k} onClick={()=>requestEventsTab(k)}
            style={{
              background:eventsTab===k?"#C8A860":"transparent",
              border:"none",
              color:eventsTab===k?"#1A1206":"#94A3BE",
              padding:eventsTab===k?"7px 18px":"7px 14px",
              cursor:"pointer",fontSize:13,fontFamily:FONT,letterSpacing:1,
              fontWeight:eventsTab===k?700:400,
              borderRadius:"6px 6px 0 0",
              transition:"all 0.15s"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{height:1.5,background:"#C8A860",width:"100%"}}/>
    </div>

    {/* 本体（スクロール領域） */}
    <div style={{flex:1,overflowY:"auto"}}>
      <div style={{maxWidth:CONTENT_W,margin:"0 auto",padding:"0 28px 140px"}}>

        {/* Top bar ④ ボタンはFilterの三線メニューに移動（v196） */}
        {showEvtPanel && (
          <div style={{marginBottom:10,background:"#15233F",border:"1px solid #1E2A45",borderRadius:8,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
              <button onClick={()=>setShowEvtPanel(false)}
                style={{background:"none",border:"none",color:"#94A3BE",fontSize:14,cursor:"pointer",padding:"2px 6px"}}>✕</button>
            </div>
            <div style={{fontSize:11,letterSpacing:1,color:"#94A3BE",fontFamily:FONT,marginBottom:10}}>出力する種類を選んでください</div>
            <div style={{display:"flex",gap:14,marginBottom:12,fontSize:12,fontFamily:FONT,color:"#C8CEDB",flexWrap:"wrap"}}>
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
              style={{background:"#C8A860",border:"none",color:"#0F1A33",padding:"8px 14px",cursor:"pointer",fontSize:12,fontFamily:FONT,borderRadius:4,width:"100%",fontWeight:600}}>
              ✓ チェックした種類で、ドキュメント作成
            </button>
          </div>
        )}

        {/* Add / Edit form */}
        {showForm && (
          <div style={{background:"#EEF1F5",border:"1px solid #D0D6DF",borderRadius:10,padding:18,marginBottom:20}}>
            <div style={{fontSize:13,letterSpacing:2,color:"#94A3BE",marginBottom:14,fontFamily:FONT,fontWeight:600}}>
              {editingId ? "✎ イベントを編集" : "Add Event"}
            </div>

            {/* ① 日付・種別・内容・場所 を1行に */}
            <div style={{display:"grid",gridTemplateColumns:"120px auto 1fr 1fr",gap:8,marginBottom:12,alignItems:"end"}}>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>日付</div><input type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent,date:e.target.value})} style={{...inpE,fontSize:11,padding:"4px 6px"}}/></div>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>種別</div>
                <select value={newEvent.type} onChange={e=>setNewEvent({...newEvent,type:e.target.value})} style={{...inpE,width:"auto",fontSize:11,padding:"4px 6px"}}>
                  <option value="">ー</option>
                  {Object.entries(EVENT_TYPES).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              {newEvent.type==="other" && (
                <div style={{marginTop:6}}>
                  <div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>どんな催し？（自由入力）</div>
                  <input
                    value={newEvent.otherLabel||""}
                    onChange={e=>setNewEvent({...newEvent,otherLabel:e.target.value})}
                    placeholder="例：マスタークラス、サロンコンサート など"
                    style={inpE}
                  />
                </div>
              )}
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>内容</div><input value={newEvent.title} onChange={e=>setNewEvent({...newEvent,title:e.target.value})} placeholder="公演タイトル" style={inpE}/></div>
              <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>場所</div><input value={newEvent.venue} onChange={e=>setNewEvent({...newEvent,venue:e.target.value})} placeholder="会場名" style={inpE}/></div>
            </div>

            {/* ②③ 詳細を追加 — トグルボタン、常に表示、openAddしても状態維持 */}
            <div style={{marginBottom:8}}>
              <button onClick={()=>setNewEvent(ev=>({...ev,showDetail:!ev.showDetail}))}
                style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 14px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4,marginBottom:newEvent.showDetail?8:0}}>
                {newEvent.showDetail ? "▲ 詳細を閉じる" : "＋ 詳細を追加"}
              </button>
              {newEvent.showDetail && (
                <div style={{background:"#15233F",borderRadius:6,padding:"10px 12px"}}>
                  {/* ④ 備考を詳細の中に移動 */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>共演者</div><input value={newEvent.performers||""} onChange={e=>setNewEvent({...newEvent,performers:e.target.value})} placeholder="共演者・伴奏者" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>主催</div><input value={newEvent.organizer} onChange={e=>setNewEvent({...newEvent,organizer:e.target.value})} placeholder="主催者名" style={inpE}/></div>
                    <div><div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>開演</div><input value={newEvent.startTime} onChange={e=>setNewEvent({...newEvent,startTime:e.target.value})} placeholder="14:00" style={inpE}/></div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#94A3BE",marginBottom:3,fontFamily:FONT}}>備考</div>
                    <textarea value={newEvent.notes} onChange={e=>setNewEvent({...newEvent,notes:e.target.value})}
                      placeholder="備考" style={{...inpE,minHeight:48,resize:"vertical"}}/>
                  </div>
                </div>
              )}
            </div>

            {/* ⑧ プログラム */}
            {true && (<React.Fragment>
            <div style={{marginTop:16,marginBottom:8}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:8}}>プログラム</div>
              {newEvent.items.map((it,idx)=>{
                // v282: pieceId から RP/LP の曲を引く。曲名・作曲家・時間は曲側が持つ（表示専用）。
                const pc = (allPool||[]).find(x=>String(x.id)===String(it.pieceId));
                return (
                <div key={it.id} draggable
                  onDragStart={()=>setDragItemId(it.id)}
                  onDragEnter={()=>setDragOverId(it.id)}
                  onDragEnd={onItemDragEnd}
                  onDragOver={e=>e.preventDefault()}
                  style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,
                    background:dragOverId===it.id?"#FDF5ED":"white",
                    border:"1px solid #1E2A45",borderRadius:4,padding:"5px 7px",cursor:"grab"}}>
                  <span style={{color:"#2A3F6A",fontSize:12,flexShrink:0}}>⣿</span>
                  <span style={{fontSize:10,color:"#94A3BE",fontFamily:FONT,flexShrink:0,width:18,textAlign:"right"}}>{idx+1}</span>
                  {pc ? (
                    <React.Fragment>
                      <span style={{flex:"0 0 90px",fontSize:11,color:"#15233F",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pc.composer}</span>
                      <span style={{flex:1,fontSize:11,color:"#15233F",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pc.title}</span>
                      <span style={{flex:"0 0 48px",fontSize:11,color:"#7A8FB5",fontFamily:FONT}}>{pc.duration?pc.duration+"分":"—"}</span>
                    </React.Fragment>
                  ) : (
                    // 参照先の曲が見つからない（削除された等）。IDは残すが赤字で警告。
                    <span style={{flex:1,fontSize:11,color:"#C0392B",fontFamily:FONT}}>曲が見つかりません（削除された可能性）</span>
                  )}
                  <input value={it.performer||""} onChange={e=>updateItem(it.id,{performer:e.target.value})} placeholder="演奏者" style={{...inpE,flex:"0 0 100px"}}/>
                  <button onClick={()=>removeItem(it.id)} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,padding:"0 2px",flexShrink:0}}>×</button>
                </div>
                );
              })}
              {/* v282: 手入力欄を廃止。RP/LPから選ぶピッカーを開く */}
              <button onClick={()=>{setPickerQuery("");setPickerOpen(true);}} style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>＋ 曲を追加</button>
              <div style={{fontSize:10,color:"#7A8FB5",fontFamily:FONT,marginTop:6,lineHeight:1.5}}>Repertoire / Learning の曲から選びます。一覧にない曲は Library の「Add Piece」で登録してから選んでください。</div>
            </div>
            {/* v282: 曲ピッカー。RP/LPの曲を絞り込んで選ぶ。選ぶとpieceId参照で追加される */}
            {pickerOpen && (
              <div onClick={()=>setPickerOpen(false)} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(10,16,30,0.55)",zIndex:200,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:70}}>
                <div onClick={e=>e.stopPropagation()} style={{background:"#0F1B30",border:"1px solid #2A3F6A",borderRadius:10,width:520,maxWidth:"92vw",maxHeight:"70vh",display:"flex",flexDirection:"column",boxShadow:"0 12px 40px rgba(0,0,0,0.5)"}}>
                  <div style={{padding:"14px 16px 10px",borderBottom:"1px solid #1E2A45"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontSize:12,letterSpacing:1,color:"#EDE6D6",fontFamily:FONT}}>曲を選ぶ（Repertoire / Learning）</span>
                      <button onClick={()=>setPickerOpen(false)} style={{background:"none",border:"none",color:"#94A3BE",fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
                    </div>
                    <input autoFocus value={pickerQuery} onChange={e=>setPickerQuery(e.target.value)} placeholder="作曲家名・曲名で絞り込み" style={{width:"100%",boxSizing:"border-box",background:"white",border:"1px solid #C8CEDB",color:"#15233F",padding:"7px 10px",fontSize:13,borderRadius:5,fontFamily:FONT}}/>
                  </div>
                  <div style={{overflowY:"auto",padding:"6px 0"}}>
                    {(() => {
                      const q = pickerQuery.trim().toLowerCase();
                      const list = (allPool||[]).filter(p=>{
                        if (!q) return true;
                        return (String(p.composer||"")+" "+String(p.title||"")).toLowerCase().includes(q);
                      });
                      if (list.length===0) return (
                        <div style={{padding:"18px 16px",fontSize:12,color:"#7A8FB5",fontFamily:FONT,textAlign:"center"}}>該当する曲がありません。Library の「Add Piece」で登録してください。</div>
                      );
                      return list.map(p=>{
                        const isLP = Array.isArray(learningIds) && learningIds.some(id=>String(id)===String(p.id));
                        return (
                          <div key={p.id} onClick={()=>{addPieceItem(p.id);setPickerOpen(false);}}
                            style={{display:"flex",alignItems:"baseline",gap:8,padding:"8px 16px",cursor:"pointer",borderBottom:"1px solid #16233b"}}
                            onMouseEnter={e=>e.currentTarget.style.background="#16233b"}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{flex:"0 0 90px",fontSize:11,color:"#B9C6DC",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.composer}</span>
                            <span style={{flex:1,fontSize:12,color:"#EDE6D6",fontFamily:FONT,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span>
                            <span style={{flex:"0 0 auto",fontSize:9,color:isLP?"#8FA3C0":"#C8A860",fontFamily:FONT,letterSpacing:0.5}}>{isLP?"LP":"RP"}</span>
                            <span style={{flex:"0 0 34px",fontSize:11,color:"#7A8FB5",fontFamily:FONT,textAlign:"right"}}>{p.duration?p.duration+"分":""}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
            </React.Fragment>)}

            <div style={{marginTop:16,marginBottom:14}}>
              <div style={{fontSize:11,letterSpacing:2,color:"#94A3BE",fontFamily:FONT,marginBottom:8}}>Archive</div>
              {(newEvent.archives||[]).map((arc,i)=>(
                <div key={i} style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                  <input value={arc.title} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],title:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="タイトル" style={{...inpE,flex:1}}/>
                  <input value={arc.url} onChange={e=>{const a=[...(newEvent.archives||[])];a[i]={...a[i],url:e.target.value};setNewEvent({...newEvent,archives:a});}} placeholder="URL" style={{...inpE,flex:2}}/>
                  <button onClick={()=>{const a=(newEvent.archives||[]).filter((_,j)=>j!==i);setNewEvent({...newEvent,archives:a});}} style={{background:"none",border:"none",color:"#C0A090",cursor:"pointer",fontSize:14,flexShrink:0}}>×</button>
                </div>
              ))}
              <button onClick={()=>setNewEvent({...newEvent,archives:[...(newEvent.archives||[]),{title:"",url:""}]})}
                style={{background:"none",border:"1px dashed #2A3F6A",color:"#94A3BE",padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>
                ＋ リンクを追加
              </button>
            </div>

            {/* ⑦ ボタン行。v338 ⑩-1: ピースカードと同じ配置に。
                 左＝破壊的操作（削除・赤）を単独で置き、他と離す。右＝非破壊（更新・キャンセル）。
                 削除は既存イベントの編集中（editingId あり）だけ出す。新規追加中は出さない。 */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginTop:20,paddingTop:16,borderTop:"1px solid #15233F"}}>
              {/* 左：削除（既存編集時のみ） */}
              {editingId ? (
                <button onClick={()=>setDeleteConfirmId(editingId)}
                  style={{background:"none",border:"1px solid #C0405A",color:"#C0405A",padding:"9px 18px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4,flexShrink:0}}>このイベントを削除</button>
              ) : <span/>}
              {/* 右：更新／追加・キャンセル */}
              <div style={{display:"flex",gap:14,alignItems:"center",flexShrink:0}}>
                <button onClick={saveEvent} style={{background:"#0F1A33",border:"none",color:"#C8A860",padding:"9px 28px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4,letterSpacing:1}}>
                  {editingId ? "更新する" : "追加する"}
                </button>
                <button onClick={()=>{closeEditForm();}} style={{background:"#15233F",border:"1px solid #1E2A45",color:"#94A3BE",padding:"9px 18px",cursor:"pointer",fontSize:11,fontFamily:FONT,borderRadius:4}}>キャンセル</button>
              </div>
            </div>
          </div>
        )}

        {/* Content — タイムライン（検索0件でも検索ボックスを消さないため、常にタブを表示） */}
        {(
          <>
            {eventsTab==="history" && (past.length>0
              ? TimelineSection({label:"History", evs:filteredPast, defaultOpen:true})
              : <div style={{textAlign:"center",color:"#5A6B8C",padding:"32px",fontSize:12,fontFamily:FONT}}>まだ演奏の記録がありません。</div>)}
            {eventsTab==="upcoming" && (future.length>0
              ? TimelineSection({label:"Upcoming", evs:filteredFuture, defaultOpen:true})
              : <div style={{textAlign:"center",color:"#5A6B8C",padding:"32px",fontSize:12,fontFamily:FONT}}>これからの予定はまだありません。</div>)}
          </>
        )}

      </div>
      </div>
      {/* v303: タブ移動の破棄確認（案ウ・変更があるときだけ出る）。OKで編集を捨てて移動。 */}
      {pendingTab && (
        <ConfirmModal SANS={SANS}
          line1={editingId ? "編集中の内容があります" : "追加中の内容があります"}
          line2="編集中の内容を破棄してタブを移動しますか？"
          confirmLabel="破棄して移動" confirmColor="#C0405A"
          onCancel={()=>setPendingTab(null)}
          onConfirm={()=>{ const k=pendingTab; setPendingTab(null); closeEditForm(); setEventsTab(k); }} />
      )}
      {/* v338 ⑩-2: イベント削除の確認モーダル（ピースカードと同じ自前ConfirmModalに統一）。
           標準confirmを廃止。deleteConfirmId にidが入っている間だけ開く。
           削除onConfirmはDBに触るため async。 */}
      {deleteConfirmId !== null && (() => {
        const target = events.find(e => e.id === deleteConfirmId);
        if (!target) return null;
        const et = EVENT_TYPES[target.type] || EVENT_TYPES.other;
        // v339 A: 削除モーダルだけ年つき表示（カードのfmtJPDateは年でグループ化するため年なしのまま）。
        //   ISO日付(YYYY-MM-DD)から「YYYY年M月D日」を組み立てる。長さ不足は元の値をそのまま出す。
        const iso = target.date || "";
        const jpDateWithYear = iso.length >= 10
          ? parseInt(iso.slice(0,4),10) + "年" + parseInt(iso.slice(5,7),10) + "月" + parseInt(iso.slice(8,10),10) + "日"
          : iso;
        const line1 = jpDateWithYear + "　" + (target.title || "（無題）");
        return (
          <ConfirmModal SANS={SANS}
            line1={line1}
            line2="このイベントを削除しますか？"
            note={target.in_history ? "※このイベントは History に登録済みです。演奏した記録も一緒に消えます。" : undefined}
            confirmLabel="削除" confirmColor="#C0405A"
            onCancel={()=>setDeleteConfirmId(null)}
            onConfirm={async()=>{ const id=deleteConfirmId; setDeleteConfirmId(null); await deleteEvent(id); }} />
        );
      })()}
    </div>
  );
};

// ── ManagePage helpers ──
// Dashboard data helpers



// ── HomePage (top-level) ────────────────────────────────────────────────────

// ── HomePage (top-level) ────────────────────────






// ── Auth Component ────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const SANS = "'Noto Sans JP', sans-serif";
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

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

  // v156: パスワード再設定メールを送る
  const handleResetPassword = async () => {
    if (!email) { setError(""); setMessage(""); setError("メールアドレスを入力してください"); return; }
    setLoading(true); setError(""); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password"
    });
    if (error) setError("送信に失敗しました: " + error.message);
    else setMessage("パスワード再設定メールを送りました。メールボックスをご確認ください（迷惑メールフォルダもご確認ください）。");
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
          <div style={{position:"relative"}}>
            <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="パスワード（6文字以上）" style={{...inpS,paddingRight:52}}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
            <button onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#7A8FA8",fontSize:11,fontFamily:SANS,cursor:"pointer",padding:0}}>{showPw?"隠す":"表示"}</button>
          </div>
        </div>
        {mode==="login" && (
          <div style={{textAlign:"right",marginTop:8}}>
            <button onClick={handleResetPassword} disabled={loading}
              style={{background:"none",border:"none",color:"#94A3BE",fontSize:11,fontFamily:SANS,cursor:"pointer",textDecoration:"underline",padding:0}}>
              パスワードをお忘れですか？
            </button>
          </div>
        )}
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

// ── v156: パスワード再設定画面（リセットメールのリンクから来た時） ──
const SetNewPasswordPage = ({ onDone }) => {
  const SANS = "'Noto Sans JP', sans-serif";
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const inpS = { width:"100%", padding:"10px 12px", border:"1px solid #1E2A45",
    borderRadius:6, fontSize:14, fontFamily:SANS, color:"#EDE6D6",
    background:"#15233F", boxSizing:"border-box", outline:"none" };

  const handleSetNewPassword = async () => {
    setError(""); setMessage("");
    if (newPassword.length < 6) { setError("6文字以上にしてください"); return; }
    if (newPassword !== confirm) { setError("確認用パスワードが一致しません"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setError("更新に失敗しました: " + error.message); setLoading(false); return; }
    setMessage("パスワードを更新しました。新しいパスワードでログインしてください。");
    await supabase.auth.signOut(); // ★本人確認のため一度ログアウト→再ログインを促す
    setDone(true);
    setLoading(false);
  };

  return (
    <div style={{height:"100vh",background:"#0F1A33",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#15233F",borderRadius:12,padding:"40px 36px",width:"100%",maxWidth:400,boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:22,fontWeight:"bold",color:"#EDE6D6",fontFamily:SANS,letterSpacing:2}}>Repertia</div>
          <div style={{fontSize:13,color:"#A8B4C8",fontFamily:SANS,marginTop:8}}>新しいパスワードを設定</div>
        </div>
        {!done ? (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                placeholder="新しいパスワード（6文字以上）" style={{...inpS,paddingRight:52}}/>
              <button onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#7A8FA8",fontSize:11,fontFamily:SANS,cursor:"pointer",padding:0}}>{showPw?"隠す":"表示"}</button>
            </div>
            <input type={showPw?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)}
              placeholder="新しいパスワード（確認）" style={inpS}
              onKeyDown={e=>e.key==="Enter"&&handleSetNewPassword()}/>
            <button onClick={handleSetNewPassword} disabled={loading}
              style={{width:"100%",marginTop:8,padding:"11px",background:"#0F1A33",border:"none",
                color:"#C8A860",borderRadius:6,fontSize:14,fontFamily:SANS,cursor:"pointer",opacity:loading?0.6:1}}>
              {loading?"処理中...":"パスワードを更新する"}
            </button>
          </div>
        ) : (
          <button onClick={onDone}
            style={{width:"100%",padding:"11px",background:"#0F1A33",border:"none",
              color:"#C8A860",borderRadius:6,fontSize:14,fontFamily:SANS,cursor:"pointer"}}>
            ログイン画面へ
          </button>
        )}
        {error && <div style={{marginTop:12,fontSize:12,color:"#C0405A",fontFamily:SANS}}>{error}</div>}
        {message && <div style={{marginTop:12,fontSize:12,color:"#2A7A3A",fontFamily:SANS}}>{message}</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageState, setPage] = useState("manage");
  const [recovery, setRecovery] = useState(false); // パスワード再設定リンクから来た状態

  useEffect(() => {
    // A/②: ブラウザ標準の白背景・両脇の白い線を消す（body/html/#root を紺に、枠線を除去）
    document.body.style.background = "#0F1A33";
    document.body.style.margin = "0";
    document.body.style.border = "none";
    document.documentElement.style.background = "#0F1A33";
    const root = document.getElementById("root");
    if (root) {
      root.style.background = "#0F1A33";
      root.style.border = "none";
      root.style.margin = "0";
      root.style.maxWidth = "none";
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "PASSWORD_RECOVERY") setRecovery(true); // リセットメールのリンク経由
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  if (authLoading) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F1A33",color:"#94A3BE",fontFamily:"'Noto Sans JP', sans-serif"}}>読み込み中...</div>;
  if (recovery) return <SetNewPasswordPage onDone={()=>{ setRecovery(false); }} />;
  if (!user) return <AuthPage />;
  return <MainApp user={user} handleLogout={handleLogout} pageState={pageState} setPage={setPage} />;
}

function MainApp({ user, handleLogout, pageState, setPage }) {
  const page = pageState;
  const isMobile = useIsMobile(640); // v345: スマホはメインメニューをサブ下線幅に収める（間隔・padding・字を詰める）
  const [pieces, setPieces]                   = useState([]);
  const [piecesLoading, setPiecesLoading]     = useState(true);
  const [composers, setComposers]             = useState([]); // v263: 293人マスタ（検索用）
  const [aiPieces, setAiPieces]               = useState([]);
  const [expandedId, setExpandedId]           = useState(null);
  const [sortBy, setSortBy]                   = useState("");
  const [sortAsc, setSortAsc]                 = useState(true);
  const [filterEra, setFilterEra]             = useState("");
  const [filterMark, setFilterMark]           = useState("all"); // ④ "all"|"fav"|"candidate"（❤️絞り込みは廃止・candidate分岐は温存）
  // v340: カードの markNote(♪)・markRest(𝄽) フラグで絞り込む独立トグル2つ。
  //   各々オン/オフでき、両方オン＝ORで表示（♪か𝄽どちらか持つ曲）、両方オフ＝全曲。
  const [filterNote, setFilterNote]           = useState(false); // ♪(markNote)で絞り込み
  const [filterRest, setFilterRest]           = useState(false); // 𝄽(markRest)で絞り込み
  const [searchQ, setSearchQ]                 = useState("");
  const [poolMode, setPoolMode]               = useState("repertoire");
  // ── Search/Filter states (shared between Program & Learning) ──
  const [composerFilter, setComposerFilter]   = useState("");
  const [titleFilter,    setTitleFilter]      = useState("");
  const [composerFilterP, setComposerFilterP] = useState(""); // Program用（Learningと分離）
  const [titleFilterP,    setTitleFilterP]    = useState(""); // Program用（Learningと分離）
  const [eraFilter,      setEraFilter]        = useState("");
  const [keyFilter,      setKeyFilter]        = useState(""); // v270: LP調性フィルタ（単発選択）
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
  const [aiLoadingL, setAiLoadingL]           = useState(false); // Learning専用のローディング
  const [showConstraints, setShowConstraints] = useState(false);
  const [constraints, setConstraints]         = useState({ requireEras:[] });
  const [libraryTab, setLibraryTab]           = useState("repertoire");
  const [dashAxis, setDashAxis]               = useState("era");
  const [dashChart, setDashChart]             = useState("pie");

  const getDashData = () => {
    if (dashAxis==="era") {
      return ERA_ORDER.map(k=>({label:ERAS[k].label,color:ERAS[k].color,count:pieces.filter(p=>p.era===k && !p.learning).length})).filter(d=>d.count>0);
    }
    if (dashAxis==="difficulty") {
      return [1,2,3,4,5].map(n=>({label:"難易度"+n,color:["#A8D5A2","#7EC8A4","#C8963C","#B85C72","#5B7FA6"][n-1],count:pieces.filter(p=>p.difficulty===n && !p.learning).length})).filter(d=>d.count>0);
    }
    if (dashAxis==="frequency") {
      return [1,2,3,4,5].map(n=>({label:"頻度"+n,color:["#BDD5E5","#7EC8A4","#C8963C","#B85C72","#5B7FA6"][n-1],count:pieces.filter(p=>(p.frequency||0)===n && !p.learning).length})).filter(d=>d.count>0);
    }
    return [];
  };
  const dashData  = getDashData();
  const dashTotal = dashData.reduce((s,d)=>s+d.count,0)||pieces.filter(p=>!p.learning).length;

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
  const [eventsSaveMsg, setEventsSaveMsg]      = useState("");
  const [docSaveMsg, setDocSaveMsg]            = useState(""); // 📦 ドキュメント作成の共通メッセージ
  const sugTimer  = useRef(null);
  const nextId    = useRef(100);
  const dragId    = useRef(null);
  const dragOver  = useRef(null);
  const reqIdAskAIL = useRef(0); // v152: askAILearning レース対策（世代管理）

  // ── Supabase: プロフィール読み込み ──
  const profileLoaded = useRef(false);
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
      profileLoaded.current = true; // ロード完了後に自動保存を解禁
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

  // v165: プロフィール自動保存（編集が止まって少ししたら保存）。
  // ロード完了(profileLoaded)後のユーザー編集だけ保存する。
  const profileSaveTimer = useRef(null);
  useEffect(() => {
    if (!profileLoaded.current) return; // ロード前・ロード直後の流し込みは保存しない
    if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current);
    profileSaveTimer.current = setTimeout(() => { saveProfile(); }, 800);
    return () => { if (profileSaveTimer.current) clearTimeout(profileSaveTimer.current); };
  }, [profile]);

  const saveEvents = async (evs) => {
    const dataToSave = Array.isArray(evs) ? evs : events;
    const { error } = await supabase.from('events')
      .upsert({ user_id: user.id, data: dataToSave }, { onConflict: 'user_id' });
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
          // v274: yearTextはDBに保存された表記をそのまま使う。
          // 空（v274以前に登録した曲）のときだけ year から復元する。
          yearText: p.yearText || (p.year ? String(p.year) : ''),
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
          learning: p.is_learning || false,
          star: p.is_star || false,
          pop: p.pop || 0,
          links: p.links || [],
          keywords: p.keywords || '',
          markNote: p.mark_note || false,
          markRest: p.mark_rest || false,
          mine: true,
        })));
        const learnIds = data.filter(p => p.is_learning).map(p => p.id);
        setLearningIds(learnIds);
      }
      setPiecesLoading(false);
    };
    loadPieces();
  }, [user.id]);

  // ── Supabase: composers（293人マスタ）読み込み v263 ──
  // 共有マスタ（user紐付けなし）。検索用に display / reading / fullName を読む
  useEffect(() => {
    const loadComposers = async () => {
      // v290: wiki_en / imslp を追加取得。列がまだDBに無い環境でも落ちないよう、
      //   エラー時は従来7列にフォールバックする（列が入った時点で自動的にリンクが出る）。
      let { data, error } = await supabase
        .from('composers')
        .select('display, "fullName", reading, years, country_ja, country_en, era, wiki_ja, wiki_en, imslp')
        .order('display', { ascending: true });
      if (error) {
        const fb = await supabase
          .from('composers')
          .select('display, "fullName", reading, years, country_ja, country_en, era')
          .order('display', { ascending: true });
        data = fb.data; error = fb.error;
      }
      if (!error && data) {
        setComposers(data.map(c => ({
          display:    c.display    || '',
          fullName:   c.fullName   || '',
          reading:    c.reading    || '',
          years:      c.years      || '',
          country_ja: c.country_ja || '',
          country_en: c.country_en || '',
          era:        c.era        || '',
          wiki_ja:    c.wiki_ja    || '',
          wiki_en:    c.wiki_en    || '',
          imslp:      c.imslp      || '',
        })));
      } else if (error) {
        console.error('composers load失敗:', error);
      }
    };
    loadComposers();
  }, []);

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
  // v287(③-3): aiPiecesP（Program専用のAI提案）を廃止したため、allPool は pieces のみ。
  const allPool        = [...pieces];


  // ── 未保存判定（v149: 編集中の目印として使用。移動時モーダルは廃止）──

  // ── カード内インライン編集の保存 ──
  const onUpdatePiece = async (updated) => {
    setPieces(ps=>ps.map(p=>p.id===updated.id?{...p,...updated}:p));
    await supabase.from('pieces').update({
      title: updated.title,
      composer: updated.composer,
      key: updated.key||'',
      year: updated.year||0,
      "yearText": updated.yearText || '', // v274: 「1815-1820」「不明」等の表記を保存
      era: updated.era || eraFromYear(updated.year||0), // v272: 編集画面で選んだ時代を保存
      duration: updated.duration||0,
      durationSecs: updated.durationSecs||0,
      memo: updated.memo||'',
      keywords: updated.keywords||'',
      links: updated.links||[],
    }).eq('id', updated.id);
  };

  const toggleFav = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    const newFav = !piece.fav;
    setPieces(ps=>ps.map(p=>p.id===id?{...p,fav:newFav}:p));
    await supabase.from('pieces').update({is_fav: newFav}).eq('id', id);
  };
  // v297: 手動 RP⇄LP 往復（②）。learning の true/false だけを切り替える。
  //   ✧(candidate) には一切触れない（企画確定・案1）。移動であって価値判断ではない。
  //   LP→RP：learning=false にし、learningIds からも外す。
  const promoteToRepertoire = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    setLearningIds(prev => prev.filter(x=>x!==id));
    setPieces(ps=>ps.map(p=>p.id===id?{...p,learning:false}:p));
    await supabase.from('pieces').update({is_learning: false}).eq('id', id);
  };
  //   RP→LP：learning=true にし、learningIds にも入れる。
  const demoteToLearning = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    setLearningIds(prev => prev.includes(id) ? prev : [...prev, id]);
    setPieces(ps=>ps.map(p=>p.id===id?{...p,learning:true}:p));
    await supabase.from('pieces').update({is_learning: true}).eq('id', id);
  };
  // v293: ♪(mark_note) / 𝄽(mark_rest) の独立トグル。意味は固定しない自由マーク。
  //   列がまだ無い環境でも落ちないよう、DB更新のエラーは握りつぶす（画面表示は先に更新済み）。
  const toggleMarkNote = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    const next = !piece.markNote;
    setPieces(ps=>ps.map(p=>p.id===id?{...p,markNote:next}:p));
    const { error } = await supabase.from('pieces').update({mark_note: next}).eq('id', id);
    if (error) console.error('mark_note update失敗（列未追加の可能性）:', error);
  };
  const toggleMarkRest = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (!piece) return;
    const next = !piece.markRest;
    setPieces(ps=>ps.map(p=>p.id===id?{...p,markRest:next}:p));
    const { error } = await supabase.from('pieces').update({mark_rest: next}).eq('id', id);
    if (error) console.error('mark_rest update失敗（列未追加の可能性）:', error);
  };
  const toggleCandidate = async (id) => {
    const piece = pieces.find(p=>p.id===id);
    if (piece && piece.candidate) {
      // ✧を外す → Learningからも削除確認
      if (learningIds.includes(id)) {
        if (window.confirm("Learningからも削除しますか？")) {
          setLearningIds(prev=>prev.filter(x=>x!==id));
          setPieces(ps=>ps.map(p=>p.id===id?{...p,candidate:false,learning:false}:p));
          await supabase.from('pieces').update({is_candidate: false, is_learning: false}).eq('id', id);
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




  // ★ Learning用：プログラム文脈を使わない、シンプルな曲検索AI
  const askAILearning = async () => {
    const myId = ++reqIdAskAIL.current; // v152: この検索の世代番号
    setAiLoadingL(true);
    setAiPieces([]); // v152: 新検索は積み重ねず置き換え
    const cond = [];
    if (composerFilter && composerFilter.trim()) cond.push("作曲家: "+composerFilter.trim());
    if (titleFilter && titleFilter.trim())       cond.push("曲名・キーワード: "+titleFilter.trim());
    if (kwFilter && kwFilter.trim())             cond.push("キーワード: "+kwFilter.trim());
    if (eraFilter)                               cond.push("時代: "+(ERAS[eraFilter] ? ERAS[eraFilter].label : eraFilter));
    if (keyFilter && keyFilter.trim())           cond.push("調性: "+keyFilter.trim());
    if (yearMin || yearMax)                      cond.push("作曲年: "+(yearMin||"指定なし")+"〜"+(yearMax||"指定なし"));
    if (durMin || durMax)                        cond.push("演奏時間: "+(durMin||"0")+"分〜"+(durMax||"指定なし")+"分");
    const dLowL = Number(diffMin)>=1 ? Number(diffMin) : 1;
    const dHighL = Number(diffMax)>=1 ? Number(diffMax) : 5;
    if (dLowL>1 || dHighL<5) cond.push("難易度(1易〜5難): "+dLowL+"〜"+dHighL);
    const fLowL = Number(freqMin)>=1 ? Number(freqMin) : 1;
    const fHighL = Number(freqMax)>=1 ? Number(freqMax) : 5;
    if (fLowL>1 || fHighL<5) cond.push("演奏頻度(1低〜5高): "+fLowL+"〜"+fHighL);
    const condText = cond.length>0 ? cond.join(String.fromCharCode(10)) : "クラシックピアノの曲を幅広く";
    const prompt = "クラシックピアノに詳しい司書として、以下の条件に合うピアノ曲を10〜12曲提案してください。"
      + String.fromCharCode(10) + "【検索条件】" + String.fromCharCode(10) + condText
      + String.fromCharCode(10) + "条件に合う実在するピアノ曲だけを挙げてください。代表的な名曲だけでなく、あまり知られていない曲も含めて幅広く挙げてください。"
      + String.fromCharCode(10) + "JSONのみ返してください:"
      + String.fromCharCode(10) + '{"suggestions":[{"title":"曲名は英語表記(例:Nocturne Op.9 No.2)。仏語等の原題はそのまま尊重","composer":"F.姓形式(例F.Chopin。名の頭文字+ドット+姓、スペース無)","year":作曲年数値,"country":"出身国","key":"調性","duration":分数数値,"form":"形式","difficulty":1-5数値,"era":"baroque/classical/romantic/modern/contemporary","reason":"一言説明"}]}';
    try {
      const res  = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:3000,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      if (myId !== reqIdAskAIL.current) return; // v152: 自分が最新でなければ捨てる
      const text = data.content.map(b=>b.text||"").join("");
      let parsed = {};
      try { parsed = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}")+1)); }
      catch(parseErr){ console.error("askAILearning parse失敗:",parseErr); parsed = {}; }
      const newAI = (parsed.suggestions||[]).map((s,i)=>({...s,id:Date.now()+i,readiness:0,mine:false}));
      setAiPieces(newAI); // v152: 置き換え（足し込まない）
    } catch(e){ if(myId===reqIdAskAIL.current) console.error(e); }
    if (myId===reqIdAskAIL.current) setAiLoadingL(false);
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
    // v271: 時代は様式上の役割で決まるもので、生年から機械的には決まらない。
    // ユーザーが選んだ時代を優先し、未選択のときだけ作曲年から補完する。
    const era = piece.era || eraFromYear(piece.year);
    const { data, error } = await supabase.from('pieces').insert({
      user_id: user.id,
      title: piece.title,
      composer: piece.composer || '',
      year: piece.year || null,
      "yearText": piece.yearText || '', // v274
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
        year: data.year, yearText: data.yearText || '', era: data.era, duration: data.duration,
        difficulty: data.difficulty, readiness: data.readiness,
        key: data.key, form: data.form, country: data.country,
        memo: data.memo, fav: false, candidate: false, mine: true,
      }]);
    }
    setShowAdd(false);
  };

  // ★ イベント紐付け時：プログラムの「白い曲」をDBに本登録し、Learning入りさせる
  const addPiecesFromProgram = async (whitePieces, opts) => {
    if (!whitePieces || whitePieces.length===0) return;
    const silent = opts && opts.silent;
    const addedIds = [];
    for (const piece of whitePieces) {
      // v271: onAddPieceと同じ方針（選ばれた時代を優先・未選択なら作曲年から補完）
      const era = piece.era || eraFromYear(piece.year);
      const { data, error } = await supabase.from('pieces').insert({
        user_id: user.id,
        title: piece.title,
        composer: piece.composer || '',
        year: piece.year || null,
        "yearText": piece.yearText || '', // v274
        era: piece.era || era,
        duration: piece.duration || 5,
        difficulty: piece.difficulty || 3,
        readiness: piece.readiness || 50,
        key: piece.key || '',
        form: piece.form || '',
        country: piece.country || '',
        memo: piece.memo || '',
        is_fav: false,
        is_candidate: false,
        is_learning: true,
      }).select().single();
      if (!error && data) {
        setPieces(ps => [...ps, {
          id: data.id, title: data.title, composer: data.composer,
          year: data.year, yearText: data.yearText || '', era: data.era, duration: data.duration,
          difficulty: data.difficulty, readiness: data.readiness,
          key: data.key, form: data.form, country: data.country,
          memo: data.memo, fav: false, candidate: false, learning: true, mine: true,
        }]);
        addedIds.push(data.id);
      }
    }
    if (addedIds.length>0) {
      setLearningIds(prev => [...prev, ...addedIds]);
      if (!silent) window.alert(addedIds.length+"曲をLearningに追加しました ✓");
    }
  };

  // ★ ステップ4：イベントをHistoryに登録（弾いた記録をスナップショットで保存）
  //    v283-B: 銀→金・Pop.+1 の自動発火はしない。記録の保存だけ行う。
  const registerEventToHistory = async (ev) => {
    if (!ev || ev.in_history) return;
    // b) 紐づく曲を特定。v286(③-2)以降は新導線（items[].pieceId）のみ。
    // ★スナップショット：曲の情報をコピーして固定（参照でなく実体を保存）
    // v288: items 単位で作る。performer は pieces でなく items 側が持つ情報なので、
    //   曲を引くのと同時にここで拾う。同じ曲を複数人が弾いた場合も別行として残る
    //   （発表会・ジョイントコンサートで「誰が何を弾いたか」が記録の本体）。
    //   従来は pieceId を重複排除してから引いていたため、2人目以降が消えていた。
    const snapshot = (Array.isArray(ev.items) ? ev.items : []).map(it => {
      if (!it || !it.pieceId) return null;
      const p = pieces.find(x=>String(x.id)===String(it.pieceId));
      if (!p) return null;
      return {
        id: p.id, title: p.title, composer: p.composer,
        year: p.year, key: p.key, duration: p.duration,
        difficulty: p.difficulty, era: p.era, form: p.form,
        performer: it.performer || "",
      };
    }).filter(Boolean);
    // a) イベントを in_history=true に＋スナップショットを保存
    const nextEvents = events.map(e => e.id===ev.id ? {...e, in_history:true, historyItems: snapshot} : e);
    setEvents(nextEvents);
    saveEvents(nextEvents);
    // c) v301: 自動昇格（移動のみ）。紐づいた曲のうち LP を RP に移す（learning=false）。
    //   ✧(candidate)には触れない。既にRPの曲は触らない。複数はまとめて処理。
    //   案A：DBは .in() で一括更新。「全部移動するか・何もしないか」にして中途半端を防ぐ
    //   （金庫「入っている値が信用できること」）。promoteToRepertoire を曲数分ループすると
    //   setState競合が出るため、ここではインラインでまとめて処理する。
    const linkedPieceIds = Array.from(new Set(
      (Array.isArray(ev.items) ? ev.items : [])
        .map(it => it && it.pieceId).filter(Boolean).map(String)
    ));
    const idsToPromote = linkedPieceIds.filter(pid => {
      const pc = pieces.find(x => String(x.id) === pid);
      return pc && pc.learning === true; // LPのものだけ。既にRP(learning=false)は対象外
    });
    if (idsToPromote.length > 0) {
      const promoteSet = new Set(idsToPromote);
      setPieces(ps => ps.map(pc => promoteSet.has(String(pc.id)) ? {...pc, learning:false} : pc));
      setLearningIds(prev => prev.filter(id => !promoteSet.has(String(id))));
      // DB一括更新（案A）。失敗しても画面表示は先に更新済み・記録は残る。
      const { error } = await supabase.from('pieces')
        .update({is_learning: false})
        .in('id', idsToPromote);
      if (error) console.error('v301 自動昇格のDB一括更新に失敗:', error);
    }
    // v283-B: 銀→金・Pop.+1 の自動発火はしない（企画判断）。
    //   History登録は「弾いた記録の保存」だけ。金にするかは本人の手動判断に委ねる。
    //   「弾いた事実の記録」と「金にする決断」は別のこととして扱う。
    // v301: ただし「移動（LP→RP）」はする。移動と価値判断は別。
    //   ここでlearningをfalseにするのは棚の移動であって、銀→金の価値判断ではない。
    //   この移動処理を「v283で消したはず」と誤認して消さないこと（金庫の記録）。
    // d) トースト通知
    setEventsSaveMsg("History に登録しました ✓");
    setTimeout(() => setEventsSaveMsg(""), 3000);
  };

  // ── filtered/sorted pool ──
  const poolFiltered = pieces
    .filter(p => !p.learning)
    .filter(p => !filterEra || p.era===filterEra)
    .filter(p => filterMark==="fav" ? p.fav : filterMark==="candidate" ? p.candidate : true)
    // v340: ♪(markNote)・𝄽(markRest)の独立トグルOR。どちらもオフなら全通過。
    .filter(p => (!filterNote && !filterRest) ? true : ((filterNote && p.markNote) || (filterRest && p.markRest)))
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

  const learningPoolFiltered = pieces
    .filter(p => p.learning)
    .filter(p => !filterEra || p.era===filterEra)
    .filter(p => filterMark==="fav" ? p.fav : filterMark==="candidate" ? p.candidate : true)
    // v340: ♪(markNote)・𝄽(markRest)の独立トグルOR。どちらもオフなら全通過。
    .filter(p => (!filterNote && !filterRest) ? true : ((filterNote && p.markNote) || (filterRest && p.markRest)))
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

  const showRuler      = sortBy==="year" && filterEra==="";
  const inp = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"7px 10px",fontFamily:FONT,fontSize:14,borderRadius:4,width:"100%",boxSizing:"border-box",...ex});
  const sel = (ex={}) => ({background:"#15233F",border:"1px solid #1E2A45",color:"#EDE6D6",padding:"5px 7px",fontFamily:FONT,fontSize:13,borderRadius:4,...ex});

  // ── Shared header (v168: Rくん + ゴシック + 高さ72 + 下線を文字直下に) ──────────
  const Header = () => (
    <header style={{background:"#0F1A33",display:"flex",alignItems:"center",flexShrink:0,height:84,paddingLeft:28,paddingRight:28,width:"100%",maxWidth:CONTENT_W,margin:"0 auto",boxSizing:"border-box",justifyContent:isMobile?"space-between":"flex-start"}}>
      {/* Rくん（クリックでホーム＝Library）
          v345: スマホは Rくん↔Library↔Events↔Portfolio を等間隔に。
                header を space-between にし、navを display:contents で透過して
                ボタンをheader直下の兄弟に昇格→4要素が等間隔に並ぶ。右padding無し。 */}
      <div onClick={()=>{setPage("manage");setLibraryTab("repertoire");}}
        style={{cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",
          paddingRight:isMobile?0:24,flexShrink:0}}>
        <img src="/rkun-round.png" alt="Repertia" style={{height:44,width:44,display:"block"}}/>
      </div>
      {/* メニュー（ゴシック・現在地は金＋文字すぐ下に下線） */}
      <nav style={{display:isMobile?"contents":"flex",alignItems:"center",gap:isMobile?0:8}}>
        {NAV.map(([p,l],i) => {
          const padH = isMobile ? 0 : 20;
          return (
          <button key={p} onClick={()=>setPage(p)}
            style={{background:"none",border:"none",
              color: page===p ? "#C8A860" : "#9A8868",
              paddingTop:6,
              paddingRight: isMobile ? 0 : padH,
              paddingLeft: isMobile ? 0 : padH,
              cursor:"pointer",
              fontSize:16,letterSpacing:isMobile?0.3:1,
              fontFamily:FONT,
              fontWeight: page===p ? 600 : (isMobile?500:400),
              borderBottom: page===p ? "2px solid #C8A860" : "2px solid transparent",
              paddingBottom:4,
              transition:"color 0.15s"}}>
            {l}
          </button>
          );
        })}
      </nav>
    </header>
  );

  // ── Filter bar ───────────────────────────────────────────────────────────────




  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────
  // ── EVENTS PAGE ───────────────────────────────────────────────────────────────

  // ── SINGLE return ─────────────────────────────────────────────────────────────
  if (piecesLoading) return (
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0F1A33",color:"#94A3BE",fontFamily:"'Noto Sans JP', sans-serif"}}>
      レパートリーを読み込み中...
    </div>
  );
  return (
    <div style={{height:"100dvh",background:"#0F1A33",fontFamily:FONT,color:"#EDE6D6",display:"flex",flexDirection:"column",overflow:"hidden",textAlign:"left"}}>
      <style>{".rp-search::placeholder{color:#8A94A8;opacity:1;} input::placeholder,textarea::placeholder{color:#8A94A8;opacity:1;}"}</style>
      <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <FontLoader />
      <Header />
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {page==="manage" && <ManagePage
          composers={composers}
          pieces={pieces} setPieces={setPieces} poolFiltered={poolFiltered} learningPoolFiltered={learningPoolFiltered} addPiecesFromProgram={addPiecesFromProgram}
          documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg}
          showAdd={showAdd} setShowAdd={setShowAdd} editMode={editMode} setEditMode={setEditMode}
          onAddPiece={onAddPiece} toggleFav={toggleFav} toggleMarkNote={toggleMarkNote} toggleMarkRest={toggleMarkRest} promoteToRepertoire={promoteToRepertoire} demoteToLearning={demoteToLearning} filterMark={filterMark} setFilterMark={setFilterMark} filterNote={filterNote} setFilterNote={setFilterNote} filterRest={filterRest} setFilterRest={setFilterRest}
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
          keyFilter={keyFilter} setKeyFilter={setKeyFilter}
          yearMin={yearMin} setYearMin={setYearMin} yearMax={yearMax} setYearMax={setYearMax}
          durMin={durMin} setDurMin={setDurMin} durMax={durMax} setDurMax={setDurMax}
          diffMin={diffMin} setDiffMin={setDiffMin} diffMax={diffMax} setDiffMax={setDiffMax}
          freqMin={freqMin} setFreqMin={setFreqMin} freqMax={freqMax} setFreqMax={setFreqMax}
          kwFilter={kwFilter} setKwFilter={setKwFilter}
          aiPieces={aiPieces} setAiPieces={setAiPieces} aiLoading={aiLoadingL} askAILearning={askAILearning}
          learningIds={learningIds} setLearningIds={setLearningIds}
          expandedId={expandedId} setExpandedId={setExpandedId}
          toggleCandidate={toggleCandidate}
          onUpdatePiece={onUpdatePiece}
          dashData={getDashData()} dashTotal={getDashData().reduce((s,d)=>s+d.count,0)||pieces.filter(p=>!p.learning).length}
          dashAxis={dashAxis} setDashAxis={setDashAxis}
          dashChart={dashChart} setDashChart={setDashChart}
          events={events}
        />}
        {page==="print"  && <PrintPage handleLogout={handleLogout} allPool={allPool} pieces={pieces} profile={profile} setProfile={setProfile} events={events} portfolioTab={portfolioTab} setPortfolioTab={setPortfolioTab} addListItem={addListItem} updateListItem={updateListItem} removeListItem={removeListItem} handlePhoto={handlePhoto} photoInputRef={photoInputRef} generateBio={generateBio} inpS={inpS} lblS={lblS} secTitle={secTitle} addBtn={addBtn} printSection={printSection} saveProfile={saveProfile} profileSaveMsg={profileSaveMsg} documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg} scratchItems={scratchItems} setScratchItems={setScratchItems} />}
        {page==="events" && <EventsPage events={events} setEvents={setEvents} FONT={FONT} SANS={SANS} allPool={allPool} pieces={pieces} learningIds={learningIds} addPiecesFromProgram={addPiecesFromProgram} registerEventToHistory={registerEventToHistory} saveEvents={saveEvents} eventsSaveMsg={eventsSaveMsg} documents={documents} setDocuments={setDocuments} saveDocuments={saveDocuments} docSaveMsg={docSaveMsg} setDocSaveMsg={setDocSaveMsg} />}
      </div>
      </div>
    </div>
  );
}




