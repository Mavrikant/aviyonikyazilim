/**
 * Görev çizelgeleme: tek işlemci çekirdeğinde periyodik görev kümesi için
 * çizelgelenebilirlik analizi, benzetim ve döngüsel yürütücü çerçeve tasarımı.
 *
 * Girdiler milisaniyedir; hesap tam sayı mikrosaniyeyle yapılır (kayan nokta
 * yuvarlaması tavan/taban işlemlerini bozmasın diye).
 *
 * Sabit öncelik (hız-monoton, zaman sınırı-monoton, elle):
 *   - kesintili: en kötü tepki süresi, seviye-i meşgul dönemindeki her iş için
 *     w = (q+1)·C + B + Σ_yö ⌈w/T⌉·C sabit noktasıyla bulunur (D > T de desteklenir),
 *   - kesintisiz: engelleme, daha düşük öncelikli en uzun görevin süresidir;
 *     w = B + q·C + Σ_yö (⌊w/T⌋ + 1)·C, tepki = w + C − q·T.
 * EDF (kesintili): D ≥ T ise U ≤ 1 yeterli ve gereklidir; değilse işlemci talep ölçütü
 *   (her mutlak zaman sınırında talep ≤ süre) sınanır.
 * Döngüsel yürütücü: küçük çerçeve adayları (f ≥ en uzun süre, f ana çerçeveyi böler,
 *   2f − obeb(T, f) ≤ D) bulunur ve işler çerçevelere bölünmeden yerleştirilir.
 *
 * Analiz çıkış anlarından (faz) bağımsız en kötü durumu verir; benzetim ise girilen
 * fazlarla gerçek çizelgeyi çıkarır. İkisi bu yüzden ayrı sütunlarda gösterilir.
 */

export type Politika = 'rm' | 'dm' | 'elle' | 'edf' | 'dongusel';

export type Ayarlar = {
  politika: Politika;
  /** Kesintili (preemptive) çizelgeleme; döngüsel yürütücüde kullanılmaz */
  kesintili: boolean;
  /** Döngüsel yürütücüde küçük çerçeve (ms); 0 = uygun adaylardan seç */
  cerceve: number;
};

export type Gorev = {
  id: string;
  ad: string;
  /** Periyot T (ms) */
  periyot: number;
  /** En kötü durum yürütme süresi C (ms) */
  sure: number;
  /** Göreli zaman sınırı D (ms) */
  sinir: number;
  /** İlk çıkış anı (ms) */
  faz: number;
  /** Kritik kesitten gelen engellenme süresi B (ms); yalnızca kesintili sabit öncelikte kullanılır */
  engel: number;
};

export type Durum = 'gecti' | 'kaldi' | 'belirsiz';
export type Test = {ad: string; durum: Durum; aciklama: string};
export type Karar = 'uygun' | 'kacan' | 'asiri';

export type GorevSonucu = {
  id: string;
  /** Sabit öncelik sırası (1 = en yüksek) */
  oncelik?: number;
  /** C / T */
  kullanim: number;
  /** Analizle bulunan en kötü tepki süresi (µs); Infinity = sınırsız */
  tepkiAnaliz?: number;
  /** Benzetimde gözlenen en uzun ve en kısa tepki süresi (µs) */
  tepkiBenzetim?: number;
  enKisaTepki?: number;
  /** Benzetimde kesintiye uğrama sayısı */
  kesilme: number;
  isSayisi: number;
  /** Benzetimde zaman sınırını kaçıran iş sayısı */
  kacan: number;
  uygun: boolean;
  /** Zaman sınırı − en kötü tepki (µs): analiz varsa analize, yoksa benzetime göre */
  pay?: number;
  /** Diğer görevler sabitken çizelgelenebilir kalan en büyük süre (µs) */
  enFazlaSure?: number;
};

export type Parca = {id: string; is: number; bas: number; bit: number; gec?: boolean};
export type Kacan = {id: string; is: number; t: number};

export type CerceveAdayi = {f: number; uygun: boolean; neden?: string};
export type Cerceve = {bas: number; isler: {id: string; is: number; sure: number}[]; bos: number};
export type CerceveSonucu = {
  adaylar: CerceveAdayi[];
  /** Kullanılan küçük çerçeve (µs); 0 = uygun aday yok */
  secili: number;
  /** Ana çerçeve = hiperperiyot (µs) */
  anaCerceve: number;
  cerceveler: Cerceve[];
  yerlesmeyen: {id: string; is: number}[];
};

export type Sonuc = {
  /** Toplam kullanım U = Σ C/T */
  kullanim: number;
  hiperperiyot: number;
  /** Hiperperiyot sınırda kesilmedi */
  tamHiperperiyot: boolean;
  /** Benzetim süresi (µs) ve tekrarlayan çizelgenin tamamını kapsayıp kapsamadığı */
  pencere: number;
  tamPencere: boolean;
  /** Benzetimde işlemcinin boşta kaldığı oran (0–1) */
  bosta: number;
  karar: Karar;
  testler: Test[];
  gorevler: GorevSonucu[];
  /** Zaman çizelgesi: ilk cizelgePencere µs içindeki yürütme parçaları */
  parcalar: Parca[];
  kacanlar: Kacan[];
  cizelgePencere: number;
  cerceve?: CerceveSonucu;
};

