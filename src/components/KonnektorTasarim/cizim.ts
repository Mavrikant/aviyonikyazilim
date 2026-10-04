/**
 * Konnektör yüzünün çizim modeli: kontakların SVG koordinatları ve çizim yarıçapları,
 * gövde ana hattı, ana kama / 1 numaralı pin işareti ve sinyal adı etiketleri. Sayfadaki
 * görünüm (Yuz.tsx) ile SVG/PNG dışa aktarımı aynı modeli çizer.
 *
 * Birimler milimetredir; SVG'de y aşağı doğru arttığı için standarttaki +y yukarı yönü
 * işaret değiştirerek çevrilir.
 */
import type {Atamalar, Konnektor, Palet, SinyalTuru} from './veri';
import {TUR_ADI} from './veri';

export type CizimKontak = {
  id: string;
  x: number;
  y: number;
  r: number;
  /** Pin kimliğinin yazı boyu */
  yazi: number;
  anahtar: boolean;
  /** 1 numaralı pin: kare pad */
  kare: boolean;
  boyut?: string;
};

export type CizimAdi = {id: string; x: number; y: number; hiza: 'start' | 'end'};

export type Cizim = {
  vb: [number, number, number, number];
  kontaklar: CizimKontak[];
  adlar: CizimAdi[];
  adBoyu: number;
  /** Ad etiketine ayrılan genişlik (karakter); daha uzun adlar kısaltılır */
  adKarakter: number;
  govde: string;
  /** Dairesel gövdede eksen çizgileri için dış yarıçap */
  daire?: number;
  /** Ana kama yuvası (dairesel) */
  kama?: string;
  /** Ana kamayı ya da 1 numaralı pini gösteren üçgen */
  isaret?: string;
};

const f = (v: number) => Number(v.toFixed(3));

/** Çizimdeki sinyal adı: ayrılan genişliği aşan ad üç noktayla kısaltılır */
export const etiketMetni = (ad: string, karakter: number) =>
  ad.length > karakter ? `${ad.slice(0, karakter - 1)}…` : ad;

/**
 * Çizim yarıçapları: kontak en az gerçek çapında çizilir; okunur etiket için en yakın komşu
 * mesafesinin %40'ına kadar büyütülür. Aynı boyuttaki kontaklar aynı çapta kalsın diye büyütme,
 * o boyuttaki en sık aralığa göre yapılır; iki daire arasında boşluk kalacak kadar da kısılır
 * (gerçek çaplar standartta zaten çakışmaz).
 */
export function yaricaplar(k: Konnektor): number[] {
  const ks = k.kontaklar;
  const n = ks.length;
  const gercek = ks.map((c) => c.cap / 2);
  const yakin = ks.map(() => Infinity);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(ks[i].x - ks[j].x, ks[i].y - ks[j].y);
      if (d < yakin[i]) yakin[i] = d;
      if (d < yakin[j]) yakin[j] = d;
    }
  }
  const grupYakin = new Map<string, number>();
  ks.forEach((c, i) => {
    const g = c.boyut ?? '';
    if (Number.isFinite(yakin[i])) grupYakin.set(g, Math.min(grupYakin.get(g) ?? Infinity, yakin[i]));
  });
  const r = ks.map((c, i) => {
    const d = grupYakin.get(c.boyut ?? '');
    return Math.max(gercek[i], d !== undefined && Number.isFinite(d) ? 0.4 * d : gercek[i]);
  });
  for (let gecis = 0; gecis < 4; gecis++) {
    let degisti = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const sinir = 0.9 * Math.hypot(ks[i].x - ks[j].x, ks[i].y - ks[j].y);
        const fazla = r[i] + r[j] - sinir;
        if (fazla <= 1e-6) continue;
        const ei = r[i] - gercek[i];
        const ej = r[j] - gercek[j];
        if (ei + ej <= 1e-9) continue;
        const oran = Math.min(1, fazla / (ei + ej));
        r[i] -= ei * oran;
        r[j] -= ej * oran;
        degisti = true;
      }
    }
    if (!degisti) break;
  }
  return r;
}

/** Köşeleri yuvarlatılmış çokgen yolu */
function yuvarlakCokgen(p: [number, number][], rc: number[]): string {
  const n = p.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [x, y] = p[i];
    const [px, py] = p[(i - 1 + n) % n];
    const [nx, ny] = p[(i + 1) % n];
    const l1 = Math.hypot(px - x, py - y);
    const l2 = Math.hypot(nx - x, ny - y);
    const ax = x + ((px - x) / l1) * rc[i];
    const ay = y + ((py - y) / l1) * rc[i];
    const bx = x + ((nx - x) / l2) * rc[i];
    const by = y + ((ny - y) / l2) * rc[i];
    d += `${i === 0 ? 'M' : 'L'}${f(ax)} ${f(ay)}Q${f(x)} ${f(y)} ${f(bx)} ${f(by)}`;
  }
  return `${d}Z`;
}

