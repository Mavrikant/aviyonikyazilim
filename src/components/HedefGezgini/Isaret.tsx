import type {ReactNode} from 'react';
import clsx from 'clsx';

import type {Durum} from './veri';
import styles from './styles.module.css';

/**
 * Hedefin bir seviyedeki durumu: dolu daire bağımsızlıkla, halka gerekli, kısa çizgi
 * aranmaz. Süs öğesidir; anlamı yanındaki metin ya da kapsayıcının aria-label'ı taşır.
 */
export default function Isaret({durum}: {durum: Durum}): ReactNode {
  return (
    <span
      className={clsx(styles.isaret, durum === 'B' ? styles.isaretB : durum === 'G' ? styles.isaretG : styles.isaretYok)}
      aria-hidden="true"
    />
  );
}
