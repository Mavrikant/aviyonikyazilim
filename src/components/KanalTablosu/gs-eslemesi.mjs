/**
 * ILS LOC → GS frekans eşlemesi (ICAO Ek 10 Cilt I), X kanalları; kHz. Y kanalındaki LOC
 * (X'in 50 kHz üstü) X eşinin GS'inin 150 kHz altını kullanır. Kanal tablosu ve
 * scripts/navigasyon-verisi.mjs (AIP denetimi) bu dosyayı ortak kullanır.
 */

/** @type {Readonly<Record<number, number>>} */
export const GS_X = {
  108100: 334700,
  108300: 334100,
  108500: 329900,
  108700: 330500,
  108900: 329300,
  109100: 331400,
  109300: 332000,
  109500: 332600,
  109700: 333200,
  109900: 333800,
  110100: 334400,
  110300: 335000,
  110500: 329600,
  110700: 330200,
  110900: 330800,
  111100: 331700,
  111300: 332300,
  111500: 332900,
  111700: 333500,
  111900: 331100,
};

/**
 * LOC frekansının (kHz) eşli GS frekansı (kHz); LOC frekansı değilse undefined.
 * @param {number} loc
 * @returns {number | undefined}
 */
export function gsOf(loc) {
  if (GS_X[loc] !== undefined) return GS_X[loc];
  if (loc % 100 === 50 && GS_X[loc - 50] !== undefined) return GS_X[loc - 50] - 150;
  return undefined;
}
