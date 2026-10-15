import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';

import styles from './styles.module.css';

/**
 * Küçülen şekillerin tam ekranda açılması.
 *
 * İçerik sütunu masaüstünde ~700 px, telefonda ~340 px'tir. Geniş Mermaid diyagramları ve
 * büyük görseller sütuna sığmak için küçülür; yazıları okunamayacak kadar ufalabilir. Şekil
 * doğal boyutunun belirgin altında çizildiğinde köşesinde "Büyüt" düğmesi belirir. Düğmeye
 * ya da şeklin kendisine basınca şekil tam ekran bir `<dialog>`'da doğal boyutunda açılır:
 * yakınlaştırma (düğmeler, + / - / 0 tuşları, Ctrl + tekerlek), fareyle sürükleyerek
 * kaydırma, Esc ile kapanma.
 *
 * Düğme yalnızca tarayıcıda, şekil çizilip ölçüldükten sonra eklenir (Mermaid zaten
 * tarayıcıda çizilir); sunucu çıktısında yalnızca sarmalayıcı bulunur. Kitap PDF'i
 * düğmeleri çıkarır.
 */

/** Şekil doğal genişliğinin bu oranından dar çiziliyorsa büyütme sunulur (Mermaid'de 16 px → 13,6 px). */
const ESIK = 0.85;
/** Açılışta diyagramın ekrana sığdırılırken çıkabileceği en yüksek oran; görseller doğal boyutu geçmez (bulanıklaşır). */
const ACILIS_UST_SINIR = 1.5;
const EN_KUCUK = 0.1;
const EN_BUYUK = 4;
const ADIM = 1.25;
const YUZDE = new Intl.NumberFormat('tr-TR', {style: 'percent', maximumFractionDigits: 0});

type Boyut = {genislik: number; yukseklik: number};

type Icerik = Boyut &
  ({tur: 'diyagram'; isaretleme: string} | {tur: 'gorsel'; src: string; alt: string});

function dogalBoyut(el: Element): Boyut | null {
  if (el instanceof SVGSVGElement) {
    const kutu = el.viewBox.baseVal;
    return kutu && kutu.width > 0 ? {genislik: kutu.width, yukseklik: kutu.height} : null;
  }
  if (el instanceof HTMLImageElement) {
    // width/height öznitelikleri derlemede yazılır; görsel henüz yüklenmemiş olsa da boyut bellidir.
    const genislik = el.naturalWidth || Number(el.getAttribute('width'));
    const yukseklik = el.naturalHeight || Number(el.getAttribute('height'));
    return genislik > 0 && yukseklik > 0 ? {genislik, yukseklik} : null;
  }
  return null;
}

function hazirla(el: Element): Icerik | null {
  const boyut = dogalBoyut(el);
  if (!boyut) return null;
  if (el instanceof HTMLImageElement) {
    return {tur: 'gorsel', src: el.currentSrc || el.src, alt: el.alt, ...boyut};
  }
  // Mermaid stilleri ve ok uçlarını SVG'nin kimliğine bağlar; kopya aynı belgede durduğu için
  // kimlik yeniden adlandırılır (kitap PDF'i de aynısını yapar).
  const isaretleme = el.id ? el.outerHTML.replaceAll(el.id, `${el.id}-buyuk`) : el.outerHTML;
  return {tur: 'diyagram', isaretleme, ...boyut};
}

/** Şeklin üstündeki en yakın başlık: pencerede şeklin ne olduğunu söyler. */
function oncekiBaslik(el: Element): string | null {
  for (let n: Element | null = el; n && !n.classList.contains('markdown'); n = n.parentElement) {
    for (let k = n.previousElementSibling; k; k = k.previousElementSibling) {
      if (/^H[1-4]$/.test(k.tagName)) return (k.textContent ?? '').replace(/​/g, '').trim();
    }
  }
  return null;
}

/** Şeklin doğal boyutunun belirgin altında çizilip çizilmediğini izler (çizim, tema ve genişlik değişince). */
function useKucultulmus(kok: RefObject<HTMLElement | null>, secici: string): boolean {
  const [kucuk, setKucuk] = useState(false);
  useEffect(() => {
    const kap = kok.current;
    // Bağlantı içindeki görsel tıklanınca bağlantıya gider; büyütme sunulmaz.
    if (!kap || kap.closest('a')) return undefined;
    let izlenen: Element | null = null;
    const boyutGozlemcisi = new ResizeObserver(() => olc());
    function olc() {
      const el = kap!.querySelector(secici);
      if (el !== izlenen) {
        if (izlenen) boyutGozlemcisi.unobserve(izlenen);
        if (el) boyutGozlemcisi.observe(el);
        izlenen = el;
      }
      const dogal = el && dogalBoyut(el);
      const cizilen = el?.getBoundingClientRect().width ?? 0;
      setKucuk(!!dogal && cizilen > 0 && cizilen < dogal.genislik * ESIK);
    }
    // Mermaid diyagramı sonradan ve renk teması değişince yeniden çizer.
    const yapiGozlemcisi = new MutationObserver(olc);
    yapiGozlemcisi.observe(kap, {childList: true, subtree: true});
    olc();
    return () => {
      boyutGozlemcisi.disconnect();
      yapiGozlemcisi.disconnect();
    };
  }, [kok, secici]);
  return kucuk;
}

