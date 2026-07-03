import {useEffect, useRef} from 'react';
import type {ReactNode, RefObject} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

const KT2MS = 0.514444;
const NM2M = 1852;
const FT2M = 0.3048;
const CONE_HALF_ANGLE = 50; // derece: bu yükseliş açısının üstü "sessiz koni"

// Site marka renkleriyle uyumlu, tema bağımsız (her zaman koyu) gösterge paleti.
const COLORS = {
  accent: '#85b7e6', // --ifm-color-primary (koyu tema) ile aynı gök mavisi
  amberBright: '#ffc65c', // --av-amber-400
  green: '#4ade80',
  red: '#ff8177',
  textBright: '#e8eff6',
  textMuted: '#7f97ad',
  gridLine: 'rgba(133, 183, 230, 0.16)',
};

const MONO_FONT = "'JetBrains Mono Variable', Consolas, monospace";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type HistPoint = {t: number; rate: number | null};

type SimState = {
  spd: number;
  off: number;
  alt: number;
  ts: number;
  tau: number;
  x: number; // boyuna konum (m), 0 = traverse (abeam) noktası
  t: number;
  paused: boolean;
  prevBrg: number | null;
  measRate: number;
  peak: number;
  hist: HistPoint[];
};

type Frame = {
  radial: number;
  brgTo: number;
  horiz: number;
  elev: number;
  inCone: boolean;
  d: number;
  h: number;
  slant: number;
  theoMax: number;
};

const norm360 = (a: number) => ((a % 360) + 360) % 360;
const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
};

function viewHalf(off: number) {
  // görünür yarı-genişlik (m)
  return Math.max(8, off * 3) * NM2M;
}

function resetPass(s: SimState) {
  s.x = -viewHalf(s.off);
  s.t = 0;
  s.prevBrg = null;
  s.measRate = 0;
  s.peak = 0;
  s.hist = [];
}

function stepUpdate(s: SimState, dt: number): Frame {
  const v = s.spd * KT2MS;
  s.x += v * dt;
  s.t += dt;
  if (s.x > viewHalf(s.off)) resetPass(s);

  const d = s.off * NM2M; // yanal mesafe (m)
  const h = s.alt * FT2M; // irtifa (m)
  const horiz = Math.hypot(s.x, d);
  const elev = (Math.atan2(h, horiz) * 180) / Math.PI;
  const inCone = elev > CONE_HALF_ANGLE;

  // istasyondan uçağa radyal (kuzeyden saat yönü); uçak istasyonun güneyinden geçiyor.
  const radial = norm360((Math.atan2(s.x, -d) * 180) / Math.PI);
  const brgTo = norm360(radial + 180);

  // "ölçülen" bearing değişim hızı: ardışık ölçümlerden sayısal türev + 1. derece filtre
  if (s.prevBrg !== null && dt > 0) {
    const raw = angDiff(radial, s.prevBrg) / dt;
    const a = s.tau > 0 ? 1 - Math.exp(-dt / s.tau) : 1;
    s.measRate += a * (raw - s.measRate);
  }
  s.prevBrg = radial;
  if (!inCone) s.peak = Math.max(s.peak, Math.abs(s.measRate));

  s.hist.push({t: s.t, rate: inCone ? null : Math.abs(s.measRate)});
  if (s.hist.length > 600) s.hist.shift();

  return {
    radial,
    brgTo,
    horiz,
    elev,
    inCone,
    d,
    h,
    slant: Math.hypot(horiz, h),
    theoMax: (v / d) * (180 / Math.PI),
  };
}

