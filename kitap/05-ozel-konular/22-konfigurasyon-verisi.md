---
title: "22. Konfigürasyon Verisi"
sidebar_position: 6
---

# 22. Konfigürasyon Verisi

Konfigürasyon verisi (configuration data), kod değişmeden yazılımın davranışını
belirleyen parametre ve tablolardır. DO-178C, koddan ayrı yönetilen bu tür veriyi parametre
verisi öğesi (parameter data item, PDI) adıyla ele alır ve kod kadar sıkı doğrulanmasını
bekler.

Bu bölüm, hangi verinin hangi kurallarla yönetildiğini, PDI'nin koddan ayrı
doğrulanabilmesinin koşullarını ve verinin sürüm, uyumluluk ve değer hatalarına karşı
nasıl korunacağını anlatır.

## Konfigürasyon verisi nedir ve neden kod kadar önemlidir?

Aviyonik yazılımın davranışı yalnızca koddan okunmaz. Aynı çalıştırılabilir nesne kodu
(executable object code), okuduğu veriye göre farklı bir motor tipinin limitlerini
uygular, farklı bir bölgenin frekans tablosunu kullanır ya da opsiyonel bir işlevi açıp
kapatır. Kod sabit kalırken davranışı değiştiren bu veriye konfigürasyon verisi denir.
Uygulamada dört türü öne çıkar:

- **Eşik ve limit değerleri:** uyarı eşikleri, zaman aşımı süreleri, motor ya da uçak
  tipine göre değişen limitler.
- **Tablolar:** kalibrasyon eğrileri, frekans ve kanal tabloları, arama tabloları.
- **Seçenek verisi:** opsiyonel donanımın takılı olup olmadığı, müşteri seçenekleri,
  ölçü birimi tercihleri.
- **Platform tanımları:** giriş/çıkış eşlemeleri, veri yolu adresleri, bölümlere ayrılan
  bellek ve zaman bütçeleri.

Bu verinin kod kadar önemli olmasının nedeni basittir: yanlış bir değer, hatasız bir kodu
yanlış çalıştırır. Üstelik veri hatası kod hatasından daha sessizdir. Derleyici uyarı
vermez, statik analiz bir şey görmez, kod gözden geçirmesi eşiğin 950 yerine 590
yazıldığını fark edemez; gereksinim tabanlı testler de çoğu zaman uçağa yüklenecek
dosyayla değil, bir test veri kümesiyle koşulmuştur.

Verinin yokluğu, yanlışlığı kadar tehlikelidir. 2015'te Sevilla'da bir A400M, teslim
öncesi ilk test uçuşunda düştü. Üretici, üç motorun kalkıştan kısa süre sonra güç
kumandasına yanıt vermediğini ve sorunun son montajdaki yazılım yüklemesinden
kaynaklandığını açıkladı; soruşturmadan kamuoyuna yansıyan bilgiye göre bu yükleme
sırasında üç motorun kontrol birimindeki tork kalibrasyon parametreleri silinmişti. Kodun
tek satırı değişmemişti; eksik olan veriydi.

Adlandırmayla ilgili iki not, sonraki karışıklıkları önler. Birincisi, konfigürasyon
verisi ile konfigürasyon yönetimi (configuration management) ayrı şeylerdir: ilki
yazılımın davranışını ayarlayan veridir, ikincisi bütün yaşam döngüsü verisini
kimliklendirip kontrol altında tutan süreçtir (bkz.
[10. Yazılım Konfigürasyon Yönetimi](../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md)).
Konfigürasyon verisi, o sürecin yönettiği öğelerden yalnızca biridir. İkincisi,
"konfigürasyon verisi" gündelik bir şemsiye terimdir; DO-178C'nin tanımladığı kavram
PDI'dir ve davranışı etkileyen her veri PDI değildir.

## Hangi veri hangi rejime girer?

Davranışı etkileyen verinin hepsi aynı kurallarla yönetilmez. Rejimi üç soru belirler:
veri çalıştırılabilir nesne kodunun içinde mi dışında mı, onu kim değiştirebilir ve
yanlış bir değer emniyeti etkileyebilir mi?

