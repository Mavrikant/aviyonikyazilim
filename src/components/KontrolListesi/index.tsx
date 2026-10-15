/**
 * Kontrol listesi sayfalarındaki "CSV olarak indir" düğmesi (varsayılan dışa aktarım,
 * ListeIndir); soru tablolarından oluşan ekler için TabloIndir (dosyanın sonunda).
 *
 * Maddeler ayrı bir veri dosyasında tutulmaz; sayfanın Markdown'ından üretilen onay kutulu
 * listeden okunur. Böylece liste tek yerde yazılır, sitede, aramada ve PDF'te aynı kalır.
 * Dışa aktarılan madde biçimi:
 *
 *   - [ ] **YGR-04** Soru metni? *(A–C · §6.3.1.d)*
 *
 * Kalın kısım madde numarasıdır; sondaki italik parantez seviye ve dayanaktır. Numarası
 * olmayan onay kutuları (giriş koşulları gibi) dışa aktarılmaz. Grup sütunu maddenin
 * üstündeki en yakın H3 (yoksa H2) başlığıdır.
 */

import {useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import styles from './styles.module.css';

type Props = {
  /** İndirilecek dosyanın adı, uzantısız (ASCII) */
  dosya: string;
  /** CSV'nin ilk satırına yazılan liste adı */
  baslik: string;
};

type Madde = {grup: string; no: string; soru: string; seviye: string; dayanak: string};

const NUMARA = /^[A-Z]{2,4}-\d{2}$/;

/** Başlıktaki çapa bağlantısının görünmez karakterini ve fazla boşluğu atar. */
const temiz = (s: string | null | undefined) => (s ?? '').replace(/​/g, '').replace(/\s+/g, ' ').trim();

function maddeleriOku(kok: ParentNode): Madde[] {
  const maddeler: Madde[] = [];
  let h2 = '';
  let h3 = '';
  kok.querySelectorAll('h2, h3, li.task-list-item').forEach((el) => {
    if (el.tagName === 'H2') {
      h2 = temiz(el.textContent);
      h3 = '';
      return;
    }
    if (el.tagName === 'H3') {
      h3 = temiz(el.textContent);
      return;
    }
    const numara = el.querySelector(':scope > strong');
    const no = temiz(numara?.textContent);
    if (!NUMARA.test(no)) {
      return;
    }
    const ems = el.querySelectorAll(':scope > em');
    const ek = ems.length > 0 ? ems[ems.length - 1] : null;
    const ekMetin = temiz(ek?.textContent);
    const [seviye = '', dayanak = ''] = /^\(.*\)$/.test(ekMetin)
      ? ekMetin.slice(1, -1).split('·').map((p) => p.trim())
      : [];
    let soru = temiz(el.textContent);
    soru = soru.startsWith(no) ? soru.slice(no.length) : soru;
    if (seviye || dayanak) {
      soru = soru.endsWith(ekMetin) ? soru.slice(0, -ekMetin.length) : soru;
    }
    maddeler.push({grup: h3 || h2, no, soru: soru.trim(), seviye, dayanak});
  });
  return maddeler;
}

function indir(blob: Blob, ad: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = ad;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Excel'in Türkçe ayarlarıyla açılsın diye `;` ayraçlı, BOM'lu UTF-8 CSV indirir. */
function csvIndir(satirlar: unknown[][], dosya: string) {
  const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = satirlar.map((s) => s.map(kacis).join(';')).join('\n');
  indir(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}), `${dosya}.csv`);
}

