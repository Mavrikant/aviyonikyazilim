import type {ReactNode} from 'react';
import ErrorPageContent from '@theme-original/ErrorPageContent';
import type ErrorPageContentType from '@theme/ErrorPageContent';
import type {WrapperProps} from '@docusaurus/types';

import {useCokmeBildir} from '@site/src/components/HataIzleme';

type Props = WrapperProps<typeof ErrorPageContentType>;

// Wrap swizzle: sayfa içeriği çöktüğünde (Layout'taki hata sınırı) hatayı Sentry'ye bildirir;
// görünüm değişmez. SENTRY_DSN tanımlı değilse yalnızca özgün bileşeni çizer
// (bkz. src/components/HataIzleme).
export default function ErrorPageContentWrapper(props: Props): ReactNode {
  useCokmeBildir(props.error);
  return <ErrorPageContent {...props} />;
}