| Veri türü | Tipik örnek | Kim değiştirir? | Nasıl güvence altına alınır? | İlgili bölüm |
|---|---|---|---|---|
| Koda gömülü sabit ve tablo | Derleme zamanı sabiti, kaynak koddaki sabit dizi | Geliştirici; her değişiklik yeni derlemedir | Çalıştırılabilir nesne kodunun parçasıdır; kodla birlikte gözden geçirilir ve test edilir. PDI değildir | [8. Yazılım Gerçekleştirme: Kodlama ve Entegrasyon](../03-do178c-ile-gelistirme/08-yazilim-gerceklestirme-kodlama-entegrasyon.md) |
| Parametre verisi öğesi | Motor limit tablosu, kalibrasyon dosyası, frekans tablosu | Geliştirici ya da entegratör; onaylı süreçle | Onaylı konfigürasyonun parçasıdır; her dosya doğrulanır, koşulları sağlanırsa koddan ayrı | Bu bölüm |
| Seçenek verisi | Yazılımla programlanan seçenek, pin programlama girişi | Uçak üreticisi ya da kurulumu yapan kuruluş; onaylı seçenekler arasından | Seçilmeyen işlevin kodu devre dışı bırakılmış kod sayılır; onaylanmamış konfigürasyonun istem dışı seçilemeyeceği gösterilir | [17. Kapsanmayan Kodlar: Ölü, Gereksiz ve Devre Dışı Bırakılmış Kodlar](./17-kapsanmayan-kodlar.md) |
| Platform konfigürasyon tabloları | ARINC 653 zaman çizelgesi, bellek ve port tabloları | Platform entegratörü | Genellikle PDI olarak yönetilir; bölümleme analizinin girdisidir | [21. Yazılım Bölümlemesi](./21-yazilim-bolumlemesi.md) |
| Kullanıcı tarafından değiştirilebilir veri | Emniyeti etkilemediği gösterilmiş operatör tercihleri | Operatör; belirlenmiş kısıtlar içinde | Onaylanan, verinin kendisi değil koruma mekanizması ve değişiklik kısıtlarıdır | [19. Kullanıcı Tarafından Değiştirilebilir Yazılım](./19-kullanici-tarafindan-degistirilebilir-yazilim.md) |
| Havacılık veri tabanı | Seyrüsefer, arazi ve engel verisi | Veri tedarikçisi; dönemsel güncellemeyle | Veri zinciri DO-200B / ED-76A ile güvence altına alınır; veriyi okuyan kod DO-178C kapsamındadır | [23. Havacılık Verileri](./23-havacilik-verileri.md) |

Tabloda "sahada yüklenen veri" diye bir satır yoktur, çünkü sahada yükleme bir veri türü
değil, bir teslim yoludur. PDI dosyası da seçenek dosyası da uçakta, ekipman sökülmeden
yüklenebilir; o zaman bu bölümdeki kurallara
[18. Sahada Yüklenebilir Yazılım](./18-sahada-yuklenebilir-yazilim.md) bölümündeki
yükleme, bütünlük ve parça kimliği koşulları eklenir.

**PDI ile kullanıcı tarafından değiştirilebilir veri.** En sık karıştırılan iki satır
bunlardır, çünkü ikisi de "parametre tablosu" biçiminde görünür. Ayrım verinin türünde
değil, kimin hangi güvenceyle değiştirdiğindedir. PDI onaylı yazılım konfigürasyonunun
parçasıdır: her dosyanın doğru değerleri taşıdığı gösterilir ve değişen dosya, yeni bir
onaylı konfigürasyon demektir. Kullanıcı tarafından değiştirilebilir yazılımda
(user-modifiable software, UMS) ise veri, ilk sertifikasyonda belirlenen kısıtlar içinde
kalındığı sürece otoritenin ya da üreticinin gözden geçirmesi olmadan operatörce
değiştirilir. Bu ancak kısıtlar içindeki hiçbir değişikliğin emniyeti olumsuz
etkileyemeyeceği sistem düzeyinde gösterilmişse mümkündür. Pratik ölçüt şudur: veri için
"doğru değer" diye bir şey varsa ve yanlış değer emniyeti etkileyebiliyorsa o veri PDI
olarak (ya da kodun içinde) yönetilir; koruma mekanizmasının izin verdiği her değer
emniyetliyse UMS adayıdır. Biçim açısından ikisi çakışabilir: operatörün değiştireceği
veri de ayrı bir konfigürasyon öğesi olarak tutulabilir ve DO-178C, kullanım biçimi bunu
gerektirdiğinde PDI'ye UMS rehberliğinin de uygulanmasını ister.

