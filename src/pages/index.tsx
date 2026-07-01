import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description={siteConfig.tagline}>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <Heading as="h1" className="hero__title">
            Aviyonik Yazılım / Test / Sertifikasyon
          </Heading>
          <p className="hero__subtitle">
            Aviyonik dünyasının kalbinde, yazılım, test ve sertifikasyon süreçleri
            yatmaktadır. Bu site, havacılık teknolojisindeki gelişmeleri, yazılım
            inovasyonlarını ve sertifikasyon standartlarını derinlemesine inceler.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--secondary button--lg" to="/kitap">
              📖 Kitaba Başla
            </Link>
            <Link className="button button--secondary button--lg" to="/blog">
              📝 Blog Yazıları
            </Link>
          </div>
        </div>
      </header>
    </Layout>
  );
}
