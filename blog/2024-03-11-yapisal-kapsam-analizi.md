---
title: "Yapısal kapsam analizi (structural coverage analysis)"
slug: yapisal-kapsam-analizi
authors: [serdar]
tags: [sca, yapisal-kapsam-analizi, structural-coverage-analysis]
---

![](/img/blog/yapisal-kapsam-analizi/gorsel-1.jpg)

Yapısal kapsam analizi (structural coverage analysis) ya da bilindik kisa adiyla **SCA**'yi incelemeden once yapisal programlamanin ne oldugunu tekrar hatirlayalim.  

Bu yazıyı okurken, [Yazılım Doğrulama](pathname:///kitap/do178c-ile-gelistirme/yazilim-dogrulama) bölümündeki kapsam yaklaşımı ve [Kapsanmayan Kodlar](pathname:///kitap/ozel-konular/kapsanmayan-kodlar) bölümündeki kod türleriyle birlikte düşünmek faydalıdır.

<!-- truncate -->

## Yapısal Programlama (Structured Programming) nedir?

Yapısal programlama, 1960'larda, bilgisayar biliminde programların daha anlaşılır, daha etkili ve hata yapma olasılığı daha düşük bir şekilde yazılabilmesi için geliştirilen bir programlama paradigmasıdır. Yapısal programlama, büyük ve karmaşık yazılım sistemlerinin geliştirilmesinde önemli bir dönüm noktası olmuştur. Bu yaklaşımın temelleri, Edsger W. Dijkstra'nın 1968'de yayınladığı "Go To Statement Considered Harmful" (Goto Deyimi Zararlıdır)\[1\] başlıklı makalesiyle atılmıştır. Dijkstra, bu makalesinde, program akışının kontrolünü sağlamak için "goto" deyiminin kullanımına karşı çıkarak daha düzenli ve modüler programlama tekniklerinin benimsenmesi gerektiğini savunmuştur.

Yapısal programlama, programları anlaşılır bir şekilde modüllere ayırma, tekrar kullanılabilir kod blokları(fonksiyonlar) oluşturma ve program akışını kontrol etmek için sıralı, seçim (if/else) ve yineleme (döngüler) yapılarını kullanma prensiplerine dayanır. Bu yaklaşım, programların daha kolay anlaşılır, test edilir ve bakımı yapılır hale gelmesine yardımcı olmuştur.

## Yapısal kapsama analizi (structural coverage analysis) nedir?

Yapısal kapsama analizi, özellikle havacılık ve uzay mühendisliğinde, bir yazılımın test sürecinde kullanılan bir tekniktir. Bu teknik, yazılımın test edilmesi sırasında kodun hangi bölümlerinin çalıştırıldığını ve hangi bölümlerinin çalıştırılmadığını belirlemek için kullanılır. Yapısal kapsam analizi, yazılımın farklı bölümlerinin yeterince test edilip edilmediğini kontrol etmek amacıyla kullanılan bir dizi metriği içerir. Bu analiz, yazılımın güvenilirliğini ve kalitesini artırmak için önemlidir.

Havacılık ve uzay endüstrisinde, yapısal kapsam analizi özellikle kritik öneme sahiptir çünkü bu alanlarda kullanılan sistemlerin yüksek güvenilirlik ve güvenlik standartlarına uygun olması gerekir. Bu nedenle, yazılımın her bir satırının, şartının veya karar noktasının test edilmesi gerekebilir.

Yapısal kapsam analizinin temel türleri şunlardır:

1.  **Satır Kapsama (Statement Coverage):** Yazılımın her bir satırının en az bir kez çalıştırılıp çalıştırılmadığını kontrol eder. Bu, en temel kapsam analizi türüdür.
2.  **Karar Kapsama (Decision Coverage):** Yazılım içerisindeki her bir karar noktasının (if-else blokları gibi) tüm olası çıktılarının test edilip edilmediğini kontrol eder.
3.  **Kosul Kapsama (Condition Coverage):** Karar noktalarındaki her bir kosulun tüm olası değerlerinin test edilip edilmediğini kontrol eder.
4.  **Kosul/Karar Kapsama (Condition/Decision Coverage):** Hem karar kapsamını hem de kosul kapsamını bir araya getirerek, karar noktalarının ve içerdikleri kosuların tüm olası kombinasyonlarının test edilmesini sağlar.
5.  **Degistirilmis Kosul/Karar Kapsama (Modified Condition/Decision Coverage, MC/DC): **MC/DC, belirli bir kararın sonucu üzerinde her bir koşulun bağımsız etkisini doğrulamayı amaçlar. Bu, hem her giriş ve çıkış noktasının en az bir kez çağrıldığından hem de programdaki bir karardaki her koşulun en az bir kez tüm olası sonuçları aldığından emin olmayı içerir. Daha da önemlisi, her bir koşulun, diğer tüm olası koşullar sabit tutulurken, karar sonucunu bağımsız olarak etkilediği gösterilir. n+1 test senaryosu gerektirir.
6.  **Coklu kosul kapsama:** Olasi butun kosul kombinasyonlarinin test edildigini dogrular. Gerekli senaryo sayisi: 2n

## Basit bir örnek

```c
if ((motor_calisti && yakit_basinci) || yedek_mod) {
  ucusa_devam_et();
} else {
  guvenli_kapat();
}
```

Bu küçük örnekte:

- **Satır kapsama**, her iki dalın da en az bir kez çalıştırılmasını ister.
- **Karar kapsama**, hem `true` hem `false` sonucunun görülmesini ister.
- **Koşul kapsama**, `motor_calisti`, `yakit_basinci` ve `yedek_mod` koşullarının
  değerlerini tek tek değiştirerek etkisini ölçer.
- **MC/DC**, her koşulun karar sonucunu bağımsız biçimde etkilediğini gösteren en az
  sayıda testi arar.

Bu nedenle yapısal kapsam analizi, "kaç satır çalıştı" sorusundan daha fazlasını sorar;
mantığın gerçekten kontrol edildiğini kanıtlamaya yaklaşır.

| Kapsama türü | Kısa amaç | Ne zaman güçlüdür? |
|---|---|---|
| Satır kapsama | Kodun çalışıp çalışmadığını görmek | Temel yürütme kontrolü gerektiğinde |
| Karar kapsama | Her karar dalını görmek | `if/else` akışları kontrol edilirken |
| Koşul kapsama | Her koşulun değerlerini görmek | Karmaşık karar ifadeleri test edilirken |
| Koşul/karar kapsama | Koşullar ve kararların birleşik kontrolü | Orta düzey mantık doğrulamasında |
| MC/DC | Koşulların bağımsız etkisini göstermek | Emniyet-kritik sertifikasyon kanıtında |

Uzerinde calsitiginiz projenin DAL seviyesine gore DO178C Table A7'den saglamaniz gereken SCA tipini kontrol edebirlisiniz. DAL A seviyesi aviyonik yazilimlar icin her 3 tip kapasama analizi de bagimsiz ekip tarafindan yapilmasi gerekiyor. 

Yapisal kapsama analizinin yazilim dogrulamasina sagladiklari:

1.  **Tüm kodun en az bir kez çalıştırıldığını garanti eder:** Yapısal kapsam, test sırasında kod tabanının her satırının çalıştırılmasını gerektirerek, kodun hiçbir bölümünün test edilmemiş bırakılmadığını sağlar. Bu, her kod satırının sistem operasyonunun güvenliğini etkileyebileceği güvenlik kritik sistemlerde hayati öneme sahiptir.
2.  **İstenmeyen işlevselliği ve test edilmemiş işlevselliği bulur:** Kod tabanının kapsamlı bir şekilde çalıştırılmasıyla, testçiler başlangıçta amaçlanmayan veya yetersiz test nedeniyle önceden tanımlanamayan işlevselliği ortaya çıkarabilir. Bu, farklı operasyonel senaryolar altında sistem davranışı ile ilgili beklenmeyen riskleri azaltmaya yardımcı olur.
3.  **Ölü kodu veya gereksiz kodu tanımlar:** Ölü kod, herhangi bir operasyonel senaryoda çalıştırılmayan kod segmentlerini ifade eder. Bu tür kodu tanımlamak önemlidir çünkü yazılımın verimliliğini düşürebilir, boyutunu gereksiz yere artırabilir ve tespit edilmemiş güvenlik açıklarına yol açabilir.
4.  **Devre dışı bırakılan kodun gerçekten devre dışı bırakıldığını doğrular:** Bazen, çeşitli nedenlerle kod devre dışı bırakılır ancak kaldırılmaz. Yapısal kapsam, bu kodun mevcut yazılım yapılandırmasında çalıştırılamayacağını doğrulayarak, varlığının sistemin operasyonunu etkilemediğinden emin olmamıza yardımcı olur.
5.  **Test için minimal kombinasyon setini tanımlar (yani, exhaustive test gerektirmez):** Yapısal kapsam, tüm kodu kapsayan ancak kaynak ve zaman kısıtlamaları nedeniyle tüm olası girdi kombinasyonlarının tüketici testinin pratik olmadığı karmaşık sistemlerde, yeterli ancak minimal bir test vakası seti belirlemeye yardımcı olur.
6.  **Yanlış mantığı belirler:** Kodun her parçasının çalıştırılmasını sağlayarak, testçiler yazılımın çeşitli koşullar ve girdiler altında beklenen gibi davrandığını doğrulayabilir. Bu, yazılımın mantıksal doğruluğunu kontrol etmeyi içerir.
7.  **Test çabasının ne kadar tamamlandigi hakkinda ongoru saglar:** Yapısal kapsam, yazılımın ne kadar kapsamlı test edildiğinin nicel bir ölçüsünü sağlar. Önemli bir metrik olmasına rağmen, *%100 yapısal kapsama ulaşmak hata olmadığını garanti etmez.* Ayrıca, yazılımın anormal veya beklenmedik koşullar altındaki davranışını tam olarak ele almaz, bu tipik olarak sağlamlık testi ile değerlendirilir.

Havacılık ve uzay alanında, başarısızlığın maliyeti olağanüstü yüksek olduğunda, yazılım doğrulama ve onaylama sürecinin bir parçası olarak yapısal kapsamın kullanılması vazgeçilmezdir. Uçuş operasyonlarını kontrol eden veya destekleyen yazılımın güvenilir, güvenli olduğunu ve tüm beklenen koşullar altında amaçlandığı gibi performans gösterdiğinden emin olunur.

## Kaynakca

> \[1\]  [Edsger Dijkstra](https://en.wikipedia.org/wiki/Edsger_Dijkstra) (March 1968). ["Go To Statement Considered Harmful"](https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf) (PDF). Communications of the ACM. 11 (3): 147–148. 

> \[2\] **A Practical Tutorial on Modified Condition/ Decision Coverage**, <https://shemesh.larc.nasa.gov/fm/papers/Hayhurst-2001-tm210876-MCDC.pdf>  

> \[3\] **Comments on Modified Condition/Decision Coverage for Software Testing**, <https://doi.org/10.1109/aero.2001.931302> 
> \[4\] John Joseph Chilenski and Steven P. Miller, "**Applicability of Modified Condition/Decision Coverage to Software Testing**", Software Engineering Journal, September 1994. <https://doi.org/10.1049/sej.1994.0025> 

> \[5\] **A PRACTICAL APPROACH TO MODIFIED CONDITION/DECISION COVERAGE,** <https://ntrs.nasa.gov/api/citations/20040086014/downloads/20040086014.pdf>
