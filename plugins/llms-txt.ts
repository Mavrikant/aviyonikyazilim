/**
 * llms.txt — build sırasında, dil modelleri ve yapay zekâ tarayıcıları için
 * sitenin düz metin içindekiler dosyasını (`/llms.txt`, llmstxt.org önerisi) üretir.
 *
 * Dosya elle tutulmaz: kitap, blog, kütüphane ve araçlar içeriğinden her
 * build'de baştan yazılır; yeni bölüm, yazı, kitap veya araç eklendiğinde bir
 * sonraki build'de kendiliğinden yansır, hiçbir zaman elle güncelleme gerektirmez.
 *
 * Yapı: başlık + tek cümlelik özet + kısa tanıtım, ardından her biri
 * `- [Başlık](mutlak adres): açıklama` satırlarından oluşan H2 bölümleri
 * (kitap kısımları, kaynaklar, blog, kütüphane kategorileri, araçlar) ve
 * atlanabilir bağlantılar için `Optional` bölümü. Sıra kenar çubuklarındaki
 * (blogda yeniden eskiye) sıradır; açıklamalar meta açıklamasıyla aynı alandan
 * (plugins/meta-description.ts) gelir. Gizli (unlisted) ve taslak sayfalar listelenmez.
 *
 * İçerik `allContentLoaded` aşamasında (homepage-data ile aynı kaynaktan) saklanır,
 * dosya `postBuild` aşamasında yazılır. Böylece `docusaurus start` yalnızca içeriği
 * tutar ve içerik yapısı değişse bile geliştirme sunucusu kırılmaz; beklenen
 * eklenti, kenar çubuğu ya da bölüm bulunamazsa build ise bilerek hata verir
 * (boş bir llms.txt sessizce yayımlanmasın diye).
 *
 * Docusaurus tüm eklentilerin postBuild kancalarını PARALEL çalıştırır; bu eklenti
 * yalnızca yeni bir dosya (llms.txt) oluşturur, mevcut hiçbir çıktıyı okuyup
 * değiştirmez (bkz. plugins/font-preload.ts). Bu yüzden başka bir eklentinin
 * ürettiği dosyalara (sitemap.xml, rss.xml) yalnızca bağlantı verir, varlığını denetlemez.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {LoadedContent as DocsContent} from '@docusaurus/plugin-content-docs';
import type {BlogContent} from '@docusaurus/plugin-content-blog';

type LoadedVersion = DocsContent['loadedVersions'][number];
type SidebarItem = LoadedVersion['sidebars'][string][number];

type Entry = {
  title: string;
  permalink: string;
  /** Açıklama (tek satır); boş olabilir */
  details: string;
};

type Section = {
  heading: string;
  entries: Entry[];
};

type SiteContent = {
  docs: Record<string, DocsContent>;
  blog: BlogContent;
};

const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';

const SUMMARY =
  'DO-178C ekseninde emniyet-kritik aviyonik yazılım (safety-critical avionics software) üzerine ' +
  'Türkçe, açık kaynak ve katkıya açık kitap, teknik yazılar, kütüphane ve tarayıcıda çalışan ' +
  'araçlar; içerik CC BY-SA 4.0 lisanslıdır.';

/** Satır sonlarını ve köşeli parantezleri temizler: liste satırı tek satır kalmalı. */
function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\[/g, '(').replace(/\]/g, ')').trim();
}

/** "Kısım I — Giriş" → "Kısım I: Giriş" (başlıkta çift tire olmasın). */
function partName(label: string): string {
  return label.replace(/\s+—\s+/, ': ');
}

function docItemIds(items: SidebarItem[]): string[] {
  return items.flatMap((item) => {
    if (item.type === 'doc') {
      return [item.id];
    }
    if (item.type === 'category') {
      // Bağlantısı bir sayfaya giden kategori başlığı da listelenir.
      const own = item.link?.type === 'doc' ? [item.link.id] : [];
      return [...own, ...docItemIds(item.items)];
    }
    // 'ref' (başka kenar çubuğundaki sayfaya başvuru) orada zaten listelenir;
    // 'link' dış bağlantıdır.
    return [];
  });
}