**Seçenek verisi.** DO-178C, opsiyonel işlevlerin donanım pinleri yerine yazılımla
programlanan seçeneklerle seçildiği durumu seçenekle seçilebilir yazılım
(option-selectable software) adıyla anar ve onaylanmamış bir konfigürasyonun istem dışı
seçilememesini bekler. Seçenek kapalıyken çalışmayan kod, devre dışı bırakılmış kod
(deactivated code) olarak ele alınır. Seçenekler koddan ayrı bir dosyada tutuluyorsa o
dosya çoğu zaman PDI dosyası olarak da yönetilir; iki rejim birbirini dışlamaz, üst üste
biner.

**Platform tabloları.** Bölümlemeli bir işletim sisteminde hangi bölümün (partition) ne
kadar bellek ve hangi zaman penceresini alacağını söyleyen tablolar, uygulama kodunda
tek satır değişmeden bütün sistemin zamanlamasını değiştirir. Bu tablolardaki bir hata
tek bir işlevi değil, bölümlemenin kendisini bozar; bu yüzden bölümlemeyi sağlayan
platform yazılımının seviyesinde doğrulanırlar (çizelgeleme tarafı için bkz.
[20. Gerçek Zamanlı İşletim Sistemleri](./20-gercek-zamanli-isletim-sistemleri.md)).

## Parametre verisi öğeleri ve DO-178C

DO-178C, önceki sürümde muğlak kalan bir soruya doğrudan cevap verir: kodun
dışında tutulan ama davranışı belirleyen veri nasıl sertifiye edilir? Bunun için
**parametre verisi öğesi** kavramı tanımlanmıştır. PDI, çalıştırılabilir nesne kodunu
değiştirmeden yazılımın davranışını etkileyen ve ayrı bir konfigürasyon öğesi
(configuration item) olarak yönetilen veri kümesidir. Standart iki adı ayırır: PDI,
öğelerinin yapısı ve öznitelikleriyle tanımlanan kümedir; PDI dosyası ise bu kümenin her
öğesine değer atanmış, hedef bilgisayarın doğrudan kullanabildiği bir örneğidir. Aynı
PDI'nin birden çok dosyası olabilir.

Bu kavramın asıl kazandırdığı şey **ayrık yaşam döngüsüdür**: çalıştırılabilir
nesne kodu bir kez üretilip doğrulandıktan sonra, yalnızca PDI dosyası değişerek
yeni bir uçak konfigürasyonu tanımlanabilir. Kod yeniden derlenmez, kodun test
kampanyası tekrarlanmaz; yalnızca yeni veri, kendi doğrulama sürecinden geçirilir.
Bu, bölge frekans tabloları, motor tipine göre limitler veya müşteri seçenekleri
gibi sık değişen veriler için ciddi bir verimlilik sağlar.

### Ayrı doğrulamanın koşulları

Bunun bedava olmadığını da baştan söylemek gerekir. Zemin, PDI'nin **yapısının ve
özniteliklerinin** (tip, birim, sınır, çözünürlük) açıkça tanımlanmasıdır. Bu tanım,
kodun veriyi nasıl kullandığıyla birlikte yüksek seviyeli gereksinim (high-level
requirement) olarak yazılır ve izlenebilirlik (traceability) kurulur; veri kodla birlikte
doğrulanacak olsa da bu beklenti değişmez. Ayrık yaşam döngüsü ise ancak DO-178C'nin PDI
doğrulamasına ayırdığı maddede (6.6) aranan dört koşulun tümü sağlandığında
savunulabilir:

- Çalıştırılabilir nesne kodunun, tanımlı yapıya uyan **her geçerli PDI değeriyle**
  doğru çalıştığı normal aralık testleriyle gösterilir. Kodun doğrulaması tek bir veri
  kümesine göre değil, veri zarfının (data envelope) tamamına göre yapılır; aksi hâlde
  her yeni PDI dosyası kodun yeniden testini gerektirir.
