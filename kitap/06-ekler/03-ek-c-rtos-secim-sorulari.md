---
title: "Ek C: Gerçek Zamanlı İşletim Sistemi Seçiminde Sorulacak Sorular"
description: "Emniyet-kritik bir proje için RTOS değerlendirirken sorulacak sorular: zamanlama, bellek, bölümleme, sertifikasyon paketi, araçlar ve tedarikçi."
sidebar_position: 3
---

# Ek C: Gerçek Zamanlı İşletim Sistemi Seçiminde Sorulacak Sorular

Bu ek, emniyet-kritik bir aviyonik proje için aday bir gerçek zamanlı işletim sistemini
(real-time operating system, RTOS) değerlendirirken tedarikçiye ve ekibin kendisine
sorulacak soruları gruplar hâlinde verir. Her soru için neden önemli olduğu ve iyi bir
yanıtın nasıl göründüğü belirtilir.

Seçimin neden bir risk yönetimi kararı olduğu
[20. Gerçek Zamanlı İşletim Sistemleri](../05-ozel-konular/20-gercek-zamanli-isletim-sistemleri.md)
bölümünde anlatılır. Seçilen RTOS'u projede kullanırken izlenecek riskler için
[Ek B](02-ek-b-rtos-endise-alanlari.md)'ye bakınız.

## Nasıl kullanılır?

Sorular bir puan tablosu değildir; her yanıt bir kanıta dayanmalıdır. "Evet,
destekliyoruz" yanıtı, ancak bunu gösteren bir belge, ölçüm ya da sertifikasyon verisiyle
birlikte geldiğinde değer taşır. Yanıtlar ve dayandıkları kanıtlar bir karar kaydında
toplanır; böylece seçim, aylar sonra "neden bunu seçtik?" sorusu geldiğinde de
savunulabilir kalır.

## Zamanlama davranışı

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Çekirdek hizmetlerinin en kötü durum yürütme süreleri hedef işlemci için yayımlanmış mı? | Zamanlama analizi ancak üst sınırlarla kurulabilir | Hedef işlemci ailesi ve önbellek ayarları için ölçüm ya da analiz raporu |
| Kesme gecikmesi ve kesmelerin kapalı kaldığı en uzun süre ne? | Tepki süresi bütçesine doğrudan girer | Belgelenmiş üst sınır ve ölçüm yöntemi |
| Hangi çizelgeleme modelleri var (öncelik tabanlı, zaman tetiklemeli)? | Mimarinin hangi zamanlama yaklaşımıyla kurulacağını belirler | Projenin ihtiyacına uyan model ve analiz yöntemi |
| Öncelik terslenmesine karşı hangi protokol var? | Nadir ama ciddi gecikmelerin ana kaynağı | Öncelik kalıtımı ya da tavanı; davranışını gösteren test verisi |
| Zamanlayıcı tıkı yapılandırılabilir mi; tıksız (tickless) çalışma var mı? | Zaman çözünürlüğü ve ek yük | Gerekçeli seçenekler ve her birinin etkisi |

## Bellek ve koruma

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Çalışma sırasında dinamik bellek ayırma gerekiyor mu? | Parçalanma ve tükenme riski | Tüm nesnelerin statik ya da başlatmada ayrılabilmesi |
| Bellek koruma birimi (memory protection unit, MPU) ya da bellek yönetim birimi (memory management unit, MMU) destekleniyor mu? | Görevlerin birbirinin alanına yazmasının önlenmesi | Görev ya da bölüm başına koruma ve ihlal tepkisi |
| Yığın taşması tespit ediliyor mu? | Sessiz bellek bozulmasını önler | Koruma bölgesi ya da donanım desteğiyle tespit, tanımlı tepki |
| Çekirdeğin bellek ayak izi ne? | Kaynak kısıtlı hedeflerde belirleyici | Yapılandırmaya göre belgelenmiş boyutlar |

## Bölümleme ve çok çekirdek

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Mekânsal ve zamansal bölümleme sağlanıyor mu (örneğin ARINC 653 tarzı)? | Farklı yazılım seviyelerinin aynı işlemciyi paylaşması | Bölümleme mekanizması ve bunun doğrulama kanıtı |
| Bölümler arası iletişim hangi mekanizmalarla yapılıyor? | Bölümleme iddiasının iletişimle delinmemesi | Sınırlı, yapılandırma ile tanımlanan kanallar |
| Çok çekirdekli işlemci desteği var mı; girişim kanalları için ne sunuluyor? | Çok çekirdekte zamanlama varsayımları değişir | Girişim analizi desteği, kaynak bölüştürme seçenekleri |
| Sağlık izleme ve hata tepkileri yapılandırılabilir mi? | Hata durumunda öngörülebilir davranış | Olay türüne göre tanımlanabilen tepkiler |

