import {useEffect} from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import siteConfig from '@generated/docusaurus.config';

/*
 * Hata izleme (Sentry) — isteğe bağlıdır ve tembel yüklenir.
 *
 * Yapılandırma: SENTRY_DSN depo değişkeni → docusaurus.config.ts → customFields.sentryDsn
 * (biçim orada doğrulanır, kodda kimlik tutulmaz). Değişken tanımlı değilse hiçbir şey
 * yapılmaz: SDK indirilmez, Sentry'ye istek gitmez.
 *
 * SDK sayfa açılışında YÜKLENMEZ: hatasız bir ziyarette indirilmez, açılışı yavaşlatmaz.
 * İstemci modülü (istemci.ts) yalnızca iki küçük dinleyici kurar; ilk hata yakalandığında SDK
 * ayrı bir parça (sdk.ts) olarak indirilir, o ana kadar biriken hatalar ona aktarılır ve
 * sonrakileri SDK'nın kendi işleyicileri yakalar. Bedeli: ilk hatadan önceki gezinme izleri
 * (breadcrumbs) olaya girmez.
 *
 * Gönderilen: hata iletisi, yığın izi, sayfa adresi, tarayıcı (User-Agent) ve sürüm (commit).
 * Gönderilmeyen: IP adresi, çerez, kullanıcı kimliği; performans izleme ve oturum kaydı yoktur.
 *
 * Durum modül düzeyinde tutulur: SDK bir kez indirilince sayfa geçişlerinde yerinde kalır.
 */

type Sentry = typeof import('./sdk');

/** Sentry'nin olayı nasıl yakalandığını gösteren alanı (event.exception.mechanism). */
type Mekanizma = {type: string; handled: boolean};

function metinAlan(alan: unknown): string | null {
  return typeof alan === 'string' && alan !== '' ? alan : null;
}

const DSN = metinAlan(siteConfig.customFields?.sentryDsn);
const SURUM = metinAlan(siteConfig.customFields?.sentryRelease) ?? undefined;
const URETIM = process.env.NODE_ENV === 'production';

/**
 * Bildirim yapılır mı? Üretim derlemesi yalnızca yayın alan adında bildirir: kitap PDF'i CI'da
 * derlenmiş sayfaları localhost'ta açar, `npm run serve` ve sitenin başka yerdeki kopyaları da
 * olaya karışmamalıdır. Geliştirme sunucusunda (`npm start`) her adreste bildirilir.
 */
function etkin(): boolean {
  return (
    DSN !== null &&
    ExecutionEnvironment.canUseDOM &&
    (!URETIM || window.location.origin === new URL(siteConfig.url).origin)
  );
}

/** SDK inene kadar biriken hatalar; bir hata döngüsü belleği ve kotayı doldurmasın diye sınırlıdır. */
const KUYRUK_SINIRI = 10;

let durum: 'bekliyor' | 'yukleniyor' | 'hazir' | 'kapali' = 'bekliyor';
let sdk: Sentry | null = null;
const kuyruk: {hata: unknown; mekanizma: Mekanizma}[] = [];

function hataOlayi(olay: ErrorEvent): void {
  // Hata nesnesi taşımayan olaylar ("Script error.", ResizeObserver uyarısı) ve başka kaynaktan
  // (tarayıcı eklentisi, Tawk, gtag) gelen hatalar düzeltilemez; SDK'yı indirmeye değmez.
  if (!olay.error || (olay.filename && !olay.filename.startsWith(window.location.origin))) {
    return;
  }
  hataBildir(olay.error, {type: 'auto.browser.global_handlers.onerror', handled: false});
}

function retOlayi(olay: PromiseRejectionEvent): void {
  // Error taşımayan ret (dizge, düz nesne) yığın izi vermez, kaynağı bulunamaz; çoğu sitenin dışından
  // gelir (ör. Tauri masaüstü uygulamasının bağlantı yakalayıcısı). SDK'ya verilirse çağrı noktasından
  // sahte bir iz eklenir, hata bu dosyadan çıkmış görünür ve allowUrls'ten geçer.
  if (!(olay.reason instanceof Error)) {
    return;
  }
  hataBildir(olay.reason, {type: 'auto.browser.global_handlers.onunhandledrejection', handled: false});
}

function dinlemeyiBirak(): void {
  window.removeEventListener('error', hataOlayi);
  window.removeEventListener('unhandledrejection', retOlayi);
}

function yukle(dsn: string): void {
  durum = 'yukleniyor';
  import('./sdk').then(
    (sentry) => {
      sentry.init({
        dsn,
        release: SURUM,
        environment: URETIM ? 'production' : 'development',
        // Yalnızca bu sitenin dosyalarından çıkan hatalar; tarayıcı eklentileri ve üçüncü taraf
        // betikler (Tawk, gtag) gürültüdür.
        allowUrls: [window.location.origin],
        // allowUrls yığın izi olmayan olayı geçirir: SDK'nın kendi işleyicilerinin yakaladığı Error
        // olmayan değerler (yukarıdaki retOlayi süzgecinin SDK inince karşılığı) atılır.
        beforeSend: (olay, ipucu) => (ipucu.originalException instanceof Error ? olay : null),
        // IP adresi ve çerez gönderilmez (bkz. SEO.md, "Depo değişkenleri").
        dataCollection: {userInfo: false, cookies: false},
        // SDK ilk hatada başlatıldığı için oturum sayımı (çökmesiz oturum oranı) anlamsızdır.
        integrations: (varsayilanlar) =>
          varsayilanlar.filter((entegrasyon) => entegrasyon.name !== 'BrowserSession'),
      });
      // Bundan sonraki yakalanmamış hataları SDK'nın kendi işleyicileri yakalar.
      dinlemeyiBirak();
      sdk = sentry;
      durum = 'hazir';
      kuyruk.splice(0).forEach(({hata, mekanizma}) => {
        sentry.captureException(hata, {mechanism: mekanizma});
      });
    },
    () => {
      // Ağ hatası ya da içerik engelleyici: hatalar bildirilmez, site etkilenmez; her yeni
      // hatada yeniden denenmez.
      durum = 'kapali';
      kuyruk.length = 0;
      dinlemeyiBirak();
    },
  );
}

/**
 * Hatayı Sentry'ye bildirir; SDK henüz inmediyse indirir. SENTRY_DSN tanımlı değilse, sunucuda
 * (SSG) ya da yayın dışı bir adreste çağrılırsa hiçbir şey yapmaz.
 */
export function hataBildir(hata: unknown, mekanizma: Mekanizma): void {
  if (!DSN || durum === 'kapali' || !etkin()) {
    return;
  }
  if (sdk) {
    sdk.captureException(hata, {mechanism: mekanizma});
    return;
  }
  if (kuyruk.length < KUYRUK_SINIRI) {
    kuyruk.push({hata, mekanizma});
  }
  if (durum === 'bekliyor') {
    yukle(DSN);
  }
}

/** Yakalanmamış hataları dinlemeye başlar; istemci modülünden bir kez çağrılır. */
export function dinlemeyeBasla(): void {
  if (!etkin()) {
    return;
  }
  window.addEventListener('error', hataOlayi);
  window.addEventListener('unhandledrejection', retOlayi);
}

/**
 * Docusaurus hata sınırının yakaladığı, sayfayı çökerten hatayı bildirir. React hata sınırına
 * düşen hata pencereye ulaşmaz; genel dinleyiciler onu görmez.
 */
export function useCokmeBildir(hata: Error): void {
  useEffect(() => {
    hataBildir(hata, {type: 'docusaurus.error_boundary', handled: false});
  }, [hata]);
}
