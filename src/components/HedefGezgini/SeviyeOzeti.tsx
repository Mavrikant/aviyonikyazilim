import type {ReactNode} from 'react';
import clsx from 'clsx';

import Isaret from './Isaret';
import {HEDEFLER, SEVIYE_BILGI, TABLOLAR, durumOf, kimlik, say} from './veri';
import type {Durum, Seviye, SeviyeE} from './veri';
import styles from './styles.module.css';

/**
 * Araç sayfasının "seviye arttıkça hedefler nasıl artar" bölümündeki şekiller.
 * Sayılar elle yazılmaz; hepsi veri.ts'teki hedef tablosundan hesaplanır.
 */

// Artışı göstermek için düşük seviyeden yükseğe
const ARTAN: SeviyeE[] = ['E', 'D', 'C', 'B', 'A'];
const ARTAN_ABCD: Seviye[] = ['D', 'C', 'B', 'A'];

const DURUM_METNI: Record<Durum, string> = {
  B: 'bağımsızlıkla karşılanır',
  G: 'karşılanır, bağımsızlık aranmaz',
  '-': 'aranmaz',
};

const yuzde = (n: number) => `${((n / HEDEFLER.length) * 100).toFixed(2)}%`;

/* ---------- Seviye başına hedef sayısı ---------- */

const CUBUK = 20;

