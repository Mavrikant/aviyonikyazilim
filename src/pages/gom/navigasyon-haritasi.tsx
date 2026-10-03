import {useEffect} from 'react';
import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import NavigasyonHaritasi from '@site/src/components/NavigasyonHaritasi';

/**
 * Başka sitelere <iframe> ile gömülen yalın harita sayfası: navbar/footer yok,
 * harita pencerenin tamamını kaplar. Arama motorlarına kapalıdır (noindex);
 * kanonik adres araç sayfasıdır. URL parametreleri bileşende okunur
 * (lat, lon, z, katman, secili, altlik); `tema=acik|koyu` burada uygulanır.
 */
export default function NavigasyonHaritasiGom(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  useEffect(() => {
    const tema = new URLSearchParams(window.location.search).get('tema');
    if (tema === 'acik' || tema === 'koyu') {
      document.documentElement.dataset.theme = tema === 'koyu' ? 'dark' : 'light';
    }
  }, []);

  return (
    <>
      <Head>
        <title>Türkiye Navigasyon Haritası | Aviyonik Yazılım</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${siteConfig.url}/araclar/navigasyon/turkiye-navigasyon-haritasi`} />
      </Head>
      <main>
        <NavigasyonHaritasi gomulu />
      </main>
    </>
  );
}
