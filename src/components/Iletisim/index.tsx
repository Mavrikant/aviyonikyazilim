import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import Eposta from '@site/src/components/Eposta';
import SohbetSimgesi from '@site/src/components/CanliSohbet/SohbetSimgesi';
import {useSohbet} from '@site/src/components/CanliSohbet/useSohbet';

import styles from './styles.module.css';

const YENI_KONU_URL = 'https://github.com/Mavrikant/aviyonikyazilim/issues/new/choose';

/**
 * İletişim sayfasının gövdesi. Tema, bağımsız MDX sayfalarına (src/pages/*.mdx) kitap
 * sayfalarındaki `.markdown` sınıfını vermez; bağlantı alt çizgisi, başlık aralıkları ve
 * okuma genişliği kitapla aynı olsun diye içerik bu sarmalayıcıya alınır.
 */
export function IletisimSayfasi({children}: {children: ReactNode}): ReactNode {
  return <div className={clsx('markdown', styles.sayfa)}>{children}</div>;
}

type KanalProps = {
  simge: ReactNode;
  baslik: string;
  /** Bu kanala uygun konular (kısa etiketler). */
  konular: string[];
  children: ReactNode;
};

function Kanal({simge, baslik, konular, children}: KanalProps): ReactNode {
  return (
    <li className={styles.kanal}>
      <span className={styles.simgeKutusu}>{simge}</span>
      <div className={styles.govde}>
        <h3 className={styles.baslik}>{baslik}</h3>
        <ul className={styles.konular} aria-label="Uygun konular">
          {konular.map((konu) => (
            <li key={konu} className={styles.konu}>
              {konu}
            </li>
          ))}
        </ul>
        {children}
      </div>
    </li>
  );
}

function EpostaSimgesi(): ReactNode {
  return (
    <svg className={styles.simge} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7.5l8.5 6 8.5-6" />
    </svg>
  );
}

/** GitHub'daki "açık konu" işareti: halka ve ortasında nokta. */
function KonuSimgesi(): ReactNode {
  return (
    <svg className={styles.simge} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}

/**
 * İletişim kanalları: e-posta, GitHub ve — yalnızca yapılandırılmışsa — canlı sohbet.
 * Sohbet yapılandırılmamışsa (TAWK_TO_ID yok) sayfada sohbetten hiç söz edilmez.
 */
export function IletisimKanallari(): ReactNode {
  const sohbet = useSohbet();
  const yukleniyor = sohbet.durum === 'yukleniyor';

  return (
    <div className={styles.kanallar}>
      <ul className={styles.liste}>
        <Kanal
          simge={<EpostaSimgesi />}
          baslik="E-posta"
          konular={['Kitap önerisi', 'Araç önerisi', 'Özel soru', 'GitHub kullanmayanlar']}
        >
          <p className={styles.aciklama}>
            Herkese açık yazmak istemediğiniz her konu için. Düğme e-posta uygulamanızı açar ve
            adresi gösterir.
          </p>
          <p className={styles.eylem}>
            <Eposta subject="İletişim" noscriptHint>
              E-posta gönder
            </Eposta>
          </p>
        </Kanal>

        <Kanal
          simge={<KonuSimgesi />}
          baslik="GitHub"
          konular={['Hata bildirimi', 'Konu önerisi', 'Eksik ya da belirsiz anlatım']}
        >
          <p className={styles.aciklama}>
            Yazım hatası, yanlış bilgi, kırık bağlantı ya da eksik bir başlık için hazır konu
            (issue) formları var. Ücretsiz bir GitHub hesabı gerekir; açılan konular herkese
            açıktır.
          </p>
          <p className={styles.eylem}>
            <Link href={YENI_KONU_URL}>GitHub’da konu aç</Link>
          </p>
        </Kanal>

        {sohbet.yapilandirildi && (
          <Kanal
            simge={<SohbetSimgesi className={styles.simge} />}
            baslik="Canlı sohbet"
            konular={['Hızlı soru']}
          >
            <p className={styles.aciklama}>
              Kısa sorular için. Sohbetin başında her zaman biri bulunmayabilir; yanıt gecikirse
              e-posta daha güvenilir bir yoldur.
            </p>
            <p className={styles.eylem}>
              <button
                type="button"
                className={styles.sohbetDugme}
                onClick={sohbet.ac}
                aria-busy={yukleniyor}
              >
                {yukleniyor ? 'Açılıyor…' : 'Sohbeti aç'}
              </button>
            </p>
            <div role="status">
              {sohbet.hata && <p className={styles.hata}>{sohbet.hata}</p>}
            </div>
            <p className={styles.not}>
              Sohbet, üçüncü taraf bir hizmet olan Tawk.to ile sunulur; düğmeye basılınca yüklenir
              ve çerez kullanabilir.
            </p>
          </Kanal>
        )}
      </ul>
    </div>
  );
}
