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
içerir; bu ek ise seçilmiş bir RTOS'u
projede **kullanırken** ortaya çıkan riskleri ele alır. Arka plan için
[20. Gerçek Zamanlı İşletim Sistemleri](../05-ozel-konular/20-gercek-zamanli-isletim-sistemleri.md)
bölümüne bakınız.

## Özet tablo

| Alan | Tipik risk | Ele alma yolu |
|---|---|---|
| Çizelgeleme | Zaman sınırının yük altında kaçırılması | Zamanlanabilirlik analizi, en kötü durum ölçümleri |
| Senkronizasyon | Öncelik terslenmesi, kilitlenme | Öncelik kalıtımı/tavanı, kilit sıralama kuralı, analiz |
| Kesmeler | Sınırsız kesme gecikmesi, kesme fırtınası | Kısa kesme rutinleri, kesme kapalı süresinin ölçümü, hız sınırlama |
| Bellek | Yığın taşması, parçalanma | Statik ayırma, yığın analizi, bellek koruma birimi |
| Görevler arası iletişim | Kuyruk taşması, bayat ya da yarım veri | Boyut analizi, tazelik kontrolü, atomik erişim |
| Saat ve zaman | Sayaç taşması, saat kayması | Taşma analizi, uzun süreli test |
| Başlatma ve hata yönetimi | Belirsiz başlangıç durumu, sessiz hata | Tanımlı başlatma sırası, sağlık izleme, bekçi köpeği |
| Bölümleme | Bir bölümün diğerini etkilemesi | Mekânsal ve zamansal bölümleme kanıtı |
| Çok çekirdek | Çekirdekler arası girişim | Girişim kanallarının analizi ve ölçümü |
| Yapılandırma | Paket dışı özellik, kullanılmayan kod | Yapılandırma kontrolü, kapsam analizi |

## Çizelgeleme ve zaman bütçesi

Her görevin en kötü durum yürütme süresi (worst-case execution time, WCET), periyodu
ve zaman sınırı bilinmeden sistemin zamanında çalışacağı gösterilemez. Ortalama
ölçümlerle kurulan bir zaman bütçesi, nadir bir yük kombinasyonunda çöker. Görevlerin
toplam işlemci kullanımı, RTOS çekirdek hizmetlerinin süresi ve kesmelerin araya
girmesi birlikte hesaba katılmalıdır.

- Zamanlanabilirlik analizi (schedulability analysis) yapılmış mı ve ne kadar zaman
  payı (margin) bırakıyor?
- Aşırı yük durumunda hangi görevin zaman sınırını kaçıracağı tasarımda belirlenmiş mi?
- Zamanlayıcı tık çözünürlüğü (tick) en kısa periyotlu görev için yeterli mi?

## Paylaşılan kaynaklar ve senkronizasyon

Öncelik terslenmesi (priority inversion), düşük öncelikli bir görevin tuttuğu kaynağı
bekleyen yüksek öncelikli görevin, araya giren orta öncelikli görevler yüzünden
öngörülemez biçimde gecikmesidir. Kilitlenme (deadlock) ise iki görevin birbirinin
tuttuğu kaynağı beklemesidir. İkisi de nadir tetiklenir; testte görülmeyip sahada
ortaya çıkabilir.

- Paylaşılan her kaynak için kullanılan koruma mekanizması ve protokol (öncelik
  kalıtımı ya da öncelik tavanı) belgelenmiş mi?
- İç içe kilit alınıyorsa, tüm görevlerin uyduğu tek bir kilit alma sırası var mı?
- Bir kilit için en uzun bekleme süresi sınırlı ve zaman bütçesine eklenmiş mi?

## Kesmeler

Kesme servis rutinlerinin (interrupt service routine, ISR) uzunluğu ve kesmelerin
kapalı tutulduğu en uzun süre, sistemin tepki süresini doğrudan belirler. Arızalı bir
çevre birimi saniyede binlerce kesme üreterek görevleri aç bırakabilir.

- Kesme rutinleri yalnızca veriyi alıp bir göreve aktaracak kadar kısa mı?
- Kesmelerin kapalı kaldığı en uzun süre ölçülmüş ya da analiz edilmiş mi?
- Bir kaynaktan gelen aşırı kesmeye karşı hız sınırlama ya da devre dışı bırakma
  stratejisi var mı?

## Bellek

