---
title: "3. Sistem Emniyet Değerlendirmesi Bağlamında Yazılım"
sidebar_position: 2
---

# 3. Sistem Emniyet Değerlendirmesi Bağlamında Yazılım

Sistem emniyet değerlendirmesi, yazılımın neden belirli bir güvence düzeyinde
geliştirilmesi gerektiğini açıklar. Tehlike analizi sonucunda ortaya çıkan kritik
durumlar, yazılım gereksinimlerine ve doğrulama yoğunluğuna doğrudan yansır.

Bu bölümde amaç, emniyet hedeflerinin nasıl yazılım iş ürünlerine dönüştüğünü
göstermektir. Böylece her testin ve her kontrolün arkasındaki gerekçe görünür olur.

## Emniyet değerlendirmesi ne üretir?

Sistem emniyet çalışmaları genellikle şu tür çıktılar üretir:

- tehlike tanımları,
- risk ve şiddet sınıfları,
- kabul edilebilir risk hedefleri,
- güvenli durum beklentileri,
- yazılıma tahsis edilen emniyet fonksiyonları.

Bu çıktılar, yazılım ekibine doğrudan "şu kodu yaz" demez. Bunun yerine, hangi
davranışların gösterilmesi gerektiğini ve hangi koşullarda hata kabul edilemeyeceğini
tanımlar.

## Tehlikeden gereksinime

Tehlike analizi sonucunda ortaya çıkan bir bulgu, çoğu zaman birkaç yazılım gereksinimine
ayrılır. Örneğin "yanlış hız verisi" tehlikesi için yazılım;

- veriyi filtrelemeli,
- geçersiz ölçümleri ayıklamalı,
- sensör tutarsızlığını algılamalı,
- sınır dışı durumda uyarı üretmelidir.

Burada önemli olan, tahsis işleminin açık olmasıdır. Hangi önlemin yazılımda, hangisinin
donanımda, hangisinin operasyonel prosedürde olduğu açıkça yazılmalıdır.

## Yazılım emniyeti nasıl etkiler?

Yazılım, bazı durumlarda tehlikeyi doğrudan azaltan tek bileşen olabilir. Özellikle
birden fazla sensörün tutarlılığını değerlendiren, hatalı veriyi sınırlayan veya güvenli
duruma geçişi yöneten işlevler yazılım tarafından taşınır.

Bu işlevler şunları gerektirir:

- açık sınır koşulları,
- hata durumları için net davranış,
- zamanlama gereksinimleri,
- yeniden başlatma veya degrade mod tanımı.

## Doğrulama üzerindeki etkisi

Emniyet değerlendirmesi, doğrulama yoğunluğunu da etkiler. Bir işlev ne kadar kritikse,
onunla ilişkili kanıt o kadar güçlü olmak zorundadır. Bu nedenle tehlike analizi ile
test stratejisi birbirinden ayrı düşünülemez.

Örneğin:

- kritik bir güvenli durum geçişi için hem gözden geçirme hem de hedefli test gerekir,
- sınır değer koruması için negatif testler önemlidir,
- arıza algılama için gecikme ve yanlış pozitif senaryoları incelenmelidir.

## Dönüşüm örneği

- Tehlike: yanlış hız verisi.
- Yazılım etkisi: hız tahmini için kullanılan verinin filtrelenmesi.
- Kanıt: ilgili gereksinim, test ve sınır değer analizi.

Bu basit akış, emniyet analizi ile yazılım iş ürünü arasındaki bağlantının özünü gösterir.

## Bu bölümden akılda kalması gerekenler

- Emniyet analizi, yazılım gereksinimlerinin kaynağıdır.
- Yazılımın emniyet katkısı açıkça tahsis edilmelidir.
- Kritik davranışlar için doğrulama kanıtı daha güçlü olmalıdır.
