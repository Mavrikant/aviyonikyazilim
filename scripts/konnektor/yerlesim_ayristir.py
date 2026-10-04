#!/usr/bin/env python3
"""
Dairesel konnektör yerleşim standartlarından kontak konumlarını, kontak boyutlarını ve
alternatif insert konumlarını ayrıştırır:

  - MIL-STD-1560: MIL-DTL-38999, MIL-DTL-27599, SAE-AS29600 seri A
  - MIL-STD-1669: MIL-DTL-26482
  - MIL-STD-1651: SAE-AS50151 (MIL-DTL-5015'in yerini alan), MIL-DTL-22992,
                  MIL-DTL-83723 seri II, SAE-AS95234

Girdi `pdftotext -layout` çıktısıdır (sayfalar \\f ile ayrılır). Her yerleşimde bir kontak
konum tablosu (kimlik, X, Y), bir özet tablosu (kontak sayısı, boyutu, hizmet sınıfı, konum)
ve 1669/1651'de alternatif insert konumu açıları (W, X, Y, Z) bulunur.

Standartlara göre boyutlar inçtir; mm yalnızca bilgi içindir. Tablolarda değerlerden biri
parantez içinde verilir; hangisinin inç olduğu oranlarından (25,4) anlaşılır. İkisi tutmazsa
(standarttaki yazım hatası) tablonun düzenine göre inç değeri alınır ve uyarı yazılır.

Yerleşimdeki her kontağın boyutu özet tablosundan çıkarılır; sonuç katı biçimde doğrulanır
(kimlikler tabloda var mı, sayılar tutuyor mu). Doğrulamadan geçemeyen yerleşimler
`dogrulama` alanında listelenir ve `duzeltmeler.json` ile elle çözülür.
"""
import json
import re
import sys

TIRE = '‐‑‒–—−'  # standartlardaki farklı tire karakterleri
SAYI = r'[+\-]?\s?(?:\d+\.\d*|\.\d+|\d+)'
KOORD = rf'({SAYI})\s*\(\s*({SAYI})\s*\)'
KIMLIK = r'([A-Za-z]{1,2}|\d{1,3})'
SATIR = re.compile(rf'(?<![\w.]){KIMLIK}\s+{KOORD}\s+{KOORD}')
TEK_KONTAK = re.compile(rf'Not\s+applicable\s+{KOORD}\s+{KOORD}', re.I)
KOD = r'\d{1,2}(?:S|SL)?\s*-\s*\d{1,3}[A-Z]?'
# "(Insert arrangement 9-3)", "Insert arrangement (20-41)", "(Insert arrangements 8-1 and 8S-1)"
BASLIK = re.compile(rf'\(?\s*Insert arrangements?\s+\(?\s*((?:{KOD})(?:\s*(?:,|and)\s*{KOD})*)\s*\)?\s*\)?', re.I)
# MIL-STD-1669: yerleşim kodu tek başına bir satırdır ve hemen ardından "Contacts" tablosu gelir
BASLIK_1669 = re.compile(rf'^\s{{10,}}({KOD})\s*$', re.M)
BOYUT = r'23-22|22D|22M|22|20|16S|16|12S|12|10|8|4|0'
DERECELI_HARF = ('W', 'X', 'Y', 'Z')


def sayi(s):
    return float(s.replace(' ', ''))


def isaretli(a, b, deger):
    a, b = a.strip(), b.strip()
    eksi = a.startswith('-') or (a[0] not in '+-' and b.startswith('-'))
    return -deger if eksi else deger


def coz_koord(a, b, duzen=None):
    """(a, parantez içi b) → (inç değeri, düzen, uyarı). düzen: 'inc-mm' ya da 'mm-inc'."""
    va, vb = abs(sayi(a)), abs(sayi(b))
    if va == 0 and vb == 0:
        return 0.0, None, None
    if vb > 0 and abs(va * 25.4 - vb) <= max(0.06, vb * 0.02):
        return isaretli(a, b, va), 'inc-mm', None
    if va > 0 and abs(vb * 25.4 - va) <= max(0.06, va * 0.02):
        return isaretli(a, b, vb), 'mm-inc', None
    if duzen == 'mm-inc':
        return isaretli(a, b, vb), duzen, f'inç {vb} ile mm {va} tutmuyor; inç esas alındı'
    return isaretli(a, b, va), duzen or 'inc-mm', f'inç {va} ile mm {vb} tutmuyor; inç esas alındı'


def kodlar(metin):
    return [re.sub(r'\s+', '', k) for k in re.findall(KOD, metin)]


