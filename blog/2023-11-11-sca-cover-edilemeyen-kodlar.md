---
title: "SCA'da cover edilemeyen kodlar: Ölü, Gereksiz ve Devre Dışı Bırakılmış Kodlar"
slug: sca-cover-edilemeyen-kodlar
authors: [serdar]
tags: [do-178c, olu-kod, gereksiz-kod, devre-disi-birakilmis-kod]
---

!["yazılım geliştirmede 'ölü kod' konsepti" konusunu mizahi bir şekilde tasvir eden resim. Bu tasvir, bilgisayar kodlarından oluşan mezarlık sahnesi, farklı yazılarla süslenmiş mezar taşları ve hayaletimsi kod figürleri içermekte. Sahne aydınlık ve çizgi film tarzında tasarlanmış.](/img/blog/sca-cover-edilemeyen-kodlar/gorsel-1.png "Olu kodlar mezarligi")

Yapısal kapsama analizi(Structural Coverage Analysis - SCA) , yazılım test süreçlerinde hayati role sahip bir yöntemdir. Bu analiz, yazılımın kod kapsamını değerlendirerek hangi kod bölümlerinin testler sırasında çalıştırıldığını veya çalıştırılmadığını belirlemeye yardımcı olur. Ana hedef, yazılımın her bir satırının (statement), dalının (branch) ve koşulunun (condition) uygun şekilde test edilip edilmediğini kontrol etmektir.

<!-- truncate -->

Kapsama verisi toplama sürecinde, yapısal kapsama analiz aracı önemli bir rol oynar. İlk olarak, bu araçlar kaynak koda enstrümantasyon adı verilen ek kod parçalarını ekler. Bu ekleme, gereksinim tabanlı testler sırasında hangi kod parçalarının kullanıldığını takip etmek için yapılır. Test sırasında toplanan kapsama verisi, daha sonra yapısal kapsama analiz araçları tarafından incelenir. Bu inceleme sonucunda, testlerde kullanılmayan yani 'kapsanmamış' kod satırları tespit edilir ve bir kapsama analizi raporu oluşturulur.

Bu analiz sonucunda, bazı kodların kapsanmadığı görülebilir. Aşağıdaki yazılimda, bu tür kodlara ait bazı örnekler sunulmuştur. Bu kodlar üç kategoriye ayrılabilir.

[TABLE]

## Ölü Kod (Dead Code)

Ölü kod, yazılımın normal akışı içinde hiçbir zaman çalıştırılmayan kod bölümleridir. Genellikle yazılımın eski sürümlerinden kalan, artık kullanılmayan veya yanlış tanimlanmis koşullu blokları içeren kodlardır. Yapısal kapsama analizinde, ölü kod testler sırasında hiç çalıştırılmaz, çünkü bu kodun çalışması için gerekli koşullar asla sağlanamaz. Yapısal kapsama analiziyle bu kodlar kolayca tespit edilir ve kaldırılır. Ayrıca, çeşitli derleyiciler, statik kod analiz araçları \[3\] ve IDE'ler bu tür kodlama hatalarını belirleyerek uyarıda bulunur.

GNU C Compiler (GCC) için, aşağıda belirtilen derleyici parametrelerini projenize ekleyerek geliştirme aşamasında ölü kodları tespit edebilirsiniz\[2\]:

 -Wunreachable-code

## Gereksiz Kod (Extraneous Code)

Gereksiz kod, yazılımın işlevselliği için zorunlu olmayan, ancak çalıştırılabilir durumda olan kod parçalarıdır. Bu tür kod, gereksiz hesaplamalar, kullanılmayan değişkenler veya fonksiyonlar gibi unsurları içerebilir. Yapısal kapsama analizinde, gereksiz kod testler sırasında çalıştırılabilir, ancak bu çalıştırmanın programın genel işleyişi veya çıktıları üzerinde bir etkisi olmayabilir.

GNU C Compiler (GCC) için, aşağıdaki derleyici parametrelerini kullanarak bazı gereksiz kodları tespit etmek mümkündür\[2\]:

-Wunused-variable  -Wunused-value

## Devre Dışı Bırakılmış Kod (Deactivated Code)

