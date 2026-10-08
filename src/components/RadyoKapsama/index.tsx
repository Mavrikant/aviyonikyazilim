import {useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useColorMode} from '@docusaurus/theme-common';
import type * as Leaflet from 'leaflet';

import {kanalBul, vhfKanal} from '@site/src/components/KanalTablosu/kanallar';
import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import type {NavData, Navaid} from '@site/src/components/NavigasyonHaritasi/veri';
import {ARAZI_ATIF} from './arazi';
import {GUCLU_DB, ORTA_DB, kapsamaHesapla, katmanCiz, ozetle, profilCikar} from './hesap';
import type {Palet, Sonuc} from './hesap';
import Kesit from './Kesit';
import {
  FT_M,
  NM_KM,
  eirp,
  enDusukIrtifa,
  izinVerilenKayip,
  kesitHesapla,
  mesafeYon,
  radyoUfku,
  serbestUzayMenzili,
  yogunluktanGuc,
} from './yayilim';
import type {Butce} from './yayilim';
import styles from './styles.module.css';
import leafletStyles from '../LeafletCekirdek/leaflet.module.css';

type Bilesen = 'vor' | 'dme' | 'tacan';

/**
 * Bileşen başına başlangıç değerleri. Güç ve anten kazancı AIP'de yayımlanmaz; buradakiler
 * tipik yer istasyonu değerleridir ve arayüzden değiştirilir. Güç yoğunluğu ICAO Ek 10
 * Cilt I'in kapsama içinde istediği en düşük değerdir (VOR 90 µV/m = −107 dBW/m²,
 * DME −89 dBW/m²; TACAN'ın mesafe işlevi için DME değeri kullanılır).
 */
const BILESENLER: Record<
  Bilesen,
  {ad: string; gucW: number; kazanc: number; yogunluk: number; hassasiyet: number; gucEtiketi: string}
> = {
  vor: {ad: 'VOR', gucW: 100, kazanc: 2, yogunluk: -107, hassasiyet: -93, gucEtiketi: 'Taşıyıcı gücü'},
  dme: {ad: 'DME', gucW: 1000, kazanc: 9, yogunluk: -89, hassasiyet: -83, gucEtiketi: 'Tepe darbe gücü'},
  tacan: {ad: 'TACAN', gucW: 3000, kazanc: 6, yogunluk: -89, hassasiyet: -90, gucEtiketi: 'Tepe darbe gücü'},
};

const TUR_BILESENLERI: Record<string, Bilesen[]> = {
  VOR: ['vor'],
  'VOR-DME': ['vor', 'dme'],
  VORTAC: ['vor', 'tacan'],
  TACAN: ['tacan'],
  DME: ['dme'],
  'NDB-DME': ['dme'],
};

const TUR_ADI: Record<string, string> = {
  'VOR-DME': 'VOR/DME',
  'NDB-DME': 'NDB/DME',
};

/** Uçağın dinlediği frekans, MHz: VOR'da VHF frekansı, DME/TACAN'da kanalın cevap frekansı */
function frekansOf(n: Navaid, b: Bilesen): number | undefined {
  if (b === 'vor') return n.freq ? n.freq / 1000 : undefined;
  const kanal = (n.ch && kanalBul(n.ch)) || (n.freq && n.type !== 'NDB-DME' ? vhfKanal(n.freq) : undefined);
  return kanal?.cevap;
}

// Görüntü pikselleri CSS değişkeni okuyamaz; lejanttaki --rk-* değerleriyle aynı tutulur.
const PALETLER: Record<'light' | 'dark', Palet> = {
  light: {
    guclu: [23, 73, 122, 150],
    orta: [79, 147, 207, 150],
    sinir: [216, 154, 61, 170],
    arazi: [107, 122, 138, 120],
  },
  dark: {
    guclu: [133, 183, 230, 150],
    orta: [74, 127, 179, 150],
    sinir: [255, 198, 92, 170],
    arazi: [129, 147, 166, 120],
  },
};

