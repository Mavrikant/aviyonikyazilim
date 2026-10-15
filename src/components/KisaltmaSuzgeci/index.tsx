import {useEffect, useId, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

type Props = {
  /** Sayfanın MDX `toc` dışa aktarımı: harf başlıkları (## A …) buradan okunur */
  toc: readonly {value: string; id: string; level: number}[];
};

/** Arama için yalın biçim: büyük/küçük harf ve Türkçe işaretler ayırt edilmez (ı/i, ş/s …). */
function yalin(metin: string): string {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/\s+/g, ' ');
}

/** Bir H2 başlığından sonraki kardeşler (bir sonraki H2'ye kadar): o bölümün içeriği */
function bolumOgeleri(h2: Element): Element[] {
  const ogeler: Element[] = [];
  for (let n = h2.nextElementSibling; n && n.tagName !== 'H2'; n = n.nextElementSibling) {
    ogeler.push(n);
  }
  return ogeler;
}

/**
 * Kısaltmalar sayfasının süzgeci: arama kutusu ve A–Z harf şeridi. Tablolar sayfada
 * Markdown olarak kalır (sunucu çıktısında, site içi aramada ve PDF'te tamdır); süzgeç
 * yalnızca tarayıcıda, eşleşmeyen satırları ve tamamen boşalan bölümleri gizler.
 * Etkileşimli olduğu için kitap PDF'ine alınmaz (data-pdf-disi).
 */
export default function KisaltmaSuzgeci({toc}: Props): ReactNode {
  const kimlik = useId();
  const kok = useRef<HTMLDivElement>(null);
  // Süzgecin yapışmadan önceki yeri: sonuç kısalınca sayfa oraya kaydırılır
  const isaret = useRef<HTMLDivElement>(null);
  const [sorgu, setSorgu] = useState('');
  const [sonuc, setSonuc] = useState<{eslesen: number; bosBolumler: Set<string>} | null>(null);
  const harfler = toc.filter((t) => t.level === 2 && /^[A-ZÇĞİÖŞÜ]$/u.test(t.value));

  useEffect(() => {
    const sayfa = kok.current?.closest('.theme-doc-markdown');
    if (!sayfa) return undefined;
    const aranan = yalin(sorgu.trim());
    if (aranan === '') {
      setSonuc(null);
      return undefined;
    }
    // Yalnızca burada gizlenen öğeler geri açılır; sayfadaki başka gizli öğelere dokunulmaz.
    const gizlenen: HTMLElement[] = [];
    const gizle = (oge: HTMLElement) => {
      oge.hidden = true;
      gizlenen.push(oge);
    };
    let eslesen = 0;
    for (const satir of sayfa.querySelectorAll<HTMLTableRowElement>('table tbody tr')) {
      if (yalin(satir.textContent ?? '').includes(aranan)) eslesen += 1;
      else gizle(satir);
    }
    const bosBolumler = new Set<string>();
    for (const h2 of sayfa.querySelectorAll<HTMLElement>('h2')) {
      const ogeler = bolumOgeleri(h2);
      const tablolar = ogeler.filter((o) => o.tagName === 'TABLE');
      if (tablolar.length === 0 || tablolar.some((t) => t.querySelector('tbody tr:not([hidden])'))) continue;
      for (const oge of [h2, ...ogeler]) gizle(oge as HTMLElement);
      bosBolumler.add(h2.id);
    }
    setSonuc({eslesen, bosBolumler});
    // Aşağıdayken süzülürse sayfa kısalır ve okuyucu boş bir yerde kalır; ilk sonuçlar
    // süzgecin hemen altında görünsün diye süzgecin yapışmadan önceki yerine dönülür.
    if (isaret.current && kok.current) {
      const yapisma = parseFloat(getComputedStyle(kok.current).top) || 0;
      const hedef = isaret.current.getBoundingClientRect().top + window.scrollY - yapisma;
      if (window.scrollY > hedef) window.scrollTo({top: hedef});
    }
    return () => {
      for (const oge of gizlenen) oge.hidden = false;
    };
  }, [sorgu]);

  return (
    <>
      <div ref={isaret} aria-hidden="true" />
      <div ref={kok} className={styles.suzgec} data-pdf-disi="">
        <div className={styles.arama}>
          <label className={styles.etiket} htmlFor={kimlik}>
            Kısaltma ara
          </label>
          <input
            id={kimlik}
            className={styles.kutu}
            type="search"
            value={sorgu}
            onChange={(e) => setSorgu(e.target.value)}
            placeholder="ör. MC/DC, ARINC, kalite güvencesi"
            autoComplete="off"
            spellCheck={false}
          />
          <span className={styles.sonuc} aria-live="polite">
            {sonuc && (sonuc.eslesen === 0 ? 'Eşleşme yok' : `${sonuc.eslesen} eşleşme`)}
          </span>
        </div>
        {harfler.length > 0 && (
          <nav className={styles.harfler} aria-label="Harfe git">
            {harfler.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className={clsx(styles.harf, sonuc?.bosBolumler.has(h.id) && styles.bos)}
                aria-disabled={sonuc?.bosBolumler.has(h.id) || undefined}
                tabIndex={sonuc?.bosBolumler.has(h.id) ? -1 : undefined}>
                {h.value}
              </a>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
