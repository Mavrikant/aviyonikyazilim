import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import useHomepageData from '@site/src/components/AnaSayfa/useHomepageData';

import styles from './styles.module.css';

/**
 * Öğrenilmiş dersler giriş sayfasındaki olay listesi. Liste elle yazılmaz:
 * plugins/homepage-data.ts `derslerSidebar`'dan üretir; tarih, hava aracı ve konular
 * olay sayfasının `sidebar_custom_props` alanından gelir. Sıra olay tarihidir.
 */
export default function DersKatalogu(): ReactNode {
  const {lessons} = useHomepageData();
  return (
    <ol className={styles.liste}>
      {lessons.map((lesson) => (
        <li key={lesson.permalink} className={styles.olay}>
          <time className={styles.yil} dateTime={lesson.date}>
            {lesson.date.slice(0, 4)}
          </time>
          <div>
            <Link to={lesson.permalink} className={styles.baslik}>
              {lesson.title}
            </Link>
            <p className={styles.arac}>{`${lesson.aircraft} · ${lesson.place}`}</p>
            <p className={styles.aciklama}>{lesson.description}</p>
            <ul className={styles.konular} aria-label="Dersin konusu">
              {lesson.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
