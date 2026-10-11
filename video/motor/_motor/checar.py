"""Diagnóstico rápido: renderiza um quadro por cena e lista os erros de JavaScript de cada uma.

Uso:  python checar.py ../../O-JACARE/longos/01-pontes [--cap N]
"""
import argparse, os, sys
from comum import instalar, tela
from render import servidor, abrir

ap = argparse.ArgumentParser(); ap.add_argument('projeto'); ap.add_argument('--cap', type=int)
a = ap.parse_args()
projeto = os.path.abspath(a.projeto); slug = os.path.basename(projeto)
srv, porta = servidor(projeto)
instalar('playwright')
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch(channel='chrome', headless=True)
    pg = b.new_page(viewport={'width': tela(projeto)[0], 'height': tela(projeto)[1]})
    erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)))
    # 04/10/2026: avisos de palavra-chave que não está na fala da cena (S.w devolve 0,5 s e a animação sai fora de hora)
    avisos = []
    pg.on('console', lambda m: avisos.append(m.text) if m.type == 'warning' and ('não encontrada' in m.text or 'rascunho' in m.text) else None)
    pg.goto(f'http://127.0.0.1:{porta}/{slug}.html?still=0', timeout=120000)
    pg.wait_for_function('document.body.dataset.pronto === "1"', timeout=300000)
    plano = pg.evaluate('window.__plano()')
    print(f"  duração total: {plano['dur']:.1f} s")
    for c in plano['cenas']:
        if a.cap is not None and c['cap'] != a.cap: continue
        for t in (c['a'] + 0.3, (c['a'] + c['b']) / 2, c['b'] - 0.2):
            erros.clear()
            try:
                pg.evaluate('t => window.__quadro(t).then(() => 0)', t)
            except Exception as e:
                erros.append(str(e).splitlines()[0])
            if erros:
                print(f"  ERRO cena {c['id']} em {t:.2f} s: {erros[0][:220]}")
                break
    for a in sorted(set(avisos)):
        print('  AVISO', a)
    print('  checagem terminada')
    b.close()
srv.shutdown()
