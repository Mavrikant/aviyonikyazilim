import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Kokpit from '@site/src/components/AnaSayfa/Kokpit';

// Geçici önizleme: tasarım seçildikten sonra silinecek.
export default function OnizlemeKokpit(): ReactNode {
  return (
    <Layout title="Önizleme — Cam kokpit">
      <Kokpit />
    </Layout>
  );
}