export const MAKS_GOREV = 16;

const MAKS_HIPER = 60_000_000; // 60 s (µs)
const MAKS_IS = 20_000; // benzetimdeki iş sayısı
const MAKS_PARCA = 3_000; // çizelgede gösterilen yürütme parçası
const MAKS_KACAN = 300;
const MAKS_CERCEVE = 2_000;
const UFUK = 1e12; // sabit nokta yinelemesinde ıraksama eşiği (µs)

/** İç gösterim: süreler tam sayı µs, sira tablo sırası */
type G = {id: string; ad: string; T: number; C: number; D: number; O: number; B: number; sira: number};

const us = (ms: number) => Math.round(ms * 1000);
const obeb = (x: number, y: number): number => (y === 0 ? x : obeb(y, x % y));
const topla = <T>(liste: T[], f: (x: T) => number) => liste.reduce((s, x) => s + f(x), 0);

function hiperperiyot(periyotlar: number[]): {H: number; tam: boolean} {
  let l = 1;
  for (const p of periyotlar) {
    l = (l / obeb(l, p)) * p;
    if (l > MAKS_HIPER) return {H: MAKS_HIPER, tam: false};
  }
  return {H: l, tam: true};
}

// Sabit nokta yinelemelerinin toplam adım bütçesi: kullanım 1'e çok yakın, periyotları
// uyumsuz kümelerde meşgul dönem çok uzar; arayüz donmasın diye hesap sınırda bırakılır.
let butce = 0;
/** Bir hesap sınırda bırakıldı: sonuç "sınırsız" değil "bilinmiyor" sayılmalı */
let sinirda = false;

/** w = f(w) en küçük sabit noktası; ıraksarsa Infinity (sınırda bırakılırsa `sinirda` işaretlenir) */
function sabitNokta(f: (w: number) => number, w0: number): number {
  let w = w0;
  for (let adim = 0; adim < 50_000 && butce-- > 0; adim++) {
    const y = f(w);
    if (y === w) return w;
    if (y > UFUK) return Infinity;
    w = y;
  }
  sinirda = true;
  return Infinity;
}

/** Öncelik sırası: dizinin başı en yüksek öncelik */
function oncelikSirasi(gs: G[], politika: Politika): G[] {
  const s = [...gs];
  if (politika === 'rm') s.sort((x, y) => x.T - y.T || x.sira - y.sira);
  else if (politika === 'dm') s.sort((x, y) => x.D - y.D || x.sira - y.sira);
  else s.sort((x, y) => x.sira - y.sira);
  return s;
}

/** Kesintili sabit öncelikte s[i] görevinin en kötü tepki süresi */
function tepkiKesintili(i: number, s: G[]): number {
  const g = s[i];
  const yo = s.slice(0, i); // yüksek öncelikliler
  // Kendisi ve üstündekiler işlemciyi aşıyorsa meşgul dönem hiç bitmez
  if (topla(yo, (j) => j.C / j.T) + g.C / g.T > 1 + 1e-9) return Infinity;
  let R = 0;
  for (let q = 0; q < MAKS_IS; q++) {
    const taban = (q + 1) * g.C + g.B;
    const w = sabitNokta((x) => taban + topla(yo, (j) => Math.ceil(x / j.T) * j.C), taban);
    if (!Number.isFinite(w)) return Infinity;
    R = Math.max(R, w - q * g.T);
    // Meşgul dönem bu işle bitti: sonraki iş çıkmadan önce tamamlandı
    if (w <= (q + 1) * g.T) return R;
  }
  sinirda = true;
  return Infinity;
}

/** Kesintisiz sabit öncelikte s[i] görevinin en kötü tepki süresi */
function tepkiKesintisiz(i: number, s: G[]): number {
  const g = s[i];
  const yo = s.slice(0, i);
  // Başlamış bir iş kesilemez: daha düşük öncelikli en uzun iş bir kez engeller
  const B = s.slice(i + 1).reduce((m, k) => Math.max(m, k.C), 0);
  if (topla([...yo, g], (j) => j.C / j.T) > 1 + 1e-9) return Infinity;
  const L = sabitNokta(
    (x) => B + topla([...yo, g], (j) => Math.ceil(x / j.T) * j.C),
    B + topla(yo, (j) => j.C) + g.C,
  );
  if (!Number.isFinite(L)) return Infinity;
  const Q = Math.ceil(L / g.T);
  if (Q > MAKS_IS) {
    sinirda = true;
    return Infinity;
  }
  let R = 0;
  for (let q = 0; q < Q; q++) {
    const taban = B + q * g.C;
    // w: işin başlayabildiği an; tam o anda çıkan yüksek öncelikli iş de öne geçer
    const w = sabitNokta((x) => taban + topla(yo, (j) => (Math.floor(x / j.T) + 1) * j.C), taban);
    if (!Number.isFinite(w)) return Infinity;
    R = Math.max(R, w + g.C - q * g.T);
  }
  return R;
}

