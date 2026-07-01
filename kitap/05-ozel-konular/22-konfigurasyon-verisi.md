---
title: "22. Konfigürasyon Verisi"
sidebar_position: 6
---

# 22. Konfigürasyon Verisi

Konfigürasyon verisi, yazılım mantığını değiştirmeden davranışı etkileyen parametre
ve tablolardır. Bu nedenle kod kadar dikkatli yönetilmeleri gerekir.

Bu bölüm, verinin sürümlenmesi, doğrulanması ve yanlış değerlerden korunması üzerine
çerçeve sunar.

## Konfigürasyon verisi nedir?

Kod sabit kalırken sistem davranışını değiştiren veri, konfigürasyon verisidir. Bu
veri; eşik değerleri, tablo içerikleri, görev profilleri veya bölgeye özel ayarlar
olabilir.

## Neden dikkat gerekir?

Bir değer yanlışsa kod değişmemiş olsa bile sistemin çıktısı değişir. Bu yüzden
konfigürasyon verisi, kaynak koddan farklı olsa da benzer sıkılıkta yönetilmelidir.

## Yönetim ilkeleri

- sürüm kontrolü,
- gözden geçirme,
- doğrulama,
- değişiklik yetkisi,
- izlenebilirlik.

### Konfigürasyon verisi örneği

Bir eşik değeri değiştiğinde kaynak kod değişmez, ama sistem davranışı değişebilir. Bu
yüzden bu veri:

- sürümlenmeli,
- gözden geçirilmeli,
- testle doğrulanmalıdır.

## Parametre verisi öğeleri ve DO-178C

DO-178C, önceki sürümde muğlak kalan bir soruya doğrudan cevap verir: kodun
dışında tutulan ama davranışı belirleyen veri nasıl sertifiye edilir? Bunun için
**parametre verisi öğesi (parameter data item, PDI)** kavramı tanımlanmıştır. PDI,
çalıştırılabilir nesne kodunu değiştirmeden yazılımın davranışını etkileyen ve
ayrı bir konfigürasyon öğesi olarak yönetilen veri kümesidir; uçakta genellikle
ayrı bir yüklenebilir dosya (PDI dosyası) biçimini alır.

Bu kavramın asıl kazandırdığı şey **ayrık yaşam döngüsüdür**: çalıştırılabilir
nesne kodu bir kez üretilip doğrulandıktan sonra, yalnızca PDI dosyası değişerek
yeni bir uçak konfigürasyonu tanımlanabilir. Kod yeniden derlenmez, kodun test
kampanyası tekrarlanmaz; yalnızca yeni veri, kendi doğrulama sürecinden geçirilir.
Bu, bölge frekans tabloları, motor tipine göre limitler veya müşteri seçenekleri
gibi sık değişen veriler için ciddi bir verimlilik sağlar.

Bunun bedava olmadığını da baştan söylemek gerekir. Ayrık yaşam döngüsü ancak şu
koşullar sağlandığında savunulabilir:

- Yazılım, PDI'nin **yapısını ve özniteliklerini** (tip, birim, sınır, çözünürlük)
  açıkça tanımlar; bu tanım gereksinim seviyesinde yazılır ve izlenebilirlik
  kurulur.
- Çalıştırılabilir nesne kodunun, tanımlı yapıya uyan **her geçerli PDI değeriyle**
  doğru çalıştığı gösterilir. Kodun doğrulaması tek bir veri setine göre değil,
  veri zarfının (data envelope) tamamına göre yapılır; aksi hâlde her yeni PDI
  dosyası kodun yeniden testini gerektirir.
- Her PDI dosyası kendi başına doğrulanır: her öğenin doğru değere sahip olduğu,
  tanımlı yapı ve özniteliklerle uyumlu olduğu ve dosyanın eksiksiz olduğu
  gösterilir.
- PDI dosyası, birlikte çalışacağı çalıştırılabilir nesne kodu sürümüyle
  **uyumluluğu** açısından kontrol edilir (sürüm eşleştirme, genellikle parça
  numarası ve bütünlük kontrolüyle).

PDI dosyası yazılım seviyesini kod üzerinden miras alır: Seviye A bir yazılımın
davranışını belirleyen tablo, Seviye A titizliğiyle doğrulanır. Ayrıca PDI dosyası
konfigürasyon yönetimi açısından birinci sınıf bir öğedir — kendi parça numarası,
kendi sürüm geçmişi, kendi problem raporları olur.

```mermaid
flowchart LR
  GER["PDI yapı ve öznitelik tanımı - gereksinimler"] --> KOD["Kaynak kod ve çalıştırılabilir nesne kodu"]
  GER --> PDI["PDI dosyası"]
  KOD --> DK["Kod doğrulaması: tüm geçerli veri zarfı"]
  PDI --> DP["PDI doğrulaması: değerler, yapı, eksiksizlik"]
  DK --> UY["Uyumluluk kontrolü ve birlikte yükleme"]
  DP --> UY
```

Tipik iş ürünleri şöyle özetlenebilir:

| İş ürünü | İçeriği |
|---|---|
| PDI yapı tanımı | Öğelerin tipi, birimi, sınırları, çözünürlüğü; gereksinimlere izlenebilirlik |
| PDI dosyası | Belirli bir konfigürasyona ait değerlerin yüklenebilir hâli |
| PDI doğrulama sonuçları | Değer doğruluğu, yapı uyumu ve eksiksizlik kanıtları |
| Uyumluluk kaydı | Hangi PDI sürümünün hangi çalıştırılabilir nesne kodu sürümüyle geçerli olduğu |

Pratikte en sık görülen hata, PDI'yi "sadece veri" sayıp doğrulamasını üretim
betiklerine gömülü birkaç otomatik kontrole indirgemektir. Değerin *kaynağının*
doğrulanması — örneğin bir frekans tablosundaki her satırın onaylı bir sistem
verisine dayandığının gösterilmesi — otomatik biçim kontrolünün yapamayacağı,
gözden geçirme gerektiren bir iştir.

## Riskler

- yanlış tablo,
- uyumsuz sürüm,
- kaynağı belirsiz değer,
- geçersiz sınır kullanımı.

## Bu bölümden akılda kalması gerekenler

- Konfigürasyon verisi, davranışı doğrudan etkiler.
- Kod dışı diye daha az dikkat gerektirmez.
- Sürüm ve doğrulama konfigürasyon verisinin ayrılmaz parçasıdır.
- Parametre verisi öğesi, verinin koddan ayrı sürümlenip doğrulanmasına imkân
  verir; bunun ön koşulu kodun tüm geçerli veri zarfıyla doğrulanmış olmasıdır.
- Her PDI dosyası kendi başına doğrulanır ve kullanılacağı çalıştırılabilir nesne
  kodu sürümüyle uyumluluğu kayıt altına alınır.
