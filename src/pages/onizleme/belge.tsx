import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Belge from '@site/src/components/AnaSayfa/Belge';

// Geçici önizleme: tasarım seçildikten sonra silinecek.
export default function OnizlemeBelge(): ReactNode {
  return (
    <Layout title="Önizleme — Teknik belge">
      <Belge />
    </Layout>
  );
}
