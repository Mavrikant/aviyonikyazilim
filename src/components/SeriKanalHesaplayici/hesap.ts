/**
 * Seri kanal (UART: RS-232 / RS-422 / RS-485) yük hesabı.
 *
 * Karakter çerçevesi: 1 başlangıç + veri bitleri + (eşlik) + durdurma bitleri.
 * Bir mesajın hatta kaldığı süre: (faydalı yük + ek yük) × karakter süresi
 * + mesaj sonundaki boşluk (karakter süresi cinsinden, ör. Modbus RTU'da 3,5).
 *
 * Yük, periyodik mesajların bir benzetimle hatta gönderilmesiyle hesaplanır: aynı anda
 * hazır olan mesajlar tablodaki sırayla, kesintisiz (non-preemptive) gönderilir. Benzetim
 * iki hiperperiyot sürer; yük ikincisinde (kararlı durumda) ölçülür, böylece döngü
 * sınırındaki yön değişimleri ve önceki döngüden taşan kuyruk da hesaba girer.
 * İki telli RS-485'te iki yön aynı hattı paylaşır ve yön her değiştiğinde
 * sürücü açma/kapama (turnaround) süresi eklenir.
 */

export type Arayuz = 'rs232' | 'rs422' | 'rs485';
export type Eslik = 'N' | 'O' | 'E';
export type Yon = 'AB' | 'BA';

export type Ayarlar = {
  arayuz: Arayuz;
  /** RS-485 kablolaması: 2 telli (yarı çift yönlü, ortak hat) ya da 4 telli (tam çift yönlü) */
  tel: 2 | 4;
  baud: number;
  veriBiti: number; // 5–9
  eslik: Eslik;
  durdurma: number; // 1 | 1.5 | 2
  /** Her mesajın sonundaki boşluk, karakter süresi cinsinden */
  bosluk: number;
  /** Yön değiştirme süresi (µs); yalnızca ortak hatta (2 telli RS-485) uygulanır */
  donus: number;
};

export type Mesaj = {
  id: string;
  ad: string;
  yon: Yon;
  /** Faydalı yük (bayt) */
  yuk: number;
  /** Protokol ek yükü: başlık, adres, CRC, ayraçlar (bayt) */
  ek: number;
  /** Yayın periyodu (ms) */
  periyot: number;
};

export type Kanal = 'ortak' | Yon;

export type MesajSonucu = {
  id: string;
  bayt: number;
  /** Hatta kalma süresi (µs), boşluk dahil */
  sure: number;
  hz: number;
  /** Bu mesajın kanal yüküne katkısı (%) */
  pay: number;
  /** Benzetimde gözlenen en uzun gecikme: hazır olmasından gönderimin bitmesine (µs) */
  enKotuGecikme: number;
  /** En kötü gecikme periyodu aşıyor: bir sonraki örnek hazır olduğunda öncekisi bitmemiş */
  periyotAsimi: boolean;
};

export type KanalSonucu = {
  kanal: Kanal;
  /** Benzetim penceresinde hattın meşgul olduğu oran (%), yön değiştirme dahil */
  kullanim: number;
  /** Yön değiştirme sürelerinin payı (%) */
  donusPayi: number;
  /** Talep: mesajların istediği hat süresi oranı (%); 100'ü aşarsa kanal kuyruğu sürekli büyür */
  talep: number;
  /** Faydalı veri hızı (bayt/s) */
  faydali: number;
  /** Boş kapasite (bayt/s, bu çerçeve biçimiyle) */
  bos: number;
  mesajlar: MesajSonucu[];
};

export type Iletim = {kanal: Kanal; id: string; bas: number; bit: number; donus?: boolean};

export type Sonuc = {
  bitKarakter: number;
  /** Karakter süresi (µs) */
  karakterSuresi: number;
  /** En fazla karakter/s */
  kapasite: number;
  kanallar: KanalSonucu[];
  /** Benzetim penceresi (µs) ve tam hiperperiyot olup olmadığı */
  pencere: number;
  tamPencere: boolean;
  /** Zaman çizelgesi için ilk görüntü penceresindeki iletimler */
  cizelge: Iletim[];
  cizelgePencere: number;
};

export const BAUD_LISTESI = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

const MAKS_PENCERE = 10_000_000; // 10 s (µs)
const MAKS_ILETIM = 200_000; // pencere başına (benzetim iki pencere sürer)

export const ortakHat = (a: Ayarlar) => a.arayuz === 'rs485' && a.tel === 2;

export const bitKarakter = (a: Ayarlar) => 1 + a.veriBiti + (a.eslik === 'N' ? 0 : 1) + a.durdurma;

/** "8N1", "8E1", "7O2", "8N1,5" */
export const cerceveAdi = (a: Ayarlar) => `${a.veriBiti}${a.eslik}${String(a.durdurma).replace('.', ',')}`;

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

