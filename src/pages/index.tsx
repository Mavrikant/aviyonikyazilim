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
    label: 'Kitabın tamamı',
    href: '/kitap',
    title: 'Doğrudan yol haritası',
    description:
      'Kapsamı, hedefi ve bölüm akışını tek bir giriş sayfasında görün.',
  },
  {
    label: 'Başlangıç bölümü',
    href: '/kitap/giris/giris-ve-genel-bakis',
    title: 'Konuyu çerçeveleyin',
    description:
      'Yeni başlıyorsanız önce kavramsal çerçeveyi burada kurun.',
  },
  {
    label: 'Blog yazıları',
    href: '/blog',
    title: 'Derinleşen notlar',
    description:
      'Aviyonik protokoller, yapısal kapsam ve sertifikasyon odaklı teknik yazılar.',
  },
];

const quickRoutes = [
  {
    label: 'Yeniyseniz',
    title: 'Giriş sayfasından başlayın',
    description: 'Önce giriş sayfasını, sonra sistem bağlamı ve planlama bölümlerini okuyun.',
    href: '/kitap/giris/giris-ve-genel-bakis',
  },
  {
    label: 'Belirli bir konu arıyorsanız',
    title: 'Doğrudan bölüme geçin',
    description: 'Doğrudan ilgili bölüme geçin; her bölüm tek başına da okunabilecek şekilde düzenlenir.',
    href: '/kitap',
  },
  {
    label: 'Kısa teknik not istiyorsanız',
    title: 'Blog yazılarını açın',
    description: 'Blog yazıları, kitapta açılan başlıkların pratik tarafını öne çıkarır.',
    href: '/blog',
  },
];

const recentPosts = [
  {
    label: 'Yeni yazı',
    title: 'Yapısal kapsam analizi',
    description: 'SCA türlerini, MC/DC farkını ve test kanıtı bağlamını özetleyen teknik giriş.',
    href: '/blog/yapisal-kapsam-analizi',
  },
  {
    label: 'Önerilen okuma',
    title: 'SCA’da cover edilemeyen kodlar',
    description: 'Ölü, gereksiz ve devre dışı bırakılmış kodun sertifikasyon açısından anlamı.',
    href: '/blog/sca-cover-edilemeyen-kodlar',
  },
  {
    label: 'Klasik konu',
    title: 'ARINC 429',
    description: 'Aviyonik veri iletişiminde sık karşılaşılan bir protokole kısa bakış.',
    href: '/blog/arinc-429',
  },
];

const contributorSteps = [
  'İçeriği okuyun, eksik veya belirsiz gördüğünüz noktaları işaretleyin.',
  'GitHub üzerinden düzeltme, ek açıklama veya yeni örnek önerisi gönderin.',
  'Güncellenen metin daha anlaşılır, daha tutarlı ve daha güvenilir hale gelsin.',
];

