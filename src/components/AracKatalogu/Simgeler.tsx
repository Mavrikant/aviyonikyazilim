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
