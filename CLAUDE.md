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
blog/                     Blog yazıları (YYYY-MM-DD-slug.mdx) + authors.yml + tags.yml
kitap/                    "Kitap" docs içeriği (routeBasePath: /kitap)
  index.mdx               Kitap giriş + içindekiler (slug: /, yani /kitap; içindekiler üretilir)
  01-giris/ … 06-ekler/   Kısımlar; her klasörde _category_.json + bölüm .mdx dosyaları
  06-ekler/05-sablonlar/  Ek E: beş plan ve üç geliştirme standardı için şablon + yazım rehberi
  06-ekler/06-kontrol-listeleri/  Ek F: gözden geçirme ve süreç denetimi listeleri (CSV
                          indirme) + SOI-1…4 denetim listeleri. Çok sayfalı eklerin index.mdx'i
                          kategorinin giriş sayfasıdır; ana sayfa içindekilerinde tek satırdır
  kisaltmalar.mdx         Kısaltmalar sözlüğü: kategorisiz, kenar çubuğunda eklerden sonra
                          (sidebar_position: 99). Kitabın sonuna eklenen kategorisiz sayfaları
                          ana sayfa "Başvuru" satırında, /kitap içindekileri eklerden sonra gösterir
kutuphane/                Kütüphane docs içeriği (routeBasePath: /kutuphane)
  index.mdx               Giriş + seçim ölçütleri + kitap öneri CTA'sı (Eposta bileşeni)
  01-sertifikasyon/ …     Kategoriler; kitap başına NN-slug.mdx sayfası (künye: <Kunye>)
