import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Props} from '@theme/DocBreadcrumbs/StructuredData';

// Eject swizzle: özgün DocBreadcrumbs/StructuredData'nın üç sorunu giderilir.
//  1. Google, BreadcrumbList için en az iki ListItem ister. Özgün sürüm bağlantısı olmayan
//     kısım başlıklarını eler ve ana sayfayı eklemez; bu yüzden kitap bölümlerinde tek öğeli
//     (geçersiz) liste çıkıyordu. Görünen kırıntı yolu "ana sayfa > … > sayfa" olduğu için
//     ana sayfa ilk öğe olarak eklenir; yine de iki öğeden azsa hiçbir şey yazılmaz.
//  2. Adresler `trailingSlash: false` ayarına uyar. Özgün sürüm kök belgeler için "/kitap/"
//     üretiyordu; GitHub Pages'te bu adres 404 verir ve sayfanın kanonik adresinden ("/kitap")
//     farklıdır.
//  3. '<' karakteri kaçırılır; başlıktaki bir '</script>' etiketi kapatamaz.
// Docusaurus yükseltilince özgün dosya ile elle karşılaştırılmalıdır (bkz. CLAUDE.md).

export default function DocBreadcrumbsStructuredData({breadcrumbs}: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {url, baseUrl, trailingSlash} = siteConfig;
  const origin = url.replace(/\/+$/, '');

  // Kanonik adres biçimi: kökte "/", diğerlerinde trailingSlash ayarına göre.
  function absolute(href: string): string {
    const stripped = href.replace(/\/+$/, '');
    if (trailingSlash === undefined || stripped === '') {
      return `${origin}${href}`;
    }
    return `${origin}${trailingSlash ? `${stripped}/` : stripped}`;
  }

  const home = {
    label: translate({
      id: 'theme.docs.breadcrumbs.home',
      message: 'Home page',
      description: 'The ARIA label for the home page in the breadcrumbs',
    }),
    href: baseUrl,
  };

  const items = [home, ...breadcrumbs.filter((breadcrumb) => breadcrumb.href)];
  if (items.length < 2) {
    return null;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.label,
      item: absolute(breadcrumb.href!),
    })),
  };

  return (
    <Head>
      <script type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, '\\u003c')}
      </script>
    </Head>
  );
}
