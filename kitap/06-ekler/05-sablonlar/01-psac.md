---
title: "PSAC Şablonu ve Yazım Rehberi"
sidebar_label: PSAC
sidebar_position: 1
description: "PSAC şablonu: yazılım sertifikasyon planının önerilen içindekileri, her bölümde verilecek kararlar, ek hususlar tablosu ve DO-178C §11.1 eşlemesi."
---

Yazılım sertifikasyon planı (Plan for Software Aspects of Certification, PSAC), başvuru
sahibinin (applicant) sertifikasyon otoritesine (certification authority) yazılımın uyumunu
nasıl göstereceğini anlattığı ve üzerinde mutabakat aradığı belgedir. İlk okuru otoritenin
yazılım uzmanıdır; proje içinde ise diğer dört planın uyması gereken çerçevedir. Tipik
olarak yazılım sertifikasyon sorumlusu ya da yazılım proje yöneticisi yazar, sistem ve emniyet
ekibi seviye gerekçesine katkı verir, kalite güvencesi (quality assurance) gözden geçirir
(review); kurum içi imzalardan sonra otoriteye sunulur ve otoritenin kabulüyle bağlayıcı
hâle gelir. Planlama sürecinde,
geliştirme verisinin üretimi hızlanmadan önce yazılır ve ilk katılım aşaması (Stage of
Involvement, SOI) denetiminin, SOI-1'in, çıkış noktasıdır.

