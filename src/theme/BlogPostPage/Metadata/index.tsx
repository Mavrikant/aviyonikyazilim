import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Metadata from '@theme-original/BlogPostPage/Metadata';
import type MetadataType from '@theme/BlogPostPage/Metadata';
import type {WrapperProps} from '@docusaurus/types';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';

type Props = WrapperProps<typeof MetadataType>;

// Wrap swizzle: sitenin genel `author` meta etiketi (docusaurus.config.ts) "Aviyonik Yazılım
// topluluğu"dur. Blog yazısında etiket, article:author ve BlogPosting ile aynı kişiyi
// göstersin diye yazının kendi yazarlarıyla (authors.yml) yeniden verilir; Head aynı adlı
// meta etiketlerinden sonuncusunu tutar.
export default function BlogPostPageMetadataWrapper(props: Props): ReactNode {
  const {metadata} = useBlogPost();
  const adlar = metadata.authors.map((yazar) => yazar.name).filter(Boolean);
  return (
    <>
      <Metadata {...props} />
      {adlar.length > 0 && (
        <Head>
          <meta name="author" content={adlar.join(', ')} />
        </Head>
      )}
    </>
  );
}
