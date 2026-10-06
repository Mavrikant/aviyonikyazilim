/**
 * DO-178C Ek A hedef tabloları (A-1 … A-10): hangi hedef hangi yazılım seviyesinde
 * aranır, hangisinde bağımsızlıkla karşılanır, kanıtı hangi veride durur.
 *
 * Geçerlilik, bağımsızlık, bölüm atıfları ve kontrol kategorileri standardın Ek A
 * tablolarıyla karşılaştırılarak girilmiştir. Başlık ve açıklamalar standardın metni
 * ya da çevirisi DEĞİLDİR; hedefin ne istediğini anlatan özgün özetlerdir (telif).
 * Bir hücre değişirse dosyanın sonundaki sağlama (71/69/62/26 hedef, 30/18/5/2
 * bağımsızlık) derlemeyi durdurur.
 */

export type Seviye = 'A' | 'B' | 'C' | 'D';
/** Seviye E'de hedef uygulanmaz; araçta seçilebilir ama tablolarda sütunu yoktur */
export type SeviyeE = Seviye | 'E';
/** B: bağımsızlıkla karşılanır · G: karşılanır, bağımsızlık aranmaz · -: o seviyede aranmaz */
export type Durum = 'B' | 'G' | '-';

export const SEVIYELER: Seviye[] = ['A', 'B', 'C', 'D'];

/** Seviyenin bağlandığı en ağır arıza durumu sınıfı */
export const SEVIYE_BILGI: Record<SeviyeE, {ariza: string; ingilizce: string}> = {
  A: {ariza: 'Katastrofik', ingilizce: 'catastrophic'},
  B: {ariza: 'Tehlikeli', ingilizce: 'hazardous'},
  C: {ariza: 'Majör', ingilizce: 'major'},
  D: {ariza: 'Minör', ingilizce: 'minor'},
  E: {ariza: 'Emniyet etkisi yok', ingilizce: 'no safety effect'},
};

/* ---------- Yaşam döngüsü verisi ---------- */

export type Veri = {
  ad: string;
  kisa?: string;
  /** DO-178C bölüm 11 atfı */
  atif: string;
  /** Kontrol kategorisi, A B C D sırasıyla: 1 = CC1, 2 = CC2, - = o seviyede çıktı değil */
  kk: string;
};

export const VERILER = {
  psac: {ad: 'Yazılım sertifikasyon planı', kisa: 'PSAC', atif: '11.1', kk: '1111'},
  sdp: {ad: 'Yazılım geliştirme planı', kisa: 'SDP', atif: '11.2', kk: '1122'},
  svp: {ad: 'Yazılım doğrulama planı', kisa: 'SVP', atif: '11.3', kk: '1122'},
  scmp: {ad: 'Yazılım konfigürasyon yönetimi planı', kisa: 'SCMP', atif: '11.4', kk: '1122'},
  sqap: {ad: 'Yazılım kalite güvencesi planı', kisa: 'SQAP', atif: '11.5', kk: '1122'},
  gerStd: {ad: 'Yazılım gereksinim standartları', atif: '11.6', kk: '112-'},
  tasStd: {ad: 'Yazılım tasarım standartları', atif: '11.7', kk: '112-'},
  kodStd: {ad: 'Kodlama standardı', atif: '11.8', kk: '112-'},
  srd: {ad: 'Yazılım gereksinim verisi', atif: '11.9', kk: '1111'},
  tasarim: {ad: 'Tasarım tanımı', atif: '11.10', kk: '1112'},
  kaynak: {ad: 'Kaynak kod', atif: '11.11', kk: '111-'},
  eoc: {ad: 'Çalıştırılabilir nesne kodu', atif: '11.12', kk: '1111'},
  svcp: {ad: 'Yazılım doğrulama durumları ve prosedürleri', atif: '11.13', kk: '1122'},
  svr: {ad: 'Yazılım doğrulama sonuçları', atif: '11.14', kk: '2222'},
  seci: {ad: 'Yaşam döngüsü ortam konfigürasyon indeksi', kisa: 'SECI', atif: '11.15', kk: '1112'},
  sci: {ad: 'Yazılım konfigürasyon indeksi', kisa: 'SCI', atif: '11.16', kk: '1111'},
  pr: {ad: 'Problem raporları', atif: '11.17', kk: '2222'},
  scmKayit: {ad: 'Konfigürasyon yönetimi kayıtları', atif: '11.18', kk: '2222'},
  sqaKayit: {ad: 'Kalite güvencesi kayıtları', atif: '11.19', kk: '2222'},
  sas: {ad: 'Yazılım başarı özeti', kisa: 'SAS', atif: '11.20', kk: '1111'},
  // İz verisinin kategorisi hangi sürecin çıktısı olduğuna göre değişir
  izGelistirme: {ad: 'İz verisi (geliştirme)', atif: '11.21', kk: '1111'},
  izTest: {ad: 'İz verisi (test)', atif: '11.21', kk: '1122'},
  pdi: {ad: 'PDI dosyası', atif: '11.22', kk: '1111'},
} satisfies Record<string, Veri>;

