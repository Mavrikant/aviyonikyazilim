# aviyonikyazilim

[karaman.dev/aviyonikyazilim/](https://karaman.dev/aviyonikyazilim/) sitesinin kaynak deposu.
Türkçe aviyonik yazılım / test / sertifikasyon içerikleri: **blog yazıları** ve DO-178C
konulu bir **kitap**. [Docusaurus 3](https://docusaurus.io) ile üretilir ve GitHub Pages
üzerinde yayınlanır.

## Geliştirme

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

### 2. Yayın kökünü doğrula

Docusaurus yapılandırmasındaki `url` ve `baseUrl` değerleri
`https://karaman.dev/aviyonikyazilim/` yayınına göre ayarlanmıştır.

## Otomasyon (referans)

Depo oluşturma ve Pages etkinleştirme (yetkili `gh` oturumu ile):

```bash
gh repo create aviyonikyazilim --public --source=. --push
gh api -X POST repos/Mavrikant/aviyonikyazilim/pages \
  -f build_type=workflow -f "source[branch]=main" -f "source[path]=/"
gh api -X PUT repos/Mavrikant/aviyonikyazilim/pages -f cname=karaman.dev
```

## Lisans

İçerik [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.tr) ile
lisanslanmıştır.