PSAC'ın neden var olduğu
[5. Yazılım Planlama](../../03-do178c-ile-gelistirme/05-yazilim-planlama.md) ve
[12. Sertifikasyon İrtibatı](../../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümlerinde, sekiz belgenin ortak düzeni ve paketleme [genel bakış](index.md) sayfasında
anlatılır; bu sayfa nasıl yazılacağına bakar. İki ilke akılda tutulur: PSAC kısadır, karar ve
gerekçeyi verip ayrıntıya atıf yapar; buradaki her taahhüt de proje sonunda yazılım başarım
özetinde (Software Accomplishment Summary, SAS) "yapıldı" ya da "şu sapmayla yapıldı" diye
kapanır.

## Bir bakışta

| Özellik | Değer |
|---|---|
| DO-178C maddesi | §11.1 (sunulması ve mutabakat: §9.1) |
| İlgili Ek A hedefleri | A-1 #1, #4 (A–D); A-1 #2, #3 (A–C); A-10 #1, #2 (A–D) |
| Beklendiği seviyeler | A, B, C, D |
| Kontrol kategorisi (A/B/C/D) | CC1 / CC1 / CC1 / CC1 |
| Otoriteye | Sunulur (§9.3'teki asgari veriden biri) |
| Sahibi | Yazılım sertifikasyon sorumlusu ya da yazılım proje yöneticisi |
| İlgili SOI | SOI-1; taahhütlerin kapanışı SAS üzerinden SOI-4'te |

:::tip[Şablonu nasıl kullanmalı?]
Başlıkları doldurulacak boşluklar olarak değil, otoritenin soracağı soruların listesi olarak
okuyun: her alt başlıkta bir karar ve gerekçesi yazılır, ayrıntı için ilgili plana atıf
yapılır. İlk taslakta 8.1'deki ek hususlar (additional considerations) tablosunu ve 4.3'teki
seviye gerekçesini doldurun; bu ikisi netleşmeden yazılan PSAC, otoritenin ilk sorusunda
yeniden açılır. Başlık adları kurumun düzenine uydurulabilir; yeter ki uyum tablosundaki her
maddenin bir yeri olsun.
:::

## Önerilen içindekiler

Belge kimliği, onaylar, revizyon geçmişi, referanslar, kısaltmalar ve tanımlar gibi ortak ön
bölümler [genel bakış](index.md) sayfasında anlatılır ve burada tekrarlanmaz.

```text
1 Amaç ve kapsam
1.1 Kapsanan sistem, yazılım parçaları ve sürümler
1.2 Proje türü: yeni geliştirme, değişiklik ya da türev
1.3 Otorite için özet: yenilikler ve dikkat noktaları
2 Sistem tanıtımı
2.1 Sistemin işlevleri ve uçaktaki yeri
2.2 İşlevlerin donanım ve yazılıma dağılımı
2.3 Mimari, işlemciler ve donanım/yazılım arayüzleri
2.4 Sistem düzeyindeki emniyet özellikleri
3 Yazılım tanıtımı
3.1 Yazılım bileşenleri ve işlevleri
3.2 Bölümleme ve kaynak paylaşımı
3.3 Yedeklilik, hata toleransı ve tekil olay bozulmasına karşı önlemler
3.4 Zamanlama ve çizelgeleme yaklaşımı
4 Sertifikasyon hususları
4.1 Sertifikasyon temeli ve uyum yöntemi
4.2 Uygulanan teknoloji ekleri ve DO-330
4.3 Yazılım seviyesi ve gerekçesi
4.4 Arıza durumlarına olası yazılım katkısı
4.5 Eklere özgü konular
5 Yazılım yaşam döngüsü
5.1 Yaşam döngüsü modeli
5.2 Süreç özetleri ve ayrıntının bulunduğu planlar
5.3 Organizasyon, sorumluluklar ve bağımsızlık
5.4 Sistem süreçleriyle arayüz
5.5 Sertifikasyon irtibatı sorumlulukları
5.6 Planların ve bu belgenin değişikliği
6 Yazılım yaşam döngüsü verisi
6.1 Veri listesi ve kontrol kategorileri
6.2 Veriler arası ve sistem verisiyle ilişkiler
6.3 Otoriteye sunulan ve denetimde gösterilen veri
6.4 Verinin biçimi ve otoritenin erişim yolu
7 Otoriteye görünürlük ve takvim
7.1 Kilometre taşları ve SOI tetikleyicileri
7.2 Ara bilgilendirme ve veri paketlerinin gönderimi
8 Ek hususlar
8.1 Ek hususlar özet tablosu
8.2 Araç kalifikasyonu
8.3 Önceden geliştirilmiş yazılım ve COTS
8.4 Ürün servis geçmişi
8.5 Alternatif yöntemler
8.6 PDI, seçenekle seçilebilir, UMS ve sahada yüklenebilir yazılım
8.7 Devre dışı bırakılmış kod
8.8 Çok sürümlü benzemez yazılım
8.9 Çok çekirdekli işlemci
8.10 Açık problem raporlarının yönetimi
9 Tedarikçi gözetimi
9.1 Katılan kuruluşlar ve iş bölümü
9.2 Tedarikçi süreç ve çıktılarına güvence
```

Sıra otoritenin okuma yolunu izler: önce neyin onaya sunulduğu ve ne kadar kritik olduğu
(1–4), sonra işin nasıl yürütüleceği ve neyin gösterileceği (5–7), en sonda olağan yoldan
ayrılan konular (8–9). Otoriteler DO-178C'nin saydığı konulara yakın bu düzene alışkındır ve
SAS da aynı başlıkları izler. Şablonun eklediği 1.3'teki özet "bu projede neye dikkat
etmeliyim?" sorusunu ilk sayfada cevaplar; 8.1'deki tablo ek hususlarda sessiz satır bırakmaz.

## Bölüm bölüm yazım rehberi

### 1. Amaç ve kapsam

Bu bölüm mutabakatın neyi kapsadığını sınırlar. Kapsam belirsizse mutabakat da belirsizdir:
aynı birimdeki yükleme uygulamasının, bir parametre verisi öğesi (parameter data item, PDI)
dosyasının ya da tedarikçiden gelen bir kütüphanenin PSAC'ın içinde olup olmadığı sonradan
tartışılır. Değişiklik projelerinde önceki onaylı sürüm ve verisi kimliğiyle anılır; önceki
planlar beklenen değişiklikleri karşılayacak biçimde yazılmışsa, değişiklik PSAC'ı onlara
atıf yaparak kısa tutulabilir. 1.3'teki özet yarım sayfayı geçmez: yeni teknolojiyi, ek
hususları ve otoritenin daha önce görmediği araçları ayrıntının bulunduğu bölümle listeler.

**Verilecek kararlar:**

- PSAC tek parçayı mı, birimdeki bütün parçaları (uygulama, yükleyici, PDI) mı kapsayacak?
- Onay çerçevesi ne: tip sertifikası (type certificate), ek tip sertifikası, teknik standart
  emri (Technical Standard Order, TSO) ya da Avrupa'daki karşılığı ETSO, onaylı ürünün
  değişikliği?
- Değişiklikse önceki sürüm, SAS'ı ve yazılım konfigürasyon indeksi (Software Configuration
  Index, SCI) hangi kimlikle anılacak?
- Otoritenin ilk okumada görmesi gereken üç beş konu hangisi?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Bu plan, X sisteminin yazılımını kapsar. | Bu plan, `<birim adı>` birimindeki iki yazılım parçasını kapsar: gösterge uygulaması (parça numarası 412-1001) ve yükleme uygulaması (412-1002). Uçak tipine özgü gösterge sınırları ayrı bir PDI dosyasıdır; 8.6'da ele alınır. |

### 2. Sistem tanıtımı

Otoritenin yazılım uzmanı sistemi tanımayabilir; bu bölüm ona yazılımın neden var olduğunu
ve hatasının nereye yayılabileceğini anlatır. Bir blok diyagram, işlevlerin donanım ve
yazılıma paylaştırılmasını gösteren kısa bir tablo ve işlemci listesi çoğu zaman yeter;
sistem belgeleri kimlik ve sürümüyle anılır, kopyalanmaz. Emniyet özellikleri (izleme
kanalı, yedek sensör, güvenli duruma geçiş) burada sistem düzeyinde sayılır, yazılıma düşen
kısmı 3. bölümde söylenir. SAS bu tanıtımı farklarıyla yeniden yazacağı için kısa tutulur.

**Verilecek kararlar:**

- Hangi sistem belgeleri (sistem gereksinimleri, mimari tanımı, arayüz kontrol belgeleri)
  kaynak alınacak, hangi sürümüyle?
- Diyagram hangi düzeyde olacak: uçak, birim, kart ya da işlemci?
- Arayüzler hangi ayrıntıda anılacak: veri yolları, ayrık girişler, bellek eşlemli aygıtlar?

Dikkat: buradaki işlemci ve kart bilgisi, yazılım geliştirme planında (Software Development
Plan, SDP) derleyici ve bağlayıcının hedef aldığı işlemciyle ve yazılım doğrulama planındaki
(Software Verification Plan, SVP) test düzeneklerinin hedef donanım tanımıyla (parça numarası
ve revizyon) aynı olmalıdır; test ortamının sürümleri yazılım yaşam döngüsü ortam
konfigürasyon indeksinde (Software Life Cycle Environment Configuration Index, SECI) durur.

### 3. Yazılım tanıtımı

Otorite bu bölümde işlev listesinden çok, emniyet iddiasının yazılımda nereye dayandığını
arar; işlevler kısa bir tabloda kalır, ağırlık bölümleme ve emniyet mekanizmalarına verilir.
Yazılım bölümlemesi (software partitioning) iddiası varsa ilk kez burada ortaya konur: hangi
bileşenler yalıtılıyor, yalıtımı ne sağlıyor ve iddia hangi seviye atamasına dayanak oluyor
([21. Yazılım Bölümlemesi](../../05-ozel-konular/21-yazilim-bolumlemesi.md)); bütünlüğün
nasıl doğrulanacağı SVP'ye bırakılır. 3.2–3.4 için birer paragraf yazılır: işlemci, bellek
ve veri yolu gibi paylaşılan kaynakların nasıl korunduğu; kanal ve izleyici düzeni gibi
yedeklilik (redundancy) ve hata toleransı (fault tolerance) önlemleri; sistemin tekil olay
bozulmasına (single event upset, SEU) karşı yazılıma verdiği görevler; çizelgeleme
(scheduling) biçimi ve zamanlama payı. Her paragraf tasarımı değil, iddianın dayanağını ve
ayrıntının bulunduğu belgeyi söyler.

**Verilecek kararlar:**

- Yazılım kaç bileşenden oluşuyor ve hepsi aynı seviyede mi?
- Bölümlemede koruma yalnız donanımla mı, donanım ve yazılımla birlikte mi sağlanıyor?
- Çizelgeleme döngüsel yürütücüyle (cyclic executive) mi, kesintili (preemptive) bir gerçek
  zamanlı işletim sistemiyle (real-time operating system, RTOS) mi yapılacak?
- Sistem SEU'ya karşı yazılıma bir görev (ör. bellek tarama) tahsis ediyor mu?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Yazılım bölümlenmiştir ve bölümler birbirini etkilemez. | Uygulama iki bölümde çalışır: Seviye B gösterge bölümü ve Seviye D bakım bölümü. Alan bölümlemesi (spatial partitioning) bellek yönetim birimiyle, zaman bölümlemesi (temporal partitioning) 50 ms'lik sabit pencere çizelgesiyle sağlanır; bütünlüğün doğrulanması SVP'dedir. |

### 4. Sertifikasyon hususları

Mutabakatın çerçevesi burada kurulur. Sertifikasyon temeli (certification basis) ürünün
tabi olduğu uçuşa elverişlilik kurallarını, uyum yöntemi ise yazılım tarafında neye göre
uyum gösterileceğini söyler: DO-178C'yi kabul edilebilir uyum yöntemi (acceptable means of
compliance) olarak tanıyan otorite belgesi (FAA için AC 20-115D, EASA için AMC 20-115D) ve
konuya özel yazılı mutabakat belgeleri (FAA'da issue paper, EASA'da sertifikasyon gözden
geçirme maddesi, Certification Review Item, CRI). Hangi teknoloji ekinin (supplement) hangi
bileşene uygulanacağı ve kalifiye araç varsa DO-330'un kullanılacağı da burada beyan edilir;
4.5 eklerin PSAC'tan istediği ek konuları toplar. Seviye gerekçesi sistem emniyet
değerlendirmesinin çıktısına belge numarasıyla atıf yapar ve yazılımın hangi arıza
durumlarına (failure condition) nasıl katkı verebileceğini özetler
([3. Sistem Emniyet Değerlendirmesi Bağlamında Yazılım](../../02-baglam/03-sistem-emniyet-degerlendirmesi-baglaminda-yazilim.md)).

