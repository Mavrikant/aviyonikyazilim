---
title: "15. DO-332 ve Nesne Yönelimli Teknoloji ve İlgili Teknikler"
sidebar_position: 3
---

# 15. DO-332 ve Nesne Yönelimli Teknoloji ve İlgili Teknikler

Nesne yönelimli teknikler, soyutlama ve yeniden kullanım sağlasa da, kalıtım ve
çok biçimlilik gibi özellikler doğrulama açısından yeni riskler getirir. DO-332 bu
risklerin nasıl ele alınacağını anlatır.

Bu bölümde amaç, nesne yönelimli tasarımın kendisini reddetmek değil; bu yaklaşımın
hangi denetimlerle güvenli biçimde kullanılabileceğini özetlemektir.

## Neden özel dikkat gerekir?

Nesne yönelimli teknikler, kodu düzenlemeyi kolaylaştırır; ancak davranışın hangi alt
sınıfta nasıl değiştiğini anlamayı zorlaştırabilir. Özellikle polimorfizm, görünürde aynı
arayüzün farklı davranışlar üretmesine neden olur.

## DO-332 yaklaşımı

DO-332, nesne yönelimli yapıların şu yönlerini değerlendirir:

- kalıtım ilişkileri,
- arayüz sözleşmeleri,
- çok biçimlilik etkileri,
- tekrar kullanılabilirlik ile denetlenebilirlik dengesi.

Amaç, esnekliği korurken davranış belirsizliğini artırmamaktır.

## Tasarım denetimleri

Güvenli kullanım için genellikle:

- kalıtım derinliği sınırlandırılır,
- temel sınıf sözleşmesi net yazılır,
- yan etkiler görünür hale getirilir,
- alt sınıf davranışı test edilir.

### Nesne yönelimli kullanım örneği

Bir uçuş modülü ortak arayüz üzerinden farklı sensör sınıflarını kullanabilir. Bu
durumda:

- arayüz davranışı sabit tutulur,
- kalıtım zinciri sınırlandırılır,
- testler alt sınıf etkilerini kapsar.

## Havacılıkta nesne yönelimli teknolojinin kullanımı

:::info Bu bölüm hazırlanıyor 🚧
Nesne yönelimli tekniklerin aviyonikte yaygınlaşma süreci, yaşanan doğrulama
tartışmaları (özellikle yapısal kapsam ile ilişkisi) ve bu deneyimlerin DO-332'ye
nasıl yansıdığı burada anlatılacak.
:::

## DO-332'nin yapısı

:::info Bu bölüm hazırlanıyor 🚧
DO-332'nin planlama, geliştirme ve doğrulama faaliyetlerine getirdiği ekler; zafiyet
(vulnerability) analizi, tip güvenliği (type safety) ve ilgili teknikler (sanal
makine, çöp toplama vb.) burada ayrıntılandırılacak.
:::

## Riskler

- gizli davranış değişimi,
- derin kalıtım zinciri,
- aşırı soyutlama,
- test kapsamının yüzeysel kalması.

## Bu bölümden akılda kalması gerekenler

- Nesne yönelimli teknikler faydalıdır, ama denetlenmelidir.
- Arayüz sözleşmesi açık olmazsa doğrulama zorlaşır.
- Alt sınıf davranışı test kapsamına dahil edilmelidir.
