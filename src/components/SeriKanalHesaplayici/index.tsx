import {useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';

import useGeometri from '@site/src/components/NavigasyonHaritasi/useGeometri';
import {BAUD_LISTESI, SENARYOLAR, bitKarakter, cerceveAdi, hesapla, ortakHat} from './hesap';
import type {Arayuz, Ayarlar, Eslik, Kanal, Mesaj, Yon} from './hesap';
import ZamanCizelgesi from './ZamanCizelgesi';
import styles from './styles.module.css';

const ARAYUZLER: {key: Arayuz; label: string; ipucu: string}[] = [
  {key: 'rs232', label: 'RS-232', ipucu: 'Noktadan noktaya, tam çift yönlü'},
  {key: 'rs422', label: 'RS-422', ipucu: 'Tek verici, çok alıcı; tam çift yönlü'},
  {key: 'rs485', label: 'RS-485', ipucu: 'Çok noktalı; 2 telli yarı ya da 4 telli tam çift yönlü'},
];

const KANAL_ADI: Record<Kanal, string> = {AB: 'A → B', BA: 'B → A', ortak: 'Ortak hat (A ⇄ B)'};
const RENK_SAYISI = 8;

const nf = (d: number) => new Intl.NumberFormat('tr-TR', {minimumFractionDigits: d, maximumFractionDigits: d});
const yuzde = (v: number) => `%${nf(v < 10 ? 1 : 0).format(v)}`;
/** µs → okunur süre: 840 µs, 12,5 ms, 1,25 s */
function sureYaz(us: number): string {
  if (us === 0) return '0';
  if (us < 1000) return `${nf(us < 100 ? 1 : 0).format(us)} µs`;
  if (us < 1e6) return `${nf(us < 10_000 ? 2 : 1).format(us / 1000)} ms`;
  return `${nf(2).format(us / 1e6)} s`;
}

let sayac = 0;
const yeniId = () => `m${Date.now().toString(36)}${(sayac++).toString(36)}`;
const kimlikle = (ms: Omit<Mesaj, 'id'>[]): Mesaj[] => ms.map((m) => ({...m, id: yeniId()}));

type Durum = {ayarlar: Ayarlar; mesajlar: Mesaj[]};

/** Paylaşım bağlantısı: durum ?d= parametresinde base64url JSON olarak taşınır */
function kodla(d: Durum): string {
  const json = JSON.stringify({a: d.ayarlar, m: d.mesajlar.map(({id, ...m}) => m)});
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function coz(s: string): Durum | undefined {
  try {
    const json = decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
    const v = JSON.parse(json) as {a: Ayarlar; m: Omit<Mesaj, 'id'>[]};
    if (!v.a || !Array.isArray(v.m)) return undefined;
    return {ayarlar: {...SENARYOLAR[0].ayarlar, ...v.a}, mesajlar: kimlikle(v.m)};
  } catch {
    return undefined;
  }
}

function SayiGirdisi({
  value,
  onChange,
  min = 0,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  label: string;
  className?: string;
}): ReactNode {
  // Yazarken geçici boş/eksik değerlere izin verilir; geçerli sayı oldukça yukarı iletilir
  const [metin, setMetin] = useState(String(value));
  useEffect(() => {
    if (Number(metin.replace(',', '.')) !== value) setMetin(String(value).replace('.', ','));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className={className}
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

export default function SeriKanalHesaplayici(): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const geo = useGeometri(rootRef);
  const [durum, setDurum] = useState<Durum>(() => ({
    ayarlar: SENARYOLAR[2].ayarlar,
    mesajlar: kimlikle(SENARYOLAR[2].mesajlar),
  }));
  const [senaryo, setSenaryo] = useState<number | null>(2);
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
  const {ayarlar: a, mesajlar} = durum;

  // Paylaşım bağlantısıyla gelindiyse durumu adresten yükle
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get('d');
    const c = d ? coz(d) : undefined;
    if (c) {
      setDurum(c);
      setSenaryo(null);
    }
  }, []);

  const sonuc = useMemo(() => hesapla(a, mesajlar), [a, mesajlar]);
  const ortak = ortakHat(a);
  const ozelBaud = !BAUD_LISTESI.includes(a.baud);

  const ayarla = (p: Partial<Ayarlar>) => {
    setSenaryo(null);
    setDurum((d) => ({...d, ayarlar: {...d.ayarlar, ...p}}));
  };
  const mesajDegistir = (id: string, p: Partial<Mesaj>) => {
    setSenaryo(null);
    setDurum((d) => ({...d, mesajlar: d.mesajlar.map((m) => (m.id === id ? {...m, ...p} : m))}));
  };
  const mesajTasi = (i: number, yon: -1 | 1) =>
    setDurum((d) => {
      const ms = [...d.mesajlar];
      const j = i + yon;
      if (j < 0 || j >= ms.length) return d;
      [ms[i], ms[j]] = [ms[j], ms[i]];
      return {...d, mesajlar: ms};
    });
  const mesajSil = (id: string) => setDurum((d) => ({...d, mesajlar: d.mesajlar.filter((m) => m.id !== id)}));
  const mesajEkle = () =>
    setDurum((d) => ({
      ...d,
      mesajlar: [...d.mesajlar, {id: yeniId(), ad: `Mesaj ${d.mesajlar.length + 1}`, yon: 'AB', yuk: 16, ek: 4, periyot: 100}],
    }));
  const senaryoYukle = (i: number) => {
    setSenaryo(i);
    setDurum({ayarlar: SENARYOLAR[i].ayarlar, mesajlar: kimlikle(SENARYOLAR[i].mesajlar)});
  };

  const paylas = () => {
    const url = `${window.location.origin}${window.location.pathname}?d=${kodla(durum)}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setKopyalandi(true);
      window.setTimeout(() => setKopyalandi(false), 1800);
    });
  };

  const csvIndir = () => {
    const sutun = ['Sıra', 'Ad', 'Yön', 'Faydalı (B)', 'Ek (B)', 'Periyot (ms)', 'Toplam (B)', 'Hatta süre (µs)', 'Hz', 'Kanal payı (%)', 'En kötü gecikme (µs)'];
    const satirlar = mesajlar.map((m, i) => {
      const r = sonuc.kanallar.flatMap((k) => k.mesajlar).find((x) => x.id === m.id);
      return [i + 1, m.ad, m.yon === 'AB' ? 'A→B' : 'B→A', m.yuk, m.ek, m.periyot, r?.bayt, r?.sure.toFixed(1), r?.hz.toFixed(3), r?.pay.toFixed(3), r?.enKotuGecikme.toFixed(1)];
    });
    const ozet = sonuc.kanallar.map((k) => [`# ${KANAL_ADI[k.kanal]} yükü (%)`, k.kullanim.toFixed(3)]);
    const kacis = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      [`# ${ARAYUZLER.find((x) => x.key === a.arayuz)!.label}${a.arayuz === 'rs485' ? ` ${a.tel} telli` : ''}, ${a.baud} baud, ${cerceveAdi(a)}`],
      ...ozet,
      sutun,
      ...satirlar,
    ]
      .map((r) => r.map(kacis).join(';'))
      .join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'seri-kanal-yuk.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const renkOf = (id: string) => styles[`renk${mesajlar.findIndex((m) => m.id === id) % RENK_SAYISI}`];
  const sonucOf = (id: string) => sonuc.kanallar.flatMap((k) => k.mesajlar).find((x) => x.id === id);

  return (
    <div
      ref={rootRef}
      className={clsx(styles.hesaplayici, tamEkranda && styles.tamEkran)}
      data-boyut={geo.boyut}
      data-dokunmatik={geo.dokunmatik || undefined}>
      <div className={styles.ustSerit}>
        <span className={styles.ustBaslik}>Seri kanal yükü</span>
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
      <section className={styles.ayarlar} aria-label="Kanal ayarları">
        <div className={styles.alan}>
          <span className={styles.etiket}>Arayüz</span>
          <div className={styles.secici} role="radiogroup" aria-label="Arayüz">
            {ARAYUZLER.map((x) => (
              <button
                key={x.key}
                type="button"
                role="radio"
                aria-checked={a.arayuz === x.key}
                title={x.ipucu}
                className={clsx(a.arayuz === x.key && styles.secili)}
                onClick={() => ayarla({arayuz: x.key})}>
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {a.arayuz === 'rs485' && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Kablolama</span>
            <select value={a.tel} onChange={(e) => ayarla({tel: Number(e.target.value) as 2 | 4})}>
              <option value={2}>2 telli — yarı çift yönlü (ortak hat)</option>
              <option value={4}>4 telli — tam çift yönlü</option>
            </select>
          </label>
        )}

        <label className={styles.alan}>
          <span className={styles.etiket}>Baud</span>
          <select
            value={ozelBaud ? 'ozel' : a.baud}
            onChange={(e) => ayarla({baud: e.target.value === 'ozel' ? a.baud : Number(e.target.value)})}>
            {BAUD_LISTESI.map((b) => (
              <option key={b} value={b}>
                {nf(0).format(b)}
              </option>
            ))}
            <option value="ozel">Özel…</option>
          </select>
        </label>
        {ozelBaud && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Özel baud</span>
            <SayiGirdisi label="Özel baud" min={50} value={a.baud} onChange={(v) => ayarla({baud: Math.max(50, v)})} />
          </label>
        )}

        <div className={styles.alan}>
          <span className={styles.etiket}>Çerçeve</span>
          <div className={styles.cerceve}>
            <select aria-label="Veri biti" value={a.veriBiti} onChange={(e) => ayarla({veriBiti: Number(e.target.value)})}>
              {[5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} veri biti
                </option>
              ))}
            </select>
            <select aria-label="Eşlik" value={a.eslik} onChange={(e) => ayarla({eslik: e.target.value as Eslik})}>
              <option value="N">Eşlik yok (N)</option>
              <option value="E">Çift eşlik (E)</option>
              <option value="O">Tek eşlik (O)</option>
            </select>
            <select aria-label="Durdurma biti" value={a.durdurma} onChange={(e) => ayarla({durdurma: Number(e.target.value)})}>
              <option value={1}>1 durdurma</option>
              <option value={1.5}>1,5 durdurma</option>
              <option value={2}>2 durdurma</option>
            </select>
          </div>
        </div>

        <label className={styles.alan}>
          <span className={styles.etiket}>Mesaj sonu boşluk</span>
          <span className={styles.birimli}>
            <SayiGirdisi label="Mesaj sonu boşluk" value={a.bosluk} onChange={(v) => ayarla({bosluk: v})} />
            <span>karakter</span>
          </span>
        </label>

        {ortak && (
          <label className={styles.alan}>
            <span className={styles.etiket}>Yön değiştirme</span>
            <span className={styles.birimli}>
              <SayiGirdisi label="Yön değiştirme süresi" value={a.donus} onChange={(v) => ayarla({donus: v})} />
              <span>µs</span>
            </span>
          </label>
        )}

      </section>

      <p className={styles.ozet}>
        <b>{cerceveAdi(a)}</b> · {bitKarakter(a)} bit/karakter · karakter süresi {sureYaz(sonuc.karakterSuresi)} · en
        fazla {nf(0).format(sonuc.kapasite)} karakter/s{ortak ? ' (iki yön toplam)' : ' (her yön için)'}
      </p>

      {/* ---------- Sonuçlar ---------- */}
      <section className={styles.kanallar} aria-label="Kanal yükleri">
        {sonuc.kanallar.map((k) => {
          const asim = k.mesajlar.filter((m) => m.periyotAsimi).length;
          // Durum: talep kapasiteyi aşıyorsa aşırı yük; periyodu içinde gönderilemeyen mesaj varsa uyarı
          const durumSinifi = k.talep > 100 ? styles.asiri : asim > 0 ? styles.uyari : styles.iyi;
          return (
            <div key={k.kanal} className={clsx(styles.kanal, durumSinifi)}>
              <div className={styles.kanalBaslik}>
                <span>{KANAL_ADI[k.kanal]}</span>
                <span className={styles.rozet}>
                  {k.talep > 100 ? 'Aşırı yük' : asim > 0 ? 'Gecikme aşımı' : 'Kapasite içinde'}
                </span>
              </div>
              <div className={styles.buyukSayi}>{yuzde(k.kullanim)}</div>
              <svg className={styles.gosterge} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                <rect className={styles.gostergeZemin} x="0" y="2" width="100" height="6" rx="1" />
                <rect className={styles.gostergeDolu} x="0" y="2" width={Math.min(100, k.kullanim)} height="6" rx="1" />
              </svg>
              <dl className={styles.kanalDetay}>
                <dt>Faydalı veri</dt>
                <dd>{nf(0).format(k.faydali)} bayt/s</dd>
                <dt>Boş kapasite</dt>
                <dd>{nf(0).format(k.bos)} bayt/s</dd>
                {ortak && k.donusPayi > 0 && (
                  <>
                    <dt>Yön değiştirme</dt>
                    <dd>{yuzde(k.donusPayi)}</dd>
                  </>
                )}
                {k.talep > 100 && (
                  <>
                    <dt>Talep</dt>
                    <dd className={styles.kirmizi}>{yuzde(k.talep)} — kapasiteyi aşıyor</dd>
                  </>
                )}
                {asim > 0 && (
                  <>
                    <dt>Periyot aşımı</dt>
                    <dd className={styles.kirmizi}>{asim} mesaj</dd>
                  </>
                )}
              </dl>
            </div>
          );
        })}
      </section>

      {/* ---------- Mesajlar ---------- */}
      <section className={styles.mesajlar} aria-label="Mesajlar">
        <div className={styles.bolumBaslik}>
          <h3>Mesajlar</h3>
          <div className={styles.araclar}>
            <label className={styles.senaryo}>
              <span className={styles.gizli}>Örnek senaryo</span>
              <select
                value={senaryo ?? ''}
                onChange={(e) => e.target.value !== '' && senaryoYukle(Number(e.target.value))}>
                <option value="">Örnek senaryo…</option>
                {SENARYOLAR.map((s, i) => (
                  <option key={s.ad} value={i}>
                    {s.ad}
                  </option>
                ))}
              </select>
            </label>
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
              <th>Ad</th>
              <th>Yön</th>
              <th>Faydalı (B)</th>
              <th>Ek (B)</th>
              <th>Periyot (ms)</th>
              <th>Toplam</th>
              <th>Hatta</th>
              <th>Pay</th>
              <th>En kötü gecikme</th>
              <th>
                <span className={styles.gizli}>İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {mesajlar.map((m, i) => {
              const r = sonucOf(m.id);
              return (
                <tr key={m.id} className={clsx(r?.periyotAsimi && styles.asimSatir)}>
                  <td data-baslik="Sıra">
                    <span className={clsx(styles.renkNokta, renkOf(m.id))} aria-hidden="true" />
                    <span className={styles.siraDugmeler}>
                      <button type="button" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => mesajTasi(i, -1)}>
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Aşağı taşı"
                        disabled={i === mesajlar.length - 1}
                        onClick={() => mesajTasi(i, 1)}>
                        ↓
                      </button>
                    </span>
                  </td>
                  <td data-baslik="Ad">
                    <input aria-label="Mesaj adı" value={m.ad} onChange={(e) => mesajDegistir(m.id, {ad: e.target.value})} />
                  </td>
                  <td data-baslik="Yön">
                    <select aria-label="Yön" value={m.yon} onChange={(e) => mesajDegistir(m.id, {yon: e.target.value as Yon})}>
                      <option value="AB">A → B</option>
                      <option value="BA">B → A</option>
                    </select>
                  </td>
                  <td data-baslik="Faydalı (B)">
                    <SayiGirdisi label="Faydalı yük (bayt)" value={m.yuk} onChange={(v) => mesajDegistir(m.id, {yuk: Math.round(v)})} />
                  </td>
                  <td data-baslik="Ek (B)">
                    <SayiGirdisi label="Ek yük (bayt)" value={m.ek} onChange={(v) => mesajDegistir(m.id, {ek: Math.round(v)})} />
                  </td>
                  <td data-baslik="Periyot (ms)">
                    <SayiGirdisi
                      label="Periyot (ms)"
                      min={0.001}
                      value={m.periyot}
                      onChange={(v) => mesajDegistir(m.id, {periyot: v})}
                    />
                  </td>
                  <td data-baslik="Toplam" className={styles.sayi}>
                    {r ? `${r.bayt} B` : '—'}
                  </td>
                  <td data-baslik="Hatta" className={styles.sayi}>
                    {r ? sureYaz(r.sure) : '—'}
                  </td>
                  <td data-baslik="Pay" className={styles.sayi}>
                    {r ? yuzde(r.pay) : '—'}
                  </td>
                  <td data-baslik="En kötü gecikme" className={styles.sayi}>
                    {r ? (
                      <span title={r.periyotAsimi ? 'Periyottan uzun: sonraki örnek hazır olduğunda bu mesaj henüz gönderilmemiş' : undefined}>
                        {sureYaz(r.enKotuGecikme)}
                        {r.periyotAsimi && <b className={styles.kirmizi}> ⚠</b>}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td data-baslik="">
                    <button type="button" className={styles.sil} aria-label={`${m.ad} mesajını sil`} onClick={() => mesajSil(m.id)}>
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <button type="button" className={clsx(styles.dugme, styles.ekle)} onClick={mesajEkle}>
          + Mesaj ekle
        </button>
      </section>

      {/* ---------- Zaman çizelgesi ---------- */}
      {sonuc.cizelge.length > 0 && (
        <section className={styles.cizelge} aria-label="Zaman çizelgesi">
          <div className={styles.bolumBaslik}>
            <h3>Zaman çizelgesi</h3>
            <span className={styles.ipucu}>
              İlk {sureYaz(sonuc.cizelgePencere)} · aynı anda hazır olanlar tablo sırasıyla
            </span>
          </div>
          <ZamanCizelgesi
            cizelge={sonuc.cizelge}
            pencere={sonuc.cizelgePencere}
            kanallar={sonuc.kanallar.map((k) => ({kanal: k.kanal, ad: KANAL_ADI[k.kanal]}))}
            enKisa={sonuc.karakterSuresi * 2}
            adOf={(id) => mesajlar.find((m) => m.id === id)?.ad ?? ''}
            renkOf={renkOf}
            sureYaz={sureYaz}
          />
          {!sonuc.tamPencere && (
            <p className={styles.ipucu}>
              Periyotların ortak katı çok uzun olduğundan yük {sureYaz(sonuc.pencere)}'lik bir pencerede hesaplandı; sonuç
              yaklaşıktır.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
