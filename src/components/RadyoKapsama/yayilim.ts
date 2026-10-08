/**
 * Radyo kapsama aracının hesap çekirdeği: küresel geodezi, serbest uzay kaybı, arazi
 * profili üzerinde kırınım kaybı ve bağlantı bütçesi. Tarayıcıya bağlı hiçbir şey içermez.
 *
 * Kırınım, ITU-R P.526'daki Bullington yöntemiyle hesaplanır: profilin tamamı, verici ve
 * alıcıdan araziye çizilen en dik iki doğrunun kesiştiği noktadaki tek bir eşdeğer bıçak
 * sırtına indirgenir. Dünya eğriliği 4/3 etkin yarıçapla (standart atmosfer kırılması)
 * profile eklenir. Yöntemin küresel dünya düzeltmesi (delta-Bullington) uygulanmaz.
 *
 * Birimler: mesafe km, yükseklik m (deniz seviyesinden), frekans MHz, güç dBm, kayıp dB.
 */

export const NM_KM = 1.852;
export const FT_M = 0.3048;

const DUNYA_KM = 6371;
/** Etkin dünya yarıçapı (k = 4/3), km */
export const ETKIN_YARICAP_KM = (DUNYA_KM * 4) / 3;
const CE = 1 / ETKIN_YARICAP_KM;
const RAD = Math.PI / 180;

/** Dalga boyu, m */
export const dalgaBoyu = (fMHz: number) => 299.792458 / fMHz;

/** Başlangıç noktasından verilen gerçek yönde ve mesafede varılan nokta (küre) */
export function hedefNokta(lat: number, lon: number, yon: number, km: number): [number, number] {
  const a = km / DUNYA_KM;
  const f1 = lat * RAD;
  const t = yon * RAD;
  const sinF2 = Math.sin(f1) * Math.cos(a) + Math.cos(f1) * Math.sin(a) * Math.cos(t);
  const f2 = Math.asin(sinF2);
  const l2 = lon * RAD + Math.atan2(Math.sin(t) * Math.sin(a) * Math.cos(f1), Math.cos(a) - Math.sin(f1) * sinF2);
  return [f2 / RAD, l2 / RAD];
}

/** İki nokta arasında büyük daire mesafesi (km) ve ilk noktadan gerçek yön (0–360°) */
export function mesafeYon(lat1: number, lon1: number, lat2: number, lon2: number): {km: number; yon: number} {
  const f1 = lat1 * RAD;
  const f2 = lat2 * RAD;
  const dl = (lon2 - lon1) * RAD;
  const sf = Math.sin((f2 - f1) / 2);
  const sl = Math.sin(dl / 2);
  const h = sf * sf + Math.cos(f1) * Math.cos(f2) * sl * sl;
  const km = 2 * DUNYA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return {km, yon: (Math.atan2(y, x) / RAD + 360) % 360};
}

/** Serbest uzay yol kaybı, dB */
export const serbestUzayKaybi = (fMHz: number, km: number) =>
  32.45 + 20 * Math.log10(fMHz) + 20 * Math.log10(Math.max(km, 0.001));

/** Düz (arazisiz) 4/3 dünyada iki yüksekliğin birbirini gördüğü en büyük mesafe, km */
export const radyoUfku = (h1: number, h2: number) =>
  Math.sqrt(2 * ETKIN_YARICAP_KM * Math.max(h1, 0) * 0.001) + Math.sqrt(2 * ETKIN_YARICAP_KM * Math.max(h2, 0) * 0.001);

/** Tek bıçak sırtı kırınım kaybı J(ν), dB (ITU-R P.526; ν ≤ −0,78 için kayıp yok sayılır) */
export function bicakSirti(v: number): number {
  if (v <= -0.78) return 0;
  const u = v - 0.1;
  return 6.9 + 20 * Math.log10(Math.sqrt(u * u + 1) + u);
}

/** Uç noktaları [0] ve [j] olan profilde i. noktadaki dünya şişkinliği, m */
export const siskinlik = (di: number, d: number) => 500 * CE * di * (d - di);

/** Birinci Fresnel bölgesinin yarıçapı, m */
export const fresnelYaricapi = (lambda: number, di: number, d: number) =>
  Math.sqrt((lambda * di * (d - di) * 1000) / d);

/**
 * Bullington kırınım kaybı, dB. `h` eşit aralıklı arazi profilidir (m); verici h[0]'ın,
 * alıcı h[j]'nin üstündedir. Aradaki noktalar (1 … j−1) engel sayılır.
 */
