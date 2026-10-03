# CLAUDE.md — aviyonikyazilim Çalışma Rehberi

Bu depo, **aviyonikyazilim.com** sitesinin Docusaurus 3 (TypeScript) ile
üretilen kaynağıdır. Site GitHub Pages üzerinde alan adı köküne (`baseUrl: '/'`)
göre hazırlanır.
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
  index.mdx               Giriş + seçim ölçütleri + kitap öneri CTA'sı (Eposta bileşeni için .mdx)
  01-sertifikasyon/ …     Kategoriler; kitap başına NN-slug.md sayfası
sidebarsKutuphane.ts      kutuphaneSidebar (otomatik üretilir)
araclar/                  Tarayıcıda çalışan simülatörler (routeBasePath: /araclar)
src/pages/index.tsx       Özel ana sayfa: canlı gösterge paneli, katkı daveti, içindekiler,
                          son yazılar, kütüphane ve araçlar
plugins/homepage-data.ts  Ana sayfa verisini build sırasında içerikten üreten yerel eklenti
plugins/meta-description.ts  description yoksa ilk paragraftan meta açıklaması üretir
plugins/remark-lcp-image.ts  Sayfa başındaki ilk görseli eager + fetchpriority=high yapar
plugins/font-preload.ts   Build sonrası HTML geçişi: IBM Plex Sans preload + gizli SVG deposu sınıfı
plugins/llms-txt.ts       Build sonrası llms.txt üretir (kitap, blog, kütüphane, araçlar)
src/components/Eposta/    E-posta düğmesi: adres HTML'e yazılmaz, tıklanınca tarayıcıda birleştirilir
src/theme/                Tema özelleştirmeleri: DocItem/Metadata, Blog/Pages/BlogAuthorsPostsPage ve
                          SearchPage (sarmalayıcı), DocBreadcrumbs/StructuredData ve BlogListPage (eject = upstream
                          kopyası; Docusaurus yükseltilince upstream ile elle karşılaştırılır)
