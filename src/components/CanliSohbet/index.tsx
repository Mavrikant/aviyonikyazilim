import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

import SohbetSimgesi from './SohbetSimgesi';
import {useSohbet} from './useSohbet';
import styles from './styles.module.css';

/**
 * Sağ alttaki yüzen "Canlı sohbet" düğmesi; src/theme/Root.tsx ile her sayfaya eklenir.
 *
 * Yalnızca sohbet yapılandırılmışsa (bkz. useSohbet) ve sayfa bir gömme sayfası (/gom/)
 * değilse görünür. Tawk betiği düğmeye basılınca yüklenir; yüklendikten sonra Tawk kendi
 * balonunu gösterdiği için bu düğme gizlenir.
 *
 * <html data-canli-sohbet> işareti, temanın "başa dön" düğmesini yukarı almak içindir
 * (src/css/custom.css): sağ alt köşeyi önce bu düğme, sonra Tawk balonu kullanır.
 */
export default function YuzenSohbetDugmesi(): ReactNode {
  const {yapilandirildi, durum, hata, ac} = useSohbet();
  const {pathname} = useLocation();
  const gomYolu = useBaseUrl('/gom/');

  if (!yapilandirildi || pathname.startsWith(gomYolu)) {
    return null;
  }

  const yukleniyor = durum === 'yukleniyor';

  return (
    <>
      <Head>
        <html data-canli-sohbet="acik" />
      </Head>
      {durum !== 'hazir' && (
        <div className={styles.yuva}>
          <div className={styles.durum} role="status">
            {hata && <p className={styles.hata}>{hata}</p>}
          </div>
          <button
            type="button"
            className={styles.dugme}
            onClick={ac}
            aria-busy={yukleniyor}
            aria-label={yukleniyor ? 'Canlı sohbet açılıyor…' : 'Canlı sohbet'}
          >
            <SohbetSimgesi className={styles.simge} />
            <span className={styles.etiket}>{yukleniyor ? 'Açılıyor…' : 'Canlı sohbet'}</span>
          </button>
        </div>
      )}
    </>
  );
}
