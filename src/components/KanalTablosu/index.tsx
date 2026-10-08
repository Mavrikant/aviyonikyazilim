import {useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import type {NavData} from '@site/src/components/NavigasyonHaritasi/veri';
import {KANALLAR, TUR_ADI, kanalBul, mhz, vhfKanal} from './kanallar';
import type {Kanal, Mod, Tur} from './kanallar';
import styles from './styles.module.css';

const TURLER: Tur[] = ['VOR', 'ILS', 'DME'];
const HARITA = '/araclar/navigasyon/turkiye-navigasyon-haritasi';

type Alan = 'kanal' | 'vhf' | 'gs' | 'sorgu' | 'cevap';
type Siralama = {alan: Alan; yon: 1 | -1};

/** Türkiye'de bir kanalı kullanan istasyon ya da ILS */
type Kullanici = {ident: string; tur: string; ad: string};

type Ayar = {ara: string; turler: Tur[]; mod: Mod | null; tr: boolean};
const VARSAYILAN: Ayar = {ara: '', turler: [], mod: null, tr: false};

const kucuk = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i');

/** Aramada nokta ile karşılaştırılan biçim: "108.10" */
const noktali = (khz: number) => (khz / 1000).toFixed(2);

function indir(blob: Blob, ad: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = ad;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Türkiye verisi ---------- */

function kullaniciHaritasi(data: NavData): Map<string, Kullanici[]> {
  const harita = new Map<string, Kullanici[]>();
  const ekle = (ch: string | undefined, k: Kullanici) => {
    if (!ch || !kanalBul(ch)) return;
    const liste = harita.get(ch.toUpperCase()) ?? [];
    if (!liste.some((x) => x.ident === k.ident && x.tur === k.tur)) liste.push(k);
    harita.set(ch.toUpperCase(), liste);
  };
  const aptAdi = new Map(data.airports.map((a) => [a.icao ?? a.ident, a.name]));
  for (const n of data.navaids) {
    if (n.src === 'oa' || n.type === 'NDB') continue;
    // NDB/DME'de freq NDB'nin kHz değeridir; kanal yalnızca `ch`'den alınır
    const ch = n.ch ?? (n.freq && !n.type.startsWith('NDB') ? vhfKanal(n.freq)?.ad : undefined);
    ekle(ch, {ident: n.ident, tur: n.type.replace('-', '/'), ad: n.name ?? n.ident});
  }
  for (const i of data.ils) {
    const ch = i.ch ?? (i.freq ? vhfKanal(i.freq)?.ad : undefined);
    const apt = aptAdi.get(i.apt);
    ekle(ch, {
      ident: i.ident,
      tur: i.gp ? 'ILS' : 'LOC',
      ad: `${apt ?? i.apt}${i.rwy ? ` · pist ${i.rwy}` : ''}`,
    });
  }
  return harita;
}

/* ---------- Arama ---------- */

type Sorgu = (k: Kanal, kullanicilar: Kullanici[]) => boolean;

/**
 * Kutuya yazılanı türüne göre yorumlar: "40X" kanal, "110.3" / "110,30" VHF ya da GS frekansı
 * (önek olarak), "1065" DME frekansı, "40" kanal numarası, "loc" / "tacan" tür, geri kalanı
 * Türkiye'deki istasyon kodu ya da adı.
 */
function sorguOf(metin: string): Sorgu | undefined {
  const t = metin.trim().replace(/\s*mhz$/i, '').replace(',', '.');
  if (!t) return undefined;
  const kanal = /^(\d{1,3})\s*([xy])$/i.exec(t);
  if (kanal) {
    const ad = `${Number(kanal[1])}${kanal[2].toUpperCase()}`;
    return (k) => k.ad === ad;
  }
  if (/^\d+(\.\d*)?$/.test(t)) {
    const [tam, ondalik] = t.split('.');
    const n = Number(tam);
    // Frekans öneki yalnızca üç basamaklı tam kısımla aranır; "1" bütün VHF'lerle eşleşmesin
    const onek = tam.length >= 3 ? `${n}${ondalik !== undefined ? `.${ondalik}` : '.'}` : undefined;
    return (k) =>
      (ondalik === undefined && (k.no === n || k.sorgu === n || k.cevap === n)) ||
      (onek !== undefined && ((k.vhf !== undefined && noktali(k.vhf).startsWith(onek)) || (k.gs !== undefined && noktali(k.gs).startsWith(onek))));
  }
  const a = kucuk(t);
  const turSozcugu: Record<string, Tur> = {vor: 'VOR', ils: 'ILS', loc: 'ILS', gs: 'ILS', dme: 'DME', tacan: 'DME'};
  const tur = turSozcugu[a];
  return (k, kullanicilar) =>
    (tur !== undefined && k.tur === tur) ||
    kullanicilar.some((u) => kucuk(u.ident).startsWith(a) || kucuk(u.ad).includes(a));
}

/* ---------- Paylaşım ---------- */

function hashOku(): (Ayar & {k?: string}) | undefined {
  const p = new URLSearchParams(window.location.hash.slice(1));
  if (!['ara', 'tur', 'mod', 'tr', 'k'].some((a) => p.has(a))) return undefined;
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  const mod = p.get('mod')?.toUpperCase();
  return {
    ara: p.get('ara') ?? '',
    turler: (p.get('tur') ?? '')
      .split(',')
      .map((x) => x.toUpperCase())
      .filter((x): x is Tur => (TURLER as string[]).includes(x)),
    mod: mod === 'X' || mod === 'Y' ? mod : null,
    tr: p.get('tr') === '1',
    k: p.get('k') && kanalBul(p.get('k')!) ? p.get('k')!.toUpperCase() : undefined,
  };
}

/* ---------- Bileşen ---------- */

function TurEtiketi({tur}: {tur: Tur}): ReactNode {
  return <span className={clsx(styles.tur, styles[`tur${tur}`])}>{tur === 'ILS' ? 'LOC' : tur === 'DME' ? 'DME' : 'VOR'}</span>;
}

function IstasyonBaglantisi({u}: {u: Kullanici}): ReactNode {
  return (
    <Link to={`${HARITA}?secili=${encodeURIComponent(u.ident)}`} className={styles.istasyon} title={`${u.tur} · ${u.ad}`}>
      {u.ident}
    </Link>
  );
}

export default function KanalTablosu(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const dataUrl = useBaseUrl('/data/turkiye-navigasyon.json');
  const [ayar, setAyar] = useState<Ayar>(VARSAYILAN);
  const [secili, setSecili] = useState<string | null>(null);
  const [siralama, setSiralama] = useState<Siralama>({alan: 'kanal', yon: 1});
  const [veri, setVeri] = useState<{harita: Map<string, Kullanici[]>; amdt?: string} | 'yukleniyor' | 'hata'>(
    'yukleniyor',
  );
  const [kopyalandi, setKopyalandi] = useState(false);

  const degistir = (parca: Partial<Ayar>) => setAyar((onceki) => ({...onceki, ...parca}));

  useEffect(() => {
    const uygula = () => {
      const h = hashOku();
      if (!h) return;
      const {k, ...a} = h;
      setAyar(a);
      setSecili(k ?? null);
    };
    uygula();
    window.addEventListener('hashchange', uygula);
    return () => window.removeEventListener('hashchange', uygula);
  }, []);

  useEffect(() => {
    let iptal = false;
    fetch(dataUrl)
      .then((r) => (r.ok ? (r.json() as Promise<NavData>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => !iptal && setVeri({harita: kullaniciHaritasi(d), amdt: d.aip.amdt}))
      .catch(() => !iptal && setVeri('hata'));
    return () => {
      iptal = true;
    };
  }, [dataUrl]);

  const harita = typeof veri === 'object' ? veri.harita : undefined;
  const kullanicilarOf = (k: Kanal) => harita?.get(k.ad) ?? [];

  const sayilar = useMemo(() => {
    const s: Record<Tur, number> = {VOR: 0, ILS: 0, DME: 0};
    for (const k of KANALLAR) s[k.tur] += 1;
    return s;
  }, []);

  const gorunen = useMemo(() => {
    const sorgu = sorguOf(ayar.ara);
    const liste = KANALLAR.filter((k) => {
      if (ayar.turler.length > 0 && !ayar.turler.includes(k.tur)) return false;
      if (ayar.mod && k.mod !== ayar.mod) return false;
      const u = harita?.get(k.ad) ?? [];
      if (ayar.tr && u.length === 0) return false;
      return !sorgu || sorgu(k, u);
    });
    const deger = (k: Kanal): number | undefined =>
      siralama.alan === 'kanal'
        ? k.no * 2 + (k.mod === 'Y' ? 1 : 0)
        : siralama.alan === 'vhf'
          ? k.vhf
          : siralama.alan === 'gs'
            ? k.gs
            : k[siralama.alan];
    return liste.sort((a, b) => {
      const x = deger(a);
      const y = deger(b);
      if (x === undefined || y === undefined) return x === y ? a.no - b.no : x === undefined ? 1 : -1;
      return (x - y) * siralama.yon;
    });
  }, [ayar, harita, siralama]);

  const ayrinti = secili ? kanalBul(secili) : gorunen.length === 1 ? gorunen[0] : undefined;
  const suzgecVar = ayar.ara.trim() !== '' || ayar.turler.length > 0 || ayar.mod !== null || ayar.tr;
  const kullanilanSayisi = harita ? harita.size : 0;

  const turDegistir = (t: Tur) =>
    degistir({turler: ayar.turler.includes(t) ? ayar.turler.filter((x) => x !== t) : [...ayar.turler, t]});

  const sirala = (alan: Alan) =>
    setSiralama((s) => (s.alan === alan ? {alan, yon: s.yon === 1 ? -1 : 1} : {alan, yon: 1}));

  const csvIndir = () => {
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const satirlar: unknown[][] = [
      ['# VOR / ILS / DME kanal planı (ICAO Ek 10 Cilt I eşlemesinden hesaplanmıştır; aviyonikyazilim.com/araclar)'],
      ...(harita ? [[`# Türkiye sütunu: AIP Türkiye © DHMİ${typeof veri === 'object' && veri.amdt ? ` (AMDT ${veri.amdt})` : ''}`]] : []),
      [
        'DME kanalı',
        'Tür',
        'VOR/LOC (MHz)',
        'GS (MHz)',
        'DME sorgu (MHz)',
        'DME cevap (MHz)',
        'Sorgu darbe aralığı (µs)',
        'Cevap darbe aralığı (µs)',
        'Türkiye',
      ],
      ...gorunen.map((k) => [
        k.ad,
        TUR_ADI[k.tur],
        k.vhf ? mhz(k.vhf) : '',
        k.gs ? mhz(k.gs) : '',
        k.sorgu,
        k.cevap,
        k.sorguKod,
        k.cevapKod,
        kullanicilarOf(k)
          .map((u) => `${u.ident} (${u.tur}, ${u.ad})`)
          .join(', '),
      ]),
    ];
    const csv = satirlar.map((s) => s.map(kacis).join(';')).join('\n');
    indir(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}), 'vor-ils-dme-kanallari.csv');
  };

  const paylas = () => {
    const p = new URLSearchParams();
    if (ayar.ara.trim()) p.set('ara', ayar.ara.trim());
    if (ayar.turler.length > 0) p.set('tur', ayar.turler.join(','));
    if (ayar.mod) p.set('mod', ayar.mod);
    if (ayar.tr) p.set('tr', '1');
    if (secili) p.set('k', secili);
    const hash = p.toString();
    const url = `${window.location.origin}${window.location.pathname}${hash ? `#${hash}` : ''}`;
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

  // Sıralanabilir sütun başlığı; bileşen değil işlev: her çizimde yeniden bağlanıp odağı kaybetmesin
  const baslik = (alan: Alan, etiket: string) => (
    <th scope="col" aria-sort={siralama.alan === alan ? (siralama.yon === 1 ? 'ascending' : 'descending') : undefined}>
      <button type="button" className={styles.sirala} onClick={() => sirala(alan)}>
        {etiket}
        <span className={styles.ok} aria-hidden="true">
          {siralama.alan === alan ? (siralama.yon === 1 ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );

  return (
    <div ref={rootRef} className={styles.arac} data-boyut={geo.boyut} data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.etiket}>VOR · ILS · DME kanal planı</span>
        <span className={styles.ustDugmeler}>
          <button type="button" className={styles.dugme} onClick={csvIndir} disabled={gorunen.length === 0}>
            CSV indir
          </button>
          <button type="button" className={styles.dugme} onClick={paylas}>
            {kopyalandi ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
        </span>
      </div>

      <div className={styles.suzgecSatiri}>
        <label className={clsx(styles.alan, styles.aramaAlani)}>
          <span className={styles.etiket}>Ara</span>
          <input
            type="search"
            value={ayar.ara}
            placeholder="110.3 · 40X · 335 · 1065 · ESB · Esenboğa"
            onChange={(e) => {
              degistir({ara: e.target.value});
              setSecili(null);
            }}
            aria-describedby="kanal-arama-ipucu"
          />
        </label>
        <label className={styles.alan}>
          <span className={styles.etiket}>Mod</span>
          <select
            value={ayar.mod ?? ''}
            onChange={(e) => degistir({mod: e.target.value === 'X' || e.target.value === 'Y' ? e.target.value : null})}>
            <option value="">X ve Y</option>
            <option value="X">X</option>
            <option value="Y">Y</option>
          </select>
        </label>
      </div>
      <p id="kanal-arama-ipucu" className={styles.ipucu}>
        Frekans (VOR, LOC, GS ya da DME), kanal (<code>40X</code>), kanal numarası ya da Türkiye'deki bir istasyonun kodu
        veya adı yazın.
      </p>

      <div className={styles.secenekler}>
        <div className={styles.turler} role="group" aria-label="Kanal türü">
          {TURLER.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={ayar.turler.includes(t)}
              className={clsx(styles.turDugme, ayar.turler.includes(t) && styles.seciliTur)}
              onClick={() => turDegistir(t)}>
              <TurEtiketi tur={t} />
              {TUR_ADI[t]}
              <span className={styles.sayi}>{sayilar[t]}</span>
            </button>
          ))}
        </div>
        <label className={styles.onay}>
          <input
            type="checkbox"
            checked={ayar.tr}
            disabled={!harita}
            onChange={(e) => degistir({tr: e.target.checked})}
          />
          Yalnızca Türkiye'de kullanılanlar
          {harita && <span className={styles.sayi}>{kullanilanSayisi}</span>}
        </label>
      </div>

      {ayrinti && (
        <section className={styles.ayrinti} aria-label={`Kanal ${ayrinti.ad} ayrıntısı`}>
          <header className={styles.ayrintiUst}>
            <p className={styles.ayrintiBaslik}>
              Kanal {ayrinti.ad} <TurEtiketi tur={ayrinti.tur} />
            </p>
            {secili && (
              <button type="button" className={styles.dugme} onClick={() => setSecili(null)}>
                Kapat
              </button>
            )}
          </header>
          <dl className={styles.kartlar}>
            <div className={styles.kart}>
              <dt className={styles.etiket}>{ayrinti.tur === 'ILS' ? 'LOC' : 'VOR'}</dt>
              <dd>{ayrinti.vhf ? <b>{mhz(ayrinti.vhf)} MHz</b> : <span className={styles.yok}>VHF eşi yok</span>}</dd>
            </div>
            <div className={styles.kart}>
              <dt className={styles.etiket}>GS</dt>
              <dd>{ayrinti.gs ? <b>{mhz(ayrinti.gs)} MHz</b> : <span className={styles.yok}>—</span>}</dd>
            </div>
            <div className={styles.kart}>
              <dt className={styles.etiket}>DME sorgu → cevap</dt>
              <dd>
                <b>
                  {ayrinti.sorgu} → {ayrinti.cevap} MHz
                </b>
              </dd>
            </div>
            <div className={styles.kart}>
              <dt className={styles.etiket}>Darbe aralığı</dt>
              <dd>
                <b>
                  {ayrinti.sorguKod} / {ayrinti.cevapKod} µs
                </b>
              </dd>
            </div>
          </dl>
          <p className={styles.not}>
            {ayrinti.tur === 'ILS'
              ? `Alıcıda ${mhz(ayrinti.vhf!)} MHz seçildiğinde süzülüş yolu alıcısı ${mhz(ayrinti.gs!)} MHz'e, DME ${ayrinti.ad} kanalına kendiliğinden ayarlanır.`
              : ayrinti.tur === 'VOR'
                ? `Alıcıda ${mhz(ayrinti.vhf!)} MHz seçildiğinde DME ${ayrinti.ad} kanalına kendiliğinden ayarlanır; VOR/DME ve VORTAC istasyonları bu eşi kullanır.`
                : `Bu kanalın VHF eşi yoktur: TACAN ya da tek başına DME için ayrılmıştır. Sivil alıcıda yalnızca kanal numarasıyla (ya da DME'yi bağımsız ayarlayarak) seçilir.`}{' '}
            Uçak {ayrinti.sorgu} MHz'te {ayrinti.sorguKod} µs aralıklı darbe çiftleriyle sorgular, yer istasyonu{' '}
            {ayrinti.sorgu > ayrinti.cevap ? '63 MHz aşağıda' : '63 MHz yukarıda'} ({ayrinti.cevap} MHz) {ayrinti.cevapKod} µs
            aralıkla cevaplar.
          </p>
          {harita && (
            <p className={styles.ayrintiTr}>
              <span className={styles.etiket}>Türkiye'de</span>{' '}
              {kullanicilarOf(ayrinti).length === 0
                ? 'bu kanalı kullanan istasyon yok.'
                : kullanicilarOf(ayrinti).map((u, i) => (
                    <span key={`${u.ident}-${u.tur}`}>
                      {i > 0 && ', '}
                      <IstasyonBaglantisi u={u} /> <span className={styles.istasyonAdi}>{u.tur}, {u.ad}</span>
                    </span>
                  ))}
            </p>
          )}
        </section>
      )}

      <div className={styles.listeUst}>
        <p className={styles.sonuc} aria-live="polite">
          <b>{gorunen.length}</b> / {KANALLAR.length} kanal
        </p>
        {suzgecVar && (
          <button
            type="button"
            className={styles.dugme}
            onClick={() => {
              setAyar(VARSAYILAN);
              setSecili(null);
            }}>
            Süzgeçleri temizle
          </button>
        )}
      </div>

      {gorunen.length === 0 ? (
        <p className={styles.bos}>Bu ölçütlere uyan kanal yok.</p>
      ) : (
        <div className={styles.tabloSar} tabIndex={0} role="region" aria-label="Kanal tablosu">
          <table className={styles.tablo}>
            <thead>
              <tr>
                {baslik('kanal', 'Kanal')}
                {baslik('vhf', 'VOR / LOC')}
                {baslik('gs', 'GS')}
                {baslik('sorgu', 'DME sorgu')}
                {baslik('cevap', 'DME cevap')}
                <th scope="col" className={styles.darbe}>
                  Darbe (µs)
                </th>
                <th scope="col">Türkiye</th>
              </tr>
            </thead>
            <tbody>
              {gorunen.map((k) => {
                const u = kullanicilarOf(k);
                return (
                  <tr key={k.ad} className={clsx(ayrinti?.ad === k.ad && styles.seciliSatir)}>
                    <th scope="row">
                      <button
                        type="button"
                        className={styles.kanalDugme}
                        aria-pressed={secili === k.ad}
                        onClick={() => setSecili(secili === k.ad ? null : k.ad)}>
                        {k.ad}
                      </button>
                    </th>
                    <td>
                      {k.vhf ? (
                        <span className={styles.frekans}>
                          {mhz(k.vhf)} <TurEtiketi tur={k.tur} />
                        </span>
                      ) : (
                        <span className={styles.frekans}>
                          <span className={styles.yok}>—</span> <TurEtiketi tur="DME" />
                        </span>
                      )}
                    </td>
                    <td>{k.gs ? mhz(k.gs) : <span className={styles.yok}>—</span>}</td>
                    <td>{k.sorgu}</td>
                    <td>{k.cevap}</td>
                    <td className={styles.darbe}>
                      {k.sorguKod} / {k.cevapKod}
                    </td>
                    <td className={styles.trHucre}>
                      {u.slice(0, 3).map((x, i) => (
                        <span key={`${x.ident}-${x.tur}`}>
                          {i > 0 && ' '}
                          <IstasyonBaglantisi u={x} />
                        </span>
                      ))}
                      {u.length > 3 && (
                        <button type="button" className={styles.dahaFazla} onClick={() => setSecili(k.ad)}>
                          +{u.length - 3}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className={styles.ipucu}>
        Frekanslar MHz'tir. Sütun başlığına tıklayarak sıralayın; kanal adına tıklayınca ayrıntısı açılır.{' '}
        {veri === 'hata'
          ? 'Türkiye verisi yüklenemedi.'
          : typeof veri === 'object' && (
              <>
                Türkiye sütunu:{' '}
                <a href="https://dhmi.gov.tr/Sayfalar/aipturkey.aspx">AIP Türkiye</a> © DHMİ
                {veri.amdt ? ` (AMDT ${veri.amdt})` : ''}; seyrüsefer amaçlı kullanılmaz.
              </>
            )}
      </p>
    </div>
  );
}
