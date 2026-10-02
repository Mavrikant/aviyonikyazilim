import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import YapayUfuk from '@site/src/components/YapayUfuk';
import useHomepageData, {formatLongDate} from './useHomepageData';

import '@fontsource/ibm-plex-serif/400.css';
import '@fontsource/ibm-plex-serif/400-italic.css';
import '@fontsource/ibm-plex-serif/500.css';
import '@fontsource/ibm-plex-serif/600.css';
import styles from './Kitap.module.css';

const REPO_URL = 'https://github.com/Mavrikant/aviyonikyazilim';
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.tr';

export default function Kitap(): ReactNode {
  const {buildDate, book, posts, postCount, library, tools} = useHomepageData();

  return (
    <main className={styles.page}>
      <header className={styles.titlePage}>
        <YapayUfuk className={styles.emblem} />
        <p className={styles.overline}>Aviyonik Yazılım</p>
        <Heading as="h1" className={styles.title}>
          DO-178C ile Emniyet-Kritik Aviyonik Yazılım
        </Heading>
        <p className={styles.author}>M. Serdar Karaman</p>

        <blockquote className={styles.epigraph}>
          <p>Geç gelen doğru yanıt çoğu zaman yanlış yanıttır.</p>
          <footer>
            — <Link to="/blog/gercek-zamanli-sistemler">Gerçek Zamanlı Sistemler: Hız Değil, Garanti</Link>
          </footer>
        </blockquote>

        <p className={styles.start}>
          <Link className={styles.startLink} to={book.firstChapter.permalink}>
            Birinci bölümden başlayın →
          </Link>
          <Link to="#icindekiler">İçindekiler</Link>
          <Link to={book.about.permalink}>Kitap hakkında</Link>
        </p>

        <p className={styles.imprint}>
          aviyonikyazilim.com · Türkçe · CC BY-SA 4.0 ·{' '}
          <span className={styles.nowrap}>Rev. {buildDate}</span>
        </p>
      </header>

      <section className={styles.section}>
        <Heading as="h2" id="icindekiler" className={styles.sectionTitle}>
          İçindekiler
        </Heading>
        <nav aria-label="Kitap içindekiler">
          {book.parts.map((part) => (
            <div className={styles.part} key={part.title}>
              <h3 className={styles.partTitle}>
                <span className={styles.roman}>{part.no || '—'}</span>
                <span>{part.title}</span>
              </h3>
              <ol className={styles.chapters}>
                {part.chapters.map((chapter) => (
                  <li key={chapter.permalink}>
                    <Link className={styles.row} to={chapter.permalink}>
                      <span className={styles.num}>{chapter.no}</span>
                      <span className={styles.rowTitle}>{chapter.title}</span>
                      <span className={styles.time}>{chapter.minutes} dk</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
        <p className={styles.refs}>
          Başvuru için:{' '}
          {book.references.map((ref, i) => (
            <span key={ref.permalink}>
              {i > 0 && ', '}
              <Link to={ref.permalink}>{ref.title}</Link>
            </span>
          ))}
          .
        </p>
      </section>

      <section className={styles.section}>
        <Heading as="h2" id="yazilar" className={styles.sectionTitle}>
          Yazılar
        </Heading>
        <ol className={styles.posts}>
          {posts.map((post) => (
            <li key={post.permalink}>
              <time dateTime={post.date}>{formatLongDate(post.date)}</time>
              <Link to={post.permalink}>{post.title}</Link>
            </li>
          ))}
        </ol>
        <p className={styles.more}>
          <Link to="/blog">Bütün yazılar ({postCount})</Link>
        </p>
      </section>

      <section className={styles.section}>
        <Heading as="h2" id="ayrica" className={styles.sectionTitle}>
          Ayrıca
        </Heading>
        <p className={styles.prose}>
          <Link to="/kutuphane">Kütüphane</Link>, alanda okumaya değer {library.pageCount} kitap ve
          standart ailesini {library.shelves.length} rafta toplar:{' '}
          {library.shelves.map((shelf, i) => (
            <span key={shelf.permalink}>
              {i > 0 && (i === library.shelves.length - 1 ? ' ve ' : ', ')}
              <Link to={shelf.permalink}>{shelf.title}</Link>
            </span>
          ))}
          . <Link to="/araclar">Araçlar</Link> bölümünde ise kavramları tarayıcıda denemek için
          simülatörler bulunur:{' '}
          {tools.map((tool, i) => (
            <span key={tool.permalink}>
              {i > 0 && ', '}
              <Link to={tool.permalink}>{tool.title}</Link>
            </span>
          ))}
          .
        </p>
      </section>

      <footer className={styles.colophon}>
        <h2 className={styles.colophonTitle}>Kolofon</h2>
        <p>
          Bu site IBM Plex Serif, IBM Plex Sans ve IBM Plex Mono ile dizilmiş; Docusaurus ile
          üretilip GitHub Pages üzerinde yayımlanmaktadır. Metinler{' '}
          <Link href={LICENSE_URL}>CC BY-SA 4.0</Link> lisanslıdır. Bir hata görürseniz{' '}
          <Link href={REPO_URL}>GitHub</Link> üzerinden düzeltme önerebilir, kitap önerilerinizi{' '}
          <Link href="mailto:serdar@karaman.dev?subject=Kitap%20onerisi">serdar@karaman.dev</Link>{' '}
          adresine yazabilirsiniz.
        </p>
      </footer>
    </main>
  );
}
