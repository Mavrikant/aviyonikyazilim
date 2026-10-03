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
| Site kimliği (Organization + Person + WebSite) | Her sayfada tek bir schema.org `@graph`; varlıklar `@id` ile bağlı | `docusaurus.config.ts` (`identityGraph`, `headTags`) |
| Kitap ve bölüm şeması | `/kitap` sayfasında `Book`, bölümlerde `TechArticle` (+ Docusaurus'un `BreadcrumbList`'i) | `src/theme/DocItem/Metadata/` |
| `llms.txt` | Build sırasında kitap, blog, kütüphane ve araçlardan üretilir; elle bakım gerekmez | `plugins/llms-txt.ts` |
| Anahtar kelime tutarlılığı | Başlık, açıklama, H1 ve H2'lerde "aviyonik yazılım" / "DO-178C"; genel `keywords` meta etiketi | `src/pages/index.tsx`, `docusaurus.config.ts` (`metadata`) |
| E-posta gizliliği | Adres HTML'e yazılmaz; düğmeye tıklanınca tarayıcıda birleştirilir | `src/components/Eposta/` |
| Satır içi stil | `baseUrlIssueBanner` kapalı; gizli SVG deposunun `style`'ı sınıfa çevrilir. Ana sayfada `style="…"` yok | `docusaurus.config.ts`, `plugins/font-preload.ts` |
| URL hijyeni | Kütüphane kategori adresleri ASCII (`link.slug`); eski adresler yönlendirilir | `kutuphane/*/_category_.json`, `redirects` |
| Blog listesi H1 | `/blog` sayfasında tek H1 | `src/theme/BlogListPage/` |
| Etiket ve yazar açıklamaları | Etiket/yazar sayfalarına özgün meta açıklaması | `blog/tags.yml`, `blog/authors.yml` |
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
  yapılmadı. Ana sayfa ve liste sayfaları etkilenmez.
- **E-posta:** Adres yalnızca GitHub'da görünen `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/`
  ve `CLAUDE.md` içinde düz metin olarak durur; site HTML'inde yoktur. Depo herkese açık
  olduğundan bu dosyalardaki adresi toplayan botlar için ayrıca bir önlem alınmamıştır.

## 2. Depo değişkenleri (isteğe bağlı)

GitHub → **Settings → Secrets and variables → Actions → Variables** altında tanımlanır.
Tanımlı değilse build'e hiçbir şey eklenmez.

| Değişken | Anlamı |
|---|---|
| `GA_MEASUREMENT_ID` | Google Analytics 4 ölçüm kimliği (`G-XXXXXXXXXX`). IP anonimleştirme açıktır. |
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
   `turkish`, `docusaurus` ekle. Bu, github.com'dan gelen kalıcı bir bağlantıdır.
6. **(İsteğe bağlı) Önbellek:** alan adını Cloudflare'e taşıyıp README'deki Cache Rule'u yaz.
7. **Rich Results Test ve Schema Markup Validator** ile `/`, `/kitap` ve bir bölüm sayfasını
   dene (bölüm 5).

## 4. Backlink planı

Google bağlantıları sayfa otoritesinin güçlü bir göstergesi sayar; depo içindeki
değişiklikler siteyi yalnızca **bağlanmaya değer** ve **bağlanması kolay** yapar
(kitap giriş sayfasındaki atıf bloğu, RSS, CC BY-SA 4.0 lisansı). Gerçek bağlantılar
dışarıdan, doğal yoldan gelmelidir. **Bağlantı satın alma, bağlantı çiftlikleri, yorum
spam'i ve karşılıklı bağlantı takası** Google'ın spam politikalarına aykırıdır; yapılmaz.

Doğrulanmış, makul hedefler:

- **GitHub "awesome" listeleri** (pull request ile eklenir):
  [stanislaw/awesome-safety-critical](https://github.com/stanislaw/awesome-safety-critical)
  (emniyet-kritik yazılım kaynakları; içerik ReadTheDocs sitesinde de yayımlanır) ve
  [gioele-maruccia/awesome-avionics](https://github.com/gioele-maruccia/awesome-avionics)
  (aviyonik kaynakları; katkı bekler, `contributing.md` içerir). Ekleme için kitabın
  İngilizce olmadığı açıkça belirtilmeli ve listenin kendi katkı kurallarına uyulmalıdır.
- **GitHub konu sayfaları:** [`do-178c`](https://github.com/topics/do-178c) ve
  [`avionics`](https://github.com/topics/avionics) konularında depo görünür hâle gelir
  (yukarıdaki *About* adımı).
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

- **Yapılandırılmış veri:** <https://search.google.com/test/rich-results> ve
  <https://validator.schema.org/> — ana sayfa, `/kitap`, bir bölüm, bir blog yazısı.
- **Hız:** <https://pagespeed.web.dev/> — ana sayfa ve bir kod örneği içeren bölüm.
- **Dizin:** Search Console → *Sayfalar* (dizine eklenenler/dışarıda kalanlar),
  *Performans* (hangi sorgularla görünüyorsunuz), *Site haritaları*.
- **Basit kontrol:** Google'da `site:aviyonikyazilim.com`.
- **Yerelde:** `npm run build` sonrasında `build/llms.txt`, `build/robots.txt` ve
  `build/sitemap.xml` dosyalarına bakın; `grep -r "mailto:" build` boş dönmelidir.

## 6. Anahtar kelime stratejisi

- **Ana ifade (tam hâliyle):** "aviyonik yazılım". Türkçede ek alan biçimler ("aviyonik
  yazılımın") basit tarayıcılarca farklı kelime sayıldığından başlık, H1 ve açıklamada
  yalın hâli kullanılır.
- **İkincil:** DO-178C, emniyet-kritik yazılım, yazılım sertifikasyonu, yazılım doğrulama,
  yapısal kapsam analizi, MC/DC, ARINC 429, AFDX, gerçek zamanlı işletim sistemi.
- **Kural:** bir sayfa tek bir konuya odaklanır; başlıkta ve ilk paragrafta o konunun adı
  geçer; anahtar kelime doldurulmaz (Google bunu cezalandırır).
- **İçerik fırsatları (öneri):** "DO-178C nedir?" ve "DAL seviyeleri nedir?" gibi giriş
  sorularına yanıt veren özgün yazılar; "MC/DC nedir?" ve "ARINC 653 nedir?" gibi tek
  kavramlık açıklamalar. Bu tür aramalarda Türkçe kaynak azdır.
