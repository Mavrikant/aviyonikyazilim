import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent, ReactNode} from 'react';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type * as Leaflet from 'leaflet';

import {playMorse} from './mors-ses';
import {airportSymbol, NAVAID_SYMBOLS} from './semboller';
import useGeometri from './useGeometri';
import {
  AIP_ENR41,
  AIP_HOME,
  AIRPORT_TYPE_LABELS,
  aipAd,
  DEFAULT_LAYERS,
  LAYERS,
  NAVAID_TYPE_LABELS,
  airportLayer,
  bearingDeg,
  coverage,
  destination,
  distanceNm,
  featureKey,
  featureLayer,
  featureLayers,
  featureTitle,
  featureVisible,
  formatDecimal,
  formatDms,
  formatElevation,
  formatElevationM,
  formatComFreq,
  formatFrequency,
  formatKm,
  formatLength,
  formatMHz,
  formatNm,
  formatVariation,
  formatDeg,
  formatFt,
  GP_KAPSAMA,
  gpCoverage,
  heightFt,
  ilsLabel,
  LOC_KAPSAMA,
  locCoverage,
  morse,
  navaidLayer,
  navaidLayers,
  normalize,
  pad3,
  powerLabel,
  searchText,
  SERVICE_LABELS,
  surfaceLabel,
  usageLabel,
} from './veri';
import type {Airport, Feature, IlsItem, LayerKey, NavData, Navaid} from './veri';
import styles from './styles.module.css';

/** Gömme sayfasının yolu (src/pages/gom/navigasyon-haritasi.tsx) */
export const EMBED_PATH = '/gom/navigasyon-haritasi';

const TURKEY_BOUNDS: [[number, number], [number, number]] = [
  [35.8, 25.6],
  [42.2, 44.9],
];

type Basemap = 'oto' | 'osm' | 'topo';

const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları';

const BASEMAPS: Record<Basemap, {label: string}> = {
  oto: {label: 'Sade (temaya göre)'},
  osm: {label: 'OpenStreetMap'},
  topo: {label: 'Arazi (OpenTopoMap)'},
};

function tileConfig(basemap: Basemap): {url: string; options: Leaflet.TileLayerOptions} {
  if (basemap === 'topo') {
    return {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 17,
        attribution: `${OSM_ATTR}, SRTM | © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)`,
      },
    };
  }
  // "Sade" altlık da OpenStreetMap karolarıdır; renkleri CSS filtresiyle
  // bastırılır (koyu temada ters çevrilir), böylece anahtar gerektiren ek bir servis kullanılmaz.
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {maxZoom: 19, attribution: OSM_ATTR, className: basemap === 'oto' ? styles.sade : undefined},
  };
}

type Props = {
  /** Gömme (iframe) görünümü: kompakt araç çubuğu, tam pencere yüksekliği */
  gomulu?: boolean;
};

type Initial = {
  center?: [number, number];
  zoom?: number;
  layers: LayerKey[];
  selected?: string;
  basemap: Basemap;
};

function readInitial(): Initial {
  const p = new URLSearchParams(window.location.search);
  const lat = Number(p.get('lat'));
  const lon = Number(p.get('lon'));
  const z = Number(p.get('z'));
  const valid = new Set<string>(LAYERS.map((l) => l.key));
  const layers = p
    .get('katman')
    ?.split(',')
    .filter((k): k is LayerKey => valid.has(k));
  const basemap = p.get('altlik');
  return {
    center: p.has('lat') && p.has('lon') && Number.isFinite(lat) && Number.isFinite(lon) ? [lat, lon] : undefined,
    zoom: p.has('z') && Number.isFinite(z) ? Math.min(18, Math.max(4, z)) : undefined,
    layers: layers && layers.length > 0 ? layers : DEFAULT_LAYERS,
    selected: p.get('secili')?.toUpperCase() || undefined,
    basemap: basemap === 'osm' || basemap === 'topo' ? basemap : 'oto',
  };
}

/** LLZ/eşik işareti: küçük içi dolu baklava */
const ILS_SYMBOL =
  '<svg viewBox="-12 -12 24 24" width="12" height="12" aria-hidden="true"><path d="M0 -7L5 0L0 7L-5 0Z" class="dolu"/></svg>';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]!);

function longestRunwayHeading(a: Airport): number | undefined {
  const rwy = (a.rwy ?? []).filter((r) => !r.closed && r.hdg !== undefined);
  rwy.sort((x, y) => (y.len ?? 0) - (x.len ?? 0));
  return rwy[0]?.hdg;
}

function position(f: Feature): [number, number] {
  return [f.item.lat, f.item.lon];
}

const FEATHER_NM = 8; // ILS "tüy" sembolünün uzunluğu
const FEATHER_HALF_DEG = 2.5;

/**
 * ILS kayıtlarını haritaya hazırlar: eşik noktası GP anteninden (yoksa OurAirports
 * pist ucundan) alınır; yaklaşma rotası eşikten LLZ antenine olan gerçek yöndür.
 */
function ilsItems(data: NavData): IlsItem[] {
  const byIcao = new Map(data.airports.filter((a) => a.icao).map((a) => [a.icao!, a]));
  return data.ils.map((x) => {
    const apt = byIcao.get(x.apt);
    let thr = x.gp;
    if (!thr && x.rwy) {
      for (const r of apt?.rwy ?? []) {
        const i = r.id.split('/').indexOf(x.rwy);
        if (i >= 0 && r.ends) {
          thr = r.ends[i];
          break;
        }
      }
    }
    const crs = thr ? bearingDeg(thr[0], thr[1], x.llz[0], x.llz[1]) : undefined;
    const [lat, lon] = thr ?? x.llz;
    return {...x, lat, lon, crs, name: apt?.name ?? x.apt, aptElev: apt?.elev};
  });
}