export function kirinimKaybi(
  h: ArrayLike<number>,
  j: number,
  adimKm: number,
  hVerici: number,
  hAlici: number,
  lambda: number,
  bas = 0,
): number {
  if (j < 2) return 0;
  const d = j * adimKm;
  // Vericiden ve alıcıdan araziye en dik doğrular
  let sVerici = -Infinity;
  let sAlici = -Infinity;
  for (let i = 1; i < j; i++) {
    const di = i * adimKm;
    const y = h[bas + i] + 500 * CE * di * (d - di);
    const sv = (y - hVerici) / di;
    const sa = (y - hAlici) / (d - di);
    if (sv > sVerici) sVerici = sv;
    if (sa > sAlici) sAlici = sa;
  }
  let v: number;
  if (sVerici < (hAlici - hVerici) / d) {
    // Görüş hattı açık: Fresnel bölgesine en çok giren nokta belirler
    v = -Infinity;
    const k = (0.002 * d) / lambda;
    for (let i = 1; i < j; i++) {
      const di = i * adimKm;
      const acik = h[bas + i] + 500 * CE * di * (d - di) - (hVerici * (d - di) + hAlici * di) / d;
      const vi = acik * Math.sqrt(k / (di * (d - di)));
      if (vi > v) v = vi;
    }
  } else {
    // Ufuk ötesi: iki doğrunun kesiştiği Bullington noktası
    const db = (hAlici - hVerici + sAlici * d) / (sVerici + sAlici);
    v =
      (hVerici + sVerici * db - (hVerici * (d - db) + hAlici * db) / d) *
      Math.sqrt((0.002 * d) / (lambda * db * (d - db)));
  }
  const l = bicakSirti(v);
  return l + (1 - Math.exp(-l / 6)) * (10 + 0.02 * d);
}

/** İstasyon çevresinde kutupsal ızgarada toplam yol kaybı (serbest uzay + kırınım) */
export type KayipIzgarasi = {
  radyal: number;
  /** Radyal başına aralık sayısı; örnekler 0 … n */
  n: number;
  adimKm: number;
  /** radyal × (n + 1) arazi yüksekliği, m */
  arazi: Float32Array;
  /** radyal × (n + 1) yol kaybı, dB; uçak irtifası arazinin altındaysa NaN */
  kayip: Float32Array;
  hVerici: number;
  hAlici: number;
};

/** Bir radyalin tüm örnekleri için yol kaybını `kayip` dizisine yazar */
export function radyalKaybi(g: KayipIzgarasi, r: number, fMHz: number): void {
  const bas = r * (g.n + 1);
  const lambda = dalgaBoyu(fMHz);
  const dh = g.hAlici - g.hVerici;
  g.kayip[bas] = NaN;
  for (let j = 1; j <= g.n; j++) {
    if (g.arazi[bas + j] > g.hAlici) {
      g.kayip[bas + j] = NaN;
      continue;
    }
    const d = j * g.adimKm;
    const egik = Math.sqrt(d * d + dh * dh * 1e-6);
    g.kayip[bas + j] =
      serbestUzayKaybi(fMHz, egik) + kirinimKaybi(g.arazi, j, g.adimKm, g.hVerici, g.hAlici, lambda, bas);
  }
}

/** Eşik türü: uzaydaki sinyal yoğunluğu (ICAO Ek 10) ya da alıcı girişindeki güç */
export type Butce = {
  /** Verici çıkış gücü, W (DME/TACAN'da tepe darbe gücü) */
  gucW: number;
  /** Verici anten kazancı − besleme kaybı, dBi */
  vericiKazanc: number;
  esik: 'ek10' | 'alici';
  /** Ek 10'un istediği en az güç yoğunluğu, dBW/m² */
  yogunluk: number;
  /** Alıcı anten kazancı, dBi */
  aliciKazanc: number;
  /** Uçaktaki kablo ve bağlantı kaybı, dB */
  aliciKayip: number;
  /** Alıcı hassasiyeti, dBm */
  hassasiyet: number;
};

/** Eşdeğer izotropik yayılan güç, dBm */
export const eirp = (b: Butce) => 10 * Math.log10(Math.max(b.gucW, 1e-6) * 1000) + b.vericiKazanc;

/** Güç yoğunluğunun (dBW/m²) izotropik antende karşılığı, dBm */
export function yogunluktanGuc(dBWm2: number, fMHz: number): number {
  const lambda = dalgaBoyu(fMHz);
  return dBWm2 + 10 * Math.log10((lambda * lambda) / (4 * Math.PI)) + 30;
}

/**
 * Katlanılabilen en büyük yol kaybı, dB. Pay = bu değer − yol kaybı.
 * Ek 10 eşiğinde ölçüt uzaydaki sinyal olduğundan uçak anteni ve kablosu hesaba girmez.
 */
export function izinVerilenKayip(b: Butce, fMHz: number): number {
  if (b.esik === 'ek10') return eirp(b) - yogunluktanGuc(b.yogunluk, fMHz);
  return eirp(b) + b.aliciKazanc - b.aliciKayip - b.hassasiyet;
}

