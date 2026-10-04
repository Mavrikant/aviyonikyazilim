/**
 * Konnektör pin yerleşimi aracının veri modeli: konnektör tanımları (pin başlığı, hata
 * ayıklama başlıkları, D-sub, MIL-DTL-38999), hazır şablonlar ve sinyal türleri.
 *
 * Konumlar milimetredir ve standartlardaki kurala göre **pin (erkek) kontaklı yerleşimin
 * ön (geçme) yüzü** için verilir: merkez orijin, +x sağ, +y yukarı. Soket yerleşimi ve arka
 * yüz bu görünümün yatay aynasıdır (MIL-STD-1560C 5.1b, MIL-DTL-24308 Ek A).
 */

export type SinyalTuru =
  | 'bos'
  | 'sinyal'
  | 'ayrik'
  | 'diferansiyel'
  | 'analog'
  | 'guc'
  | 'toprak'
  | 'ekran'
  | 'yedek'
  | 'nc';

export const TURLER: {key: Exclude<SinyalTuru, 'bos'>; ad: string}[] = [
  {key: 'sinyal', ad: 'Sinyal'},
  {key: 'ayrik', ad: 'Ayrık (discrete)'},
  {key: 'diferansiyel', ad: 'Diferansiyel'},
  {key: 'analog', ad: 'Analog'},
  {key: 'guc', ad: 'Güç'},
  {key: 'toprak', ad: 'Toprak'},
  {key: 'ekran', ad: 'Ekran / şasi'},
  {key: 'yedek', ad: 'Yedek'},
  {key: 'nc', ad: 'Bağlantısız (NC)'},
];

export const TUR_ADI: Record<SinyalTuru, string> = {
  bos: 'Atanmamış',
  ...Object.fromEntries(TURLER.map((t) => [t.key, t.ad])),
} as Record<SinyalTuru, string>;

/**
 * Dışa aktarılan SVG/PNG'nin renkleri. Sayfadaki çizim renkleri temaya göre CSS'ten gelir
 * (styles.module.css, --kp-* değişkenleri); sunucuda üretilen HTML temadan bağımsız kalsın diye
 * renkler bileşende seçilmez. Bu palet CSS'teki açık tema değerleriyle aynı tutulur.
 */
export type Palet = Record<SinyalTuru, {dolgu: string; yazi: string}> & {
  zemin: string;
  cizgi: string;
  yazi: string;
  soluk: string;
};

export const ACIK: Palet = {
  bos: {dolgu: '#ffffff', yazi: '#1c1e21'},
  sinyal: {dolgu: '#2563a6', yazi: '#ffffff'},
  ayrik: {dolgu: '#0f7c80', yazi: '#ffffff'},
  diferansiyel: {dolgu: '#7a3fa6', yazi: '#ffffff'},
  analog: {dolgu: '#a8660b', yazi: '#ffffff'},
  guc: {dolgu: '#c0392b', yazi: '#ffffff'},
  toprak: {dolgu: '#2f3337', yazi: '#ffffff'},
  ekran: {dolgu: '#2e7d4f', yazi: '#ffffff'},
  yedek: {dolgu: '#cfd4db', yazi: '#1c1e21'},
  nc: {dolgu: '#ffffff', yazi: '#7a828c'},
  zemin: '#ffffff',
  cizgi: '#5f6b78',
  yazi: '#1c1e21',
  soluk: '#8a929c',
};

export type Atama = {ad: string; tur: SinyalTuru; not: string};
export type Atamalar = Record<string, Atama>;

export const BOS_ATAMA: Atama = {ad: '', tur: 'bos', not: ''};

export type Kontak = {
  id: string;
  /** mm; pin yerleşiminin ön yüzünde, merkeze göre */
  x: number;
  y: number;
  /** Çizimdeki gerçek çap (mm): dairesel konnektörde soket boşluğu, diğerlerinde pin */
  cap: number;
  /** Kontak boyutu (MIL-DTL-38999), ör. "22D", "8 Twinax" */
  boyut?: string;
  /** Anahtar konumu: bu konumda pin yoktur (ör. TI 14 pinli JTAG'de 6) */
  anahtar?: boolean;
};