sidebarsKutuphane.ts      kutuphaneSidebar (otomatik üretilir)
araclar/                  Tarayıcıda çalışan araçlar (routeBasePath: /araclar); giriş sayfası katalogdur
src/components/AracKatalogu/  Araçlar giriş sayfasındaki katalog (araclarSidebar'dan üretilir)
src/components/KontrolListesi/  "CSV olarak indir" düğmeleri: Ek F maddeleri (ListeIndir) ve soru
                          tabloları (TabloIndir, Ek C); veriyi sayfanın HTML'inden okur
src/components/Kunye/     Kütüphane sayfalarının künyesi (kapak, yazar, yayınevi, seviye ölçeği)
src/components/KitapIcindekiler/  /kitap sayfasındaki içindekiler (kitapSidebar'dan, okuma süreli)
src/components/AracKarti/ Kitap ve blogdan araca giden kart (başlık/açıklama araç listesinden)
src/components/SoiAsamalari/  SOI-1…4 sayfalarının başındaki aşama şeridi (PDF'e girmez)
src/components/KisaltmaSuzgeci/  Kısaltmalar sayfasının arama kutusu ve A–Z şeridi (PDF'e girmez)
src/components/SekilBuyutme/  Küçülen Mermaid diyagramı ve Markdown görseline "Büyüt" düğmesi ve tam ekran
                          görüntüleyici (yakınlaştırma, sürükleme); src/theme/Mermaid ve MDXComponents/Img sarar
src/components/NavigasyonHaritasi/  Türkiye navigasyon haritası (Leaflet; VOR/DME/TACAN/NDB, havalimanı, pist)
src/pages/gom/            Başka sitelere <iframe> ile gömülen yalın sayfalar (noindex, sitemap dışı)
scripts/navigasyon-verisi.mjs  OurAirports'tan static/data/turkiye-navigasyon.json üretir
src/components/KonnektorTasarim/  Konnektör pin yerleşimi aracı (MIL-DTL-38999, D-sub, JTAG, pin başlığı)
src/components/McdcAraci/  MC/DC test seti üretici (ifade ayrıştırıcı, bağımsızlık çiftleri, en küçük set;
                          paylasim.ts: #d= bağlantısı, içerikten aracı bir ifadeyle açmak için)
src/components/HedefGezgini/  DO-178C Ek A hedef gezgini (veri.ts: 71 hedef × seviye; araç + seviye özeti şekilleri)
src/components/KanalTablosu/  VOR/ILS/DME kanal tablosu (kanallar.ts: ICAO Ek 10 eşlemesi + sağlama;
                          Türkiye sütunu turkiye-navigasyon.json'dan)
src/components/RadyoKapsama/  VOR/DME/TACAN radyo kapsama aracı (yayilim.ts: yol kaybı çekirdeği + sağlama;
                          arazi.ts: yükseklik karoları; hesap.ts: kutupsal ızgara ve harita görüntüsü)
src/components/LeafletCekirdek/  Leaflet haritalarının ortak çekirdek CSS'i (.leaflet) ve sade altlık süzgeci
src/components/GorevCizelgeleme/  Görev çizelgeleme analiz aracı (tepki süresi analizi, EDF talep ölçütü,
                          benzetim, döngüsel yürütücü çerçeve tasarımı)
scripts/konnektor/        MIL-STD-1560C metninden static/data/konnektor/mil-dtl-38999.json üretir
src/pages/index.tsx       Özel ana sayfa: canlı gösterge paneli, katkı daveti, içindekiler,
                          son yazılar, kütüphane ve araçlar
plugins/homepage-data.ts  Ana sayfa verisini build sırasında içerikten üreten yerel eklenti
plugins/meta-description.ts  description yoksa ilk paragraftan meta açıklaması üretir
plugins/remark-lcp-image.ts  Sayfa başındaki ilk görseli eager + fetchpriority=high yapar
plugins/font-preload.ts   Build sonrası HTML geçişi: IBM Plex Sans preload + gizli SVG deposu sınıfı;
                          meta açıklaması olmayan sayfada derlemeyi durdurur
plugins/llms-txt.ts       Build sonrası llms.txt üretir (kitap, blog, kütüphane, araçlar)
plugins/kitap-pdf.ts      Kitap PDF'inin sayfa listesini (manifest) üretir; PDF adresi buradadır
scripts/kitap-pdf.mjs     Derlenmiş siteden kitabın PDF'ini üretir (`npm run pdf`); düzeni kitap-pdf.css
scripts/indexnow.mjs      Değişen sayfaları IndexNow ile arama motorlarına bildirir (deploy.yml çalıştırır)
src/components/Eposta/    E-posta düğmesi: adres HTML'e yazılmaz, tıklanınca tarayıcıda birleştirilir
src/pages/iletisim.mdx    İletişim sayfası (e-posta, GitHub; canlı sohbet yalnızca yapılandırılmışsa)
src/components/Iletisim/  İletişim sayfasının kanal listesi ve `.markdown` sarmalayıcısı
src/components/CanliSohbet/  İsteğe bağlı Tawk.to sohbeti: betiği tembel yükleyen kanca ve yüzen düğme
src/theme/                Tema özelleştirmeleri: DocItem/Metadata, Blog/Pages/BlogAuthorsPostsPage,
                          Blog/Pages/BlogAuthorsListPage, BlogTagsListPage, NotFound, SearchPage,
                          Mermaid ve MDXComponents/Img (sarmalayıcı), DocBreadcrumbs/StructuredData ve BlogListPage (eject = upstream
                          kopyası; Docusaurus yükseltilince upstream ile elle karşılaştırılır), Root.tsx
                          (resmi Root genişletme noktası, eject değildir: yüzen sohbet düğmesini ekler)
SEO.md                    Arama motoru rehberi: elle yapılacaklar, backlink planı, doğrulama
src/css/fonts.css         @font-face tanımları (yalnızca latin + latin-ext alt kümeleri)
src/components/GostergePaneli/  Ana sayfadaki canlı PFD (uçuş modeli, duraklat/oynat tuşu)
static/img/blog/<slug>/   Blog görselleri (yereldir, harici bağlantı YASAK)
static/img/kitap/<slug>/  Kitap/kaynak görselleri
static/2023|2024|p/*.html Eski Blogger URL'leri için redirect stub'ları — SİLME
static/CNAME              Yayın alan adı (aviyonikyazilim.com)
static/robots.txt         Tarayıcı kuralları + sitemap adresi
static/<anahtar>.txt      IndexNow anahtar dosyası (adı = içeriği) — SİLME
docusaurus.config.ts      Ana yapılandırma
sidebars.ts               kitapSidebar (otomatik üretilir)
i18n/tr/code.json         Site içi arama eklentisinin Türkçe arayüz metinleri; blog arşivinin açıklaması
CONTRIBUTING.md           Katkı rehberi (GitHub, issue ve PR ekranlarında gösterir)
.github/ISSUE_TEMPLATE/   Hata bildirimi ve konu önerisi formları
.github/workflows/deploy.yml  GitHub Pages otomatik dağıtım (site + kitap PDF'i)
.github/workflows/pr-build.yml  PR'larda derleme ve PDF denetimi (dağıtım yapmaz)
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
| yazılım başarım özeti | Software Accomplishment Summary (SAS) |
| veri yükleyici | data loader |
| yüklenebilir yazılım parçası | loadable software part (LSP) |
| elektronik parça işaretleme | electronic part marking |
| tekerleklerde ağırlık | weight-on-wheels |
| istem dışı etkinleşme | inadvertent enabling |
| uçuşa elverişlilik güvenliği | airworthiness security |
| fabrika yüklemeli yazılım | factory-loadable software |
| tam yetkili sayısal motor kontrolü | full authority digital engine control (FADEC) |
| radyo seyrüsefer yardımcısı | radio navigation aid (navaid) |
| tanıtım kodu | identifier (ident) |
| manyetik sapma | magnetic variation |
| pin yerleşimi | pinout |
| yerleşim (insert yerleşimi) | insert arrangement |
| gövde boyutu | shell size |
| kontak boyutu | contact size |
| ön (geçme) yüz / arka yüz | mating face / rear face |
| ana kama | master key |
| yön verici | localizer (LOC) |
| süzülüş yolu | glide path / glide slope (GP/GS) |
| kanal eşleme | channel pairing (VHF ⇄ DME, LOC ⇄ GS) |
| sorgu / cevap frekansı | interrogation / reply frequency (DME) |
| darbe çifti aralığı | pulse pair spacing |
| kapsama alanı | coverage |
| görüş hattı | line of sight |
| radyo ufku | radio horizon |
| serbest uzay kaybı | free-space path loss |
| kırınım kaybı | diffraction loss |
| bıçak sırtı | knife-edge |
| bağlantı bütçesi | link budget |
| pay (bağlantı bütçesinde) | margin |
| güç yoğunluğu | power density |
| alıcı hassasiyeti | receiver sensitivity |
| eşdeğer izotropik yayılan güç | equivalent isotropically radiated power (EIRP) |
| benzersiz neden MC/DC | unique-cause MC/DC |
| maskeleme MC/DC | masking MC/DC |
| bağlı koşul | coupled condition |
| bağımsızlık çifti | independence pair |
| kısa devre değerlendirmesi | short-circuit evaluation |
| yazılım seviyesi | software level (Seviye A–E) |
| geliştirme güvence seviyesi | development assurance level (DAL; fonksiyon için FDAL, öğe için IDAL) |
| hedef | objective (DO-178C) |
| arıza durumu | failure condition |
| sistem emniyet değerlendirme süreci | system safety assessment process |
| bütünleyici süreçler | integral processes |
| sertifikasyon irtibatı | certification liaison |
| sertifikasyon otoritesi (kısaca otorite) | certification authority |
| başvuru sahibi | applicant |
| kabul edilebilir uyum yöntemi | acceptable means of compliance |
| teknoloji eki (kısaca ek) | supplement (DO-331/332/333; DO-330 ek değildir) |
| ek hususlar | additional considerations |
| yazılım yaşam döngüsü verisi (gündelik: iş ürünü) | software life cycle data |
| iz verisi | trace data |
| kontrol kategorisi | control category (CC1/CC2) |
| konfigürasyon öğesi | configuration item |
| konfigürasyon durum muhasebesi | configuration status accounting |
| geçiş kriteri | transition criteria |
| gözden geçirme | review |
| yazılım uygunluk gözden geçirmesi | software conformity review |
| uyum / uygunluk | compliance / conformity |
| problem raporu | problem report |
| düzeltici faaliyet | corrective action |
| gereksinim tabanlı test | requirements-based testing |
| test durumu / test prosedürü | test case / test procedure |
| veri ve kontrol bağlaşımı | data and control coupling |
| en kötü durum yürütme süresi | worst-case execution time (WCET) |
| çizelgeleme / çizelgeleyici | scheduling / scheduler |
| çizelgelenebilirlik analizi | schedulability analysis |
| zamanlayıcı | timer |
| kesme servis rutini | interrupt service routine (ISR) |
| belirlenimci | deterministic |
| iş (bir görevin tek çalışması) | job |
| zaman sınırı | deadline |
| kullanım | utilization |
| hiperperiyot | hyperperiod |
| hız-monoton / zaman sınırı-monoton | rate-monotonic (RM) / deadline-monotonic (DM) |
| kesintili / kesintisiz | preemptive / non-preemptive |
| en kötü tepki süresi | worst-case response time |
| tepki süresi analizi | response-time analysis |
| işlemci talep ölçütü | processor demand criterion |
| engellenme süresi | blocking time |
| kritik kesit | critical section |
| bağlam değiştirme | context switch |
| titreşim | jitter |
| döngüsel yürütücü | cyclic executive |
| ana çerçeve / küçük çerçeve | major frame / minor frame |
| alan bölümlemesi / zaman bölümlemesi | spatial / temporal partitioning |
| bölüm (bölümleme bağlamında) | partition |
| entegre modüler aviyonik | integrated modular avionics (IMA) |
| çok çekirdekli işlemci | multi-core processor |
| kod üreteci | code generator |
| gereksinim standardı | software requirements standards (SRStd) |
| tasarım standardı | software design standards (SDStd) |
| kodlama standardı | software code standards (SCStd) |
| şablon | template |
| kontrol listesi | checklist |
| bulgu (gözden geçirme bulgusu) | finding |
| çok sürümlü benzemez yazılım | multiple-version dissimilar software |
| kaynak koddan nesne koduna izlenebilirlik analizi | source to object code traceability analysis |
| çevirici dili / çevirici | assembly language / assembler |
| çevirici listesi | assembly listing |
| ters çevirme (nesne kodundan çevirici diline) | disassembly |
| donatma (kapsam için koda sayaç ekleme) | instrumentation |
| donanım izleme | hardware trace |
| temel blok | basic block |
| sözde komut / sabit havuzu | pseudo-instruction / literal pool |
| çağrı kuralı | calling convention |
| hata enjeksiyonu | fault injection |
| derleme | build |
| imaj | image (executable image) |
| sağlama toplamı | checksum |
| döngüsel artıklık denetimi | cyclic redundancy check (CRC) |
| yedeklilik / yedekleme | redundancy |
| çevrimsel karmaşıklık | cyclomatic complexity |
| güvenli durum | safe state |
| emniyet / güvenlik | safety / security |
| uçuşa elverişlilik | airworthiness |
| mürettebat | flight crew |
| seçenekle seçilebilir yazılım | option-selectable software |
| yeniden kullanılabilir yazılım bileşeni | reusable software component (RSC) |
| yazılım sertifikasyon planı | Plan for Software Aspects of Certification (PSAC) |
| yazılım konfigürasyon indeksi | Software Configuration Index (SCI) |
| yazılım yaşam döngüsü ortam konfigürasyon indeksi | Software Life Cycle Environment Configuration Index (SECI) |
| araç başarım özeti | Tool Accomplishment Summary (TAS) |
| araç kalifikasyon planı | Tool Qualification Plan (TQP) |
| araç konfigürasyon indeksi | Tool Configuration Index (TCI) |
| araç operasyonel gereksinimleri | Tool Operational Requirements (TOR) |
| araç kurulum raporu | Tool Installation Report |
| operasyonel doğrulama ve geçerleme | tool operational verification and validation |
| araç geliştiricisi / araç kullanıcısı | tool developer / tool user |

Aynı kavram için şu varyantlar **kullanılmaz**: "baz çizgi", "taban çizgisi", "temel hat"
(temel çizgi); objective anlamında "amaç" (hedef); review anlamında "inceleme" (gözden
geçirme); DO-178C yazılım seviyesi anlamında "güvence seviyesi/düzeyi"; "sertifikasyon
makamı"; "kod üreticisi"; "artefakt"; "mekânsal/zamansal bölümleme"; partition anlamında
"bölme"; "SOI 1" gibi tiresiz yazım (SOI-1 … SOI-4); scheduling anlamında "zamanlama"
(çizelgeleme; "zamanlama" timing içindir); deadline anlamında "son tarih" ya da "termin";
SAS/TAS anlamında "başarı özeti" (yazılım/araç başarım özeti); requirement anlamında
"ister" (gereksinim); IMA için "tümleşik modüler aviyonik" (entegre modüler aviyonik);
redundancy anlamında "artıklık" ya da "redundans" (yedeklilik/yedekleme; CRC'nin yerleşik
adı "döngüsel artıklık denetimi" bunun dışındadır).

## Yeni blog yazısı ekleme

1. Dosya: `blog/YYYY-MM-DD-kisa-slug.mdx` (tarih = yayın tarihi, slug ASCII).
2. Frontmatter şablonu:
   ```mdx
   ---
   title: "Yazının Başlığı"
   description: "Arama sonucunda görünecek, 160 karakteri aşmayan özet."
   slug: kisa-slug
   authors: [serdar]
   tags: [aviyonik, do-178c]
   ---

   Giriş paragrafı (özet olarak listede görünür).

   {/* truncate */}

   Yazının gövdesi…
   ```
3. `{/* truncate */}` işareti **zorunludur**; `onUntruncatedBlogPosts: 'throw'` olduğu
   için işareti olmayan yazı build'i kırar. (MDX'te HTML yorumu `<!-- -->` yazılmaz.)
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
- **Diyagram içerik sütununa okunur boyutta sığmalıdır.** Sütun masaüstünde ~700 px'tir;
  diyagram daha genişse orantılı küçülür ve Mermaid'in 16 px'lik yazısı ufalır. Doğal
  genişlik ~930 px'i (yazı ~12 px) aşmamalıdır. Beş-altı adımlık zincir `flowchart LR` yerine
  `TD` ile yazılır, uzun etiketler `<br/>` ile kırılır; geniş karar ağacında gerekirse
  `config: flowchart: nodeSpacing` verilir. Yön değişince metindeki "soldan sağa" gibi
  atıflar da güncellenir. Telefonda her geniş şekil küçülür; okur onu "Büyüt" düğmesiyle
  tam ekranda açar (`src/components/SekilBuyutme`).
- Kod örnekleri ağırlıklı olarak **C** dilindedir (aviyonik yaygınlığı nedeniyle).
- Her bölüm dosyası `NN-slug.mdx` biçiminde adlandırılır; `sidebar_position` klasör içi
  sırayı belirler. Bölüm başlığı frontmatter `title` alanında verilir.
- Placeholder bölümlerdeki `:::info Bu bölüm hazırlanıyor 🚧` kutusu, içerik yazıldığında
  kaldırılır.

## Plan ve standart şablonları (Ek E) ve kontrol listeleri (Ek F)

- `kitap/06-ekler/05-sablonlar/` (Ek E) PSAC, SDP, SVP, SCMP, SQAP ve üç geliştirme standardı için
  önerilen içindekileri ve bölüm bölüm yazım rehberini verir. 5. bölüm "neden", SOI-1
  "denetimde neye bakılır", bu sayfalar "nasıl yazılır" sorusunu cevaplar; birbirini tekrarlamaz.
- Belge sayfaları aynı iskeleti izler: Bir bakışta → Önerilen içindekiler (`text` bloğu) →
  Bölüm bölüm yazım rehberi (verilecek kararlar, zayıf/güçlü ifade) → Seviyeye göre farklar →
  DO-178C uyum tablosu (+ teknoloji ekleri) → Diğer belgelerle tutarlılık → Sık hatalar →
  Yayımlamadan önce → İlgili bölümler. Ortak ön bölümler, paketleme ve hangi konunun hangi
  belgede tanımlandığı (tutarlılık matrisi) yalnızca `index.mdx`'tedir.
- Şablonlar **doldurmalık metin değil karar listesidir**; hazır plan cümlesi yazılmaz.
- Uyum tablosu DO-178C ve eklerine (DO-331/332/333) **yalnızca madde numarası** ve birkaç
  kelimelik özgün etiketle atıf yapar; standardın madde listesi ya da cümlesi çevrilmez.
  MISRA kural metni yazılmaz, yalnızca kural numarası verilir.
- Seviye, kontrol kategorisi ve Ek A hedef numaraları `src/components/HedefGezgini/veri.ts`
  ile aynı tutulur. Hedef Gezgini'ndeki plan ve standart çipleri bu sayfalara bağlanır
  (`VERILER` içindeki `yol`); sayfa adresi değişirse orası da güncellenir.
- `kitap/06-ekler/06-kontrol-listeleri/` (Ek F) akran gözden geçirmesi ve süreç denetimi
  listeleridir (gözden geçirilen iş ürününün içeriğine bakar); yazarın öz denetimi şablonlardaki
  "Yayımlamadan önce", otorite denetimine hazırlık SOI-1…4 sayfalarıdır. Sayfalar birbirini
  tekrarlamaz.
- Liste maddeleri CSV sözleşmesine uyar: `- [ ] **ÖNEK-NN** Soru? *(SEVİYE · DAYANAK)*`
  (önek 3 büyük ASCII harf, sayfa boyunca 01'den sıralı; devam satırları 6 boşluk; "Evet"
  istenen durumdur). `<ListeIndir>` bileşeni bu maddeleri sayfanın HTML'inden okur; biçim
  bozulursa madde CSV'ye girmez. Numarasız onay kutuları (giriş koşulları) dışa aktarılmaz.
  Seviye etiketleri `veri.ts`'teki hedef geçerliliğiyle tutarlıdır. Maddeler örnek standart
  kural numaralarına (GS-, TS-, KS-) değil konuya atıf yapar.
- Düz metinde `<`, `{`, `}` kullanılmaz (satır içi koda alınır; bkz. "MDX kuralları").
- SOI-1…4 sayfaları `<SoiAsamalari aktif={n} />` ile başlar; aşama adları 12. bölümdeki
  tabloyla aynıdır. Ek C'nin soru tabloları `<TabloIndir>` ile CSV olarak indirilir: başlık
  satırı `sutunlar` ile birebir aynı olan tablolar alınır, tablo başlığı değişirse bileşenin
  `sutunlar` özelliği de değişir.

## Kitap PDF'i

- Kitabın PDF sürümü **elle üretilmez ve depoya konmaz.** `npm run build && npm run pdf`
  (`scripts/kitap-pdf.mjs`) derlenmiş kitap sayfalarını başsız Chromium'da açar, kapak ve
  sayfa numaralı içindekilerle tek belgede birleştirip `build/` altına yazar. `deploy.yml`
  her yayında, `pr-build.yml` her PR'da çalıştırır; adım başarısız olursa site yayımlanmaz.
- Sayfa sırası ve kısımlar `kitapSidebar`'dan gelir (`plugins/kitap-pdf.ts`); yeni bölüm
  PDF'e kendiliğinden girer. PDF'in adresi aynı dosyadaki `KITAP_PDF_PATH` sabitidir; ana
  sayfadaki "PDF indir" düğmesi de onu kullanır.
- `kitap/index.mdx` içindeki "İçindekiler" bölümü PDF'e alınmaz (PDF'in kendi içindekiler
  sayfası vardır); başlığın adı değişirse betikteki `WEB_ONLY_HEADING` güncellenir. Sitedeki
  içindekiler elle yazılmaz: `<KitapIcindekiler />` ana sayfayla aynı veriden üretir.
- Yalnızca ekranda anlamlı MDX bileşenleri (arama kutusu, gezinme şeridi) kök öğelerine
  `data-pdf-disi` verir; betik bunları PDF'ten çıkarır. Şekil (`figure`) ve araç kartı
  (`aside`) PDF'te kalır ve sayfa arasında bölünmez (`kitap-pdf.css`).
- Baskı düzeni `scripts/kitap-pdf.css` içindedir. PDF'te sitedeki değişken yazı tipi
  yerine `@fontsource/ibm-plex-sans` paketinin statik dosyaları kullanılır: değişken yazı
  tipi PDF'e harf harf konumlanan Type 3 olarak gömülür, dosyayı büyütür ve metin seçimini
  bozar. PDF için eklenen paketlerde kurulum betiği (postinstall) bulunmamalıdır.
- Kitap sayfalarındaki WebP görseller PDF'te JPEG'e çevrilir (PDF'te WebP yoktur);
  saydamlık ya da keskin kenar gerektiren görsel PNG olmalıdır.
- Tarayıcı sürümü `playwright-core` ile sabittir; yerelde kurulu değilse betik makinedeki
  Google Chrome'u kullanır (`npx playwright-core install chromium-headless-shell` ile
  CI'dakiyle aynı sürüm kurulabilir).

## Kütüphane sayfası kuralları

- Her kitap sayfası: künye (yazar, yayınevi, yıl/baskı, odak, seviye, kimin için) +
  **özgün** tanıtım (kitaptan alıntı/çeviri YASAK) + sitedeki kitap bölümlerine bağlantı.
- Künye tablo olarak değil `<Kunye>` bileşeniyle yazılır; alanlar özelliktir (`yazar`,
  `editor`, `yayinevi`, `yayimci`, `yil`, `baski`, `surum`, `tur`, `odak`, `seviye`,
  `kimin`), etiket ve sıra bileşendedir. Birden çok yazar dizi olarak verilir
  (`yazar={["A", "B"]}`, etiket "Yazarlar" olur). `seviye` "Başlangıç", "Orta", "İleri" ya
  da aralığıdır ("Başlangıç–Orta"; parantez içinde not eklenebilir); tanınmayan değer
  derlemeyi durdurur.
- **Kapak görseli** `<Kunye>`'nin çocuğu olarak Markdown görseli biçiminde yazılır
  (başlığın hemen altında; görsel işleme, öncelikli yükleme ve ana sayfadaki kapak listesi
  bu kalıba bağlıdır); görsel *yerel* olarak
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

## Araçlar bölümü

- Giriş sayfası (`araclar/index.mdx`) araçları **elle listelemez**; `<AracKatalogu />`
  `plugins/homepage-data.ts`'in `araclarSidebar`'dan ürettiği listeyi kategoriye göre
  gösterir. Araç sayfasının frontmatter'ı katalog şemasını ve özellik etiketlerini verir:
  ```yaml
  hide_table_of_contents: true
  sidebar_custom_props:
    simge: harita            # src/components/AracKatalogu/Simgeler.tsx içindeki anahtar
    ozellikler: [Arama, Tam ekran, Gömülebilir]
  ```
- Araç sayfalarında **araç önce gelir**: başlık + kısa giriş paragrafının hemen
  ardından bileşen, açıklamalar altta. İçerik sütunu bu sayfalarda geniştir
  (`.plugin-id-araclar`), düz metin blokları okunur genişlikte kalır.
- Kategoriler ayrı dizin sayfası üretmez (`_category_.json` içinde `link` yok);
  eski `/araclar/category/...` adresleri `redirects` ile `/araclar`'a yönlenir.
- **Navigasyon haritası verisi** elle düzenlenmez: `node scripts/navigasyon-verisi.mjs`
  (poppler'ın `pdftotext` aracı gerekir) AIP Türkiye'nin meydan listesini (AD 0.6, AD 1.3),
  ENR 4.1'i ve her meydanın AD 2 (2.1–2.2 genel bilgi, 2.12 pistler, 2.14 ışıklar, 2.18 frekanslar,
  2.19 yardımcılar) ile
  heliportların AD 3 bölümlerini indirip `scripts/aip-ayristir.mjs` ile ayrıştırır; AIP'de
  olmayan tesisleri OurAirports'tan ekler ve `static/data/turkiye-navigasyon.json`'u yeniden
  yazar. OurAirports'ta farklı kodla kayıtlı AIP meydanları betikteki `ICAO_ALIASES`
  tablosuyla eşlenir. AIP istasyon bazında manyetik sapma yayımlamadığından istasyonlara
  bağlı/en yakın meydanın AD 2.2 değeri verilir (kaynağı `varSrc` alanında). Her AIRAC
  döngüsünde (28 gün) yeniden çalıştırılması önerilir. Ayrıştırıcı değişirse çıktı,
  AIP'deki birkaç meydanla (ör. LTAC'ın altı ILS'i) elle karşılaştırılır.
  ILS'lerin GP frekansı, LOC frekansının ICAO eşiyle (`src/components/KanalTablosu/gs-eslemesi.mjs`)
  denetlenir; uymazsa betik uyarı verir, AIP değeri `gpFreq`'te korunur ve eşin değeri
  `gpFreqIcao`'ya yazılır (harita ikisini birlikte gösterir; ör. LTAG IDAN, AIP'de 322.0 MHz).
- **AIP Türkiye kullanım izni:** AIP telifle korunur (GEN 0.1, madde 5). DHMİ, Ekim
  2026'da **ticari olmayan kullanımda kaynak gösterilmesi** koşuluyla izin vermiştir
  (izin yazısı depo sahibindedir). Bu yüzden: site ticari hâle getirilmez/reklam
  almaz; haritada "AIP Türkiye © DHMİ (AMDT nn/yy)" atfı (harita köşesi + durum
  çubuğu) ve araç sayfasındaki kaynak bölümü kaldırılmaz; AIP PDF'leri depoya ya da
  siteye konmaz, yalnızca ayrıştırılmış olgusal alanlar kullanılır. Sayfadaki
  "seyrüsefer amaçlı kullanılmaz" uyarısı korunur.
- Leaflet'in `leaflet.css` dosyası **import edilmez** (tüm CSS tek `styles.css`'e
  girer); gereken çekirdek kurallar `src/components/LeafletCekirdek/leaflet.module.css`
  içinde `.leaflet` kapsamındadır. Harita kullanan bileşen köküne bu sınıfı verir ve modülü
  kendi CSS modülünden **sonra** import eder (eşit özgüllükte çekirdek sonda kalır).
  Altlık karoları harici servislerden (OpenStreetMap, OpenTopoMap) gelir ve atıf
  satırı korunur; API anahtarı isteyen servis kullanılmaz.
- Gömme sayfaları (`src/pages/gom/`) `Layout` kullanmaz, `noindex` taşır ve
  sitemap'ten `'/gom/**'` ile dışlanır.
- **Konnektör yerleşim verisi** (`static/data/konnektor/mil-dtl-38999.json`) elle
  düzenlenmez: `python3 scripts/konnektor/veri_uret.py std1560.txt` MIL-STD-1560C'nin
  `pdftotext -layout` çıktısını `yerlesim_ayristir.py` ile ayrıştırır. Ayrıştırıcının
  çözemediği ya da standardın kendisinde yazım hatası olan yerleşimler, şekille
  karşılaştırılıp `scripts/konnektor/duzeltmeler.json`'a PDF sayfa numarası ve gerekçesiyle
  yazılır; doğrulamadan geçemeyen yerleşim çıktıya alınmaz. Standart PDF'leri (ASSIST)
  depoya konmaz. Konumlar pin yerleşiminin ön yüzü içindir; soket ve arka yüz aynadır.
- **DO-178C hedef verisi** (`src/components/HedefGezgini/veri.ts`) standardın Ek A
  tablolarıyla karşılaştırılarak girilmiştir: geçerlilik (seviye başına bağımsızlıkla /
  gerekli / aranmaz), bölüm atfı, çıktı verisi ve kontrol kategorisi. Hedef başlıkları ve
  açıklamaları **özgün özettir**; standardın cümlesi ya da çevirisi yazılmaz. Dosyanın
  sonundaki sağlama, toplamlar 71/69/62/26 hedef ve 30/18/5/2 bağımsızlıktan saparsa
  derlemeyi durdurur. Araç sayfasındaki şekiller ve tablo (`SeviyeOzeti.tsx`) sayıları bu
  veriden hesaplar; sayfa metnindeki sayılar ve adım farkları da MDX ifadeleriyle
  (`{say('D').hedef}`, `{artis('D', 'C')}`) aynı veriden gelir. Kitapta hedef sayısı geçen
  tablolar (3., 4. bölüm) ve ekleri olmayan cümleler de `say()` kullanır; sayıya ek alan
  ("30'dan 18'e") metin elle yazılır, ünlü uyumu sayıya bağlıdır. Teknoloji eklerinin
  (DO-331/332/333) ve DO-330'un tabloları kapsam dışıdır.
- **Görev çizelgeleme aracında** hesap tam sayı mikrosaniyeyle yapılır
  (`src/components/GorevCizelgeleme/cizelgeleme.ts`; kayan nokta tavan/taban işlemlerini
  bozar). Analiz (fazdan bağımsız en kötü durum) ile benzetim (girilen fazlarla tek çizelge)
  ayrı sütunlardır ve biri diğerinin yerine gösterilmez; biçimsel testi olmayan kip
  (kesintisiz EDF) "karar benzetime dayanır" diye işaretlenir. Sabit nokta yinelemeleri
  adım bütçesiyle sınırlıdır; bütçe biterse sonuç "sınırsız" değil "belirsiz" sayılır.
  Çekirdek değişirse bilinen bir örnekle karşılaştırılır (tablo sırası, kesintili:
  T=70/C=26 ve T=100/C=62 → ikinci görevin en kötü tepki süresi 118 ms).
- **Radyo kapsama aracı** model tahminidir, ölçüm değildir; sayfadaki "seyrüsefer amaçlı
  kullanılmaz" uyarısı ve "Sınırlar" bölümü korunur. Yol kaybı serbest uzay kaybı ile ITU-R
  P.526 Bullington kırınımının toplamıdır, dünya eğriliği 4/3 etkin yarıçapla eklenir
  (`yayilim.ts`; dosya sonundaki sağlama tutmazsa derleme durur). Verici gücü ve anten
  kazancı AIP'de yoktur: `index.tsx`'teki `BILESENLER` tipik değerlerdir ve sayfada öyle
  anılır, AIP verisiymiş gibi gösterilmez. Arazi, AWS Open Data'daki Terrain Tiles
  karolarından tarayıcıda indirilir (anahtar yok; atfı harita köşesinde ve sayfada korunur);
  depoya yükseklik verisi konmaz. Hesap ana iş parçacığında parçalar hâlinde yapılır; yarıçap
  önce deniz seviyesine göre seçilir, kapsama çok daha darsa daraltılıp yinelenir. Kapsama
  renkleri hem CSS'te (`--rk-*`, lejant) hem `PALETLER`'de (harita görüntüsü) durur, birlikte
  değiştirilir. NDB ve ILS kapsam dışıdır (yer dalgası; yönlü anten).
- **VOR/ILS/DME kanal tablosu** elle yazılmaz: `src/components/KanalTablosu/kanallar.ts`
  252 DME kanalını (1X–126Y) ICAO Ek 10 Cilt I eşleme kuralından hesaplar; yalnızca
  LOC → GS eşlemesi listedir. Frekanslar tam sayı kHz tutulur. Dosya sonundaki sağlama
  (252 kanal; 160 VOR, 40 LOC, 52 eşsiz; 40 farklı GS; uç değerler) tutmazsa derleme durur.
  Türkiye sütunu navigasyon haritasının veri dosyasından gelir; AIP atfı tablonun altında
  korunur.
- Konnektör aracında sinyal türü renkleri CSS değişkenleridir (açık/koyu tema); sunucuda
  üretilen HTML temadan bağımsız kalsın diye renk bileşende seçilmez. Dışa aktarım paleti
  (`veri.ts`, `ACIK`) CSS'teki açık tema değerleriyle aynı tutulur. Paylaşım bağlantısı
  adresin `#d=` kısmındadır (sunucuya gitmez) ve uygulandıktan sonra adresten silinir.

## İletişim ve canlı sohbet

- `/iletisim` sayfası e-posta ve GitHub yollarını her zaman gösterir. E-posta `<Eposta>`
  ile verilir (`noscriptHint` sayfada tek yerde); yanıt süresi sözü verilmez.
- **Canlı sohbet isteğe bağlıdır:** yalnızca `TAWK_TO_ID` depo değişkeni
  (`<propertyId>/<widgetId>`) tanımlıysa görünür; değer `customFields.tawkToId` ile
  tarayıcıya geçer. Tawk.to hesabını ve değişkeni depo sahibi açar. Sohbetle ilgili metin
  MDX'e değil `useSohbet().yapilandirildi` koşuluna bağlı bileşene yazılır; yoksa
  yapılandırılmamış sitede de görünür.
- Tawk betiği sayfa açılışında **yüklenmez**; yalnızca ziyaretçi sohbet düğmesine bastığında
  yüklenir (performans ve çerez). Açılışta yüklemeye çevrilirse çerez onayı gerekir.
- Yüzen düğme düz laciverttir, z-index'i 150'dir (navbar 200'ün ve tam ekran araçların
  altında), `/gom/` sayfalarında ve yazdırmada görünmez. Sağ alt köşeye başka sabit öğe
  eklenirse `custom.css`'teki `html[data-canli-sohbet] .theme-back-to-top-button` kuralı
  birlikte düşünülür.
- Tema, bağımsız MDX sayfalarına (`src/pages/*.mdx`) `.markdown` sınıfını vermez; içerik
  `<IletisimSayfasi>` gibi `markdown` sınıflı bir sarmalayıcıya alınır.

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

## MDX kuralları

Tüm içerik sayfaları (blog, kitap, kütüphane, araçlar, `src/pages/*.mdx`) MDX'tir ve
`markdown.format: 'mdx'` ile derlenir; `.md` uzantılı yeni bir sayfa da MDX olarak ayrıştırılır,
yine de yeni sayfalar `.mdx` uzantısıyla açılır.

- **Sözdizimi:** düz metinde `<` ve `{` JSX başlatır; bu karakterler satır içi koda alınır
  (`` `a < b` ``) ya da kaçırılır (`\<`, `\{`). HTML yorumu yerine `{/* … */}`; `<br>` yerine
  `<br />`; `<https://…>` biçimli otomatik bağlantı yerine `[adres](adres)` yazılır. Kod
  çitlerinin ve satır içi kodun içi olduğu gibi kalır.
- **İçe aktarma:** `import` satırları frontmatter'ın hemen altında, ilk içerikten önce durur.
  Bileşenler `@site/src/components/…` yoluyla alınır (genel MDX bileşeni kaydı yoktur;
  sayfada ne kullanıldığı başından okunur).
- **Bileşen ne zaman:** tekrar eden bir yapı (künye, araç kartı, aşama şeridi), elle tutulunca
  eskiyen bir liste (içindekiler) ya da veri dosyasında zaten bulunan bir sayı (DO-178C hedef
  sayıları) için. Düz anlatım, tablo, liste ve admonition Markdown olarak kalır; bileşen
  yalnızca görünüm için eklenmez.
- **Veri tek yerden:** sayı ya da liste bir veri dosyasında varsa sayfaya elle yazılmaz;
  MDX ifadesiyle alınır (`{say('A').hedef}`). Sayfaya özgü küçük hesaplar `export const`
  ile sayfada tanımlanabilir (bkz. Hedef Gezgini sayfasındaki `artis`).
- **Sunucuda tam çıktı:** bileşenin içeriği sunucu çıktısında (HTML) eksiksiz bulunur; site
  içi arama, meta açıklaması ve kitap PDF'i HTML'den beslenir. Yalnızca tarayıcıda anlamlı
  denetimler (düğme, arama kutusu) istemcide çizilebilir ya da `data-pdf-disi` taşır.
- **Bağlantılar:** bileşen içindeki iç bağlantılar `@docusaurus/Link` ile verilir (kırık bağlantı
  denetimine girer). Başlık çapası olmayan `#…` eki (araç paylaşım verisi) taşıyan bağlantı
  düz `<a>` olur; adresi bileşen başka yoldan doğrular (bkz. `AracKarti`).
- **Meta açıklaması:** `plugins/meta-description.ts` ilk düz metin paragrafını alırken satır
  başındaki JSX öğelerini (çok satırlı özellikleri ve çocuklarıyla), `import`/`export`
  satırlarını ve `{/* */}` yorumlarını atlar. İlk paragrafa MDX ifadesi (`{…}`) yazılmaz.
- **Görsel önceliği:** `plugins/remark-lcp-image.ts` ilk üç görünür bloğa bakar; `import` ve
  `export` blok sayılmaz, bileşenin çocuğundaki görsel de bulunur.

## Kalite kuralları

- Her değişiklikten sonra **`npm run build` uyarısız/hatasız** geçmelidir.
  Yapılandırma katıdır: `onBrokenLinks`, `onBrokenAnchors`,
  `markdown.hooks.onBrokenMarkdownLinks`, `onInlineTags`, `onInlineAuthors`,
  `onUntruncatedBlogPosts` hepsi `'throw'`.
- **Kırık link bırakılmaz.** İç bağlantılar göreli yol veya doküman id'si ile verilir.
- İçerik sayfaları `.mdx`'tir; kurallar için "MDX kuralları" bölümüne bakınız.
- Başlıklı admonition **köşeli parantezle** yazılır: `:::tip[Başlık]` (depodaki yerleşik
  biçim; boşluklu `:::tip Başlık` kullanılmaz).
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
  Markdown'dan gelmeyen sayfalar (`src/pages/*.tsx`, 404, arama, blog etiket/yazar
  listeleri) açıklamayı kendileri verir: `<PageMetadata description>` ya da `<Head>` içinde
  `<meta name="description">`. `plugins/font-preload.ts` build sonunda her sayfayı denetler;
  açıklaması olmayan ya da boş olan sayfa derlemeyi durdurur (redirect stub'ları hariç).
  Site içi aramada dizinlenen bir liste sayfasına açıklama eklenirse aramada başlıksız
  sonuç çıkıp çıkmadığına bakılır (bu yüzden `/blog/archive` ve `/blog/authors` aramanın
  `ignoreFiles` listesindedir). Blog arşivinin açıklaması (sayfada alt başlık olarak da
  görünür) `i18n/tr/code.json`'daki `theme.blog.archive.description` çevirisidir.
- **Görseller:** fotoğraf/illüstrasyonlar en fazla ~800 px genişliğe küçültülüp WebP
  (kalite ~78) olarak kaydedilir; diyagram ve ekran görüntüleri PNG kalabilir.
  Yüzlerce KB'lık görsel eklenmez. Her görselin **Türkçe alt metni** vardır
  (`![](...)` biçiminde boş alt metin bırakılmaz).
- Sayfanın ilk üç bloğundaki ilk görsel (blog kapağı, kütüphane kapağı) LCP adayıdır;
  `plugins/remark-lcp-image.ts` onu `loading="eager"` + `fetchpriority="high"` yapar,
  diğer görseller tembel yüklenir. Büyük bir kapak görseli bu yüzden doğrudan sayfa
  açılışını yavaşlatır.
- **Sitemap:** `<lastmod>` her dosyanın son git commit zamanından (tarih + saat) üretilir;
  bunun için `showLastUpdateTime: true` ve `deploy.yml`'deki `fetch-depth: 0` korunur. Etiket,
  arşiv ve yazar listeleri sitemap'e alınmaz. `static/robots.txt` sitemap'i gösterir.
- **IndexNow:** her yayında `scripts/indexnow.mjs` yeni derlemenin sitemap'ini yayındakiyle
  karşılaştırır; yeni, `<lastmod>`'u değişmiş ve kaldırılmış adresler dağıtımdan sonra
  `api.indexnow.org`'a gönderilir (Bing, Yandex, Seznam, Naver, Yep … hepsine iletilir;
  Google IndexNow'u desteklemez). Değişmeyen sayfalar yeniden gönderilmez; tümünü göndermek
  için deploy.yml elle "tüm sayfalar" seçilerek çalıştırılır. Anahtar `static/` altındaki,
  adı içeriğiyle aynı `.txt` dosyasıdır; herkese açıktır (gizli değildir). Dosya silinir ya
  da adı içeriğiyle uyuşmazsa PR derlemesi durur. Anahtar değişirse ilk yayında tüm sayfalar
  yeniden bildirilir. Alan adı `static/CNAME`'den okunur.
- **Site kimliği:** her sayfada `docusaurus.config.ts` içindeki `identityGraph`
  (schema.org `Organization` + `Person` + `WebSite`, `@id` ile bağlı) bulunur; Google
  bunu site adı ve kimlik bilgisi için kullanabilir. Yalnızca depoda doğrulanabilen
  alanlar yazılır (uydurma profil, adres, puan eklenmez). Site ve kitap gönüllü bir grubun
  ortak işidir: `WebSite`, `Book` ve `TechArticle`'ın yazarı `Organization`'dır, `Person`
  yalnızca kurucu olarak bağlanır; `author` meta etiketi ve PDF'in yazarı "Aviyonik Yazılım
  topluluğu"dur (blog yazılarının yazarı `authors.yml`'den gelir). `/kitap` sayfası `Book` ve
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
  kartı, Markdown kütüphanesi — sayılmaz). Footer ve MDX içeriğinde `mailto:`
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
- **Analitik, Search Console ve canlı sohbet** yalnızca `GA_MEASUREMENT_ID` /
  `GOOGLE_SITE_VERIFICATION` / `TAWK_TO_ID` depo değişkenleri tanımlıysa eklenir; kodda
  kimlik tutulmaz (bkz. `SEO.md`). Yeni değişken `deploy.yml`'deki `env` bloğuna da eklenir.
- GitHub Pages tüm dosyaları `Cache-Control: max-age=600` ile sunar ve bu depodan
  değiştirilemez (ayrıntı: README, "Uzun önbellek süresi").

## Yayın akışı

1. Değişiklikler bir **dal** üzerinde yapılır.
2. **PR** açılır, gözden geçirilir. `.github/workflows/pr-build.yml` PR'da siteyi derler;
   kırık bağlantı ya da çapa gibi build'i durduran hatalar merge'den önce görünür.
3. `main`'e **merge** edilince `.github/workflows/deploy.yml` otomatik olarak build alıp
   GitHub Pages'e dağıtır.

## Yerel komutlar

```bash
npm start        # geliştirme sunucusu (canlı önizleme)
npm run build    # üretim derlemesi (uyarısız geçmeli)
npm run pdf      # build çıktısından kitabın PDF'ini üretir (build/ altına)
npm run serve    # build çıktısını yerelde sunar
```
