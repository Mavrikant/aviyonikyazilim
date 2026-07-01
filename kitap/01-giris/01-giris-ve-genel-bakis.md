---
title: "1. Giriş ve Genel Bakış"
sidebar_position: 1
---

# 1. Giriş ve Genel Bakış

Bu kitap, aviyonik yazılımın yalnızca koddan ibaret olmadığını; gereksinim, tasarım,
doğrulama ve sertifikasyon kanıtlarından oluşan bütüncül bir çalışma olduğunu anlatır.
Bu giriş bölümünde hedef, okuyucuya kitapta kullanılan dilin ve yaklaşımın kısa bir
haritasını vermektir.

Aviyonik ortamda yazılım geliştirmek, sıradan bir ürün yazılımdan farklı olarak,
emniyet hedefleriyle, donanım sınırlarıyla ve sertifikasyon beklentileriyle iç içe
çalışmayı gerektirir. Dolayısıyla bir proje, yalnızca işlev üreten bir uygulama değil;
aynı zamanda güvenilir, izlenebilir ve denetlenebilir bir süreç üretmek zorundadır.

## Bu kitap ne anlatır?

Kitap, DO-178C ekseninde aşağıdaki sorulara yanıt verir:

- Yazılım neden ayrı bir emniyet incelemesi ister?
- Gereksinimler nasıl yazılmalı ve izlenmeli?
- Tasarım, kod ve test birbirine nasıl bağlanmalı?
- Hangi iş ürünleri sertifikasyon kanıtı sayılır?
- Araçlar, modeller ve özel teknikler hangi durumlarda ek değerlendirme ister?

Bu soruların her biri tek başına teknik gibi görünse de aslında süreç tasarımı,
organizasyon, iletişim ve kalite kültürüyle doğrudan ilişkilidir.

## Okuyucu için yol haritası

Kitabı şu sırayla okumak en verimli yaklaşımdır:

1. önce sistem bağlamını,
2. sonra emniyet değerlendirmesini,
3. ardından DO-178C süreçlerini,
4. daha sonra araç kalifikasyonu ve özel konuları,
5. sonunda da ekleri ve kaynakları.

Bu sıra, "ne üretilecek?" sorusunu "neden bu üretim gerekir?" sorusuyla birlikte ele
almayı kolaylaştırır.

## Neden bu kadar vurgu var?

Çünkü emniyet-kritik yazılımda bir hata, yalnızca işlevsel bir sorun değildir; uçuş
fazını, bakım prosedürünü veya insan kararını etkileyebilir. Bu yüzden kitabın dili
özellikle üç kavrama tekrar tekrar döner:

- **izlenebilirlik**: bir iş ürününün kökenini ve etkisini gösterebilme,
- **doğrulanabilirlik**: beklenen davranışın kanıtlanabilir olması,
- **denetlenebilirlik**: sürecin dış gözlemci tarafından takip edilebilmesi.

## Bu bölümden akılda kalması gerekenler

- Aviyonik yazılım, süreç ve kanıt üretimiyle birlikte düşünülmelidir.
- Kitap, teknik kavramları sertifikasyon bağlamı içinde açıklar.
- Sonraki bölümleri okurken her zaman "hangi kanıt isteniyor?" sorusu sorulmalıdır.