const tepkiler = (s: G[], kesintili: boolean) =>
  s.map((_, i) => (kesintili ? tepkiKesintili(i, s) : tepkiKesintisiz(i, s)));

type TalepSonucu = {durum: Durum; an?: number; talep?: number; yalnizKullanim?: boolean};

/** Kesintili EDF için işlemci talep ölçütü (eşzamanlı çıkış varsayımıyla) */
function edfTalep(gs: G[], maksNokta: number): TalepSonucu {
  const U = topla(gs, (g) => g.C / g.T);
  if (U > 1 + 1e-9) return {durum: 'kaldi'};
  if (gs.every((g) => g.D >= g.T)) return {durum: 'gecti', yalnizKullanim: true};
  // Sınanacak aralığın üst sınırı: eşzamanlı meşgul dönem ve (U < 1 ise) La
  let L = sabitNokta((x) => topla(gs, (g) => Math.ceil(x / g.T) * g.C), topla(gs, (g) => g.C));
  if (U < 1 - 1e-9) {
    const la = topla(gs, (g) => (g.T - g.D) * (g.C / g.T)) / (1 - U);
    L = Math.min(L, Math.max(...gs.map((g) => g.D), la));
  }
  if (!Number.isFinite(L) || topla(gs, (g) => L / g.T) > maksNokta) {
    sinirda = true;
    return {durum: 'belirsiz'};
  }
  const anlar = new Set<number>();
  for (const g of gs) for (let t = g.D; t <= L; t += g.T) anlar.add(t);
  for (const t of [...anlar].sort((x, y) => x - y)) {
    const talep = topla(gs, (g) => Math.max(0, Math.floor((t - g.D) / g.T) + 1) * g.C);
    if (talep > t) return {durum: 'kaldi', an: t, talep};
  }
  return {durum: 'gecti'};
}

type Is = {g: number; is: number; cikis: number; sinirAni: number; kalan: number};
type Istatistik = {enUzun: number; enKisa: number; kesilme: number; is: number; kacan: number};
type Benzetim = {
  st: Istatistik[];
  parcalar: Parca[];
  kacanlar: Kacan[];
  mesgul: number;
  cizelgePencere: number;
};

/**
 * Olay güdümlü benzetim: her çıkışta ve bitişte hazır işlerin en önceliklisi seçilir.
 * `once(x, y) < 0` ise x daha önceliklidir. Zaman sınırını kaçıran iş atılmaz, bitene
 * kadar çalışır (sınırdan sonraki kısmı `gec` işaretlenir).
 */
function benzet(gs: G[], once: (x: Is, y: Is) => number, kesintili: boolean, ufuk: number): Benzetim {
  const sonraki = gs.map((g) => g.O);
  const sayac = gs.map(() => 0);
  const st: Istatistik[] = gs.map(() => ({enUzun: 0, enKisa: Infinity, kesilme: 0, is: 0, kacan: 0}));
  const hazir: Is[] = [];
  const parcalar: Parca[] = [];
  const kacanlar: Kacan[] = [];
  let cizelgePencere = ufuk;
  let calisan: Is | null = null;
  let mesgul = 0;
  let t = 0;

  const kacir = (is: Is) => {
    st[is.g].kacan++;
    if (kacanlar.length < MAKS_KACAN) kacanlar.push({id: gs[is.g].id, is: is.is, t: is.sinirAni});
  };
  const parcaEkle = (is: Is, bas: number, bit: number, gec: boolean) => {
    if (bit <= bas || bas >= cizelgePencere) return;
    const son = parcalar[parcalar.length - 1];
    const id = gs[is.g].id;
    if (son && son.id === id && son.is === is.is && son.bit === bas && !!son.gec === gec) son.bit = bit;
    else if (parcalar.length >= MAKS_PARCA) cizelgePencere = bas;
    else parcalar.push(gec ? {id, is: is.is, bas, bit, gec} : {id, is: is.is, bas, bit});
  };

  for (let adim = 0; t < ufuk && adim < 8 * MAKS_IS; adim++) {
    for (let i = 0; i < gs.length; i++) {
      while (sonraki[i] <= t && sonraki[i] < ufuk) {
        hazir.push({g: i, is: sayac[i]++, cikis: sonraki[i], sinirAni: sonraki[i] + gs[i].D, kalan: gs[i].C});
        sonraki[i] += gs[i].T;
      }
    }
    const siradakiCikis = Math.min(...sonraki.map((x) => (x < ufuk ? x : Infinity)));
    if (hazir.length === 0) {
      if (!Number.isFinite(siradakiCikis)) break;
      t = siradakiCikis;
      continue;
    }
    // Kuyruk sürekli büyüyorsa (aşırı yük) benzetimi sürdürmenin anlamı yok
    if (hazir.length > 4 * MAKS_GOREV + 64) break;

    let sec: Is = calisan && !kesintili ? calisan : hazir[0];
    if (kesintili || !calisan) {
      for (const is of hazir) {
        const fark = once(is, sec);
        // Eşitlikte çalışmakta olan iş sürer (gereksiz kesinti olmasın)
        if (fark < 0 || (fark === 0 && is === calisan)) sec = is;
      }
    }
    if (calisan && sec !== calisan) st[calisan.g].kesilme++;

    const bit = kesintili ? Math.min(t + sec.kalan, siradakiCikis) : t + sec.kalan;
    const sinir = sec.sinirAni;
    parcaEkle(sec, t, Math.min(bit, Math.max(t, sinir)), false);
    parcaEkle(sec, Math.max(t, sinir), bit, true);
    mesgul += Math.max(0, Math.min(bit, ufuk) - t);
    sec.kalan -= bit - t;
    t = bit;

    if (sec.kalan === 0) {
      hazir.splice(hazir.indexOf(sec), 1);
      const s = st[sec.g];
      const tepki = t - sec.cikis;
      s.is++;
      s.enUzun = Math.max(s.enUzun, tepki);
      s.enKisa = Math.min(s.enKisa, tepki);
      if (t > sinir) kacir(sec);
      calisan = null;
    } else {
      calisan = sec;
    }
  }
  // Pencere sonunda bitmemiş ve zaman sınırı geçmiş işler de kaçmıştır
  for (const is of hazir) if (is.sinirAni <= Math.min(t, ufuk)) kacir(is);
  return {st, parcalar, kacanlar, mesgul, cizelgePencere: Math.min(cizelgePencere, ufuk)};
}

