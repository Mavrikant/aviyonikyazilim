import type {ReactNode} from 'react';
import Img from '@theme-original/MDXComponents/Img';
import type ImgType from '@theme/MDXComponents/Img';
import type {WrapperProps} from '@docusaurus/types';

import {BuyutulebilirGorsel} from '@site/src/components/SekilBuyutme';

type Props = WrapperProps<typeof ImgType>;

// Wrap swizzle: Markdown görseli sütuna sığmak için belirgin biçimde küçüldüğünde (telefonda
// diyagram görselleri gibi) köşesine tam ekranda açan "Büyüt" düğmesi eklenir (bkz.
// src/components/SekilBuyutme). Künyedeki kitap kapağı gibi alanlar BuyutmesizAlan ile dışarıda kalır.
export default function ImgWrapper(props: Props): ReactNode {
  return (
    <BuyutulebilirGorsel>
      <Img {...props} />
    </BuyutulebilirGorsel>
  );
}
