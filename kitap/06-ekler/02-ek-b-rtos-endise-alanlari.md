---
title: "Ek B: Gerçek Zamanlı İşletim Sistemlerinde Endişe Alanları"
description: "RTOS kullanan aviyonik yazılımda zamanlama, senkronizasyon, kesme, bellek, saat, bölümleme ve çok çekirdek risklerinin ele alınış yolları."
sidebar_position: 2
---

# Ek B: Gerçek Zamanlı İşletim Sistemlerinde Endişe Alanları

Bu ek, gerçek zamanlı işletim sistemi (real-time operating system, RTOS) kullanan bir
projede tasarım ve doğrulama sırasında izlenmesi gereken risk alanlarını toplar. Her
alan için neyin ters gidebileceği, bunun nasıl görüneceği ve hangi analiz, test ya da
tasarım kuralıyla ele alınacağı özetlenir.

[Ek C](03-ek-c-rtos-secim-sorulari.md), bir RTOS'u **seçerken** sorulacak soruları
içerir; bu ek ise seçilmiş bir RTOS'u projede **kullanırken** ortaya çıkan riskleri ele
alır. Arka plan için
[20. Gerçek Zamanlı İşletim Sistemleri](../05-ozel-konular/20-gercek-zamanli-isletim-sistemleri.md)
bölümüne bakınız. Her alanın sonundaki sorular, tasarım gözden geçirmesinde ya da bir
denetime hazırlanırken kontrol listesi olarak kullanılabilir.

## Özet tablo

| Alan | Tipik risk | Ele alma yolu |
|---|---|---|
| Çizelgeleme | Zaman sınırının yük altında kaçırılması | Çizelgelenebilirlik analizi, en kötü durum ölçümleri |
| Senkronizasyon | Öncelik terslenmesi, kilitlenme | Öncelik kalıtımı/tavanı, kilit sıralama kuralı, analiz |
| Kesmeler | Sınırsız kesme gecikmesi, kesme fırtınası | Kısa kesme rutinleri, kesme kapalı süresinin ölçümü, hız sınırlama |
| Bellek | Yığın taşması, parçalanma | Statik ayırma, yığın analizi, bellek koruma birimi |
| Görevler arası iletişim | Kuyruk taşması, bayat ya da yarım veri | Boyut analizi, tazelik kontrolü, atomik erişim |
| Saat ve zaman | Sayaç taşması, saat kayması | Taşma süresi hesabı, taşmaya dayanıklı kod, uzun süreli test |
| Başlatma ve hata yönetimi | Belirsiz başlangıç durumu, sessiz hata | Tanımlı başlatma sırası, sağlık izleme, bekçi köpeği |
| Bölümleme | Bir bölümün diğerini etkilemesi | Alan ve zaman bölümlemesi kanıtı |
| Çok çekirdek | Çekirdekler arası girişim | Girişim kanallarının analizi ve ölçümü |
| Yapılandırma | Paket dışı özellik, kullanılmayan kod | Yapılandırma kontrolü, kapsam analizi |

## Çizelgeleme ve zaman bütçesi

Çizelgeleme (scheduling), görevlerin işlemciyi hangi sırayla ve ne kadar süreyle
kullanacağını belirler. Her görevin en kötü durum yürütme süresi (worst-case execution
time, WCET), periyodu ve zaman sınırı bilinmeden sistemin zamanında çalışacağı
gösterilemez. Ortalama ölçümlerle kurulan bir zaman bütçesi, nadir bir yük
kombinasyonunda çöker. Görevlerin toplam işlemci kullanımı, RTOS çekirdek hizmetlerinin
süresi ve kesmelerin araya girmesi birlikte hesaba katılmalıdır. WCET ve yığın kullanımı
analizlerinin nasıl yapıldığı
[9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md) bölümünde
anlatılır.

- Çizelgelenebilirlik analizi (schedulability analysis) yapılmış mı ve ne kadar kalan
  pay (margin) gösteriyor?
- Görev öncelikleri hangi kurala göre atanmış (örneğin periyoda ya da zaman sınırına
  göre) ve gerekçesi tasarım verisinde yazılı mı?
- Aşırı yük durumunda hangi görevin zaman sınırını kaçıracağı tasarımda belirlenmiş mi?
- Zamanlayıcı tık (tick) çözünürlüğü en kısa periyotlu görev için yeterli mi?

## Paylaşılan kaynaklar ve senkronizasyon