/** Periyotların ortak katı (µs); MAKS_PENCERE'yi aşarsa sınırda kesilir */
function hiperperiyot(periyotlar: number[]): {pencere: number; tam: boolean} {
  let l = 1;
  for (const p of periyotlar) {
    l = (l / gcd(l, p)) * p;
    if (l > MAKS_PENCERE) return {pencere: MAKS_PENCERE, tam: false};
  }
  return {pencere: l, tam: true};
}

export function hesapla(a: Ayarlar, mesajlar: Mesaj[]): Sonuc {
  const bk = bitKarakter(a);
  const karakterSuresi = (bk / a.baud) * 1e6;
  const gecerli = mesajlar.filter((m) => m.periyot > 0 && m.yuk + m.ek > 0);
  const sureOf = (m: Mesaj) => (m.yuk + m.ek + a.bosluk) * karakterSuresi;
  const periyotUs = (m: Mesaj) => Math.max(1, Math.round(m.periyot * 1000));

  const ortak = ortakHat(a);
  const kanalOf = (m: Mesaj): Kanal => (ortak ? 'ortak' : m.yon);
  const kanallar: Kanal[] = ortak ? ['ortak'] : ['AB', 'BA'];

  const {pencere: hp, tam} = hiperperiyot(gecerli.map(periyotUs));
  // Pencere en az en uzun periyot kadar olmalı; çok sık mesajlarda iletim sayısı sınırlanır
  const toplamSiklik = gecerli.reduce((s, m) => s + 1 / periyotUs(m), 0);
  const pencere = Math.max(
    Math.min(hp, toplamSiklik > 0 ? Math.floor(MAKS_ILETIM / toplamSiklik) : hp),
    ...gecerli.map(periyotUs),
    1,
  );
  const tamPencere = tam && pencere >= hp;
  const cizelgePencere = Math.min(pencere, Math.max(...gecerli.map(periyotUs), 1));

  const enKotu = new Map<string, number>();
  const cizelge: Iletim[] = [];
  const mesgul = new Map<Kanal, {iletim: number; donus: number}>();

  for (const kanal of kanallar) {
    const kanalMesajlari = gecerli.filter((m) => kanalOf(m) === kanal);
    // Tüm hazır olma anları (zaman, tablo sırası)
    const hazir: {t: number; sira: number; m: Mesaj}[] = [];
    kanalMesajlari.forEach((m) => {
      const p = periyotUs(m);
      const sira = mesajlar.indexOf(m);
      for (let t = 0; t < 2 * pencere; t += p) hazir.push({t, sira, m});
    });
    hazir.sort((x, y) => x.t - y.t || x.sira - y.sira);

    let t = 0;
    let i = 0;
    let sonYon: Yon | undefined;
    let iletim = 0;
    let donus = 0;
    const kuyruk: typeof hazir = [];
    while (i < hazir.length || kuyruk.length > 0) {
      if (kuyruk.length === 0 && hazir[i].t > t) t = hazir[i].t;
      while (i < hazir.length && hazir[i].t <= t) kuyruk.push(hazir[i++]);
      // Aynı anda hazır olanlar tablo sırasıyla; önce hazır olan önce gider
      kuyruk.sort((x, y) => x.t - y.t || x.sira - y.sira);
      const is = kuyruk.shift()!;
      // Ölçüm ikinci pencerede: [pencere, 2·pencere) aralığına düşen meşguliyet sayılır
      const say = (bas: number, bit: number) => Math.max(0, Math.min(bit, 2 * pencere) - Math.max(bas, pencere));
      if (ortak && sonYon !== undefined && sonYon !== is.m.yon && a.donus > 0) {
        if (t < cizelgePencere) cizelge.push({kanal, id: is.m.id, bas: t, bit: t + a.donus, donus: true});
        donus += say(t, t + a.donus);
        t += a.donus;
      }
      const sure = sureOf(is.m);
      if (t < cizelgePencere) cizelge.push({kanal, id: is.m.id, bas: t, bit: t + sure});
      iletim += say(t, t + sure);
      t += sure;
      sonYon = is.m.yon;
      const gecikme = t - is.t;
      if (gecikme > (enKotu.get(is.m.id) ?? 0)) enKotu.set(is.m.id, gecikme);
    }
    mesgul.set(kanal, {iletim, donus});
  }

  const kapasite = a.baud / bk;
  return {
    bitKarakter: bk,
    karakterSuresi,
    kapasite,
    pencere,
    tamPencere,
    cizelge,
    cizelgePencere,
    kanallar: kanallar.map((kanal) => {
      const {iletim, donus} = mesgul.get(kanal)!;
      const kanalMesajlari = gecerli.filter((m) => kanalOf(m) === kanal);
      const kullanim = ((iletim + donus) / pencere) * 100;
      const faydali = kanalMesajlari.reduce((s, m) => s + m.yuk * (1000 / m.periyot), 0);
      const talep = kanalMesajlari.reduce((s, m) => s + ((sureOf(m) * 1000) / m.periyot / 1e6) * 100, 0);
      return {
        kanal,
        kullanim,
        talep: Math.max(talep + (donus / pencere) * 100, kullanim),
        donusPayi: (donus / pencere) * 100,
        faydali,
        bos: (Math.max(0, 100 - kullanim) / 100) * kapasite,
        mesajlar: kanalMesajlari.map((m) => {
          const sure = sureOf(m);
          const hz = 1000 / m.periyot;
          const gecikme = enKotu.get(m.id) ?? sure;
          return {
            id: m.id,
            bayt: m.yuk + m.ek,
            sure,
            hz,
            pay: ((sure * hz) / 1e6) * 100,
            enKotuGecikme: gecikme,
            periyotAsimi: gecikme > periyotUs(m),
          };
        }),
      };
    }),
  };
}

