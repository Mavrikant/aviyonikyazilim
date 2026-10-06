#!/usr/bin/env node
/**
 * Kitabın PDF sürümünü üretir: `npm run build && npm run pdf`.
 *
 * Akış:
 *   1. `plugins/kitap-pdf.ts`'in build sırasında yazdığı manifesti (sayfa sırası, kısımlar,
 *      sayfa başına Mermaid diyagramı sayısı) okur.
 *   2. `build/` klasörünü yalnızca bu makineye açık geçici bir sunucuyla sunar ve her kitap
 *      sayfasını başsız Chromium'da açar; diyagramlar çizilince sayfanın gövdesini alır.
 *      Dış adreslere giden istekler (analitik dahil) engellenir.
 *   3. Gövdeleri kapak, künye ve içindekilerle tek belgede birleştirir. Kimlikler (id) bölüm
 *      anahtarıyla öneklenir; kitap içi bağlantılar PDF içi bağlantıya, sitenin diğer
 *      sayfalarına gidenler tam adrese çevrilir.
 *   4. Belgeyi iki kez basar: ilk baskıdan bölümlerin sayfa numaralarını okur, ikincisinde
 *      içindekilere yazar. Numaralar tutarlı değilse hata verir.
 *
 * Tarayıcı: önce Playwright'in sürümü `package-lock.json` ile sabitlenen Chromium'u denenir
 * (CI'da `npx playwright-core install chromium-headless-shell` ile kurulur); kurulu değilse
 * makinedeki Google Chrome kullanılır.
 *
 * Çıktı `build/` altına yazılır, depoya konmaz. Baskı düzeni: scripts/kitap-pdf.css
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
import {PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFRef} from 'pdf-lib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'build');
const MANIFEST = path.join(ROOT, '.docusaurus/kitap-pdf/default/manifest.json');
const PRINT_CSS = path.join(ROOT, 'scripts/kitap-pdf.css');
/** Birleştirilmiş belgenin ve PDF yazı tiplerinin geçici sunucudaki adresleri. */
const BOOK_ROUTE = '/__kitap-pdf/kitap.html';
const FONT_ROUTE = '/__kitap-pdf/fonts';
const FONT_DIR = path.join(ROOT, 'node_modules/@ibm/plex-sans/fonts/complete/woff2');

const AUTHOR = 'M. Serdar Karaman ve katkıda bulunanlar';
const SUBTITLE = 'Emniyet-kritik aviyonik yazılım geliştirme, doğrulama ve sertifikasyon';
const KEYWORDS = ['aviyonik yazılım', 'DO-178C', 'emniyet-kritik yazılım', 'sertifikasyon'];
const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';
/** Giriş sayfasının PDF'e alınmayan bölümü: PDF'in kendi içindekiler sayfası var. */
const WEB_ONLY_HEADING = 'İçindekiler';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "/kitap/giris/giris-ve-genel-bakis" → "giris-giris-ve-genel-bakis"; "/kitap/" → "kitap". */
function pageKey(permalink) {
  const parts = permalink.split('/').filter(Boolean);
  return (parts.length > 1 ? parts.slice(1) : parts).join('-');
}

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

/** "Kısım III — DO-178C ile …" → {no: "Kısım III", title: "DO-178C ile …"} */
function splitGroup(label) {
  const [no, ...rest] = label.split(' — ');
  return rest.length > 0 ? {no, title: rest.join(' — ')} : {no: '', title: label};
}

function formatLongDate(isoDate) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Kitap içeriğinin son değişikliği: tarih (YYYY-AA-GG) ve kısa commit kimliği. */
function bookRevision() {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs %h', '--', 'kitap'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const [date, commit] = out.split(' ');
    if (date && commit) {
      return {date, commit};
    }
  } catch {
    // git yok ya da depo geçmişi yok: bugünün tarihi kullanılır.
  }
  return {date: new Date().toISOString().slice(0, 10), commit: ''};
}

