/**
 * Kapsama hesabının yürütücüsü: araziyi indirir, istasyon çevresinde kutupsal ızgarayı
 * doldurur, sonucu haritaya serilecek görüntüye ve özet sayılara çevirir. Hesap ana iş
 * parçacığında parçalar hâlinde yapılır; her parçadan sonra tarayıcıya nefes aldırılır.
 */

import {araziYukle, cevreKutusu, pikselKm, yakinlikSec} from './arazi';
import type {Arazi, Sinir} from './arazi';
import {hedefNokta, radyalKaybi} from './yayilim';
import type {KayipIzgarasi} from './yayilim';

/** Radyal sayısı (0,5° aralık) ve radyal başına en çok örnek */
const RADYAL = 720;
const EN_COK_ORNEK = 600;

export type Girdi = {
  lat: number;
  lon: number;
  /** AIP'de yayımlanan anten rakımı, m (yoksa arazi + direk) */
  antenRakimi?: number;
  /** Antenin yerden yüksekliği, m */
  direk: number;
  /** Uçak irtifası, m (deniz seviyesinden) */
  hAlici: number;
  fMHz: number;
  yaricapKm: number;
};

export type Sonuc = {
  girdi: Girdi;
  arazi: Arazi;
  izgara: KayipIzgarasi;
  /** İstasyon konumunda arazi yüksekliği, m */
  zemin: number;
  /** Anten rakımı AIP'den mi alındı */
  aipRakimi: boolean;
  sinir: Sinir;
};

export type Iptal = {iptal: boolean};

const nefes = () => new Promise<void>((r) => window.setTimeout(r, 0));

export async function kapsamaHesapla(
  g: Girdi,
  iptal: Iptal,
  ilerleme: (asama: 'arazi' | 'hesap', oran: number) => void,
): Promise<Sonuc | undefined> {
  const sinir = cevreKutusu(g.lat, g.lon, g.yaricapKm);
  // Kenardaki örnekler mozaiğin dışına taşmasın diye arazi biraz geniş indirilir
  const araziKutusu = cevreKutusu(g.lat, g.lon, g.yaricapKm * 1.02);
  const z = yakinlikSec(araziKutusu);
  ilerleme('arazi', 0);
  const arazi = await araziYukle(araziKutusu, z, (o) => {
    if (!iptal.iptal) ilerleme('arazi', o);
  });
  if (iptal.iptal) return undefined;

  const adimKm = Math.max(pikselKm(g.lat, z), g.yaricapKm / EN_COK_ORNEK);
  const n = Math.ceil(g.yaricapKm / adimKm);
  const zemin = arazi.yukseklik(g.lat, g.lon);
  // AIP rakımı kaba arazi modelinin altında kalırsa anten araziye gömülmesin
  const aipRakimi = g.antenRakimi !== undefined && g.antenRakimi >= zemin + 2;
  const izgara: KayipIzgarasi = {
    radyal: RADYAL,
    n,
    adimKm,
    arazi: new Float32Array(RADYAL * (n + 1)),
    kayip: new Float32Array(RADYAL * (n + 1)),
    hVerici: aipRakimi ? g.antenRakimi! : zemin + g.direk,
    hAlici: g.hAlici,
  };

  let son = performance.now();
  for (let r = 0; r < RADYAL; r++) {
    const bas = r * (n + 1);
    const yon = (r * 360) / RADYAL;
    izgara.arazi[bas] = zemin;
    for (let j = 1; j <= n; j++) {
      const [lat, lon] = hedefNokta(g.lat, g.lon, yon, j * adimKm);
      izgara.arazi[bas + j] = arazi.yukseklik(lat, lon);
    }
    radyalKaybi(izgara, r, g.fMHz);
    if (performance.now() - son > 40) {
      ilerleme('hesap', (r + 1) / RADYAL);
      await nefes();
      if (iptal.iptal) return undefined;
      son = performance.now();
    }
  }
  return {girdi: g, arazi, izgara, zemin, aipRakimi, sinir};
}

/** Pay sınıfları: eşiğin kaç dB üstünde */
export const GUCLU_DB = 20;
export const ORTA_DB = 10;

export type Ozet = {
  /** Sinyalin alındığı alan, km² */
  alanKm2: number;
  /** Hesap dairesinin alanı, km² */
  toplamKm2: number;
  /** Sinyalin alındığı en uzak nokta, km */
  enUzakKm: number;
  /** Hiçbir yönde kesilmeden kapsanan yarıçap, km */
  kesintisizKm: number;
  /** Kesintisiz yarıçapı belirleyen yön (gerçek, °) */
  kesintisizYon: number;
};

