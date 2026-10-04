/**
 * Karar ifadesi ayrıştırıcısı. C'ye yakın sözdizimindeki bir Boole kararını koşullara
 * (Boole işleci içermeyen ifadeler) ve işleç ağacına çevirir.
 *
 * - İşleç önceliği C'deki gibidir: ! > & > | > && > ||. `&&` ve `||` kısa devrelidir;
 *   `&` ve `|` iki tarafı da hesaplar. `and`, `or`, `not` (C++ alternatif yazımları) da kabul edilir.
 * - `hiz > 250`, `mod == OTOMATIK`, `sensor_gecerli(2)` gibi karşılaştırma ve çağrılar tek koşuldur.
 * - Aynı metin birden çok kez geçerse aynı değişkendir; bu koşullar bağlıdır (coupled).
 */

export type Dugum =
  | {tur: 'kosul'; no: number; degisken: number}
  | {tur: 'degil'; alt: Dugum}
  | {tur: 've' | 'veya'; altlar: Dugum[]; kisaDevre: boolean};

export type Kosul = {
  /** Koşulun değişkeni (aynı metin → aynı değişken) */
  degisken: number;
  /** Kaynak metindeki konumu */
  bas: number;
  son: number;
};

export type Ayrisim = {
  kok: Dugum;
  /** Benzersiz koşul metinleri, ilk görülme sırasıyla */
  degiskenler: string[];
  /** Ağaçtaki her koşul geçişi, soldan sağa */
  kosullar: Kosul[];
};

export const EN_COK_DEGISKEN = 12;
export const EN_COK_KOSUL = 15;

export class IfadeHatasi extends Error {
  konum: number;
  constructor(mesaj: string, konum: number) {
    super(mesaj);
    this.konum = konum;
  }
}

type Jeton = {
  tur: 'ac' | 'kapa' | 'degil' | 've' | 'veya' | 'bitve' | 'bitveya' | 'iliski' | 'aritmetik' | 'ad' | 'sayi' | 'virgul' | 'sabit' | 'son';
  metin: string;
  bas: number;
  son: number;
};

const AD = /[\p{L}_][\p{L}\p{N}_]*(?:(?:\.|->)[\p{L}_][\p{L}\p{N}_]*|\[[^\]\n]*\])*/uy;
const SAYI = /(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)[uUlLfF]*/y;
const ANAHTAR: Record<string, Jeton['tur']> = {
  and: 've',
  or: 'veya',
  not: 'degil',
  bitand: 'bitve',
  bitor: 'bitveya',
  true: 'sabit',
  false: 'sabit',
  TRUE: 'sabit',
  FALSE: 'sabit',
};

function jetonla(s: string): Jeton[] {
  const j: Jeton[] = [];
  let i = 0;
  const ekle = (tur: Jeton['tur'], uzunluk: number) => {
    j.push({tur, metin: s.slice(i, i + uzunluk), bas: i, son: i + uzunluk});
    i += uzunluk;
  };
  while (i < s.length) {
    const c = s[i];
    const iki = s.slice(i, i + 2);
    if (/\s/.test(c)) {
      i++;
    } else if (iki === '&&') ekle('ve', 2);
    else if (iki === '||') ekle('veya', 2);
    else if (iki === '==' || iki === '!=' || iki === '<=' || iki === '>=') ekle('iliski', 2);
    else if (c === '<' || c === '>') ekle('iliski', 1);
    else if (c === '!' || c === '¬') ekle('degil', 1);
    else if (c === '∧') ekle('ve', 1);
    else if (c === '∨') ekle('veya', 1);
    else if (c === '&') ekle('bitve', 1);
    else if (c === '|') ekle('bitveya', 1);
    else if (c === '(') ekle('ac', 1);
    else if (c === ')') ekle('kapa', 1);
    else if (c === ',') ekle('virgul', 1);
    else if ('+-*/%'.includes(c)) ekle('aritmetik', 1);
    else {
      SAYI.lastIndex = i;
      const sayi = SAYI.exec(s);
      if (sayi && /[\d.]/.test(c)) {
        ekle('sayi', sayi[0].length);
        continue;
      }
      AD.lastIndex = i;
      const ad = AD.exec(s);
      if (ad) {
        const tur = ANAHTAR[ad[0]] ?? 'ad';
        ekle(tur, ad[0].length);
        continue;
      }
      if (c === '=') throw new IfadeHatasi('Atama (=) karar değildir; karşılaştırma için == yazın.', i);
      throw new IfadeHatasi(`Tanınmayan karakter: "${c}"`, i);
    }
  }
  j.push({tur: 'son', metin: '', bas: s.length, son: s.length});
  return j;
}

