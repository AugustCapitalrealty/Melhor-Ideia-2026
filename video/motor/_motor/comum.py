"""Caminhos e dependências comuns aos scripts do motor de vídeos longos.

O PC tem Deep Freeze: as bibliotecas e o cache de mídia ficam em %LOCALAPPDATA% (apagado no reboot)
e são recriados sozinhos. Tudo o que importa fica no Google Drive, dentro de longos/.
"""
import os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
LOCAL = os.environ.get('LOCALAPPDATA', AQUI)
LIB = os.path.join(LOCAL, 'curiosidades-pylib')  # a mesma pasta do motor de curiosidades
sys.path.insert(0, LIB)


def instalar(modulo, pacote=None):
    try:
        return __import__(modulo)
    except ImportError:
        print(f'  instalando {pacote or modulo} (primeira vez depois do reboot)…', flush=True)
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--quiet', '--disable-pip-version-check',
                               '--target', LIB, *(pacote or modulo).split()])  # 'pacote outro<2' instala os dois
        # a pasta LIB pode ter acabado de nascer (reboot): o Python guardou "não existe" no cache de caminhos
        import importlib
        sys.path_importer_cache.pop(LIB, None); importlib.invalidate_caches()
        return __import__(modulo)


def ffmpeg():
    return instalar('imageio_ffmpeg', 'imageio-ffmpeg').get_ffmpeg_exe()


def tela(projeto):
    """(largura, altura) do vídeo: 16:9 por padrão, 9:16 se o projeto.json disser "formato": "9:16"."""
    import json
    cfg = json.load(open(os.path.join(projeto, 'projeto.json'), encoding='utf-8'))
    return (1080, 1920) if cfg.get('formato') == '9:16' else (1920, 1080)


def cache(projeto):
    """Pasta local com a mídia convertida (1080p, 30 fps, um quadro-chave por quadro)."""
    p = os.path.join(LOCAL, 'longos-cache', os.path.basename(os.path.abspath(projeto)))
    os.makedirs(p, exist_ok=True)
    return p