/**
 * @param aynala soket yerleşimi ya da arka yüz: x ekseninde ayna
 * @param adKarakter sinyal adı etiketleri için ayrılan genişlik (karakter)
 */
export function cizimOlustur(k: Konnektor, r: number[], aynala: boolean, adKarakter: number): Cizim {
  // Kimlik yazıları yerleşim boyunca aynı oranda: en uzun kimlik daireye sığacak boyda
  const uzunluk = Math.max(...k.kontaklar.map((c) => c.id.length));
  const oran = uzunluk <= 1 ? 1.15 : uzunluk === 2 ? 0.95 : 0.72;
  const ks: CizimKontak[] = k.kontaklar.map((c, i) => ({
    id: c.id,
    x: f(aynala ? -c.x : c.x) || 0,
    y: f(-c.y) || 0,
    r: f(r[i]),
    yazi: f(r[i] * oran),
    anahtar: !!c.anahtar,
    kare: c.id === k.ilkPin,
    boyut: c.boyut,
  }));
  const rMax = Math.max(...ks.map((c) => c.r));
  let sinir: [number, number, number, number]; // minX, minY, maxX, maxY
  const cizim: Omit<Cizim, 'vb'> = {kontaklar: ks, adlar: [], adBoyu: 0, adKarakter, govde: ''};

  if (k.govde === 'daire') {
    const ic = Math.max(...ks.map((c) => Math.hypot(c.x, c.y) + c.r));
    const R = ic + Math.max(0.6, ic * 0.07);
    const kw = Math.min(3.2, Math.max(1.2, R * 0.16));
    const kh = kw * 0.55;
    const t = kw * 0.42;
    const y0 = -R - kh / 2 - t * 0.35;
    cizim.govde = `M${f(-R)} 0A${f(R)} ${f(R)} 0 1 0 ${f(R)} 0A${f(R)} ${f(R)} 0 1 0 ${f(-R)} 0Z`;
    cizim.daire = R;
    cizim.kama = `M${f(-kw / 2)} ${f(-R - kh / 2)}h${f(kw)}v${f(kh)}h${f(-kw)}Z`;
    cizim.isaret = `M${f(-t)} ${f(y0 - t * 1.3)}L${f(t)} ${f(y0 - t * 1.3)}L0 ${f(y0)}Z`;
    sinir = [-R, y0 - t * 1.3, R, R];
  } else if (k.govde === 'dsub') {
    const ys = [...new Set(ks.map((c) => f(c.y)))].sort((a, b) => a - b);
    const enGenis = (y: number) => Math.max(...ks.filter((c) => Math.abs(c.y - y) < 0.01).map((c) => Math.abs(c.x)));
    const pay = rMax + 1.2;
    const yU = ys[0] - pay;
    const yA = ys[ys.length - 1] + pay;
    const egim = Math.tan((10 * Math.PI) / 180); // D-sub yan kenarları 10°
    const h = yA - yU;
    const wU = Math.max(enGenis(ys[0]) + pay, enGenis(ys[ys.length - 1]) + pay + h * egim);
    const wA = wU - h * egim;
    cizim.govde = yuvarlakCokgen(
      [
        [-wU, yU],
        [wU, yU],
        [wA, yA],
        [-wA, yA],
      ],
      [pay * 0.55, pay * 0.55, pay * 0.9, pay * 0.9],
    );
    sinir = [-wU, yU, wU, yA];
  } else {
    const adim = rMax / 0.4;
    const pay = adim * 0.5;
    const x0 = Math.min(...ks.map((c) => c.x)) - pay;
    const x1 = Math.max(...ks.map((c) => c.x)) + pay;
    const y0 = Math.min(...ks.map((c) => c.y)) - pay;
    const y1 = Math.max(...ks.map((c) => c.y)) + pay;
    const rc = adim * 0.12;
    cizim.govde = yuvarlakCokgen(
      [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ],
      [rc, rc, rc, rc],
    );
    const t = adim * 0.26;
    const ilk = ks.find((c) => c.kare);
    let ust = y0;
    if (ilk) {
      cizim.isaret = `M${f(ilk.x - t)} ${f(y0 - t * 1.7)}L${f(ilk.x + t)} ${f(y0 - t * 1.7)}L${f(ilk.x)} ${f(y0 - t * 0.35)}Z`;
      ust = y0 - t * 1.7;
    }
    let sol = x0;
    let sag = x1;
    if (k.adEtiketi) {
      const bosluk = adim * 0.35;
      cizim.adBoyu = f(adim * 0.46);
      const genislik = Math.max(6, adKarakter) * cizim.adBoyu * 0.62;
      for (const c of ks) {
        if (c.anahtar) continue;
        const solda = c.x < -1e-6;
        cizim.adlar.push({id: c.id, x: f(solda ? x0 - bosluk : x1 + bosluk), y: c.y, hiza: solda ? 'end' : 'start'});
        if (solda) sol = x0 - bosluk - genislik;
        else sag = x1 + bosluk + genislik;
      }
    }
    sinir = [sol, ust, sag, y1];
  }

  const [a, b, c, d] = sinir;
  const m = Math.max(c - a, d - b) * 0.04;
  return {...cizim, vb: [f(a - m), f(b - m), f(c - a + 2 * m), f(d - b + 2 * m)]};
}

