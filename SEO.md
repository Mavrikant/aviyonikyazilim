# SEO rehberi — aviyonikyazilim.com

Bu belge, sitenin arama motoru (özellikle Google) görünürlüğü için depoda **ne yapıldığını**,
depo dışında **elle neyin yapılması gerektiğini** ve yeni içerik eklerken nelere dikkat
edileceğini toplar. Kod kuralları için [CLAUDE.md](CLAUDE.md), katkı yolları için
[CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakınız.

## 1. Depoda yapılanlar

| Alan | Çözüm | Nerede |
|---|---|---|
| `robots.txt` | Her şeye izin verir, sitemap adresini gösterir | `static/robots.txt` |
| Sitemap | `<lastmod>` her dosyanın son git commit tarihinden gelir; etiket/arşiv/yazar listeleri dışarıda | `docusaurus.config.ts` (`sitemap`), `deploy.yml` (`fetch-depth: 0`) |
| Meta açıklaması | `description` yoksa ilk paragraftan üretilir; blogda elle yazılır | `plugins/meta-description.ts` |
| Site kimliği (Organization + Person + WebSite) | Her sayfada tek bir schema.org `@graph`; varlıklar `@id` ile bağlı; logo 256 px PNG (Google en az 112 px ister) | `docusaurus.config.ts` (`identityGraph`, `headTags`), `static/img/logo-256.png` |
| Kitap şeması | `/kitap` sayfasında `Book` + `TechArticle`, diğer bölümlerde `TechArticle` | `src/theme/DocItem/Metadata/` |
| Gezinti yolu şeması | `BreadcrumbList` en az iki öğeli (ana sayfa dahil) ve adresler kanonik biçimde | `src/theme/DocBreadcrumbs/StructuredData/` |
| `llms.txt` | Build sırasında kitap, blog, kütüphane ve araçlardan üretilir; elle bakım gerekmez | `plugins/llms-txt.ts` |
| Anahtar kelime tutarlılığı | Başlık, açıklama, H1 ve H2'lerde "aviyonik yazılım" / DO-178C; genel `keywords` meta etiketi (Google bu etiketi kullanmaz; yalnızca bazı denetim araçları sayar) | `src/pages/index.tsx`, `docusaurus.config.ts` (`metadata`) |
| E-posta gizliliği | Adres HTML'e ve bileşenin JS parçasına bütün yazılmaz; düğmeye tıklanınca tarayıcıda birleştirilir | `src/components/Eposta/` |
| Satır içi stil | `baseUrlIssueBanner` kapalı (yalnızca ana sayfadaki betik metnini kaldırır); her sayfadaki gizli SVG deposunun `style`'ı sınıfa çevrilir. Ana sayfada `style="…"` yok | `docusaurus.config.ts`, `plugins/font-preload.ts` |
| URL hijyeni | Kütüphane kategori adresleri ASCII (`link.slug`); eski adresler yönlendirilir | `kutuphane/*/_category_.json`, `redirects` |
| Blog listesi H1 | `/blog` sayfasında tek H1 | `src/theme/BlogListPage/` |
| Etiket ve yazar açıklamaları | Etiket sayfalarına özgün meta açıklaması; yazar sayfasına `<head>` açıklaması | `blog/tags.yml`, `blog/authors.yml`, `src/theme/Blog/Pages/BlogAuthorsPostsPage/` |
| Analitik ve Search Console | Yalnızca depo değişkeni tanımlıysa eklenir (bkz. bölüm 2) | `docusaurus.config.ts`, `.github/workflows/deploy.yml` |
| Performans | WebP görseller, font preload, LCP görseli `eager` | `plugins/font-preload.ts`, `plugins/remark-lcp-image.ts` |

### Bilinen sınırlar

- **Önbellek süresi:** GitHub Pages her dosyayı `Cache-Control: max-age=600` ile sunar ve bu
  depodan değiştirilemez. "Kısa önbellek" uyarısı ancak Cloudflare gibi bir proxy ile
  giderilir (README, "Uzun önbellek süresi").
- **Kod bloklarındaki satır içi stil:** Docusaurus'un sözdizimi renklendirmesi
  (prism-react-renderer) her kod parçasını `style="color:…"` ile boyar; C örnekleri olan
  kitap bölümlerinde bu onlarca öznitelik demektir. Bunu sınıf tabanlı hâle getirmek tema
  içini (`CodeBlock`) kopyalamayı gerektirir; kazanç küçük, bakım yükü kalıcı olduğundan
  yapılmadı. Ana sayfa ve liste sayfaları etkilenmez. Aynı nedenle `blog/authors.yml`'ye
  `socials` eklenmez: tema her yazı başlığına `style` taşıyan bir GitHub simgesi basar.
- **E-posta:** Adres yalnızca GitHub'da görünen `CONTRIBUTING.md` ve
  `.github/ISSUE_TEMPLATE/config.yml` içinde düz metin olarak durur; site HTML'inde yoktur.
  Depo herkese açık olduğundan bu dosyalardaki adresi toplayan botlar için ayrıca bir
  önlem alınmamıştır.
- **Tema `BlogListPage` ve `DocBreadcrumbs/StructuredData`** upstream dosyalarının
  kopyasıdır (eject). Docusaurus yükseltildiğinde `node_modules/@docusaurus/theme-classic/src/theme/`
  altındaki özgün dosyalarla elle karşılaştırın.

## 2. Depo değişkenleri (isteğe bağlı)

GitHub → **Settings → Secrets and variables → Actions → Variables** (*Repository variables*)
altında tanımlanır. Tanımlı değilse build'e hiçbir şey eklenmez. Biçimi geçersiz bir değer
(yazım hatası, `G-` ile başlamayan kimlik) build'i durdurmaz; build günlüğünde
`[config] … geçersiz biçimde, yok sayıldı` uyarısı çıkar.

| Değişken | Anlamı |
|---|---|
| `GA_MEASUREMENT_ID` | Google Analytics 4 ölçüm kimliği (`G-XXXXXXXXXX`). `anonymizeIP` seçeneği açık bırakılmıştır ancak GA4'te etkisizdir (GA4 IP adreslerini zaten kaydetmez); çerez ve onay konusu için aşağıdaki nota bakın. |
| `GOOGLE_SITE_VERIFICATION` | Search Console "HTML etiketi" doğrulamasındaki `content` değeri. DNS doğrulaması yeterliyse gerekmez. |

> **KVKK / GDPR:** GA4 çerez kullanır; Türkiye ve AB ziyaretçileri için aydınlatma ve
> onay (çerez bildirimi) gerekir. Çerezsiz bir ölçüm tercih edilirse Cloudflare Web
> Analytics, GoatCounter ya da Umami gibi seçenekler değerlendirilebilir; bunlar için
> ek bir eklenti ya da `headTags` girdisi gerekir. Onay penceresi bu depoda yoktur.

## 3. Elle yapılacaklar (sırayla)

1. **Search Console:** <https://search.google.com/search-console> → *Alan adı* mülkü →
   `aviyonikyazilim.com` → verilen `TXT` kaydını DNS'e ekle → doğrula.
2. **Sitemap gönder:** *Site haritaları* → `https://aviyonikyazilim.com/sitemap.xml`.
3. **URL denetimi:** ana sayfa, `/kitap`, en yeni blog yazısı ve bir kitap bölümü için
   *URL Denetimi* → *Dizine eklenmesini iste*.
4. **Bing Webmaster Tools:** Search Console'dan içe aktar (DuckDuckGo ve diğer bazı arama
   motorları Bing dizinini kullanır).
