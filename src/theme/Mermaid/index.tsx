import type {ReactNode} from 'react';
import Mermaid from '@theme-original/Mermaid';
import type MermaidType from '@theme/Mermaid';
import type {WrapperProps} from '@docusaurus/types';

import {BuyutulebilirDiyagram} from '@site/src/components/SekilBuyutme';

type Props = WrapperProps<typeof MermaidType>;

// Wrap swizzle: geniş diyagramlar içerik sütununa sığmak için küçülür; küçüldüğünde köşesine
// tam ekranda açan "Büyüt" düğmesi eklenir (bkz. src/components/SekilBuyutme). Diyagram
// kutusu (.docusaurus-mermaid-container > svg) olduğu gibi kalır; kitap PDF'i ona dayanır.
export default function MermaidWrapper(props: Props): ReactNode {
  return (
    <BuyutulebilirDiyagram kaynak={props.value}>
      <Mermaid {...props} />
    </BuyutulebilirDiyagram>
  );
}
