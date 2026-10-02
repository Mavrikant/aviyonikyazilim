# Katkı rehberi

[aviyonikyazilim.com](https://aviyonikyazilim.com); DO-178C ekseninde emniyet-kritik aviyonik
yazılım üzerine Türkçe bir kitap, teknik yazılar, küratörlü bir kütüphane ve tarayıcıda
çalışan araçlardan oluşur. Hepsi bu depodan üretilir ve hepsi katkıya açıktır: bir yazım
hatasını düzeltmek de, yeni bir bölüm yazmak da katkıdır.

## Tarayıcıdan düzeltme (en kısa yol)

Git bilmeniz ya da bilgisayarınıza bir şey kurmanız gerekmez; ücretsiz bir GitHub hesabı
yeterlidir.

1. Sitede düzeltmek istediğiniz kitap ya da blog sayfasını açın.
2. Sayfanın en altındaki **“Bu sayfayı düzenle”** bağlantısına tıklayın. GitHub dosyayı web
   düzenleyicisinde açar; gerekirse depoyu hesabınıza kopyalamayı (fork) önerir, onaylamanız
   yeterlidir.
3. Değişikliğinizi yapın, **“Commit changes…”** düğmesine basıp ne değiştirdiğinizi kısaca
   yazın ve **“Propose changes”** ile onaylayın.
4. Açılan ekranda **“Create pull request”** ile değişiklik önerinizi (pull request) gönderin.
5. Öneriniz gözden geçirilir; uygunsa `main` dalına alınır ve site birkaç dakika içinde
   kendiliğinden güncellenir.

## Konu açmak (issue)

Bir hatayı kendiniz düzeltmek istemiyorsanız ya da bir konunun eksik olduğunu
düşünüyorsanız [yeni bir konu açın](https://github.com/Mavrikant/aviyonikyazilim/issues/new/choose).
İki hazır form var:

- **Hata bildirimi:** yazım hatası, teknik olarak yanlış bilgi, kırık bağlantı ya da
  görüntüleme sorunu.
- **Konu ya da içerik önerisi:** kitapta ya da blogda açıklanmasını istediğiniz bir başlık.

## GitHub kullanmıyorsanız

Düzeltme ve önerilerinizi **serdar@karaman.dev** adresine e-postayla gönderebilirsiniz.
Kütüphane için kitap, site için araç (simülatör) önerileri de bu adresten alınır.

## Yerelde çalışmak

Node.js 22 veya üzeri gerekir; önerilen sürüm `.nvmrc` dosyasındadır.

```bash
npm ci           # bağımlılıkları kur
npm start        # geliştirme sunucusu (http://localhost:3000)
npm run build    # üretim derlemesi: uyarı ya da hata vermeden geçmeli
```

Derleme yapılandırması katıdır: kırık bağlantı ya da çapa, `blog/tags.yml` içinde
tanımlanmamış etiket ve `<!-- truncate -->` işareti olmayan blog yazısı derlemeyi durdurur.

## İçerik kuralları (özet)

- Tüm içerik **Türkçedir**. Teknik bir terim ilk geçtiğinde İngilizcesi parantez içinde
  verilir: “yapısal kapsam analizi (structural coverage analysis)”.
- İçerik **özgündür**: hiçbir kitaptan ya da standarttan (DO-178C dahil) birebir çeviri ya da
  alıntı yapılmaz; kavramlar kendi cümlelerinizle anlatılır.
- Diyagramlar **Mermaid** ile metin olarak yazılır; kod örnekleri ağırlıklı olarak **C**
  dilindedir.
- Görseller depoya indirilir (`static/img/...`); harici görsel bağlantısı kullanılmaz.
- Dosya ve klasör adları ASCII karakterlerden oluşur (`giris`, `dogrulama`).

Terminoloji sözlüğü, klasör yapısı ve ayrıntılı kurallar [CLAUDE.md](CLAUDE.md)
dosyasındadır; depoda çalışan yapay zekâ oturumları da aynı rehberi izler.

## Lisans

Gönderdiğiniz katkılar, sitenin geri kalanı gibi
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.tr) lisansıyla yayımlanır.
