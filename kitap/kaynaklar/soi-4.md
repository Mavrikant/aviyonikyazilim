---
title: "SW SOI-4"
description: "SOI #4 son sertifikasyon denetimi kontrol listesi: önceki bulguların kapanışı, SAS ve SCI tutarlılığı, açık problem raporları, uygunluk gözden geçirmesi."
sidebar_position: 5
---

SOI-4, yazılımın sertifikasyona sunulmadan önceki son denetimidir: tüm faaliyetler
tamamlandı mı, önceki aşamaların bulguları kapandı mı, teslim edilen yazılım tam olarak
tanımlanmış ve yeniden üretilebilir mi, açık kalan problem raporları kabul edilebilir
mi? Bu sayfa, son denetim öncesinde sunum paketini sınamak için bir kontrol listesidir.

Katılım aşaması (Stage of Involvement, SOI) denetimlerinin genel mantığı ve yazılım
başarı özetinin içeriği
[12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümünde anlatılır. Buradaki maddeler bir otorite listesinin çevirisi değil, sahada
işe yarayan hazırlık sorularıdır.

:::tip[Son denetimde yeni konu açılmaz]
SOI-4'ün iyi geçmesinin sırrı, SOI-4'te yeni bir şey göstermemektir. Bu aşamada
otorite, daha önce gördüğü sürecin sonuna kadar aynı disiplinle işletildiğini ve sunulan
belgelerin birbiriyle, kayıtlarla ve gerçek yazılımla tutarlı olduğunu doğrular.
:::

## Ne zaman yapılır?

SOI-4, yazılım yaşam döngüsü faaliyetleri tamamlandığında ve sertifikasyona esas
sürüm belirlendiğinde yapılır. Tipik giriş kriterleri:

- [ ] SOI-1, SOI-2 ve SOI-3 bulgularının tamamı kapatılmış ve kapanış kanıtları
      dosyalanmıştır.
- [ ] Sertifikasyona esas yazılım sürümü son temel çizgiye (baseline) alınmıştır.
- [ ] Yazılım başarı özeti (Software Accomplishment Summary, SAS) ve yazılım
      konfigürasyon indeksi (Software Configuration Index, SCI) yayımlanmıştır.
- [ ] Kalite güvencesi yazılım uygunluk gözden geçirmesini (software conformity
      review) tamamlamıştır.
- [ ] Açık problem raporlarının her biri için emniyet ve işlevsellik değerlendirmesi
      yapılmıştır.

## Son paket: otoritenin baktığı noktalar

### Önceki aşamaların kapanışı

- [ ] Her önceki bulgu için ne yapıldığı, hangi kanıtla kapatıldığı ve kimin onayladığı
      tek bir listede görülebiliyor mu?
- [ ] Bir bulgunun düzeltilmesi başka bir veriyi değiştirdiyse o veri yeniden
      doğrulanmış mı?

### Yazılım başarı özeti (SAS)

- [ ] SAS, PSAC'ta verilen sözlerle aynı başlık düzeninde karşılaştırılabiliyor mu?
- [ ] Plandan yapılan tüm sapmalar, gerekçeleri ve onay kayıtlarıyla birlikte
      yazılmış mı?
- [ ] Yazılımın uyduğu hedeflere ilişkin uygunluk beyanı açık ve koşulsuz mu?
- [ ] SAS'ta anılan sürüm, parça numarası ve belge sürümleri SCI ile birebir aynı mı?

### Konfigürasyon ve yeniden üretilebilirlik

- [ ] SCI, çalıştırılabilir nesne kodunu (executable object code) ve onu üreten kaynak
      dosyalarını sürümleriyle tanımlıyor mu?
- [ ] Yaşam döngüsü ortam konfigürasyon indeksi (SECI), derleyiciyi, bağlayıcıyı,
      derleme seçeneklerini ve kalifiye araçları sürümleriyle listeliyor mu?
- [ ] Belgelenen talimatlarla temiz bir ortamda yeniden derleme yapıldığında aynı
      çalıştırılabilir nesne kodu (aynı sağlama toplamıyla) elde ediliyor mu?
- [ ] Yükleme talimatları ve yüklenebilir yazılım parçasının (loadable software part,
      LSP) tanımlaması doğru mu; hedefe yüklenen sürümün doğruluğu nasıl kontrol
      ediliyor?
- [ ] Yaşam döngüsü verisi arşivlenmiş ve arşivden geri alınabildiği denenmiş mi?

### Açık problem raporları

- [ ] Açık problem raporlarının listesi SAS, SCI ve problem raporlama aracında aynı mı?
- [ ] Her açık rapor için sınıf (emniyet etkisi var / yok), etkilenen işlev ve neden
      bu hâliyle kabul edilebilir olduğu yazılmış mı?
- [ ] Emniyeti etkileyen açık rapor kalmamış mı; kaldıysa sistem düzeyinde kabul
      gerekçesi var mı?
- [ ] Kapatılmış raporların kapanış kanıtı (düzeltme, yeniden doğrulama) izlenebilir mi?

### Kalite güvencesi

- [ ] Uygunluk gözden geçirmesi son temel çizgi üzerinde mi yapılmış; ondan sonra
      değişiklik olmuşsa gözden geçirme tekrarlanmış mı?
- [ ] Kalite güvencesinin açtığı uygunsuzlukların hepsi kapanmış mı?
- [ ] Tedarikçilerden gelen veri için gözetim kayıtları tamam mı?

## Hazırlanacak veri paketi

| Veri | Neden istenir |
|---|---|
| Yazılım başarı özeti (SAS) | Projenin PSAC'a göre nasıl tamamlandığının özeti |
| Yazılım konfigürasyon indeksi (SCI) ve SECI | Teslim edilen yazılımın ve üretim ortamının tam tanımı |
| Açık problem raporları ve değerlendirmeleri | Bilinen kusurların kabul edilebilirliği |
| Önceki SOI bulgularının kapanış kayıtları | Sürecin tutarlı işletildiği |
| Uygunluk gözden geçirmesi kaydı | Kalite güvencesinin son kontrolü |
| Yeniden derleme ve yükleme kanıtı | Teslim edilen yazılımın yeniden üretilebilirliği |
| Konfigürasyon yönetimi ve arşiv kayıtları | Verinin korunduğu ve geri alınabildiği |

## Sık görülen bulgular

| Bulgu | Tipik nedeni | Önlem |
|---|---|---|
| SAS ile SCI arasında sürüm ya da parça numarası farkı | Belgelerin farklı zamanlarda elle güncellenmesi | SCI'yi derleme altyapısından üretmek; SAS'ı SCI'ye başvurarak yazmak |
| Açık problem raporu listeleri belgeler arasında farklı | Listenin araçtan bir kez çekilip sonra güncellenmemesi | Listeyi tek kaynaktan, son temel çizgi tarihinde üretmek |
| Uygunluk gözden geçirmesi son değişiklikten önce yapılmış | Takvim baskısıyla gözden geçirmenin öne çekilmesi | Son değişiklikten sonra gözden geçirmenin tekrarını giriş kriteri yapmak |
| Yeniden derleme aynı ikiliyi üretmiyor | Kayıt dışı derleme seçeneği, ortam farkı, zaman damgası | Yeniden derlemeyi SOI-4'ten önce temiz ortamda denemek |
| Plan sapması SAS'ta yok | Sapmanın proje sırasında kayda alınmaması | Sapmaları oluştukları anda kalite güvencesi kaydına bağlamak |

## Denetimden sonra

SOI-4 sonunda otorite, yazılım açısından sertifikasyona engel bir durum kalmadığını
kayda geçirir; yazılım onayı, ait olduğu sistemin ya da ekipmanın onay sürecinin
parçası olarak tamamlanır. Bundan sonra yapılacak her değişiklik, değişiklik etki
analiziyle başlayan ayrı bir süreçtir.

## İlgili bölümler

- [10. Yazılım Konfigürasyon Yönetimi](../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md)
- [11. Yazılım Kalite Güvencesi](../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
- [12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- [18. Sahada Yüklenebilir Yazılım](../05-ozel-konular/18-sahada-yuklenebilir-yazilim.md)
- Önceki aşama: [SW SOI-3](soi-3.md)