export type VeriKodu = keyof typeof VERILER;

const PLANLAR: VeriKodu[] = ['psac', 'sdp', 'svp', 'scmp', 'sqap'];
const TEST_VERISI: VeriKodu[] = ['svcp', 'svr', 'izTest'];

/* ---------- Tablolar ---------- */

export type Tablo = {
  /** 1 … 10 → "A-1" … "A-10" */
  no: number;
  ad: string;
  /** Süzgeç düğmesi ve dar başlıklar için */
  kisa: string;
  kitap: {ad: string; yol: string}[];
};

const KISIM3 = '/kitap/do178c-ile-gelistirme';

export const TABLOLAR: Tablo[] = [
  {
    no: 1,
    ad: 'Yazılım planlama süreci',
    kisa: 'Planlama',
    kitap: [{ad: '5. Yazılım Planlama', yol: `${KISIM3}/yazilim-planlama`}],
  },
  {
    no: 2,
    ad: 'Yazılım geliştirme süreçleri',
    kisa: 'Geliştirme',
    kitap: [
      {ad: '6. Yazılım Gereksinimleri', yol: `${KISIM3}/yazilim-gereksinimleri`},
      {ad: '7. Yazılım Tasarımı', yol: `${KISIM3}/yazilim-tasarimi`},
      {ad: '8. Kodlama ve Entegrasyon', yol: `${KISIM3}/yazilim-gerceklestirme-kodlama-entegrasyon`},
    ],
  },
  {
    no: 3,
    ad: 'Gereksinim süreci çıktılarının doğrulanması',
    kisa: 'Gereksinim doğrulama',
    kitap: [{ad: '9. Yazılım Doğrulama', yol: `${KISIM3}/yazilim-dogrulama`}],
  },
  {
    no: 4,
    ad: 'Tasarım süreci çıktılarının doğrulanması',
    kisa: 'Tasarım doğrulama',
    kitap: [
      {ad: '9. Yazılım Doğrulama', yol: `${KISIM3}/yazilim-dogrulama`},
      {ad: '21. Yazılım Bölümlemesi', yol: '/kitap/ozel-konular/yazilim-bolumlemesi'},
    ],
  },
  {
    no: 5,
    ad: 'Kodlama ve entegrasyon çıktılarının doğrulanması',
    kisa: 'Kod doğrulama',
    kitap: [
      {ad: '9. Yazılım Doğrulama', yol: `${KISIM3}/yazilim-dogrulama`},
      {ad: '22. Konfigürasyon Verisi', yol: '/kitap/ozel-konular/konfigurasyon-verisi'},
    ],
  },
  {
    no: 6,
    ad: 'Entegrasyon süreci çıktılarının test edilmesi',
    kisa: 'Test',
    kitap: [{ad: '9. Yazılım Doğrulama: Testin rolü', yol: `${KISIM3}/yazilim-dogrulama#testin-rolü`}],
  },
  {
    no: 7,
    ad: 'Doğrulama süreci sonuçlarının doğrulanması',
    kisa: 'Kapsam analizi',
    kitap: [
      {
        ad: '9. Yazılım Doğrulama: Doğrulamanın doğrulanması',
        yol: `${KISIM3}/yazilim-dogrulama#doğrulamanın-doğrulanması`,
      },
    ],
  },
  {
    no: 8,
    ad: 'Yazılım konfigürasyon yönetimi süreci',
    kisa: 'Konfigürasyon yönetimi',
    kitap: [{ad: '10. Yazılım Konfigürasyon Yönetimi', yol: `${KISIM3}/yazilim-konfigurasyon-yonetimi`}],
  },
  {
    no: 9,
    ad: 'Yazılım kalite güvencesi süreci',
    kisa: 'Kalite güvencesi',
    kitap: [{ad: '11. Yazılım Kalite Güvencesi', yol: `${KISIM3}/yazilim-kalite-guvencesi`}],
  },
  {
    no: 10,
    ad: 'Sertifikasyon irtibatı süreci',
    kisa: 'Sertifikasyon irtibatı',
    kitap: [{ad: '12. Sertifikasyon İrtibatı', yol: `${KISIM3}/sertifikasyon-irtibati`}],
  },
];

