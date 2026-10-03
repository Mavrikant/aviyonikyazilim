import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

import useHomepageData from '@site/src/components/AnaSayfa/useHomepageData';
import type {Tool} from '@site/plugins/homepage-data';
import AracSimgesi from './Simgeler';
import styles from './styles.module.css';

/** Kategori etiketinden ASCII çapa: "Navigasyon" → "navigasyon" */
function anchorOf(label: string): string {
  return label
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Araçlar giriş sayfasındaki katalog. Liste elle yazılmaz: plugins/homepage-data.ts
 * `araclarSidebar`'dan üretir; şema ve özellik etiketleri araç sayfasının
 * `sidebar_custom_props` alanından gelir.
 */
export default function AracKatalogu(): ReactNode {
  const {tools} = useHomepageData();
  const groups = new Map<string, Tool[]>();
  for (const tool of tools) {
    groups.set(tool.category, [...(groups.get(tool.category) ?? []), tool]);
  }

  return (
    <div className={styles.katalog}>
      {[...groups].map(([category, items]) => (
        <section key={category} className={styles.grup}>
          <Heading as="h2" id={anchorOf(category)} className={styles.grupBaslik}>
            {category}
            <span className={styles.sayi}>{items.length}</span>
          </Heading>
          <ul className={styles.liste}>
            {items.map((tool) => (
              <li key={tool.permalink} className={styles.arac}>
                <span className={styles.simge}>
                  <AracSimgesi ad={tool.icon} />
                </span>
                <div className={styles.govde}>
                  <Link to={tool.permalink} className={styles.baslik}>
                    {tool.title}
                  </Link>
                  <p className={styles.aciklama}>{tool.description}</p>
                  {tool.features.length > 0 && (
                    <ul className={styles.ozellikler} aria-label="Özellikler">
                      {tool.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link to={tool.permalink} className={styles.ac} aria-hidden="true" tabIndex={-1}>
                  Aç
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
