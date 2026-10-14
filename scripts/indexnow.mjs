#!/usr/bin/env node
/**
 * Sitenin sayfalarını IndexNow ile arama motorlarına bildirir.
 *
 * IndexNow'a gönderilen adresler katılımcı arama motorlarının hepsiyle paylaşılır (Bing,
 * Yandex, Seznam, Naver, Yep …; güncel liste: https://www.indexnow.org/searchengines.json).
 * Google IndexNow'u desteklemez; Google'a sitemap (robots.txt) ve Search Console yeter.
 *
 * Kullanım:
 *   node scripts/indexnow.mjs liste [--tumu]   bildirilecek adresleri stdout'a yazar
 *   node scripts/indexnow.mjs gonder [adres…]  adresleri (yoksa stdin'dekileri) gönderir
 *
 * `liste`, `npm run build` çıktısındaki sitemap'i yayındaki sitemap ile karşılaştırır ve
 * yeni, `<lastmod>`'u değişmiş ya da sitemap'ten çıkmış adresleri verir. Anahtar dosyası
 * henüz yayında değilse (ilk bildirim) ya da `--tumu` verilmişse sitemap'in tamamını verir.
 * Yayındaki site okunamazsa uyarı yazar ve boş liste verir; dağıtımı durdurmaz.
 *
 * `gonder`, anahtar dosyasının yayına çıkmasını bekler ve adresleri IndexNow'a gönderir.
 * Anahtar ya da adres hatası (400/403/422) çıkış kodunu 1 yapar; geçici hatalar (429, 5xx,
 * ağ) yalnızca uyarıdır.
 *
 * Anahtar, `static/<anahtar>.txt` dosyasının adıdır; dosyanın içeriği de anahtarın kendisidir.
 * Herkese açık olması IndexNow'un tasarımıdır (sahiplik bu dosyayla kanıtlanır). Alan adı
 * `static/CNAME`'den okunur. Akış: .github/workflows/deploy.yml
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {setTimeout as bekle} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATIC_DIR = path.join(ROOT, 'static');
const BUILD_DIR = path.join(ROOT, 'build');
/** Genel uç nokta: adresler katılımcı arama motorlarının hepsine iletilir. */
const ENDPOINT = 'https://api.indexnow.org/indexnow';
/** IndexNow'un tek istekte kabul ettiği en çok adres. */
const MAX_URLS = 10_000;
const TIMEOUT_MS = 30_000;
/** Dağıtımdan hemen sonra anahtar dosyası birkaç saniye geç görünebilir. */
const ANAHTAR_DENEME = 6;
const ANAHTAR_ARALIK_MS = 10_000;

const ACTIONS = Boolean(process.env.GITHUB_ACTIONS);

function bilgi(mesaj) {
  console.error(`[indexnow] ${mesaj}`);
}

function uyari(mesaj) {
  console.error(ACTIONS ? `::warning title=IndexNow::${mesaj}` : `[indexnow] uyarı: ${mesaj}`);
}

function getir(url, secenekler = {}) {
  return fetch(url, {...secenekler, signal: AbortSignal.timeout(TIMEOUT_MS)});
}

/** Alan adı, anahtar ve anahtar dosyasının adresi. */
async function siteBilgisi() {
  const host = (await fs.readFile(path.join(STATIC_DIR, 'CNAME'), 'utf8')).trim();
  const anahtarlar = [];
  for (const ad of await fs.readdir(STATIC_DIR)) {
    // IndexNow anahtarı: 8–128 karakter, harf, rakam ve tire.
    const eslesme = /^([A-Za-z0-9-]{8,128})\.txt$/.exec(ad);
    if (!eslesme) {
      continue;
    }
    const icerik = (await fs.readFile(path.join(STATIC_DIR, ad), 'utf8')).trim();
    if (icerik === eslesme[1]) {
      anahtarlar.push(eslesme[1]);
    }
  }
  if (anahtarlar.length !== 1) {
    throw new Error(
      `static/ altında içeriği kendi adı olan tek bir anahtar dosyası (<anahtar>.txt) beklenir; ${anahtarlar.length} bulundu.`,
    );
  }
  const key = anahtarlar[0];
  return {host, key, origin: `https://${host}`, keyLocation: `https://${host}/${key}.txt`};
}