5. **GitHub deposu:** *About* bölümüne web sitesi olarak `https://aviyonikyazilim.com`,
   konu etiketleri olarak `do-178c`, `avionics`, `aviation`, `safety-critical`,
   `turkish`, `docusaurus` ekle. GitHub kullanıcı bağlantılarına `rel=nofollow` ekler;
   bu adım sıralama için değil, keşfedilebilirlik ve yönlendirme trafiği içindir.
6. **(İsteğe bağlı) Önbellek:** alan adını Cloudflare'e taşıyıp README'deki Cache Rule'u yaz.
7. **Schema Markup Validator** ile `/`, `/kitap` ve bir bölüm sayfasını dene (bölüm 5).

## 4. Backlink planı

Bağlantılar Google'ın sıralamada kullandığı önemli sinyallerden biridir; depo içindeki
değişiklikler siteyi yalnızca **bağlanmaya değer** ve **bağlanması kolay** yapar
(kitap giriş sayfasındaki atıf bloğu, RSS, CC BY-SA 4.0 lisansı). Gerçek bağlantılar
dışarıdan, doğal yoldan gelmelidir. **Bağlantı satın alma, bağlantı çiftlikleri, yorum
spam'i ve karşılıklı bağlantı takası** Google'ın spam politikalarına aykırıdır; yapılmaz.

> **GitHub bağlantıları `nofollow` taşır.** Aşağıdaki GitHub hedefleri (README, About,
> awesome listeleri) sıralama katkısı değil, görünürlük ve yönlendirme trafiği sağlar.
> Sıralamaya katkı veren bağlantılar GitHub dışındaki sitelerden (üniversite sayfaları,
> bloglar, topluluk yazıları) gelir.

Var olduğu doğrulanmış hedefler (3 Ekim 2026 itibarıyla; yanıt garantisi yoktur):

