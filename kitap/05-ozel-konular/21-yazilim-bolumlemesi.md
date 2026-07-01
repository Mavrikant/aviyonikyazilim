---
title: "21. Yazılım Bölümlemesi"
sidebar_position: 5
---

# 21. Yazılım Bölümlemesi

Yazılım bölümlemesi, farklı güvence düzeyindeki işlevlerin birbirini etkilemesini
sınırlandırır. Bu izolasyon zaman, bellek ya da çalışma alanı bazlı olabilir.

Amaç, bir alt sistemdeki hatanın diğerini tehlikeye atmamasını göstermektir. Bu da
mimari kararların doğrulama ile birlikte düşünülmesini gerektirir.

## Bölümleme neden gerekir?

Aynı platform üzerinde farklı güvence seviyesindeki işlevler birlikte çalışabilir.
Ancak bu durum, düşük güvence düzeyindeki bir hatanın kritik işlevi etkilemeyeceğinin
gösterilmesini gerektirir. Bölümleme tam olarak bu sınırı sağlar.

## Bölümleme türleri

- zaman bazlı,
- bellek bazlı,
- çalışma alanı bazlı,
- kaynak erişimi bazlı.

Hangi türün kullanılacağı mimari ihtiyaç ve platform yeteneklerine bağlıdır.

## Doğrulama açısından

Bölümleme yalnızca tasarım metniyle değil, test ve analiz ile gösterilmelidir. Çünkü
izolasyonun gerçekten çalıştığını görmek gerekir.

### Bölümleme örneği

Bir bakım ekranı ile uçuş kontrol fonksiyonu aynı platformda çalışabilir; fakat
bölümleme sayesinde bakım tarafındaki hata, kontrol döngüsünü etkilememelidir.

## Riskler

- yanlış konfigürasyon,
- kaynak sızıntısı,
- zaman paylaşımlarının bozulması,
- sınırların test edilmemesi.

## Bu bölümden akılda kalması gerekenler

- Bölümleme, etkileşimi sınırlayan mimari önlemdir.
- İzolasyonun gerçekten çalıştığı kanıtlanmalıdır.
- Kritik ve kritik olmayan işlevler arasında net sınır gerekir.
