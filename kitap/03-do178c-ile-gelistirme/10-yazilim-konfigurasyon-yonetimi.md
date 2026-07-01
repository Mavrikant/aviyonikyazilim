---
title: "10. Yazılım Konfigürasyon Yönetimi"
sidebar_position: 7
---

# 10. Yazılım Konfigürasyon Yönetimi

Konfigürasyon yönetimi, hangi iş ürününün hangi sürümde olduğunu ve neden değiştiğini
izlenebilir kılar. Bu sayede gereksinim, kod, test ve dokümanlar arasında tutarlılık
korunur.

Değişiklik kontrolü, yalnızca dosya versiyonlarını değil, sertifikasyon kanıtının
tamamını korur. Bu yüzden baz çizgiler ve sürüm kayıtları önemlidir.

## Konfigürasyon yönetimi neden gerekli?

Aviyonik projelerde birçok belge birbirine bağlıdır. Bir gereksinim değiştiğinde bunun
tasarıma, koda, testlere, inceleme kayıtlarına ve bazen sertifikasyon sunumuna yansıması
gerekir. Bu zinciri yönetmenin tek yolu düzenli konfigürasyon kontrolüdür.

## Baz çizgiler

Baz çizgi, belirli bir anda "onaylı" kabul edilen iş ürünleri kümesidir. Bu kavram,
değişikliklerin rastgele yayılmasını engeller. Bir sürümün ne içerdiği açıkça bilinmeden
doğrulama sonuçları da anlamını kaybeder.

## Değişiklik kontrolü

İyi bir değişiklik kontrolü şu soruları cevaplar:

- Değişiklik neden gerekli?
- Hangi iş ürünleri etkileniyor?
- Kim onaylıyor?
- Hangi testler yeniden çalışmalı?
- Hangi sürüm etiketi kullanılacak?

Bu soruların cevabı yoksa değişiklik teknik olarak yapılmış olsa bile yönetimsel olarak
tamamlanmış sayılmaz.

## Konfigürasyon yönetimi örneği

Bir gereksinim değiştiğinde aynı değişikliğin:

- tasarım dokümanına,
- test prosedürüne,
- sürüm etiketine

yansıması gerekir.

## Sürüm izlenebilirliği

Sürüm izlenebilirliği, hangi iş ürününün hangi anda hangi içerikle onaylandığını gösterir.
Bu bilgi, denetim ve geriye dönük sorun çözme açısından kritik önemdedir.

## Bu bölümden akılda kalması gerekenler

- Konfigürasyon yönetimi, kanıtın bütünlüğünü korur.
- Baz çizgi olmadan değişiklik kontrolü zayıflar.
- Sürüm izlenebilirliği sertifikasyonun temel unsurudur.
