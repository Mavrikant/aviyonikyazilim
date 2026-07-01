import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const highlights = [
  {
    title: 'Türkçe ve özgün içerik',
    description:
      'DO-178C, test ve sertifikasyon konularını kendi cümlelerimizle, anlaşılır ve doğrudan uygulanabilir biçimde anlatır.',
  },
  {
    title: 'Açık kaynak yaklaşımı',
    description:
      'İçerik, iyileştirme önerilerine ve topluluk katkısına açık bir başucu kitabı olarak gelişir.',
  },
  {
    title: 'Mühendislik odağı',
    description:
      'Konu başlıkları teoride kalmaz; proje planlama, doğrulama, konfigürasyon ve araç kalifikasyonu ile ilişkilendirilir.',
  },
];

const startingPoints = [
  {
    label: 'Kitabın giriş bölümü',
    href: '/kitap',
    title: 'Doğrudan yol haritası',
    description:
      'Kitabın kapsamını, hedefini ve bölümler arasındaki akışı tek sayfada görün.',
  },
  {
    label: 'Başlangıç bölümü',
    href: '/kitap',
    title: 'Konuyu çerçeveleyin',
    description:
      'Emniyet-kritik yazılımın kapsamını ve kitabın ana yapısını doğrudan görün.',
  },
  {
    label: 'Blog yazıları',
    href: '/blog',
    title: 'Derinleşen notlar',
    description:
      'Aviyonik protokoller, yapısal kapsam ve sertifikasyon odaklı teknik yazılar.',
  },
];

const contributorSteps = [
  'İçeriği okuyun, eksik veya belirsiz gördüğünüz noktaları işaretleyin.',
  'GitHub üzerinden düzeltme, ek açıklama veya yeni örnek önerisi gönderin.',
  'Güncellenen metin daha anlaşılır, daha tutarlı ve daha güvenilir hale gelsin.',
];

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} | Açık kaynak başucu kitabı`}
      description="Aviyonik yazılım, test ve sertifikasyon için Türkçe, açık kaynak ve topluluk destekli başucu kitabı."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div className={styles.heroCopy}>
                <p className={styles.kicker}>Açık kaynak · Türkçe · Topluluk odaklı</p>
                <Heading as="h1" className={styles.heroTitle}>
                  Aviyonik yazılım için profesyonel bir başucu kitabı
                </Heading>
                <p className={styles.heroSubtitle}>
                  Bu site, aviyonik yazılım, test ve sertifikasyon dünyasında çalışan
                  herkes için özgün, düzenli ve katkıya açık bir referans alanı
                  oluşturmayı amaçlar.
                </p>

                <div className={styles.actions}>
                  <Link className="button button--primary button--lg" to="/kitap">
                    Kitaba Başla
                  </Link>
                  <Link className="button button--secondary button--lg" to="/blog">
                    Blog Yazılarını Gör
                  </Link>
                  <Link
                    className="button button--secondary button--lg"
                    href="https://github.com/Mavrikant/aviyonikyazilim"
                  >
                    GitHub'da İncele
                  </Link>
                </div>

                <dl className={styles.metrics}>
                  <div>
                    <dt>Odak</dt>
                    <dd>DO-178C ve emniyet-kritik geliştirme</dd>
                  </div>
                  <div>
                    <dt>İçerik biçimi</dt>
                    <dd>Kitap, blog ve başvuru sayfaları</dd>
                  </div>
                  <div>
                    <dt>Katkı modeli</dt>
                    <dd>Açık, izlenebilir ve topluluk destekli</dd>
                  </div>
                </dl>
              </div>

              <aside className={styles.heroPanel} aria-label="Özet bilgi paneli">
                <div className={styles.panelCard}>
                  <span className={styles.panelLabel}>Bu sitenin amacı</span>
                  <p className={styles.panelText}>
                    Aviyonik yazılım konusunu yalnızca belge başlıklarıyla değil,
                    mühendislik kararlarıyla birlikte ele alan bir başvuru noktası
                    oluşturmak.
                  </p>
                </div>
                <div className={styles.panelList}>
                  <div>
                    <span>Kitap</span>
                    <strong>Yapılandırılmış öğrenme yolu</strong>
                  </div>
                  <div>
                    <span>Blog</span>
                    <strong>Kısa ve teknik derinlik</strong>
                  </div>
                  <div>
                    <span>Kaynaklar</span>
                    <strong>Terimler ve referanslar</strong>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Heading as="h2" className={styles.sectionTitle}>
              Neden bu proje?
            </Heading>
            <p className={styles.sectionLead}>
              İçerik, profesyonel bir teknik kaynakta beklenen netlik ile topluluk
              katkısına açık bir açık kaynak projesinin esnekliğini bir araya getirir.
            </p>

            <div className={styles.cardGrid}>
              {highlights.map((item) => (
                <article className={styles.card} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionMuted)}>
          <div className="container">
            <Heading as="h2" className={styles.sectionTitle}>
              Nereden başlamalı?
            </Heading>
            <p className={styles.sectionLead}>
              Aşağıdaki giriş noktaları, konuyu hızlıca taramak isteyenler için
              pratik bir başlangıç sunar.
            </p>

            <div className={styles.linkGrid}>
              {startingPoints.map((item) => (
                <Link className={styles.linkCard} key={item.title} to={item.href}>
                  <span className={styles.linkLabel}>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.splitLayout}>
              <div>
                <Heading as="h2" className={styles.sectionTitle}>
                  Nasıl katkı verilir?
                </Heading>
                <p className={styles.sectionLead}>
                  Proje, okuyan kişinin sadece tüketici değil, iyileştirici olmasını
                  hedefler. Küçük düzeltmeler bile içeriği güçlendirir.
                </p>
              </div>

              <ol className={styles.stepList}>
                {contributorSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <div>
                <p className={styles.kicker}>Birlikte geliştirelim</p>
                <Heading as="h2" className={styles.ctaTitle}>
                  Türkçe, açık ve güvenilir bir aviyonik referans kaynağı oluşturalım.
                </Heading>
              </div>
              <Link
                className="button button--primary button--lg"
                href="https://github.com/Mavrikant/aviyonikyazilim"
              >
                Katkı Sürecini Gör
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
