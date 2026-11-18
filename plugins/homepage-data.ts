/**
 * Ana sayfa verisi — build sırasında kitap, blog, kütüphane, araçlar ve öğrenilmiş dersler
 * içeriğinden ana sayfanın ihtiyaç duyduğu yalın listeleri üretir.
 *
 * Ana sayfa hiçbir listeyi elle tutmaz: yeni bölüm, yazı, kitap veya araç
 * eklendiğinde bir sonraki build'de ana sayfaya kendiliğinden yansır.
 * İstemci tarafında `usePluginData('homepage-data')` ile okunur.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {LoadedContent as DocsContent} from '@docusaurus/plugin-content-docs';
import type {BlogContent} from '@docusaurus/plugin-content-blog';
import {KITAP_PDF_PATH} from './kitap-pdf';

export type Chapter = {
  /** "9" ya da ekler için "A" */
  no: string;
  title: string;
  permalink: string;
  /** Tahmini okuma süresi (dakika, yukarı yuvarlanmış) */
  minutes: number;
};

export type Part = {
  /** Romen rakamı ("III"); numarasız kısımlarda (Ekler) boş */
  no: string;
  title: string;
  chapters: Chapter[];
};

export type PageLink = {
  title: string;
  permalink: string;
};

export type Post = PageLink & {
  /** YYYY-MM-DD */
  date: string;
  minutes: number;
  tags: string[];
};

export type Shelf = PageLink & {count: number};

export type Cover = PageLink & {image: string};

export type Tool = PageLink & {
  description: string;
  /** Kenar çubuğundaki kategori etiketi (ör. "Navigasyon") */
  category: string;
  /** Araç sayfasındaki `sidebar_custom_props.simge`: katalogdaki şema (ör. "vor", "harita") */
  icon?: string;
  /** Araç sayfasındaki `sidebar_custom_props.ozellikler`: katalogda etiket olarak gösterilir */
  features: string[];
};

export type Lesson = PageLink & {
  description: string;
  /** Olayın tarihi, YYYY-MM-DD (`sidebar_custom_props.tarih`) */
  date: string;
  /** Tarihin gösterilecek hâli; birden çok olayı kapsayan sayfada elle verilir (`tarihMetni`) */
  dateText: string;
  /** Hava aracı (`sidebar_custom_props.arac`) */
  aircraft: string;
  /** Olayın yeri (`sidebar_custom_props.yer`) */
  place: string;
  /** Sonuç: can kaybı, hasar (`sidebar_custom_props.sonuc`) */
  outcome: string;
  /** Dersin konuları (`sidebar_custom_props.konular`): katalogda etiket olarak gösterilir */
  topics: string[];
};

export type HomepageData = {
  /** Build tarihi (Europe/Istanbul), YYYY-MM-DD */
  buildDate: string;
  book: {
    about: PageLink;
    firstChapter: Chapter;
    parts: Part[];
    references: PageLink[];
    chapterCount: number;
    appendixCount: number;
    /** Kitabın PDF sürümünün adresi (`npm run pdf` üretir; bkz. plugins/kitap-pdf.ts) */
    pdf: string;
  };
  posts: Post[];
  postCount: number;
  library: {
    pageCount: number;
    shelves: Shelf[];
    covers: Cover[];
  };
  tools: Tool[];
  /** Öğrenilmiş dersler: olay tarihine göre eskiden yeniye */
  lessons: Lesson[];
};

type LoadedVersion = DocsContent['loadedVersions'][number];
type DocMetadata = LoadedVersion['docs'][number];
type SidebarItem = LoadedVersion['sidebars'][string][number];

const RECENT_POST_COUNT = 5;
// Blog eklentisinin okuma süresi varsayılanıyla aynı (dakikada 200 kelime).
const WORDS_PER_MINUTE = 200;

const wordSegmenter = new Intl.Segmenter('tr', {granularity: 'word'});

