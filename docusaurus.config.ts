import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import homepageData from './plugins/homepage-data';
import fontPreload from './plugins/font-preload';
import {parseFrontMatter} from './plugins/meta-description';
import remarkLcpImage from './plugins/remark-lcp-image';
import llmsTxt from './plugins/llms-txt';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const SITE_URL = 'https://aviyonikyazilim.com';
// Ana sayfanın meta açıklamasıyla (src/pages/index.tsx, DESCRIPTION) aynı metin.
const SITE_DESCRIPTION =
  'DO-178C ekseninde emniyet-kritik aviyonik yazılım, test ve sertifikasyon: açık kaynak Türkçe kitap, teknik blog yazıları ve tarayıcıda çalışan araçlar.';

// Analitik ve arama konsolu doğrulaması, depo değişkenlerinden (GitHub: Settings →
// Variables → Actions) gelir; değer yoksa build'e hiçbir şey eklenmez. Ayrıntı: SEO.md
// Boş değer "tanımlı değil" demektir; dolu ama biçimi geçersiz bir değer (yazım hatası,
// fazladan boşluk) build'i durdurmaz ama uyarıyla yok sayılır.
function envValue(name: string, pattern: RegExp): string | undefined {
  const value = (process.env[name] ?? '').trim();
  if (!value) {
    return undefined;
  }
  if (!pattern.test(value)) {
    console.warn(`[config] ${name} geçersiz biçimde, yok sayıldı.`);
    return undefined;
  }
  return value;
}

const GA_MEASUREMENT_ID = envValue('GA_MEASUREMENT_ID', /^G-[A-Z0-9]{4,}$/);
const GOOGLE_SITE_VERIFICATION = envValue('GOOGLE_SITE_VERIFICATION', /^[\w-]{20,}$/);

// Her sayfada bulunan site kimliği (schema.org). Varlıklar @id ile birbirine bağlıdır;
// kişi ve kuruluş bilgisi yalnızca depoda doğrulanabilen alanlardan oluşur.
const identityGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Aviyonik Yazılım',
      alternateName: 'aviyonikyazilim.com',
      url: `${SITE_URL}/`,
      // Google, kuruluş logosu için en az 112x112 px istiyor; SVG'nin bildirilen boyutu 64 px.
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/img/logo-256.png`,
        contentUrl: `${SITE_URL}/img/logo-256.png`,
        width: 256,
        height: 256,
      },
      description: SITE_DESCRIPTION,
      founder: {'@id': `${SITE_URL}/#person`},
      sameAs: ['https://github.com/Mavrikant/aviyonikyazilim'],
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'M. Serdar Karaman',
      jobTitle: 'Aviyonik Yazılım Mühendisi',
      url: `${SITE_URL}/blog/authors/serdar`,
      sameAs: ['https://github.com/Mavrikant'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Aviyonik Yazılım',
      alternateName: 'aviyonikyazilim.com',
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: 'tr',
      license: 'https://creativecommons.org/licenses/by-sa/4.0/',
      publisher: {'@id': `${SITE_URL}/#organization`},
      author: {'@id': `${SITE_URL}/#person`},
    },
  ],
};

