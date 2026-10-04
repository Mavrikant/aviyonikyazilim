/**
 * MC/DC çözümlemesi. Bir kararın tüm girdi kombinasyonları (doğruluk tablosu satırları)
 * üzerinde, her koşul geçişinin kararı tek başına belirleyip belirlemediğini hesaplar;
 * bağımsızlık çiftlerini, en küçük test setini ve verilen bir test setinin kapsamını bulur.
 *
 * Belirleyicilik (determination): koşulun ağaçtaki yolundaki her VE düğümünde diğer
 * kardeşler doğru, her VEYA düğümünde yanlış ise karar o satırda yalnızca bu koşula bağlıdır.
 *
 * - Benzersiz neden (unique-cause) MC/DC: çiftin satırları yalnızca o koşulda ayrılır ve
 *   karar değişir. Değişkeni birden çok yerde geçen (bağlı) koşullar için gösterilemez.
 * - Maskeleme (masking) MC/DC: iki satırda da koşul belirleyicidir ve değeri farklıdır;
 *   diğer koşullar değişebilir, çünkü ikisinde de kararı etkilemezler (maskelenmişlerdir).
 *
 * Satır numarası, değişkenlerin ilk görülme sırasıyla en anlamlı bitten başlayan ikili
 * sayıdır: üç koşulda satır 0 = 000 (A=0, B=0, C=0), satır 5 = 101.
 */
import type {Ayrisim, Dugum} from './ifade';

export type Olcut = 'benzersiz' | 'maskeleme';

type Duz = {tur: Dugum['tur']; cocuklar: number[]; degisken: number; kisaDevre: boolean};

export type Analiz = {
  /** Değişken sayısı */
  n: number;
  /** Koşul geçişi sayısı */
  m: number;
  satirSayisi: number;
  /** [satır] kararın değeri */
  karar: Uint8Array;
  /** [koşul][satır] koşul bu satırda kararı tek başına belirliyor mu */
  belirleyici: Uint8Array[];
  /** [satır] C kısa devre kurallarıyla değerlendirilen değişkenlerin bit maskesi */
  degerlendirilen: Uint16Array;
  /** [koşul] değişkeni başka bir koşulda da geçiyor */
  bagli: boolean[];
  /** [değişken] satır numarasındaki biti */
  bit: number[];
  /** [koşul] değişkeni */
  degisken: number[];
  /** Karar her girdide aynıysa o değer */
  sabit: 0 | 1 | null;
};