function getVersion(docs: Record<string, DocsContent>, pluginId: string): LoadedVersion {
  const version = docs[pluginId]?.loadedVersions[0];
  if (!version) {
    throw new Error(`[llms-txt] "${pluginId}" docs eklentisi bulunamadı.`);
  }
  return version;
}

type DocsSectionOptions = {
  /** Giriş bölümünün (üst düzey sayfaların) başlığı: "Kitap" */
  title: string;
  /** Kategorilerin bölüm başlığı; verilmezse "<title> — <etiket>" */
  groupHeading?: (label: string) => string;
  /** true ise tüm sayfalar tek bölümde listelenir */
  flat?: boolean;
};

/** Bir docs eklentisinin kenar çubuğunu, kategori başına bir bölüm olacak şekilde listeler. */
function docsSections(
  version: LoadedVersion,
  sidebarId: string,
  options: DocsSectionOptions,
): Section[] {
  const sidebar = version.sidebars[sidebarId];
  if (!sidebar) {
    throw new Error(`[llms-txt] "${sidebarId}" sidebar'ı bulunamadı.`);
  }

  const listable = new Map(
    version.docs.filter((doc) => !doc.draft && !doc.unlisted).map((doc) => [doc.id, doc]),
  );
  const seen = new Set<string>();
  const toEntries = (ids: string[]): Entry[] =>
    ids.flatMap((id) => {
      const doc = listable.get(id);
      if (!doc || seen.has(id)) {
        return [];
      }
      seen.add(id);
      return [{title: oneLine(doc.title), permalink: doc.permalink, details: oneLine(doc.description)}];
    });

  const intro: Section = {heading: options.title, entries: []};
  const groups: Section[] = [];
  for (const item of sidebar) {
    const entries = toEntries(docItemIds([item]));
    if (item.type === 'category' && !options.flat) {
      const heading = options.groupHeading?.(item.label) ?? `${options.title} — ${item.label}`;
      groups.push({heading, entries});
    } else {
      intro.entries.push(...entries);
    }
  }
  // Kenar çubuğunda yer almayan ama listelenebilir sayfalar da dosyadan düşmesin.
  intro.entries.push(...toEntries([...listable.keys()]));

  const sections = [intro, ...groups].filter((section) => section.entries.length > 0);
  if (sections.length === 0) {
    throw new Error(`[llms-txt] "${options.title}" bölümünde listelenecek sayfa bulunamadı.`);
  }
  return sections;
}

function blogSection(blog: BlogContent): Section {
  // Blog eklentisi yazıları zaten yeniden eskiye sıralar.
  const entries = blog.blogPosts
    .filter((post) => !post.metadata.unlisted)
    .map(({metadata}): Entry => {
      const date = new Date(metadata.date).toISOString().slice(0, 10);
      return {
        title: oneLine(metadata.title),
        permalink: metadata.permalink,
        details: [date, oneLine(metadata.description ?? '')].filter(Boolean).join(' — '),
      };
    });
  if (entries.length === 0) {
    throw new Error('[llms-txt] Listelenecek blog yazısı bulunamadı.');
  }
  return {heading: 'Blog', entries};
}

