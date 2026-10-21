import {dinlemeyeBasla} from './index';

// Docusaurus istemci modülü (docusaurus.config.ts → clientModules): uygulama çizilmeden önce
// yüklenir, böylece açılıştaki hatalar da yakalanır. Sunucuda (SSG) ve SENTRY_DSN tanımlı
// değilse hiçbir şey yapmaz (bkz. index.ts).
dinlemeyeBasla();