export function analizEt(a: Ayrisim): Analiz {
  // Ağaç ön sırayla düzleştirilir: çocukların numarası ebeveynden büyüktür
  const dugumler: Duz[] = [];
  const ebeveyn: number[] = [];
  const kosulDugumu: number[] = [];
  const ekle = (d: Dugum, e: number): number => {
    const id = dugumler.length;
    const duz: Duz = {tur: d.tur, cocuklar: [], degisken: -1, kisaDevre: false};
    dugumler.push(duz);
    ebeveyn.push(e);
    if (d.tur === 'kosul') {
      duz.degisken = d.degisken;
      kosulDugumu[d.no] = id;
    } else if (d.tur === 'degil') {
      duz.cocuklar.push(ekle(d.alt, id));
    } else {
      duz.kisaDevre = d.kisaDevre;
      for (const alt of d.altlar) duz.cocuklar.push(ekle(alt, id));
    }
    return id;
  };
  ekle(a.kok, -1);

  const n = a.degiskenler.length;
  const m = a.kosullar.length;
  const N = 1 << n;
  const bit = a.degiskenler.map((_, i) => 1 << (n - 1 - i));
  const degisken = a.kosullar.map((k) => k.degisken);
  const tekrar = new Map<number, number>();
  for (const d of degisken) tekrar.set(d, (tekrar.get(d) ?? 0) + 1);
  const bagli = degisken.map((d) => (tekrar.get(d) ?? 0) > 1);

  const karar = new Uint8Array(N);
  const belirleyici = Array.from({length: m}, () => new Uint8Array(N));
  const degerlendirilen = new Uint16Array(N);
  const deger = new Uint8Array(dugumler.length);

  // Kısa devreli değerlendirme: yalnızca okunan değişkenler işaretlenir
  let okunan = 0;
  const kisaDevreli = (id: number, v: number): number => {
    const d = dugumler[id];
    if (d.tur === 'kosul') {
      okunan |= bit[d.degisken];
      return v & bit[d.degisken] ? 1 : 0;
    }
    if (d.tur === 'degil') return kisaDevreli(d.cocuklar[0], v) ^ 1;
    const ve = d.tur === 've';
    let s = ve ? 1 : 0;
    for (const c of d.cocuklar) {
      if (d.kisaDevre && s !== (ve ? 1 : 0)) break;
      const x = kisaDevreli(c, v);
      s = ve ? s & x : s | x;
    }
    return s;
  };

  for (let v = 0; v < N; v++) {
    for (let id = dugumler.length - 1; id >= 0; id--) {
      const d = dugumler[id];
      if (d.tur === 'kosul') deger[id] = v & bit[d.degisken] ? 1 : 0;
      else if (d.tur === 'degil') deger[id] = deger[d.cocuklar[0]] ^ 1;
      else if (d.tur === 've') deger[id] = d.cocuklar.every((c) => deger[c]) ? 1 : 0;
      else deger[id] = d.cocuklar.some((c) => deger[c]) ? 1 : 0;
    }
    karar[v] = deger[0];
    for (let k = 0; k < m; k++) {
      let dugum = kosulDugumu[k];
      let tek = 1;
      while (tek && ebeveyn[dugum] >= 0) {
        const e = dugumler[ebeveyn[dugum]];
        if (e.tur === 've' || e.tur === 'veya') {
          const kontrolsuz = e.tur === 've' ? 1 : 0;
          for (const c of e.cocuklar) {
            if (c !== dugum && deger[c] !== kontrolsuz) {
              tek = 0;
              break;
            }
          }
        }
        dugum = ebeveyn[dugum];
      }
      belirleyici[k][v] = tek;
    }
    okunan = 0;
    kisaDevreli(0, v);
    degerlendirilen[v] = okunan;
  }

  let sabit: 0 | 1 | null = karar[0] as 0 | 1;
  for (let v = 1; v < N; v++) if (karar[v] !== karar[0]) sabit = null;
  return {n, m, satirSayisi: N, karar, belirleyici, degerlendirilen, bagli, bit, degisken, sabit};
}

/** Benzersiz neden çifti: bu satırla yalnızca koşulun değişkeninde ayrılan ve kararı değiştiren satır */
export function benzersizEs(an: Analiz, k: number, v: number): number {
  if (an.bagli[k] || !an.belirleyici[k][v]) return -1;
  return v ^ an.bit[an.degisken[k]];
}

export const kosulDegeri = (an: Analiz, k: number, v: number) => (v & an.bit[an.degisken[k]] ? 1 : 0);

/** Ölçüte göre bağımsızlığı hiçbir test setiyle gösterilemeyen koşulun nedeni */
export function imkansizNedeni(an: Analiz, olcut: Olcut, k: number): string | null {
  if (an.sabit !== null) return 'Karar her girdide aynı sonucu veriyor; hiçbir koşul sonucu değiştiremez.';
  let dogru = false;
  let yanlis = false;
  for (let v = 0; v < an.satirSayisi; v++) {
    if (!an.belirleyici[k][v]) continue;
    if (kosulDegeri(an, k, v)) dogru = true;
    else yanlis = true;
  }
  if (!dogru && !yanlis) {
    return 'Hiçbir girdide kararı tek başına belirlemiyor: mantıkta gereksizlik var, ifade sadeleştirilebilir.';
  }
  if (olcut === 'benzersiz' && an.bagli[k]) {
    return 'Bağlı koşul: aynı değişken başka bir yerde de geçtiği için tek başına değiştirilemez. Maskeleme ölçütünü kullanın.';
  }
  if (!dogru || !yanlis) return 'Belirleyici olduğu girdilerde yalnızca tek bir değer alabiliyor.';
  return null;
}

/* ------------------------------------------------------------------ */
/* En küçük test seti                                                   */
/* ------------------------------------------------------------------ */

export type EnKucukSet = {
  satirlar: number[];
  /** Setin en küçük olduğu kanıtlandı mı (arama sınırına takılmadıysa) */
  kanitlandi: boolean;
};

const ARAMA_SINIRI = 250_000;

