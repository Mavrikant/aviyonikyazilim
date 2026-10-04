import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import {IfadeHatasi, ayristir} from './ifade';
import type {Ayrisim} from './ifade';
import {analizEt, benzersizEs, enKucukSet, kapsamHesapla, kosulDegeri} from './mcdc';
import type {Analiz, Olcut} from './mcdc';
import styles from './styles.module.css';

const ORNEKLER: {ad: string; ifade: string; aciklama?: string}[] = [
  {
    ad: 'Kitaptaki örnek: basınç uyarısı',
    ifade: '(basinc_dusuk && motor_calisiyor) || bakim_kipi',
    aciklama: 'Üç koşul için dört test yeter (n+1). Karar kapsama iki testle sağlanır ama bakim_kipi koşulunun etkisini göstermez.',
  },
  {ad: 'Üç koşullu VE', ifade: 'A && B && C'},
  {ad: 'Üç koşullu VEYA', ifade: 'A || B || C'},
  {
    ad: 'VE grupları: maskeleme daha az test ister',
    ifade: '(A && B) || (C && D)',
    aciklama: 'Benzersiz neden beş test (n+1) ister; maskelemede diğer gruptaki koşullar birlikte değişebildiği için dört test yeter.',
  },
  {ad: 'Karşılaştırmalı koşullar', ifade: '(irtifa > 1000 && hiz < 250) || acil_durum'},
  {ad: 'Değil işleçli', ifade: 'A && (B || C) && !D'},
  {
    ad: 'Bağlı koşul: A iki kez geçiyor',
    ifade: '(A && B) || (A && C)',
    aciklama: 'A iki yerde geçtiği için bir geçişi değiştirilirken diğeri sabit tutulamaz; benzersiz neden gösterilemez, maskeleme gösterir.',
  },
  {
    ad: 'Gereksiz koşul',
    ifade: 'A && (A || B)',
    aciklama: 'İfade yalnızca A\'ya eşittir: B hiçbir girdide kararı belirlemez. MC/DC bu tür gereksiz mantığı ortaya çıkarır.',
  },
  {ad: 'Kısa devresiz C işleçleri (& ve |)', ifade: '(A & B) | C'},
];

const OLCUTLER: {key: Olcut; ad: string; ipucu: string}[] = [
  {key: 'benzersiz', ad: 'Benzersiz neden', ipucu: 'Çiftteki iki test yalnızca o koşulda ayrılır'},
  {key: 'maskeleme', ad: 'Maskeleme', ipucu: 'Diğer koşullar, kararı etkilemedikleri sürece değişebilir'},
];

const RENK_SAYISI = 12;
const TABLO_SINIRI = 8;
const DEPO = 'mcdc-araci';
const ALT_RAKAM = '₀₁₂₃₄₅₆₇₈₉';
const altSimge = (n: number) => String(n).replace(/\d/g, (d) => ALT_RAKAM[Number(d)]);

type Cozum = {a: Ayrisim; an: Analiz};

/** Paylaşım: ifade, ölçüt ve (değiştirildiyse) seçili satırlar adresin #d= kısmında */
function kodla(e: string, o: Olcut, s: number[] | null): string {
  const json = JSON.stringify(s ? {e, o, s} : {e, o});
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function coz(d: string): {e: string; o: Olcut; s: number[] | null} | undefined {
  try {
    const v = JSON.parse(decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))))) as {
      e?: unknown;
      o?: unknown;
      s?: unknown;
    };
    if (typeof v.e !== 'string' || v.e.length > 500) return undefined;
    const s = Array.isArray(v.s) ? v.s.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < 4096) : null;
    return {e: v.e, o: v.o === 'maskeleme' ? 'maskeleme' : 'benzersiz', s};
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

/* ---------- Doğruluk tablosu satırı ---------- */

type SatirProps = {
  v: number;
  an: Analiz;
  olcut: Olcut;
  kisaDevre: boolean;
  imkansiz: boolean[];
  secili: boolean;
  vurgulu: boolean;
  testNo: number;
  onSec: (v: number) => void;
  onVurgula: (satirlar: number[]) => void;
};

