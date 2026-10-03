import React, {type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Metadata from '@theme-original/DocItem/Metadata';

// Wrap swizzle: özgün DocItem/Metadata çıktısı (başlık, açıklama, og:*) olduğu gibi
// korunur; kitap sayfalarına schema.org JSON-LD eklenir.
//
// Yalnızca kitap (docs eklentisi routeBasePath: 'kitap') işaretlenir. Kütüphane ve araçlar
// sayfaları üçüncü taraf kitap önerileri / simülatörlerdir; Book, Review veya Product
// olarak işaretlenmez.

// Kitabın yol kökü; docusaurus.config.ts içindeki docs `routeBasePath: 'kitap'` ile aynıdır.
const BOOK_PATH = '/kitap';
// docusaurus.config.ts `themeConfig.image` ile aynı dosya.
const SOCIAL_CARD_PATH = '/img/social-card.png';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';

// JSON-LD'yi <script> içine güvenle basar: '<' karakteri kaçırılır, böylece içerikteki
// bir '</script>' dizisi etiketi kapatamaz.
function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Adresi, sayfanın kanonik adresiyle (SiteMetadata) aynı biçime getirir: trailingSlash
// false iken kök belgenin permalink'indeki son eğik çizgi ('/kitap/') atılır.
function applyTrailingSlashPolicy(
  path: string,
  trailingSlash: boolean | undefined,
): string {
  const stripped = path.replace(/\/+$/, '');
  if (trailingSlash === undefined || stripped === '') {
    return path;
  }
  return trailingSlash ? `${stripped}/` : stripped;
}

function DocStructuredData(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {metadata, contentTitle} = useDoc();
  const {permalink, title, description, lastUpdatedAt} = metadata;

  const bookPath = useBaseUrl(BOOK_PATH);
  const imageUrl = useBaseUrl(SOCIAL_CARD_PATH, {absolute: true});

  const path = permalink.replace(/\/+$/, '');
  const isBookIndex = path === bookPath;
  if (!isBookIndex && !path.startsWith(`${bookPath}/`)) {
    return null;
  }

  // @id değerleri docusaurus.config.ts içindeki kimlik grafiğiyle (Organization ve
  // Person) aynıdır; alan adı siteConfig.url'den türetilir.
  const origin = siteConfig.url.replace(/\/+$/, '');
  const {trailingSlash} = siteConfig;
  const pageUrl = origin + applyTrailingSlashPolicy(permalink, trailingSlash);
  const bookUrl = origin + applyTrailingSlashPolicy(bookPath, trailingSlash);
  const author = {'@id': `${origin}/#person`};
  const publisher = {'@id': `${origin}/#organization`};
  const bookId = `${bookUrl}#book`;

  const article = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: title,
    description,
    inLanguage: 'tr',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: imageUrl,
    // lastUpdatedAt epoch milisaniyedir (git log zaman damgası); yoksa alan hiç yazılmaz.
    ...(lastUpdatedAt
      ? {dateModified: new Date(lastUpdatedAt).toISOString().replace(/\.\d{3}Z$/, 'Z')}
      : {}),
    author,
    publisher,
    // Kitabın tam tanımı yalnızca /kitap sayfasındadır; burada @id ile birlikte tür ve adres
    // verilir ki başvuru tek başına okunduğunda da anlamlı olsun.
    isPartOf: {'@type': 'Book', '@id': bookId, url: bookUrl},
    license: LICENSE_URL,
  };

  // Kitabın kendisi yalnızca giriş sayfasında tanımlanır; ISBN, puan, yorum ve fiyat
  // bilgisi bilerek yazılmaz.
  const book = isBookIndex
    ? {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': bookId,
        // Kitap adı sayfadaki H1'den gelir (başlık alanı "Kitap Hakkında"dır).
        name: contentTitle ?? title,
        description,
        inLanguage: 'tr',
        isAccessibleForFree: true,
        license: LICENSE_URL,
        url: pageUrl,
        author,
        publisher,
      }
    : null;

  return (
    <Head>
      <script type="application/ld+json">{serializeJsonLd(article)}</script>
      {book && (
        <script type="application/ld+json">{serializeJsonLd(book)}</script>
      )}
    </Head>
  );
}

export default function MetadataWrapper(): ReactNode {
  return (
    <>
      <Metadata />
      <DocStructuredData />
    </>
  );
}
