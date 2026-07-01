---
title: "7. Yazılım Tasarımı"
sidebar_position: 4
---

# 7. Yazılım Tasarımı

Tasarım, gereksinimlerin uygulanabilir bir yazılım yapısına dönüştüğü katmandır.
Bu aşamada mimari yapı, bileşen ayrımı, arayüzler ve hata davranışları netleşir.

İyi tasarım, kodun yalnızca çalışmasını değil, okunmasını, doğrulanmasını ve bakımının
yapılmasını da kolaylaştırır. Kritik nokta, tasarım kararlarının gereksinimlerle açık
biçimde bağlanmasıdır.

## Tasarımın rolü

Tasarım, bir gereksinimin "nasıl" tarafını görünür kılar. Yazılım ekibi burada işlevleri
alt bileşenlere ayırır, veri akışını tanımlar, durum geçişlerini belirler ve hata
işleme kurallarını netleştirir.

Bu aşama, yalnızca mimari çizim üretmek için değil, doğrulama için uygun bir yapı kurmak
için vardır. İyi tasarım, test ekibinin hangi davranışı hangi koşul altında gözlemlemesi
gerektiğini anlamasını sağlar.

DO-178C gözüyle tasarım iki iş ürününden oluşur: **yazılım mimarisi** (bileşenler ve
aralarındaki ilişkiler) ve **düşük seviyeli gereksinimler** (kodun doğrudan
gerçekleştireceği davranış tanımları). İkisinin de yüksek seviyeli gereksinimlere
izlenebilir olması beklenir.

## Tasarım yaklaşımları

:::info Bu bölüm hazırlanıyor 🚧
Yapısal (fonksiyonel ayrıştırmaya dayalı) tasarım ile nesne yönelimli tasarımın
karşılaştırması, veri akışı/kontrol akışı görünümleri ve emniyet-kritik projelerde
yaklaşım seçiminin ölçütleri burada anlatılacak.
:::

## Tasarım kararları

Tasarımda tipik kararlar şunlardır:

- Fonksiyonları alt modüllere ayırmak.
- Hata durumları için ortak bir geri dönüş yolu belirlemek.
- Dış arayüzleri dar ve açık tutmak.
- Durum makineleriyle davranışı tanımlamak.
- Zamanlama ve öncelik etkilerini görünür kılmak.

Bu kararlar, kodun düzenini belirlediği kadar test stratejisini de belirler.

## Mimari düzey

Bir iyi tasarım, büyük resmi korurken ayrıntıyı da yönetir. Örneğin:

- veri toplama ayrı modülde olabilir,
- karar verme ayrı modülde olabilir,
- çıkış üretimi ve hata raporlama ayrılabilir.

Bu ayrım, hata yayılımını sınırlar ve değişikliklerin etkisini küçültür.

## Arayüzler ve durumlar

Arayüzler sadece veri taşımak için değil, sorumluluk sınırını çizmek için de vardır.
Net olmayan arayüzler, modüllerin birbirinin iç detaylarına bağımlı hale gelmesine yol
açar.

Durum geçişleri ise özellikle emniyet-kritik davranışta önemlidir. Çünkü sistemin hangi
koşulda normal, hangi koşulda degrade ve hangi koşulda güvenli modda olduğunu açıkça
göstermek gerekir.

## Hata davranışı

İyi tasarım, hata durumunu sonradan eklenmiş bir istisna gibi değil, beklenen bir
işletim hali gibi ele alır. Bu nedenle tasarımda şunlar açık olmalıdır:

- hata nasıl algılanacak,
- hangi bileşen bildirim alacak,
- güvenli duruma nasıl geçilecek,
- geçiş sırasında ne tür sınırlamalar olacak.

## İyi tasarımın nitelikleri

:::info Bu bölüm hazırlanıyor 🚧
Bağlaşımın (coupling) düşük, uyumun (cohesion) yüksek tutulması; kararlılık,
değiştirilebilirlik, doğrulanabilirlik gibi nitelikler ve bunların nasıl ölçüleceği
burada ele alınacak.
:::

## Tasarımın doğrulanması

:::info Bu bölüm hazırlanıyor 🚧
Tasarım gözden geçirmeleri, mimari ile düşük seviyeli gereksinimlerin ayrı ayrı
değerlendirilmesi ve tasarım-gereksinim izlenebilirlik kontrolleri burada
anlatılacak.
:::

## Bu bölümden akılda kalması gerekenler

- Tasarım, gereksinimi uygulanabilir yapıya çevirir; DO-178C gözüyle mimari ve düşük
  seviyeli gereksinimlerden oluşur.
- Arayüz ve hata davranışı tasarımın merkezindedir.
- İyi tasarım, doğrulamayı kolaylaştırır.
