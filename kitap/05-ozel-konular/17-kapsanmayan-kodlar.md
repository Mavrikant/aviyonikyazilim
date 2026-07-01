---
title: "17. Kapsanmayan Kodlar: Ölü, Gereksiz ve Devre Dışı Bırakılmış Kodlar"
sidebar_position: 1
---

# 17. Kapsanmayan Kodlar: Ölü, Gereksiz ve Devre Dışı Bırakılmış Kodlar

Kod tabanında her görünen satır gerçek amaç taşımayabilir. Ölü, gereksiz ve devre dışı
bırakılmış kod birbirine benzer görünse de sertifikasyon açısından farklı biçimde ele
alınır.

Bu bölüm, bu tür kodların neden risk oluşturduğunu ve bunların nasıl tanımlanıp
gerekçelendirileceğini açıklar.

## Neden sorun oluştururlar?

Görünürde zararsız satırlar bile yanlış anlaşılmaya yol açabilir. Bir kod yolu artık
çalışmıyorsa ama kaynakta duruyorsa, inceleyen kişi o yolun gerçekten etkin olup
olmadığını tekrar kontrol etmek zorunda kalır. Bu da hem test yükünü hem de denetim
süresini artırır.

## Kod türleri

### Kod türlerine kısa bakış

- Ölü kod: artık hiç çalışmayan yol.
- Gereksiz kod: aynı işi başka yerde yapan tekrar.
- Devre dışı bırakılmış kod: şartla kapatılmış eski davranış.

Bu ayrım önemlidir; çünkü her birinin kaldırılması, bırakılması veya gerekçelendirilmesi
farklı kanıt ister.

## Riskler

- yanlış anlaşılma,
- gereksiz bakım yükü,
- kapsam hedeflerini bozma,
- eski davranışın kazara yeniden etkinleşmesi.

## Yönetim yaklaşımı

Kapsanmayan kod bulunursa önce kaynağı anlaşılmalıdır. Ardından:

- gerçekten gerekli mi?
- başka yerde mi uygulanıyor?
- devre dışı bırakma gerekçesi yeterli mi?
- test ve inceleme ile doğrulandı mı?

Bu sorulara net yanıt verilemiyorsa kodun varlığı başlı başına bir risk işaretidir.

## Bu bölümden akılda kalması gerekenler

- Her satır gerçek amaç taşımayabilir.
- Ölü, gereksiz ve devre dışı kod farklı riskler doğurur.
- Kod temizliği, sertifikasyon kanıtını sadeleştirir.
