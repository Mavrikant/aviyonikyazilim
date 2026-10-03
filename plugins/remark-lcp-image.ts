/**
 * Sayfa başındaki görselin öncelikli yüklenmesi.
 *
 * Blog kapak görseli ya da kütüphane kapak resmi gibi sayfanın en üstündeki
 * görsel çoğunlukla Largest Contentful Paint (LCP) öğesidir. Docusaurus tüm
 * Markdown görsellerini loading="lazy" ile basar; tembel yükleme bu görselin
 * isteğini sayfa yerleşimi bitene kadar geciktirir. Bu eklenti, ilk birkaç
 * blok içindeki ilk görseli loading="eager" ve fetchpriority="high" yapar;
 * sayfanın aşağısındaki görseller tembel kalır.
 *
 * Blog liste sayfaları, yazıların <!-- truncate --> öncesini aynı dosyadan
 * işaretsiz ayrı bir derlemeyle üretir. Orada birden çok yazının görseli aynı
 * anda öncelik kazanmasın diye işaret içermeyen blog derlemelerine dokunulmaz
 * (onUntruncatedBlogPosts: 'throw' olduğundan tam yazıda işaret hep vardır).
 *
 * Docusaurus'un transformImage adımından SONRA çalışmalıdır (remarkPlugins):
 * yerel görseller o adımda <img> JSX öğesine dönüşür.
 */

import path from 'node:path';

type Node = {
  type: string;
  name?: string;
  attributes?: {type: string; name: string; value: string}[];
  data?: {hProperties?: Record<string, string>};
  children?: Node[];
};

/** Görselin "sayfa başında" sayılması için bakılan üst düzey blok sayısı. */
const TOP_BLOCKS = 3;
const TRUNCATE_MARKER = /<!--\s*truncate\s*-->|\{\/\*\s*truncate\s*\*\/\}/;
const BLOG_DIR = `${path.sep}blog${path.sep}`;

function findImage(node: Node): Node | undefined {
  if ((node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement') && node.name === 'img') {
    return node;
  }
  if (node.type === 'image') return node;
  for (const child of node.children ?? []) {
    const found = findImage(child);
    if (found) return found;
  }
  return undefined;
}

function prioritize(image: Node): void {
  if (image.type === 'image') {
    // Uzak görsel: transformImage dokunmaz, mdast → hast özellikleriyle işaretlenir.
    image.data = {...image.data, hProperties: {...image.data?.hProperties, loading: 'eager', fetchPriority: 'high'}};
    return;
  }
  const attributes = (image.attributes ?? []).filter((a) => a.name !== 'loading' && a.name !== 'fetchPriority');
  attributes.push(
    {type: 'mdxJsxAttribute', name: 'loading', value: 'eager'},
    {type: 'mdxJsxAttribute', name: 'fetchPriority', value: 'high'},
  );
  image.attributes = attributes;
}

export default function remarkLcpImage() {
  return (root: Node, file: {path?: string; value?: unknown}): void => {
    const isBlogExcerpt = file.path?.includes(BLOG_DIR) && !TRUNCATE_MARKER.test(String(file.value ?? ''));
    if (isBlogExcerpt) return;

    for (const block of (root.children ?? []).slice(0, TOP_BLOCKS)) {
      const image = findImage(block);
      if (image) {
        prioritize(image);
        return;
      }
    }
  };
}
