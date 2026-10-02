import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Kitap from '@site/src/components/AnaSayfa/Kitap';

// Geçici önizleme: tasarım seçildikten sonra silinecek.
export default function OnizlemeKitap(): ReactNode {
  return (
    <Layout title="Önizleme — Editoryal kitap">
      <Kitap />
    </Layout>
  );
}