const TabloSatiri = memo(function TabloSatiri({
  v,
  an,
  olcut,
  kisaDevre,
  imkansiz,
  secili,
  vurgulu,
  testNo,
  onSec,
  onVurgula,
}: SatirProps) {
  return (
    <tr className={clsx(secili && styles.seciliSatir, vurgulu && styles.vurguSatir)} onClick={() => onSec(v)}>
      <td className={styles.secHucre}>
        <input
          type="checkbox"
          checked={secili}
          aria-label={`Satır ${v + 1} test setinde`}
          onChange={() => onSec(v)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className={styles.no}>
        {v + 1}
        {secili && <span className={styles.testEtiketi}>T{testNo}</span>}
      </td>
      {an.bit.map((b, i) => {
        const okunmaz = kisaDevre && !(an.degerlendirilen[v] & b);
        return (
          <td
            key={i}
            className={clsx(styles.deger, okunmaz && styles.okunmaz)}
            title={okunmaz ? 'Kısa devre: bu satırda değerlendirilmez' : undefined}>
            {v & b ? 1 : 0}
          </td>
        );
      })}
      <td className={clsx(styles.deger, styles.kararHucre)}>{an.karar[v]}</td>
      {Array.from({length: an.m}, (_, k) => {
        if (imkansiz[k]) return <td key={k} className={styles.cift} />;
        if (olcut === 'benzersiz') {
          const es = benzersizEs(an, k, v);
          return (
            <td key={k} className={styles.cift}>
              {es >= 0 && (
                <button
                  type="button"
                  className={styles.esDugme}
                  title={`Satır ${v + 1} ile ${es + 1} yalnızca bu koşulda ayrılır ve kararı değiştirir`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVurgula([v, es]);
                  }}>
                  {es + 1}
                </button>
              )}
            </td>
          );
        }
        const det = an.belirleyici[k][v];
        const deger = kosulDegeri(an, k, v);
        return (
          <td key={k} className={styles.cift} title={det ? `Bu satırda koşul kararı tek başına belirler (değeri ${deger})` : undefined}>
            {det ? (deger ? '●' : '○') : ''}
          </td>
        );
      })}
    </tr>
  );
});

/* ---------- Ana bileşen ---------- */