function drawMap(ctx: CanvasRenderingContext2D, W: number, H: number, state: SimState, frame: Frame) {
  // W/H, kapsayıcının gerçek CSS piksel boyutudur (bkz. sizeCanvasToContainer);
  // uçak/istasyon simgeleri bu genişliğe oranla ölçeklenir ki küçük ekranlarda kaybolmasın.
  const s = clamp(W / 860, 0.6, 1.35);
  const half = viewHalf(state.off);
  const scale = (W * 0.46) / half; // m -> px
  const cx = W / 2;
  const cy = H * 0.43; // istasyon konumu (ekran)
  ctx.clearRect(0, 0, W, H);

  // menzil halkaları
  ctx.strokeStyle = COLORS.gridLine;
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `${Math.round(10 * s)}px ${MONO_FONT}`;
  ctx.textAlign = 'left';
  const ringStep = state.off >= 5 ? 5 : state.off >= 1.5 ? 2 : 1;
  for (let r = ringStep; r * NM2M * scale < W; r += ringStep) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * NM2M * scale, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(`${r} NM`, cx + r * NM2M * scale + 3, cy - 3);
  }

  // sessiz koni yer izi (yarıçap = h / tan(koni açısından kalan))
  if (frame.h > 1) {
    const coneR = (frame.h / Math.tan((CONE_HALF_ANGLE * Math.PI) / 180)) * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, coneR, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,129,119,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,129,119,0.55)';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.red;
    ctx.textAlign = 'center';
    ctx.fillText('sessiz koni', cx, cy - coneR - 6 * s);
  }

  // uçuş yolu
  const py = cy + state.off * NM2M * scale;
  ctx.strokeStyle = 'rgba(133, 183, 230, 0.35)';
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, py);
  ctx.lineTo(W, py);
  ctx.stroke();
  ctx.setLineDash([]);

  // VOR istasyonu (altıgen) — okunaklı kalması için genişliğe oranlı büyütüldü
  const hexR = 17 * s;
  ctx.strokeStyle = frame.inCone ? COLORS.red : COLORS.accent;
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + hexR * Math.cos(a);
    const pyh = cy + hexR * Math.sin(a);
    if (i) ctx.lineTo(px, pyh);
    else ctx.moveTo(px, pyh);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = COLORS.textMuted;
  ctx.textAlign = 'center';
  ctx.font = `600 ${Math.round(11 * s)}px ${MONO_FONT}`;
  ctx.fillText('VOR', cx, cy + hexR + 15 * s);
  ctx.lineWidth = 1;

  // uçak — sabit 10px yerine kapsayıcı genişliğine oranlı, belirgin bir simge
  const ax = cx + state.x * scale;
  const ay = py;
  const nose = clamp(W * 0.032, 15, 30);
  // radyal çizgisi
  ctx.strokeStyle = frame.inCone ? 'rgba(255,129,119,0.7)' : 'rgba(74,222,128,0.7)';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(ax, ay);
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = COLORS.textBright;
  ctx.beginPath();
  ctx.moveTo(0, -nose);
  ctx.lineTo(nose * 0.6, nose * 0.8);
  ctx.lineTo(0, nose * 0.4);
  ctx.lineTo(-nose * 0.6, nose * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // radyal etiketi
  ctx.fillStyle = frame.inCone ? COLORS.red : COLORS.green;
  ctx.font = `600 ${Math.round(12 * s)}px ${MONO_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(`R-${frame.radial.toFixed(0).padStart(3, '0')}`, (cx + ax) / 2, (cy + ay) / 2 - nose * 0.5);

  // kuzey oku
  ctx.fillStyle = COLORS.textMuted;
  ctx.textAlign = 'left';
  ctx.fillText('K ↑', 12 * s, 18 * s);
}

function drawChart(ctx: CanvasRenderingContext2D, W: number, H: number, state: SimState) {
  const s = clamp(W / 320, 0.7, 1.3);
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = COLORS.gridLine;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
  const hist = state.hist;
  if (hist.length < 2) return;
  const rates = hist
    .filter((p): p is {t: number; rate: number} => p.rate !== null)
    .map((p) => p.rate);
  const maxR = Math.max(1, ...rates) * 1.15;
  const t0 = hist[0].t;
  const t1 = hist[hist.length - 1].t;
  const span = Math.max(1e-6, t1 - t0);

  // ızgara
  ctx.fillStyle = COLORS.textMuted;
  ctx.font = `${Math.round(9 * s)}px ${MONO_FONT}`;
  ctx.textAlign = 'left';
  for (let i = 1; i <= 3; i++) {
    const y = H - ((H - 14) * i) / 3 - 4;
    ctx.strokeStyle = COLORS.gridLine;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.fillText(`${((maxR * i) / 3).toFixed(1)}°/s`, 3, y - 2);
  }

  ctx.strokeStyle = COLORS.amberBright;
  ctx.lineWidth = 1.75 * s;
  ctx.beginPath();
  let pen = false;
  for (const p of hist) {
    const x = ((p.t - t0) / span) * W;
    if (p.rate === null) {
      pen = false;
      continue;
    }
    const y = H - 4 - ((H - 18) * p.rate) / maxR;
    if (pen) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
    pen = true;
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

type ReadoutRefs = {
  rate: RefObject<HTMLDivElement | null>;
  radial: RefObject<HTMLDivElement | null>;
  brgTo: RefObject<HTMLDivElement | null>;
  dist: RefObject<HTMLDivElement | null>;
  slant: RefObject<HTMLDivElement | null>;
  elev: RefObject<HTMLDivElement | null>;
  peak: RefObject<HTMLDivElement | null>;
  theo: RefObject<HTMLDivElement | null>;
  flag: RefObject<HTMLDivElement | null>;
};

function renderReadouts(refs: ReadoutRefs, state: SimState, frame: Frame) {
  if (refs.rate.current) {
    refs.rate.current.textContent = frame.inCone ? '— FLAG —' : `${Math.abs(state.measRate).toFixed(2)} °/s`;
    // yeşil: sakin/nominal, amber: hızlanan geçiş (dikkat), kırmızı: sinyal geçersiz
    refs.rate.current.style.color = frame.inCone
      ? COLORS.red
      : Math.abs(state.measRate) > 10
        ? COLORS.amberBright
        : COLORS.green;
  }
  if (refs.radial.current) {
    refs.radial.current.textContent = frame.inCone ? '---°' : `${frame.radial.toFixed(0).padStart(3, '0')}°`;
  }
  if (refs.brgTo.current) {
    refs.brgTo.current.textContent = frame.inCone ? '---°' : `${frame.brgTo.toFixed(0).padStart(3, '0')}°`;
  }
  if (refs.dist.current) refs.dist.current.textContent = `${(frame.horiz / NM2M).toFixed(2)} NM`;
  if (refs.slant.current) refs.slant.current.textContent = `${(frame.slant / NM2M).toFixed(2)} NM`;
  if (refs.elev.current) refs.elev.current.textContent = `${frame.elev.toFixed(1)}°`;
  if (refs.peak.current) refs.peak.current.textContent = `${state.peak.toFixed(2)} °/s`;
  if (refs.theo.current) {
    refs.theo.current.textContent =
      `${frame.theoMax.toFixed(2)} °/s  (V=${state.spd} kt, d=${state.off.toFixed(1)} NM)`;
  }
  if (refs.flag.current) {
    if (frame.inCone) {
      refs.flag.current.textContent = `FLAG — SESSİZ KONİ (yükseliş > ${CONE_HALF_ANGLE}°)`;
      refs.flag.current.className = clsx(styles.flag, styles.flagBad);
    } else {
      refs.flag.current.textContent = 'NAV — SİNYAL GEÇERLİ';
      refs.flag.current.className = styles.flag;
    }
  }
}

const MAP_ASPECT = 560 / 860;
const CHART_ASPECT = 150 / 320;

/**
 * Canvas'ın piksel arabelleğini, kapsayıcının gerçekte gösterdiği CSS
 * genişliğine (× devicePixelRatio) eşitler. Aksi halde sabit bir iç
 * çözünürlük (ör. 860px), dar mobil ekranlarda CSS ile küçültülüp uçak/VOR
 * simgelerini ve yazıları oransız biçimde küçültüyordu.
 */
function sizeCanvasToContainer(canvas: HTMLCanvasElement, cssWidth: number, aspect: number) {
  const cssHeight = cssWidth * aspect;
  const dpr = window.devicePixelRatio || 1;
  const targetW = Math.max(1, Math.round(cssWidth * dpr));
  const targetH = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {w: cssWidth, h: cssHeight};
}

const INITIAL_STATE: SimState = {
  spd: 480,
  off: 2,
  alt: 10000,
  ts: 1,
  tau: 0.5,
  x: 0,
  t: 0,
  paused: false,
  prevBrg: null,
  measRate: 0,
  peak: 0,
  hist: [],
};

export default function VorSimulator(): ReactNode {
  const mapRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);

  const vSpdRef = useRef<HTMLElement>(null);
  const vOffRef = useRef<HTMLElement>(null);
  const vAltRef = useRef<HTMLElement>(null);
  const vTsRef = useRef<HTMLElement>(null);
  const vTauRef = useRef<HTMLElement>(null);

  const rateRef = useRef<HTMLDivElement>(null);
  const radialRef = useRef<HTMLDivElement>(null);
  const brgToRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);
  const slantRef = useRef<HTMLDivElement>(null);
  const elevRef = useRef<HTMLDivElement>(null);
  const peakRef = useRef<HTMLDivElement>(null);
  const theoRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);

  const stateRef = useRef<SimState>({...INITIAL_STATE});

  useEffect(() => {
    const canvas = mapRef.current;
    const chartCanvas = chartRef.current;
    if (!canvas || !chartCanvas) return undefined;
    const mctx = canvas.getContext('2d');
    const cctx = chartCanvas.getContext('2d');
    if (!mctx || !cctx) return undefined;

    const readoutRefs: ReadoutRefs = {
      rate: rateRef,
      radial: radialRef,
      brgTo: brgToRef,
      dist: distRef,
      slant: slantRef,
      elev: elevRef,
      peak: peakRef,
      theo: theoRef,
      flag: flagRef,
    };

    resetPass(stateRef.current);

    const mapSize = {w: 860, h: 560};
    const chartSize = {w: 320, h: 150};
    const resizeAll = () => {
      const mapW = canvas.clientWidth;
      if (mapW > 0) Object.assign(mapSize, sizeCanvasToContainer(canvas, mapW, MAP_ASPECT));
      const chartW = chartCanvas.clientWidth;
      if (chartW > 0) Object.assign(chartSize, sizeCanvasToContainer(chartCanvas, chartW, CHART_ASPECT));
    };
    resizeAll();
    const ro = new ResizeObserver(resizeAll);
    ro.observe(canvas);
    ro.observe(chartCanvas);

    let rafId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dtReal = Math.min(0.1, (now - last) / 1000);
      last = now;
      const state = stateRef.current;
      if (!state.paused) {
        const dt = dtReal * state.ts;
        const frame = stepUpdate(state, dt);
        drawMap(mctx, mapSize.w, mapSize.h, state, frame);
        drawChart(cctx, chartSize.w, chartSize.h, state);
        renderReadouts(readoutRefs, state, frame);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const handleSpdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    stateRef.current.spd = val;
    if (vSpdRef.current) vSpdRef.current.textContent = `${val} kt`;
  };
  const handleOffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    stateRef.current.off = val;
    if (vOffRef.current) vOffRef.current.textContent = `${val.toFixed(1)} NM`;
    resetPass(stateRef.current);
  };
  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    stateRef.current.alt = val;
    if (vAltRef.current) vAltRef.current.textContent = `${val.toLocaleString('tr-TR')} ft`;
  };
  const handleTsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    stateRef.current.ts = val;
    if (vTsRef.current) vTsRef.current.textContent = `${val.toFixed(1)}×`;
  };
  const handleTauChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    stateRef.current.tau = val;
    if (vTauRef.current) vTauRef.current.textContent = `${val.toFixed(1)} s`;
  };
  const handlePauseClick = () => {
    const state = stateRef.current;
    state.paused = !state.paused;
    if (pauseBtnRef.current) pauseBtnRef.current.textContent = state.paused ? '▶ Devam' : '⏸ Duraklat';
  };
  const handleResetClick = () => resetPass(stateRef.current);

  return (
    <div className={styles.simulator}>
      <div className={styles.layout}>
        <div className={styles.panel}>
          <canvas ref={mapRef} className={styles.mapCanvas} width={860} height={560} />
          <div className={styles.controls}>
            <div className={styles.ctl}>
              <label htmlFor="vor-spd">
                Yer hızı <b ref={vSpdRef}>{INITIAL_STATE.spd} kt</b>
              </label>
              <input
                id="vor-spd"
                type="range"
                min={100}
                max={1200}
                step={10}
                defaultValue={INITIAL_STATE.spd}
                onChange={handleSpdChange}
              />
            </div>
            <div className={styles.ctl}>
              <label htmlFor="vor-off">
                Yanal mesafe (istasyona en yakın) <b ref={vOffRef}>{INITIAL_STATE.off.toFixed(1)} NM</b>
              </label>
              <input
                id="vor-off"
                type="range"
                min={0.1}
                max={20}
                step={0.1}
                defaultValue={INITIAL_STATE.off}
                onChange={handleOffChange}
              />
            </div>
            <div className={styles.ctl}>
              <label htmlFor="vor-alt">
                Uçak irtifası (istasyon üstü) <b ref={vAltRef}>{INITIAL_STATE.alt.toLocaleString('tr-TR')} ft</b>
              </label>
              <input
                id="vor-alt"
                type="range"
                min={0}
                max={45000}
                step={500}
                defaultValue={INITIAL_STATE.alt}
                onChange={handleAltChange}
              />
            </div>
            <div className={styles.ctl}>
              <label htmlFor="vor-ts">
                Zaman ölçeği <b ref={vTsRef}>{INITIAL_STATE.ts.toFixed(1)}×</b>
              </label>
              <input
                id="vor-ts"
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                defaultValue={INITIAL_STATE.ts}
                onChange={handleTsChange}
              />
            </div>
            <div className={styles.ctl}>
              <label htmlFor="vor-tau">
                Alıcı zaman sabiti (filtre) <b ref={vTauRef}>{INITIAL_STATE.tau.toFixed(1)} s</b>
              </label>
              <input
                id="vor-tau"
                type="range"
                min={0}
                max={3}
                step={0.1}
                defaultValue={INITIAL_STATE.tau}
                onChange={handleTauChange}
              />
            </div>
            <div className={styles.btns}>
              <button ref={pauseBtnRef} type="button" onClick={handlePauseClick}>
                ⏸ Duraklat
              </button>
              <button type="button" onClick={handleResetClick}>
                ↺ Yeniden başlat
              </button>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sect}>Alıcı göstergeleri</div>
          <div className={styles.readouts}>
            <div className={clsx(styles.ro, styles.roBig)}>
              <div className={styles.lbl}>Bearing değişim hızı (ölçülen)</div>
              <div className={styles.val} ref={rateRef}>
                0.00 °/s
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Radyal (FROM)</div>
              <div className={styles.val} ref={radialRef}>
                ---°
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Bearing (TO)</div>
              <div className={styles.val} ref={brgToRef}>
                ---°
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Yatay mesafe</div>
              <div className={styles.val} ref={distRef}>
                -- NM
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Eğik mesafe (DME)</div>
              <div className={styles.val} ref={slantRef}>
                -- NM
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Yükseliş açısı</div>
              <div className={styles.val} ref={elevRef}>
                --°
              </div>
            </div>
            <div className={styles.ro}>
              <div className={styles.lbl}>Bu geçişteki tepe hız</div>
              <div className={styles.val} ref={peakRef}>
                0.00 °/s
              </div>
            </div>
            <div className={styles.flag} ref={flagRef}>
              NAV — SİNYAL GEÇERLİ
            </div>
          </div>
          <div className={styles.sect}>Bearing değişim hızı — zaman grafiği</div>
          <canvas ref={chartRef} className={styles.chartCanvas} width={320} height={150} />
          <div className={styles.sect}>Teorik tepe değer</div>
          <div className={styles.ro}>
            <div className={styles.lbl}>ω_max = V / d (traverse noktasında)</div>
            <div className={clsx(styles.val, styles.valSmall)} ref={theoRef}>
              --
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
