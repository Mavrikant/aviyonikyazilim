import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import useHomepageData, {splitParts, type Part} from './useHomepageData';

import styles from './Kokpit.module.css';

const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';

/*
 * PFD (birincil uçuş ekranı) — düz uçuş. Okumalar küçük bir göz kırpmadır:
 * IAS 178 (DO-178C), ALT 4754 (ARP4754A), seçili irtifa 4761 (ARP4761),
 * HDG 330 (DO-330).
 */
const IAS = 178;
const ALT = 4754;
const SEL_ALT = 4761;
const HDG = 330;
const CENTER = {x: 150, y: 112};
const PITCH_SCALE = 2.4; // birim/derece
const SPEED_SCALE = 2; // birim/knot
const ALT_SCALE = 0.2; // birim/fit

const pitchRungs = [-20, -15, -10, -5, 5, 10, 15, 20];
const speedTicks = Array.from({length: 9}, (_, i) => 140 + i * 10);
const altTicks = Array.from({length: 9}, (_, i) => 4400 + i * 100);
const headingTicks = Array.from({length: 17}, (_, i) => 290 + i * 5);
const bankAngles = [10, 20, 30, 45, 60].flatMap((a) => [a, -a]);

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function Pfd(): ReactNode {
  const adi = {x: 78, y: 40, w: 144, h: 144};
  const hdgCenter = {x: 150, y: 356};
  const hdgRadius = 130;
  return (
    <svg className={styles.pfd} viewBox="0 0 300 262" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="pfdAdi">
          <rect x={adi.x} y={adi.y} width={adi.w} height={adi.h} rx="10" />
        </clipPath>
        <clipPath id="pfdSpeed">
          <rect x="16" y="40" width="44" height="144" />
        </clipPath>
        <clipPath id="pfdAlt">
          <rect x="240" y="40" width="48" height="144" />
        </clipPath>
        <clipPath id="pfdHdg">
          <rect x="60" y="222" width="180" height="40" />
        </clipPath>
      </defs>

      {/* Mod göstergesi (FMA) */}
      <g className={styles.fma}>
        <text x="96" y="14" textAnchor="middle">SPD</text>
        <text x="150" y="14" textAnchor="middle">LNAV</text>
        <text x="204" y="14" textAnchor="middle">DAL A</text>
        <path d="M123 4 V18 M177 4 V18" className={styles.fmaRule} />
      </g>

      {/* Yapay ufuk */}
      <g clipPath="url(#pfdAdi)">
        <rect x="0" y="0" width="300" height={CENTER.y} className={styles.sky} />
        <rect x="0" y={CENTER.y} width="300" height="200" className={styles.ground} />
        <path d={`M0 ${CENTER.y} H300`} className={styles.white} strokeWidth="1.4" />
        {pitchRungs.map((deg) => {
          const y = CENTER.y - deg * PITCH_SCALE;
          const major = deg % 10 === 0;
          const half = major ? 22 : 10;
          return (
            <g key={deg}>
              <path d={`M${CENTER.x - half} ${y} H${CENTER.x + half}`} className={styles.white} strokeWidth="1.1" />
              {major && (
                <>
                  <text x={CENTER.x - half - 4} y={y} textAnchor="end" className={styles.ladderText}>
                    {Math.abs(deg)}
                  </text>
                  <text x={CENTER.x + half + 4} y={y} className={styles.ladderText}>
                    {Math.abs(deg)}
                  </text>
                </>
              )}
            </g>
          );
        })}
        {/* Yatış skalası */}
        {bankAngles.map((angle) => {
          const outer = polar(CENTER.x, CENTER.y, 64, angle);
          const inner = polar(CENTER.x, CENTER.y, Math.abs(angle) % 30 === 0 ? 57 : 60, angle);
          return (
            <path key={angle} d={`M${inner.x} ${inner.y} L${outer.x} ${outer.y}`} className={styles.white} strokeWidth="1.2" />
          );
        })}
        <path
          d={`M${polar(CENTER.x, CENTER.y, 64, -60).x} ${polar(CENTER.x, CENTER.y, 64, -60).y} A64 64 0 0 1 ${polar(CENTER.x, CENTER.y, 64, 60).x} ${polar(CENTER.x, CENTER.y, 64, 60).y}`}
          className={styles.white}
          strokeWidth="1.1"
          fill="none"
        />
        <path d={`M${CENTER.x - 4} ${CENTER.y - 71} H${CENTER.x + 4} L${CENTER.x} ${CENTER.y - 65} Z`} className={styles.whiteFill} />
      </g>
      <rect x={adi.x} y={adi.y} width={adi.w} height={adi.h} rx="10" className={styles.frame} />
      {/* Yatış işaretçisi ve uçak sembolü (sabit) */}
      <path d={`M${CENTER.x - 5} ${CENTER.y - 56} H${CENTER.x + 5} L${CENTER.x} ${CENTER.y - 63} Z`} className={styles.whiteFill} />
      <g className={styles.aircraft}>
        <path d={`M${CENTER.x - 44} ${CENTER.y - 2} H${CENTER.x - 18} V${CENTER.y + 8} H${CENTER.x - 22} V${CENTER.y + 2} H${CENTER.x - 44} Z`} />
        <path d={`M${CENTER.x + 44} ${CENTER.y - 2} H${CENTER.x + 18} V${CENTER.y + 8} H${CENTER.x + 22} V${CENTER.y + 2} H${CENTER.x + 44} Z`} />
        <rect x={CENTER.x - 3} y={CENTER.y - 3} width="6" height="6" />
      </g>

      {/* Hız bandı */}
      <rect x="16" y="40" width="44" height="144" className={styles.tape} />
      <g clipPath="url(#pfdSpeed)">
        {speedTicks.map((kt) => {
          const y = CENTER.y - (kt - IAS) * SPEED_SCALE;
          return (
            <g key={kt}>
              <path d={`M52 ${y} H60`} className={styles.white} strokeWidth="1" />
              {kt % 20 === 0 && Math.abs(y - CENTER.y) > 14 && y > 46 && y < 178 && (
                <text x="48" y={y} textAnchor="end" className={styles.tapeText}>
                  {kt}
                </text>
              )}
            </g>
          );
        })}
        <path d={`M60 ${CENTER.y - 5} L54 ${CENTER.y} L60 ${CENTER.y + 5}`} className={styles.bug} />
      </g>
      <text x="38" y="34" textAnchor="middle" className={styles.selected}>{IAS}</text>
      <path d={`M14 ${CENTER.y - 10} H56 L63 ${CENTER.y} L56 ${CENTER.y + 10} H14 Z`} className={styles.readout} />
      <text x="36" y={CENTER.y} textAnchor="middle" className={styles.readoutText}>{IAS}</text>

      {/* İrtifa bandı */}
      <rect x="240" y="40" width="48" height="144" className={styles.tape} />
      <g clipPath="url(#pfdAlt)">
        {altTicks.map((ft) => {
          const y = CENTER.y - (ft - ALT) * ALT_SCALE;
          return (
            <g key={ft}>
              <path d={`M240 ${y} H247`} className={styles.white} strokeWidth="1" />
              {ft % 200 === 0 && Math.abs(y - CENTER.y) > 14 && y > 46 && y < 178 && (
                <text x="252" y={y} className={styles.tapeText}>
                  {ft}
                </text>
              )}
            </g>
          );
        })}
        <path
          d={`M240 ${CENTER.y - (SEL_ALT - ALT) * ALT_SCALE - 6} H246 V${CENTER.y - (SEL_ALT - ALT) * ALT_SCALE + 6} H240`}
          className={styles.bug}
        />
      </g>
      <text x="264" y="34" textAnchor="middle" className={styles.selected}>{SEL_ALT}</text>
      <path d={`M233 ${CENTER.y} L240 ${CENTER.y - 10} H292 V${CENTER.y + 10} H240 Z`} className={styles.readout} />
      <text x="266" y={CENTER.y} textAnchor="middle" className={styles.readoutText}>{ALT}</text>
      <text x="264" y="198" textAnchor="middle" className={styles.baro}>STD</text>

      {/* Pusula yayı */}
      <g clipPath="url(#pfdHdg)">
        <circle cx={hdgCenter.x} cy={hdgCenter.y} r={hdgRadius} className={styles.compass} />
        {headingTicks.map((hdg) => {
          const rel = hdg - HDG;
          const major = hdg % 10 === 0;
          const outer = polar(hdgCenter.x, hdgCenter.y, hdgRadius, rel);
          const inner = polar(hdgCenter.x, hdgCenter.y, hdgRadius - (major ? 8 : 5), rel);
          const label = polar(hdgCenter.x, hdgCenter.y, hdgRadius - 15, rel);
          return (
            <g key={hdg}>
              <path d={`M${inner.x} ${inner.y} L${outer.x} ${outer.y}`} className={styles.white} strokeWidth="1" />
              {major && hdg !== HDG && (
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  transform={`rotate(${rel} ${label.x} ${label.y})`}
                  className={styles.compassText}>
                  {hdg % 360 === 0 ? 'N' : String((hdg % 360) / 10)}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <path d={`M${hdgCenter.x - 3} ${hdgCenter.y - hdgRadius - 6} H${hdgCenter.x + 3} V${hdgCenter.y - hdgRadius} H${hdgCenter.x - 3} Z`} className={styles.bugFill} />
      <path d={`M${hdgCenter.x - 18} 208 H${hdgCenter.x + 18} V222 H${hdgCenter.x - 18} Z`} className={styles.readout} />
      <text x={hdgCenter.x} y="215" textAnchor="middle" className={styles.readoutText}>{HDG}</text>
      <text x="70" y="215" className={styles.selected}>HDG {HDG}</text>
    </svg>
  );
}

function Checklist({parts}: {parts: Part[]}): ReactNode {
  return (
    <div className={styles.checkColumn}>
      {parts.map((part) => (
        <div key={part.title} className={styles.checkPart}>
          <h3 className={styles.checkTitle}>
            {part.no ? `Kısım ${part.no} · ${part.title}` : part.title}
          </h3>
          <ol className={styles.checkItems}>
            {part.chapters.map((chapter) => (
              <li key={chapter.permalink}>
                <Link className={styles.checkRow} to={chapter.permalink}>
                  <span className={styles.checkNo}>{chapter.no}</span>
                  <span className={styles.checkText}>{chapter.title}</span>
                  <span className={styles.checkDots} aria-hidden="true" />
                  <span className={styles.checkTime}>{chapter.minutes} dk</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

const softKeys = [
  {label: 'Kitap', to: '/kitap'},
  {label: 'Blog', to: '/blog'},
  {label: 'Kütüphane', to: '/kutuphane'},
  {label: 'Araçlar', to: '/araclar'},
  {label: 'Kısaltmalar', to: '/kitap/kaynaklar/kisaltmalar'},
  {label: 'GitHub', href: REPO_URL},
];

export default function Kokpit(): ReactNode {
  const {buildDate, book, posts, postCount, library, tools} = useHomepageData();
  const [left, right] = splitParts(book.parts);

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.unit}>
          <span className={styles.screw} aria-hidden="true" />
          <span className={styles.screw} aria-hidden="true" />
          <span className={styles.screw} aria-hidden="true" />
          <span className={styles.screw} aria-hidden="true" />
          <p className={styles.plate} aria-hidden="true">
            MFD-1 · AVY
          </p>

          <div className={styles.display}>
            <header className={styles.status}>
              <h1 className={styles.siteTitle}>Aviyonik Yazılım</h1>
              <p className={styles.memo}>DO-178C · Türkçe · açık kaynak</p>
              <p className={styles.rev}>
                Rev <time dateTime={buildDate}>{buildDate}</time>
              </p>
            </header>

            <div className={styles.top}>
              <figure className={styles.pfdFigure}>
                <Pfd />
                <figcaption>
                  IAS 178 · ALT 4754 / SEL 4761 · HDG 330 — DO-178C, ARP4754A, ARP4761, DO-330
                </figcaption>
              </figure>

              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>Durum</h2>
                <dl className={styles.statusList}>
                  <div>
                    <dt>Kitap</dt>
                    <dd>
                      {book.chapterCount} bölüm + {book.appendixCount} ek
                    </dd>
                  </div>
                  <div>
                    <dt>Blog</dt>
                    <dd>{postCount} yazı</dd>
                  </div>
                  <div>
                    <dt>Kütüphane</dt>
                    <dd>{library.pageCount} sayfa</dd>
                  </div>
                  <div>
                    <dt>Araçlar</dt>
                    <dd>{tools.length} simülatör</dd>
                  </div>
                  <div>
                    <dt>Lisans</dt>
                    <dd>CC BY-SA 4.0</dd>
                  </div>
                </dl>

                <Link className={styles.prompt} to={book.firstChapter.permalink}>
                  <span className={styles.promptArrow} aria-hidden="true">
                    ▸
                  </span>
                  Okumaya başla
                  <span className={styles.promptTarget}>
                    {book.firstChapter.no} {book.firstChapter.title}
                  </span>
                </Link>

                <h2 className={styles.panelTitle}>Son yazılar</h2>
                <ol className={styles.posts}>
                  {posts.map((post) => (
                    <li key={post.permalink}>
                      <time dateTime={post.date}>{post.date}</time>
                      <Link to={post.permalink}>{post.title}</Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <section className={styles.checklist}>
              <div className={styles.checkHead}>
                <Heading as="h2" id="icindekiler" className={styles.panelTitle}>
                  İçindekiler
                </Heading>
                <span>bölüm · başlık · okuma süresi</span>
              </div>
              <nav className={styles.checkGrid} aria-label="Kitap içindekiler">
                <Checklist parts={left} />
                <Checklist parts={right} />
              </nav>
            </section>

            <div className={styles.bottom}>
              <section>
                <h2 className={styles.panelTitle}>Kütüphane</h2>
                <ul className={styles.lines}>
                  {library.shelves.map((shelf) => (
                    <li key={shelf.permalink}>
                      <Link to={shelf.permalink}>{shelf.title}</Link>
                      <span>{shelf.count}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className={styles.panelTitle}>Araçlar</h2>
                <ul className={styles.lines}>
                  {tools.map((tool) => (
                    <li key={tool.permalink}>
                      <Link to={tool.permalink}>{tool.title}</Link>
                      <span>▸</span>
                    </li>
                  ))}
                </ul>
                <h2 className={styles.panelTitle}>Kaynaklar</h2>
                <ul className={styles.lines}>
                  {book.references.map((ref) => (
                    <li key={ref.permalink}>
                      <Link to={ref.permalink}>{ref.title}</Link>
                      <span>▸</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <nav className={styles.keys} aria-label="Ekran tuşları">
            {softKeys.map((key) => (
              <Link key={key.label} className={styles.key} to={key.to} href={key.href}>
                {key.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className={styles.footnote}>
          Hata ve öneriler için her sayfanın altındaki “Bu sayfayı düzenle” bağlantısını
          kullanabilir, kitap önerilerinizi{' '}
          <Link href="mailto:serdar@karaman.dev?subject=Kitap%20onerisi">serdar@karaman.dev</Link>{' '}
          adresine yazabilirsiniz.
        </p>
      </div>
    </main>
  );
}
