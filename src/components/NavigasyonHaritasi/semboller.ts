/**
 * Harita sembolleri: havacılık haritalarındaki geleneksel çizimlerin sade
 * hâlleri. Leaflet divIcon içine metin olarak konur; renk currentColor'dan
 * gelir ve styles.module.css'teki tür sınıflarıyla belirlenir.
 */

// Altıgen köşeleri: (±6, 0), (±3, ±5.2)
const HEX = 'M-6 0L-3 -5.2L3 -5.2L6 0L3 5.2L-3 5.2Z';
// TACAN çıkıntıları: altıgenin alt, sol üst ve sağ üst kenarlarına oturan bloklar
const TACAN_TABS =
  '<path d="M-3 5.2L3 5.2L3 8.6L-3 8.6Z" class="dolu"/>' +
  '<path d="M3 -5.2L6 0L8.94 -1.7L5.94 -6.9Z" class="dolu"/>' +
  '<path d="M-3 -5.2L-6 0L-8.94 -1.7L-5.94 -6.9Z" class="dolu"/>';
// TACAN: altıgen + çıkıntıların ortak dış çizgisi (içinde altıgen çizilmez)
const TACAN_OUTLINE = 'M-3 5.2L-3 8.6L3 8.6L3 5.2L6 0L8.94 -1.7L5.94 -6.9L3 -5.2L-3 -5.2L-5.94 -6.9L-8.94 -1.7L-6 0Z';
const DOT = '<circle r="1.3" class="dolu"/>';
// NDB: halkalı merkez noktası
const NDB_CENTER = '<circle r="1.3" class="dolu"/><circle r="2.6" class="ince"/>';

const svg = (body: string, size = 20) =>
  `<svg viewBox="-12 -12 24 24" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;

/**
 * İstasyon sembolleri, FAA Aeronautical Chart Users' Guide lejantındaki çizimlere göre:
 * VOR ortası noktalı altıgen; VOR/DME altıgenin değdiği dikdörtgen; DME boş dikdörtgen;
 * VORTAC altıgen + üç dolu çıkıntı; TACAN aynı silüetin yalnızca dış çizgisi;
 * NDB noktalı halkalar içinde halkalı nokta; NDB/DME bunun kare içindeki hâli.
 */
export const NAVAID_SYMBOLS: Record<string, string> = {
  VOR: svg(`<path d="${HEX}"/>${DOT}`),
  'VOR-DME': svg(`<rect x="-6" y="-5.2" width="12" height="10.4"/><path d="${HEX}"/>${DOT}`),
  VORTAC: svg(`<path d="${HEX}"/>${TACAN_TABS}${DOT}`),
  TACAN: svg(`<path d="${TACAN_OUTLINE}"/>${DOT}`),
  DME: svg(`<rect x="-6" y="-5.2" width="12" height="10.4"/>`),
  NDB: svg(`<circle r="7.5" class="noktali"/><circle r="5" class="noktali"/>${NDB_CENTER}`),
  'NDB-DME': svg(`<rect x="-8.5" y="-8.5" width="17" height="17"/><circle r="5.6" class="noktali"/>${NDB_CENTER}`),
};

/** Havalimanı sembolü: daire; büyük/orta havalimanlarında en uzun pistin yönünde çizgi. */
export function airportSymbol(type: string, hdg?: number): string {
  if (type === 'heliport') {
    return svg('<circle r="7"/><path d="M-2.8 -3.8V3.8M2.8 -3.8V3.8M-2.8 0H2.8" class="kalin"/>', 16);
  }
  if (type === 'closed') {
    return svg('<circle r="6"/><path d="M-4.2 -4.2L4.2 4.2M4.2 -4.2L-4.2 4.2"/>', 16);
  }
  const big = type === 'large_airport' || type === 'medium_airport';
  const r = big ? 7.5 : 5;
  // Pist çizgisi dairenin içinde kalır (en uzun pistin gerçek yönünde)
  const runway =
    hdg !== undefined
      ? `<path d="M0 ${-(r - 1.5)}V${r - 1.5}" class="pistCizgi" transform="rotate(${Math.round(hdg)})"/>`
      : '';
  const size = type === 'large_airport' ? 24 : type === 'medium_airport' ? 20 : 16;
  return svg(`<circle r="${r}" class="zemin"/>${runway}<circle r="${r}"/>`, size);
}