/** `root` altındaki dosyayı bulur; adresler uzantısızdır (trailingSlash: false). */
async function resolveFile(root, pathname) {
  const clean = pathname.replace(/\/+$/, '');
  for (const candidate of [clean, `${clean}.html`, `${clean}/index.html`]) {
    const file = path.join(root, candidate);
    if (!file.startsWith(root + path.sep)) {
      continue;
    }
    const stat = await fs.stat(file).catch(() => null);
    if (stat?.isFile()) {
      return file;
    }
  }
  return null;
}

/**
 * `root`'u, bellekteki `virtualPages` sayfalarını ve `mounts` içindeki ek klasörleri
 * 127.0.0.1'de rastgele bir portta sunar.
 */
async function startServer(root, virtualPages, mounts) {
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
      const virtual = virtualPages.get(pathname);
      if (virtual !== undefined) {
        res.writeHead(200, {'content-type': MIME['.html']});
        res.end(virtual);
        return;
      }
      const mount = Object.keys(mounts).find((prefix) => pathname.startsWith(`${prefix}/`));
      const file = mount
        ? await resolveFile(mounts[mount], pathname.slice(mount.length))
        : await resolveFile(root, pathname);
      if (!file) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
      });
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(500).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch (error) {
    if (!/Executable doesn't exist/.test(String(error))) {
      throw error;
    }
  }
  try {
    return await chromium.launch({channel: 'chrome'});
  } catch (error) {
    throw new Error(
      'Chromium bulunamadı. `npx playwright-core install chromium-headless-shell` ile kurun ' +
        'ya da Google Chrome yükleyin.',
      {cause: error},
    );
  }
}

/**
 * Tarayıcıda çalışır: açık sayfanın gövdesini PDF belgesine girecek biçimde döndürür.
 * Sayfanın kendi DOM'una dokunmaz; bir kopya üzerinde çalışır.
 */
function extractInPage({key, title, grouped, isAbout, keys, siteUrl, webOnlyHeading}) {
  const root = document.querySelector('.theme-doc-markdown').cloneNode(true);

  // Yalnızca ekranda anlamlı olan öğeler: başlık çapaları, kod bloğu düğmeleri.
  root.querySelectorAll('.hash-link, button').forEach((el) => el.remove());
  root.querySelectorAll('details').forEach((el) => el.setAttribute('open', ''));

  let bookTitle = '';
  if (isAbout) {
    // Giriş sayfasının H1'i kitabın adıdır; PDF'te kapakta durur, sayfa kendi adını alır.
    const h1 = root.querySelector('h1');
    bookTitle = h1.textContent.trim();
    h1.textContent = title;
    for (const h2 of root.querySelectorAll('h2')) {
      if (h2.textContent.trim() !== webOnlyHeading) {
        continue;
      }
      let node = h2;
      do {
        const next = node.nextElementSibling;
        node.remove();
        node = next;
      } while (node && node.tagName !== 'H2');
    }
  }

  // Mermaid her diyagramın stilini ve ok uçlarını SVG'nin kimliğine bağlar; kimlik sayfa
  // başına rastgele üretildiği için birleştirilmiş belgede çakışmasın diye yeniden adlandırılır.
  root.querySelectorAll('.docusaurus-mermaid-container').forEach((container, index) => {
    const svg = container.querySelector('svg');
    container.innerHTML = container.innerHTML.replaceAll(svg.id, `diyagram-${key}-${index + 1}`);
  });

  for (const el of root.querySelectorAll('[id]')) {
    if (!el.closest('svg')) {
      el.id = `${key}--${el.id}`;
    }
  }

  for (const a of root.querySelectorAll('a[href]')) {
    const url = new URL(a.getAttribute('href'), location.href);
    a.removeAttribute('target');
    if (url.origin !== location.origin) {
      continue;
    }
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const target = keys[pathname];
    if (target) {
      const anchor = decodeURIComponent(url.hash.slice(1));
      a.setAttribute('href', `#${anchor ? `${target}--${anchor}` : target}`);
    } else {
      a.setAttribute('href', `${siteUrl}${pathname === '/' ? '/' : pathname}${url.search}${url.hash}`);
    }
  }

  // Tembel yüklenen görseller baskıda boş kalmasın.
  for (const img of root.querySelectorAll('img')) {
    img.removeAttribute('loading');
    img.setAttribute('decoding', 'sync');
  }

  // Bir kısmın altındaki sayfalar PDF yer imlerinde o kısmın altında görünsün diye başlık
  // düzeyleri bir kademe iner (etiketler ve görünüm aynı kalır).
  if (grouped) {
    for (const heading of root.querySelectorAll('h1, h2, h3, h4, h5')) {
      heading.setAttribute('aria-level', String(Number(heading.tagName[1]) + 1));
    }
  }

  return {
    html: root.innerHTML,
    bookTitle,
    stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) =>
      link.getAttribute('href'),
    ),
  };
}