def bloklara_ayir(metin, standart):
    """Metni (kod listesi, sayfa no, blok metni) parçalarına ayırır."""
    for t in TIRE:
        metin = metin.replace(t, '-')
    # "-. 341" gibi ondalık noktadan sonra boşluklu yazılmış sayılar
    metin = re.sub(r'(?<=[+\-\s(])\.\s(\d)', r'.\1', metin)
    bloklar = []
    for no, sayfa in enumerate(metin.split('\f'), start=1):
        if standart == '1669':
            eslesmeler = [m for m in BASLIK_1669.finditer(sayfa)
                          if re.search(r'Contacts', sayfa[m.end():m.end() + 400])]
        else:
            eslesmeler = list(BASLIK.finditer(sayfa))
        for i, m in enumerate(eslesmeler):
            son = eslesmeler[i + 1].start() if i + 1 < len(eslesmeler) else len(sayfa)
            bloklar.append((kodlar(m.group(1)), no, sayfa[m.end():son]))
    return bloklar


def ayristir(metin, standart):
    kayitlar = {}
    for kod_listesi, no, govde in bloklara_ayir(metin, standart):
        kod = kod_listesi[0]
        sekil = re.search(r'FIGURE (\d+)', govde)
        govde = re.split(r'\n\s*FIGURE \d', govde)[0]
        k = kayitlar.setdefault(kod, {'kod': kod, 'esdeger': [], 'kontaklar': [], 'uyarilar': [], 'bilgi': [],
                                      'sayfalar': [], 'metin': '', 'sekil': None})
        for diger in kod_listesi[1:]:
            if diger not in k['esdeger']:
                k['esdeger'].append(diger)
        if no not in k['sayfalar']:
            k['sayfalar'].append(no)
        k['metin'] += '\n' + govde
        if sekil and not k['sekil']:
            k['sekil'] = int(sekil.group(1))
        duzen = None
        for satir in govde.split('\n'):
            tek = TEK_KONTAK.search(satir)
            if tek:
                k['kontaklar'].append({'id': '', 'x': 0.0, 'y': 0.0})
                continue
            for m in SATIR.finditer(satir):
                x, d1, u1 = coz_koord(m.group(2), m.group(3), duzen)
                duzen = duzen or d1
                y, d2, u2 = coz_koord(m.group(4), m.group(5), duzen)
                duzen = duzen or d2
                for u in (u1, u2):
                    if u:
                        k['uyarilar'].append(f'{m.group(1)}: {u}')
                k['kontaklar'].append({'id': m.group(1), 'x': round(x, 4), 'y': round(y, 4)})
    for k in kayitlar.values():
        tamamla(k)
    return kayitlar


def alternatif_konumlar(metin):
    """W, X, Y, Z alternatif insert konumu açıları (derece); tanımsız olanlar None."""
    m = re.search(r'Alternate insert positions', metin)
    if not m:
        return None
    satirlar = metin[m.end():].split('\n')[:8]
    for i, s in enumerate(satirlar):
        harfler = re.findall(r'(?<![A-Za-z-])([WXYZ])(?![A-Za-z-])', s)
        if 'W' in harfler:
            harfler = harfler[harfler.index('W'):]
        if len(harfler) >= 2 and harfler == list(DERECELI_HARF[:len(harfler)]):
            # açı satırı: harf satırından sonraki ilk sayı/tire satırı (1669'da aynı satırın sağında)
            for t in satirlar[i + 1:i + 4]:
                degerler = re.findall(r'(\d{1,3}|-{2,})', t.split(')')[-1] if '(mm)' in t else t)
                if degerler:
                    return {h: (int(d) if d.isdigit() else None) for h, d in zip(harfler, degerler)}
    return None


def ozet_tablosu(metin):
    """Özet tablosunun satırlarını ve konum sütununun hizasını döndürür."""
    satirlar = metin.split('\n')
    bas = next((i for i, s in enumerate(satirlar) if re.search(r'\bShell\b', s)), None)
    if bas is None:
        return [], None
    baslik = '\n'.join(satirlar[bas:bas + 5])
    konum_x = None
    for s in satirlar[bas:bas + 5]:
        j = s.find('location')
        if j >= 0:
            konum_x = j
    govde = []
    for s in satirlar[bas + 1:bas + 24]:
        if re.match(r'\s*(NOTE|Note|Alternate insert)', s):
            break
        govde.append(s)
    return govde, konum_x


