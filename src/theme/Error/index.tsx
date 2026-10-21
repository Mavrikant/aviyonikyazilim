import type {ReactNode} from 'react';
import Error from '@theme-original/Error';
import type ErrorType from '@theme/Error';
import type {WrapperProps} from '@docusaurus/types';

import {useCokmeBildir} from '@site/src/components/HataIzleme';

type Props = WrapperProps<typeof ErrorType>;

// Wrap swizzle: uygulamanın en dıştaki hata sınırına düşen hatayı (Layout'un kendisi çöktüğünde)
// Sentry'ye bildirir; görünüm değişmez. Bu sınır sitenin bağlam sağlayıcılarının dışındadır,
// bildirim bu yüzden yapılandırmayı bağlamdan değil doğrudan okur (bkz. src/components/HataIzleme).
export default function ErrorWrapper(props: Props): ReactNode {
  useCokmeBildir(props.error);
  return <Error {...props} />;
}
