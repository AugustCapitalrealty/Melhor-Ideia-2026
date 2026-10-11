"""Gera a legenda (.srt) e a descrição do YouTube (capítulos, fontes, créditos).

Uso:  python publicar.py ../../O-JACARE/longos/01-pontes
      python publicar.py <projeto> --cache     (reusa build/publicar-dados.json: não abre o Chrome)

Lê o player (tempos de cada palavra e de cada capítulo), o ROTEIRO.md (fontes) e midia/real/FONTES.txt (créditos).
Grava <projeto>/build/<slug>.srt e <projeto>/build/descricao.txt

04/10/2026: generalizado (antes a descrição era fixa do vídeo das pontes do Jacaré). O texto de cada vídeo vem do bloco
"publicar" do publicacao.json (tem prioridade) ou do projeto.json:

  "publicar": {
    "idioma": "en",                       # pt | en | de (padrão: "idioma" do projeto.json, senão pt)
    "canal": "Before Soap",               # padrão: "canal" do publicacao.json; vira "Animações: <canal>." se não houver "imagens"
    "abertura": "1º parágrafo…\n2º…",     # obrigatório: o começo da descrição
    "capitulos": "titulo",                # titulo (Title Case, padrão) | roteiro (títulos do ROTEIRO.md) | original
    "fontes": ["…", "…"],                 # padrão: os itens da seção "## Fontes/Sources/Quellen" do ROTEIRO.md
    "imagens": ["…"],                     # linhas no topo de IMAGENS (padrão: "Animações: <canal>.")
    "creditos_auto": true,                # acrescenta uma linha por imagem de midia/real/FONTES.txt
    "voz": "Narrated with a synthetic voice.",   # padrão: frase genérica no idioma (sem citar fornecedor)
    "trilhas": "Music: YouTube Audio Library.",  # sem padrão: avisa se faltar
    "rodape": ["…"]                       # linhas finais (assinatura do canal, pergunta)
  }

No fim confere o que o YouTube recusa: mais de 5.000 caracteres, "<" ou ">", capítulos fora da regra
(o 1º em 0:00, 3 ou mais, cada um com 10 s ou mais). Se algo falhar, grava assim mesmo e sai com código 2.
"""
import json, math, os, re, sys
from comum import instalar

ROTULOS = {
    'pt': {'caps': 'CAPÍTULOS', 'fontes': 'FONTES', 'imagens': 'IMAGENS', 'abertura': 'Abertura',
           'desconhecido': 'autor desconhecido', 'animacoes': 'Animações: {}.', 'voz': 'Narração com voz sintética.'},
    'en': {'caps': 'CHAPTERS', 'fontes': 'SOURCES', 'imagens': 'IMAGES', 'abertura': 'Intro',
           'desconhecido': 'unknown artist', 'animacoes': 'Animations: {}.', 'voz': 'Narrated with a synthetic voice.'},
    'de': {'caps': 'KAPITEL', 'fontes': 'QUELLEN', 'imagens': 'BILDER', 'abertura': 'Einleitung',
           'desconhecido': 'unbekannt', 'animacoes': 'Animationen: {}.', 'voz': 'Gesprochen mit synthetischer Stimme.'},
}
LIMITE = 5000


def ts(t, sep=','):
    # 08/10/2026 (auditoria do bs03): arredondar só os milissegundos dava "00:00:03,1000" (SRT inválido). Agora arredonda o total.
    ms = int(round(t * 1000)); h, r = divmod(ms, 3600000); m, r = divmod(r, 60000); s, ms = divmod(r, 1000)
    return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'


def ler_json(p):
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def extrair(projeto):
    """Abre o player no Chrome e devolve o plano (capítulos, duração) e as palavras com tempo de cada cena."""
    from render import servidor
    slug = os.path.basename(projeto)
    srv, porta = servidor(projeto)
    instalar('playwright')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch(channel='chrome', headless=True)
        pg = b.new_page()
        pg.goto(f'http://127.0.0.1:{porta}/{slug}.html?still=0', timeout=120000)
        pg.wait_for_function('document.body.dataset.pronto === "1"', timeout=300000)
        plano = pg.evaluate('window.__plano()')
        cenas = pg.evaluate('LINHA.map(s => ({ texto: DADOS.cenas[s.i].texto, pal: s.pal.map(p => ({ w: p.w, t: p.g, d: p.d })) }))')
        b.close()
    srv.shutdown()
    return plano, cenas


