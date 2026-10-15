import type {Olcut} from './mcdc';

/**
 * Paylaşım bağlantısı: ifade, ölçüt ve (değiştirildiyse) seçili satırlar adresin #d= kısmında
 * taşınır (sunucuya gitmez). Araç dışında, kitap ve blog sayfalarından aracı belirli bir
 * ifadeyle açan bağlantılar da bunu kullanır (bkz. AracKarti, `ek` özelliği).
 */
export function kodla(e: string, o: Olcut, s: number[] | null): string {
  const json = JSON.stringify(s ? {e, o, s} : {e, o});
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function coz(d: string): {e: string; o: Olcut; s: number[] | null} | undefined {
  try {
    const v = JSON.parse(decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))))) as {
      e?: unknown;
      o?: unknown;
      s?: unknown;
    };
    if (typeof v.e !== 'string' || v.e.length > 500) return undefined;
    const s = Array.isArray(v.s) ? v.s.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < 4096) : null;
    return {e: v.e, o: v.o === 'maskeleme' ? 'maskeleme' : 'benzersiz', s};
  } catch {
    return undefined;
  }
}

/** MDX'te: `<AracKarti yol="/araclar/dogrulama/mcdc-test-seti" ek={mcdcIfadesi('A && B')} />` */
export function mcdcIfadesi(ifade: string, olcut: Olcut = 'benzersiz'): string {
  return `d=${kodla(ifade, olcut, null)}`;
}
