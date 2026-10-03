/**
 * Navigasyon haritası: veri tipleri, katmanlar ve biçimlendirme/geodezi yardımcıları.
 * Veri dosyası scripts/navigasyon-verisi.mjs ile üretilir (static/data/turkiye-navigasyon.json):
 * istasyonlar ve ILS AIP Türkiye'den (DHMİ), havalimanı ve pistler OurAirports'tan gelir.
 */

export type Runway = {
  id: string;
  len?: number; // ft
  wid?: number; // ft
  surf?: string;
  lit?: 1;
  closed?: 1;
  hdg?: number; // gerçek yön (°)
  ends?: [[number, number], [number, number]];
  /** Uç başına yaklaşma ışığı ve görsel süzülüş göstergesi (AIP AD 2.14) */
  lgt?: Record<string, {apch?: string; gsi?: string}>;
};

export type Airport = {
  ident: string;
  type: string; // large_airport | medium_airport | small_airport | heliport | closed | seaplane_base
  name?: string;
  lat: number;
  lon: number;
  elev?: number;
  city?: string;
  icao?: string;
  iata?: string;
  sched?: 1;
  web?: string;
  wiki?: string;
  /** AIP Türkiye'deki bölümü: 2 = meydan (AD 2), 3 = heliport (AD 3). Ad, konum ve rakım buradan gelir. */
  aip?: 2 | 3;
  /** OurAirports'taki ad (AIP adı farklıysa; aramada kullanılır) */
  alt?: string;
  var?: number; // manyetik sapma (°, doğu pozitif; AIP AD 2.2/3.2)
  varYear?: number;
  /** Telsiz frekansları (AIP AD 2.18; yalnızca VHF hava bandı) */
  com?: {service: string; callsign: string; freqs: {mhz: number; note?: string}[]}[];
  rwy?: Runway[];
};

export type Navaid = {
  ident: string;
  type: string; // VOR | VOR-DME | VORTAC | TACAN | DME | NDB | NDB-DME
  name?: string;
  lat: number;
  lon: number;
  freq?: number; // kHz
  ch?: string; // DME/TACAN kanalı
  elev?: number; // ft (OurAirports)
  elevM?: number; // DME anteni rakımı, m (AIP)
  var?: number; // manyetik sapma (°, doğu pozitif)
  varSrc?: string; // sapmanın kaynağı: "LTAC 2025" (AIP meydan değeri) ya da "OurAirports" (eski)
  cov?: number; // kapsama (NM, AIP notu)
  use?: string;
  pwr?: string;
  apt?: string;
  enr?: 1; // AIP ENR 4.1'de yol üstü yardımcı olarak yayımlanmış
  src?: 'oa'; // yalnızca OurAirports'ta var, AIP'de karşılığı yok
};

export type Ils = {
  ident: string;
  apt: string; // ICAO
  rwy?: string;
  cat?: string; // I, II, III…; yoksa yalnızca LOC olabilir
  freq?: number; // LLZ, kHz
  ch?: string; // eşli DME kanalı
  llz: [number, number];
  gp?: [number, number];
  gpFreq?: number; // kHz
  angle?: number; // süzülüş açısı (°)
  rdh?: number; // ft
};

/** Haritada kullanılan ILS öğesi: konum eşiğe yakın noktadır, `crs` yaklaşma rotasıdır (gerçek). */
export type IlsItem = Ils & {lat: number; lon: number; crs?: number; name?: string};

export type NavData = {
  generated: string;
  aip: {amdt?: string; url: string};
  airports: Airport[];
  navaids: Navaid[];
  ils: Ils[];
};

export type Feature =
  | {kind: 'navaid'; item: Navaid}
  | {kind: 'airport'; item: Airport}
  | {kind: 'ils'; item: IlsItem};

