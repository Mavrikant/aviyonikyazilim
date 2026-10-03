import {useEffect, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent, ReactNode} from 'react';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import type {Iletim, Kanal} from './hesap';
import styles from './styles.module.css';

type Props = {
  cizelge: Iletim[];
  /** Çizelgenin kapsadığı toplam süre (µs) */
  pencere: number;
  kanallar: {kanal: Kanal; ad: string}[];
  /** Yakınlaştırmanın alt sınırı (µs): bir karakter süresinin altına inilmez */
  enKisa: number;
  adOf: (id: string) => string;
  renkOf: (id: string) => string | undefined;
  sureYaz: (us: number) => string;
};

type Aralik = {bas: number; bit: number};

const SERIT = 26;
const SERIT_ARASI = 8;
const EKSEN = 22;
const ETIKET_GENIS = 128; // geniş kapsayıcıda soldaki şerit adı sütunu
const ETIKET_DAR = 15; // dar kapsayıcıda şerit adı şeridin üstünde
const GENEL = 18; // genel bakış şeridi yüksekliği
const ADIM = 2; // düğme başına yakınlaştırma çarpanı

/** Okunur eksen adımı: 1, 2, 5 × 10ⁿ µs */
function adimOf(aralik: number, hedefSayi: number): number {
  const kaba = aralik / hedefSayi;
  const us = 10 ** Math.floor(Math.log10(kaba));
  return [1, 2, 5, 10].map((k) => k * us).find((a) => a >= kaba) ?? 10 * us;
}

const sinirla = (v: Aralik, pencere: number, enKisa: number): Aralik => {
  let span = Math.min(pencere, Math.max(enKisa, v.bit - v.bas));
  let bas = Math.max(0, Math.min(v.bas, pencere - span));
  if (span >= pencere) {
    bas = 0;
    span = pencere;
  }
  return {bas, bit: bas + span};
};

/**
 * Zaman çizelgesi: kanal başına bir şerit; gönderimler ve yön değişimleri bloklar hâlinde.
 * Yakınlaştırma: düğmeler, çizelgede sürükleyerek aralık seçme, Ctrl/⌘ + tekerlek (imleç
 * noktasına), yatay tekerlek/kaydırma ile gezinme ve alttaki genel bakış şeridinde görünüm
 * kutusunu sürükleme. Çizim, ölçülen gerçek genişlikle piksel biriminde yapılır; bu yüzden
 * yakınlaşınca yazılar ve ince bloklar bozulmaz.
 */
