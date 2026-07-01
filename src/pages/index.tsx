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

const contentMap = [
  {
    title: 'Kitap',
    description: 'DO-178C ekseninde düzenli okuma rotası, kavram sıralaması ve referans sayfaları.',
  },
  {
    title: 'Blog',
    description: 'Tek tek konuları hızlı açıklayan, kitapla birlikte okunabilecek teknik notlar.',
  },
  {
    title: 'Kaynaklar',
    description: 'Kısaltmalar, SOI notları ve ekler ile terimlerin ve süreçlerin kısa başvurusu.',
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
            <Heading as="h2" className={styles.sectionTitle}>
              İlk 5 dakikada nasıl kullanmalı?
            </Heading>
            <p className={styles.sectionLead}>
              Siteyi hızlı taramak isteyenler için, amaca göre seçilmiş kısa rotalar.
            </p>

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
            <Heading as="h2" className={styles.sectionTitle}>
              İçerik haritası
            </Heading>
            <p className={styles.sectionLead}>
              Kitap, blog ve kaynaklar birbirini tamamlayan ayrı ama bağlantılı üç katman gibi
              çalışır.
            </p>

            <div className={styles.cardGrid}>
              {contentMap.map((item) => (
                <article className={styles.card} key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <Heading as="h2" className={styles.sectionTitle}>
              Son blog yazıları
            </Heading>
            <p className={styles.sectionLead}>
              Kısa teknik notlar, kitapta ele alınan konuların pratik ve daraltılmış karşılıklarını sunar.
            </p>

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