export default function McdcAraci(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const [metin, setMetin] = useState(ORNEKLER[0].ifade);
  const [ornek, setOrnek] = useState<number | null>(0);
  const [olcut, setOlcut] = useState<Olcut>('benzersiz');
  const [kisaDevre, setKisaDevre] = useState(true);
  const [secim, setSecim] = useState<number[] | null>(null);
  const [vurgu, setVurgu] = useState<number[] | null>(null);
  const [yalnizSecili, setYalnizSecili] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);
  const yuklendi = useRef(false);

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

  /* ----- kayıt ve paylaşım bağlantısı ----- */
  // Dışarıdan (kayıt, bağlantı) gelen ifade geçersizse önceki ifadenin sonucu gösterilmez
  const sonGecerli = useRef<Cozum | null>(null);

  // Paylaşılan seçim, ifade ve ölçüt bağlantıdakine geçtikten sonra uygulanır
  const bekleyenSecim = useRef<{e: string; o: Olcut; s: number[]} | null>(null);
  const metinRef = useRef(metin);
  metinRef.current = metin;
  const olcutRef = useRef(olcut);
  olcutRef.current = olcut;

  const paylasilaniUygula = () => {
    const d = new URLSearchParams(window.location.hash.slice(1)).get('d');
    if (!d) return false;
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    const p = coz(d);
    if (!p) return false;
    const i = ORNEKLER.findIndex((o) => o.ifade === p.e);
    sonGecerli.current = null;
    setMetin(p.e);
    setOrnek(i >= 0 ? i : null);
    setOlcut(p.o);
    bekleyenSecim.current = p.s ? {e: p.e, o: p.o, s: p.s} : null;
    return true;
  };

  useEffect(() => {
    if (!paylasilaniUygula()) {
      try {
        const k = JSON.parse(window.localStorage.getItem(DEPO) ?? 'null') as {v?: number; e?: unknown; o?: unknown; k?: unknown} | null;
        if (k?.v === 1 && typeof k.e === 'string' && k.e.length <= 500) {
          sonGecerli.current = null;
          setMetin(k.e);
          const i = ORNEKLER.findIndex((o) => o.ifade === k.e);
          setOrnek(i >= 0 ? i : null);
          setOlcut(k.o === 'maskeleme' ? 'maskeleme' : 'benzersiz');
          setKisaDevre(k.k !== false);
        }
      } catch {
        // bozuk kayıt yok sayılır
      }
    }
    yuklendi.current = true;
    const hashDegisti = () => paylasilaniUygula();
    window.addEventListener('hashchange', hashDegisti);
    return () => window.removeEventListener('hashchange', hashDegisti);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----- çözümleme ----- */
  const cozum = useMemo((): Cozum | {hata: IfadeHatasi} => {
    try {
      const a = ayristir(metin);
      return {a, an: analizEt(a)};
    } catch (e) {
      if (e instanceof IfadeHatasi) return {hata: e};
      throw e;
    }
  }, [metin]);
  // Yazarken geçersiz ara durumlarda son geçerli çözüm gösterilmeye devam eder
  if ('a' in cozum) sonGecerli.current = cozum;
  const gecerli = 'a' in cozum ? cozum : sonGecerli.current;
  const hata = 'hata' in cozum ? cozum.hata : null;

  // Yalnızca geçerli ifadeler saklanır; yarım kalmış yazım bir sonraki açılışa taşınmaz
  useEffect(() => {
    if (!yuklendi.current || !('a' in cozum)) return;
    try {
      window.localStorage.setItem(DEPO, JSON.stringify({v: 1, e: metin, o: olcut, k: kisaDevre}));
    } catch {
      // kapalı depolama: kayıt yapılmaz
    }
  }, [cozum, metin, olcut, kisaDevre]);

  const enKucuk = useMemo(() => (gecerli ? enKucukSet(gecerli.an, gecerli.a, olcut) : null), [gecerli, olcut]);

  // İfade ya da ölçüt değişince seçim yeniden en küçük sete döner (paylaşılan seçim bir kez uygulanır)
  useEffect(() => {
    const b = bekleyenSecim.current;
    if (b && b.e === metinRef.current && b.o === olcutRef.current) {
      setSecim(b.s);
      bekleyenSecim.current = null;
    } else setSecim(null);
    setVurgu(null);
  }, [gecerli, olcut]);

  const satirSayisi = gecerli?.an.satirSayisi ?? 0;
  const etkinSecim = useMemo(
    () => (secim ?? enKucuk?.satirlar ?? []).filter((v) => v < satirSayisi),
    [secim, enKucuk, satirSayisi],
  );
  const kapsam = useMemo(
    () => (gecerli ? kapsamHesapla(gecerli.an, olcut, etkinSecim) : null),
    [gecerli, olcut, etkinSecim],
  );

  const satirSec = useCallback(
    (v: number) =>
      setSecim((s) => {
        const temel = s ?? enKucuk?.satirlar ?? [];
        return temel.includes(v) ? temel.filter((x) => x !== v) : [...temel, v].sort((a, b) => a - b);
      }),
    [enKucuk],
  );
  const satirlarEkle = (satirlar: number[]) =>
    setSecim((s) => [...new Set([...(s ?? enKucuk?.satirlar ?? []), ...satirlar])].sort((a, b) => a - b));
  const vurgula = useCallback((satirlar: number[]) => setVurgu(satirlar), []);

  /* ----- etiketler ----- */
  const etiketler = useMemo(() => {
    if (!gecerli) return {degisken: [] as string[], kosul: [] as string[], sira: [] as number[]};
    const adlar = gecerli.a.degiskenler;
    const kisa = adlar.every((x) => x.length <= 3);
    const degisken = adlar.map((x, i) => (kisa ? x : String.fromCharCode(65 + i)));
    // Bağlı koşulların geçişleri alt indisle ayrılır: A₁, A₂
    const sayac = new Map<number, number>();
    const sira = gecerli.an.degisken.map((d) => {
      sayac.set(d, (sayac.get(d) ?? 0) + 1);
      return sayac.get(d)!;
    });
    const kosul = gecerli.an.degisken.map((d, k) => degisken[d] + (gecerli.an.bagli[k] ? altSimge(sira[k]) : ''));
    return {degisken, kosul, sira};
  }, [gecerli]);
  const kisaAdlar = gecerli ? etiketler.degisken.every((e, i) => e === gecerli.a.degiskenler[i]) : true;

  const testNo = useMemo(() => new Map(etkinSecim.map((v, i) => [v, i + 1])), [etkinSecim]);
  const imkansiz = useMemo(() => (kapsam ? kapsam.kosullar.map((d) => d.durum === 'imkansiz') : []), [kapsam]);
  // Satırın gösterdiği bağımsızlıklar (kapsamdaki çiftlerden)
  const roller = useMemo(() => {
    const r = new Map<number, number[]>();
    kapsam?.kosullar.forEach((d, k) => {
      if (!d.cift) return;
      for (const v of d.cift) r.set(v, [...(r.get(v) ?? []), k]);
    });
    return r;
  }, [kapsam]);

  /* ----- dışa aktarma ----- */
  const csvIndir = () => {
    if (!gecerli || !kapsam) return;
    const {an, a} = gecerli;
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const satirlar: unknown[][] = [
      [`# Karar: ${metin}`],
      [`# Ölçüt: ${OLCUTLER.find((o) => o.key === olcut)!.ad} MC/DC; ${kapsam.mcdc ? 'sağlanıyor' : 'sağlanmıyor'}`],
      ...a.degiskenler.map((d, i) => [`# ${etiketler.degisken[i]} = ${d}`]),
      ['Test', 'Satır', ...etiketler.degisken, 'Karar', 'Gösterdiği bağımsızlık', 'Kısa devreyle değerlendirilmeyen'],
      ...etkinSecim.map((v, i) => [
        `T${i + 1}`,
        v + 1,
        ...an.bit.map((b) => (v & b ? 1 : 0)),
        an.karar[v],
        (roller.get(v) ?? []).map((k) => etiketler.kosul[k]).join(' '),
        an.bit.flatMap((b, j) => (an.degerlendirilen[v] & b ? [] : [etiketler.degisken[j]])).join(' '),
      ]),
    ];
    const csv = satirlar.map((s) => s.map(kacis).join(';')).join('\n');
    indir(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}), 'mcdc-test-seti.csv');
  };

  const paylas = () => {
    const url = `${window.location.origin}${window.location.pathname}#d=${kodla(metin, olcut, secim)}`;
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

  /* ----- görünüm ----- */
  const an = gecerli?.an;
  const tamamSayisi = kapsam?.kosullar.filter((d) => d.durum === 'tamam').length ?? 0;
  const imkansizSayisi = imkansiz.filter(Boolean).length;
  const tabloSatirlari = useMemo(() => {
    if (!an || an.n > TABLO_SINIRI) return [];
    const tum = Array.from({length: an.satirSayisi}, (_, v) => v);
    return yalnizSecili ? tum.filter((v) => testNo.has(v)) : tum;
  }, [an, yalnizSecili, testNo]);
  const vurguKume = useMemo(() => new Set(vurgu ?? []), [vurgu]);
  // İfade kutusu içeriğe göre uzar (satır başına yaklaşık karakter, kapsayıcı genişliğinden)
  const satirKarakteri = geo.boyut === 'kucuk' ? 20 : geo.boyut === 'orta' ? 50 : 80;
  const kutuSatiri = Math.min(
    6,
    Math.max(2, metin.split('\n').reduce((t, s) => t + Math.max(1, Math.ceil(s.length / satirKarakteri)), 0)),
  );

  const ifadeGosterimi = () => {
    if (!gecerli || hata) return null;
    const parcalar: ReactNode[] = [];
    let i = 0;
    gecerli.a.kosullar.forEach((k, no) => {
      if (k.bas > i) parcalar.push(metin.slice(i, k.bas));
      parcalar.push(
        <span key={no} className={clsx(styles.kosulMetni, styles[`renk${k.degisken % RENK_SAYISI}`])}>
          {metin.slice(k.bas, k.son)}
          {!kisaAdlar ? <sup>{etiketler.kosul[no]}</sup> : gecerli.an.bagli[no] && <sub>{etiketler.sira[no]}</sub>}
        </span>,
      );
      i = k.son;
    });
    if (i < metin.length) parcalar.push(metin.slice(i));
    return parcalar;
  };

  return (
    <div
      ref={rootRef}
      className={clsx(styles.arac, tamEkranda && styles.tamEkran)}
      data-boyut={geo.boyut}
      data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>MC/DC test seti</span>
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

      {/* ---------- Karar ifadesi ---------- */}
      <section className={styles.giris} aria-label="Karar ifadesi">
        <div className={styles.girisUst}>
          <label className={styles.etiket} htmlFor="mcdc-ifade">
            Karar (C sözdizimi)
          </label>
          <label className={styles.ornekSecici}>
            <span className={styles.gizli}>Örnek</span>
            <select
              value={ornek ?? ''}
              onChange={(e) => {
                if (e.target.value === '') return;
                const i = Number(e.target.value);
                setOrnek(i);
                setMetin(ORNEKLER[i].ifade);
              }}>
              <option value="">Örnek ifade…</option>
              {ORNEKLER.map((o, i) => (
                <option key={o.ad} value={i}>
                  {o.ad}
                </option>
              ))}
            </select>
          </label>
        </div>
        <textarea
          id="mcdc-ifade"
          className={clsx(styles.ifade, hata && styles.hataliGiris)}
          value={metin}
          rows={kutuSatiri}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-invalid={!!hata}
          aria-describedby="mcdc-ifade-durum"
          onChange={(e) => {
            setMetin(e.target.value);
            setOrnek(null);
          }}
        />
        <div id="mcdc-ifade-durum" className={styles.ifadeDurum} aria-live="polite">
          {hata ? (
            <p className={styles.hata}>
              <b>{hata.message}</b>
              <code className={styles.hataYeri}>
                {metin.slice(0, hata.konum)}
                <mark>{metin.slice(hata.konum, hata.konum + 1) || ' '}</mark>
                {metin.slice(hata.konum + 1)}
              </code>
              {gecerli && <span className={styles.ipucu}>Aşağıda son geçerli ifadenin sonucu gösteriliyor.</span>}
            </p>
          ) : (
            <p className={styles.gosterim}>{ifadeGosterimi()}</p>
          )}
          {ornek !== null && ORNEKLER[ornek].aciklama && <p className={styles.ornekNot}>{ORNEKLER[ornek].aciklama}</p>}
        </div>
        <p className={styles.ipucu}>
          İşleçler: <code>&amp;&amp;</code> <code>||</code> <code>!</code> (kısa devreli), <code>&amp;</code> <code>|</code>{' '}
          (kısa devresiz), <code>and</code> <code>or</code> <code>not</code>. <code>hiz &gt; 250</code> gibi karşılaştırmalar ve
          işlev çağrıları tek koşuldur.
        </p>

        <div className={styles.secenekler}>
          <div className={styles.secici} role="radiogroup" aria-label="MC/DC ölçütü">
            {OLCUTLER.map((o) => (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={olcut === o.key}
                title={o.ipucu}
                className={clsx(olcut === o.key && styles.secili)}
                onClick={() => setOlcut(o.key)}>
                {o.ad}
              </button>
            ))}
          </div>
          <label className={styles.onay}>
            <input type="checkbox" checked={kisaDevre} onChange={(e) => setKisaDevre(e.target.checked)} />
            Kısa devreyle değerlendirilmeyen değerleri soluk göster
          </label>
        </div>
      </section>

      {gecerli && an && kapsam && enKucuk && (
        <>
          {/* ---------- Koşullar ve özet ---------- */}
          {!kisaAdlar && (
            <ul className={styles.lejant} aria-label="Koşullar">
              {gecerli.a.degiskenler.map((d, i) => (
                <li key={d}>
                  <span className={clsx(styles.rozet, styles[`renk${i % RENK_SAYISI}`])}>{etiketler.degisken[i]}</span>
                  <code>{d}</code>
                </li>
              ))}
            </ul>
          )}

          <section className={styles.ozet} aria-label="Özet">
            <div className={styles.kart}>
              <span className={styles.kartEtiket}>Koşul</span>
              <span className={styles.buyukSayi}>{an.m}</span>
              <span className={styles.ipucu}>
                {an.n} değişken · {an.satirSayisi} kombinasyon
              </span>
            </div>
            <div className={styles.kart}>
              <span className={styles.kartEtiket}>En küçük set</span>
              <span className={styles.buyukSayi}>{enKucuk.satirlar.length} test</span>
              <span className={styles.ipucu}>
                {olcut === 'benzersiz' ? `alt sınır n+1 = ${an.m + 1}` : `benzersiz neden alt sınırı n+1 = ${an.m + 1}`}
                {!enKucuk.kanitlandi && ' · arama sınırına ulaşıldı, daha küçüğü olabilir'}
              </span>
            </div>
            <div className={clsx(styles.kart, kapsam.mcdc ? styles.iyi : styles.kotu)}>
              <span className={styles.kartEtiket}>Seçili set ({etkinSecim.length} test)</span>
              <span className={styles.buyukSayi}>{kapsam.mcdc ? 'MC/DC ✓' : 'MC/DC ✗'}</span>
              <span className={styles.ipucu}>
                {tamamSayisi}/{an.m} koşulun bağımsız etkisi gösterildi
                {imkansizSayisi > 0 && ` · ${imkansizSayisi} koşulda gösterilemez`}
              </span>
            </div>
          </section>

          <div className={styles.calisma}>
            {/* ---------- Koşul bazında kapsam ---------- */}
            <section className={styles.bolum} aria-label="Koşul bazında kapsam">
              <h3 className={styles.bolumBaslik}>Koşul bazında bağımsız etki</h3>
              <ul className={styles.kapsamListe}>
                {kapsam.kosullar.map((d, k) => (
                  <li key={k} className={styles[d.durum]}>
                    <span className={clsx(styles.rozet, styles[`renk${an.degisken[k] % RENK_SAYISI}`])}>{etiketler.kosul[k]}</span>
                    <div>
                      <code className={styles.kosulAdi}>{gecerli.a.degiskenler[an.degisken[k]]}</code>
                      {d.durum === 'tamam' && d.cift && (
                        <p>
                          ✓ T{testNo.get(d.cift[0])} ↔ T{testNo.get(d.cift[1])} (satır {d.cift[0] + 1} ↔ {d.cift[1] + 1}){' '}
                          <button type="button" className={styles.metinDugme} onClick={() => vurgula(d.cift!)}>
                            tabloda göster
                          </button>
                        </p>
                      )}
                      {d.durum === 'eksik' && (
                        <p>
                          ✗ Eksik. {d.oneri && d.oneri.length > 0 && <>Satır {d.oneri.map((v) => v + 1).join(' ve ')} eklenirse gösterilir. </>}
                          {d.oneri && d.oneri.length > 0 && (
                            <button type="button" className={styles.metinDugme} onClick={() => satirlarEkle(d.oneri!)}>
                              ekle
                            </button>
                          )}
                        </p>
                      )}
                      {d.durum === 'imkansiz' && <p>⊘ {d.neden}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className={styles.ipucu}>
                Karar kapsama: {kapsam.kararDogru && kapsam.kararYanlis ? '✓ doğru ve yanlış sonuç alındı' : '✗ iki sonuç da alınmadı'} · Koşul
                kapsama: {kapsam.kosulKapsama.every(Boolean) ? '✓ her koşul iki değeri de aldı' : '✗ iki değeri almayan koşul var'}
              </p>
            </section>

            {/* ---------- Test seti ---------- */}
            <section className={styles.bolum} aria-label="Test seti">
              <div className={styles.bolumUst}>
                <h3 className={styles.bolumBaslik}>Test seti</h3>
                <div className={styles.araclar}>
                  <button type="button" className={styles.dugme} onClick={() => setSecim(null)} disabled={secim === null}>
                    En küçük set
                  </button>
                  <button type="button" className={styles.dugme} onClick={() => setSecim([])} disabled={etkinSecim.length === 0}>
                    Temizle
                  </button>
                  <button type="button" className={styles.dugme} onClick={csvIndir} disabled={etkinSecim.length === 0}>
                    CSV
                  </button>
                  <button type="button" className={styles.dugme} onClick={paylas}>
                    {kopyalandi ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
                  </button>
                </div>
              </div>
              {etkinSecim.length === 0 ? (
                <p className={styles.ipucu}>Test seti boş. Doğruluk tablosundan satır seçin ya da en küçük seti yükleyin.</p>
              ) : (
                <div className={styles.tabloKutu}>
                  <table className={styles.tablo}>
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Satır</th>
                        {etiketler.degisken.map((e, i) => (
                          <th key={i} className={styles[`renk${i % RENK_SAYISI}`]}>
                            {e}
                          </th>
                        ))}
                        <th>Karar</th>
                        <th>Gösterdiği</th>
                        <th>
                          <span className={styles.gizli}>Çıkar</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {etkinSecim.map((v, i) => (
                        <tr key={v} className={clsx(vurguKume.has(v) && styles.vurguSatir)}>
                          <td className={styles.no}>T{i + 1}</td>
                          <td className={styles.no}>{v + 1}</td>
                          {an.bit.map((b, j) => {
                            const okunmaz = kisaDevre && !(an.degerlendirilen[v] & b);
                            return (
                              <td
                                key={j}
                                className={clsx(styles.deger, okunmaz && styles.okunmaz)}
                                title={okunmaz ? 'Kısa devre: bu testte değerlendirilmez' : undefined}>
                                {v & b ? 1 : 0}
                              </td>
                            );
                          })}
                          <td className={clsx(styles.deger, styles.kararHucre)}>{an.karar[v]}</td>
                          <td className={styles.roller}>{(roller.get(v) ?? []).map((k) => etiketler.kosul[k]).join(' ')}</td>
                          <td>
                            <button type="button" className={styles.sil} aria-label={`T${i + 1} testini çıkar`} onClick={() => satirSec(v)}>
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* ---------- Doğruluk tablosu ---------- */}
          <section className={styles.bolum} aria-label="Doğruluk tablosu">
            <div className={styles.bolumUst}>
              <h3 className={styles.bolumBaslik}>Doğruluk tablosu</h3>
              {an.n <= TABLO_SINIRI && (
                <label className={styles.onay}>
                  <input type="checkbox" checked={yalnizSecili} onChange={(e) => setYalnizSecili(e.target.checked)} />
                  Yalnızca test setindeki satırlar
                </label>
              )}
            </div>
            {an.n > TABLO_SINIRI ? (
              <p className={styles.ipucu}>
                Doğruluk tablosu en çok {TABLO_SINIRI} değişkene kadar gösterilir ({an.satirSayisi} satır çok uzun). Test seti ve
                kapsam yine tüm kombinasyonlar üzerinden hesaplanır.
              </p>
            ) : (
              <>
                <p className={styles.ipucu}>
                  Satıra tıklayarak test setine ekleyin ya da çıkarın.{' '}
                  {olcut === 'benzersiz'
                    ? 'Sağdaki sütunlar, satırla yalnızca o koşulda ayrılıp kararı değiştiren eş satırı gösterir; numaraya tıklayınca çift vurgulanır.'
                    : 'Sağdaki sütunlarda ● ve ○, koşulun o satırda kararı tek başına belirlediğini gösterir (● değer 1, ○ değer 0); her koşul için birer ● ve ○ satırı yeter.'}
                </p>
                <div className={clsx(styles.tabloKutu, styles.uzunTablo)}>
                  <table className={clsx(styles.tablo, styles.dogrulukTablosu)}>
                    <thead>
                      <tr>
                        <th rowSpan={2}>
                          <span className={styles.gizli}>Seç</span>
                        </th>
                        <th rowSpan={2}>#</th>
                        <th colSpan={an.n}>Koşul değerleri</th>
                        <th rowSpan={2}>Karar</th>
                        <th colSpan={an.m}>{olcut === 'benzersiz' ? 'Bağımsızlık eşi' : 'Belirleyici'}</th>
                      </tr>
                      <tr>
                        {etiketler.degisken.map((e, i) => (
                          <th key={i} className={styles[`renk${i % RENK_SAYISI}`]} title={gecerli.a.degiskenler[i]}>
                            {e}
                          </th>
                        ))}
                        {etiketler.kosul.map((e, k) => (
                          <th
                            key={k}
                            className={clsx(styles[`renk${an.degisken[k] % RENK_SAYISI}`], imkansiz[k] && styles.imkansizBaslik)}
                            title={imkansiz[k] ? kapsam.kosullar[k].neden : gecerli.a.degiskenler[an.degisken[k]]}>
                            {e}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tabloSatirlari.map((v) => (
                        <TabloSatiri
                          key={v}
                          v={v}
                          an={an}
                          olcut={olcut}
                          kisaDevre={kisaDevre}
                          imkansiz={imkansiz}
                          secili={testNo.has(v)}
                          vurgulu={vurguKume.has(v)}
                          testNo={testNo.get(v) ?? 0}
                          onSec={satirSec}
                          onVurgula={vurgula}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
