import {useEffect, useRef, type ReactNode, type RefObject} from 'react';
import YapayUfuk, {YAPAY_UFUK_PITCH_SCALE} from '@site/src/components/YapayUfuk';

import styles from './styles.module.css';

/*
 * Canlı gösterge paneli: birincil uçuş ekranı (PFD) + analog yedek yapay ufuk.
 *
 * Basit bir uçuş modeli hafif S dönüşleri üretir; iki gösterge aynı veriyi
 * gösterir. Yatıştan dönüş hızı (koordineli dönüş: ψ' = g·tanφ / V), yunuslamadan
 * dikey hız ve irtifa türetilir. Nominal okumalar küçük bir göz kırpmadır:
 * IAS 178 (DO-178C), ALT 4754 (ARP4754A), seçili irtifa 4761 (ARP4761), HDG 330 (DO-330).
 *
 * Sunucuda düz uçuş çizilir; canlandırma yalnızca tarayıcıda, panel görünürken
 * ve kullanıcı azaltılmış hareket tercih etmiyorsa çalışır.
 */

const IAS = 178;
const ALT = 4754;
const SEL_ALT = 4761;
const HDG = 330;

const C = {x: 150, y: 112}; // ADI merkezi
const PITCH_SCALE = 2; // birim/derece
const SPEED_SCALE = 2; // birim/knot
const ALT_SCALE = 0.2; // birim/fit
const HDG_CENTER = {x: 150, y: 356};
const HDG_RADIUS = 130;

const pitchRungs = [-20, -15, -10, -5, 5, 10, 15, 20];
const speedTicks = Array.from({length: 17}, (_, i) => 100 + i * 10);
const altTicks = Array.from({length: 17}, (_, i) => 3900 + i * 100);
const headingTicks = Array.from({length: 72}, (_, i) => i * 5);
const bankTicks = [10, 20, 30, 45, 60].flatMap((a) => [a, -a]);

const G = 9.81;
const TAS = 91.6; // m/s (~178 kt)
const RAD = Math.PI / 180;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * RAD;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function arc(r: number, from: number, to: number): string {
  const a = polar(C.x, C.y, r, from);
  const b = polar(C.x, C.y, r, to);
  return `M${a.x} ${a.y} A${r} ${r} 0 0 1 ${b.x} ${b.y}`;
}

type Refs = {
  roll: SVGGElement | null;
  pitch: SVGGElement | null;
  speed: SVGGElement | null;
  alt: SVGGElement | null;
  compass: SVGGElement | null;
  iasText: SVGTextElement | null;
  altText: SVGTextElement | null;
  hdgText: SVGTextElement | null;
  vsText: SVGTextElement | null;
  stbyRoll: SVGGElement | null;
  stbyPitch: SVGGElement | null;
};

function useFlightModel(rootRef: RefObject<HTMLElement | null>, refs: RefObject<Refs>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let frame = 0;
    let last = 0;
    let t = 0;
    let heading = HDG;
    let altitude = ALT;
    let visible = false;

    const step = (now: number) => {
      frame = 0;
      if (!visible) {
        return;
      }
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      t += dt;

      // İlk saniyelerde düz uçuştan yumuşakça S dönüşüne geç.
      const ease = Math.min(1, t / 5);
      const env = ease * ease * (3 - 2 * ease);
      const bank = 17 * env * Math.sin((2 * Math.PI * t) / 28);
      const pitch = 2.2 * env * Math.sin((2 * Math.PI * t) / 13);
      const ias = IAS - 3 * env * Math.sin((2 * Math.PI * t) / 13 + 0.5);
      heading = (heading + ((G * Math.tan(bank * RAD)) / TAS / RAD) * dt + 360) % 360;
      const verticalSpeed = TAS * Math.sin(pitch * RAD) * 196.85; // fit/dk
      altitude += (verticalSpeed / 60) * dt;

      const r = refs.current;
      r.roll?.setAttribute('transform', `rotate(${-bank} ${C.x} ${C.y})`);
      r.pitch?.setAttribute('transform', `translate(0 ${pitch * PITCH_SCALE})`);
      r.speed?.setAttribute('transform', `translate(0 ${(ias - IAS) * SPEED_SCALE})`);
      r.alt?.setAttribute('transform', `translate(0 ${(altitude - ALT) * ALT_SCALE})`);
      let rel = heading - HDG;
      rel = ((rel + 540) % 360) - 180;
      r.compass?.setAttribute('transform', `rotate(${-rel} ${HDG_CENTER.x} ${HDG_CENTER.y})`);
      if (r.iasText) r.iasText.textContent = String(Math.round(ias));
      if (r.altText) r.altText.textContent = String(Math.round(altitude));
      if (r.hdgText) r.hdgText.textContent = String(Math.round(heading) % 360 || 360).padStart(3, '0');
      if (r.vsText) {
        const vs = Math.round(verticalSpeed / 50) * 50;
        r.vsText.textContent = vs === 0 ? '' : `${vs > 0 ? '+' : '−'}${Math.abs(vs)}`;
      }
      r.stbyRoll?.setAttribute('transform', `rotate(${-bank} 100 100)`);
      r.stbyPitch?.setAttribute('transform', `translate(0 ${pitch * YAPAY_UFUK_PITCH_SCALE})`);

      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(step);
      }
    });
    observer.observe(root);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [rootRef, refs]);
}