async function extractPages(context, origin, manifest) {
  const keys = Object.fromEntries(
    manifest.pages.map((page) => [normalizePath(page.permalink), pageKey(page.permalink)]),
  );
  const page = await context.newPage();
  const chapters = [];
  for (const [index, item] of manifest.pages.entries()) {
    await page.goto(`${origin}${item.permalink}`, {waitUntil: 'load'});
    try {
      await page.waitForFunction(
        (count) =>
          document.querySelectorAll('.theme-doc-markdown .docusaurus-mermaid-container > svg')
            .length >= count,
        item.diagrams,
        {timeout: 60_000},
      );
    } catch (error) {
      throw new Error(`${item.permalink}: ${item.diagrams} Mermaid diyagramı çizilemedi.`, {
        cause: error,
      });
    }
    const extracted = await page.evaluate(extractInPage, {
      key: keys[normalizePath(item.permalink)],
      title: item.title,
      grouped: item.group !== '',
      isAbout: index === 0,
      keys,
      siteUrl: manifest.siteUrl,
      webOnlyHeading: WEB_ONLY_HEADING,
    });
    chapters.push({...item, key: keys[normalizePath(item.permalink)], ...extracted});
  }
  await page.close();
  return chapters;
}

/** Bölümleri kenar çubuğundaki kısımlara göre gruplar; giriş sayfası grupsuzdur. */
function groupChapters(chapters) {
  const groups = [];
  for (const chapter of chapters) {
    const last = groups.at(-1);
    if (last && last.label === chapter.group) {
      last.chapters.push(chapter);
    } else {
      groups.push({
        label: chapter.group,
        key: chapter.group ? `kisim-${groups.filter((g) => g.label).length + 1}` : '',
        chapters: [chapter],
      });
    }
  }
  return groups;
}

function tocRow(key, title, pageNumbers, className = '') {
  return (
    `<li class="ic-satir ${className}"><a href="#${key}">` +
    `<span class="ic-ad">${escapeHtml(title)}</span><span class="ic-nokta"></span>` +
    `<span class="ic-sayfa">${pageNumbers.get(key) ?? ''}</span></a></li>`
  );
}