/* ---------- Hedefler ---------- */

export type Hedef = {
  tablo: number;
  no: number;
  baslik: string;
  aciklama: string;
  /** Hedefin tanımlandığı DO-178C bölümü */
  atif: string;
  /** A B C D sırasıyla dört Durum karakteri */
  uyg: string;
  cikti: VeriKodu[];
};

type Satir = [baslik: string, aciklama: string, atif: string, uyg: string, cikti: VeriKodu[]];

const tablo = (no: number, satirlar: Satir[]): Hedef[] =>
  satirlar.map(([baslik, aciklama, atif, uyg, cikti], i) => ({tablo: no, no: i + 1, baslik, aciklama, atif, uyg, cikti}));

export const HEDEFLER: Hedef[] = [
  ...tablo(1, [
    [
      'Yaşam döngüsü süreçlerinin faaliyetleri tanımlı',
      'Geliştirme süreçlerinde ve bütünleyici süreçlerde hangi işlerin yapılacağı, sistem gereksinimlerini ve yazılım seviyesini karşılayacak biçimde planlara yazılmıştır.',
      '4.1.a',
      'GGGG',
      PLANLAR,
    ],
    [
      'Yaşam döngüsü, süreç ilişkileri ve geçiş kriterleri tanımlı',
      'Süreçlerin sırası, birbirini nasıl beslediği, geri bildirim yolları ve bir süreçten ötekine hangi koşulla geçileceği bellidir.',
      '4.1.b',
      'GGG-',
      PLANLAR,
    ],
    [
      'Yaşam döngüsü ortamı seçilmiş ve tanımlı',
      'Geliştirme ve doğrulamada kullanılacak yöntemler, araçlar, derleyici ve test ortamı seçilmiş, planlarda tanımlanmıştır.',
      '4.1.c',
      'GGG-',
      PLANLAR,
    ],
    [
      'Ek hususlar ele alınmış',
      'Araç kalifikasyonu, önceden geliştirilmiş yazılım ya da alternatif yöntem gibi projeye özgü konular planlarda karşılığını bulmuştur.',
      '4.1.d',
      'GGGG',
      PLANLAR,
    ],
    [
      'Yazılım geliştirme standartları tanımlı',
      'Gereksinim, tasarım ve kodlama standartları, geliştirilecek yazılımın emniyet beklentileriyle tutarlı biçimde yazılmıştır.',
      '4.1.e',
      'GGG-',
      ['gerStd', 'tasStd', 'kodStd'],
    ],
    [
      'Planlar DO-178C ile uyumlu',
      'Planların standardın beklentilerini karşıladığı gözden geçirilerek gösterilmiş, sonuç kayda geçirilmiştir.',
      '4.1.f',
      'GGG-',
      ['svr'],
    ],
    [
      'Planların geliştirilmesi ve revizyonu eşgüdümlü',
      'Planlar birbiriyle tutarlıdır; biri değiştiğinde ötekilere etkisi izlenir ve birlikte güncellenir.',
      '4.1.g',
      'GGG-',
      ['svr'],
    ],
  ]),

  ...tablo(2, [
    [
      'Yüksek seviyeli gereksinimler geliştirilmiş',
      'Yazılıma tahsis edilen sistem gereksinimlerinden, yazılımın ne yapacağını anlatan yüksek seviyeli gereksinimler üretilmiştir.',
      '5.1.1.a',
      'GGGG',
      ['srd', 'izGelistirme'],
    ],
    [
      'Türetilmiş yüksek seviyeli gereksinimler tanımlanmış ve sistem süreçlerine iletilmiş',
      'Bir sistem gereksinimine doğrudan izlenemeyen gereksinimler ayrıca belirlenir; emniyet değerlendirmesi dahil sistem süreçlerine bildirilir.',
      '5.1.1.b',
      'GGGG',
      ['srd'],
    ],
    [
      'Yazılım mimarisi geliştirilmiş',
      'Yüksek seviyeli gereksinimlerden bileşenleri, arayüzleri, veri akışını ve kontrol akışını gösteren mimari çıkarılmıştır.',
      '5.2.1.a',
      'GGGG',
      ['tasarim'],
    ],
    [
      'Düşük seviyeli gereksinimler geliştirilmiş',
      'Kaynak kodun başka bilgiye gerek kalmadan yazılabileceği ayrıntıdaki gereksinimler üretilmiştir.',
      '5.2.1.a',
      'GGG-',
      ['tasarim', 'izGelistirme'],
    ],
    [
      'Türetilmiş düşük seviyeli gereksinimler tanımlanmış ve sistem süreçlerine iletilmiş',
      'Tasarım kararlarından doğan, üst gereksinime izlenemeyen gereksinimler emniyet değerlendirmesi dahil sistem süreçlerine bildirilir.',
      '5.2.1.b',
      'GGG-',
      ['tasarim'],
    ],
    [
      'Kaynak kod geliştirilmiş',
      'Düşük seviyeli gereksinimlerden ve mimariden, kodlama standardına uyan kaynak kod yazılmıştır.',
      '5.3.1.a',
      'GGG-',
      ['kaynak', 'izGelistirme'],
    ],
    [
      'Çalıştırılabilir nesne kodu ve varsa PDI dosyaları üretilmiş, hedef bilgisayara yüklenmiş',
      'Kaynak kod derlenip bağlanmış; ortaya çıkan imaj ve parametre verisi dosyaları donanım/yazılım entegrasyonu için hedef bilgisayara yüklenmiştir.',
      '5.4.1.a',
      'GGGG',
      ['eoc', 'pdi'],
    ],
  ]),

  ...tablo(3, [
    [
      'Yüksek seviyeli gereksinimler sistem gereksinimlerine uygun',
      'Yazılıma tahsis edilen sistem işlevleri gereksinimlerde doğru karşılanmıştır; türetilmiş gereksinimlerin neden var olduğu bellidir.',
      '6.3.1.a',
      'BBGG',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimler doğru ve tutarlı',
      'Her gereksinim açık, belirsizlikten uzak ve yeterince ayrıntılıdır; gereksinimler birbiriyle çelişmez.',
      '6.3.1.b',
      'BBGG',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimler hedef bilgisayarla uyumlu',
      'Gereksinimler donanımın ve işletim ortamının özellikleriyle, örneğin yanıt süreleri ve giriş/çıkış donanımıyla çatışmaz.',
      '6.3.1.c',
      'GG--',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimler doğrulanabilir',
      'Her gereksinimin sağlandığı test, analiz ya da gözden geçirmeyle gösterilebilecek biçimde yazılmıştır.',
      '6.3.1.d',
      'GGG-',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimler standartlara uygun',
      'Gereksinimler yazılım gereksinim standartlarına göre yazılmıştır; sapma varsa gerekçesi kayıtlıdır.',
      '6.3.1.e',
      'GGG-',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimler sistem gereksinimlerine izlenebilir',
      'Yazılıma tahsis edilen her sistem gereksinimi, yüksek seviyeli gereksinimlerde karşılığını bulmuştur.',
      '6.3.1.f',
      'GGGG',
      ['svr'],
    ],
    [
      'Algoritmalar doğru',
      'Gereksinimlerde önerilen algoritmaların doğruluğu ve davranışı, özellikle süreksizlik noktalarında doğrulanmıştır.',
      '6.3.1.g',
      'BBG-',
      ['svr'],
    ],
  ]),

  ...tablo(4, [
    [
      'Düşük seviyeli gereksinimler yüksek seviyeli gereksinimlere uygun',
      'Düşük seviyeli gereksinimler üst gereksinimleri eksiksiz karşılar; türetilmiş olanların tasarım gerekçesi bellidir.',
      '6.3.2.a',
      'BBG-',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimler doğru ve tutarlı',
      'Her düşük seviyeli gereksinim açık ve belirsizlikten uzaktır; gereksinimler birbiriyle çelişmez.',
      '6.3.2.b',
      'BBG-',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimler hedef bilgisayarla uyumlu',
      'Gereksinimler donanımın özellikleriyle; özellikle veri yolu yükü, yanıt süreleri ve giriş/çıkış donanımıyla çatışmaz.',
      '6.3.2.c',
      'GG--',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimler doğrulanabilir',
      'Her düşük seviyeli gereksinimin sağlandığı test, analiz ya da gözden geçirmeyle gösterilebilir.',
      '6.3.2.d',
      'GG--',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimler standartlara uygun',
      'Tasarım, yazılım tasarım standartlarına göre yapılmıştır; sapma varsa gerekçesi kayıtlıdır.',
      '6.3.2.e',
      'GGG-',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimler yüksek seviyeli gereksinimlere izlenebilir',
      'Her yüksek seviyeli gereksinim ve türetilmiş gereksinim, düşük seviyeli gereksinimlerde karşılığını bulmuştur.',
      '6.3.2.f',
      'GGG-',
      ['svr'],
    ],
    [
      'Algoritmalar doğru',
      'Tasarımda kullanılan algoritmaların doğruluğu ve davranışı, özellikle süreksizlik noktalarında doğrulanmıştır.',
      '6.3.2.g',
      'BBG-',
      ['svr'],
    ],
    [
      'Yazılım mimarisi yüksek seviyeli gereksinimlerle uyumlu',
      'Mimari üst gereksinimlerle çelişmez; bölümleme gibi sistem bütünlüğünü koruyan işlevlerde bu özellikle aranır.',
      '6.3.3.a',
      'BGG-',
      ['svr'],
    ],
    [
      'Yazılım mimarisi tutarlı',
      'Bileşenler arasındaki veri akışı ve kontrol akışı ilişkileri doğru kurulmuştur.',
      '6.3.3.b',
      'BGG-',
      ['svr'],
    ],
    [
      'Yazılım mimarisi hedef bilgisayarla uyumlu',
      'Mimari; başlatma, eşzamansız işleyiş, eşzamanlama ve kesmeler bakımından donanımla çatışmaz.',
      '6.3.3.c',
      'GG--',
      ['svr'],
    ],
    [
      'Yazılım mimarisi doğrulanabilir',
      'Mimari, sınırı belirsiz özyineleme gibi doğrulanması mümkün olmayan yapılar içermez.',
      '6.3.3.d',
      'GG--',
      ['svr'],
    ],
    [
      'Yazılım mimarisi standartlara uygun',
      'Mimari, tasarım standartlarındaki kısıtlara (örneğin karmaşıklık sınırlarına) uyar; sapma varsa gerekçesi kayıtlıdır.',
      '6.3.3.e',
      'GGG-',
      ['svr'],
    ],
    [
      'Yazılım bölümleme bütünlüğü doğrulanmış',
      'Bölümleme kullanılıyorsa, bir bölümün ötekini bellek ya da zaman yönünden etkileyemediği gösterilmiştir.',
      '6.3.3.f',
      'BGGG',
      ['svr'],
    ],
  ]),

  ...tablo(5, [
    [
      'Kaynak kod düşük seviyeli gereksinimlere uygun',
      'Kod, düşük seviyeli gereksinimleri doğru ve eksiksiz gerçekleştirir; gereksinimlerde olmayan işlev içermez.',
      '6.3.4.a',
      'BBG-',
      ['svr'],
    ],
    [
      'Kaynak kod yazılım mimarisine uygun',
      'Kod, mimaride tanımlanan veri akışına ve kontrol akışına uyar.',
      '6.3.4.b',
      'BGG-',
      ['svr'],
    ],
    [
      'Kaynak kod doğrulanabilir',
      'Kod doğrulanamayan ifade ya da yapı içermez; test edilebilmesi için değiştirilmesi gerekmez.',
      '6.3.4.c',
      'GG--',
      ['svr'],
    ],
    [
      'Kaynak kod standartlara uygun',
      'Kodlama standardına, karmaşıklık kısıtları dahil uyulmuştur; sapma varsa gerekçesi kayıtlıdır.',
      '6.3.4.d',
      'GGG-',
      ['svr'],
    ],
    [
      'Kaynak kod düşük seviyeli gereksinimlere izlenebilir',
      'Kodun her parçası bir düşük seviyeli gereksinime bağlanır; gereksinimlerin tamamı kodda karşılığını bulmuştur.',
      '6.3.4.e',
      'GGG-',
      ['svr'],
    ],
    [
      'Kaynak kod doğru ve tutarlı',
      'Yığın ve bellek kullanımı, taşma, kaynak çekişmesi, en kötü durum yürütme süresi, istisna işleme ve başlatılmamış değişken gibi konularda kodun doğruluğu gözden geçirme ve analizle gösterilmiştir.',
      '6.3.4.f',
      'BGG-',
      ['svr'],
    ],
    [
      'Entegrasyon sürecinin çıktısı tam ve doğru',
      'Derleme, bağlama ve yükleme verileri ile bellek haritası gözden geçirilmiş; hatalı adres, bellek çakışması ve eksik bileşen aranmıştır.',
      '6.3.5.a',
      'GGG-',
      ['svr'],
    ],
    [
      'PDI dosyası doğru ve eksiksiz',
      'Dosya, yüksek seviyeli gereksinimlerde tanımlı yapıya uyar; her öğenin değeri doğrudur ve öbür öğelerle tutarlıdır.',
      '6.6.a',
      'BBGG',
      ['svcp', 'svr'],
    ],
    [
      'PDI dosyasının doğrulaması tamamlanmış',
      'Dosyadaki bütün öğeler doğrulama sırasında ele alınmıştır; bakılmadan geçilen öğe kalmamıştır.',
      '6.6.b',
      'BBG-',
      ['svr'],
    ],
  ]),

  ...tablo(6, [
    [
      'Çalıştırılabilir nesne kodu yüksek seviyeli gereksinimlere uygun',
      'Normal aralıktaki test durumlarıyla, kodun yüksek seviyeli gereksinimleri karşıladığı gösterilmiştir.',
      '6.4.a',
      'GGGG',
      TEST_VERISI,
    ],
    [
      'Çalıştırılabilir nesne kodu yüksek seviyeli gereksinimlere göre gürbüz',
      'Geçersiz girdilerde ve anormal koşullarda kodun yüksek seviyeli gereksinimlerin öngördüğü biçimde davrandığı test edilmiştir.',
      '6.4.b',
      'GGGG',
      TEST_VERISI,
    ],
    [
      'Çalıştırılabilir nesne kodu düşük seviyeli gereksinimlere uygun',
      'Normal aralıktaki test durumlarıyla, kodun düşük seviyeli gereksinimleri karşıladığı gösterilmiştir.',
      '6.4.c',
      'BBG-',
      TEST_VERISI,
    ],
    [
      'Çalıştırılabilir nesne kodu düşük seviyeli gereksinimlere göre gürbüz',
      'Geçersiz girdilerde ve anormal koşullarda kodun düşük seviyeli gereksinimlerin öngördüğü biçimde davrandığı test edilmiştir.',
      '6.4.d',
      'BGG-',
      TEST_VERISI,
    ],
    [
      'Çalıştırılabilir nesne kodu hedef bilgisayarla uyumlu',
      'Kod hedef donanımda koşturulmuş; donanım/yazılım entegrasyonuna özgü hatalar aranmıştır.',
      '6.4.e',
      'GGGG',
      ['svcp', 'svr'],
    ],
  ]),

  ...tablo(7, [
    [
      'Test prosedürleri doğru',
      'Test durumları, beklenen sonuçlarıyla birlikte test prosedürlerine doğru aktarılmıştır.',
      '6.4.5.b',
      'BGG-',
      ['svr'],
    ],
    [
      'Test sonuçları doğru, tutarsızlıklar açıklanmış',
      'Gerçekleşen sonuçlar beklenenle karşılaştırılmış; aradaki her fark açıklanmıştır.',
      '6.4.5.c',
      'BGG-',
      ['svr'],
    ],
    [
      'Yüksek seviyeli gereksinimlerin test kapsamı sağlanmış',
      'Her yüksek seviyeli gereksinim için normal aralık ve gürbüzlük test durumları vardır; eksik kalan gereksinim giderilmiştir.',
      '6.4.4.a',
      'BGGG',
      ['svr'],
    ],
    [
      'Düşük seviyeli gereksinimlerin test kapsamı sağlanmış',
      'Her düşük seviyeli gereksinim için normal aralık ve gürbüzlük test durumları vardır; eksik kalan gereksinim giderilmiştir.',
      '6.4.4.b',
      'BGG-',
      ['svr'],
    ],
    [
      'Yapısal kapsam sağlanmış: MC/DC',
      'Her koşulun karar sonucunu tek başına değiştirebildiği, gereksinim tabanlı testlerin koşusuyla gösterilmiştir.',
      '6.4.4.c',
      'B---',
      ['svr'],
    ],
    [
      'Yapısal kapsam sağlanmış: karar kapsama',
      'Gereksinim tabanlı testlerde her karar hem doğru hem yanlış sonuçlanmış, her giriş ve çıkış noktası çalışmıştır.',
      '6.4.4.c',
      'BB--',
      ['svr'],
    ],
    [
      'Yapısal kapsam sağlanmış: satır kapsama',
      'Gereksinim tabanlı testlerde kodun her satırı en az bir kez yürütülmüştür.',
      '6.4.4.c',
      'BBG-',
      ['svr'],
    ],
    [
      'Yapısal kapsam sağlanmış: veri ve kontrol bağlaşımı',
      'Bileşenler arasındaki veri ve kontrol bağımlılıklarının gereksinim tabanlı testlerle çalıştırıldığı analizle gösterilmiştir.',
      '6.4.4.d',
      'BBG-',
      ['svr'],
    ],
    [
      'Kaynak koda izlenemeyen ek kod doğrulanmış',
      'Derleyicinin ürettiği, kaynak kod satırına doğrudan izlenemeyen nesne kodunun doğruluğu ayrıca gösterilmiştir.',
      '6.4.4.c',
      'B---',
      ['svr'],
    ],
  ]),

  ...tablo(8, [
    [
      'Konfigürasyon öğeleri tanımlanmış',
      'Her yaşam döngüsü verisi benzersiz bir kimlik ve sürümle etiketlenmiştir.',
      '7.1.a',
      'GGGG',
      ['scmKayit'],
    ],
    [
      'Temel çizgiler ve izlenebilirlik kurulmuş',
      'Onaylı temel çizgiler tanımlanmıştır; bir temel çizginin öncekinden nasıl türediği izlenebilir.',
      '7.1.b',
      'GGGG',
      ['sci', 'scmKayit'],
    ],
    [
      'Problem raporlama, değişiklik kontrolü, değişiklik gözden geçirmesi ve konfigürasyon durum muhasebesi kurulmuş',
      'Uyumsuzluklar kayda geçer; değişiklikler yetkiyle yapılır, etkisi gözden geçirilir ve her öğenin güncel durumu raporlanabilir.',
      '7.1.c–f',
      'GGGG',
      ['pr', 'scmKayit'],
    ],
    [
      'Arşivleme, geri getirme ve sürüm teslimi kurulmuş',
      'Veri korunarak saklanır ve gerektiğinde aynı yazılımı yeniden üretecek biçimde geri getirilebilir; yalnızca yetkilendirilmiş sürümler teslim edilir.',
      '7.1.g',
      'GGGG',
      ['scmKayit'],
    ],
    [
      'Yazılım yükleme kontrolü kurulmuş',
      'Çalıştırılabilir nesne kodunun ve PDI dosyalarının hedefe doğru parça numarasıyla ve bozulmadan yüklendiği güvence altındadır.',
      '7.1.h',
      'GGGG',
      ['scmKayit'],
    ],
    [
      'Yaşam döngüsü ortamının kontrolü kurulmuş',
      'Yazılımı üretmek ve doğrulamak için kullanılan araçlar tanımlıdır, kontrol altındadır ve ortam yeniden kurulabilir.',
      '7.1.i',
      'GGGG',
      ['seci', 'scmKayit'],
    ],
  ]),

  ...tablo(9, [
    [
      'Planlar ve standartlar geliştirilmiş, DO-178C ile uyumu ve tutarlılığı gözden geçirilmiş',
      'Kalite güvencesi, planların ve standartların yazıldığına ve hem standartla hem birbiriyle tutarlılığının gözden geçirildiğine dair güvence elde etmiştir.',
      '8.1.a',
      'BBB-',
      ['sqaKayit'],
    ],
    [
      'Süreçler onaylı planlara uygun yürüyor',
      'Kalite güvencesi, işlerin planlarda yazıldığı gibi yapıldığını denetleyerek doğrular; sapmalar kayda geçer ve izlenir.',
      '8.1.b',
      'BBBB',
      ['sqaKayit'],
    ],
    [
      'Süreçler onaylı standartlara uygun yürüyor',
      'Kalite güvencesi, gereksinim, tasarım ve kodlama standartlarına uyulduğunu denetleyerek doğrular.',
      '8.1.b',
      'BBB-',
      ['sqaKayit'],
    ],
    [
      'Geçiş kriterleri sağlanmış',
      'Bir süreçten ötekine, planlarda tanımlı geçiş kriterleri karşılanarak geçildiği denetlenmiştir.',
      '8.1.c',
      'BBB-',
      ['sqaKayit'],
    ],
    [
      'Yazılım uygunluk gözden geçirmesi yapılmış',
      'Teslimden önce, yaşam döngüsü verisinin tam olduğu ve çalıştırılabilir nesne kodunun bu veriden yeniden üretilebildiği gözden geçirilmiştir.',
      '8.1.d',
      'BBBB',
      ['sqaKayit'],
    ],
  ]),

  ...tablo(10, [
    [
      'Başvuru sahibi ile sertifikasyon otoritesi arasında iletişim ve ortak anlayış kurulmuş',
      'Yazılımın nasıl geliştirileceği otoriteyle erken ve düzenli paylaşılır; beklentiler iki tarafta aynı anlaşılır.',
      '9.a',
      'GGGG',
      ['psac'],
    ],
    [
      'Uyum yöntemi önerilmiş, PSAC üzerinde mutabakat sağlanmış',
      'Hedeflerin nasıl karşılanacağı PSAC ile otoriteye sunulmuş ve plan üzerinde anlaşılmıştır.',
      '9.b',
      'GGGG',
      ['psac'],
    ],
    [
      'Uyum kanıtı sunulmuş',
      'Hedeflerin karşılandığı, yazılım başarı özeti ve konfigürasyon indeksiyle otoriteye gösterilmiştir.',
      '9.c',
      'GGGG',
      ['sas', 'sci'],
    ],
  ]),
];