SEO.md                    Arama motoru rehberi: elle yapılacaklar, backlink planı, doğrulama
src/css/fonts.css         @font-face tanımları (yalnızca latin + latin-ext alt kümeleri)
src/components/GostergePaneli/  Ana sayfadaki canlı PFD (uçuş modeli, duraklat/oynat tuşu)
static/img/blog/<slug>/   Blog görselleri (yereldir, harici bağlantı YASAK)
static/img/kitap/<slug>/  Kitap/kaynak görselleri
static/2023|2024|p/*.html Eski Blogger URL'leri için redirect stub'ları — SİLME
static/CNAME              Yayın alan adı (aviyonikyazilim.com)
static/robots.txt         Tarayıcı kuralları + sitemap adresi
docusaurus.config.ts      Ana yapılandırma
sidebars.ts               kitapSidebar (otomatik üretilir)
i18n/tr/code.json         Site içi arama eklentisinin Türkçe arayüz metinleri
CONTRIBUTING.md           Katkı rehberi (GitHub, issue ve PR ekranlarında gösterir)
.github/ISSUE_TEMPLATE/   Hata bildirimi ve konu önerisi formları
.github/workflows/deploy.yml  GitHub Pages otomatik dağıtım
.github/workflows/link-check.yml  Aylık dış bağlantı denetimi (lychee); ayarı .github/lychee.toml
.github/dependabot.yml    Haftalık, gruplanmış bağımlılık güncellemeleri
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
| veri yükleyici | data loader |
| yüklenebilir yazılım parçası | loadable software part (LSP) |
| elektronik parça işaretleme | electronic part marking |
| tekerleklerde ağırlık | weight-on-wheels |
| istem dışı etkinleşme | inadvertent enabling |
| uçuşa elverişlilik güvenliği | airworthiness security |
| fabrika yüklemeli yazılım | factory-loadable software |
| tam yetkili sayısal motor kontrolü | full authority digital engine control (FADEC) |

## Yeni blog yazısı ekleme

1. Dosya: `blog/YYYY-MM-DD-kisa-slug.md` (tarih = yayın tarihi, slug ASCII).
2. Frontmatter şablonu:
   ```md
   ---
   title: "Yazının Başlığı"
   description: "Arama sonucunda görünecek, 160 karakteri aşmayan özet."
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
   eklenir; `onInlineTags: 'throw'`). Her etikete 160 karakteri aşmayan, o etiketli
   yazıların gerçekten kapsadığı konuyu anlatan bir `description` yazılır (etiket
   sayfasının meta açıklaması ve görünen girişi olur). YAML'da düz metin içinde `: `
   bulunmamalıdır. Yazıya isteğe bağlı `keywords: ["…"]` eklenebilir.
5. Görseller `static/img/blog/<slug>/` altına indirilir ve `/img/blog/<slug>/dosya.png`
   yoluyla bağlanır. **Harici (googleusercontent, blogspot, wikimedia vb.) görsel
   bağlantısı bırakılmaz.** Görsel kuralları için "Performans ve arama motoru"
   bölümüne bakınız (boyut, biçim, Türkçe alt metin).

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
- **Kapak görseli** başlığın hemen altına eklenir; görsel *yerel* olarak
  `static/img/kutuphane/<slug>/kapak.<ext>` altına indirilir (harici hotlink
  YASAK — blog/kitap görsel kuralıyla aynı ilke). Kaynak yayınevi veya büyük
  kitapçı sitesindeki ürün küçük resmidir (thumbnail boyutunda, editoryal amaçlı).
  Kitap olmayan, fiziksel kapağı bulunmayan sayfalarda (standart/doküman aileleri)
  kapak görseli kullanılmaz.
- Her sayfaya bir **"Nereden edinilir"** bölümü eklenir: öncelik Türkiye'de satışta
  olan kitapçı (Kitapyurdu, D&R, İdefix, Amazon.com.tr), yoksa yabancı mağaza
  (Amazon.com, yayınevi sitesi).
- Künyede emin olunmayan ayrıntı (ISBN, baskı yılı) yazılmaz.
- Kitap önerileri `kutuphane/index.mdx` içindeki CTA ile e-posta üzerinden alınır.
  E-posta adresi sayfaya **düz metin ya da `mailto:` olarak yazılmaz**; `<Eposta>`
  bileşeni kullanılır (bkz. "Performans ve arama motoru").

## Ana sayfa

- Ana sayfadaki listeler (kitap içindekiler ve okuma süreleri, son 5 blog yazısı,
  kütüphane rafları ve kapakları, araçlar, sayılar) **elle yazılmaz**;
  `plugins/homepage-data.ts` bunları build sırasında `kitapSidebar`,
  `kutuphaneSidebar`, `araclarSidebar` ve blog içeriğinden üretir. Yeni bölüm, yazı,
  kitap veya araç eklemek için ana sayfayı düzenlemek gerekmez.
- Bölüm başlıkları `"N. Başlık"`, ekler `"Ek X: Başlık"`, kısım etiketleri
  `"Kısım N — Başlık"` biçimini korumalıdır; eklenti numarayı bu kalıplardan ayırır.
- Araç sayfalarının frontmatter'ında kısa bir `description` bulunur; ana sayfa onu gösterir.
- Ana sayfanın önceliği **katkıya davettir**; katkı bölümü ve kapanış çağrısı korunur.
  Katkı metinleri GitHub kullanmayanlar için e-posta yolunu da gösterir; katkı akışı
  değişirse `CONTRIBUTING.md` de birlikte güncellenir.
- Hero'daki gösterge animasyonu **durdurulabilir kalmalıdır** (WCAG 2.2.2): duraklat/oynat
  tuşu kaldırılmaz; azaltılmış hareket tercihinde gösterge duraklatılmış başlar.
- Ana sayfa CSS modülünde eleman seçicisi (`main a` gibi) kullanılmaz; modül CSS'i başka
  sayfalara geçildiğinde de yüklü kaldığı için kurallar sınıfa bağlanır.

## Görsel kimlik

- Yazı tipleri: metin ve başlıklarda **IBM Plex Sans**, kod ve etiketlerde
  **IBM Plex Mono** (self-hosted, Türkçe latin-ext dahil). Türkçe karakter
  (Ğ, İ, Ş, ı) içermeyen yazı tipleri kullanılmaz.
- `@font-face` tanımları `src/css/fonts.css` içindedir ve yalnızca **latin + latin-ext**
  dosyalarını bağlar. Fontsource'un hazır CSS'i (`wght.css`, `400.css` …) **import
  edilmez**: kiril/yunan/vietnam alt kümelerini de içerir ve Docusaurus 10 KB'tan
  küçük dosyaları base64 olarak gömdüğü için render'ı bloklayan `styles.css`'i
  ~385 KB'a şişirir. Yeni ağırlık/stil gerekiyorsa aynı kalıpla iki kural (latin-ext
  ve latin) eklenir. Sans dosya adları değişirse `plugins/font-preload.ts` güncellenir.
- Gradyan, ışıma, ızgara dokusu, buzlu cam/blur ve hover'da yükselen kart gibi
  şablon kalıpları yerine düz renk alanları, çizgiler ve alana özgü öğeler
  (gösterge, kontrol listesi, şekil altyazısı) tercih edilir.

## Kalite kuralları

- Her değişiklikten sonra **`npm run build` uyarısız/hatasız** geçmelidir.
  Yapılandırma katıdır: `onBrokenLinks`, `onBrokenAnchors`,
  `markdown.hooks.onBrokenMarkdownLinks`, `onInlineTags`, `onInlineAuthors`,
  `onUntruncatedBlogPosts` hepsi `'throw'`.
- **Kırık link bırakılmaz.** İç bağlantılar göreli yol veya doküman id'si ile verilir.
- İçerik `.md` (saf Markdown / CommonMark) olarak yazılır; `format: 'detect'` sayesinde
  React bileşeni gerekmedikçe `.mdx` kullanılmaz (şu an yalnızca `<Eposta>` kullanan
  `kutuphane/index.mdx` ve `araclar/index.mdx` ile VOR simülatörü sayfası).
- `.md` dosyalarında başlıklı admonition **köşeli parantez** ister:
  `:::tip[Başlık]` (boşluklu `:::tip Başlık` yalnızca MDX'te çalışır; .md'de düz
  metin olarak basılır).
- **Redirect stub'ları** (`static/2023/`, `static/2024/`, `static/p/`) ve
  `docusaurus.config.ts` içindeki `redirects` listesi eski Blogger URL'lerini korur;
  bunlar silinmez.
- **Dış bağlantılar** build'de denetlenmez; `.github/workflows/link-check.yml` ayda bir
  lychee ile denetler ve kırık bağlantı varsa "Kırık dış bağlantılar" issue'sunu açar
  ya da günceller. Bağlantı yerinde olduğu hâlde sürekli hata veriyorsa (bot koruması)
  `.github/lychee.toml` içindeki `exclude` listesine eklenir.
- **Bağımlılıklar:** Dependabot haftalık PR açar (`.github/dependabot.yml`); tüm
  `@docusaurus/*` paketleri tek grupta ve aynı sürümde kalır. Docusaurus güncellemesinde
  eject edilmiş tema dosyaları upstream ile karşılaştırılır (bkz. `src/theme/` satırı).

## Performans ve arama motoru

- **Meta açıklaması:** `description` frontmatter'ı yoksa `plugins/meta-description.ts`
  sayfanın ilk düz metin paragrafını (satırlarını birleştirip ~160 karaktere kısaltarak)
  kullanır. Bu yüzden bölümlerin ilk paragrafı konuyu özetleyen bir giriş olmalıdır.
  Sayfa görsel/tablo/listeyle başlıyorsa, ilk paragraf özet değilse ya da birden çok
  sayfada aynı giriş varsa (SOI sayfaları gibi) `description` elle yazılır
  (Türkçe, en çok 160 karakter, sayfaya özgü). Blog yazılarında elle yazmak tercih edilir.
- **Görseller:** fotoğraf/illüstrasyonlar en fazla ~800 px genişliğe küçültülüp WebP
  (kalite ~78) olarak kaydedilir; diyagram ve ekran görüntüleri PNG kalabilir.
  Yüzlerce KB'lık görsel eklenmez. Her görselin **Türkçe alt metni** vardır
  (`![](...)` biçiminde boş alt metin bırakılmaz).
- Sayfanın ilk üç bloğundaki ilk görsel (blog kapağı, kütüphane kapağı) LCP adayıdır;
  `plugins/remark-lcp-image.ts` onu `loading="eager"` + `fetchpriority="high"` yapar,
  diğer görseller tembel yüklenir. Büyük bir kapak görseli bu yüzden doğrudan sayfa
  açılışını yavaşlatır.
- **Sitemap:** `<lastmod>` her dosyanın son git commit tarihinden üretilir; bunun için
  `showLastUpdateTime: true` ve `deploy.yml`'deki `fetch-depth: 0` korunur. Etiket,
  arşiv ve yazar listeleri sitemap'e alınmaz. `static/robots.txt` sitemap'i gösterir.
- **Site kimliği:** her sayfada `docusaurus.config.ts` içindeki `identityGraph`
  (schema.org `Organization` + `Person` + `WebSite`, `@id` ile bağlı) bulunur; Google
  bunu site adı ve kimlik bilgisi için kullanabilir. Yalnızca depoda doğrulanabilen
  alanlar yazılır (uydurma profil, adres, puan eklenmez). `/kitap` sayfası `Book` ve
  `TechArticle`, diğer kitap sayfaları `TechArticle` taşır (`src/theme/DocItem/Metadata/`);
  kütüphane önerileri `Review`/`Book` olarak işaretlenmez. `BreadcrumbList`
  (`src/theme/DocBreadcrumbs/StructuredData/`) en az iki öğe içerir ve adresleri
  `trailingSlash: false` ayarına uyar.
- **Anahtar kelime:** ana ifade "aviyonik yazılım" başlıkta (site adı eki), açıklamada ve
  H1'de **yalın hâliyle** geçer (Türkçe ekler basit tarayıcıları şaşırtır); ikincil
  ifadeler DO-178C, emniyet-kritik, sertifikasyon, test. Doldurma yapılmaz. Başlık +
  site adı eki ~60 karakteri aşmamalıdır; ayrıntı: `SEO.md`.
- **E-posta:** adres düz metin olarak yazılmaz (botlar toplar). `<Eposta subject="…">`
  bileşeni adresi yalnızca tıklamada tarayıcıda birleştirir. Denetim:
  `grep -rIlE "serdar@|karaman\.dev" build` ve `grep -rIl "mailto:" build --include='*.html'`
  boş dönmelidir (JS paketlerindeki üçüncü taraf `mailto:` dizgeleri — Docusaurus yazar
  kartı, Markdown kütüphanesi — sayılmaz). Footer ve `.md` içeriğinde `mailto:`
  bağlantısı bırakılmaz.
- **Satır içi stil yok:** `style="…"`/`style={{…}}` kullanılmaz; kural CSS sınıfıyla
  yazılır (tek bilinen istisna: kod bloklarındaki Prism renk öznitelikleri — `socials`
  ile yazar sosyal simgesi de `style` ekler, bu yüzden `authors.yml`'ye eklenmez). Build çıktısındaki HTML'i yeniden yazan her düzenleme `plugins/font-preload.ts`
  içindeki tek geçişe eklenir: Docusaurus `postBuild` kancalarını **paralel** çalıştırdığı
  için aynı dosyaları okuyup yazan ikinci bir eklenti değişikliği sessizce kaybeder.
- **`llms.txt`** `plugins/llms-txt.ts` ile build sırasında üretilir; elle düzenlenmez.
  Kitap/blog/kütüphane/araç eklendikçe kendiliğinden güncellenir.
- **Site içi arama** `@easyops-cn/docusaurus-search-local` ile yapılır: dizin build
  sırasında üretilir (`build/search-index.json`), harici servis yoktur; dil `tr`
  (Türkçe kök ayırıcı). Kitap, kütüphane, araçlar ve blog dizinlenir; ana sayfa
  dizinlenmez. Arayüz metinleri `i18n/tr/code.json` içindedir. Eklenti her sayfanın
  başlığını, başlıklarını, `description` ve `keywords` meta etiketlerini ayrı sonuç
  olarak dizinler; bu yüzden **site geneli `keywords` etiketi yalnızca ana sayfadadır**
  (`src/pages/index.tsx`). Tüm sayfalara ortak bir `keywords`/`description` eklenmez,
  yoksa aramalar ilgisiz sayfalarla dolar. Yeni docs eklentisi eklenirse
  `docsRouteBasePath` ve `docsDir` listelerine de eklenir.
- **Adresler ASCII:** üretilen dizin sayfalarının adresi etiketten türetilir; Türkçe
  karakterli bir `label` için `_category_.json` içinde `link.slug` (ör.
  `/category/emniyet-muhendisligi`) verilir. Adres değişirse `redirects` listesine eklenir.
- **Analitik ve Search Console** yalnızca `GA_MEASUREMENT_ID` / `GOOGLE_SITE_VERIFICATION`
  depo değişkenleri tanımlıysa eklenir; kodda kimlik tutulmaz (bkz. `SEO.md`).
- GitHub Pages tüm dosyaları `Cache-Control: max-age=600` ile sunar ve bu depodan
  değiştirilemez (ayrıntı: README, "Uzun önbellek süresi").

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
