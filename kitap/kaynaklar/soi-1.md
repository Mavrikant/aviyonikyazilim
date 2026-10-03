---
title: "SW SOI-1"
description: "SOI #1 planlama denetimi kontrol listesi: giriş kriterleri, planlarda otoritenin baktığı noktalar, veri paketi ve sık görülen bulgular."
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

- [ ] Beş plan ve üç geliştirme standardı (gereksinim, tasarım, kodlama) yazılmış,
      gözden geçirilmiş ve konfigürasyon yönetimi altına alınmıştır.
- [ ] Planların gözden geçirme kayıtları ve kalite güvencesinin plan incelemesi
      kayıtları hazırdır.
- [ ] Sistem tarafından atanan yazılım seviyesi ve dayandığı emniyet değerlendirmesi
      çıktıları (fonksiyonel tehlike değerlendirmesi (functional hazard assessment,
      FHA) ve ön sistem emniyet değerlendirmesi (preliminary system safety assessment,
      PSSA)) gösterilebilir durumdadır.
- [ ] Araç kalifikasyonu (tool qualification) gerektiren araçlar belirlenmiş, varsa
      araç kalifikasyon planları yazılmıştır.
- [ ] Yazılım sertifikasyon planı (Plan for Software Aspects of Certification, PSAC)
      otoriteye denetimden önce, okunmaya yetecek süre bırakılarak gönderilmiştir.

## Planlar: otoritenin baktığı noktalar

### Sertifikasyon yaklaşımı (PSAC)

- [ ] Sistem ve yazılım kısa ama anlaşılır biçimde tanıtılmış mı; yazılımın hangi
      işlevi yerine getirdiği ve hangi arıza durumlarına katkı verebileceği açık mı?
- [ ] Yazılım seviyesi ve gerekçesi, sistem emniyet değerlendirmesiyle tutarlı mı?
- [ ] Ek değerlendirme gerektiren durumlar listelenmiş mi: önceden geliştirilmiş
      yazılım (previously developed software, PDS), ticari hazır yazılım (commercial
      off-the-shelf, COTS), kalifiye edilecek araçlar, sahada yüklenebilir yazılım,
      kullanıcı tarafından değiştirilebilir yazılım, devre dışı bırakılmış kod
      (deactivated code), bölümleme iddiaları, alternatif yöntemler?
- [ ] DO-330, DO-331, DO-332 ya da DO-333 eklerinden hangilerinin uygulanacağı ve
      neden uygulanacağı yazılmış mı?
- [ ] Hangi yaşam döngüsü verisinin otoriteye sunulacağı, hangisinin yalnızca talep
      üzerine gösterileceği belli mi?
- [ ] Takvim, SOI denetimlerinin yaklaşık zamanlarını içeriyor mu?
- [ ] Tedarikçiler veya dış kaynak kullanılıyorsa gözetim yaklaşımı tanımlı mı?

### Geliştirme, doğrulama ve destek planları

- [ ] Yaşam döngüsü modeli ve her sürecin geçiş kriterleri (transition criteria)
      ölçülebilir biçimde tanımlı mı? ([Ek A](../06-ekler/01-ek-a-ornek-gecis-kriterleri.md))
- [ ] Yazılım geliştirme planı (Software Development Plan, SDP), kullanılan dili,
      derleyiciyi, bağlayıcıyı ve geliştirme ortamını sürümleriyle belirtiyor mu?
- [ ] Yazılım doğrulama planı (Software Verification Plan, SVP), yazılım seviyesinin
      gerektirdiği bağımsızlığı (independence) kimin, hangi faaliyette sağlayacağını
      söylüyor mu?
- [ ] Gereksinime dayalı test, gürbüzlük (robustness) testi, hedef donanımda test ve
      yapısal kapsam analizi (structural coverage analysis) yaklaşımı tanımlı mı?
- [ ] Kapsam boşluklarının, ölü kodun (dead code) ve devre dışı bırakılmış kodun nasıl
      ele alınacağı planlanmış mı?