**Verilecek kararlar:**

- Hangi otorite belgesi esas alınıyor; projeye özgü hangi mutabakat belgeleri bekleniyor?
- Hangi ek hangi bileşene uygulanacak; uygulanmayan ekler için tek cümlelik gerekçe ne?
- Birden çok ek uygulanıyorsa DO-178C ve ek hedefleri tek birleşik listede mi izlenecek;
  her hedefin hangi belgeden geldiği nasıl ayırt edilecek?
- Seviye gerekçesi fonksiyonel tehlike değerlendirmesinin (functional hazard assessment, FHA)
  ve ön sistem emniyet değerlendirmesinin (preliminary system safety assessment, PSSA) hangi
  kimlik ve sürümüne dayanacak?
- Bileşenler farklı seviyedeyse farkı hangi mimari önlem (bölümleme, izleme) taşıyor?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Yazılım Seviye B'dir. | Yazılım Seviye B'dir. Dayanak, SYS-FHA-012 rev. C'deki FC-07 arıza durumudur (hava hızının mürettebat fark etmeden yanlış gösterilmesi, tehlikeli). SYS-PSSA-004 rev. B bu duruma karşı iki bağımsız kaynak ve yazılımda bir karşılaştırma izleyicisi öngörür; izleyiciyi içeren gösterge yazılımına Seviye B atar. |
| Yazılım DO-178C'ye uygun geliştirilecektir. | Uyum, AC 20-115D ve AMC 20-115D'nin tanıdığı DO-178C ile gösterilir. DO-331 yalnızca uyarı mantığı bileşeninin tasarım modeline uygulanır. DO-332 uygulanmaz: dil C'dir, dinamik bellek ve sanallaştırma kullanılmaz. DO-333 uygulanmaz: biçimsel analizden kredi istenmez. Üç araç DO-330'a göre kalifiye edilir (8.2). |

Dikkat: FHA ya da PSSA taslaksa taslağın sürümüne atıf yapılır ve PSAC'ın nasıl
güncelleneceği yazılır; "seviye sistem ekibince belirlenecektir" gerekçe değil, eksikliktir.

### 5. Yazılım yaşam döngüsü

PSAC'ta yaşam döngüsü anlatılmaz, özetlenir: her süreç için hedeflerin hangi faaliyetle
karşılanacağı ve ayrıntının hangi planda olduğu söylenir. Özet dört plana dayanır: SDP, SVP,
yazılım konfigürasyon yönetimi planı (Software Configuration Management Plan, SCMP) ve
yazılım kalite güvencesi planı (Software Quality Assurance Plan, SQAP). Planlarla çelişmemesi
için planlar olgunlaştıktan sonra yazılır. Organizasyon kısmı kimin geliştirip kimin
doğruladığını ve bağımsızlığın (independence) nasıl sağlandığını; sistem arayüzü türetilmiş
gereksinimlerin (derived requirement) ve emniyeti etkileyen problem raporlarının (problem
report) emniyet ekibine nasıl iletileceğini; irtibat kısmı otoriteyle kimin konuştuğunu ve
varsa yetkili temsilcinin (FAA'da yetkilendirilmiş mühendislik temsilcisi, Designated
Engineering Representative, DER; EASA'da uyum doğrulama mühendisi, Compliance Verification
Engineer, CVE) neyi onayladığını anlatır. Ek uygulanıyorsa özet eklerin hedeflerini de
kapsar, hedefler çelişirse çözüm yolunu önerir. Bir bileşende tek gereksinim katmanıyla
çalışılacaksa (yüksek seviyeli gereksinim, high-level requirement, düşük seviyeli gereksinim
işlevini de görür) 5.2 bunu gerekçesiyle ve iki katmanın doğrulama hedeflerinin nasıl
karşılanacağıyla söyler ([7. Yazılım Tasarımı](../../03-do178c-ile-gelistirme/07-yazilim-tasarimi.md)).
5.6, hangi değişikliklerin (seviye, kapsam, araç, yöntem, ek husus) PSAC'ın yeniden
sunulmasını gerektirdiğini önceden listeler.

**Verilecek kararlar:**

- Yaşam döngüsü modeli (life cycle model) tek geçişli mi, artımlı mı, yinelemeli mi?
- Bağımsızlık gereken hedeflerde kim doğrulayacak; organizasyon şeması bunu gösteriyor mu?
- Türetilmiş gereksinimler ve emniyeti etkileyen raporlar emniyet ekibine hangi kayıtla gidecek?
- Otoriteyle irtibatı kim yürütecek; yetkili temsilci hangi uyum bulgularını onaylayacak?
- Tek gereksinim katmanıyla çalışılacak bileşen var mı; gerekçesi otoriteyle konuşuldu mu?
- PSAC'ın hangi değişiklikleri otoriteye yeniden sunulacak?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Doğrulama bağımsız bir ekip tarafından yapılır. | Bağımsızlık gereken hedeflerde doğrulamayı, geliştirme ekibinden ayrı bir müdüre bağlı doğrulama grubu yapar; bir mühendis aynı iş ürününün hem yazarı hem doğrulayıcısı olamaz. Hangi hedeflerin bağımsızlık istediği SVP'nin bağımsızlık bölümündedir. |

### 6. Yazılım yaşam döngüsü verisi

