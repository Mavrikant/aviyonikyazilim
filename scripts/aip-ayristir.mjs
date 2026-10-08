/**
 * AIP Türkiye (DHMİ) metinlerinden radyo seyrüsefer ve iniş yardımcılarını ayrıştırır.
 *
 * Girdi, `pdftotext -layout` çıktısıdır: ENR 4.1 (yol üstü yardımcılar) ve her
 * meydanın AD 2.19 bölümü (radyo seyrüsefer ve iniş yardımcıları). Tablolarda her
 * kayıt bir koordinat çiftinin (enlem satırı … boylam satırı) çevresindeki 2–4 satıra
 * yayılır; sütunlar konuma göre değil, satırın koordinatın solunda/sağında kalan
 * kısmındaki kalıplara göre okunur.
 *
 * Kullanım izni: DHMİ, ticari olmayan kullanımda kaynak gösterilmesi koşuluyla
 * verinin kullanımına izin vermiştir (bkz. CLAUDE.md, "Araçlar bölümü").
 */

const LAT_RE = /\b(\d{2})(\d{2})(\d{2}(?:\.\d+)?)([NS])\b/;
// Yarıküre harfi AIP'de nadiren unutulur ("0394823.7"); Türkiye'de boylam her zaman doğudur.
const LON_RE = /\b(\d{3})(\d{2})(\d{2}(?:\.\d+)?)([EW])?(?![\dA-Za-z])/;

// Tanıtım kodu sanılmaması gereken büyük harfli sözcükler
const NOT_IDENT = new Set([
  'VOR', 'DME', 'NDB', 'TACAN', 'VORTAC', 'DVOR', 'LLZ', 'LOC', 'GP', 'ILS', 'CAT', 'MM', 'OM', 'IM',
  'MHZ', 'KHZ', 'H24', 'HJ', 'HN', 'HO', 'HX', 'FRA', 'NIL', 'II', 'III', 'IIIA', 'IIIB', 'I',
  'RWY', 'LM', 'LOM', 'MKR',
]);

const dms = (d, m, s, hemi) => {
  const v = Number(d) + Number(m) / 60 + Number(s) / 3600;
  return Math.round((hemi === 'S' || hemi === 'W' ? -v : v) * 1e5) / 1e5;
};

/** Metnin "AIRAC AMDT nn/yy" değişiklik numaralarından en yenisi */
export function latestAmendment(texts) {
  let best;
  for (const t of texts) {
    for (const m of t.matchAll(/AIRAC AMDT (\d{1,3})\/(\d{2})\b/g)) {
      const key = Number(m[2]) * 1000 + Number(m[1]);
      if (!best || key > best.key) best = {key, label: `${m[1].padStart(2, '0')}/${m[2]}`};
    }
  }
  return best?.label;
}

/** AD 2 metninden 2.19 bölümünü keser (bir sonraki AD 2.2x başlığına kadar). */
export function ad219Section(text) {
  const start = text.search(/AD 2\.19\s+RADIO N\w*\s*AVIGATION/);
  if (start < 0) return undefined;
  const rest = text.slice(start + 10);
  const end = rest.search(/AD 2\.2\d\s/);
  return end < 0 ? rest : rest.slice(0, end);
}

/** Tablodaki ham kayıtlar: koordinat + solda kalan metin (tür, kod, frekans) + sağda kalan metin (rakım, notlar). */
function rawRecords(text) {
  const lines = text.split('\n');
  const records = [];
  for (let i = 0; i < lines.length; i++) {
    const lat = LAT_RE.exec(lines[i]);
    if (!lat) continue;
    const col = lat.index;
    let j = -1;
    let lon;
    for (let k = i + 1; k <= Math.min(i + 3, lines.length - 1); k++) {
      const m = LON_RE.exec(lines[k]);
      if (m && Math.abs(m.index - col) <= 4) {
        j = k;
        lon = m;
        break;
      }
    }
    if (j < 0) continue;
    const slice = lines.slice(i, j + 1);
    records.push({
      lat: dms(lat[1], lat[2], lat[3], lat[4]),
      lon: dms(lon[1], lon[2], lon[3], lon[4] ?? 'E'),
      first: slice[0].slice(0, col),
      middle: slice.slice(1, -1).map((l) => l.slice(0, col)).join('  '),
      last: slice[slice.length - 1].slice(0, col),
      right: slice.map((l) => l.slice(col + 11)).join('  '),
    });
    i = j;
  }
  return records;
}

