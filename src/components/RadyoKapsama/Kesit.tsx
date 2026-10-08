import type {ReactNode} from 'react';

import {FT_M, NM_KM, dalgaBoyu, fresnelYaricapi, siskinlik} from './yayilim';
import type {Kesit as KesitVerisi} from './yayilim';
import styles from './styles.module.css';

type Props = {
  kesit: KesitVerisi;
  hVerici: number;
  hAlici: number;
  fMHz: number;
  istasyon: string;
};

const EN = 720;
const BOY = 250;
const SOL = 52;
const SAG = 14;
const UST = 14;
const ALT = 34;

/** Eksen için 4–6 aralık veren yuvarlak adım (1, 2, 5 × 10ⁿ) */
function yuvarlakAdim(aralik: number, hedef: number): number {
  const ham = aralik / hedef;
  const us = 10 ** Math.floor(Math.log10(ham));
  const oran = ham / us;
  return (oran < 1.5 ? 1 : oran < 3.5 ? 2 : oran < 7.5 ? 5 : 10) * us;
}

/**
 * İstasyon ile seçilen nokta arasındaki arazi kesiti. Dünya eğriliği araziye eklenir
 * (4/3 etkin yarıçap), böylece görüş hattı düz çizgi olarak çizilebilir.
 */
export default function Kesit({kesit, hVerici, hAlici, fMHz, istasyon}: Props): ReactNode {
  const {h, km, adimKm} = kesit;
  const m = h.length - 1;
  const lambda = dalgaBoyu(fMHz);

  const egri = Array.from(h, (y, i) => y + siskinlik(i * adimKm, km));
  const hat = (i: number) => (hVerici * (m - i) + hAlici * i) / m;
  const tavan = Math.max(hVerici, hAlici, ...egri) * 1.08 + 50;

  const x = (i: number) => SOL + (i / m) * (EN - SOL - SAG);
  const y = (metre: number) => UST + (1 - metre / tavan) * (BOY - UST - ALT);
  const nokta = (i: number, metre: number) => `${x(i).toFixed(1)},${y(Math.max(0, metre)).toFixed(1)}`;

  const araziYolu = `M${x(0)},${y(0)} ${egri.map((v, i) => `L${nokta(i, v)}`).join(' ')} L${x(m)},${y(0)} Z`;
  const denizYolu = egri.map((_, i) => `${i ? 'L' : 'M'}${nokta(i, siskinlik(i * adimKm, km))}`).join(' ');
  // 1. Fresnel bölgesinin %60'ının alt sınırı: bunun altına arazi girerse kayıp başlar
  const fresnelYolu = egri
    .map((_, i) => {
      const yaricap = i === 0 || i === m ? 0 : fresnelYaricapi(lambda, i * adimKm, km);
      return `${i ? 'L' : 'M'}${nokta(i, hat(i) - 0.6 * yaricap)}`;
    })
    .join(' ');

  const nm = km / NM_KM;
  const xAdim = yuvarlakAdim(nm, 6);
  const xCizgiler = Array.from({length: Math.floor(nm / xAdim) + 1}, (_, i) => i * xAdim);
  const tavanFt = tavan / FT_M;
  const yAdim = yuvarlakAdim(tavanFt, 5);
  const yCizgiler = Array.from({length: Math.floor(tavanFt / yAdim) + 1}, (_, i) => i * yAdim);

  return (
    <figure className={styles.kesit}>
      <svg
        viewBox={`0 0 ${EN} ${BOY}`}
        role="img"
        aria-label={`${istasyon} ile seçilen nokta arasında arazi kesiti: ${
          kesit.gorus ? 'görüş hattı açık' : 'görüş hattı araziyle kesiliyor'
        }`}>
        {yCizgiler.map((ft) => (
          <g key={ft}>
            <path className={styles.kesitIzgara} d={`M${SOL},${y(ft * FT_M)}H${EN - SAG}`} />
            <text className={styles.kesitEtiket} x={SOL - 6} y={y(ft * FT_M) + 3.5} textAnchor="end">
              {ft.toLocaleString('tr-TR')}
            </text>
          </g>
        ))}
        {xCizgiler.map((v) => {
          const px = SOL + (v / nm) * (EN - SOL - SAG);
          return (
            <g key={v}>
              <path className={styles.kesitIzgara} d={`M${px},${BOY - ALT}v4`} />
              <text className={styles.kesitEtiket} x={px} y={BOY - ALT + 16} textAnchor="middle">
                {v.toLocaleString('tr-TR')}
              </text>
            </g>
          );
        })}
        <text className={styles.kesitEtiket} x={EN - SAG} y={BOY - 4} textAnchor="end">
          İstasyondan mesafe (NM)
        </text>
        <text className={styles.kesitEtiket} x={4} y={10}>
          ft
        </text>

        <path className={styles.kesitArazi} d={araziYolu} />
        <path className={styles.kesitDeniz} d={denizYolu} />
        <path className={styles.kesitFresnel} d={fresnelYolu} />
        <path
          className={kesit.gorus ? styles.kesitHat : styles.kesitHatKesik}
          d={`M${nokta(0, hVerici)} L${nokta(m, hAlici)}`}
        />
        <circle className={styles.kesitUc} cx={x(0)} cy={y(hVerici)} r="3.5" />
        <circle className={styles.kesitUc} cx={x(m)} cy={y(hAlici)} r="3.5" />
      </svg>
      <figcaption>
        Düz çizgi görüş hattı, kesikli çizgi birinci Fresnel bölgesinin %60'ının alt sınırı, ince çizgi deniz
        seviyesidir. Dünya eğriliği araziye eklenmiştir (4/3 etkin yarıçap).
      </figcaption>
    </figure>
  );
}