function buildBookHtml({chapters, revision, siteUrl, printCss, pageNumbers}) {
  const {bookTitle, stylesheets} = chapters[0];
  const groups = groupChapters(chapters);
  const displayUrl = siteUrl.replace(/^https?:\/\//, '');
  const revisionText =
    formatLongDate(revision.date) + (revision.commit ? ` · ${revision.commit}` : '');

  // Sayfa kenarındaki üst bilgi: solda kitabın adı, sağda o sayfadaki bölümün adı.
  // Chromium `string-set` desteklemediği için her bölüme adlandırılmış bir sayfa verilir.
  const runningHeads = chapters
    .map(
      (chapter, index) =>
        `@page b${index} { @top-right { content: ${JSON.stringify(chapter.title)}; } }\n` +
        `[id="${chapter.key}"] { page: b${index}; }`,
    )
    .join('\n');

  const toc = groups
    .map((group) => {
      const rows = group.chapters.map((chapter) => tocRow(chapter.key, chapter.title, pageNumbers));
      return group.label
        ? `<ol class="ic-liste">${tocRow(group.key, group.label, pageNumbers, 'ic-kisim')}${rows.join('')}</ol>`
        : `<ol class="ic-liste">${rows.join('')}</ol>`;
    })
    .join('\n');

  const body = groups
    .map((group) => {
      const {no, title} = splitGroup(group.label);
      const divider = group.label
        ? `<section class="kisim" id="${group.key}">` +
          `<h1 data-yer-imi="${escapeHtml(group.label)}">` +
          (no ? `<span class="kisim-no">${escapeHtml(no)}</span> ` : '') +
          `<span class="kisim-ad">${escapeHtml(title)}</span></h1></section>`
        : '';
      const articles = group.chapters.map(
        (chapter) => `<article class="bolum markdown" id="${chapter.key}">${chapter.html}</article>`,
      );
      return divider + articles.join('\n');
    })
    .join('\n');

  return `<!doctype html>
<html lang="tr" data-theme="light">
<head>
<meta charset="utf-8">
<title>${escapeHtml(bookTitle)}</title>
<meta name="author" content="${escapeHtml(AUTHOR)}">
<meta name="description" content="${escapeHtml(SUBTITLE)}">
${stylesheets.map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`).join('\n')}
<style>
${printCss}
@page { @top-left { content: ${JSON.stringify(bookTitle)}; } }
${runningHeads}
</style>
</head>
<body>
<section class="kapak">
  <img class="kapak-logo" src="/img/logo.svg" alt="">
  <p class="kapak-ust">Açık kaynak · Türkçe · DO-178C</p>
  <p class="kapak-baslik">${escapeHtml(bookTitle)}</p>
  <p class="kapak-alt">${escapeHtml(SUBTITLE)}</p>
  <p class="kapak-yazar">${escapeHtml(AUTHOR)}</p>
  <p class="kapak-surum">${escapeHtml(displayUrl)}/kitap<br>Sürüm: ${escapeHtml(revisionText)}</p>
