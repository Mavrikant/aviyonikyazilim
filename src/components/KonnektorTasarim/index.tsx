import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent, ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import {cizimOlustur, svgBelgesi, yaricaplar} from './cizim';
import Yuz from './Yuz';
import {
  ACIK,
  BOS_ATAMA,
  DSUB,
  DSUB_SABLONLARI,
  JTAG,
  TURLER,
  TUR_ADI,
  baslik,
  boyutOzeti,
  ciftEsi,
  d38999,
  dsub,
  jtag,
  seriAdi,
  turTahmini,
} from './veri';
import type {
  Atama,
  Atamalar,
  DsubModel,
  JtagModel,
  Kontak,
  Konnektor,
  Numaralama,
  SinyalTuru,
  YerlesimVerisi,
} from './veri';
import styles from './styles.module.css';

type Aile = 'jtag' | 'baslik' | 'dsub' | 'd38999';
type Secim = {
  aile: Aile;
  sira: 1 | 2;
  pin: number;
  aralik: number;
  numara: Numaralama;
  jtag: JtagModel;
  dsub: DsubModel;
  kod: string;
};
type Gorunum = {yuz: 'on' | 'arka'; cins: 'pin' | 'soket'};

const AILELER: {key: Aile; ad: string}[] = [
  {key: 'jtag', ad: 'JTAG / SWD'},
  {key: 'baslik', ad: 'Pin başlığı'},
  {key: 'dsub', ad: 'D-sub'},
  {key: 'd38999', ad: 'MIL-DTL-38999'},
];

const VARSAYILAN: Secim = {
  aile: 'jtag',
  sira: 2,
  pin: 20,
  aralik: 2.54,
  numara: 'zikzak',
  jtag: 'arm20',
  dsub: 'DE-9',
  kod: '15-35',
};
const VARSAYILAN_GORUNUM: Gorunum = {yuz: 'on', cins: 'pin'};
const ARALIKLAR = [2.54, 2, 1.27];
const DEPO = 'konnektor-pin-yerlesimi';
const ATAMASIZ: Atamalar = {};

const mmYaz = (v: number) => `${new Intl.NumberFormat('tr-TR', {minimumFractionDigits: 2}).format(v)} mm`;

/** Atama listesinin saklandığı anahtar (konnektör verisi yüklenmeden de hesaplanır) */
function anahtarOf(s: Secim): string {
  switch (s.aile) {
    case 'baslik':
      return `baslik:${s.sira}x${s.pin / s.sira}`;
    case 'jtag':
      return `jtag:${s.jtag}`;
    case 'dsub':
      return `dsub:${s.dsub}`;
    default:
      return `38999:${s.kod}`;
  }
}

/* ---------- Kayıt, paylaşım ve doğrulama ---------- */

const TUR_KEYS = new Set<string>(['bos', ...TURLER.map((t) => t.key)]);

function atamaTemizle(v: unknown): Atama | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const a = v as Partial<Atama>;
  const ad = typeof a.ad === 'string' ? a.ad.slice(0, 64) : '';
  const not = typeof a.not === 'string' ? a.not.slice(0, 200) : '';
  const tur = typeof a.tur === 'string' && TUR_KEYS.has(a.tur) ? (a.tur as SinyalTuru) : 'bos';
  return ad || not || tur !== 'bos' ? {ad, tur, not} : undefined;
}

function atamalarTemizle(v: unknown): Atamalar {
  const sonuc: Atamalar = {};
  if (!v || typeof v !== 'object') return sonuc;
  for (const [pin, a] of Object.entries(v as Record<string, unknown>).slice(0, 400)) {
    const t = atamaTemizle(a);
    if (t && pin.length <= 4) sonuc[pin] = t;
  }
  return sonuc;
}

function secimTemizle(v: unknown): Secim {
  const s = {...VARSAYILAN, ...(v && typeof v === 'object' ? (v as Partial<Secim>) : {})};
  const aile = AILELER.some((a) => a.key === s.aile) ? s.aile : VARSAYILAN.aile;
  const sira = s.sira === 1 ? 1 : 2;
  const enAz = sira === 1 ? 2 : 4;
  const enCok = sira === 1 ? 40 : 80;
  const pin = Number.isInteger(s.pin) && s.pin >= enAz && s.pin <= enCok && s.pin % sira === 0 ? s.pin : VARSAYILAN.pin;
  return {
    aile,
    sira,
    pin,
    aralik: ARALIKLAR.includes(s.aralik) ? s.aralik : 2.54,
    numara: s.numara === 'sirali' ? 'sirali' : 'zikzak',
    jtag: s.jtag in JTAG ? s.jtag : VARSAYILAN.jtag,
    dsub: s.dsub in DSUB ? s.dsub : VARSAYILAN.dsub,
    kod: typeof s.kod === 'string' && /^\d{1,2}-\d{1,3}$/.test(s.kod) ? s.kod : VARSAYILAN.kod,
  };
}

