---
title: "14. DO-331 ve Model Tabanlı Geliştirme ve Doğrulama"
sidebar_position: 2
---

# 14. DO-331 ve Model Tabanlı Geliştirme ve Doğrulama

Model tabanlı geliştirme, gereksinim ve tasarımın bir model üzerinde ifade edilmesini
sağlar. Bu yaklaşım, özellikle karmaşık davranışların erken simülasyonla görülmesini
kolaylaştırır.

DO-331, modelin kendisinin ve modelden türetilen çıktının nasıl doğrulanacağını
tanımlar. Önemli nokta, modelin bir rahatlık aracı değil, izlenebilir bir mühendislik
artefaktı olarak ele alınmasıdır.

## Model neden kullanılır?

Model, davranışı soyut ama çalıştırılabilir biçimde ifade etmeye yardım eder. Bu sayede
ekipler tasarım kararlarını erken görür, senaryoları simüle eder ve gereksinim
uyumsuzluklarını daha kod yazmadan fark edebilir.

## Modelin rolü

Model üç farklı şekilde kullanılabilir:

- tasarım anlatımı,
- simülasyon kaynağı,
- kod üretim temeli.

Hangi rolün geçerli olduğu baştan açık olmalıdır. Çünkü her rol farklı doğrulama ihtiyacı
doğurur.

## DO-331 neye bakar?

DO-331, modelin:

- izlenebilir olup olmadığına,
- simülasyon davranışına,
- üretim çıktısının kontrolüne,
- model ile kaynak arasındaki tutarlılığa

odaklanır.

## Model tabanlı akış örneği

- Modelde davranış tanımlanır.
- Simülasyonla erken hata aranır.
- Kod üretimi varsa üretilen kod ayrıca doğrulanır.

## Avantajlar

- davranış erken görülür,
- karmaşıklık daha düzenli ifade edilir,
- simülasyon geri beslemesi hızlıdır,
- bazı hata sınıfları koddan önce yakalanır.

## Riskler

Model, gereksinimden koparsa yanıltıcı olur. Ayrıca model ile üretilen kod arasında
tutarlılık korunmazsa otomasyon hata büyütebilir.

## Bu bölümden akılda kalması gerekenler

- Model, mühendislik artefaktı olarak yönetilmelidir.
- Simülasyon erken hata yakalamaya yarar.
- Üretilen kod yine ayrıca doğrulanmalıdır.