- [ ] Yazılım konfigürasyon yönetimi planı (Software Configuration Management Plan,
      SCMP), konfigürasyon öğelerini, temel çizgi (baseline) kurallarını, değişiklik
      kontrolünü ve problem raporlama (problem reporting) akışını tanımlıyor mu?
- [ ] Yazılım kalite güvencesi planı (Software Quality Assurance Plan, SQAP), kalite
      güvencesinin bağımsızlığını, denetim sıklığını ve uygunsuzluk kayıtlarının nasıl
      kapatılacağını açıklıyor mu?
- [ ] Planlar arasındaki çapraz başvurular tutarlı mı? (Bir planın "SVP'de
      tanımlanmıştır" dediği konu gerçekten SVP'de var mı?)

### Standartlar

- [ ] Gereksinim standardı, iyi bir gereksinimin ölçütlerini ve türetilmiş gereksinimin
      (derived requirement) nasıl işaretleneceğini tanımlıyor mu?
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

| Veri | Neden istenir |
|---|---|
| PSAC, SDP, SVP, SCMP, SQAP | Denetimin asıl konusu; hedeflerin nasıl karşılanacağını gösterir |
| Gereksinim, tasarım ve kodlama standartları | Geliştirme verisinin hangi kurallarla üretileceğini gösterir |
| Planların gözden geçirme kayıtları | Planların kendisinin de doğrulandığının kanıtı |
| Kalite güvencesi kayıtları | Kalite güvencesinin planlama sürecine katıldığının kanıtı |
| Araç kalifikasyon planları (varsa) | Araç kredisinin baştan doğru kurgulandığını gösterir |
| Emniyet değerlendirmesinden ilgili çıktılar | Yazılım seviyesinin gerekçesi |
| Konfigürasyon kayıtları | Planların hangi sürümünün denetlendiği |

## Sık görülen bulgular

| Bulgu | Tipik nedeni | Önlem |
|---|---|---|
| Planlar başka bir projeden kopyalanmış, proje adı dışında farkı yok | Takvim baskısı, "şablon yeter" varsayımı | Planı projeye özgü kararlarla (araçlar, ortam, ekip yapısı) doldurmak |
| Geçiş kriterleri "tamamlandığında" gibi ölçülemez ifadeler | Kriterin kim tarafından nasıl kontrol edileceği düşünülmemiş | Her kriteri bir kayıt ya da ölçümle ilişkilendirmek |
| Planlar arasında çelişki (araç, sürüm, sorumluluk) | Planların farklı kişilerce, birbirinden habersiz yazılması | Planları birlikte gözden geçirmek; tek bir terim ve araç listesi tutmak |
| Bağımsızlık gerekliliği planda yok ya da belirsiz | Ekip yapısının sonradan belirlenmesi | Seviyeye göre bağımsızlık tablosunu SVP'ye koymak |
| Kalifikasyon gerektiren bir araç hiç anılmamış | Araç envanterinin çıkarılmaması | Geliştirme ve doğrulama zincirindeki her aracı listeleyip tek tek değerlendirmek |
| Planlar konfigürasyon yönetimi altında değil | Planların "belge" değil "taslak" gibi görülmesi | Planları ilk temel çizginin parçası yapmak |

## Denetimden sonra

Otorite bulgularını ve gözlemlerini yazılı olarak iletir. Her bulgu için bir
düzeltici faaliyet planı, sorumlu ve tarih belirlenir; planlarda yapılan değişiklikler
yeni sürümle yeniden yayımlanır ve kayda bağlanır. SOI-1 bulguları açıkken
geliştirmeye hız vermek, düzeltilmiş planlara göre yeniden iş yapma riskini büyütür.

## İlgili bölümler

- [5. Yazılım Planlama](../03-do178c-ile-gelistirme/05-yazilim-planlama.md)
- [11. Yazılım Kalite Güvencesi](../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
- [12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- [13. DO-330 ve Yazılım Aracı Kalifikasyonu](../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)
- Sonraki aşama: [SW SOI-2](soi-2.md)
