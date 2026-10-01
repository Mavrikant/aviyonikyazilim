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

/*
 * Hero'daki yapay ufuk göstergesi (attitude indicator) — klasik analog
 * göstergenin işaretlemeleri: düz uçuş (0° yatış, 0° yunuslama).
 * Merkez (100, 100); yunuslama ölçeği 2,5 birim/derece.
 */
const PITCH_SCALE = 2.5;
// Yunuslama merdiveni: 5° ve 15° kısa, 10° ve 20° uzun ve numaralı.
const pitchRungs = [5, 10, 15, 20].flatMap((deg) => [deg, -deg]);
// Yatış skalası: 10° ve 20° kısa, 30° ve 60° uzun çizgi; 45° üçgen.
const bankTicks = [
  {angle: 10, inner: 72.5, width: 1.8},
  {angle: 20, inner: 72.5, width: 1.8},
  {angle: 30, inner: 67.5, width: 2.8},
  {angle: 60, inner: 67.5, width: 2.8},
].flatMap((tick) => [tick, {...tick, angle: -tick.angle}]);
// Çerçeve vidaları: 45° köşegenlerde, vida yarıklarının açıları farklı.
const bezelScrews = [
  {x: 35.12, y: 35.12, slot: 20},
  {x: 164.88, y: 35.12, slot: -25},
  {x: 164.88, y: 164.88, slot: 65},
  {x: 35.12, y: 164.88, slot: 5},
];

function HeroDial() {
  return (
    <div className={styles.heroDial} aria-hidden="true">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="aiFace">
            <circle cx="100" cy="100" r="82" />
          </clipPath>
          <clipPath id="aiCard">
            <circle cx="100" cy="100" r="66" />
          </clipPath>
          <linearGradient id="aiBezel" x1="100" y1="2" x2="100" y2="198" gradientUnits="userSpaceOnUse">
            <stop stopColor="#454B54" />
            <stop offset="0.5" stopColor="#262A30" />
            <stop offset="1" stopColor="#121417" />
          </linearGradient>
          <linearGradient id="aiLip" x1="100" y1="14" x2="100" y2="186" gradientUnits="userSpaceOnUse">
            <stop stopColor="#07090B" />
            <stop offset="1" stopColor="#30363E" />
          </linearGradient>
          <linearGradient id="aiSky" x1="100" y1="34" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2A7BCF" />
            <stop offset="1" stopColor="#3D93E2" />
          </linearGradient>
          <linearGradient id="aiGround" x1="100" y1="100" x2="100" y2="166" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93602F" />
            <stop offset="1" stopColor="#6A421F" />
          </linearGradient>
          <linearGradient id="aiBar" x1="0" y1="98" x2="0" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD978" />
            <stop offset="1" stopColor="#E9A832" />
          </linearGradient>
          <radialGradient id="aiScrew" cx="0.38" cy="0.32" r="0.8">
            <stop stopColor="#6A717B" />
            <stop offset="1" stopColor="#1A1D21" />
          </radialGradient>
          <radialGradient id="aiVignette" cx="100" cy="100" r="82" gradientUnits="userSpaceOnUse">
            <stop offset="0.82" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.45" />
          </radialGradient>
          <linearGradient id="aiGlare" x1="100" y1="18" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="aiShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.3" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Gösterge gövdesi: çerçeve (bezel), iç dudak ve vidalar */}
        <circle cx="100" cy="100" r="98" fill="url(#aiBezel)" />
        <circle cx="100" cy="100" r="97.2" stroke="#fff" strokeOpacity="0.1" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="85.5" fill="url(#aiLip)" />
        {bezelScrews.map(({x, y, slot}) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${slot})`}>
            <circle r="4.2" fill="url(#aiScrew)" stroke="#0A0B0D" strokeWidth="0.8" />
            <path d="M-2.6 0 H2.6 M0 -2.6 V2.6" stroke="#0A0B0D" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        ))}

        <g clipPath="url(#aiFace)">
          {/* Yatış halkası: üst yarı gökyüzü, alt yarı yer */}
          <rect width="200" height="100" fill="#1B5AA6" />
          <rect y="100" width="200" height="100" fill="#583619" />

          {/* Ufuk kartı ve yunuslama merdiveni */}
          <g clipPath="url(#aiCard)">
            <rect width="200" height="100" fill="url(#aiSky)" />
            <rect y="100" width="200" height="100" fill="url(#aiGround)" />
            {pitchRungs.map((deg) => {
              const y = 100 - deg * PITCH_SCALE;
              const major = deg % 10 === 0;
              const half = major ? 17 : 8.5;
              return (
                <g key={deg}>
                  <path
                    d={`M${100 - half} ${y} H${100 + half}`}
                    stroke="#F4F8FC"
                    strokeWidth={major ? 1.6 : 1.3}
                    strokeLinecap="round"
                  />
                  {major &&
                    [75, 125].map((x) => (
                      <text
                        key={x}
                        x={x}
                        y={y}
                        fill="#F4F8FC"
                        fontSize="8"
                        fontWeight="600"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {Math.abs(deg)}
                      </text>
                    ))}
                </g>
              );
            })}
          </g>
          <circle cx="100" cy="100" r="66" stroke="#000" strokeOpacity="0.3" strokeWidth="1.2" />

          {/* Ufuk çizgisi */}
          <path d="M0 100 H200" stroke="#F4F8FC" strokeWidth="2.2" />

          {/* Yatış skalası */}
          {bankTicks.map(({angle, inner, width}) => (
            <path
              key={angle}
              d={`M100 ${100 - inner} V19`}
              transform={`rotate(${angle} 100 100)`}
              stroke="#F4F8FC"
              strokeWidth={width}
            />
          ))}
          {[45, -45].map((angle) => (
            <path key={angle} d="M97.2 19.5 H102.8 L100 26 Z" transform={`rotate(${angle} 100 100)`} fill="#F4F8FC" />
          ))}

          {/* Kenar gölgesi ve cam yansıması */}
          <circle cx="100" cy="100" r="82" fill="url(#aiVignette)" />
          <path d="M18 100 A82 82 0 0 1 182 100 Z" fill="url(#aiGlare)" />
        </g>

        {/* Sabit semboller: yatış göstergesi üçgeni, ufuk referans çubukları, minyatür uçak */}
        <g filter="url(#aiShadow)">
          <path d="M94 18.5 H106 L100 32 Z" fill="#F4F8FC" />
          <rect x="49" y="98.2" width="29" height="3.6" rx="0.9" fill="url(#aiBar)" stroke="#1E1404" strokeWidth="0.8" />
          <rect x="122" y="98.2" width="29" height="3.6" rx="0.9" fill="url(#aiBar)" stroke="#1E1404" strokeWidth="0.8" />
          <path d="M78 100 L95 98.4 H105 L122 100 L105 101.6 H95 Z" fill="#FFFFFF" />
          <rect x="98.9" y="90" width="2.2" height="10" rx="1.1" fill="#FFFFFF" />
          <path d="M96.6 101.5 L100 110 L103.4 101.5 Z" fill="#FFFFFF" />
          <circle cx="100" cy="100" r="4.4" fill="#FFFFFF" />
        </g>
        <circle cx="100" cy="100" r="82" stroke="#05070A" strokeWidth="1.6" />
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