export function ayristir(kaynak: string): Ayrisim {
  const jetonlar = jetonla(kaynak);
  let p = 0;
  const degiskenler: string[] = [];
  const kosullar: Kosul[] = [];
  const bak = () => jetonlar[p];
  const al = () => jetonlar[p++];

  const kosulEkle = (metin: string, bas: number, son: number): Dugum => {
    let degisken = degiskenler.indexOf(metin);
    if (degisken < 0) {
      degisken = degiskenler.length;
      degiskenler.push(metin);
      if (degiskenler.length > EN_COK_DEGISKEN) {
        throw new IfadeHatasi(`En çok ${EN_COK_DEGISKEN} farklı koşul desteklenir.`, bas);
      }
    }
    kosullar.push({degisken, bas, son});
    if (kosullar.length > EN_COK_KOSUL) throw new IfadeHatasi(`En çok ${EN_COK_KOSUL} koşul geçişi desteklenir.`, bas);
    return {tur: 'kosul', no: kosullar.length - 1, degisken};
  };

  /** Karşılaştırma işleneni: [-] (ad | çağrı | sayı) ((+|-|*|/|%) ...)* */
  const islenen = (): {metin: string; tekAd: boolean; bas: number; son: number} => {
    const bas = bak().bas;
    const parcalar: string[] = [];
    let tekAd = true;
    let ilk = true;
    for (;;) {
      if (bak().tur === 'aritmetik' && bak().metin === '-' && ilk) {
        parcalar.push('-');
        al();
        tekAd = false;
      }
      const t = bak();
      if (t.tur === 'ad') {
        al();
        if (bak().tur === 'ac') {
          // İşlev çağrısı: dengeli parantezler koşul metnine dahil
          const cagriBas = t.bas;
          let derinlik = 0;
          let q = p;
          do {
            const u = jetonlar[q];
            if (u.tur === 'ac') derinlik++;
            else if (u.tur === 'kapa') derinlik--;
            else if (u.tur === 'son') throw new IfadeHatasi('Kapanmamış parantez.', u.bas);
            q++;
          } while (derinlik > 0);
          const son = jetonlar[q - 1].son;
          parcalar.push(kaynak.slice(cagriBas, son).replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')'));
          p = q;
        } else parcalar.push(t.metin);
      } else if (t.tur === 'sayi') {
        al();
        parcalar.push(t.metin);
        tekAd = false;
      } else if (t.tur === 'sabit') {
        throw new IfadeHatasi(`Sabit (${t.metin}) koşul olamaz; karar sonucunu değiştiremez.`, t.bas);
      } else if (t.tur === 'son') {
        throw new IfadeHatasi('İfade eksik: bir koşul bekleniyordu.', t.bas);
      } else {
        throw new IfadeHatasi(`Beklenmeyen "${t.metin}": bir koşul bekleniyordu.`, t.bas);
      }
      ilk = false;
      if (bak().tur === 'aritmetik') {
        parcalar.push(al().metin);
        tekAd = false;
        continue;
      }
      break;
    }
    return {metin: parcalar.join(' ').replace(/^- /, '-'), tekAd, bas, son: jetonlar[p - 1].son};
  };

  /** Son okunan birincil, parantezsiz bir karşılaştırma mıydı (! belirsizliği için) */
  let karsilastirma = false;

  const birincil = (): Dugum => {
    const t = bak();
    if (t.tur === 'ac') {
      al();
      const d = mantiksalVeya();
      if (bak().tur !== 'kapa') throw new IfadeHatasi('Kapanış parantezi ")" bekleniyordu.', bak().bas);
      al();
      if (bak().tur === 'iliski' || bak().tur === 'aritmetik') {
        throw new IfadeHatasi('Parantezli aritmetik desteklenmiyor; karşılaştırmayı sadeleştirin.', bak().bas);
      }
      karsilastirma = false;
      return d;
    }
    const sol = islenen();
    karsilastirma = false;
    if (bak().tur === 'iliski') {
      const op = al().metin;
      const sag = islenen();
      karsilastirma = true;
      return kosulEkle(`${sol.metin} ${op} ${sag.metin}`, sol.bas, sag.son);
    }
    if (!sol.tekAd) throw new IfadeHatasi('Sayı ya da aritmetik ifade tek başına koşul olamaz; bir karşılaştırma ekleyin.', sol.bas);
    return kosulEkle(sol.metin, sol.bas, sol.son);
  };

  const tekli = (): Dugum => {
    if (bak().tur === 'degil') {
      const t = al();
      if (bak().tur === 'ac' || bak().tur === 'degil') return {tur: 'degil', alt: tekli()};
      const alt = birincil();
      // C'de ! karşılaştırmadan önce bağlanır: !x > 5, (!x) > 5 demektir
      if (karsilastirma) {
        throw new IfadeHatasi(`Belirsiz: C'de "${t.metin}" karşılaştırmadan önce uygulanır; !(x > 5) biçiminde parantez kullanın.`, t.bas);
      }
      return {tur: 'degil', alt};
    }
    return birincil();
  };

  const ikili = (tur: Jeton['tur'], dugumTuru: 've' | 'veya', kisaDevre: boolean, alt: () => Dugum) => (): Dugum => {
    const altlar = [alt()];
    while (bak().tur === tur) {
      al();
      altlar.push(alt());
    }
    if (altlar.length === 1) return altlar[0];
    // Aynı türden iç içe düğümler tek düğümde toplanır: a && (b && c) → ve(a, b, c)
    const duz = altlar.flatMap((d) => (d.tur === dugumTuru && d.kisaDevre === kisaDevre ? d.altlar : [d]));
    return {tur: dugumTuru, altlar: duz, kisaDevre};
  };

  const bitVe = ikili('bitve', 've', false, tekli);
  const bitVeya = ikili('bitveya', 'veya', false, bitVe);
  const mantiksalVe = ikili('ve', 've', true, bitVeya);
  const mantiksalVeya = ikili('veya', 'veya', true, mantiksalVe);

  if (!kaynak.trim()) throw new IfadeHatasi('Bir karar ifadesi yazın.', 0);
  const kok = mantiksalVeya();
  if (bak().tur !== 'son') {
    const t = bak();
    throw new IfadeHatasi(t.tur === 'kapa' ? 'Fazladan kapanış parantezi.' : `Beklenmeyen "${t.metin}": && ya da || bekleniyordu.`, t.bas);
  }
  return {kok, degiskenler, kosullar};
}
