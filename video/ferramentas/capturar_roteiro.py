"""Capturas REAIS do app em sequência, para as cenas do vídeo (11/10/2026).

Mesmo método do capturar_telas.py (Chrome com --remote-debugging-port=9222, login feito pelo Guilherme, Playwright conecta).
Só usa funções de LEITURA da interface: aba(), buscar(), abrirMapa(), abrirFichaFornecedor(). Nada é salvo no app.

Uso:  python capturar_roteiro.py <pasta-de-saida>
"""
import os, sys, time

sys.path.insert(0, os.path.join(os.environ.get('LOCALAPPDATA', ''), 'curiosidades-pylib'))
from playwright.sync_api import sync_playwright

# (nome do arquivo, JavaScript a rodar no quadro do app, seletor para rolar até ele ou None)
PASSOS = [
    ('C01-escopos-lista', "aba('escopos')", None),
    ('C02-consulta-inicio', "aba('consulta')", None),
    ('C03-consulta-papel', "buscar('Papel higiênico rolão')", None),
    ('C04-consulta-papel-desce', None, 'rolar:700'),
    ('C05-equalizacoes', "aba('mapa')", None),
    ('C06-mapa-adequacoes', "abrirMapa('EQU-20260909-5AFA')", '#mapa'),
    ('C07-mapa-adequacoes-desce', None, 'rolar:700'),
    ('C08-fornecedores', "aba('fornecedores')", None),
    ('C09-ficha-fabesul', "abrirFichaFornecedor('89.054.050/0006-70')", None),
]


def quadro_do_app(pagina):
    for _ in range(60):
        for f in pagina.frames:
            try:
                if f.evaluate("typeof aba === 'function'"):
                    return f
            except Exception:
                pass
        time.sleep(1)
    raise SystemExit('não achei o quadro do app')


def esperar_carregar(f, extra=1.5):
    """Espera sumir todo aviso de carregamento visível (as telas montam por google.script.run, sem aviso de fim)."""
    fim = time.time() + 45
    js = r"""() => {
      const vis = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      const avisos = [...document.querySelectorAll('.carregando')].filter(vis);
      const texto = /Carregando escopos|carregando…|carregando\.\.\.|cruzando inteligência|montando o comparativo|Buscando histórico/i
                      .test(document.body.innerText);
      return avisos.length === 0 && !texto;
    }"""
    while time.time() < fim:
        try:
            if f.evaluate(js):
                break
        except Exception:
            pass
        time.sleep(0.5)
    else:
        print('   (aviso: ainda carregando depois de 45 s)', flush=True)
    time.sleep(extra)


def main():
    saida = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
    os.makedirs(saida, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.connect_over_cdp('http://127.0.0.1:9222')
        pagina = next(p for c in b.contexts for p in c.pages if p.url.startswith('https://script.google.com/') and '/macros/' in p.url)
        pagina.set_viewport_size({'width': 1920, 'height': 1080})
        pagina.reload(wait_until='load')
        f = quadro_do_app(pagina)
        esperar_carregar(f)
        for nome, js, alvo in PASSOS:
            if js:
                f.evaluate("window.scrollTo(0, 0)")
                f.evaluate(js)
                esperar_carregar(f)
            if alvo and alvo.startswith('rolar:'):
                f.evaluate(f"window.scrollBy(0, {int(alvo[6:])})"); time.sleep(1)
            elif alvo:
                f.evaluate(f"document.querySelector('{alvo}') && document.querySelector('{alvo}').scrollIntoView({{block: 'start'}})")
                f.evaluate("window.scrollBy(0, -80)"); time.sleep(1)
            arq = os.path.join(saida, nome + '.png')
            pagina.screenshot(path=arq)
            print('  ', nome, flush=True)


if __name__ == '__main__':
    main()