Bu bölüm projenin üreteceği yazılım yaşam döngüsü verisinin (software life cycle data)
listesini, her birinin kontrol kategorisini (control category) ve otoriteye nasıl
ulaşacağını verir. Liste DO-178C'nin Ek A tablolarındaki çıktılarla karşılaştırılarak
çıkarılır; oradaki kategori bir alt sınırdır
([10. Yazılım Konfigürasyon Yönetimi](../../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md#kontrol-kategorileri-cc1-ve-cc2)).
Ek A'da sayılmayan ama kanıt olarak üretilen veri en az CC2 ile yönetilir. Biçim de burada
belirtilir: hangi veri belge, hangisi araçtaki kayıt; otorite ona nasıl erişecek ve veri
servis ömrü boyunca nasıl okunabilir kalacak. Asgari sunulan veri ile tip tasarımı verisinin
saklanması 6.3'te anılır. PSAC içeriği başka bir belgeye gömülürse o belge de CC1 yönetilir.

Örnek bir Seviye C projesinde veri listesinin birkaç satırı:

| Veri | Örnek kimlik | Asgari kategori (Seviye C) | Otoriteye |
|---|---|---|---|
| PSAC | PRJ-PSAC-001 | CC1 | Sunulur |
| SDP, SVP, SCMP, SQAP | PRJ-SDP-001 … PRJ-SQAP-001 | CC2 | Denetimde gösterilir |
| Üç geliştirme standardı | PRJ-STD-001 … PRJ-STD-003 | CC2 | Denetimde gösterilir |
| Yazılım gereksinim verisi | Araçtaki modül ve temel çizgi (baseline) adı | CC1 | Denetimde gösterilir |
| SCI ve SAS | PRJ-SCI-001, PRJ-SAS-001 | CC1 | Sunulur |

Proje daha sıkı bir kategori seçebilir; PSAC'taki değer SCMP'deki proje kararıyla aynı olur.

**Verilecek kararlar:**

- Hangi veri ayrı belge, hangisi birleşik belge, hangisi araçtaki kayıt olacak?
- Asgari üçlünün (PSAC, SCI, SAS) dışında hangi veri otoriteye önceden gönderilecek?
- Otorite araçtaki veriye nasıl erişecek: ekran başında, salt okunur hesapla, dışa aktarımla?
- Elektronik veri servis ömrü boyunca hangi biçimde saklanacak?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Tüm yaşam döngüsü verisi istendiğinde otoriteye sunulacaktır. | PSAC, SCI ve SAS otoriteye sunulur; kalifiye araçlar nedeniyle SECI ile kod üretecinin TQP, TCI ve TAS'ı da sunulur (8.2). Diğer veri denetim günü SCMP'de tanımlı depodan, kontrol altındaki sürümüyle açılır; masa başı değerlendirme için istenen veri temel çizgi etiketiyle dışa aktarılıp gönderilir. |

### 7. Otoriteye görünürlük ve takvim

DO-178C bu bölümden tarih listesi değil, otoritenin gözden geçirmelerini planlamasını
sağlayacak görünürlük yolunu bekler. PSAC'a yazılan kesin tarih birkaç ay içinde eskir;
dayanıklı yol her SOI denetimini bir olaya bağlamaktır: hangi veri hangi olgunluğa ulaşınca
haber verileceği, veri paketinin ne kadar önce gönderileceği, ilerlemenin hangi kanaldan
izleneceği. Kesin tarihler proje planında durur; PSAC her SOI için tetikleyici olayın yanında
yaklaşık bir dönem (ör. çeyrek) verir, çünkü otorite gözden geçirmelerini buna göre planlar.
Dönem kayarsa otorite ara bilgilendirmeyle haberdar edilir. Katılım düzeyi (level of
involvement) projeye göre değiştiği için hangi denetimin yerinde, hangisinin masa başı
yapılacağı otoriteye sorulup yazılır ([SW SOI-1](../06-kontrol-listeleri/soi-1.md) … [SW SOI-4](../06-kontrol-listeleri/soi-4.md)).
Takvim, yazılım uygunluk gözden geçirmesinin (software conformity review) yerini de gösterir:
son temel çizgiden sonra, SCI ve SAS sunulmadan önce kalite güvencesi tarafından yapılır;
ayrıntısı [SQAP](05-sqap.md)'tadır.

**Verilecek kararlar:**

- Her SOI hangi olayla tetiklenecek; "temsil edici bölüm" eşiği ne olacak?
- Otoriteye ara durum bilgisi hangi sıklıkta ve hangi kanaldan verilecek?
- Denetim veri paketi ne kadar önce gönderilecek; tedarikçi tesisinde denetim olacak mı?

| Zayıf ifade | Güçlü ifade |
|---|---|
| SOI-2 Mart 2027'de yapılacaktır. | SOI-2, işlevlerin en az yarısında yüksek seviyeli gereksinim, tasarım ve kod gözden geçirilip temel çizgiye alındığında talep edilir (eşik otoriteyle kararlaştırılmıştır); planlanan dönem 2027'nin ilk çeyreğidir. Veri paketi denetimden en az üç hafta önce gönderilir; güncel tahmini tarih aylık durum raporunda bildirilir. |

### 8. Ek hususlar

Ek hususlar, olağan DO-178C yolundan ayrılan, ona bir şey ekleyen ya da hedeflerin bir
kısmını başka yoldan karşılamayı öneren konulardır; her biri otoriteyle ayrıca
kararlaştırılır. En pahalı hata buradaki eksikliktir: anılmayan bir husus proje sonunda
bulunursa tartışma değişikliğin en zor olduğu anda yapılır. Aşağıdaki özet tablo, kitabın
3. bölümündeki örneğe benzeyen Seviye B bir gösterge yazılımı içindir.

| Husus | Uygulanır mı? | Yaklaşım / atıf |
|---|---|---|
| Araç kalifikasyonu | Evet | Üç araç kalifiye edilir; araç tablosu 8.2'de |
| Önceden geliştirilmiş yazılım | Evet | Önceki projeden ARINC 429 sürücüsü; boşluk analizi 8.3'te |
| Ticari hazır yazılım | Evet | RTOS ve sertifikasyon paketi; eksiklerin kapatılması 8.3'te |
| Seçenekle seçilebilir yazılım | Hayır | Her kurulumda bütün işlevler etkindir |
| Kullanıcı tarafından değiştirilebilir yazılım | Hayır | Kullanıcının değiştirebileceği bileşen yoktur |
| Devre dışı bırakılmış kod | Evet | Sürücünün kullanılmayan kanalları, birinci kategori; 8.7'de |
| Sahada yüklenebilir yazılım | Evet | Uçakta veri yükleyiciyle yükleme; 8.6'da |
| Parametre verisi öğesi | Evet | Uçak tipine özgü gösterge sınırları; 8.6'da |
| Çok sürümlü benzemez yazılım | Hayır | Mimaride benzemez sürüm yoktur |
| Ürün servis geçmişi | Hayır | Servis geçmişinden kredi istenmez |
| Alternatif yöntemler | Hayır | Bütün hedefler DO-178C'nin tarif ettiği yolla karşılanır |
| Çok çekirdekli işlemci | Evet | İkinci çekirdek kullanılmaz; kapalı tutulduğu 8.9'da gösterilir |
| Açık problem raporlarının yönetimi | Evet | AC 20-189 ve AMC 20-189'daki sınıflar; 8.10'da |

:::warning[Sessizlik bir karar değildir]
Tabloda yer almayan bir husus otorite için "düşünülmemiş" demektir. "Hayır" satırı da bir
taahhüttür: proje sırasında bir kütüphane yeniden kullanılmaya ya da bir tablo PDI'ye
dönüşmeye başlarsa PSAC güncellenir ve otoriteye bildirilir.
:::

**Verilecek kararlar:**

- Araç envanteri tam mı: derleyiciden test sonucu toplayan betiğe kadar her araç bakıldı mı?
- Yeniden kullanılan ya da satın alınan her bileşen için hangi kanıt var, hangisi eksik?
- Kalibrasyon ve uçak tipine özgü tablolar PDI mı olacak, kodun parçası mı? Navigasyon ya da
  arazi veri tabanı gibi havacılık verisi varsa DO-200B rejiminde mi ele alınacak
  ([23. Havacılık Verileri](../../05-ozel-konular/23-havacilik-verileri.md))?
- Herhangi bir hedef servis geçmişi ya da başka bir alternatif yöntemle karşılanacak mı?

**8.2 Araç kalifikasyonu.** "Gerekli araçlar kalifiye edilecektir." cümlesi hiçbir karar
içermez; karar, her aracın tek satırda değerlendirildiği tablodadır. Kalifikasyon gerekmeyen
araçlar da tabloda yer alır: "Rol; çıktıyı doğrulayan faaliyet" sütunu "bu araca neden
güveniyorsunuz?" sorusunun cevabıdır. Kalifiye araç bulunan projede DO-330 SECI'nin de
otoriteye sunulmasını bekler; 6.3'teki liste buna göre yazılır. Araç kalifikasyon seviyesi
(tool qualification level, TQL) TQL-1 ile TQL-4 arasındaysa araç kalifikasyon planı (Tool
Qualification Plan, TQP) PSAC ile birlikte sunulur; araç konfigürasyon indeksi (Tool
Configuration Index, TCI) ve araç başarım özeti (Tool Accomplishment Summary, TAS) de proje
sonunda sunulan veriye eklenir. TQL-5'te ayrı TQP, TCI ve TAS beklenmez (istenirse ayrı belge
olarak hazırlanabilir); karşılıkları PSAC, SECI ve SAS'taki araca özgü bilgidir. PSAC'ta
aracın kimliği, istenen kredi, önerilen TQL ve gerekçesi ile araç operasyonel
gereksinimlerinin (Tool Operational Requirements, TOR), kurulumun ve operasyonel doğrulamanın
nasıl yapılacağı yer alır. Ölçüt ve TQL belirleme
[13. DO-330 ve Yazılım Aracı Kalifikasyonu](../../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)
bölümündedir. Seviye B örneği:

| Araç ve sürümü | Rol; çıktıyı doğrulayan faaliyet | Karar | Kalifikasyon verisinin yeri |
|---|---|---|---|
| `<derleyici ve bağlayıcı, sürüm>` | Nesne kodu üretir; gereksinim tabanlı testler hedefte doğrular | Gerekmez | Gerekçe bu tabloda; ortam SECI'de |
| `<kod üreteci, sürüm>` | Tasarım modelinden kod üretir; üretilen kodun gözden geçirmesi kaldırılmıştır | Ölçüt 1, TQL-2 | TQP (PSAC ile sunulur); TCI ve TAS (sonda sunulur) |
| `<yapısal kapsam aracı, sürüm>` | Kapsam ölçer; raporu ayrıca doğrulanmaz | Ölçüt 3, TQL-5 | TOR ve operasyonel doğrulama verisi (CC2); özeti PSAC, SECI ve SAS'ta |
| `<test sonucu karşılaştırma betiği, sürüm>` | Geçti/kaldı kararı verir; sonuçlara ayrıca bakılmaz | Ölçüt 3, TQL-5 | TOR ve operasyonel doğrulama verisi (CC2); özeti PSAC, SECI ve SAS'ta |

**8.3 Önceden geliştirilmiş yazılım ve COTS.** Önceden geliştirilmiş yazılım (previously
developed software, PDS) kullanma niyeti yazılır, bu yazılımın çözülmemiş problem
raporlarının yeni kullanımdaki etkisi değerlendirilir ve veri yeni seviye için yetersizse
boşluğu kapatma stratejisi (eksik testler, tersine mühendislik, servis geçmişi) seçilir.
Ticari hazır yazılım (commercial off-the-shelf, COTS), örneğin bir RTOS, aynı yoldan geçer:
satın alınan sertifikasyon paketinin hangi hedefleri karşıladığı, hangilerinin entegratöre
kaldığı yazılır ([24. Yazılım Yeniden Kullanımı](../../05-ozel-konular/24-yazilim-yeniden-kullanimi.md)).

**8.4 Ürün servis geçmişi.** Kredi istenecekse niyetten fazlası yazılır ve otoriteyle
önceden kararlaştırılır. Dayanak kısmı geçmişin neden ilgili sayıldığını, ne kadar geçmiş
gerektiğini ve sürenin nasıl hesaplandığını (çalışma modları, kurulumda ve serviste bağımsız
çalışan kopya sayısı) anlatır; kurallar kısmı neyin hata sayılacağını, kabul edilebilir hata
oranını ve geçmişi geçersiz kılacak problemleri; kapsam kısmı geçmişle karşılanacak hedefleri
ve düzeltilecek hataları verir. Önce
[Ek D: Yazılım Servis Geçmişi Soruları](../04-ek-d-servis-gecmisi-sorulari.md)
ile ön eleme yapmak, reddedilecek bir argümana yatırım yapmaktan ucuzdur.

**8.5 Alternatif yöntemler.** Önerilen her yöntem için kısa bir özet yeter, ayrıntı
otoriteyle yapılan yazılı mutabakattadır. Özet; yöntemle hangi hedefin karşılandığını, olağan
yolun hangi faaliyetinin ve hangi verisinin değiştiğini ve kredinin emniyet açısından neden
yeterli olduğunun hangi belgede savunulduğunu söyler. Bu savunma çoğu zaman ayrı bir belgede,
bir güvence argümanı (assurance case) olarak tutulur; PSAC onun kimliğini ve mutabakat
belgesini (issue paper ya da CRI) anar.

**8.6 PDI, seçenekle seçilebilir, UMS ve sahada yüklenebilir yazılım.** Ortak soru, onaydan
sonra değişebilen içeriğin nasıl sınırlandığı ve yüklü olanın nasıl bilindiğidir. PDI için
kullanımı, seviyesi, ayrı doğrulama yolunun seçilip seçilmediği, üretim, doğrulama ve
değişiklik süreçleri, dosyayı üreten ya da denetleyen aracın kalifikasyon ihtiyacı (8.2) ile
yükleme ve uyumluluk kontrolü
([22. Konfigürasyon Verisi](../../05-ozel-konular/22-konfigurasyon-verisi.md));
seçenekle seçilebilir yazılımda (option-selectable software) onaysız seçeneğin istem dışı
seçilemeyeceği; kullanıcı tarafından değiştirilebilir yazılımda (user-modifiable software,
UMS) bileşenin kapsamı, koruması ve kullanıcının aracı; sahada yüklenebilir yazılımda
(field-loadable software, FLS) yükleme stratejisi, bütünlük kontrolünün yeterliliği ve
teslimden sonraki konfigürasyon sorumluluğu yazılır
([18. Sahada Yüklenebilir Yazılım](../../05-ozel-konular/18-sahada-yuklenebilir-yazilim.md)).

**8.7 Devre dışı bırakılmış kod.** Kod, kategorisi ve onu kapalı tutan mekanizmanın nasıl
doğrulanacağı özetlenir. Birinci kategoride seviye düşürülecekse gerekçesi sistem emniyet
değerlendirmesinden, doğrulama hafifletilecekse gerekçesi geliştirme süreçlerinden gelir;
ikisi de PSAC'a yazılır ([17. Kapsanmayan Kodlar](../../05-ozel-konular/17-kapsanmayan-kodlar.md)).

**8.8 Çok sürümlü benzemez yazılım.** Benzemezliği sağlayan yöntem ve araçlar (ayrı ekip,
dil, derleyici, işlemci) ve istenen kredi yazılır; kredinin dayanağı sistem emniyet
değerlendirmesine atıfla verilir.

**8.9 Çok çekirdekli işlemci.** Ek çekirdekler boşta olsa bile AC 20-193 / AMC 20-193
doğrultusundaki yaklaşım özetlenir: girişim kanallarının (interference channels) nasıl
belirlenip kapatılacağı ya da sınırlanacağı ve zamanlama kanıtının bu etki altında nasıl
üretileceği. Kullanılmayan çekirdeğin kapalı olduğu varsayılmaz, gösterilir.

**8.10 Açık problem raporlarının yönetimi.** Açık kalabilecek raporların hangi sınıflarla
değerlendirileceği (AC 20-189 / AMC 20-189 en az dört sınıf bekler), açık bırakma kararını
kimin vereceği ve emniyet etkisinin sistem ekibiyle nasıl değerlendirileceği yazılır; akış
SCMP'de, sınıflar
[9. Yazılım Doğrulama](../../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md#açık-problem-raporlarıyla-sertifikasyona-gitmek)
bölümündedir.

### 9. Tedarikçi gözetimi

Tedarikçi kullanıldığında otoritenin muhatabı yine başvuru sahibidir; bu bölüm, başvuru
sahibinin tedarikçinin işini hangi faaliyetlerle izleyip hangi kayıtlarla kabul edeceğini
gösterir. İş bölümü kısa bir tabloyla verilir; gözetim faaliyetleri SQAP ve SCMP'de
tanımlanır, PSAC özetler. Tedarikçi kendi planlarıyla çalışacaksa uyumun nasıl gösterildiği
yazılır; tedarikçinin açık raporları ve sapmaları SAS'a yansıyacağı için aktarım yolu da
belirlenir
([26. Yazılım Yaşam Döngüsü Faaliyetlerinde Dış Kaynak Kullanımı](../../05-ozel-konular/26-dis-kaynak-kullanimi.md)).

**Verilecek kararlar:**

- Hangi süreçler tedarikçide: geliştirme, doğrulama, ikisi ya da yalnızca bir bileşen?
- Tedarikçi kendi plan ve standartlarıyla mı çalışacak; uyum nasıl gösterilecek?
- Neyin gözetim kaydı sayılacağı (denetim raporu, teslim kabul tutanağı, sapma onayı) belli mi?
- Tedarikçinin problem raporları ve sapmaları başvuru sahibine hangi sürede ulaşacak?

| Zayıf ifade | Güçlü ifade |
|---|---|
| Tedarikçi DO-178C'ye uygun çalışacaktır. | Tedarikçi, yükleme uygulamasını başvuru sahibinin SDP'si ve standartlarıyla geliştirir. Başvuru sahibinin kalite güvencesi her temel çizgiden önce tedarikçide süreç denetimi yapar; teslimler SCMP'deki kabul kontrol listesiyle alınır, tedarikçinin problem raporları haftalık olarak ortak kayıt sistemine aktarılır. |

## Seviyeye göre farklar

PSAC her seviyede yazılır, sunulur ve CC1 yönetilir; değişen, başlıkların altında taahhüt
edilen işin miktarıdır. İki değerli hücrelerde ilk değer Seviye A, ikincisi Seviye B içindir.

| Konu | Seviye A ve B | Seviye C | Seviye D |
|---|---|---|---|
| PSAC'ın kontrol kategorisi | CC1 | CC1 | CC1 |
| Aranan planlama hedefleri (A-1) | #1–#7 | #1–#7 | #1 ve #4 |
| Sertifikasyon irtibatı hedefleri (A-10) | #1–#3 | #1–#3 | #1–#3 |
| Veri listesindeki üç standart | Beklenir, CC1 | Beklenir, CC2 | Beklenmez |
| Diğer dört planın kategorisi | CC1 | CC2 | CC2 |
| Bağımsızlıkla karşılanan hedef | 30 / 18 | 5 | 2 |
| Ölçüt 1 aracın TQL'i | TQL-1 / TQL-2 | TQL-3 | TQL-4 |
| Ölçüt 2 aracın TQL'i | TQL-4 | TQL-5 | TQL-5 |

- **Seviye A ve B.** 5.2'deki doğrulama özeti yapısal kapsam ölçütünü (Seviye A'da
  değiştirilmiş koşul/karar kapsama (modified condition/decision coverage, MC/DC) dahil) ve
  bağımsızlığın kimle sağlanacağını açıkça söyler. Seviye A'da kaynak koddan nesne koduna
  izlenebilirlik analizinin (source to object code traceability analysis) yöntemi (temsilî
  örnek ya da tam analiz) ve dayandığı derleyici seçenekleri de özetlenir; ayrıntı SVP'dedir.
- **Seviye C.** Bağımsızlık yalnızca kalite güvencesi hedeflerinde aranır; diğer planlar CC2
  olduğundan PSAC içeriğini bir plana gömmek o planı CC1'e taşır.
- **Seviye D.** Planlama hedefi olarak geçiş kriterleri, ortamın seçilip tanımlanması ve
  standartlar (A-1 #2, #3, #5) aranmaz; ortamın konfigürasyon kontrolü (A-8 #6, SECI) ise
  yine beklenir. 5. bölüm faaliyetleri özetler ve 8. bölüm eksiksiz yazılır, çünkü ek
  hususlar her seviyede hedeftir.

Seviye değişikliği bu tablonun her satırını etkileyebildiği için PSAC'ın yeniden sunulmasını
gerektiren değişikliklerin başında gelir. 6.1'deki liste
[DO-178C Hedef Gezgini](/araclar/sertifikasyon/do178c-hedef-gezgini) ile denetlenebilir.

## DO-178C uyum tablosu

Tablo, §11.1'in harfli maddelerini, PSAC'ın özetlediği planlama maddelerini (§4.2) ve PSAC'ı
doğrudan anan irtibat ve ek husus maddelerini önerilen içindekilerdeki yerleriyle eşler.

| DO-178C | Konu | Şablondaki yer |
|---|---|---|
| §11.0.b | Verinin biçimi PSAC'ta belirtilir | 6.4 Verinin biçimi ve otoritenin erişim yolu |
| §11.1.a | Sistem tanıtımı | 2 Sistem tanıtımı |
| §11.1.b | Yazılım işlevleri, emniyet ve bölümleme | 3 Yazılım tanıtımı |
| §11.1.c | Sertifikasyon temeli, seviye ve gerekçesi | 4.1 Sertifikasyon temeli ve uyum yöntemi; 4.2 Uygulanan teknoloji ekleri ve DO-330; 4.3 Yazılım seviyesi; 4.4 Arıza durumlarına katkı |
| §11.1.d | Yaşam döngüsü, süreçler ve sorumluluklar | 5 Yazılım yaşam döngüsü (5.1–5.5) |
| §11.1.e | Veri, ilişkiler, sunum ve erişim | 6 Yazılım yaşam döngüsü verisi (6.1–6.4) |
| §11.1.f | Otoriteye görünürlük | 7 Otoriteye görünürlük ve takvim |
| §11.1.g | Ek hususlar | 8 Ek hususlar (8.1–8.10) |
| §11.1.h | Tedarikçi gözetimi | 9 Tedarikçi gözetimi |
| §4.2.e | Planların revizyon yolu | 5.6 Planların ve bu belgenin değişikliği |
| §4.2.f | Benzemezlik yöntem ve araçları | 8.8 Çok sürümlü benzemez yazılım |
| §4.2.h | Devre dışı kod mekanizması | 8.7 Devre dışı bırakılmış kod |
| §4.2.i | UMS süreç, araç ve verisi | 8.6 PDI, seçenekle seçilebilir, UMS ve sahada yüklenebilir yazılım |
| §4.2.j.1–4 | PDI kullanımı, seviyesi, süreçleri, yüklemesi | 8.6 PDI, seçenekle seçilebilir, UMS ve sahada yüklenebilir yazılım |
| §4.2.l | Tedarikçi gözetiminin planlanması | 9 Tedarikçi gözetimi |
| §6.4.4.3.d.1 | Devre dışı kod: seviye, hafifletme | 8.7 Devre dışı bırakılmış kod |
| §9.1.a–c | PSAC'ın sunulması ve mutabakat | 5.5 Sertifikasyon irtibatı sorumlulukları; 7.2 Ara bilgilendirme |
| §9.3, §9.4 | Asgari sunulan veri, tip tasarımı verisi | 6.3 Otoriteye sunulan ve denetimde gösterilen veri |
| §12.1, §12.1.4.f | PDS niyeti, açık raporlar, yükseltme stratejisi | 8.3 Önceden geliştirilmiş yazılım ve COTS |
| §12.2.1 | Araç kullanım niyeti | 8.2 Araç kalifikasyonu |
| §12.3.b.1–3 | Alternatif yöntemin etkisi ve gerekçesi | 8.5 Alternatif yöntemler |
| §12.3.4.4.a–h | Servis geçmişinden kredi bilgileri | 8.4 Ürün servis geçmişi |

### Teknoloji ekleri

| Ek | Madde | Şablona etkisi |
|---|---|---|
| DO-331 | MB.11.1.d | 5.2: özetler ekin hedeflerini de kapsar; DO-178C ile ekin hedefleri çelişirse çözüm yolu önerilir |
| DO-331 | MB.11.1.e | 6.1 ve 6.2: modeller ve modelden üretilen veri listeye ve ilişkilere girer |
| DO-331 | MB.4.2.m, o | 4.5: hangi bileşende hangi model türü (belirtim ya da tasarım modeli), temsil ettiği veri, modelin doğrulama yöntemi ve tasarım modeli kapsam ölçütü, simülasyon kredisi; ayrıntı SDP ve SVP'de |
| DO-332 | OO.11.1.d, e | 5.2, 6.1 ve 6.2: DO-331'deki eklemelerle aynı |
| DO-332 | OO.4.3, OO.11.1.i | 4.5: nesne yönelimli teknolojinin nerede ve nasıl kullanılacağı; ondan doğan zafiyetlerin (ekin OO.D kısmı) nasıl ele alınacağı |
| DO-332 | OO.4.2.m, n | 4.5 ve 8.3: sanallaştırma kullanımı; yeniden kullanılan bileşenin tip tutarlılığı ve istisna yönetimiyle entegrasyonu |
| DO-333 | FM.11.1.d, e | 5.2, 6.1 ve 6.2: DO-331'deki eklemelerle aynı; §11.1'in diğer maddeleri değişmez |
| DO-333 | FM.4.3 | 4.5: biçimsel yöntemin hangi bileşende ve hangi hedeflerde kullanılacağı, hangi kanıtı üreteceği; ayrıntı SDP ve SVP'de |

Birden çok ek birlikte uygulanıyorsa aralarındaki çatışmanın çözümü de PSAC'ta önerilir.
DO-330 bir teknoloji eki değildir; yine de kalifiye araç varsa PSAC'a araca özgü bilgi
ekletir (DO-330 §10.1.1; bkz. 8.2). Eklerin planlama tarafı kitabın
[DO-331](../../04-arac-kalifikasyonu-ve-ekler/14-do331-model-tabanli-gelistirme.md),
[DO-332](../../04-arac-kalifikasyonu-ve-ekler/15-do332-nesne-yonelimli-teknoloji.md) ve
[DO-333](../../04-arac-kalifikasyonu-ve-ekler/16-do333-bicimsel-yontemler.md) bölümlerindedir.

Bu eşleme bir başvuru aracıdır; DO-178C'nin ve eklerinin kendi metninin yerine geçmez.

## Diğer belgelerle tutarlılık

| Bu belgede | Örtüşmesi gereken belge | Nasıl denetlenir |
|---|---|---|
| Süreç özetleri (5.2) | [SDP](02-sdp.md), [SVP](03-svp.md), [SCMP](04-scmp.md) ve [SQAP](05-sqap.md) | Her özet cümlesinin ilgili planda karşılığı aranır; planda olmayan taahhüt özetten çıkarılır |
| Yazılım seviyesi ve gerekçesi (4.3, 4.4) | Sistem emniyet değerlendirmesi (FHA, PSSA); bkz. [kitabın 3. bölümü](../../02-baglam/03-sistem-emniyet-degerlendirmesi-baglaminda-yazilim.md) | Atıf yapılan sürüm, sistemin güncel temel çizgisindeki sürümle karşılaştırılır |
| Organizasyon ve bağımsızlık (5.3) | [SVP](03-svp.md)'nin bağımsızlık anlatımı, [SQAP](05-sqap.md)'ın kalite güvencesi organizasyonu | Roller üç belgede aynı adla geçer; bağımsızlık iddiası organizasyon şemasıyla çelişmez |
| Veri listesi, kategoriler ve problem raporu sınıfları (6.1, 8.10) | [SCMP](04-scmp.md)'nin konfigürasyon öğeleri, kategori ataması ve problem raporlama akışı | İki liste satır satır karşılaştırılır; kimlikler, kategoriler ve sınıf adları aynıdır |
| Araç tablosu (8.2) | [SDP](02-sdp.md)'nin geliştirme ortamı, [SVP](03-svp.md)'nin doğrulama ortamı, [SCMP](04-scmp.md)'nin konfigürasyon yönetimi araçları, SECI | Araç adı, sürümü ve rolü her yerde aynıdır; SECI'deki sürüm günceldir |
| Teknoloji ekleri (4.2, 4.5) | [Gereksinim](06-gereksinim-standardi.md), [tasarım](07-tasarim-standardi.md) ve [kodlama](08-kodlama-standardi.md) standartları | Uygulanmaz denen ekin konusu (ör. dinamik bellek) standartlarda yasak ya da sınırlıdır |
| Tedarikçi gözetimi (9) | [SQAP](05-sqap.md)'ın tedarikçi denetimleri, [SCMP](04-scmp.md)'nin tedarikçi verisi teslimi | PSAC'ta anılan her tedarikçi SQAP'ın denetim takviminde ve SCMP'nin teslim kabul adımlarında yer alır; iş bölümü üç belgede aynıdır |
| PSAC'ın tamamı | SAS (proje sonunda); bkz. [kitabın 12. bölümü](../../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md) ve [SW SOI-4](../06-kontrol-listeleri/soi-4.md) | SAS aynı başlık düzeniyle yazılır; her taahhüt "yapıldı" ya da "şu sapmayla yapıldı" diye kapanır |

## Sık hatalar

| Hata | Tipik nedeni | Önlem |
|---|---|---|
| PSAC diğer planlar kadar uzun; otorite projeye özgü konuyu bulamıyor | "Ne kadar çok yazılırsa o kadar güvenli" varsayımı | Her konuda karar, gerekçe ve ayrıntının yerine atıf; 1.3'teki özet |
| Seviye gerekçesi "sistem ekibi atadı" cümlesinden ibaret | FHA ve PSSA henüz yayımlanmamış ya da yazılım ekibinin elinde değil | Taslak sürüme atıf ve güncelleme taahhüdü; yayımlanınca PSAC revizyonu |
| Uygulanmayan ek hususlar hiç anılmamış | Yalnızca var olanı yazma alışkanlığı | 8.1 tablosunu bütün satırlarıyla doldurmak |
| PSAC mutabakattan sonra sessizce değişmiş | Revizyonun iç belge değişikliği sayılması | 5.6'da özü etkileyen değişiklik listesi; otoriteye bildirim kaydı |
| Takvim bölümünde yalnızca tarihler var ve kısa sürede eskiyor | Proje planının kopyalanması | Olay tabanlı SOI tetikleyicileri ve yaklaşık dönem; kesin tarihler proje planında |
| PSAC'ta söz verilen faaliyet hiç yapılmamış | Planı iyi göstermek için iddialı yazmak | Yalnızca kanıtlanabilecek taahhüt; her cümle için "SAS'ta nasıl kapanır?" sorusu |
| PSAC içeriği SDP'ye gömülmüş, SDP CC2 yönetiliyor (Seviye C/D) | Paketlemenin kontrol kategorisine etkisinin düşünülmemesi | PSAC içeriği taşıyan belgeyi CC1 yönetmek, gerekirse otoriteye sunmak |
| Tedarikçinin belgesi başvuru sahibinin PSAC'ının yerine konmuş | Sorumluluğun tedarikçiye geçtiği varsayımı | PSAC başvuru sahibinindir; tedarikçi belgesine yalnızca atıf yapılır |

## Yayımlamadan önce

- [ ] Otorite yalnızca 1.3'ü okusa projenin yeniliklerini ve dikkat noktalarını öğrenir mi?
- [ ] Yazılım seviyesi FHA ve PSSA'ya belge kimliği ve sürümüyle bağlı mı; bileşenler
      arasındaki seviye farkının mimari dayanağı yazılmış mı?
- [ ] 8.1'deki tabloda her husus için "evet" ya da "hayır" ve kısa bir gerekçe var mı?
- [ ] Araç tablosundaki ad, sürüm ve roller SDP, SVP, SCMP ve SECI'dekiyle aynı mı;
      kalifikasyon gerekmeyen araçların gerekçesi yazılmış mı?
- [ ] 5.2'deki her özet ilgili planda karşılık buluyor ve hiçbiri planla çelişmiyor mu?
- [ ] Her verinin kategorisi DO-178C Ek A ve SCMP ile tutarlı, sunulan veri (kalifiye araç
      varsa SECI ile TQP, TCI ve TAS dahil) denetimde gösterilenden ayrılmış mı?
- [ ] Her taahhüt için "SAS'ta bunu hangi kayıtla kapatacağım?" sorusunun cevabı var mı?

Otoritenin planlama denetiminde PSAC'ta baktığı noktalar: [SW SOI-1](../06-kontrol-listeleri/soi-1.md).

## İlgili bölümler

- [Plan ve Standart Şablonları](index.md): ortak ön bölümler ve paketleme
- [5. Yazılım Planlama](../../03-do178c-ile-gelistirme/05-yazilim-planlama.md) ve
  [12. Sertifikasyon İrtibatı](../../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- [3. Sistem Emniyet Değerlendirmesi Bağlamında Yazılım](../../02-baglam/03-sistem-emniyet-degerlendirmesi-baglaminda-yazilim.md)
- [13. DO-330 ve Yazılım Aracı Kalifikasyonu](../../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)
- [26. Yazılım Yaşam Döngüsü Faaliyetlerinde Dış Kaynak Kullanımı](../../05-ozel-konular/26-dis-kaynak-kullanimi.md)
- Diğer plan şablonları: [SDP](02-sdp.md), [SVP](03-svp.md), [SCMP](04-scmp.md), [SQAP](05-sqap.md)
- [SW SOI-1](../06-kontrol-listeleri/soi-1.md) ve [SW SOI-4](../06-kontrol-listeleri/soi-4.md)
