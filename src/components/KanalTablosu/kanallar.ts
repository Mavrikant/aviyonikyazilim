/**
 * VOR, ILS (LOC + GS) ve DME kanal planı. Tablo elle yazılmaz, ICAO Ek 10 Cilt I'deki
 * eşleme kuralından hesaplanır; yalnızca LOC → GS eşlemesi kurala bağlı olmadığı için
 * listeyle verilir. Frekanslar tam sayı kHz tutulur (kayan nokta 108,05 gibi değerlerde
 * yuvarlama hatası verir).
 *
 * - DME kanalı 1–126, X ya da Y; sorgu frekansı (uçak → yer) 1024 + n MHz.
 * - Cevap (yer → uçak): X kanallarında 1–63 için sorgu − 63, 64–126 için sorgu + 63 MHz;
 *   Y kanallarında tersi.
 * - VHF eşlemesi: 17–59 → 108,00 + (n − 17) × 0,1 MHz; 70–126 → 112,30 + (n − 70) × 0,1 MHz;
 *   Y kanalı X'in 50 kHz üstüdür. 1–16 ve 60–69 VHF ile eşlenmez (TACAN / yalnız DME).
 * - 108,00–111,95 MHz'te onda birler basamağı tek olan frekanslar LOC, çift olanlar VOR'dur;
 *   112,00–117,95 MHz'in tamamı VOR'dur.
 */

export type Mod = 'X' | 'Y';
export type Tur = 'VOR' | 'ILS' | 'DME';

export type Kanal = {
  /** "17X" */
  ad: string;
  no: number;
  mod: Mod;
  tur: Tur;
  /** VOR ya da LOC frekansı, kHz */
  vhf?: number;
  /** Süzülüş yolu (GS) frekansı, kHz */
  gs?: number;
  /** DME sorgu (uçak → yer) ve cevap (yer → uçak) frekansı, MHz */
  sorgu: number;
  cevap: number;
  /** Darbe çifti aralığı, µs */
  sorguKod: number;
  cevapKod: number;
};

export const TUR_ADI: Record<Tur, string> = {
  VOR: 'VOR',
  ILS: 'ILS (LOC + GS)',
  DME: 'Yalnız DME/TACAN',
};

/** LOC frekansı (kHz) → GS frekansı (kHz). Y kanalının GS'i, X eşinin 150 kHz altıdır. */
const GS_X: Record<number, number> = {
  108100: 334700,
  108300: 334100,
  108500: 329900,
  108700: 330500,
  108900: 329300,
  109100: 331400,
  109300: 332000,
  109500: 332600,
  109700: 333200,
  109900: 333800,
  110100: 334400,
  110300: 335000,
  110500: 329600,
  110700: 330200,
  110900: 330800,
  111100: 331700,
  111300: 332300,
  111500: 332900,
  111700: 333500,
  111900: 331100,
};

function vhfOf(no: number, mod: Mod): number | undefined {
  let khz: number;
  if (no >= 17 && no <= 59) khz = 108000 + (no - 17) * 100;
  else if (no >= 70 && no <= 126) khz = 112300 + (no - 70) * 100;
  else return undefined;
  return khz + (mod === 'Y' ? 50 : 0);
}

/** 108,00–111,95 MHz'te onda birler basamağı tek ise LOC */
export const locMu = (khz: number) => khz < 112000 && Math.floor(khz / 100) % 2 === 1;

function kanalOf(no: number, mod: Mod): Kanal {
  const vhf = vhfOf(no, mod);
  const sorgu = 1024 + no;
  const alt = no <= 63;
  const cevap = (mod === 'X') === alt ? sorgu - 63 : sorgu + 63;
  let gs: number | undefined;
  if (vhf !== undefined && locMu(vhf)) gs = mod === 'X' ? GS_X[vhf] : GS_X[vhf - 50] - 150;
  return {
    ad: `${no}${mod}`,
    no,
    mod,
    tur: vhf === undefined ? 'DME' : gs !== undefined ? 'ILS' : 'VOR',
    vhf,
    gs,
    sorgu,
    cevap,
    sorguKod: mod === 'X' ? 12 : 36,
    cevapKod: mod === 'X' ? 12 : 30,
  };
}

export const KANALLAR: Kanal[] = [];
for (let no = 1; no <= 126; no++) for (const mod of ['X', 'Y'] as const) KANALLAR.push(kanalOf(no, mod));

const KANAL_ADI = new Map(KANALLAR.map((k) => [k.ad, k]));
const VHF_KANAL = new Map(KANALLAR.filter((k) => k.vhf).map((k) => [k.vhf!, k]));

export const kanalBul = (ad: string) => KANAL_ADI.get(ad.toUpperCase());
/** VOR/LOC frekansından (kHz) eşli kanal */
export const vhfKanal = (khz: number) => VHF_KANAL.get(khz);

/** kHz → "108,10" (MHz, iki ondalık) */
export const mhz = (khz: number) => (khz / 1000).toFixed(2).replace('.', ',');

/*
 * Sağlama: plan değişirse derleme durur. 252 kanal; 200'ü VHF ile eşli (160 VOR, 40 LOC),
 * 52'si eşsiz; 40 GS frekansı birbirinden farklı ve 328,6–335,4 MHz bandında; bilinen uç değerler.
 */
{
  const say = (t: Tur) => KANALLAR.filter((k) => k.tur === t).length;
  const gsler = new Set(KANALLAR.flatMap((k) => (k.gs ? [k.gs] : [])));
  const k = (ad: string) => KANAL_ADI.get(ad)!;
  const hatalar = [
    KANALLAR.length !== 252 && 'kanal sayısı',
    (say('VOR') !== 160 || say('ILS') !== 40 || say('DME') !== 52) && 'tür sayıları',
    (gsler.size !== 40 || [...gsler].some((f) => f < 328600 || f > 335400)) && 'GS frekansları',
    (k('17X').vhf !== 108000 || k('59Y').vhf !== 112250 || k('70X').vhf !== 112300 || k('126Y').vhf !== 117950) &&
      'VHF uçları',
    (k('18X').gs !== 334700 || k('18Y').gs !== 334550 || k('56Y').gs !== 330950) && 'GS eşlemesi',
    (k('1X').cevap !== 962 || k('1Y').cevap !== 1088 || k('126X').cevap !== 1213 || k('126Y').cevap !== 1087) &&
      'DME cevap frekansları',
  ].filter(Boolean);
  if (hatalar.length > 0) throw new Error(`KanalTablosu: kanal planı sağlaması tutmadı (${hatalar.join(', ')})`);
}
