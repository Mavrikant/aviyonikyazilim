import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import useHomepageData from '@site/src/components/AnaSayfa/useHomepageData';
import AracSimgesi from '@site/src/components/AracKatalogu/Simgeler';
import styles from './styles.module.css';

type Props = {
  /** Aracın adresi, örn. "/araclar/dogrulama/mcdc-test-seti" */
  yol: string;
  /**
   * Adresin # kısmı (başında # olmadan): aracı belirli bir durumla açan paylaşım verisi,
   * örn. McdcAraci/paylasim.ts'teki `mcdcIfadesi('A && B')`.
   */
  ek?: string;
  /** Kartta aracın kendi açıklaması yerine gösterilecek, sayfaya özgü metin */
  children?: ReactNode;
};

/**
 * Kitap bölümlerinden ve blog yazılarından ilgili araca giden kart. Başlık, açıklama ve
 * şema elle yazılmaz: plugins/homepage-data.ts'in `araclarSidebar`'dan ürettiği araç
 * listesinden gelir (araç kataloğuyla aynı kaynak). Adres listede yoksa derleme durur.
 *
 * `ek` verilirse bağlantı Docusaurus `Link`'i yerine düz `<a>` olur: #d=… bir başlık çapası
 * değildir ve kırık çapa denetimine (onBrokenAnchors) takılmamalıdır. Adresin kendisi araç
 * listesiyle doğrulanmış olur.
 */
export default function AracKarti({yol, ek, children}: Props): ReactNode {
  const {tools} = useHomepageData();
  const arac = tools.find((t) => t.permalink === yol);
  const href = useBaseUrl(yol);
  if (!arac) {
    throw new Error(`[AracKarti] "${yol}" adresinde araç yok. Mevcut araçlar: ${tools.map((t) => t.permalink).join(', ')}`);
  }

  const baslik = ek ? (
    <a className={styles.baslik} href={`${href}#${ek}`}>
      {arac.title}
    </a>
  ) : (
    <Link className={styles.baslik} to={arac.permalink}>
      {arac.title}
    </Link>
  );

  return (
    <aside className={styles.kart} aria-label={`Araç: ${arac.title}`}>
      <span className={styles.simge} aria-hidden="true">
        <AracSimgesi ad={arac.icon} />
      </span>
      <div className={styles.govde}>
        <span className={styles.ust}>Tarayıcıda deneyin · {arac.category}</span>
        {baslik}
        <div className={styles.aciklama}>{children ?? arac.description}</div>
      </div>
    </aside>
  );
}