Paylaşılan kaynakların iki klasik tuzağı öncelik terslenmesi (priority inversion) ve
kilitlenmedir (deadlock): ilkinde yüksek öncelikli görev, düşük öncelikli bir görevin
tuttuğu kaynak yüzünden öngörülemez süre bekler; ikincisinde görevler birbirinin tuttuğu
kaynağı bekleyerek hiç ilerleyemez. İkisi de nadir tetiklenir; testte görülmeyip sahada
ortaya çıkabilir.

- Paylaşılan her kaynak için kullanılan koruma mekanizması ve protokol (öncelik
  kalıtımı ya da öncelik tavanı) belgelenmiş mi?
- İç içe kilit (lock) alınıyorsa, tüm görevlerin uyduğu tek bir kilit alma sırası var mı?
- Bir kilit için en uzun bekleme süresi sınırlı ve zaman bütçesine eklenmiş mi?
- Birden çok görevden ya da kesme bağlamından çağrılan kütüphane ve sürücü işlevlerinin
  yeniden girilebilir (reentrant) olduğu gösterilmiş mi; olmayanlar bir kilitle
  korunuyor mu?

## Kesmeler

Kesme servis rutinlerinin (interrupt service routine, ISR) uzunluğu ve kesmelerin
kapalı tutulduğu en uzun süre, sistemin tepki süresini doğrudan belirler. Arızalı bir
çevre birimi saniyede binlerce kesme üreterek görevleri aç bırakabilir.

- Kesme rutinleri yalnızca veriyi alıp bir göreve aktaracak kadar kısa mı?
- Kesmelerin kapalı kaldığı en uzun süre ölçülmüş ya da analiz edilmiş mi?
- Bir kaynaktan gelen aşırı kesmeye karşı hız sınırlama ya da devre dışı bırakma
  stratejisi var mı?
- Kayan nokta (floating-point) işlemi yapan görev ve kesme rutinleri için kayan nokta
  yazmaçlarının bağlam değiştirme (context switch) sırasında saklanıp geri yüklendiği
  doğrulanmış mı?

## Bellek

Çalışma sırasında dinamik bellek ayırma (dynamic memory allocation) parçalanma ve
tükenme riski taşır; çoğu proje onu yasaklar ya da başlatma aşamasıyla sınırlar. Görev
başına ayrılan yığın (stack) alanı yetersizse taşma, komşu bellek alanını sessizce
bozar.

- Her görevin yığın ihtiyacı en kötü çağrı derinliğine ve kesme yüküne göre analiz
  edilmiş mi?
- Yığın taşması çalışma sırasında tespit ediliyor mu (koruma bölgesi ya da bellek koruma
  birimi; memory protection unit, MPU)?
- MPU, görevlerin birbirinin alanına yazmasını engelleyecek biçimde yapılandırılmış mı?
- Dinamik bellek ayırmaya ilişkin kural kodlama standardında yazılı mı ve uyulduğu araçla ya
  da gözden geçirmeyle denetleniyor mu?

## Görevler arası iletişim

Kuyruklar ve paylaşılan değişkenler veri kaybı ve tutarsızlık için doğal noktalardır.
Birden çok kelimeden oluşan bir veri bir görev tarafından yazılırken diğer görev
okursa, yarısı eski yarısı yeni bir değer elde edilir.

- Her kuyruğun boyutu en kötü üretim–tüketim oranına göre seçilmiş mi; taşmada ne olur?
- Okunan verinin tazeliği (ne kadar eski olduğu) kontrol ediliyor mu?
- Çok kelimelik veriye erişim atomik mi, yoksa tutarsız okuma mümkün mü?

## Saat ve zaman

Zaman sayaçlarının taşması klasik bir hata sınıfıdır: milisaniyede bir artan 32 bitlik
bir sayaç yaklaşık 49,7 günde başa döner. Sistem bu süreden uzun açık kalabiliyorsa,
taşma anındaki davranış tasarlanmış ve test edilmiş olmalıdır.