function classify(left) {
  if (/\bD?VOR\s*\/\s*DME\b/.test(left)) return 'VOR-DME';
  if (/\bVORTAC\b/.test(left)) return 'VORTAC';
  if (/\bTACAN\b/.test(left)) return 'TACAN';
  if (/\bNDB\s*\/\s*DME\b/.test(left)) return 'NDB-DME';
  if (/\bD?VOR\b/.test(left)) return 'VOR';
  if (/\b(LLZ|LOC)\b/.test(left)) return 'LLZ';
  if (/\bGP\b/.test(left)) return 'GP';
  if (/\b(NDB|LM|LOM)\b/.test(left)) return 'NDB'; // LM/LOM: ILS ile birlikte kullanılan locator NDB
  if (/\bDME\b/.test(left)) return 'DME';
  if (/\b(MM|OM|IM)\b/.test(left)) return 'MKR';
  return undefined;
}

function parseRecord(r) {
  const left = `${r.first}  ${r.middle}  ${r.last}`;
  const type = classify(left);
  if (!type) return undefined;
  // Frekans ve birimi bazen ayrı satırlara bölünür ("108.350" … "MHz"): birimsiz ondalık
  // değer VHF (108–118) ya da UHF GP (328–336) aralığındaysa MHz kabul edilir. Sayının önünde
  // \b şarttır: yoksa "H24" çalışma saatinin "24"ü alt satırdaki "MHz" ile birleşip 24 MHz okunur.
  const freq =
    /\b(\d{2,4}(?:\.\d+)?)\s*(MHz|KHz)\b/i.exec(left) ?? /\b(1[01]\d\.\d{1,3}|3[23]\d\.\d{1,3})()(?=\s)/.exec(left);
  const ch = /\bCH\s?(\d{1,3}[XY])\b/i.exec(left);
  // Kod önce ortadaki satır(lar)da aranır: ENR 4.1'de üst satır istasyon adıdır.
  const idIn = (s) =>
    s
      .replace(/\d+(?:\.\d+)?\s*(MHz|KHz)/gi, ' ')
      .match(/\b[A-Z]{2,4}\b/g)
      ?.find((t) => !NOT_IDENT.has(t));
  const ident = idIn(r.middle) ?? idIn(r.first) ?? idIn(r.last);
  const elevM = /^\s*(\d{1,4})\s*M\b/.exec(r.right.trimStart()) ?? /\b(\d{1,4})\s*M\b(?!\w)/.exec(r.right.slice(0, 40));
  const cov = /Coverage\s+(\d+)\s*NM/i.exec(r.right);
  const angle = /(\d(?:\.\d+)?)\s*DEG\b/.exec(r.right);
  const rdh = /(?:RDH|TCH)\s*:?\s*(\d+)\s*FT/i.exec(r.right);
  const cat = /\bCAT\s+(I{1,3}[ABC]?)\b/.exec(left);
  const rwy = /\bRWY\s*(\d{2}[LRC]?)\b/.exec(left) ?? /\b(?:LLZ|LOC)\s+(\d{2}[LRC]?)\b/.exec(left);
  // ENR 4.1'de istasyon adı ilk satırın frekanstan önceki kısmıdır.
  const name = r.first
    .replace(/\d+(?:\.\d+)?\s*(MHz|KHz)/gi, '')
    .replace(/\s{2,}.*$/, '')
    .trim();
  return {
    type,
    ident,
    name: name && !classify(name) && name.length >= 3 ? name : undefined,
    lat: r.lat,
    lon: r.lon,
    freq: freq ? Math.round(Number(freq[1]) * (/khz/i.test(freq[2]) ? 1 : 1000)) : undefined, // kHz
    ch: ch?.[1],
    elevM: elevM ? Number(elevM[1]) : undefined,
    cov: cov ? Number(cov[1]) : undefined,
    angle: angle ? Number(angle[1]) : undefined,
    rdh: rdh ? Number(rdh[1]) : undefined,
    cat: cat?.[1],
    rwy: rwy?.[1],
  };
}

/** ENR 4.1 metni → yol üstü istasyonlar */
export function parseEnr41(text) {
  return rawRecords(text)
    .map(parseRecord)
    .filter((r) => r && r.ident && r.type !== 'LLZ' && r.type !== 'GP' && r.type !== 'MKR');
}

