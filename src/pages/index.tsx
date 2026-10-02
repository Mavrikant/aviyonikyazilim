import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Belge from '@site/src/components/AnaSayfa/Belge';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Emniyet-kritik aviyonik yazılım için Türkçe başucu kaynağı"
      description="DO-178C ekseninde emniyet-kritik aviyonik yazılım: Türkçe ve özgün bir kitap, aviyonik protokoller ve sertifikasyon üzerine yazılar, tarayıcıda çalışan araçlar.">
      <Belge />
    </Layout>
  );
}