/** Yalnızca serbest uzay kaybıyla payın sıfıra indiği mesafe, km */
export const serbestUzayMenzili = (izin: number, fMHz: number) =>
  Math.pow(10, (izin - 32.45 - 20 * Math.log10(fMHz)) / 20);

export type Kesit = {
  km: number;
  adimKm: number;
  /** Arazi profili, m (0 = istasyon, son = seçilen nokta) */
  h: Float32Array;
  serbest: number;
  kirinim: number;
  /** Görüş hattı arazinin üstünde mi */
  gorus: boolean;
  /** Görüş hattı ile arazi arasındaki en küçük açıklığın 1. Fresnel yarıçapına oranı */
  fresnel: number;
  /** Uçak irtifası arazinin altında */
  araziAltinda: boolean;
};

/** İstasyon ile bir nokta arasındaki profilin yol kaybı ve görüş hattı özeti */
export function kesitHesapla(h: Float32Array, adimKm: number, hVerici: number, hAlici: number, fMHz: number): Kesit {
  const j = h.length - 1;
  const d = j * adimKm;
  const lambda = dalgaBoyu(fMHz);
  let fresnel = Infinity;
  for (let i = 1; i < j; i++) {
    const di = i * adimKm;
    const hat = (hVerici * (d - di) + hAlici * di) / d;
    const oran = (hat - h[i] - siskinlik(di, d)) / fresnelYaricapi(lambda, di, d);
    if (oran < fresnel) fresnel = oran;
  }
  const dh = hAlici - hVerici;
  return {
    km: d,
    adimKm,
    h,
    serbest: serbestUzayKaybi(fMHz, Math.sqrt(d * d + dh * dh * 1e-6)),
    kirinim: kirinimKaybi(h, j, adimKm, hVerici, hAlici, lambda),
    gorus: fresnel > 0,
    fresnel,
    araziAltinda: h[j] > hAlici,
  };
}

/**
 * Profilin sonundaki noktada sinyalin eşiği aştığı en düşük irtifa, m. Tavana kadar
 * aşılamıyorsa undefined. Kayıp irtifayla azaldığı varsayılarak ikiye bölmeyle aranır.
 */
export function enDusukIrtifa(
  h: Float32Array,
  adimKm: number,
  hVerici: number,
  fMHz: number,
  izin: number,
  tavan: number,
): number | undefined {
  const j = h.length - 1;
  const d = j * adimKm;
  const lambda = dalgaBoyu(fMHz);
  const yeter = (hAlici: number) => {
    const dh = hAlici - hVerici;
    const kayip =
      serbestUzayKaybi(fMHz, Math.sqrt(d * d + dh * dh * 1e-6)) + kirinimKaybi(h, j, adimKm, hVerici, hAlici, lambda);
    return kayip <= izin;
  };
  let alt = Math.max(h[j], 0);
  if (yeter(alt)) return alt;
  let ust = tavan;
  if (!yeter(ust)) return undefined;
  for (let i = 0; i < 24 && ust - alt > 5; i++) {
    const orta = (alt + ust) / 2;
    if (yeter(orta)) ust = orta;
    else alt = orta;
  }
  return ust;
}

/*
 * Sağlama: çekirdek bozulursa derleme durur. Bilinen değerler: J(0) ≈ 6,0 dB (görüş hattı
 * engelin tepesinden geçer); 1 km ve 1 MHz'te serbest uzay kaybı 32,45 dB; 10 000 ft ile
 * deniz seviyesi arasında radyo ufku ≈ 123 NM; düz denizde ufkun içinde kırınım kaybı yok,
 * ufkun ötesinde var; 113 MHz'te 90 µV/m (−107 dBW/m²) izotropik antende ≈ −79,5 dBm.
 */
{
  const duz = new Float32Array(401);
  const lambda = dalgaBoyu(113);
  const yakin = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
  const hatalar = [
    !yakin(bicakSirti(0), 6.03, 0.02) && 'J(0)',
    !yakin(serbestUzayKaybi(1, 1), 32.45, 1e-9) && 'serbest uzay kaybı',
    !yakin(radyoUfku(10000 * FT_M, 0) / NM_KM, 123, 1) && 'radyo ufku',
    kirinimKaybi(duz, 100, 1, 30, 3048, lambda) !== 0 && 'ufuk içi kırınım',
    !(kirinimKaybi(duz, 400, 1, 30, 3048, lambda) > 20) && 'ufuk ötesi kırınım',
    !yakin(yogunluktanGuc(-107, 113), -79.5, 0.1) && 'güç yoğunluğu dönüşümü',
    !yakin(mesafeYon(40, 30, 41, 30).km, 111.19, 0.05) && 'büyük daire mesafesi',
  ].filter(Boolean);
  if (hatalar.length > 0) throw new Error(`RadyoKapsama: hesap çekirdeği sağlaması tutmadı (${hatalar.join(', ')})`);
}
