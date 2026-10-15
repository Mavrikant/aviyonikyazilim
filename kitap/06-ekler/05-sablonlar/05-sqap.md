---
title: "SQAP Şablonu ve Yazım Rehberi"
sidebar_label: SQAP
sidebar_position: 5
description: "SQAP şablonu: kalite güvencesi planının içindekileri; yetki, bağımsızlık, denetim takvimi ve örnekleme kararları; DO-178C §11.5 uyum tablosu."
---

Yazılım kalite güvencesi planı (Software Quality Assurance Plan, SQAP), kalite güvencesinin
(quality assurance) hangi yetkiyle, hangi faaliyetleri, ne zaman ve hangi kayıtla
yürüteceğini tanımlayan plandır. Okurları planı uygulayacak kalite güvencesi mühendisleri,
denetlenecek proje ekipleri ve planı ilk katılım aşaması (Stage of Involvement, SOI)
denetiminde, yani SOI-1'de değerlendiren sertifikasyon otoritesidir (certification
authority). Planı kalite güvencesi sorumlusu yazar; kalite güvencesi yöneticisi ile yazılım
proje yöneticisi onaylar. Plan, planlama sürecinde diğer planlarla birlikte yazılır ve ilk
temel çizgiden ve kalite güvencesinin ilk denetiminden önce yürürlüğe girer.

