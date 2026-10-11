"""Captura REAL dos documentos que o escopo gerou (Google Slides e planilha do fornecedor), para o vídeo (11/10/2026).

Abre cada endereço numa aba nova do Chrome de depuração (já logado pelo Guilherme), só para ver, e fotografa.
Slides: além do editor, o modo de leitura (/htmlpresent) mostra todos os slides limpos, um embaixo do outro; o script
desce por ele e fotografa cada tela.

Uso:  python capturar_documentos.py <pasta-de-saida> <id do Slides> <id da planilha>
"""
import os, sys, time

sys.path.insert(0, os.path.join(os.environ.get('LOCALAPPDATA', ''), 'curiosidades-pylib'))
from playwright.sync_api import sync_playwright


def main():
    saida, slides, planilha = os.path.abspath(sys.argv[1]), sys.argv[2], sys.argv[3]
    os.makedirs(saida, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.connect_over_cdp('http://127.0.0.1:9222')
        ctx = b.contexts[0]
        p = ctx.new_page()
        p.set_viewport_size({'width': 1920, 'height': 1080})
        try:
            p.goto(f'https://docs.google.com/presentation/d/{slides}/edit', wait_until='load'); time.sleep(7)
            p.screenshot(path=os.path.join(saida, 'D01-slides-editor.png')); print('   D01 editor', flush=True)

            p.goto(f'https://docs.google.com/presentation/d/{slides}/htmlpresent', wait_until='load'); time.sleep(6)
            altura = p.evaluate('document.documentElement.scrollHeight')
            print('   htmlpresent altura', altura, flush=True)
            y, n = 0, 1
            while y < altura and n <= 25:
                p.evaluate(f'window.scrollTo(0, {y})'); time.sleep(1.2)
                p.screenshot(path=os.path.join(saida, f'D{n + 1:02d}-slides-y{y}.png')); print(f'   D{n + 1:02d} y={y}', flush=True)
                y += 1000; n += 1

            p.goto(f'https://docs.google.com/spreadsheets/d/{planilha}/edit', wait_until='load'); time.sleep(7)
            p.screenshot(path=os.path.join(saida, 'D90-planilha-fornecedor.png')); print('   D90 planilha', flush=True)
        finally:
            p.close()


if __name__ == '__main__':
    main()
