"""Converte a mídia do projeto para o formato que o motor usa. Só converte o que mudou.

Uso:  python preparar.py ../../O-JACARE/longos/01-pontes

- vídeos (midia/**/*.mp4|ogv|webm) → 1920×1080, 30 fps, H.264 com um quadro-chave por quadro (-g 1).
  Assim o navegador posiciona o vídeo em qualquer instante na hora, o que a renderização quadro a quadro exige.
  Vídeos longos são cortados nos primeiros LIMITE segundos.
- som dos vídeos que têm áudio → .m4a separado (o som ambiente do Veo entra na mixagem).
- fotos (jpg, png, tif) → jpg com no máximo 3840 px de largura (o Chrome não abre tif); PNG com transparência fica PNG.

Tudo vai para %LOCALAPPDATA%/longos-cache/<projeto>/, com o nome original do arquivo.
"""
import glob, json, os, subprocess, sys
from comum import cache, ffmpeg, instalar

LIMITE = 40  # segundos


def main(projeto):
    projeto = os.path.abspath(projeto)
    out = cache(projeto)
    FF = ffmpeg()
    instalar('PIL', 'pillow'); from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    manifesto = {}
    for f in sorted(glob.glob(os.path.join(projeto, 'midia', '**', '*'), recursive=True)):
        if os.path.isdir(f) or os.path.getsize(f) == 0:
            continue
        nome, ext = os.path.splitext(os.path.basename(f))
        ext = ext.lower()
        mt = os.path.getmtime(f)
        if ext in ('.mp4', '.ogv', '.webm', '.mov'):
            dst = os.path.join(out, nome + '.mp4')
            info = subprocess.run([FF, '-i', f], capture_output=True, text=True).stderr
            tem_audio = 'Audio:' in info
            if not os.path.exists(dst) or os.path.getmtime(dst) < mt:
                print(f'  vídeo  {nome}', flush=True)
                subprocess.run([FF, '-loglevel', 'error', '-y', '-i', f, '-t', str(LIMITE), '-an',
                                '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30',
                                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-g', '1', '-pix_fmt', 'yuv420p',
                                '-movflags', '+faststart', dst], check=True)
            if tem_audio:
                adst = os.path.join(out, nome + '.m4a')
                if not os.path.exists(adst) or os.path.getmtime(adst) < mt:
                    subprocess.run([FF, '-loglevel', 'error', '-y', '-i', f, '-t', str(LIMITE), '-vn',
                                    '-c:a', 'aac', '-b:a', '160k', adst], check=True)
            dur = float(subprocess.run([FF, '-i', dst], capture_output=True, text=True).stderr
                        .split('Duration: ')[1].split(',')[0].split(':')[-1]) if os.path.exists(dst) else 0
            manifesto[nome] = {'tipo': 'video', 'arq': nome + '.mp4', 'dur': round(dur, 2),
                               'audio': (nome + '.m4a') if tem_audio else None}
        elif ext in ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'):  # webp: fotos da Commons (01/10/2026)
            # 04/10/2026: PNG com transparência (as peças do pecas.py) continua PNG, senão perde o recorte
            alfa = ext == '.png' and Image.open(f).mode in ('RGBA', 'LA', 'PA')
            dst = os.path.join(out, nome + ('.png' if alfa else '.jpg'))
            if not os.path.exists(dst) or os.path.getmtime(dst) < mt:
                print(f'  foto   {nome}', flush=True)
                im = Image.open(f).convert('RGBA' if alfa else 'RGB')
                if im.width > 3840:
                    im = im.resize((3840, round(im.height * 3840 / im.width)), Image.LANCZOS)
                im.save(dst, quality=92) if not alfa else im.save(dst)
            w, h = Image.open(dst).size
            manifesto[nome] = {'tipo': 'foto', 'arq': os.path.basename(dst), 'w': w, 'h': h}
    json.dump(manifesto, open(os.path.join(out, 'manifesto.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'  {len(manifesto)} itens em {out}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'O-JACARE', 'longos', '01-pontes'))