function BuyutSimgesi(): ReactNode {
  return (
    <svg className={styles.simge} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
    </svg>
  );
}

function KapatSimgesi(): ReactNode {
  return (
    <svg className={styles.simge} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

type GoruntuleyiciProps = {
  icerik: Icerik;
  baslik: string;
  /** Sahneye sığmayan şekil açılışta soldan gösterilir (soldan sağa akan diyagram); yoksa ortadan */
  soldan: boolean;
  kapat: () => void;
};

function Goruntuleyici({icerik, baslik, soldan, kapat}: GoruntuleyiciProps): ReactNode {
  const baslikKimligi = useId();
  const pencere = useRef<HTMLDialogElement>(null);
  const sahne = useRef<HTMLDivElement>(null);
  const sekil = useRef<HTMLDivElement>(null);
  const [olcek, setOlcek] = useState(1);
  const olcekRef = useRef(olcek);
  olcekRef.current = olcek;
  // Yakınlaştırmada sabit kalacak nokta: sahnedeki konumu ve şekildeki (ölçeksiz) karşılığı
  const odak = useRef<{x: number; y: number; sekilX: number; sekilY: number} | null>(null);
  const surukleme = useRef<{x: number; y: number; sol: number; ust: number} | null>(null);
  const [surukleniyor, setSurukleniyor] = useState(false);
  // Açılış ölçeği: o ölçekle ilk çizimde kaydırma başlangıç konumuna alınır.
  const acilisOlcegi = useRef<number | null>(null);

  /** Şeklin sahneye bütünüyle sığdığı ölçek; diyagram en çok %150, görsel en çok doğal boyutunda. */
  const sigdirmaOlcegi = () => {
    const s = sahne.current;
    const tasiyici = sekil.current?.parentElement;
    if (!s || !tasiyici) return 1;
    const bosluk = parseFloat(getComputedStyle(tasiyici).paddingLeft) * 2;
    const oran = Math.min(
      (s.clientWidth - bosluk) / icerik.genislik,
      (s.clientHeight - bosluk) / icerik.yukseklik,
    );
    return Math.min(oran, icerik.tur === 'gorsel' ? 1 : ACILIS_UST_SINIR);
  };

  const olcekle = (yeni: number, x?: number, y?: number) => {
    const s = sahne.current;
    const k = sekil.current;
    if (!s || !k) return;
    const eski = olcekRef.current;
    const sinirli = Math.min(EN_BUYUK, Math.max(EN_KUCUK, yeni));
    const odakX = x ?? s.clientWidth / 2;
    const odakY = y ?? s.clientHeight / 2;
    odak.current = {
      x: odakX,
      y: odakY,
      sekilX: (s.scrollLeft + odakX - k.offsetLeft) / eski,
      sekilY: (s.scrollTop + odakY - k.offsetTop) / eski,
    };
    setOlcek(sinirli);
  };
  const olcekleRef = useRef(olcekle);
  olcekleRef.current = olcekle;

  // Açılış: kipli pencere, diyagram kopyası ve ilk ölçek. Diyagram okunur boyutta (en az
  // doğal boyutunda) açılır; ekrana sığmıyorsa kaydırılır.
  useLayoutEffect(() => {
    const d = pencere.current!;
    if (icerik.tur === 'diyagram' && sekil.current) {
      sekil.current.innerHTML = icerik.isaretleme;
      // Mermaid'in max-width sınırı kalkar; boyut width/height öznitelikleriyle verilir.
      sekil.current.querySelector('svg')?.removeAttribute('style');
    }
    const kapandi = () => kapat();
    d.addEventListener('close', kapandi);
    d.showModal();
    acilisOlcegi.current = Math.max(sigdirmaOlcegi(), 1);
    setOlcek(acilisOlcegi.current);
    sahne.current?.focus();
    return () => {
      d.removeEventListener('close', kapandi);
      if (d.open) d.close();
    };
    // Pencere her açılışta yeniden bağlanır; içerik açıkken değişmez.
  }, []);

  // Ölçek değişince boyut öznitelikleri güncellenir ve odak noktası yerinde tutulur.
  useLayoutEffect(() => {
    const svg = sekil.current?.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', String(Math.round(icerik.genislik * olcek)));
      svg.setAttribute('height', String(Math.round(icerik.yukseklik * olcek)));
    }
    const s = sahne.current;
    const k = sekil.current;
    // Yukarıdan aşağı akan diyagramın kökü ortadadır; sığmayan şekil ortadan, soldan sağa
    // akan diyagram ise başından (soldan) açılır. Dikeyde her zaman baştan başlanır.
    if (s && acilisOlcegi.current === olcek) {
      s.scrollLeft = soldan ? 0 : (s.scrollWidth - s.clientWidth) / 2;
      s.scrollTop = 0;
      acilisOlcegi.current = null;
    }
    const o = odak.current;
    if (s && k && o) {
      s.scrollLeft = o.sekilX * olcek + k.offsetLeft - o.x;
      s.scrollTop = o.sekilY * olcek + k.offsetTop - o.y;
      odak.current = null;
    }
  }, [olcek, icerik, soldan]);

  // Ctrl/⌘ + tekerlek (dokunmatik yüzeyde iki parmakla kıstırma) imlecin altına yakınlaştırır.
  // Sayfanın kendi yakınlaştırmasını durdurmak için dinleyici pasif olmamalıdır.
  useEffect(() => {
    const s = sahne.current;
    if (!s) return undefined;
    const tekerlek = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const kutu = s.getBoundingClientRect();
      olcekleRef.current(olcekRef.current * Math.exp(-e.deltaY * 0.01), e.clientX - kutu.left, e.clientY - kutu.top);
    };
    s.addEventListener('wheel', tekerlek, {passive: false});
    return () => s.removeEventListener('wheel', tekerlek);
  }, []);

  const tus = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '+' || e.key === '=') olcekle(olcek * ADIM);
    else if (e.key === '-') olcekle(olcek / ADIM);
    else if (e.key === '0') olcekle(sigdirmaOlcegi());
    else return;
    e.preventDefault();
  };

  // Fareyle sürükleyerek kaydırma; dokunmatikte tarayıcının kendi kaydırması kullanılır.
  const basildi = (e: PointerEvent<HTMLDivElement>) => {
    const s = sahne.current;
    if (!s || e.pointerType !== 'mouse' || e.button !== 0) return;
    surukleme.current = {x: e.clientX, y: e.clientY, sol: s.scrollLeft, ust: s.scrollTop};
    s.setPointerCapture(e.pointerId);
    setSurukleniyor(true);
  };
  const surukle = (e: PointerEvent<HTMLDivElement>) => {
    const s = sahne.current;
    const b = surukleme.current;
    if (!s || !b) return;
    s.scrollLeft = b.sol - (e.clientX - b.x);
    s.scrollTop = b.ust - (e.clientY - b.y);
  };
  const birakildi = () => {
    surukleme.current = null;
    setSurukleniyor(false);
  };

  return (
    <dialog ref={pencere} className={styles.pencere} aria-labelledby={baslikKimligi} onKeyDown={tus}>
      <div className={styles.arac}>
        <p id={baslikKimligi} className={styles.baslik}>
          {baslik || 'Şekil'}
        </p>
        <div className={styles.denetimler}>
          <button
            type="button"
            className={styles.denetim}
            onClick={() => olcekle(olcek / ADIM)}
            disabled={olcek <= EN_KUCUK}
            aria-label="Uzaklaştır"
            aria-keyshortcuts="-">
            −
          </button>
          <output className={styles.oran} aria-live="polite">
            {YUZDE.format(olcek)}
          </output>
          <button
            type="button"
            className={styles.denetim}
            onClick={() => olcekle(olcek * ADIM)}
            disabled={olcek >= EN_BUYUK}
            aria-label="Yakınlaştır"
            aria-keyshortcuts="+">
            +
          </button>
          <button
            type="button"
            className={styles.denetim}
            onClick={() => olcekle(sigdirmaOlcegi())}
            aria-keyshortcuts="0">
            Sığdır
          </button>
          <button
            type="button"
            className={clsx(styles.denetim, styles.kapat)}
            onClick={() => {
              // close olayı Chromium'da bir sonraki karede gelir; pencere beklemeden kaldırılır.
              pencere.current?.close();
              kapat();
            }}
            aria-keyshortcuts="Escape">
            <KapatSimgesi />
            Kapat
          </button>
        </div>
      </div>
      <div
        ref={sahne}
        className={clsx(styles.sahne, surukleniyor && styles.surukleniyor)}
        // Klavyeyle ok tuşlarıyla kaydırılabilsin diye odaklanabilir.
        tabIndex={0}
        role="group"
        aria-roledescription="yakınlaştırılabilir şekil"
        aria-label={icerik.tur === 'gorsel' ? icerik.alt : baslik || 'Şekil'}
        onPointerDown={basildi}
        onPointerMove={surukle}
        onPointerUp={birakildi}
        onPointerCancel={birakildi}>
        <div className={styles.tasiyici}>
          {icerik.tur === 'gorsel' ? (
            <div ref={sekil} className={styles.sekil}>
              <img
                src={icerik.src}
                alt={icerik.alt}
                width={Math.round(icerik.genislik * olcek)}
                height={Math.round(icerik.yukseklik * olcek)}
                draggable={false}
              />
            </div>
          ) : (
            <div ref={sekil} className={styles.sekil} />
          )}
        </div>
      </div>
    </dialog>
  );
}

