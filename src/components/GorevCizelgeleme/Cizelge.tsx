import {useEffect, useMemo, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent, ReactNode} from 'react';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import {sureYaz} from './cizelgeleme';
import type {Kacan, Parca} from './cizelgeleme';
import styles from './styles.module.css';

/** Bir görevin şeridi; süreler µs. Çıkış ve zaman sınırı işaretleri T, D ve O'dan türetilir. */
export type Serit = {id: string; ad: string; T: number; D: number; O: number};

type Props = {
  parcalar: Parca[];
  kacanlar: Kacan[];
  /** Çizelgenin kapsadığı toplam süre (µs) */
  pencere: number;
  seritler: Serit[];
  /** Döngüsel yürütücüde küçük çerçeve (µs): çerçeve sınırları çizilir */
  cerceve?: number;
  /** Yakınlaştırmanın alt sınırı (µs) */
  enKisa: number;
  renkOf: (id: string) => string | undefined;
};

type Aralik = {bas: number; bit: number};

const SERIT = 28;
const SERIT_ARASI = 6;
const BASLIK = 7; // şeridin üstünde çıkış/zaman sınırı işaretlerine ayrılan pay
const EKSEN = 22;
const ETIKET_GENIS = 150; // geniş kapsayıcıda soldaki görev adı sütunu
const ETIKET_DAR = 15; // dar kapsayıcıda görev adı şeridin üstünde
const GENEL = 18; // genel bakış şeridi yüksekliği
const ADIM = 2; // düğme başına yakınlaştırma çarpanı
const ISARET_ARALIGI = 7; // işaretler bundan sık düşüyorsa çizilmez (px)
const MAKS_ISARET = 400;

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

const kisalt = (ad: string, n: number) => (ad.length > n ? `${ad.slice(0, n - 1)}…` : ad);

/** [bas, bit] aralığına düşen k·T + kayma anları (en çok MAKS_ISARET tane) */
function anlar(T: number, kayma: number, bas: number, bit: number): number[] {
  const liste: number[] = [];
  for (let k = Math.max(0, Math.ceil((bas - kayma) / T)); liste.length < MAKS_ISARET; k++) {
    const t = kayma + k * T;
    if (t > bit) break;
    liste.push(t);
  }
  return liste;
}

/**
 * Görev zaman çizelgesi (Gantt): görev başına bir şerit; yürütme parçaları blok, çıkış
 * anları yukarı ok, periyottan farklı zaman sınırları aşağı ok, kaçırılan zaman sınırları
 * kırmızı işaret olarak çizilir. Yakınlaştırma ve gezinme seri kanal aracındaki zaman
 * çizelgesiyle aynıdır: düğmeler, sürükleyerek aralık seçme, Ctrl/⌘ + tekerlek, yatay
 * kaydırma ve alttaki genel bakış şeridi.
 */
