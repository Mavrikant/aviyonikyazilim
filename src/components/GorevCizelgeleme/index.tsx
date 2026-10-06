import {useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import {MAKS_GOREV, SENARYOLAR, hesapla, sureYaz, yuzdeYaz} from './cizelgeleme';
import type {Ayarlar, Durum as TestDurumu, Gorev, Karar, Politika} from './cizelgeleme';
import Cizelge from './Cizelge';
import styles from './styles.module.css';

const POLITIKALAR: {key: Politika; label: string; ipucu: string}[] = [
  {
    key: 'rm',
    label: 'Sabit öncelik — hız-monoton (RM)',
    ipucu: 'Periyodu kısa olan görev daha yüksek öncelik alır.',
  },
  {
    key: 'dm',
    label: 'Sabit öncelik — zaman sınırı-monoton (DM)',
    ipucu: 'Zaman sınırı kısa olan görev daha yüksek öncelik alır.',
  },
  {
    key: 'elle',
    label: 'Sabit öncelik — tablo sırası',
    ipucu: 'Öncelik tablodaki sıradır: en üstteki görev en yüksek önceliklidir. Sırayı oklarla değiştirin.',
  },
  {
    key: 'edf',
    label: 'EDF — en erken zaman sınırı önce',
    ipucu: 'Öncelik çalışma anında belirlenir: zaman sınırı en yakın olan iş çalışır.',
  },
  {
    key: 'dongusel',
    label: 'Döngüsel yürütücü — çerçeve tablosu',
    ipucu: 'İşler önceden hesaplanan sabit bir tabloyla, küçük çerçeveler içinde sırayla ve kesintisiz çalışır.',
  },
];

const KARAR_ADI: Record<Karar, string> = {
  uygun: 'Çizelgelenebilir',
  kacan: 'Zaman sınırı aşımı',
  asiri: 'Aşırı yük',
};
const TEST_IMI: Record<TestDurumu, string> = {gecti: '✓', kaldi: '✗', belirsiz: '?'};
const TEST_ADI: Record<TestDurumu, string> = {gecti: 'geçti', kaldi: 'kaldı', belirsiz: 'sonuç vermedi'};
const RENK_SAYISI = 8;
const MAKS_CERCEVE_SATIRI = 32;

const sabitMi = (p: Politika) => p === 'rm' || p === 'dm' || p === 'elle';
const msOf = (us: number) => us / 1000;

let sayac = 0;
const yeniId = () => `g${Date.now().toString(36)}${(sayac++).toString(36)}`;
const kimlikle = (gs: Omit<Gorev, 'id'>[]): Gorev[] => gs.map((g) => ({...g, id: yeniId()}));

type Durum = {ayarlar: Ayarlar; gorevler: Gorev[]};

/** Paylaşım bağlantısı: durum adresin #d= kısmında base64url JSON olarak taşınır (sunucuya gitmez) */
function kodla(d: Durum): string {
  const json = JSON.stringify({a: d.ayarlar, g: d.gorevler.map(({id, ...g}) => g)});
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const sayi = (v: unknown, varsayilan: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : varsayilan);

function coz(s: string): Durum | undefined {
  try {
    const json = decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
    const v = JSON.parse(json) as {a?: Partial<Ayarlar>; g?: Partial<Omit<Gorev, 'id'>>[]};
    if (!v.a || !Array.isArray(v.g)) return undefined;
    const politika = POLITIKALAR.some((p) => p.key === v.a!.politika) ? v.a.politika! : 'rm';
    return {
      ayarlar: {politika, kesintili: v.a.kesintili !== false, cerceve: sayi(v.a.cerceve, 0)},
      gorevler: kimlikle(
        v.g.slice(0, MAKS_GOREV).map((g, i) => ({
          ad: typeof g.ad === 'string' ? g.ad.slice(0, 60) : `Görev ${i + 1}`,
          periyot: sayi(g.periyot, 10),
          sure: sayi(g.sure, 1),
          sinir: sayi(g.sinir, sayi(g.periyot, 10)),
          faz: sayi(g.faz, 0),
          engel: sayi(g.engel, 0),
        })),
      ),
    };
  } catch {
    return undefined;
  }
}

function SayiGirdisi({
  value,
  onChange,
  min = 0,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  label: string;
}): ReactNode {
  // Yazarken geçici boş/eksik değerlere izin verilir; geçerli sayı oldukça yukarı iletilir
  const [metin, setMetin] = useState(String(value).replace('.', ','));
  useEffect(() => {
    if (Number(metin.replace(',', '.')) !== value) setMetin(String(value).replace('.', ','));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      inputMode="decimal"
      aria-label={label}
      value={metin}
      onChange={(e) => {
        setMetin(e.target.value);
        const v = Number(e.target.value.replace(',', '.'));
        if (e.target.value.trim() !== '' && Number.isFinite(v) && v >= min) onChange(v);
      }}
      onBlur={() => setMetin(String(value).replace('.', ','))}
    />
  );
}

export default function GorevCizelgeleme(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const [durum, setDurum] = useState<Durum>(() => ({
    ayarlar: SENARYOLAR[0].ayarlar,
    gorevler: kimlikle(SENARYOLAR[0].gorevler),
  }));
  const [senaryo, setSenaryo] = useState<number | null>(0);
  const [ayrinti, setAyrinti] = useState(false);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [tamEkran, setTamEkran] = useState(false);
  // Tarayıcı tam ekranı desteklemiyorsa (ör. iPhone Safari) bileşen ekranı kaplayan katmana dönüşür
  const [yedekTamEkran, setYedekTamEkran] = useState(false);
  const tamEkranda = tamEkran || yedekTamEkran;

  useEffect(() => {
    const degisti = () => {
      const acik = document.fullscreenElement === rootRef.current;
      setTamEkran(acik);
      if (acik) setYedekTamEkran(false); // tarayıcı tam ekranı geç de olsa açıldıysa yedeğe gerek yok
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
      // İstek reddedilmeden askıda kalırsa (bazı gömülü tarayıcılar) yedek katmana geç
      window.setTimeout(() => {
        if (!document.fullscreenElement) setYedekTamEkran(true);
      }, 600);
    } else setYedekTamEkran(true);
  };

  // Paylaşım bağlantısıyla gelindiyse durumu adresten bir kez yükle ve adresi temizle
  useEffect(() => {
    const d = new URLSearchParams(window.location.hash.slice(1)).get('d');
    const c = d ? coz(d) : undefined;
    if (!c) return;
    setDurum(c);
    setSenaryo(null);
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }, []);

  const {ayarlar: a, gorevler} = durum;
  const sonuc = useMemo(() => hesapla(a, gorevler), [a, gorevler]);
  const sabit = sabitMi(a.politika);
  const dongusel = a.politika === 'dongusel';
  const politika = POLITIKALAR.find((p) => p.key === a.politika)!;
  // Girilmiş bir faz ya da engellenme değeri varsa sütunlar gizlenemez (hesaba giriyor)
  const ayrintili = ayrinti || gorevler.some((g) => g.faz > 0 || g.engel > 0);
  const analizVar = sonuc.gorevler.some((r) => r.tepkiAnaliz !== undefined);

  const ayarla = (p: Partial<Ayarlar>) => {
    setSenaryo(null);
    setDurum((d) => ({...d, ayarlar: {...d.ayarlar, ...p}}));
  };
  const gorevDegistir = (id: string, p: Partial<Gorev>) => {
    setSenaryo(null);
    setDurum((d) => ({
      ...d,
      gorevler: d.gorevler.map((g) => {
        if (g.id !== id) return g;
        // Zaman sınırı periyoda eşitse (örtük zaman sınırı) periyotla birlikte değişir
        const sinir = p.periyot !== undefined && g.sinir === g.periyot ? p.periyot : g.sinir;
        return {...g, sinir, ...p};
      }),
    }));
  };
  const gorevTasi = (i: number, yon: -1 | 1) => {
    setSenaryo(null);
    setDurum((d) => {
      const gs = [...d.gorevler];
      const j = i + yon;
      if (j < 0 || j >= gs.length) return d;
      [gs[i], gs[j]] = [gs[j], gs[i]];
      return {...d, gorevler: gs};
    });
  };
  const gorevSil = (id: string) => {
    setSenaryo(null);
    setDurum((d) => ({...d, gorevler: d.gorevler.filter((g) => g.id !== id)}));
  };
  const gorevEkle = () => {
    setSenaryo(null);
    setDurum((d) => ({
      ...d,
      gorevler: [...d.gorevler, {id: yeniId(), ad: `Görev ${d.gorevler.length + 1}`, periyot: 100, sure: 5, sinir: 100, faz: 0, engel: 0}],
    }));
  };
  const senaryoYukle = (i: number) => {
    setSenaryo(i);
    setDurum({ayarlar: SENARYOLAR[i].ayarlar, gorevler: kimlikle(SENARYOLAR[i].gorevler)});
  };

  const paylas = () => {
    const url = `${window.location.origin}${window.location.pathname}#d=${kodla(durum)}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 1800);
    });
  };

  const sonucOf = (id: string) => sonuc.gorevler.find((r) => r.id === id);
  const adOf = (id: string) => gorevler.find((g) => g.id === id)?.ad ?? '';
  const renkOf = (id: string) => styles[`renk${gorevler.findIndex((g) => g.id === id) % RENK_SAYISI}`];

  const csvIndir = () => {
    const ms = (us?: number) => (us === undefined ? '' : Number.isFinite(us) ? String(msOf(us)) : 'sınırsız');
    const sutun = ['Sıra', 'Görev', 'Periyot T (ms)', 'Süre C (ms)', 'Zaman sınırı D (ms)', 'Faz (ms)', 'Engellenme B (ms)', 'Öncelik', 'Kullanım (%)', 'En kötü tepki — analiz (ms)', 'En kötü tepki — benzetim (ms)', 'Pay (ms)', 'En fazla süre (ms)', 'Kaçan iş'];
    const satirlar = gorevler.map((g, i) => {
      const r = sonucOf(g.id);
      return [i + 1, g.ad, g.periyot, g.sure, g.sinir, g.faz, g.engel, r?.oncelik, r ? (r.kullanim * 100).toFixed(3) : '', ms(r?.tepkiAnaliz), ms(r?.tepkiBenzetim), ms(r?.pay), ms(r?.enFazlaSure), r?.kacan];
    });
    const cerceveler = (sonuc.cerceve?.cerceveler ?? []).map((c, i) => [
      `# Çerçeve ${i + 1}`,
      `${msOf(c.bas)} ms`,
      c.isler.map((x) => `${adOf(x.id)} #${x.is + 1}`).join(' | '),
      `boş ${msOf(c.bos)} ms`,
    ]);
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      [`# ${politika.label}${dongusel ? '' : a.kesintili ? ', kesintili' : ', kesintisiz'}`],
      [`# Karar`, KARAR_ADI[sonuc.karar]],
      [`# Toplam kullanım (%)`, (sonuc.kullanim * 100).toFixed(3)],
      [`# Hiperperiyot (ms)`, sonuc.tamHiperperiyot ? msOf(sonuc.hiperperiyot) : 'çok uzun'],
      ...sonuc.testler.map((t) => [`# ${t.ad}`, TEST_ADI[t.durum], t.aciklama]),
      ...(sonuc.cerceve?.secili ? [[`# Küçük çerçeve (ms)`, msOf(sonuc.cerceve.secili)]] : []),
      ...cerceveler,
      sutun,
      ...satirlar,
    ]
      .map((r) => r.map(kacis).join(';'))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gorev-cizelgeleme.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Özet değerler ----------
  const enDar = sonuc.gorevler.reduce<{id: string; pay: number} | undefined>(
    (m, r) => (r.pay !== undefined && (!m || r.pay < m.pay) ? {id: r.id, pay: r.pay} : m),
    undefined,
  );
  const kesilme = sonuc.gorevler.reduce((s, r) => s + r.kesilme, 0);
  const benzetimKacan = sonuc.gorevler.reduce((s, r) => s + r.kacan, 0);
  const cizelgeVar = sonuc.parcalar.length > 0 && sonuc.cizelgePencere > 0;
  const durumSinifi = sonuc.karar === 'uygun' ? styles.iyi : sonuc.karar === 'asiri' ? styles.asiri : styles.uyari;
  const gecerliGorevler = gorevler.filter((g) => sonucOf(g.id));
  const cerceve = sonuc.cerceve;
  const uygunCerceveler = cerceve?.adaylar.filter((x) => x.uygun) ?? [];

  return (
    <div
      ref={rootRef}
      className={clsx(styles.arac, tamEkranda && styles.tamEkran)}
      data-boyut={geo.boyut}
      data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>Görev çizelgeleme</span>
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

      {/* ---------- Ayarlar ---------- */}
      <section className={styles.ayarlar} aria-label="Çizelgeleme ayarları">
        <label className={clsx(styles.alan, styles.genisAlan)}>
          <span className={styles.etiket}>Çizelgeleme politikası</span>
          <select value={a.politika} onChange={(e) => ayarla({politika: e.target.value as Politika})}>
            {POLITIKALAR.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {!dongusel && (
          <div className={styles.alan}>
            <span className={styles.etiket}>Kesinti</span>
            <div className={styles.secici} role="radiogroup" aria-label="Kesinti">
              <button
                type="button"
                role="radio"
                aria-checked={a.kesintili}
                title="Daha öncelikli bir iş hazır olunca çalışan iş durdurulur (preemptive)"
                className={clsx(a.kesintili && styles.secili)}
                onClick={() => ayarla({kesintili: true})}>
                Kesintili
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={!a.kesintili}
                title="Başlayan iş bitene kadar çalışır (non-preemptive)"
                className={clsx(!a.kesintili && styles.secili)}
                onClick={() => ayarla({kesintili: false})}>
                Kesintisiz
              </button>
            </div>
          </div>
        )}

        {dongusel && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Küçük çerçeve</span>
            <select
              value={a.cerceve > 0 && uygunCerceveler.some((x) => x.f === a.cerceve * 1000) ? a.cerceve : 0}
              onChange={(e) => ayarla({cerceve: Number(e.target.value)})}
              disabled={uygunCerceveler.length === 0}>
              <option value={0}>
                Otomatik{cerceve?.secili ? ` (${sureYaz(cerceve.secili)})` : ''}
              </option>
              {uygunCerceveler.map((x) => (
                <option key={x.f} value={msOf(x.f)}>
                  {sureYaz(x.f)}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <p className={styles.ozet}>
        {politika.ipucu} · <b>{sonuc.gorevler.length} görev</b> · U = {yuzdeYaz(sonuc.kullanim)} · hiperperiyot{' '}
        {sonuc.tamHiperperiyot ? sureYaz(sonuc.hiperperiyot) : `${sureYaz(sonuc.hiperperiyot)}’den uzun`}
      </p>

      {/* ---------- Sonuçlar ---------- */}
      <section className={styles.sonuclar} aria-label="Çizelgelenebilirlik sonucu">
        <div className={clsx(styles.kart, durumSinifi)}>
          <div className={styles.kartBaslik}>
            <span>İşlemci kullanımı</span>
            <span className={styles.rozet} role="status">
              {KARAR_ADI[sonuc.karar]}
            </span>
          </div>
          <div className={styles.buyukSayi}>{yuzdeYaz(sonuc.kullanim)}</div>
          <svg className={styles.gosterge} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
            <rect className={styles.gostergeZemin} x="0" y="2" width="100" height="6" rx="1" />
            <rect className={styles.gostergeDolu} x="0" y="2" width={Math.min(100, sonuc.kullanim * 100)} height="6" rx="1" />
          </svg>
          <dl className={styles.kartDetay}>
            {enDar && (
              <>
                <dt>En dar pay</dt>
                <dd className={clsx(enDar.pay < 0 && styles.kirmizi)}>
                  {sureYaz(enDar.pay)} — {adOf(enDar.id)}
                </dd>
              </>
            )}
            {cizelgeVar && (
              <>
                <dt>Boşta</dt>
                <dd>{yuzdeYaz(sonuc.bosta)}</dd>
              </>
            )}
            {!dongusel && cizelgeVar && (
              <>
                <dt>Kesinti</dt>
                <dd>
                  {kesilme} ({sureYaz(sonuc.pencere)} içinde)
                </dd>
              </>
            )}
            {cerceve && cerceve.secili > 0 && (
              <>
                <dt>Çerçeve</dt>
                <dd>
                  {sureYaz(cerceve.secili)} × {cerceve.cerceveler.length} = {sureYaz(cerceve.anaCerceve)}
                </dd>
              </>
            )}
          </dl>
          {sonuc.karar === 'kacan' && benzetimKacan === 0 && !dongusel && (
            <p className={styles.kartNot}>
              Benzetimde aşım görülmedi: analiz, girilen fazlardan bağımsız en kötü durumu (işlerin en elverişsiz anda
              çıkması, engellenme) hesaba katar.
            </p>
          )}
        </div>

        <div className={styles.kart}>
          <div className={styles.kartBaslik}>
            <span>Testler</span>
          </div>
          <ul className={styles.testler}>
            {sonuc.testler.map((t) => (
              <li key={t.ad} className={styles[t.durum]}>
                <span className={styles.testImi} aria-hidden="true">
                  {TEST_IMI[t.durum]}
                </span>
                <span>
                  <b>{t.ad}</b>
                  <span className={styles.gizli}> ({TEST_ADI[t.durum]})</span>
                  <span className={styles.testAciklama}>{t.aciklama}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Görevler ---------- */}
      <section className={styles.gorevler} aria-label="Görevler">
        <div className={styles.bolumBaslik}>
          <h3>Görevler</h3>
          <div className={styles.araclar}>
            <label className={styles.senaryo}>
              <span className={styles.gizli}>Örnek senaryo</span>
              <select value={senaryo ?? ''} onChange={(e) => e.target.value !== '' && senaryoYukle(Number(e.target.value))}>
                <option value="">Örnek senaryo…</option>
                {SENARYOLAR.map((s, i) => (
                  <option key={s.ad} value={i}>
                    {s.ad}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={styles.dugme}
              aria-pressed={ayrintili}
              disabled={ayrintili && !ayrinti}
              title="Faz (ilk çıkış anı) ve engellenme (kritik kesit) sütunlarını göster"
              onClick={() => setAyrinti((x) => !x)}>
              Faz ve engellenme
            </button>
            <button type="button" className={styles.dugme} onClick={paylas}>
              {kopyalandi ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
            </button>
            <button type="button" className={styles.dugme} onClick={csvIndir}>
              CSV indir
            </button>
          </div>
        </div>
        {senaryo !== null && <p className={styles.senaryoNot}>{SENARYOLAR[senaryo].aciklama}</p>}

        <div className={styles.tabloKutu}>
          <table className={styles.tablo}>
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Görev</th>
                <th title="Periyot: işin iki çıkışı arasındaki süre">Periyot T (ms)</th>
                <th title="En kötü durum yürütme süresi (WCET)">Süre C (ms)</th>
                <th title="Göreli zaman sınırı: çıkıştan itibaren işin bitmesi gereken süre">Zaman sınırı D (ms)</th>
                {ayrintili && <th title="İlk işin çıkış anı">Faz (ms)</th>}
                {ayrintili && <th title="Daha düşük öncelikli bir görevin kritik kesitinde beklenen en uzun süre">Engel B (ms)</th>}
                {sabit && <th>Öncelik</th>}
                {analizVar && (
                  <th title={dongusel ? 'Çerçeve tablosundaki en uzun tepki süresi' : 'Analizle bulunan en kötü tepki süresi'}>
                    {dongusel ? 'Tepki (tablo)' : 'Tepki (analiz)'}
                  </th>
                )}
                {!dongusel && <th title="Benzetimde gözlenen en uzun tepki süresi">Tepki (benzetim)</th>}
                <th title="Zaman sınırı − en kötü tepki süresi">Pay</th>
                <th title="Diğer görevler sabitken bu görevin alabileceği en büyük süre">En fazla C</th>
                <th>
                  <span className={styles.gizli}>İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {gorevler.map((g, i) => {
                const r = sonucOf(g.id);
                return (
                  <tr key={g.id} className={clsx(r && !r.uygun && styles.asimSatir)}>
                    <td data-baslik="Sıra">
                      <span className={clsx(styles.renkNokta, renkOf(g.id))} aria-hidden="true" />
                      <span className={styles.siraDugmeler}>
                        <button type="button" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => gorevTasi(i, -1)}>
                          ↑
                        </button>
                        <button type="button" aria-label="Aşağı taşı" disabled={i === gorevler.length - 1} onClick={() => gorevTasi(i, 1)}>
                          ↓
                        </button>
                      </span>
                    </td>
                    <td data-baslik="Görev">
                      <input aria-label="Görev adı" value={g.ad} maxLength={60} onChange={(e) => gorevDegistir(g.id, {ad: e.target.value})} />
                    </td>
                    <td data-baslik="Periyot T (ms)">
                      <SayiGirdisi label="Periyot (ms)" min={0.001} value={g.periyot} onChange={(v) => gorevDegistir(g.id, {periyot: v})} />
                    </td>
                    <td data-baslik="Süre C (ms)">
                      <SayiGirdisi label="Süre (ms)" min={0.001} value={g.sure} onChange={(v) => gorevDegistir(g.id, {sure: v})} />
                    </td>
                    <td data-baslik="Zaman sınırı D (ms)">
                      <SayiGirdisi label="Zaman sınırı (ms)" min={0.001} value={g.sinir} onChange={(v) => gorevDegistir(g.id, {sinir: v})} />
                    </td>
                    {ayrintili && (
                      <td data-baslik="Faz (ms)">
                        <SayiGirdisi label="Faz (ms)" value={g.faz} onChange={(v) => gorevDegistir(g.id, {faz: v})} />
                      </td>
                    )}
                    {ayrintili && (
                      <td data-baslik="Engel B (ms)">
                        <SayiGirdisi label="Engellenme süresi (ms)" value={g.engel} onChange={(v) => gorevDegistir(g.id, {engel: v})} />
                      </td>
                    )}
                    {sabit && (
                      <td data-baslik="Öncelik" className={styles.sayi}>
                        {r?.oncelik ?? '—'}
                      </td>
                    )}
                    {analizVar && (
                      <td
                        data-baslik={dongusel ? 'Tepki (tablo)' : 'Tepki (analiz)'}
                        className={clsx(styles.sayi, r?.tepkiAnaliz !== undefined && r.tepkiAnaliz > g.sinir * 1000 && styles.kirmizi)}>
                        {r?.tepkiAnaliz !== undefined ? sureYaz(r.tepkiAnaliz) : '—'}
                      </td>
                    )}
                    {!dongusel && (
                      <td data-baslik="Tepki (benzetim)" className={styles.sayi}>
                        {r?.tepkiBenzetim !== undefined ? (
                          <span title={r.kacan > 0 ? `${r.isSayisi} işten ${r.kacan} tanesi zaman sınırını kaçırdı` : `${r.isSayisi} iş; en kısa tepki ${sureYaz(r.enKisaTepki ?? 0)}`}>
                            {sureYaz(r.tepkiBenzetim)}
                            {r.kacan > 0 && <b className={styles.kirmizi}> ⚠</b>}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    <td data-baslik="Pay" className={clsx(styles.sayi, r?.pay !== undefined && r.pay < 0 && styles.kirmizi)}>
                      {r?.pay !== undefined ? sureYaz(r.pay) : '—'}
                    </td>
                    <td data-baslik="En fazla C" className={styles.sayi}>
                      {r?.enFazlaSure !== undefined ? sureYaz(r.enFazlaSure) : '—'}
                    </td>
                    <td data-baslik="">
                      <button type="button" className={styles.sil} aria-label={`${g.ad} görevini sil`} onClick={() => gorevSil(g.id)}>
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" className={clsx(styles.dugme, styles.ekle)} onClick={gorevEkle} disabled={gorevler.length >= MAKS_GOREV}>
          + Görev ekle
        </button>
        {gorevler.length >= MAKS_GOREV && <span className={styles.ipucu}> En çok {MAKS_GOREV} görev çözümlenir.</span>}
      </section>

      {/* ---------- Çerçeve tablosu (döngüsel yürütücü) ---------- */}
      {cerceve && (
        <section className={styles.cerceveler} aria-label="Çerçeve tasarımı">
          <div className={styles.bolumBaslik}>
            <h3>Çerçeve tasarımı</h3>
            <span className={styles.ipucu}>Ana çerçeve {sureYaz(cerceve.anaCerceve)} · adaylar ana çerçeveyi tam böler</span>
          </div>
          <ul className={styles.adaylar} aria-label="Küçük çerçeve adayları">
            {cerceve.adaylar.map((x) => (
              <li key={x.f}>
                <button
                  type="button"
                  className={clsx(styles.aday, x.f === cerceve.secili && styles.secili)}
                  disabled={!x.uygun}
                  aria-pressed={x.f === cerceve.secili}
                  title={x.uygun ? 'Koşulları sağlıyor' : `Uygun değil: ${x.neden}`}
                  onClick={() => ayarla({cerceve: msOf(x.f)})}>
                  {sureYaz(x.f)}
                </button>
              </li>
            ))}
          </ul>
          {cerceve.cerceveler.length > 0 && (
            <div className={styles.tabloKutu}>
              <table className={styles.cerceveTablo}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Başlangıç</th>
                    <th>İşler (çalışma sırasıyla)</th>
                    <th>Boş</th>
                  </tr>
                </thead>
                <tbody>
                  {cerceve.cerceveler.slice(0, MAKS_CERCEVE_SATIRI).map((c, i) => (
                    <tr key={c.bas}>
                      <td className={styles.sayi}>{i + 1}</td>
                      <td className={styles.sayi}>{sureYaz(c.bas)}</td>
                      <td>
                        {c.isler.length === 0 && <span className={styles.ipucu}>boş çerçeve</span>}
                        {c.isler.map((x) => (
                          <span key={`${x.id}-${x.is}`} className={styles.isEtiketi}>
                            <span className={clsx(styles.renkNokta, renkOf(x.id))} aria-hidden="true" />
                            {adOf(x.id)} <span className={styles.ipucu}>{sureYaz(x.sure)}</span>
                          </span>
                        ))}
                      </td>
                      <td className={styles.sayi}>{sureYaz(c.bos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {cerceve.cerceveler.length > MAKS_CERCEVE_SATIRI && (
            <p className={styles.ipucu}>
              İlk {MAKS_CERCEVE_SATIRI} çerçeve gösteriliyor; {cerceve.cerceveler.length} çerçevenin tamamı CSV dosyasındadır.
            </p>
          )}
          {cerceve.yerlesmeyen.length > 0 && (
            <p className={clsx(styles.ipucu, styles.kirmizi)}>
              Yerleşmeyen işler: {cerceve.yerlesmeyen.slice(0, 8).map((x) => `${adOf(x.id)} #${x.is + 1}`).join(', ')}
              {cerceve.yerlesmeyen.length > 8 && ' …'}
            </p>
          )}
        </section>
      )}

      {/* ---------- Zaman çizelgesi ---------- */}
      {cizelgeVar && (
        <section className={styles.cizelge} aria-label="Zaman çizelgesi">
          <div className={styles.bolumBaslik}>
            <h3>Zaman çizelgesi</h3>
            <span className={styles.ipucu}>
              İlk {sureYaz(sonuc.cizelgePencere)}
              {dongusel ? ' · bir ana çerçeve' : sonuc.cizelgePencere >= sonuc.pencere && sonuc.tamPencere ? ' · çizelge bundan sonra tekrarlar' : ''}
            </span>
          </div>
          <Cizelge
            parcalar={sonuc.parcalar}
            kacanlar={sonuc.kacanlar.filter((k) => k.t <= sonuc.cizelgePencere)}
            pencere={sonuc.cizelgePencere}
            seritler={gecerliGorevler.map((g) => ({
              id: g.id,
              ad: g.ad,
              T: Math.round(g.periyot * 1000),
              D: Math.round((dongusel ? Math.min(g.sinir, g.periyot) : g.sinir) * 1000),
              O: dongusel ? 0 : Math.round(g.faz * 1000),
            }))}
            cerceve={cerceve?.secili || undefined}
            enKisa={Math.max(10, Math.min(...gecerliGorevler.map((g) => g.sure * 1000)) / 4)}
            renkOf={renkOf}
          />
          {!sonuc.tamPencere && (
            <p className={styles.ipucu}>
              Periyotların ortak katı çok uzun olduğundan benzetim {sureYaz(sonuc.pencere)} ile sınırlandı; benzetim
              sütunu bu pencerede gözlenen değerleri gösterir.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
