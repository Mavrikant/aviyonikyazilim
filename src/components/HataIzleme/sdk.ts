// Tembel yüklenen parçanın girişi (index.ts → import('./sdk')). `import('@sentry/browser')` paketin
// tüm ad alanını (oturum kaydı, geri bildirim, performans izleme) parçaya katardı; yalnızca
// kullanılan işlevler adıyla dışa verilince geri kalanı derlemede ayıklanır.
export {captureException, init} from '@sentry/browser';