/* ------------------------------------------------------------------ */
/* Dışa aktarma: bağımsız SVG belgesi                                   */
/* ------------------------------------------------------------------ */

const xml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'})[ch]!);

const SANS = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

/** Yüz çiziminin SVG öğeleri (dış viewBox'a yerleştirilir) */
function yuzOgeleri(c: Cizim, atamalar: Atamalar, p: Palet): string {
  const parca: string[] = [];
  parca.push(`<path d="${c.govde}" fill="${p.zemin}" stroke="${p.cizgi}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`);
  if (c.daire) {
    const e = c.daire * 1.06;
    parca.push(
      `<path d="M${f(-e)} 0H${f(e)}M0 ${f(-e)}V${f(e)}" stroke="${p.soluk}" stroke-width="0.6" stroke-dasharray="4 3" vector-effect="non-scaling-stroke" fill="none"/>`,
    );
  }
  if (c.kama) parca.push(`<path d="${c.kama}" fill="${p.zemin}" stroke="${p.cizgi}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`);
  if (c.isaret) parca.push(`<path d="${c.isaret}" fill="${p.cizgi}"/>`);
  for (const k of c.kontaklar) {
    const a = atamalar[k.id];
    const tur: SinyalTuru = a?.tur ?? 'bos';
    const renk = p[tur];
    const kesik = k.anahtar || tur === 'nc' ? ' stroke-dasharray="3 2"' : '';
    const sekil = k.kare
      ? `<rect x="${f(k.x - k.r)}" y="${f(k.y - k.r)}" width="${f(2 * k.r)}" height="${f(2 * k.r)}" rx="${f(k.r * 0.15)}"`
      : `<circle cx="${f(k.x)}" cy="${f(k.y)}" r="${f(k.r)}"`;
    parca.push(
      `${sekil} fill="${k.anahtar ? p.zemin : renk.dolgu}" stroke="${tur === 'bos' || tur === 'nc' || k.anahtar ? p.cizgi : renk.dolgu}" stroke-width="1" vector-effect="non-scaling-stroke"${kesik}/>`,
    );
    parca.push(
      `<text x="${f(k.x)}" y="${f(k.y)}" font-size="${f(k.yazi)}" font-family="${MONO}" font-weight="600" text-anchor="middle" dominant-baseline="central" fill="${k.anahtar ? p.soluk : renk.yazi}">${xml(k.id)}</text>`,
    );
  }
  for (const ad of c.adlar) {
    const a = atamalar[ad.id];
    if (!a?.ad) continue;
    parca.push(
      `<text x="${f(ad.x)}" y="${f(ad.y)}" font-size="${f(c.adBoyu)}" font-family="${MONO}" text-anchor="${ad.hiza}" dominant-baseline="central" fill="${p.yazi}">${xml(etiketMetni(a.ad, c.adKarakter))}</text>`,
    );
  }
  return parca.join('');
}

