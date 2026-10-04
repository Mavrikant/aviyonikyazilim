import {useEffect, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent, ReactNode} from 'react';
import clsx from 'clsx';

import {etiketMetni} from './cizim';
import type {Cizim} from './cizim';
import type {Atamalar} from './veri';
import {TUR_ADI} from './veri';
import styles from './styles.module.css';

const EN_BUYUK = 8;

type Props = {
  cizim: Cizim;
  atamalar: Atamalar;
  /** Soket yerleşimi ya da arka yüz: değişince yakın görünüm aynı pinlerde kalsın diye merkez de aynalanır */
  aynala: boolean;
  secili: string | null;
  onSec: (id: string) => void;
  etiket: string;
};

type Isaretci = {x: number; y: number};

/**
 * Konnektör yüzü: kontağa dokununca seçer. Yoğun yerleşimler için yakınlaştırılır
 * (düğmeler, Ctrl + tekerlek / dokunmatik yüzeyde iki parmak, dokunmatik ekranda iki parmakla
 * sıkıştırma); yakınken sürükleyerek kaydırılır. Konnektör değişince bileşen `key` ile yenilenir.
 * Renkler sınıflarla CSS'ten gelir; sunucuda üretilen HTML temadan bağımsızdır.
 */
export default function Yuz({cizim, atamalar, aynala, secili, onSec, etiket}: Props): ReactNode {
  const svgRef = useRef<SVGSVGElement>(null);
  const [olcek, setOlcek] = useState(1);
  const [merkez, setMerkez] = useState<[number, number] | null>(null);
  const isaretciler = useRef(new Map<number, Isaretci>());
  const hareket = useRef<{
    hedef: string | null;
    bas: Isaretci;
    merkez: [number, number];
    olcek: number;
    mesafe: number;
    kaydi: boolean;
  } | null>(null);

  const [vx, vy, vw, vh] = cizim.vb;
  const w = vw / olcek;
  const h = vh / olcek;
  const [cx, cy] = merkez ?? [vx + vw / 2, vy + vh / 2];
  // Görünen pencere çizimin dışına taşmaz
  const x = Math.min(Math.max(cx - w / 2, vx), vx + vw - w);
  const y = Math.min(Math.max(cy - h / 2, vy), vy + vh - h);

  // Ayna değişince yakın görünüm aynı kontakları göstermeye devam eder
  const oncekiAyna = useRef(aynala);
  useEffect(() => {
    if (oncekiAyna.current === aynala) return;
    oncekiAyna.current = aynala;
    setMerkez((m) => (m ? [-m[0], m[1]] : m));
  }, [aynala]);

  // Tablodan seçilen pin yakın görünümün dışındaysa görünüm ona kayar
  const seciliKontak = cizim.kontaklar.find((k) => k.id === secili);
  useEffect(() => {
    if (!seciliKontak || olcek <= 1) return;
    const pay = seciliKontak.r * 2;
    const icinde =
      seciliKontak.x - pay >= x && seciliKontak.x + pay <= x + w && seciliKontak.y - pay >= y && seciliKontak.y + pay <= y + h;
    if (!icinde) setMerkez([seciliKontak.x, seciliKontak.y]);
  }, [secili]); // eslint-disable-line react-hooks/exhaustive-deps

  const birimPiksel = () => {
    const el = svgRef.current;
    if (!el) return 1;
    const r = el.getBoundingClientRect();
    // preserveAspectRatio "meet": dar kenar belirler
    return Math.max(w / r.width, h / r.height);
  };

  const yakinlastir = (carpan: number, odak?: [number, number]) => {
    const yeni = Math.min(EN_BUYUK, Math.max(1, olcek * carpan));
    if (yeni === 1) {
      setOlcek(1);
      setMerkez(null);
      return;
    }
    const [ox, oy] = odak ?? [x + w / 2, y + h / 2];
    // Odak noktası ekranda yerinde kalır
    const k = olcek / yeni;
    setMerkez([ox + (x + w / 2 - ox) * k, oy + (y + h / 2 - oy) * k]);
    setOlcek(yeni);
  };

  // Ctrl + tekerlek (dokunmatik yüzeyde iki parmak sıkıştırma da böyle gelir); sayfa kaydırması korunur
  const yakinlastirRef = useRef(yakinlastir);
  yakinlastirRef.current = yakinlastir;
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const tekerlek = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const pt = el.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const m = el.getScreenCTM();
      if (!m) return;
      const p = pt.matrixTransform(m.inverse());
      yakinlastirRef.current(Math.exp(-e.deltaY * 0.01), [p.x, p.y]);
    };
    el.addEventListener('wheel', tekerlek, {passive: false});
    return () => el.removeEventListener('wheel', tekerlek);
  }, []);

  const asagi = (e: ReactPointerEvent<SVGSVGElement>) => {
    isaretciler.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const noktalar = [...isaretciler.current.values()];
    const hedef = (e.target as Element).closest('[data-pin]')?.getAttribute('data-pin') ?? null;
    hareket.current = {
      hedef: noktalar.length === 1 ? hedef : null,
      bas: {x: e.clientX, y: e.clientY},
      merkez: [x + w / 2, y + h / 2],
      olcek,
      mesafe: noktalar.length === 2 ? Math.hypot(noktalar[0].x - noktalar[1].x, noktalar[0].y - noktalar[1].y) : 0,
      kaydi: noktalar.length > 1,
    };
    if (olcek > 1 || noktalar.length > 1) svgRef.current?.setPointerCapture(e.pointerId);
  };

  const surukle = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isaretciler.current.has(e.pointerId) || !hareket.current) return;
    isaretciler.current.set(e.pointerId, {x: e.clientX, y: e.clientY});
    const hk = hareket.current;
    const noktalar = [...isaretciler.current.values()];
    if (noktalar.length === 2 && hk.mesafe > 0) {
      const d = Math.hypot(noktalar[0].x - noktalar[1].x, noktalar[0].y - noktalar[1].y);
      const yeni = Math.min(EN_BUYUK, Math.max(1, (hk.olcek * d) / hk.mesafe));
      setOlcek(yeni);
      if (yeni === 1) setMerkez(null);
      hk.kaydi = true;
      return;
    }
    const dx = e.clientX - hk.bas.x;
    const dy = e.clientY - hk.bas.y;
    if (Math.hypot(dx, dy) > 4) hk.kaydi = true;
    if (olcek > 1 && hk.kaydi) {
      const b = birimPiksel();
      setMerkez([hk.merkez[0] - dx * b, hk.merkez[1] - dy * b]);
    }
  };

  const yukari = (e: ReactPointerEvent<SVGSVGElement>) => {
    isaretciler.current.delete(e.pointerId);
    const hk = hareket.current;
    if (hk && !hk.kaydi && hk.hedef) onSec(hk.hedef);
    if (isaretciler.current.size === 0) hareket.current = null;
  };

  const iptal = (e: ReactPointerEvent<SVGSVGElement>) => {
    isaretciler.current.delete(e.pointerId);
    if (isaretciler.current.size === 0) hareket.current = null;
  };

  const eksen = cizim.daire !== undefined ? cizim.daire * 1.06 : 0;

  return (
    <div className={styles.yuzKutu}>
      <svg
        ref={svgRef}
        className={clsx(styles.yuzSvg, olcek > 1 && styles.yakin)}
        viewBox={`${x} ${y} ${w} ${h}`}
        role="group"
        aria-label={etiket}
        onPointerDown={asagi}
        onPointerMove={surukle}
        onPointerUp={yukari}
        onPointerCancel={iptal}>
        <path d={cizim.govde} className={styles.govdeCizgi} />
        {cizim.daire !== undefined && <path d={`M${-eksen} 0H${eksen}M0 ${-eksen}V${eksen}`} className={styles.eksen} />}
        {cizim.kama && <path d={cizim.kama} className={styles.govdeCizgi} />}
        {cizim.isaret && <path d={cizim.isaret} className={styles.isaret} />}
        {cizim.kontaklar.map((k) => {
          const a = atamalar[k.id];
          const tur = a?.tur ?? 'bos';
          const ipucu = k.anahtar
            ? `${k.id}: anahtar — pin yok`
            : `${k.id}${k.boyut ? ` · ${k.boyut}` : ''}${a?.ad ? ` · ${a.ad}` : ''} (${TUR_ADI[tur]})`;
          return (
            <g
              key={k.id}
              data-pin={k.id}
              className={clsx(styles.kontak, k.anahtar ? styles.anahtarKontak : styles[`tur_${tur}`])}>
              <title>{ipucu}</title>
              {k.kare ? (
                <rect
                  x={k.x - k.r}
                  y={k.y - k.r}
                  width={2 * k.r}
                  height={2 * k.r}
                  rx={k.r * 0.15}
                  className={styles.kontakSekil}
                />
              ) : (
                <circle cx={k.x} cy={k.y} r={k.r} className={styles.kontakSekil} />
              )}
              <text
                x={k.x}
                y={k.y}
                fontSize={k.yazi}
                className={styles.kontakYazi}
                textAnchor="middle"
                dominantBaseline="central">
                {k.id}
              </text>
            </g>
          );
        })}
        {cizim.adlar.map((ad) => {
          const a = atamalar[ad.id];
          if (!a?.ad) return null;
          return (
            <text
              key={ad.id}
              x={ad.x}
              y={ad.y}
              fontSize={cizim.adBoyu}
              className={clsx(styles.adYazi, ad.id === secili && styles.seciliAd)}
              textAnchor={ad.hiza}
              dominantBaseline="central">
              <title>{a.ad}</title>
              {etiketMetni(a.ad, cizim.adKarakter)}
            </text>
          );
        })}
        {seciliKontak && (
          <circle cx={seciliKontak.x} cy={seciliKontak.y} r={seciliKontak.r * 1.22} className={styles.seciliHalka} />
        )}
      </svg>
      <div className={styles.yakinlastirma}>
        <span className={styles.yakinlastirmaIpucu}>
          {olcek > 1 ? (
            'Sürükleyerek kaydırın'
          ) : (
            <>
              <span className={styles.ipucuFare}>Ctrl + tekerlek ile de yakınlaşır</span>
              <span className={styles.ipucuDokunma}>Yakınken iki parmakla ölçeklenir</span>
            </>
          )}
        </span>
        <button type="button" onClick={() => yakinlastir(1.6)} disabled={olcek >= EN_BUYUK} aria-label="Yakınlaştır">
          +
        </button>
        <button type="button" onClick={() => yakinlastir(1 / 1.6)} disabled={olcek <= 1} aria-label="Uzaklaştır">
          −
        </button>
        <button
          type="button"
          onClick={() => {
            setOlcek(1);
            setMerkez(null);
          }}
          disabled={olcek <= 1}
          aria-label="Tümünü göster"
          title="Tümünü göster">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