</section>
<section class="kunye">
  <p><strong>${escapeHtml(bookTitle)}</strong><br>${escapeHtml(AUTHOR)}</p>
  <p>Bu PDF, <a href="${siteUrl}/kitap">${escapeHtml(displayUrl)}/kitap</a> adresindeki kitabın
  ${escapeHtml(formatLongDate(revision.date))} tarihli içeriğinden otomatik olarak üretilmiştir.
  Kitap yaşayan bir çalışmadır; güncel sürüm her zaman sitededir.</p>
  <p>İçerik <a href="${LICENSE_URL}">Creative Commons Atıf-AynıLisanslaPaylaş 4.0 (CC BY-SA 4.0)</a>
  ile lisanslanmıştır: kaynağı belirterek paylaşabilir, uyarlayabilir ve aynı lisansla
  yayımlayabilirsiniz.</p>
  <p>Bir hata gördüyseniz ya da katkıda bulunmak isterseniz:
  <a href="${REPO_URL}">${escapeHtml(REPO_URL.replace(/^https?:\/\//, ''))}</a></p>
</section>
<nav class="icindekiler" id="icindekiler">
<h1>İçindekiler</h1>
${toc}
</nav>
${body}
</body>
</html>`;
}

/**
 * Tarayıcıda çalışır: yazı tipleri ve görseller yüklenince belgeyi baskıya hazırlar ve
 * yüklenemeyen görselleri, hedefi olmayan belge içi bağlantıları döndürür.
 */
async function prepareInPage() {
  const loaded = (img) =>
    img.complete ? null : new Promise((resolve) => img.addEventListener('loadend', resolve));
  await document.fonts.ready;
  await Promise.all([...document.images].map(loaded));

  // PDF'te WebP yoktur: Chromium WebP görselleri kayıpsız piksel verisi olarak gömer
  // (130 KB'lık bir fotoğraf 1,2 MB olur). JPEG ise olduğu gibi gömülür; sitedeki WebP'ler
  // fotoğraf/illüstrasyon olduğu için (diyagramlar PNG ya da Mermaid) JPEG'e çevrilir.
  for (const img of document.images) {
    if (!/\.webp$/i.test(new URL(img.currentSrc || img.src, location.href).pathname)) {
      continue;
    }
    if (img.naturalWidth === 0) {
      continue;
    }
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    img.src = canvas.toDataURL('image/jpeg', 0.86);
    await img.decode();
  }

  const brokenImages = [...document.images]
    .filter((img) => img.naturalWidth === 0)
    .map((img) => img.getAttribute('src'));
  const brokenAnchors = [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => decodeURIComponent(a.getAttribute('href').slice(1)))
    .filter((id) => !document.getElementById(id));
  // PDF yer imleri başlıklardan üretilir; metinleri finalizePdf düzeltir.
  const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => ({
    title: (heading.dataset.yerImi ?? heading.textContent).replace(/\s+/g, ' ').trim(),
    custom: heading.dataset.yerImi !== undefined,
  }));
  return {brokenImages, brokenAnchors: [...new Set(brokenAnchors)], headings};
}

async function printBook(page, origin, virtualPages, html) {
  virtualPages.set(BOOK_ROUTE, html);
  await page.goto(`${origin}${BOOK_ROUTE}`, {waitUntil: 'load'});
  const {brokenImages, brokenAnchors, headings} = await page.evaluate(prepareInPage);
  if (brokenImages.length > 0) {
    throw new Error(`Yüklenemeyen görseller: ${brokenImages.join(', ')}`);
  }
  if (brokenAnchors.length > 0) {
    throw new Error(`Hedefi bulunmayan belge içi bağlantılar: ${brokenAnchors.join(', ')}`);
  }
  const pdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    outline: true,
    tagged: true,
  });
  return {pdf, headings};
}

/**
 * PDF'teki adlandırılmış hedeflerden (Chromium, bağlantı verilen her `id` için bir tane
 * yazar) `keys` içindeki kimliklerin sayfa numaralarını okur.
 */
async function readPageNumbers(pdfBytes, keys) {
  const doc = await PDFDocument.load(pdfBytes, {updateMetadata: false});
  const pageIndex = new Map(doc.getPages().map((page, index) => [page.ref.toString(), index]));
  const dests = doc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict);
  const numbers = new Map();
  for (const key of keys) {
    const dest = dests?.lookupMaybe(PDFName.of(key), PDFArray);
    const ref = dest?.get(0);
    const index = ref instanceof PDFRef ? pageIndex.get(ref.toString()) : undefined;
    if (index === undefined) {
      throw new Error(`PDF'te "${key}" hedefinin sayfası bulunamadı.`);
    }
    numbers.set(key, index + 1);
  }
  return {numbers, pageCount: doc.getPageCount()};
}

/** Yer imlerini belgedeki sırayla (önce derinlik) döndürür. */
function outlineItems(doc) {
  const items = [];
  const visit = (first) => {
    for (let item = first; item; item = item.lookupMaybe(PDFName.of('Next'), PDFDict)) {
      items.push(item);
      visit(item.lookupMaybe(PDFName.of('First'), PDFDict));
    }
  };
  visit(
    doc.catalog
      .lookupMaybe(PDFName.of('Outlines'), PDFDict)
      ?.lookupMaybe(PDFName.of('First'), PDFDict),
  );
  return items;
}

/**
 * Chromium yer imi metnini başlığın satırlarını boşluksuz birleştirerek yazar ve sayfa
 * başına denk gelen başlıkların ilk satırını yineler ("4. DO-178C ve Destekleyici4. DO-178C
 * ve DestekleyiciDokümanlara …"). Yer imleri başlıklarla aynı sırada olduğundan metinler
 * belgedeki başlık metniyle değiştirilir. Sıra ya da içerik beklenenle örtüşmüyorsa
 * (Chromium'un davranışı değiştiyse) dokunulmaz ve uyarı yazılır.
 */