/** Hero'daki büyük yapay ufuk göstergesi (dekoratif). */
function HeroDial() {
  return (
    <div className={styles.heroDial} aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="heroDialClip">
            <circle cx="100" cy="100" r="82" />
          </clipPath>
          <linearGradient id="heroSky" x1="100" y1="18" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0E2A47" />
            <stop offset="1" stopColor="#1D5288" />
          </linearGradient>
          <linearGradient id="heroGround" x1="100" y1="100" x2="100" y2="182" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D89A3D" />
            <stop offset="1" stopColor="#8F5D1E" />
          </linearGradient>
        </defs>

        {/* Kadran */}
        <g clipPath="url(#heroDialClip)">
          <rect width="200" height="200" fill="url(#heroSky)" />
          <path d="M6 114.2 L194 87.8 L194 194 L6 194 Z" fill="url(#heroGround)" />
          <path d="M6 114.2 L194 87.8" stroke="#F4F8FC" strokeWidth="3" strokeLinecap="round" />
          {/* Yunuslama merdiveni */}
          <path d="M74 76.5 L126 69.2" stroke="#F4F8FC" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
          <path d="M83 57.7 L117 52.9" stroke="#F4F8FC" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
          <path d="M88 40.1 L112 36.7" stroke="#F4F8FC" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
          <path d="M74 139.4 L126 132.1" stroke="#F9EFD9" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
          <path d="M83 158.9 L117 154.1" stroke="#F9EFD9" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Yatış açısı tikleri */}
        <g stroke="#8FB4D9" strokeWidth="2" strokeLinecap="round" opacity="0.7">
          <path d="M100 10 L100 20" />
          <path d="M55 22 L59.5 30.7" />
          <path d="M145 22 L140.5 30.7" />
          <path d="M22 55 L30.7 59.5" />
          <path d="M178 55 L169.3 59.5" />
        </g>

        {/* Uçak sembolü */}
        <path d="M38 108 L76 108 L85 119" stroke="#FFC65C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M162 108 L124 108 L115 119" stroke="#FFC65C" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="108" r="6" fill="#FFC65C" />

        {/* Çerçeve */}
        <circle cx="100" cy="100" r="82" stroke="#0B1D33" strokeWidth="8" />
        <circle cx="100" cy="100" r="90" stroke="#24619F" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx="100" cy="100" r="97" stroke="#24619F" strokeOpacity="0.2" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

type SectionHeadProps = {
  index: string;
  title: string;
  lead: string;
};

function SectionHead({index, title, lead}: SectionHeadProps) {
  return (
    <>
      <div className={styles.sectionHead}>
        <span className={styles.sectionIndex}>{index}</span>
        <Heading as="h2" className={styles.sectionTitle}>
          {title}
        </Heading>
      </div>
      <p className={styles.sectionLead}>{lead}</p>
    </>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} | Açık kaynak başucu kitabı`}
      description="Aviyonik yazılım, test ve sertifikasyon için Türkçe, açık kaynak ve topluluk destekli başucu kitabı."
    >
      <main>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroInner}>
              <div>
                <p className={styles.kicker}>Açık kaynak · Türkçe · DO-178C</p>
                <Heading as="h1" className={styles.heroTitle}>
                  Emniyet-kritik aviyonik yazılım için{' '}
                  <span className={styles.heroTitleAccent}>başucu kitabı</span>
                </Heading>
                <p className={styles.heroSubtitle}>
                  Aviyonik yazılım, test ve sertifikasyon dünyasında çalışan herkes
                  için özgün, düzenli ve katkıya açık bir Türkçe referans:
                  gereksinimden yapısal kapsama, araç kalifikasyonundan SOI
                  denetimlerine.
                </p>

                <div className={styles.actions}>
                  <Link
                    className={clsx('button button--lg', styles.actionPrimary)}
                    to="/kitap"
                  >
                    Kitaba Başla
                  </Link>
                  <Link
                    className={clsx('button button--lg', styles.actionGhost)}
                    to="/blog"
                  >
                    Blog Yazıları
                  </Link>
                  <Link
                    className={clsx('button button--lg', styles.actionGhost)}
                    href="https://github.com/Mavrikant/aviyonikyazilim"
                  >
                    GitHub
                  </Link>
                </div>

                <dl className={styles.metrics}>
                  <div>
                    <dt>Odak</dt>
                    <dd>DO-178C ve emniyet-kritik geliştirme</dd>
                  </div>
                  <div>
                    <dt>İçerik</dt>
                    <dd>26 bölümlük kitap, blog ve başvuru sayfaları</dd>
                  </div>
                  <div>
                    <dt>Katkı modeli</dt>
                    <dd>Açık, izlenebilir ve topluluk destekli</dd>
                  </div>
                </dl>
              </div>

              <HeroDial />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <SectionHead
              index="01"
              title="Neden bu proje?"
              lead="İçerik, profesyonel bir teknik kaynakta beklenen netlik ile topluluk katkısına açık bir açık kaynak projesinin esnekliğini bir araya getirir."
            />
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
            <SectionHead
              index="02"
              title="Nereden başlamalı?"
              lead="Aşağıdaki giriş noktaları, konuyu hızlıca taramak isteyenler için pratik bir başlangıç sunar."
            />
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
            <SectionHead
              index="03"
              title="İlk 5 dakikada nasıl kullanmalı?"
              lead="Siteyi hızlı taramak isteyenler için, amaca göre seçilmiş kısa rotalar."
            />
            <div className={styles.linkGrid}>
              {quickRoutes.map((route) => (
                <Link className={styles.linkCard} key={route.title} to={route.href}>
                  <span className={styles.linkLabel}>{route.label}</span>
                  <h3>{route.title}</h3>
                  <p>{route.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionMuted)}>
          <div className="container">
            <SectionHead
              index="04"
              title="Son blog yazıları"
              lead="Kısa teknik notlar, kitapta ele alınan konuların pratik ve daraltılmış karşılıklarını sunar."
            />
            <div className={styles.linkGrid}>
              {recentPosts.map((post) => (
                <Link className={styles.linkCard} key={post.title} to={post.href}>
                  <span className={styles.linkLabel}>{post.label}</span>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.splitLayout}>
              <div>
                <SectionHead
                  index="05"
                  title="Nasıl katkı verilir?"
                  lead="Proje, okuyan kişinin sadece tüketici değil, iyileştirici olmasını hedefler. Küçük düzeltmeler bile içeriği güçlendirir."
                />
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
                <p className={styles.ctaKicker}>Birlikte geliştirelim</p>
                <Heading as="h2" className={styles.ctaTitle}>
                  Türkçe, açık ve güvenilir bir aviyonik referans kaynağı
                  oluşturalım.
                </Heading>
              </div>
              <Link
                className={clsx('button button--lg', styles.actionPrimary)}
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
