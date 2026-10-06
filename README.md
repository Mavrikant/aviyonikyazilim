# aviyonikyazilim

[aviyonikyazilim.com](https://aviyonikyazilim.com/) sitesinin kaynak deposu.
Türkçe aviyonik yazılım / test / sertifikasyon içerikleri: **blog yazıları** ve DO-178C
konulu bir **kitap**. [Docusaurus 3](https://docusaurus.io) ile üretilir ve GitHub Pages
üzerinde yayınlanır.

## Geliştirme

Node.js 22 veya üzeri gerekir; önerilen ve CI'da kullanılan sürüm `.nvmrc` dosyasındadır
(`nvm use` ile seçilebilir).

```bash
npm install       # bağımlılıkları yükle
npm start         # geliştirme sunucusu (http://localhost:3000)
npm run build     # üretim derlemesi (uyarısız geçmeli)
npm run pdf       # build çıktısından kitabın PDF'ini üret (build/ altına)
npm run serve     # build çıktısını yerelde sun
```

`npm run pdf` başsız bir Chromium ister: Playwright'inki kurulu değilse
(`npx playwright-core install chromium-headless-shell`) makinedeki Google Chrome'u
kullanır. `npm start` PDF üretmez; ana sayfadaki "PDF indir" düğmesi yalnızca
`npm run build && npm run pdf && npm run serve` sonrasında çalışır.

Katkı yolları için [CONTRIBUTING.md](CONTRIBUTING.md), ayrıntılı içerik kuralları ve
terminoloji sözlüğü için [CLAUDE.md](CLAUDE.md) dosyasına bakınız.

## Dağıtım

`main` dalına yapılan her push, [GitHub Actions workflow'u](.github/workflows/deploy.yml)
ile otomatik olarak siteyi derler, kitabın PDF sürümünü üretir
([scripts/kitap-pdf.mjs](scripts/kitap-pdf.mjs)) ve ikisini birlikte GitHub Pages'e
yayınlar. Elle müdahale gerekmez.

Diğer otomasyonlar:

- **PR derleme denetimi:** [pr-build.yml](.github/workflows/pr-build.yml) `main`'e açılan
  her PR'da siteyi derler ve kitap PDF'ini üretir; kırık iç bağlantı, kırık çapa, tanımsız
  etiket ya da PDF üretimini bozan bir değişiklik birleştirmeden önce PR üzerinde görünür.
  Dağıtım yapmaz.
- **Dış bağlantı denetimi:** [link-check.yml](.github/workflows/link-check.yml) her ayın
  1'inde içerikteki dış bağlantıları [lychee](https://lychee.cli.rs/) ile denetler;
  kırık bağlantı varsa "Kırık dış bağlantılar" başlıklı bir issue açar ya da açık olana
  yorum ekler. *Actions* sekmesinden elle de çalıştırılabilir. Ayarlar:
  [.github/lychee.toml](.github/lychee.toml).
- **Bağımlılık güncellemeleri:** [Dependabot](.github/dependabot.yml) her pazartesi npm
  paketleri ve GitHub Actions için gruplanmış PR'lar açar. Docusaurus PR'ları
  birleştirilmeden önce `npm run build` uyarısız geçmeli ve eject edilmiş tema dosyaları
  upstream ile karşılaştırılmalıdır (bkz. [SEO.md](SEO.md), "Bilinen sınırlar").

## Manuel kurulum adımları (bir kez yapılır)

Aşağıdaki adımlar depo sahibi tarafından **elle** yapılmalıdır.

### 1. GitHub Pages'i etkinleştir

Repo ayarları → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### 2. Özel alan adını ve HTTPS'i ayarla

Docusaurus yapılandırmasındaki `url` ve `baseUrl` değerleri
`https://aviyonikyazilim.com/` yayınına (alan adı kökü, `baseUrl: '/'`) göre ayarlanmıştır.

- **Settings → Pages → Custom domain:** `aviyonikyazilim.com`
- DNS: apex için GitHub Pages `A` (185.199.108–111.153) ve `AAAA` kayıtları,
  `www` için `mavrikant.github.io` hedefli `CNAME`.
- Sertifika üretildikten sonra **Enforce HTTPS** işaretlenir.

Alan adı değişirse `url`/`baseUrl`, `static/CNAME` ve `static/` altındaki redirect
stub'ları birlikte güncellenmelidir; aksi hâlde CSS/JS dosyaları 404 verir ve site
stilsiz/bozuk açılır. `docusaurus.config.ts` içinde `baseUrlIssueBanner: false`
olduğundan Docusaurus'un "baseUrl" hata kutusu gösterilmez; hata ayıklarken bu seçeneği
geçici olarak `true` yapın.

### 3. Google Search Console

- [Search Console](https://search.google.com/search-console)'da `aviyonikyazilim.com`
  **Alan adı** mülkü olarak eklenir; istenen `TXT` kaydı DNS'e girilerek doğrulanır.
- **Site haritaları** bölümünden `https://aviyonikyazilim.com/sitemap.xml` gönderilir
  (`robots.txt` de bu adresi gösterir).
- Bing Webmaster Tools, Search Console'dan içe aktarılarak eklenebilir.
- İsteğe bağlı olarak **Settings → Secrets and variables → Actions → Variables** altına
  `GA_MEASUREMENT_ID` (Google Analytics 4) ve `GOOGLE_SITE_VERIFICATION` (HTML etiketi
  doğrulaması) eklenebilir; tanımlı değilse build'e hiçbir şey eklenmez.
- Arama motoru çalışmasının tamamı, elle yapılacaklar ve backlink planı: [SEO.md](SEO.md).

### 4. (İsteğe bağlı) Uzun önbellek süresi

GitHub Pages her dosyayı `Cache-Control: max-age=600` (10 dakika) ile sunar ve bu
depodan değiştirilemez; Lighthouse'un "Use efficient cache lifetimes" uyarısının
kaynağı budur. Gidermek için alan adı Cloudflare (ücretsiz plan) üzerinden proxy'lenir
ve bir **Cache Rule** yazılır:

- Koşul: URI yolu `/assets/` ile başlar → Edge TTL ve Browser TTL: 1 yıl
  (kaynak başlığını geçersiz kıl). Bu yoldaki CSS/JS/font/görsel dosya adları içerik
  hash'i taşıdığı için uzun önbellek güvenlidir; içerik değişince adı da değişir.
- HTML sayfalarına dokunulmaz (kısa TTL kalmalı ki yeni yayın hemen görünsün).
- SSL/TLS modu **Full** seçilir.

### 5. (İsteğe bağlı) Canlı sohbet

[İletişim](https://aviyonikyazilim.com/iletisim) sayfası e-posta ve GitHub yollarını her
zaman gösterir. Canlı sohbet ise yalnızca `TAWK_TO_ID` depo değişkeni tanımlıysa açılır;
tanımlı değilse sitede sohbet düğmesi de üçüncü taraf betiği de bulunmaz.

- [Tawk.to](https://www.tawk.to/) üzerinde (ücretsiz) bir hesap ve site için bir *property*
  açılır. Bu adımı depo sahibi yapar; kodda kimlik tutulmaz.
- Tawk panelinde **Administration → Channels → Chat Widget** altındaki *Widget Code*,
  `https://embed.tawk.to/<propertyId>/<widgetId>` adresini içerir.
- **Settings → Secrets and variables → Actions → Variables** altına `TAWK_TO_ID` adıyla
  `<propertyId>/<widgetId>` değeri (24 haneli onaltılık kimlik, eğik çizgi, widget kimliği;
  örn. `0123456789abcdef01234567/default`) eklenir ve site yeniden dağıtılır.
- Yerelde denemek için: `TAWK_TO_ID=<propertyId>/<widgetId> npm start`.

Tawk betiği sayfa açılışında yüklenmez; ziyaretçi sağ alttaki “Canlı sohbet” düğmesine ya da
İletişim sayfasındaki “Sohbeti aç” düğmesine bastığında yüklenir. Çerez ve gizlilik notu:
[SEO.md](SEO.md), “Depo değişkenleri”.

## Otomasyon (referans)

Depo oluşturma ve Pages etkinleştirme (yetkili `gh` oturumu ile):

```bash
gh repo create aviyonikyazilim --public --source=. --push
gh api -X POST repos/Mavrikant/aviyonikyazilim/pages \
  -f build_type=workflow -f "source[branch]=main" -f "source[path]=/"
gh api -X PUT repos/Mavrikant/aviyonikyazilim/pages -f cname=aviyonikyazilim.com
```

## Lisans

İçerik [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.tr) ile
lisanslanmıştır.