Sorun kuramsal değildir. FAA'nın 2015 tarihli AD 2015-09-07 sayılı uçuşa elverişlilik
direktifi (airworthiness directive, AD), Boeing 787'nin jeneratör kontrol birimlerindeki
bir yazılım sayacının 248 gün kesintisiz enerjili kalındığında taştığını ve birlikte
enerjilenmiş birimlerin aynı anda arıza emniyetli moda (failsafe mode) geçerek tüm
alternatif akım gücünün kaybına yol açabileceğini bildirmiştir. Direktif, geçici önlem
olarak uçağın elektrik gücünün belirli aralıklarla kesilip yeniden verilmesini zorunlu
kılmış; kalıcı çözüm, sonraki bir direktifle zorunlu tutulan yazılım güncellemesi
olmuştur. Böyle bir hata olağan süreli testlerde ortaya çıkmaz, çünkü test düzenekleri
nadiren aylarca kesintisiz çalıştırılır; onu erken ve güvenle bulan, sayacın genişliği
ile artış hızından yapılan hesaptır.

Taşma kaçınılmazsa kod ona dayanıklı yazılır. İki sayaç değerinin farkı işaretsiz
çıkarmayla alındığında, sayaç arada başa dönmüş olsa bile sonuç doğrudur:

```c
#include <stdbool.h>
#include <stdint.h>

/* Koşul: ölçülen aralık, sayacın taşma süresinden (2^32 ms) kısa olmalıdır. */
bool sure_doldu(uint32_t simdi_ms, uint32_t baslangic_ms, uint32_t sure_ms)
{
    uint32_t gecen_ms = simdi_ms - baslangic_ms;

    return (gecen_ms >= sure_ms);
}
```

Bitiş anını toplayarak bulup `simdi_ms >= baslangic_ms + sure_ms` biçiminde
karşılaştırmak ise hatalıdır: toplam başa döndüğünde koşul, süre dolmadan doğru olur.

- Her zaman sayacının taşma süresi hesaplanmış ve sistemin en uzun çalışma süresiyle
  karşılaştırılmış mı?
- Zaman farkı hesapları taşmaya dayanıklı biçimde yazılmış mı?
- Birden çok saat kaynağı varsa aralarındaki kayma ve eşzamanlama ele alınmış mı?

## Başlatma, hata yönetimi ve yeniden başlatma

Başlatma sırasında görevlerin, sürücülerin ve paylaşılan verinin hangi sırayla hazır
hâle geldiği tanımlı değilse, sistem her açılışta farklı bir durumdan başlayabilir.
Çalışma sırasındaki hatalar da (istisna, zaman aşımı, yığın taşması) tanımlı bir
tepkiye bağlanmalıdır.

- Başlatma sırası belgelenmiş ve her adımın başarısızlığında ne olacağı belli mi?
- Sağlık izleme (health monitoring) hangi olayları yakalıyor ve her birine hangi
  tepkiyi veriyor?
- Çekirdek çağrılarının hata dönüş değerleri (kuyruk dolu, zaman aşımı, geçersiz
  parametre) her çağrıda denetleniyor ve tanımlı bir tepkiye bağlanıyor mu?
- Bekçi köpeği zamanlayıcısı (watchdog) ile yeniden başlatma sonrası hangi durumun
  korunacağı tanımlı mı?

## Bölümleme

Farklı yazılım seviyelerinden bileşenler aynı işlemciyi paylaşıyorsa, bir bölümdeki
(partition) hatanın diğerinin belleğini ya da zaman bütçesini etkileyemeyeceği
gösterilmelidir. İlki alan bölümlemesinin (spatial partitioning), ikincisi zaman
bölümlemesinin (temporal partitioning) konusudur ve biri diğerinin yerini tutmaz:
bellek koruma birimi yalnızca alan korumasını sağlar. Ayrıntı için
[21. Yazılım Bölümlemesi](../05-ozel-konular/21-yazilim-bolumlemesi.md) bölümüne
bakınız.

- Bölümleme yapılandırması (bellek bölgeleri, zaman pencereleri, erişim hakları)
  konfigürasyon kontrolünde mi ve tasarımla karşılaştırılarak gözden geçirilmiş mi?
- Bir bölüm zaman penceresini aştığında ya da izinsiz belleğe eriştiğinde ne olduğu
  gürbüzlük testleriyle gösterilmiş mi?
- Bölümlerin ortak kullandığı kaynaklar (giriş/çıkış aygıtları, kesmeler, haberleşme
  kanalları) listelenmiş ve her biri için hatanın yayılma yolu analiz edilmiş mi?

## Çok çekirdekli işlemciler