/** n'nin bölenleri, küçükten büyüğe */
function bolenler(n: number): number[] {
  const kucuk: number[] = [];
  const buyuk: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d !== 0) continue;
    kucuk.push(d);
    if (d * d !== n) buyuk.unshift(n / d);
  }
  return [...kucuk, ...buyuk];
}

type Yerlesim = {cerceveler: Cerceve[]; yerlesmeyen: {id: string; is: number}[]};

/**
 * İşleri çerçevelere bölmeden yerleştirir: bir iş, çıkışından sonra başlayıp zaman
 * sınırından önce biten bir çerçeveye girebilir. Çerçeveler sırayla, zaman sınırı en
 * yakın işten başlanarak doldurulur (sezgisel; en iyi çözümü garanti etmez).
 */
function yerlestir(gs: G[], H: number, f: number): Yerlesim {
  const isler = gs
    .flatMap((g) =>
      Array.from({length: H / g.T}, (_, k) => ({g, is: k, r: k * g.T, d: k * g.T + Math.min(g.D, g.T), bitti: false})),
    )
    .sort((x, y) => x.d - y.d || x.r - y.r || x.g.sira - y.g.sira);
  const cerceveler: Cerceve[] = [];
  for (let bas = 0; bas < H; bas += f) {
    const cerceve: Cerceve = {bas, isler: [], bos: f};
    for (const is of isler) {
      if (is.bitti || is.r > bas || is.d < bas + f || is.g.C > cerceve.bos) continue;
      is.bitti = true;
      cerceve.isler.push({id: is.g.id, is: is.is, sure: is.g.C});
      cerceve.bos -= is.g.C;
    }
    cerceveler.push(cerceve);
  }
  return {cerceveler, yerlesmeyen: isler.filter((x) => !x.bitti).map((x) => ({id: x.g.id, is: x.is}))};
}

function cerceveTasarla(gs: G[], H: number, istenen: number): CerceveSonucu & {yerlesim?: Yerlesim} {
  const enUzun = gs.reduce((m, g) => (g.C > m.C ? g : m));
  const enKisaSinir = Math.min(...gs.map((g) => Math.min(g.D, g.T)));
  const isSayisi = topla(gs, (g) => H / g.T);
  const adaylar: CerceveAdayi[] = bolenler(H)
    .filter((f) => H / f <= MAKS_CERCEVE && (H / f) * isSayisi <= 2_000_000)
    .map((f) => {
      if (f < enUzun.C) return {f, uygun: false, neden: `en uzun görevden (${enUzun.ad}) kısa`};
      const dar = gs.find((g) => 2 * f - obeb(g.T, f) > Math.min(g.D, g.T));
      if (dar) return {f, uygun: false, neden: `${dar.ad}: çıkışı ile zaman sınırı arasına tam bir çerçeve sığmıyor`};
      return {f, uygun: true};
    });
  const uygunlar = adaylar.filter((x) => x.uygun).map((x) => x.f).reverse();
  // Gösterilecek adaylar: uygun olanlar ve onlara en yakın birkaç uygun olmayan
  const gosterilen = adaylar.filter((x) => x.uygun || (x.f >= enUzun.C / 4 && x.f <= 4 * enKisaSinir)).slice(-14);

  let secili = uygunlar.includes(istenen) ? istenen : 0;
  let yerlesim: Yerlesim | undefined;
  if (secili) yerlesim = yerlestir(gs, H, secili);
  else {
    // En büyük uygun çerçeveden başlayıp tüm işleri yerleştirebilen ilk aday
    for (const f of uygunlar.slice(0, 8)) {
      const y = yerlestir(gs, H, f);
      if (!yerlesim) [secili, yerlesim] = [f, y];
      if (y.yerlesmeyen.length === 0) {
        [secili, yerlesim] = [f, y];
        break;
      }
    }
  }
  return {
    adaylar: gosterilen,
    secili,
    anaCerceve: H,
    cerceveler: yerlesim?.cerceveler ?? [],
    yerlesmeyen: yerlesim?.yerlesmeyen ?? [],
    yerlesim,
  };
}