export default function ZamanCizelgesi({cizelge, pencere, kanallar, enKisa, adOf, renkOf, sureYaz}: Props): ReactNode {
  const kutuRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const geo = useGeometri(kutuRef);
  const [gorunum, setGorunum] = useState<Aralik>({bas: 0, bit: pencere});
  const [secim, setSecim] = useState<{x0: number; x1: number} | null>(null);
  const surukle = useRef<{tur: 'secim' | 'genel'; x0: number; bas0: number} | null>(null);

  // Hesap değişip pencere değiştiğinde tümünü göster
  useEffect(() => setGorunum({bas: 0, bit: pencere}), [pencere]);

  const W = Math.max(200, geo.genislik);
  const dar = W < 480;
  const L = dar ? 0 : ETIKET_GENIS;
  const plotW = W - L;
  // Dar kapsayıcıda şerit adı şeridin üstünde ayrı bir satırdır
  const etiket = dar ? ETIKET_DAR : 0;
  const seritY = (i: number) => i * (etiket + SERIT + SERIT_ARASI) + etiket;
  const eksenY = seritY(Math.max(0, kanallar.length - 1)) + SERIT + 4;
  const genelY = eksenY + EKSEN + 4;
  const H = genelY + GENEL + 2;

  const v = sinirla(gorunum, pencere, enKisa);
  const span = v.bit - v.bas;
  const xOf = (t: number) => L + ((t - v.bas) / span) * plotW;
  const tOf = (x: number) => v.bas + ((x - L) / plotW) * span;
  const yakinlik = pencere / span;

  const yakinlas = (carpan: number, merkez = (v.bas + v.bit) / 2) => {
    const yeniSpan = span / carpan;
    const oran = (merkez - v.bas) / span;
    setGorunum(sinirla({bas: merkez - oran * yeniSpan, bit: merkez + (1 - oran) * yeniSpan}, pencere, enKisa));
  };
  const kaydir = (dt: number) => setGorunum(sinirla({bas: v.bas + dt, bit: v.bit + dt}, pencere, enKisa));

  // Tekerlek: Ctrl/⌘ ile yakınlaştırma, yatay (ya da Shift'li) kaydırmayla gezinme.
  // Dikey kaydırma sayfaya bırakılır (sayfa kaydırması engellenmez).
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const tekerlek = (e: WheelEvent) => {
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (x >= L) yakinlas(Math.exp(-e.deltaY * 0.01), tOf(x));
      } else if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        if (span >= pencere) return;
        e.preventDefault();
        kaydir(((e.shiftKey ? e.deltaY : e.deltaX) / plotW) * span);
      }
    };
    svg.addEventListener('wheel', tekerlek, {passive: false});
    return () => svg.removeEventListener('wheel', tekerlek);
  });

  const xIcinde = (e: ReactPointerEvent) => e.clientX - (svgRef.current?.getBoundingClientRect().left ?? 0);

  const asagi = (e: ReactPointerEvent<SVGSVGElement>) => {
    const x = xIcinde(e);
    const y = e.clientY - (svgRef.current?.getBoundingClientRect().top ?? 0);
    if (y >= genelY && x >= L) {
      // Genel bakış şeridi: görünüm kutusunu tıklanan yere taşı ve sürüklemeye başla
      const t = ((x - L) / plotW) * pencere;
      const bas = t - span / 2;
      setGorunum(sinirla({bas, bit: bas + span}, pencere, enKisa));
      surukle.current = {tur: 'genel', x0: x, bas0: sinirla({bas, bit: bas + span}, pencere, enKisa).bas};
    } else if (x >= L) {
      surukle.current = {tur: 'secim', x0: x, bas0: v.bas};
      setSecim({x0: x, x1: x});
    } else {
      return;
    }
    svgRef.current?.setPointerCapture?.(e.pointerId);
  };
  const hareket = (e: ReactPointerEvent<SVGSVGElement>) => {
    const s = surukle.current;
    if (!s) return;
    const x = Math.max(L, Math.min(W, xIcinde(e)));
    if (s.tur === 'secim') setSecim({x0: s.x0, x1: x});
    else {
      const bas = s.bas0 + ((x - s.x0) / plotW) * pencere;
      setGorunum(sinirla({bas, bit: bas + span}, pencere, enKisa));
    }
  };
  const yukari = () => {
    const s = surukle.current;
    surukle.current = null;
    if (s?.tur === 'secim' && secim && Math.abs(secim.x1 - secim.x0) > 6) {
      const [a, b] = [tOf(Math.min(secim.x0, secim.x1)), tOf(Math.max(secim.x0, secim.x1))];
      setGorunum(sinirla({bas: a, bit: b}, pencere, enKisa));
    }
    setSecim(null);
  };

  // Eksen işaretleri
  const adim = adimOf(span, Math.max(3, Math.floor(plotW / 80)));
  const isaretler: number[] = [];
  for (let t = Math.ceil(v.bas / adim) * adim; t <= v.bit + 1e-6; t += adim) isaretler.push(t);

  const tamGorunum = span >= pencere;
  const gorunen = cizelge.filter((c) => c.bit >= v.bas && c.bas <= v.bit);

  return (
    <div className={styles.cizelgeGovde}>
      <div className={styles.cizelgeAraclar} role="toolbar" aria-label="Zaman çizelgesi yakınlaştırma">
        <button type="button" className={styles.kucukDugme} onClick={() => yakinlas(1 / ADIM)} disabled={tamGorunum} aria-label="Uzaklaştır">
          −
        </button>
        <button
          type="button"
          className={styles.kucukDugme}
          onClick={() => yakinlas(ADIM)}
          disabled={span <= enKisa}
          aria-label="Yakınlaştır">
          +
        </button>
        <button type="button" className={styles.dugme} onClick={() => setGorunum({bas: 0, bit: pencere})} disabled={tamGorunum}>
          Tümü
        </button>
        <span className={styles.ipucu} aria-live="polite">
          {sureYaz(v.bas)} – {sureYaz(v.bit)}
          {!tamGorunum && ` · ×${new Intl.NumberFormat('tr-TR', {maximumFractionDigits: yakinlik < 10 ? 1 : 0}).format(yakinlik)}`}
        </span>
      </div>

      <div ref={kutuRef} className={styles.cizelgeKutu}>
        <svg
          ref={svgRef}
          className={styles.cizelgeSvg}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Zaman çizelgesi"
          onPointerDown={asagi}
          onPointerMove={hareket}
          onPointerUp={yukari}
          onPointerCancel={yukari}>
          <defs>
            <clipPath id="cizelge-alan">
              <rect x={L} y="0" width={plotW} height={eksenY} />
            </clipPath>
          </defs>

          {kanallar.map((k, i) => {
            const y = seritY(i);
            return (
              <g key={k.kanal}>
                <text className={styles.seritAdi} x={0} y={dar ? y - 4 : y + SERIT / 2 + 4}>
                  {k.ad}
                </text>
                <rect className={styles.seritZemin} x={L} y={y} width={plotW} height={SERIT} />
                <g clipPath="url(#cizelge-alan)">
                  {gorunen
                    .filter((c) => c.kanal === k.kanal)
                    .map((c, j) => {
                      const x0 = xOf(c.bas);
                      const w = Math.max(1, xOf(Math.min(c.bit, pencere)) - x0);
                      return (
                        <rect
                          key={j}
                          className={c.donus ? styles.donus : renkOf(c.id)}
                          x={x0}
                          y={c.donus ? y + 7 : y + 2}
                          width={w}
                          height={c.donus ? SERIT - 14 : SERIT - 4}>
                          <title>{`${c.donus ? 'Yön değiştirme' : adOf(c.id)}: ${sureYaz(c.bas)} – ${sureYaz(c.bit)} (${sureYaz(c.bit - c.bas)})`}</title>
                        </rect>
                      );
                    })}
                </g>
              </g>
            );
          })}

          {/* Eksen */}
          <g className={styles.eksen}>
            {isaretler.map((t) => {
              const x = xOf(t);
              return (
                <g key={t}>
                  <line x1={x} x2={x} y1={0} y2={eksenY} className={styles.eksenCizgi} />
                  <text x={x} y={eksenY + 14} textAnchor={x > W - 30 ? 'end' : x < L + 30 ? 'start' : 'middle'}>
                    {sureYaz(t)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Seçim (sürükleyerek yakınlaştırma) */}
          {secim && Math.abs(secim.x1 - secim.x0) > 2 && (
            <rect
              className={styles.secimKutusu}
              x={Math.min(secim.x0, secim.x1)}
              y={0}
              width={Math.abs(secim.x1 - secim.x0)}
              height={eksenY}
            />
          )}

          {/* Genel bakış: tüm pencere + görünüm kutusu */}
          <g>
            <rect className={styles.seritZemin} x={L} y={genelY} width={plotW} height={GENEL} />
            {cizelge
              .filter((c) => !c.donus)
              .map((c, j) => (
                <rect
                  key={j}
                  className={renkOf(c.id)}
                  x={L + (c.bas / pencere) * plotW}
                  y={genelY + 4}
                  width={Math.max(0.5, ((Math.min(c.bit, pencere) - c.bas) / pencere) * plotW)}
                  height={GENEL - 8}
                />
              ))}
            <rect
              className={styles.gorunumKutusu}
              x={L + (v.bas / pencere) * plotW}
              y={genelY}
              width={Math.max(3, (span / pencere) * plotW)}
              height={GENEL}
            />
          </g>
        </svg>
      </div>
      <p className={styles.ipucu}>
        Sürükleyerek bir aralık seçin ya da Ctrl/⌘ + tekerlekle yakınlaşın; alttaki şeritte görünüm kutusunu sürükleyerek
        gezinin.
      </p>
    </div>
  );
}