export function ozetle(s: Sonuc, izin: number): Ozet {
  const {radyal, n, adimKm, kayip} = s.izgara;
  // Halka dilimi alanı: (2π / radyal) × r × Δr
  const dilim = ((2 * Math.PI) / radyal) * adimKm * adimKm;
  let alan = 0;
  let enUzak = 0;
  let kesintisiz = n;
  let kesintisizYon = 0;
  for (let r = 0; r < radyal; r++) {
    const bas = r * (n + 1);
    let ilkKesinti = n;
    let kesildi = false;
    for (let j = 1; j <= n; j++) {
      // NaN (arazi altı) karşılaştırması yanlış döner, kapsanmamış sayılır
      if (kayip[bas + j] <= izin) {
        alan += j * dilim;
        if (j > enUzak) enUzak = j;
      } else if (!kesildi) {
        kesildi = true;
        ilkKesinti = j - 1;
      }
    }
    if (ilkKesinti < kesintisiz) {
      kesintisiz = ilkKesinti;
      kesintisizYon = (r * 360) / radyal;
    }
  }
  return {
    alanKm2: alan,
    toplamKm2: Math.PI * (n * adimKm) ** 2,
    enUzakKm: enUzak * adimKm,
    kesintisizKm: kesintisiz * adimKm,
    kesintisizYon,
  };
}

export type Renk = [number, number, number, number];
export type Palet = {guclu: Renk; orta: Renk; sinir: Renk; arazi: Renk};

const mercator = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/**
 * Kutupsal ızgarayı Web Mercator'da doğrusal bir görüntüye çevirir (Leaflet imageOverlay
 * görüntüyü enlemde doğrusal değil, izdüşümde doğrusal gerer).
 */
export function katmanCiz(s: Sonuc, izin: number, palet: Palet): string {
  const {radyal, n, adimKm, kayip} = s.izgara;
  const {kuzey, guney, bati, dogu} = s.sinir;
  const RAD = Math.PI / 180;
  const yK = mercator(kuzey);
  const yG = mercator(guney);
  const en = Math.min(900, 2 * n + 1);
  const boy = Math.max(1, Math.round((en * (yK - yG)) / ((dogu - bati) * RAD)));
  const tuval = document.createElement('canvas');
  tuval.width = en;
  tuval.height = boy;
  const cizim = tuval.getContext('2d');
  if (!cizim) return '';
  const goruntu = cizim.createImageData(en, boy);
  const px = goruntu.data;

  const f1 = s.girdi.lat * RAD;
  const sinF1 = Math.sin(f1);
  const cosF1 = Math.cos(f1);
  const menzil = n * adimKm;
  for (let y = 0; y < boy; y++) {
    const f2 = 2 * Math.atan(Math.exp(yK - ((y + 0.5) / boy) * (yK - yG))) - Math.PI / 2;
    const sinF2 = Math.sin(f2);
    const cosF2 = Math.cos(f2);
    for (let x = 0; x < en; x++) {
      const dl = (bati + ((x + 0.5) / en) * (dogu - bati) - s.girdi.lon) * RAD;
      const cosDl = Math.cos(dl);
      const km = 6371 * Math.acos(Math.min(1, sinF1 * sinF2 + cosF1 * cosF2 * cosDl));
      if (km > menzil) continue;
      const j = Math.round(km / adimKm);
      if (j < 1) continue;
      const yon = Math.atan2(Math.sin(dl) * cosF2, cosF1 * sinF2 - sinF1 * cosF2 * cosDl) / RAD;
      const r = Math.round(((yon + 360) % 360) * (radyal / 360)) % radyal;
      const k = kayip[r * (n + 1) + j];
      let renk: Renk;
      if (Number.isNaN(k)) renk = palet.arazi;
      else if (k > izin) continue;
      else if (izin - k >= GUCLU_DB) renk = palet.guclu;
      else if (izin - k >= ORTA_DB) renk = palet.orta;
      else renk = palet.sinir;
      const i = (y * en + x) * 4;
      px[i] = renk[0];
      px[i + 1] = renk[1];
      px[i + 2] = renk[2];
      px[i + 3] = renk[3];
    }
  }
  cizim.putImageData(goruntu, 0, 0);
  return tuval.toDataURL('image/png');
}

/** İstasyondan seçilen noktaya eşit aralıklı arazi profili */
export function profilCikar(s: Sonuc, yon: number, km: number): {h: Float32Array; adimKm: number} {
  const m = Math.max(2, Math.ceil(km / s.izgara.adimKm));
  const adimKm = km / m;
  const h = new Float32Array(m + 1);
  h[0] = s.zemin;
  for (let i = 1; i <= m; i++) {
    const [lat, lon] = hedefNokta(s.girdi.lat, s.girdi.lon, yon, i * adimKm);
    h[i] = s.arazi.yukseklik(lat, lon);
  }
  return {h, adimKm};
}
