import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

import useHomepageData from '@site/src/components/AnaSayfa/useHomepageData';
import styles from './styles.module.css';

/**
 * Kitabın giriş sayfasındaki içindekiler. Elle yazılmaz: kısımlar, bölümler, ekler ve
 * okuma süreleri plugins/homepage-data.ts'in `kitapSidebar`dan ürettiği veriden gelir (ana
 * sayfadaki içindekilerle aynı kaynak). Yeni bölüm eklendiğinde burada kendiliğinden görünür.
 *
 * PDF'te bu liste yer almaz: scripts/kitap-pdf.mjs giriş sayfasının "İçindekiler" başlıklı
 * bölümünü (WEB_ONLY_HEADING) çıkarır, PDF'in sayfa numaralı kendi içindekileri vardır.
 */
export default function KitapIcindekiler(): ReactNode {
  const {book} = useHomepageData();
  return (
    <div className={styles.icindekiler}>
      {book.parts.map((part) => (
        <section key={part.title} className={styles.kisim}>
          <h3 className={styles.kisimBaslik}>
            {part.no && <span className={styles.kisimNo}>Kısım {part.no}</span>}
            <span>{part.title}</span>
          </h3>
          <ol className={styles.liste}>
            {part.chapters.map((chapter) => (
              <li key={chapter.permalink}>
                <Link className={styles.satir} to={chapter.permalink}>
                  <span className={styles.no}>{/^[A-Z]$/.test(chapter.no) ? `Ek ${chapter.no}` : chapter.no}</span>
                  <span className={styles.ad}>{chapter.title}</span>
                  <span className={styles.nokta} aria-hidden="true" />
                  <span className={styles.sure}>
                    <span aria-hidden="true">{chapter.minutes} dk</span>
                    <span className={styles.ekranOkuyucu}>, {chapter.minutes} dakika okuma</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {/* Kitabın sonunda kategorisiz duran sayfalar (Kısaltmalar): kenar çubuğundaki gibi
          bir kısım başlığı altında değil, ekleri izleyen ayrı satırlar olarak. */}
      {book.references.length > 0 && (
        <ul className={clsx(styles.liste, styles.son)}>
          {book.references.map((ref) => (
            <li key={ref.permalink}>
              <Link className={styles.satir} to={ref.permalink}>
                <span className={styles.no} aria-hidden="true" />
                <span className={styles.ad}>{ref.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
