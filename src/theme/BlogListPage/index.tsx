/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import clsx from 'clsx';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogListPaginator from '@theme/BlogListPaginator';
import SearchMetadata from '@theme/SearchMetadata';
import type {Props} from '@theme/BlogListPage';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import Heading from '@theme/Heading';

// Eject swizzle: özgün BlogListPage ile aynıdır; tek fark, blog liste sayfalarında
// (sayfalı olanlar dahil) ana içerik alanına tek bir H1 eklenmesidir. Özgün sayfada
// yalnızca yazı başlıkları (H2) vardı, sayfanın H1'i yoktu.

// <title> ve H1 aynı kaynaktan gelir: yapılandırmadaki blogTitle.
function useBlogListPageTitle(metadata: Props['metadata']): string {
  const {
    siteConfig: {title: siteTitle},
  } = useDocusaurusContext();
  const isBlogOnlyMode = metadata.permalink === '/';
  return isBlogOnlyMode ? siteTitle : metadata.blogTitle;
}

function BlogListPageMetadata(props: Props): ReactNode {
  const {metadata} = props;
  const title = useBlogListPageTitle(metadata);
  return (
    <>
      <PageMetadata title={title} description={metadata.blogDescription} />
      <SearchMetadata tag="blog_posts_list" />
    </>
  );
}

function BlogListPageContent(props: Props): ReactNode {
  const {metadata, items, sidebar} = props;
  const title = useBlogListPageTitle(metadata);
  return (
    <BlogLayout sidebar={sidebar}>
      <header className="margin-bottom--lg">
        <Heading as="h1">{title}</Heading>
      </header>
      <BlogPostItems items={items} />
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  );
}

export default function BlogListPage(props: Props): ReactNode {
  return (
    <HtmlClassNameProvider
      className={clsx(
        ThemeClassNames.wrapper.blogPages,
        ThemeClassNames.page.blogListPage,
      )}>
      <BlogListPageMetadata {...props} />
      <BlogListPageStructuredData {...props} />
      <BlogListPageContent {...props} />
    </HtmlClassNameProvider>
  );
}