def montar_srt(cenas):
    # legenda: blocos de até ~42 caracteres, quebrando em pausas e em fim de frase
    # a voz devolve as palavras sem pontuação: alinha com o texto do roteiro, palavra por palavra
    palavras = []
    for c in cenas:
        tok = c['texto'].replace('|', ' ').split()
        if len(tok) == len(c['pal']):
            palavras += [{**p, 'w': w} for p, w in zip(c['pal'], tok)]
        else:
            print(f"  aviso: cena sem alinhamento exato ({len(tok)} × {len(c['pal'])}): {c['texto'][:40]}…")
            palavras += c['pal']
    blocos, cur = [], []
    for i, p in enumerate(palavras):
        cur.append(p)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        texto = ' '.join(x['w'] for x in cur)
        pausa = prox is None or prox['t'] - (p['t'] + p['d']) > 0.35
        if pausa or len(texto) > 38 or p['w'][-1:] in '.?!:':
            blocos.append(cur); cur = []
    srt = []
    for k, bl in enumerate(blocos):
        a, z = bl[0]['t'], bl[-1]['t'] + bl[-1]['d'] + 0.25
        if k + 1 < len(blocos): z = min(z, blocos[k + 1][0]['t'] - 0.02)
        srt.append(f"{k + 1}\n{ts(a)} --> {ts(z)}\n{' '.join(x['w'] for x in bl)}\n")
    return '\n'.join(srt), len(blocos)


def config(projeto):
    """Bloco "publicar" (publicacao.json tem prioridade sobre projeto.json) + o que dá para deduzir do projeto."""
    proj = ler_json(os.path.join(projeto, 'projeto.json')); pub = ler_json(os.path.join(projeto, 'publicacao.json'))
    cfg = {**proj.get('publicar', {}), **pub.get('publicar', {})}
    cfg.setdefault('idioma', proj.get('idioma', 'pt'))
    cfg.setdefault('canal', pub.get('canal'))
    if not cfg.get('abertura'):
        sys.exit('  falta o texto de abertura: ponha "publicar": {"abertura": "…"} no publicacao.json ou no projeto.json '
                 '(ver o topo do publicar.py)')
    if cfg['idioma'] not in ROTULOS: sys.exit(f"  idioma sem rótulos: {cfg['idioma']} (use {', '.join(ROTULOS)})")
    return cfg


def titulo_cap(t, modo):
    if modo == 'original': return t
    if modo == 'frase': return t[:1].upper() + t[1:].lower()
    # Title Case; conserta o "'S" que o str.title() faz em inglês (SAILOR'S → Sailor'S)
    return re.sub(r"(\w)['’](\w)", lambda m: m.group(1) + "'" + m.group(2).lower(), t.title())


def fontes_roteiro(rot):
    for nome in ('Fontes', 'Sources', 'Quellen'):
        if f'## {nome}' in rot:
            # só a seção (até o próximo "## "): antes, os itens de "A conferir" depois dela iam parar na descrição
            sec = rot.split(f'## {nome}', 1)[1].split('\n## ', 1)[0]
            return re.findall(r'^(?:-|\d+\.) (.+)$', sec, re.M)
    return []


def creditos(projeto, R):
    """Uma linha por imagem de midia/real/FONTES.txt. Aceita os dois formatos que existem:
    'código · site · autor · licença · link' (Jacaré) e 'arquivo | File:… | licença | autor | link' (commons.py)."""
    fp = os.path.join(projeto, 'midia', 'real', 'FONTES.txt')
    if not os.path.exists(fp): return []
    cred = []
    for l in open(fp, encoding='utf-8').read().splitlines():
        if ' · ' in l:
            c = [x.strip() for x in l.split(' · ')]
            if len(c) < 5 or c[0].lower() == 'código': continue
            site, autor, lic, link = c[1], c[2], c[3], c[4]
        elif ' | ' in l:
            # a ordem das colunas varia (bs01: arquivo|File:|licença|autor|link; commons.py: arquivo|autor|licença|data|link|…):
            # acha cada campo pelo conteúdo
            c = [x.strip() for x in l.split(' | ')]
            link = next((x for x in c if x.startswith('http')), None)
            if not link: continue
            antes = c[1:c.index(link)]
            lic = next((x for x in antes if re.search(r'public domain|domínio público|cc0|cc[ -]by|pdm|no known', x, re.I)), '')
            autor = next((x for x in antes if x and x != lic and not x.startswith('File:') and not re.match(r'^(c\.|circa|between|\d{3,4})', x)), '')
            if not autor: autor = 'Unknown artist'
            site = 'Wikimedia Commons' if 'wikimedia' in link else re.sub(r'^https?://(www\.)?([^/]+).*', r'\2', link)
        else:
            continue
        autor = re.sub(r'(Unknown (artist|author))+|autor desconhecido', R['desconhecido'], autor)
        cred.append(f'• {site} — {autor} ({lic}): {link}')
    return cred


