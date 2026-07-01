---
title: "20. Gerçek Zamanlı İşletim Sistemleri"
sidebar_position: 4
---

# 20. Gerçek Zamanlı İşletim Sistemleri

Gerçek zamanlı işletim sistemleri, görevlerin zamanında tamamlanmasını kolaylaştırır;
ancak aynı zamanda zamanlama, öncelik ve kesme davranışlarını dikkatle yönetmeyi
gerektirir.

Bu bölüm, RTOS kullanımının yazılım mimarisi, test ve emniyet kanıtı üzerindeki
etkilerini açıklar.

## RTOS neden önemlidir?

RTOS, bir işlevin yalnızca doğru değil, zamanında da yapılmasını sağlar. Aviyonik
sistemlerde zamanlama hatası, işlev hatası kadar kritik olabilir. Bu yüzden işletim
sistemi seçimi ve kullanımı emniyet mimarisinin parçasıdır.

## Tipik konular

### RTOS açısından tipik konular

- Öncelik terslenmesi
- Zamanlayıcı davranışı
- Kesme gecikmesi
- Paylaşılan kaynaklar

## Mimari etkiler

RTOS kullanımı, görevlerin nasıl ayrıldığını, hangi işlevin hangi öncelikte çalıştığını
ve paylaşılan kaynakların nasıl korunduğunu belirler. Özellikle kilit mekanizmaları ve
zamanlayıcı yapılandırmaları test edilebilir olmalıdır.

## Doğrulama açısından bakış

Doğrulama sırasında yalnızca işlevsel sonuç değil, zaman davranışı da gözlenmelidir.
Bir görev doğru çıktıyı üretse bile yanlış zamanda üretirse sistem davranışı hatalı olur.

## Bu bölümden akılda kalması gerekenler

- RTOS, zamanlı davranışın merkezindedir.
- Öncelik ve kesme yönetimi emniyet açısından kritiktir.
- Zamanlama testleri işlev testleri kadar önemlidir.