function bitSay(x: number): number {
  x -= (x >>> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

/**
 * Her koşulun bir kez geçtiği ifadelerde n+1 testlik benzersiz neden seti doğrudan kurulur:
 * VE düğümünde bir çocuğun testleri diğerlerinin "doğru" vektörüyle, VEYA düğümünde
 * "yanlış" vektörüyle birleştirilir; ortak vektör bir kez sayıldığı için boyut n+1 kalır.
 * n+1, benzersiz neden için alt sınır olduğundan sonuç en küçüktür.
 */
function insa(d: Dugum, bit: number[]): {v: number[]; s: number[]} {
  if (d.tur === 'kosul') return {v: [bit[d.degisken], 0], s: [1, 0]};
  if (d.tur === 'degil') {
    const a = insa(d.alt, bit);
    return {v: a.v, s: a.s.map((x) => x ^ 1)};
  }
  const kontrolsuz = d.tur === 've' ? 1 : 0;
  let acc = insa(d.altlar[0], bit);
  for (let i = 1; i < d.altlar.length; i++) {
    const b = insa(d.altlar[i], bit);
    const ta = acc.v[acc.s.indexOf(kontrolsuz)];
    const tb = b.v[b.s.indexOf(kontrolsuz)];
    const v = acc.v.map((x) => x | tb);
    const s = [...acc.s];
    b.v.forEach((y, j) => {
      const w = ta | y;
      if (!v.includes(w)) {
        v.push(w);
        s.push(b.s[j]);
      }
    });
    acc = {v, s};
  }
  return acc;
}

/** Maskeleme: her koşul için belirleyici satırlardan biri değer 1, biri değer 0 olacak en az satır */
function maskelemeArama(an: Analiz, kosullar: number[], tohum: number[] | null): EnKucukSet {
  const vurus = new Uint32Array(an.satirSayisi);
  kosullar.forEach((k, i) => {
    for (let v = 0; v < an.satirSayisi; v++) {
      if (an.belirleyici[k][v]) vurus[v] |= 1 << (2 * i + (kosulDegeri(an, k, v) ? 0 : 1));
    }
  });
  const TAM = kosullar.length === 15 ? 0x3fffffff : (1 << (2 * kosullar.length)) - 1;
  // Aynı vuruş kümesine sahip satırlar eşdeğerdir; başka bir kümenin alt kümesi olanlar gereksizdir
  const temsil = new Map<number, number>();
  for (let v = 0; v < an.satirSayisi; v++) if (vurus[v] && !temsil.has(vurus[v])) temsil.set(vurus[v], v);
  const tum = [...temsil.keys()].sort((x, y) => bitSay(y) - bitSay(x));
  const maskeler = tum.filter((mk, i) => !tum.some((d, j) => j !== i && (mk & d) === mk && (d !== mk || j < i)));

  // Açgözlü çözüm (üst sınır)
  const acgozlu: number[] = [];
  let kapsanan = 0;
  while (kapsanan !== TAM) {
    let enIyi = maskeler[0];
    for (const mk of maskeler) if (bitSay(mk & ~kapsanan) > bitSay(enIyi & ~kapsanan)) enIyi = mk;
    acgozlu.push(enIyi);
    kapsanan = (kapsanan | enIyi) >>> 0;
  }
  let enIyiSet = acgozlu.map((mk) => temsil.get(mk)!);
  if (tohum && tohum.length < enIyiSet.length) enIyiSet = tohum;

  const enCokVurus = Math.max(...maskeler.map(bitSay));
  const altSinir = Math.max(2, Math.ceil(bitSay(TAM) / enCokVurus));
  let dugum = 0;
  let asildi = false;
  const basarisiz = new Map<number, number>();
  const secim: number[] = [];

  const ara = (kalanAdim: number, kapsandi: number): boolean => {
    if (kapsandi === TAM) return true;
    if (kalanAdim === 0) return false;
    if ((basarisiz.get(kapsandi) ?? -1) >= kalanAdim) return false;
    if (++dugum > ARAMA_SINIRI) {
      asildi = true;
      return false;
    }
    const kalan = (TAM & ~kapsandi) >>> 0;
    let enCok = 0;
    for (const mk of maskeler) enCok = Math.max(enCok, bitSay(mk & kalan));
    if (bitSay(kalan) > kalanAdim * enCok) {
      basarisiz.set(kapsandi, kalanAdim);
      return false;
    }
    // En az adayı olan kapsanmamış kümeden dallan
    let hedef = -1;
    let hedefSayi = Infinity;
    for (let b = 0; b < 30; b++) {
      if (!(kalan & (1 << b))) continue;
      let sayi = 0;
      for (const mk of maskeler) if (mk & (1 << b)) sayi++;
      if (sayi < hedefSayi) {
        hedefSayi = sayi;
        hedef = b;
      }
    }
    const adaylar = maskeler.filter((mk) => mk & (1 << hedef)).sort((x, y) => bitSay(y & kalan) - bitSay(x & kalan));
    for (const mk of adaylar) {
      secim.push(mk);
      if (ara(kalanAdim - 1, (kapsandi | mk) >>> 0)) return true;
      secim.pop();
      if (asildi) return false;
    }
    basarisiz.set(kapsandi, Math.max(kalanAdim, basarisiz.get(kapsandi) ?? -1));
    return false;
  };

  for (let k = altSinir; k < enIyiSet.length; k++) {
    if (ara(k, 0)) {
      enIyiSet = secim.map((mk) => temsil.get(mk)!);
      break;
    }
    if (asildi) break;
  }
  return {satirlar: [...enIyiSet].sort((a, b) => a - b), kanitlandi: !asildi};
}

/** Benzersiz neden, bağlı koşul bulunan ifadelerde: her koşul için bir çift, en az toplam satır */
function benzersizArama(an: Analiz, kosullar: number[]): EnKucukSet {
  const kenarlar = kosullar.map((k) => {
    const b = an.bit[an.degisken[k]];
    const e: [number, number][] = [];
    for (let v = 0; v < an.satirSayisi; v++) if (an.belirleyici[k][v] && !(v & b)) e.push([v, v | b]);
    return e;
  });
  const secili = new Uint8Array(an.satirSayisi);
  let sayi = 0;
  const kapsandi = (i: number) => kenarlar[i].some(([a, b]) => secili[a] && secili[b]);

  // Açgözlü çözüm
  for (let i = 0; i < kosullar.length; i++) {
    if (kapsandi(i)) continue;
    let enIyi = kenarlar[i][0];
    let enAz = 3;
    for (const e of kenarlar[i]) {
      const maliyet = (secili[e[0]] ? 0 : 1) + (secili[e[1]] ? 0 : 1);
      if (maliyet < enAz) {
        enAz = maliyet;
        enIyi = e;
      }
    }
    for (const r of enIyi) secili[r] = 1;
  }
  let enIyiSet: number[] = [];
  secili.forEach((x, r) => x && enIyiSet.push(r));
  secili.fill(0);

  let dugum = 0;
  let asildi = false;
  const ara = (sinir: number): boolean => {
    let hedef = -1;
    let hedefSayi = Infinity;
    for (let i = 0; i < kosullar.length; i++) {
      if (!kapsandi(i) && kenarlar[i].length < hedefSayi) {
        hedefSayi = kenarlar[i].length;
        hedef = i;
      }
    }
    if (hedef < 0) return true;
    if (sayi >= sinir) return false;
    const adaylar = kenarlar[hedef]
      .map((e) => ({e, maliyet: (secili[e[0]] ? 0 : 1) + (secili[e[1]] ? 0 : 1)}))
      .sort((x, y) => x.maliyet - y.maliyet);
    for (const {e, maliyet} of adaylar) {
      if (sayi + maliyet > sinir) continue;
      if (++dugum > ARAMA_SINIRI) {
        asildi = true;
        return false;
      }
      const eklenen: number[] = [];
      for (const r of e) {
        if (!secili[r]) {
          secili[r] = 1;
          eklenen.push(r);
          sayi++;
        }
      }
      if (ara(sinir)) return true;
      for (const r of eklenen) secili[r] = 0;
      sayi -= eklenen.length;
      if (asildi) return false;
    }
    return false;
  };
  // Değişkenleri farklı k koşulun çiftleri en az k+1 satır gerektirir
  for (let s = kosullar.length + 1; s < enIyiSet.length; s++) {
    if (ara(s)) {
      enIyiSet = [];
      secili.forEach((x, r) => x && enIyiSet.push(r));
      break;
    }
    if (asildi) break;
    secili.fill(0);
    sayi = 0;
  }
  return {satirlar: enIyiSet.sort((a, b) => a - b), kanitlandi: !asildi};
}

export function enKucukSet(an: Analiz, a: Ayrisim, olcut: Olcut): EnKucukSet {
  const kosullar = Array.from({length: an.m}, (_, k) => k).filter((k) => imkansizNedeni(an, olcut, k) === null);
  if (kosullar.length === 0) return {satirlar: [], kanitlandi: true};
  const tekGecisli = an.bagli.every((b) => !b);
  const insaEdilen = tekGecisli ? insa(a.kok, an.bit).v.sort((x, y) => x - y) : null;
  if (olcut === 'benzersiz') {
    return insaEdilen ? {satirlar: insaEdilen, kanitlandi: true} : benzersizArama(an, kosullar);
  }
  return maskelemeArama(an, kosullar, insaEdilen);
}

/* ------------------------------------------------------------------ */
/* Verilen test setinin kapsamı                                         */
/* ------------------------------------------------------------------ */

export type KosulDurumu = {
  durum: 'tamam' | 'eksik' | 'imkansiz';
  /** Bağımsızlığı gösteren satır çifti */
  cift?: [number, number];
  /** Eksikse eklenmesi önerilen satırlar */
  oneri?: number[];
  neden?: string;
};

export type Kapsam = {
  kosullar: KosulDurumu[];
  /** Karar hem doğru hem yanlış sonuçlandı mı */
  kararDogru: boolean;
  kararYanlis: boolean;
  /** [değişken] iki değeri de aldı mı */
  kosulKapsama: boolean[];
  mcdc: boolean;
};

export function kapsamHesapla(an: Analiz, olcut: Olcut, secim: number[]): Kapsam {
  const kume = new Set(secim);
  const kosullar: KosulDurumu[] = [];
  for (let k = 0; k < an.m; k++) {
    const neden = imkansizNedeni(an, olcut, k);
    if (neden) {
      kosullar.push({durum: 'imkansiz', neden});
      continue;
    }
    if (olcut === 'benzersiz') {
      let durum: KosulDurumu | null = null;
      let yarim = -1;
      for (const v of secim) {
        const es = benzersizEs(an, k, v);
        if (es < 0) continue;
        if (kume.has(es)) {
          durum = {durum: 'tamam', cift: v < es ? [v, es] : [es, v]};
          break;
        }
        if (yarim < 0) yarim = es;
      }
      if (!durum) {
        let oneri: number[] = [];
        if (yarim >= 0) oneri = [yarim];
        else {
          for (let v = 0; v < an.satirSayisi && !oneri.length; v++) {
            const es = benzersizEs(an, k, v);
            if (es > v) oneri = [v, es];
          }
        }
        durum = {durum: 'eksik', oneri};
      }
      kosullar.push(durum);
    } else {
      const birli = secim.find((v) => an.belirleyici[k][v] && kosulDegeri(an, k, v) === 1);
      const sifirli = secim.find((v) => an.belirleyici[k][v] && kosulDegeri(an, k, v) === 0);
      if (birli !== undefined && sifirli !== undefined) {
        kosullar.push({durum: 'tamam', cift: birli < sifirli ? [birli, sifirli] : [sifirli, birli]});
        continue;
      }
      const ilk = (deger: number) => {
        for (let v = 0; v < an.satirSayisi; v++) if (an.belirleyici[k][v] && kosulDegeri(an, k, v) === deger) return v;
        return -1;
      };
      const oneri: number[] = [];
      if (birli === undefined) oneri.push(ilk(1));
      if (sifirli === undefined) oneri.push(ilk(0));
      kosullar.push({durum: 'eksik', oneri: oneri.sort((a, b) => a - b)});
    }
  }
  const kararDogru = secim.some((v) => an.karar[v] === 1);
  const kararYanlis = secim.some((v) => an.karar[v] === 0);
  const kosulKapsama = an.bit.map((b) => secim.some((v) => v & b) && secim.some((v) => !(v & b)));
  const mcdc = kosullar.every((d) => d.durum === 'tamam') && kararDogru && kararYanlis;
  return {kosullar, kararDogru, kararYanlis, kosulKapsama, mcdc};
}