/** Sitemap'teki adres → `<lastmod>` (yoksa boş dizgi). */
function sitemapOku(xml) {
  const varliklar = {amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"};
  const coz = (s) => s.trim().replace(/&(amp|lt|gt|quot|apos);/g, (_, ad) => varliklar[ad]);
  const sayfalar = new Map();
  for (const [, url] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>([\s\S]*?)<\/loc>/.exec(url)?.[1];
    if (loc) {
      sayfalar.set(coz(loc), coz(/<lastmod>([\s\S]*?)<\/lastmod>/.exec(url)?.[1] ?? ''));
    }
  }
  return sayfalar;
}

/** Yayındaki anahtar dosyası: 'yayinda', 'yok' ya da okunamadıysa 'bilinmiyor'. */
async function anahtarDurumu(site) {
  try {
    // Sorgu dizgisi CDN'in önbellekteki bir 404'ü vermesini (ve bizim isteğimizle
    // önbelleğe 404 girmesini) önler; arama motorları dosyayı sorgusuz adresten okur.
    const yanit = await getir(`${site.keyLocation}?v=${Date.now()}`);
    if (yanit.status === 404) {
      return {durum: 'yok'};
    }
    if (!yanit.ok) {
      return {durum: 'bilinmiyor', neden: `HTTP ${yanit.status}`};
    }
    return {durum: (await yanit.text()).trim() === site.key ? 'yayinda' : 'yok'};
  } catch (hata) {
    return {durum: 'bilinmiyor', neden: hata.message};
  }
}

async function liste(site, tumu) {
  let xml;
  try {
    xml = await fs.readFile(path.join(BUILD_DIR, 'sitemap.xml'), 'utf8');
    await fs.access(path.join(BUILD_DIR, `${site.key}.txt`));
  } catch {
    throw new Error('build/ içinde sitemap.xml ya da anahtar dosyası yok; önce `npm run build`.');
  }
  const yeni = sitemapOku(xml);
  const hepsi = [...yeni.keys()];
  if (tumu) {
    bilgi(`--tumu: sitemap'teki ${hepsi.length} adresin hepsi bildirilecek.`);
    return hepsi;
  }

  const anahtar = await anahtarDurumu(site);
  if (anahtar.durum === 'yok') {
    bilgi(`Anahtar dosyası henüz yayında değil (ilk bildirim): sitemap'teki ${hepsi.length} adresin hepsi bildirilecek.`);
    return hepsi;
  }
  if (anahtar.durum === 'bilinmiyor') {
    uyari(`Yayındaki anahtar dosyası okunamadı (${anahtar.neden}); bu dağıtımda bildirim yapılmayacak.`);
    return [];
  }

  let eski;
  try {
    const yanit = await getir(`${site.origin}/sitemap.xml`);
    if (!yanit.ok) {
      throw new Error(`HTTP ${yanit.status}`);
    }
    eski = sitemapOku(await yanit.text());
  } catch (hata) {
    uyari(`Yayındaki sitemap okunamadı (${hata.message}); bu dağıtımda bildirim yapılmayacak.`);
    return [];
  }
  const eklenen = hepsi.filter((url) => !eski.has(url));
  const guncellenen = hepsi.filter((url) => eski.has(url) && eski.get(url) !== yeni.get(url));
  const kaldirilan = [...eski.keys()].filter((url) => !yeni.has(url));
  bilgi(`${eklenen.length} yeni, ${guncellenen.length} güncellenmiş, ${kaldirilan.length} kaldırılmış sayfa.`);
  return [...eklenen, ...guncellenen, ...kaldirilan];
}

async function gonder(site, adresler) {
  const urlList = [...new Set(adresler.map((s) => s.trim()).filter(Boolean))];
  if (urlList.length === 0) {
    bilgi('Bildirilecek adres yok.');
    return;
  }
  const yabanci = urlList.filter((url) => URL.parse(url)?.host !== site.host);
  if (yabanci.length > 0) {
    throw new Error(`${site.host} dışındaki adresler bildirilemez: ${yabanci.slice(0, 3).join(', ')}`);
  }

  // Arama motoru isteği aldıktan sonra anahtar dosyasını okur; dosya yayında değilse
  // istek boşa gider (ya da 403 döner).
  for (let deneme = 1; ; deneme++) {
    const anahtar = await anahtarDurumu(site);
    if (anahtar.durum === 'yayinda') {
      break;
    }
    if (deneme === ANAHTAR_DENEME) {
      uyari(`Anahtar dosyası yayında görünmüyor (${site.keyLocation}); bildirim yapılmadı.`);
      return;
    }
    await bekle(ANAHTAR_ARALIK_MS);
  }

  for (let i = 0; i < urlList.length; i += MAX_URLS) {
    const parca = urlList.slice(i, i + MAX_URLS);
    let yanit;
    try {
      yanit = await getir(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify({host: site.host, key: site.key, keyLocation: site.keyLocation, urlList: parca}),
      });
    } catch (hata) {
      uyari(`IndexNow'a ulaşılamadı (${hata.message}); bildirim yapılmadı.`);
      return;
    }
    // 200: alındı; 202: alındı, anahtar doğrulaması sürüyor (ilk bildirimde olağan).
    if (yanit.status === 200 || yanit.status === 202) {
      bilgi(`${parca.length} adres bildirildi (HTTP ${yanit.status}).`);
      for (const url of parca) {
        bilgi(`  ${url}`);
      }
      continue;
    }
    const govde = (await yanit.text().catch(() => '')).trim().slice(0, 300);
    const ayrinti = `HTTP ${yanit.status}${govde ? `: ${govde}` : ''}`;
    if (yanit.status === 429 || yanit.status >= 500) {
      uyari(`IndexNow isteği şimdilik kabul etmedi (${ayrinti}); bildirim yapılmadı.`);
      return;
    }
    // 400 biçim hatası, 403 anahtar geçersiz, 422 adres ya da anahtar alan adıyla uyuşmuyor.
    throw new Error(`IndexNow isteği reddetti (${ayrinti}).`);
  }
}

async function stdinOku() {
  if (process.stdin.isTTY) {
    throw new Error('Adresleri argüman olarak ya da stdin üzerinden verin.');
  }
  const parcalar = [];
  for await (const parca of process.stdin) {
    parcalar.push(parca);
  }
  return Buffer.concat(parcalar).toString('utf8').split(/\r?\n/);
}

const KULLANIM = 'Kullanım: node scripts/indexnow.mjs liste [--tumu] | gonder [adres…]';
const [komut, ...argumanlar] = process.argv.slice(2);

try {
  const site = await siteBilgisi();
  if (komut === 'liste' && argumanlar.every((a) => a === '--tumu')) {
    const adresler = await liste(site, argumanlar.includes('--tumu'));
    if (adresler.length > 0) {
      process.stdout.write(`${adresler.join('\n')}\n`);
    }
  } else if (komut === 'gonder') {
    await gonder(site, argumanlar.length > 0 ? argumanlar : await stdinOku());
  } else {
    console.error(KULLANIM);
    process.exitCode = 2;
  }
} catch (hata) {
  console.error(ACTIONS ? `::error title=IndexNow::${hata.message}` : `[indexnow] hata: ${hata.message}`);
  process.exitCode = 1;
}
