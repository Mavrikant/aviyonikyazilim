import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import BlogTagsListPage from '@theme-original/BlogTagsListPage';
import type {Props} from '@theme/BlogTagsListPage';

// Wrap swizzle: özgün etiket listesi (/blog/tags) yalnızca başlık verir,
// <meta name="description"> üretmez. Her blog yazısı bu sayfaya bağlandığı için
// tarayıcılar onu da dolaşır. Tek tek etiket sayfalarının açıklaması `blog/tags.yml`'dedir.
export default function BlogTagsListPageWrapper(props: Props): ReactNode {
  return (
    <>
      <PageMetadata description="Aviyonik yazılım blogundaki yazılar konu etiketlerine göre: DO-178C, yapısal kapsam analizi, ARINC 429, AFDX ve gerçek zamanlı sistemler." />
      <BlogTagsListPage {...props} />
    </>
  );
}
