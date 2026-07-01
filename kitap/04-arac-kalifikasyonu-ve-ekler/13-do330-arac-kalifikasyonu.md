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
