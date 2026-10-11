"""Captura REAL de um escopo aberto no app, de cima a baixo, e lista os arquivos que ele gerou (Slides e planilhas).

Pedido do Guilherme (11/10/2026): o vídeo usa telas reais, e "a meta é focada no escopo".
Mesmo método dos outros capturadores (Chrome de depuração com o login dele). Só lê: esAbrirUI() chama apiEscopoAbrir.

Uso:  python capturar_escopo.py <pasta-de-saida> <id do escopo> [prefixo]
"""
import json, os, sys, time

sys.path.insert(0, os.path.join(os.environ.get('LOCALAPPDATA', ''), 'curiosidades-pylib'))
from playwright.sync_api import sync_playwright


def quadro_do_app(pagina):
    pagina.reload(wait_until='load')  # o iframe do app só aparece para o Playwright se a página carregar depois da conexão
    for _ in range(60):
        for f in pagina.frames:
            try:
                if f.evaluate("typeof aba === 'function'"):
                    return f
            except Exception:
                pass
        time.sleep(1)
    raise SystemExit('não achei o quadro do app')


def esperar(f, cond, seg=45):
    fim = time.time() + seg
    while time.time() < fim:
        try:
            if f.evaluate(cond):
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def main():
    saida, ident = os.path.abspath(sys.argv[1]), sys.argv[2]
    pref = sys.argv[3] if len(sys.argv) > 3 else 'E'
    os.makedirs(saida, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.connect_over_cdp('http://127.0.0.1:9222')
        pagina = next(p for c in b.contexts for p in c.pages if p.url.startswith('https://script.google.com/') and '/macros/' in p.url)
        pagina.set_viewport_size({'width': 1920, 'height': 1080})
        f = quadro_do_app(pagina)
        f.evaluate("aba('escopos')")
        esperar(f, "typeof esUI !== 'undefined' && esUI.carregado && !esUI.ocupado")
        time.sleep(1.5)
        f.evaluate(f"esAbrirUI('{ident}')")
        esperar(f, "esUI.dados && !esUI.ocupado && !document.getElementById('es-editor').hidden")
        # fotos do escopo chegam depois (apiEscopoImagem): espera as <img> visíveis terminarem
        esperar(f, "[...document.querySelectorAll('#es-editor img')].filter(i => i.offsetWidth).every(i => i.complete && i.naturalWidth)", 60)
        time.sleep(2)
        altura = f.evaluate("document.documentElement.scrollHeight")
        y, n = 0, 1
        while y < altura and n <= 30:
            f.evaluate(f"window.scrollTo(0, {y})"); time.sleep(0.8)
            pagina.screenshot(path=os.path.join(saida, f'{pref}{n:02d}-y{y}.png'))
            print(f'   {pref}{n:02d} y={y}', flush=True)
            y += 760; n += 1
        info = f.evaluate("({titulo: esUI.dados.titulo, revisao: esUI.revisao, arquivos: esUI.arquivos, planilhas: esUI.planilhas})")
        with open(os.path.join(saida, f'{pref}-arquivos.json'), 'w', encoding='utf-8') as arq:
            json.dump(info, arq, ensure_ascii=False, indent=1)
        print(json.dumps(info, ensure_ascii=False)[:1500])


if __name__ == '__main__':
    main()
