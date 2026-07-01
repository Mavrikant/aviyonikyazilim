---
title: "18. Sahada Yüklenebilir Yazılım"
sidebar_position: 2
---

# 18. Sahada Yüklenebilir Yazılım

Sahada yüklenebilir yazılım, sistemin kullanım sırasında güncellenmesini sağlar.
Ancak bu esneklik, bütünlük, uyumluluk ve geri dönüş planı gereksinimlerini de
beraberinde getirir.

Bu bölüm, güncelleme paketlerinin nasıl kontrol edildiğini ve yükleme sonrası
sistemin güvenli durumda kalmasının nasıl gösterildiğini açıklar.

## Sahada yükleme ne demektir?

Sahada yüklenebilir yazılım, bakım veya operasyon aşamasında yeni bir sürümün sisteme
aktarılmasıdır. Bu süreçte yalnızca paket içeriği değil, yükleme koşulları, kimlik
doğrulama ve geri dönüş stratejisi de önemlidir.

## Ana riskler

- yanlış paketin yüklenmesi,
- uyumsuz sürüm çifti,
- kurulum sırasında güç kesilmesi,
- bütünlüğü bozuk dosya,
- geri dönüş planının eksik olması.

Bu riskler, yalnızca kurulum anını değil, uçuş sonrası davranışı da etkileyebilir.

## Kontrol noktaları

Bir yükleme akışında genellikle şu kontroller vardır:

1. paket kimlik doğrulaması,
2. sürüm ve platform uyumu,
3. bütünlük kontrolü,
4. yükleme sonrasında doğrulama,
5. gerektiğinde eski sürüme dönüş.

### Yükleme örneği

Bir yazılım paketi önce kimlik doğrulamasından geçer, sonra uygun sürümle eşleştiği
doğrulanır, en son kurulumdan sonra bütünlük testi yapılır.

## Güvenli durum

Sahada yükleme sırasında sistemin güvenli durumda kalması gerekir. Bu nedenle yükleme
yarıda kalırsa ne olacağı, hangi modun etkin olacağı ve operasyona nasıl geri dönüleceği
önceden tanımlanmalıdır.

## Bu bölümden akılda kalması gerekenler

- Sahada yükleme, operasyonel esneklik sağlar ama risk de taşır.
- Paket bütünlüğü ve sürüm uyumu kritik kontrol noktalarıdır.
- Geri dönüş planı olmadan güncelleme güvenli sayılmaz.