Devre dışı bırakılmış kod, yazılım geliştirme sürecinde bilinçli bir şekilde planlanmış ve tasarlanmış koddur. Bu, yazılımın belirli bir konfigürasyonda aktif olmayan ancak başka bir konfigürasyonda kullanılabilecek kod parçalarını ifade eder. Örneğin, hem askeri hem de sivil konfigürasyona sahip bir helikopterin yazılımında, sadece sivil konfigürasyonda gerçekleştirilen testler sırasında askeri konfigürasyona ait kod satırları aktif olmayacaktır. Bu tür kod, yapısal kapsama analizinde genellikle kapsanmayan kod olarak görünebilir. Ancak, extraneous (gereksiz) veya ölü kodun aksine, devre dışı bırakılmış kod tasarım aşamasında öngörülen ve amaçlanan bir özelliktir. Bu kodlar için gereksinimler belirlenmiş, izlenebilirligi saglanmis ve testlerle işlevselliği doğrulanmıştır.

Devre dışı bırakılmış kodun iki temel kategorisi bulunmaktadır:

1.  **Hiçbir Zaman Aktive Edilmeyecek Kod: **Bu kodlar genellikle yazılım geliştirme ve test süreçlerinde kullanılır ancak nihai ürün veya sistemde aktif olmazlar. Örneğin, hata ayıklama (debug) kodları bu kategoriye girer. Bu tür kodlar, yazılımın belirli bir parçasının sadece geliştirme aşamasında kullanılması ama üretim sürümünde devre dışı bırakılması gerektiğinde kullanılır.
    Bu kodlar genellikle ön işlemci komutları (preprocessor directives) kullanılarak kontrol edilir. Ön işlemci komutları, C veya C++ gibi dillerde yaygın olarak kullanılan \#ifdef, \#ifndef, \#endif gibi direktiflerdir. Bu direktifler, kodun belirli bölümlerinin yalnızca belirli koşullar altında derlenmesini sağlar. Örneğin, \#ifdef DEBUG ve \#endif arasına yazılan kodlar yalnızca DEBUG makrosu tanımlı olduğunda derlenir ve uygulamaya dahil edilir. Üretim sürümünde bu makro tanımlanmadığında, bu kod bloğu derlenmez ve son üründe yer almaz.
2.  **Bazı Konfigürasyonlarda Kullanılacak Kod:** Belirli konfigürasyonlarda kullanılan, ancak diğerlerinde devre dışı bırakılan kodlar. Cift konfigurasyona sahip helikopter orneginden ilerlersek. Uçuş sırasında, yazılım sivil modda ise, askeri uçuş moduna özgü özellikler devre dışı bırakılır. Bu, yazılımın çalışma zamanında (run-time) dinamik olarak gerçekleşir. Örneğin, bir konfigürasyon dosyası, buton veya input olarak alinan bir ayrik (discrete) pin yazılımın hangi modda çalıştığını belirler ve buna göre askeri özellikleri devre dışı bırakır. Devre dışı bırakma mekanizmasının işlevselliği kanıtlanmalı, gereksinimleri ve testleri olmalıdır. Ayrıca, devre dışı bırakma yaklaşımı, aktif edilen yazılımın seviyesini desteklemelidir.

Devre dışı bırakılmış kodun yönetimi ve kontrolü için Plan Software Aspects of Certification (PSAC), Software Verification Plan (SVP) ve Software Development Plan (SDP) gibi belgelerde özel hususların ele alınması gerekir.

**PSAC'te; **Devre dışı bırakılmış kodun yazılım içindeki rolü, kullanım amacı ve hangi koşullar altında devre dışı kalacağı açıklanmalıdır. Bu kodun neden gerektiği ve yazılımın genel işlevselliği üzerindeki etkisi detaylandırılmalıdır.

**SDP'de;** Devre dışı bırakılmış kodun geliştirilmesinde kullanılacak yöntemler ve teknikler detaylandırılmalıdır.

**SVP'de;** Devre dışı bırakılmış kodun doğru şekilde işlediğinin doğrulanması için uygulanacak test stratejileri ve metodolojileri açıklanmalıdır.

## Kaynakça


1.  *Developing Safety-Critical Software: A Practical Guide for Aviation Software and DO-178C Compliance*, **Leanna Rierson**, Chapter 17 Noncovered Code (Dead, Extraneous, and Deactivated Code)
2.  [GCC, Options to Request or Suppress Warnings](https://gcc.gnu.org/onlinedocs/gcc-3.2/gcc/Warning-Options.html)
3.  [Carnegie Mellon University Software Engineering Institute, MSC12-C. Detect and remove code that has no effect or is never executed](https://wiki.sei.cmu.edu/confluence/display/c/MSC12-C.+Detect+and+remove+code+that+has+no+effect+or+is+never+executed)

## Ileri Okuma

1.  *Developing Safety-Critical Software: A Practical Guide for Aviation Software and DO-178C Compliance*, **Leanna Rierson**, 
2.  *Avionics Certification - Complete Guide to DO-178, DO-178C, DO-254*; **Vance Hilderman ve Tony Baghai **