- Kod, tanımlı yapı ve özniteliklere **uymayan** PDI dosyasına karşı gürbüzdür
  (robust): bozuk, eksik, yanlış sürümlü ya da aralık dışı değer taşıyan dosyayla
  karşılaştığında gereksinimlerde öngörülen tepkiyi verir. Bu, gürbüzlük testleriyle
  gösterilir.
- PDI içeriğinin kodda yol açabileceği **bütün davranış doğrulanabilir** olmalıdır.
  Veri yalnızca eşik ve tablo değeri taşıyorsa bu kolaydır; adres, ofset ya da
  yorumlanan komut dizisi taşımaya başladığında davranış uzayı sınırlanamaz hâle gelir
  ve koşul zorlanır.
- Yaşam döngüsü verisinin yapısı PDI'nin **ayrı yönetilmesine** izin verir: gereksinimi,
  izlenebilirliği, doğrulama kaydı ve konfigürasyon kimliği koddan ayrı tutulabilir.

Bu koşullardan biri sağlanamıyorsa PDI, çalıştırılabilir nesne koduyla **birlikte**
doğrulanır; yani her yeni dosya, kodun ilgili testlerinin o dosyayla yeniden koşulması
demektir. Koşullar sağlandığında da her PDI dosyasının kendi doğrulaması kalır. DO-178C
bunu, kodlama ve entegrasyon çıktılarının doğrulandığı Tablo A-5'teki iki hedefle ister;
kanıt test, analiz ve gözden geçirmenin bir bileşimiyle üretilebilir:

| Hedef (Tablo A-5) | Dosya için sorulan soru | Hangi seviyelerde? |
|---|---|---|
| 8: PDI dosyası doğru ve eksiksizdir | Dosya, yüksek seviyeli gereksinimlerdeki yapıya uyuyor ve orada tanımlanmamış öğe taşımıyor mu? Her öğenin değeri doğru, özniteliklerine uygun ve diğer öğelerle tutarlı mı (örneğin uyarı eşiği limitin altında mı)? | Seviye A–D; A ve B'de bağımsızlıkla |
| 9: PDI dosyasının doğrulaması tamamlanmıştır | Dosyadaki öğelerin hepsi doğrulama sırasında ele alındı mı, bakılmadan geçilen öğe kaldı mı? | Seviye A–C; A ve B'de bağımsızlıkla |

Her öğede aynı derinlik gerekmez: kimi öğede özniteliklere uygunluğu göstermek yeter,
kimisinde değerin kendisi doğrulanır. Hangi öğenin hangi gruba girdiği doğrulama
planında gerekçesiyle yazılmalıdır.

Dosyanın, birlikte çalışacağı çalıştırılabilir nesne kodu sürümüyle **uyumluluğu** bu
iki hedefin dışında, ayrıca ele alınır. Standart, yükleme kontrolü ile uyumluluğun
planlamada ele alınmasını ister ve sahada yüklenen PDI için bozuk dosyanın ve kodla
uyumsuzluğun saptanmasına özellikle dikkat çeker. Bunun için PDI dosyası tipik olarak bir
başlık taşır: yapı tanımının sürümü, uyumlu yazılımın parça numarası ve dosyanın bütününü
kapsayan bir döngüsel artıklık denetimi (cyclic redundancy check, CRC) değeri. Yazılım bu
başlığı yükleme sırasında ve her açılışta denetler.

PDI dosyası yazılım seviyesini (software level) kod üzerinden miras alır: Seviye A bir yazılımın
davranışını belirleyen tablo, Seviye A titizliğiyle doğrulanır. Ayrıca PDI dosyası
konfigürasyon yönetimi açısından kendi başına bir konfigürasyon öğesidir — kendi parça
numarası, kendi sürüm geçmişi, kendi problem raporları olur.

```mermaid
flowchart LR
  GER["PDI yapı ve öznitelik tanımı - gereksinimler"] --> KOD["Kaynak kod ve çalıştırılabilir nesne kodu"]
  GER --> PDI["PDI dosyası"]
  KOD --> DK["Kod doğrulaması: tüm geçerli veri zarfı"]
  PDI --> DP["PDI doğrulaması: değerler, yapı, eksiksizlik"]
  DK --> UY["Uyumluluk kontrolü ve birlikte yükleme"]
  DP --> UY
```

