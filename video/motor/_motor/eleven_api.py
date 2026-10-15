"""Voz pela API do ElevenLabs, cena a cena, com o tempo de cada palavra (endpoint with-timestamps), 15/10/2026.

Sai no mesmo formato do edge-tts (build/audio/<cena>.mp3 + .json com 'palavras' e 'dur'), então o player e o render não mudam.
No projeto.json: "locucao": "eleven_api", "eleven": {"voz": "<voice_id>", "modelo": "eleven_multilingual_v2"}.
A chave vem de H:\\Meu Drive\\Youtube\\GERAL\\ferramentas (eleven_historico.chave_api) ou de ELEVENLABS_API_KEY; nunca é impressa.
Pula a cena se o texto não mudou (hash no .json). Uso: python eleven_api.py <projeto>
"""
import base64, hashlib, json, os, re, sys, time, urllib.error, urllib.request
from gerar import ler_roteiro

API = 'https://api.elevenlabs.io/v1'


def chave():
    if os.environ.get('ELEVENLABS_API_KEY'):
        return os.environ['ELEVENLABS_API_KEY']
    sys.path.insert(0, r'H:\Meu Drive\Youtube\GERAL\ferramentas')
    import eleven_historico as eh
    return eh.chave_api()


def palavras_de(al):
    """Junta os caracteres do alinhamento em palavras, sem pontuação, como o WordBoundary do edge-tts."""
    out, cur, t0, t1 = [], '', None, None
    for ch, a, b in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur: out.append((cur, t0, t1))
            cur, t0 = '', None
            continue
        if t0 is None: t0 = a
        cur += ch; t1 = b
    if cur: out.append((cur, t0, t1))
    res = []
    for w, a, b in out:
        w = re.sub(r'^[^\wÀ-ÿ]+|[^\wÀ-ÿ]+$', '', w)
        if w: res.append({'w': w, 't': round(a, 3), 'd': round(b - a, 3)})
    return res


def falar(k, voz, modelo, texto, antes, depois):
    corpo = {'text': texto, 'model_id': modelo, 'language_code': 'pt',
             'voice_settings': {'stability': 0.55, 'similarity_boost': 0.75, 'style': 0.1, 'use_speaker_boost': True},
             'previous_text': antes, 'next_text': depois}
    req = urllib.request.Request(f'{API}/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128',
                                 data=json.dumps(corpo).encode('utf-8'), method='POST',
                                 headers={'xi-api-key': k, 'Content-Type': 'application/json'})
    for tentativa in range(5):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and tentativa < 4:
                time.sleep(8 * (tentativa + 1)); continue
            raise RuntimeError(f'{e.code} {e.read()[:300].decode("utf-8", "replace")}')


def main(projeto):
    projeto = os.path.abspath(projeto)
    cfg = json.load(open(os.path.join(projeto, 'projeto.json'), encoding='utf-8'))
    ev = cfg['eleven']
    _, cenas = ler_roteiro(os.path.join(projeto, 'ROTEIRO.md'))
    adir = os.path.join(projeto, 'build', 'audio'); os.makedirs(adir, exist_ok=True)
    k, gasto = chave(), 0
    for i, c in enumerate(cenas):
        base = os.path.join(adir, c['id'].replace('.', '_'))
        h = hashlib.sha1(f"{c['texto']}|{ev['voz']}|{ev['modelo']}".encode()).hexdigest()[:10]
        if os.path.exists(base + '.json') and json.load(open(base + '.json', encoding='utf-8')).get('hash') == h:
            print(f"  {c['id']} sem mudança"); continue
        antes = cenas[i - 1]['texto'] if i else ''
        depois = cenas[i + 1]['texto'] if i + 1 < len(cenas) else ''
        r = falar(k, ev['voz'], ev['modelo'], c['texto'], antes, depois)
        audio = base64.b64decode(r['audio_base64'])
        open(base + '.mp3', 'wb').write(audio)
        pal = palavras_de(r['alignment'])
        dur = round(r['alignment']['character_end_times_seconds'][-1], 3)
        json.dump({'palavras': pal, 'dur': dur, 'hash': h}, open(base + '.json', 'w', encoding='utf-8'), ensure_ascii=False)
        gasto += len(c['texto'])
        print(f"  {c['id']} {dur:5.1f} s  {len(pal)} palavras")
    print(f'  caracteres enviados: {gasto}')


if __name__ == '__main__':
    main(sys.argv[1])
