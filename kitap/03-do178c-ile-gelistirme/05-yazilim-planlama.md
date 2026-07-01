---
title: "5. Yazılım Planlama"
sidebar_position: 2
---

# 5. Yazılım Planlama

Yazılım planlama, projenin nasıl yönetileceğini ve hangi kanıtların üretileceğini
önceden tanımlar. PSAC, SDP, SVP, SCMP ve SQAP gibi planlar; kapsamı, sorumlulukları
ve beklenen iş ürünlerini netleştirir.

Planlama, DO-178C açısından bir idari formalite değildir. Aksine, projenin nasıl
çalışacağını, hangi kuralların uygulanacağını ve hangi kanıtların hangi sırayla
biriktirileceğini belirleyen ana sözleşmedir. Bu yüzden iyi bir plan, sonraki tüm
faaliyetlerin yanlış anlaşılmasını önleyen ortak bir referans noktasıdır.

## Planların amacı

Planlar, "ne yapıyoruz?" sorusundan çok "nasıl ve hangi disiplinle yapıyoruz?" sorusuna
cevap verir. Bu ayrım önemlidir; çünkü aynı proje içinde farklı ekipler aynı kelimeyi
farklı anlamlarda kullanabilir. Planlar bu belirsizliği azaltır.

Örneğin planlar şunları açıklar:

- hangi standartların uygulanacağını,
- hangi incelemelerin zorunlu olduğunu,
- bağımsızlığın nasıl sağlanacağını,
- araçların hangi rollerde kullanılacağını,
- konfigürasyon öğelerinin nasıl korunacağını,
- sorunların nasıl kapatılacağını.

## Ana planlar

En sık karşılaşılan planlar şunlardır:

- **PSAC**: sertifikasyon yaklaşımını ve otoriteyle ilişkiyi özetler,
- **SDP**: yazılım geliştirme kurallarını tanımlar,
- **SVP**: doğrulama kapsamını ve yöntemlerini açıklar,
- **SCMP**: konfigürasyon yönetimi yaklaşımını belirler,
- **SQAP**: kalite güvencesi faaliyetlerini tanımlar.

Bu planlar birbirinden bağımsız belgeler gibi görünse de gerçekte aynı sistemin farklı
bakış açılarıdır. Bir plandaki değişiklik diğer planları da etkileyebilir.

## Neden erken yazılmalı?

Planlar geç yazıldığında ekip çoğu kararı fiilen vermiş olur; belge ise sadece
gecikmiş bir açıklamaya dönüşür. Bu durum sertifikasyon açısından zayıftır, çünkü
kararların nasıl alındığını değil, sonradan nasıl anlatıldığını gösterir.

Erken yazılan planlar ise şu faydaları sağlar:

- ekip beklentilerini hizalar,
- rol ve sorumlulukları belirginleştirir,
- gereksinim ve test yaklaşımını baştan uyumlu hale getirir,
- dış incelemelerde sürprizleri azaltır.

## Planların içeriği

İyi bir plan tipik olarak şu soruları yanıtlar:

- Hangi yaşam döngüsü modeli izlenecek?
- Hangi iş ürünleri zorunlu?
- Hangi gözden geçirmeler yapılacak?
- Hangi bağımsızlık kuralları uygulanacak?
- Test ortamı nasıl yönetilecek?
- Sorunlar ve sapmalar nasıl ele alınacak?

Bu soruların net olması, özellikle ekip büyüdükçe önem kazanır. Çünkü planlar sadece
sertifikasyon için değil, ekip içi koordinasyon için de gereklidir.

## Üç geliştirme standardı

Planların yanında DO-178C, üç geliştirme standardının tanımlanmasını bekler:
gereksinim standardı, tasarım standardı ve kodlama standardı. Bunlar ekibin iş
ürünlerini hangi kurallara göre yazacağını belirler ve gözden geçirmelerin nesnel
ölçütü haline gelir.

:::info Bu bölüm hazırlanıyor 🚧
Gereksinim, tasarım ve kodlama standartlarının her birinin içeriği, iyi örnekleri ve
sık yapılan hatalar burada ayrıntılandırılacak.
:::

## Araç kalifikasyonu planlaması

:::info Bu bölüm hazırlanıyor 🚧
Hangi araçların kalifikasyon gerektirdiğine planlama aşamasında nasıl karar
verileceği ve bunun PSAC'a nasıl yansıtılacağı burada anlatılacak (ayrıntı için
bkz. [DO-330 ve Yazılım Aracı Kalifikasyonu](../04-arac-kalifikasyonu-ve-ekler/13-do330-arac-kalifikasyonu.md)).
:::

## Diğer planlar

:::info Bu bölüm hazırlanıyor 🚧
Beş DO-178C planının dışında kalan proje yönetim planı, gereksinim yönetim planı ve
test planı gibi belgelerin rolü burada özetlenecek.
:::

## Planlara kısa örnek

- SDP, kodlama ve tasarım kurallarını tanımlar.
- SVP, hangi test seviyelerinin kullanılacağını açıklar.
- SCMP, hangi değişikliklerin nasıl onaylanacağını söyler.

## Bu bölümden akılda kalması gerekenler

- Planlama, sonradan belge yazma işi değildir; projenin çalışma biçimidir.
- Ana planlar birlikte okunmalı ve uyumlu olmalıdır.
- Erken planlama, doğrulama ve sertifikasyon riskini azaltır.
