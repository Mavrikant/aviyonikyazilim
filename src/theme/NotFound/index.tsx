import React, {type ReactNode} from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import NotFound from '@theme-original/NotFound';

// Wrap swizzle: özgün 404 sayfası yalnızca başlık verir, <meta name="description">
// üretmez. GitHub Pages bu sayfayı her bulunamayan adres için sunduğundan SEO
// denetimleri ve sosyal paylaşım önizlemeleri onu da okur.
export default function NotFoundWrapper(): ReactNode {
  return (
    <>
      <PageMetadata description="Aradığınız sayfa bulunamadı; taşınmış ya da kaldırılmış olabilir. Kitap, blog, kütüphane ve araçlara üst menüden ya da site içi aramadan ulaşabilirsiniz." />
      <NotFound />
    </>
  );
}