/** Çerçeve tablosunu zaman çizelgesine ve görev istatistiklerine açar */
function tabloyuAc(gs: G[], y: Yerlesim): Benzetim {
  const st: Istatistik[] = gs.map(() => ({enUzun: 0, enKisa: Infinity, kesilme: 0, is: 0, kacan: 0}));
  const indeks = new Map(gs.map((g, i) => [g.id, i]));
  const parcalar: Parca[] = [];
  let mesgul = 0;
  for (const c of y.cerceveler) {
    let t = c.bas;
    for (const is of c.isler) {
      const i = indeks.get(is.id)!;
      if (parcalar.length < MAKS_PARCA) parcalar.push({id: is.id, is: is.is, bas: t, bit: t + is.sure});
      t += is.sure;
      mesgul += is.sure;
      const tepki = t - is.is * gs[i].T;
      st[i].is++;
      st[i].enUzun = Math.max(st[i].enUzun, tepki);
      st[i].enKisa = Math.min(st[i].enKisa, tepki);
    }
  }
  const kacanlar: Kacan[] = [];
  for (const k of y.yerlesmeyen) {
    const i = indeks.get(k.id)!;
    st[i].kacan++;
    if (kacanlar.length < MAKS_KACAN) kacanlar.push({id: k.id, is: k.is, t: k.is * gs[i].T + Math.min(gs[i].D, gs[i].T)});
  }
  const son = parcalar[parcalar.length - 1];
  const tam = parcalar.length < MAKS_PARCA;
  return {st, parcalar, kacanlar, mesgul, cizelgePencere: tam || !son ? Infinity : son.bit};
}

/** Diğerleri sabitken i. görevin, `uygunMu` sağlanarak alabileceği en büyük süre (µs) */
function enFazlaSure(gs: G[], i: number, uygunMu: (liste: G[]) => boolean): number | undefined {
  const g = gs[i];
  const digerU = topla(gs, (x) => (x === g ? 0 : x.C / x.T));
  const dene = (c: number) => uygunMu(gs.map((x) => (x === g ? {...x, C: c} : x)));
  let alt = g.C;
  let ust = Math.floor(Math.min(g.D, g.T * (1 - digerU)) + 1e-6);
  sinirda = false;
  while (alt < ust) {
    const orta = Math.ceil((alt + ust) / 2);
    if (dene(orta)) alt = orta;
    else ust = orta - 1;
    // Sınırda bırakılan bir deneme "uygun değil" sayılır; bulunan değer yanıltıcı olur
    if (sinirda) return undefined;
  }
  return alt;
}

const nf = (d: number) => new Intl.NumberFormat('tr-TR', {maximumFractionDigits: d});
export const yuzdeYaz = (v: number) => `%${nf(1).format(v * 100)}`;

/** µs → okunur süre: 840 µs, 12,5 ms, 1,25 s; eksi değerler (aşılan pay) eksi işaretiyle */
export function sureYaz(u: number): string {
  if (!Number.isFinite(u)) return 'sınırsız';
  const m = Math.abs(u);
  if (m === 0) return '0';
  const isaret = u < 0 ? '−' : '';
  if (m < 1000) return `${isaret}${nf(0).format(m)} µs`;
  if (m < 1e6) return `${isaret}${nf(3).format(m / 1000)} ms`;
  return `${isaret}${nf(6).format(m / 1e6)} s`;
}