/**
 * AD 2.19 bölümü → {navaids, ils}. LLZ/GP/DME kayıtları aynı ILS'in parçaları olarak
 * birleştirilir: GP, kendinden önceki GP'siz LLZ'ye; DME, kodu ILS koduyla aynıysa ona bağlanır.
 */
export function parseAd219(text, icao) {
  const navaids = [];
  const ils = [];
  for (const r of rawRecords(text).map(parseRecord).filter(Boolean)) {
    if (r.type === 'LLZ') {
      ils.push({
        ident: r.ident,
        apt: icao,
        rwy: r.rwy,
        cat: r.cat,
        freq: r.freq,
        llz: [r.lat, r.lon],
      });
    } else if (r.type === 'GP') {
      const target = [...ils].reverse().find((x) => !x.gp);
      if (target) Object.assign(target, {gp: [r.lat, r.lon], gpFreq: r.freq, angle: r.angle, rdh: r.rdh});
    } else if (r.type === 'DME' && r.ident && ils.some((x) => x.ident === r.ident)) {
      const target = ils.find((x) => x.ident === r.ident);
      Object.assign(target, {ch: r.ch, dme: [r.lat, r.lon], elevM: r.elevM});
    } else if (r.type !== 'MKR' && r.ident) {
      navaids.push({...r, apt: icao});
    }
  }
  return {navaids, ils};
}

const R_NM = 3440.065;
export function distanceNm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function bearing(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]));
  const x = Math.cos(rad(a[0])) * Math.sin(rad(b[0])) - Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const KIND = (type) => (type.startsWith('NDB') ? 'NDB' : type === 'DME' ? 'DME' : type === 'TACAN' ? 'TACAN' : 'VOR');

/**
 * Aynı istasyonun ENR 4.1 ve birden çok AD 2.19 bölümündeki kayıtlarını birleştirir;
 * aynı kod ve konumdaki ayrı VOR + DME / NDB + DME / VOR + TACAN kayıtlarını
 * VOR/DME, NDB/DME ve VORTAC olarak tek istasyona indirger.
 */
export function mergeNavaids(enr, adList) {
  const out = [];
  const near = (a, b) => distanceNm([a.lat, a.lon], [b.lat, b.lon]) < 1;
  const add = (n, enroute) => {
    const same = out.find((o) => o.ident === n.ident && KIND(o.type) === KIND(n.type) && near(o, n));
    if (same) {
      if (n.apt && !same.apts.includes(n.apt)) same.apts.push(n.apt);
      same.enr ||= enroute;
      for (const k of ['name', 'freq', 'ch', 'elevM', 'cov']) same[k] ??= n[k];
      if (n.type.length > same.type.length) same.type = n.type; // VOR → VOR-DME
      return;
    }
    out.push({...n, apts: n.apt ? [n.apt] : [], enr: enroute});
  };
  enr.forEach((n) => add(n, true));
  adList.forEach((n) => add(n, false));

  // Ayrı yazılmış eş konumlu bileşenleri birleştir
  const combine = (baseTest, partType, result) => {
    for (const part of out.filter((o) => o.type === partType)) {
      const base = out.find((o) => o !== part && baseTest(o) && o.ident === part.ident && near(o, part));
      if (!base) continue;
      base.type = result;
      base.ch ??= part.ch;
      base.elevM ??= part.elevM;
      for (const a of part.apts) if (!base.apts.includes(a)) base.apts.push(a);
      out.splice(out.indexOf(part), 1);
    }
  };
  combine((o) => o.type === 'VOR', 'DME', 'VOR-DME');
  combine((o) => o.type === 'NDB', 'DME', 'NDB-DME');
  combine((o) => o.type === 'VOR' || o.type === 'VOR-DME', 'TACAN', 'VORTAC');
  return out;
}

/** AD 2 metninden 2.12 (pist fiziksel özellikleri) bölümünü keser. */
export function ad212Section(text) {
  const start = text.search(/AD 2\.12\s+RUNWAY PHYSICAL/);
  if (start < 0) return undefined;
  const rest = text.slice(start + 10);
  const end = rest.search(/AD 2\.13\s/);
  return end < 0 ? rest : rest.slice(0, end);
}