### Veri zarfına göre doğrulama pratikte ne demektir?

Veri zarfı, gereksinimlerdeki öznitelik sınırlarının toplamıdır ve test durumlarına
doğrudan çevrilir: her öğe için alt sınır, üst sınır ve tipik değer; birbirine bağlı
öğeler için uç bileşimler (en küçük ve en büyük tablo boyutu gibi). Bu testler uçağa
gidecek dosyayla değil, zarfın köşelerini bilerek zorlayan **test PDI dosyalarıyla**
koşulur; bu dosyalar da doğrulama durumlarının parçası olarak konfigürasyon kontrolü
altında tutulur.

Yapısal kapsam analizi (structural coverage analysis) aynı mantığı izler. Bir kararın
koşulu PDI'den geliyorsa, tek bir dosyayla koşulan testler o kararın yalnızca bir yönünü
görür; boşluk, zarfın öbür ucundaki bir test dosyasıyla kapatılır. Yol zarftaki hiçbir
dosyayla çalıştırılamıyorsa kapsanmayan kod için bilinen sorular sorulur: gereksinim mi
eksiktir, kod mu gereksizdir, yoksa yol tasarım gereği devre dışı mı bırakılmıştır? En
kötü durum yürütme süresi (worst-case execution time, WCET) ve bellek kullanımı da zarfın
en ağır ucuna (en uzun tablo, en çok kayıt) göre analiz edilir; yoksa "yalnızca veri" olan
bir güncelleme zaman bütçesini aşabilir.

Zarf, değişikliklerde karar ölçütü olur. Yeni bir PDI dosyası zarfın içinde kalıyorsa
değişiklik etki analizi (change impact analysis) yalnızca dosyanın doğrulanmasını ve
uyumluluk kaydının güncellenmesini gerektirir. Dosya zarfın dışına çıkıyorsa — yeni bir
alan, genişleyen bir aralık, büyüyen bir tablo — bu bir veri güncellemesi değil,
gereksinim değişikliğidir ve kodun etkilenen kısmı yeniden doğrulanır. DO-178C'nin
beklentisi de bu yöndedir: PDI'nin yapısı ya da öznitelikleri değiştiğinde kodun
değiştirilmesi ve yeniden doğrulanması gerekip gerekmediği analiz edilir. Zarfı gereğinden
dar tanımlamak ileride her yeni konfigürasyonda kod doğrulamasını yeniden açar;
gereğinden geniş tanımlamak bugünkü test yükünü büyütür. Bu denge, proje başında bilerek
kurulmalıdır.

### PDI dosyasının üretimi ve değerlerin kaynağı

Pratikte en sık görülen hata, PDI'yi "sadece veri" sayıp doğrulamasını üretim
betiklerine gömülü birkaç otomatik kontrole indirgemektir. Değerin *kaynağının*
doğrulanması — örneğin bir frekans tablosundaki her satırın onaylı bir sistem
verisine dayandığının gösterilmesi — otomatik biçim kontrolünün yapamayacağı,
gözden geçirme gerektiren bir iştir. Denetimde sorulan soru da genellikle budur: "Bu
dosyadaki şu değer nereden geldi, kim neye karşı doğruladı?"

PDI dosyaları çoğunlukla elle yazılmaz; bir tablodan ya da veri tabanından ikili dosya
üreten bir araçla oluşturulur. Bu aracın çıktısı uçağa yüklenen yazılımın parçasıdır.
Çıktı ayrıca doğrulanıyorsa — örneğin ikili dosya bağımsız bir yolla geri okunup kaynak
değerlerle karşılaştırılıyorsa — araca güvenmek gerekmez; doğrulanmıyorsa araç
kalifikasyonu gündeme gelir (bkz.
[13. DO-330 ve Yazılım Aracı Kalifikasyonu](../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)).

## Konfigürasyon verisi örneği: motor limit tablosu

Bir motor izleme işlevinin, motor tipine göre değişen limitleri bir PDI dosyasından
okuduğunu düşünelim. Yapı tanımı gereksinimlerde yazılıdır; koddaki karşılığı ve
yazılımın dosyayı kullanmadan önce yaptığı denetim şöyle olabilir:

