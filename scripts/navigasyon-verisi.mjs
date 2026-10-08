#!/usr/bin/env node
/**
 * Türkiye navigasyon haritası verisini üretir: static/data/turkiye-navigasyon.json
 *
 * Kaynaklar:
 *  - AIP Türkiye (DHMİ): radyo seyrüsefer yardımcıları ve ILS. ENR 4.1 ile her
 *    meydanın AD 2.19 bölümü indirilir ve `pdftotext -layout` ile metne çevrilip
 *    scripts/aip-ayristir.mjs ile ayrıştırılır. DHMİ, ticari olmayan kullanımda
 *    kaynak gösterilmesi koşuluyla kullanıma izin vermiştir (bkz. CLAUDE.md).
 *    AIP'de bölümü olan meydanların pistleri de AD 2.12'den alınır.
 *  - OurAirports (ourairports.com, kamu malı): havalimanları, diğer pistler; AIP'de
 *    bulunmayan istasyonlar "doğrulanmamış" olarak eklenir; manyetik sapma, güç ve
 *    kullanım bilgisi AIP kaydıyla eşleşen OurAirports kaydından alınır.
 *
 * Gerekenler: Node 22+, poppler (`pdftotext`; macOS'ta `brew install poppler`).
 *
 * Kullanım:
 *   node scripts/navigasyon-verisi.mjs                     # her şeyi indirir
 *   node scripts/navigasyon-verisi.mjs --csv <klasör>      # önceden indirilmiş OurAirports CSV'leri
 *   node scripts/navigasyon-verisi.mjs --aip <klasör>      # AIP PDF önbelleği (varsayılan: geçici klasör)
 */
import {execFile} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';

import {
  ad212Section,
  ad214Section,
  ad218Section,
  ad219Section,
  distanceNm,
  latestAmendment,
  mergeNavaids,
  parseAd212,
  parseAd214,
  parseAd218,
  parseAd219,
  parseAerodromeData,
  parseAerodromeIndex,
  parseAerodromeList,
  parseEnr41,
} from './aip-ayristir.mjs';
import {gsOf} from '../src/components/KanalTablosu/gs-eslemesi.mjs';

const OURAIRPORTS = 'https://davidmegginson.github.io/ourairports-data';
const AIP_BASE = 'https://www.dhmi.gov.tr/AIPDocuments';
const AIP_ENR41 = 'LT_ENR_4_1_en';
const AIP_AD = (icao, part) => `LT_AD_${part}_${icao}_en`;
const AIP_INDEX = 'LT_AD_0_6_en'; // içindekiler: meydan (AD 2) ve heliport (AD 3) listesi
const AIP_LIST = 'LT_AD_1_3_en'; // meydan dizini: AD 0.6'da olmayan iniş alanları ve kullanım dışı meydanlar

// AIP'deki kodu OurAirports'ta farklı kimlikle kayıtlı meydanlar (AIP kodu → OurAirports ident)
const ICAO_ALIASES = {LTFI: 'TR-0080'}; // Samsun / Ondokuz Mayıs iniş alanı, OurAirports'ta eski "LTON" koduyla
const COUNTRY = 'TR';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'static', 'data', 'turkiye-navigasyon.json');

// Haritada gösterilmeyen tesis türleri.
const SKIPPED_AIRPORT_TYPES = new Set(['balloonport']);

const run = promisify(execFile);

/** RFC 4180 CSV ayrıştırıcı (tırnak içi virgül, kaçışlı tırnak ve satır sonu desteklenir). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

async function loadCsv(name, dir) {
  if (dir) return parseCsv(await readFile(path.join(dir, `${name}.csv`), 'utf8'));
  const res = await fetch(`${OURAIRPORTS}/${name}.csv`);
  if (!res.ok) throw new Error(`${name}.csv indirilemedi: HTTP ${res.status}`);
  return parseCsv(await res.text());
}

/** AIP PDF'ini (önbellekte yoksa) indirir ve düzenli metne çevirir. Bölüm yoksa undefined. */
async function aipText(name, cacheDir) {
  const pdf = path.join(cacheDir, `${name}.pdf`);
  if (!existsSync(pdf)) {
    const res = await fetch(`${AIP_BASE}/${name}.pdf`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`${name}.pdf indirilemedi: HTTP ${res.status}`);
    await writeFile(pdf, Buffer.from(await res.arrayBuffer()));
  }
  const {stdout} = await run('pdftotext', ['-layout', pdf, '-'], {maxBuffer: 64 * 1024 * 1024});
  return stdout;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({length: limit}, worker));
  return results;
}

const num = (v) => (v === '' || v === undefined ? undefined : Number(v));
const coord = (v) => Math.round(Number(v) * 1e5) / 1e5; // ~1 m çözünürlük
const text = (v) => (v ? v.trim() : undefined);