function Pfd({refs}: {refs: RefObject<Refs>}): ReactNode {
  const set = <K extends keyof Refs>(key: K) => (el: Refs[K]) => {
    refs.current[key] = el;
  };
  const selAltY = C.y - (SEL_ALT - ALT) * ALT_SCALE;

  return (
    <svg className={styles.pfd} viewBox="0 0 300 262" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="pfdAdi">
          <rect x="78" y="40" width="144" height="144" rx="10" />
        </clipPath>
        <clipPath id="pfdSpeed">
          <rect x="16" y="40" width="44" height="144" />
        </clipPath>
        <clipPath id="pfdAlt">
          <rect x="240" y="40" width="48" height="144" />
        </clipPath>
        <clipPath id="pfdHdg">
          <rect x="40" y="222" width="220" height="40" />
        </clipPath>
      </defs>

      {/* Mod göstergesi (FMA) */}
      <g className={styles.fma}>
        <text x="96" y="14" textAnchor="middle">SPD</text>
        <text x="150" y="14" textAnchor="middle">LNAV</text>
        <text x="204" y="14" textAnchor="middle">DAL A</text>
        <path d="M123 4 V20 M177 4 V20" className={styles.fmaRule} />
      </g>

      {/* Yapay ufuk: yatışta döner, yunuslamada kayar */}
      <g clipPath="url(#pfdAdi)">
        <g ref={set('roll')}>
          <g ref={set('pitch')}>
            <rect x="-100" y="-300" width="500" height={300 + C.y} className={styles.sky} />
            <rect x="-100" y={C.y} width="500" height="400" className={styles.ground} />
            <path d={`M-100 ${C.y} H400`} className={styles.line} strokeWidth="1.4" />
            {pitchRungs.map((deg) => {
              const y = C.y - deg * PITCH_SCALE;
              const major = deg % 10 === 0;
              const half = major ? 22 : 10;
              return (
                <g key={deg}>
                  <path d={`M${C.x - half} ${y} H${C.x + half}`} className={styles.line} strokeWidth="1.1" />
                  {major && (
                    <>
                      <text x={C.x - half - 4} y={y} textAnchor="end" className={styles.small}>
                        {Math.abs(deg)}
                      </text>
                      <text x={C.x + half + 4} y={y} className={styles.small}>
                        {Math.abs(deg)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
          {/* Yatış işaretçisi ufukla birlikte döner */}
          <path d={`M${C.x - 5} ${C.y - 56} H${C.x + 5} L${C.x} ${C.y - 63} Z`} className={styles.fill} />
        </g>
        {/* Sabit yatış skalası */}
        <path d={arc(64, -60, 60)} className={styles.line} strokeWidth="1.1" />
        {bankTicks.map((angle) => {
          const outer = polar(C.x, C.y, 64, angle);
          const inner = polar(C.x, C.y, Math.abs(angle) % 30 === 0 ? 57 : 60, angle);
          return (
            <path key={angle} d={`M${inner.x} ${inner.y} L${outer.x} ${outer.y}`} className={styles.line} strokeWidth="1.2" />
          );
        })}
        <path d={`M${C.x - 4} ${C.y - 71} H${C.x + 4} L${C.x} ${C.y - 65} Z`} className={styles.fill} />
      </g>
      <rect x="78" y="40" width="144" height="144" rx="10" className={styles.frame} />
      <g className={styles.aircraft}>
        <path d={`M${C.x - 44} ${C.y - 2} H${C.x - 18} V${C.y + 8} H${C.x - 22} V${C.y + 2} H${C.x - 44} Z`} />
        <path d={`M${C.x + 44} ${C.y - 2} H${C.x + 18} V${C.y + 8} H${C.x + 22} V${C.y + 2} H${C.x + 44} Z`} />
        <rect x={C.x - 3} y={C.y - 3} width="6" height="6" />
      </g>

      {/* Hız bandı */}
      <rect x="16" y="40" width="44" height="144" className={styles.tape} />
      <g clipPath="url(#pfdSpeed)">
        <g ref={set('speed')}>
          {speedTicks.map((kt) => {
            const y = C.y - (kt - IAS) * SPEED_SCALE;
            return (
              <g key={kt}>
                <path d={`M52 ${y} H60`} className={styles.line} strokeWidth="1" />
                {kt % 20 === 0 && (
                  <text x="48" y={y} textAnchor="end" className={styles.tapeText}>
                    {kt}
                  </text>
                )}
              </g>
            );
          })}
          <path d={`M60 ${C.y - 5} L54 ${C.y} L60 ${C.y + 5}`} className={styles.bug} />
        </g>
      </g>
      <text x="38" y="32" textAnchor="middle" className={styles.selected}>
        {IAS}
      </text>
      <path d={`M14 ${C.y - 10} H56 L63 ${C.y} L56 ${C.y + 10} H14 Z`} className={styles.readout} />
      <text ref={set('iasText')} x="36" y={C.y} textAnchor="middle" className={styles.readoutText}>
        {IAS}
      </text>

      {/* İrtifa bandı */}
      <rect x="240" y="40" width="48" height="144" className={styles.tape} />
      <g clipPath="url(#pfdAlt)">
        <g ref={set('alt')}>
          {altTicks.map((ft) => {
            const y = C.y - (ft - ALT) * ALT_SCALE;
            return (
              <g key={ft}>
                <path d={`M240 ${y} H247`} className={styles.line} strokeWidth="1" />
                {ft % 200 === 0 && (
                  <text x="252" y={y} className={styles.tapeText}>
                    {ft}
                  </text>
                )}
              </g>
            );
          })}
          <path d={`M240 ${selAltY - 6} H246 V${selAltY + 6} H240`} className={styles.bug} />
        </g>
      </g>
      <text x="264" y="32" textAnchor="middle" className={styles.selected}>
        {SEL_ALT}
      </text>
      <path d={`M233 ${C.y} L240 ${C.y - 10} H292 V${C.y + 10} H240 Z`} className={styles.readout} />
      <text ref={set('altText')} x="266" y={C.y} textAnchor="middle" className={styles.readoutText}>
        {ALT}
      </text>
      <text ref={set('vsText')} x="264" y="198" textAnchor="middle" className={styles.vs} />

      {/* Pusula kartı: yönle birlikte döner */}
      <g clipPath="url(#pfdHdg)">
        <circle cx={HDG_CENTER.x} cy={HDG_CENTER.y} r={HDG_RADIUS} className={styles.compass} />
        <g ref={set('compass')}>
          {headingTicks.map((hdg) => {
            const rel = hdg - HDG;
            const major = hdg % 10 === 0;
            const outer = polar(HDG_CENTER.x, HDG_CENTER.y, HDG_RADIUS, rel);
            const inner = polar(HDG_CENTER.x, HDG_CENTER.y, HDG_RADIUS - (major ? 8 : 5), rel);
            const label = polar(HDG_CENTER.x, HDG_CENTER.y, HDG_RADIUS - 16, rel);
            return (
              <g key={hdg}>
                <path d={`M${inner.x} ${inner.y} L${outer.x} ${outer.y}`} className={styles.line} strokeWidth="1" />
                {major && (
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    transform={`rotate(${rel} ${label.x} ${label.y})`}
                    className={styles.small}>
                    {hdg === 0 ? 'N' : hdg / 10}
                  </text>
                )}
              </g>
            );
          })}
          <path
            d={`M${HDG_CENTER.x - 4} ${HDG_CENTER.y - HDG_RADIUS} V${HDG_CENTER.y - HDG_RADIUS + 5} H${HDG_CENTER.x + 4} V${HDG_CENTER.y - HDG_RADIUS}`}
            className={styles.bug}
          />
        </g>
      </g>
      <path d={`M${HDG_CENTER.x - 18} 206 H${HDG_CENTER.x + 18} V220 H${HDG_CENTER.x - 18} Z`} className={styles.readout} />
      <path d={`M${HDG_CENTER.x - 4} 220 L${HDG_CENTER.x} 226 L${HDG_CENTER.x + 4} 220`} className={styles.line} strokeWidth="1.2" />
      <text ref={set('hdgText')} x={HDG_CENTER.x} y="213" textAnchor="middle" className={styles.readoutText}>
        {HDG}
      </text>
      <text x="64" y="213" className={styles.selected}>
        HDG {HDG}
      </text>
    </svg>
  );
}

type Props = {
  className?: string;
};

export default function GostergePaneli({className}: Props): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Refs>({
    roll: null,
    pitch: null,
    speed: null,
    alt: null,
    compass: null,
    iasText: null,
    altText: null,
    hdgText: null,
    vsText: null,
    stbyRoll: null,
    stbyPitch: null,
  });
  useFlightModel(rootRef, refs);

  return (
    <div ref={rootRef} className={`${styles.panel} ${className ?? ''}`}>
      <span className={styles.screw} aria-hidden="true" />
      <span className={styles.screw} aria-hidden="true" />
      <span className={styles.screw} aria-hidden="true" />
      <span className={styles.screw} aria-hidden="true" />
      <div className={styles.screen}>
        <Pfd refs={refs} />
      </div>
      <div className={styles.standby}>
        <YapayUfuk
          className={styles.standbyDial}
          rollRef={(el) => {
            refs.current.stbyRoll = el;
          }}
          pitchRef={(el) => {
            refs.current.stbyPitch = el;
          }}
        />
        <span className={styles.placard} aria-hidden="true">
          STBY
        </span>
      </div>
    </div>
  );
}