```c
#define PDI_SEMA_SURUMU      (3u)           /* kodun beklediği yapı sürümü      */
#define PDI_UYUMLU_YAZILIM   (0x00A71503u)  /* çekirdek yazılımın parça kimliği */
#define EGT_MIN_C            (600)          /* gereksinimlerdeki alt sınır      */
#define EGT_MAX_C            (1100)         /* gereksinimlerdeki üst sınır      */
#define N1_MIN_BINDE         (900u)         /* %90,0                            */
#define N1_MAX_BINDE         (1100u)        /* %110,0                           */

typedef struct {
    uint32_t sema_surumu;     /* yapı tanımının sürümü                       */
    uint32_t uyumlu_yazilim;  /* birlikte onaylanan çekirdek yazılım kimliği */
    int16_t  egt_uyari_c;     /* egzoz gazı sıcaklığı uyarı eşiği, °C        */
    int16_t  egt_limit_c;     /* egzoz gazı sıcaklığı limiti, °C             */
    uint16_t n1_limit_binde;  /* fan devri limiti, binde (%0,1)              */
    uint16_t ayrilmis;        /* kullanılmıyor; sıfır olmalı                 */
    uint32_t crc32;           /* önceki tüm alanların CRC değeri             */
} motor_pdi_t;

typedef enum {
    PDI_GECERLI = 0,
    PDI_BOZUK,
    PDI_UYUMSUZ,
    PDI_ARALIK_DISI
} pdi_durum_t;

/* CRC-32 hesabı; başka bir birimde tanımlıdır. */
uint32_t crc32_hesapla(const uint8_t *veri, size_t boyut);

pdi_durum_t motor_pdi_denetle(const motor_pdi_t *p)
{
    pdi_durum_t durum;

    if (p == NULL) {
        durum = PDI_BOZUK;                /* dosya yok                      */
    } else if (crc32_hesapla((const uint8_t *)p,
                             offsetof(motor_pdi_t, crc32)) != p->crc32) {
        durum = PDI_BOZUK;                /* bütünlük                       */
    } else if ((p->sema_surumu != PDI_SEMA_SURUMU) ||
               (p->uyumlu_yazilim != PDI_UYUMLU_YAZILIM)) {
        durum = PDI_UYUMSUZ;              /* yapı ve yazılım uyumluluğu     */
    } else if ((p->egt_limit_c < EGT_MIN_C) || (p->egt_limit_c > EGT_MAX_C) ||
               (p->egt_uyari_c < EGT_MIN_C) ||
               (p->egt_uyari_c >= p->egt_limit_c) ||
               (p->n1_limit_binde < N1_MIN_BINDE) ||
               (p->n1_limit_binde > N1_MAX_BINDE) ||
               (p->ayrilmis != 0u)) {
        durum = PDI_ARALIK_DISI;          /* öznitelikler ve iç tutarlılık  */
    } else {
        durum = PDI_GECERLI;
    }
    return durum;
}
```

Örnek, dosyanın bellekte bu yapıyla aynı yerleşimde bulunduğunu varsayar: alanların
sırası, hizalaması ve bayt sırası da yapı tanımının parçasıdır ve PDI dosyasını üreten
araç bu tanıma göre yazar. Yerleşimin derleyiciye ve işlemciye bağlı kalması
istenmiyorsa alanlar, 23. bölümdeki veri tabanı örneğinde olduğu gibi bayt bayt okunur.

Denetimin sırası rastgele değildir: bütünlüğü doğrulanmamış bir dosyanın sürüm alanına,
sürümü doğrulanmamış bir dosyanın değerlerine güvenilmez. Dosya geçersizse yazılımın ne
yapacağı da bir gereksinimdir ve sistem emniyet değerlendirme süreciyle birlikte
belirlenir: en korumacı limitlerle çalışıp arızayı bildirmek, işlevi başlatmamak ya da
ekipmanı arızalı ilan etmek. Kabul edilemeyecek tek seçenek, geçersiz dosyayı sessizce
kullanmaktır.

Aynı çalıştırılabilir nesne kodu, bu yapıya uyan iki ayrı dosyayla iki ayrı uçak
konfigürasyonunu tanımlar (değerler kurgusaldır):