export type GovdeTuru = 'daire' | 'dsub' | 'baslik';

export type Konnektor = {
  /** Atamaların saklandığı anahtar (ör. "38999:25-35") */
  anahtar: string;
  ad: string;
  /** Kısa özet: kontak sayısı ve boyutları */
  ozet: string;
  govde: GovdeTuru;
  kontaklar: Kontak[];
  /** Sinyal adları çizimde pinlerin yanına yazılır (pin başlıkları) */
  adEtiketi: boolean;
  /** Kare pad ile işaretlenen 1 numaralı pin (pin başlıkları) */
  ilkPin?: string;
  /** Konnektörle gelen hazır atamalar (JTAG şablonları) */
  sablon?: Atamalar;
  kaynak?: string;
  notlar?: string[];
};

const INC = 25.4;

/* ------------------------------------------------------------------ */
/* Pin başlıkları                                                       */
/* ------------------------------------------------------------------ */

export type Numaralama = 'zikzak' | 'sirali';

/**
 * Pin başlığı: çizimde sıralar dikey sütundur (1 numaralı pin sol üstte), adlar dışa yazılır.
 * Zikzak: 1-2 karşılıklı (IDC); sıralı: her sıra kendi içinde ardışık.
 */
export function baslik(
  sira: 1 | 2,
  pinSayisi: number,
  aralik: number,
  numara: Numaralama,
  anahtar = `baslik:${sira}x${pinSayisi / sira}`,
): Konnektor {
  const n = pinSayisi / sira;
  const kontaklar: Kontak[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < sira; c++) {
      const no = sira === 1 ? r + 1 : numara === 'zikzak' ? r * 2 + c + 1 : c * n + r + 1;
      kontaklar.push({id: String(no), x: (c - (sira - 1) / 2) * aralik, y: ((n - 1) / 2 - r) * aralik, cap: aralik * 0.36});
    }
  }
  kontaklar.sort((a, b) => Number(a.id) - Number(b.id));
  const adim = new Intl.NumberFormat('tr-TR', {minimumFractionDigits: 2}).format(aralik);
  return {
    anahtar,
    ad: `Pin başlığı ${sira}×${n}`,
    ozet: `${pinSayisi} pin · ${adim} mm aralık`,
    govde: 'baslik',
    kontaklar,
    adEtiketi: true,
    ilkPin: '1',
  };
}

type SablonSatiri = [string, string, SinyalTuru, string?];
const sablondan = (satirlar: SablonSatiri[]): Atamalar =>
  Object.fromEntries(satirlar.map(([pin, ad, tur, not = '']) => [pin, {ad, tur, not}]));

export type JtagModel = 'arm20' | 'cortex10' | 'ti14';