/** Haritadaki açılıp kapatılabilen katmanlar (URL'deki `katman` parametresi bu anahtarları kullanır). */
export const LAYERS = [
  {key: 'vor', label: 'VOR', hint: 'VOR bileşeni olan istasyonlar: VOR, VOR/DME, VORTAC'},
  {key: 'tacan', label: 'TACAN', hint: 'TACAN bileşeni olan istasyonlar: TACAN, VORTAC'},
  {key: 'dme', label: 'DME', hint: 'Mesafe veren tüm istasyonlar: DME, VOR/DME, VORTAC, TACAN, NDB/DME'},
  {key: 'ndb', label: 'NDB', hint: 'NDB bileşeni olan istasyonlar: NDB, NDB/DME, locator'},
  {key: 'ils', label: 'ILS', hint: 'ILS ve LOC yaklaşmaları (AIP AD 2.19)'},
  {key: 'havalimani', label: 'Havalimanı', hint: 'Büyük, orta ve küçük havalimanları'},
  {key: 'pist', label: 'Pist', hint: 'Pist çizgileri (koordinatı bilinenler)'},
  {key: 'heliport', label: 'Heliport', hint: 'Helikopter iniş alanları'},
  {key: 'kapali', label: 'Kapalı', hint: 'Kapatılmış havalimanları'},
  {key: 'aipdisi', label: 'AIP dışı', hint: "AIP'de karşılığı olmayan, kapatılmış ya da askerî olabilecek istasyonlar"},
] as const;

export type LayerKey = (typeof LAYERS)[number]['key'];

export const DEFAULT_LAYERS: LayerKey[] = ['vor', 'tacan', 'dme', 'ndb', 'ils', 'havalimani', 'pist'];

// İstasyon türünün içerdiği bileşenler: bir istasyon, bileşenlerinden herhangi birinin
// katmanı açıksa görünür (ör. VOR/DME hem "VOR" hem "DME" katmanında). TACAN, sivil
// alıcılara DME olarak da mesafe verdiği için DME katmanında yer alır.
const NAVAID_COMPONENTS: Record<string, LayerKey[]> = {
  VOR: ['vor'],
  'VOR-DME': ['vor', 'dme'],
  VORTAC: ['vor', 'tacan', 'dme'],
  TACAN: ['tacan', 'dme'],
  DME: ['dme'],
  NDB: ['ndb'],
  'NDB-DME': ['ndb', 'dme'],
};

/** İstasyonun ait olduğu katmanlar (AIP dışı istasyonlar yalnızca kendi katmanında) */
export function navaidLayers(n: Navaid): LayerKey[] {
  if (n.src === 'oa') return ['aipdisi'];
  return NAVAID_COMPONENTS[n.type] ?? ['vor'];
}

/** Ana katman: işaretin rengi ve aramada açılacak katman */
export function navaidLayer(n: Navaid): LayerKey {
  return navaidLayers(n)[0];
}

export function airportLayer(a: Airport): LayerKey {
  if (a.type === 'heliport') return 'heliport';
  if (a.type === 'closed') return 'kapali';
  return 'havalimani';
}

export const AIRPORT_TYPE_LABELS: Record<string, string> = {
  large_airport: 'Büyük havalimanı',
  medium_airport: 'Orta ölçekli havalimanı',
  small_airport: 'Küçük havalimanı / pist',
  heliport: 'Heliport',
  closed: 'Kapalı havalimanı',
  seaplane_base: 'Deniz uçağı üssü',
};

export const NAVAID_TYPE_LABELS: Record<string, string> = {
  VOR: 'VOR',
  'VOR-DME': 'VOR/DME',
  VORTAC: 'VORTAC',
  TACAN: 'TACAN',
  DME: 'DME',
  NDB: 'NDB',
  'NDB-DME': 'NDB/DME',
};

export const SERVICE_LABELS: Record<string, string> = {
  DEL: 'Trafik izni (Delivery)',
  GND: 'Yer (Ground)',
  APRON: 'Apron',
  TWR: 'Kule (Tower)',
  AFIS: 'AFIS',
  APP: 'Yaklaşma (Approach)',
  ATIS: 'ATIS',
};

/** Telsiz frekansı: 118.1 → "118,100" (havacılıkta frekans üç ondalıkla okunur) */
export const formatComFreq = (mhz: number) => nf(3).format(mhz);

/**
 * Kapsama yarıçapı (NM). AIP'de yayımlanmışsa o değer; yoksa VHF istasyonlarda
 * sınıfa göre standart hizmet hacmi (terminal 25, alçak 40, yüksek 130 NM).
 * NDB'ler için standart bir değer olmadığından yalnızca AIP değeri kullanılır.
 */
export function coverage(n: Navaid): {nm: number; aip: boolean} | undefined {
  if (n.cov) return {nm: n.cov, aip: true};
  if (n.type.startsWith('NDB')) return undefined;
  const nominal = n.use === 'TERMINAL' ? 25 : n.use === 'LO' ? 40 : n.use === 'HI' || n.use === 'BOTH' ? 130 : undefined;
  return nominal ? {nm: nominal, aip: false} : undefined;
}

