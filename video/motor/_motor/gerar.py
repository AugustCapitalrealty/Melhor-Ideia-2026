"""Narra o ROTEIRO.md e monta o player do vídeo longo.

Uso:  python gerar.py ../../O-JACARE/longos/01-pontes   (ou ../../GUILHERME-AUGUST/longos/01-atafona)

Lê   <projeto>/ROTEIRO.md    (capítulos "## N · TÍTULO (...)", cenas "**N.M · ...", narração nas linhas "> ")
     <projeto>/projeto.json  (voz, velocidade, título, pronúncias)
     <projeto>/cenas/*.js    (o visual de cada cena: CENAS['N.M'] = { fn(lt, S) {...} })
Gera <projeto>/build/audio/*.mp3 + .json  (cache: só narra de novo a cena que mudou)
     <projeto>/build/<slug>.html          (player; a mídia vem do servidor do render.py)
"""
import asyncio, glob, hashlib, json, os, re, sys
from comum import AQUI, cache, instalar

edge_tts = instalar('edge_tts', 'edge-tts')
BYTES_POR_S = 6000  # edge-tts sai em mp3 48 kbps CBR


def ler_roteiro(caminho):
    caps, cenas, cap, cena = [], [], None, None
    for linha in open(caminho, encoding='utf-8').read().splitlines():
        m = re.match(r'^## (\d+) · (.+?)(?: \(.*\))?\s*$', linha)
        if m:
            cap = int(m.group(1)); caps.append({'n': cap, 'titulo': m.group(2).strip()}); cena = None
            continue
        if linha.startswith('## '):
            cap = None; cena = None; continue  # "## Fontes" etc.
        m = re.match(r'^\*\*(\d+\.\d+) · ', linha)
        if m and cap is not None:
            cena = {'id': m.group(1), 'cap': cap, 'texto': ''}; cenas.append(cena); continue
        if linha.startswith('> ') and cena is not None:
            fala = re.sub(r'\s*⚠?\s*(\[\d+\])+|\s*⚠', '', linha[2:]).strip()  # [1][2] = fontes, não se falam
            cena['texto'] = (cena['texto'] + ' ' + fala).strip()
    return caps, [c for c in cenas if c['texto']]


async def narrar(texto, voz, vel, mp3):
    com = edge_tts.Communicate(texto, voz, rate=vel, boundary='WordBoundary')
    audio, palavras = bytearray(), []
    async for c in com.stream():
        if c['type'] == 'audio':
            audio += c['data']
        elif c['type'] == 'WordBoundary':
            palavras.append({'w': c['text'], 't': round(c['offset'] / 1e7, 3), 'd': round(c['duration'] / 1e7, 3)})
    open(mp3, 'wb').write(audio)
    return {'palavras': palavras, 'dur': round(len(audio) / BYTES_POR_S, 3)}


