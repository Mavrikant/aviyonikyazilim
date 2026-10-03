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
npm run serve     # build çıktısını yerelde sun
```

Katkı yolları için [CONTRIBUTING.md](CONTRIBUTING.md), ayrıntılı içerik kuralları ve
terminoloji sözlüğü için [CLAUDE.md](CLAUDE.md) dosyasına bakınız.

## Dağıtım

`main` dalına yapılan her push, [GitHub Actions workflow'u](.github/workflows/deploy.yml)
ile otomatik olarak siteyi derler ve GitHub Pages'e yayınlar. Elle müdahale gerekmez.

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
"baseUrl" hata kutusuyla açılır.

### 3. Google Search Console

- [Search Console](https://search.google.com/search-console)'da `aviyonikyazilim.com`
  **Alan adı** mülkü olarak eklenir; istenen `TXT` kaydı DNS'e girilerek doğrulanır.
- **Site haritaları** bölümünden `https://aviyonikyazilim.com/sitemap.xml` gönderilir
  (`robots.txt` de bu adresi gösterir).
- Bing Webmaster Tools, Search Console'dan içe aktarılarak eklenebilir.

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