export function hesapla(a: Ayarlar, gorevler: Gorev[]): Sonuc {
  const gs: G[] = gorevler
    .map((g, sira) => ({
      id: g.id,
      ad: g.ad,
      T: us(g.periyot),
      C: us(g.sure),
      D: us(g.sinir),
      O: Math.max(0, us(g.faz)),
      B: a.politika !== 'edf' && a.politika !== 'dongusel' && a.kesintili ? Math.max(0, us(g.engel)) : 0,
      sira,
    }))
    .filter((g) => g.T > 0 && g.C > 0 && g.D > 0)
    .slice(0, MAKS_GOREV);

  if (gs.length === 0) {
    return {
      kullanim: 0,
      hiperperiyot: 0,
      tamHiperperiyot: true,
      pencere: 0,
      tamPencere: true,
      bosta: 1,
      karar: 'uygun',
      testler: [],
      gorevler: [],
      parcalar: [],
      kacanlar: [],
      cizelgePencere: 0,
    };
  }

  butce = 400_000;
  sinirda = false;
  const U = topla(gs, (g) => g.C / g.T);
  const asiri = U > 1 + 1e-9;
  const {H, tam} = hiperperiyot(gs.map((g) => g.T));
  const dongusel = a.politika === 'dongusel';
  const sabit = a.politika === 'rm' || a.politika === 'dm' || a.politika === 'elle';

  const testler: Test[] = [
    {
      ad: 'Kullanım',
      durum: asiri ? 'kaldi' : 'gecti',
      aciklama: `U = ${yuzdeYaz(U)}${asiri ? '; tek çekirdek %100’den fazla iş yapamaz' : '; gerekli koşul (U ≤ %100) sağlanıyor'}`,
    },
  ];

  // ---------- Benzetim penceresi ----------
  const fazli = !dongusel && gs.some((g) => g.O > 0);
  const enUzunFaz = dongusel ? 0 : Math.max(...gs.map((g) => g.O));
  // Fazlı kümede çizelge en geç (en büyük faz + 2 hiperperiyot) sonra tekrarlar
  const tamUfuk = tam ? (fazli ? enUzunFaz + 2 * H : H) : MAKS_HIPER;
  const siklik = topla(gs, (g) => 1 / g.T);
  const ufuk = Math.max(Math.min(tamUfuk, Math.floor(MAKS_IS / siklik)), Math.max(...gs.map((g) => g.T)) + enUzunFaz);
  const tamPencere = tam && ufuk >= tamUfuk;

  // ---------- Politika ----------
  const sirali = oncelikSirasi(gs, a.politika);
  const rutbe = new Map(sirali.map((g, i) => [g.id, i]));
  let analiz: Map<string, number> | undefined;
  let analizUygun: boolean | undefined; // undefined: biçimsel karar yok, benzetime bakılır
  let uygunMu: ((liste: G[]) => boolean) | undefined;
  let benzetim: Benzetim;
  let cerceve: CerceveSonucu | undefined;

  if (dongusel) {
    if (!tam) {
      testler.push({
        ad: 'Çerçeve koşulları',
        durum: 'kaldi',
        aciklama: 'Periyotların ortak katı çok uzun; döngüsel yürütücü için periyotları birbirinin katı seçin',
      });
      benzetim = tabloyuAc(gs, {cerceveler: [], yerlesmeyen: []});
      analizUygun = false;
    } else {
      const {yerlesim, ...tasarim} = cerceveTasarla(gs, H, us(a.cerceve));
      cerceve = tasarim;
      const uygunSayisi = tasarim.adaylar.filter((x) => x.uygun).length;
      testler.push({
        ad: 'Çerçeve koşulları',
        durum: tasarim.secili ? 'gecti' : 'kaldi',
        aciklama: tasarim.secili
          ? `${uygunSayisi} uygun küçük çerçeve; kullanılan ${sureYaz(tasarim.secili)}`
          : 'Koşulları sağlayan küçük çerçeve yok; uzun görevi bölmek ya da periyotları uyumlu seçmek gerekir',
      });
      if (tasarim.secili) {
        testler.push({
          ad: 'Yerleştirme',
          durum: tasarim.yerlesmeyen.length === 0 ? 'gecti' : 'kaldi',
          aciklama:
            tasarim.yerlesmeyen.length === 0
              ? `Tüm işler ${tasarim.cerceveler.length} çerçeveye bölünmeden yerleşti`
              : `${tasarim.yerlesmeyen.length} iş hiçbir çerçeveye sığmadı; başka bir çerçeve deneyin ya da görevi bölün`,
        });
      }
      benzetim = tabloyuAc(gs, yerlesim ?? {cerceveler: [], yerlesmeyen: []});
      analizUygun = tasarim.secili > 0 && tasarim.yerlesmeyen.length === 0;
      // Tablo statiktir: tepki süreleri gözlem değil, kesin değerdir
      if (analizUygun) analiz = new Map(gs.map((g, i) => [g.id, benzetim.st[i].enUzun]));
    }
  } else if (sabit) {
    const R = tepkiler(sirali, a.kesintili);
    const asanlar = sirali.filter((g, i) => R[i] > g.D);
    // Hesap sınırda bırakıldıysa "sınırsız" sonucu güvenilir değildir; karar benzetime kalır
    const yarim = sinirda;
    if (!yarim) analiz = new Map(sirali.map((g, i) => [g.id, R[i]]));
    analizUygun = yarim ? undefined : asanlar.length === 0;
    uygunMu = (liste) => {
      const s = oncelikSirasi(liste, a.politika);
      return s.every((g, i) => (a.kesintili ? tepkiKesintili(i, s) : tepkiKesintisiz(i, s)) <= g.D);
    };
    if (a.politika === 'rm' && a.kesintili && gs.every((g) => g.D === g.T && g.B === 0)) {
      const n = gs.length;
      const ll = n * (2 ** (1 / n) - 1);
      const carpim = gs.reduce((p, g) => p * (g.C / g.T + 1), 1);
      testler.push({
        ad: 'Liu–Layland sınırı',
        durum: U <= ll ? 'gecti' : 'belirsiz',
        aciklama: `${n} görev için ${yuzdeYaz(ll)}; ${U <= ll ? 'kullanım sınırın altında' : 'yeterli koşuldur, aşılması kaçırma demek değildir'}`,
      });
      testler.push({
        ad: 'Hiperbolik sınır',
        durum: carpim <= 2 ? 'gecti' : 'belirsiz',
        aciklama: `∏(Uᵢ + 1) = ${carpim.toLocaleString('tr-TR', {maximumFractionDigits: 3})}; ${carpim <= 2 ? '2’yi aşmıyor' : '2’yi aşıyor, sonuç vermez'}`,
      });
    }
    testler.push({
      ad: 'Tepki süresi analizi',
      durum: yarim ? 'belirsiz' : analizUygun ? 'gecti' : 'kaldi',
      aciklama: yarim
        ? 'Meşgul dönem çok uzun olduğundan hesap sınırda bırakıldı; karar benzetime dayanır'
        : analizUygun
          ? 'Her görevin en kötü tepki süresi zaman sınırının içinde'
          : `Zaman sınırını aşan: ${asanlar.map((g) => g.ad).join(', ')}`,
    });
    benzetim = benzet(gs, (x, y) => rutbe.get(gs[x.g].id)! - rutbe.get(gs[y.g].id)!, a.kesintili, ufuk);
  } else {
    if (a.kesintili) {
      const talep = edfTalep(gs, 200_000);
      analizUygun = talep.durum === 'belirsiz' ? undefined : talep.durum === 'gecti';
      uygunMu = (liste) => edfTalep(liste, 5_000).durum === 'gecti';
      testler.push({
        ad: 'İşlemci talep ölçütü',
        durum: talep.durum,
        aciklama: asiri
          ? 'Kullanım %100’ü aştığı için sağlanamaz'
          : talep.yalnizKullanim
            ? 'Zaman sınırları periyottan kısa değil; EDF için U ≤ %100 yeterli ve gereklidir'
            : talep.durum === 'gecti'
              ? 'Her mutlak zaman sınırına kadar istenen iş, geçen süreyi aşmıyor'
              : talep.durum === 'kaldi'
                ? `t = ${sureYaz(talep.an!)} anına kadar ${sureYaz(talep.talep!)} iş isteniyor`
                : 'Sınanacak aralık çok uzun; karar benzetime dayanır',
      });
    } else {
      testler.push({
        ad: 'Biçimsel test',
        durum: 'belirsiz',
        aciklama: 'Kesintisiz EDF için kapalı biçimli test uygulanmadı; karar benzetime dayanır',
      });
    }
    benzetim = benzet(gs, (x, y) => x.sinirAni - y.sinirAni || gs[x.g].sira - gs[y.g].sira, a.kesintili, ufuk);
  }

  const pencere = dongusel ? (tam ? H : 0) : ufuk;
  const kacanSayisi = topla(benzetim.st, (s) => s.kacan);
  if (!dongusel) {
    const ilk = benzetim.kacanlar[0];
    testler.push({
      ad: 'Benzetim',
      durum: kacanSayisi === 0 ? 'gecti' : 'kaldi',
      aciklama:
        kacanSayisi === 0
          ? `İlk ${sureYaz(pencere)} içinde zaman sınırı aşımı yok`
          : `${kacanSayisi} iş zaman sınırını kaçırdı (ilki: ${gs.find((g) => g.id === ilk.id)!.ad}, t = ${sureYaz(ilk.t)})`,
    });
  }

  // ---------- Görev sonuçları ----------
  butce = 800_000;
  const kumeUygun = !asiri && (analizUygun ?? kacanSayisi === 0) && kacanSayisi === 0;
  const sonuclar: GorevSonucu[] = gs.map((g, i) => {
    const s = benzetim.st[i];
    const tepkiAnaliz = analiz?.get(g.id);
    const tepkiBenzetim = s.is > 0 ? s.enUzun : undefined;
    const enKotu = tepkiAnaliz ?? tepkiBenzetim;
    const D = dongusel ? Math.min(g.D, g.T) : g.D;
    return {
      id: g.id,
      oncelik: sabit ? rutbe.get(g.id)! + 1 : undefined,
      kullanim: g.C / g.T,
      tepkiAnaliz,
      tepkiBenzetim,
      enKisaTepki: s.is > 0 ? s.enKisa : undefined,
      kesilme: s.kesilme,
      isSayisi: s.is,
      kacan: s.kacan,
      uygun: s.kacan === 0 && (tepkiAnaliz === undefined || tepkiAnaliz <= D),
      pay: enKotu === undefined || !Number.isFinite(enKotu) ? undefined : D - enKotu,
      enFazlaSure: kumeUygun && uygunMu && butce > 0 ? enFazlaSure(gs, i, uygunMu) : undefined,
    };
  });

  return {
    kullanim: U,
    hiperperiyot: H,
    tamHiperperiyot: tam,
    pencere,
    tamPencere: dongusel ? tam : tamPencere,
    // Aşırı yükte kuyruk büyür ve benzetim erken kesilir; işlemci hiç boş kalmaz
    bosta: asiri ? 0 : pencere > 0 ? Math.max(0, 1 - benzetim.mesgul / pencere) : 1,
    karar: asiri ? 'asiri' : (analizUygun ?? true) && kacanSayisi === 0 ? 'uygun' : 'kacan',
    testler,
    gorevler: sonuclar,
    parcalar: benzetim.parcalar,
    kacanlar: benzetim.kacanlar,
    cizelgePencere: Math.min(benzetim.cizelgePencere, pencere),
    cerceve,
  };
}