// Pist ucu satırı: tanım, gerçek yön ("036.19°", "069.92" ya da "-"), boyut ("3752x60", bazen komşu satırda)
const RWY_LINE = /^\s*\*?(\d{2}[LRC]?)\s+(\d{1,3}\.\d+|\d{3}|-)\s*°?(?:\s+(\d{3,5})\s*[xX]\s*(\d{2,3})m?)?(?=\s|$)/;
const DIMS = /\b(\d{3,5})\s*[xX]\s*(\d{2,3})(?!\d)/;
const SURFACES = /\b(Asphalt|Concrete|Bitumen|Grass|Gravel|Asphalt\/Concrete|Concrete\/Asphalt)\b/i;

/**
 * AD 2.12 → pistler. Her pist ucu satırı "03C  036.19°  3752x60" biçimindedir;
 * eşik koordinatı aynı satırın birkaç satır üstünde/altında yer alır. Karşılıklı
 * uçlar (03C ↔ 21C) birleştirilerek pist üretilir: uzunluk/genişlik metre.
 */
export function parseAd212(text) {
  const lines = text.split('\n');
  const ends = [];
  for (let i = 0; i < lines.length; i++) {
    const m = RWY_LINE.exec(lines[i]);
    // Bölümün ikinci tablosu (eğim, SWY/CWY, şerit) da satır başında pist tanımı taşır; eğim sütunundaki "%" ile ayrılır.
    if (!m || lines[i].includes('%')) continue;
    // Eşik enlemi: önce üstteki 4 satır (yakından uzağa), sonra alttaki 2 satır
    const order = [i, i - 1, i - 2, i - 3, i - 4, i + 1, i + 2].filter((k) => k >= 0 && k < lines.length);
    let thr;
    for (const k of order) {
      const lat = LAT_RE.exec(lines[k]);
      if (!lat) continue;
      for (let j = k; j <= Math.min(k + 3, lines.length - 1); j++) {
        // Aynı satırda "374856.06N-0275246.03E" ya da alt satırda aynı sütunda
        const lon = LON_RE.exec(j === k ? lines[j].slice(lat.index + 6) : lines[j]);
        if (lon && (j === k || Math.abs(lon.index - lat.index) <= 6)) {
          thr = [dms(lat[1], lat[2], lat[3], lat[4]), dms(lon[1], lon[2], lon[3], lon[4] ?? 'E')];
          break;
        }
      }
      if (thr) break;
    }
    const surf = lines
      .slice(Math.max(0, i - 4), i + 5)
      .map((l) => SURFACES.exec(l)?.[1])
      .find(Boolean);
    const dims = m[3] ? [m[3], m[4]] : (DIMS.exec(lines[i - 1] ?? '') ?? DIMS.exec(lines[i + 1] ?? ''))?.slice(1);
    // İkinci tablodaki "16R - 1% …" gibi satırları elemek için: yön yoksa eşik ya da aynı satırda boyut olmalı
    if (!dims || (m[2] === '-' && !thr && !m[3])) continue;
    ends.push({id: m[1], brg: m[2] === '-' ? undefined : Number(m[2]), len: Number(dims[0]), wid: Number(dims[1]), thr, surf});
  }

  const num = (id) => Number(id.slice(0, 2));
  const opposite = {L: 'R', R: 'L', C: 'C', '': ''};
  const used = new Set();
  const runways = [];
  for (const a of ends) {
    if (used.has(a)) continue;
    const want = `${String(((num(a.id) + 17) % 36) + 1).padStart(2, '0')}${opposite[a.id.slice(2)]}`;
    const b = ends.find((e) => !used.has(e) && e !== a && e.id === want);
    used.add(a);
    if (b) used.add(b);
    const [lo, hi] = b && num(b.id) < num(a.id) ? [b, a] : [a, b];
    runways.push({
      id: hi ? `${lo.id}/${hi.id}` : lo.id,
      lenM: lo.len,
      widM: lo.wid,
      surf: lo.surf ?? hi?.surf,
      hdg: lo.brg ?? (lo.thr && hi?.thr ? Math.round(bearing(lo.thr, hi.thr) * 100) / 100 : undefined),
      ends: lo.thr && hi?.thr ? [lo.thr, hi.thr] : undefined,
    });
  }
  return runways;
}

/**
 * AD 0.6 (içindekiler) → AIP'deki meydan ve heliportlar: ICAO → {name, part}.
 * Satırlar "Ankara / Esenboğa      LTAC AD 2.1" biçimindedir; adlar AIP'nin kendi yazımıyladır.
 */
