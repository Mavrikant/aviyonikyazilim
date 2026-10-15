import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

import styles from './styles.module.css';

/** Dört katılım aşaması denetimi; adlar 12. bölümdeki tabloyla aynıdır. */
const ASAMALAR = [
  {no: 1, ad: 'Planlama', yol: '/kitap/soi-denetimleri/soi-1'},
  {no: 2, ad: 'Geliştirme', yol: '/kitap/soi-denetimleri/soi-2'},
  {no: 3, ad: 'Doğrulama', yol: '/kitap/soi-denetimleri/soi-3'},
  {no: 4, ad: 'Son sertifikasyon', yol: '/kitap/soi-denetimleri/soi-4'},
] as const;

type Props = {
  /** Bulunulan sayfanın aşaması (1–4); bağlantı değil, vurgulu adım olarak gösterilir */
  aktif: 1 | 2 | 3 | 4;
};

/**
 * SOI hazırlık listelerinin başındaki aşama şeridi: dört denetimin sırasını ve okuyucunun
 * hangisinde olduğunu gösterir, diğer listelere bağlanır. Gezinme öğesidir; kitap PDF'ine
 * alınmaz (data-pdf-disi).
 */
export default function SoiAsamalari({aktif}: Props): ReactNode {
  return (
    <nav className={styles.serit} aria-label="Katılım aşaması denetimleri" data-pdf-disi="">
      <ol className={styles.liste}>
        {ASAMALAR.map((a) => {
          const icerik = (
            <>
              <span className={styles.no}>SOI-{a.no}</span>
              <span className={styles.ad}>{a.ad}</span>
            </>
          );
          return (
            <li key={a.no} className={clsx(styles.adim, a.no === aktif && styles.aktif, a.no < aktif && styles.gecmis)}>
              {a.no === aktif ? (
                <span className={styles.kutu} aria-current="page">
                  {icerik}
                </span>
              ) : (
                <Link className={styles.kutu} to={a.yol}>
                  {icerik}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