def kimlik_listesi(metin, tum):
    """'A, B, D thru F' → kimlik listesi; çözülemeyen parça varsa None."""
    sonuc = []
    metin = re.sub(r'\s+(thru|through)\s+', '-', metin)
    for parca in re.split(r'[,\s]+', metin.strip()):
        if not parca:
            continue
        aralik = re.fullmatch(r'([A-Za-z]{1,2}|\d{1,3})-([A-Za-z]{1,2}|\d{1,3})', parca)
        if aralik and aralik.group(1) in tum and aralik.group(2) in tum:
            i, j = tum.index(aralik.group(1)), tum.index(aralik.group(2))
            sonuc.extend(tum[i:j + 1])
        elif parca in tum:
            sonuc.append(parca)
        elif re.fullmatch(r'\d{3,}', parca) and parca not in tum:
            continue  # sağdaki parça numarası sütunundan kalan sayı
        elif len(parca) == 2 and parca[0] in tum and parca[1] in tum:
            sonuc.extend([parca[0], parca[1]])  # unutulmuş virgül: "LM" = L, M
        else:
            return None
    return sonuc


HIZMET = r'INST|II|I|A|M|N|D|E|R'
DESTEK = re.compile(r'\s{2,}(?:MS\d|M39029|NAS|\(see|\(See|see note|\d{4,})')


SINIF = r'Coax|Twinax|Quadrax|Power|power|Triax'


def konum_parcasi(metin):
    """Konum sütunundaki metinden hizmet sınıfını, kontak sınıfını ve sağa taşan sütunları ayıklar."""
    metin = DESTEK.split(metin)[0]
    metin = re.sub(rf'^\s*(?:{SINIF})\b', '', metin)
    metin = re.sub(rf'^\s*(?:{HIZMET})(?=\s{{2,}}|$)', '', metin)
    metin = re.sub(r'\s{2,}\d{1,3}\s*$', '', metin)  # sağdaki sütundan kalan sayı (ör. parça no parçası)
    return metin.strip()


def boyut_ata(k):
    """Özet tablosundan her kontağın boyutunu atar; başarısızsa doğrulama notu döndürür."""
    govde, konum_x = ozet_tablosu(k['metin'])
    k['ozet_metni'] = '\n'.join(s for s in govde if s.strip())
    tum = [c['id'] for c in k['kontaklar']]
    # Başlık satırlarını atla (sütun adları birkaç satıra yayılabilir)
    ilk = 0
    for i, s in enumerate(govde[:6]):
        if re.search(r'\b(location|rating|contacts|number|no\.|ment|Supersedes|Socket|Pin)\b', s) and not re.search(rf'(?<![\w/.(-])\d{{1,3}}\s{{2,}}(?:{BOYUT})(?![\w/-])', s):
            ilk = i + 1
    govde = govde[ilk:]
    satirlar = []  # (satır no, sayı, boyut, satırdaki konum metni)
    govde_k, yerlesim_k = k['kod'].split('-')
    bas_kalip = re.compile(rf'^\s*{re.escape(govde_k)}\s{{2,}}-?\s?{re.escape(yerlesim_k)}(?=\s{{2,}})')
    for i, s in enumerate(govde):
        on = bas_kalip.match(s)
        if on:
            s = ' ' * on.end() + s[on.end():]
            govde[i] = s
        for m in re.finditer(rf'(?<![\w/.(-])(\d{{1,3}})\s{{2,}}({BOYUT})(\s*\((?:pin|socket)\))?(?:\s+({SINIF}))?(?![\w/-])', s):
            if m.group(3) and 'socket' in m.group(3):
                continue  # aynı kontağın soket boyutu (16S gibi); pin boyutu esas alınır
            boyut = m.group(2) + (f' {m.group(4).capitalize()}' if m.group(4) and m.group(4).lower() != 'power' else '')
            satirlar.append((i, int(m.group(1)), boyut, konum_parcasi(s[m.end():])))
    k['ozet'] = [(say, b) for _, say, b, _ in satirlar]
    if not satirlar:
        return 'özet tablosunda kontak sayısı bulunamadı'

    # Yalnızca "All" diyen satırlar (gövde varyantları ya da pin/soket satırları): tek boyut
    def hepsi_mi(metin):
        return re.fullmatch(r'All', metin.strip()) is not None
    if all(hepsi_mi(m) or not m for _, _, _, m in satirlar) and all(say == len(tum) for _, say, _, _ in satirlar):
        for c in k['kontaklar']:
            c['boyut'] = satirlar[0][2]
        return None
    if len(satirlar) == 1:
        if satirlar[0][1] != len(tum):
            return f'özet toplamı {satirlar[0][1]} ≠ tablodaki {len(tum)} kontak'
        for c in k['kontaklar']:
            c['boyut'] = satirlar[0][2]
        return None

    # Karışık: konum listeleri sayı satırının kendisinde ya da (dikey ortalanmış tablolarda)
    # üstünde/altında olabilir. Her devam satırı en yakın sayı satırına bağlanır.
    sayi_satirlari = [r[0] for r in satirlar]
    ekler = {i: [] for i in sayi_satirlari}
    if konum_x is not None:
        for j, satir_metni in enumerate(govde):
            if j in sayi_satirlari:
                continue
            parca = konum_parcasi(satir_metni[max(0, konum_x - 6):])
            if not parca or not re.fullmatch(r'[A-Za-z0-9 ,]+', parca):
                continue
            if not (',' in parca or re.fullmatch(r'[A-Za-z]{1,2}|\d{1,3}|All\s*others?|Remainder', parca)):
                continue
            en_yakin = min(sayi_satirlari, key=lambda i: (abs(i - j), i < j))
            ekler[en_yakin].append((j, parca))
    atama, kalan = {}, None
    for idx, (satir, say, boyut, metin) in enumerate(satirlar):
        parcalar = sorted(ekler[satir] + [(satir, metin)])
        metin = ' '.join(p for _, p in parcalar if p).strip()
        metin = re.sub(r'\s*,\s*', ', ', metin).rstrip(', ')
        if re.fullmatch(r'All\s*others?|All other|Remainder', metin, re.I):
            kalan = (boyut, say)
            continue
        liste = kimlik_listesi(metin, tum)
        if liste is None or len(liste) != say:
            return f'karışık boyut: "{metin}" ({say} × {boyut}) çözülemedi'
        for kid in liste:
            atama[kid] = boyut
    if kalan:
        kalanlar = [kid for kid in tum if kid not in atama]
        if len(kalanlar) != kalan[1]:
            return f'karışık boyut: "diğerleri" {len(kalanlar)} ≠ {kalan[1]}'
        for kid in kalanlar:
            atama[kid] = kalan[0]
    if len(atama) != len(tum):
        return f'karışık boyut: {len(tum) - len(atama)} kontağın boyutu atanamadı'
    for c in k['kontaklar']:
        c['boyut'] = atama[c['id']]
    k['bilgi'].append('karışık boyut otomatik çözüldü')
    return None


