---
title: "24. Yazılım Yeniden Kullanımı"
sidebar_position: 8
---

# 24. Yazılım Yeniden Kullanımı

Yazılım yeniden kullanımı, kanıtlanmış bileşenlerden faydalanmayı sağlar; fakat
"daha önce kullanıldı" ifadesi tek başına yeterli değildir.

Bu bölüm, yeniden kullanımın bağlam, değişiklik ve servis geçmişi açısından nasıl
değerlendirileceğini açıklar.

## Yeniden kullanım neden dikkat ister?

Bir bileşen başka bir projede güvenilir çalışmış olabilir; ancak yeni sistemde farklı
arayüzler, farklı zamanlama koşulları veya farklı emniyet hedefleri olabilir. Bu yüzden
yeniden kullanım, otomatik güven anlamına gelmez.

## Değerlendirme soruları

### Yeniden kullanımda sorulacak sorular

- Bu bileşen hangi bağlamda doğrulanmıştı?
- Mevcut sistemde ne değişti?
- Değişen parçalar yeniden test edildi mi?

## Bağlam farkı

Aynı kod, farklı donanımda, farklı RTOS altında veya farklı veri akışında başka bir
davranış gösterebilir. Bu yüzden eski servis geçmişi ile yeni kullanım bağlamı birlikte
değerlendirilmelidir.

## Yeniden kullanılabilir bileşen tasarlamak

:::info Bu bölüm hazırlanıyor 🚧
Bir bileşenin baştan yeniden kullanılabilir olacak şekilde tasarlanması: dar ve
belgeli arayüzler, platform bağımlılıklarının yalıtılması ve kanıt paketinin
taşınabilirliği burada anlatılacak.
:::

## Önceden geliştirilmiş yazılımın kullanımı

:::info Bu bölüm hazırlanıyor 🚧
Önceden geliştirilmiş yazılımın (previously developed software, PDS) yeni bir
projede değerlendirilmesi; DO-178 ailesi dışında geliştirilmiş yazılımın ve ticari
hazır (commercial off-the-shelf, COTS) yazılımın ele alınışı burada
ayrıntılandırılacak.
:::

## Ürün servis geçmişi

:::info Bu bölüm hazırlanıyor 🚧
Ürün servis geçmişi (product service history) üzerinden güvence kredisi talep
etmenin koşulları, zorlukları ve değerlendirme ölçütleri burada anlatılacak
(soru listesi için bkz. [Ek D](../06-ekler/04-ek-d-servis-gecmisi-sorulari.md)).
:::

## Dikkat noktaları

- arayüz farkı,
- zamanlama farkı,
- yapılandırma farkı,
- sertifikasyon kanıtı farkı.

## Bu bölümden akılda kalması gerekenler

- Yeniden kullanım, bağlamla birlikte değerlendirilmelidir.
- Daha önce kullanılmış olmak tek başına yeterli değildir.
- Değişen parçalar yeniden doğrulanmalıdır.
