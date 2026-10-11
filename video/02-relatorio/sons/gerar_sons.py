"""Gera pela API do ElevenLabs os efeitos e a música do vídeo do relatório (11/10/2026).

Mesmos parâmetros do sons_eleven.py do motor do canal (H:\\Meu Drive\\Youtube\\MOTOR\\_motor): efeito pedido com no mínimo 2 s
e cortado depois; música instrumental. A chave vem de GERAL/ferramentas/.env.elevenlabs (eleven_historico.chave_api) ou de
ELEVENLABS_API_KEY; nunca é impressa.

Saída:
  efeitos -> video/motor/_motor/sons/relatorio/<nome>.wav (48 kHz, estéreo, pico 0,9); nas cenas: som: 'relatorio/<nome>'
  música  -> video/MUSICAS/elevenlabs/<nome>.mp3; no projeto: TRILHA = [{ de: 0, arq: 'elevenlabs/<nome>.mp3', vol: 0.10 }]

Uso:  python gerar_sons.py            -> só mostra a lista e a estimativa (não gasta crédito)
      python gerar_sons.py --vai --teto 3000
Gasto de crédito só com a autorização do Guilherme (11/10/2026: "pode gerar pelo ElevenLabs, pode usar os créditos").
"""
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.request
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[2]
SONS = RAIZ / "video" / "motor" / "_motor" / "sons" / "relatorio"
MUSICAS = RAIZ / "video" / "MUSICAS" / "elevenlabs"
API = "https://api.elevenlabs.io/v1"
CRED_SEG_EFEITO, CRED_MIN_MUSICA = 11, 900  # medidos em 04/10/2026 no motor do canal

# Visual e som corporativos (decisão de 07/10: "pense nas grandes empresas de auditoria"): nada de som de canal de vídeo.
PEDIDOS = [
    ("transicao", 0.8, "very soft clean air swoosh for a slide transition in a corporate presentation, subtle, short, no harsh highs"),
    ("destaque", 0.6, "subtle soft clean tick with a tiny warm shimmer, highlighting a number appearing on screen, corporate, minimal"),
    ("documento", 0.5, "soft clean digital pop as a document card appears on screen, modern software interface, subtle, dry"),
    ("clique", 0.3, "soft clean mouse click on a modern laptop trackpad, subtle, dry, no reverb"),
    ("fecho", 2.0, "soft warm low resonant tone for a logo reveal at the end of a corporate video, elegant, restrained, short tail"),
    ("musica_contratacoes", 160, "Instrumental modern corporate underscore for an internal company presentation about improving how "
     "the company prepares service contracts. Calm, confident and optimistic but restrained. Light felt piano, soft plucked "
     "synth, warm pads, gentle steady pulse around 95 BPM, no vocals, no big drum builds, no dramatic drops, consistent level "
     "to sit under a voice-over, clean ending."),
]


def tipo(nome):
    return "musica" if nome.startswith("musica_") else "efeito"


def destino(nome):
    return MUSICAS / f"{nome}.mp3" if tipo(nome) == "musica" else SONS / f"{nome}.wav"


def custo(nome, dur):
    return int(dur / 60 * CRED_MIN_MUSICA) if tipo(nome) == "musica" else int(max(dur, 2) * CRED_SEG_EFEITO)


def chave_api():
    if os.environ.get("ELEVENLABS_API_KEY"):
        return os.environ["ELEVENLABS_API_KEY"]
    sys.path.insert(0, r"H:\Meu Drive\Youtube\GERAL\ferramentas")
    import eleven_historico as eh
    return eh.chave_api()