export default function NavigasyonHaritasi({gomulu = false}: Props): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const dataUrl = useBaseUrl('/data/turkiye-navigasyon.json');
  const embedUrl = `${siteConfig.url}${EMBED_PATH}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const mapEl = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const tileRef = useRef<Leaflet.TileLayer | null>(null);
  const groupsRef = useRef<Partial<Record<LayerKey, Leaflet.LayerGroup>>>({});
  // İstasyonlar birden çok katmana ait olabildiğinden ayrı tutulur; görünürlük katman kümesinden hesaplanır.
  const navaidGroupRef = useRef<Leaflet.LayerGroup | null>(null);
  const navaidMarkersRef = useRef<{marker: Leaflet.Marker; layers: LayerKey[]}[]>([]);
  const markersRef = useRef(new Map<string, Leaflet.Marker>());
  const highlightRef = useRef<Leaflet.CircleMarker | null>(null);
  const coverageRef = useRef<Leaflet.FeatureGroup | null>(null);
  const measureLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const measuringRef = useRef(false);
  const initialRef = useRef<Initial | null>(null);
  const viewSetRef = useRef(false);
  const attributionRef = useRef<Leaflet.Control.Attribution | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [data, setData] = useState<NavData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(DEFAULT_LAYERS));
  const [basemap, setBasemap] = useState<Basemap>('oto');
  const [selected, setSelected] = useState<Feature | null>(null);
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [measuring, setMeasuring] = useState(false);
  const [measurePts, setMeasurePts] = useState<[number, number][]>([]);
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  measuringRef.current = measuring;

  // ---------- Veri ----------
  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NavData>;
      })
      .then((json) => !cancelled && setData(json))
      .catch((err: Error) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  const features = useMemo<Feature[]>(() => {
    if (!data) return [];
    return [
      ...data.navaids.map((item): Feature => ({kind: 'navaid', item})),
      ...data.airports.map((item): Feature => ({kind: 'airport', item})),
      ...ilsItems(data).map((item): Feature => ({kind: 'ils', item})),
    ];
  }, [data]);

  const searchIndex = useMemo(() => features.map((f) => ({f, text: searchText(f)})), [features]);

  const counts = useMemo(() => {
    const c = {} as Record<LayerKey, number>;
    for (const l of LAYERS) c[l.key] = 0;
    for (const f of features) {
      for (const l of featureLayers(f)) c[l]++;
      if (f.kind === 'airport' && airportLayer(f.item) === 'havalimani') {
        c.pist += (f.item.rwy ?? []).filter((r) => r.ends).length;
      }
    }
    return c;
  }, [features]);

  // ---------- Harita kurulumu ----------
  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    const initial = readInitial();
    initialRef.current = initial;
    setLayers(new Set(initial.layers));
    setBasemap(initial.basemap);

    import('leaflet').then((mod) => {
      if (disposed || !mapEl.current) return;
      const L = (mod.default ?? mod) as typeof Leaflet;
      LRef.current = L;
      const map = L.map(mapEl.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 4,
        maxBounds: [
          [20, 5],
          [55, 65],
        ],
        worldCopyJump: false,
      });
      // Alt köşede ilk eklenen kontrol en altta durur: atıf haritanın alt kenarında, düğmeler üstünde
      attributionRef.current = L.control
        .attribution({position: 'bottomright', prefix: '<a href="https://leafletjs.com">Leaflet</a>'})
        .addTo(map);
      L.control.zoom({position: 'bottomright', zoomInTitle: 'Yakınlaştır', zoomOutTitle: 'Uzaklaştır'}).addTo(map);
      L.control.scale({position: 'bottomleft', imperial: false}).addTo(map);

      if (initial.center) map.setView(initial.center, initial.zoom ?? 9);
      else map.fitBounds(TURKEY_BOUNDS);

      // Kapsayıcı boyutu değişince (yerleşim oturması, tam ekran, panel) haritayı yeniden ölç.
      let firstResize = true;
      resizeObserver = new ResizeObserver(() => {
        // Boyut değişince (panel açılıp kapanması, döndürme, tam ekran) merkez korunur
        map.invalidateSize({pan: true, animate: false});
        if (firstResize && !initial.center && !viewSetRef.current) map.fitBounds(TURKEY_BOUNDS);
        firstResize = false;
      });
      resizeObserver.observe(mapEl.current);

      const updateZoomClass = () => {
        const z = map.getZoom();
        const el = map.getContainer();
        el.classList.toggle(styles.zoomOrta, z >= 7);
        el.classList.toggle(styles.zoomYakin, z >= 9);
        el.classList.toggle(styles.zoomDetay, z >= 11);
      };
      map.on('zoomend', updateZoomClass);
      updateZoomClass();

      map.on('mousemove', (e: Leaflet.LeafletMouseEvent) => setCursor([e.latlng.lat, e.latlng.lng]));
      map.on('mouseout', () => setCursor(null));
      map.on('click', (e: Leaflet.LeafletMouseEvent) => {
        if (measuringRef.current) setMeasurePts((pts) => [...pts, [e.latlng.lat, e.latlng.lng]]);
      });

      measureLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      groupsRef.current = {};
      markersRef.current.clear();
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
    const {url, options} = tileConfig(basemap);
    tileRef.current = L.tileLayer(url, options).addTo(map);
  }, [basemap, mapReady]);

  // ---------- İşaretler ----------
  const select = useCallback((f: Feature | null, fly = false) => {
    setSelected(f);
    const map = mapRef.current;
    if (f && map && fly) {
      map.flyTo(position(f), Math.max(map.getZoom(), f.kind === 'airport' ? 11 : 10), {duration: 0.6});
    }
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady || !data) return;

    const groups: Partial<Record<LayerKey, Leaflet.LayerGroup>> = {};
    for (const l of LAYERS) groups[l.key] = L.layerGroup();

    const navaidGroup = L.layerGroup().addTo(map);
    const navaidMarkers: {marker: Leaflet.Marker; layers: LayerKey[]}[] = [];

    const addMarker = (
      f: Feature,
      html: string,
      size: number,
      layer: LayerKey,
      zIndexOffset: number,
      big = false,
    ): Leaflet.Marker => {
      const label = featureTitle(f);
      const icon = L.divIcon({
        html: `${html}<span class="${styles.etiket}">${escapeHtml(label)}</span>`,
        className: clsx(styles.isaret, styles[`tur_${layer}`], big && styles.buyuk),
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const name = f.item.name ? ` — ${f.item.name}` : '';
      const marker = L.marker(position(f), {icon, title: `${label}${name}`, zIndexOffset, riseOnHover: true});
      marker.on('click', () => {
        if (measuringRef.current) setMeasurePts((pts) => [...pts, position(f)]);
        else select(f);
      });
      if (f.kind !== 'navaid') marker.addTo(groups[layer]!);
      markersRef.current.set(featureKey(f), marker);
      return marker;
    };

    for (const a of data.airports) {
      const layer = airportLayer(a);
      const f: Feature = {kind: 'airport', item: a};
      const size = a.type === 'large_airport' ? 24 : a.type === 'medium_airport' ? 20 : 16;
      const z = a.type === 'large_airport' ? 300 : a.type === 'medium_airport' ? 200 : 0;
      addMarker(f, airportSymbol(a.type, longestRunwayHeading(a)), size, layer, z, z > 0);
      if (layer === 'havalimani') {
        for (const r of a.rwy ?? []) {
          if (!r.ends) continue;
          L.polyline(r.ends, {
            className: clsx(styles.pist, r.closed && styles.pistKapali),
            weight: 4,
            interactive: false,
          }).addTo(groups.pist!);
        }
      }
    }
    for (const n of data.navaids) {
      const marker = addMarker({kind: 'navaid', item: n}, NAVAID_SYMBOLS[n.type] ?? NAVAID_SYMBOLS.VOR, 20, navaidLayer(n), 400);
      navaidMarkers.push({marker, layers: navaidLayers(n)});
    }
    // ILS: eşikten dışarı doğru uzanan "tüy" (yaklaşma rotası boyunca) + LLZ anteni işareti
    for (const f of features) {
      if (f.kind !== 'ils') continue;
      const x = f.item;
      if (x.crs !== undefined) {
        const out = (x.crs + 180) % 360;
        const feather = L.polygon(
          [
            [x.lat, x.lon],
            destination(x.lat, x.lon, out + FEATHER_HALF_DEG, FEATHER_NM),
            destination(x.lat, x.lon, out, FEATHER_NM * 0.86),
            destination(x.lat, x.lon, out - FEATHER_HALF_DEG, FEATHER_NM),
          ],
          {className: clsx(styles.ils, !x.gp && styles.loc), weight: 1.2},
        );
        feather.on('click', () => {
          if (measuringRef.current) setMeasurePts((pts) => [...pts, position(f)]);
          else select(f);
        });
        feather.addTo(groups.ils!);
      }
      addMarker(f, ILS_SYMBOL, 12, 'ils', 350);
    }

    groupsRef.current = groups;
    navaidGroupRef.current = navaidGroup;
    navaidMarkersRef.current = navaidMarkers;

    // DHMİ izninin koşulu: seyrüsefer verisinin kaynağı haritada görünür biçimde belirtilir.
    const aipAttribution = `Seyrüsefer ve pist verisi: <a href="${data.aip.url}">AIP Türkiye</a> © DHMİ${
      data.aip.amdt ? ` (AMDT ${data.aip.amdt})` : ''
    }`;
    attributionRef.current?.addAttribution(aipAttribution);

    // URL'de seçili öğe verilmişse bul ve göster
    const wanted = initialRef.current?.selected;
    if (wanted) {
      // Öncelik: havalimanı ICAO kodu → istasyon kodu (VHF önce) → havalimanı IATA kodu
      const navaidMatches = data.navaids.filter((n) => n.ident === wanted);
      const navaid = navaidMatches.find((n) => !n.type.startsWith('NDB')) ?? navaidMatches[0];
      const airport = data.airports.find((a) => a.ident === wanted || a.icao === wanted);
      const byIata = data.airports.find((a) => a.iata === wanted);
      const ilsMatch = features.find((f) => f.kind === 'ils' && f.item.ident === wanted);
      const match: Feature | undefined = airport
        ? {kind: 'airport', item: airport}
        : navaid
          ? {kind: 'navaid', item: navaid}
          : byIata
            ? {kind: 'airport', item: byIata}
            : ilsMatch;
      if (match) {
        // Görünüm adreste verilmediyse seçili öğeye yakınlaş
        if (!initialRef.current?.center) {
          viewSetRef.current = true;
          map.setView(position(match), match.kind === 'airport' ? 11 : 10);
        }
        setSelected(match);
      }
    }

    return () => {
      for (const g of Object.values(groups)) g?.remove();
      navaidGroup.remove();
      navaidMarkersRef.current = [];
      markersRef.current.clear();
      attributionRef.current?.removeAttribution(aipAttribution);
    };
  }, [data, mapReady, features, select]);

  // ---------- Katman görünürlüğü ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;
    for (const l of LAYERS) {
      const g = groupsRef.current[l.key];
      if (!g) continue;
      if (layers.has(l.key)) g.addTo(map);
      else g.remove();
    }
    const navaidGroup = navaidGroupRef.current;
    for (const {marker, layers: own} of navaidMarkersRef.current) {
      const visible = own.some((l) => layers.has(l));
      if (visible && !navaidGroup?.hasLayer(marker)) navaidGroup?.addLayer(marker);
      if (!visible && navaidGroup?.hasLayer(marker)) navaidGroup.removeLayer(marker);
    }
  }, [layers, mapReady, data]);

  // ---------- Seçim vurgusu ----------
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    highlightRef.current?.remove();
    highlightRef.current = null;
    coverageRef.current?.remove();
    coverageRef.current = null;
    for (const m of markersRef.current.values()) m.getElement()?.classList.remove(styles.secili);
    if (!L || !map || !selected) return;
    highlightRef.current = L.circleMarker(position(selected), {
      radius: 20,
      className: styles.seciliHalka,
      interactive: false,
    }).addTo(map);
    markersRef.current.get(featureKey(selected))?.getElement()?.classList.add(styles.secili);
    // Kapsama halkası: AIP değeri düz, tipik (standart hizmet hacmi) değer kesik çizgiyle
    const cov = selected.kind === 'navaid' ? coverage(selected.item) : undefined;
    if (cov) {
      coverageRef.current = L.featureGroup([
        L.circle(position(selected), {
          radius: cov.nm * 1852,
          className: clsx(
            styles.kapsama,
            !cov.aip && styles.kapsamaTipik,
            selected.kind === 'navaid' && selected.item.type.startsWith('NDB') && styles.kapsamaNdb,
          ),
          interactive: false,
        }),
      ]).addTo(map);
    }
    // ILS kapsama hacminin yatay izdüşümü (ICAO Ek 10): geniş LOC yelpazesi ve içinde GP dilimi
    if (selected.kind === 'ils') {
      const loc = locCoverage(selected.item);
      const gp = gpCoverage(selected.item);
      const parts: Leaflet.Polygon[] = [];
      if (loc) parts.push(L.polygon(loc, {className: styles.kapsamaLoc, weight: 1.5, interactive: false}));
      if (gp) parts.push(L.polygon(gp, {className: styles.kapsamaGp, weight: 1.5, interactive: false}));
      if (parts.length) coverageRef.current = L.featureGroup(parts).addTo(map);
    }
  }, [selected, mapReady, data, layers]);

  // ---------- Ölçüm ----------
  useEffect(() => {
    const L = LRef.current;
    const group = measureLayerRef.current;
    if (!L || !group) return;
    group.clearLayers();
    if (measurePts.length > 1) {
      L.polyline(measurePts, {className: styles.olcumCizgi, weight: 2.5, interactive: false}).addTo(group);
    }
    measurePts.forEach((p) => L.circleMarker(p, {radius: 4, className: styles.olcumNokta, interactive: false}).addTo(group));
  }, [measurePts, mapReady]);

  useEffect(() => {
    mapRef.current?.getContainer().classList.toggle(styles.olcumModu, measuring);
  }, [measuring, mapReady]);

  const measure = useMemo(() => {
    let total = 0;
    for (let i = 1; i < measurePts.length; i++) {
      const [a, b] = [measurePts[i - 1], measurePts[i]];
      total += distanceNm(a[0], a[1], b[0], b[1]);
    }
    const n = measurePts.length;
    const last =
      n > 1 ? bearingDeg(measurePts[n - 2][0], measurePts[n - 2][1], measurePts[n - 1][0], measurePts[n - 1][1]) : undefined;
    return {total, last};
  }, [measurePts]);

  // ---------- Tam ekran ----------
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(styles.kaydirmaKilidi, fallbackFullscreen);
  }, [fallbackFullscreen]);

  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (fullscreen) {
      void document.exitFullscreen();
    } else if (fallbackFullscreen) {
      setFallbackFullscreen(false);
    } else if (el.requestFullscreen && document.fullscreenEnabled) {
      el.requestFullscreen().catch(() => setFallbackFullscreen(true));
    } else {
      setFallbackFullscreen(true);
    }
  };

  // ---------- Arama ----------
  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    const scored: {f: Feature; score: number}[] = [];
    for (const {f, text} of searchIndex) {
      const ident = normalize(featureTitle(f));
      let score = -1;
      if (ident === q || normalize(f.item.ident) === q) score = 0;
      else if (ident.startsWith(q)) score = 1;
      else if (text.split(' ').some((w) => w.startsWith(q))) score = 2;
      else if (text.includes(q)) score = 3;
      if (score < 0) continue;
      // Kapalı tesisler ve heliportlar listenin sonunda
      if (f.kind === 'airport' && airportLayer(f.item) !== 'havalimani') score += 4;
      scored.push({f, score});
    }
    scored.sort((a, b) => a.score - b.score || featureTitle(a.f).localeCompare(featureTitle(b.f)));
    return scored.slice(0, 8).map((s) => s.f);
  }, [query, searchIndex]);

  const choose = (f: Feature) => {
    if (!featureVisible(f, layers)) setLayers((prev) => new Set(prev).add(featureLayer(f)));
    select(f, true);
    setQuery('');
    setResultsOpen(false);
    searchRef.current?.blur();
  };

  const onSearchKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveResult((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveResult((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[activeResult]) {
      e.preventDefault();
      choose(results[activeResult]);
    } else if (e.key === 'Escape') {
      setQuery('');
      setResultsOpen(false);
    }
  };

  // Klavye kısayolları: "/" arama, Esc kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root) return;
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select');
      const inside = root.contains(target) || target === document.body;
      if (e.key === '/' && !typing && inside) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape' && !typing && root.contains(target)) {
        if (shareOpen) setShareOpen(false);
        else if (measuring) {
          setMeasuring(false);
          setMeasurePts([]);
        } else if (selected) setSelected(null);
        else if (fallbackFullscreen) setFallbackFullscreen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shareOpen, measuring, selected, fallbackFullscreen]);

  const toggleLayer = (key: LayerKey) =>
    setLayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const fitTurkey = () => mapRef.current?.flyToBounds(TURKEY_BOUNDS, {duration: 0.6});

  // ---------- Paylaşım ----------
  const viewParams = () => {
    const map = mapRef.current;
    const p = new URLSearchParams();
    if (map) {
      const c = map.getCenter();
      p.set('lat', c.lat.toFixed(4));
      p.set('lon', c.lng.toFixed(4));
      p.set('z', String(map.getZoom()));
    }
    const keys = LAYERS.map((l) => l.key).filter((k) => layers.has(k));
    if (keys.join(',') !== DEFAULT_LAYERS.join(',')) p.set('katman', keys.join(','));
    if (selected) p.set('secili', featureTitle(selected));
    if (basemap !== 'oto') p.set('altlik', basemap);
    return p.toString();
  };

  const [shareView, setShareView] = useState(true);
  const [embedHeight, setEmbedHeight] = useState(520);
  const [shareParams, setShareParams] = useState('');

  const openShare = () => {
    setShareParams(viewParams());
    setShareOpen(true);
  };

  const pageUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  const qs = shareView && shareParams ? `?${shareParams}` : '';
  const linkUrl = `${gomulu ? `${siteConfig.url}/araclar/navigasyon/turkiye-navigasyon-haritasi` : pageUrl}${qs}`;
  const iframeCode = `<iframe src="${embedUrl}${qs}" width="100%" height="${embedHeight}" style="border:0" loading="lazy" allow="fullscreen" allowfullscreen title="Türkiye navigasyon haritası (aviyonikyazilim.com)"></iframe>`;

  const copy = (text: string, what: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1600);
    });
  };

  // ---------- Detay paneli verisi ----------
  const nearby = useMemo(() => {
    if (!selected) return [];
    const [lat, lon] = position(selected);
    return features
      .filter((f) => f !== selected && f.kind !== 'ils' && !['heliport', 'kapali', 'aipdisi'].includes(featureLayer(f)))
      .filter((f) => !(f.kind === 'airport' && f.item.type === 'small_airport'))
      .map((f) => ({f, nm: distanceNm(lat, lon, f.item.lat, f.item.lon), brg: bearingDeg(lat, lon, f.item.lat, f.item.lon)}))
      .filter((x) => x.nm > 0.3)
      .sort((a, b) => a.nm - b.nm)
      .slice(0, 6);
  }, [selected, features]);

  const related = useMemo(() => {
    if (!selected || !data) return [];
    if (selected.kind === 'airport') {
      const a = selected.item;
      return [
        ...data.navaids.filter((n) => n.apt === a.ident && n.src !== 'oa').map((item): Feature => ({kind: 'navaid', item})),
        ...features.filter((f) => f.kind === 'ils' && f.item.apt === a.icao),
      ];
    }
    const apt = data.airports.find((a) => a.ident === selected.item.apt);
    return apt ? [{kind: 'airport', item: apt} as Feature] : [];
  }, [selected, data, features]);

  const visibleCount = features.filter((f) => featureVisible(f, layers)).length;

  return (
    <div
      ref={rootRef}
      data-boyut={geo.boyut}
      data-basik={geo.basik || undefined}
      data-dokunmatik={geo.dokunmatik || undefined}
      className={clsx(
        styles.harita,
        gomulu && styles.gomulu,
        (fullscreen || fallbackFullscreen) && styles.tamEkran,
        selected && styles.panelAcik,
      )}>
      {gomulu && <h1 className={styles.gizli}>Türkiye navigasyon haritası</h1>}

      {/* ---------- Araç çubuğu ---------- */}
      <div className={styles.ust}>
        <div className={styles.arama} role="search">
          <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.aramaSimge}>
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Ara: ESB, Esenboğa, 112.7, İzmir…"
            aria-label="İstasyon veya havalimanı ara"
            aria-expanded={resultsOpen && results.length > 0}
            aria-controls="harita-sonuclar"
            aria-autocomplete="list"
            role="combobox"
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveResult(0);
              setResultsOpen(true);
            }}
            onFocus={() => setResultsOpen(true)}
            onBlur={() => window.setTimeout(() => setResultsOpen(false), 150)}
            onKeyDown={onSearchKey}
          />
          <kbd className={styles.kisayol} aria-hidden="true">
            /
          </kbd>
          {resultsOpen && query.trim() !== '' && (
            <ul id="harita-sonuclar" role="listbox" className={styles.sonuclar}>
              {results.length === 0 && <li className={styles.sonucYok}>Sonuç yok</li>}
              {results.map((f, i) => (
                <li
                  key={featureKey(f)}
                  role="option"
                  aria-selected={i === activeResult}
                  className={clsx(styles.sonuc, i === activeResult && styles.sonucAktif)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(f);
                  }}
                  onMouseEnter={() => setActiveResult(i)}>
                  <span className={styles.sonucKod}>{featureTitle(f)}</span>
                  <span className={styles.sonucAd}>{f.item.name}</span>
                  <span className={styles.sonucTur}>
                    {f.kind === 'navaid'
                      ? [NAVAID_TYPE_LABELS[f.item.type], formatFrequency(f.item) ?? (f.item.ch && `KNL ${f.item.ch}`)]
                          .filter(Boolean)
                          .join(' · ')
                      : f.kind === 'ils'
                        ? [ilsLabel(f.item), formatMHz(f.item.freq)].filter(Boolean).join(' · ')
                        : f.item.iata ?? AIRPORT_TYPE_LABELS[f.item.type]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.dugmeler}>
          <button
            type="button"
            className={clsx(styles.dugme, measuring && styles.dugmeAktif)}
            aria-pressed={measuring}
            onClick={() => {
              setMeasuring((m) => !m);
              setMeasurePts([]);
            }}
            title="Mesafe ve yön ölç (Esc ile bitir)">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 12L12 2l2 2L4 14z" />
              <path d="M5 9l1.5 1.5M7 7l1 1M9 5l1.5 1.5" />
            </svg>
            <span>Ölç</span>
          </button>
          <button type="button" className={styles.dugme} onClick={fitTurkey} title="Tüm Türkiye'yi göster">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="5" />
              <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
            </svg>
            <span>Türkiye</span>
          </button>
          <button type="button" className={styles.dugme} onClick={openShare} title="Bağlantı paylaş veya sitene göm">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.5 4L2 8l3.5 4M10.5 4L14 8l-3.5 4" />
            </svg>
            <span>Paylaş / Göm</span>
          </button>
          <button
            type="button"
            className={styles.dugme}
            onClick={toggleFullscreen}
            title={fullscreen || fallbackFullscreen ? 'Tam ekrandan çık (Esc)' : 'Tam ekran'}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {fullscreen || fallbackFullscreen ? (
                <path d="M6 2v4H2M10 2v4h4M14 10h-4v4M2 10h4v4" />
              ) : (
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
              )}
            </svg>
            <span>{fullscreen || fallbackFullscreen ? 'Küçült' : 'Tam ekran'}</span>
          </button>
          {gomulu && (
            <a className={styles.dugme} href={linkUrl} target="_blank" rel="noopener" title="aviyonikyazilim.com'da aç">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M9 2h5v5M14 2L7 9M12 10v4H2V4h4" />
              </svg>
              <span>Sitede aç</span>
            </a>
          )}
        </div>
      </div>

      <div className={styles.katmanlar} role="group" aria-label="Katmanlar">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            aria-pressed={layers.has(l.key)}
            className={clsx(styles.katman, styles[`tur_${l.key}`], layers.has(l.key) && styles.katmanAcik)}
            title={l.hint}
            onClick={() => toggleLayer(l.key)}>
            <span className={styles.katmanIsaret} aria-hidden="true" />
            {l.label}
            <span className={styles.katmanSayi}>{counts[l.key] || ''}</span>
          </button>
        ))}
        <label className={styles.altlik}>
          <span>Altlık</span>
          <select value={basemap} onChange={(e) => setBasemap(e.target.value as Basemap)}>
            {(Object.keys(BASEMAPS) as Basemap[]).map((k) => (
              <option key={k} value={k}>
                {BASEMAPS[k].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ---------- Harita + detay paneli ---------- */}
      <div className={styles.govde}>
        <div ref={mapEl} className={styles.harita_alan} aria-label="Türkiye navigasyon haritası" role="application" />
        {!data && !error && <div className={styles.yukleniyor}>Veri yükleniyor…</div>}
        {error && <div className={styles.yukleniyor}>Veri yüklenemedi ({error}).</div>}
        {measuring && (
          <div className={styles.olcumIpucu} role="status">
            {measurePts.length === 0
              ? 'Ölçmek için haritada noktalara tıklayın'
              : `${formatNm(measure.total)} · ${formatKm(measure.total)}${measure.last !== undefined ? ` · son bacak ${pad3(measure.last)}° (gerçek)` : ''}`}
            {measurePts.length > 0 && (
              <button type="button" onClick={() => setMeasurePts([])}>
                Temizle
              </button>
            )}
          </div>
        )}

        {selected && (
          <aside className={styles.panel} aria-label="Seçili öğe ayrıntıları">
            <Detay
              key={featureKey(selected)}
              onFitCoverage={() => {
                const c = coverageRef.current;
                if (c) mapRef.current?.flyToBounds(c.getBounds(), {padding: [20, 20], duration: 0.6});
              }}
              f={selected}
              nearby={nearby}
              related={related}
              onClose={() => setSelected(null)}
              onPick={(f) => choose(f)}
              onCopy={copy}
              copied={copied}
            />
          </aside>
        )}
      </div>

      {/* ---------- Durum çubuğu ---------- */}
      <div className={styles.durum}>
        {/* Fare konumu yalnızca fareli cihazlarda anlamlı */}
        {!geo.dokunmatik && <span className={styles.koordinat}>{cursor ? formatDms(cursor[0], cursor[1]) : '—'}</span>}
        <span>
          {visibleCount} öğe gösteriliyor
          {data && (
            <>
              {' · '}Seyrüsefer ve pist verisi: <a href={data.aip.url}>AIP Türkiye</a> © DHMİ
              {data.aip.amdt && ` (AIRAC AMDT ${data.aip.amdt})`} · Diğer havalimanları:{' '}
              <a href="https://ourairports.com/data/">OurAirports</a>
            </>
          )}
        </span>
      </div>

      {/* ---------- Paylaş / göm penceresi ---------- */}
      {shareOpen && (
        <div className={styles.perde} onClick={() => setShareOpen(false)}>
          <div
            className={styles.pencere}
            role="dialog"
            aria-modal="true"
            aria-labelledby="harita-paylas-baslik"
            onClick={(e) => e.stopPropagation()}>
            <div className={styles.pencereBaslik}>
              <h3 id="harita-paylas-baslik">Paylaş ve göm</h3>
              <button type="button" className={styles.kapat} onClick={() => setShareOpen(false)} aria-label="Kapat">
                ×
              </button>
            </div>
            <label className={styles.secenek}>
              <input type="checkbox" checked={shareView} onChange={(e) => setShareView(e.target.checked)} />
              Mevcut görünümü (konum, yakınlık, katmanlar, seçili öğe) koru
            </label>

            <p className={styles.alanBaslik}>Bağlantı</p>
            <div className={styles.kopyaSatir}>
              <input readOnly value={linkUrl} aria-label="Paylaşım bağlantısı" onFocus={(e) => e.target.select()} />
              <button type="button" onClick={() => copy(linkUrl, 'link')}>
                {copied === 'link' ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>

            <p className={styles.alanBaslik}>Sitene göm (iframe)</p>
            <div className={styles.yukseklik}>
              Yükseklik:
              {[400, 520, 700].map((h) => (
                <label key={h}>
                  <input type="radio" name="harita-yukseklik" checked={embedHeight === h} onChange={() => setEmbedHeight(h)} />
                  {h} px
                </label>
              ))}
            </div>
            <textarea readOnly rows={4} value={iframeCode} aria-label="Gömme kodu" onFocus={(e) => e.target.select()} />
            <div className={styles.pencereAlt}>
              <span>Gömülü harita tam ekran, arama ve ölçüm dahil tüm özellikleri taşır.</span>
              <button type="button" onClick={() => copy(iframeCode, 'iframe')}>
                {copied === 'iframe' ? 'Kopyalandı' : 'Kodu kopyala'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type DetayProps = {
  f: Feature;
  onFitCoverage: () => void;
  nearby: {f: Feature; nm: number; brg: number}[];
  related: Feature[];
  onClose: () => void;
  onPick: (f: Feature) => void;
  onCopy: (text: string, what: string) => void;
  copied: string | null;
};

function Satir({k, v}: {k: string; v?: ReactNode}): ReactNode {
  if (v === undefined || v === null || v === '') return null;
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

function Detay({f, nearby, related, onClose, onPick, onCopy, copied, onFitCoverage}: DetayProps): ReactNode {
  const isVor = f.kind === 'navaid' && /VOR/.test(f.item.type);
  const variation = f.kind === 'navaid' ? f.item.var : undefined;
  // ILS için konum LLZ antenidir (haritadaki nokta eşiğe yakındır)
  const [lat, lon] = f.kind === 'ils' ? f.item.llz : [f.item.lat, f.item.lon];
  const coords = formatDms(lat, lon);
  const typeLabel =
    f.kind === 'navaid'
      ? NAVAID_TYPE_LABELS[f.item.type] ?? f.item.type
      : f.kind === 'ils'
        ? ilsLabel(f.item)
        : AIRPORT_TYPE_LABELS[f.item.type] ?? f.item.type;
  const aipAirports = related.filter(
    (r): r is Extract<Feature, {kind: 'airport'}> => r.kind === 'airport' && !!r.item.aip && !!r.item.icao,
  );
  const [playing, setPlaying] = useState(-1);
  const stopRef = useRef<(() => void) | null>(null);

  // Panel kapanınca ya da başka öğe seçilince (key değişir) ses durur.
  useEffect(() => () => stopRef.current?.(), []);

  const toggleMorse = () => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
      return;
    }
    stopRef.current = playMorse(f.item.ident, (i) => {
      setPlaying(i);
      if (i < 0) stopRef.current = null;
    });
  };

  return (
    <div className={styles.detay}>
      <div className={styles.detayUst}>
        <div>
          <span className={styles.detayTur}>
            {typeLabel}
          </span>
          <h3 className={styles.detayKod}>
            {featureTitle(f)}
            {f.kind === 'airport' && f.item.iata && <small>{f.item.iata}</small>}
            {f.kind === 'ils' && f.item.rwy && <small>RWY {f.item.rwy}</small>}
          </h3>
          <p className={styles.detayAd}>{f.item.name}</p>
        </div>
        <button type="button" className={styles.kapat} onClick={onClose} aria-label="Paneli kapat">
          ×
        </button>
      </div>

      {f.kind === 'navaid' && f.item.src === 'oa' && (
        <p className={styles.uyari}>
          Bu istasyon AIP Türkiye'de yer almıyor; kapatılmış ya da askerî olabilir. Bilgiler OurAirports'tan
          gelir ve doğrulanmamıştır.
        </p>
      )}

      {f.kind !== 'airport' && (
        <div className={styles.mors} aria-label={`Mors kodu: ${f.item.ident}`}>
          <button
            type="button"
            className={clsx(styles.morsDugme, playing >= 0 && styles.morsCaliyor)}
            onClick={toggleMorse}
            aria-pressed={playing >= 0}
            title={playing >= 0 ? 'Durdur' : 'Tanıtım kodunu dinle (1020 Hz)'}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {playing >= 0 ? (
                <rect x="4" y="4" width="8" height="8" rx="1" />
              ) : (
                <path d="M2.5 6h2.5l3.5-3v10L5 10H2.5zM11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" />
              )}
            </svg>
            {playing >= 0 ? 'Durdur' : 'Dinle'}
          </button>
          {morse(f.item.ident).map(({letter, code}, i) => (
            <span key={i} className={clsx(styles.morsHarf, playing === i && styles.morsAktif)}>
              <b>{letter}</b>
              <span aria-hidden="true">
                {[...code].map((c, j) => (
                  <i key={j} className={c === '.' ? styles.nokta : styles.cizgi} />
                ))}
              </span>
            </span>
          ))}
        </div>
      )}

      <dl className={styles.ozellik}>
        {f.kind === 'navaid' && <NavaidRows n={f.item} onFitCoverage={onFitCoverage} />}
        {f.kind === 'airport' && <AirportRows a={f.item} />}
        {f.kind === 'ils' && <IlsRows x={f.item} onFitCoverage={onFitCoverage} />}
        <dt>{f.kind === 'ils' ? 'LLZ anteni' : 'Konum'}</dt>
        <dd>
          <button type="button" className={styles.kopyaDugme} onClick={() => onCopy(coords, 'coord')} title="Koordinatı kopyala">
            {coords}
            <small>{copied === 'coord' ? 'kopyalandı' : formatDecimal(lat, lon)}</small>
          </button>
        </dd>
      </dl>

      {f.kind === 'airport' && f.item.com && f.item.com.length > 0 && (
        <>
          <h4 className={styles.detayAltBaslik}>
            Telsiz frekansları <small>MHz</small>
          </h4>
          <table className={styles.pistTablo}>
            <tbody>
              {f.item.com.map((g, i) => (
                <tr key={i}>
                  <td title={SERVICE_LABELS[g.service] ?? g.service}>{g.service}</td>
                  <td className={styles.cagri}>{g.callsign}</td>
                  <td className={styles.frekanslar}>
                    {g.freqs.map((fr) => (
                      <span key={fr.mhz}>
                        {formatComFreq(fr.mhz)}
                        {fr.note && <small> {fr.note}</small>}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {f.kind === 'airport' && f.item.rwy && f.item.rwy.length > 0 && (
        <>
          <h4 className={styles.detayAltBaslik}>Pistler</h4>
          <table className={styles.pistTablo}>
            <thead>
              <tr>
                <th>Pist</th>
                <th>Uzunluk</th>
                <th>Yüzey</th>
              </tr>
            </thead>
            <tbody>
              {f.item.rwy.map((r, i) => [
                <tr key={i} className={clsx(r.closed && styles.kapaliSatir)}>
                  <td>
                    {r.id || '—'}
                    {r.lit && <span title="Işıklandırılmış"> ✦</span>}
                  </td>
                  <td>
                    {formatLength(r.len) ?? '—'}
                    {r.wid ? <small> × {Math.round(r.wid * 0.3048)} m</small> : null}
                  </td>
                  <td>{r.closed ? 'Kapalı' : surfaceLabel(r.surf) ?? '—'}</td>
                </tr>,
                r.lgt && (
                  <tr key={`${i}-isik`} className={styles.isikSatir}>
                    <td colSpan={3}>
                      {Object.entries(r.lgt).map(([end, l]) => (
                        <span key={end}>
                          <b>{end}</b> {[l.apch && `${l.apch} yaklaşma ışığı`, l.gsi].filter(Boolean).join(' · ')}
                        </span>
                      ))}
                    </td>
                  </tr>
                ),
              ])}
            </tbody>
          </table>
        </>
      )}

      {related.length > 0 && (
        <>
          <h4 className={styles.detayAltBaslik}>
            {f.kind === 'airport' ? 'Seyrüsefer ve iniş yardımcıları' : 'İlgili havalimanı'}
          </h4>
          <ul className={styles.yakinListe}>
            {related.map((r) => (
              <li key={featureKey(r)}>
                <button type="button" onClick={() => onPick(r)}>
                  <span className={styles.sonucKod}>{featureTitle(r)}</span>
                  <span className={styles.sonucAd}>{r.item.name}</span>
                  <span className={styles.sonucTur}>
                    {r.kind === 'navaid'
                      ? formatFrequency(r.item) ?? (r.item.ch && `KNL ${r.item.ch}`) ?? NAVAID_TYPE_LABELS[r.item.type]
                      : r.kind === 'ils'
                        ? `${ilsLabel(r.item)} · ${formatMHz(r.item.freq) ?? ''}`
                        : r.item.iata}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4 className={styles.detayAltBaslik}>Resmî kaynak</h4>
      <ul className={styles.kaynakListe}>
        {f.kind === 'airport' && f.item.aip && f.item.icao && (
          <li>
            <a href={aipAd(f.item.icao, f.item.aip)} target="_blank" rel="noopener">
              AIP AD {f.item.aip} {f.item.icao}
            </a>{' '}
            — {f.item.aip === 3 ? 'heliport bilgileri' : 'meydan bilgileri, pistler (2.12), seyrüsefer ve iniş yardımcıları (2.19)'}
          </li>
        )}
        {f.kind === 'ils' && (
          <li>
            <a href={aipAd(f.item.apt)} target="_blank" rel="noopener">
              AIP AD 2 {f.item.apt}
            </a>{' '}
            — 2.19 seyrüsefer ve iniş yardımcıları
          </li>
        )}
        {f.kind === 'navaid' && f.item.enr && (
          <li>
            <a href={AIP_ENR41} target="_blank" rel="noopener">
              AIP ENR 4.1
            </a>{' '}
            — yol üstü seyrüsefer yardımcıları
          </li>
        )}
        {f.kind === 'navaid' &&
          f.item.src !== 'oa' &&
          aipAirports.map((r) => (
            <li key={r.item.ident}>
              <a href={aipAd(r.item.icao!)} target="_blank" rel="noopener">
                AIP AD 2 {r.item.icao}
              </a>{' '}
              — 2.19 terminal yardımcıları
            </li>
          ))}
        <li>
          <a href={AIP_HOME} target="_blank" rel="noopener">
            AIP Türkiye
          </a>{' '}
          (DHMİ) — güncel ve bağlayıcı veri
        </li>
      </ul>

      {nearby.length > 0 && (
        <>
          <h4 className={styles.detayAltBaslik}>
            En yakınlar <small>{isVor && variation !== undefined ? 'radyal (manyetik)' : 'yön (gerçek)'}</small>
          </h4>
          <ul className={styles.yakinListe}>
            {nearby.map(({f: n, nm, brg}) => (
              <li key={featureKey(n)}>
                <button type="button" onClick={() => onPick(n)}>
                  <span className={styles.sonucKod}>{featureTitle(n)}</span>
                  <span className={styles.sonucAd}>{n.item.name}</span>
                  <span className={styles.sonucTur}>
                    {isVor && variation !== undefined ? `R-${pad3((brg - variation + 360) % 360)}` : `${pad3(brg)}°`} ·{' '}
                    {formatNm(nm)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function NavaidRows({n, onFitCoverage}: {n: Navaid; onFitCoverage: () => void}): ReactNode {
  const variation = formatVariation(n.var);
  const cov = coverage(n);
  return (
    <>
      <Satir k="Frekans" v={formatFrequency(n)} />
      <Satir k={n.type === 'TACAN' ? 'TACAN kanalı' : 'DME kanalı'} v={n.ch} />
      <Satir k={n.elevM !== undefined ? 'DME anten rakımı' : 'Rakım'} v={formatElevationM(n.elevM) ?? formatElevation(n.elev)} />
      <Satir
        k="Kapsama"
        v={
          cov ? (
            <button type="button" className={styles.metinDugme} onClick={onFitCoverage} title="Kapsama halkasını göster">
              {cov.aip ? `${cov.nm} NM (AIP)` : `~${cov.nm} NM (tipik; AIP'de yayımlanmamış)`}
            </button>
          ) : (
            "AIP'de yayımlanmamış"
          )
        }
      />
      <Satir
        k="Manyetik sapma"
        v={variation && (n.varSrc === 'OurAirports' ? `${variation} (OurAirports, eski olabilir)` : `${variation} (${n.varSrc})`)}
      />
      <Satir k="Yayın" v={n.src === 'oa' ? undefined : n.enr ? 'Yol üstü (ENR 4.1)' : 'Terminal (AD 2.19)'} />
      <Satir k="Kullanım" v={usageLabel(n.use)} />
      <Satir k="Güç" v={powerLabel(n.pwr)} />
    </>
  );
}

