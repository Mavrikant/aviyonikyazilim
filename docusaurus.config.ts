import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Aviyonik Yazılım',
  tagline: 'Aviyonik yazılım, test ve sertifikasyon',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://karaman.dev',
  baseUrl: '/aviyonikyazilim/',
  trailingSlash: false,

  // GitHub Pages deployment config.
  organizationName: 'mavrikant',
  projectName: 'aviyonikyazilim',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',

  markdown: {
    format: 'detect',
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'kutuphane',
        path: 'kutuphane',
        routeBasePath: 'kutuphane',
        breadcrumbs: true,
        sidebarPath: './sidebarsKutuphane.ts',
        editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
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
        },
        blog: {
          routeBasePath: 'blog',
          blogTitle: 'Blog',
          blogDescription: 'Aviyonik yazılım, test ve sertifikasyon üzerine yazılar',
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Aviyonik Yazılım Blog',
            description: 'Aviyonik yazılım, test ve sertifikasyon üzerine yazılar',
          },
          editUrl: 'https://github.com/Mavrikant/aviyonikyazilim/edit/main/',
          onInlineTags: 'throw',
          onInlineAuthors: 'throw',
          onUntruncatedBlogPosts: 'throw',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
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
      links: [
        {
          title: 'İçerik',
          items: [
            {label: 'Kitap', to: '/kitap'},
            {label: 'Blog', to: '/blog'},
            {label: 'Kütüphane', to: '/kutuphane'},
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
          title: 'Bağlantılar',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Mavrikant/aviyonikyazilim',
            },
            {
              label: 'RSS',
              href: 'https://karaman.dev/aviyonikyazilim/blog/rss.xml',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} M. Serdar Karaman · İçerik <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.tr">CC BY-SA 4.0</a> lisansı ile lisanslanmıştır.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['c'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