/** Okuma süresine girmeyen kısımlar: frontmatter ve MDX içe/dışa aktarım satırları. */
function stripFrontMatter(source: string): string {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/^(?:import|export)\s.*$/gm, '');
}

function readingMinutes(content: string): number {
  let words = 0;
  for (const {isWordLike} of wordSegmenter.segment(content)) {
    if (isWordLike) {
      words += 1;
    }
  }
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Eklenti `source` alanındaki "@site/..." yolunu dosya sistemi yoluna çevirir. */
function sourcePath(siteDir: string, source: string): string {
  return path.join(siteDir, source.replace(/^@site\//, ''));
}

/** "9. Yazılım Doğrulama" → {no: "9", title: "Yazılım Doğrulama"}; "Ek A: …" → {no: "A"} */
function splitChapterTitle(title: string): {no: string; title: string} {
  const numbered = /^(\d+)\.\s+(.+)$/.exec(title);
  if (numbered) {
    return {no: numbered[1], title: numbered[2]};
  }
  const appendix = /^Ek\s+([A-Z]):\s*(.+)$/.exec(title);
  if (appendix) {
    return {no: appendix[1], title: appendix[2]};
  }
  return {no: '', title};
}

/** "Kısım III — DO-178C ile …" → {no: "III", title: "DO-178C ile …"} */
function splitPartLabel(label: string): {no: string; title: string} {
  const match = /^Kısım\s+([IVXLC]+)\s+—\s+(.+)$/.exec(label);
  return match ? {no: match[1], title: match[2]} : {no: '', title: label};
}

/** "2026-10-02" → "2 Ekim 2026" (sunucu ve istemcide aynı çıktı için UTC). */
export function formatLongDate(isoDate: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** İlk cümleyi (ya da en fazla ~180 karakteri) döndürür. */
function firstSentence(text: string): string {
  const sentence = /^(.+?[.!?])(\s|$)/.exec(text)?.[1] ?? text;
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}…` : sentence;
}

function docItemIds(items: SidebarItem[]): string[] {
  return items.flatMap((item) => {
    if (item.type === 'doc' || item.type === 'ref') {
      return [item.id];
    }
    if (item.type === 'category') {
      return docItemIds(item.items);
    }
    return [];
  });
}

function docsById(version: LoadedVersion): Map<string, DocMetadata> {
  return new Map(version.docs.map((doc) => [doc.id, doc]));
}

function getVersion(docs: Record<string, DocsContent>, pluginId: string): LoadedVersion {
  const version = docs[pluginId]?.loadedVersions[0];
  if (!version) {
    throw new Error(`[homepage-data] "${pluginId}" docs eklentisi bulunamadı.`);
  }
  return version;
}

function getSidebar(version: LoadedVersion, sidebarId: string): SidebarItem[] {
  const sidebar = version.sidebars[sidebarId];
  if (!sidebar) {
    throw new Error(`[homepage-data] "${sidebarId}" sidebar'ı bulunamadı.`);
  }
  return sidebar;
}

async function loadBook(siteDir: string, version: LoadedVersion): Promise<HomepageData['book']> {
  const byId = docsById(version);
  const sidebar = getSidebar(version, 'kitapSidebar');

  const aboutDoc = sidebar.find((item) => item.type === 'doc');
  const about = aboutDoc?.type === 'doc' ? byId.get(aboutDoc.id) : undefined;
  if (!about) {
    throw new Error('[homepage-data] Kitap giriş sayfası (index) bulunamadı.');
  }

  const parts: Part[] = [];
  const references: PageLink[] = [];

  const docsOf = (ids: string[]) =>
    ids.map((id) => byId.get(id)).filter((doc): doc is DocMetadata => doc !== undefined);

  /**
   * Bir kısmın içindekilerdeki satırları: her sayfa bir satırdır; kendi giriş sayfası olan
   * alt kategori (Ek E, Ek F gibi çok sayfalı ekler) ise giriş sayfasıyla tek satırdır ve
   * okuma süresi alt sayfalarıyla birlikte hesaplanır.
   */
  const entriesOf = (items: SidebarItem[]): {lead: DocMetadata; docs: DocMetadata[]}[] =>
    items.flatMap((child) => {
      if (child.type === 'category' && child.link?.type === 'doc') {
        const index = byId.get(child.link.id);
        return index ? [{lead: index, docs: [index, ...docsOf(docItemIds(child.items))]}] : [];
      }
      return docsOf(docItemIds([child])).map((doc) => ({lead: doc, docs: [doc]}));
    });

  for (const item of sidebar) {
    // Kitabın sonunda kategorisiz duran sayfalar (Kısaltmalar) bölüm değil, başvuru sayfasıdır.
    if (item.type === 'doc' && item !== aboutDoc) {
      references.push(...docsOf([item.id]).map((doc) => ({title: doc.title, permalink: doc.permalink})));
      continue;
    }
    if (item.type !== 'category') {
      continue;
    }
    const entries = entriesOf(item.items);

    const chapters = await Promise.all(
      entries.map(async ({lead, docs}): Promise<Chapter> => {
        const sources = await Promise.all(
          docs.map(async (doc) => stripFrontMatter(await fs.readFile(sourcePath(siteDir, doc.source), 'utf8'))),
        );
        return {
          ...splitChapterTitle(lead.title),
          permalink: lead.permalink,
          minutes: readingMinutes(sources.join('\n')),
        };
      }),
    );
    parts.push({...splitPartLabel(item.label), chapters});
  }

  const numbered = parts.flatMap((part) => part.chapters).filter((ch) => /^\d+$/.test(ch.no));
  const appendices = parts.flatMap((part) => part.chapters).filter((ch) => /^[A-Z]$/.test(ch.no));
  const firstChapter = numbered[0];
  if (!firstChapter) {
    throw new Error('[homepage-data] Kitapta numaralı bölüm bulunamadı.');
  }

  return {
    about: {title: about.title, permalink: about.permalink},
    firstChapter,
    parts,
    references,
    chapterCount: numbered.length,
    appendixCount: appendices.length,
    pdf: KITAP_PDF_PATH,
  };
}

async function loadLibrary(siteDir: string, version: LoadedVersion): Promise<HomepageData['library']> {
  const byId = docsById(version);
  const shelves: Shelf[] = [];
  const covers: Cover[] = [];

  for (const item of getSidebar(version, 'kutuphaneSidebar')) {
    if (item.type !== 'category') {
      continue;
    }
    const docs = docItemIds(item.items)
      .map((id) => byId.get(id))
      .filter((doc): doc is DocMetadata => doc !== undefined);
    const permalink =
      item.link?.type === 'generated-index' ? item.link.permalink : docs[0]?.permalink;
    if (permalink) {
      shelves.push({title: item.label, permalink, count: docs.length});
    }

    for (const doc of docs) {
      const source = await fs.readFile(sourcePath(siteDir, doc.source), 'utf8');
      // Kapak görseli, başlığın hemen altındaki ilk yerel kütüphane görselidir.
      const image = /!\[[^\]]*\]\((\/img\/kutuphane\/[^)\s]+)/.exec(source)?.[1];
      if (image) {
        covers.push({title: doc.title, permalink: doc.permalink, image});
      }
    }
  }

  return {
    pageCount: shelves.reduce((sum, shelf) => sum + shelf.count, 0),
    shelves,
    covers,
  };
}

function loadTools(version: LoadedVersion): Tool[] {
  const byId = docsById(version);
  return getSidebar(version, 'araclarSidebar').flatMap((item) => {
    if (item.type !== 'category') {
      return [];
    }
    return docItemIds(item.items)
      .map((id) => byId.get(id))
      .filter((doc): doc is DocMetadata => doc !== undefined)
      .map((doc) => {
        const props = (doc.frontMatter.sidebar_custom_props ?? {}) as {simge?: string; ozellikler?: string[]};
        return {
          title: doc.title,
          permalink: doc.permalink,
          description: firstSentence(doc.description),
          category: item.label,
          icon: props.simge,
          features: props.ozellikler ?? [],
        };
      });
  });
}

/**
 * Öğrenilmiş dersler: giriş sayfası dışındaki her sayfa bir olaydır. Künye alanları sayfanın
 * `sidebar_custom_props` alanından gelir; eksik ya da biçimsiz alan derlemeyi durdurur
 * (katalog, ana sayfa ve sayfadaki künye aynı veriyi gösterir).
 */
function loadLessons(version: LoadedVersion): Lesson[] {
  const byId = docsById(version);
  const lessons = docItemIds(getSidebar(version, 'derslerSidebar'))
    .map((id) => byId.get(id))
    .filter((doc): doc is DocMetadata => doc !== undefined && doc.slug !== '/')
    .map((doc): Lesson => {
      const props = (doc.frontMatter.sidebar_custom_props ?? {}) as Record<string, unknown>;
      const text = (key: string): string => {
        const value = props[key];
        if (typeof value !== 'string' || value.trim() === '') {
          throw new Error(`[homepage-data] ${doc.source}: sidebar_custom_props.${key} eksik.`);
        }
        return value;
      };
      const date = text('tarih');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`[homepage-data] ${doc.source}: tarih YYYY-AA-GG biçiminde olmalı ("${date}").`);
      }
      const topics = props.konular;
      if (!Array.isArray(topics) || topics.length === 0 || topics.some((t) => typeof t !== 'string')) {
        throw new Error(`[homepage-data] ${doc.source}: sidebar_custom_props.konular eksik.`);
      }
      return {
        title: doc.title,
        permalink: doc.permalink,
        description: doc.description,
        date,
        dateText: typeof props.tarihMetni === 'string' ? props.tarihMetni : formatLongDate(date),
        aircraft: text('arac'),
        place: text('yer'),
        outcome: text('sonuc'),
        topics: topics as string[],
      };
    });
  return lessons.sort((a, b) => a.date.localeCompare(b.date));
}