## Sertifikasyon paketi

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Paket hangi yazılım seviyesine kadar DO-178C yaşam döngüsü verisi içeriyor? | Projenin seviyesini karşılamayan paket boşluk bırakır | Gereksinim, tasarım, kod, test, kapsam ve izlenebilirlik verisi |
| Paket bizim işlemcimizi, derleyici sürümümüzü ve yapılandırmamızı kapsıyor mu? | Kanıt yalnızca kapsadığı yapılandırma için geçerlidir | Açık bir kapsam listesi; farklılıklar için uyarlama hizmeti |
| Kart destek paketi (board support package, BSP) ve sürücüler paketin içinde mi? | Paket dışındaki her katmanın kanıtını proje üretir | Kapsamın katman katman belirtilmesi |
| Daha önce hangi projelerde, hangi otoritelerle sertifikasyon geçti? | Paketin otorite incelemesinden geçmiş olması riski azaltır | Referans projeler (gizlilik sınırları içinde) |
| Bilinen problemler listesi paylaşılıyor mu ve ne sıklıkla güncelleniyor? | Bilinen kusurlar projenin emniyet analizine girer | Düzenli, sınıflandırılmış ve etki açıklamalı liste |

## Araçlar ve geliştirme ortamı

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Hangi derleyici ve hata ayıklayıcılarla çalışıyor? | Araç zinciri değişikliği paket kapsamını etkiler | Desteklenen sürümler listesi |
| Yapılandırma ya da kod üreten araçlar var mı; kalifikasyon verisi sunuluyor mu? | Çıktısı doğrulanmayan araç kalifikasyon gerektirir | Araç kalifikasyon seviyesine uygun veri |
| Zamanlama ve iz (trace) analiz araçları var mı? | Doğrulama ve hata ayıklama yükü | Hedefte düşük ek yükle çalışan izleme |
| Hedef dışı (host) benzetim ortamı var mı? | Erken geliştirme ve birim test | Hedefle farkları belgelenmiş benzetim |

## Tedarikçi, destek ve ticari koşullar

| Soru | Neden önemli | İyi yanıt |
|---|---|---|
| Ürün ne kadar süre desteklenecek? | Aviyonik programların ömrü onlarca yıldır | Yazılı uzun dönem destek taahhüdü |
| Kaynak koda ve problem raporu geçmişine erişim koşulları ne? | Hata analizinde ve otorite sorularında gerekir | Sözleşmede tanımlı erişim hakları |
| Lisans modeli nedir (geliştirici, ürün, birim başına)? | Toplam maliyeti ve filoya yayılmayı etkiler | Açık ve öngörülebilir koşullar |
| Tedarikçi ortadan kalkarsa ne olur? | Bağımlılık riski | Kaynak kod emaneti (escrow) ya da benzeri güvence |

## Kırmızı bayraklar

- En kötü durum değerleri yerine yalnızca ortalama performans rakamları veriliyorsa.
- "Sertifiye edilmiş RTOS" deniyor ama hangi seviye, hangi işlemci ve hangi
  yapılandırma için olduğu söylenmiyorsa (yazılım tek başına sertifiye edilmez;
  sistemin parçası olarak onaylanır).
- Bilinen problemler listesi paylaşılmıyor ya da "hiç problem yok" deniyorsa.
- Sertifikasyon paketi ayrı satılıyor ve içeriği satın almadan önce
  incelenemiyorsa.

## Deneme uygulaması

Karar vermeden önce hedefe yakın bir kartta küçük bir deneme uygulaması koşturmak,
belgelerde görünmeyen davranışları erken ortaya çıkarır. Birkaç periyodik görev, bir
kesme kaynağı ve paylaşılan bir kaynak yeterlidir. Ölçülecekler:

- görev geçiş süresi ve titreşim (jitter),
- kesmeden göreve tepki süresi,
- paylaşılan kaynakta en uzun bekleme süresi,
- yük altında zaman sınırı kaçırma davranışı,
- derleme ve hata ayıklama zincirinin ekibin araçlarıyla uyumu.

## Bu ekten akılda kalması gerekenler

- Her yanıt bir kanıta dayanmalıdır; kanıtsız yanıt yanıt değildir.
- Sertifikasyon paketinin değeri, projenin seviyesini, işlemcisini, derleyicisini ve
  yapılandırmasını kapsadığı ölçüdedir.
- Tedarikçi seçimi, program ömrü boyunca sürecek bir bağımlılıktır.
- Yanıtlar ve gerekçeler bir karar kaydında saklanmalıdır.