Çok çekirdekli işlemcilerde çekirdekler önbellek, bellek denetleyicisi ve veri yolu
gibi kaynakları paylaşır. Bir çekirdekteki yazılım, diğer çekirdekteki yazılımın
yürütme süresini bu paylaşılan kaynaklar üzerinden uzatabilir; bu yollara girişim
kanalları (interference channels) denir. Çok çekirdekli işlemci kullanımına ilişkin
otorite rehberliği (FAA AC 20-193, 2024 ve EASA AMC 20-193, 2022; ikisi daha önce
kullanılan CAST-32A görüş belgesinin yerini almıştır), bu kanalların belirlenmesini,
etkilerinin ölçülmesini ya da sınırlandırılmasını bekler. Tek çekirdekte yapılan WCET
ölçümleri çok çekirdekli bir hedefe doğrudan taşınamaz.

- Girişim kanalları listelenmiş mi ve her biri için bir sınır, bir azaltma önlemi ya da
  ölçüm sonucu var mı?
- WCET değerleri, diğer çekirdekler en olumsuz yükü üretirken hedef donanımda
  belirlenmiş mi?
- İşlemcinin girişimi etkileyen ayarları (etkin çekirdekler, önbellek ve kaynak
  paylaşımı) tanımlı ve konfigürasyon kontrolünde mi?

## Yapılandırma ve kullanılmayan özellikler

RTOS'un sertifikasyon paketi belirli bir yapılandırmayı, işlemciyi ve derleyici
sürümünü kapsar. Proje bu yapılandırmanın dışına çıkarsa (başka bir özellik
etkinleştirir, derleyici sürümünü değiştirir) paketin kanıtı o kısım için geçersiz
kalır. Bağlanan ama kullanılmayan çekirdek özellikleri, kapsam analizinde devre dışı
bırakılmış kod (deactivated code) ya da gereksiz kod (extraneous code) olarak karşınıza
çıkar. Hangisi olduğunu özelliğin kullanılmaması değil, ardındaki veri belirler: özellik
bir gereksinime izlenebiliyor ve tasarım gereği çalıştırılmıyorsa devre dışı bırakılmış
koddur; o zaman planlarda beyan edilmesi, etkin kod gibi standardın hedeflerine uygun
geliştirilmiş olması ve istem dışı çalışmasının önlendiğinin analiz ile testle
gösterilmesi gerekir. Hiçbir gereksinime izlenemiyorsa gereksiz koddur; DO-178C'nin
öngördüğü çözüm kodun kaldırılması ve bunun etkisinin analiz edilmesidir. Kodu imajda
tutmak isteyen proje, eksik gereksinimini ve doğrulama verisini tamamlayarak onu devre
dışı bırakılmış kod olarak savunmak zorundadır
([17. Kapsanmayan Kodlar](../05-ozel-konular/17-kapsanmayan-kodlar.md)).

- Projede kullanılan yapılandırma (etkin özellikler, işlemci, derleyici sürümü ve
  seçenekleri) paketin kapsamıyla madde madde karşılaştırılmış mı?
- Bağlanan ama kullanılmayan her çekirdek özelliği için sınıflandırma ve
  etkinleşemeyeceğinin gerekçesi kayıtlı mı?
- RTOS yapılandırma dosyaları konfigürasyon kontrolünde mi ve her değişiklik, değişiklik
  etki analizinden (change impact analysis) geçiyor mu?

## Bu ekten akılda kalması gerekenler

- RTOS riskleri çoğunlukla nadir tetiklenen zamanlama ve kaynak etkileşimlerinden
  gelir; bu yüzden testle birlikte analiz gerekir.
- Her alan için soru aynıdır: en kötü durum ne, nasıl sınırlandı ve kanıtı nerede?
- Sayaç taşması, yığın taşması ve kuyruk taşması gibi "taşma" riskleri hesapla
  dışlanabilir; hesap yapılmadıysa risk açıktır. Aylar sonra ortaya çıkacak bir sayaç
  taşmasını olağan süreli test göstermez, hesap gösterir.
- Alan bölümlemesi ile zaman bölümlemesi ayrı ayrı gösterilir; bellek koruması zaman
  etkisini önlemez.
- Çok çekirdekli bir hedef, tek çekirdekte kurulan zamanlama varsayımlarını geçersiz
  kılabilir; girişim kanalları belirlenip sınırlandırılmalıdır.
- Bağlanan ama kullanılmayan çekirdek özelliğinin devre dışı bırakılmış kod mu, gereksiz
  kod mu olduğunu gereksinime izlenebilirliği belirler; devre dışı bırakılmış kod için
  istem dışı çalışmanın önlendiği ayrıca gösterilir.