def montar_descricao(projeto, plano, cfg):
    R = ROTULOS[cfg['idioma']]
    rot = open(os.path.join(projeto, 'ROTEIRO.md'), encoding='utf-8').read()
    modo = cfg.get('capitulos', 'titulo')
    nomes_rot = {int(n): t.strip() for n, t in re.findall(r'^## (\d+) · (.+?)(?: \(\d+:\d+\))?\s*$', rot, re.M)}
    caps = []
    for c in plano['caps']:
        # 08/10/2026 (alerta A1 da auditoria do sg02/bs03): o tempo era truncado e o link caía ainda no fim do capítulo
        # anterior. Agora vai para o segundo seguinte (se o corte passar 0,1 s do segundo).
        t = 0 if c['n'] == 0 else math.ceil(c['a'] - 0.1)
        if c['n'] == 0: nome = cfg.get('abertura_capitulo', R['abertura'])
        elif modo == 'roteiro' and c['n'] in nomes_rot: nome = nomes_rot[c['n']]
        else: nome = titulo_cap(c['titulo'], modo)
        caps.append((t, f'{ts(t, ".")[3:8]} {nome}'))
    fontes = cfg['fontes'] if 'fontes' in cfg else fontes_roteiro(rot)
    imagens = cfg.get('imagens') or ([R['animacoes'].format(cfg['canal'])] if cfg.get('canal') else [])
    cred = creditos(projeto, R) if cfg.get('creditos_auto', True) else []
    rodape = cfg.get('rodape', [])
    if isinstance(rodape, str): rodape = [rodape]
    if not cfg.get('trilhas'): print('  aviso: sem "trilhas" no bloco publicar: a descrição sai sem o crédito da música')

    partes = [cfg['abertura'].rstrip('\n'), f"{R['caps']}\n" + '\n'.join(l for _, l in caps)]
    if fontes: partes.append(f"{R['fontes']}\n" + '\n'.join('• ' + f for f in fontes))
    if imagens or cred: partes.append(f"{R['imagens']}\n" + '\n'.join(['• ' + i for i in imagens] + cred))
    partes.append('\n'.join(x for x in (cfg.get('voz', R['voz']), cfg.get('trilhas')) if x))
    if rodape: partes.append('\n'.join(rodape))
    return '\n\n'.join(partes) + '\n', [t for t, _ in caps]


def validar(desc, tempos, dur):
    """O que o YouTube recusa ou ignora. Devolve a lista de problemas."""
    erros = []
    if len(desc) > LIMITE:
        erros.append(f'descrição com {len(desc)} caracteres: passa {len(desc) - LIMITE} do limite de {LIMITE} '
                     f'(o YouTube corta ou recusa; encurte as fontes ou os créditos)')
    if '<' in desc or '>' in desc: erros.append('a descrição tem "<" ou ">": o YouTube não aceita esses caracteres')
    if not tempos or tempos[0] != 0: erros.append('o primeiro capítulo tem que começar em 0:00')
    if len(tempos) < 3: erros.append(f'só {len(tempos)} capítulos: o YouTube exige 3 ou mais')
    fim = tempos[1:] + [dur]
    for a, z in zip(tempos, fim):
        if z - a < 10: erros.append(f'capítulo em {ts(a, ".")[3:8]} dura {z - a:.1f} s: o YouTube exige 10 s ou mais')
    return erros


def main(projeto, cache=False):
    projeto = os.path.abspath(projeto); slug = os.path.basename(projeto)
    cfg = config(projeto)
    dados = os.path.join(projeto, 'build', 'publicar-dados.json')
    if cache:
        if not os.path.exists(dados): sys.exit(f'  sem cache: {dados} (rode sem --cache)')
        d = json.load(open(dados, encoding='utf-8')); plano, cenas = d['plano'], d['cenas']
    else:
        plano, cenas = extrair(projeto)
        json.dump({'plano': plano, 'cenas': cenas}, open(dados, 'w', encoding='utf-8'), ensure_ascii=False)

    srt, n = montar_srt(cenas)
    open(os.path.join(projeto, 'build', slug + '.srt'), 'w', encoding='utf-8').write(srt)
    desc, tempos = montar_descricao(projeto, plano, cfg)
    open(os.path.join(projeto, 'build', 'descricao.txt'), 'w', encoding='utf-8').write(desc)
    print(f"  {n} legendas · {plano['dur'] / 60:.2f} min · descrição com {len(desc)} de {LIMITE} caracteres")
    print('  ' + os.path.join(projeto, 'build', slug + '.srt'))
    print('  ' + os.path.join(projeto, 'build', 'descricao.txt'))
    erros = validar(desc, tempos, plano['dur'])
    for e in erros: print('  ERRO ' + e)
    if erros: sys.exit(2)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    main(args[0] if args else '../../O-JACARE/longos/01-pontes', cache='--cache' in sys.argv)