/* ---------- Yardımcılar ---------- */

export const kimlik = (h: Hedef): string => `A-${h.tablo}.${h.no}`;

export const veriOf = (v: VeriKodu): Veri => VERILER[v];

export const durumOf = (h: Hedef, s: SeviyeE): Durum => (s === 'E' ? '-' : (h.uyg[SEVIYELER.indexOf(s)] as Durum));

export const kkOf = (v: VeriKodu, s: Seviye): 'CC1' | 'CC2' | null => {
  const k = VERILER[v].kk[SEVIYELER.indexOf(s)];
  return k === '1' ? 'CC1' : k === '2' ? 'CC2' : null;
};

export type Sayim = {hedef: number; bagimsiz: number};

export function say(s: SeviyeE, tabloNo?: number): Sayim {
  const sayim = {hedef: 0, bagimsiz: 0};
  for (const h of HEDEFLER) {
    if (tabloNo !== undefined && h.tablo !== tabloNo) continue;
    const d = durumOf(h, s);
    if (d !== '-') sayim.hedef += 1;
    if (d === 'B') sayim.bagimsiz += 1;
  }
  return sayim;
}

/** Seviyede geçerli hedeflerin çıktısı olan veri öğeleri, bölüm 11 sırasıyla */
export function verilerOf(s: SeviyeE): VeriKodu[] {
  const kullanilan = new Set<VeriKodu>();
  for (const h of HEDEFLER) if (durumOf(h, s) !== '-') for (const v of h.cikti) kullanilan.add(v);
  return (Object.keys(VERILER) as VeriKodu[]).filter((v) => kullanilan.has(v));
}