/** undefined alanları atarak JSON'u küçültür. */
const isEmpty = (v) =>
  v === undefined ||
  v === '' ||
  (Array.isArray(v) && v.length === 0) ||
  (v !== null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
const compact = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => !isEmpty(v)));

/** "BURSA/Yenişehir" → "Bursa/Yenişehir", "CENGİZ TOPEL" → "Cengiz Topel" */
const titleTr = (s) =>
  s?.replace(/[A-ZÇĞİÖŞÜ]{2,}/g, (w) => w[0] + w.slice(1).toLocaleLowerCase('tr-TR'));

/**
 * AD 2.12 pistlerini haritanın biçimine çevirir. AIP'de eşik koordinatı olmayan
 * (ya da tek yönü yayımlanmış) pistlerin çizgisi ve aydınlatma bilgisi aynı
 * tanımlı OurAirports pistinden alınır.
 */
function aipRunways(section, lightingSection, oaRunways) {
  if (!section) return [];
  const M2FT = 1 / 0.3048;
  const parsed = parseAd212(section);
  // AD 2.14: pist ucu başına ışık özeti (bölüm yoksa OurAirports'taki ışık bilgisi kullanılır)
  const lighting = lightingSection ? parseAd214(lightingSection, parsed.flatMap((r) => r.id.split('/'))) : {};
  return parsed.map((r) => {
    const ids = r.id.split('/');
    const oa = oaRunways.find((o) => o.id.split('/').some((x) => ids.includes(x)));
    const lgt = ids.map((id) => lighting[id]).filter(Boolean);
    return compact({
      id: r.ends ? r.id : oa?.id ?? r.id,
      len: Math.round(r.lenM * M2FT),
      wid: Math.round(r.widM * M2FT),
      surf: r.surf,
      lit: lgt.length ? (lgt.some((l) => l.lit) ? 1 : undefined) : oa?.lit,
      // Uç başına yaklaşma ışığı ve görsel süzülüş göstergesi: {"03C": {apch, gsi}}
      lgt: Object.fromEntries(
        ids.filter((id) => lighting[id]?.apch || lighting[id]?.gsi).map((id) => [id, compact({apch: lighting[id].apch, gsi: lighting[id].gsi})]),
      ),
      hdg: r.hdg,
      ends: r.ends ?? oa?.ends,
    });
  });
}

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i > 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const csvDir = argValue('--csv');
  const cacheDir = argValue('--aip') ?? path.join(os.tmpdir(), 'aviyonikyazilim-aip');
  await mkdir(cacheDir, {recursive: true});
  try {
    await run('pdftotext', ['-v']);
  } catch {
    throw new Error('pdftotext bulunamadı: poppler kurulmalı (macOS: brew install poppler).');
  }

  // ---------- OurAirports: havalimanları, pistler, yedek istasyonlar ----------
  const [airportsCsv, runwaysCsv, navaidsCsv] = await Promise.all(
    ['airports', 'runways', 'navaids'].map((name) => loadCsv(name, csvDir)),
  );

  const airports = airportsCsv
    .filter((a) => a.iso_country === COUNTRY && !SKIPPED_AIRPORT_TYPES.has(a.type))
    .map((a) => ({
      ident: a.ident,
      type: a.type,
      name: text(a.name),
      lat: coord(a.latitude_deg),
      lon: coord(a.longitude_deg),
      elev: num(a.elevation_ft),
      city: text(a.municipality),
      icao: text(a.icao_code) ?? text(a.gps_code),
      iata: text(a.iata_code),
      sched: a.scheduled_service === 'yes' ? 1 : undefined,
      web: text(a.home_link),
      wiki: text(a.wikipedia_link),
    }));

  const byIdent = new Map(airports.map((a) => [a.ident, a]));
  for (const r of runwaysCsv) {
    const airport = byIdent.get(r.airport_ident);
    if (!airport) continue;
    const ends =
      r.le_latitude_deg && r.he_latitude_deg
        ? [
            [coord(r.le_latitude_deg), coord(r.le_longitude_deg)],
            [coord(r.he_latitude_deg), coord(r.he_longitude_deg)],
          ]
        : undefined;
    (airport.rwy ??= []).push(
      compact({
        id: [text(r.le_ident), text(r.he_ident)].filter(Boolean).join('/'),
        len: num(r.length_ft),
        wid: num(r.width_ft),
        surf: text(r.surface),
        lit: r.lighted === '1' ? 1 : undefined,
        closed: r.closed === '1' ? 1 : undefined,
        hdg: num(r.le_heading_degT),
        ends,
      }),
    );
  }

  const oaNavaids = navaidsCsv
    .filter((n) => n.iso_country === COUNTRY)
    .map((n) => ({
      ident: n.ident,
      type: n.type,
      name: text(n.name),
      lat: coord(n.latitude_deg),
      lon: coord(n.longitude_deg),
      freq: num(n.frequency_khz),
      ch: text(n.dme_channel)?.replace(/^0+/, ''),
      elev: num(n.elevation_ft),
      var: num(n.magnetic_variation_deg),
      use: text(n.usageType),
      pwr: text(n.power),
      apt: text(n.associated_airport),
    }));

  // ---------- AIP Türkiye: meydan listesi, ENR 4.1, AD 2 / AD 3 ----------
  const enrText = await aipText(AIP_ENR41, cacheDir);
  const indexText = await aipText(AIP_INDEX, cacheDir);
  const listText = await aipText(AIP_LIST, cacheDir);
  if (!enrText || !indexText || !listText) throw new Error('AIP ENR 4.1, AD 0.6 ya da AD 1.3 bulunamadı.');

  // AIP'deki meydan/heliportlar: AD 0.6 (adlar, bölüm) + yalnızca AD 1.3'te geçen, kullanımdaki meydanlar
  const aipAerodromes = parseAerodromeIndex(indexText);
  for (const [icao, entry] of parseAerodromeList(listText)) {
    if (!aipAerodromes.has(icao) && entry.inUse) aipAerodromes.set(icao, {name: titleTr(entry.name), part: 2});
  }
  const adTexts = await mapLimit([...aipAerodromes], 4, async ([icao, entry]) => ({
    icao,
    ...entry,
    text: await aipText(AIP_AD(icao, entry.part), cacheDir),
  }));

  const enr = parseEnr41(enrText);
  const adNavaids = [];
  const ils = [];
  const amendmentTexts = [enrText];
  for (const {icao, name, part, text: t} of adTexts) {
    const general = t ? parseAerodromeData(t, part) : undefined;
    let airport = airports.find((a) => a.icao === icao || a.ident === ICAO_ALIASES[icao]);
    // OurAirports'ta kod yanlış tesise verilmiş olabilir (ör. LTHC): AIP konumundan uzaksa ayrı tesis sayılır.
    if (airport && general?.lat !== undefined && distanceNm([airport.lat, airport.lon], [general.lat, general.lon]) > 5) {
      console.warn(`uyarı: ${icao} OurAirports'ta ${airport.ident} (${airport.name}) kaydına verilmiş; ayrı tesis olarak eklendi`);
      delete airport.icao;
      if (airport.ident === icao) airport.ident = `${icao}-OA`; // kimlik çakışmasın
      airport = undefined;
    }
    if (!airport) {
      if (general?.lat === undefined) {
        console.warn(`uyarı: ${icao} (${name}) için konum bulunamadı, haritaya eklenmedi`);
        continue;
      }
      airport = {ident: icao, type: part === 3 ? 'heliport' : 'small_airport'};
      airports.push(airport);
    }
    // Ad, referans noktası, rakım ve manyetik sapma AIP'den; eski (OurAirports) ad aramada kullanılmak üzere saklanır
    if (airport.name && airport.name !== name) airport.alt = airport.name;
    Object.assign(airport, {icao, name}, compact(general ?? {}));
    if (!t) continue; // AIP'de dizinde var ama bölümü yayımlanmamış (ör. LTFI)
    airport.aip = part;
    if (part !== 2) continue;

    const runways = aipRunways(ad212Section(t), ad214Section(t), airport.rwy ?? []);
    if (runways.length > 0) airport.rwy = runways;
    else console.warn(`uyarı: ${icao} AD 2.12 pistleri okunamadı, OurAirports kullanılıyor`);
    // AD 2.18: meydanın telsiz frekansları (TWR, GND, DEL, APP, ATIS …)
    const com = parseAd218(ad218Section(t) ?? '');
    // "BODRUM TWR" → "Bodrum TWR": kısaltmalar (TWR, ATIS, AWOS …) korunur
    const KEEP = new Set(['ATIS', 'AWOS', 'AFIS', 'RAPCON', 'DHMİ']);
    const callsign = (c) =>
      c.replace(/[A-ZÇĞİÖŞÜ]{4,}/g, (w) => (KEEP.has(w) ? w : w[0] + w.slice(1).toLocaleLowerCase('tr-TR')));
    if (com.length > 0) airport.com = com.map((g) => ({...g, callsign: callsign(g.callsign), freqs: g.freqs.map(compact)}));
    else console.warn(`uyarı: ${icao} AD 2.18 frekansları okunamadı`);

    const section = ad219Section(t);
    if (!section) {
      console.warn(`uyarı: ${icao} AD 2.19 bölümü bulunamadı`);
      continue;
    }
    amendmentTexts.push(section);
    const parsed = parseAd219(section, icao);
    adNavaids.push(...parsed.navaids);
    ils.push(...parsed.ils);
  }

  // Manyetik sapma: AIP istasyon bazında sapma yayımlamaz. Bağlı meydanın (yoksa 60 NM içindeki en
  // yakın AIP meydanının) AD 2.2'deki güncel değeri kullanılır; o da yoksa OurAirports'taki (eski) değer.
  const varAerodromes = airports.filter((a) => a.aip === 2 && a.var !== undefined);
  const variationFor = (n) => {
    const own = varAerodromes.find((a) => a.icao === n.apt || a.icao === n.apts?.[0]);
    const near =
      own ??
      varAerodromes
        .map((a) => ({a, d: distanceNm([a.lat, a.lon], [n.lat, n.lon])}))
        .filter((x) => x.d < 60)
        .sort((x, y) => x.d - y.d)[0]?.a;
    return near ? {var: near.var, varSrc: `${near.icao} ${near.varYear ?? ''}`.trim()} : undefined;
  };

  const aipNavaids = mergeNavaids(enr, adNavaids).map((n) => {
    // Güç ve kullanım AIP tablosunda yok: aynı kodlu, yakın OurAirports kaydından alınır.
    const oa = oaNavaids.find((o) => o.ident === n.ident && distanceNm([o.lat, o.lon], [n.lat, n.lon]) < 3);
    const variation = variationFor(n) ?? (oa?.var !== undefined ? {var: oa.var, varSrc: 'OurAirports'} : {});
    return compact({
      ident: n.ident,
      type: n.type,
      // AD 2.19 tablosunda istasyon adı yok: bağlı olduğu meydanın adı kullanılır.
      name: titleTr(n.name) ?? oa?.name ?? airports.find((a) => a.icao === n.apts[0])?.name,
      lat: n.lat,
      lon: n.lon,
      freq: n.type === 'TACAN' || n.type === 'DME' ? undefined : n.freq,
      ch: n.ch,
      elevM: n.elevM,
      cov: n.cov,
      ...variation,
      use: oa?.use,
      pwr: oa?.pwr,
      apt: n.apts[0],
      enr: n.enr ? 1 : undefined,
    });
  });

  // AIP'de karşılığı olmayan OurAirports istasyonları (kapatılmış ya da askerî olabilir)
  const unverified = oaNavaids
    .filter((o) => !aipNavaids.some((n) => n.ident === o.ident && distanceNm([o.lat, o.lon], [n.lat, n.lon]) < 10))
    .map((o) => compact({...o, varSrc: o.var !== undefined ? 'OurAirports' : undefined, src: 'oa'}));

  // GP frekansı LOC frekansıyla ICAO Ek 10'a göre eşlidir. AIP'deki değer eşlemeye uymuyorsa
  // (ayrıştırma ya da AIP yazım hatası) AIP değeri korunur, eşlemenin verdiği değer yanına yazılır.
  for (const x of ils) {
    const icao = x.freq ? gsOf(x.freq) : undefined;
    if (x.gpFreq === undefined || icao === undefined || x.gpFreq === icao) continue;
    console.warn(`uyarı: ${x.apt} ${x.ident} GP ${x.gpFreq / 1000} MHz, LOC ${x.freq / 1000} MHz'in eşi ${icao / 1000} MHz`);
    x.gpFreqIcao = icao;
  }

  const data = {
    generated: new Date().toISOString().slice(0, 10),
    aip: {amdt: latestAmendment(amendmentTexts), url: 'https://dhmi.gov.tr/Sayfalar/aipturkey.aspx'},
    airports: airports.map(compact).sort((a, b) => a.ident.localeCompare(b.ident)),
    navaids: [...aipNavaids, ...unverified].sort((a, b) => a.ident.localeCompare(b.ident)),
    ils: ils
      .map((x) =>
        compact({
          ident: x.ident,
          apt: x.apt,
          rwy: x.rwy,
          cat: x.cat,
          freq: x.freq,
          ch: x.ch,
          llz: x.llz,
          gp: x.gp,
          gpFreq: x.gpFreq,
          gpFreqIcao: x.gpFreqIcao,
          angle: x.angle,
          rdh: x.rdh,
        }),
      )
      .sort((a, b) => a.apt.localeCompare(b.apt) || (a.rwy ?? '').localeCompare(b.rwy ?? '')),
  };

  await mkdir(path.dirname(OUT), {recursive: true});
  await writeFile(OUT, `${JSON.stringify(data)}\n`);
  console.log(
    `AIP Türkiye AIRAC AMDT ${data.aip.amdt}: ${aipNavaids.length} istasyon, ${data.ils.length} ILS/LOC ` +
      `(${adTexts.filter((x) => x.text && x.part === 2).length} meydan, ` +
      `${adTexts.filter((x) => x.text && x.part === 3).length} heliport); toplam ${airports.length} havalimanı/tesis, ` +
      `${unverified.length} doğrulanmamış istasyon → ${path.relative(process.cwd(), OUT)}`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