export default function llmsTxt(context: LoadContext): Plugin {
  const {siteConfig} = context;
  const siteUrl = siteConfig.url.replace(/\/+$/, '');
  let content: SiteContent | undefined;

  /**
   * Sayfanın mutlak adresi. Docusaurus kökte yayımlanan sayfaların (slug: /)
   * permalink'ini her zaman "/" ile bitirir ("/kitap/"); canonical ve sitemap ise
   * `trailingSlash` ayarına uyar ("/kitap"). llms.txt de aynı adresi vermelidir.
   */
  function pageUrl(permalink: string): string {
    // Madde biçimi (`[…](…)`) boşluk ve parantezle bozulur; adresler ASCII slug'dır.
    if (!permalink.startsWith('/') || /[\s()<>]/.test(permalink)) {
      throw new Error(`[llms-txt] Beklenmeyen bağlantı biçimi: "${permalink}"`);
    }
    const {trailingSlash} = siteConfig;
    if (trailingSlash === undefined || permalink === '/') {
      return `${siteUrl}${permalink}`;
    }
    const trimmed = permalink.replace(/\/+$/, '');
    return `${siteUrl}${trailingSlash ? `${trimmed}/` : trimmed}`;
  }

  function bullet(title: string, url: string, details: string): string {
    const link = `- [${title}](${url})`;
    return details ? `${link}: ${details}` : link;
  }

  function renderEntry(entry: Entry): string {
    return bullet(entry.title, pageUrl(entry.permalink), entry.details);
  }

  function render({docs, blog}: SiteContent): string {
    const book = docsSections(getVersion(docs, 'default'), 'kitapSidebar', {
      title: 'Kitap',
      groupHeading: (label) => (label === 'Kaynaklar' ? label : `Kitap — ${partName(label)}`),
    });
    const library = docsSections(getVersion(docs, 'kutuphane'), 'kutuphaneSidebar', {
      title: 'Kütüphane',
    });
    const tools = docsSections(getVersion(docs, 'araclar'), 'araclarSidebar', {
      title: 'Araçlar',
      flat: true,
    });

    const lines = [
      `# ${siteConfig.title}`,
      '',
      `> ${SUMMARY}`,
      '',
      'Site Türkçedir; bir teknik terim ilk kullanıldığı yerde İngilizcesi parantez içinde verilir. ' +
        'Dört içerik türü vardır: DO-178C ekseninde emniyet-kritik aviyonik yazılım kitabı, ' +
        'teknik blog yazıları, alandaki kitap ve dokümanlara küratörlü öneriler (kütüphane) ve ' +
        'tarayıcıda çalışan simülatörler (araçlar). İçerik özgün olarak yazılır; kaynak ' +
        `metinler ve değişiklik geçmişi ${REPO_URL} adresindedir.`,
      '',
      'Katkılar açıktır: düzeltme, yeni bölüm, kitap veya araç önerisi GitHub üzerinden ' +
        `(issue ve pull request) ya da ${siteUrl}/#katki sayfasında anlatılan yollarla yapılabilir. ` +
        'İçeriği alıntılarken veya türetirken CC BY-SA 4.0 koşulları (atıf ve aynı lisansla ' +
        'paylaşım) geçerlidir.',
    ];

    const sections: Section[] = [...book, blogSection(blog), ...library, ...tools];
    for (const {heading, entries} of sections) {
      lines.push('', `## ${heading}`, '', ...entries.map(renderEntry));
    }

    const optionalLines = [
      bullet(
        'Site haritası (sitemap.xml)',
        `${siteUrl}/sitemap.xml`,
        'Sitedeki tüm sayfaların listesi ve son değişiklik tarihleri',
      ),
      bullet('Blog RSS akışı', `${siteUrl}/blog/rss.xml`, 'Blog yazılarının RSS akışı'),
      bullet(
        'GitHub deposu',
        REPO_URL,
        'Kaynak metinler, sorunlar (issue) ve değişiklik önerileri (pull request)',
      ),
      bullet(
        'Katkı rehberi',
        `${REPO_URL}/blob/main/CONTRIBUTING.md`,
        'Düzeltme ve içerik katkısının adımları',
      ),
      bullet('CC BY-SA 4.0 lisansı', LICENSE_URL, 'İçeriğin yeniden kullanım koşulları'),
    ];
    lines.push('', '## Optional', '', ...optionalLines);

    return `${lines.join('\n')}\n`;
  }

  return {
    name: 'llms-txt',

    allContentLoaded({allContent}) {
      const docs = allContent['docusaurus-plugin-content-docs'] as
        | Record<string, DocsContent>
        | undefined;
      const blog = allContent['docusaurus-plugin-content-blog']?.default as BlogContent | undefined;
      if (!docs || !blog) {
        throw new Error('[llms-txt] docs veya blog içeriği yüklenmemiş.');
      }
      content = {docs, blog};
    },

    async postBuild({outDir}) {
      if (!content) {
        throw new Error('[llms-txt] İçerik yüklenmeden postBuild çalıştı.');
      }
      await fs.writeFile(path.join(outDir, 'llms.txt'), render(content), 'utf8');
    },
  };
}
