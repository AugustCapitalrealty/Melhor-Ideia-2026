"""Captura telas REAIS do app publicado (Gestão de Contratações), para o vídeo.

Pedido do Guilherme (11/10/2026): "o vídeo tem que usar imagem do script mesmo, real, não simulado".

Como funciona (o mesmo método do YouTube Studio, ver H:\\Meu Drive\\Youtube\\COMECE-AQUI.md):
1. Abrir o Chrome com porta de depuração e um perfil NOVO e separado (o Google recusa depuração no perfil padrão):
     chrome.exe --remote-debugging-port=9222 --user-data-dir=%LOCALAPPDATA%\\chrome-video-contratacoes <url do app>
2. O Guilherme faz o login uma vez nessa janela.
3. Este script CONECTA (nunca lança) o Playwright nesse Chrome, acha o iframe do app, troca de tela chamando aba('<nome>')
   e salva PNG em 1920×1080 com densidade 2 (3840×2160), para o motor poder aproximar sem perder nitidez.

Só lê: não clica em salvar, não grava nada no app.

Uso:  python capturar_telas.py <pasta-de-saida> [tela ...]
      telas: escopos nova mapa consulta fornecedores config   (padrão: todas)
"""
import os, sys, time

sys.path.insert(0, os.path.join(os.environ.get('LOCALAPPDATA', ''), 'curiosidades-pylib'))
from playwright.sync_api import sync_playwright

TELAS = ['escopos', 'nova', 'mapa', 'consulta', 'fornecedores', 'config']


def quadro_do_app(pagina):
    """O app do Apps Script fica em iframes aninhados; o nosso HTML é o que tem a função aba()."""
    for _ in range(60):
        for f in pagina.frames:
            try:
                if f.evaluate("typeof aba === 'function'"):
                    return f
            except Exception:
                pass
        time.sleep(1)
    raise SystemExit('não achei o quadro do app (a função aba não apareceu em 60 s)')


def esperar_quieto(f, seg=2.5):
    """Espera os carregamentos assíncronos (google.script.run) acabarem: sem 'Carregando' na tela."""
    fim = time.time() + 25
    while time.time() < fim:
        try:
            ocupado = f.evaluate("""() => /carregando|aguarde/i.test(document.body.innerText.slice(0, 20000))
                                 && !!document.querySelector('[aria-busy="true"], .carregando:not([hidden]), .spinner:not([hidden])')""")
        except Exception:
            ocupado = False
        if not ocupado:
            break
        time.sleep(0.5)
    time.sleep(seg)


def main():
    saida = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else '.')
    telas = sys.argv[2:] or TELAS
    os.makedirs(saida, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.connect_over_cdp('http://127.0.0.1:9222')
        # logado no domínio, o endereço vira script.google.com/a/macros/capitalrealty.com.br/s/... (11/10/2026)
        pagina = next(p for c in b.contexts for p in c.pages if p.url.startswith('https://script.google.com/') and '/macros/' in p.url)
        cdp = pagina.context.new_cdp_session(pagina)
        cdp.send('Emulation.setDeviceMetricsOverride', {'width': 1920, 'height': 1080, 'deviceScaleFactor': 2, 'mobile': False})
        # o iframe do app (googleusercontent) só aparece para o Playwright se a página carregar depois da conexão (11/10/2026)
        pagina.reload(wait_until='load')
        f = quadro_do_app(pagina)
        esperar_quieto(f)
        for i, t in enumerate(telas, 1):
            f.evaluate(f"aba('{t}')")
            esperar_quieto(f)
            arq = os.path.join(saida, f'T{i:02d}-{t}.png')
            pagina.screenshot(path=arq)
            print('  ', arq, flush=True)
        cdp.send('Emulation.clearDeviceMetricsOverride')


if __name__ == '__main__':
    main()