/** Hata ayıklama başlıkları: ARM ve TI'ın yayımladığı pin yerleşimleri */
export const JTAG: Record<JtagModel, {ad: string; sira: 1 | 2; pin: number; aralik: number; anahtarPin?: string; kaynak: string; atamalar: SablonSatiri[]}> = {
  arm20: {
    ad: 'ARM JTAG 20',
    sira: 2,
    pin: 20,
    aralik: 2.54,
    kaynak: 'ARM JTAG 20 (2,54 mm, 2×10)',
    atamalar: [
      ['1', 'VTref', 'guc', 'Hedef referans gerilimi'],
      ['2', 'Vsupply', 'guc', 'Çoğu probda bağlı değil'],
      ['3', 'nTRST', 'sinyal', 'TAP sıfırlama (aktif düşük)'],
      ['4', 'GND', 'toprak'],
      ['5', 'TDI', 'sinyal'],
      ['6', 'GND', 'toprak'],
      ['7', 'TMS', 'sinyal'],
      ['8', 'GND', 'toprak'],
      ['9', 'TCK', 'sinyal'],
      ['10', 'GND', 'toprak'],
      ['11', 'RTCK', 'sinyal', 'Geri dönen saat (uyarlamalı saat)'],
      ['12', 'GND', 'toprak'],
      ['13', 'TDO', 'sinyal'],
      ['14', 'GND', 'toprak'],
      ['15', 'nSRST', 'sinyal', 'Sistem sıfırlama (aktif düşük)'],
      ['16', 'GND', 'toprak'],
      ['17', 'DBGRQ', 'sinyal'],
      ['18', 'GND', 'toprak'],
      ['19', 'DBGACK', 'sinyal'],
      ['20', 'GND', 'toprak'],
    ],
  },
  cortex10: {
    ad: 'Cortex Debug 10',
    sira: 2,
    pin: 10,
    aralik: 1.27,
    anahtarPin: '7',
    kaynak: 'ARM Cortex Debug (1,27 mm, 2×5)',
    atamalar: [
      ['1', 'VTref', 'guc', 'Hedef referans gerilimi'],
      ['2', 'SWDIO/TMS', 'sinyal'],
      ['3', 'GND', 'toprak'],
      ['4', 'SWCLK/TCK', 'sinyal'],
      ['5', 'GND', 'toprak'],
      ['6', 'SWO/TDO', 'sinyal'],
      ['8', 'NC/TDI', 'sinyal', 'Yalnızca JTAG kipinde TDI'],
      ['9', 'GNDDetect', 'toprak', 'Prob algılama'],
      ['10', 'nRESET', 'sinyal', 'Sistem sıfırlama (aktif düşük)'],
    ],
  },
  ti14: {
    ad: 'TI JTAG 14',
    sira: 2,
    pin: 14,
    aralik: 2.54,
    anahtarPin: '6',
    kaynak: 'TI 14 pinli JTAG (2,54 mm, 2×7)',
    atamalar: [
      ['1', 'TMS', 'sinyal'],
      ['2', 'TRST', 'sinyal', 'TAP sıfırlama (aktif düşük)'],
      ['3', 'TDI', 'sinyal'],
      ['4', 'GND', 'toprak'],
      ['5', 'PD', 'guc', 'Varlık algılama; hedef VCC'],
      ['7', 'TDO', 'sinyal'],
      ['8', 'GND', 'toprak'],
      ['9', 'TCK_RET', 'sinyal', 'Geri dönen saat'],
      ['10', 'GND', 'toprak'],
      ['11', 'TCK', 'sinyal'],
      ['12', 'GND', 'toprak'],
      ['13', 'EMU0', 'sinyal'],
      ['14', 'EMU1', 'sinyal'],
    ],
  },
};

