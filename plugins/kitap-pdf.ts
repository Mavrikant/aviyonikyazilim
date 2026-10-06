/**
 * Kitap PDF'i — build sırasında, kitabın PDF'e girecek sayfalarının sıralı listesini
 * (manifest) üretir. PDF'in kendisini bu eklenti değil, `scripts/kitap-pdf.mjs` üretir
 * (`npm run pdf`): derlenmiş siteyi yerelde sunar, manifestteki sayfaları başsız
 * Chromium ile açıp tek belgede birleştirir ve `build/` altına PDF olarak yazar.
 *
 * Neden ayrı adım: PDF için sayfaların tarayıcıda çalışmış hâli gerekir (Mermaid
 * diyagramları yalnızca istemcide çizilir). Bunu postBuild içinde yapmak, aynı anda
 * HTML dosyalarını yeniden yazan `plugins/font-preload.ts` ile yarışır (Docusaurus
 * postBuild kancalarını paralel çalıştırır) ve her `npm run build`'i bir tarayıcıya
 * bağımlı kılar.
 *
 * Manifest `.docusaurus/kitap-pdf/default/manifest.json` dosyasına yazılır (siteyle
 * yayımlanmaz). Sıra ve gruplar ana sayfadaki içindekilerle aynı kaynaktan,
 * `kitapSidebar`dan gelir: yeni bölüm eklendiğinde PDF'e de kendiliğinden girer.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import type {LoadedContent as DocsContent} from '@docusaurus/plugin-content-docs';

/** PDF'in sitedeki adresi; ana sayfadaki indirme düğmesi de bunu kullanır. */
export const KITAP_PDF_PATH = '/do-178c-ile-emniyet-kritik-aviyonik-yazilim.pdf';

export type PdfPage = {
  /** Kenar çubuğundaki üst kategori ("Kısım I — Giriş", "Ekler", "Kaynaklar"); giriş sayfasında boş */
  group: string;
  title: string;
  permalink: string;
  /** Kaynak dosyadaki Mermaid bloğu sayısı; betik bu kadar diyagram çizilene dek bekler */
  diagrams: number;
};

export type PdfManifest = {
  /** PDF'in build çıktısındaki yolu (KITAP_PDF_PATH) */
  output: string;
  siteUrl: string;
  pages: PdfPage[];
};

type LoadedVersion = DocsContent['loadedVersions'][number];
type SidebarItem = LoadedVersion['sidebars'][string][number];

function docItemIds(items: SidebarItem[]): string[] {
  return items.flatMap((item) => {
    if (item.type === 'doc') {
      return [item.id];
    }
    if (item.type === 'category') {
      return docItemIds(item.items);
    }
    return [];
  });
}

function countDiagrams(source: string): number {
  return source.match(/^[ \t]*```mermaid[ \t]*$/gm)?.length ?? 0;
}

export default function kitapPdf(context: LoadContext): Plugin {
  return {
    name: 'kitap-pdf',

    async allContentLoaded({allContent, actions}) {
      const docs = allContent['docusaurus-plugin-content-docs'] as
        | Record<string, DocsContent>
        | undefined;
      const version = docs?.default?.loadedVersions[0];
      const sidebar = version?.sidebars.kitapSidebar;
      if (!version || !sidebar) {
        throw new Error('[kitap-pdf] Kitap içeriği ya da "kitapSidebar" bulunamadı.');
      }

      const byId = new Map(version.docs.map((doc) => [doc.id, doc]));
      const pages: PdfPage[] = [];
      for (const item of sidebar) {
        const group = item.type === 'category' ? item.label : '';
        for (const id of docItemIds([item])) {
          const doc = byId.get(id);
          if (!doc || doc.draft || doc.unlisted) {
            continue;
          }
          const source = await fs.readFile(
            path.join(context.siteDir, doc.source.replace(/^@site\//, '')),
            'utf8',
          );
          pages.push({
            group,
            title: doc.title,
            permalink: doc.permalink,
            diagrams: countDiagrams(source),
          });
        }
      }
      if (pages.length === 0) {
        throw new Error('[kitap-pdf] PDF\'e girecek sayfa bulunamadı.');
      }

      const manifest: PdfManifest = {
        output: KITAP_PDF_PATH,
        siteUrl: context.siteConfig.url.replace(/\/+$/, ''),
        pages,
      };
      await actions.createData('manifest.json', JSON.stringify(manifest, null, 2));
    },
  };
}