| Alan | PDI dosyası 1: motor tipi A | PDI dosyası 2: motor tipi B |
|---|---|---|
| `sema_surumu` | 3 | 3 |
| `uyumlu_yazilim` | 0x00A71503 | 0x00A71503 |
| `egt_uyari_c` | 900 | 950 |
| `egt_limit_c` | 950 | 1010 |
| `n1_limit_binde` | 1000 | 1040 |

İki dosyanın ayrı parça numarası, ayrı sürüm geçmişi ve ayrı doğrulama kaydı vardır;
kod ise tektir ve zarfın tamamıyla (600–1100 °C, %90,0–%110,0) bir kez doğrulanmıştır.
Örnek, yükleme anındaki denetimin sınırını da gösterir: denetim, B tipi motora
yanlışlıkla 1. dosyanın yüklendiğini yakalayamaz, çünkü o dosyanın bütün değerleri
geçerli aralıktadır. Değerin *bu uçak için* doğru olduğunu yazılımın iç denetimi değil,
PDI dosyasının doğrulanması ve yükleme sonrasındaki parça numarası kontrolü gösterir.

## PDI yaşam döngüsü verisinde nerede görünür?

PDI yalnızca bir dosya değildir; planlardan başarı özetine kadar bütün veride iz
bırakır. Tipik dağılım şöyledir:

| Yaşam döngüsü verisi | PDI ile ilgili içerik |
|---|---|
| Yazılım sertifikasyon planı (Plan for Software Aspects of Certification, PSAC) ve diğer planlar | PDI'nin ne için kullanıldığı ve yazılım seviyesi; ayrı doğrulama yolunun seçilip seçilmediği; dosyanın hangi süreç ve araçlarla üretilip doğrulanacağı ve değiştirileceği, araç kalifikasyonu ihtiyacı; yükleme kontrolü ve uyumluluk yaklaşımı |
| Yazılım gereksinim verisi | PDI yapı tanımı: öğelerin tipi, birimi, sınırları, çözünürlüğü; kodun veriyi nasıl kullandığı; gerektiğinde değerlerin kendisi; izlenebilirlik |
| PDI dosyası | Belirli bir konfigürasyona ait değerlerin yüklenebilir hâli; kendi parça numarası ve sürümüyle ayrı bir konfigürasyon öğesi. Entegrasyon sürecinin çıktısıdır ve Seviye A–D'nin hepsinde en sıkı kontrol kategorisindedir (CC1). Her dosya için yaşam döngüsü verisi üretilir; bu veri ayrı paketleniyorsa ilgili çalıştırılabilir nesne kodunun SAS'ına atıf yapar |
| Doğrulama durumları, prosedürleri ve sonuçları | Kodun veri zarfına göre normal aralık ve gürbüzlük testleri; her PDI dosyası için değer doğruluğu, yapı uyumu ve eksiksizlik kanıtları |
| Yazılım konfigürasyon indeksi (Software Configuration Index, SCI) | PDI dosyalarının kimliği ve sürümü, dosyanın nasıl üretildiği, uyumluluk kaydı: hangi PDI sürümünün hangi çalıştırılabilir nesne kodu sürümüyle geçerli olduğu |
| Yazılım başarı özeti (Software Accomplishment Summary, SAS) | Onaya sunulan konfigürasyondaki PDI dosyaları, planlanan yaklaşımdan sapmalar ve PDI ile ilgili açık problem raporları |