const TURKIYE: [[number, number], [number, number]] = [
  [35.8, 25.6],
  [42.2, 44.9],
];
const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları';
const TAVAN_FT = 60000;
const VARSAYILAN_ISTASYON = 'ESB';
/** Hesap yarıçapı 10 NM'nin katlarına yuvarlanır, km */
const ON_NM = 10 * NM_KM;

const sayi = (v: number, ondalik = 0) =>
  v.toLocaleString('tr-TR', {minimumFractionDigits: ondalik, maximumFractionDigits: ondalik});
const nm = (km: number) => sayi(km / NM_KM);
const ft = (m: number) => sayi(Math.round(m / FT_M / 10) * 10);
const derece = (v: number) => `${String(Math.round(v) % 360).padStart(3, '0')}°`;
const sikistir = (v: number, alt: number, ust: number) => Math.min(ust, Math.max(alt, v));

type SayiProps = {
  etiket: string;
  deger: number;
  degistir: (v: number) => void;
  min: number;
  max: number;
  adim: number;
};

/** Sayı kutusu: yazarken kutu boşaltılabilir, geçerli değer girilince üst duruma aktarılır */
function Sayi({etiket, deger, degistir, min, max, adim}: SayiProps): ReactNode {
  const [metin, setMetin] = useState(String(deger));
  useEffect(() => {
    setMetin((eski) => (Number(eski) === deger ? eski : String(deger)));
  }, [deger]);
  return (
    <label className={styles.alan}>
      <span className={styles.etiket}>{etiket}</span>
      <input
        type="number"
        inputMode="decimal"
        value={metin}
        min={min}
        max={max}
        step={adim}
        onChange={(e) => {
          setMetin(e.target.value);
          const v = e.target.valueAsNumber;
          if (Number.isFinite(v)) degistir(sikistir(v, min, max));
        }}
        onBlur={() => setMetin(String(deger))}
      />
    </label>
  );
}

type Durum =
  | {tur: 'bekliyor'}
  | {tur: 'arazi' | 'hesap'; oran: number}
  | {tur: 'hazir'}
  | {tur: 'hata'; ileti: string};

