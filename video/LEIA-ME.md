# Vídeo do projeto

O motor de vídeo do Guilherme foi copiado da pasta do YouTube (`H:\Meu Drive\Youtube\MOTOR\_motor`) em 11/10/2026, a pedido dele
("salve o que precisa"), para o vídeo do concurso não depender daquela pasta. Foi copiado só o núcleo; o resto (estilos dos canais,
`pecas.py`, `pronto.py`, `fila.py`, esteira) ficou lá.

| Pasta | O que é |
| :--- | :--- |
| `motor/_motor/` | o motor: `preparar`, `gerar`, `checar`, `render`, `medir`, `conferir`, `revisar`, `publicar`, `juntar`, `locucao`, `comum`, `motor16.html`, `editorial.js` e 14 sons suaves |
| `motor/ferramentas/roteiro_para_locucao.py` | gera o `LOCUCAO-elevenlabs.md` a partir do `ROTEIRO.md` |
| `motor/README-MOTOR.md`, `QUALIDADE-VIDEO.md`, `DESIGN-SYSTEM-EDITORIAL.md` | os guias originais (os caminhos citados neles são os da pasta do YouTube) |
| `motor/AREAS-DA-EMPRESA/` | as 6 áreas, os portões e as travas da "empresa" dele |
| `MUSICAS/` | 3 trilhas calmas da Biblioteca de Áudio do YouTube (fora do git; ficam no Drive) |
| `01-previa-20s/` | a prévia de 20 s (11/10/2026), voz provisória do edge-tts |

O `render.py` procura a música duas pastas acima do motor: por isso `MUSICAS/` fica aqui, em `video/`.

## Rodar (de `video/motor/_motor`)

```
python preparar.py ..\..\01-previa-20s
python gerar.py    ..\..\01-previa-20s
python checar.py   ..\..\01-previa-20s
python render.py   ..\..\01-previa-20s --folha 0   # folha de quadros (vai ao Auditor antes do render)
python render.py   ..\..\01-previa-20s
python medir.py    ..\..\01-previa-20s
python conferir.py ..\..\01-previa-20s
```
O Python fica em `%LOCALAPPDATA%\Programs\Python\Python313\python.exe`. As bibliotecas se instalam sozinhas na primeira chamada
(em `%LOCALAPPDATA%\curiosidades-pylib`). Depois de um reinício (Deep Freeze), se o Python sumiu:
`winget install --id Python.Python.3.13 --scope user --silent --accept-package-agreements --accept-source-agreements`.
O Whisper (alinhar a voz do ElevenLabs) precisa do modelo em `%LOCALAPPDATA%\whisper-modelos\small-local` (ver `README-MOTOR.md`).

## Trocar a voz provisória pela do ElevenLabs

1. `python ..\ferramentas\roteiro_para_locucao.py ..\..\01-previa-20s` → `LOCUCAO-elevenlabs.md`.
2. O Guilherme gera no site e salva em `01-previa-20s\voz\0-previa.mp3` (um MP3 por capítulo; nunca em Downloads).
3. No `projeto.json`: `"locucao": "voz"`. Rodar `gerar.py` de novo (o Whisper alinha a voz ao roteiro) e renderizar.

## Aprendido na prévia (11/10/2026)

- O edge-tts às vezes devolve um MP3 quase vazio (2 KB) e o `gerar.py` quebra com `IndexError` em `meta['palavras'][-1]`.
  É falha passageira: apagar `build/audio/<cena>.*` e rodar de novo.
- A velocidade da voz e as pausas (`OPCOES.depois`, `OPCOES.cauda`, `depois` na cena) são o jeito de acertar a duração.
- O `medir.py` acusou 49% de tempo "parado" na prévia: fundo claro e chapado muda pouco com a câmera viva. A melhorar na versão final
  (mais movimento dentro dos cartões, regra de 0,6 s do `QUALIDADE-VIDEO.md`).
