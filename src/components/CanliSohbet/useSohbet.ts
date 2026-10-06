import {useCallback, useId, useSyncExternalStore} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

/*
 * Canlı sohbet (Tawk.to) — isteğe bağlıdır ve tembel yüklenir.
 *
 * Yapılandırma: TAWK_TO_ID depo değişkeni → docusaurus.config.ts → customFields.tawkToId
 * ("<propertyId>/<widgetId>"; biçim orada doğrulanır, kodda kimlik tutulmaz). Değişken
 * tanımlı değilse `yapilandirildi` false döner ve sitede sohbetten hiç söz edilmez.
 *
 * Tawk betiği sayfa açılışında YÜKLENMEZ: üçüncü taraf betiği açılışı yavaşlatır ve çerez
 * bırakabilir. Betik yalnızca kullanıcı bir sohbet düğmesine bastığında (`ac()`) eklenir;
 * widget hazır olunca sohbet penceresi kendiliğinden açılır.
 *
 * Durum modül düzeyinde tutulur: Tawk bir kez yüklenince sayfa geçişlerinde yerinde kalır,
 * bu yüzden bileşenler yeniden bağlansa da durum sıfırlanmamalıdır.
 */

/** Tawk'ın JavaScript API'sinden yalnızca kullanılan üyeler. */
type TawkApi = {
  onLoad?: () => void;
  maximize?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

export type SohbetDurumu = 'bekliyor' | 'yukleniyor' | 'hazir' | 'hata';

const HATA_METNI =
  'Sohbet yüklenemedi. Yeniden deneyin; sorun sürerse içerik engelleyicinizi denetleyin.';

/** Betik indiği hâlde widget bu sürede açılmazsa düğme "Açılıyor…" durumunda kalmasın. */
const ZAMAN_ASIMI_MS = 20_000;

let durum: SohbetDurumu = 'bekliyor';
let betik: HTMLScriptElement | null = null;
let zamanlayici: number | undefined;
/** Son `ac()` çağrısını yapan kanca örneği: hata metni yalnızca basılan düğmenin yanında çıkar. */
let sonCagiran: string | null = null;

const dinleyiciler = new Set<() => void>();

function aboneOl(dinleyici: () => void): () => void {
  dinleyiciler.add(dinleyici);
  return () => {
    dinleyiciler.delete(dinleyici);
  };
}

function anlikDurum(): SohbetDurumu {
  return durum;
}

/** Sunucuda (ve hydration sırasında) sohbet hiçbir zaman yüklenmiş değildir. */
function sunucuDurumu(): SohbetDurumu {
  return 'bekliyor';
}

function durumuAyarla(yeni: SohbetDurumu): void {
  durum = yeni;
  dinleyiciler.forEach((dinleyici) => dinleyici());
}

function yukle(kimlik: string): void {
  durumuAyarla('yukleniyor');
  window.clearTimeout(zamanlayici);
  zamanlayici = window.setTimeout(() => {
    if (durum === 'yukleniyor') {
      durumuAyarla('hata');
    }
  }, ZAMAN_ASIMI_MS);

  // Betik önceki denemede eklendi ama widget henüz açılmadı (zaman aşımı): ikinci kez
  // eklenmez, yalnızca yeniden beklenir.
  if (betik) {
    return;
  }

  const api: TawkApi = window.Tawk_API ?? {};
  window.Tawk_API = api;
  window.Tawk_LoadStart = new Date();
  api.onLoad = () => {
    window.clearTimeout(zamanlayici);
    durumuAyarla('hazir');
    api.maximize?.();
  };

  const yeni = document.createElement('script');
  yeni.async = true;
  yeni.src = `https://embed.tawk.to/${kimlik}`;
  yeni.setAttribute('charset', 'UTF-8');
  yeni.setAttribute('crossorigin', '*');
  yeni.onerror = () => {
    // Ağ hatası ya da içerik engelleyici: betik kaldırılır ki yeniden denenebilsin.
    window.clearTimeout(zamanlayici);
    yeni.remove();
    betik = null;
    durumuAyarla('hata');
  };
  document.head.appendChild(yeni);
  betik = yeni;
}

function sohbetiAc(kimlik: string): void {
  if (durum === 'hazir') {
    window.Tawk_API?.maximize?.();
  } else if (durum !== 'yukleniyor') {
    yukle(kimlik);
  }
}

export type Sohbet = {
  /** TAWK_TO_ID tanımlı mı? Değilse sohbetle ilgili hiçbir arayüz gösterilmemelidir. */
  yapilandirildi: boolean;
  durum: SohbetDurumu;
  /** Son deneme bu kanca örneğinden yapıldıysa ve başarısız olduysa gösterilecek metin. */
  hata: string | null;
  /** Sohbeti açar; ilk çağrıda Tawk betiğini yükler. Yalnızca olay işleyicide çağrılır. */
  ac: () => void;
};

export function useSohbet(): Sohbet {
  const {siteConfig} = useDocusaurusContext();
  const alan = siteConfig.customFields?.tawkToId;
  const kimlik = typeof alan === 'string' && alan !== '' ? alan : null;

  const ornek = useId();
  const anlik = useSyncExternalStore(aboneOl, anlikDurum, sunucuDurumu);

  const ac = useCallback(() => {
    if (kimlik) {
      sonCagiran = ornek;
      sohbetiAc(kimlik);
    }
  }, [kimlik, ornek]);

  return {
    yapilandirildi: kimlik !== null,
    durum: anlik,
    hata: anlik === 'hata' && sonCagiran === ornek ? HATA_METNI : null,
    ac,
  };
}