export function parseAerodromeIndex(text) {
  const out = new Map();
  // Meydanlar: "Ad   LTAC AD 2.1"; heliportlar: "Ad   AD 3.1 LTHA"
  for (const m of text.matchAll(/^\s*(\S.*?)\s{3,}(LT[A-Z]{2}) AD ([23])\.1\b/gm)) {
    out.set(m[2], {name: m[1].trim(), part: Number(m[3])});
  }
  for (const m of text.matchAll(/^\s*(\S.*?)\s{3,}AD ([23])\.1 (LT[A-Z]{2})\b/gm)) {
    out.set(m[3], {name: m[1].trim(), part: Number(m[2])});
  }
  return out;
}

/**
 * AD 1.3 (meydan dizini) → ICAO → {name, inUse}. AD 0.6'da bulunmayan meydanları
 * (ör. yalnızca listede geçen iniş alanları) ve "NOT IN USE" durumunu yakalamak için.
 */
export function parseAerodromeList(text) {
  const out = new Map();
  for (const m of text.matchAll(/^(\S.*?)\s+-\s+(LT[A-Z]{2})\b(.*)$/gm)) {
    out.set(m[2], {name: m[1].trim(), inUse: !/NOT IN USE/i.test(m[3])});
  }
  return out;
}

/**
 * AD 2.2 / AD 3.2 (coğrafi ve idari bilgiler) → referans noktası, rakım, manyetik sapma.
 * part: 2 (meydan) ya da 3 (heliport).
 */
