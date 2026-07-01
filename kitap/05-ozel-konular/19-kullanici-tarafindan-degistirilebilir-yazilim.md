---
title: "19. Kullanıcı Tarafından Değiştirilebilir Yazılım"
sidebar_position: 3
---

# 19. Kullanıcı Tarafından Değiştirilebilir Yazılım

Kullanıcı tarafından değiştirilebilir yazılım, genellikle parametreler, ayarlar veya
konfigürasyon tabloları üzerinden esneklik sağlar. Bu esneklik, yazılımın kontrolsüz
değişmesine izin vermemelidir.

Bu bölümde temel odak, değiştirilebilir alanların sınırlarının net tanımlanması ve
değişikliklerin doğrulanabilir olmasıdır.

## Neden özel yönetim gerekir?

Parametre üzerinden davranış değiştirmek, kod değiştirmekten daha güvenli görünebilir;
ancak sınır iyi çizilmezse aynı etkiyi daha sinsi biçimde yaratabilir. Bir limit değeri
yanlış girildiğinde kod değişmemiş olsa da sistem davranışı değişmiş olur.

## Değiştirilebilir alanlar

### Değiştirilebilir alanlara örnek

- Limit değerleri
- Dil/yerelleştirme tabloları
- Görev profilleri

Bu alanlar esnek olabilir; ama hangi değişikliğin hangi sınırda kalacağı net olmalıdır.

## Kontrol ilkeleri

- hangi alan değiştirilebilir açık olmalı,
- hangi aralık geçerli kabul edilecek belirtilmeli,
- değişiklik yapan kişinin yetkisi doğrulanmalı,
- değişiklik sonrası test veya kontrol tanımlı olmalı.

## Sistemin değiştirilebilirliğe göre tasarlanması

:::info Bu bölüm hazırlanıyor 🚧
Değiştirilebilir bölümün değiştirilemez bölümden koruma mekanizmalarıyla nasıl
ayrılacağı, koruma sınırının doğrulanması ve onay kapsamının nasıl tanımlanacağı
burada anlatılacak.
:::

## Değişikliklerin yönetimi ve bakımı

:::info Bu bölüm hazırlanıyor 🚧
Kullanıcı değişikliklerinin kayıt altına alınması, sürüm uyumunun izlenmesi ve
operatör sorumlulukları burada ele alınacak.
:::

## Riskler

- yetkisiz değişiklik,
- sınır dışı parametre,
- kayıt tutulmaması,
- sürümle uyuşmayan konfigürasyon.

## Bu bölümden akılda kalması gerekenler

- Değiştirilebilirlik, kontrolsüzlük anlamına gelmez.
- Parametreler de yazılım davranışının parçasıdır.
- Değişiklik sınırları ve doğrulama adımları açık olmalıdır.
