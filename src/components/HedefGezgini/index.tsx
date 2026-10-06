import {useEffect, useId, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import Isaret from './Isaret';
import {HEDEFLER, SEVIYELER, SEVIYE_BILGI, TABLOLAR, durumOf, farkOf, kimlik, kkOf, say, veriOf, verilerOf} from './veri';
import type {Durum, Fark, Hedef, Seviye, SeviyeE} from './veri';
import styles from './styles.module.css';

const SECILEBILIR: SeviyeE[] = ['A', 'B', 'C', 'D', 'E'];
const DEPO = 'do178c-hedef-gezgini';
const TOPLAM = HEDEFLER.length;
const VERI_TOPLAMI = new Set(verilerOf('A').map((v) => veriOf(v).atif)).size;

const YONELME: Record<SeviyeE, string> = {A: "A'ya", B: "B'ye", C: "C'ye", D: "D'ye", E: "E'ye"};
const BULUNMA: Record<SeviyeE, string> = {A: "A'da", B: "B'de", C: "C'de", D: "D'de", E: "E'de"};

const DURUM_ADI: Record<Durum, string> = {B: 'Bağımsızlıkla', G: 'Gerekli', '-': 'Aranmaz'};
const DURUM_ACIKLAMA: Record<Durum, string> = {
  B: 'karşılanır, bağımsızlıkla',
  G: 'karşılanır, bağımsızlık aranmaz',
  '-': 'aranmaz',
};
const FARK_ADI: Record<Exclude<Fark, null>, string> = {
  yeni: 'Yeni hedef',
  bagimsizlik: 'Bağımsızlık eklenir',
  duser: 'Düşer',
  bagimsizlikKalkar: 'Bağımsızlık kalkar',
};

/** s: seviye · k: karşılaştırılan seviye · t: seçili tablolar (boş = hepsi) · b: yalnız bağımsızlık · h: aranmayanlar da · f: yalnız farklar */
type Ayar = {s: SeviyeE; k: Seviye | null; t: number[]; b: boolean; h: boolean; f: boolean};

const VARSAYILAN: Ayar = {s: 'A', k: null, t: [], b: false, h: false, f: false};

function ayarOku(v: unknown): Ayar | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const a = v as Record<string, unknown>;
  if (!SECILEBILIR.includes(a.s as SeviyeE)) return undefined;
  const s = a.s as SeviyeE;
  const k = SEVIYELER.includes(a.k as Seviye) && a.k !== s ? (a.k as Seviye) : null;
  const t = Array.isArray(a.t) ? TABLOLAR.map((x) => x.no).filter((no) => (a.t as unknown[]).includes(no)) : [];
  return {s, k, t, b: a.b === true, h: a.h === true, f: k !== null && a.f === true};
}

