import type {ReactNode} from 'react';

/**
 * Katalogdaki araç şemaları: araç sayfasının `sidebar_custom_props.simge`
 * değeriyle seçilir. Tek renkli çizgi çizimleri; renk currentColor'dan gelir,
 * vurgu öğeleri `data-vurgu` ile CSS'te amber boyanır.
 */
const SIMGELER: Record<string, ReactNode> = {
  // VOR gül dairesi, radyal ve yanından geçen düz rota
  vor: (
    <>
      <circle cx="32" cy="32" r="22" />
      <path d="M32 10v5M32 49v5M10 32h5M49 32h5" />
      <path d="M28 32l4-6.9 4 6.9-4 6.9z" />
      <path d="M32 32l15.5-15.5" strokeDasharray="2 3" />
      <path d="M6 52L58 40" data-vurgu="" />
      <circle cx="44" cy="42.8" r="2.2" data-vurgu="" />
    </>
  ),
  // Harita: enlem/boylam ağı, VOR altıgeni, pist ve NDB noktası
  harita: (
    <>
      <path d="M8 14h48M8 32h48M8 50h48M14 8v48M32 8v48M50 8v48" strokeDasharray="1.5 3.5" />
      <path d="M17 22.5l3.5-6h7l3.5 6-3.5 6h-7z" />
      <circle cx="24" cy="22.5" r="1.2" />
      <path d="M36 50l14-14" strokeWidth="3.5" data-vurgu="" />
      <circle cx="43" cy="43" r="9" data-vurgu="" />
      <circle cx="18" cy="46" r="5" strokeDasharray="1 2" />
      <circle cx="18" cy="46" r="1" />
    </>
  ),
  // Seri kanal: UART karakter çerçevesi (boşta 1, başlangıç biti 0, veri bitleri, durdurma 1) ve iki uç
  seri: (
    <>
      <path d="M6 22h8v12h6v-12h6v12h6v-12h6v12h6v-12h14" />
      <path d="M14 22v12" data-vurgu="" />
      <rect x="6" y="44" width="14" height="10" rx="2" />
      <rect x="44" y="44" width="14" height="10" rx="2" />
      <path d="M20 47h24M20 51h24" strokeDasharray="2 2.5" data-vurgu="" />
    </>
  ),
  // Dairesel konnektör yüzü: üstte ana kama, kontaklar; seçili pin ve sinyal adı çizgisi
  konnektor: (
    <>
      <circle cx="30" cy="35" r="20" />
      <path d="M27 13.5h6v4.5h-6z" />
      <circle cx="30" cy="25" r="3" />
      <circle cx="21" cy="31" r="3" />
      <circle cx="39" cy="31" r="3" />
      <circle cx="30" cy="35" r="3" />
      <circle cx="21" cy="42" r="3" />
      <circle cx="39" cy="42" r="3" data-vurgu="" />
      <circle cx="30" cy="46" r="3" />
      <path d="M42 42h16" strokeDasharray="2 2.5" data-vurgu="" />
    </>
  ),
  // MC/DC: doğruluk tablosu; yalnızca bir koşulu farklı iki satır bir yayla eşleşmiş
  mcdc: (
    <>
      <rect x="6" y="10" width="44" height="44" rx="4" />
      <path d="M6 21h44M6 32h44M6 43h44M17 10v44M28 10v44M39 10v44" />
      <path d="M11.5 26.5h0M11.5 37.5h0" strokeWidth="4" data-vurgu="" />
      <path d="M52 26.5c8 0 8 11 0 11" data-vurgu="" />
    </>
  ),
  // DO-178C hedefleri: seviye yükseldikçe uzayan hedef çubukları; en üstteki (Seviye A) vurgulu
  hedef: (
    <>
      <path d="M10 8v48" />
      <path d="M10 49h14M10 37h30M10 25h38" strokeWidth="4" strokeLinecap="butt" />
      <path d="M10 13h44" strokeWidth="4" strokeLinecap="butt" data-vurgu="" />
    </>
  ),
  // Görev çizelgesi: zaman ekseni, üç şeritte yürütme blokları ve bir zaman sınırı çizgisi
  cizelge: (
    <>
      <path d="M8 10v44h50" />
      <rect x="12" y="14" width="9" height="8" rx="1" />
      <rect x="33" y="14" width="9" height="8" rx="1" />
      <rect x="21" y="27" width="12" height="8" rx="1" />
      <rect x="42" y="27" width="6" height="8" rx="1" />
      <rect x="48" y="40" width="6" height="8" rx="1" data-vurgu="" />
      <path d="M54 10v44M51 14l3-4 3 4" data-vurgu="" />
    </>
  ),
};

const VARSAYILAN = (
  <>
    <rect x="10" y="10" width="44" height="44" rx="6" />
    <path d="M20 32h24M32 20v24" />
  </>
);

export default function AracSimgesi({ad}: {ad?: string}): ReactNode {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {(ad && SIMGELER[ad]) ?? VARSAYILAN}
    </svg>
  );
}