export default function ListeIndir({dosya, baslik}: Props): ReactNode {
  const isBrowser = useIsBrowser();
  const ref = useRef<HTMLParagraphElement>(null);
  const [sayi, setSayi] = useState(0);

  const kok = () => ref.current?.closest('.markdown') ?? document;

  useEffect(() => {
    if (isBrowser) {
      setSayi(maddeleriOku(kok()).length);
    }
  }, [isBrowser]);

  // Düğme JavaScript'siz ortamda ve sunucu çıktısında işe yaramaz; yalnızca tarayıcıda çizilir.
  if (!isBrowser) {
    return null;
  }

  const listeyiIndir = () => {
    const adres = `${window.location.origin}${window.location.pathname}`;
    csvIndir(
      [
        [`# ${baslik}`],
        [`# Kaynak: ${adres}; maddeler özgündür, bağlayıcı metin DO-178C'nin kendisidir`],
        ['Grup', 'No', 'Soru', 'Seviye', 'Dayanak', 'Sonuç (Evet / Hayır / Uygulanmaz)', 'Bulgu ya da not'],
        ...maddeleriOku(kok()).map((m) => [m.grup, m.no, m.soru, m.seviye, m.dayanak, '', '']),
      ],
      dosya,
    );
  };

  return (
    <p ref={ref} className={styles.indir}>
      <button
        type="button"
        className="button button--outline button--primary button--sm"
        onClick={listeyiIndir}
        disabled={sayi === 0}>
        CSV olarak indir{sayi > 0 && ` (${sayi} madde)`}
      </button>
      <span className={styles.aciklama}>
        Elektronik tabloya ya da gözden geçirme aracına aktarmak için; sonuç ve not sütunları boştur.
      </span>
    </p>
  );
}

type TabloProps = {
  /** İndirilecek dosyanın adı, uzantısız (ASCII) */
  dosya: string;
  /** CSV'nin ilk satırına yazılan liste adı */
  baslik: string;
  /** Dışa aktarılacak tabloların başlık satırı; yalnızca tam eşleşen tablolar alınır */
  sutunlar: string[];
  /** Sona eklenen boş sütunlar (yanıt, kanıt gibi), kullanıcı doldurur */
  ekSutunlar?: string[];
};

/** Başlık satırı `sutunlar` olan tabloların satırlarını, üstlerindeki H2 ile birlikte okur. */
function tablolariOku(kok: ParentNode, sutunlar: string[]): string[][] {
  const satirlar: string[][] = [];
  let h2 = '';
  kok.querySelectorAll('h2, table').forEach((el) => {
    if (el.tagName === 'H2') {
      h2 = temiz(el.textContent);
      return;
    }
    const basliklar = [...el.querySelectorAll('thead th')].map((th) => temiz(th.textContent));
    if (basliklar.join('|') !== sutunlar.join('|')) {
      return;
    }
    el.querySelectorAll('tbody tr').forEach((tr) => {
      satirlar.push([h2, ...[...tr.querySelectorAll('td')].map((td) => temiz(td.textContent))]);
    });
  });
  return satirlar;
}

/**
 * Soru tablolarından oluşan sayfalarda (Ek C gibi) "CSV olarak indir" düğmesi. Tablolar
 * sayfada Markdown olarak kalır; düğme başlık satırı `sutunlar` olan tabloları toplar, her
 * satıra bölüm başlığını (H2) ve doldurulacak boş sütunları ekler.
 */
export function TabloIndir({dosya, baslik, sutunlar, ekSutunlar = []}: TabloProps): ReactNode {
  const isBrowser = useIsBrowser();
  const ref = useRef<HTMLParagraphElement>(null);
  const [sayi, setSayi] = useState(0);
  const kok = () => ref.current?.closest('.markdown') ?? document;
  // MDX her çizimde yeni bir dizi verir; etki içeriğe göre yeniden çalışsın.
  const sutunAnahtari = sutunlar.join('|');

  useEffect(() => {
    if (isBrowser) {
      setSayi(tablolariOku(kok(), sutunlar).length);
    }
  }, [isBrowser, sutunAnahtari]);

  if (!isBrowser) {
    return null;
  }

  const tablolariIndir = () => {
    const adres = `${window.location.origin}${window.location.pathname}`;
    csvIndir(
      [
        [`# ${baslik}`],
        [`# Kaynak: ${adres}`],
        ['Grup', ...sutunlar, ...ekSutunlar],
        ...tablolariOku(kok(), sutunlar).map((satir) => [...satir, ...ekSutunlar.map(() => '')]),
      ],
      dosya,
    );
  };

  return (
    <p ref={ref} className={styles.indir}>
      <button
        type="button"
        className="button button--outline button--primary button--sm"
        onClick={tablolariIndir}
        disabled={sayi === 0}>
        CSV olarak indir{sayi > 0 && ` (${sayi} satır)`}
      </button>
      {ekSutunlar.length > 0 && (
        <span className={styles.aciklama}>
          Elektronik tabloya aktarmak için; {ekSutunlar.map((s) => s.toLocaleLowerCase('tr-TR')).join(', ')} sütunları
          boştur.
        </span>
      )}
    </p>
  );
}