const gorunumTemizle = (v: unknown): Gorunum => {
  const g = (v && typeof v === 'object' ? v : {}) as Partial<Gorunum>;
  return {yuz: g.yuz === 'arka' ? 'arka' : 'on', cins: g.cins === 'soket' ? 'soket' : 'pin'};
};

const TUR_SIRASI: SinyalTuru[] = ['bos', ...TURLER.map((t) => t.key)];

/**
 * Paylaşım bağlantısı: seçim, görünüm ve bu konnektörün atamaları adresin #d= kısmında
 * base64url JSON olarak taşınır. # kısmı sunucuya gönderilmez; uzun pin listelerinde de
 * sunucunun adres uzunluğu sınırına takılmaz. Tür, TUR_SIRASI'ndaki sırasıyla yazılır.
 */
function kodla(secim: Secim, gorunum: Gorunum, atamalar: Atamalar): string {
  const a = Object.entries(atamalar).map(([pin, x]) => {
    const satir: (string | number)[] = [pin, x.ad, TUR_SIRASI.indexOf(x.tur)];
    if (x.not) satir.push(x.not);
    return satir;
  });
  const json = JSON.stringify({s: secim, g: gorunum, a});
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function esitAtamalar(a: Atamalar, b: Atamalar): boolean {
  const pinler = Object.keys(a);
  if (pinler.length !== Object.keys(b).length) return false;
  return pinler.every((p) => b[p] && b[p].ad === a[p].ad && b[p].tur === a[p].tur && b[p].not === a[p].not);
}

function coz(d: string): {secim: Secim; gorunum: Gorunum; atamalar: Atamalar} | undefined {
  try {
    const json = decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))));
    const v = JSON.parse(json) as {s: unknown; g: unknown; a: unknown};
    if (!Array.isArray(v.a)) return undefined;
    const ham = Object.fromEntries(
      (v.a as unknown[]).filter(Array.isArray).map((x) => {
        const [pin, ad, tur, not] = x as unknown[];
        return [String(pin), {ad, tur: typeof tur === 'number' ? TUR_SIRASI[tur] : tur, not}];
      }),
    );
    return {secim: secimTemizle(v.s), gorunum: gorunumTemizle(v.g), atamalar: atamalarTemizle(ham)};
  } catch {
    return undefined;
  }
}

function indir(blob: Blob, ad: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = ad;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Tablo satırı ---------- */

function Renk({tur, anahtar}: {tur: SinyalTuru; anahtar?: boolean}): ReactNode {
  return (
    <svg
      className={clsx(styles.renkKare, anahtar ? styles.anahtarKontak : styles[`tur_${tur}`])}
      viewBox="0 0 12 12"
      aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" rx="2" />
    </svg>
  );
}

type SatirProps = {
  kontak: Kontak;
  atama: Atama;
  secili: boolean;
  boyutVar: boolean;
  onSec: (id: string) => void;
  onDegistir: (id: string, p: Partial<Atama>) => void;
};

const PinSatiri = memo(function PinSatiri({kontak, atama, secili, boyutVar, onSec, onDegistir}: SatirProps) {
  const id = kontak.id;
  return (
    <tr data-pin={id} className={clsx(secili && styles.seciliSatir)} onClick={() => onSec(id)}>
      <td data-baslik="Pin" className={styles.pinHucre}>
        <Renk tur={atama.tur} anahtar={kontak.anahtar} />
        <b>{id}</b>
      </td>
      {boyutVar && (
        <td data-baslik="Boyut" className={styles.boyutHucre}>
          {kontak.boyut}
        </td>
      )}
      {kontak.anahtar ? (
        <td data-baslik="Sinyal" className={styles.anahtarNot} colSpan={3}>
          Anahtar konumu — pin yok
        </td>
      ) : (
        <>
          <td data-baslik="Sinyal">
            <input
              aria-label={`${id} sinyal adı`}
              data-ad-girdisi={id}
              value={atama.ad}
              maxLength={64}
              spellCheck={false}
              autoComplete="off"
              onFocus={() => onSec(id)}
              onChange={(e) => onDegistir(id, {ad: e.target.value})}
            />
          </td>
          <td data-baslik="Tür">
            <select aria-label={`${id} türü`} value={atama.tur} onFocus={() => onSec(id)} onChange={(e) => onDegistir(id, {tur: e.target.value as SinyalTuru})}>
              <option value="bos">—</option>
              {TURLER.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.ad}
                </option>
              ))}
            </select>
          </td>
          <td data-baslik="Not">
            <input
              aria-label={`${id} notu`}
              value={atama.not}
              maxLength={200}
              onFocus={() => onSec(id)}
              onChange={(e) => onDegistir(id, {not: e.target.value})}
            />
          </td>
        </>
      )}
    </tr>
  );
});

/* ---------- Ana bileşen ---------- */

