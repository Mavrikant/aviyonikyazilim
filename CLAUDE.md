# CLAUDE.md — aviyonikyazilim Çalışma Rehberi

Bu depo, **karaman.dev/aviyonikyazilim/** sitesinin Docusaurus 3 (TypeScript) ile
üretilen kaynağıdır. Site GitHub Pages üzerinde bu yayın köküne göre hazırlanır.
Gelecekteki tüm AI oturumları bu rehbere uymalıdır.

## Proje tanımı

Türkçe bir aviyonik yazılım / test / sertifikasyon sitesi. İki ana içerik türü:

1. **Blog** (`blog/`) — teknik yazılar (aviyonik protokoller, DO-178C konuları vb.).
2. **Kitap** (`kitap/`) — DO-178C ekseninde emniyet-kritik aviyonik yazılım üzerine,
   bölümleri hâlen yazılmakta olan özgün bir kitap.
3. **Kütüphane** (`kutuphane/`) — alandaki kitaplara/dokümanlara küratörlü öneri
   sayfaları (ikinci docs plugin örneği, routeBasePath: /kutuphane).

## Klasör yapısı

```
blog/                     Blog yazıları (YYYY-MM-DD-slug.md) + authors.yml + tags.yml
kitap/                    "Kitap" docs içeriği (routeBasePath: /kitap)
  index.md                Kitap giriş + içindekiler (slug: /, yani /kitap)
  01-giris/ … 06-ekler/   Kısımlar; her klasörde _category_.json + bölüm .md dosyaları
  kaynaklar/              Başvuru sayfaları (Kısaltmalar, SOI 1-4); sidebar'da en sonda
kutuphane/                Kütüphane docs içeriği (routeBasePath: /kutuphane)
  index.md                Giriş + seçim ölçütleri + kitap öneri formu CTA'sı
  01-sertifikasyon/ …     Kategoriler; kitap başına NN-slug.md sayfası
sidebarsKutuphane.ts      kutuphaneSidebar (otomatik üretilir)
src/pages/index.tsx       Özel ana sayfa (karşılama)
static/img/blog/<slug>/   Blog görselleri (yereldir, harici bağlantı YASAK)
static/img/kitap/<slug>/  Kitap/kaynak görselleri
static/2023|2024|p/*.html Eski Blogger URL'leri için redirect stub'ları — SİLME
static/CNAME              Yayın alan adı (karaman.dev)
docusaurus.config.ts      Ana yapılandırma
sidebars.ts               kitapSidebar (otomatik üretilir)
.github/workflows/deploy.yml  GitHub Pages otomatik dağıtım
```

## Dil kuralı

- **Tüm içerik Türkçedir.** Arayüz de Türkçedir (`i18n.defaultLocale: 'tr'`).
- Bir teknik terim ilk kez kullanıldığında **parantez içinde İngilizcesi** verilir:
  örn. "yapısal kapsam analizi (structural coverage analysis)". Sonraki kullanımlarda
  yalnızca Türkçesi (veya yerleşik kısaltması, örn. SCA) yeterlidir.
- Dosya ve klasör adları **ASCII** olmalıdır (`giris`, `dogrulama`); Türkçe karakterler
  yalnızca frontmatter `title` ve `_category_.json` `label` alanlarında kullanılır.

## Terminoloji sözlüğü (tutarlı kullanım)

Mevcut yazılardaki kullanımla uyumlu; genişletildikçe buraya eklenmelidir.

| Türkçe | İngilizce |
|---|---|
| yapısal kapsam analizi | structural coverage analysis (SCA) |
| yapısal programlama | structured programming |
| satır kapsama | statement coverage |
| karar kapsama | decision coverage |
| koşul kapsama | condition coverage |
| koşul/karar kapsama | condition/decision coverage |
| değiştirilmiş koşul/karar kapsama | modified condition/decision coverage (MC/DC) |
| ölü kod | dead code |
| gereksiz kod | extraneous code |
| devre dışı bırakılmış kod | deactivated code |
| gereksinim | requirement |
| yüksek/düşük seviyeli gereksinim | high-/low-level requirement |
| doğrulama | verification |
| geçerleme | validation |
| sertifikasyon | certification |
| kaynak kod | source code |
| çalıştırılabilir nesne kodu | executable object code |
| izlenebilirlik | traceability |
| yazılım mimarisi | software architecture |
| konfigürasyon yönetimi | configuration management |
| kalite güvencesi | quality assurance |
| araç kalifikasyonu | tool qualification |
| model tabanlı geliştirme | model-based development |
| biçimsel yöntemler | formal methods |
| gerçek zamanlı işletim sistemi | real-time operating system (RTOS) |
| yazılım bölümlemesi | software partitioning |
| katılım aşaması | Stage of Involvement (SOI) |
| etiket | label (ARINC 429) |
| kelime | word (veri kelimesi) |
| fonksiyonel tehlike değerlendirmesi | functional hazard assessment (FHA) |
| ortak neden analizi | common cause analysis (CCA) |
| geliştirme güvencesi | development assurance |
| türetilmiş gereksinim | derived requirement |
| gürbüzlük | robustness |
| akran gözden geçirmesi | peer review |
| temel çizgi | baseline |
| önceden geliştirilmiş yazılım | previously developed software (PDS) |
| ticari hazır yazılım | commercial off-the-shelf (COTS) |
| ürün servis geçmişi | product service history |
| parametre verisi öğesi | parameter data item (PDI) |
| veri zarfı | data envelope |
| değişiklik etki analizi | change impact analysis |
| araç kalifikasyon seviyesi | tool qualification level (TQL) |
| sahada yüklenebilir yazılım | field-loadable software |
| kullanıcı tarafından değiştirilebilir yazılım | user-modifiable software |
| yazılım başarı özeti | Software Accomplishment Summary (SAS) |

## Yeni blog yazısı ekleme

1. Dosya: `blog/YYYY-MM-DD-kisa-slug.md` (tarih = yayın tarihi, slug ASCII).
2. Frontmatter şablonu:
   ```md
   ---
   title: "Yazının Başlığı"
   slug: kisa-slug
   authors: [serdar]
   tags: [aviyonik, do-178c]
   ---

   Giriş paragrafı (özet olarak listede görünür).

   <!-- truncate -->

   Yazının gövdesi…
   ```
3. `<!-- truncate -->` işareti **zorunludur**; `onUntruncatedBlogPosts: 'throw'` olduğu
   için işareti olmayan yazı build'i kırar.
4. `tags` değerleri `blog/tags.yml` içinde tanımlı olmalıdır (yeni etiket önce oraya
   eklenir; `onInlineTags: 'throw'`).
5. Görseller `static/img/blog/<slug>/` altına indirilir ve `/img/blog/<slug>/dosya.png`
   yoluyla bağlanır. **Harici (googleusercontent, blogspot, wikimedia vb.) görsel
   bağlantısı bırakılmaz.**

## Kitap bölümlerini doldurma kuralları

- İçerik **özgün olarak yazılır**. **Hiçbir kitaptan/standarttan birebir çeviri
  yapılmaz** (telif hakkı). DO-178C metninden alıntı yapılmaz; kavramlar kendi
  cümlelerinizle anlatılır.
- Diyagramlar **Mermaid** ile metin olarak yazılır (`mermaid` kod bloğu). Harici görsel
  yerine mümkün olduğunca Mermaid tercih edilir.
- Kod örnekleri ağırlıklı olarak **C** dilindedir (aviyonik yaygınlığı nedeniyle).
- Her bölüm dosyası `NN-slug.md` biçiminde adlandırılır; `sidebar_position` klasör içi
  sırayı belirler. Bölüm başlığı frontmatter `title` alanında verilir.
- Placeholder bölümlerdeki `:::info Bu bölüm hazırlanıyor 🚧` kutusu, içerik yazıldığında
  kaldırılır.

## Kütüphane sayfası kuralları

- Her kitap sayfası: künye tablosu (yazar, yayınevi, yıl/baskı, odak, seviye,
  kimin için) + **özgün** tanıtım (kitaptan alıntı/çeviri YASAK) + sitedeki kitap
  bölümlerine bağlantı.
- **Kapak görseli kullanılmaz** (telif + harici görsel yasağı).
- Künyede emin olunmayan ayrıntı (ISBN, baskı yılı) yazılmaz.
- Kitap öneri formu bağlantısı `kutuphane/index.md` içindedir (Google Forms).

## Kalite kuralları

- Her değişiklikten sonra **`npm run build` uyarısız/hatasız** geçmelidir.
  Yapılandırma katıdır: `onBrokenLinks`, `onBrokenAnchors`,
  `markdown.hooks.onBrokenMarkdownLinks`, `onInlineTags`, `onInlineAuthors`,
  `onUntruncatedBlogPosts` hepsi `'throw'`.
- **Kırık link bırakılmaz.** İç bağlantılar göreli yol veya doküman id'si ile verilir.
- İçerik `.md` (saf Markdown / CommonMark) olarak yazılır; `format: 'detect'` sayesinde
  React bileşeni gerekmedikçe `.mdx` kullanılmaz.
- **Redirect stub'ları** (`static/2023/`, `static/2024/`, `static/p/`) ve
  `docusaurus.config.ts` içindeki `redirects` listesi eski Blogger URL'lerini korur;
  bunlar silinmez.

## Yayın akışı

1. Değişiklikler bir **dal** üzerinde yapılır.
2. **PR** açılır, gözden geçirilir.
3. `main`'e **merge** edilince `.github/workflows/deploy.yml` otomatik olarak build alıp
   GitHub Pages'e dağıtır.

## Yerel komutlar

```bash
npm start        # geliştirme sunucusu (canlı önizleme)
npm run build    # üretim derlemesi (uyarısız geçmeli)
npm run serve    # build çıktısını yerelde sunar
```