export function jtag(model: JtagModel): Konnektor {
  const j = JTAG[model];
  const k = baslik(j.sira, j.pin, j.aralik, 'zikzak', `jtag:${model}`);
  return {
    ...k,
    ad: j.ad,
    kontaklar: k.kontaklar.map((c) => (c.id === j.anahtarPin ? {...c, anahtar: true} : c)),
    sablon: sablondan(j.atamalar),
    kaynak: j.kaynak,
    notlar: j.anahtarPin ? [`${j.anahtarPin} numaralı konum anahtardır: pin yoktur, karşı konnektörde delik kapalıdır.`] : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* D-sub (standart yoğunluk, MIL-DTL-24308 Ek A, yerleşim 1)            */
/* ------------------------------------------------------------------ */

export type DsubModel = 'DE-9' | 'DA-15' | 'DB-25' | 'DC-37' | 'DD-50';

/** Sıra başına kontak sayısı ve adım (inç); Şekil A-1…A-5 */
export const DSUB: Record<DsubModel, {govde: number; harf: string; siralar: number[]; adim: number}> = {
  'DE-9': {govde: 1, harf: 'E', siralar: [5, 4], adim: 0.108},
  'DA-15': {govde: 2, harf: 'A', siralar: [8, 7], adim: 0.108},
  'DB-25': {govde: 3, harf: 'B', siralar: [13, 12], adim: 0.10875},
  'DC-37': {govde: 4, harf: 'C', siralar: [19, 18], adim: 0.10875},
  'DD-50': {govde: 5, harf: 'D', siralar: [17, 16, 17], adim: 0.10875},
};

export function dsub(model: DsubModel): Konnektor {
  const d = DSUB[model];
  const kontaklar: Kontak[] = [];
  const siraArasi = 0.112; // inç
  let no = 1;
  d.siralar.forEach((n, s) => {
    const y = ((d.siralar.length - 1) / 2 - s) * siraArasi;
    for (let i = 0; i < n; i++) {
      kontaklar.push({id: String(no++), x: (i - (n - 1) / 2) * d.adim * INC, y: y * INC, cap: 1.0});
    }
  });
  return {
    anahtar: `dsub:${model}`,
    ad: `D-sub ${model}`,
    ozet: `${kontaklar.length} kontak · ${d.harf} gövde · 2,77 mm adım`,
    govde: 'dsub',
    kontaklar,
    adEtiketi: false,
    kaynak: `MIL-DTL-24308 Ek A, Şekil A-${d.govde}, yerleşim 1`,
  };
}

/** D-sub şablonları: yalnızca standartta tanımlı yerleşimler */
export const DSUB_SABLONLARI: {ad: string; model: DsubModel; atamalar: Atamalar}[] = [
  {
    ad: 'RS-232 (DTE, TIA-574)',
    model: 'DE-9',
    atamalar: sablondan([
      ['1', 'DCD', 'sinyal', 'Taşıyıcı algılandı'],
      ['2', 'RXD', 'sinyal', 'Alınan veri'],
      ['3', 'TXD', 'sinyal', 'Gönderilen veri'],
      ['4', 'DTR', 'sinyal', 'Veri terminali hazır'],
      ['5', 'GND', 'toprak', 'Sinyal toprağı'],
      ['6', 'DSR', 'sinyal', 'Veri seti hazır'],
      ['7', 'RTS', 'sinyal', 'Gönderme isteği'],
      ['8', 'CTS', 'sinyal', 'Göndermeye hazır'],
      ['9', 'RI', 'sinyal', 'Çağrı göstergesi'],
    ]),
  },
  {
    ad: 'CAN (CiA 303-1)',
    model: 'DE-9',
    atamalar: sablondan([
      ['1', 'Rezerve', 'yedek'],
      ['2', 'CAN_L', 'diferansiyel'],
      ['3', 'CAN_GND', 'toprak'],
      ['4', 'Rezerve', 'yedek'],
      ['5', 'CAN_SHLD', 'ekran', 'İsteğe bağlı'],
      ['6', 'GND', 'toprak', 'İsteğe bağlı'],
      ['7', 'CAN_H', 'diferansiyel'],
      ['8', 'Rezerve', 'yedek'],
      ['9', 'CAN_V+', 'guc', 'İsteğe bağlı besleme'],
    ]),
  },
  {
    ad: 'RS-232 (DTE, DB-25)',
    model: 'DB-25',
    atamalar: sablondan([
      ['1', 'PG', 'ekran', 'Koruma toprağı'],
      ['2', 'TXD', 'sinyal', 'Gönderilen veri'],
      ['3', 'RXD', 'sinyal', 'Alınan veri'],
      ['4', 'RTS', 'sinyal', 'Gönderme isteği'],
      ['5', 'CTS', 'sinyal', 'Göndermeye hazır'],
      ['6', 'DSR', 'sinyal', 'Veri seti hazır'],
      ['7', 'SG', 'toprak', 'Sinyal toprağı'],
      ['8', 'DCD', 'sinyal', 'Taşıyıcı algılandı'],
      ['20', 'DTR', 'sinyal', 'Veri terminali hazır'],
      ['22', 'RI', 'sinyal', 'Çağrı göstergesi'],
    ]),
  },
];

/* ------------------------------------------------------------------ */
/* MIL-DTL-38999 (MIL-STD-1560C yerleşimleri)                           */
/* ------------------------------------------------------------------ */

export type Yerlesim = {
  kod: string;
  govde: number;
  sekil: number;
  pasif?: boolean;
  yerine?: string;
  /** [kimlik, x (inç), y (inç), boyut] */
  k: [string, number, number, string][];
};

export type YerlesimVerisi = {kaynak: string; birim: string; yerlesimler: Yerlesim[]};

/** MIL-STD-1560C 5.1c: soket kontak boşluğu çapı (inç, en az) */
const BOSLUK_INC: Record<string, number> = {
  '23-22': 0.032,
  '22': 0.036,
  '22D': 0.035,
  '22M': 0.036,
  '20': 0.049,
  '16': 0.071,
  '12': 0.103,
  '10': 0.134,
  '8': 0.227,
};

/** "128 × 22D" ya da "3 × 8 Twinax · 13 × 16 · 10 × 20" */
export function boyutOzeti(y: Yerlesim): string {
  const sayac = new Map<string, number>();
  for (const [, , , b] of y.k) sayac.set(b, (sayac.get(b) ?? 0) + 1);
  return [...sayac]
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([b, n]) => `${n} × ${b}`)
    .join(' · ');
}

export const seriAdi = (govde: number) => (govde % 2 === 1 ? 'Seri I, III, IV' : 'Seri II');

export function d38999(y: Yerlesim, kaynak: string): Konnektor {
  const notlar = [`${seriAdi(y.govde)}, gövde boyutu ${y.govde}.`];
  if (y.pasif) notlar.push(`Yeni tasarımda kullanılmaz${y.yerine ? `; yerine ${y.yerine}` : ''}.`);
  return {
    anahtar: `38999:${y.kod}`,
    ad: `MIL-DTL-38999 ${y.kod}`,
    ozet: `${y.k.length} kontak · ${boyutOzeti(y)}`,
    govde: 'daire',
    kontaklar: y.k.map(([id, x, yy, boyut]) => ({
      id,
      x: x * INC,
      y: yy * INC,
      boyut,
      cap: (BOSLUK_INC[boyut.split(' ')[0]] ?? 0.04) * INC,
    })),
    adEtiketi: false,
    kaynak: `${kaynak}, Şekil ${y.sekil}`,
    notlar,
  };
}

/* ------------------------------------------------------------------ */
/* Sinyal türü tahmini                                                  */
/* ------------------------------------------------------------------ */

const CIFT_EKLERI: [string, string][] = [
  ['+', '-'],
  ['_P', '_N'],
  ['_H', '_L'],
  ['_HI', '_LO'],
  ['_A', '_B'],
];

/** Adın diferansiyel eşi: "TX+" → "TX-", "CAN_H" → "CAN_L"; ek yoksa undefined */
export function ciftEsi(ad: string): string | undefined {
  const s = ad.trim().toUpperCase();
  for (const [a, b] of CIFT_EKLERI) {
    if (s.endsWith(a) && s.length > a.length) return s.slice(0, -a.length) + b;
    if (s.endsWith(b) && s.length > b.length) return s.slice(0, -b.length) + a;
  }
  return undefined;
}

/**
 * Yazılan sinyal adından tür tahmini (kullanıcı türü elle değiştirmediyse uygulanır).
 * Diferansiyel için eşinin tabloda bulunması aranır; "+/-" ve CAN_H/L ekleri tek başına yeter.
 */
export function turTahmini(ad: string, digerAdlar: Set<string>): SinyalTuru {
  const s = ad.trim().toUpperCase();
  if (!s) return 'bos';
  if (/^(NC|N\/C|N\.C\.|BOŞ|BOS)$/.test(s)) return 'nc';
  if (/^(SPARE|YEDEK|RESERVED|RSVD|REZERVE)/.test(s)) return 'yedek';
  if (/(SHIELD|SHLD|EKRAN|CHASSIS|ŞASİ|SASI|FRAME)|^PE$/.test(s)) return 'ekran';
  if (/^[A-Z]{0,2}GND|(^|_)GND\d*$|^(GROUND|TOPRAK|0V|VSS)|(^|_)(RTN|RETURN)$/.test(s)) return 'toprak';
  if (/^[+-]?\d+([.,]\d+)?V\d*(_\w+)?$|^V(CC|DD|EE|IN|BAT|REF|TREF|SUPPLY|BUS|PP)|PWR|POWER|GÜÇ|(^|_)V[+-]$/.test(s)) return 'guc';
  if (/DISC|AYRIK/.test(s)) return 'ayrik';
  const es = ciftEsi(s);
  if (es && (/[+-]$/.test(s) || /^CAN_?[HL]$/.test(s) || digerAdlar.has(es))) return 'diferansiyel';
  return 'sinyal';
}