export default function RadyoKapsama(): ReactNode {
  const dataUrl = useBaseUrl('/data/turkiye-navigasyon.json');
  const {colorMode} = useColorMode();

  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const mapEl = useRef<HTMLDivElement>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const tileRef = useRef<Leaflet.TileLayer | null>(null);
  const isaretRef = useRef<Leaflet.LayerGroup | null>(null);
  const kapsamaRef = useRef<Leaflet.LayerGroup | null>(null);
  const noktaRef = useRef<Leaflet.LayerGroup | null>(null);
  const oturanRef = useRef<string | null>(null);
  const bekleyenSinirRef = useRef<Leaflet.LatLngBoundsExpression | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [data, setData] = useState<NavData | null>(null);
  const [veriHatasi, setVeriHatasi] = useState<string | null>(null);
  const [kod, setKod] = useState(VARSAYILAN_ISTASYON);
  const [bilesenSecimi, setBilesenSecimi] = useState<Bilesen>('vor');
  const [irtifaFt, setIrtifaFt] = useState(10000);
  const [direk, setDirek] = useState(10);
  const [butce, setButce] = useState<Butce>({
    gucW: BILESENLER.vor.gucW,
    vericiKazanc: BILESENLER.vor.kazanc,
    esik: 'ek10',
    yogunluk: BILESENLER.vor.yogunluk,
    aliciKazanc: 0,
    aliciKayip: 3,
    hassasiyet: BILESENLER.vor.hassasiyet,
  });
  const [arazili, setArazili] = useState(false);
  const [nokta, setNokta] = useState<[number, number] | null>(null);
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [durum, setDurum] = useState<Durum>({tur: 'bekliyor'});
  const [deneme, setDeneme] = useState(0);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [tamEkran, setTamEkran] = useState(false);
  // Tarayıcı tam ekranı desteklemiyorsa (ör. iPhone Safari) bileşen ekranı kaplayan katmana dönüşür
  const [yedekTamEkran, setYedekTamEkran] = useState(false);
  const tamEkranda = tamEkran || yedekTamEkran;

  // ---------- Veri ----------
  useEffect(() => {
    let vazgecildi = false;
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NavData>;
      })
      .then((json) => !vazgecildi && setData(json))
      .catch((err: Error) => !vazgecildi && setVeriHatasi(err.message));
    return () => {
      vazgecildi = true;
    };
  }, [dataUrl]);

  const istasyonlar = useMemo(
    () =>
      (data?.navaids ?? [])
        .filter((n) => (TUR_BILESENLERI[n.type] ?? []).some((b) => frekansOf(n, b) !== undefined))
        .sort((a, b) => a.ident.localeCompare(b.ident, 'tr')),
    [data],
  );

  const istasyon = useMemo(
    () => istasyonlar.find((n) => n.ident === kod) ?? istasyonlar[0],
    [istasyonlar, kod],
  );
  const bilesenler = istasyon ? TUR_BILESENLERI[istasyon.type].filter((b) => frekansOf(istasyon, b)) : [];
  const bilesen = bilesenler.includes(bilesenSecimi) ? bilesenSecimi : (bilesenler[0] ?? 'vor');
  const fMHz = istasyon ? frekansOf(istasyon, bilesen) : undefined;

  // Bileşen değişince güç, kazanç ve eşik o bileşenin tipik değerlerine döner
  const oncekiBilesen = useRef(bilesen);
  useEffect(() => {
    if (oncekiBilesen.current === bilesen) return;
    oncekiBilesen.current = bilesen;
    const b = BILESENLER[bilesen];
    setButce((eski) => ({
      ...eski,
      gucW: b.gucW,
      vericiKazanc: b.kazanc,
      yogunluk: b.yogunluk,
      hassasiyet: b.hassasiyet,
    }));
  }, [bilesen]);

  // ---------- Adresten başlangıç durumu ----------
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ist = p.get('ist')?.toUpperCase();
    const b = p.get('b');
    const irt = Number(p.get('irt'));
    const n = p.get('n')?.split(',').map(Number);
    if (ist) setKod(ist);
    if (b === 'vor' || b === 'dme' || b === 'tacan') setBilesenSecimi(b);
    if (p.has('irt') && Number.isFinite(irt)) setIrtifaFt(sikistir(Math.round(irt), 0, TAVAN_FT));
    if (n && n.length === 2 && n.every(Number.isFinite)) setNokta([n[0], n[1]]);
  }, []);

  // ---------- Bağlantı bütçesi ve hesap yarıçapı ----------
  const hAlici = irtifaFt * FT_M;
  const izin = fMHz ? izinVerilenKayip(butce, fMHz) : 0;
  const yaricapKm = useMemo(() => {
    if (!istasyon || !fMHz) return 0;
    // Arazi inmeden anten rakımı bilinmeyebilir; yarıçap için yüksek bir tahmin yeter
    const tahmin = (istasyon.elevM ?? 1500) + direk;
    const ufuk = radyoUfku(tahmin, hAlici) * 1.15 + 20;
    const km = sikistir(Math.min(ufuk, serbestUzayMenzili(izin, fMHz)), 30, 500);
    return Math.ceil(km / ON_NM) * ON_NM;
  }, [istasyon, fMHz, direk, hAlici, izin]);

  // ---------- Hesap ----------
  const izinRef = useRef(izin);
  izinRef.current = izin;
  useEffect(() => {
    if (!istasyon || !fMHz || !yaricapKm) return undefined;
    const iptal = {iptal: false};
    const ilerleme = (asama: 'arazi' | 'hesap', oran: number) => setDurum({tur: asama, oran});
    const girdi = {
      lat: istasyon.lat,
      lon: istasyon.lon,
      antenRakimi: istasyon.elevM,
      direk,
      hAlici,
      fMHz,
      yaricapKm,
    };
    const calistir = async () => {
      const kaba = await kapsamaHesapla(girdi, iptal, ilerleme);
      if (!kaba) return;
      setSonuc(kaba);
      // Yarıçap deniz seviyesine göre seçilir; yüksek arazide kapsama çok daha dardır. O zaman
      // hesap, sinyalin ulaştığı alana daraltılıp daha ince arazi çözünürlüğüyle yinelenir.
      const dar = Math.ceil((ozetle(kaba, izinRef.current).enUzakKm * 1.3 + 10) / ON_NM) * ON_NM;
      if (dar < 0.7 * yaricapKm) {
        const ince = await kapsamaHesapla({...girdi, yaricapKm: dar}, iptal, ilerleme);
        if (!ince) return;
        setSonuc(ince);
      }
      setDurum({tur: 'hazir'});
    };
    const zamanlayici = window.setTimeout(() => {
      calistir().catch((err: Error) => !iptal.iptal && setDurum({tur: 'hata', ileti: err.message}));
    }, 300);
    return () => {
      iptal.iptal = true;
      window.clearTimeout(zamanlayici);
    };
  }, [istasyon, fMHz, direk, hAlici, yaricapKm, deneme]);

  // Sonuç başka bir istasyona aitse (yenisi hesaplanırken) gösterilmez
  const guncel = sonuc && istasyon && sonuc.girdi.lat === istasyon.lat && sonuc.girdi.lon === istasyon.lon ? sonuc : null;
  const ozet = useMemo(() => (guncel ? ozetle(guncel, izin) : null), [guncel, izin]);

  // Güç ya da eşik değişip kapsama daraltılmış hesap sınırına dayanırsa hesap yeniden yapılır
  const hesapKm = guncel ? guncel.izgara.n * guncel.izgara.adimKm : 0;
  const sinirda =
    !!guncel &&
    !!ozet &&
    durum.tur === 'hazir' &&
    hesapKm < yaricapKm - 1 &&
    ozet.enUzakKm >= hesapKm - 2 * guncel.izgara.adimKm;
  useEffect(() => {
    if (sinirda) setDeneme((d) => d + 1);
  }, [sinirda]);

  const noktaSonucu = useMemo(() => {
    if (!guncel || !nokta) return null;
    // Yenisi hesaplanırken eldeki sonuç kendi frekansıyla okunur
    const {fMHz} = guncel.girdi;
    const {km, yon} = mesafeYon(guncel.girdi.lat, guncel.girdi.lon, nokta[0], nokta[1]);
    if (km < 1 || km > 600) return null;
    const {h, adimKm} = profilCikar(guncel, yon, km);
    const {hVerici} = guncel.izgara;
    const kesit = kesitHesapla(h, adimKm, hVerici, guncel.girdi.hAlici, fMHz);
    return {
      km,
      yon,
      kesit,
      pay: izin - kesit.serbest - kesit.kirinim,
      enDusuk: enDusukIrtifa(h, adimKm, hVerici, fMHz, izin, TAVAN_FT * FT_M),
      zemin: h[h.length - 1],
    };
  }, [guncel, nokta, izin]);

  // Harita kabı henüz ölçülmediyse (sıfır boyut) oturtma, ilk geçerli ölçüme kadar bekletilir
  const oturt = () => {
    const map = mapRef.current;
    const sinirlar = bekleyenSinirRef.current;
    if (!map || !sinirlar) return;
    const boyut = map.getSize();
    if (boyut.x < 50 || boyut.y < 50) return;
    bekleyenSinirRef.current = null;
    map.fitBounds(sinirlar, {padding: [8, 8], animate: false});
  };
  const oturtRef = useRef(oturt);
  oturtRef.current = oturt;

  // ---------- Harita kurulumu ----------
  useEffect(() => {
    let birakildi = false;
    let gozlemci: ResizeObserver | undefined;
    import('leaflet').then((mod) => {
      if (birakildi || !mapEl.current) return;
      const L = (mod.default ?? mod) as typeof Leaflet;
      LRef.current = L;
      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 13,
        maxBounds: [
          [20, 5],
          [55, 65],
        ],
      });
      L.control
        .attribution({position: 'bottomright', prefix: '<a href="https://leafletjs.com">Leaflet</a>'})
        .addAttribution(ARAZI_ATIF)
        .addTo(map);
      L.control.zoom({position: 'bottomright', zoomInTitle: 'Yakınlaştır', zoomOutTitle: 'Uzaklaştır'}).addTo(map);
      L.control.scale({position: 'bottomleft', imperial: false}).addTo(map);
      map.fitBounds(TURKIYE);
      gozlemci = new ResizeObserver(() => {
        map.invalidateSize({pan: true, animate: false});
        oturtRef.current();
      });
      gozlemci.observe(mapEl.current);
      map.on('click', (e: Leaflet.LeafletMouseEvent) => setNokta([e.latlng.lat, e.latlng.lng]));
      // Alttan üste: kapsama görüntüsü, seçilen nokta, istasyon işaretleri
      kapsamaRef.current = L.layerGroup().addTo(map);
      noktaRef.current = L.layerGroup().addTo(map);
      isaretRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });
    return () => {
      birakildi = true;
      gozlemci?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      tileRef.current = null;
      setMapReady(false);
    };
  }, []);

  // ---------- Altlık ----------
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;
    tileRef.current?.remove();
    tileRef.current = arazili
      ? L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: `${OSM_ATTR}, SRTM | © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`,
        })
      : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: OSM_ATTR,
          className: leafletStyles.sade,
        });
    tileRef.current.addTo(map).bringToBack();
  }, [arazili, mapReady]);

  // ---------- İstasyon işaretleri ----------
  useEffect(() => {
    const L = LRef.current;
    const grup = isaretRef.current;
    if (!L || !grup || !mapReady) return;
    grup.clearLayers();
    for (const n of istasyonlar) {
      const secili = n === istasyon;
      L.circleMarker([n.lat, n.lon], {
        radius: secili ? 7 : 4,
        className: secili ? styles.isaretSecili : styles.isaret,
        bubblingMouseEvents: false,
      })
        .bindTooltip(`${n.ident} · ${TUR_ADI[n.type] ?? n.type}`, {direction: 'top', className: styles.ipucu})
        .on('click', () => setKod(n.ident))
        .addTo(grup);
    }
  }, [istasyonlar, istasyon, mapReady]);

  // ---------- Kapsama katmanı ----------
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const grup = kapsamaRef.current;
    if (!L || !map || !grup || !mapReady) return;
    grup.clearLayers();
    if (!guncel || !istasyon) return;
    const {sinir, girdi, izgara} = guncel;
    const sinirlar: Leaflet.LatLngBoundsExpression = [
      [sinir.guney, sinir.bati],
      [sinir.kuzey, sinir.dogu],
    ];
    L.imageOverlay(katmanCiz(guncel, izin, PALETLER[colorMode]), sinirlar, {
      interactive: false,
      className: styles.kapsamaGoruntusu,
      attribution: data
        ? `İstasyon: <a href="${data.aip.url}">AIP Türkiye</a> © DHMİ${data.aip.amdt ? ` (AMDT ${data.aip.amdt})` : ''}`
        : undefined,
    }).addTo(grup);
    L.circle([girdi.lat, girdi.lon], {
      radius: izgara.n * izgara.adimKm * 1000,
      className: styles.hesapSiniri,
      interactive: false,
    }).addTo(grup);
    if (istasyon.cov) {
      L.circle([girdi.lat, girdi.lon], {
        radius: istasyon.cov * NM_KM * 1000,
        className: styles.yayimlanan,
        interactive: false,
      }).addTo(grup);
    }
    // İstasyon ya da hesap yarıçapı değişince harita hesap dairesine oturtulur; öbür ayarlarda yerinde kalır
    const oturan = `${istasyon.ident}/${izgara.n * izgara.adimKm}`;
    if (oturanRef.current !== oturan) {
      oturanRef.current = oturan;
      bekleyenSinirRef.current = sinirlar;
      oturt();
    }
  }, [guncel, izin, colorMode, istasyon, data, mapReady]);

  // ---------- Seçilen nokta ----------
  useEffect(() => {
    const L = LRef.current;
    const grup = noktaRef.current;
    if (!L || !grup || !mapReady) return;
    grup.clearLayers();
    if (!nokta || !istasyon) return;
    L.polyline([[istasyon.lat, istasyon.lon], nokta], {className: styles.noktaHatti, interactive: false}).addTo(grup);
    L.circleMarker(nokta, {radius: 6, className: styles.noktaIsareti, interactive: false}).addTo(grup);
  }, [nokta, istasyon, mapReady]);

  // ---------- Tam ekran ----------
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

  const paylas = () => {
    if (!istasyon) return;
    const p = new URLSearchParams({ist: istasyon.ident, b: bilesen, irt: String(irtifaFt)});
    if (nokta) p.set('n', `${nokta[0].toFixed(4)},${nokta[1].toFixed(4)}`);
    const url = `${window.location.origin}${window.location.pathname}?${p}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 1800);
    });
  };

  const b = BILESENLER[bilesen];
  const esikDbm = fMHz ? (butce.esik === 'ek10' ? yogunluktanGuc(butce.yogunluk, fMHz) : butce.hassasiyet) : 0;
  const ufukKm = guncel ? radyoUfku(guncel.izgara.hVerici, guncel.girdi.hAlici) : 0;
  const mesgul = durum.tur === 'arazi' || durum.tur === 'hesap';

  return (
    <div
      ref={rootRef}
      className={clsx(styles.arac, leafletStyles.leaflet, tamEkranda && styles.tamEkran)}
      data-boyut={geo.boyut}
      data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>Radyo kapsama alanı</span>
        <div className={styles.dugmeler}>
          <button type="button" className={styles.dugme} onClick={paylas} disabled={!istasyon}>
            {kopyalandi ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
          <button
            type="button"
            className={clsx(styles.dugme, styles.tamEkranDugme)}
            onClick={tamEkranDegistir}
            title={tamEkranda ? 'Tam ekrandan çık (Esc)' : 'Tam ekran'}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {tamEkranda ? (
                <path d="M6 2v4H2M10 2v4h4M14 10h-4v4M2 10h4v4" />
              ) : (
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
              )}
            </svg>
            {tamEkranda ? 'Küçült' : 'Tam ekran'}
          </button>
        </div>
      </div>

      {/* ---------- Ayarlar ---------- */}
      <section className={styles.ayarlar} aria-label="Kapsama ayarları">
        <label className={clsx(styles.alan, styles.genisAlan)}>
          <span className={styles.etiket}>İstasyon</span>
          <select value={istasyon?.ident ?? ''} onChange={(e) => setKod(e.target.value)} disabled={!istasyon}>
            {istasyonlar.map((n) => (
              <option key={n.ident + n.type} value={n.ident}>
                {n.ident} · {n.name ?? ''} ({TUR_ADI[n.type] ?? n.type})
              </option>
            ))}
          </select>
        </label>
        <div className={styles.alan}>
          <span className={styles.etiket}>Bileşen</span>
          <div className={styles.secici} role="group" aria-label="İstasyon bileşeni">
            {(bilesenler.length > 0 ? bilesenler : (['vor'] as Bilesen[])).map((x) => (
              <button
                key={x}
                type="button"
                className={clsx(x === bilesen && styles.secili)}
                aria-pressed={x === bilesen}
                onClick={() => setBilesenSecimi(x)}>
                {BILESENLER[x].ad}
              </button>
            ))}
          </div>
        </div>
        <Sayi etiket="Uçak irtifası (ft)" deger={irtifaFt} degistir={setIrtifaFt} min={0} max={TAVAN_FT} adim={500} />
        <Sayi
          etiket={`${b.gucEtiketi} (W)`}
          deger={butce.gucW}
          degistir={(gucW) => setButce({...butce, gucW})}
          min={0.1}
          max={100000}
          adim={10}
        />
        <Sayi
          etiket="Verici anten kazancı (dBi)"
          deger={butce.vericiKazanc}
          degistir={(vericiKazanc) => setButce({...butce, vericiKazanc})}
          min={-20}
          max={30}
          adim={0.5}
        />
        <Sayi etiket="Anten direği (m)" deger={direk} degistir={setDirek} min={0} max={100} adim={1} />
        <label className={clsx(styles.alan, styles.genisAlan)}>
          <span className={styles.etiket}>Eşik</span>
          <select
            value={butce.esik}
            onChange={(e) => setButce({...butce, esik: e.target.value as Butce['esik']})}>
            <option value="ek10">ICAO Ek 10 en az sinyal ({sayi(butce.yogunluk)} dBW/m²)</option>
            <option value="alici">Alıcı hassasiyeti (elle)</option>
          </select>
        </label>
        {butce.esik === 'alici' && (
          <>
            <Sayi
              etiket="Alıcı hassasiyeti (dBm)"
              deger={butce.hassasiyet}
              degistir={(hassasiyet) => setButce({...butce, hassasiyet})}
              min={-130}
              max={-30}
              adim={1}
            />
            <Sayi
              etiket="Uçak anten kazancı (dBi)"
              deger={butce.aliciKazanc}
              degistir={(aliciKazanc) => setButce({...butce, aliciKazanc})}
              min={-20}
              max={20}
              adim={0.5}
            />
            <Sayi
              etiket="Uçak kablo kaybı (dB)"
              deger={butce.aliciKayip}
              degistir={(aliciKayip) => setButce({...butce, aliciKayip})}
              min={0}
              max={30}
              adim={0.5}
            />
          </>
        )}
      </section>

      {/* ---------- Özet ---------- */}
      <dl className={styles.ozet} aria-live="polite">
        <div>
          <dt>Frekans</dt>
          <dd>{fMHz ? `${sayi(fMHz, bilesen === 'vor' ? 2 : 0)} MHz` : '—'}</dd>
        </div>
        <div>
          <dt>EIRP</dt>
          <dd>{sayi(eirp(butce), 1)} dBm</dd>
        </div>
        <div>
          <dt>Eşik (izotropik)</dt>
          <dd>{sayi(esikDbm, 1)} dBm</dd>
        </div>
        <div>
          <dt>Katlanılan yol kaybı</dt>
          <dd>{sayi(izin, 1)} dB</dd>
        </div>
        <div>
          <dt>Anten rakımı</dt>
          <dd>
            {guncel
              ? `${sayi(guncel.izgara.hVerici)} m (${guncel.aipRakimi ? 'AIP' : `arazi + ${sayi(direk)} m`})`
              : '—'}
          </dd>
        </div>
        <div>
          <dt>Arazisiz radyo ufku</dt>
          <dd>{guncel ? `${nm(ufukKm)} NM` : '—'}</dd>
        </div>
        <div>
          <dt>En uzak alım</dt>
          <dd>{ozet ? `${nm(ozet.enUzakKm)} NM` : '—'}</dd>
        </div>
        <div>
          <dt>Her yönde kesintisiz</dt>
          <dd>{ozet ? `${nm(ozet.kesintisizKm)} NM (${derece(ozet.kesintisizYon)} yönünde kesilir)` : '—'}</dd>
        </div>
        <div>
          <dt>Kapsanan alan</dt>
          <dd>
            {ozet ? `${sayi(ozet.alanKm2)} km² (hesap dairesinde %${sayi((100 * ozet.alanKm2) / ozet.toplamKm2)})` : '—'}
          </dd>
        </div>
        {istasyon?.cov && (
          <div>
            <dt>AIP'de yayımlanan</dt>
            <dd>{sayi(istasyon.cov)} NM</dd>
          </div>
        )}
      </dl>

      {/* ---------- Harita ---------- */}
      <div className={styles.govde}>
        <div ref={mapEl} className={styles.haritaAlan} />
        {(mesgul || durum.tur === 'hata' || veriHatasi) && (
          <div className={styles.durum} role="status">
            {veriHatasi && <span>İstasyon verisi yüklenemedi ({veriHatasi}).</span>}
            {durum.tur === 'arazi' && <span>Arazi indiriliyor… %{sayi(durum.oran * 100)}</span>}
            {durum.tur === 'hesap' && <span>Kapsama hesaplanıyor… %{sayi(durum.oran * 100)}</span>}
            {durum.tur === 'hata' && (
              <>
                <span>Arazi verisi indirilemedi ({durum.ileti}).</span>
                <button type="button" className={styles.dugme} onClick={() => setDeneme((d) => d + 1)}>
                  Yeniden dene
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.lejant}>
        <span className={styles.lejantOge}>
          <i className={styles.renkGuclu} /> Pay ≥ {GUCLU_DB} dB
        </span>
        <span className={styles.lejantOge}>
          <i className={styles.renkOrta} /> {ORTA_DB}–{GUCLU_DB} dB
        </span>
        <span className={styles.lejantOge}>
          <i className={styles.renkSinir} /> 0–{ORTA_DB} dB (sınırda)
        </span>
        <span className={styles.lejantOge}>
          <i className={styles.renkArazi} /> Arazi uçak irtifasının üstünde
        </span>
        <span className={styles.lejantOge}>
          <i className={styles.cizgiSinir} /> Hesap sınırı
        </span>
        {istasyon?.cov && (
          <span className={styles.lejantOge}>
            <i className={styles.cizgiYayimlanan} /> AIP kapsaması
          </span>
        )}
        <label className={styles.onay}>
          <input type="checkbox" checked={arazili} onChange={(e) => setArazili(e.target.checked)} /> Arazi altlığı
        </label>
      </div>

      {/* ---------- Seçilen nokta ---------- */}
      <section className={styles.nokta} aria-label="Seçilen nokta">
        {!noktaSonucu || !istasyon || !fMHz || !guncel ? (
          <p className={styles.ipucuMetni}>
            Haritada bir noktaya tıklayın: istasyonla o nokta arasındaki arazi kesiti, yol kaybı ve sinyalin
            alınmaya başladığı en düşük irtifa burada gösterilir. Başka bir istasyon seçmek için işaretine tıklayın.
          </p>
        ) : (
          <>
            <div className={styles.noktaBaslik}>
              <strong>
                {istasyon.ident} → {nm(noktaSonucu.km)} NM, {derece(noktaSonucu.yon)} (gerçek)
                {bilesen === 'vor' &&
                  istasyon.var !== undefined &&
                  ` · radyal ${derece(noktaSonucu.yon - istasyon.var + 360)}`}
              </strong>
              <span
                className={clsx(
                  styles.rozet,
                  noktaSonucu.kesit.araziAltinda || noktaSonucu.pay < 0 ? styles.rozetYok : styles.rozetVar,
                )}>
                {noktaSonucu.kesit.araziAltinda
                  ? 'İrtifa arazinin altında'
                  : noktaSonucu.pay < 0
                    ? 'Sinyal alınmaz'
                    : 'Sinyal alınır'}
              </span>
              <button type="button" className={styles.dugme} onClick={() => setNokta(null)}>
                Noktayı kaldır
              </button>
            </div>
            <dl className={styles.ozet}>
              <div>
                <dt>Serbest uzay kaybı</dt>
                <dd>{sayi(noktaSonucu.kesit.serbest, 1)} dB</dd>
              </div>
              <div>
                <dt>Kırınım kaybı</dt>
                <dd>{sayi(noktaSonucu.kesit.kirinim, 1)} dB</dd>
              </div>
              <div>
                <dt>Pay</dt>
                <dd>{noktaSonucu.kesit.araziAltinda ? '—' : `${sayi(noktaSonucu.pay, 1)} dB`}</dd>
              </div>
              <div>
                <dt>Görüş hattı</dt>
                <dd>
                  {noktaSonucu.kesit.gorus
                    ? noktaSonucu.kesit.fresnel >= 0.6
                      ? 'açık'
                      : 'açık, Fresnel bölgesi daralmış'
                    : 'araziyle kesiliyor'}
                </dd>
              </div>
              <div>
                <dt>Noktada arazi</dt>
                <dd>{ft(noktaSonucu.zemin)} ft</dd>
              </div>
              <div>
                <dt>En düşük alım irtifası</dt>
                <dd>
                  {noktaSonucu.enDusuk === undefined
                    ? `${sayi(TAVAN_FT)} ft'e kadar alınmaz`
                    : `${ft(noktaSonucu.enDusuk)} ft`}
                </dd>
              </div>
            </dl>
            <Kesit
              kesit={noktaSonucu.kesit}
              hVerici={guncel.izgara.hVerici}
              hAlici={guncel.girdi.hAlici}
              fMHz={fMHz}
              istasyon={istasyon.ident}
            />
          </>
        )}
      </section>
    </div>
  );
}