const config: Config = {
  title: 'Aviyonik Yazılım',
  tagline: 'Aviyonik yazılım, test ve sertifikasyon',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: SITE_URL,
  baseUrl: '/',
  trailingSlash: false,
  // baseUrl uyarı kutusu yalnızca ana sayfaya, içinde style="…" dizgeleri bulunan bir betik
  // metni olarak eklenir; SEO denetim araçları bunu "satır içi stil" sayabilir. baseUrl '/'
  // ve alan adı kökünde yayın yapıldığı için gereksizdir (hata ayıklarken geçici olarak true yapın).
  baseUrlIssueBanner: false,

  headTags: [
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify(identityGraph),
    },
  ],

  // GitHub Pages deployment config.
  organizationName: 'mavrikant',
  projectName: 'aviyonikyazilim',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    format: 'detect',
    mermaid: true,
    // description frontmatter'ı yoksa ilk paragraftan meta açıklaması üretir.
    parseFrontMatter,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    // Site içi arama: dizin build sırasında üretilir, tarayıcıda çalışır (harici servis yok).
    // Arayüz metinlerinin Türkçesi i18n/tr/code.json içindedir.
    [
      '@easyops-cn/docusaurus-search-local',
      {
        // lunr-languages Türkçe kök ayırıcısı: "gereksinimlerin" araması "gereksinim"i bulur.
        language: 'tr',
        hashed: true,
        docsRouteBasePath: ['kitap', 'kutuphane', 'araclar'],
        docsDir: ['kitap', 'kutuphane', 'araclar'],
        blogRouteBasePath: 'blog',
        blogDir: 'blog',
        explicitSearchResultPath: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  plugins: [
    // Ana sayfa listelerini (kitap, son yazılar, kütüphane, araçlar) build sırasında üretir.
    homepageData,
    // Build sonrası her sayfaya IBM Plex Sans preload ekler ve gizli SVG ikon deposunun
    // satır içi stilini CSS sınıfına çevirir (aynı HTML geçişi).
    fontPreload,
    // Build sonrası llms.txt üretir (yapay zekâ tarayıcıları için site haritası).
    llmsTxt,
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'kutuphane',
        path: 'kutuphane',
        routeBasePath: 'kutuphane',
        breadcrumbs: true,
        sidebarPath: './sidebarsKutuphane.ts',
        editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
        showLastUpdateTime: true,
        remarkPlugins: [remarkLcpImage],
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'araclar',
        path: 'araclar',
        routeBasePath: 'araclar',
        breadcrumbs: true,
        sidebarPath: './sidebarsAraclar.ts',
        editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
        showLastUpdateTime: true,
        remarkPlugins: [remarkLcpImage],
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        // Eski Blogger yolları → yeni Docusaurus URL'leri.
        // Not: trailingSlash:false iken eklenti .html yolları için `foo.html.html`
        // üretir; birebir `foo.html` isteklerini static/ altındaki stub dosyaları karşılar.
        redirects: [
          {from: ['/2024/03/yapsal-kapsam-analizi-structural', '/2024/03/yapsal-kapsam-analizi-structural.html'], to: '/blog/yapisal-kapsam-analizi'},
          {from: ['/2023/11/scada-cover-edilemeyen-kodlar-olu', '/2023/11/scada-cover-edilemeyen-kodlar-olu.html'], to: '/blog/sca-cover-edilemeyen-kodlar'},
          {from: ['/2023/08/afdx-nedir', '/2023/08/afdx-nedir.html'], to: '/blog/afdx-nedir'},
          {from: ['/2023/08/havaclgn-kalbindeki-iletisim-arinc-429', '/2023/08/havaclgn-kalbindeki-iletisim-arinc-429.html'], to: '/blog/arinc-429'},
          {from: ['/2023/08/aviyonik-nedir', '/2023/08/aviyonik-nedir.html'], to: '/blog/aviyonik-nedir'},
          {from: ['/p/ksaltmalar', '/p/ksaltmalar.html'], to: '/kitap/kaynaklar/kisaltmalar'},
          {from: ['/p/sw-soi-1', '/p/sw-soi-1.html'], to: '/kitap/kaynaklar/soi-1'},
          {from: ['/p/sw-soi-2', '/p/sw-soi-2.html'], to: '/kitap/kaynaklar/soi-2'},
          {from: ['/p/sw-soi-3', '/p/sw-soi-3.html'], to: '/kitap/kaynaklar/soi-3'},
          {from: ['/p/sw-soi-4', '/p/sw-soi-4.html'], to: '/kitap/kaynaklar/soi-4'},
          // Kütüphane kategori sayfalarının Türkçe karakter içeren eski adresleri (ASCII'ye taşındı).
          {from: '/kutuphane/category/emniyet-mühendisliği', to: '/kutuphane/category/emniyet-muhendisligi'},
          {from: '/kutuphane/category/gömülü-ve-gerçek-zamanlı-yazılım', to: '/kutuphane/category/gomulu-ve-gercek-zamanli-yazilim'},
          {from: '/kutuphane/category/standartlar-ve-kılavuz-dokümanlar', to: '/kutuphane/category/standartlar-ve-kilavuz-dokumanlar'},
        ],
      },
    ],
  ],

  i18n: {
    defaultLocale: 'tr',
    locales: ['tr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'kitap',
          routeBasePath: 'kitap',
          breadcrumbs: true,
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
          // Sayfada "Son güncelleme" tarihi; sitemap <lastmod> da bu veriden beslenir.
          showLastUpdateTime: true,
          // Sayfa başındaki görsel (LCP adayı) tembel yüklenmesin.
          remarkPlugins: [remarkLcpImage],
        },
        blog: {
          routeBasePath: 'blog',
          blogTitle: 'Blog',
          blogDescription: 'Aviyonik yazılım, test ve sertifikasyon üzerine yazılar',
          blogSidebarTitle: 'Son yazılar',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Aviyonik Yazılım Blog',
            description: 'Aviyonik yazılım, test ve sertifikasyon üzerine yazılar',
          },
          editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
          showLastUpdateTime: true,
          remarkPlugins: [remarkLcpImage],
          onInlineTags: 'throw',
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'throw',
        },
        theme: {
          customCss: ['./src/css/fonts.css', './src/css/custom.css'],
        },
        // Google Analytics 4: yalnızca GA_MEASUREMENT_ID tanımlıysa eklenir.
        ...(GA_MEASUREMENT_ID ? {gtag: {trackingID: GA_MEASUREMENT_ID, anonymizeIP: true}} : {}),
        sitemap: {
          // Son değişiklik tarihi git geçmişinden okunur (showLastUpdateTime +
          // deploy.yml'deki fetch-depth: 0 gerektirir).
          // Google changefreq/priority alanlarını yok sayar.
          lastmod: 'date',
          changefreq: null,
          priority: null,
          // Yalnızca liste işlevi gören, özgün içeriği olmayan sayfalar.
          ignorePatterns: ['/blog/tags/**', '/blog/archive', '/blog/authors/**', '/blog/page/**'],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    // Genel `keywords` etiketi yalnızca ana sayfadadır (src/pages/index.tsx): site içi arama
    // her sayfanın keywords etiketini ayrı bir sonuç olarak dizinler; tüm sayfalarda aynı
    // etiket bulunursa "ARINC 429" gibi aramalar ilgisiz sayfalarla dolar. Blog yazıları
    // kendi `keywords` frontmatter'ını kullanır.
    metadata: [
      {name: 'author', content: 'M. Serdar Karaman'},
      ...(GOOGLE_SITE_VERIFICATION
        ? [{name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION}]
        : []),
    ],
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Aviyonik Yazılım',
      logo: {
        alt: 'Aviyonik Yazılım — yapay ufuk logosu',
        src: 'img/logo.svg',
        width: 34,
        height: 34,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'kitapSidebar',
          position: 'left',
          label: 'Kitap',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'docSidebar',
          sidebarId: 'kutuphaneSidebar',
          docsPluginId: 'kutuphane',
          position: 'left',
          label: 'Kütüphane',
        },
        {
          type: 'docSidebar',
          sidebarId: 'araclarSidebar',
          docsPluginId: 'araclar',
          position: 'left',
          label: 'Araçlar',
        },
        {to: '/kitap/kaynaklar/kisaltmalar', label: 'Kısaltmalar', position: 'left'},
        {
          href: 'https://github.com/Mavrikant/aviyonikyazilim',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub deposu',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Aviyonik Yazılım — yapay ufuk logosu',
        src: 'img/logo.svg',
        href: '/',
        width: 46,
        height: 46,
      },
      links: [
        {
          title: 'İçerik',
          items: [
            {label: 'Kitap', to: '/kitap'},
            {label: 'Blog', to: '/blog'},
            {label: 'Kütüphane', to: '/kutuphane'},
            {label: 'Araçlar', to: '/araclar'},
            {label: 'Ekler', to: '/kitap/ekler/ek-a-ornek-gecis-kriterleri'},
          ],
        },
        {
          title: 'Başvuru',
          items: [
            {label: 'Kısaltmalar', to: '/kitap/kaynaklar/kisaltmalar'},
            {label: 'SOI denetimleri', to: '/kitap/kaynaklar/soi-1'},
            {label: 'Giriş bölümü', to: '/kitap/giris/giris-ve-genel-bakis'},
          ],
        },
        {
          title: 'Topluluk',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Mavrikant/aviyonikyazilim',
            },
            {
              label: 'Kitap önerin',
              to: '/#katki',
            },
            {
              label: 'RSS',
              href: 'https://aviyonikyazilim.com/blog/rss.xml',
            },
          ],
        },
      ],
      copyright: `Emniyet-kritik aviyonik yazılım için Türkçe, açık kaynak başucu kitabı.<br/>İçerik <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.tr">CC BY-SA 4.0</a> lisansı ile lisanslanmıştır.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['c'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
