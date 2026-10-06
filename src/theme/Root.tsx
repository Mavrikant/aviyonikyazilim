import type {ReactNode} from 'react';
import type {Props} from '@theme/Root';

import YuzenSohbetDugmesi from '@site/src/components/CanliSohbet';

/**
 * Uygulamanın en üstündeki sarmalayıcı (Docusaurus'un resmi `Root` genişletme noktası;
 * eject değildir, upstream'de karşılaştırılacak bir kopyası yoktur). Rotadan bağımsızdır
 * ve sayfa geçişlerinde yeniden bağlanmaz; yönlendiricinin içinde olduğu için
 * `useLocation` kullanılabilir.
 *
 * Burada yalnızca yüzen sohbet düğmesi eklenir; düğme, sohbet yapılandırılmamışsa
 * hiçbir şey çizmez (bkz. src/components/CanliSohbet).
 */
export default function Root({children}: Props): ReactNode {
  return (
    <>
      {children}
      <YuzenSohbetDugmesi />
    </>
  );
}