function IlsRows({x, onFitCoverage}: {x: IlsItem; onFitCoverage: () => void}): ReactNode {
  const {dar, genis, ustAci, altFt} = LOC_KAPSAMA;
  const theta = x.angle ?? 3;
  const gpAlt = theta * GP_KAPSAMA.alt;
  const gpUst = theta * GP_KAPSAMA.ust;
  return (
    <>
      <Satir k="LLZ frekansı" v={formatMHz(x.freq)} />
      <Satir
        k="GP frekansı"
        v={
          x.gpFreqIcao
            ? `${formatMHz(x.gpFreq)} (AIP; LOC'un ICAO eşi ${formatMHz(x.gpFreqIcao)})`
            : formatMHz(x.gpFreq)
        }
      />
      <Satir k="DME kanalı" v={x.ch} />
      <Satir k="Yaklaşma rotası" v={x.crs !== undefined ? `${pad3(x.crs)}° gerçek (hesaplanan)` : undefined} />
      <Satir k="Süzülüş açısı" v={x.angle ? `${String(x.angle).replace('.', ',')}°` : undefined} />
      <Satir k="RDH" v={x.rdh ? `${x.rdh} ft` : undefined} />
      <Satir k="GP anteni" v={x.gp ? formatDms(x.gp[0], x.gp[1]) : undefined} />
      <Satir
        k="LOC kapsaması"
        v={
          x.crs !== undefined ? (
            <button type="button" className={styles.metinDugme} onClick={onFitCoverage} title="Kapsama alanını göster">
              {dar.nm} NM ±{dar.aci}° · {genis.nm} NM ±{genis.aci}°
            </button>
          ) : undefined
        }
      />
      <Satir
        k="LOC dikey"
        v={`eşik + ${formatFt(altFt)}${x.aptElev !== undefined ? ` (~${formatFt(x.aptElev + altFt)} MSL)` : ''} ile antenden ${ustAci}° arası`}
      />
      <Satir
        k="GP kapsaması"
        v={x.gp ? `${GP_KAPSAMA.nm} NM ±${GP_KAPSAMA.aci}° · ${formatDeg(gpAlt)}–${formatDeg(gpUst)}` : undefined}
      />
      <Satir
        k={`GP ${GP_KAPSAMA.nm} NM'de`}
        v={
          x.gp
            ? `${formatFt(heightFt(gpAlt, GP_KAPSAMA.nm))} – ${formatFt(heightFt(gpUst, GP_KAPSAMA.nm))} (anten üstü)`
            : undefined
        }
      />
    </>
  );
}

function AirportRows({a}: {a: Airport}): ReactNode {
  return (
    <>
      <Satir k="Şehir" v={a.city} />
      <Satir k="Rakım" v={formatElevation(a.elev)} />
      <Satir
        k="Manyetik sapma"
        v={a.var !== undefined ? `${formatVariation(a.var)}${a.varYear ? ` (${a.varYear})` : ''}` : undefined}
      />
      <Satir k="Tarifeli sefer" v={a.type !== 'closed' && a.type !== 'heliport' ? (a.sched ? 'Var' : 'Yok') : undefined} />
      <Satir
        k="Bağlantılar"
        v={
          a.web || a.wiki ? (
            <>
              {a.web && (
                <a href={a.web} rel="noopener nofollow" target="_blank">
                  Web sitesi
                </a>
              )}
              {a.web && a.wiki && ' · '}
              {a.wiki && (
                <a href={a.wiki} rel="noopener nofollow" target="_blank">
                  Vikipedi
                </a>
              )}
            </>
          ) : undefined
        }
      />
    </>
  );
}