export function parseAerodromeData(text, part) {
  const start = text.search(new RegExp(`AD ${part}\\.2\\s+(AERODROME|HELIPORT) GEOGRAPHICAL`));
  if (start < 0) return undefined;
  const rest = text.slice(start + 10);
  const end = rest.search(new RegExp(`AD ${part}\\.3\\s`));
  const section = end < 0 ? rest : rest.slice(0, end);

  let lat;
  let lon;
  for (const line of section.split('\n')) {
    const la = LAT_RE.exec(line);
    if (!la) continue;
    const lo = LON_RE.exec(line.slice(la.index + 6));
    if (!lo) continue;
    lat = dms(la[1], la[2], la[3], la[4]);
    lon = dms(lo[1], lo[2], lo[3], lo[4] ?? 'E');
    break;
  }
  // Değer etiketle aynı satırda ya da bir alt satırda olabilir
  const elev = /Elevation[^\n]*?\n?[^\n]*?\b(\d+(?:\.\d+)?)\s*FT/i.exec(section);
  // "6.4°E (2025)", "6.1˚E (2025)" ya da "3°43’E (2006)"
  const mv = /MAG VAR[^\n]*?(\d+(?:\.\d+)?)\s*[°˚](?:\s*(\d+)\s*['’])?\s*([EW])\s*\((\d{4})\)/i.exec(section);
  return {
    lat,
    lon,
    elev: elev ? Math.round(Number(elev[1])) : undefined,
    var: mv ? Math.round((Number(mv[1]) + Number(mv[2] ?? 0) / 60) * 10 * (mv[3] === 'W' ? -1 : 1)) / 10 : undefined,
    varYear: mv ? Number(mv[4]) : undefined,
  };
}

/** AD 2 metninden 2.14 (yaklaşma ve pist ışıkları) bölümünü keser. */
export function ad214Section(text) {
  const start = text.search(/AD 2\.14\s+APPROACH AND RUNWAY LIGHTING/);
  if (start < 0) return undefined;
  const rest = text.slice(start + 10);
  const end = rest.search(/AD 2\.15\s/);
  return end < 0 ? rest : rest.slice(0, end);
}

/**
 * AD 2.14 → pist ucu başına özet ışık bilgisi: {lit, apch, gsi}.
 * Tablo sütunları satırlara dağıldığından tam okuma yapılmaz; her ucun satırları
 * (tanım satırı ile komşu tanım satırları arasındaki orta noktalara kadar) tek metin
 * olarak ele alınır ve yalnızca güvenle tanınabilen kalıplar çıkarılır.
 * `ids`: AD 2.12'den bilinen pist ucu tanımları (yanlış satırları elemek için).
 */
export function parseAd214(text, ids) {
  // "AD 2.14 APPROACH AND RUNWAY LIGHTING - NIL": meydanda pist ışığı yok
  if (/^[^\n]*LIGHTING\s*-\s*NIL/.test(text)) return Object.fromEntries(ids.map((id) => [id, {lit: false}]));
  const lines = text.split('\n');
  const rows = [];
  lines.forEach((line, i) => {
    const m = /^\s{0,6}\*?(\d{2}[LRC]?)(?=\s|$)/.exec(line); // tanım satırın sonunda da olabilir
    if (m && ids.includes(m[1])) rows.push({id: m[1], i});
  });
  const out = {};
  rows.forEach((row, k) => {
    const from = k === 0 ? Math.max(0, row.i - 6) : Math.ceil((rows[k - 1].i + row.i) / 2);
    const to = k === rows.length - 1 ? Math.min(lines.length, row.i + 7) : Math.ceil((row.i + rows[k + 1].i) / 2);
    const block = lines.slice(from, to).join(' ').replace(/\s+/g, ' ');
    const cat = /CAT\s*(III|II|I)\b/i.exec(block)?.[1]?.toUpperCase();
    const apch = /Precision APP|PALS|ALSF|CAT\s*I/i.test(block)
      ? `Hassas${cat ? ` (CAT ${cat})` : ''}`
      : /\b(SALS|SSALR|ODALS|Simple|MALS|Non-?precision)\b/i.test(block)
        ? 'Basit'
        : undefined;
    const gsiType = /\bA-?PAPI\b/i.test(block) ? 'APAPI' : /\bPAPI\b/i.test(block) ? 'PAPI' : /\bVASIS?\b/i.test(block) ? 'VASIS' : undefined;
    const angle = gsiType ? /(\d(?:\.\d+)?)\s*(?:DEG|°)/i.exec(block)?.[1] : undefined;
    const lit = Boolean(apch || gsiType || /\b(LIH|LIM|LIL|Color\s*coded|White|Yellow|Green)\b/i.test(block));
    out[row.id] = {lit, apch, gsi: gsiType ? `${gsiType}${angle ? ` ${angle}°` : ''}` : undefined};
  });
  return out;
}

/** AD 2 metninden 2.18 (ATS haberleşme) bölümünü keser. */
export function ad218Section(text) {
  const start = text.search(/AD 2\.18\s+(ATS )?COMMUNICATION/);
  if (start < 0) return undefined;
  const rest = text.slice(start + 10);
  const end = rest.search(/AD 2\.19\s/);
  return end < 0 ? rest : rest.slice(0, end);
}

// Çağrı adındaki sözcükten hizmet türü (sıra önemli: "Approach/Radar" APP, "Ground" GND …)
const SERVICES = [
  [/\b(Delivery|DEL|Clearance)\b/i, 'DEL'],
  [/\b(Ground|GND|GMC)\b/i, 'GND'],
  [/\b(Apron)\b/i, 'APRON'],
  [/\b(Information|ATIS)\b/i, 'ATIS'],
  [/\b(Approach|APP|Arrival|Director|Radar|RAPCON)\b/i, 'APP'],
  [/\b(Tower|TWR)\b/i, 'TWR'],
  [/\b(AFIS)\b/i, 'AFIS'],
  [/\b(Rescue|SAR)\b/i, 'SAR'],
];
const SERVICE_COL1 = /^\s{0,10}\**\s?(TWR|APP|ATIS|GND|GMC|DEL|SAR|AFIS|APRON|RADAR|ACC|CLR)\b/;
const FREQ_RE = /(\*?)(\d{3}[.,]\d{1,3}|\d{4,5})\s*(MHz|KHz)(?:\s*\(([A-Z/]+)\))?/gi;

/**
 * AD 2.18 → [{service, callsign, freqs: [{mhz, note}]}]. Yalnızca VHF hava bandı (118–137 MHz)
 * alınır; UHF (askerî) ve HF (SAR) ile "*" işaretli acil durum frekansları atlanır.
 */
export function parseAd218(text) {
  const lines = text.split('\n').slice(1); // ilk satır bölüm başlığı
  // Boş satırlarla ayrılan bloklar: tablolarda hizmet grupları çoğunlukla böyle ayrılır
  let blockNo = 0;
  const block = lines.map((l) => (l.trim() === '' ? ++blockNo : blockNo));
  // Frekans sütununun başladığı kolon: çağrı adı bunun solunda başlar, notlar sağında kalır
  const freqCol = Math.min(...lines.flatMap((l) => [...l.matchAll(FREQ_RE)].map((m) => m.index)));
  const NOISE = /^(AIP|TÜRKİYE|TURKEY|DHMI|DHMİ|AIRAC|AD 2|\d{2} [A-Z]{3} \d{2}|LT[A-Z]{2}$|Service|Call sign|designation|operation|Channel|Hours|Remarks|\d)/i;
  const freqs = [];
  const fragments = [];
  lines.forEach((line, i) => {
    const matches = [...line.matchAll(FREQ_RE)];
    const firstCol = matches[0]?.index ?? line.length;
    // Frekansın solunda kalan metnin ilk parçası (büyük boşlukta kesilir): çağrı adı
    const raw = line.slice(0, firstCol).replace(SERVICE_COL1, (m) => ' '.repeat(m.length));
    const startCol = raw.search(/\S/);
    const left = raw.trim().split(/\s{3,}/)[0];
    if (left && startCol >= 0 && startCol < freqCol && !NOISE.test(left)) fragments.push({i, text: left});
    for (const m of matches) {
      const value = Number(m[2].replace(',', '.')) / (/khz/i.test(m[3]) ? 1000 : 1);
      // Yalnızca VHF hava bandı; "*" işaretli ve 121.5 acil durum frekansı atlanır
      if (m[1] === '*' || value < 118 || value > 137 || value === 121.5) continue;
      // Aynı satırda frekansın hemen sağındaki kısa not ("APP Baglum") ya da parantez içi (ARR/DEP)
      const after = line.slice(m.index + m[0].length).trim().split(/\s{3,}/)[0];
      // Not sütunu serbest metindir; yalnızca bilinen kısa kalıplar alınır (ör. "APP West", "For ARRIVAL")
      const known = /^((APP|TWR|GND|DEL|ATIS|ARR|DEP)\b[A-Za-zÇĞİÖŞÜçğıöşü ]{0,14}|For (ARRIVAL|DEPARTURE))$/i.exec(after);
      const note = m[4] ?? known?.[0];
      freqs.push({i, mhz: value, note});
    }
  });

  // Hizmet sözcüğü içermeyen parçayı (ör. "Esenboğa") sonraki yakın parçayla birleştir ("… Approach/Radar")
  const groups = [];
  for (const f of fragments) {
    const last = groups[groups.length - 1];
    const lastHasService = last && SERVICES.some(([re]) => re.test(last.text));
    if (last && !lastHasService && f.i - last.end <= 4) {
      last.text = `${last.text} ${f.text}`;
      last.end = f.i;
    } else {
      groups.push({text: f.text, start: f.i, end: f.i, freqs: []});
    }
  }
  if (groups.length === 0) return [];

  for (const g of groups) g.service = SERVICES.find(([re]) => re.test(g.text))?.[1];
  for (const fr of freqs) {
    // Notu bir hizmetle başlıyorsa ("APP West") o hizmetin grubuna bağlanır
    const noted = /^(APP|TWR|GND|DEL|ATIS)\b/.exec(fr.note ?? '')?.[1];
    const target = noted && groups.find((g) => g.service === noted);
    if (target) {
      if (!target.freqs.some((x) => x.mhz === fr.mhz)) target.freqs.push({mhz: fr.mhz, note: fr.note.slice(noted.length).trim() || undefined});
      continue;
    }
    const dist = (g) => (fr.i < g.start ? g.start - fr.i : fr.i > g.end ? fr.i - g.end : 0);
    // Önce aynı bloktaki gruplar, yoksa tümü; en yakını seçilir (eşitlikte öndeki)
    const sameBlock = groups.filter((g) => block[g.start] === block[fr.i] || block[g.end] === block[fr.i]);
    const best = (sameBlock.length ? sameBlock : groups).reduce((a, b) => (dist(b) < dist(a) ? b : a));
    if (!best.freqs.some((x) => x.mhz === fr.mhz)) best.freqs.push({mhz: fr.mhz, note: fr.note});
  }

  return groups
    .filter((g) => g.freqs.length > 0)
    .map((g) => ({
      service: g.service,
      callsign: g.text.replace(/^[-*/\s]+/, '').replace(/\s+/g, ' '),
      freqs: g.freqs,
    }))
    // Hizmeti tanınamayan gruplar (sektör listeleri, follow-me vb.) yanlış etiketlenmesin diye atlanır
    .filter((g) => g.service && g.service !== 'SAR');
}