const USAGE_LABELS: Record<string, string> = {
  HI: 'Yüksek irtifa yolu',
  LO: 'Alçak irtifa yolu',
  BOTH: 'Yüksek ve alçak irtifa',
  TERMINAL: 'Terminal',
  RNAV: 'RNAV',
};

const POWER_LABELS: Record<string, string> = {
  HIGH: 'Yüksek',
  MEDIUM: 'Orta',
  LOW: 'Düşük',
};

const SURFACE_LABELS: [RegExp, string][] = [
  [/^(ASP|ASPH|ASPHALT|BIT)/i, 'Asfalt'],
  [/^(CON|CONC|CONCRETE|PEM)/i, 'Beton'],
  [/^(GRS|GRASS|TURF)/i, 'Çim'],
  [/^(GRE|GRV|GRAVEL|GVL)/i, 'Çakıl'],
  [/^(DIRT|EARTH|SOIL|CLAY)/i, 'Toprak'],
  [/^(WATER)/i, 'Su'],
];

export const usageLabel = (v?: string) => (v ? USAGE_LABELS[v] ?? v : undefined);
export const powerLabel = (v?: string) => (v ? POWER_LABELS[v] ?? undefined : undefined);

export function surfaceLabel(v?: string): string | undefined {
  if (!v) return undefined;
  return SURFACE_LABELS.find(([re]) => re.test(v))?.[1] ?? v;
}

const nf = (digits: number) =>
  new Intl.NumberFormat('tr-TR', {minimumFractionDigits: digits, maximumFractionDigits: digits});

/** Frekansı türüne göre biçimler: VHF (VOR) MHz, NDB kHz. TACAN için frekans değil kanal anlamlıdır. */
export function formatFrequency(n: Navaid): string | undefined {
  if (!n.freq || n.type === 'TACAN' || n.type === 'DME') return undefined;
  if (n.type.startsWith('NDB')) return `${nf(n.freq % 1 ? 1 : 0).format(n.freq)} kHz`;
  return `${nf(2).format(n.freq / 1000)} MHz`;
}

export const ftToM = (ft: number) => Math.round(ft * 0.3048);

export function formatElevationM(m?: number): string | undefined {
  if (m === undefined) return undefined;
  return `${nf(0).format(m)} m (${nf(0).format(Math.round(m / 0.3048))} ft)`;
}

export const formatMHz = (khz?: number) => (khz ? `${nf(2).format(khz / 1000)} MHz` : undefined);

export function formatElevation(ft?: number): string | undefined {
  if (ft === undefined) return undefined;
  return `${nf(0).format(ft)} ft (${nf(0).format(ftToM(ft))} m)`;
}

export function formatLength(ft?: number): string | undefined {
  if (!ft) return undefined;
  return `${nf(0).format(ftToM(ft))} m`;
}

/** Manyetik sapma: 4.175 → "4,2° D"; -1.5 → "1,5° B" */
export function formatVariation(v?: number): string | undefined {
  if (v === undefined) return undefined;
  if (Math.abs(v) < 0.05) return '0°';
  return `${nf(1).format(Math.abs(v))}° ${v > 0 ? 'D' : 'B'}`;
}

/** Ondalık dereceyi havacılıkta yaygın DMS biçimine çevirir: 41°16′29″K 028°43′56″D */
export function formatDms(lat: number, lon: number): string {
  const part = (value: number, pos: string, neg: string, degWidth: number) => {
    const abs = Math.abs(value);
    let d = Math.floor(abs);
    let m = Math.floor((abs - d) * 60);
    let s = Math.round(((abs - d) * 60 - m) * 60);
    if (s === 60) {
      s = 0;
      m += 1;
    }
    if (m === 60) {
      m = 0;
      d += 1;
    }
    const pad = (x: number, w: number) => String(x).padStart(w, '0');
    return `${pad(d, degWidth)}°${pad(m, 2)}′${pad(s, 2)}″${value >= 0 ? pos : neg}`;
  };
  return `${part(lat, 'K', 'G', 2)} ${part(lon, 'D', 'B', 3)}`;
}

