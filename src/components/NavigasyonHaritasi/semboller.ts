/**
 * Harita sembolleri: havacılık haritalarındaki geleneksel çizimlerin sade
 * hâlleri. Leaflet divIcon içine metin olarak konur; renk currentColor'dan
 * gelir ve styles.module.css'teki tür sınıflarıyla belirlenir.
 */

const HEX = 'M-6 0L-3 -5.2L3 -5.2L6 0L3 5.2L-3 5.2Z';
// TACAN "kulakçıkları": altıgenin üç kenarına oturan dolu bloklar
const TACAN_LOBES =
  '<path d="M-3 -5.2L3 -5.2L3 -8.6L-3 -8.6Z" class="dolu"/>' +
  '<path d="M3 5.2L6 0L8.95 1.7L5.95 6.9Z" class="dolu"/>' +
  '<path d="M-3 5.2L-6 0L-8.95 1.7L-5.95 6.9Z" class="dolu"/>';

const svg = (body: string, size = 20) =>
  `<svg viewBox="-12 -12 24 24" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;

export const NAVAID_SYMBOLS: Record<string, string> = {
  VOR: svg(`<path d="${HEX}"/><circle r="1.3" class="dolu"/>`),
  'VOR-DME': svg(`<rect x="-7.5" y="-7.5" width="15" height="15"/><path d="${HEX}"/><circle r="1.3" class="dolu"/>`),
  VORTAC: svg(`<path d="${HEX}"/>${TACAN_LOBES}<circle r="1.3" class="dolu"/>`),
  TACAN: svg(`<path d="${HEX}" class="ince"/>${TACAN_LOBES}<circle r="1.3" class="dolu"/>`),
  DME: svg(`<rect x="-6" y="-6" width="12" height="12"/><circle r="1.3" class="dolu"/>`),
  NDB: svg(`<circle r="7" class="noktali"/><circle r="4" class="noktali"/><circle r="1.6" class="dolu"/>`),
  'NDB-DME': svg(
    `<rect x="-8.5" y="-8.5" width="17" height="17"/><circle r="5.5" class="noktali"/><circle r="1.6" class="dolu"/>`,
  ),
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
  const runway =
    hdg !== undefined ? `<path d="M0 -10V10" class="pistCizgi" transform="rotate(${Math.round(hdg)})"/>` : '';
  if (big) {
    return svg(`<circle r="7.5" class="zemin"/>${runway}<circle r="7.5"/>`, type === 'large_airport' ? 24 : 20);
  }
  return svg(`<circle r="5" class="zemin"/>${runway}<circle r="5"/>`, 16);
}