function fixOutlineTitles(doc, headings) {
  const items = outlineItems(doc);
  const squeeze = (text) => text.replace(/\s+/g, '');
  const matches =
    items.length === headings.length &&
    items.every((item, index) => {
      const {title, custom} = headings[index];
      const current = item.lookup(PDFName.of('Title')).decodeText();
      return custom || squeeze(current).endsWith(squeeze(title));
    });
  if (!matches) {
    console.warn('[kitap-pdf] Uyarı: yer imleri başlıklarla eşleşmedi; metinleri düzeltilmedi.');
    return;
  }
  items.forEach((item, index) => {
    item.set(PDFName.of('Title'), PDFHexString.fromText(headings[index].title));
  });
}

/**
 * Chromium'un çıktısını üstverisini tamamlayıp nesne akışlarıyla (object streams) yeniden
 * kaydeder: erişilebilirlik etiketleri sıkıştırılmadan yazıldığı için dosya belirgin küçülür.
 */
async function finalizePdf(pdfBytes, {title, revision, siteUrl, headings}) {
  const doc = await PDFDocument.load(pdfBytes, {updateMetadata: false});
  fixOutlineTitles(doc, headings);
  doc.setTitle(title, {showInWindowTitleBar: true});
  doc.setAuthor(AUTHOR);
  doc.setSubject(SUBTITLE);
  doc.setKeywords(KEYWORDS);
  doc.setLanguage('tr');
  // Chromium buraya üretildiği makinenin tarayıcı kimliğini (user agent) yazar.
  doc.setCreator(`${siteUrl}/kitap${revision.commit ? ` (${revision.commit})` : ''}`);
  return doc.save({useObjectStreams: true});
}

async function main() {
  const manifest = JSON.parse(
    await fs.readFile(MANIFEST, 'utf8').catch(() => {
      throw new Error('Manifest bulunamadı; önce `npm run build` çalıştırın.');
    }),
  );
  if (manifest.pages[0].group !== '') {
    throw new Error('Manifestin ilk sayfası kitabın giriş sayfası (kitap/index.md) olmalı.');
  }
  const printCss = await fs.readFile(PRINT_CSS, 'utf8');
  const revision = bookRevision();
  const virtualPages = new Map();
  const server = await startServer(BUILD_DIR, virtualPages, {[FONT_ROUTE]: FONT_DIR});
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      colorScheme: 'light',
      viewport: {width: 1280, height: 900},
    });
    // Yalnızca yerel sunucu: analitik ve diğer dış istekler PDF üretiminden çıkmaz.
    await context.route(
      (url) => url.origin !== server.origin,
      (route) => route.abort(),
    );

    const chapters = await extractPages(context, server.origin, manifest);
    const tocKeys = groupChapters(chapters).flatMap((group) => [
      ...(group.key ? [group.key] : []),
      ...group.chapters.map((chapter) => chapter.key),
    ]);
    const build = (pageNumbers) =>
      buildBookHtml({chapters, revision, siteUrl: manifest.siteUrl, printCss, pageNumbers});

    const page = await context.newPage();
    const draft = await printBook(page, server.origin, virtualPages, build(new Map()));
    const expected = await readPageNumbers(draft.pdf, tocKeys);
    const printed = await printBook(page, server.origin, virtualPages, build(expected.numbers));
    const actual = await readPageNumbers(printed.pdf, tocKeys);
    for (const key of tocKeys) {
      if (actual.numbers.get(key) !== expected.numbers.get(key)) {
        throw new Error(`İçindekiler sayfa numarası tutarsız: "${key}".`);
      }
    }

    const pdf = await finalizePdf(printed.pdf, {
      title: chapters[0].bookTitle,
      revision,
      siteUrl: manifest.siteUrl,
      headings: printed.headings,
    });
    const output = path.join(BUILD_DIR, manifest.output);
    await fs.writeFile(output, pdf);
    const sizeMb = (pdf.length / 1024 / 1024).toFixed(1).replace('.', ',');
    console.log(
      `[kitap-pdf] ${path.relative(ROOT, output)}: ${actual.pageCount} sayfa, ` +
        `${chapters.length} bölüm, ${sizeMb} MB (${browser.version()})`,
    );
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((error) => {
  console.error(`[kitap-pdf] ${error.stack ?? error}`);
  process.exitCode = 1;
});
