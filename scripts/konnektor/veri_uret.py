#!/usr/bin/env python3
"""
Konnektör pin tasarım aracının MIL-DTL-38999 yerleşim verisini üretir:

  static/data/konnektor/mil-dtl-38999.json

Kaynak MIL-STD-1560C w/Change 3'tür (ASSIST, quicksearch.dla.mil). Standardın PDF'i depoda
tutulmaz; indirilip metne çevrildikten sonra betik çalıştırılır:

  pdftotext -layout MIL-STD-1560C.pdf std1560.txt
  python3 scripts/konnektor/veri_uret.py std1560.txt

Ayrıştırma `yerlesim_ayristir.py` ile yapılır; otomatik çözülemeyen ya da standardın kendisinde
yazım hatası bulunan yerleşimler `duzeltmeler.json`'daki elle doğrulanmış kayıtlarla tamamlanır.
Doğrulamadan geçemeyen ya da yalnızca MIL-DTL-27599 için geçerli yerleşimler çıktıya alınmaz.
"""
import json
import math
import os
import re
import sys

BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
import yerlesim_ayristir as Y  # noqa: E402

KOK = os.path.normpath(os.path.join(BURASI, '..', '..'))
CIKTI = os.path.join(KOK, 'static', 'data', 'konnektor', 'mil-dtl-38999.json')

# MIL-STD-1560C 5.1c: soket kontak boşluğu çapı (inç, en az); çakışma denetimi için
BOSLUK = {'23-22': .032, '22': .036, '22D': .035, '22M': .036, '20': .049, '16': .071, '12': .103,
          '10': .134, '8': .227}


def kimlik_sirasi(kid):
    """Standarttaki sıra: büyük harfler, küçük harfler, çift harfler (AA, BB…), sonra sayılar."""
    if kid.isdigit():
        return (1, int(kid), '')
    return (0, len(kid), kid)


def duzelt(k, d, kayit):
    if 'konum' in d:
        for kid, (x, y) in d['konum'].items():
            c = next((c for c in k['kontaklar'] if c['id'] == kid), None)
            if c is None:
                k['kontaklar'].append({'id': kid, 'x': x, 'y': y})
                kayit.append(f'{kid} eklendi')
            else:
                c['x'], c['y'] = x, y
                kayit.append(f'{kid} konumu düzeltildi')
    if 'boyut' in d:
        tum = {c['id'] for c in k['kontaklar']}
        atama = {}
        diger = None
        for boyut, liste in d['boyut'].items():
            if liste == 'diger':
                diger = boyut
                continue
            for kid in liste:
                if kid not in tum:
                    raise ValueError(f'{k["kod"]}: düzeltmedeki {kid} tabloda yok')
                atama[kid] = boyut
        for c in k['kontaklar']:
            c['boyut'] = atama.get(c['id'], diger)
            if c['boyut'] is None:
                raise ValueError(f'{k["kod"]}: {c["id"]} için boyut yok')
        kayit.append('boyutlar elle atandı')
    # Elle çözülen yerleşimde ayrıştırıcının boyut/konum hataları geçersizdir; denetim aşağıda yinelenir
    k['dogrulama'] = [h for h in k['dogrulama'] if not h.startswith(('karışık boyut', 'özet', 'çakışan'))]
    dogrulanan = set(d.get('birim', []))
    k['uyarilar'] = [u for u in k['uyarilar'] if u.split(':')[0] not in dogrulanan]


def denetle(k):
    """Boyutu eksik, aynı konumda ya da boşlukları üst üste binen kontakları bildirir."""
    hatalar = []
    ks = k['kontaklar']
    for c in ks:
        if not c.get('boyut'):
            hatalar.append(f'{c["id"]}: boyut yok')
        elif c['boyut'].split()[0] not in BOSLUK:
            hatalar.append(f'{c["id"]}: bilinmeyen boyut {c["boyut"]}')
    for i, a in enumerate(ks):
        for b in ks[i + 1:]:
            mesafe = math.hypot(a['x'] - b['x'], a['y'] - b['y'])
            if mesafe < .005:
                hatalar.append(f'çakışan konum {a["id"]}/{b["id"]}')
            elif a.get('boyut') and b.get('boyut'):
                ra = BOSLUK.get(a['boyut'].split()[0], 0) / 2
                rb = BOSLUK.get(b['boyut'].split()[0], 0) / 2
                if mesafe < ra + rb - .002:
                    hatalar.append(f'boşluklar üst üste {a["id"]}/{b["id"]} ({mesafe:.3f} < {ra + rb:.3f})')
    return hatalar


def uygunluk(notlar):
    """Notlardan: MIL-DTL-38999'da geçerli mi, yeni tasarımda pasif mi, yerine önerilen yerleşim."""
    gecerli, pasif, yerine = True, False, None
    for n in notlar:
        m = re.match(r'Applicable to (.*)', n)
        if m and 'MIL-DTL-38999' not in m.group(1):
            gecerli = False
        if 'Inactive for new design' in n:
            hedef = re.search(r'Inactive for new design for ([^.]*)', n)
            if hedef is None or 'MIL-DTL-38999' in hedef.group(1):
                pasif = True
        y = re.search(r'use arrangement no\. (\d+-\d+)', n)
        if y:
            yerine = y.group(1)
    return gecerli, pasif, yerine


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    metin = open(sys.argv[1], encoding='utf-8').read()
    duzeltmeler = json.load(open(os.path.join(BURASI, 'duzeltmeler.json'), encoding='utf-8'))['1560']
    kayitlar = Y.ayristir(metin, '1560')

    yerlesimler, disarida = [], []
    for kod, k in kayitlar.items():
        d = duzeltmeler.get(kod, {})
        if 'cikar' in d:
            disarida.append((kod, d['cikar']))
            continue
        kayit = []
        if d:
            duzelt(k, d, kayit)
        hatalar = k['dogrulama'] + [f'birim: {u}' for u in k['uyarilar']] + denetle(k)
        if hatalar:
            disarida.append((kod, '; '.join(hatalar)))
            continue
        gecerli, pasif, yerine = uygunluk(k['notlar'])
        if not gecerli:
            disarida.append((kod, 'MIL-DTL-38999 için geçerli değil: ' + '; '.join(k['notlar'])))
            continue
        kontaklar = sorted(k['kontaklar'], key=lambda c: kimlik_sirasi(c['id']))
        y = {
            'kod': kod,
            'govde': int(k['govde_boyutu']),
            'sekil': k['sekil'],
            'k': [[c['id'], round(c['x'], 4), round(c['y'], 4), c['boyut']] for c in kontaklar],
        }
        if pasif:
            y['pasif'] = True
        if yerine:
            y['yerine'] = yerine
        yerlesimler.append(y)

    yerlesimler.sort(key=lambda y: (y['govde'], int(y['kod'].split('-')[1])))
    os.makedirs(os.path.dirname(CIKTI), exist_ok=True)
    with open(CIKTI, 'w', encoding='utf-8') as f:
        json.dump({
            'kaynak': 'MIL-STD-1560C w/Change 3 (3 Şubat 2021)',
            'birim': 'inç',
            'yerlesimler': yerlesimler,
        }, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')

    print(f'{len(yerlesimler)} yerleşim, {sum(len(y["k"]) for y in yerlesimler)} kontak → {os.path.relpath(CIKTI, KOK)}')
    print(f'{len(disarida)} yerleşim dışarıda:')
    for kod, neden in disarida:
        print(f'  {kod}: {neden}')


if __name__ == '__main__':
    main()