export default function Cizelge({parcalar, kacanlar, pencere, seritler, cerceve, enKisa, renkOf}: Props): ReactNode {
  const kutuRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const geo = useGeometri(kutuRef);
  const [gorunum, setGorunum] = useState<Aralik>({bas: 0, bit: pencere});
  const [secim, setSecim] = useState<{x0: number; x1: number} | null>(null);
  const surukle = useRef<{tur: 'secim' | 'genel'; x0: number; bas0: number} | null>(null);

  // Hesap değişip pencere değiştiğinde tümünü göster
  useEffect(() => setGorunum({bas: 0, bit: pencere}), [pencere]);

  // Genel bakış: görev ayrımı olmadan işlemcinin meşgul olduğu aralıklar
  const mesgul = useMemo(() => {
    const aralik: Aralik[] = [];
    for (const p of parcalar) {
      const son = aralik[aralik.length - 1];
      if (son && p.bas <= son.bit) son.bit = Math.max(son.bit, p.bit);
      else aralik.push({bas: p.bas, bit: p.bit});
    }
    return aralik;
  }, [parcalar]);

  const W = Math.max(200, geo.genislik);
  const dar = W < 520;
  const L = dar ? 0 : ETIKET_GENIS;
  const plotW = W - L;
  // Dar kapsayıcıda görev adı şeridin üstünde ayrı bir satırdır
  const etiket = dar ? ETIKET_DAR : 0;
  const seritY = (i: number) => i * (etiket + SERIT + SERIT_ARASI) + etiket;
  const eksenY = seritY(Math.max(0, seritler.length - 1)) + SERIT + 4;
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
      const x = e.clientX - svg.getBoundingClientRect().left;
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
      const bas = ((x - L) / plotW) * pencere - span / 2;
      const yeni = sinirla({bas, bit: bas + span}, pencere, enKisa);
      setGorunum(yeni);
      surukle.current = {tur: 'genel', x0: x, bas0: yeni.bas};
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
  const gorunen = parcalar.filter((p) => p.bit >= v.bas && p.bas <= v.bit);
  const sikMi = (T: number) => (T / span) * plotW < ISARET_ARALIGI;
  const adOf = new Map(seritler.map((s) => [s.id, s.ad]));

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
          {sureYaz(Math.round(v.bas))} – {sureYaz(Math.round(v.bit))}
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
          aria-label={`Zaman çizelgesi: ${seritler.length} görev, ${sureYaz(pencere)}`}
          onPointerDown={asagi}
          onPointerMove={hareket}
          onPointerUp={yukari}
          onPointerCancel={yukari}>
          <defs>
            <clipPath id="gorev-cizelge-alan">
              <rect x={L} y="0" width={plotW} height={eksenY} />
            </clipPath>
          </defs>

          {seritler.map((s, i) => {
            const y = seritY(i);
            const cikislar = sikMi(s.T) ? [] : anlar(s.T, s.O, v.bas, v.bit);
            const sinirlar = s.D === s.T || sikMi(s.T) ? [] : anlar(s.T, s.O + s.D, v.bas, v.bit);
            return (
              <g key={s.id}>
                <text className={styles.seritAdi} x={0} y={dar ? y - 4 : y + SERIT / 2 + 6}>
                  {kisalt(s.ad, dar ? 40 : 20)}
                </text>
                <rect className={styles.seritZemin} x={L} y={y + BASLIK} width={plotW} height={SERIT - BASLIK} />
                <g clipPath="url(#gorev-cizelge-alan)">
                  {gorunen
                    .filter((p) => p.id === s.id)
                    .map((p) => {
                      const x0 = xOf(p.bas);
                      return (
                        <rect
                          key={`${p.is}-${p.bas}`}
                          className={p.gec ? styles.gec : renkOf(p.id)}
                          x={x0}
                          y={y + BASLIK + 2}
                          width={Math.max(1, xOf(Math.min(p.bit, pencere)) - x0)}
                          height={SERIT - BASLIK - 4}>
                          <title>{`${s.ad} · iş ${p.is + 1}: ${sureYaz(p.bas)} – ${sureYaz(p.bit)} (${sureYaz(p.bit - p.bas)})${p.gec ? ' — zaman sınırından sonra' : ''}`}</title>
                        </rect>
                      );
                    })}
                  {cikislar.map((t) => {
                    const x = xOf(t);
                    return <path key={`c${t}`} className={styles.cikis} d={`M${x} ${y + SERIT}V${y}M${x - 3} ${y + 5}L${x} ${y}L${x + 3} ${y + 5}`} />;
                  })}
                  {sinirlar.map((t) => {
                    const x = xOf(t);
                    return <path key={`s${t}`} className={styles.sinir} d={`M${x} ${y}V${y + SERIT}M${x - 3} ${y + SERIT - 5}L${x} ${y + SERIT}L${x + 3} ${y + SERIT - 5}`} />;
                  })}
                  {kacanlar
                    .filter((k) => k.id === s.id && k.t >= v.bas && k.t <= v.bit)
                    .map((k) => {
                      const x = xOf(k.t);
                      return (
                        <path key={`k${k.is}`} className={styles.kacan} d={`M${x} ${y}V${y + SERIT}M${x - 4} ${y}h8`}>
                          <title>{`${s.ad} · iş ${k.is + 1}: zaman sınırı (${sureYaz(k.t)}) kaçırıldı`}</title>
                        </path>
                      );
                    })}
                </g>
              </g>
            );
          })}

          {/* Döngüsel yürütücü: küçük çerçeve sınırları */}
          {cerceve && !sikMi(cerceve) && (
            <g clipPath="url(#gorev-cizelge-alan)">
              {anlar(cerceve, 0, v.bas, v.bit).map((t) => (
                <line key={t} className={styles.cerceveCizgi} x1={xOf(t)} x2={xOf(t)} y1={0} y2={eksenY} />
              ))}
            </g>
          )}

          {/* Eksen */}
          <g className={styles.eksen}>
            {isaretler.map((t) => {
              const x = xOf(t);
              return (
                <g key={t}>
                  <line x1={x} x2={x} y1={0} y2={eksenY} className={styles.eksenCizgi} />
                  <text x={x} y={eksenY + 14} textAnchor={x > W - 30 ? 'end' : x < L + 30 ? 'start' : 'middle'}>
                    {sureYaz(Math.round(t))}
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

          {/* Genel bakış: işlemcinin meşgul olduğu aralıklar + görünüm kutusu */}
          <g>
            <rect className={styles.seritZemin} x={L} y={genelY} width={plotW} height={GENEL} />
            {mesgul.map((m) => (
              <rect
                key={m.bas}
                className={styles.mesgul}
                x={L + (m.bas / pencere) * plotW}
                y={genelY + 4}
                width={Math.max(0.5, ((Math.min(m.bit, pencere) - m.bas) / pencere) * plotW)}
                height={GENEL - 8}
              />
            ))}
            {kacanlar.map((k) => (
              <rect key={`${k.id}-${k.is}`} className={styles.kacanGenel} x={L + (k.t / pencere) * plotW - 1} y={genelY} width={2} height={GENEL} />
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
        ↑ çıkış anı · ↓ periyottan farklı zaman sınırı · kırmızı: kaçırılan zaman sınırı. Sürükleyerek bir aralık seçin ya da
        Ctrl/⌘ + tekerlekle yakınlaşın; alttaki şeritte görünüm kutusunu sürükleyerek gezinin.
      </p>
    </div>
  );
}
