---
title: "SW SOI-2"
description: "SOI-2 geliştirme denetimi kontrol listesi: gereksinim, tasarım ve kodda izlenebilirlik, standart uyumu, gözden geçirme kayıtları ve sık görülen bulgular."
sidebar_position: 3
---

SOI-2, otoritenin geliştirme verisine ilk kez yakından baktığı denetimdir: gereksinim,
tasarım ve kod planlarda söylendiği gibi mi üretiliyor, standartlara uyuyor mu,
birbirine izlenebilir mi ve gözden geçirmeler gerçekten iş görüyor mu? Bu sayfa,
SOI-2 öncesinde ekibin kendi verisini sınamak için kullanabileceği bir kontrol
listesidir.

Katılım aşaması (Stage of Involvement, SOI) denetimlerinin genel mantığı
[12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
bölümünde anlatılır. Aşağıdaki maddeler bir otorite listesinin çevirisi değil, sahada
işe yarayan hazırlık sorularıdır; kapsam otoriteye ve yazılım seviyesine göre değişir.

:::tip[Örneklemeye hazırlanın]
SOI-2'de otorite veriyi baştan sona okumaz, örnekler. Tipik yöntem, rastgele seçilen
bir gereksinimin izini sistem gereksiniminden koda kadar aşağı, bir kod parçasının
izini de gereksinime kadar yukarı sürmektir. Bu iki yönlü izi araç üzerinde dakikalar
içinde gösteremiyorsanız, denetim o noktada uzar.
:::

## Ne zaman yapılır?

SOI-2'nin amacı süreci erken sınamaktır; bu yüzden geliştirmenin bitmesi beklenmez.
Beklenen, gereksinim, tasarım ve kodun temsil edici bir bölümünün üretilip gözden
geçirilmiş olmasıdır. Eşik otoriteye göre değişir: FAA'nın Order 8110.49'u tipik olarak
en az %50'yi anar, EASA'nın artık yürürlükte olmayan CM-SWCEH-002 notu en az %75'i
arıyordu. Projeniz için geçerli eşik, yazılım sertifikasyon planında (Plan for Software
Aspects of Certification, PSAC) otoriteyle kararlaştırılır. Tipik giriş kriterleri:

- [ ] SOI-1 bulguları kapatılmış ya da kapanış planında otoriteyle mutabık kalınmıştır.
- [ ] Yüksek seviyeli gereksinimlerin (high-level requirements) önemli bir bölümü,
      bunlara karşılık gelen tasarım ve kod üretilmiş ve gözden geçirilmiştir.
- [ ] Örnek alınabilecek uçtan uca en az birkaç işlev vardır (gereksinimden koda).
- [ ] İzlenebilirlik (traceability) verisi araç üzerinde güncel ve sorgulanabilir
      durumdadır.
- [ ] Kalite güvencesi, geliştirme sürecinde en az bir denetim yapmış ve kaydını
      tutmuştur.

## Geliştirme verisi: otoritenin baktığı noktalar

Aşağıdaki soruların hepsi her projede sorulmaz; yazılım seviyesi düştükçe aranan hedef
azalır. Özellikle Seviye D'de ağırlık yüksek seviyeli gereksinimlere ve çalıştırılabilir
nesne koduna (executable object code) kayar: düşük seviyeli gereksinimlerin ve kaynak
kodun ne geliştirilmesi ne de doğrulanması hedef olarak aranır; mimarinin geliştirilmesi
beklenir, ama üzerindeki doğrulama hedeflerinden yalnızca bölümleme bütünlüğünün teyidi
kalır. Projeniz için geçerli kapsamı
[4. DO-178C ve Destekleyici Dokümanlara Genel Bakış](../03-do178c-ile-gelistirme/04-do178c-genel-bakis.md)
bölümündeki seviye–hedef özetine ve PSAC'a göre belirleyin.

### Gereksinimler

- [ ] Yüksek seviyeli gereksinimler sistem gereksinimlerine, düşük seviyeli
      gereksinimler (low-level requirements) yüksek seviyeli gereksinimlere izlenebilir
      mi; izlenemeyenler türetilmiş olarak işaretli mi?
- [ ] Gereksinimler doğrulanabilir mi; her biri test ya da analizle "karşılandı /
      karşılanmadı" diye yanıtlanabilir mi?
- [ ] Türetilmiş gereksinimler (derived requirements), yüksek ya da düşük seviyeli
      olsun, gerekçelendirilmiş ve sistem süreçlerine (sistem emniyet değerlendirme
      süreci dahil) geri bildirilmiş mi?
- [ ] Yüksek seviyeli gereksinimler tasarım ayrıntısı (fonksiyon adı, değişken)
      içermiyor mu?
- [ ] Gereksinim standardına uyum gözden geçirmede kontrol edilmiş mi?

### Tasarım ve mimari

- [ ] Yazılım mimarisi (software architecture) bileşenleri, arayüzleri, veri ve kontrol
      akışını gösteriyor mu?
- [ ] Bölümleme ya da koruma mekanizması iddia ediliyorsa tasarımda nerede
      sağlandığı görünüyor mu?
- [ ] Düşük seviyeli gereksinimler, kodun gereksinim dışında karar vermesine gerek
      bırakmayacak kadar ayrıntılı mı?
- [ ] Tasarım standardındaki kısıtlara (karmaşıklık, kesme, dinamik bellek) uyulmuş mu?

### Kaynak kod ve entegrasyon

- [ ] Düşük seviyeli gereksinimlerin hepsi kaynak koda (source code) dönüştürülmüş ve
      iz verisi iki yönde kurulmuş mu; hiçbir gereksinime bağlanmayan, belgelenmemiş
      bir işlevi gerçekleştiren kod var mı?
- [ ] Kodlama standardına uyum araçla denetlenmiş, sapmalar gerekçelendirilmiş mi?
- [ ] Kod ile tasarım arasında fark var mı (tasarımda olmayan bir işlev, farklı bir
      arayüz)?
- [ ] Derleme seçenekleri ve araç sürümleri planlarda yazılanlarla aynı mı?
- [ ] Derleme ve bağlama betikleri konfigürasyon yönetimi altında mı; çalıştırılabilir
      nesne kodu bir geliştiricinin masasında değil, kayıtlı ortamda bu betiklerle mi
      üretiliyor?
- [ ] Derleyici ve bağlayıcı (linker) uyarıları ile bağlama haritası (link map) gözden
      geçirilmiş mi: açıklanmamış uyarı, yanlış adres, çakışan bellek bölgesi, eksik ya
      da beklenmeyen bileşen var mı?
- [ ] Parametre verisi öğesi (parameter data item, PDI) dosyaları, model ya da otomatik
      üretilen kod varsa izlenebilirlik ve doğrulama yaklaşımı planlarda anlatıldığı
      gibi mi uygulanıyor?

### Gözden geçirmeler

- [ ] Her gözden geçirme kaydında incelenen ürünün sürümü, katılımcılar, kullanılan
      kontrol listesi, bulgular ve kapanış var mı?
- [ ] Bağımsızlığın arandığı hedeflerde (yazılım seviyesine göre değişir) gözden
      geçiren yazardan bağımsız mı ve bu, kayıttan okunabiliyor mu?
- [ ] Bulgular gerçekten kapatılmış ve kapanış doğrulanmış mı?
- [ ] Kontrol listeleri madde madde doldurulmuş mu, yoksa tek bir "uygundur" ile mi
      geçilmiş?

### Süreçler

- [ ] Geliştirme verisi temel çizgiye (baseline) alınıyor ve değişiklikler kontrol
      altında yapılıyor mu?
- [ ] Problem raporları (problem reports) planda tanımlandığı gibi açılıyor,
      sınıflandırılıyor ve izleniyor mu?
- [ ] Plandan yapılan sapmalar kayıt altında mı; gerekiyorsa planlar güncellenmiş mi?
- [ ] Kalite güvencesi, planlara uyumu denetlemiş ve uygunsuzlukları kayda geçirmiş mi?

## İz sürme alıştırması

Denetimden önce aşağıdaki zinciri birkaç rastgele gereksinim için aşağı doğru, birkaç
rastgele kod parçası için de yukarı doğru kendiniz yürütün. Düz oklar izin iki yönde
de sürülebilmesi gerektiğini, kesikli oklar her halkada açıp gösterebilmeniz gereken
kaydı anlatır; yolda türetilmiş bir gereksinime rastlarsanız gerekçesini ve sistem
süreçlerine iletildiğinin kaydını da açın. Zincirin herhangi bir halkasında
takılıyorsanız, otorite de aynı yerde takılacaktır.

```mermaid
flowchart LR
    SYS[Sistem gereksinimi] <--> HLR[Yüksek seviyeli gereksinim]
    HLR <--> LLR[Düşük seviyeli gereksinim]
    LLR <--> KOD[Kaynak kod]
    HLR -.->|"türetilmişse"| SED[Sistem süreçleri ve emniyet değerlendirmesi]
    LLR -.->|"türetilmişse"| SED
    HLR -.-> GG1[Gözden geçirme kaydı]
    LLR -.-> GG2[Gözden geçirme kaydı]
    KOD -.-> GG3[Gözden geçirme kaydı]
    KOD -.-> KY[Konfigürasyon kaydı ve sürüm]
```

## Hazırlanacak veri paketi

| Veri | Neden istenir |
|---|---|
| Yüksek ve düşük seviyeli gereksinimler | Gereksinim kalitesi ve standart uyumu |
| Mimari ve tasarım verisi | Gereksinimlerin nasıl gerçekleştirildiği |
| Kaynak kod ve kodlama standardı denetim çıktıları | Kodun standarda ve tasarıma uyumu |
| Derleme ve bağlama verisi (betikler, seçenekler, bağlama haritası, uyarı kayıtları) | Çalıştırılabilir nesne kodunun kayıtlı ortamda, yinelenebilir biçimde üretildiği |
| İzlenebilirlik verisi | İki yönlü iz sürme |
| Gözden geçirme kayıtları ve kontrol listeleri | Doğrulamanın geliştirmeyle birlikte yürüdüğünün kanıtı |
| Problem raporları ve değişiklik kayıtları | Sorunların sistematik yönetildiği |
| Temel çizgi ve konfigürasyon kayıtları | İncelenen verinin hangi sürüme ait olduğu |
| Kalite güvencesi denetim kayıtları | Süreç uyumunun bağımsız olarak izlendiği |

## Sık görülen bulgular

| Bulgu | Tipik nedeni | Önlem |
|---|---|---|
| Gözden geçirme kayıtlarında hiç bulgu yok | Gözden geçirmenin onay formalitesine dönüşmesi | Bulgusuz kayıtları kalite güvencesinin örneklemesi; kontrol listesinin madde madde doldurulması |
| İzlenebilirlik toplu bağlantılarla kurulmuş ("bu modül şu 40 gereksinimi karşılar") | İzin sonradan, toplu olarak eklenmesi | İzi gereksinim yazılırken ve kod değişirken güncellemek |
| Türetilmiş gereksinimler sistem süreçlerine ve emniyet değerlendirmesine iletilmemiş | Yazılım ve sistem ekipleri arasında geri besleme kanalı olmaması | Türetilmiş gereksinimler için ayrı bir onay adımı tanımlamak |
| Kod tasarımdan farklı | Kodun değiştirilip tasarımın güncellenmemesi | Değişiklik etki analizinde (change impact analysis) tasarımı zorunlu kalem yapmak |
| Problem raporu yerine e-posta ya da sözlü düzeltme | Raporlama sürecinin ağır görülmesi | Hafif ama tek bir problem raporu akışı; kalite güvencesinin bunu denetlemesi |
| Plan dışı araç ya da derleme seçeneği kullanılmış | Planın güncellenmeden pratiğin değişmesi | Sapmayı kayda almak, planı yeni sürümle yayımlamak |

## Denetimden sonra

SOI-2 bulguları çoğu zaman tekil hatalara değil, süreç boşluklarına işaret eder.
Düzeltici faaliyet yazılırken "bu kayıt düzeltildi" demek yetmez; aynı hatanın başka
verilerde de olup olmadığı taranmalı ve süreç (kontrol listesi, araç ayarı, eğitim)
buna göre değiştirilmelidir. Bulgular kapatılmadan, ya da en azından kapanış planında
otoriteyle mutabık kalınmadan SOI-3'e girmek, doğrulama kanıtının dayandığı verinin
sorgulanması demektir.

## İlgili bölümler

- [6. Yazılım Gereksinimleri](../03-do178c-ile-gelistirme/06-yazilim-gereksinimleri.md)
- [7. Yazılım Tasarımı](../03-do178c-ile-gelistirme/07-yazilim-tasarimi.md)
- [8. Yazılım Gerçekleştirme: Kodlama ve Entegrasyon](../03-do178c-ile-gelistirme/08-yazilim-gerceklestirme-kodlama-entegrasyon.md)
- [9. Yazılım Doğrulama](../03-do178c-ile-gelistirme/09-yazilim-dogrulama.md)
- [10. Yazılım Konfigürasyon Yönetimi](../03-do178c-ile-gelistirme/10-yazilim-konfigurasyon-yonetimi.md)
- [11. Yazılım Kalite Güvencesi](../03-do178c-ile-gelistirme/11-yazilim-kalite-guvencesi.md)
- [12. Sertifikasyon İrtibatı](../03-do178c-ile-gelistirme/12-sertifikasyon-irtibati.md)
- Önceki aşama: [SW SOI-1](soi-1.md) · Sonraki aşama: [SW SOI-3](soi-3.md)
