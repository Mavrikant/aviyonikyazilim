/**
 * Meta açıklaması (description) — frontmatter'da `description` yoksa sayfanın
 * ilk düz metin paragrafından üretir.
 *
 * Docusaurus'un varsayılanı içeriğin ilk *satırını* alır. Bu depoda paragraflar
 * ~80 sütunda satır kırılarak yazıldığı için bu, cümlenin ortasında kesilen
 * açıklamalara; görsel ya da tabloyla başlayan sayfalarda ise "… kapak görseli",
 * "| Künye | |" gibi anlamsız metinlere yol açıyordu. Arama sonuçlarındaki
 * özet (snippet), sosyal paylaşım önizlemesi ve RSS özeti bu alandan beslenir.
 *
 * Burada ilk paragrafın satırları birleştirilir; başlık, görsel, tablo, liste,
 * alıntı, kod bloğu, HTML ve admonition içeriği atlanır. Sonuç ~160 karakteri
 * aşarsa önce cümle sonunda, olmazsa kelime sınırında kısaltılır.
 * `markdown.parseFrontMatter` kancası olarak tüm içerik eklentilerinde çalışır.
 */

import type {ParseFrontMatter} from '@docusaurus/types';

/** Arama sonuçlarında kesilmeden görünen yaklaşık uzunluk. */
const MAX_LENGTH = 160;
/** Bundan kısa bir ilk cümle tek başına açıklama sayılmaz. */
const MIN_SENTENCE_LENGTH = 70;

function isProse(line: string): boolean {
  return !(
    /^#{1,6}(\s|$)/.test(line) || // başlık
    line.startsWith('|') || // tablo
    line.startsWith('![') || // görsel
    line.startsWith('<') || // HTML, yorum (<!-- truncate -->)
    line.startsWith('>') || // alıntı
    /^(import|export)\s/.test(line) || // MDX
    /^([-*+]|\d+[.)])\s/.test(line) || // liste
    /^([-*_])(\s*\1){2,}$/.test(line) || // yatay çizgi
    /^\*\*[^*]+\*\*:?\\?$/.test(line) // yalnızca kalın metinden oluşan sahte başlık
  );
}

function firstParagraph(content: string): string[] {
  const paragraph: string[] = [];
  let fence: string | null = null;
  let inComment = false;
  let admonitionDepth = 0;

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();

    if (fence) {
      if (line.startsWith(fence) && line.replace(/[`~]/g, '') === '') fence = null;
      continue;
    }
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      continue;
    }

    const fenceMatch = /^(`{3,}|~{3,})/.exec(line);
    const isBlockStart = Boolean(fenceMatch) || line.startsWith(':::') || line.startsWith('<!--');
    if (paragraph.length > 0 && (line === '' || isBlockStart || !isProse(line))) break;

    if (fenceMatch) {
      fence = fenceMatch[1];
    } else if (line.startsWith('<!--')) {
      inComment = !line.includes('-->');
    } else if (/^:{3,}/.test(line)) {
      admonitionDepth = Math.max(0, admonitionDepth + (/^:{3,}$/.test(line) ? -1 : 1));
    } else if (admonitionDepth === 0 && line !== '' && isProse(line)) {
      // Paragraf dışındaki girintili satır liste maddesinin devamıdır; atlanır.
      if (paragraph.length === 0 && /^\s/.test(raw)) continue;
      paragraph.push(line.replace(/\\$/, '')); // satır sonundaki kırılım ters bölüsü
    }
  }
  return paragraph;
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // görsel
    .replace(/\[\^[^\]]+\]/g, '') // dipnot
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // bağlantı
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1') // referans bağlantı
    .replace(/<[^>]+>/g, '') // HTML
    .replace(/[<>]/g, '') // tek geçişte kalan parçalar (<scr<b>ipt> → <script>)
    .replace(/`([^`]+)`/g, '$1') // satır içi kod
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // kalın
    .replace(/\*(\S(?:.*?\S)?)\*/g, '$1') // italik (*)
    .replace(/(^|[^\p{L}\p{N}])_(\S(?:.*?\S)?)_(?![\p{L}\p{N}])/gu, '$1$2') // italik (_)
    .replace(/~~(.+?)~~/g, '$1') // üstü çizili
    .replace(/\\([\\`*_{}[\]()#+\-.!|])/g, '$1') // kaçış karakterleri
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(text: string): string {
  if (text.length <= MAX_LENGTH) return text;

  // Önce MAX_LENGTH içindeki son cümle sonunda kes.
  let sentenceEnd = -1;
  for (const match of text.slice(0, MAX_LENGTH + 1).matchAll(/[.!?](?=\s)/g)) {
    sentenceEnd = match.index;
  }
  if (sentenceEnd + 1 >= MIN_SENTENCE_LENGTH) return text.slice(0, sentenceEnd + 1);

  // Değilse son kelime sınırında kes ve üç nokta ekle.
  const cut = text.lastIndexOf(' ', MAX_LENGTH - 1);
  return `${text.slice(0, cut).replace(/[\s,;:(—–-]+$/, '')}…`;
}

export function createDescription(content: string): string | undefined {
  const text = toPlainText(firstParagraph(content).join(' '));
  return text ? shorten(text) : undefined;
}

export const parseFrontMatter: ParseFrontMatter = async (params) => {
  const result = await params.defaultParseFrontMatter(params);
  if (result.frontMatter.description === undefined) {
    const description = createDescription(result.content);
    if (description) result.frontMatter.description = description;
  }
  return result;
};