type SekilProps = {
  etiket: 'div' | 'span';
  secici: string;
  className: string;
  /** Düğmede yazı yerine yalnızca simge (görselin köşesini daha az örter) */
  yalnizSimge?: boolean;
  /** Şekil soldan sağa okunur; görüntüleyicide başından açılır */
  soldan?: boolean;
  children: ReactNode;
};

function BuyutulebilirSekil({etiket, secici, className, yalnizSimge, soldan = false, children}: SekilProps): ReactNode {
  const kok = useRef<HTMLElement>(null);
  const dugme = useRef<HTMLButtonElement>(null);
  const kucuk = useKucultulmus(kok, secici);
  const [acik, setAcik] = useState<{icerik: Icerik; baslik: string} | null>(null);

  const ac = () => {
    const el = kok.current?.querySelector(secici);
    const icerik = el && hazirla(el);
    if (!el || !icerik) return;
    const baslik = oncekiBaslik(kok.current!) ?? (el instanceof HTMLImageElement ? el.alt : '');
    setAcik({icerik, baslik});
  };
  const kapat = () => {
    setAcik(null);
    dugme.current?.focus();
  };
  // Pencere portalla gövdeye taşınır ama React olayları sarmalayıcıya yine kabarır; yalnızca
  // şeklin kendisine yapılan tıklama pencereyi açar.
  const tiklandi = (e: MouseEvent<HTMLElement>) => {
    const hedef = e.target as Element;
    if (!kok.current?.contains(hedef) || hedef.closest('a, button')) return;
    ac();
  };

  return createElement(
    etiket,
    {ref: kok, className: clsx(className, kucuk && styles.kucuk), onClick: kucuk ? tiklandi : undefined},
    children,
    kucuk && (
      <button
        ref={dugme}
        type="button"
        className={clsx(styles.dugme, yalnizSimge && styles.yalnizSimge)}
        onClick={ac}
        aria-haspopup="dialog"
        aria-label={yalnizSimge ? 'Büyüt' : undefined}
        title={yalnizSimge ? 'Büyüt' : undefined}>
        <BuyutSimgesi />
        {!yalnizSimge && 'Büyüt'}
      </button>
    ),
    acik && createPortal(<Goruntuleyici {...acik} soldan={soldan} kapat={kapat} />, document.body),
  );
}