// ---------- Örnek senaryolar ----------

export type Senaryo = {ad: string; aciklama: string; ayarlar: Ayarlar; mesajlar: Omit<Mesaj, 'id'>[]};

const temel: Ayarlar = {
  arayuz: 'rs232',
  tel: 2,
  baud: 9600,
  veriBiti: 8,
  eslik: 'N',
  durdurma: 1,
  bosluk: 0,
  donus: 0,
};

/** Modbus RTU "Read Holding Registers" (0x03): istek 8 bayt; cevap 5 + 2N bayt (N yazmaç) */
const modbusIstek = 8;
const modbusCevap = (n: number) => 5 + 2 * n;

export const SENARYOLAR: Senaryo[] = [
  {
    ad: 'GPS alıcısı — NMEA 0183, RS-232',
    aciklama:
      'NMEA 0183 cümleleri 4800 baud, 8N1 ile saniyede bir yayımlanır; cümle uzunlukları tipik değerlerdir (en fazla 82 karakter). Kanalın ne kadar dolu olduğuna dikkat edin.',
    ayarlar: {...temel, arayuz: 'rs232', baud: 4800},
    mesajlar: [
      {ad: 'GGA (konum)', yon: 'BA', yuk: 72, ek: 0, periyot: 1000},
      {ad: 'RMC (asgari veri)', yon: 'BA', yuk: 70, ek: 0, periyot: 1000},
      {ad: 'GSA (DOP, uydular)', yon: 'BA', yuk: 64, ek: 0, periyot: 1000},
      {ad: 'GSV 1/3', yon: 'BA', yuk: 70, ek: 0, periyot: 1000},
      {ad: 'GSV 2/3', yon: 'BA', yuk: 70, ek: 0, periyot: 1000},
      {ad: 'GSV 3/3', yon: 'BA', yuk: 70, ek: 0, periyot: 1000},
    ],
  },
  {
    ad: 'Modbus RTU yoklama — RS-485, 2 telli',
    aciklama:
      'Ana birim (A) üç alt birimden 100 ms\'de bir 10 yazmaç okur. Modbus RTU varsayılanı 8E1 ve mesaj sonunda 3,5 karakter sessizliktir; yön değiştirme süresi örnek bir değerdir.',
    ayarlar: {...temel, arayuz: 'rs485', tel: 2, baud: 19200, eslik: 'E', bosluk: 3.5, donus: 100},
    mesajlar: [1, 2, 3].flatMap((n) => [
      {ad: `İstek → alt birim ${n}`, yon: 'AB' as Yon, yuk: 4, ek: modbusIstek - 4, periyot: 100},
      {ad: `Cevap ← alt birim ${n}`, yon: 'BA' as Yon, yuk: 20, ek: modbusCevap(10) - 20, periyot: 100},
    ]),
  },
  {
    ad: 'Görev bilgisayarı ↔ ekran — RS-422, 115200',
    aciklama:
      'Tam çift yönlü RS-422 bağlantısında durum çerçevesi 50 Hz, telemetri 10 Hz gider; ekrandan komutlar 10 Hz gelir. Başlık + CRC için mesaj başına 8 bayt ek yük varsayılmıştır.',
    ayarlar: {...temel, arayuz: 'rs422', baud: 115200},
    mesajlar: [
      {ad: 'Durum çerçevesi', yon: 'AB', yuk: 64, ek: 8, periyot: 20},
      {ad: 'Telemetri', yon: 'AB', yuk: 256, ek: 8, periyot: 100},
      {ad: 'Komut', yon: 'BA', yuk: 16, ek: 8, periyot: 100},
      {ad: 'Onay', yon: 'BA', yuk: 4, ek: 8, periyot: 20},
    ],
  },
];