// ---------- Örnek senaryolar ----------

export type Senaryo = {ad: string; aciklama: string; ayarlar: Ayarlar; gorevler: Omit<Gorev, 'id'>[]};

const g = (ad: string, periyot: number, sure: number, sinir = periyot, faz = 0, engel = 0): Omit<Gorev, 'id'> => ({
  ad,
  periyot,
  sure,
  sinir,
  faz,
  engel,
});

export const SENARYOLAR: Senaryo[] = [
  {
    ad: 'Uçuş kontrol bilgisayarı — hız-monoton',
    aciklama:
      'Periyotları birbirinin katı (harmonik) altı görev. Kullanım %90 ile Liu–Layland sınırının üstündedir, yine de tepki süresi analizi kümenin çizelgelenebilir olduğunu gösterir: yeterli koşulun aşılması kaçırma demek değildir. Süreler örnek değerlerdir.',
    ayarlar: {politika: 'rm', kesintili: true, cerceve: 0},
    gorevler: [
      g('İç döngü (kararlılık)', 5, 1),
      g('Veri yolu G/Ç', 10, 1.5),
      g('Dış döngü (güdüm)', 20, 4),
      g('Hava verisi', 40, 6),
      g('Sağlık izleme', 80, 8),
      g('Kayıt', 160, 16),
    ],
  },
  {
    ad: 'Hız-monotonun kaçırdığı, EDF’nin tutturduğu küme',
    aciklama:
      'Kullanım %97: hız-monoton atamada Seyrüsefer filtresi zaman sınırını kaçırır. Politikayı EDF yapın; aynı küme çizelgelenebilir hâle gelir, çünkü EDF tek çekirdekte %100 kullanıma kadar en iyi sonucu verir.',
    ayarlar: {politika: 'rm', kesintili: true, cerceve: 0},
    gorevler: [g('Algılayıcı okuma', 5, 2), g('Seyrüsefer filtresi', 7, 4)],
  },
  {
    ad: 'Zaman sınırı periyottan kısa — DM',
    aciklama:
      'Arıza tepkisi seyrek çalışır (50 ms) ama 8 ms içinde bitmelidir. Hız-monoton ona en düşük önceliği verir ve sınır kaçar; zaman sınırı-monoton atamada küme çizelgelenebilir. Politikayı değiştirip karşılaştırın.',
    ayarlar: {politika: 'rm', kesintili: true, cerceve: 0},
    gorevler: [g('Kontrol döngüsü', 10, 4), g('Ekran güncelleme', 20, 4), g('Arıza tepkisi', 50, 5, 8)],
  },
  {
    ad: 'Kesintisiz çizelgeleme — uzun görevin engellemesi',
    aciklama:
      'Kayıt görevi başladıktan sonra kesilemez; o sırada çıkan Hızlı döngü onu bekler. Analiz bu en kötü durumu yakalar (6 ms > 5 ms); eşzamanlı çıkışla başlayan benzetimde ise sınır kıl payı tutar. Faz sütununu açıp Kayıt görevine 4,5 ms faz verin: benzetim de aşımı gösterir.',
    ayarlar: {politika: 'rm', kesintili: false, cerceve: 0},
    gorevler: [g('Hızlı döngü', 5, 1), g('Telemetri', 20, 3), g('Kayıt', 50, 5)],
  },
  {
    ad: 'Döngüsel yürütücü — 10 ms küçük çerçeve',
    aciklama:
      'Dört görev 40 ms’lik ana çerçeveye yerleştirilir. Araç küçük çerçeve adaylarını sınar ve işleri çerçevelere bölmeden dağıtır; her çerçevede kalan boş süre tabloda görülür.',
    ayarlar: {politika: 'dongusel', kesintili: false, cerceve: 0},
    gorevler: [g('Kontrol yasası', 10, 2), g('Algılayıcı füzyonu', 20, 4), g('Seyrüsefer', 40, 6), g('Bakım ve BIT', 40, 5)],
  },
];
