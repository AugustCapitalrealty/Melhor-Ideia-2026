"""Mede um vídeo renderizado com as réguas do motion-video-kit (MOTOR/_referencias/motion-video-kit).

Uso:
  python medir.py ..\\..\\GUILHERME-AUGUST\\longos\\01-atafona      # pega build/render/<projeto>.mp4
  python medir.py caminho\\do\\video.mp4
  python medir.py <video> --limiar 0.35 --max 0.6

Tempo congelado: diferença média de brilho entre quadros seguidos (10 por segundo, 320 px de largura) abaixo do
limiar (0 a 255). Régua do kit, feita para comercial de 30 s: no total até ~1 s a cada 30 s e nenhum trecho parado
acima de 0,6 s (fora o cartão final). Em vídeo narrado a régua é mais frouxa, mas trecho longo parado é abandono.
Volume: EBU R128 (integrado, faixa de variação LRA, pico real). O YouTube toca a -14 LUFS.
O relatório vai para o lado do vídeo: <nome>.medicao.txt
"""
import argparse, os, re, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # 04/10/2026: o console cp1252 quebrava no "≤"
from comum import ffmpeg


def congelado(FF, video, limiar):
    """Lista (t, diferença) a 10 quadros por segundo."""
    r = subprocess.run([FF, '-hide_banner', '-i', video, '-an', '-vf',
                        'fps=10,scale=320:-2,format=gray,tblend=all_mode=difference,signalstats,'
                        'metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    tempos = [float(x) for x in re.findall(r'pts_time:([\d.]+)', r.stderr)]
    difs = [float(x) for x in re.findall(r'YAVG=([\d.]+)', r.stderr)]
    amostras = list(zip(tempos, difs))
    trechos, ini = [], None
    for t, d in amostras + [(amostras[-1][0] + 0.1 if amostras else 0, 999)]:
        if d < limiar and ini is None: ini = t
        elif d >= limiar and ini is not None: trechos.append((ini, t)); ini = None
    return amostras, trechos


def volume(FF, video):
    r = subprocess.run([FF, '-hide_banner', '-i', video, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    e = r.stderr
    if 'Summary:' not in e: return None
    resumo = e[e.rindex('Summary:'):]
    num = lambda rx: float(re.search(rx, resumo).group(1)) if re.search(rx, resumo) else float('nan')
    # volume de curto prazo (janela de 3 s) a cada segundo, para achar buracos de som
    curto = {}
    for t, s in re.findall(r't:\s*([\d.]+)\s+.*?S:\s*(-?[\d.]+|-inf)', e):
        if s != '-inf': curto.setdefault(int(float(t)), float(s))
    return {'I': num(r'I:\s+(-?[\d.]+) LUFS'), 'LRA': num(r'LRA:\s+([\d.]+) LU'),
            'pico': num(r'Peak:\s+(-?[\d.]+|-inf) dBFS'), 'curto': curto}


def mmss(t): return f'{int(t // 60)}:{t % 60:04.1f}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('alvo', help='vídeo .mp4 ou pasta do projeto')
    ap.add_argument('--limiar', type=float, default=0.35, help='diferença média abaixo da qual o quadro conta como parado')
    ap.add_argument('--max', type=float, default=0.6, help='trecho parado acima disto (s) entra na lista')
    a = ap.parse_args()
    video = os.path.abspath(a.alvo)
    if os.path.isdir(video):
        video = os.path.join(video, 'build', 'render', os.path.basename(video) + '.mp4')
    FF = ffmpeg()
    print(f'  medindo {video}…', flush=True)
    amostras, trechos = congelado(FF, video, a.limiar)
    dur = amostras[-1][0] + 0.1 if amostras else 0
    parado = sum(b - x for x, b in trechos)
    longos = sorted([(x, b) for x, b in trechos if b - x > a.max], key=lambda p: p[0] - p[1])
    L = [f'Vídeo: {video}', f'Duração: {mmss(dur)} ({dur:.1f} s)', '',
         '== Tempo congelado (régua do kit: ≤ ~1 s a cada 30 s; nenhum trecho > 0,6 s) ==',
         f'Parado no total: {parado:.1f} s = {100 * parado / max(dur, 0.1):.0f}% do vídeo '
         f'({30 * parado / max(dur, 0.1):.1f} s a cada 30 s)',
         f'Trechos parados acima de {a.max:g} s: {len(longos)} (somam {sum(b - x for x, b in longos):.1f} s)']
    for x, b in longos[:25]:
        L.append(f'  {mmss(x)} → {mmss(b)}  ({b - x:.1f} s)')
    if len(longos) > 25: L.append(f'  … e mais {len(longos) - 25}')
    # 04/10/2026 (qa.py do lemo-wake): "salto" = um instante que muda muito mais que a vizinhança (quadro preto, clarão,
    # mídia que não carregou, troca seca de cena). Pode ser de propósito (corte, carimbo): é lista para olhar, não erro.
    saltos = []
    for i, (t, d) in enumerate(amostras):
        viz = sorted(x for _, x in amostras[max(0, i - 10):i] + amostras[i + 1:i + 11])
        if viz and d > max(25, 6 * viz[len(viz) // 2]): saltos.append((t, d))
    L += ['', '== Saltos (um instante muda muito mais que a vizinhança: olhar se é de propósito) ==',
          f'Saltos: {len(saltos)}' + (' (' + ', '.join(mmss(t) for t, _ in saltos[:15]) + ')' if saltos else '')]
    # o primeiro quadro vira a prévia em muitos lugares (feed de Shorts, Reels): quase vazio = prévia ruim
    pq = subprocess.run([FF, '-hide_banner', '-i', video, '-frames:v', '1', '-vf', 'signalstats,metadata=print', '-f', 'null', '-'],
                        capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
    lo_, hi_ = re.search(r'YLOW=([\d.]+)', pq), re.search(r'YHIGH=([\d.]+)', pq)
    if lo_ and hi_:
        faixa = float(hi_.group(1)) - float(lo_.group(1))
        L.append(f'Primeiro quadro: contraste {faixa:.0f} de 255' + ('  ⚠ quase vazio (pesa em Short/Reels, onde o 1º quadro vira a prévia; longo tem capa própria)' if faixa < 40 else ''))
    v = volume(FF, video)
    L += ['', '== Volume (EBU R128) ==']
    if v is None:
        L.append('sem áudio')
    else:
        L += [f'Integrado: {v["I"]:.1f} LUFS (YouTube toca a -14; kit: -14 enérgico, ~-16 calmo)',
              f'Faixa de variação (LRA): {v["LRA"]:.1f} LU (kit: ≥ ~3 em peça enérgica; 1,5–3 ok em calma)',
              f'Pico real: {v["pico"]:.1f} dBFS (kit: ≤ -1)']
        # 04/10/2026: os 3 primeiros segundos ficam de fora. A janela de curto prazo tem 3 s e ainda está enchendo ali, então
        # todo vídeo acusava "0:00, 0:01, 0:02" (alarme falso: no momentâneo, de 400 ms, o começo está no nível do resto)
        buracos = sorted(s for s, x in v['curto'].items() if x < v['I'] - 12 and s >= 3)
        L.append(f'Segundos com som 12 LU abaixo da média: {len(buracos)}'
                 + (f' (ex.: {", ".join(mmss(s) for s in buracos[:12])})' if buracos else ''))
    txt = '\n'.join(L)
    print(txt)
    rel = os.path.splitext(video)[0] + '.medicao.txt'
    open(rel, 'w', encoding='utf-8').write(txt + '\n')
    print(f'\n  relatório: {rel}')


if __name__ == '__main__':
    main()
