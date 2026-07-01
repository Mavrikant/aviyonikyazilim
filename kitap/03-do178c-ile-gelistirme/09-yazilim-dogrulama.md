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

## Bağımsızlık

:::info Bu bölüm hazırlanıyor 🚧
Doğrulama bağımsızlığının ne anlama geldiği (kişi bağımsızlığı, araç desteği),
hangi yazılım seviyelerinde hangi hedefler için bağımsızlık beklendiği ve pratikte
nasıl organize edildiği burada anlatılacak.
:::

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

## Gözden geçirmeler

:::info Bu bölüm hazırlanıyor 🚧
Gereksinim, tasarım, kod ve test gözden geçirmelerinin kapsamı; kontrol listeleri,
kayıt tutma ve etkili akran gözden geçirmesi pratikleri burada anlatılacak.
:::

## Analizler

:::info Bu bölüm hazırlanıyor 🚧
En kötü durum çalışma zamanı, yığın kullanımı, bellek haritası, bağlantı (link) ve
yükleme analizleri gibi tipik doğrulama analizleri burada ele alınacak.
:::

## Testin rolü

Test, yazılımın somut davranışını gözlemler. Bir gereksinim ne kadar iyi yazılmış olursa
olsun, test ile desteklenmiyorsa sertifikasyon açısından eksik kalır. Test; yalnızca
başarı durumunu değil, hata ve sınır durumlarını da kapsamalıdır.

DO-178C'de testler **gereksinim tabanlıdır**: her test bir gereksinime dayanır ve
normal koşulların yanında gürbüzlük (robustness) koşullarını da kapsar.

### Test stratejileri

:::info Bu bölüm hazırlanıyor 🚧
Eşdeğerlik sınıfı ayrımı, sınır değer testi, durum geçiş testi, karar tablosu testi,
entegrasyon ve performans testleri; test planlama, test geliştirme (test durumu ve
prosedürleri) ve iyi bir testin nitelikleri burada anlatılacak.
:::

## Doğrulamanın doğrulanması

Testlerin kendisi de bir iş ürünüdür ve doğrulanır: testler gereksinimleri gerçekten
kapsıyor mu, kodun yeterince derinine iniyor mu?

### Gereksinim kapsam analizi

:::info Bu bölüm hazırlanıyor 🚧
Her gereksinimin en az bir test ile eşlendiğinin gösterilmesi ve kapsam boşluklarının
ele alınması burada anlatılacak.
:::

### Yapısal kapsam analizi

Yapısal kapsam, testlerin kodun ne kadarını çalıştırdığını gösterir. Ancak bu ölçüm
tek başına yeterli değildir; amaç "yüksek sayı" değil, anlamlı kanıttır. Kapsam verisi,
gereksinim tabanlı testlerle birlikte yorumlanmalıdır.

:::info Bu bölüm hazırlanıyor 🚧
Satır kapsama, karar kapsama ve değiştirilmiş koşul/karar kapsama (MC/DC)
ölçütlerinin hangi yazılım seviyelerinde arandığı; veri bağlaşımı ve kontrol
bağlaşımı analizleri; kapsam boşluklarının (ölü kod, gereksiz kod, devre dışı kod)
ele alınması burada ayrıntılandırılacak.
:::

## İnceleme ve analiz

Gözden geçirme ve analiz, testten önce veya testle paralel yürütülmelidir. Çünkü bazı
hatalar çalıştırma ile değil, mantık incelemesi ile daha erken ve daha düşük maliyetle
yakalanır.

## Problem raporlama

:::info Bu bölüm hazırlanıyor 🚧
Doğrulama sırasında bulunan sorunların kaydı, sınıflandırılması, açık problem
raporlarının sertifikasyon öncesi değerlendirilmesi burada anlatılacak.
:::

## Bu bölümden akılda kalması gerekenler

- Doğrulama, kanıt üretme faaliyetidir.
- Test tek başına yeterli değildir; inceleme ve analiz de gerekir.
- Testler gereksinim tabanlıdır; yapısal kapsam, test yeterliliğinin ölçüsüdür.
- Kapsam metriği, gereksinim bağlamıyla birlikte yorumlanmalıdır.