- **[stanislaw/awesome-safety-critical](https://github.com/stanislaw/awesome-safety-critical)**
  — emniyet-kritik yazılım kaynakları. README yalnızca [ReadTheDocs](https://awesome-safety-critical.readthedocs.io/)
  sitesine yönlendirir; liste kaynağı `docs/source/*.rst` (Sphinx) altındadır, bu yüzden
  pull request README'ye değil oraya, `docs/source/ContentOrganization.rst` düzenine uyarak
  açılır. Harici pull request'ler daha önce birleştirilmiştir, ancak bakım seyrektir
  (son commit Mart 2025). Liste İngilizcedir; kitabın Türkçe olduğu açıkça belirtilmeli.
- **[gioele-maruccia/awesome-avionics](https://github.com/gioele-maruccia/awesome-avionics)**
  — aviyonik kaynakları; `contributing.md` ve "katkıcı aranıyor" notu vardır, ancak son
  commit Nisan 2022'dir ve depoda hiç pull request yoktur; yanıt alınmayabilir, öncelik
  düşüktür.
- **GitHub konu sayfaları:** [`do-178c`](https://github.com/topics/do-178c) ve
  [`avionics`](https://github.com/topics/avionics) konularında depo görünür hâle gelir
  (yukarıdaki *About* adımı). Bu sayfalar siteye değil depoya bağlanır.
- **Topluluklar:** üniversite havacılık/uzay ve bilgisayar mühendisliği ders sayfaları,
  mesleki ağlar (LinkedIn yazıları), Türkçe mühendislik toplulukları. Yazıyı özetle
  paylaş, bağlantıyı yazının sonuna koy; her yazıyı tek seferde değil, uygun bağlamda paylaş.
- **Çapraz yayın:** bir yazıyı Medium/dev.to gibi bir yerde yeniden yayımlarsan
  `rel=canonical` ile bu siteyi kaynak göster; aksi hâlde kopya içerik sayılır.
- **Atıf kolaylığı:** kitap giriş sayfasındaki hazır atıf ve bağlantı bloğunu, kitabı
  anan herkesle paylaş.

Not: Türkçe Vikipedi'de `DO-178C` başlıklı bir madde şu an yoktur. Vikipedi kendi
bağlantısını eklemeyi (öz tanıtım) kısıtlar; bu yüzden orada yer almak için bağımsız
kaynaklara dayanan bir madde ya da başkalarının referans vermesi gerekir.

## 5. Doğrulama ve izleme

- **Yapılandırılmış veri:** <https://validator.schema.org/> ile `/`, `/kitap`, bir bölüm ve
  bir blog yazısı. Google'ın [Rich Results Test](https://search.google.com/test/rich-results)
  aracı `Organization`, `WebSite`, `Book` ve `TechArticle` için "öğe bulunamadı" diyebilir;
  bunlar zengin sonuç türü değildir ve bu normaldir. Rich Results Test'te doğrulanacak tür
  `BreadcrumbList`'tir.
- **Hız:** <https://pagespeed.web.dev/> — ana sayfa ve bir kod örneği içeren bölüm.
- **Dizin:** Search Console → *Sayfalar* (dizine eklenenler/dışarıda kalanlar),
  *Performans* (hangi sorgularla görünüyorsunuz), *Site haritaları*.
- **Basit kontrol:** Google'da `site:aviyonikyazilim.com`.
- **Yerelde:** `npm run build` sonrasında `build/llms.txt`, `build/robots.txt` ve
  `build/sitemap.xml` dosyalarına bakın. E-posta sızıntısı denetimi:
  `grep -rIlE "serdar@|karaman\.dev" build` ve `grep -rIl "mailto:" build --include='*.html'`
  komutlarının ikisi de boş dönmelidir. (`grep -r "mailto:" build` boş dönmez: Docusaurus
  yazar kartı ve Markdown kütüphanesi gibi üçüncü taraf JS paketleri bu dizgiyi kendileri
  taşır; adres değildir.)
- **Kategori yeniden adlandırınca:** `_category_.json` içindeki `link.slug` değişirse eski
  adresi `docusaurus.config.ts` → `redirects` listesine ekleyin; `build/sitemap.xml`'de
  yüzde kodlu (`%C3…`) adres kalmadığını kontrol edin.

## 6. Anahtar kelime stratejisi

- **Ana ifade (tam hâliyle):** "aviyonik yazılım". Türkçede ek alan biçimler ("aviyonik
  yazılımın") basit tarayıcılarca farklı kelime sayıldığından başlık, H1 ve açıklamada
  yalın hâli kullanılır. Ana sayfa başlığında bu ifade site adı ekinden ("| Aviyonik
  Yazılım") gelir.
- **İkincil:** DO-178C, emniyet-kritik yazılım, yazılım sertifikasyonu, yazılım doğrulama,
  yapısal kapsam analizi, MC/DC, ARINC 429, AFDX, gerçek zamanlı işletim sistemi.
- **Kural:** bir sayfa tek bir konuya odaklanır; başlıkta ve ilk paragrafta o konunun adı
  geçer; anahtar kelime doldurulmaz (Google bunu cezalandırır).
- **İçerik fırsatları (öneri):** "DO-178C nedir?" ve "DAL seviyeleri nedir?" gibi giriş
  sorularına yanıt veren özgün yazılar; "MC/DC nedir?" ve "ARINC 653 nedir?" gibi tek
  kavramlık açıklamalar. Türkçe kaynakların bu aramalarda görece az olduğu varsayılır;
  Search Console'daki sorgu verisiyle doğrulayın.
