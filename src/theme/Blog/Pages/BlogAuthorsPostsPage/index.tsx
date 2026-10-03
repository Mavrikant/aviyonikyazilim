import React, {type ReactNode} from 'react';
import BlogAuthorsPostsPage from '@theme-original/Blog/Pages/BlogAuthorsPostsPage';
import type {Props} from '@theme/Blog/Pages/BlogAuthorsPostsPage';
import {PageMetadata} from '@docusaurus/theme-common';

// Wrap swizzle: özgün yazar sayfası `authors.yml` içindeki `description` alanını
// yalnızca gövdede gösterir, <meta name="description"> ve og:description üretmez.
// Burada aynı metin <head> içinde de yayımlanır (etiket sayfalarında Docusaurus
// bunu zaten kendisi yapar).
export default function BlogAuthorsPostsPageWrapper(props: Props): ReactNode {
  return (
    <>
      <PageMetadata description={props.author.description} />
      <BlogAuthorsPostsPage {...props} />
    </>
  );
}