def main(projeto):
    projeto = os.path.abspath(projeto)
    slug = os.path.basename(projeto)
    cfg = json.load(open(os.path.join(projeto, 'projeto.json'), encoding='utf-8'))
    caps, cenas = ler_roteiro(os.path.join(projeto, 'ROTEIRO.md'))
    adir = os.path.join(projeto, 'build', 'audio'); os.makedirs(adir, exist_ok=True)
    pron = cfg.get('pronuncia', {})
    total = 0
    if cfg.get('locucao'):  # locução gravada fora (ElevenLabs): um MP3 por capítulo, alinhado com o Whisper
        import locucao
        locucao.preparar(projeto, cfg, cenas, adir)
    for c in cenas:
        if cfg.get('locucao'):
            meta = json.load(open(os.path.join(adir, c['id'].replace('.', '_') + '.json'), encoding='utf-8'))
            c['palavras'], c['audios'] = meta['palavras'], [{'arq': c['id'].replace('.', '_') + '.mp3', 'off': 0.0}]
            c['fala'] = round(meta['palavras'][-1]['t'] + meta['palavras'][-1]['d'], 3)
            total += c['fala']
            continue
        falado = c['texto']
        for a, b in pron.items():
            falado = re.sub(rf'\b{re.escape(a)}\b', b, falado)
        partes = [p.strip() for p in falado.split('|') if p.strip()]
        vel = cfg.get('velocidade_cenas', {}).get(c['id'], cfg['velocidade'])  # o gancho pode ser mais rápido
        voz = cfg.get('voz_caps', {}).get(str(c['cap']), cfg['voz'])  # um capítulo pode ter outra voz (testes de canais)
        palavras, audios, off = [], [], 0.0
        for k, texto in enumerate(partes):
            chave = hashlib.sha1(f"{texto}|{voz}|{vel}".encode()).hexdigest()[:10]
            base = f"{c['id'].replace('.', '_')}" + (f'-{k + 1}' if len(partes) > 1 else '')
            mp3, js = os.path.join(adir, base + '.mp3'), os.path.join(adir, base + '.json')
            meta = json.load(open(js, encoding='utf-8')) if os.path.exists(js) else {}
            if meta.get('chave') != chave or not os.path.exists(mp3):
                print(f"  narrando {c['id']}…", flush=True)
                meta = asyncio.run(narrar(texto, voz, vel, mp3))
                meta['chave'] = chave
                json.dump(meta, open(js, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            palavras += [{**p, 't': round(p['t'] + off, 3)} for p in meta['palavras']]
            audios.append({'arq': base + '.mp3', 'off': round(off, 3)})
            fim = meta['palavras'][-1]['t'] + meta['palavras'][-1]['d']
            off += fim + 0.15
        c['fala'] = round(palavras[-1]['t'] + palavras[-1]['d'], 3)
        c['palavras'], c['audios'] = palavras, audios
        total += c['fala']
    print(f"  {len(cenas)} cenas, {total / 60:.2f} min de fala")

    manifesto = json.load(open(os.path.join(cache(projeto), 'manifesto.json'), encoding='utf-8'))
    dados = {'slug': slug, 'titulo': cfg['titulo'], 'caps': caps, 'formato': cfg.get('formato', '16:9'),
             'cenas': [{k: c[k] for k in ('id', 'cap', 'texto', 'fala', 'palavras', 'audios')} for c in cenas]}
    cjs = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(projeto, 'cenas', '*.js'))))
    html = open(os.path.join(AQUI, 'motor16.html'), encoding='utf-8').read()
    # design system comum + os estilos extras do canal (projeto.json "estilos": ["arquivo"] → estilo-arquivo.js)
    estilos = '\n'.join(open(os.path.join(AQUI, f), encoding='utf-8').read()
                        for f in ['editorial.js'] + [f'estilo-{e}.js' for e in cfg.get('estilos', [])])
    html = (html.replace('/*__DADOS__*/null', json.dumps(dados, ensure_ascii=False))
                .replace('/*__MANIFESTO__*/null', json.dumps(manifesto, ensure_ascii=False))
                .replace('/*__ESTILO__*/', estilos)
                .replace('/*__CENAS__*/', cjs).replace('__TITULO__', cfg['titulo']))
    out = os.path.join(projeto, 'build', slug + '.html')
    open(out, 'w', encoding='utf-8').write(html)
    print(f"  player: {out}")
    # Erro de sintaxe no JavaScript trava a página em silêncio (o checar.py esperaria 5 min). Confere já, se tiver Node.
    import shutil, subprocess, tempfile
    if shutil.which('node'):
        js = html.split('<script>')[1].split('</script>')[0]
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(js)
        r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
        os.remove(f.name)
        if r.returncode:
            print('  ERRO DE SINTAXE no JavaScript:')
            print('\n'.join(r.stderr.splitlines()[1:5]))
            sys.exit(1)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '..', '..', 'O-JACARE', 'longos', '01-pontes'))
