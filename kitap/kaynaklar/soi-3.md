---
title: "SW SOI-3"
description: "SOI #3 doğrulama denetimi kontrol listesi: gereksinime dayalı test, gürbüzlük, yapısal kapsam analizi, test ortamı, problem raporları ve sık bulgular."
sidebar_position: 4
---

SOI-3, otoritenin doğrulama kanıtını incelediği denetimdir: testler gereksinimlerden
mi türetilmiş, normal ve gürbüzlük durumlarını kapsıyor mu, sonuçlar doğru yazılım
sürümüne ait mi ve kapsam analizi geride açıklanamamış bir boşluk bırakıyor mu? Bu
sayfa, SOI-3 öncesinde doğrulama verisini sınamak için bir kontrol listesi sunar.

Katılım aşaması (Stage of Involvement, SOI) denetimlerinin genel mantığı
[12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümünde, doğrulamanın kendisi
[9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)
bölümünde anlatılır. Buradaki maddeler bir otorite listesinin çevirisi değil, sahada
işe yarayan hazırlık sorularıdır.

:::tip[Örnekleme bu kez testten başlar]
SOI-3'te otorite çoğu zaman bir gereksinim seçer ve sorar: Bu gereksinimi hangi
testler sınıyor, beklenen sonuç nereden geliyor, test hangi yazılım sürümünde, hangi
ortamda koştu, sonuç nerede kayıtlı, kapsam analizinde bu kodun durumu ne? Bu zinciri
her halkasıyla gösterebilmek, SOI-3 hazırlığının özüdür.
:::

## Ne zaman yapılır?

SOI-3, doğrulama faaliyetlerinin büyük bölümü tamamlandığında ve yapısal kapsam
analizi (structural coverage analysis) sonuçları ortaya çıkmaya başladığında yapılır.
Tipik giriş kriterleri:

- [ ] SOI-2 bulguları kapatılmış ya da kapanış planı otoriteyle mutabık kalınmıştır.
- [ ] Test durumları ve prosedürleri yazılmış, gözden geçirilmiş ve önemli bir kısmı
      kredi amaçlı (for-credit) olarak koşulmuştur.
- [ ] Gereksinim kapsam analizi ve yapısal kapsam analizi ilk sonuçları vardır;
      boşlukların sınıflandırılması başlamıştır.
- [ ] Test ortamı ve araçları yaşam döngüsü ortam konfigürasyon indeksinde (Software
      Life Cycle Environment Configuration Index, SECI) tanımlıdır.
- [ ] Zamanlama, yığın ve bellek analizleri gibi test dışı doğrulama çalışmaları
      başlamıştır.

## Doğrulama verisi: otoritenin baktığı noktalar

### Testlerin türetilmesi

- [ ] Her test durumu bir ya da daha fazla gereksinime izlenebilir mi; gereksinimi
      olmayan test var mı?
- [ ] Beklenen sonuçlar gereksinimden mi türetilmiş, yoksa kodun gerçek çıktısından mı
      kopyalanmış?
- [ ] Normal aralık testlerinin yanında gürbüzlük (robustness) testleri var mı:
      geçersiz girdiler, sınır değerler, zaman aşımları, beklenmedik mod geçişleri?
- [ ] Eşdeğerlik sınıfları ve sınır değerleri bilinçli olarak seçilmiş mi?
- [ ] Testler ve prosedürler gözden geçirilmiş; gözden geçirme kaydı var mı?

### Testlerin koşulması ve sonuçlar

- [ ] Test sonuçları, hangi yazılım sürümüyle, hangi ortamda ve hangi prosedür
      sürümüyle elde edildiklerini açıkça gösteriyor mu?
- [ ] Başarısız testler problem raporuyla ilişkilendirilmiş mi?
- [ ] Kod değiştikten sonra hangi testlerin yeniden koşulduğu bir regresyon analiziyle
      gerekçelendirilmiş mi?
- [ ] Yazılım–donanım entegrasyon testleri hedef donanımda mı yapılmış; benzetici ya da
      emülatör kullanıldıysa farklar analiz edilmiş mi?
- [ ] Test prosedürleri, başka bir kişi tarafından aynı sonuçla tekrarlanabilecek
      kadar açık mı?

### Kapsam analizi

- [ ] Gereksinim kapsam analizi, her gereksinimin test edildiğini (ya da neden analiz
      veya gözden geçirmeyle karşılandığını) gösteriyor mu?
- [ ] Yapısal kapsam, yazılım seviyesinin gerektirdiği ölçütle (satır, karar,
      değiştirilmiş koşul/karar kapsama (modified condition/decision coverage, MC/DC))
      ölçülmüş mü?
- [ ] Kapsam boşlukları sınıflandırılmış mı: eksik test, eksik gereksinim, ölü kod
      (dead code), gereksiz kod (extraneous code), devre dışı bırakılmış kod
      (deactivated code)?
- [ ] Her boşluk için çözüm (yeni test, gereksinim değişikliği, kod kaldırma ya da
      gerekçeli analiz) kayıt altında mı?
- [ ] Kapsam ölçümü kod enstrümantasyonu ile yapıldıysa, enstrümante edilmiş ve
      edilmemiş kod arasındaki farkın etkisi tartışılmış mı?
- [ ] Gereken seviyede, kaynak kod ile nesne kod arasındaki izlenebilirlik ya da
      derleyicinin eklediği kodun analizi yapılmış mı?
- [ ] Veri bağlaşımı ve kontrol bağlaşımı (data coupling and control coupling) analizi
      yapılmış mı?

### Analizler ve araçlar

- [ ] En kötü durum çalışma süresi, yığın kullanımı ve bellek haritası analizleri
      yapılmış ve sonuçları gereksinimlerle karşılaştırılmış mı?
- [ ] Test ve kapsam araçlarının kalifikasyon gerekip gerekmediği değerlendirilmiş;
      gerekiyorsa kalifikasyon verisi hazır mı?
- [ ] Yazılım seviyesinin gerektirdiği doğrulama faaliyetlerinde bağımsızlık sağlanmış
      ve kayıtlardan izlenebilir mi?

## Hazırlanacak veri paketi

| Veri | Neden istenir |
|---|---|
| Doğrulama durumları ve prosedürleri | Testlerin gereksinimden türetildiğini ve tekrarlanabilir olduğunu gösterir |
| Doğrulama sonuçları | Hangi sürüm ve ortamda neyin geçtiği |
| Gereksinim ve yapısal kapsam analizi sonuçları | Testlerin yeterliliği ve boşlukların çözümü |
| Zamanlama, yığın ve bellek analizleri | Test dışı doğrulama hedefleri |
| Test ortamı tanımı ve SECI | Sonuçların yeniden üretilebilirliği |
| Araç kalifikasyon verisi (gerekiyorsa) | Araç çıktısına duyulan güvenin dayanağı |
| Problem raporları | Bulunan hataların sistematik yönetildiği |
| Gözden geçirme ve kalite güvencesi kayıtları | Doğrulama sürecinin de denetlendiği |

## Sık görülen bulgular

| Bulgu | Tipik nedeni | Önlem |
|---|---|---|
| Beklenen sonuçlar kodun çıktısından alınmış | Testin kod yazıldıktan sonra, koda bakarak yazılması | Beklenen sonucun kaynağını test durumunda gereksinime bağlamak; gözden geçirmede sormak |
| Gürbüzlük testleri yetersiz | Testin yalnızca "mutlu yol" için yazılması | Gürbüzlük kategorilerini test standardına koymak |
| Sonuçlar temel çizgideki sürümle eşleşmiyor | Kod değiştikten sonra testlerin yeniden koşulmaması | Kredi amaçlı koşuları yalnızca temel çizgiye alınmış sürümlerle yapmak |
| Kapsam boşlukları "analizle karşılandı" deyip geçilmiş | Analiz kaydının ve gerekçenin yazılmaması | Her boşluk için tekil, gözden geçirilmiş bir çözüm kaydı |
| Hedef dışı ortamda test, gerekçesiz | Hedef donanımın geç gelmesi | Ortam farklarını analiz eden ve kritik testleri hedefte tekrarlayan bir plan |
| Araç kalifikasyonu unutulmuş | Test aracının "yalnızca yardımcı" sayılması | Aracın çıktısı bir doğrulama adımının yerine geçiyor mu sorusunu SOI-1'de yanıtlamak |

## Denetimden sonra

SOI-3 bulguları genellikle ek test, ek analiz ya da yeniden koşum gerektirir ve takvimi
doğrudan etkiler. Düzeltici faaliyetler, SOI-4'e kadar tamamlanabilecek biçimde
planlanmalı; her biri, hangi kanıtın hangi sürümle yeniden üretileceğini açıkça
söylemelidir.

## İlgili bölümler

- [9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)
- [17. Kapsanmayan Kodlar: Ölü, Gereksiz ve Devre Dışı Bırakılmış Kodlar](../05-ozel-konular/17-kapsanmayan-kodlar.md)
- [13. DO-330 ve Yazılım Aracı Kalifikasyonu](../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)
- Önceki aşama: [SW SOI-2](soi-2.md) · Sonraki aşama: [SW SOI-4](soi-4.md)