export function svgBelgesi(
  c: Cizim,
  k: Konnektor,
  atamalar: Atamalar,
  gorunumAdi: string,
  p: Palet,
): {svg: string; w: number; h: number} {
  const pay = 28;
  const [vx, vy, vw, vh] = c.vb;
  const olcek = Math.min(560 / vw, 620 / vh);
  const dw = vw * olcek;
  const dh = vh * olcek;
  const ust = pay + 56;

  // Atanmış pinlerin listesi (adlar çizimde yazmıyorsa çizimin sağında)
  const satirlar = k.kontaklar.filter((x) => !x.anahtar && (atamalar[x.id]?.ad || (atamalar[x.id]?.tur ?? 'bos') !== 'bos'));
  const liste = !k.adEtiketi && satirlar.length > 0;
  const satirBoy = 17;
  const satirSayisi = Math.max(12, Math.floor(dh / satirBoy));
  const sutunSayisi = liste ? Math.ceil(satirlar.length / satirSayisi) : 0;
  const enUzunAd = Math.max(4, ...satirlar.map((x) => (atamalar[x.id]?.ad ?? '').length));
  const sutunGenislik = Math.min(260, Math.max(150, 46 + enUzunAd * 7.2));
  const listeGenislik = sutunSayisi * sutunGenislik;
  const listeYukseklik = liste ? Math.min(satirlar.length, satirSayisi) * satirBoy : 0;

  // Kullanılan türler (lejant)
  const turler = [...new Set(k.kontaklar.filter((x) => !x.anahtar).map((x) => atamalar[x.id]?.tur ?? 'bos'))];
  const w = Math.max(pay * 2 + dw + (liste ? 32 + listeGenislik : 0), 420);
  let lejantX = pay;
  let lejantY = ust + Math.max(dh, listeYukseklik) + 28;
  const lejant: string[] = [];
  for (const t of turler) {
    const metin = TUR_ADI[t];
    const genislik = 26 + metin.length * 6.6;
    if (lejantX + genislik > w - pay) {
      lejantX = pay;
      lejantY += 20;
    }
    const renk = p[t];
    lejant.push(
      `<rect x="${f(lejantX)}" y="${f(lejantY - 9)}" width="11" height="11" rx="2" fill="${renk.dolgu}" stroke="${t === 'bos' || t === 'nc' ? p.cizgi : renk.dolgu}"/>`,
      `<text x="${f(lejantX + 16)}" y="${f(lejantY)}" font-size="11" font-family="${SANS}" fill="${p.yazi}">${xml(metin)}</text>`,
    );
    lejantX += genislik + 10;
  }
  const h = lejantY + 40 + pay;

  const parca: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(w)}" height="${f(h)}" viewBox="0 0 ${f(w)} ${f(h)}">`,
    `<rect width="100%" height="100%" fill="${p.zemin}"/>`,
    `<text x="${pay}" y="${pay + 14}" font-size="18" font-weight="600" font-family="${SANS}" fill="${p.yazi}">${xml(k.ad)}</text>`,
    `<text x="${pay}" y="${pay + 34}" font-size="12" font-family="${SANS}" fill="${p.soluk}">${xml(`${k.ozet} · ${gorunumAdi}`)}</text>`,
    `<svg x="${f(pay)}" y="${f(ust)}" width="${f(dw)}" height="${f(dh)}" viewBox="${vx} ${vy} ${vw} ${vh}">${yuzOgeleri(c, atamalar, p)}</svg>`,
  ];
  if (liste) {
    satirlar.forEach((x, i) => {
      const sx = pay + dw + 32 + Math.floor(i / satirSayisi) * sutunGenislik;
      const sy = ust + (i % satirSayisi) * satirBoy + 12;
      const a = atamalar[x.id];
      const tur = a?.tur ?? 'bos';
      parca.push(
        `<rect x="${f(sx)}" y="${f(sy - 9)}" width="10" height="10" rx="2" fill="${p[tur].dolgu}" stroke="${tur === 'bos' || tur === 'nc' ? p.cizgi : p[tur].dolgu}"/>`,
        `<text x="${f(sx + 16)}" y="${f(sy)}" font-size="11" font-weight="600" font-family="${MONO}" fill="${p.yazi}">${xml(x.id)}</text>`,
        `<text x="${f(sx + 48)}" y="${f(sy)}" font-size="11" font-family="${MONO}" fill="${p.yazi}">${xml(a?.ad || '—')}</text>`,
      );
    });
  }
  parca.push(...lejant);
  parca.push(
    `<text x="${pay}" y="${f(h - pay)}" font-size="10" font-family="${SANS}" fill="${p.soluk}">${xml(
      `${k.kaynak ? `${k.kaynak} · ` : ''}aviyonikyazilim.com — Konnektör Pin Yerleşimi Tasarımcısı`,
    )}</text>`,
    '</svg>',
  );
  return {svg: parca.join('\n'), w, h};
}
