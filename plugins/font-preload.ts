/**
 * Yazı tipi ön yüklemesi — build sonrası her sayfanın <head>'ine, metnin
 * büyük kısmını çizen IBM Plex Sans (normal; latin + latin-ext) dosyaları için
 * <link rel="preload"> ekler.
 *
 * Yazı tipleri CSS içinden keşfedildiği için tarayıcı onları ancak styles.css
 * indirilip ayrıştırıldıktan sonra ister (HTML → CSS → font zinciri). Ön
 * yükleme font isteğini CSS ile paralel başlatır; yedek yazı tipinden Plex'e
 * geçişte oluşan kaymayı ve yanıp sönmeyi azaltır. Türkçe metin her sayfada
 * hem latin hem latin-ext karakter (ş, ğ, İ) içerdiği için iki dosya da her
 * sayfada kullanılır.
 *
 * Dosya adları paketleyicinin içerik hash'ini taşıdığından build öncesinde
 * bilinemez; bu yüzden etiketler injectHtmlTags yerine postBuild'de üretilmiş
 * HTML dosyalarına yazılır. Yalnızca Docusaurus sayfalarına (styles.css'i
 * bağlayanlara) eklenir; redirect stub'larına dokunulmaz.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';

const FONT_DIR = 'assets/fonts';

/** src/css/fonts.css'teki IBM Plex Sans normal dosyalarının hash'siz adları. */
const PRELOAD_FONTS = ['ibm-plex-sans-latin-wght-normal', 'ibm-plex-sans-latin-ext-wght-normal'];

const STYLESHEET_LINK = /<link rel="?stylesheet"?/;

export default function fontPreload(context: LoadContext): Plugin {
  return {
    name: 'font-preload',

    async postBuild({outDir}) {
      const fontFiles = await fs.readdir(path.join(outDir, FONT_DIR));
      const tags = PRELOAD_FONTS.map((name) => {
        const pattern = new RegExp(`^${name}-[0-9a-f]+\\.woff2$`);
        const file = fontFiles.find((f) => pattern.test(f));
        if (!file) {
          throw new Error(
            `[font-preload] ${FONT_DIR}/${name}-*.woff2 bulunamadı; ` +
              'src/css/fonts.css ile plugins/font-preload.ts uyumsuz.',
          );
        }
        const href = `${context.siteConfig.baseUrl}${FONT_DIR}/${file}`;
        return `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`;
      }).join('');

      const entries = await fs.readdir(outDir, {recursive: true, withFileTypes: true});
      const htmlFiles = entries
        .filter((e) => e.isFile() && e.name.endsWith('.html'))
        .map((e) => path.join(e.parentPath, e.name));

      await Promise.all(
        htmlFiles.map(async (file) => {
          const html = await fs.readFile(file, 'utf8');
          const match = STYLESHEET_LINK.exec(html);
          if (!match) return;
          await fs.writeFile(file, html.slice(0, match.index) + tags + html.slice(match.index));
        }),
      );
    },
  };
}