Çalışma sırasında dinamik bellek ayırma (dynamic memory allocation), parçalanma ve
tükenme riski nedeniyle emniyet-kritik yazılımda genellikle yasaklanır ya da başlatma
aşamasıyla sınırlanır. Görev başına ayrılan yığın (stack) alanı yetersizse taşma,
komşu bellek alanını sessizce bozar.

- Her görevin yığın ihtiyacı en kötü çağrı derinliğine göre analiz edilmiş mi?
- Yığın taşması çalışma sırasında tespit ediliyor mu (koruma bölgesi, bellek koruma
  birimi)?
- Bellek koruma birimi (memory protection unit, MPU) görevlerin birbirinin alanına
  yazmasını engelleyecek biçimde yapılandırılmış mı?

## Görevler arası iletişim

Kuyruklar ve paylaşılan değişkenler veri kaybı ve tutarsızlık için doğal noktalardır.
Birden çok kelimeden oluşan bir veri bir görev tarafından yazılırken diğer görev
okursa, yarısı eski yarısı yeni bir değer elde edilir.

- Her kuyruğun boyutu en kötü üretim–tüketim oranına göre seçilmiş mi; taşmada ne olur?
- Okunan verinin tazeliği (ne kadar eski olduğu) kontrol ediliyor mu?
- Çok kelimelik veriye erişim atomik mi, yoksa tutarsız okuma mümkün mü?

## Saat ve zaman

Zaman sayaçlarının taşması klasik ve gerçek uçaklarda da görülmüş bir hata sınıfıdır:
milisaniyede bir artan 32 bitlik bir sayaç yaklaşık 49,7 günde başa döner. Sistem bu
süreden uzun açık kalabiliyorsa, taşma anındaki davranış tasarlanmış ve test edilmiş
olmalıdır.

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
- Bekçi köpeği zamanlayıcısı (watchdog) ile yeniden başlatma sonrası hangi durumun
  korunacağı tanımlı mı?

## Bölümleme

Farklı yazılım seviyelerinden bileşenler aynı işlemciyi paylaşıyorsa, bir bölümdeki
hatanın diğerinin belleğini ya da zaman bütçesini etkileyemeyeceği gösterilmelidir
(mekânsal ve zamansal bölümleme). Ayrıntı için
[21. Yazılım Bölümlemesi](../05-ozel-konular/21-yazilim-bolumlemesi.md) bölümüne
bakınız.

## Çok çekirdekli işlemciler

Çok çekirdekli işlemcilerde çekirdekler önbellek, bellek denetleyicisi ve veri yolu
gibi kaynakları paylaşır. Bir çekirdekteki yazılım, diğer çekirdekteki yazılımın
yürütme süresini bu paylaşılan kaynaklar üzerinden uzatabilir; bu yollara girişim
kanalları (interference channels) denir. Çok çekirdekli işlemci kullanımına ilişkin
otorite rehberliği (FAA AC 20-193, EASA AMC 20-193), bu kanalların belirlenmesini,
etkilerinin ölçülmesini ya da sınırlandırılmasını bekler. Tek çekirdekte yapılan WCET
ölçümleri çok çekirdekli bir hedefe doğrudan taşınamaz.

## Yapılandırma ve kullanılmayan özellikler

RTOS'un sertifikasyon paketi belirli bir yapılandırmayı, işlemciyi ve derleyici
sürümünü kapsar. Proje bu yapılandırmanın dışına çıkarsa (başka bir özellik
etkinleştirir, derleyici sürümünü değiştirir) paketin kanıtı o kısım için geçersiz
kalır. Bağlanan ama kullanılmayan çekirdek özellikleri, kapsam analizinde devre dışı
bırakılmış kod (deactivated code) ya da gereksiz kod (extraneous code) olarak karşınıza
çıkar ([17. Kapsanmayan Kodlar](../05-ozel-konular/17-kapsanmayan-kodlar.md)).

## Bu ekten akılda kalması gerekenler

- RTOS riskleri çoğunlukla nadir tetiklenen zamanlama ve kaynak etkileşimlerinden
  gelir; bu yüzden testle birlikte analiz gerekir.
- Her alan için soru aynıdır: en kötü durum ne, nasıl sınırlandı ve kanıtı nerede?
- Sayaç taşması, yığın taşması ve kuyruk taşması gibi "taşma" riskleri hesapla
  dışlanabilir; hesap yapılmadıysa risk açıktır.
- Çok çekirdekli bir hedef, tek çekirdekte kurulan zamanlama varsayımlarını geçersiz
  kılabilir.
