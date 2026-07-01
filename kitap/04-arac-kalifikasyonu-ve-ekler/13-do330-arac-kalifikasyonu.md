---
title: "13. DO-330 ve Yazılım Aracı Kalifikasyonu"
sidebar_position: 1
---

# 13. DO-330 ve Yazılım Aracı Kalifikasyonu

Araç kalifikasyonu, kullanılan yazılım aracının üretilen kanıta zarar vermediğini
göstermeye odaklanır. Bir araç hata üretebiliyor ya da mevcut hatayı gizleyebiliyorsa,
bu risk ayrıca ele alınmalıdır.

DO-330, aracın kullanım amacına göre ne kadar güven gösterilmesi gerektiğini
çerçeveler. Böylece otomasyon, sertifikasyon kanıtını zayıflatmak yerine güçlendirir.

## Araç neden kalifiye edilir?

Yazılım araçları, üretimi hızlandırır; ancak yanlış yapılandırılmış bir araç sessizce
hatalı kanıt da üretebilir. Bu yüzden "araç var" demek yeterli değildir; aracın kullanım
amacı için yeterince güvenilir olduğunun gösterilmesi gerekir.

## Risk türleri

Araçlar açısından tipik riskler:

- yanlış çıktı üretmek,
- hatayı gizlemek,
- dönüşüm sırasında bilgi kaybetmek,
- test sonucunu yanlış yorumlamak,
- kullanıcıyı yanlış yönlendirmek.

Bu risklerin hangisinin önemli olduğu, aracın ne işe yaradığında bağlıdır.

## DO-330 yaklaşımı

DO-330, aracın sertifikasyon sürecindeki rolüne bakar:

- aracı sadece kolaylaştırıcı mı?
- aracı kanıt üretiminde kullanıyor muyuz?
- araç hatası yazılım ürününü etkileyebilir mi?

Bu sorular kalifikasyon derinliğini belirler.

## Kalifikasyon ihtiyacının ve seviyesinin belirlenmesi

:::info Bu bölüm hazırlanıyor 🚧
Bir aracın kalifikasyon gerektirip gerektirmediğine karar veren sorular (araç
çıktısı doğrulanıyor mu, araç bir süreci otomatikleştiriyor mu?) ve araç
kalifikasyon seviyelerinin (tool qualification level, TQL) belirlenmesi burada
anlatılacak.
:::

## DO-330 kalifikasyon süreci

:::info Bu bölüm hazırlanıyor 🚧
DO-330'un tanımladığı araç yaşam döngüsü: araç operasyonel gereksinimleri, araç
geliştirme ve doğrulama faaliyetleri, araç kalifikasyonu iş ürünleri ve araç
kullanıcısı ile araç geliştiricisi arasındaki sorumluluk paylaşımı burada
ayrıntılandırılacak.
:::

## Özel kalifikasyon konuları

:::info Bu bölüm hazırlanıyor 🚧
Araç belirlenimciliği, önceden kalifiye edilmiş araçların yeni projede yeniden
kullanımı ve ticari araçların kalifikasyon paketleri burada ele alınacak.
:::

## Araç örneği

Bir statik analiz aracı yanlış alarm üretiyorsa, bu aracın kullanım amacına göre ek
değerlendirme gerekir. Kritik soru şudur: araç, sertifikasyon kanıtını üretmekte mi,
yoksa sadece kolaylaştırmakta mı?

## Pratik yaklaşım

Araç seçerken şunlar değerlendirilmelidir:

- kullanım amacı,
- yanlış pozitif/negatif davranışı,
- arıza etkisi,
- insan kontrolü,
- çıktıların bağımsız doğrulanabilirliği.

## Bu bölümden akılda kalması gerekenler

- Araçların hatası kanıta yansıyabilir.
- Kalifikasyon, aracın rolüne göre yapılır.
- Otomasyon güvenliği artırmalı, riski gizlememelidir.
