import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import SearchPage from '@theme-original/SearchPage';

// Wrap swizzle: @easyops-cn/docusaurus-search-local'in arama sayfası robots etiketini
// `property="robots"` olarak yazar; arama motorları ve Docusaurus'un sitemap eklentisi
// yalnızca `name="robots"` etiketini tanır. Doğru etiket burada eklenir: /search
// sayfası dizine alınmaz ve sitemap'ten kendiliğinden çıkar.
export default function SearchPageWrapper(): ReactNode {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <SearchPage />
    </>
  );
}
