"""Grade de revisão (03/10/2026): abre o vídeo uma vez e tira quadros grandes nos tempos pedidos, em colunas de 3.
Mais legível que a folha (5 quadros pequenos por linha) para conferir texto, posição e corte.

Uso:  python revisar.py ../../SHORTS-PAPEL/08-camelo 0.5,8.5,12,24.5      → build/revisao/grade.png
      python revisar.py <projeto> auto        (2 quadros por cena: no meio e perto do fim)
      --nome grade2   --largura 540 (largura de cada quadro na grade)
"""
import argparse, os
from comum import instalar
from render import servidor, abrir, tela


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('projeto'); ap.add_argument('tempos')
    ap.add_argument('--nome', default='grade'); ap.add_argument('--largura', type=int, default=540)
    a = ap.parse_args()
    projeto = os.path.abspath(a.projeto); slug = os.path.basename(projeto)
    srv, porta = servidor(projeto)
    instalar('playwright'); from playwright.sync_api import sync_playwright
    from PIL import Image, ImageDraw
    dst = os.path.join(projeto, 'build', 'revisao'); os.makedirs(dst, exist_ok=True)
    quadros = []
    with sync_playwright() as pw:
        b, pg = abrir(pw, f'http://127.0.0.1:{porta}/{slug}.html?still=0', tela(projeto))
        if a.tempos == 'auto':
            plano = pg.evaluate('window.__plano()')
            ts = []
            for c in plano.get('cenas', []):
                ts += [round(c['a'] + (c['b'] - c['a']) * 0.45, 2), round(c['b'] - 0.9, 2)]
        else:
            ts = [float(x) for x in a.tempos.split(',')]
        for t in ts:
            pg.evaluate('async t => { await window.__quadro(t); }', t)
            f = os.path.join(dst, f'_q{t:.2f}.png'); pg.locator('#cv').screenshot(path=f); quadros.append((t, f))
        b.close()
    W0, H0 = tela(projeto); w = a.largura; h = int(w * H0 / W0); col = 3
    lin = (len(quadros) + col - 1) // col
    grade = Image.new('RGB', (col * w + (col - 1) * 8, lin * h + (lin - 1) * 8), (20, 20, 20))
    for i, (t, f) in enumerate(quadros):
        im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS); d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 92, 30], fill=(0, 0, 0)); d.text((8, 8), f'{t:.2f}s', fill=(255, 255, 255))
        grade.paste(im, ((i % col) * (w + 8), (i // col) * (h + 8))); os.remove(f)
    out = os.path.join(dst, f'{a.nome}.png'); grade.save(out); print('  grade:', out)


if __name__ == '__main__':
    main()
