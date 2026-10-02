import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import YapayUfuk from '@site/src/components/YapayUfuk';
import useHomepageData, {splitParts, type Part} from './useHomepageData';

import styles from './Belge.module.css';

const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';

/* Şekil 2 — VOR istasyonu yakınından düz rotada geçiş (çizgisel şema). */
const VOR = {x: 120, y: 100, rose: 28};
const TRACK_Y = 44;
const FIXES = [24, 64, 100, 140, 176, 216];
const HEXAGON = Array.from({length: 6}, (_, i) => {
  const a = (Math.PI / 3) * i;
  return `${(VOR.x + 6 * Math.cos(a)).toFixed(2)} ${(VOR.y + 6 * Math.sin(a)).toFixed(2)}`;
}).join(' L');

function VorSemasi(): ReactNode {
  return (
    <svg className={styles.vorSvg} viewBox="0 0 240 146" aria-hidden="true" focusable="false">
      {FIXES.map((x) => (
        <path key={x} className={styles.vorRadial} d={`M${VOR.x} ${VOR.y} L${x} ${TRACK_Y}`} />
      ))}
      <path className={styles.vorTrack} d={`M8 ${TRACK_Y} H224`} />
      <path className={styles.vorMark} d={`M224 ${TRACK_Y - 4} L233 ${TRACK_Y} L224 ${TRACK_Y + 4} Z`} />
      {FIXES.map((x) => (
        <circle key={x} className={styles.vorFix} cx={x} cy={TRACK_Y} r="1.8" />
      ))}
      <path className={styles.vorAircraft} d={`M170 ${TRACK_Y - 5} L184 ${TRACK_Y} L170 ${TRACK_Y + 5} L173 ${TRACK_Y} Z`} />

      <circle className={styles.vorRose} cx={VOR.x} cy={VOR.y} r={VOR.rose} />
      {Array.from({length: 12}, (_, i) => i * 30).map((angle) => (
        <path
          key={angle}
          className={styles.vorRose}
          d={`M${VOR.x} ${VOR.y - VOR.rose} V${VOR.y - VOR.rose + (angle % 90 === 0 ? 7 : 4)}`}
          transform={`rotate(${angle} ${VOR.x} ${VOR.y})`}
        />
      ))}
      <path className={styles.vorStation} d={`M${HEXAGON} Z`} />
      <circle className={styles.vorDot} cx={VOR.x} cy={VOR.y} r="1.6" />

      {/* En yakın geçiş mesafesi d */}
      <path className={styles.vorDim} d={`M${VOR.x} ${TRACK_Y + 3} V${VOR.y - 9}`} />
      <path className={styles.vorDot} d={`M${VOR.x - 2.5} ${TRACK_Y + 7} L${VOR.x} ${TRACK_Y + 2} L${VOR.x + 2.5} ${TRACK_Y + 7} Z`} />
      <text className={styles.vorLabel} x={VOR.x + 5} y={TRACK_Y + 18}>d</text>
      <text className={styles.vorLabel} x={VOR.x} y={142} textAnchor="middle">VOR</text>
      <text className={styles.vorLabel} x="8" y={TRACK_Y - 8}>rota</text>
    </svg>
  );
}

