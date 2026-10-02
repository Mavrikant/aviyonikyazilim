import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import GostergePaneli from '@site/src/components/GostergePaneli';
import useHomepageData, {
  formatLongDate,
  splitParts,
  type Part,
} from '@site/src/components/AnaSayfa/useHomepageData';

import styles from './index.module.css';

const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';
const ISSUES_URL = `${REPO_URL}/issues`;
const NEW_ISSUE_URL = `${REPO_URL}/issues/new/choose`;
const GUIDE_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const EMAIL = 'serdar@karaman.dev';
const FIX_MAIL = `mailto:${EMAIL}?subject=Duzeltme%20onerisi`;
const BOOK_MAIL = `mailto:${EMAIL}?subject=Kitap%20onerisi`;
const TOOL_MAIL = `mailto:${EMAIL}?subject=Arac%20onerisi`;

/* Katkı kontrol listesi: havacılık kontrol listelerindeki "durum ..... eylem" düzeni */
const checklist: {challenge: string; detail: string; response: string; href?: string}[] = [
  {
    challenge: 'Yazım hatası ya da yanlış bilgi',
    detail: 'İlgili kitap ya da blog sayfasının en altındaki “Bu sayfayı düzenle” bağlantısını kullanın.',
    response: 'Sayfanın altından düzenle',
  },
  {
    challenge: 'Eksik ya da belirsiz bir konu',
    detail: 'GitHub’da yeni bir konu (issue) açın; ne eksik ya da nerede kafa karıştırıyor, kısa bir not yeterli.',
    response: 'Konu aç',
    href: NEW_ISSUE_URL,
  },
  {
    challenge: 'Örnek, C kodu ya da diyagram',
    detail: 'GitHub’da değişiklik önerisi (pull request) açın; diyagramlar Mermaid ile metin olarak yazılır.',
    response: 'Değişiklik öner',
    href: GUIDE_URL,
  },
  {
    challenge: 'Okunmaya değer bir kitap',
    detail: `Kütüphane önerileri e-postayla alınır: ${EMAIL}`,
    response: 'Kitap öner',
    href: BOOK_MAIL,
  },
  {
    challenge: 'Simülatör ya da araç fikri',
    detail: `Tarayıcıda denenebilecek her kavram aday; öneriler: ${EMAIL}`,
    response: 'Fikir öner',
    href: TOOL_MAIL,
  },
];

const steps = [
  'Düzeltmek istediğiniz kitap ya da blog sayfasını açın; en alttaki “Bu sayfayı düzenle” bağlantısına tıklayın.',
  'Değişikliği GitHub’ın web düzenleyicisinde yapıp kısa bir açıklamayla önerin.',
  'Öneriniz gözden geçirilir; uygunsa siteye alınır.',
  'Birkaç dakika içinde sitede yayında.',
];

/* VOR istasyonu yakınından düz rotada geçiş (çizgisel şema) */
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
      <path
        className={styles.vorAircraft}
        d={`M170 ${TRACK_Y - 5} L184 ${TRACK_Y} L170 ${TRACK_Y + 5} L173 ${TRACK_Y} Z`}
      />
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
      <circle className={styles.vorMark} cx={VOR.x} cy={VOR.y} r="1.6" />
      {/* En yakın geçiş mesafesi d */}
      <path className={styles.vorDim} d={`M${VOR.x} ${TRACK_Y + 3} V${VOR.y - 9}`} />
      <path
        className={styles.vorMark}
        d={`M${VOR.x - 2.5} ${TRACK_Y + 7} L${VOR.x} ${TRACK_Y + 2} L${VOR.x + 2.5} ${TRACK_Y + 7} Z`}
      />
      <text className={styles.vorLabel} x={VOR.x + 5} y={TRACK_Y + 18}>
        d
      </text>
      <text className={styles.vorLabel} x={VOR.x} y={142} textAnchor="middle">
        VOR
      </text>
      <text className={styles.vorLabel} x="8" y={TRACK_Y - 8}>
        rota
      </text>
    </svg>
  );
}

