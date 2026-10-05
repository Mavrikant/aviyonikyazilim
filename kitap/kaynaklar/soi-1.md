---
title: "SW SOI-1"
description: "SOI-1 planlama denetimi kontrol listesi: giriş kriterleri, planlarda otoritenin baktığı noktalar, veri paketi ve sık görülen bulgular."
sidebar_position: 2
---

SOI-1, sertifikasyon otoritesinin projeye ilk resmî katılımıdır: yazılım planları ve
standartları, yazılım seviyesinin gerektirdiği hedefleri karşılayacak biçimde yazılmış
mı, birbiriyle tutarlı mı ve ekip gerçekten bu planlara göre çalışmaya başlamış mı?
Bu sayfa, denetime girmeden önce ekibin kendi kendine sorabileceği soruları bir
kontrol listesi olarak toplar.

Katılım aşaması (Stage of Involvement, SOI) denetimlerinin genel mantığı, dört
aşamanın birbirine bağlanışı ve denetim akışı
[12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümünde anlatılır. Buradaki maddeler bir otorite listesinin çevirisi değil, sahada
işe yarayan hazırlık sorularıdır; denetimin kapsamı ve biçimi otoriteye, yazılım
seviyesine ve projenin özelliklerine göre değişir.

:::tip[Bu listeyi nasıl kullanmalı?]
Listeyi denetimden birkaç hafta önce, kalite güvencesinin yürüttüğü bir iç ön denetimde
(mock audit) kullanın. "Hayır" ya da "kısmen" yanıtı alan her madde için ya düzeltici
faaliyet açın ya da gerekçeyi yazın; otoritenin aynı soruyu sorduğunda alacağı yanıt
o gerekçedir.
:::

## Ne zaman yapılır?

SOI-1, planlar yayımlandıktan sonra, ama geliştirme veri üretimi hızlanmadan önce
yapılmalıdır. Çok erken çağrılırsa planlar henüz olgunlaşmamıştır; çok geç
çağrılırsa otoritenin isteyeceği değişiklikler, planlara göre zaten üretilmiş
gereksinim, tasarım ve kodu da etkiler. Tipik giriş kriterleri şunlardır:

- [ ] Yazılım seviyesinin gerektirdiği planlar ve geliştirme standartları (Seviye A, B
      ve C'de beş plan ile gereksinim, tasarım ve kodlama standartları; Seviye D'de beş
      plan) yazılmış, gözden geçirilmiş ve konfigürasyon yönetimi altına alınmıştır.
      Planların tek belgede birleştirilmesi ya da standartların yazılım geliştirme
      planıyla (Software Development Plan, SDP) aynı belgede paketlenmesi engel değildir;
      önemli olan içeriğin eksiksiz olmasıdır. Yalnız, bazı otoriteler yazılım
      sertifikasyon planını (Plan for Software Aspects of Certification, PSAC) ayrı belge
      olarak ister.
- [ ] Planların gözden geçirme kayıtları ve kalite güvencesinin planlara ilişkin
      gözden geçirme kayıtları hazırdır.
- [ ] Sistem tarafından atanan yazılım seviyesi ve dayandığı emniyet değerlendirmesi
      çıktıları (fonksiyonel tehlike değerlendirmesi (functional hazard assessment,
      FHA) ve ön sistem emniyet değerlendirmesi (preliminary system safety assessment,
      PSSA)) gösterilebilir durumdadır.
- [ ] Araç kalifikasyonu (tool qualification) gerektiren araçlar belirlenmiş, varsa
      araç kalifikasyon planları yazılmıştır.
- [ ] PSAC otoriteye denetimden önce, okunmaya yetecek süre bırakılarak gönderilmiştir.

Seviye D'de kapsam daralır: planlama hedeflerinden yalnızca yaşam döngüsü faaliyetlerinin
tanımlanması ile ek hususların ele alınması aranır. Beş plan yine beklenir; geliştirme
standartlarının tanımlanması, planların DO-178C'ye uyumunun gözden geçirilmesi ve kalite
güvencesinin plan ve standartlara ilişkin güvencesi bu seviyede hedef değildir.

## Planlar: otoritenin baktığı noktalar

### Sertifikasyon yaklaşımı (PSAC)

- [ ] Sistem ve yazılım kısa ama anlaşılır biçimde tanıtılmış mı; yazılımın hangi
      işlevi yerine getirdiği ve hangi arıza durumlarına katkı verebileceği açık mı?
- [ ] Yazılım seviyesi ve gerekçesi, sistem emniyet değerlendirme sürecinin çıktılarıyla
      tutarlı mı?
- [ ] Uyumun neye göre gösterileceği açık mı: DO-178C'yi kabul edilebilir uyum yöntemi
      olarak tanıyan otorite dokümanı (FAA için AC 20-115D, EASA için AMC 20-115D) ve
      varsa projeye özgü ek otorite beklentileri yazılmış mı?
- [ ] Ek değerlendirme gerektiren durumlar listelenmiş mi: önceden geliştirilmiş
      yazılım (previously developed software, PDS), ticari hazır yazılım (commercial
      off-the-shelf, COTS), kalifiye edilecek araçlar, sahada yüklenebilir yazılım,
      kullanıcı tarafından değiştirilebilir yazılım, parametre verisi öğeleri
      (parameter data item, PDI), devre dışı bırakılmış kod (deactivated code),
      bölümleme iddiaları, çok çekirdekli işlemci (multi-core processor) kullanımı
      (AC 20-193 / AMC 20-193), alternatif yöntemler?
- [ ] DO-331, DO-332 ya da DO-333 eklerinden (supplement) hangilerinin neden
      uygulanacağı ve hangi araçların DO-330'a göre kalifiye edileceği yazılmış mı?
- [ ] Sertifikasyon anında açık kalabilecek problem raporlarının nasıl sınıflandırılıp
      yönetileceği (AC 20-189 / AMC 20-189 doğrultusunda) planlarda tanımlı mı?
      Sınıflar 9. bölümün problem raporlama kısmında anlatılır.
- [ ] Hangi yaşam döngüsü verisinin otoriteye sunulacağı, hangisinin yalnızca talep
      üzerine gösterileceği belli mi?
- [ ] Takvim, SOI denetimlerinin yaklaşık zamanlarını içeriyor mu?
- [ ] Tedarikçiler veya dış kaynak kullanılıyorsa gözetim yaklaşımı tanımlı mı?

### Geliştirme, doğrulama ve destek planları

- [ ] Yaşam döngüsü modeli ve her sürecin geçiş kriterleri (transition criteria)
      ölçülebilir biçimde tanımlı mı? ([Ek A](../06-ekler/01-ek-a-ornek-gecis-kriterleri.md))
- [ ] SDP, kullanılan dili, derleyiciyi, bağlayıcıyı ve geliştirme ortamını
      sürümleriyle belirtiyor; gereksinim, tasarım ve kodlama kuralları için ilgili
      standartlara atıf yapıyor mu?
- [ ] Yazılım doğrulama planı (Software Verification Plan, SVP), yazılım seviyesinin
      gerektirdiği bağımsızlığı (independence) kimin, hangi faaliyette sağlayacağını
      söylüyor mu? Bağımsızlık her hedefte değil, seviyeye göre belirli hedeflerde
      aranır ([9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)).
- [ ] Gereksinim tabanlı test (requirements-based testing), gürbüzlük (robustness)
      testi, hedef donanımda test ve yapısal kapsam analizi (structural coverage
      analysis) yaklaşımı tanımlı mı?
- [ ] Kapsam boşluklarının, ölü kodun (dead code) ve devre dışı bırakılmış kodun nasıl
      ele alınacağı planlanmış mı?
- [ ] Yazılım konfigürasyon yönetimi planı (Software Configuration Management Plan,
      SCMP), konfigürasyon öğelerini, temel çizgi (baseline) kurallarını, değişiklik
      kontrolünü ve problem raporlama (problem reporting) akışını tanımlıyor mu?
- [ ] SCMP, hangi yaşam döngüsü verisinin hangi kontrol kategorisinde (control
      category; CC1 ya da CC2) yönetileceğini, arşivleme ve geri getirme yöntemini ve
      yaşam döngüsü ortamının (derleyici, araçlar, test düzeneği) nasıl kontrol altında
      tutulacağını söylüyor mu?
      ([10. Yazılım Konfigürasyon Yönetimi](../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md))
- [ ] Yazılım kalite güvencesi planı (Software Quality Assurance Plan, SQAP), kalite
      güvencesinin bağımsızlığını, denetim sıklığını ve uygunsuzluk kayıtlarının nasıl
      kapatılacağını açıklıyor mu?
- [ ] Planlar arasındaki çapraz başvurular tutarlı mı? (Bir planın "SVP'de
      tanımlanmıştır" dediği konu gerçekten SVP'de var mı?)

### Standartlar

- [ ] Gereksinim standardı, iyi bir gereksinimin ölçütlerini ve türetilmiş gereksinimin
      (derived requirement) nasıl işaretlenip sistem süreçlerine iletileceğini
      tanımlıyor mu?
- [ ] Tasarım standardı karmaşıklık, kesme kullanımı, dinamik bellek ve özyineleme gibi
      konularda kısıt koyuyor mu?
- [ ] Kodlama standardı dil alt kümesini (örneğin MISRA C tabanlı bir kural seti),
      sapma (deviation) sürecini ve otomatik denetim yöntemini tanımlıyor mu?
- [ ] Standartlardaki kurallar gözden geçirmede "uyuyor / uymuyor" diye
      yanıtlanabilecek kadar somut mu?

### Araçlar

- [ ] Kullanılan her aracın rolü listelenmiş ve hangilerinin kalifikasyon gerektirdiği
      gerekçelendirilmiş mi?
- [ ] Kalifikasyon gerektiren araçlar için araç kalifikasyon seviyesi (tool
      qualification level, TQL) belirlenmiş mi?
- [ ] Kalifikasyon gerektirmediği söylenen araçlar için "çıktısı başka bir faaliyetle
      doğrulanıyor" gerekçesi gerçekten doğru mu?

## Hazırlanacak veri paketi

DO-178C'nin otoriteye sunulmasını asgari olarak beklediği veri PSAC, yazılım
konfigürasyon indeksi (Software Configuration Index, SCI) ve yazılım başarı özetidir
(Software Accomplishment Summary, SAS); bu aşamada bunlardan yalnızca PSAC vardır.
Kalifikasyon gerektiren araç varsa DO-330, TQL-1 ile TQL-4 arasındaki araçlar için araç
kalifikasyon planının da PSAC ile birlikte sunulmasını bekler. Geri kalan veri denetimde
gösterilir ve talep edildiğinde erişime açılır. Otorite başka planların da önceden
gönderilmesini isteyebilir; bu yüzden aşağıdaki ayrım bir alt sınırdır, kesin liste
PSAC'ta otoriteyle kararlaştırılır.

| Veri | Otoriteye | Neden istenir |
|---|---|---|
| PSAC | Sunulur | Sertifikasyon yaklaşımının otoriteyle üzerinde anlaşılan özeti; denetimin çıkış noktası |
| SDP, SVP, SCMP, SQAP | Denetimde gösterilir | Hedeflerin hangi süreç, yöntem ve ortamla karşılanacağını gösterir |
| Gereksinim, tasarım ve kodlama standartları | Denetimde gösterilir | Geliştirme verisinin hangi kurallarla üretileceğini gösterir |
| Planların gözden geçirme kayıtları | Denetimde gösterilir | Planların kendisinin de doğrulandığının kanıtı |
| Kalite güvencesi kayıtları | Denetimde gösterilir | Kalite güvencesinin plan ve standartları gözden geçirdiğinin, bulduğu uygunsuzlukları izleyip kapattığının kanıtı |
| Araç kalifikasyon planları (varsa) | Sunulur (TQL-1 – TQL-4); TQL-5'te ayrı plan beklenmez, yaklaşım PSAC'ta anlatılır | Araç kredisinin baştan doğru kurgulandığını gösterir; kalifikasyon yaklaşımı üzerindeki mutabakatın dayanağıdır |
| Emniyet değerlendirmesinden ilgili çıktılar | Denetimde gösterilir | Yazılım seviyesinin gerekçesi |
| Konfigürasyon kayıtları | Denetimde gösterilir | Denetlenen plan ve standartların hangi sürüm olduğunu, temel çizgiye alındığını ve sonraki değişikliklerin kontrol altında olduğunu gösterir |

## Sık görülen bulgular

| Bulgu | Tipik nedeni | Önlem |
|---|---|---|
| Planlar başka bir projeden kopyalanmış, proje adı dışında farkı yok | Takvim baskısı, "şablon yeter" varsayımı | Planı projeye özgü kararlarla (araçlar, ortam, ekip yapısı) doldurmak |
| Geçiş kriterleri "tamamlandığında" gibi ölçülemez ifadeler | Kriterin kim tarafından nasıl kontrol edileceği düşünülmemiş | Her kriteri bir kayıt ya da ölçümle ilişkilendirmek |
| Planlar arasında çelişki (araç, sürüm, sorumluluk) | Planların farklı kişilerce, birbirinden habersiz yazılması | Planları birlikte gözden geçirmek; tek bir terim ve araç listesi tutmak |
| Bağımsızlık gerekliliği planda yok ya da belirsiz | Ekip yapısının sonradan belirlenmesi | Bağımsızlığın arandığı hedefleri seviyeye göre çıkarıp her biri için kimin sağlayacağını SVP'ye yazmak |
| Kalifikasyon gerektiren bir araç hiç anılmamış | Araç envanterinin çıkarılmaması | Geliştirme ve doğrulama zincirindeki her aracı listeleyip tek tek değerlendirmek |
| Planlar konfigürasyon yönetimi altında değil | Planların "belge" değil "taslak" gibi görülmesi | Planları ilk temel çizginin parçası yapmak |

## Denetimden sonra

Otorite bulgularını ve gözlemlerini yazılı olarak iletir. Her bulgu için bir
düzeltici faaliyet planı, sorumlu ve tarih belirlenir; planlarda yapılan değişiklikler
yeni sürümle yeniden yayımlanır ve kayda bağlanır. SOI-1 bulguları açıkken
geliştirmeye hız vermek, düzeltilmiş planlara göre yeniden iş yapma riskini büyütür.
Bulgular kapatılmadan ya da en azından kapanış planında otoriteyle mutabık kalınmadan
SOI-2'ye girilmez.

## İlgili bölümler

- [5. Yazılım Planlama](../03-do178c-ile-gelistirme/05-yazilim-planlama.md)
- [9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)
- [10. Yazılım Konfigürasyon Yönetimi](../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md)
- [11. Yazılım Kalite Güvencesi](../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
- [12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- [13. DO-330 ve Yazılım Aracı Kalifikasyonu](../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)
- Sonraki aşama: [SW SOI-2](soi-2.md)
