import {useEffect, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/*
 * E-posta düğmesi: adres ve "mailto:" şeması sayfa kaynağında (HTML ve bu bileşenin kendi
 * JS parçasında) düz metin olarak bulunmaz; adres toplayan botlar bunları tarar. Parçalar
 * yalnızca kullanıcı düğmeye bastığında tarayıcıda birleştirilir. (Üçüncü taraf JS paketleri
 * — Docusaurus yazar kartı, Markdown kütüphanesi — "mailto:" dizgisini kendileri taşır.)
 *
 * Basılınca iki şey olur: e-posta uygulaması açılır (mailto) ve adres görünür,
 * seçilebilir metin olarak ve gerçek bir bağlantıyla gösterilir; böylece web
 * postası kullananlar ya da varsayılan e-posta uygulaması olmayanlar adresi
 * kopyalayabilir. Odak yeni bağlantıya taşınır, ekran okuyucu adresi okur.
 */

const ISSUES_URL = 'https://github.com/Mavrikant/aviyonikyazilim/issues/new/choose';

const KULLANICI = ['ser', 'dar'];
const ALAN_ADI = ['kara', 'man'];
const UZANTI = ['d', 'ev'];
const SEMA = ['mail', 'to'];

function birlestir(parcalar: string[]): string {
  return parcalar.join('');
}

function adresiOlustur(): string {
  return `${birlestir(KULLANICI)}@${birlestir(ALAN_ADI)}.${birlestir(UZANTI)}`;
}

/** Konu başlığı encodeURIComponent ile kodlanır; Türkçe karakterler de güvenle taşınır. */
function postaBaglantisi(adres: string, subject: string): string {
  return `${birlestir(SEMA)}:${adres}?subject=${encodeURIComponent(subject)}`;
}

type Props = {
  /** E-postanın konu satırı, örn. "Kitap önerisi". */
  subject: string;
  /** Düğmeye eklenen sınıf (bağlama göre görünümü uyarlamak için). */
  className?: string;
  /** Gösterilen adres bölümüne (parantez içindeki adres) eklenen sınıf. */
  adresClassName?: string;
  /** Düğme etiketi, örn. "Kitap öner". */
  children: ReactNode;
  /**
   * JavaScript kapalıyken düğme çalışmaz; true ise cümlenin sonuna GitHub konu formunu
   * gösteren kısa bir <noscript> notu eklenir. Aynı sayfada tekrar etmemesi için yalnızca
   * sayfadaki tek bir kullanımda verilir.
   */
  noscriptHint?: boolean;
};

export default function Eposta({
  subject,
  className,
  adresClassName,
  children,
  noscriptHint = false,
}: Props): ReactNode {
  const [adres, setAdres] = useState<string | null>(null);
  const baglanti = useRef<HTMLAnchorElement>(null);

  // Adres görünür olunca odağı bağlantıya taşı: ekran okuyucu adresi duyurur,
  // klavye kullanıcısı bağlantıyı doğrudan etkinleştirebilir.
  useEffect(() => {
    if (adres) {
      baglanti.current?.focus();
    }
  }, [adres]);

  function ac(): void {
    const gercekAdres = adresiOlustur();
    setAdres(gercekAdres);
    window.location.href = postaBaglantisi(gercekAdres, subject);
  }

  return (
    <>
      <button type="button" className={clsx(styles.dugme, className)} onClick={ac}>
        {children}
      </button>
      {adres && (
        <span className={clsx(styles.adres, adresClassName)}>
          {' '}
          (
          <a ref={baglanti} className={styles.adresBaglanti} href={postaBaglantisi(adres, subject)}>
            {adres}
          </a>
          )
        </span>
      )}
      {noscriptHint && (
        <noscript>
          <span className={styles.noscript}>
            {' '}
            (JavaScript gerekir; bunun yerine <a href={ISSUES_URL}>GitHub konu formunu</a> kullanın)
          </span>
        </noscript>
      )}
    </>
  );
}