/** Bağlantı sonundaki ok; ekran okuyucu "sağ ok" diye okumasın. */
function Arrow(): ReactNode {
  return <span aria-hidden="true">→</span>;
}

/** Görselde "9 dk", ekran okuyucuda "9 dakika okuma". */
function ReadingTime({minutes}: {minutes: number}): ReactNode {
  return (
    <>
      <span aria-hidden="true">{minutes} dk</span>
      <span className={styles.srOnly}>{minutes} dakika okuma</span>
    </>
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
                  <span className={styles.rowTime}>
                    <ReadingTime minutes={chapter.minutes} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default function Home(): ReactNode {
  const {buildDate, book, posts, postCount, library, tools} = useHomepageData();
  const {withBaseUrl} = useBaseUrlUtils();
  const [left, right] = splitParts(book.parts);

  return (
    <Layout
      title="Aviyonik yazılımın Türkçe kitabı"
      description="DO-178C ekseninde emniyet-kritik aviyonik yazılım: açık kaynak ve katkıya açık Türkçe bir kitap, teknik yazılar ve tarayıcıda çalışan araçlar.">
      <main className={styles.page}>
        {/* ---------- Hero: başlık + canlı gösterge paneli ---------- */}
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroInner)}>
            <div>
              <p className={styles.kicker}>Açık kaynak · Türkçe · DO-178C</p>
              <Heading as="h1" className={styles.heroTitle}>
                Aviyonik yazılımın Türkçe kitabını birlikte yazıyoruz.
              </Heading>
              <p className={styles.heroLede}>
                Emniyet-kritik yazılım geliştirme, doğrulama ve sertifikasyon üzerine{' '}
                {book.chapterCount} bölümlük bir kitap, teknik yazılar ve tarayıcıda çalışan
                araçlar. Her sayfası açık: bir yazım hatasını düzeltmek de, yeni bir bölüm yazmak
                da katkıdır.
              </p>
              <div className={styles.heroActions}>
                <Link className={styles.btnPrimary} to={book.firstChapter.permalink}>
                  Okumaya başla
                </Link>
                <Link className={styles.btnOutline} to="#katki">
                  Katkıda bulun
                </Link>
              </div>
              <ul className={styles.stats}>
                <li>
                  <Link to="#icindekiler">
                    <b>{book.chapterCount}</b> bölüm, <b>{book.appendixCount}</b> ek
                  </Link>
                </li>
                <li>
                  <Link to="/blog">
                    <b>{postCount}</b> yazı
                  </Link>
                </li>
                <li>
                  <Link to="/kutuphane">
                    <b>{library.pageCount}</b> kütüphane sayfası
                  </Link>
                </li>
                <li>
                  <Link to="/araclar">
                    <b>{tools.length}</b> simülatör
                  </Link>
                </li>
              </ul>
            </div>

            <figure className={styles.heroFigure}>
              <GostergePaneli />
              <figcaption>
                Canlı: hafif S dönüşleri yapan bir uçağın birincil uçuş ekranı (primary flight
                display, PFD). Değerler bir göz kırpma:{' '}
                <span className={styles.nowrap}>hız 178 knot (DO-178C)</span>,{' '}
                <span className={styles.nowrap}>irtifa 4754 ft (ARP4754A)</span>,{' '}
                <span className={styles.nowrap}>yön 330° (DO-330)</span>.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---------- Katkı daveti ---------- */}
        <section className={styles.contribute}>
          <div className={clsx('container', styles.contributeInner)}>
            <div>
              <Heading as="h2" id="katki" className={styles.contributeTitle}>
                Kokpitte boş koltuk var.
              </Heading>
              <p className={styles.contributeLede}>
                Bu kitap tek pilotla uçmuyor. Sahada DO-178C ile çalışan, test yazan, denetime
                giren herkesin deneyimi metni daha doğru ve daha kullanışlı yapar. Katkı için Git
                bilmeniz gerekmez; ücretsiz bir GitHub hesabı ve tarayıcınız yeterli.
              </p>
              <ol className={styles.steps}>
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className={styles.altPath}>
                GitHub kullanmıyor musunuz? Düzeltme ve önerilerinizi{' '}
                <Link href={FIX_MAIL}>{EMAIL}</Link> adresine e-postayla gönderebilirsiniz.
              </p>
              <div className={styles.contributeActions}>
                <Link className={styles.btnDark} href={GUIDE_URL}>
                  Katkı rehberi
                </Link>
                <Link className={styles.textLink} href={ISSUES_URL}>
                  GitHub’daki açık konular (issues) <Arrow />
                </Link>
              </div>
            </div>

            <div className={styles.qrh}>
              <h3 className={styles.qrhHead}>
                <span>Katkı</span> <span>Kontrol listesi</span>
              </h3>
              <ol className={styles.qrhItems}>
                {checklist.map((item) => (
                  <li key={item.challenge}>
                    <div className={styles.qrhLine}>
                      <span className={styles.qrhChallenge}>{item.challenge}</span>
                      <span className={styles.qrhDots} aria-hidden="true" />
                      {item.href ? (
                        <Link className={styles.qrhResponse} href={item.href}>
                          {item.response}
                        </Link>
                      ) : (
                        <span className={styles.qrhResponse}>{item.response}</span>
                      )}
                    </div>
                    <p className={styles.qrhDetail}>{item.detail}</p>
                  </li>
                ))}
              </ol>
              <p className={styles.qrhEnd}>Kontrol listesi tamam</p>
              <p className={styles.qrhNote}>
                Terminoloji sözlüğü ve yazım ilkeleri: <Link href={GUIDE_URL}>katkı rehberi</Link>
              </p>
            </div>
          </div>
        </section>

        <div className="container">
          {/* ---------- İçindekiler ---------- */}
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

          {/* ---------- Blog | Kütüphane + Araçlar ---------- */}
          <div className={styles.lower}>
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <Heading as="h2" id="blog" className={styles.sectionTitle}>
                  Blog
                </Heading>
                <Link className={styles.headLink} to="/blog">
                  Tüm yazılar ({postCount}) <Arrow />
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
                        {post.tags.slice(0, 3).join(' · ')} — <ReadingTime minutes={post.minutes} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <div>
              <section className={styles.section}>
                <div className={styles.sectionHead}>
                  <Heading as="h2" id="kutuphane" className={styles.sectionTitle}>
                    Kütüphane
                  </Heading>
                  <Link className={styles.headLink} to="/kutuphane">
                    Tüm kitaplar <Arrow />
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
                    Tüm araçlar <Arrow />
                  </Link>
                </div>
                <figure className={styles.vorFigure}>
                  <VorSemasi />
                  <figcaption>
                    VOR istasyonu yakınından düz rotada geçiş: yön açısı (bearing), en yakın
                    noktada (d) en hızlı değişir.
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
        </div>

        {/* ---------- Kapanış: kısa katkı hatırlatması ---------- */}
        <section className={styles.closing}>
          <div className={clsx('container', styles.closingInner)}>
            <div>
              <p className={styles.closingTitle}>Bir sonraki bölümü siz yazabilirsiniz.</p>
              <p className={styles.closingText}>
                Düzeltme, örnek, diyagram ya da yepyeni bir başlık: her katkı kitabı biraz daha
                iyi yapar. Son güncelleme:{' '}
                <time dateTime={buildDate}>{formatLongDate(buildDate)}</time>.
              </p>
            </div>
            <div className={styles.closingActions}>
              <Link className={styles.btnPrimary} href={REPO_URL}>
                GitHub’da katkıda bulun
              </Link>
              <Link className={styles.btnOutline} to="#katki">
                Nasıl katkıda bulunurum?
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
