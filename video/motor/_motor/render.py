"""Renderiza o vídeo longo quadro a quadro e mixa o áudio.

Uso:
  python render.py ../../O-JACARE/longos/01-pontes                 # vídeo inteiro
  python render.py ../../O-JACARE/longos/01-pontes --cap 0         # só um capítulo (para revisar)
  python render.py ../../O-JACARE/longos/01-pontes --de 30 --ate 45
  python render.py ../../O-JACARE/longos/01-pontes --folha 0       # folha de contato de um capítulo (PNG)
  python render.py ../../O-JACARE/longos/01-pontes --still 12.5    # um quadro (PNG)

Precisa do Chrome instalado (o Chromium do Playwright não decodifica H.264).
Saída em <projeto>/build/render/.
"""
import argparse, base64, http.server, json, os, re, socketserver, subprocess, sys, threading, time
from comum import AQUI, cache, ffmpeg, instalar, tela

RAIZ_YT = os.path.abspath(os.path.join(AQUI, '..', '..'))  # H:\Meu Drive\Youtube


def servidor(projeto):
    rotas = {'/cache/': cache(projeto), '/audio/': os.path.join(projeto, 'build', 'audio'),
             '/musicas/': os.path.join(RAIZ_YT, 'MUSICAS'), '/': os.path.join(projeto, 'build')}

    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass

        def translate_path(self, path):
            from urllib.parse import unquote
            path = unquote(path.split('?')[0])
            for pre, dirp in rotas.items():
                if path.startswith(pre):
                    return os.path.join(dirp, *path[len(pre):].split('/'))
            return ''

        def send_head(self):  # com suporte a Range, que o <video> usa para posicionar
            p = self.translate_path(self.path)
            if not os.path.isfile(p):
                self.send_error(404); return None
            size = os.path.getsize(p); ctype = self.guess_type(p)
            rng = self.headers.get('Range')
            f = open(p, 'rb')
            if rng:
                m = re.match(r'bytes=(\d*)-(\d*)', rng)
                a = int(m.group(1)) if m.group(1) else 0
                b = int(m.group(2)) if m.group(2) else size - 1
                b = min(b, size - 1)
                self.send_response(206)
                self.send_header('Content-Range', f'bytes {a}-{b}/{size}')
                self.send_header('Content-Length', str(b - a + 1))
                f.seek(a); self._resto = b - a + 1
            else:
                self.send_response(200); self.send_header('Content-Length', str(size)); self._resto = size
            self.send_header('Content-Type', ctype); self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()
            return f

        def copyfile(self, src, dst):
            n = self._resto
            while n > 0:
                buf = src.read(min(1 << 20, n))
                if not buf: break
                try: dst.write(buf)
                except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError): break
                n -= len(buf)

    class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
    srv = S(('127.0.0.1', 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, srv.server_address[1]


def abrir(pw, url, tam=(1920, 1080)):
    b = pw.chromium.launch(channel='chrome', headless=True, args=['--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(viewport={'width': tam[0], 'height': tam[1]}, device_scale_factor=1)
    pg.on('console', lambda m: m.type in ('error', 'warning') and print('  [página]', m.text[:200]))
    pg.goto(url, timeout=120000)
    pg.wait_for_function('document.body.dataset.pronto === "1"', timeout=600000)
    return b, pg


def mixar(projeto, plano, usos_por_quadro, de, ate, man, wav):
    FF = ffmpeg(); c = cache(projeto)
    ent, filtros, nar, mus, amb = [], [], [], [], []
    dur = ate - de

    def inp(args):
        ent.extend(args); return sum(1 for x in ent if x == '-i') - 1
    for n in plano['narracao']:
        if n['t'] > ate or n['t'] < de - 30: continue
        i = inp(['-i', os.path.join(projeto, 'build', 'audio', n['arq'])])
        ms = max(0, int((n['t'] - de) * 1000))
        corte = f'atrim=start={de - n["t"]:.3f},asetpts=PTS-STARTPTS,' if n['t'] < de else ''
        filtros.append(f'[{i}:a]{corte}aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[n{i}]'); nar.append(f'[n{i}]')
    for m in plano['trilha']:
        t0, t1 = max(m['t0'], de), min(m['t1'], ate)
        if t1 <= t0: continue
        off = m.get('off', 0) + (t0 - m['t0'])
        # 03/10/2026: "pasta": "sons" = cama de ambiente em loop (_motor/sons/), mixada como a trilha (abaixa debaixo da voz)
        pasta = os.path.join(AQUI, 'sons') if m.get('pasta') == 'sons' else os.path.join(RAIZ_YT, 'MUSICAS')
        # 05/10/2026 (aplicada a correção do MOTOR/README, "Avisos do log do render"): com -ss antes de -stream_loop, o ffmpeg 7.1
        # voltava para o meio da música no loop (bs02 caps 1, 5, 9; bs03 caps 1, 5). Agora lê do começo off+dur e corta o off no filtro.
        i = inp(['-stream_loop', '-1', '-t', f'{off + t1 - t0:.3f}', '-i', os.path.join(pasta, m['arq'])])
        ms = int((t0 - de) * 1000)
        fi = m.get('fadeIn', 1.5) if t0 == m['t0'] else 0.3
        filtros.append(f'[{i}:a]atrim=start={off:.3f},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume={m.get("vol", 0.18)},'
                       f'afade=t=in:d={fi},afade=t=out:st={max(0, t1 - t0 - 2):.3f}:d=2,adelay={ms}|{ms}[m{i}]'); mus.append(f'[m{i}]')
    # som ambiente dos vídeos: trechos contínuos em que cada vídeo com áudio aparece
    trechos = {}
    for q, usos in enumerate(usos_por_quadro):
        t = de + q / 30
        for nome, tl in {u[0]: u[1] for u in usos}.items():
            if not man[nome].get('audio'): continue
            tr = trechos.setdefault(nome, [])
            if tr and abs(tr[-1]['t1'] - t) < 0.05 and abs(tr[-1]['tl1'] + 1 / 30 - tl) < 0.2:
                tr[-1]['t1'] = t + 1 / 30; tr[-1]['tl1'] = tl
            else:
                tr.append({'t0': t, 't1': t + 1 / 30, 'tl0': tl, 'tl1': tl})
    for nome, lst in trechos.items():
        for tr in lst:
            if tr['t1'] - tr['t0'] < 0.3: continue
            i = inp(['-ss', f"{tr['tl0']:.3f}", '-t', f"{tr['t1'] - tr['t0']:.3f}", '-i', os.path.join(c, man[nome]['audio'])])
            ms = int((tr['t0'] - de) * 1000)
            filtros.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.32,afade=t=in:d=0.25,'
                           f'afade=t=out:st={max(0, tr["t1"] - tr["t0"] - 0.3):.3f}:d=0.3,adelay={ms}|{ms}[a{i}]'); amb.append(f'[a{i}]')
    sfx = []
    for e in plano.get('efeitos', []):  # sonoplastia
        if e['t'] < de - 3 or e['t'] > ate: continue
        # 01/10/2026 (Guilherme: "o pessoal reclama, parece um chiado alto; troca por algo mais suave"): os sons agudos
        # (papel, rabisco, tick, máquina…) tocam na versão _suave (passa-baixa 2,5 kHz, −4 dB, cauda curta), se existir
        suave = os.path.join(AQUI, 'sons', e['som'] + '_suave.wav')
        arq = suave if os.path.exists(suave) else os.path.join(AQUI, 'sons', e['som'] + '.wav')
        if not os.path.exists(arq): print(f"  [aviso] som '{e['som']}' não existe em _motor/sons/"); continue
        i = inp(['-i', arq]); ms = max(0, int((e['t'] - de) * 1000))
        corte = f'atrim=start={de - e["t"]:.3f},asetpts=PTS-STARTPTS,' if e['t'] < de else ''
        v = e.get('vol', 1) * plano.get('volEfeitos', 0.12); pn = e.get('pan', 0)
        # passa-baixa em 6,5 kHz (30/09/2026, Guilherme: "tipo um chiado alto"): papel, rabisco e tick tinham 49–60% da
        # energia acima de 6 kHz (medido com a régua do motion-video-kit, ver _referencias/LEIA-ME.md §3)
        filtros.append(f'[{i}:a]{corte}aresample=48000,aformat=channel_layouts=stereo,lowpass=f=6500:p=2,volume={v:.3f},'
                       f'pan=stereo|c0={min(1, 1 - pn):.2f}*c0|c1={min(1, 1 + pn):.2f}*c1,adelay={ms}|{ms}[s{i}]'); sfx.append(f'[s{i}]')
    sil = inp(['-f', 'lavfi', '-t', f'{dur:.3f}', '-i', 'anullsrc=r=48000:cl=stereo'])
    base = f'[{sil}:a]'

    def bus(lista, nome):
        filtros.append(f'{base}{"".join(lista)}amix=inputs={len(lista) + 1}:normalize=0:duration=first[{nome}]')
    bus(nar, 'NAR'); bus(mus, 'MUS'); bus(amb, 'AMB'); bus(sfx, 'SFX')
    # 05/10/2026: silêncios de virada (cena declara silencio: S => [[t0, t1]]): trilha e efeitos caem a 6% na janela,
    # com rampa de 0,15 s na entrada e 0,2 s na saída; a voz não muda
    # [t0, t1, rampa] (rampa de saída opcional, 0,2 s; 05/10: 0,05 antes do carimbo, para o vazio ir até o baque sem abafá-lo)
    jan = [(j[0] - de, j[1] - de, j[2] if len(j) > 2 else 0.2) for j in plano.get('silencios', []) if j[1] > de and j[0] < ate]
    mus_b, sfx_b = 'MUS', 'SFX'
    if jan:
        g = '*'.join(f'(1-0.94*clip((t-({a:.3f}-0.15))/0.15,0,1)*clip(({b:.3f}+{r:.3f}-t)/{r:.3f},0,1))' for a, b, r in jan)
        filtros.append(f"[MUS]volume='{g}':eval=frame[MUSq]"); filtros.append(f"[SFX]volume='{g}':eval=frame[SFXq]")
        mus_b, sfx_b = 'MUSq', 'SFXq'
    filtros.append('[NAR]asplit=2[NARa][NARsc]')
    filtros.append(f'[{mus_b}][NARsc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=600:makeup=1[MUSd]')
    filtros.append(f'[NARa][MUSd][AMB][{sfx_b}]amix=inputs=4:normalize=0:duration=first[OUT]')
    script = wav + '.filtro.txt'
    open(script, 'w', encoding='utf-8').write(';\n'.join(filtros))
    bruto = wav + '.bruto.wav'  # float: o que passar de 0 dBFS não corta antes do ganho
    # 08/10/2026 (Kaffee, 514 entradas): com os caminhos inteiros o comando passou do limite do Windows (32.767 caracteres,
    # WinError 206). O ffmpeg roda dentro de _motor/sons e as entradas do mesmo disco vão como caminho relativo; o som não muda.
    pasta_sons = os.path.join(AQUI, 'sons')
    def curto(x):
        if not os.path.isabs(x): return x
        try: return os.path.relpath(x, pasta_sons)
        except ValueError: return x  # outro disco (o cache fica no C:)
    ent = [curto(x) if k and ent[k - 1] == '-i' else x for k, x in enumerate(ent)]
    subprocess.run([FF, '-loglevel', 'error', '-y', *ent, '-filter_complex_script', script, '-map', '[OUT]',
                    '-ar', '48000', '-t', f'{dur:.3f}', '-c:a', 'pcm_f32le', bruto], check=True, cwd=pasta_sons)
    nivelar(FF, bruto, wav)
    os.remove(bruto)


# 04/10/2026 (estudo do ffmpeg-skill, _referencias/FFMPEG-SKILL.md): o volume final era um loudnorm de uma passada, que no modo
# dinâmico mexe no ganho ao longo do vídeo e enche as pausas planejadas (o mesmo defeito corrigido no locucao.py em 01/10).
# Agora são duas passadas: mede a mixagem pronta e aplica UM ganho fixo; o limitador só segura os picos que passariam do teto.
ALVO_LUFS, TETO_DB = -15.0, -2.0  # teto 1 dB abaixo do −1 dBTP das plataformas: o AAC passa um pouco do pico depois


def volume_medido(FF, arq):
    """(integrado em LUFS, pico real em dBTP) pelo EBU R128."""
    e = subprocess.run([FF, '-hide_banner', '-nostats', '-i', arq, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    resumo = e[e.rindex('Summary:'):]
    return (float(re.search(r'I:\s+(-?[\d.]+|-inf) LUFS', resumo).group(1)),
            float(re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', resumo).group(1)))


def nivelar(FF, bruto, wav):
    I, pico = volume_medido(FF, bruto)
    ganho = ALVO_LUFS - I if I > -60 else 0.0  # mixagem quase muda: não levanta o ruído
    subprocess.run([FF, '-loglevel', 'error', '-y', '-i', bruto, '-af',
                    f'volume={ganho:.2f}dB,alimiter=limit={10 ** (TETO_DB / 20):.4f}:attack=5:release=50:level=disabled:latency=1',
                    '-c:a', 'pcm_s16le', wav], check=True)
    I2, pico2 = volume_medido(FF, wav)
    print(f'  volume: mixagem {I:.1f} LUFS, ganho fixo {ganho:+.1f} dB = {I2:.1f} LUFS, pico real {pico2:.1f} dBTP'
          f' (o limitador segurou até {max(0.0, pico + ganho - TETO_DB):.1f} dB nos picos)', flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('projeto'); ap.add_argument('--cap', type=int); ap.add_argument('--de', type=float)
    ap.add_argument('--ate', type=float); ap.add_argument('--folha', type=int); ap.add_argument('--still', type=float)
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--tempos', help='com --folha: tempos escolhidos, ex. 0.2,3,5.5 (em vez de 3 por cena)')
    ap.add_argument('--remixar', action='store_true', help='refaz só o áudio de um MP4 já renderizado (trilha ou sonoplastia nova); aceita --cap')
    a = ap.parse_args()
    projeto = os.path.abspath(a.projeto); slug = os.path.basename(projeto)
    out_dir = os.path.join(projeto, 'build', 'render'); os.makedirs(out_dir, exist_ok=True)
    man = json.load(open(os.path.join(cache(projeto), 'manifesto.json'), encoding='utf-8'))
    srv, porta = servidor(projeto)
    base = f'http://127.0.0.1:{porta}/{slug}.html'
    pw_mod = instalar('playwright')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        if a.folha is not None:
            b, pg = abrir(pw, f'{base}?sheet={a.tempos}' if a.tempos else f'{base}?sheet=auto&cap={a.folha}', (1920, 1080))
            dst = os.path.join(projeto, 'build', 'revisao'); os.makedirs(dst, exist_ok=True)
            f = os.path.join(dst, f'folha-cap{a.folha}.png')
            pg.locator('#sheet').screenshot(path=f); print('  folha:', f); b.close(); return
        if a.still is not None:
            b, pg = abrir(pw, f'{base}?still={a.still}', tela(projeto))
            dst = os.path.join(projeto, 'build', 'revisao'); os.makedirs(dst, exist_ok=True)
            f = os.path.join(dst, f'still-{a.still:.2f}.png')
            pg.locator('#cv').screenshot(path=f); print('  quadro:', f); b.close(); return
        b, pg = abrir(pw, base, tela(projeto))
        plano = pg.evaluate('window.__plano()')
        de, ate, nome = 0.0, plano['dur'], slug
        if a.cap is not None:
            c = next(x for x in plano['caps'] if x['n'] == a.cap); de, ate, nome = c['a'], c['b'], f'{slug}-cap{a.cap}'
        if a.de is not None: de = a.de; nome = f'{slug}-{a.de:g}s'
        if a.ate is not None: ate = a.ate
        if a.remixar:  # só o áudio (ex.: sonoplastia nova): recalcula quais vídeos aparecem em cada quadro e remixa
            mp4 = os.path.join(out_dir, nome + '.mp4')
            n = int(round((ate - de) * a.fps))
            usos_por_quadro = pg.evaluate('''([de, n]) => { const out = [];
              for (let q = 0; q < n; q++) { COLETA = []; render(de + q / 30); out.push(COLETA); } COLETA = null; return out; }''', [de, n])
            b.close()
            wav = mp4 + '.wav'; novo = mp4 + '.novo.mp4'; FF = ffmpeg()
            print(f'  mixando o áudio de {nome}…', flush=True)
            mixar(projeto, plano, usos_por_quadro, de, ate, man, wav)
            subprocess.run([FF, '-loglevel', 'error', '-y', '-i', mp4, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                            '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', novo], check=True)
            os.replace(novo, mp4)
            for f in (wav, wav + '.filtro.txt'):
                try: os.remove(f)
                except OSError: pass
            print(f'  áudio refeito: {mp4}'); srv.shutdown(); return
        n = int(round((ate - de) * a.fps))
        mp4 = os.path.join(out_dir, nome + '.mp4'); tmp_v = mp4 + '.video.mp4'; wav = mp4 + '.wav'
        print(f'  {nome}: {de:.2f}–{ate:.2f} s, {n} quadros', flush=True)
        FF = ffmpeg()
        enc = subprocess.Popen([FF, '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(a.fps), '-c:v', 'mjpeg',
                                '-i', '-', '-vf', 'colorspace=all=bt709:iall=bt601-6-625:irange=pc:range=tv:format=yuv420p',
                                '-color_range', 'tv', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
                                '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709', tmp_v],
                               stdin=subprocess.PIPE)
        # JPEG vem em faixa "cheia" e na matriz BT.601: converte para a faixa de vídeo e para o BT.709 do HD, e marca o BT.709
        # (04/10/2026; antes saía BT.601 e quem ignorasse a marca via o vermelho da marca mais alaranjado). A marca vai pelo
        # -x264-params porque no ffmpeg 7.1 o -colorspace também converte os pixels (ver _referencias/FFMPEG-SKILL.md).
        # Sem os flags de precisão a conversão escurecia ~2 níveis de 255 (medido contra o quadro do Chrome; com eles, igual ao antigo).
        # 04/10/2026 (noite): o scale com os flags de precisão roda num núcleo só e travava o render em ~17 q/s (o Chrome entrega ~28).
        # O filtro colorspace faz a mesma conversão em vários núcleos, com a mesma cor (diferença média +0,02 nível, máx. 2):
        # longo 10,7 → 16,9 q/s. Medido com medir_velocidade.py; versão anterior em _render-antes-colorspace.py.bak.
        # 04/10/2026, 23h (aprovado pelo Guilherme): preset veryfast em vez de medium; papel 11,1 → 14,2 q/s, longo 16,9 → 17,3 q/s
        # (crf 18 mantido). Versão anterior em _render-antes-veryfast.py.bak.
        usos_por_quadro = []; t_ini = time.time()
        for q in range(n):
            r = pg.evaluate('t => window.__quadro(t)', de + q / a.fps)
            usos_por_quadro.append(r['usos'])
            enc.stdin.write(base64.b64decode(r['img'].split(',', 1)[1]))
            if q % 150 == 0 and q:
                vel = q / (time.time() - t_ini)
                print(f'  {q}/{n} quadros · {vel:.1f} q/s · faltam ~{(n - q) / vel / 60:.1f} min', flush=True)
        enc.stdin.close(); enc.wait(); b.close()
    print('  mixando o áudio…', flush=True)
    mixar(projeto, plano, usos_por_quadro, de, ate, man, wav)
    subprocess.run([FF, '-loglevel', 'error', '-y', '-i', tmp_v, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-shortest', '-movflags', '+faststart', mp4], check=True)
    for f in (tmp_v, wav, wav + '.filtro.txt'):
        try: os.remove(f)
        except OSError: pass
    print(f'  pronto: {mp4} ({(time.time() - t_ini) / 60:.1f} min)')
    srv.shutdown()


if __name__ == '__main__':
    main()