def chamar(chave, caminho, corpo):
    url = f"{API}{caminho}?output_format=mp3_44100_192"
    dados = json.dumps(corpo).encode("utf-8")
    for tentativa in range(5):
        req = urllib.request.Request(url, data=dados, method="POST",
                                     headers={"xi-api-key": chave, "Content-Type": "application/json", "Accept": "audio/mpeg"})
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                return r.read(), r.headers.get("character-cost", "?")
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503, 504) and tentativa < 4:
                time.sleep(10 * (tentativa + 1)); continue
            raise RuntimeError(f"{e.code} {msg}")
        except (urllib.error.URLError, TimeoutError) as e:
            if tentativa < 4:
                time.sleep(10 * (tentativa + 1)); continue
            raise RuntimeError(repr(e))


def ffmpeg():
    sys.path.insert(0, str(RAIZ / "video" / "motor" / "_motor"))
    from comum import ffmpeg as f
    return f()


def pico_db(arq):
    o = subprocess.run([ffmpeg(), "-hide_banner", "-i", str(arq), "-af", "volumedetect", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace").stderr
    linha = [l for l in o.splitlines() if "max_volume" in l]
    return float(linha[0].split("max_volume:")[1].split("dB")[0]) if linha else -99.0


def nivelar(mp3, wav, dur):
    """Corta o silêncio do começo, limita à duração pedida (+0,4 s de cauda), 48 kHz estéreo, pico 0,9 (−0,9 dB)."""
    ganho = -0.92 - pico_db(mp3)
    filtro = (f"silenceremove=start_periods=1:start_threshold=-50dB,atrim=0:{dur + 0.4},"
              f"afade=t=out:st={max(dur + 0.4 - 0.08, 0)}:d=0.08,volume={ganho:.2f}dB")
    subprocess.run([ffmpeg(), "-hide_banner", "-loglevel", "error", "-y", "-i", str(mp3), "-af", filtro,
                    "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", str(wav)], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vai", action="store_true")
    ap.add_argument("--teto", type=int)
    ap.add_argument("nomes", nargs="*")
    a = ap.parse_args()
    falta = [p for p in PEDIDOS if (not a.nomes or p[0] in a.nomes) and not destino(p[0]).exists()]
    for nome, dur, _ in falta:
        print(f"  {tipo(nome):7} {nome:22} {dur:>6.1f} s  ~{custo(nome, dur):>5} créd.")
    total = sum(custo(n, d) for n, d, _ in falta)
    print(f"{len(falta)} para gerar · ESTIMATIVA ~{total} créditos")
    if not a.vai or not falta:
        return
    if a.teto is None or total > a.teto:
        sys.exit(f"Precisa de --teto >= {total} autorizado pelo Guilherme. Nada gerado.")
    chave = chave_api()
    if not chave:
        sys.exit("Falta a chave do ElevenLabs.")
    SONS.mkdir(parents=True, exist_ok=True); MUSICAS.mkdir(parents=True, exist_ok=True)
    brutos = SONS / "_brutos"; brutos.mkdir(exist_ok=True)
    for nome, dur, pedido in falta:
        t0 = time.time()
        try:
            if tipo(nome) == "musica":
                audio, cred = chamar(chave, "/music", {"prompt": pedido, "music_length_ms": int(dur * 1000),
                                                       "model_id": "music_v2_5", "force_instrumental": True})
                destino(nome).write_bytes(audio)
            else:
                mp3 = brutos / f"{nome}.mp3"
                for pedir in (max(dur, 2.0), max(dur, 3.0)):
                    audio, cred = chamar(chave, "/sound-generation", {"text": pedido, "model_id": "eleven_text_to_sound_v2",
                                                                      "duration_seconds": pedir, "prompt_influence": 0.5})
                    mp3.write_bytes(audio)
                    if pico_db(mp3) > -35:
                        break
                    print(f"  {nome}: veio quase mudo, pedindo de novo")
                nivelar(mp3, destino(nome), dur)
            print(f"OK   {destino(nome).relative_to(RAIZ)}  {len(audio) // 1024} KB  {cred} créd.  {time.time() - t0:.0f}s")
        except Exception as e:
            print(f"ERRO {nome}: {e}")


if __name__ == "__main__":
    main()