function loadPosts(blog: BlogContent): Pick<HomepageData, 'posts' | 'postCount'> {
  // Blog eklentisi yazıları zaten yeniden eskiye sıralar.
  const listed = blog.blogPosts.filter((post) => !post.metadata.unlisted);
  return {
    postCount: listed.length,
    posts: listed.slice(0, RECENT_POST_COUNT).map(({metadata}) => ({
      title: metadata.title,
      permalink: metadata.permalink,
      date: new Date(metadata.date).toISOString().slice(0, 10),
      minutes: Math.max(1, Math.ceil(metadata.readingTime ?? 0)),
      tags: metadata.tags.map((tag) => tag.label),
    })),
  };
}

export default function homepageData(context: LoadContext): Plugin {
  return {
    name: 'homepage-data',

    async allContentLoaded({allContent, actions}) {
      const docs = allContent['docusaurus-plugin-content-docs'] as Record<string, DocsContent>;
      const blog = allContent['docusaurus-plugin-content-blog']?.default as BlogContent | undefined;
      if (!docs || !blog) {
        throw new Error('[homepage-data] docs veya blog içeriği yüklenmemiş.');
      }

      const data: HomepageData = {
        buildDate: new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Istanbul'}).format(new Date()),
        book: await loadBook(context.siteDir, getVersion(docs, 'default')),
        ...loadPosts(blog),
        library: await loadLibrary(context.siteDir, getVersion(docs, 'kutuphane')),
        tools: loadTools(getVersion(docs, 'araclar')),
        lessons: loadLessons(getVersion(docs, 'dersler')),
      };
      actions.setGlobalData(data);
    },
  };
}
