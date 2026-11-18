import type {ReactNode} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

import useHomepageData from '@site/src/components/AnaSayfa/useHomepageData';

import styles from './styles.module.css';

/**
 * Öğrenilmiş dersler sayfalarının künyesi: olayın tarihi, hava aracı, yeri, sonucu ve dersin
 * konuları. Alanlar sayfaya ikinci kez yazılmaz; sayfanın frontmatter'ındaki
 * `sidebar_custom_props` alanından (plugins/homepage-data.ts doğrular) okunur. Giriş
 * sayfasındaki katalog ve ana sayfa da aynı veriyi gösterir.
 */
export default function OlayKunyesi(): ReactNode {
  const {metadata} = useDoc();
  const {lessons} = useHomepageData();
  const lesson = lessons.find((item) => item.permalink === metadata.permalink);
  if (!lesson) {
    throw new Error(`[OlayKunyesi] ${metadata.source} öğrenilmiş dersler listesinde yok.`);
  }

  const satirlar: [string, ReactNode][] = [
    ['Tarih', <time dateTime={lesson.date}>{lesson.dateText}</time>],
    ['Hava aracı', lesson.aircraft],
    ['Yer', lesson.place],
    ['Sonuç', lesson.outcome],
    [
      'Dersin konusu',
      <ul className={styles.konular}>
        {lesson.topics.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>,
    ],
  ];

  return (
    <section className={styles.kunye} aria-label="Olay künyesi">
      <dl className={styles.liste}>
        {satirlar.map(([etiket, deger]) => (
          <div key={etiket} className={styles.satir}>
            <dt>{etiket}</dt>
            <dd>{deger}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
