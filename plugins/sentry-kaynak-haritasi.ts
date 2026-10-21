/**
 * Sentry kaynak haritası — üretim derlemesinde istemci paketleri için kaynak haritası
 * (source map) üretir. Sentry, küçültülmüş (minified) yığın izlerini bunlarla özgün dosya,
 * satır ve işlev adına çevirir.
 *
 * Yalnızca SENTRY_DSN tanımlı ve SENTRY_KAYNAK_HARITASI=true iken eklenir (docusaurus.config.ts);
 * deploy.yml bu değişkeni, haritaları yükleyecek SENTRY_AUTH_TOKEN da varsa açar. `hidden-source-map`
 * JS dosyalarına `sourceMappingURL` yorumu yazmaz: haritalar tarayıcıya duyurulmaz. Yükleme ve
 * dosya-harita eşleşmesi (debug ID) deploy.yml'deki Sentry adımındadır; haritalar ardından
 * build/ altından silinir, yayına girmez.
 *
 * Sunucu paketi (SSG) ve geliştirme sunucusu etkilenmez.
 */

import type {Plugin} from '@docusaurus/types';

export default function sentryKaynakHaritasi(): Plugin {
  return {
    name: 'sentry-kaynak-haritasi',
    configureWebpack(config, isServer) {
      if (isServer || config.mode !== 'production') {
        return {};
      }
      return {devtool: 'hidden-source-map'};
    },
  };
}
