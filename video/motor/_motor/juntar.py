"""Junta os capítulos renderizados em paralelo (render.py --cap N) num vídeo só e mixa o áudio do vídeo inteiro de uma vez.

Uso:  python juntar.py ../../O-JACARE/longos/03-senna-tower

Por quê (03/10/2026): renderizar os capítulos em paralelo (um processo por capítulo) corta o tempo de render, mas cada
capítulo sai com a sua mixagem, e a cama de ambiente e a trilha "respiravam" em cada emenda. Aqui a imagem dos capítulos é
emendada sem recodificar (mesmo codificador e parâmetros) e o áudio é refeito para a linha do tempo inteira (mixar do render.py).
Saída: build/render/<projeto>.mp4
"""
import glob, json, os, re, subprocess, sys
from comum import cache, ffmpeg, instalar
from render import servidor, abrir, mixar


def main(projeto):
    projeto = os.path.abspath(projeto); slug = os.path.basename(projeto)
    out = os.path.join(projeto, 'build', 'render'); FF = ffmpeg()
    caps = sorted(glob.glob(os.path.join(out, f'{slug}-cap*.mp4')), key=lambda f: int(re.search(r'-cap(\d+)\.mp4$', f).group(1)))
    if not caps: sys.exit('nenhum capítulo renderizado (render.py --cap N)')
    lista = os.path.join(out, '_capitulos.txt')
    open(lista, 'w', encoding='utf-8').write(''.join(f"file '{f.replace(os.sep, '/')}'\n" for f in caps))
    so_video = os.path.join(out, f'{slug}.video.mp4')
    subprocess.run([FF, '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-map', '0:v', '-c', 'copy', so_video], check=True)
    print(f'  {len(caps)} capítulos emendados', flush=True)
    man = json.load(open(os.path.join(cache(projeto), 'manifesto.json'), encoding='utf-8'))
    srv, porta = servidor(projeto)
    instalar('playwright')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b, pg = abrir(pw, f'http://127.0.0.1:{porta}/{slug}.html', (1920, 1080))
        plano = pg.evaluate('window.__plano()')
        n = int(round(plano['dur'] * 30))
        if any(m.get('audio') for m in man.values()):  # só precisa saber quais vídeos aparecem se algum vídeo tem som
            usos = pg.evaluate('''n => { const out = [];
              for (let q = 0; q < n; q++) { COLETA = []; render(q / 30); out.push(COLETA); } COLETA = null; return out; }''', n)
        else:
            usos = [[] for _ in range(n)]
        b.close()
    wav = os.path.join(out, f'{slug}.audio.wav')
    print('  mixando o áudio do vídeo inteiro…', flush=True)
    mixar(projeto, plano, usos, 0.0, plano['dur'], man, wav)
    final = os.path.join(out, f'{slug}.mp4')
    subprocess.run([FF, '-loglevel', 'error', '-y', '-i', so_video, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final], check=True)
    for f in (so_video, wav, wav + '.filtro.txt', lista):
        try: os.remove(f)
        except OSError: pass
    print(f'  pronto: {final}')
    srv.shutdown()


if __name__ == '__main__':
    main(sys.argv[1])