export const formatDecimal = (lat: number, lon: number) => `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....',
  7: '--...', 8: '---..', 9: '----.',
};

/** Tanıtım kodu (ident) Mors karşılığı: harf başına nokta/çizgi dizisi. */
export function morse(ident: string): {letter: string; code: string}[] {
  return [...ident.toUpperCase()].filter((c) => MORSE[c]).map((c) => ({letter: c, code: MORSE[c]}));
}

const R_NM = 3440.065; // Dünya yarıçapı (deniz mili)
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Büyük daire mesafesi (NM) */
export function distanceNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Bir noktadan verilen gerçek yönde ve mesafede (NM) varılan nokta */
export function destination(lat: number, lon: number, brg: number, nm: number): [number, number] {
  const d = nm / R_NM;
  const b = rad(brg);
  const la1 = rad(lat);
  const la2 = Math.asin(Math.sin(la1) * Math.cos(d) + Math.cos(la1) * Math.sin(d) * Math.cos(b));
  const lo2 = rad(lon) + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(la1), Math.cos(d) - Math.sin(la1) * Math.sin(la2));
  return [deg(la2), deg(lo2)];
}

/** Başlangıç gerçek yönü (°, 0–360) */
export function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(rad(lon2 - lon1)) * Math.cos(rad(lat2));
  const x =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lon2 - lon1));
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

export const pad3 = (d: number) => String(Math.round(d) % 360).padStart(3, '0');

export const formatNm = (nm: number) => `${nf(nm < 10 ? 1 : 0).format(nm)} NM`;
export const formatKm = (nm: number) => `${nf(nm * 1.852 < 10 ? 1 : 0).format(nm * 1.852)} km`;

/** AIP Türkiye (DHMİ) bağlantıları. AIP telifle korunduğundan veri kopyalanmaz, resmî kaynağa yönlendirilir. */
export const AIP_HOME = 'https://dhmi.gov.tr/Sayfalar/aipturkey.aspx';
export const AIP_ENR41 = 'https://www.dhmi.gov.tr/AIPDocuments/LT_ENR_4_1_en.pdf';
export const aipAd = (icao: string, part: 2 | 3 = 2) => `https://www.dhmi.gov.tr/AIPDocuments/LT_AD_${part}_${icao}_en.pdf`;

export function featureKey(f: Feature): string {
  if (f.kind === 'airport') return f.item.ident;
  if (f.kind === 'ils') return `ILS-${f.item.apt}-${f.item.ident}`;
  return `${f.item.ident}-${f.item.type}-${f.item.src ?? 'aip'}`;
}

export function featureTitle(f: Feature): string {
  return f.kind === 'airport' ? f.item.icao ?? f.item.ident : f.item.ident;
}

export function featureLayer(f: Feature): LayerKey {
  if (f.kind === 'navaid') return navaidLayer(f.item);
  if (f.kind === 'ils') return 'ils';
  return airportLayer(f.item);
}

export function featureLayers(f: Feature): LayerKey[] {
  return f.kind === 'navaid' ? navaidLayers(f.item) : [featureLayer(f)];
}

/** Öğe, ait olduğu katmanlardan biri açıksa görünür */
export const featureVisible = (f: Feature, layers: Set<LayerKey>) => featureLayers(f).some((l) => layers.has(l));

/** ILS türü: kategori yoksa ve GP yoksa yalnızca LOC */
export const ilsLabel = (x: Ils) => (x.gp ? `ILS${x.cat ? ` CAT ${x.cat}` : ''}` : 'LOC');

/** Arama için normalize: Türkçe karakterler ve büyük/küçük harf farkı yok sayılır. */
export function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i');
}

export function searchText(f: Feature): string {
  if (f.kind === 'airport') {
    const a = f.item;
    return normalize([a.ident, a.icao, a.iata, a.name, a.alt, a.city].filter(Boolean).join(' '));
  }
  if (f.kind === 'ils') {
    const x = f.item;
    const freq = formatMHz(x.freq)?.replace(',', '.') ?? '';
    return normalize([x.ident, 'ils', x.apt, x.rwy && `rwy ${x.rwy}`, x.name, freq].filter(Boolean).join(' '));
  }
  const n = f.item;
  const freq = formatFrequency(n)?.replace(',', '.') ?? '';
  return normalize([n.ident, n.name, n.type, freq, n.ch, n.apt].filter(Boolean).join(' '));
}
