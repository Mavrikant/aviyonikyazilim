/**
 * Arazi yüksekliği: AWS Open Data'daki Terrain Tiles (Mapzen "terrarium" PNG karoları;
 * anahtar gerektirmez, CORS açıktır). Her pikselde yükseklik = R × 256 + G + B / 256 − 32768 m.
 * Karolar bir kez çözülür ve oturum boyunca bellekte tutulur; istenen alan tek bir mozaikte
 * birleştirilip çift doğrusal aradeğerlemeyle örneklenir. Deniz tabanı 0 m sayılır.
 */

const KARO = 256;
const karoAdresi = (z: number, x: number, y: number) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

export const ARAZI_ATIF =
  'Arazi: <a href="https://registry.opendata.aws/terrain-tiles/">Terrain Tiles</a> (Mapzen; SRTM, GMTED2010, ETOPO1)';

const onbellek = new Map<string, Promise<Int16Array>>();

async function karoCoz(z: number, x: number, y: number): Promise<Int16Array> {
  const yanit = await fetch(karoAdresi(z, x, y));
  if (!yanit.ok) throw new Error(`HTTP ${yanit.status}`);
  // Renk dönüşümü ve alfa çarpımı piksel değerlerini (yani yüksekliği) bozmasın
  const resim = await createImageBitmap(await yanit.blob(), {
    colorSpaceConversion: 'none',
    premultiplyAlpha: 'none',
  });
  const tuval = document.createElement('canvas');
  tuval.width = KARO;
  tuval.height = KARO;
  const cizim = tuval.getContext('2d', {willReadFrequently: true});
  if (!cizim) throw new Error('canvas');
  cizim.drawImage(resim, 0, 0, KARO, KARO);
  resim.close();
  const px = cizim.getImageData(0, 0, KARO, KARO).data;
  const h = new Int16Array(KARO * KARO);
  for (let i = 0; i < h.length; i++) {
    h[i] = Math.max(0, Math.round(px[i * 4] * 256 + px[i * 4 + 1] + px[i * 4 + 2] / 256 - 32768));
  }
  return h;
}

function karo(z: number, x: number, y: number): Promise<Int16Array> {
  const anahtar = `${z}/${x}/${y}`;
  let bekleyen = onbellek.get(anahtar);
  if (!bekleyen) {
    bekleyen = karoCoz(z, x, y);
    onbellek.set(anahtar, bekleyen);
    // Başarısız indirme önbellekte kalmasın, sonraki hesap yeniden denesin
    bekleyen.catch(() => onbellek.delete(anahtar));
  }
  return bekleyen;
}

const pikselX = (lon: number, z: number) => ((lon + 180) / 360) * KARO * 2 ** z;
function pikselY(lat: number, z: number): number {
  const f = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(f) + 1 / Math.cos(f)) / Math.PI) / 2) * KARO * 2 ** z;
}

/** Karo pikselinin yerdeki boyu, km */
export const pikselKm = (lat: number, z: number) => (40075.017 * Math.cos((lat * Math.PI) / 180)) / (KARO * 2 ** z);

export type Sinir = {kuzey: number; guney: number; bati: number; dogu: number};

/** Merkez çevresinde yarıçapı kapsayan enlem/boylam kutusu */
export function cevreKutusu(lat: number, lon: number, km: number): Sinir {
  const dLat = km / 111.19;
  const dLon = km / (111.19 * Math.cos(((Math.abs(lat) + dLat) * Math.PI) / 180));
  return {kuzey: lat + dLat, guney: lat - dLat, bati: lon - dLon, dogu: lon + dLon};
}

function karoAraligi(s: Sinir, z: number) {
  const son = 2 ** z - 1;
  const sik = (v: number) => Math.max(0, Math.min(son, Math.floor(v / KARO)));
  return {
    x0: sik(pikselX(s.bati, z)),
    x1: sik(pikselX(s.dogu, z)),
    y0: sik(pikselY(s.kuzey, z)),
    y1: sik(pikselY(s.guney, z)),
  };
}

/** Kutuyu en çok `enCok` karoyla örten en ayrıntılı yakınlık düzeyi */
export function yakinlikSec(s: Sinir, enCok = 36): number {
  for (let z = 10; z > 4; z--) {
    const a = karoAraligi(s, z);
    if ((a.x1 - a.x0 + 1) * (a.y1 - a.y0 + 1) <= enCok) return z;
  }
  return 4;
}

export type Arazi = {
  z: number;
  /** Deniz seviyesinden yükseklik, m */
  yukseklik: (lat: number, lon: number) => number;
};

export async function araziYukle(s: Sinir, z: number, ilerleme?: (oran: number) => void): Promise<Arazi> {
  const {x0, x1, y0, y1} = karoAraligi(s, z);
  const nx = x1 - x0 + 1;
  const ny = y1 - y0 + 1;
  const en = nx * KARO;
  const boy = ny * KARO;
  const veri = new Int16Array(en * boy);
  let biten = 0;
  const isler: Promise<void>[] = [];
  for (let ty = 0; ty < ny; ty++) {
    for (let tx = 0; tx < nx; tx++) {
      isler.push(
        karo(z, x0 + tx, y0 + ty).then((h) => {
          for (let r = 0; r < KARO; r++) {
            veri.set(h.subarray(r * KARO, (r + 1) * KARO), (ty * KARO + r) * en + tx * KARO);
          }
          ilerleme?.(++biten / (nx * ny));
        }),
      );
    }
  }
  await Promise.all(isler);

  const yukseklik = (lat: number, lon: number) => {
    // Piksel merkezleri yarım piksel içeridedir
    const fx = Math.max(0, Math.min(en - 1.001, pikselX(lon, z) - x0 * KARO - 0.5));
    const fy = Math.max(0, Math.min(boy - 1.001, pikselY(lat, z) - y0 * KARO - 0.5));
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const ax = fx - ix;
    const ay = fy - iy;
    const i = iy * en + ix;
    return (
      (veri[i] * (1 - ax) + veri[i + 1] * ax) * (1 - ay) + (veri[i + en] * (1 - ax) + veri[i + en + 1] * ax) * ay
    );
  };
  return {z, yukseklik};
}