def tamamla(k):
    metin = k['metin']
    k['govde_boyutu'] = k['kod'].split('-')[0]
    k['notlar'] = sorted(set(re.sub(r'\s+', ' ', m.group(1)).strip() for m in re.finditer(
        r'\((Inactive[^)]*|Applicable[^)]*|Not applicable to[^)]*|[Nn]ot for new design[^)]*)\)', metin)))
    k['alternatif'] = alternatif_konumlar(metin)

    # Standartta büyük harfe benzeyen küçük harfler altı çizili büyük harfle yazılır (J̲ = j);
    # metne çevirmede alt çizgi kaybolur. İkinci kez geçen büyük harf, küçük harfli karşılığı yoksa
    # ve farklı bir konumdaysa küçük harf sayılır. Aynı konumdaki yineleme (çok sayfalı tabloda aynı
    # satırın iki kez okunması) atılır; farklı konumdaki diğer yinelemeler doğrulama hatasıdır.
    tum_kimlikler = {c['id'] for c in k['kontaklar']}
    tekil = []
    k['dogrulama'] = []
    for c in k['kontaklar']:
        onceki = next((t for t in tekil if t['id'] == c['id']), None)
        if onceki is not None:
            if (onceki['x'], onceki['y']) == (c['x'], c['y']):
                continue
            if c['id'].isupper() and c['id'].lower() not in tum_kimlikler:
                c = {**c, 'id': c['id'].lower()}
                k['bilgi'].append(f'altı çizili {c["id"].upper()} → {c["id"]}')
            else:
                k['dogrulama'].append(f'yinelenen kimlik {c["id"]}')
                continue
        tekil.append(c)
    k['kontaklar'] = tekil
    if not tekil:
        k['dogrulama'].append('konum tablosu yok')
        return
    hata = boyut_ata(k)
    if hata:
        k['dogrulama'].append(hata)
    for i, a in enumerate(tekil):
        for b in tekil[i + 1:]:
            if abs(a['x'] - b['x']) < 0.005 and abs(a['y'] - b['y']) < 0.005:
                k['dogrulama'].append(f'çakışan konum {a["id"]}/{b["id"]}')


def rapor(kayitlar):
    temiz = [k for k in kayitlar.values() if not k['dogrulama'] and not k['uyarilar']]
    print(f'{len(kayitlar)} yerleşim, {sum(len(k["kontaklar"]) for k in kayitlar.values())} kontak; '
          f'{len(temiz)} temiz, {len(kayitlar) - len(temiz)} incelenecek')


if __name__ == '__main__':
    standart, girdi = sys.argv[1], sys.argv[2]
    kayitlar = ayristir(open(girdi, encoding='utf-8').read(), standart)
    rapor(kayitlar)
    if len(sys.argv) > 3:
        json.dump(kayitlar, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
