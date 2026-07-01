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

:::info Bu bölüm hazırlanıyor 🚧
DO-178C'nin parametre verisi öğesi (parameter data item) kavramı; verinin koddan
ayrı sürümlenip doğrulanmasına imkân veren yaklaşım ve bunun gerektirdiği iş
ürünleri burada ayrıntılandırılacak.
:::

## Riskler

- yanlış tablo,
- uyumsuz sürüm,
- kaynağı belirsiz değer,
- geçersiz sınır kullanımı.

## Bu bölümden akılda kalması gerekenler

- Konfigürasyon verisi, davranışı doğrudan etkiler.
- Kod dışı diye daha az dikkat gerektirmez.
- Sürüm ve doğrulama konfigürasyon verisinin ayrılmaz parçasıdır.
