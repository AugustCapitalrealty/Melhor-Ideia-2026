"""Confere se o MP4 pronto está dentro do que o YouTube, o Instagram e o TikTok pedem (04/10/2026).

Uso:
  python conferir.py ..\\..\\SHORTS-PAPEL\\08-camelo      # pega build/render/<projeto>.mp4
  python conferir.py caminho\\do\\video.mp4

Portado do check.py do ffmpeg-skill (ver _referencias/FFMPEG-SKILL.md), só com o que vale para os nossos vídeos.
FALHA = não publicar assim (o pronto.py recusa). AVISO = dá para publicar, mas vale saber.
Cada linha diz o que foi medido. Usa só o ffmpeg do motor (não precisa de ffprobe).
"""
import os, re, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from comum import ffmpeg

LUFS_ALVO, LUFS_TOL, PICO_MAX = -14.0, 2.0, -1.0  # o que as três plataformas usam (−14 LUFS ±2, pico real ≤ −1 dBTP)
SHORTS_MAX_S = 180


def medir(video):
    FF = ffmpeg()
    info = subprocess.run([FF, '-hide_banner', '-i', video], capture_output=True, text=True,
                          encoding='utf-8', errors='replace').stderr
    v = re.search(r'Stream #\S+.*?Video: (\w+).*?, (\w+)(\(([^)]*)\))?, (\d+)x(\d+).*?, ([\d.]+) fps', info)
    a = re.search(r'Stream #\S+.*?Audio: (\w+).*?, (\d+) Hz, ([\w.()]+)', info)
    d = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
    m = {'dur': int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else 0.0}
    if v:
        m.update(codec=v.group(1), pix=v.group(2), cor=v.group(4) or '', w=int(v.group(5)), h=int(v.group(6)),
                 fps=float(v.group(7)))
    if a:
        m.update(acodec=a.group(1), hz=int(a.group(2)), canais=a.group(3))
        e = subprocess.run([FF, '-hide_banner', '-nostats', '-i', video, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                           capture_output=True, text=True, encoding='utf-8', errors='replace').stderr
        if 'Summary:' in e:
            r = e[e.rindex('Summary:'):]
            m['lufs'] = float(re.search(r'I:\s+(-?[\d.]+|-inf) LUFS', r).group(1))
            m['pico'] = float(re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', r).group(1))
    return m


def conferir(video):
    """Lista de (nível, item, detalhe), nível em 'OK', 'AVISO', 'FALHA'."""
    m = medir(video); L = []
    if 'codec' not in m:
        return [('FALHA', 'vídeo', 'o arquivo não tem imagem (ou não abriu)')]
    vertical = m['h'] > m['w']
    L.append(('OK' if m['codec'] == 'h264' else 'FALHA', 'codificação', m['codec']))
    L.append(('OK' if m['pix'] == 'yuv420p' else 'FALHA', 'formato de pixel', m['pix']))
    certo = (1080, 1920) if vertical else (1920, 1080)
    L.append(('OK' if (m['w'], m['h']) == certo else 'FALHA', 'tamanho', f"{m['w']}×{m['h']} (esperado {certo[0]}×{certo[1]})"))
    df = abs(m['fps'] - 30)
    L.append(('OK' if df <= 0.05 else 'AVISO' if df <= 0.5 else 'FALHA', 'quadros por segundo', f"{m['fps']:g}"))
    if vertical:
        L.append(('OK' if m['dur'] <= SHORTS_MAX_S else 'FALHA', 'duração',
                  f"{m['dur']:.1f} s (Shorts: até {SHORTS_MAX_S} s)"))
    else:
        L.append(('OK' if m['dur'] > 0 else 'FALHA', 'duração', f"{m['dur']:.1f} s"))
    L.append(('OK' if 'bt709' in m['cor'] else 'AVISO', 'cor',
              (m['cor'] or 'sem marca') + ('' if 'bt709' in m['cor'] else ' (renderizado antes de 04/10/2026: BT.601; o certo é BT.709)')))
    if 'acodec' not in m:
        L.append(('FALHA', 'áudio', 'o vídeo não tem som'))
        return L
    L.append(('OK' if m['acodec'] == 'aac' else 'FALHA', 'áudio', f"{m['acodec']}, {m['hz']} Hz, {m['canais']}"))
    if 'lufs' in m:
        L.append(('OK' if abs(m['lufs'] - LUFS_ALVO) <= LUFS_TOL else 'FALHA', 'volume',
                  f"{m['lufs']:.1f} LUFS (plataformas: {LUFS_ALVO:g} ±{LUFS_TOL:g})"))
        L.append(('OK' if m['pico'] <= PICO_MAX + 0.1 else 'FALHA', 'pico real', f"{m['pico']:.1f} dBTP (máximo {PICO_MAX:g})"))
    return L


def imprimir(video, L):
    print(f'  conferência de entrega: {os.path.basename(video)}')
    for nivel, item, det in L:
        print(f'    {nivel:5} {item}: {det}')
    n = sum(1 for x in L if x[0] == 'FALHA')
    print(f'  resultado: {"REPROVADO, " + str(n) + " falha(s)" if n else "aprovado"}', flush=True)
    return n == 0


def alvo_mp4(alvo):
    alvo = os.path.abspath(alvo)
    return os.path.join(alvo, 'build', 'render', os.path.basename(alvo) + '.mp4') if os.path.isdir(alvo) else alvo


if __name__ == '__main__':
    if len(sys.argv) < 2: sys.exit(__doc__)
    video = alvo_mp4(sys.argv[1])
    if not os.path.exists(video): sys.exit(f'não achei {video}')
    sys.exit(0 if imprimir(video, conferir(video)) else 1)
