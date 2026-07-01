---
title: "9. Yazılım Doğrulama"
sidebar_position: 6
---

# 9. Yazılım Doğrulama

Doğrulama, yazılımın beklenen davranışı gerçekten sağladığını gösteren kanıt üretir.
Bu kanıt; gözden geçirme, analiz, test ve yapısal kapsam ölçümleri ile oluşur.

Kritik nokta, doğrulamanın sonradan eklenen bir adım olmamasıdır. Tasarım ve
gereksinimlerdeki belirsizlikler çoğu zaman doğrulama sırasında görünür hale gelir.

## Doğrulamanın amacı

Doğrulama, "çalışıyor mu?" sorusundan daha geniştir. Asıl soru, yazılımın tanımlanan
koşullarda, beklenen sınırlar içinde ve istenen güvenlik düzeyinde davranıp
davranmadığıdır.

Bu yüzden doğrulama sadece hata bulma faaliyeti değildir; aynı zamanda gereksinimlerin,
tasarımın ve kodun birbirini gerçekten desteklediğini gösterme faaliyetidir.

## Başlıca yöntemler

### Doğrulamada kullanılan başlıca yöntemler

- Gözden geçirme: insan hatasını erken bulur.
- Analiz: mantıksal tutarlılığı kontrol eder.
- Test: davranışı çalışır durumda doğrular.

### Ek olarak

- sınır değer analizi,
- arayüz kontrolü,
- yapısal kapsam ölçümü,
- negatif senaryo testi.

## Testin rolü

Test, yazılımın somut davranışını gözlemler. Bir gereksinim ne kadar iyi yazılmış olursa
olsun, test ile desteklenmiyorsa sertifikasyon açısından eksik kalır. Test; yalnızca
başarı durumunu değil, hata ve sınır durumlarını da kapsamalıdır.

## Yapısal kapsam

Yapısal kapsam, testlerin kodun ne kadarını çalıştırdığını gösterir. Ancak bu ölçüm
tek başına yeterli değildir; amaç "yüksek sayı" değil, anlamlı kanıttır. Kapsam verisi,
gereksinim tabanlı testlerle birlikte yorumlanmalıdır.

## İnceleme ve analiz

Gözden geçirme ve analiz, testten önce veya testle paralel yürütülmelidir. Çünkü bazı
hatalar çalıştırma ile değil, mantık incelemesi ile daha erken ve daha düşük maliyetle
yakalanır.

## Bu bölümden akılda kalması gerekenler

- Doğrulama, kanıt üretme faaliyetidir.
- Test tek başına yeterli değildir; inceleme ve analiz de gerekir.
- Kapsam metriği, gereksinim bağlamıyla birlikte yorumlanmalıdır.