/** Paylaşım: süzgeç ayarı adresin #d= kısmında (sunucuya gitmez) */
const kodla = (a: Ayar): string => btoa(JSON.stringify(a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function coz(d: string): Ayar | undefined {
  try {
    return ayarOku(JSON.parse(atob(d.replace(/-/g, '+').replace(/_/g, '/'))));
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

const kucuk = (s: string) => s.toLocaleLowerCase('tr-TR');

/* ---------- Hedef satırı ---------- */

function HedefSatiri({h, seviye, taban}: {h: Hedef; seviye: SeviyeE; taban: Seviye | null}): ReactNode {
  const durum = durumOf(h, seviye);
  const fark = taban ? farkOf(h, seviye, taban) : null;
  return (
    <li className={clsx(styles.hedef, durum === '-' && styles.soluk)}>
      <span className={styles.kimlik}>{kimlik(h)}</span>
      <div className={styles.govde}>
        <p className={styles.baslik}>{h.baslik}</p>
        <p className={styles.aciklama}>{h.aciklama}</p>
        <p className={styles.kanit}>
          <span className={styles.atif}>DO-178C §{h.atif}</span>
          {seviye !== 'E' &&
            durum !== '-' &&
            h.cikti.map((v) => (
              <span key={v} className={styles.veri} title={veriOf(v).kisa && veriOf(v).ad}>
                {veriOf(v).kisa ?? veriOf(v).ad}
                <b>{kkOf(v, seviye)}</b>
              </span>
            ))}
        </p>
      </div>
      <div className={styles.yan}>
        <span className={clsx(styles.durum, styles[`durum${durum === '-' ? 'Yok' : durum}`])}>
          <Isaret durum={durum} />
          {DURUM_ADI[durum]}
        </span>
        {fark && <span className={clsx(styles.fark, styles[`fark_${fark}`])}>{FARK_ADI[fark]}</span>}
        <span
          className={styles.seviyeler}
          role="img"
          aria-label={SEVIYELER.map((s) => `Seviye ${s}: ${DURUM_ACIKLAMA[durumOf(h, s)]}`).join('; ')}>
          {SEVIYELER.map((s) => (
            <span
              key={s}
              className={clsx(styles.hucre, s === seviye && styles.seciliHucre, s === taban && styles.tabanHucre)}
              title={`Seviye ${s}: ${DURUM_ACIKLAMA[durumOf(h, s)]}`}>
              <span className={styles.harf}>{s}</span>
              <Isaret durum={durumOf(h, s)} />
            </span>
          ))}
        </span>
      </div>
    </li>
  );
}

/* ---------- Ana bileşen ---------- */

export default function HedefGezgini(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const kimlikOnEki = useId();
  const [ayar, setAyar] = useState<Ayar>(VARSAYILAN);
  const [arama, setArama] = useState('');
  const [kopyalandi, setKopyalandi] = useState(false);
  const yuklendi = useRef(false);

  const degistir = (parca: Partial<Ayar>) =>
    setAyar((onceki) => {
      const yeni = {...onceki, ...parca};
      // Seviye, karşılaştırılan seviyeyle aynı olursa karşılaştırma kapanır
      if (yeni.k === yeni.s) yeni.k = null;
      if (yeni.k === null) yeni.f = false;
      return yeni;
    });

  /* ----- kayıt ve paylaşım bağlantısı ----- */
  const paylasilaniUygula = () => {
    const d = new URLSearchParams(window.location.hash.slice(1)).get('d');
    if (!d) return false;
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    const a = coz(d);
    if (!a) return false;
    setAyar(a);
    setArama('');
    return true;
  };

  useEffect(() => {
    if (!paylasilaniUygula()) {
      try {
        const k = ayarOku(JSON.parse(window.localStorage.getItem(DEPO) ?? 'null'));
        if (k) setAyar(k);
      } catch {
        // bozuk kayıt yok sayılır
      }
    }
    yuklendi.current = true;
    const hashDegisti = () => paylasilaniUygula();
    window.addEventListener('hashchange', hashDegisti);
    return () => window.removeEventListener('hashchange', hashDegisti);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!yuklendi.current) return;
    try {
      window.localStorage.setItem(DEPO, JSON.stringify(ayar));
    } catch {
      // kapalı depolama: kayıt yapılmaz
    }
  }, [ayar]);

  /* ----- sayımlar ----- */
  const {s: seviye, k: taban} = ayar;
  const sayim = useMemo(() => say(seviye), [seviye]);
  const veriler = useMemo(() => verilerOf(seviye), [seviye]);
  const veriSayisi = useMemo(() => new Set(veriler.map((v) => veriOf(v).atif)).size, [veriler]);
  const farkSayimi = useMemo(() => {
    const f = {yeni: 0, yeniBagimsiz: 0, bagimsizlik: 0, duser: 0, bagimsizlikKalkar: 0};
    if (!taban) return f;
    for (const h of HEDEFLER) {
      const fark = farkOf(h, seviye, taban);
      if (fark) f[fark] += 1;
      if (fark === 'yeni' && durumOf(h, seviye) === 'B') f.yeniBagimsiz += 1;
    }
    return f;
  }, [seviye, taban]);

  /* ----- süzme ----- */
  const gorunen = useMemo(() => {
    const aranan = kucuk(arama.trim());
    return HEDEFLER.filter((h) => {
      if (ayar.t.length > 0 && !ayar.t.includes(h.tablo)) return false;
      const durum = durumOf(h, seviye);
      const fark = taban ? farkOf(h, seviye, taban) : null;
      if (ayar.b && durum !== 'B') return false;
      if (ayar.f && !fark) return false;
      // Karşılaştırmada düşen hedefler de listelenir: fark onlarsız okunmaz
      if (durum === '-' && !ayar.h && fark !== 'duser') return false;
      if (!aranan) return true;
      return kucuk(`${kimlik(h)} ${h.baslik} ${h.aciklama} ${h.atif} ${h.cikti.map((v) => veriOf(v).ad).join(' ')}`).includes(aranan);
    });
  }, [ayar, arama, seviye, taban]);

  const gruplar = useMemo(
    () => TABLOLAR.map((t) => ({t, hedefler: gorunen.filter((h) => h.tablo === t.no)})).filter((g) => g.hedefler.length > 0),
    [gorunen],
  );

  const suzgecVar = ayar.t.length > 0 || ayar.b || ayar.h || ayar.f || arama.trim() !== '';
  const temizle = () => {
    degistir({t: [], b: false, h: false, f: false});
    setArama('');
  };
  const tabloDegistir = (no: number) =>
    degistir({t: ayar.t.includes(no) ? ayar.t.filter((x) => x !== no) : [...ayar.t, no].sort((a, b) => a - b)});

  /* ----- dışa aktarma ----- */
  const csvIndir = () => {
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const satirlar: unknown[][] = [
      [`# DO-178C Ek A hedefleri; Seviye ${seviye}: ${sayim.hedef} hedef, ${sayim.bagimsiz} hedef bağımsızlıkla`],
      ['# Hedef özetleri özgündür; bağlayıcı metin standardın kendisidir (aviyonikyazilim.com/araclar)'],
      [
        'Hedef',
        'Süreç',
        'Hedef özeti',
        'Açıklama',
        'DO-178C bölümü',
        ...SEVIYELER.map((s) => `Seviye ${s}`),
        `Seviye ${seviye} durumu`,
        'Çıktı verisi (kontrol kategorisi)',
        'Uyum kanıtı',
        'Durum',
      ],
      ...gorunen.map((h) => {
        const durum = durumOf(h, seviye);
        return [
          kimlik(h),
          TABLOLAR[h.tablo - 1].ad,
          h.baslik,
          h.aciklama,
          h.atif,
          ...SEVIYELER.map((s) => DURUM_ADI[durumOf(h, s)]),
          DURUM_ADI[durum],
          seviye !== 'E' && durum !== '-' ? h.cikti.map((v) => `${veriOf(v).ad} (${kkOf(v, seviye)})`).join(', ') : '',
          '',
          '',
        ];
      }),
    ];
    const csv = satirlar.map((s) => s.map(kacis).join(';')).join('\n');
    indir(new Blob([`﻿${csv}`], {type: 'text/csv;charset=utf-8'}), `do178c-hedefler-seviye-${kucuk(seviye)}.csv`);
  };

  const paylas = () => {
    const url = `${window.location.origin}${window.location.pathname}#d=${kodla(ayar)}`;
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
  const farkParcalari = taban
    ? [
        farkSayimi.yeni > 0 &&
          `${farkSayimi.yeni} yeni hedef${farkSayimi.yeniBagimsiz > 0 ? ` (${farkSayimi.yeniBagimsiz} hedef bağımsızlıkla)` : ''}`,
        farkSayimi.bagimsizlik > 0 && `mevcut ${farkSayimi.bagimsizlik} hedefte bağımsızlık eklenir`,
        farkSayimi.duser > 0 && `${farkSayimi.duser} hedef düşer`,
        farkSayimi.bagimsizlikKalkar > 0 && `${farkSayimi.bagimsizlikKalkar} hedefte bağımsızlık kalkar`,
      ].filter(Boolean)
    : [];

  return (
    <div ref={rootRef} className={styles.arac} data-boyut={geo.boyut} data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>DO-178C Ek A hedefleri</span>
        <span className={styles.ustDugmeler}>
          <button type="button" className={styles.dugme} onClick={csvIndir} disabled={gorunen.length === 0}>
            CSV indir
          </button>
          <button type="button" className={styles.dugme} onClick={paylas}>
            {kopyalandi ? 'Kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
        </span>
      </div>

      {/* ---------- Seviye ---------- */}
      <fieldset className={styles.seviyeSecici}>
        <legend className={styles.etiket}>Yazılım seviyesi (DAL)</legend>
        <div className={styles.seviyeDugmeleri}>
          {SECILEBILIR.map((s) => (
            <label key={s} className={clsx(styles.seviyeDugme, s === seviye && styles.seciliSeviye)}>
              <input
                type="radio"
                className={styles.gizli}
                name={`${kimlikOnEki}seviye`}
                aria-label={`Seviye ${s}: ${SEVIYE_BILGI[s].ariza}`}
                checked={s === seviye}
                onChange={() => degistir({s})}
              />
              <span className={styles.seviyeHarf}>{s}</span>
              <span className={styles.seviyeAriza}>{SEVIYE_BILGI[s].ariza}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.ozet} aria-live="polite">
        <dl className={styles.kartlar}>
          <div className={styles.kart}>
            <dt className={styles.etiket}>Hedef</dt>
            <dd>
              <b>{sayim.hedef}</b>
              <span> / {TOPLAM}</span>
            </dd>
          </div>
          <div className={styles.kart}>
            <dt className={styles.etiket}>Bağımsızlıkla</dt>
            <dd>
              <b>{sayim.bagimsiz}</b>
              <span> hedef</span>
            </dd>
          </div>
          <div className={styles.kart}>
            <dt className={styles.etiket}>Veri öğesi</dt>
            <dd>
              <b>{veriSayisi}</b>
              <span> / {VERI_TOPLAMI}</span>
            </dd>
          </div>
          <div className={styles.kart}>
            <dt className={styles.etiket}>Arıza durumu</dt>
            <dd>
              <b className={styles.kartMetin}>{SEVIYE_BILGI[seviye].ariza}</b>
            </dd>
          </div>
        </dl>
        {seviye === 'E' && (
          <p className={styles.not}>
            Seviye E'de DO-178C hedefleri uygulanmaz. Bu bir muafiyet değildir: yazılımın emniyet etkisi taşımadığı sistem
            emniyet değerlendirmesiyle gösterilmiş ve otoritece teyit edilmiş olmalıdır.
          </p>
        )}
        {taban && (
          <p className={styles.not}>
            <b>Seviye {YONELME[taban]} göre:</b> {farkParcalari.length > 0 ? farkParcalari.join(' · ') : 'fark yok'}.
          </p>
        )}
      </div>

      {veriler.length > 0 && seviye !== 'E' && (
        <details className={styles.veriPaneli}>
          <summary>
            Seviye {BULUNMA[seviye]} beklenen yaşam döngüsü verisi ve kontrol kategorileri ({veriSayisi} öğe)
          </summary>
          <ul className={styles.veriListesi}>
            {veriler.map((v) => (
              <li key={v}>
                <span className={styles.atif}>{veriOf(v).atif}</span>
                <span>
                  {veriOf(v).ad}
                  {veriOf(v).kisa && ` (${veriOf(v).kisa})`}
                </span>
                <b className={clsx(styles.kk, kkOf(v, seviye) === 'CC1' && styles.kk1)}>{kkOf(v, seviye)}</b>
              </li>
            ))}
          </ul>
          <p className={styles.ipucu}>
            CC1 veride değişiklik kontrolü ve problem raporlama dahil bütün konfigürasyon yönetimi faaliyetleri uygulanır;
            CC2 veride daha dar bir küme yeter. Ayrıntı:{' '}
            <Link to="/kitap/do178c-ile-gelistirme/yazilim-konfigurasyon-yonetimi">10. Yazılım Konfigürasyon Yönetimi</Link>.
          </p>
        </details>
      )}

      {/* ---------- Süzgeçler ---------- */}
      <section className={styles.suzgecler} aria-label="Süzgeçler">
        <div className={styles.suzgecSatiri}>
          <label className={styles.alan}>
            <span className={styles.etiket}>Karşılaştır</span>
            <select
              value={taban ?? ''}
              onChange={(e) => degistir({k: e.target.value === '' ? null : (e.target.value as Seviye)})}>
              <option value="">Karşılaştırma yok</option>
              {SEVIYELER.filter((s) => s !== seviye).map((s) => (
                <option key={s} value={s}>
                  Seviye {YONELME[s]} göre fark
                </option>
              ))}
            </select>
          </label>
          <label className={clsx(styles.alan, styles.aramaAlani)}>
            <span className={styles.etiket}>Ara</span>
            <input
              type="search"
              value={arama}
              placeholder="ör. izlenebilir, kapsam, PDI, 6.3.4"
              autoComplete="off"
              onChange={(e) => setArama(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.secenekler}>
          <label className={styles.onay}>
            <input type="checkbox" checked={ayar.b} onChange={(e) => degistir({b: e.target.checked})} />
            Yalnızca bağımsızlık isteyenler
          </label>
          <label className={styles.onay}>
            <input type="checkbox" checked={ayar.h} onChange={(e) => degistir({h: e.target.checked})} />
            Bu seviyede aranmayanları da göster
          </label>
          {taban && (
            <label className={styles.onay}>
              <input type="checkbox" checked={ayar.f} onChange={(e) => degistir({f: e.target.checked})} />
              Yalnızca farklar
            </label>
          )}
        </div>
        <div className={styles.tablolar} role="group" aria-label="Süreç tabloları">
          <button
            type="button"
            className={clsx(styles.tabloDugme, ayar.t.length === 0 && styles.seciliTablo)}
            aria-pressed={ayar.t.length === 0}
            onClick={() => degistir({t: []})}>
            Tüm süreçler
          </button>
          {TABLOLAR.map((t) => {
            const secili = ayar.t.includes(t.no);
            return (
              <button
                key={t.no}
                type="button"
                className={clsx(styles.tabloDugme, secili && styles.seciliTablo)}
                aria-pressed={secili}
                title={`Tablo A-${t.no}: ${t.ad}`}
                onClick={() => tabloDegistir(t.no)}>
                <span className={styles.tabloNo}>A-{t.no}</span>
                {t.kisa}
                <span className={styles.tabloSayi}>
                  {say(seviye, t.no).hedef}/{say('A', t.no).hedef}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------- Liste ---------- */}
      <div className={styles.listeUst}>
        <p className={styles.sonuc} aria-live="polite">
          <b>{gorunen.length}</b> hedef listeleniyor
        </p>
        <span className={styles.lejant}>
          <span>
            <Isaret durum="B" /> bağımsızlıkla
          </span>
          <span>
            <Isaret durum="G" /> gerekli
          </span>
          <span>
            <Isaret durum="-" /> aranmaz
          </span>
        </span>
        {suzgecVar && (
          <button type="button" className={styles.dugme} onClick={temizle}>
            Süzgeçleri temizle
          </button>
        )}
      </div>

      {gruplar.length === 0 ? (
        <p className={styles.bos}>
          {seviye === 'E' && !suzgecVar
            ? 'Seviye E için listelenecek hedef yok. Bütün hedefleri görmek için “Bu seviyede aranmayanları da göster” seçeneğini işaretleyin.'
            : 'Bu süzgeçlerle eşleşen hedef yok.'}
        </p>
      ) : (
        gruplar.map(({t, hedefler}) => {
          const tabloSayim = say(seviye, t.no);
          return (
            <section key={t.no} className={styles.grup}>
              <header className={styles.grupUst}>
                <h2 className={styles.grupAd}>
                  <span className={styles.tabloNo}>Tablo A-{t.no}</span>
                  {t.ad}
                </h2>
                <p className={styles.grupBilgi}>
                  Seviye {BULUNMA[seviye]} {tabloSayim.hedef}/{say('A', t.no).hedef} hedef
                  {tabloSayim.bagimsiz > 0 && `, ${tabloSayim.bagimsiz} hedef bağımsızlıkla`}
                  {' · Kitapta: '}
                  {t.kitap.map((k, i) => (
                    <span key={k.yol}>
                      {i > 0 && ', '}
                      <Link to={k.yol}>{k.ad}</Link>
                    </span>
                  ))}
                </p>
              </header>
              <ul className={styles.liste}>
                {hedefler.map((h) => (
                  <HedefSatiri key={kimlik(h)} h={h} seviye={seviye} taban={taban} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