function TocColumn({parts}: {parts: Part[]}): ReactNode {
  return (
    <div className={styles.tocColumn}>
      {parts.map((part) => (
        <div className={styles.part} key={part.title}>
          <h3 className={styles.partTitle}>
            {part.no && <span className={styles.partNo}>Kısım {part.no}</span>}
            <span>{part.title}</span>
          </h3>
          <ol className={styles.chapters}>
            {part.chapters.map((chapter) => (
              <li key={chapter.permalink}>
                <Link className={styles.row} to={chapter.permalink}>
                  <span className={styles.rowNo}>{chapter.no}</span>
                  <span className={styles.rowTitle}>{chapter.title}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.rowTime}>{chapter.minutes} dk</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default function Belge(): ReactNode {
  const {buildDate, book, posts, postCount, library, tools} = useHomepageData();
  const {withBaseUrl} = useBaseUrlUtils();
  const [left, right] = splitParts(book.parts);

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Kapak: teknik resim anteti gibi künye bloğu */}
        <header className={styles.sheet}>
          <figure className={styles.figure}>
            <YapayUfuk className={styles.dial} />
            <figcaption>
              <strong>Şekil 1.</strong> Yapay ufuk göstergesi; düz uçuş, 0° yatış, 0° yunuslama.
            </figcaption>
          </figure>

          <div className={styles.titleCell}>
            <span className={styles.cellLabel}>Başlık</span>
            <Heading as="h1" className={styles.title}>
              Aviyonik Yazılım
            </Heading>
            <p className={styles.lede}>
              Emniyet-kritik aviyonik yazılımı DO-178C ekseninde anlatan Türkçe bir kitap;
              protokoller, doğrulama ve sertifikasyon üzerine yazılar; tarayıcıda çalışan
              küçük araçlar.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} to={book.firstChapter.permalink}>
                Okumaya başla →
              </Link>
              <Link className={styles.textLink} to="#icindekiler">
                İçindekiler ↓
              </Link>
            </div>
          </div>

          <dl className={styles.fields}>
            <div>
              <dt>Kapsam</dt>
              <dd>DO-178C, doğrulama, sertifikasyon</dd>
            </div>
            <div>
              <dt>Dil</dt>
              <dd>Türkçe</dd>
            </div>
            <div>
              <dt>Yazar</dt>
              <dd>
                <Link to="/blog/authors/serdar">M. Serdar Karaman</Link>
              </dd>
            </div>
            <div>
              <dt>Lisans</dt>
              <dd>
                <Link href={LICENSE_URL}>CC BY-SA 4.0</Link>
              </dd>
            </div>
            <div>
              <dt>İçerik</dt>
              <dd>
                {book.chapterCount} bölüm, {book.appendixCount} ek · {postCount} yazı ·{' '}
                {library.pageCount} kütüphane sayfası
              </dd>
            </div>
            <div>
              <dt>Revizyon</dt>
              <dd>
                <time dateTime={buildDate}>{buildDate}</time>
              </dd>
            </div>
            <div>
              <dt>Kaynak</dt>
              <dd>
                <Link href={REPO_URL}>GitHub’da açık</Link>
              </dd>
            </div>
            <div>
              <dt>Notlar</dt>
              <dd className={styles.blank}>Bu alan bilerek boş bırakılmıştır.</dd>
            </div>
          </dl>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <Heading as="h2" id="icindekiler" className={styles.sectionTitle}>
              İçindekiler
            </Heading>
            <p className={styles.legend}>sağdaki sayı: tahmini okuma süresi</p>
          </div>
          <nav className={styles.toc} aria-label="Kitap içindekiler">
            <TocColumn parts={left} />
            <TocColumn parts={right} />
          </nav>
          <p className={styles.references}>
            <span className={styles.refLabel}>Kaynaklar</span>
            {book.references.map((ref) => (
              <Link key={ref.permalink} to={ref.permalink}>
                {ref.title}
              </Link>
            ))}
            <Link to={book.about.permalink}>Kitap hakkında</Link>
          </p>
        </section>

        <div className={styles.lower}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <Heading as="h2" id="blog" className={styles.sectionTitle}>
                Blog
              </Heading>
              <Link className={styles.headLink} to="/blog">
                Tüm yazılar ({postCount}) →
              </Link>
            </div>
            <ol className={styles.log}>
              {posts.map((post) => (
                <li key={post.permalink}>
                  <time className={styles.logDate} dateTime={post.date}>
                    {post.date}
                  </time>
                  <div>
                    <Link className={styles.logTitle} to={post.permalink}>
                      {post.title}
                    </Link>
                    <p className={styles.logMeta}>
                      {post.tags.slice(0, 3).join(' · ')} — {post.minutes} dk
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className={styles.side}>
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <Heading as="h2" id="kutuphane" className={styles.sectionTitle}>
                  Kütüphane
                </Heading>
                <Link className={styles.headLink} to="/kutuphane">
                  Tümü →
                </Link>
              </div>
              <p className={styles.sideText}>
                Alanda okumaya değer kitaplar ve standart aileleri; künye ve özgün tanıtımlarıyla.
              </p>
              <ul className={styles.covers}>
                {library.covers.map((cover) => (
                  <li key={cover.permalink}>
                    <Link to={cover.permalink} title={cover.title}>
                      <img
                        src={withBaseUrl(cover.image)}
                        alt={cover.title}
                        width={64}
                        height={96}
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className={styles.shelves}>
                {library.shelves.map((shelf) => (
                  <li key={shelf.permalink}>
                    <Link to={shelf.permalink}>{shelf.title}</Link>
                    <span>{shelf.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <Heading as="h2" id="araclar" className={styles.sectionTitle}>
                  Araçlar
                </Heading>
                <Link className={styles.headLink} to="/araclar">
                  Tümü →
                </Link>
              </div>
              <figure className={styles.vorFigure}>
                <VorSemasi />
                <figcaption>
                  <strong>Şekil 2.</strong> VOR istasyonu yakınından düz rotada geçiş; bearing,
                  en yakın noktada (d) en hızlı değişir.
                </figcaption>
              </figure>
              {tools.map((tool) => (
                <p className={styles.tool} key={tool.permalink}>
                  <Link to={tool.permalink}>{tool.title}</Link> — {tool.description}
                </p>
              ))}
            </section>
          </div>
        </div>

        <aside className={styles.note}>
          <span className={styles.noteLabel}>Not</span>
          <p>
            Metinde hata ya da eksik görürseniz her sayfanın altındaki “Bu sayfayı düzenle”
            bağlantısıyla <Link href={REPO_URL}>GitHub</Link> üzerinden düzeltme
            önerebilirsiniz. Kütüphaneye eklenmesini istediğiniz kitapları{' '}
            <Link href="mailto:serdar@karaman.dev?subject=Kitap%20onerisi">serdar@karaman.dev</Link>{' '}
            adresine yazabilirsiniz.
          </p>
        </aside>
      </div>
    </main>
  );
}
