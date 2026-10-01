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

İçerik ve katkı kuralları için [CLAUDE.md](CLAUDE.md) dosyasına bakınız.

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