export default function KonnektorTasarim(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const tabloRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);

  const [secim, setSecim] = useState<Secim>(VARSAYILAN);
  const [gorunum, setGorunum] = useState<Gorunum>(VARSAYILAN_GORUNUM);
  const [tumAtamalar, setTumAtamalar] = useState<Record<string, Atamalar>>({});
  const [secili, setSecili] = useState<string | null>(null);
  const [veri, setVeri] = useState<YerlesimVerisi | null>(null);
  const [veriHatasi, setVeriHatasi] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);
  const yuklendi = useRef(false);
  const veriIstegi = useRef(false);
  const veriUrl = useBaseUrl('/data/konnektor/mil-dtl-38999.json');

  /* ----- tam ekran (tarayıcı desteklemiyorsa ekranı kaplayan katman) ----- */
  const [tamEkran, setTamEkran] = useState(false);
  const [yedekTamEkran, setYedekTamEkran] = useState(false);
  const tamEkranda = tamEkran || yedekTamEkran;
  useEffect(() => {
    const degisti = () => {
      const acik = document.fullscreenElement === rootRef.current;
      setTamEkran(acik);
      if (acik) setYedekTamEkran(false);
    };
    document.addEventListener('fullscreenchange', degisti);
    return () => document.removeEventListener('fullscreenchange', degisti);
  }, []);
  useEffect(() => {
    if (!yedekTamEkran) return undefined;
    document.documentElement.classList.add(styles.kaydirmaKilidi);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setYedekTamEkran(false);
    document.addEventListener('keydown', esc);
    return () => {
      document.documentElement.classList.remove(styles.kaydirmaKilidi);
      document.removeEventListener('keydown', esc);
    };
  }, [yedekTamEkran]);
  const tamEkranDegistir = () => {
    const el = rootRef.current;
    if (!el) return;
    if (tamEkran) void document.exitFullscreen();
    else if (yedekTamEkran) setYedekTamEkran(false);
    else if (el.requestFullscreen && document.fullscreenEnabled) {
      el.requestFullscreen().catch(() => setYedekTamEkran(true));
      window.setTimeout(() => {
        if (!document.fullscreenElement) setYedekTamEkran(true);
      }, 600);
    } else setYedekTamEkran(true);
  };

  /* ----- paylaşılan tasarım: adresin #d= kısmından bir kez uygulanır ----- */
  const tumAtamalarRef = useRef(tumAtamalar);
  tumAtamalarRef.current = tumAtamalar;
  const paylasilaniUygula = (mevcutlar: Record<string, Atamalar>) => {
    const d = new URLSearchParams(window.location.hash.slice(1)).get('d');
    if (!d) return;
    // Adreste kalırsa her yenilemede sonraki düzenlemelerin üzerine yazar
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    const paylasilan = coz(d);
    if (!paylasilan) return;
    const anahtar = anahtarOf(paylasilan.secim);
    const mevcut = mevcutlar[anahtar];
    const yaz =
      !mevcut ||
      Object.keys(mevcut).length === 0 ||
      esitAtamalar(mevcut, paylasilan.atamalar) ||
      window.confirm('Bu bağlantıdaki pin yerleşimi, aynı konnektör için kayıtlı tasarımınızın yerine yazılsın mı?');
    setSecim(paylasilan.secim);
    setGorunum(paylasilan.gorunum);
    if (yaz) setTumAtamalar((t) => ({...t, [anahtar]: paylasilan.atamalar}));
  };

  /* ----- kayıt: önce kaydet efekti (ilk geçişte yazmaz), sonra yükle ----- */
  useEffect(() => {
    if (!yuklendi.current) return;
    try {
      window.localStorage.setItem(DEPO, JSON.stringify({v: 1, secim, gorunum, atamalar: tumAtamalar}));
    } catch {
      // gizli pencere ya da kapalı depolama: kayıt yapılmaz
    }
  }, [secim, gorunum, tumAtamalar]);

  useEffect(() => {
    const kayitli: Record<string, Atamalar> = {};
    try {
      const kayit = JSON.parse(window.localStorage.getItem(DEPO) ?? 'null') as {
        v?: number;
        secim?: unknown;
        gorunum?: unknown;
        atamalar?: Record<string, unknown>;
      } | null;
      if (kayit?.v === 1) {
        setSecim(secimTemizle(kayit.secim));
        setGorunum(gorunumTemizle(kayit.gorunum));
        for (const [anahtar, a] of Object.entries(kayit.atamalar ?? {}).slice(0, 200)) kayitli[anahtar] = atamalarTemizle(a);
        setTumAtamalar(kayitli);
      }
    } catch {
      // bozuk kayıt ya da kapalı depolama yok sayılır
    }
    paylasilaniUygula(kayitli);
    yuklendi.current = true;
    // Araç açıkken aynı sekmeye yapıştırılan bağlantı sayfayı yenilemez; yalnızca # değişir
    const hashDegisti = () => paylasilaniUygula(tumAtamalarRef.current);
    window.addEventListener('hashchange', hashDegisti);
    return () => window.removeEventListener('hashchange', hashDegisti);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----- MIL-DTL-38999 verisi yalnızca gerektiğinde yüklenir ----- */
  useEffect(() => {
    if (secim.aile !== 'd38999' || veri || veriIstegi.current || veriHatasi) return;
    veriIstegi.current = true;
    fetch(veriUrl)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<YerlesimVerisi>;
      })
      .then(setVeri)
      .catch(() => {
        veriIstegi.current = false;
        setVeriHatasi(true);
      });
  }, [secim.aile, veri, veriUrl, veriHatasi]);

  // Kayıttaki yerleşim veride yoksa varsayılana dön
  useEffect(() => {
    if (veri && !veri.yerlesimler.some((y) => y.kod === secim.kod)) setSecim((s) => ({...s, kod: VARSAYILAN.kod}));
  }, [veri, secim.kod]);

  const k: Konnektor | null = useMemo(() => {
    switch (secim.aile) {
      case 'baslik':
        return baslik(secim.sira, secim.pin, secim.aralik, secim.numara);
      case 'jtag':
        return jtag(secim.jtag);
      case 'dsub':
        return dsub(secim.dsub);
      default: {
        const y = veri?.yerlesimler.find((x) => x.kod === secim.kod);
        return y && veri ? d38999(y, veri.kaynak) : null;
      }
    }
  }, [secim, veri]);

  const atamalar: Atamalar = useMemo(
    () => (k ? (tumAtamalar[k.anahtar] ?? k.sablon ?? ATAMASIZ) : ATAMASIZ),
    [k, tumAtamalar],
  );

  // Konnektör değişince seçim temizlenir
  useEffect(() => setSecili(null), [k?.anahtar]);

  const aynala = (gorunum.cins === 'soket') !== (gorunum.yuz === 'arka');
  const r = useMemo(() => (k ? yaricaplar(k) : []), [k]);
  const enUzunAd = Math.max(0, ...Object.values(atamalar).map((a) => a.ad.length));
  const adKarakter = Math.min(24, Math.max(8, Math.ceil(enUzunAd / 4) * 4));
  const cizim = useMemo(() => (k ? cizimOlustur(k, r, aynala, adKarakter) : null), [k, r, aynala, adKarakter]);

  const gorunumAdi = `${gorunum.cins === 'pin' ? 'pin (erkek)' : 'soket (dişi)'} kontaklı, ${
    gorunum.yuz === 'on' ? 'ön (geçme) yüz' : 'arka (kablo) yüz'
  }`;

  /* ----- düzenleme ----- */
  const atamaDegistir = useCallback(
    (pin: string, p: Partial<Atama>) => {
      if (!k) return;
      setTumAtamalar((t) => {
        const mevcut = t[k.anahtar] ?? k.sablon ?? ATAMASIZ;
        const eski = mevcut[pin] ?? BOS_ATAMA;
        const yeni: Atama = {...eski, ...p};
        const digerAdlar = new Set(
          Object.entries(mevcut)
            .filter(([id, a]) => id !== pin && a.ad.trim())
            .map(([, a]) => a.ad.trim().toUpperCase()),
        );
        // Tür elle değiştirilmediyse (eski ada göre tahminle aynıysa) yeni addan tahmin edilir
        if (p.ad !== undefined && p.tur === undefined && eski.tur === turTahmini(eski.ad, digerAdlar)) {
          yeni.tur = turTahmini(yeni.ad, digerAdlar);
        }
        const sonraki: Atamalar = {...mevcut};
        if (!yeni.ad && !yeni.not && yeni.tur === 'bos') delete sonraki[pin];
        else sonraki[pin] = yeni;
        // Diferansiyel çiftin eşi daha önce düz sinyal sayıldıysa o da diferansiyel olur
        const es = yeni.tur === 'diferansiyel' ? ciftEsi(yeni.ad) : undefined;
        if (es) {
          for (const [id, a] of Object.entries(sonraki)) {
            if (id !== pin && a.tur === 'sinyal' && a.ad.trim().toUpperCase() === es) sonraki[id] = {...a, tur: 'diferansiyel'};
          }
        }
        return {...t, [k.anahtar]: sonraki};
      });
    },
    [k],
  );

  const pinSec = useCallback((id: string) => setSecili(id), []);

  // Yüzden seçilen pinin satırı, kendi kutusunda kayan tabloda görünür alana getirilir
  const yuzdenSec = useCallback(
    (id: string) => {
      setSecili(id);
      if (geo.boyut !== 'genis') return;
      const satir = tabloRef.current?.querySelector(`tr[data-pin="${CSS.escape(id)}"]`);
      satir?.scrollIntoView({block: 'nearest'});
    },
    [geo.boyut],
  );

  const tabloTusu = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const hedef = e.target as HTMLElement;
    if (e.key !== 'Enter' || !hedef.matches('input[data-ad-girdisi]')) return;
    e.preventDefault();
    const girdiler = [...(tabloRef.current?.querySelectorAll<HTMLInputElement>('input[data-ad-girdisi]') ?? [])];
    const i = girdiler.indexOf(hedef as HTMLInputElement);
    const sonraki = girdiler[i + (e.shiftKey ? -1 : 1)];
    if (sonraki) {
      sonraki.focus();
      sonraki.select();
      sonraki.closest('tr')?.scrollIntoView({block: 'nearest'});
    }
  };

  const secimDegistir = (p: Partial<Secim>) => setSecim((s) => ({...s, ...p}));

  const temizle = () => {
    if (!k) return;
    if (Object.keys(atamalar).length > 0 && !window.confirm('Bu konnektördeki tüm atamalar silinsin mi?')) return;
    setTumAtamalar((t) => ({...t, [k.anahtar]: {}}));
  };

  const sablonUygula = (a: Atamalar) => {
    if (!k) return;
    if (esitAtamalar(atamalar, a)) return;
    if (Object.keys(atamalar).length > 0 && !window.confirm('Mevcut atamaların yerine şablon yazılsın mı?')) return;
    setTumAtamalar((t) => ({...t, [k.anahtar]: {...a}}));
  };

  /* ----- dışa aktarma ----- */
  const dosyaAdi = k
    ? `pinout-${k.anahtar.replace(/[^A-Za-z0-9]+/g, '-').toLowerCase()}-${gorunum.cins}-${gorunum.yuz}`
    : 'pinout';

  const csvIndir = () => {
    if (!k) return;
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const boyutVar = k.kontaklar.some((c) => c.boyut);
    const satirlar = [
      [`# ${k.ad} — ${k.ozet}`],
      [`# Görünüm: ${gorunumAdi}`],
      ['Pin', ...(boyutVar ? ['Boyut'] : []), 'Sinyal', 'Tür', 'Not'],
      ...k.kontaklar.map((c) => {
        const a = atamalar[c.id] ?? BOS_ATAMA;
        return [c.id, ...(boyutVar ? [c.boyut ?? ''] : []), a.ad, c.anahtar ? 'Anahtar (pin yok)' : a.tur === 'bos' ? '' : TUR_ADI[a.tur], a.not];
      }),
    ];
    const csv = satirlar.map((s) => s.map(kacis).join(';')).join('\n');
    indir(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}), `${dosyaAdi}.csv`);
  };

  const svgOlustur = () => (k && cizim ? svgBelgesi(cizim, k, atamalar, gorunumAdi, ACIK) : null);

  const svgIndir = () => {
    const b = svgOlustur();
    if (b) indir(new Blob([b.svg], {type: 'image/svg+xml;charset=utf-8'}), `${dosyaAdi}.svg`);
  };

  const pngIndir = () => {
    const b = svgOlustur();
    if (!b) return;
    const url = URL.createObjectURL(new Blob([b.svg], {type: 'image/svg+xml;charset=utf-8'}));
    const img = new Image();
    img.onload = () => {
      const kat = 2;
      const tuval = document.createElement('canvas');
      tuval.width = Math.round(b.w * kat);
      tuval.height = Math.round(b.h * kat);
      const ctx = tuval.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tuval.width, tuval.height);
      ctx.drawImage(img, 0, 0, tuval.width, tuval.height);
      URL.revokeObjectURL(url);
      tuval.toBlob((blob) => blob && indir(blob, `${dosyaAdi}.png`), 'image/png');
    };
    img.src = url;
  };

  const paylas = () => {
    const url = `${window.location.origin}${window.location.pathname}#d=${kodla(secim, gorunum, atamalar)}`;
    // Pano izni yoksa (güvensiz bağlantı, odak dışı belge, eski tarayıcı) bağlantı elle kopyalanır
    const elle = () => window.prompt('Bağlantıyı kopyalayın:', url);
    if (!navigator.clipboard) {
      elle();
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 1800);
    }, elle);
  };

  /* ----- denetim ve sayılar ----- */
  const ozet = useMemo(() => {
    if (!k) return null;
    const pinler = k.kontaklar.filter((c) => !c.anahtar);
    const sayilar = new Map<SinyalTuru, number>();
    for (const c of pinler) {
      const tur = atamalar[c.id]?.tur ?? 'bos';
      sayilar.set(tur, (sayilar.get(tur) ?? 0) + 1);
    }
    const coklu = new Set<SinyalTuru>(['guc', 'toprak', 'ekran', 'nc', 'yedek']);
    const adlar = new Map<string, string[]>();
    const tumAdlar = new Set<string>();
    for (const c of pinler) {
      const a = atamalar[c.id];
      const ad = a?.ad.trim().toUpperCase();
      if (!a || !ad) continue;
      tumAdlar.add(ad);
      if (!coklu.has(a.tur)) adlar.set(ad, [...(adlar.get(ad) ?? []), c.id]);
    }
    const yinelenen = [...adlar].filter(([, ids]) => ids.length > 1);
    const eksikCift = pinler
      .filter((c) => atamalar[c.id]?.tur === 'diferansiyel')
      .map((c) => ({id: c.id, ad: atamalar[c.id].ad.trim(), es: ciftEsi(atamalar[c.id].ad)}))
      .filter((x) => x.es && !tumAdlar.has(x.es));
    const atanmis = pinler.length - (sayilar.get('bos') ?? 0);
    return {toplam: pinler.length, atanmis, sayilar, yinelenen, eksikCift};
  }, [k, atamalar]);

  /* ----- seçili pin ----- */
  const seciliKontak = k?.kontaklar.find((c) => c.id === secili);
  const seciliAtama = (secili && atamalar[secili]) || BOS_ATAMA;
  const komsuSec = (yon: 1 | -1) => {
    if (!k) return;
    const pinler = k.kontaklar.filter((c) => !c.anahtar);
    const i = pinler.findIndex((c) => c.id === secili);
    const j = i < 0 ? 0 : (i + yon + pinler.length) % pinler.length;
    yuzdenSec(pinler[j].id);
  };

  /* ----- 38999 seçicileri ----- */
  const govde38999 = Number(secim.kod.split('-')[0]);
  const govdeler = useMemo(() => [...new Set(veri?.yerlesimler.map((y) => y.govde))].sort((a, b) => a - b), [veri]);
  const govdeDegistir = (g: number) => {
    if (!veri) return;
    const no = secim.kod.split('-')[1];
    const ayni = veri.yerlesimler.find((y) => y.govde === g && y.kod.split('-')[1] === no);
    const ilk = veri.yerlesimler.find((y) => y.govde === g);
    secimDegistir({kod: (ayni ?? ilk)?.kod ?? secim.kod});
  };

  const dsubSablonlari = DSUB_SABLONLARI.filter((s) => secim.aile === 'dsub' && s.model === secim.dsub);
  const boyutVar = !!k?.kontaklar.some((c) => c.boyut);

  return (
    <div
      ref={rootRef}
      className={clsx(styles.arac, tamEkranda && styles.tamEkran)}
      data-boyut={geo.boyut}
      data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>Konnektör pin yerleşimi</span>
        <button
          type="button"
          className={clsx(styles.dugme, styles.tamEkranDugme)}
          onClick={tamEkranDegistir}
          title={tamEkranda ? 'Tam ekrandan çık (Esc)' : 'Tam ekran'}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            {tamEkranda ? <path d="M6 2v4H2M10 2v4h4M14 10h-4v4M2 10h4v4" /> : <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />}
          </svg>
          {tamEkranda ? 'Küçült' : 'Tam ekran'}
        </button>
      </div>

      {/* ---------- Konnektör seçimi ---------- */}
      <section className={styles.ayarlar} aria-label="Konnektör">
        <div className={clsx(styles.alan, styles.aileAlani)}>
          <span className={styles.etiket}>Konnektör ailesi</span>
          <div className={clsx(styles.secici, styles.aileSecici)} role="radiogroup" aria-label="Konnektör ailesi">
            {AILELER.map((a) => (
              <button
                key={a.key}
                type="button"
                role="radio"
                aria-checked={secim.aile === a.key}
                className={clsx(secim.aile === a.key && styles.secili)}
                onClick={() => secimDegistir({aile: a.key})}>
                {a.ad}
              </button>
            ))}
          </div>
        </div>

        {secim.aile === 'jtag' && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Başlık</span>
            <select value={secim.jtag} onChange={(e) => secimDegistir({jtag: e.target.value as JtagModel})}>
              {(Object.keys(JTAG) as JtagModel[]).map((m) => (
                <option key={m} value={m}>
                  {JTAG[m].ad} ({mmYaz(JTAG[m].aralik)})
                </option>
              ))}
            </select>
          </label>
        )}

        {secim.aile === 'baslik' && (
          <>
            <div className={styles.alan}>
              <span className={styles.etiket}>Sıra</span>
              <div className={styles.secici} role="radiogroup" aria-label="Sıra sayısı">
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={secim.sira === n}
                    className={clsx(secim.sira === n && styles.secili)}
                    onClick={() =>
                      secimDegistir({sira: n, pin: n === 2 ? Math.max(4, secim.pin + (secim.pin % 2)) : Math.min(40, secim.pin)})
                    }>
                    {n === 1 ? 'Tek sıra' : 'Çift sıra'}
                  </button>
                ))}
              </div>
            </div>
            <label className={styles.alan}>
              <span className={styles.etiket}>Pin sayısı</span>
              <select value={secim.pin} onChange={(e) => secimDegistir({pin: Number(e.target.value)})}>
                {Array.from({length: 39}, (_, i) => (secim.sira === 2 ? 4 + i * 2 : 2 + i)).map((n) => (
                  <option key={n} value={n}>
                    {n} pin{secim.sira === 2 ? ` (2×${n / 2})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.alan}>
              <span className={styles.etiket}>Aralık</span>
              <select value={secim.aralik} onChange={(e) => secimDegistir({aralik: Number(e.target.value)})}>
                {ARALIKLAR.map((a) => (
                  <option key={a} value={a}>
                    {mmYaz(a)}
                  </option>
                ))}
              </select>
            </label>
            {secim.sira === 2 && (
              <label className={styles.alan}>
                <span className={styles.etiket}>Numaralama</span>
                <select value={secim.numara} onChange={(e) => secimDegistir({numara: e.target.value as Numaralama})}>
                  <option value="zikzak">Zikzak (1-2 karşılıklı, IDC)</option>
                  <option value="sirali">Sıralı (her sıra kendi içinde)</option>
                </select>
              </label>
            )}
          </>
        )}

        {secim.aile === 'dsub' && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Boyut</span>
            <select value={secim.dsub} onChange={(e) => secimDegistir({dsub: e.target.value as DsubModel})}>
              {(Object.keys(DSUB) as DsubModel[]).map((m) => (
                <option key={m} value={m}>
                  {m} ({DSUB[m].siralar.reduce((a, b) => a + b, 0)} kontak)
                </option>
              ))}
            </select>
          </label>
        )}

        {secim.aile === 'd38999' && veri && (
          <>
            <label className={styles.alan}>
              <span className={styles.etiket}>Gövde boyutu</span>
              <select value={govde38999} onChange={(e) => govdeDegistir(Number(e.target.value))}>
                {[1, 0].map((tek) => (
                  <optgroup key={tek} label={seriAdi(tek)}>
                    {govdeler
                      .filter((g) => g % 2 === tek)
                      .map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className={clsx(styles.alan, styles.genisAlan)}>
              <span className={styles.etiket}>Yerleşim (insert arrangement)</span>
              <select value={secim.kod} onChange={(e) => secimDegistir({kod: e.target.value})}>
                {veri.yerlesimler
                  .filter((y) => y.govde === govde38999)
                  .map((y) => (
                    <option key={y.kod} value={y.kod}>
                      {y.kod} — {boyutOzeti(y)}
                      {y.pasif ? ' · yeni tasarımda kullanılmaz' : ''}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}

        <div className={styles.alan}>
          <span className={styles.etiket}>Kontak</span>
          <div className={styles.secici} role="radiogroup" aria-label="Kontak tipi">
            {(['pin', 'soket'] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={gorunum.cins === c}
                className={clsx(gorunum.cins === c && styles.secili)}
                onClick={() => setGorunum((g) => ({...g, cins: c}))}>
                {c === 'pin' ? 'Pin (erkek)' : 'Soket (dişi)'}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.alan}>
          <span className={styles.etiket}>Görünüm</span>
          <div className={styles.secici} role="radiogroup" aria-label="Görünüm">
            {(['on', 'arka'] as const).map((y) => (
              <button
                key={y}
                type="button"
                role="radio"
                aria-checked={gorunum.yuz === y}
                className={clsx(gorunum.yuz === y && styles.secili)}
                onClick={() => setGorunum((g) => ({...g, yuz: y}))}>
                {y === 'on' ? 'Ön yüz' : 'Arka yüz'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!k ? (
        <div className={styles.yukleniyor}>
          {veriHatasi ? (
            <>
              MIL-DTL-38999 yerleşim verisi yüklenemedi.{' '}
              <button type="button" className={styles.dugme} onClick={() => setVeriHatasi(false)}>
                Yeniden dene
              </button>
            </>
          ) : (
            'MIL-DTL-38999 yerleşimleri yükleniyor…'
          )}
        </div>
      ) : (
        <>
        <div className={styles.aracCubugu}>
          <div>
            <h3>{k.ad}</h3>
            <p className={styles.ipucu}>
              {k.ozet} · {gorunumAdi}
            </p>
          </div>
          <div className={styles.disaAktar}>
            <button type="button" className={styles.dugme} onClick={paylas}>
              {kopyalandi ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
            </button>
            <button type="button" className={styles.dugme} onClick={csvIndir} title="Pin tablosu (Excel ile açılır)">
              CSV
            </button>
            <button type="button" className={styles.dugme} onClick={svgIndir} title="Çizim ve pin listesi (vektör)">
              SVG
            </button>
            <button type="button" className={styles.dugme} onClick={pngIndir} title="Çizim ve pin listesi (resim)">
              PNG
            </button>
          </div>
        </div>
        <div className={styles.calisma}>
          {/* ---------- Yüz ---------- */}
          <section className={styles.yuzBolumu} aria-label="Konnektör yüzü">
            {cizim && (
              <Yuz
                key={k.anahtar}
                cizim={cizim}
                atamalar={atamalar}
                aynala={aynala}
                secili={secili}
                onSec={yuzdenSec}
                etiket={`${k.ad}, ${gorunumAdi}`}
              />
            )}
            <p className={styles.yuzNotu}>
              {aynala ? 'Standart çizimin (pin ön yüzü) yatay aynası. ' : 'Standart çizimle aynı yön (pin ön yüzü). '}
              {k.govde === 'daire' ? 'Üçgen ana kamayı (+Y) gösterir. ' : k.ilkPin ? 'Üçgen ve kare pad 1 numaralı pini gösterir. ' : ''}
              {k.kaynak && <>Kaynak: {k.kaynak}.</>}
            </p>
            {k.notlar && (
              <ul className={styles.notlar}>
                {k.notlar.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}

            {/* Seçili pin */}
            <div className={styles.seciliPin} aria-live="polite">
              {seciliKontak ? (
                <>
                  <div className={styles.seciliBaslik}>
                    <button type="button" className={styles.kucukDugme} onClick={() => komsuSec(-1)} aria-label="Önceki pin">
                      ‹
                    </button>
                    <span>
                      Pin <b>{seciliKontak.id}</b>
                      {seciliKontak.boyut && <> · boyut {seciliKontak.boyut}</>}
                    </span>
                    <button type="button" className={styles.kucukDugme} onClick={() => komsuSec(1)} aria-label="Sonraki pin">
                      ›
                    </button>
                  </div>
                  {seciliKontak.anahtar ? (
                    <p className={styles.ipucu}>Anahtar konumu: bu konumda pin yoktur.</p>
                  ) : (
                    <div className={styles.seciliAlanlar}>
                      <label className={styles.alan}>
                        <span className={styles.etiket}>Sinyal adı</span>
                        <input
                          value={seciliAtama.ad}
                          maxLength={64}
                          spellCheck={false}
                          autoComplete="off"
                          placeholder="ör. CAN_H"
                          onChange={(e) => atamaDegistir(seciliKontak.id, {ad: e.target.value})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              komsuSec(e.shiftKey ? -1 : 1);
                            }
                          }}
                        />
                      </label>
                      <label className={styles.alan}>
                        <span className={styles.etiket}>Tür</span>
                        <select
                          value={seciliAtama.tur}
                          onChange={(e) => atamaDegistir(seciliKontak.id, {tur: e.target.value as SinyalTuru})}>
                          <option value="bos">—</option>
                          {TURLER.map((t) => (
                            <option key={t.key} value={t.key}>
                              {t.ad}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={clsx(styles.alan, styles.notAlani)}>
                        <span className={styles.etiket}>Not</span>
                        <input
                          value={seciliAtama.not}
                          maxLength={200}
                          onChange={(e) => atamaDegistir(seciliKontak.id, {not: e.target.value})}
                        />
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <p className={styles.ipucu}>Düzenlemek için yüzde bir pine dokunun ya da tablodan seçin.</p>
              )}
            </div>

            {/* Lejant ve denetim */}
            {ozet && (
              <>
                <ul className={styles.lejant} aria-label="Sinyal türleri">
                  {(['bos', ...TURLER.map((t) => t.key)] as SinyalTuru[])
                    .filter((t) => (ozet.sayilar.get(t) ?? 0) > 0)
                    .map((t) => (
                      <li key={t}>
                        <Renk tur={t} />
                        {TUR_ADI[t]} <span className={styles.sayi}>{ozet.sayilar.get(t)}</span>
                      </li>
                    ))}
                </ul>
                <ul className={styles.denetim} aria-label="Denetim">
                  {ozet.yinelenen.map(([ad, ids]) => (
                    <li key={`y-${ad}`} className={styles.uyari}>
                      Yinelenen sinyal: <b>{ad}</b> (pin {ids.join(', ')})
                    </li>
                  ))}
                  {ozet.eksikCift.map((x) => (
                    <li key={`c-${x.id}`} className={styles.uyari}>
                      Diferansiyel eşi yok: <b>{x.ad}</b> (pin {x.id}) — {x.es} bulunamadı
                    </li>
                  ))}
                  {ozet.yinelenen.length === 0 && ozet.eksikCift.length === 0 && (
                    <li className={styles.iyi}>Yinelenen sinyal ya da eşi eksik diferansiyel çift yok.</li>
                  )}
                </ul>
              </>
            )}
          </section>

          {/* ---------- Pin tablosu ---------- */}
          <section className={styles.tabloBolumu} aria-label="Pin tablosu">
            <div className={styles.bolumBaslik}>
              <h3>
                Pin tablosu{' '}
                {ozet && (
                  <span className={styles.sayi}>
                    {ozet.atanmis}/{ozet.toplam} atanmış
                  </span>
                )}
              </h3>
              <div className={styles.araclar}>
                {k.sablon && (
                  <button type="button" className={styles.dugme} onClick={() => sablonUygula(k.sablon!)}>
                    Şablona dön
                  </button>
                )}
                {dsubSablonlari.length > 0 && (
                  <label className={styles.sablon}>
                    <span className={styles.gizli}>Şablon uygula</span>
                    <select
                      value=""
                      onChange={(e) => {
                        const s = dsubSablonlari[Number(e.target.value)];
                        if (s) sablonUygula(s.atamalar);
                      }}>
                      <option value="">Şablon uygula…</option>
                      {dsubSablonlari.map((s, i) => (
                        <option key={s.ad} value={i}>
                          {s.ad}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button type="button" className={styles.dugme} onClick={temizle}>
                  Temizle
                </button>
              </div>
            </div>
            <div ref={tabloRef} className={styles.tabloKutu} onKeyDown={tabloTusu}>
              <table className={styles.tablo}>
                <thead>
                  <tr>
                    <th>Pin</th>
                    {boyutVar && <th>Boyut</th>}
                    <th>Sinyal</th>
                    <th>Tür</th>
                    <th>Not</th>
                  </tr>
                </thead>
                <tbody>
                  {k.kontaklar.map((c) => (
                    <PinSatiri
                      key={c.id}
                      kontak={c}
                      atama={atamalar[c.id] ?? BOS_ATAMA}
                      secili={c.id === secili}
                      boyutVar={boyutVar}
                      onSec={pinSec}
                      onDegistir={atamaDegistir}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        </>
      )}
    </div>
  );
}