export function SeviyeCubuklari(): ReactNode {
  return (
    <figure className={styles.sekil}>
      <div className={styles.cubuklar}>
        {ARTAN.map((s, i) => {
          const {hedef, bagimsiz} = say(s);
          const onceki = i > 0 ? say(ARTAN[i - 1]) : null;
          return (
            <div key={s} className={styles.cubukSatiri}>
              <div className={styles.cubukEtiket}>
                <b>Seviye {s}</b>
                <span>{SEVIYE_BILGI[s].ariza}</span>
              </div>
              <svg className={styles.cubuk} width="100%" height={CUBUK} aria-hidden="true" focusable="false">
                {hedef > 0 && (
                  <>
                    <rect className={styles.dolguG} width={yuzde(hedef)} height={CUBUK} rx="4">
                      <title>{`Seviye ${s}: ${hedef - bagimsiz} hedefte bağımsızlık aranmaz`}</title>
                    </rect>
                    {/* Taban çizgisindeki uç köşeli kalır */}
                    <rect className={styles.dolguG} width="6" height={CUBUK} />
                  </>
                )}
                {bagimsiz > 0 && (
                  <>
                    <rect className={styles.dolguB} width={yuzde(bagimsiz)} height={CUBUK}>
                      <title>{`Seviye ${s}: ${bagimsiz} hedef bağımsızlıkla karşılanır`}</title>
                    </rect>
                    <line className={styles.bosluk} x1={yuzde(bagimsiz)} x2={yuzde(bagimsiz)} y1="0" y2={CUBUK} />
                  </>
                )}
              </svg>
              <div className={styles.cubukDeger}>
                <span>
                  <b>{hedef}</b> hedef{bagimsiz > 0 && `, ${bagimsiz} hedef bağımsızlıkla`}
                </span>
                {onceki && (
                  <span className={styles.artis}>
                    +{hedef - onceki.hedef} hedef · +{bagimsiz - onceki.bagimsiz} bağımsızlık
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <ul className={styles.sekilLejant}>
        <li>
          <span className={clsx(styles.kutu, styles.kutuB)} /> Bağımsızlıkla karşılanan hedef
        </li>
        <li>
          <span className={clsx(styles.kutu, styles.kutuG)} /> Bağımsızlık aranmayan hedef
        </li>
      </ul>
      <figcaption>
        Yazılım seviyesine göre DO-178C hedef sayısı. Çubuğun tamamı o seviyede aranan hedefleri, koyu sarı dilim
        bağımsızlıkla karşılanması gerekenleri gösterir; sağdaki küçük satır bir alt seviyeye göre artıştır.
      </figcaption>
    </figure>
  );
}

/* ---------- Hedef haritası ---------- */

const HUCRE = 16;
const SOL = 16;
const UST = 14;

export function HedefHaritasi(): ReactNode {
  return (
    <figure className={styles.sekil}>
      <div className={styles.harita}>
        {TABLOLAR.map((t) => {
          const hedefler = HEDEFLER.filter((h) => h.tablo === t.no);
          const en = SOL + hedefler.length * HUCRE;
          const boy = UST + ARTAN_ABCD.length * HUCRE;
          const ozet = ARTAN_ABCD.map((s) => `Seviye ${s} ${say(s, t.no).hedef}`).join(', ');
          return (
            <div key={t.no} className={styles.haritaBlok}>
              <div className={styles.haritaAd}>
                <b>A-{t.no}</b>
                {t.kisa}
              </div>
              <svg
                width={en}
                height={boy}
                viewBox={`0 0 ${en} ${boy}`}
                role="img"
                aria-label={`Tablo A-${t.no}, ${t.ad}: ${hedefler.length} hedeften aranan sayısı ${ozet}`}>
                {hedefler.map((h, i) => (
                  <text key={h.no} className={styles.haritaNo} x={SOL + i * HUCRE + HUCRE / 2} y="9">
                    {h.no}
                  </text>
                ))}
                {ARTAN_ABCD.map((s, r) => (
                  <g key={s}>
                    <text className={styles.haritaHarf} x="0" y={UST + r * HUCRE + HUCRE / 2 + 3.5}>
                      {s}
                    </text>
                    {hedefler.map((h, i) => {
                      const d = durumOf(h, s);
                      const x = SOL + i * HUCRE;
                      const y = UST + r * HUCRE;
                      return (
                        <g key={h.no}>
                          <rect className={styles.haritaHucre} x={x} y={y} width={HUCRE} height={HUCRE}>
                            <title>{`${kimlik(h)} ${h.baslik} · Seviye ${s}: ${DURUM_METNI[d]}`}</title>
                          </rect>
                          <circle
                            className={d === 'B' ? styles.noktaB : d === 'G' ? styles.noktaG : styles.noktaYok}
                            cx={x + HUCRE / 2}
                            cy={y + HUCRE / 2}
                            r={d === 'B' ? 5 : d === 'G' ? 4.1 : 1.25}
                          />
                        </g>
                      );
                    })}
                  </g>
                ))}
              </svg>
            </div>
          );
        })}
      </div>
      <ul className={styles.sekilLejant}>
        <li>
          <Isaret durum="B" /> Bağımsızlıkla karşılanır
        </li>
        <li>
          <Isaret durum="G" /> Karşılanır, bağımsızlık aranmaz
        </li>
        <li>
          <Isaret durum="-" /> O seviyede aranmaz
        </li>
      </ul>
      <figcaption>
        Ek A'nın bütün hedefleri tek bakışta: her küçük ızgara bir tablo, her sütun bir hedef, her satır bir yazılım
        seviyesidir. Satırlar aşağı indikçe (D'den A'ya) önce boş sütunlar dolar, sonra halkalar dolu daireye döner.
      </figcaption>
    </figure>
  );
}

/* ---------- Süreç × seviye tablosu ---------- */

function Hucre({hedef, bagimsiz}: {hedef: number; bagimsiz: number}): ReactNode {
  return (
    <>
      {hedef}
      <span className={styles.bagimsizSayi}>
        {bagimsiz > 0 && (
          <>
            <Isaret durum="B" />
            <span className={styles.gizli}>bağımsızlıkla: </span>
            {bagimsiz}
          </>
        )}
      </span>
    </>
  );
}

export function SurecTablosu(): ReactNode {
  return (
    <div className={styles.tabloSar}>
      <table className={styles.surecTablosu}>
        <caption>
          Her hücrede o seviyede aranan hedef sayısı; dolu dairenin yanındaki sayı, bunlardan bağımsızlıkla karşılanması
          gerekenlerdir.
        </caption>
        <thead>
          <tr>
            <th scope="col">Tablo</th>
            <th scope="col">Süreç</th>
            {ARTAN_ABCD.map((s) => (
              <th key={s} scope="col">
                Seviye {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLOLAR.map((t) => (
            <tr key={t.no}>
              <td>A-{t.no}</td>
              <td>{t.ad}</td>
              {ARTAN_ABCD.map((s) => (
                <td key={s}>
                  <Hucre {...say(s, t.no)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <th scope="row">Toplam</th>
            {ARTAN_ABCD.map((s) => (
              <td key={s}>
                <Hucre {...say(s)} />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
