---
title: "2. Sistem Bağlamında Yazılım"
sidebar_position: 1
---

# 2. Sistem Bağlamında Yazılım

Yazılımın davranışı, ona atanan sistem fonksiyonları ve dış arayüzleri olmadan
anlaşılamaz. Bu bölüm, yazılımın hangi sistem parçasını gerçekleştirdiğini, hangi
sınırlar içinde çalıştığını ve hangi verileri dışarı verdiğini açıklar.

Emniyet-kritik geliştirmede temel soru şudur: yazılım hangi fonksiyonu yerine getirir,
hangi fonksiyonları devralmaz ve hangi durumlarda sistemi güvenli durumda tutar? Bu
bakış, sonraki gereksinim ve tasarım faaliyetlerinin temelidir.

## Sistem bağlamı neden önemlidir?

Bir yazılım işlevi, sistem bağlamından koparıldığında eksik anlaşılır. Örneğin bir hız
hesaplama algoritması, sensör girişinin kalitesi, filtreleme gecikmesi, veri güncelliği
ve insan-makine arayüzü ile birlikte değerlendirilmelidir. Aksi halde "doğru çalışan"
bir kod parçası, yanlış sistem davranışına dönüşebilir.

Sistem bağlamı; ekiplerin aynı dili konuşmasını sağlar. Çünkü yazılım ekibi, sistem
mühendisliği ekibi, test ekibi ve sertifikasyon ekibi çoğu zaman aynı işlevi farklı
açılardan görür. Ortak bağlam oluşmadığında, gereksinimler karışır ve doğrulama hedefleri
belirsizleşir.

## Yazılımın sınırları

Yazılım, sistemin her parçasını yapmaz. Bazı işlevler donanım tarafından, bazıları
operatör prosedürleri tarafından, bazıları da başka alt sistemler tarafından sağlanır.
Bu yüzden yazılımın sorumluluk alanı açıkça çizilmelidir.

Bir uçuş kontrol bilgisayarında yazılım:

- sensör verisini yorumlayabilir,
- komut üretimini yönetebilir,
- arıza durumlarını sınıflandırabilir,
- yedek moda geçişi başlatabilir.

Ama sensörün fiziksel davranışını değiştiremez, kablolamayı düzeltemez ya da çevresel
koşulları ortadan kaldıramaz. Sistem bağlamı bu farkı netleştirir.

## Arayüzler

Arayüzler, sistemin en hassas noktalarıdır. Çünkü veri biçimi, zamanlama, hata
işaretleri ve sınır değerler burada tanımlanır. Net olmayan bir arayüz, testin tekrar
edilebilirliğini azaltır ve bakım sırasında beklenmeyen yan etkilere yol açar.

İyi bir arayüz tanımı şunları içerir:

- giriş ve çıkışların anlamı,
- veri tipleri ve birimleri,
- geçerli sınırlar,
- hata/uyarı kodları,
- zamanlama beklentileri,
- güvenli durum davranışı.

## Basit bir örnek

Bir uçuş kontrol bilgisayarında yazılım, sensörlerden gelen veriyi işler; ancak sensörün
kendisi değildir. Bu yüzden:

- giriş sinyallerinin sınırları tanımlanır,
- donanım arızalarında beklenen tepki belirlenir,
- dış arayüzler açıkça belgelenir,
- gecikme veya kesinti durumunda sistem davranışı açıklanır.

Bu tür açıklamalar olmadan yazılım gereksinimleri eksik kalır.

## Bu bölümden akılda kalması gerekenler

- Yazılım sistemin bir parçası olarak anlaşılmalıdır.
- Sınırlar ve arayüzler net değilse gereksinimler belirsizleşir.
- Sistem bağlamı, doğrulama ve emniyet analizinin temel girdisidir.
