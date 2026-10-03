import {useEffect, useState} from 'react';
import type {RefObject} from 'react';

/**
 * Geometri okuyucu: bileşenin kendi boyutunu ve görünür ekranı ölçer (SwiftUI'deki
 * GeometryReader'ın karşılığı). Yerleşim görünüm penceresine değil bu ölçümlere göre
 * kurulur; böylece harita docs sütununda, tam ekranda ve başka bir sitedeki iframe'de
 * aynı kurallarla çalışır.
 *
 * - boyut: kapsayıcı genişliğine göre sınıf (küçük < 560 px ≤ orta < 900 px ≤ geniş)
 * - basik: görünür ekran yüksekliği 520 px'in altında (yatay telefon, açık klavye)
 * - dokunmatik: birincil işaretçi parmak (dokunma hedefleri büyütülür)
 */
export type Boyut = 'kucuk' | 'orta' | 'genis';

export type Geometri = {
  genislik: number;
  yukseklik: number;
  /** Görünür ekran yüksekliği (visualViewport; mobil tarayıcı çubukları ve klavye düşülmüş) */
  ekranYuksekligi: number;
  boyut: Boyut;
  basik: boolean;
  dokunmatik: boolean;
};

const KUCUK = 560;
const GENIS = 900;
const BASIK = 520;

const boyutOf = (w: number): Boyut => (w < KUCUK ? 'kucuk' : w < GENIS ? 'orta' : 'genis');

// Sunucu tarafında ölçüm yok: geniş masaüstü varsayılır, istemcide ilk ölçümle düzelir.
const VARSAYILAN: Geometri = {
  genislik: GENIS,
  yukseklik: 600,
  ekranYuksekligi: 800,
  boyut: 'genis',
  basik: false,
  dokunmatik: false,
};

export default function useGeometri(ref: RefObject<HTMLElement | null>): Geometri {
  const [geo, setGeo] = useState<Geometri>(VARSAYILAN);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const coarse = window.matchMedia('(pointer: coarse)');

    // Ölçüm doğrudan yapılır: requestAnimationFrame görünmeyen belgede (arka plan sekmesi,
    // ekran dışındaki iframe) hiç çalışmaz. ResizeObserver zaten kare başına bir kez tetiklenir.
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const ekranYuksekligi = Math.round(window.visualViewport?.height ?? window.innerHeight);
      const next: Geometri = {
        genislik: Math.round(rect.width),
        yukseklik: Math.round(rect.height),
        ekranYuksekligi,
        boyut: boyutOf(rect.width),
        basik: ekranYuksekligi < BASIK,
        dokunmatik: coarse.matches,
      };
      // Sınıf ya da boyut değişmediyse aynı nesne döner, yeniden çizim olmaz
      setGeo((prev) =>
        prev.boyut === next.boyut &&
        prev.basik === next.basik &&
        prev.dokunmatik === next.dokunmatik &&
        Math.abs(prev.genislik - next.genislik) < 1 &&
        Math.abs(prev.ekranYuksekligi - next.ekranYuksekligi) < 1
          ? prev
          : next,
      );
    };

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.visualViewport?.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    coarse.addEventListener('change', measure);
    measure();
    return () => {
      ro.disconnect();
      window.visualViewport?.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      coarse.removeEventListener('change', measure);
    };
  }, [ref]);

  return geo;
}