/** İki seviye arasında bir hedefin durumu nasıl değişir (taban → seçili) */
export type Fark = 'yeni' | 'bagimsizlik' | 'duser' | 'bagimsizlikKalkar' | null;

export function farkOf(h: Hedef, secili: SeviyeE, taban: SeviyeE): Fark {
  const d = durumOf(h, secili);
  const t = durumOf(h, taban);
  if (d === t) return null;
  if (t === '-') return 'yeni';
  if (d === '-') return 'duser';
  return d === 'B' ? 'bagimsizlik' : 'bagimsizlikKalkar';
}

/* ---------- Sağlama ---------- */

// Standardın bilinen toplamları: bir hücre yanlışlıkla değişirse derleme durur
const BEKLENEN: Record<Seviye, Sayim> = {
  A: {hedef: 71, bagimsiz: 30},
  B: {hedef: 69, bagimsiz: 18},
  C: {hedef: 62, bagimsiz: 5},
  D: {hedef: 26, bagimsiz: 2},
};

for (const s of SEVIYELER) {
  const {hedef, bagimsiz} = say(s);
  if (hedef !== BEKLENEN[s].hedef || bagimsiz !== BEKLENEN[s].bagimsiz) {
    throw new Error(`DO-178C hedef verisi tutarsız: Seviye ${s} için ${hedef} hedef, ${bagimsiz} bağımsızlık hesaplandı`);
  }
}
for (const h of HEDEFLER) {
  if (!/^[BG-]{4}$/.test(h.uyg)) throw new Error(`${kimlik(h)}: geçersiz geçerlilik dizgisi "${h.uyg}"`);
  // Geçerlilik seviyeyle birlikte daralır: düşük seviyede aranan hedef üst seviyede de aranır
  if (/-[BG]/.test(h.uyg)) throw new Error(`${kimlik(h)}: geçerlilik seviyeyle tutarlı değil`);
  for (const s of SEVIYELER) {
    if (durumOf(h, s) === '-') continue;
    for (const v of h.cikti) if (!kkOf(v, s)) throw new Error(`${kimlik(h)}: ${v} verisinin Seviye ${s} kategorisi yok`);
  }
}
