import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import SearchPage from '@theme-original/SearchPage';

// Wrap swizzle: @easyops-cn/docusaurus-search-local'in arama sayfası robots etiketini
// `property="robots"` olarak yazar; arama motorları ve Docusaurus'un sitemap eklentisi
// yalnızca `name="robots"` etiketini tanır. Doğru etiket burada eklenir: /search
// sayfası dizine alınmaz ve sitemap'ten kendiliğinden çıkar. Eklenti meta açıklaması da
// yazmaz; SEO denetimleri dizine alınmayan sayfada da onu aradığı için burada verilir.
export default function SearchPageWrapper(): ReactNode {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
        <meta
          name="description"
          content="Aviyonik yazılım sitesinde arama: DO-178C kitabının bölümleri, blog yazıları, kütüphane önerileri ve araçlar içinde Türkçe tam metin arama."
        />
      </Head>
      <SearchPage />
    </>
  );
}
