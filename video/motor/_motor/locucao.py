"""Locução gravada fora (ElevenLabs etc.): um MP3 por capítulo → um MP3 + .json por cena, igual ao do edge-tts.

projeto.json:  "locucao": "voz"   (pasta com 0-gancho.mp3, 1-vila.mp3 ... ; o número antes do "-" é o capítulo)
O texto de cada cena vem do ROTEIRO.md; o Whisper só dá o TEMPO das palavras. As palavras que ele ouvir diferente
(ex.: "500" no lugar de "quinhentas") ficam com o tempo interpolado entre as vizinhas.
"""
import difflib, glob, hashlib, json, os, re, subprocess, unicodedata
from comum import LOCAL, ffmpeg, instalar

MARGEM = 0.08  # respiro antes da 1ª palavra e depois da última, dentro do recorte da cena


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn'))


def tokens(texto):
    return [p.strip('.,;:!?"“”()—–') for p in texto.replace('|', ' ').split() if p.strip('.,;:!?"“”()—–')]


def ouvir(mp3, texto, dica=True, idioma='pt'):
    """Palavras do Whisper com início e fim (s). O modelo fica em %LOCALAPPDATA% e baixa de novo depois do reboot."""
    # 03/10/2026: idioma vem do projeto.json ("idioma": "en" | "de"; padrão "pt") — canais de teste em inglês e alemão.
    # 02/10/2026: o PyAV 19 tirou o metadata_errors que o faster-whisper 1.2.1 usa ("open() got an unexpected keyword").
    instalar('faster_whisper', 'faster-whisper av<16')
    from faster_whisper import WhisperModel
    # 01/10/2026: o download pelo Hugging Face travou (internet lenta, model.bin incompleto e sem aviso). Se existir a pasta
    # baixada à mão (curl -C - .../Systran/faster-whisper-small/resolve/main/{model.bin,config.json,tokenizer.json,
    # vocabulary.txt} em %LOCALAPPDATA%\whisper-modelos\small-local), usa ela.
    local = os.path.join(LOCAL, 'whisper-modelos', 'small-local')
    if os.path.exists(os.path.join(local, 'model.bin')) and os.path.getsize(os.path.join(local, 'model.bin')) > 480e6:
        modelo = WhisperModel(local, device='cpu', compute_type='int8')
    else:
        modelo = WhisperModel('small', device='cpu', compute_type='int8',
                              download_root=os.path.join(LOCAL, 'whisper-modelos'))
    # 01/10/2026: o PyAV instalado não aceita o "metadata_errors" do faster-whisper (TypeError ao abrir o MP3).
    # O ffmpeg do motor decodifica para 16 kHz mono e o Whisper recebe o áudio já pronto.
    import numpy as np
    pcm = subprocess.run([ffmpeg(), '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                         capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    # 04/10/2026: WHISPER_BEAM=1 (variável de ambiente) = busca gulosa, 2–3x mais rápida; na voz limpa do ElevenLabs alinha igual.
    # Padrão continua 5. Com 3–4 Whisper ao mesmo tempo o PC ficou com 1,6 GB livres e ~10 min por capítulo: rode um por vez.
    segs, _ = modelo.transcribe(audio, language=idioma, word_timestamps=True, initial_prompt=texto[:800] if dica else None,
                                vad_filter=False, beam_size=int(os.environ.get('WHISPER_BEAM', 5)))
    out = []
    for s in segs:
        for w in s.words:
            txt = w.word.strip()
            if out and txt.startswith('-'):  # 01/10/2026: o Whisper parte "para-raios" em "para" + "-raios"; junta de volta
                out[-1]['w'] += txt; out[-1]['e'] = w.end; continue
            out.append({'w': txt, 's': w.start, 'e': w.end})
    return out


def alinhar(palavras, ouvidas):
    """Dá início/fim a cada palavra do roteiro, casando com o que o Whisper ouviu."""
    a, b = [norm(p) for p in palavras], [norm(o['w']) for o in ouvidas]
    tempo = [None] * len(palavras)
    for bl in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(bl.size):
            o = ouvidas[bl.b + k]; tempo[bl.a + k] = [o['s'], o['e']]
    casadas = sum(1 for x in tempo if x is not None)
    # buracos: reparte o intervalo entre as vizinhas casadas, proporcional ao tamanho das palavras
    i = 0
    while i < len(tempo):
        if tempo[i] is not None:
            i += 1; continue
        j = i
        while j < len(tempo) and tempo[j] is None:
            j += 1
        t0 = tempo[i - 1][1] if i > 0 else (ouvidas[0]['s'] if ouvidas else 0)
        t1 = tempo[j][0] if j < len(tempo) else (ouvidas[-1]['e'] if ouvidas else t0 + 0.4 * (j - i))
        pesos = [max(len(palavras[k]), 2) for k in range(i, j)]; soma, acc = sum(pesos), t0
        for k, p in zip(range(i, j), pesos):
            d = (t1 - t0) * p / soma; tempo[k] = [acc, acc + d]; acc += d
        i = j
    return tempo, casadas


def envelope(mp3, w=0.01):
    """Nível (dBFS) do MP3 inteiro em janelas de w segundos (mono, 16 kHz)."""
    import numpy as np
    pcm = subprocess.run([ffmpeg(), '-loglevel', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    n = int(16000 * w); k = len(x) // n
    return 20 * np.log10(np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1)) + 1e-9)


def silencio(env, a, b, limiar, w=0.01, minimo=0.06):
    """O trecho de silêncio (nível < limiar) mais longo entre a e b (s), com pelo menos `minimo` s. (início, fim) ou None."""
    i0, i1 = max(0, int(a / w)), min(len(env), int(b / w))
    corridas, ini = [], None
    for i in range(i0, i1):
        if env[i] < limiar and ini is None: ini = i
        elif env[i] >= limiar and ini is not None: corridas.append((ini, i)); ini = None
    if ini is not None: corridas.append((ini, i1))
    corridas = [c for c in corridas if (c[1] - c[0]) * w >= minimo]
    if not corridas: return None
    c = max(corridas, key=lambda c: c[1] - c[0])
    return c[0] * w, c[1] * w


def ajustar_emendas(tempo, por_cena, env, w=0.01):
    """03/10/2026 (Senna Tower, Guilherme: "um 'shh' na troca 5.6 → 5.7, o corte foi mal feito"): o Whisper pôs o fim de
    "graus" e o começo de "Pra" no mesmo instante, no meio do "s" final; o corte no meio do caminho partiu o "s" e o pedaço
    da cena seguinte começava com o chiado do "s" e 0,7 s de silêncio. Agora, em cada troca de cena, o fim da última palavra
    e o começo da primeira vão para as bordas do silêncio de verdade (medido no áudio), e o corte cai dentro dele."""
    import numpy as np
    fala = env[env > -60]
    limiar = float(np.clip((np.percentile(fala, 90) if len(fala) else -12) - 38, -60, -40))
    k, ajustes = 0, 0
    for n, ps in enumerate(por_cena[:-1]):
        k += len(ps); ul, pr = k - 1, k  # última palavra desta cena, primeira da próxima
        la, lb = tempo[ul]; fa, fb = tempo[pr]
        s = silencio(env, la + 0.05, fb - 0.03, limiar, w)
        if not s: continue
        s0, s1 = s
        tempo[ul] = [la, max(la + 0.05, s0)]
        tempo[pr] = [s1, max(fb, s1 + 0.05)]
        ajustes += 1
    # a última palavra do capítulo: o corte não pode cair no meio do som (o Whisper às vezes fecha a palavra cedo)
    la, lb = tempo[-1]
    s = silencio(env, max(la + 0.05, lb - 0.1), lb + 1.0, limiar, w)
    if s and s[0] > lb: tempo[-1] = [la, s[0]]
    return limiar, ajustes


def ganho_capitulo(mp3, alvo=-16.0):
    """Ganho FIXO (dB) para levar o capítulo inteiro a -16 LUFS. Medido uma vez por capítulo."""
    r = subprocess.run([ffmpeg(), '-hide_banner', '-i', mp3, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True)
    m = re.findall(r'I:\s*(-?[\d.]+) LUFS', r.stderr)
    return round(alvo - float(m[-1]), 2) if m else 0.0


def cortar(mp3, t0, t1, saida, ganho=0.0):
    # 01/10/2026 (Guilherme: "a voz começa suave e depois não"; "um 'shh' na troca de assunto"):
    # antes era loudnorm em CADA pedaço, que no modo dinâmico começa baixo e vai subindo o volume. Agora o ganho é fixo
    # (medido no capítulo inteiro) e cada pedaço ganha fade de entrada e de saída, para não ficar corte seco nem
    # vazar o fim de uma sílaba ou a respiração da frase vizinha.
    d = t1 - t0
    subprocess.run([ffmpeg(), '-y', '-loglevel', 'error', '-ss', f'{t0:.3f}', '-to', f'{t1:.3f}', '-i', mp3,
                    '-af', f'volume={ganho}dB,afade=t=in:d=0.04,afade=t=out:st={max(0, d - 0.12):.3f}:d=0.12,aresample=48000',
                    '-ac', '1', '-b:a', '160k', saida], check=True)


def preparar(projeto, cfg, cenas, adir):
    """Cria build/audio/<cena>.mp3 + .json a partir dos MP3 por capítulo. Só refaz o capítulo cujo MP3 ou texto mudou."""
    pasta = os.path.join(projeto, cfg['locucao'])
    for cap in sorted({c['cap'] for c in cenas}):
        arqs = glob.glob(os.path.join(pasta, f'{cap}-*.mp3'))
        if not arqs:
            raise SystemExit(f'  falta a locução do capítulo {cap} em {pasta} ({cap}-nome.mp3)')
        mp3, doCap = arqs[0], [c for c in cenas if c['cap'] == cap]
        # 07/10/2026: a chave usa o CONTEÚDO do MP3. Antes era tamanho|data, e o Google Drive passou a devolver a data com
        # outra precisão: bs03 e bs04 pediam o Whisper nos 12 capítulos (~1 h cada vídeo) sem voz nem texto mudados.
        conteudo = hashlib.sha1(open(mp3, 'rb').read()).hexdigest()[:12]
        chave = hashlib.sha1(f"{conteudo}|{'|'.join(c['texto'] for c in doCap)}".encode()).hexdigest()[:10]
        jsons = [os.path.join(adir, c['id'].replace('.', '_') + '.json') for c in doCap]
        metas = [json.load(open(j, encoding='utf-8')) if os.path.exists(j) else None for j in jsons]
        if all(m and m.get('chave') == chave for m in metas):
            continue
        # Chave antiga (data) que não bate, mas nada mudou de fato: só renova a chave, sem Whisper. Exige TUDO:
        # as palavras salvas iguais ao texto atual, palavra por palavra; o mesmo MP3 de origem; o MP3 mais velho que o
        # alinhamento (voz trocada depois teria data mais nova); e o recorte de cada cena existindo.
        if (all(m and 'chave' in m and m.get('fonte') == os.path.basename(mp3) for m in metas)
                and all([p['w'] for p in m['palavras']] == tokens(c['texto']) for m, c in zip(metas, doCap))
                and os.path.getmtime(mp3) < min(os.path.getmtime(j) for j in jsons)
                and all(os.path.exists(j[:-5] + '.mp3') for j in jsons)):
            for j, m in zip(jsons, metas):
                m['chave'] = chave
                json.dump(m, open(j, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(f'  capítulo {cap}: voz e texto iguais ao alinhamento salvo; chave renovada sem Whisper', flush=True)
            continue
        print(f'  alinhando a locução do capítulo {cap} ({os.path.basename(mp3)})…', flush=True)
        por_cena = [tokens(c['texto']) for c in doCap]
        todas = [p for ps in por_cena for p in ps]
        ouvidas = ouvir(mp3, ' '.join(c['texto'] for c in doCap), idioma=cfg.get('idioma', 'pt'))
        tempo, casadas = alinhar(todas, ouvidas)
        if casadas < 0.9 * len(todas):
            # 01/10/2026 (raio v2): com o roteiro como dica o Whisper alucinou os primeiros 10 s (115 de 188 casaram).
            # Sem a dica ele ouviu certo. Tenta de novo sem a dica e fica com o melhor.
            print(f'    só {casadas} de {len(todas)} casaram; ouvindo de novo sem a dica do roteiro…', flush=True)
            ouv2 = ouvir(mp3, '', dica=False, idioma=cfg.get('idioma', 'pt')); t2, c2 = alinhar(todas, ouv2)
            if c2 > casadas: ouvidas, tempo, casadas = ouv2, t2, c2
        print(f'    {casadas} de {len(todas)} palavras do roteiro casaram com o áudio ({len(ouvidas)} ouvidas)')
        env = envelope(mp3)
        limiar, ajustes = ajustar_emendas(tempo, por_cena, env)
        print(f'    emendas entre cenas no silêncio medido: {ajustes} de {len(por_cena) - 1} (limiar {limiar:.0f} dBFS)')
        ganho = ganho_capitulo(mp3)
        print(f'    ganho fixo do capítulo: {ganho:+.1f} dB')
        k = 0
        for n, (c, ps) in enumerate(zip(doCap, por_cena)):
            tt = tempo[k:k + len(ps)]; k += len(ps)
            # corta RENTE à fala (com um respiro), e nunca além do meio da pausa até a cena vizinha
            ini = tt[0][0] - 0.15
            fim = tt[-1][1] + 0.30
            if n + 1 < len(doCap):
                fim = min(fim, (tt[-1][1] + tempo[k][0]) / 2)
            if n == 0:
                ini = max(0, ini)
            else:
                ini = max(ini, (tempo[k - len(ps) - 1][1] + tt[0][0]) / 2)
            base = c['id'].replace('.', '_')
            cortar(mp3, ini, fim, os.path.join(adir, base + '.mp3'), ganho)
            pal = [{'w': p, 't': round(a - ini, 3), 'd': round(b - a, 3)} for p, (a, b) in zip(ps, tt)]
            json.dump({'palavras': pal, 'dur': round(fim - ini, 3), 'chave': chave, 'fonte': os.path.basename(mp3),
                       'corte': [round(ini, 3), round(fim, 3)]},
                      open(os.path.join(adir, base + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