Bu kararların çoğu planlama aşamasında verilir. Ayrı doğrulama yolu seçilecekse bunun
PSAC'ta beyan edilmesi ve otoriteyle erken konuşulması gerekir; proje sonunda "bu tablo
aslında PDI idi" demek, eksik gereksinim ve eksik gürbüzlük testi olarak geri döner.
Planlama tarafı [5. Yazılım Planlama](../03-do178c-ile-gelistirme/05-yazilim-planlama.md),
doğrulama hedefleri [9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md),
otoriteye sunulan veri ise
[12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümünde anlatılır.

## Tipik riskler ve önlemleri

| Risk | Belirti | Önlem |
|---|---|---|
| Yanlış tablonun yüklenmesi | Değerler geçerli aralıktadır, yazılım arıza bildirmez; davranış başka bir konfigürasyona aittir | Dosya başlığında konfigürasyon kimliği; yükleme sonrasında parça numarasının kurulum kaydıyla karşılaştırılması |
| Uyumsuz sürüm | Yeni yazılım eski yapıdaki dosyayı okur; alanlar kayar, değerler anlamsızlaşır | Başlıkta yapı sürümü ve uyumlu yazılım kimliği; SCI'da uyumluluk kaydı; uyumsuz dosyanın açılışta reddedilmesi |
| Kaynağı belirsiz değer | Gözden geçirmede "bu sayı nereden geldi?" sorusu cevapsız kalır | Her değerin onaylı bir kaynağa (sistem gereksinimi, kalibrasyon kaydı) izlenebilmesi; değerlerin yazarı dışında biri tarafından gözden geçirilmesi |
| Birim ya da ölçek hatası | Değer makul görünür ama on ya da bin kat sapmıştır; birimler karışmıştır | Yapı tanımında birim ve çözünürlük; alan adında birim; dar tutulmuş aralık ve öğeler arası tutarlılık denetimleri |
| Kısmi ya da kesilmiş yükleme | Dosyanın bir kısmı yeni, bir kısmı eskidir ya da dosya hiç yoktur | Dosyanın bütününü kapsayan CRC; dosya yokluğunun geçersiz dosya sayılması; yükleme tamamlanmadan dosyanın geçerli işaretlenmemesi |
| Zarfın dışına çıkan değer | Yeni konfigürasyon için bir sınır "biraz" genişletilir; kod o aralıkta hiç test edilmemiştir | Zarf değişikliğinin gereksinim değişikliği sayılması; değişiklik etki analizi; kodun etkilenen kısmının yeniden doğrulanması |
| Kayıtsız değişiklik | Uçaktaki dosyanın kimliği SCI'daki kimlikle uyuşmaz | Değişiklik yetkisinin tanımlanması; her PDI değişikliğinin değişiklik kontrolünden geçmesi |

Önlem sütunu, kod için zaten bilinen beş ilkeye çıkar: sürüm kontrolü, gözden geçirme,
doğrulama, değişiklik yetkisi ve izlenebilirlik. Konfigürasyon verisinde yeni olan
ilkeler değil, bunların kodun dışındaki bir dosyaya da aynı ciddiyetle uygulanmasıdır.

## Bu bölümden akılda kalması gerekenler

- Konfigürasyon verisi, kod değişmeden davranışı değiştirir; yanlış ya da eksik veri,
  hatasız kodu yanlış çalıştırır ve kod odaklı denetimlerin hiçbirine takılmaz.
- Davranışı etkileyen her veri aynı rejime girmez: koda gömülü sabit kodla birlikte
  doğrulanır, PDI onaylı konfigürasyonun ayrı bir öğesidir, kullanıcı tarafından
  değiştirilebilir veri ancak emniyeti etkileyemediği gösterilmişse serbest bırakılır,
  havacılık veri tabanları DO-200B ile yönetilir.
- Parametre verisi öğesi, verinin koddan ayrı sürümlenip doğrulanmasına imkân verir.
  Bunun dört koşulu vardır: kod tüm geçerli veri zarfıyla doğrulanmıştır, geçersiz dosyaya
  karşı gürbüzdür, veriden doğan bütün davranışı doğrulanabilir ve yaşam döngüsü verisi
  ayrı yönetime elverişlidir. Koşullar sağlanmıyorsa veri kodla birlikte doğrulanır.
- Her PDI dosyası kendi başına doğrulanır: yapı, değer doğruluğu, öğeler arası tutarlılık
  ve eksiksizlik. Tablo A-5'in 8. ve 9. hedefleri bunu ister; Seviye A ve B'de
  bağımsızlık aranır. Dosya, yazılım seviyesini kullandığı koddan alır.
- PDI dosyası, yapı sürümü, uyumlu yazılım kimliği ve bütünlük değeri taşır; yazılım
  bunları yükleme sırasında ve her açılışta denetler, uyumluluk SCI'da kayıt altına alınır.
- Yazılımın iç denetimi yapı ve aralık hatasını yakalar, "aralıkta ama yanlış" değeri
  yakalayamaz; değerin kaynağı ancak izlenebilirlik ve gözden geçirmeyle doğrulanır.
- Zarfın dışına çıkan yeni veri, veri güncellemesi değil gereksinim değişikliğidir.