Kalite güvencesinin doğrulamadan farkı, bağımsızlığı ve uygunsuzlukların (nonconformance)
kapatılışı [11. Yazılım Kalite Güvencesi](../../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
bölümünde, SQAP'ın beş plan içindeki yeri ve neden erken yazıldığı
[5. Yazılım Planlama](../../03-do178c-ile-gelistirme/05-yazilim-planlama.md) bölümünde
anlatılır. Bu sayfa planın nasıl yazılacağına odaklanır; bütün şablonlarda ortak olan ön
bölümler ve belgelerin paketlenmesi [genel bakış](index.md) sayfasındadır.

## Bir bakışta

| Özellik | Değer |
|---|---|
| DO-178C maddesi | §11.5 (süreç: §8; kayıtlar: §11.19) |
| İlgili Ek A hedefleri | Çıktısı olduğu: A-1 #1, #4 (A–D), #2, #3 (A–C). Planladığı: A-9 #2, #5 (A–D), #1, #3, #4 (A–C) |
| Beklendiği seviyeler | A, B, C, D |
| Kontrol kategorisi (A/B/C/D) | CC1/CC1/CC2/CC2 |
| Otoriteye | Denetimde gösterilir |
| Sahibi | Kalite güvencesi sorumlusu |
| İlgili SOI | SOI-1 (plan ve plan güvence kaydı); diğer kalite güvencesi kayıtları SOI-2, SOI-3 ve SOI-4'te |

:::tip[Şablonu nasıl kullanmalı?]
SQAP'ın her cümlesi bir denetim sözüdür ve SOI denetiminde "bunun kaydını görebilir miyim?"
sorusuyla geri döner. Şablonu doldururken her taahhüdün yanına onu kanıtlayacak kaydı
yazın; kaydını gösteremeyeceğiniz bir sıklığı ya da örneklemi plana koymayın. Kurumun genel
bir kalite el kitabı varsa SQAP onu tekrarlamaz, projeye özgü kararları yazar ve el kitabına
atıf yapar. Başlık adları ve sırası değişebilir; önemli olan uyum tablosundaki her maddenin
planda bir yeri olmasıdır.
:::

## Önerilen içindekiler

Ortak ön bölümler (belge kimliği, onaylar, revizyon geçmişi, referanslar, kısaltmalar ve
tanımlar) [genel bakış](index.md) sayfasında anlatılır ve burada tekrarlanmaz.

```text
1 Amaç ve kapsam
1.1 Planın amacı ve uygulandığı yazılım
1.2 Yazılım seviyesi ve uygulanan kalite güvencesi hedefleri
1.3 Kurum kalite sistemiyle ilişki
2 Kalite güvencesi ortamı
2.1 Kapsam: süreçler, veriler ve kuruluşlar
2.2 Organizasyon ve arayüzler
2.3 Standartlar ve prosedürler
2.4 Araçlar ve yöntemler
3 Yetki, sorumluluk ve bağımsızlık
3.1 Raporlama hattı
3.2 Bağımsızlığın sağlanması
3.3 İşi durdurma ve düzeltici faaliyet yetkisi
3.4 Kalite güvencesinin ürün onayı
3.5 Dış kaynaklı kalite güvencesi (varsa)
4 Kalite güvencesi faaliyetleri
4.1 Plan ve standartların gözden geçirilmesi
4.2 Süreç ve veri denetimleri, örnekleme
4.3 Gözden geçirmelere katılım ve tanıklık
4.4 Geçiş kriterlerinin izlenmesi
4.5 Problem raporlama ve düzeltici faaliyetin izlenmesi
4.6 Yazılım uygunluk gözden geçirmesi
4.7 Önceden geliştirilmiş yazılım için ek faaliyetler
5 Kalite güvencesi sürecinin geçiş kriterleri
6 Faaliyet takvimi
7 Kalite güvencesi kayıtları
7.1 Kayıt türleri ve asgari içerik
7.2 Kontrol kategorisi, saklama ve erişim
8 Uygunsuzlukların ele alınması
8.1 Kayıt ve sınıflandırma
8.2 Kapanış ölçütü
8.3 Üst yönetime taşıma
8.4 Onaylı sapmalar
9 Tedarikçi gözetimi
9.1 Gözetim kapsamı ve sıklığı
9.2 Denetim hakkı ve kayıtlara erişim
10 Ölçümler ve süreç iyileştirme (isteğe bağlı)
```

## Bölüm bölüm yazım rehberi

### 1. Amaç ve kapsam

Bu bölüm planın hangi yazılım ürünü, hangi sürüm ya da proje evresi ve hangi yazılım
seviyesi için geçerli olduğunu söyler. Seviyeyle birlikte Tablo A-9'un hangi hedeflerinin
(objective) uygulandığı da burada açıkça yazılırsa, sonraki bölümlerde her faaliyetin hangi
hedefe hizmet ettiği izlenebilir. Kurumun genel bir kalite yönetim sistemi varsa SQAP'ın
onunla ilişkisi de burada kurulur: hangi kurum prosedürü olduğu gibi uygulanır, hangisi bu
projede değiştirilir ya da uygulanmaz. Atıf yapılan her prosedürün kimliği ve sürümü verilir.

**Verilecek kararlar:**

- Plan hangi yazılım bileşenlerini ve sürümleri kapsıyor; projede birden çok yazılım
  seviyesi varsa her biri için Tablo A-9'un hangi hedefleri uygulanıyor?
- Kurum prosedürlerinden hangileri atıfla alınıyor, hangileri bu projede değiştiriliyor?
- Plan sertifikasyon sonrası değişikliklerde de kullanılacak mı; hangi faaliyetler daralır?
- SQAP'ın kendisini kim gözden geçiriyor ve ona ilişkin kalite güvencesi kaydını kim veriyor?
  Seviye A–C'de A-9 #1 bağımsızlıkla karşılandığı için bu kişi planın yazarı olmamalıdır
  (ör. kalite güvencesi yöneticisi ya da başka bir kalite güvencesi mühendisi).

### 2. Kalite güvencesi ortamı

Ortam bölümü, kalite güvencesinin nerede ve neyle çalıştığını anlatır. Kapsam, hangi
süreçlerin, yaşam döngüsü verisinin (software life cycle data) ve kuruluşların
(tedarikçiler dahil) denetleneceğini söyler. Organizasyon ve arayüzler, kalite güvencesinin
geliştirme, doğrulama, konfigürasyon yönetimi, sertifikasyon irtibatı ve sistem emniyeti
ekipleriyle hangi kanaldan çalıştığını tarif eder. Standartlar ve prosedürler kısmı kalite
güvencesinin kendi iş tariflerini kimlikleriyle listeler: denetim, uygunsuzluk ve yazılım
uygunluk gözden geçirmesi (software conformity review) prosedürleri gibi. Araçlar kısmı
kayıtların nerede tutulduğunu belirtir; belge deposu ve arşiv kuralları yazılım
konfigürasyon yönetimi planından (Software Configuration Management Plan, SCMP) gelir.

**Verilecek kararlar:**

- Kalite güvencesinin kapsamına hangi süreçler, veriler ve kuruluşlar giriyor; kapsam dışı
  bırakılan bir şey var mı, gerekçesi ne?
- Denetim, uygunsuzluk ve uygunluk gözden geçirmesi için hangi prosedür ve kontrol
  listeleri kullanılacak; bunlar hangi kimlikle konfigürasyon kontrolünde?
- Uygunsuzluklar ve denetim kayıtları hangi araçta tutulacak; bu araç problem raporlarının
  (problem report) tutulduğu araçla aynı mı?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Kalite güvencesi gerekli araç ve yöntemleri kullanır." | "Uygunsuzluklar `<araç adı ve sürümü>` üzerinde ayrı bir kayıt türüyle açılır; denetim kontrol listeleri KG-KL-01 … KG-KL-06 kimlikleriyle SCMP'de tanımlı belge deposunda tutulur." |

### 3. Yetki, sorumluluk ve bağımsızlık

Bu bölüm, planın geri kalanının ciddiye alınıp alınmayacağını belirler. DO-178C kalite
güvencesinde bağımsızlığı (independence) yalnızca geliştirmeden ayrı durmak olarak değil,
düzeltici faaliyetin (corrective action) yapılmasını sağlama yetkisi olarak da tanımlar.
Tablo A-9'da seviyeye uygulanan her hedef bağımsızlıkla karşılanır: Seviye A, B ve C'de
beş hedefin beşi, Seviye D'de iki hedefin ikisi. Ayrı raporlama hattı bu yetkiyi
sağlamanın en yaygın yoludur, ama standart bir organizasyon şeması dayatmaz. Kalite
güvencesi tam zamanlı bir ekip değilse, kişinin kendi ürettiği ya da doğruladığı işi
denetlemediği ve yetkisinin yazılı olduğu burada gösterilir. Kalite güvencesinin ürün onayı
(approval of software products), yani hangi kayda ya da teslime imza attığı ve bu imzanın
neyi beyan ettiği de bu bölümdedir.

**Verilecek kararlar:**

- Kalite güvencesi kime raporlar; o kişinin proje takviminden ya da bütçesinden
  sorumluluğu var mı?
- Kalite güvencesi personeli projede başka hangi rolleri üstlenebilir; denetlediği verinin
  yazarı ya da doğrulayıcısı olması nasıl önlenir?
- Kalite güvencesine kaç kişi ya da ne kadar efor ayrılıyor, hangi yetkinlik (DO-178C ve
  denetçi eğitimi) aranıyor; tek kişilik kalite güvencesinde kişi yokken yetki kime geçer?
- Kalite güvencesi hangi durumda temel çizgiyi (baseline), kredi amaçlı bir koşuyu ya da
  teslimi durdurabilir; bu engeli kim, hangi kayıtla kaldırabilir?
- Kalite güvencesi hangi ürünü ya da kaydı onaylar (sürüm teslimi, uygunluk gözden
  geçirmesi kaydı) ve bu onay neyi beyan eder?
- Kalite güvencesi ile proje anlaşamazsa karar kime gider, ne kadar sürede verilir?

**Dış kaynaklı kalite güvencesi.** DO-178C kalite güvencesini hangi kuruluşun yürüteceğini
söylemez; aradığı yetki, sorumluluk ve bağımsızlıktır (§8.2.a, §11.5.b). Hizmet bir danışman
firmadan alınabilir, ama iş devredilir, sorumluluk devredilmez. Dış firma da kalite
güvencesi sürecini yürüten bir tedarikçidir ve bütün tedarikçilerin gözetimi başvuru
sahibindedir (§1.4.c). Bu durumda plan, firmanın yetkisini (düzeltici faaliyeti sağlatma ve
ürün onayı dahil), kime raporladığını ve dayandığı sözleşme maddesini adıyla yazar. Yalnızca
rapor yazan, bulguyu kapattırma yetkisi olmayan bir hizmet, kalite güvencesindeki
bağımsızlığın tanımını karşılamaz. Firmanın işini başvuru sahibinde kimin gözettiği de
yazılır; bu gözetim için sözleşmede ayrı bir madde yer alır.

- Kalite güvencesi dış kaynaktan sağlanıyorsa aynı firma projede geliştirme ya da doğrulama
  da yapıyor mu; yapıyorsa denetleyen kişinin denetlediği işin yazarı olmadığı nasıl
  gösteriliyor?
- Dış firmanın işini başvuru sahibinde kim, hangi sıklıkla ve hangi kayıtlar üzerinden
  gözetiyor?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Kalite güvencesi hizmeti `<firma>` firmasından alınır." | "Kalite güvencesini sözleşmenin `<ek ve madde>` kısmına göre `<firma>` yürütür; firmanın kalite güvencesi mühendisi başvuru sahibinin kalite yöneticisine raporlar, uygunsuzluk açma, temel çizgiyi durdurma ve teslim onayı yetkisi vardır. Firmanın işini kalite yöneticisi her çeyrekte kayıt örnekleyerek gözetir." |
| "Kalite güvencesi bağımsızdır." | "Kalite güvencesi mühendisi kalite güvencesi yöneticisine raporlar; yazılım proje yöneticisine raporlama hattı yoktur. Denetlediği hiçbir verinin yazarı ya da doğrulayıcısı olamaz." |
| "Kalite güvencesi gerektiğinde müdahale eder." | "Açık büyük uygunsuzluk varken temel çizgi alınmaz ve kredi amaçlı test koşulmaz; bu engeli yalnızca kalite güvencesi yöneticisi, gerekçesini kayda yazarak kaldırabilir." |

### 4. Kalite güvencesi faaliyetleri

Planın en uzun bölümüdür; her alt başlık ne yapıldığını, hangi ölçüte göre, ne sıklıkta ve
hangi örneklemle yapıldığını söyler ve ilgili Tablo A-9 hedefini anar.

**4.1 Plan ve standartların gözden geçirilmesi.** Kalite güvencesi, planların ve
standartların yazıldığına, DO-178C ve uygulanan eklerle uyumunun ve birbirleriyle
tutarlılığının gözden geçirildiğine dair güvence elde eder (A-9 #1). Bu, planları ikinci
kez yazmak değildir: gözden geçirmenin tanımlı yöntemle yapıldığını, hedefleri plan
bölümleriyle eşleyen uyum matrisinin bulunduğunu, bulguların kapandığını ve planların
temel çizgiye alındığını görmektir. Plan değişikliğinde güvencenin nasıl yenileneceği de
yazılır.

**4.2 Süreç ve veri denetimleri, örnekleme.** Denetimin (audit) konusu bellidir: ekip
planların güncel sürümüyle çalışıyor mu; geliştirme ortamı planlarda yazıldığı gibi
kurulmuş mu; plan ve standartlardan sapmalar fark edilip kayda geçiyor mu; sistem
süreçlerinden ve sistem emniyet değerlendirmesinden gelen girdiler ele alınmış mı; veri
kontrol kategorisine (control category) uygun yönetiliyor mu? Standartlara uygunluk da
burada denetlenir. Planın asıl katkısı sıklık ve örneklemedir (sampling): her süreç ne
sıklıkta denetlenir, örneklem ne büyüklükte, riske göre nasıl seçilir (yeni ekip üyesinin
işi, yeni araç, son anda değişen veri, önceki bulgu alanları), bulgu çıkınca nasıl
genişletilir? Bu denetimler A-9 #2 (planlara uygunluk) ve A-9 #3 (standartlara uygunluk)
hedeflerine hizmet eder; Seviye D'de yalnızca #2 aranır. Kalite güvencesinin örneklemesi
doğrulamanın yerine geçmez: standarda uyum ve öteki doğrulama hedefleri (ör. A-5 #4)
doğrulama sürecinde eksiksiz karşılanır, kalite güvencesi bunun planlandığı gibi yapıldığını
örnekleyerek görür (DO-248C, FAQ #75).

**4.3 Gözden geçirmelere katılım ve tanıklık.** Kalite güvencesinin hangi gözden
geçirmelere katılacağı (ör. her sürecin ilk gözden geçirmesi, temel çizgi öncesi
gözden geçirmeler) ve hangi kredi amaçlı koşulara, derlemelere ya da yüklemelere tanıklık
(witnessing) edeceği yazılır. Tanıklık ancak kalite güvencesine önceden haber verilirse
mümkündür; bildirim süresi ve kanalı da plana girer.

**4.4 Geçiş kriterlerinin izlenmesi.** Yazılım geliştirme planı (Software Development Plan,
SDP) ve yazılım doğrulama planı (Software Verification Plan, SVP) gibi diğer planlardaki
geçiş kriterlerinin (transition criteria) sağlandığına dair güvence, kriter listesini
kayıtlarla karşılaştırarak elde edilir (A-9 #4). Plan, her geçişin mi yoksa bir örneklemin
mi denetleneceğini ve değerlendirmenin nasıl kayda geçeceğini söyler; artımlı projelerde
denetim artım bazında yapılır. Örnek kriterler
[Ek A: Örnek Geçiş Kriterleri](../01-ek-a-ornek-gecis-kriterleri.md)
sayfasındadır.

**4.5 Problem raporlama ve düzeltici faaliyetin izlenmesi.** Kalite güvencesi, problem
raporlama, izleme ve düzeltici faaliyet akışının SCMP'de yazıldığı gibi işlediğini denetler
(A-9 #2): raporlar açılıyor ve sınıflandırılıyor mu, kapananlarda düzeltmenin doğrulandığı
görülüyor mu, ertelenenler yeniden değerlendiriliyor mu?

**4.6 Yazılım uygunluk gözden geçirmesi.** Sertifikasyon başvurusunun parçası olarak
sunulacak her yazılım sürümü için teslimden önce yapılır ve her seviyede beklenir (A-9 #5).
Plan; gözden geçirmenin ne zaman yapılacağını, giriş koşullarını, kontrol listesinin
kimliğini ve sonucun nasıl kayda geçeceğini tanımlar. Gözden geçirmenin aradığı tespitler
ve tipik kanıtları
[11. Yazılım Kalite Güvencesi](../../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md#yazılım-uygunluk-gözden-geçirmesi)
bölümündeki tabloda üç güvenceye göre gruplanmıştır. SQAP bu soruları tekrar etmez; her
grup için projede hangi kaydın neyle karşılaştırılacağını yazar. Örnek bir eşleme:

- Süreçler tamam: yazılım sertifikasyon planındaki (Plan for Software Aspects of
  Certification, PSAC) ve SVP'deki kredi faaliyetleri listesi kapanmış kayıtlarla
  karşılaştırılır; problem raporu listesi bu sürüme göre güncellenmiş olmalıdır.
- Veri eksiksiz ve kontrollü: yazılım konfigürasyon indeksindeki (Software Configuration
  Index, SCI) her öğe arşivdeki sürümle karşılaştırılır; iz verisinden örneklem alınır;
  onaylı gereksinim sapmalarının listesi çıkarılır.
- Nesne kodu kontrollü: yeniden derleme kaydı ve yükleme denemesi kaydı incelenir.
- Varsa önceden geliştirilmiş yazılım: önceki temel çizgiden bu yana onaylanan
  değişikliklerin listesi güncel temel çizgiyle karşılaştırılır.

Uygunluk gözden geçirmesini kim yürütürse yürütsün (kurum içi ya da dış kaynaklı kalite
güvencesi), yapanın bağımsızlığı her seviyede aranır (A-9 #5) ve sonuç, başvuru sahibinin
yazılım başarım özetindeki (Software Accomplishment Summary, SAS) uyum beyanına dayanak olur;
bu beyanın sorumluluğu başvuru sahibindedir (§11.20.l).

Çalıştırılabilir nesne kodunun (executable object code) ve varsa parametre verisi öğesi
(parameter data item, PDI) dosyalarının yeniden üretilebilirliğinin gösterilme yolu da
yazılır. Sağlam bir yöntem: kaynak kod arşivden temiz bir çalışma alanına geri getirilir,
yazılım yaşam döngüsü ortam konfigürasyon indeksinde (Software Life Cycle Environment
Configuration Index, SECI) kayıtlı ortamla yeniden derlenir ve çıktıların sağlama toplamı
(checksum) SCI'daki değerlerle karşılaştırılır; zaman damgası gibi beklenen farklar
önceden gerekçelendirilir. Sertifikasyon sonrası
değişikliklerde yapılacak alt kümenin değişikliğin önemine göre nasıl seçileceği de yazılır.

:::warning[Uygunluk gözden geçirmesi son temel çizgi üzerinde yapılır]
Gözden geçirmeyi takvim baskısıyla öne çekip ardından "küçük bir düzeltme" yapmak, son
denetimin tipik bulgusunu üretir: kayıt, sunulan sürümü anlatmaz. Planda, sonradan veri ya
da kod değişirse gözden geçirmenin en azından etkilenen kalemler için tekrarlanacağı ve son
temel çizgiden önce bir prova yapılacağı yazılmalıdır.
:::

**4.7 Önceden geliştirilmiş yazılım için ek faaliyetler.** Önceden geliştirilmiş yazılım
(previously developed software, PDS) kullanılıyorsa kalite güvencesi iki şeyi ayrıca
denetler. Birincisi, PSAC'taki PDS boşluk analizinde yeni seviye için belirlenen eksiklerin
kapatıldığını gösteren kayıtlardır (ör. ek doğrulama ya da kapsam analizi). İkincisi,
planlarda PDS için tanımlanan farklı ya da ek süreç adımlarının gerçekten uygulandığıdır
(ör. değişiklik etki analizi). PDS yoksa "uygulanmaz" notu düşülür.

**Verilecek kararlar:**

- Her süreç hangi sıklıkta ya da hangi olayda denetlenecek; denetim takvimini kim, ne zaman
  yayımlayacak?
- Örneklem büyüklüğü ve seçim ölçütü ne; bulgu çıktığında örneklem nasıl genişletilecek?
- Kalite güvencesi hangi gözden geçirmelere katılacak, hangi kredi amaçlı koşulara tanıklık
  edecek; kendisine kaç iş günü önceden haber verilecek?
- Uygunluk gözden geçirmesinde yeniden derlemeyi kim, hangi ortamda yapacak; hangi farklar
  kabul edilecek?
- DO-330'a göre kalifiye edilen araçların kalite güvencesi bu planda mı, araç kalifikasyon
  planında mı tanımlanıyor?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Kalite güvencesi tüm faaliyetleri izler." | "Her temel çizgiden önce SDP'deki geçiş kriterleri, kontrol listesiyle ve kayıtlar karşısında tek tek denetlenir; sonuç temel çizgi kimliğiyle kayda geçer." |
| "Süreçler düzenli olarak denetlenir." | "Etkin her süreç üç ayda en az bir kez denetlenir; dönemin denetim takvimi dönem başında yayımlanır." |
| "Yeterli sayıda kayıt örneklenir." | "Her denetimde dönem içinde kapanan kayıtlardan en az 10'u (azsa tamamı) örneklenir; en az yarısı riske göre seçilir ve seçim gerekçesi kayda yazılır." |

Sayılar örnektir; DO-178C bir sıklık ya da oran vermez. Seçilen sayı uygulanabilir
olmalıdır: koyduğu oranı tutturamayan kalite güvencesi kendi planından sapar.

### 5. Kalite güvencesi sürecinin geçiş kriterleri

Geçiş kriterleri yalnızca geliştirme süreçleri için yazılmaz; bütünleyici süreçlerin
(integral processes) de girdisi ve tetikleyicisi vardır. Bu bölüm, kalite güvencesinin
sürece ne zaman girdiğini ve her faaliyeti için neyin hazır olması gerektiğini yazar: süreç
denetimine, denetlenecek veri temel çizgideyken ya da gözden geçirmesi kapanmışken; uygunluk
gözden geçirmesine son temel çizgi alınıp SCI hazırlandığında ve açık problem raporu listesi
dondurulduğunda girilir. 4.4'te kalite güvencesi başkalarının kriterlerini denetler; burada
kendi giriş koşullarını yazar.

**Verilecek kararlar:**

- Kalite güvencesi planlama sürecine hangi noktada girer: planların ilk taslağında mı,
  gözden geçirmeye sunulduklarında mı?
- Bir denetimin başlaması için denetlenecek veri hangi durumda olmalıdır?
- Her kalite güvencesi faaliyeti başlamadan hangi prosedür, kontrol listesi ve kayıt aracı
  yayımlanmış ve konfigürasyon kontrolünde olmalıdır?
- Uygunluk gözden geçirmesine giriş koşulları neler; koşul sağlanmadan başlanırsa ne olur?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Kalite güvencesi proje başından itibaren sürece dahildir." | "Kalite güvencesi, planların ilk taslağı gözden geçirmeye sunulduğunda sürece girer; uygunluk gözden geçirmesine son temel çizgi alınıp açık problem raporu listesi dondurulduğunda başlanır." |

### 6. Faaliyet takvimi

Bu bölüm, kalite güvencesi faaliyetlerinin yaşam döngüsü faaliyetlerine göre ne zaman
yapılacağını gösterir. Tarihe bağlı bir takvim proje kaydığında boşa düşer; olaya bağlı bir
takvim projenin hızına uyar. Çoğu plan ikisini birleştirir: olaylar denetimi tetikler,
dönemsel denetimler olaysız geçen uzun dönemleri kapsar. Bir başlangıç noktası:

| Olay | Kalite güvencesi faaliyeti | Kayıt |
|---|---|---|
| Planlar gözden geçirmeye sunuldu | Plan ve standart gözden geçirmesine güvence | Plan güvence kaydı |
| Bir sürecin ilk çıktıları üretildi | O sürecin ilk denetimi | Denetim raporu |
| Her temel çizgiden önce | Geçiş kriterlerinin denetimi | Geçiş denetim kaydı |
| Kredi amaçlı test koşusu | Tanıklık ya da koşu kayıtlarının denetimi | Tanıklık kaydı |
| Tedarikçi teslimatı | Teslimat ve tedarikçi süreç denetimi | Tedarikçi denetim raporu |
| SOI denetiminden birkaç hafta önce | İç ön denetim (mock audit) | Ön denetim raporu |
| Son temel çizgi alındı | Yazılım uygunluk gözden geçirmesi | Uygunluk gözden geçirmesi kaydı |
| Her üç ayda bir | Uygunsuzluk durumunun yönetime raporlanması | Durum raporu |

**Verilecek kararlar:**

- Hangi faaliyet bir olaya, hangisi takvime bağlı; dönemsel takvim nerede yayımlanıyor?
- Artımlı ya da çok bileşenli projede denetim artım ya da bileşen başına mı yapılıyor?
- İç ön denetimler hangi SOI denetimlerinden önce, ne kadar önce yapılıyor?

Dikkat: Takvimdeki her olay başka bir planda da tanımlı olmalıdır; "her temel çizgiden önce"
yazan satır temel çizgilerin SCMP'de, iç ön denetim satırı SOI tetikleyicilerinin PSAC'ta
tanımlı olmasına dayanır.

### 7. Kalite güvencesi kayıtları

Kalite güvencesinin asıl çıktısı kayıtlarıdır; otorite kalite güvencesinin yaptığı işi
ancak bu kayıtlardan görebilir. Bu bölüm, hangi kayıt türlerinin üretileceğini ve her
birinin asgari içeriğini tanımlar. Tipik türler denetim raporu, plan ve standart
gözden geçirmesine ilişkin güvence kaydı, tanıklık kaydı, uygunsuzluk kaydı, onaylı sapma
kaydı, toplantı tutanağı, durum raporu ve uygunluk gözden geçirmesi kaydıdır. Denetim
kaydı, işi başkasının yeniden izleyebileceği kadar ayrıntılı olmalıdır. Asgari alanlar:

- denetim kimliği, tarihi ve denetçi,
- kapsam ve dayanak: denetlenen süreç ya da veri, ölçüt alınan plan ya da standart maddesi
  ve sürümü, denetlenen temel çizgi ya da dönem,
- örneklenen öğeler ve seçim gerekçesi,
- bulgular ve açılan uygunsuzlukların kimlikleri,
- düzeltici faaliyet, sorumlusu, hedef tarihi, kapanış tarihi ve kapanış kanıtı.

Kalite güvencesi kayıtları her seviyede ikinci kontrol kategorisiyle (CC2) yönetilir;
saklama süresi ve arşiv yöntemi SCMP'deki kurallarla aynıdır.

**Verilecek kararlar:**

- Hangi kayıt türleri üretilecek ve her birinin şablonu nerede duruyor?
- Kayıtlar hangi araçta, hangi kimlik şemasıyla tutulacak; otoriteye nasıl gösterilecek?
- Saklama süresi ne; tedarikçide ya da dış kaynaklı kalite güvencesi firmasında tutulan
  kayıtlar hangi arşive giriyor ve sözleşme bittikten sonra başvuru sahibinin ve otoritenin
  bu kayıtlara erişimi nasıl güvence altında (§7.2.7, §9.2)?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Denetim yapıldı, uygunsuzluk bulunmadı." | "KG-DEN-014: kod gözden geçirme süreci, temel çizgi YB-2.3. SVP madde 4.1'e göre 12 kayıt örneklendi (liste ekte); 1 uygunsuzluk açıldı (UY-031)." |
| "Kayıtlar uygun biçimde saklanır." | "Kalite güvencesi kayıtları `<araç adı ve sürümü>` üzerinde CC2 olarak tutulur ve SCMP'de tanımlı arşiv süresince saklanır." |

### 8. Uygunsuzlukların ele alınması

Uygunsuzluk, onaylı bir plana ya da standarda aykırı yürütülen faaliyet ya da bu belgelere
göre bir çıktıda görülen eksikliktir. Bu bölüm, uygunsuzluğun açılıştan kapanışa yolunu
yazar: kayıt ve sınıflandırma, etki değerlendirmesi, sorumlu ve hedef tarih, kök nedenin
(root cause) giderilmesi, kapanış kanıtı ve süresi geçen kaydın üst yönetime taşınması.
Kaydın problem raporlama sisteminde bir tür mü, ayrı bir kalite güvencesi kaydı mı olacağı,
problem raporu ile bulgu arasındaki sınır ve durum akışı SCMP'de kararlaştırılır. SQAP bu
karara atıf yapar ve yalnızca kalite güvencesine özgü adımları ekler: uygunsuzluk sınıfları,
hedef süreler, üst yönetime taşıma ve kapanışın kalite güvencesince teyidi.

Onaylı sapma (approved deviation) ise faaliyetten önce istenmiş ve yetkili kişice onaylanmış
bir plandan ayrılmadır; kayda geçer ve proje sonunda yazılım başarım özetinin (Software
Accomplishment Summary, SAS) sapmaları anlatan kısmına kaynak olur. Standart kuralından
sapma (ör. kodlama standardındaki bir kurala tekil sapma) bu bölümün değil, ilgili
standardın sapma sürecinin konusudur: akışın ayrıntısı kodlama standardındadır, gereksinim
ve tasarım standardı ona atıf yapar. Kalite güvencesi bu kayıtların eksiksiz ve onaylı
olduğunu örnekleyerek denetler (A-9 #3, Seviye A–C).

**Verilecek kararlar:**

- Uygunsuzluk sınıfları neler, her sınıfın hedef kapanış süresi ne; süreyi aşan kayıt kime,
  hangi aşamalarla taşınır?
- SCMP'de seçilen kayıt yeri bu planda nasıl uygulanıyor; temel çizgideki bir veri
  değişecekse uygunsuzluk hangi problem raporuna bağlanır?
- Kapanış için hangi kanıt istenir; tekrarın önlendiği nasıl görülür?
- Plandan sapmayı kim onaylar; hangi sapma plan değişikliği gerektirir? Standart sapma
  kayıtları hangi sıklıkla örneklenir?
- Sertifikasyonda açık kalmasına izin verilen bir uygunsuzluk var mı; varsa kim onaylar ve
  hangi sınıfa girer (çoğunlukla "süreç"; sınıflar:
  [9. Yazılım Doğrulama](../../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md#açık-problem-raporlarıyla-sertifikasyona-gitmek))?
- Otoritenin SOI bulguları ve eylem maddeleri hangi kayıtta izlenir; kapanışlarını kalite
  güvencesi mi teyit eder, bir sonraki SOI'den önceki iç ön denetimde nasıl kontrol edilir?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Uygunsuzluklar takip edilir ve kapatılır." | "Büyük uygunsuzluk 30, küçük uygunsuzluk 60 gün içinde kapatılır; süresi geçen kayıt kalite güvencesi yöneticisine, 30 gün daha geçerse program direktörüne taşınır." |
| "Gerekli durumlarda plandan sapılabilir." | "Plandan sapma, faaliyetten önce sapma talebiyle istenir; kalite güvencesi yöneticisi ve yazılım proje yöneticisi onaylar. Onaylı sapmalar listesi SAS'ın sapma bölümünün kaynağıdır." |

### 9. Tedarikçi gözetimi

Yaşam döngüsü faaliyetlerinin bir kısmı tedarikçide yürüyorsa kalite güvencesinin alanı da
oraya uzanır: tedarikçinin süreç ve çıktılarının onaylı plan ve standartlara uyduğuna dair
güvence ana yüklenicinin kalite güvencesinden beklenir. Tedarikçinin kendi kalite güvencesi
bu yükümlülüğü kaldırmaz; ana yüklenici onun kayıtlarını örnekleyerek denetler. Bölüm, her
tedarikçi için denetimin kapsamını, sıklığını ve biçimini, uygunsuzlukların ana listeye
taşınmasını ve sözleşmenin kalite güvencesine verdiği hakları yazar. Sözleşmenin kurulması
ve tedarikçi gözetiminin (supplier oversight) bütünü
[26. Yazılım Yaşam Döngüsü Faaliyetlerinde Dış Kaynak Kullanımı](../../05-ozel-konular/26-dis-kaynak-kullanimi.md)
bölümünde anlatılır.

Tedarikçinin süreçlerine kalite güvencesi açısından üç yoldan bakılabilir; plan, her tedarikçi
için hangisinin uygulandığını söyler:

- Tedarikçi kendi kalite güvencesini yürütür; başvuru sahibinin kalite güvencesi (ya da onun
  adına çalışan firma) bu kayıtları örnekleyerek gözetir.
- Başvuru sahibinin kalite güvencesi tedarikçinin sahasında doğrudan denetim yapar.
- İkisinin birleşimi: rutin denetimi tedarikçi yapar, olay tetikli denetimleri başvuru sahibi.

Gözetimi tümüyle geliştiren tedarikçinin kendi kalite güvencesine bırakmak, başvuru sahibinin
gözetim sorumluluğunu karşılamaz (§1.4.c, §8.2.i). Bu, bağımsız bir firmadan kalite güvencesi
hizmeti almaktan farklıdır; o durum 3. bölümde ele alınır.

**Verilecek kararlar:**

- Hangi tedarikçi hangi süreçleri yürütüyor; her biri için denetim sıklığı ve biçimi ne?
- Tedarikçinin kalite güvencesi kime raporluyor; tedarikçinin geliştirme yönetiminden
  bağımsız mı?
- Sözleşme ana yüklenicinin ve otoritenin denetim hakkını, tedarikçinin kalite güvencesi
  kayıtlarına erişimi ve bu koşulların alt tedarikçilere aktarılmasını içeriyor mu?
- Tedarikçinin kalite güvencesi kayıtları nasıl ve ne oranda örneklenecek?
- Tedarikçide açılan uygunsuzluklar ana listeye nasıl ve ne kadar sürede taşınacak?

| Zayıf ifade | Güçlü ifade |
|---|---|
| "Tedarikçi gerektiğinde denetlenir." | "Her tedarikçi ilk teslimattan önce yerinde, sonra her temel çizgiden önce denetlenir; her denetimde tedarikçinin kalite güvencesi kayıtlarından en az beşi örneklenir. Denetim ve kayıt erişim hakkı sözleşmenin `<ek ve madde>` kısmındadır." |

### 10. Ölçümler ve süreç iyileştirme (isteğe bağlı)

Bu bölüm isteğe bağlıdır; §11.5'in girişi ölçüm ve süreç iyileştirmeyi planın zorunlu
içeriği arasında saymaz, yalnızca eklenebilecek konular olarak anar. Yazılırsa, kalite
güvencesinin kendi etkinliğini gösteren birkaç ölçüm seçilir: açık uygunsuzlukların sayısı
ve yaşı, aynı bulgunun tekrar etme sıklığı, denetim takvimine uyum ve SOI denetimlerinde
çıkan bulgulardan kaçının kalite güvencesince önceden yakalandığı. Ölçüm kanıtın yerini
tutmaz, yalnızca nereye bakılacağını gösterir. Plana yazılan ölçüm de bir taahhüttür;
üretilmezse denetimde plandan sapma olarak görülür.

**Verilecek kararlar:**

- Hangi ölçümler, hangi sıklıkta ve kime raporlanacak?
- Bir ölçüm eşiği aşarsa (ör. aynı bulgunun üç denetimde tekrarı) hangi faaliyet başlar?

## Seviyeye göre farklar

SQAP her seviyede beklenir; seviyeyle değişen, planın güvence altına alacağı hedeflerin
sayısı ve planın kontrol kategorisidir. Kalite güvencesi hedefleri uygulandıkları her
seviyede bağımsızlıkla karşılanır.

| Konu | A ve B | C | D |
|---|---|---|---|
| SQAP | Beklenir; CC1 | Beklenir; CC2 | Beklenir; CC2 |
| A-9 #1: plan ve standartlar | Bağımsızlıkla | Bağımsızlıkla | Aranmaz |
| A-9 #2: planlara uygunluk | Bağımsızlıkla | Bağımsızlıkla | Bağımsızlıkla |
| A-9 #3: standartlara uygunluk | Bağımsızlıkla | Bağımsızlıkla | Aranmaz |
| A-9 #4: geçiş kriterleri | Bağımsızlıkla | Bağımsızlıkla | Aranmaz |
| A-9 #5: uygunluk gözden geçirmesi | Bağımsızlıkla | Bağımsızlıkla | Bağımsızlıkla |
| Kalite güvencesi kayıtları | CC2 | CC2 | CC2 |

Seviye A ile B arasında SQAP açısından standart bir fark yoktur; fark denetimin
yoğunluğundadır ve projenin kararıdır. Seviye C'de hedefler aynı kalır, SQAP ise CC2 ile
yönetilir: kimliği bellidir ve yetkisiz değişikliğe karşı korunur, ama değişiklikleri için
CC1'deki problem raporlama ve değişiklik izleme şartı aranmaz
([10. Yazılım Konfigürasyon Yönetimi](../../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md#kontrol-kategorileri-cc1-ve-cc2)).

Seviye D'de plan yine yazılır, çünkü yaşam döngüsü faaliyetlerinin tanımlanması ve ek
hususların ele alınması bu seviyede de planlama hedefidir. Kalite güvencesinden yalnızca
planlara uygunluk ve uygunluk gözden geçirmesi için güvence istenir; yaşam döngüsünün ve
geçiş kriterlerinin tanımlanması da aranmadığı için şablonun 5. bölümü isteğe bağlıdır.
SQAP'ta 4.1, 4.4 ve standartlara uygunluk denetimi "bu seviyede hedef değildir" notuyla
kısaltılabilir. Yine de plana yazılan her faaliyet bağlayıcıdır; Seviye A projesinin
SQAP'ını olduğu gibi kopyalamak, uygulanmayacak sözler vermek demektir.

## DO-178C uyum tablosu

| DO-178C | Konu | Şablondaki yer |
|---|---|---|
| §11.5 (giriş) | Planın işlevi; isteğe bağlı ölçümler | 1 Amaç ve kapsam; 10 Ölçümler ve süreç iyileştirme |
| §11.5.a | Kalite güvencesi ortamı | 2 Kalite güvencesi ortamı (2.1–2.4) |
| §11.5.b | Yetki, bağımsızlık, ürün onayı | 3 Yetki, sorumluluk ve bağımsızlık |
| §11.5.c.1 | Kalite güvencesi yöntemleri | 4.1–4.4 |
| §11.5.c.2 | Problem raporlama ve düzeltici faaliyet | 4.5 Problem raporlama ve düzeltici faaliyetin izlenmesi; 8 Uygunsuzlukların ele alınması |
| §11.5.c.3 | Uygunluk gözden geçirmesinin tanımı | 4.6 Yazılım uygunluk gözden geçirmesi |
| §11.5.d | Kalite güvencesine giriş kriterleri | 5 Kalite güvencesi sürecinin geçiş kriterleri |
| §11.5.e | Faaliyetlerin yaşam döngüsündeki zamanı | 6 Faaliyet takvimi |
| §11.5.f | Üretilecek kayıtların tanımı | 7 Kalite güvencesi kayıtları |
| §11.5.g | Tedarikçi gözetimi | 9 Tedarikçi gözetimi |
| §1.4.c | Tedarikçi gözetiminin sorumluluğu | 3.5 Dış kaynaklı kalite güvencesi; 9 Tedarikçi gözetimi |
| §8.1.a, §8.2.b | Plan ve standartlara güvence | 4.1 Plan ve standartların gözden geçirilmesi |
| §8.1.b, §8.2.c | Plan ve standartlara uygunluk | 4.2 Süreç ve veri denetimleri, örnekleme |
| §8.1.c, §8.2.e | Geçiş kriterlerinin sağlanması | 4.4 Geçiş kriterlerinin izlenmesi |
| §8.1.d, §8.2.g | Uygunluk gözden geçirmesinin yapılması | 4.6 Yazılım uygunluk gözden geçirmesi |
| §8.2.a | Etkin rol, yetki, bağımsızlık | 3 Yetki, sorumluluk ve bağımsızlık; 4.3 |
| §8.2.d.1 | Planların ekipte bulunması | 4.2 Süreç ve veri denetimleri, örnekleme |
| §8.2.d.2 | Sapmaların tespiti ve izlenmesi | 4.2; 8 Uygunsuzlukların ele alınması |
| §8.2.d.3 | Onaylı sapmaların kaydı | 8.4 Onaylı sapmalar |
| §8.2.d.4 | Geliştirme ortamının planlandığı gibi kurulması | 4.2 Süreç ve veri denetimleri, örnekleme |
| §8.2.d.5 | Problem raporlamanın SCMP'ye uyumu | 4.5 Problem raporlama ve düzeltici faaliyetin izlenmesi |
| §8.2.d.6 | Sistem süreçlerinden gelen girdiler | 4.2 Süreç ve veri denetimleri, örnekleme |
| §8.2.f | Kontrol kategorisine uygun yönetim | 4.2 Süreç ve veri denetimleri, örnekleme |
| §8.2.h | Kayıt üretimi | 7 Kalite güvencesi kayıtları |
| §8.2.i | Tedarikçi süreç ve çıktıları | 9 Tedarikçi gözetimi |
| §8.3.a, d, h | Faaliyetlerin tamamlanması, raporların değerlendirilmesi | 4.6 Yazılım uygunluk gözden geçirmesi |
| §8.3.b, c, e | Veri uyumu, izlenebilirlik ve sapmalar | 4.6 Yazılım uygunluk gözden geçirmesi |
| §8.3.f, g | Yeniden üretme ve yükleme | 4.6 Yazılım uygunluk gözden geçirmesi |
| §8.3.i | PDS temel çizgisine izlenebilirlik | 4.6; 4.7 |
| §8.3 Not | Sertifikasyon sonrası değişiklikte alt küme | 4.6 Yazılım uygunluk gözden geçirmesi |
| §11.19 | Kalite güvencesi kayıtlarının içeriği | 7.1 Kayıt türleri ve asgari içerik |
| §12.1.6.a | PDS'nin yeni seviyeye uygunluğu | 4.7 Önceden geliştirilmiş yazılım için ek faaliyetler |
| §12.1.6.b | Süreç değişikliklerinin planlarda yer alması | 4.7 Önceden geliştirilmiş yazılım için ek faaliyetler |
| §4.2.l | Tedarikçi gözetiminin planlanması | 9 Tedarikçi gözetimi |
| §4.3.b.1–3 | Geçiş kriterinin üç bileşeni | 5 Kalite güvencesi sürecinin geçiş kriterleri |

### Teknoloji ekleri

| Ek | Madde | Şablona etkisi |
|---|---|---|
| DO-331 | MB.11.5 | §11.5 değişmez. MB.8.2.b ve Tablo MB.A-9 #1, plan ve standartların ekle uyumunu da kapsar; MB.8.2.f'ye göre kontrol kategorilerinde Ek MB.A tabloları esas alınır (4.2, 7.2); model standartları (MB.11.23) 4.1 ve 4.2'nin denetim konusuna girer. |
| DO-332 | OO.11.5 | §11.5 değişmez. OO.8.2.b plan ve standart güvencesine ekle uyumu ekler; OO.8.2.f'ye göre kontrol kategorilerinde Ek OO.A tabloları da esas alınır (4.1, 4.2). |
| DO-333 | FM.11.0 | §11.5, §8 ve Tablo A-9 değişmez; SQAP'a ek madde gelmez. Ekin PSAC, SVP ve standartlara getirdiği maddeler 4.1'deki plan güvencesinin konusudur. |

Bu eşleme bir başvuru aracıdır; DO-178C'nin ve eklerinin metninin yerine geçmez, maddelerin
içeriği için standardın kendisine bakılmalıdır.

## Diğer belgelerle tutarlılık

| Bu belgede | Örtüşmesi gereken belge | Nasıl denetlenir |
|---|---|---|
| 3 Yetki ve raporlama hattı | [PSAC](01-psac.md): organizasyon ve sorumluluklar | İki belgedeki rol adları ve raporlama hattı karşılaştırılır |
| 4.4 Geçiş kriterlerinin izlenmesi | [SDP](02-sdp.md) ve [SVP](03-svp.md): yaşam döngüsü ve doğrulamaya giriş kriterleri | Planlardaki her kriterin SQAP takviminde bir denetim noktası var mı bakılır |
| 4.3 Tanıklık | [SVP](03-svp.md): kredi amaçlı test koşuları | SVP'nin koşuları kalite güvencesine önceden bildirmeyi söylediği görülür |
| 4.5 ve 8 Uygunsuzluk akışı | [SCMP](04-scmp.md): problem raporlama ve değişiklik kontrolü | SQAP'ın SCMP'deki kayıt yerine ve durum akışına atıf yaptığı, kapanışı doğrulayan rolün iki planda aynı olduğu görülür |
| 7.2 Kayıtların yönetimi | [SCMP](04-scmp.md): kontrol kategorileri ve arşiv | Kalite güvencesi kayıtlarının SCMP listesinde CC2 olarak yer aldığı ve saklama süresinin aynı olduğu görülür |
| 4.2 Standartlara uygunluk | [Gereksinim](06-gereksinim-standardi.md), [tasarım](07-tasarim-standardi.md) ve [kodlama standardı](08-kodlama-standardi.md) | Denetim kontrol listesinin kural numaralarına atıf yaptığı ve kodlama standardındaki akışla açılan sapma kayıtlarının örnekleme girdiği görülür |
| 9 Tedarikçi gözetimi | [PSAC](01-psac.md): tedarikçiler ve gözetim yaklaşımı | PSAC'ta anılan her tedarikçinin SQAP takviminde yer aldığı görülür |
| 4.6 ve 6 Uygunluk gözden geçirmesi, iç ön denetim | [PSAC](01-psac.md): kilometre taşları ve SOI tetikleyicileri; SAS, SCI; [SCMP](04-scmp.md): arşiv | İç ön denetimlerin SOI tetikleyicilerinden önce, uygunluk gözden geçirmesinin SOI-4'ten ve SAS'tan önce planlandığı görülür |

## Sık hatalar

| Hata | Tipik nedeni | Önlem |
|---|---|---|
| Kalite güvencesi proje yöneticisine raporluyor | Organizasyonun plan yazılırken düşünülmemesi | Proje yönetiminden ayrı bir raporlama hattı kurmak; mümkün değilse düzeltici faaliyet yetkisini ve proje yöneticisinin üstüne taşıma yolunu adıyla yazmak |
| Denetim takvimi yalnızca takvim tarihlerine bağlı | Kurum planından kopyalama | Temel çizgi, teslimat ve SOI gibi olaylara bağlı denetim tetikleyicileri tanımlamak |
| Örneklem tanımsız ya da "yeterli sayıda" | Taahhüdün sonradan tutturulamayacağı kaygısı | Asgari sayı, seçim ölçütü ve genişletme kuralı yazmak; uygulanabilir bir sayı seçmek |
| SQAP ile SCMP iki ayrı uygunsuzluk akışı anlatıyor | İki planın farklı kişilerce yazılması | Akışı SCMP'de tanımlayıp SQAP'tan atıf yapmak; SQAP yalnızca kalite güvencesine özgü adımları ekler |
| Uygunluk gözden geçirmesi yalnızca "yapılır" diye geçiyor | Proje sonunun planlamada uzak görünmesi | Zamanını, giriş koşullarını, kontrol listesini ve yeniden derleme yöntemini yazmak |
| Seviye D projede Seviye A SQAP'ı aynen kullanılmış | Şablonun uyarlanmadan kopyalanması | Seviyede aranmayan faaliyetleri kısaltmak ya da yazılanı uygulamak |
| Kalite güvencesi danışman firmaya verilmiş, yetkisi ve raporlama hattı yazılı değil | Hizmetin yalnızca rapor yazma olarak satın alınması | Sözleşmede ve SQAP'ta uygunsuzluk açma, işi durdurma ve ürün onayı yetkisini, raporlama hattını ve firmanın nasıl gözetileceğini yazmak |
| Tedarikçinin kalite güvencesi kayıtlarına erişim yok | Denetim hakkının sözleşmeye yazılmaması | Erişim ve denetim hakkını sözleşme şartı yapıp SQAP'ta anmak |

## Yayımlamadan önce

- [ ] Raporlama hattı, işi durdurma yetkisi ve anlaşmazlıkta karar verecek kişi adıyla ve
      rolüyle yazılı mı?
- [ ] Kalite güvencesi personelinin denetlediği verinin yazarı ya da doğrulayıcısı
      olmayacağı açıkça söyleniyor mu?
- [ ] Her denetim türü için sıklık ya da tetikleyici olay, örneklem büyüklüğü, seçim
      ölçütü ve genişletme kuralı tanımlı mı?
- [ ] Faaliyet takvimindeki her olay (temel çizgi, teslimat, kredi amaçlı koşu) diğer
      planlarda da tanımlı mı?
- [ ] Uygunsuzluk akışı SCMP'deki problem raporlama akışına atıf yapıyor mu; sınıflar,
      hedef süreler ve üst yönetime taşıma yolu yazılı mı?
- [ ] Uygunluk gözden geçirmesinin zamanı, kontrol listesi ve yeniden üretme yöntemi
      tanımlı mı?
- [ ] Kayıt türleri, asgari içerikleri, kontrol kategorisi ve saklama süresi belirtilmiş mi?
- [ ] Her tedarikçi için gözetim sıklığı ve sözleşmedeki erişim hakkı gösterilmiş mi?
- [ ] Kalite güvencesi dış kaynaktan sağlanıyorsa firmanın yetkisi, raporlama hattı ve
      başvuru sahibindeki gözetimi yazılı mı?

Otoritenin planlama denetiminde SQAP'ta baktığı noktalar için [SW SOI-1](../06-kontrol-listeleri/soi-1.md)
kontrol listesine bakılabilir.

## İlgili bölümler

- [5. Yazılım Planlama](../../03-do178c-ile-gelistirme/05-yazilim-planlama.md)
- [9. Yazılım Doğrulama](../../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)
- [10. Yazılım Konfigürasyon Yönetimi](../../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md)
- [11. Yazılım Kalite Güvencesi](../../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
- [12. Sertifikasyon İrtibatı](../../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- [24. Yazılım Yeniden Kullanımı](../../05-ozel-konular/24-yazilim-yeniden-kullanimi.md)
- [26. Yazılım Yaşam Döngüsü Faaliyetlerinde Dış Kaynak Kullanımı](../../05-ozel-konular/26-dis-kaynak-kullanimi.md)
- [Ek A: Örnek Geçiş Kriterleri](../01-ek-a-ornek-gecis-kriterleri.md)
- Denetim listeleri: [SW SOI-1](../06-kontrol-listeleri/soi-1.md), [SW SOI-2](../06-kontrol-listeleri/soi-2.md),
  [SW SOI-3](../06-kontrol-listeleri/soi-3.md), [SW SOI-4](../06-kontrol-listeleri/soi-4.md)
- Diğer şablonlar: [Genel bakış](index.md), [PSAC](01-psac.md), [SDP](02-sdp.md),
  [SVP](03-svp.md), [SCMP](04-scmp.md), [gereksinim standardı](06-gereksinim-standardi.md),
  [tasarım standardı](07-tasarim-standardi.md), [kodlama standardı](08-kodlama-standardi.md)