/** Soldan sağa okunan Mermaid diyagramı: LR/RL akış şeması ya da sıra diyagramı. */
function soldanSagaMi(kaynak: string): boolean {
  return /^\s*(?:(?:flowchart|graph)\s+(?:LR|RL)\b|sequenceDiagram\b)/m.test(kaynak);
}

/** Mermaid diyagramının sarmalayıcısı (src/theme/Mermaid); `kaynak` diyagramın Mermaid metnidir. */
export function BuyutulebilirDiyagram({kaynak, children}: {kaynak: string; children: ReactNode}): ReactNode {
  return (
    <BuyutulebilirSekil
      etiket="div"
      secici=".docusaurus-mermaid-container > svg"
      className={styles.diyagram}
      soldan={soldanSagaMi(kaynak)}>
      {children}
    </BuyutulebilirSekil>
  );
}

const BuyutmeKapali = createContext(false);

/** İçindeki Markdown görsellerine büyütme eklenmez (ör. künyedeki kitap kapağı). */
export function BuyutmesizAlan({children}: {children: ReactNode}): ReactNode {
  return <BuyutmeKapali.Provider value>{children}</BuyutmeKapali.Provider>;
}

/** Markdown görselinin sarmalayıcısı (src/theme/MDXComponents/Img). */
export function BuyutulebilirGorsel({children}: {children: ReactNode}): ReactNode {
  if (useContext(BuyutmeKapali)) return children;
  return (
    <BuyutulebilirSekil etiket="span" secici="img" className={styles.gorsel} yalnizSimge>
      {children}
    </BuyutulebilirSekil>
  );
}
