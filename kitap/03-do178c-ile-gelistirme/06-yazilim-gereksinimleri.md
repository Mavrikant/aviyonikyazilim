---
title: "6. Yazılım Gereksinimleri"
sidebar_position: 3
---

# 6. Yazılım Gereksinimleri

Yazılım gereksinimleri, sistem beklentilerini yazılımın gerçekleştirebileceği açık
ifadeye dönüştürür. Gereksinimler tutarlı, test edilebilir, izlenebilir ve belirsizlik
içermeyecek kadar nettir.

Bu bölüm, yüksek seviyeli gereksinimlerin nasıl türetildiğini ve doğrulama ile nasıl
eşlendiğini özetler. Güçlü gereksinimler, tasarım ve kod için sağlam bir başlangıç
noktası sağlar.

## Gereksinim neden bu kadar önemli?

Gereksinim, sistem ihtiyacını yazılım diline çeviren köprüdür. Köprü sağlam değilse,
tasarım yanlış yöne kayar, kod istenmeyen davranış üretir ve test ekibi neyi doğruladığını
tam olarak bilemez.

Bu yüzden gereksinim yazımı yalnızca doğru kelimeleri seçmek değildir; aynı zamanda doğru
düzeyi seçmektir. Çok üst düzey bir ifade test edilemez kalır, çok alt düzey bir ifade ise
gerekli mimari ayrımı bozar.

## Yüksek ve düşük seviye gereksinimler

Pratikte gereksinimler çoğu zaman katmanlıdır:

- **yüksek seviyeli gereksinimler** sistem ihtiyacını açıklar,
- **düşük seviyeli gereksinimler** yazılımın bunu nasıl karşılayacağını ayrıntılandırır.

Bu iki katman karışmamalıdır. Yüksek seviyeli gereksinim neyin gerekli olduğunu,
düşük seviyeli gereksinim ise bunu gerçekleştirmek için hangi davranışın beklendiğini
belirtir.

## İyi gereksinimin özellikleri

İyi bir gereksinim:

- tek bir davranışı anlatır,
- sınırları açıkça belirtir,
- test edilebilir,
- ölçülebilir,
- başka gereksinimlerle çakışmaz.

Örneğin "Sistem, sensör verisi 500 ms boyunca geçersiz kalırsa güvenli moda geçmelidir"
ifadesi:

- ölçülebilir,
- test edilebilir,
- hata durumunu açıkça tanımlar.

## Belirsizlik örnekleri

Aşağıdaki türde ifadeler sorunludur:

- "uygun şekilde",
- "yeterli hızda",
- "gerekli durumlarda",
- "mümkün olduğunca kısa sürede".

Bu kelimeler iletişimde faydalı olabilir; ancak sertifikasyon ve test açısından yeterli
değildir. Yerlerine koşul, zaman, sınır ve tepki içeren açık ifadeler gelmelidir.

## İzlenebilirlik

Her gereksinimin bir kaynağı olmalıdır. Kaynak çoğu zaman:

- sistem gereksinimi,
- emniyet hedefi,
- arayüz kısıtı,
- operasyonel ihtiyaçtır.

İzlenebilirlik, gereksinimden tasarıma ve testten tekrar kaynağa dönüşü mümkün kılar.

## Gereksinim yazarken dikkat

- Davranış tek cümlede net olmalı.
- Girdi, koşul ve beklenen çıktı açık olmalı.
- Gereksinim başka bir gereksinimi tekrar etmemeli.
- Testi düşünerek yazılmalı.

## Bu bölümden akılda kalması gerekenler

- Gereksinim, tasarım ve testin ortak başlangıç noktasıdır.
- Belirsiz gereksinim, pahalı hata kaynağıdır.
- İzlenebilirlik, gereksinim kalitesinin parçasıdır.
