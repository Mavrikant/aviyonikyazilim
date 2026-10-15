import type {ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/**
 * Kütüphane sayfalarının künyesi: kapak görseli ve kitabın ya da doküman ailesinin
 * temel bilgileri. Sayfalar alanları özellik (prop) olarak verir; etiketler, sıra ve
 * görünüm burada tek yerde tutulur.
 *
 * Kapak, bileşenin çocuğu olarak Markdown görseli biçiminde yazılır:
 *
 *   <Kunye yazar="…" yayinevi="…">
 *
 *   ![… kapak görseli](/img/kutuphane/<slug>/kapak.jpg)
 *
 *   </Kunye>
 *
 * Böylece görsel, Docusaurus'un görsel işleminden (boyut, içerik özetli dosya adı) ve
 * plugins/remark-lcp-image.ts'in öncelikli yüklemesinden geçer; ana sayfa da kapağı aynı
 * kalıptan bulur (plugins/homepage-data.ts). Kapağı olmayan sayfada bileşen kendini kapatır.
 */

type Kisi = string | string[];

type Props = {
  /** Tek yazar için metin, birden çok yazar için dizi ("Yazarlar" etiketi) */
  yazar?: Kisi;
  /** Editörlü derlemelerde yazar yerine */
  editor?: Kisi;
  yayinevi?: string;
  /** Kitap olmayan doküman aileleri için (RTCA, SAE, MISRA) */
  yayimci?: string;
  yil?: number | string;
  /** "3. baskı, 2014" gibi; yıl ayrıca verilmez */
  baski?: string;
  /** Sürekli güncellenen dokümanlarda geçerli sürüm */
  surum?: string;
  /** Kitap olmayan sayfalarda dokümanın türü */
  tur?: string;
  odak?: string;
  /**
   * "Başlangıç", "Orta", "İleri" ya da aralık ("Başlangıç–Orta"); parantez içinde not
   * eklenebilir: "Başlangıç (teknik önkoşul yok)".
   */
  seviye?: string;
  /** "Kimin için" satırı */
  kimin?: string;
  /** Kapak görseli (Markdown görseli) */
  children?: ReactNode;
};

const BASAMAKLAR = ['Başlangıç', 'Orta', 'İleri'] as const;

function kisiler(kisi: Kisi | undefined): {sayi: number; metin: string} | null {
  if (kisi === undefined) return null;
  const liste = Array.isArray(kisi) ? kisi : [kisi];
  return {sayi: liste.length, metin: liste.join(', ')};
}

/** "Başlangıç–Orta (not)" → işaretli basamaklar, aralık metni ve not */
function seviyeAyristir(seviye: string): {secili: Set<string>; aralik: string; not: string | null} {
  const [, aralik = seviye, not] = /^([^(]+?)\s*(?:\((.+)\))?$/.exec(seviye) ?? [];
  const uclar = aralik.split(/\s*[–-]\s*/);
  const bas = BASAMAKLAR.indexOf(uclar[0] as (typeof BASAMAKLAR)[number]);
  const son = BASAMAKLAR.indexOf(uclar.at(-1) as (typeof BASAMAKLAR)[number]);
  if (bas === -1 || son === -1 || son < bas) {
    throw new Error(`[Kunye] Tanınmayan seviye: "${seviye}" (Başlangıç, Orta, İleri ya da aralığı beklenir)`);
  }
  return {secili: new Set(BASAMAKLAR.slice(bas, son + 1)), aralik, not: not ?? null};
}

/**
 * Seviye: yükselen üç çubuk (başlangıç, orta, ileri) ve yanında metin. Çubuklar yalnızca
 * görseldir (aria-hidden, metinsiz); okunan ve aramaya giren değer yandaki metindir.
 */
function Seviye({seviye}: {seviye: string}): ReactNode {
  const {secili, aralik, not} = seviyeAyristir(seviye);
  return (
    <>
      <span className={styles.olcek} aria-hidden="true">
        {BASAMAKLAR.map((b) => (
          <span key={b} className={clsx(styles.basamak, secili.has(b) && styles.secili)} />
        ))}
      </span>
      <span className={styles.seviyeMetni}>{aralik}</span>
      {not && <span className={styles.not}>({not})</span>}
    </>
  );
}

export default function Kunye({
  yazar,
  editor,
  yayinevi,
  yayimci,
  yil,
  baski,
  surum,
  tur,
  odak,
  seviye,
  kimin,
  children,
}: Props): ReactNode {
  const yazarlar = kisiler(yazar);
  const editorler = kisiler(editor);
  const satirlar: [string, ReactNode][] = [];
  const ekle = (etiket: string, deger: ReactNode | undefined) => {
    if (deger !== undefined && deger !== null && deger !== '') satirlar.push([etiket, deger]);
  };

  if (yazarlar) ekle(yazarlar.sayi > 1 ? 'Yazarlar' : 'Yazar', yazarlar.metin);
  if (editorler) ekle(editorler.sayi > 1 ? 'Editörler' : 'Editör', editorler.metin);
  ekle('Yayınevi', yayinevi);
  ekle('Yayımcı', yayimci);
  ekle('Yıl', yil);
  ekle('Baskı', baski);
  ekle('Güncel sürüm', surum);
  ekle('Tür', tur);
  ekle('Odak', odak);
  ekle('Seviye', seviye && <Seviye seviye={seviye} />);
  ekle('Kimin için', kimin);

  return (
    <section className={clsx(styles.kunye, children && styles.kapakli)} aria-label="Künye">
      {children && <div className={styles.kapak}>{children}</div>}
      <dl className={styles.liste}>
        {satirlar.map(([etiket, deger]) => (
          <div key={etiket} className={styles.satir}>
            <dt>{etiket}</dt>
            <dd>{deger}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
