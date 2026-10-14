import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import BlogAuthorsListPage from '@theme-original/Blog/Pages/BlogAuthorsListPage';
import type {Props} from '@theme/Blog/Pages/BlogAuthorsListPage';

// Wrap swizzle: özgün yazar listesi (/blog/authors) yalnızca başlık verir,
// <meta name="description"> üretmez. Tek tek yazar sayfalarının açıklaması
// `BlogAuthorsPostsPage` sarmalayıcısında `authors.yml`'den gelir.
export default function BlogAuthorsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <PageMetadata description="Aviyonik Yazılım blogunun yazarları: her yazarın sayfasında kısa tanıtımı ve yazdığı yazıların listesi yer alır." />
      <BlogAuthorsListPage {...props} />
    </>
  );
}
