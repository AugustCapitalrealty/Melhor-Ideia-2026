# Vídeos longos (16:9) feitos em código

Motor para vídeos longos narrados: animação em Canvas + vídeos do Veo + fotos e vídeos reais, com narração de IA.
Primeiro projeto: `01-pontes/` (O Jacaré, 27/09/2026).

> **Desde 04/10/2026, todo vídeo novo segue `QUALIDADE-VIDEO.md`** (ficha da cena, régua de gosto, foto em peças com
> `_motor/pecas.py`, medir e conferir). Decisão do Guilherme depois da comparação `00-comparar-hoje` × `00-comparar-novo`.

## Estrutura

| Caminho | O que é |
|---|---|
| `_motor/editorial.js` | **Design system editorial** (jacaré apresentador, temas, tipografia, pontilhado). Ver `DESIGN-SYSTEM.md` |
| `_motor/motor16.html` | Motor comum: linha do tempo pela narração, camadas de vídeo e foto, transições, títulos de capítulo |
| `_motor/preparar.py` | Converte a mídia de `midia/` para o cache local (1080p, 30 fps, um quadro-chave por quadro) |
| `_motor/gerar.py` | Lê o `ROTEIRO.md`, narra as cenas (edge-tts) e monta o player em `build/` |
| `_motor/render.py` | Renderiza quadro a quadro (Chrome + Playwright) e mixa o áudio (ffmpeg) |
| `_motor/checar.py` | Diagnóstico: lista erros de JavaScript por cena |
| `_motor/medir.py` | Mede o vídeo pronto: **tempo parado** (trechos sem movimento) e volume (LUFS, pico). Réguas do motion-video-kit |
| `_referencias/` | 3 repositórios de motion baixados em 30/09 (motion-video-kit, lemo-opuscar, ClaudeAnimationBase). **Ler `_referencias/LEIA-ME.md`** · 04/10: `ffmpeg-skill` (volume, cor, conferência de entrega), estudo em `_referencias/FFMPEG-SKILL.md` · `lemo-wake` (foto que ganha vida com modelos locais; licença não comercial, só ideias), estudo em `_referencias/LEMO-WAKE.md` |
| `_motor/publicar.py` | Gera a legenda `.srt` e a descrição do YouTube (capítulos, fontes, créditos) |
| `<projeto>/ROTEIRO.md` | **Fonte da verdade da narração.** `## N · TÍTULO` = capítulo; `**N.M · …**` = cena; linhas `> ` = fala |
| `<projeto>/projeto.json` | Título, voz, velocidade e correções de pronúncia |
| `<projeto>/cenas/*.js` | O visual de cada cena: `CENAS['N.M'] = { fn(lt, S) {…}, depois, trans }` |
| `<projeto>/midia/` | Mídia real (`real/`, com `FONTES.txt`) e clipes do Veo (`veo/`) |
| `<projeto>/build/` | Narração, player, renders, legendas e descrição |

## Fazer o vídeo

```powershell
cd "H:\Meu Drive\Youtube\MOTOR\_motor"
# os projetos ficam na pasta do canal: ..\..\O-JACARE\longos\01-pontes, ..\..\GUILHERME-AUGUST\longos\01-atafona
python preparar.py ..\..\O-JACARE\longos\01-pontes          # mídia → cache (só o que mudou)
python gerar.py    ..\..\O-JACARE\longos\01-pontes          # narração + player
python checar.py   ..\..\O-JACARE\longos\01-pontes          # erros por cena
python medir.py    ..\..\O-JACARE\longos\01-pontes          # tempo parado + volume do MP4 pronto
python render.py   ..\..\O-JACARE\longos\01-pontes --folha 2   # folha de revisão de um capítulo (build/revisao/)
python render.py   ..\..\O-JACARE\longos\01-pontes --cap 2     # MP4 de um capítulo
python render.py   ..\..\O-JACARE\longos\01-pontes             # MP4 inteiro (~20 min para 7 min de vídeo)
python publicar.py ..\..\O-JACARE\longos\01-pontes          # .srt + descrição
```

**Fila de render (04/10/2026):** `python fila.py on --ate 23:00` renderiza os projetos de `MOTOR/FILA.txt` (3 capítulos juntos, prioridade
baixa) e só anda com a janela aberta; `python fila.py off` para na hora; `python fila.py status`. Não roda `gerar.py` nem `pronto.py`.
**Velocidade medida (05/10/2026):** com 3 juntos, cada render faz ~12 quadros/s (~36 q/s somados, o dobro dos 18 q/s dos 7 processos antigos). bs02 inteiro (11 capítulos, 14m54s) saiu em 16 min mais 3 min de juntar/medir/conferir, aprovado. Margem para não começar capítulo novo baixou de 25 para 8 min (backup `_motor/_fila-antes-margem8.py.bak`).
**Avisos do log do render, investigados em 05/10/2026:** (1) `[página] Failed to load resource: 404` = o Chrome pedindo `/favicon.ico`, inofensivo. (2) `mp3float … Error submitting packet to decoder: Invalid data` = trilha com `-ss` depois do fim da música e `-stream_loop -1`; o som sai certo (medido), inofensivo. **O defeito real não dá aviso nenhum:** quando o capítulo começa no meio da trilha (`-ss` menor que a duração da música) e o loop cai dentro do capítulo, o ffmpeg 7.1 não volta ao início no loop: pula de volta para um trecho do meio e repete. Afetados: bs02 caps 1, 5 e 9 (loop em 2:00, 6:41 e 12:46) e bs03 caps 1 e 5. Correção testada (semelhança 1,00 com o loop perfeito, contra ~0,0 hoje): na `mixar()` do `render.py`, trocar `-ss off -t dur` da trilha por `-t (off+dur)` na entrada e `atrim=start=off,asetpts=PTS-STARTPTS` no começo do filtro. Ainda não aplicada.

## Sonoplastia (desde 28/09/2026, pedido do Guilherme: "sinto falta de sonoplastia")

- `_motor/sons.py` **sintetiza** 23 efeitos em código (whoosh, pop, papel, papel rasgando, bolhas, splash, tum, impacto,
  tick, máquina de escrever, plim, brilho, boing, descida, ronco de subsolo, chiado de ar, rabisco, carimbo). Os `.wav`
  ficam em `_motor/sons/` (no Drive). `python sons.py --ouvir` gera `sons/_amostra.wav` com todos em sequência.
- Na cena: `sons: S => [{ t: S.w('segredo'), som: 'papel_rasga', vol: 1, pan: 0 }]` (t em segundos dentro da cena).
  Volume geral em `OPCOES.volEfeitos`: **0,25** (0,6 → 0,35 em 28/09, "muito alta"; → 0,25 em 30/09, "o pessoal está reclamando
  que ainda está alta"). Os Shorts de curiosidades têm o próprio volume (`fx.gain` no `motor.html` deles): 0,55 → 0,4 em 30/09.
  Vídeo já renderizado só muda com `render.py <projeto> --remixar`.
- Pôr som num vídeo pronto sem refazer a imagem: `python render.py <projeto> --remixar --cap N` (segundos).

## Sonoplastia mais suave (01/10/2026)

O Guilherme, duas vezes: "muito alto, tipo um chiado" e "o pessoal reclama; diminui e troca por algo mais suave".
- Volume geral dos efeitos: `OPCOES.volEfeitos` **0,12** (era 0,25).
- `render.py` passa **todo** efeito num passa-baixa de 6,5 kHz e, se existir `sons/<nome>_suave.wav`, toca essa versão.
  As `_suave` (papel, papel_curto, papel_rasga, rabisco, tick, whoosh_curto, splash, maquina) têm passa-alta 120 Hz,
  passa-baixa 2,5 kHz, −4 dB e cauda curta. Para refazer: ver o comando no `GERAL/REGISTRO.md` (01/10).
- Não use o som `chiado` em vídeo novo.

## Outras correções de 01/10/2026
- `preparar.py` aceita **.webp** (fotos da Commons vinham assim e o motor ignorava: "mídia A4101: 0 resultados").
- `locucao.py`: o Whisper pode travar baixando o modelo pelo Hugging Face (internet lenta, sem aviso). Ele agora usa
  `%LOCALAPPDATA%\whisper-modelos\small-local` se existir (baixe com `curl -C -` os 4 arquivos de
  `huggingface.co/Systran/faster-whisper-small/resolve/main/`: model.bin, config.json, tokenizer.json, vocabulary.txt).
  Some no reboot: baixar de novo (~484 MB).

## Movimento (desde 30/09/2026, aprovado pelo Guilherme: "aprovo bora")

Vieram do `_referencias/LEIA-ME.md` (a Atafona ficou **56% do tempo parada**, medido com `medir.py`).
- **Câmera viva por padrão** (`motor16.html`, `OPCOES.camViva = 0.006` **por segundo**, teto `camMax = 0.1`): toda cena
  cresce 0,6%/s em velocidade constante, em volta de `foco: [x, y]` (0 a 1). A cena desliga com `camViva: 0` ou muda o
  ritmo com `camViva: 0.01`. A 1ª versão (4% por cena) deixou 2,6 s parados numa cena de 14 s.
  O cabeçalho (`arCabecalho`), o crédito (`arCredito`) e a fonte (`gaFonte`) ficam **fixos na tela**, fora do zoom.
- **Cena com câmera própria** (a melhor solução para cena longa de mesa): `camViva: 0` e, dentro da cena, `keys()` para
  (x, y, zoom) seguindo a fala; desenhe a mesa 2× maior (`ctx.translate(-W/2,-H/2); ctx.scale(2,2); arMesa()`) para a
  câmera poder andar sem mostrar borda. Exemplo: cena 0.3 da prévia do El Niño.
- **Impacto** (carimbo que bate): a cena declara `impactos: S => [t]` → tremor amortecido (0,35 s) + clarão de papel
  (no máximo 50%) no mesmo quadro. Use junto com `arCarimboBate(txt, x, y, lt, t, {tam, sub})` (em `estilo-arquivo.js`)
  e os sons `carimbo` + `tum` no mesmo `t`. **Nunca no balanço de vítimas.**
- **Transição de pontos** (`trans: 'pontos'` numa cena, ou `OPCOES.transCapitulo = 'pontos'`): grade de círculos cobre na
  diagonal, a cena troca coberta e descobre (0,5 s). Cor em `OPCOES.corPontos`. Substitui a mistura suave só onde o
  projeto pedir (o padrão continua `'suave'`).
- **`arFotoVideo(pref, tl, box, ang, p, legenda, crédito, {ilustrativa: true})`**: vídeo real numa polaroide; com
  `ilustrativa` põe o selo IMAGEM ILUSTRATIVA (obrigatório em banco de imagens que não é do fato narrado).
- **Mapa:** o `arMapa` "desenrola" a longitude de polígonos que cruzam a linha de data. Antes, Fiji virava uma faixa clara
  atravessando o mapa inteiro em latitude −16° (só aparece em mapas do Pacífico; visto no El Niño em 30/09).
- Prévia de referência: `GUILHERME-AUGUST/longos/02-el-nino-previa/` (1 min, 5 cenas, voz provisória).

## Imagens e vídeos reais (desde 28/09/2026)

- `python _motor/buscar_midia.py <projeto> "termo 1" "termo 2" [--tipo video] [--max 12]`: busca na **Wikimedia Commons**
  com o Playwright, lê a licença de cada arquivo e **só baixa o que pode ir para canal monetizado** (domínio público, CC0,
  CC BY, CC BY-SA). Salva em `midia/real/` e anota autor, licença e link em `midia/real/FONTES.txt`. **Confira as imagens**:
  a busca traz coisas fora do tema (ex.: "atafona" também é um tipo de moinho).
- **Foto de site de notícia NÃO serve**, mesmo com a fonte: crédito não é permissão (Lei 9.610/98), e no YouTube vira
  strike. **A Agência Brasil também não é mais livre** (conferido em 28/09/2026): só libera reprodução jornalística; uso
  audiovisual/comercial pede autorização em licenciamento@ebc.com.br. Print de manchete na tela, curto e comentado, é
  citação (risco baixo, não zero).
- Toda foto CC BY / BY-SA leva o crédito **na tela** (`arFoto(..., 'foto: Autor · licença')`) e na descrição.

## Estilo (preferências do Guilherme)

- **28/09/2026:** criado o estilo editorial com o jacaré apresentador (`DESIGN-SYSTEM.md`, teste em `00-estilo/`).
  Esperando aprovação para virar o padrão dos longos.

- **Sem cartão de capítulo na tela e sem transição de "cortina" entre capítulos** (pedido em 27/09/2026, depois do
  vídeo das pontes). A troca de capítulo é uma mistura suave de 1 s. Os capítulos continuam existindo no roteiro
  (organizam a trilha e a descrição do YouTube), só não aparecem na tela. Opções em `OPCOES`, no `motor16.html`.
- O gancho das pontes foi aprovado como estava: foto real, a água virando raio-x, contador, título no fim.
- Tom: conversa ("você", "a gente"); sem vinheta; sem legenda gravada no vídeo (vai o `.srt`).

## Regras que custaram tempo

- **Nunca `ctx.filter = 'blur(...)'` em peça grande a cada quadro.** No teste do corpo em 3D (28/09), 11 fibras da largura
  da tela com blur deixaram o render em ~0,1 quadro/s (30 min sem terminar). Para profundidade, escureça as peças de trás.
  Blur só em coisa pequena (um texto entrando).

- **Erro de sintaxe no JavaScript das cenas trava a página sem aviso** (o `checar.py` esperava 5 min). Desde 28/09 o
  `gerar.py` roda `node --check` e para com a mensagem. Exemplo que pegou: `-(x) ** 2` precisa ser `-Math.pow(x, 2)`.

- **Mixagem com centenas de sons passava do limite de linha de comando do Windows** (08/10/2026, Kaffee: 514 entradas, 38.672
  caracteres > 32.767, `WinError 206 … muito grande` no `juntar.py`). O `mixar` do `render.py` agora roda o ffmpeg dentro de `_motor/sons`
  e passa as entradas do mesmo disco como caminho relativo (19.556 caracteres no Kaffee; o som não muda). Backup:
  `render.py.bak-2026-10-08-cmdlongo`. Se voltar a estourar (~650+ efeitos), o próximo passo é reaproveitar a mesma entrada com `asplit`.
- **Arquivo grande escrito duas vezes seguidas no H: pode sumir** (08/10, Kaffee): o `sg03-kaffee.video.mp4` (600 MB) foi refeito pelo
  `juntar.py` enquanto o Drive ainda subia o anterior e desapareceu antes do último passo (ffmpeg saiu com −2). Contorno usado: emendar e juntar
  no disco local e copiar só o MP4 final para o H:. Ainda sem correção no `juntar.py` (pendência da Plataforma).
- **Deep Freeze:** as bibliotecas (edge-tts, imageio-ffmpeg, pillow) e o cache de mídia ficam em `%LOCALAPPDATA%`.
  Somem no reboot e se reinstalam ou se regeneram sozinhos: é só rodar `preparar.py` de novo.
- **Depois do reboot, a 1ª instalação falhava** ("No module named edge_tts" logo depois do pip): a pasta das bibliotecas
  acabava de nascer e o Python já tinha guardado que ela não existia. Corrigido em `comum.instalar` (30/09/2026).
- **`python` não encontrado** (abre o aviso da Microsoft Store, visto em 30/09 e 03/10/2026): o Python está em
  `%LOCALAPPDATA%\Programs\Python\Python313\python.exe`, só não está no PATH. Chamar pelo caminho completo ou pôr no PATH
  do usuário (`Python313\` e `Python313\Scripts\`, antes do `WindowsApps`).
- **O próprio Python some no reboot** (visto em 02 e 03/10/2026). **Desde 03/10/2026 a versão é a 3.13** (3.13.15): as
  bibliotecas compiladas de `GERAL/ferramentas/pylib` são `cp313`, e o motor (Playwright, faster-whisper 1.2.1, av 15.1,
  ctranslate2 4.8.2, ffmpeg 7.1) foi testado nela. Reinstalar sem admin:
  `winget install --id Python.Python.3.13 --scope user --silent --accept-package-agreements --accept-source-agreements`
  (~1 min), ou o instalador `python-3.13.x-amd64.exe` marcando **"Add python.exe to PATH"** (em 03/10 o instalador deixou
  essa opção desmarcada). Depois disso as bibliotecas se instalam sozinhas na 1ª chamada do motor, e o modelo do Whisper se baixa
  à mão em `%LOCALAPPDATA%\whisper-modelos\small-local` (ver `locucao.py`). Checagem completa: `python checar.py <projeto>`.
  Refeito assim em 03/10/2026 (tarde), sem problemas: o winget instalou a 3.13.15 e já pôs no PATH do usuário.
- **O PC reinicia sozinho com TELA AZUL** (visto em 03/10/2026, 12:36, logo depois do render do Senna Tower). Não é o Claude
  nem um comando: o log do Windows registra BlueScreen `0x1A` (MEMORY_MANAGEMENT), subcódigo `0x3F`: uma página lida de volta
  do arquivo de paginação não bate com a que foi gravada (erro de CRC). Aponta para a RAM ou para o caminho até o disco
  (driver de armazenamento, Intel RST, Deep Freeze). **É antigo e se repete:** 26 telas azuis de 22/08 a 03/10/2026, todas
  com o mesmo código, mais um desligamento por temperatura (01/09). Pacote para o TI, com minidumps, logs e relatório:
  `GERAL/suporte-ti/tela-azul-2026-10/` (começar pelo `LEIA-PRIMEIRO-relatorio-para-TI.txt`). O PC tem 16 GB; 7 renders em paralelo (7 Chromes) mais o
  VS Code enchem a RAM e forçam a paginação, que é exatamente onde a falha aparece.
  **Para render:** no máximo 3 processos `render.py --cap N` por vez e o Chrome do dia a dia fechado. Salvar sempre no Drive
  antes de renderizar. **Para resolver de vez (TI da empresa):** Diagnóstico de Memória do Windows (`mdsched.exe`), teste de
  hardware do Dell SupportAssist, atualizar BIOS, driver Intel RST e o Deep Freeze.
- **PyAV 19 quebra o Whisper** (02/10/2026: "open() got an unexpected keyword argument 'metadata_errors'"). O `locucao.py`
  agora instala `faster-whisper av<16` (o `comum.instalar` aceita vários pacotes separados por espaço).
- **Node não está instalado** (02/10/2026). É opcional: o `gerar.py` só roda `node --check` quando ele existe.
  O `baixar_video.py` precisa dele (o yt-dlp usa o Node para o JavaScript do YouTube). Some no reboot. Em 03/10/2026 foi
  instalado sem admin, como zip portátil (v24.21.0 LTS), em `%LOCALAPPDATA%\node`, mais o PATH do usuário. Para refazer, no
  PowerShell: baixar `https://nodejs.org/dist/<versão>/node-<versão>-win-x64.zip`, extrair em `%LOCALAPPDATA%`, renomear a
  pasta para `node` e pôr `%LOCALAPPDATA%\node\` no PATH do usuário.
- **ffmpeg** vem do pacote `imageio-ffmpeg` (`get_ffmpeg_exe()`), sem instalador.
- **O Chromium do Playwright não decodifica H.264.** O render usa `channel='chrome'` (o Chrome instalado).
- **O servidor precisa atender `Range`**: sem isso o `<video>` não posiciona. Já está no `render.py`.
- **Renderizar quadro a quadro, não gravar em tempo real.** Em cada quadro, `__quadro(t)` faz uma passada de
  coleta, posiciona os vídeos no instante exato (`seeked`) e só então desenha. É determinístico.
- **Mídia pelo começo do nome:** `video('V05', t)`. Se o prefixo bater em dois arquivos (ex.: `R06a` e `R06a2`), dá
  erro; use um prefixo mais longo.
- **S.w('palavra')** devolve o instante em que a palavra é dita dentro da cena (ignora acentos e maiúsculas).
- A legenda `.srt` alinha as palavras da voz com o texto do roteiro, para ter pontuação.
- A folha de revisão (`--folha`) é a forma de conferir 40 cenas sem assistir tudo.

## Locução do ElevenLabs (28/09/2026)

- O Guilherme gera no site (Text to Speech), um MP3 por capítulo, e salva em `<projeto>/voz/N-nome.mp3` (N = número do
  capítulo). Texto pronto para colar: `LOCUCAO-elevenlabs.md` do projeto (sem as marcas de fonte).
- `projeto.json`: `"locucao": "voz"`. O `gerar.py` chama `_motor/locucao.py`, que usa o Whisper (faster-whisper, modelo
  small, em `%LOCALAPPDATA%\whisper-modelos`; reinstala sozinho depois do reboot) só para achar o TEMPO de cada palavra.
  O texto continua sendo o do roteiro. Corta um MP3 por cena no meio da pausa e normaliza o volume (loudnorm -16).
- As marcas `[1][2]` e `⚠` nas linhas `>` não são faladas (o `ler_roteiro` tira).
- Voz escolhida para o Guilherme August: **Jerri - Warm, Conversational, Friendly**, Multilingual v2, velocidade 1.0,
  estabilidade 50, similaridade 75, estilo 0. Atafona gancho: 84/84 palavras alinhadas.
- Licença: o plano grátis do ElevenLabs não permite uso comercial; para publicar em canal monetizado, plano Starter ou acima.

## Narração sem "volume subindo" nem corte seco (01/10/2026)
O Guilherme notou no El Niño: "a voz às vezes começa suave e depois não" e "um 'shh' na troca de assunto".
Causa: `locucao.py` passava `loudnorm` em CADA pedaço de cena (no modo dinâmico ele começa baixo e sobe) e cortava no
meio da pausa sem fade (vazava o fim de um "s" ou a respiração da frase vizinha). Agora: ganho FIXO por capítulo
(medido com ebur128 → −16 LUFS), corte rente à fala (−0,15 s / +0,30 s, nunca além do meio da pausa) e fades de 40 ms
na entrada e 120 ms na saída. Para refazer um projeto antigo, apague `build/audio/` e rode o `gerar.py`.

## 03/10/2026 — ferramentas novas (longo do Senna Tower)

- `baixar_video.py <projeto> <url> <código> --autor "…"`: baixa do YouTube para `<projeto>/brutos/` (fora de `midia/`, para o
  `preparar.py` não converter o vídeo inteiro) e faz a folha de quadros. `--cortar <código> 1:20-1:26 --nome x [--recorte 0.4]`
  corta o trecho sem o som original para `midia/real/` e anota o crédito no `FONTES.txt`. Precisa do Node (runtime de JavaScript
  do YouTube). Regras de uso de trechos: `O-JACARE/longos/03-senna-tower/NOTAS.md`.
- `juntar.py <projeto>`: depois de `render.py --cap N` em paralelo (um processo por capítulo), emenda a imagem e mixa o áudio
  do vídeo inteiro de uma vez. No PC de 12 núcleos, 7 processos deram ~18 quadros/s somados.
- `OPCOES.somTransicao = { som, vol, somCapitulo, volCapitulo }`: som automático em toda troca de cena que não é corte.
- `TRILHA` com `"pasta": "sons"`: cama de ambiente em loop, de `_motor/sons/` (mixada como a trilha, abaixa debaixo da voz).
- Efeitos do ElevenLabs: a lista e os nomes estão em `O-JACARE/longos/03-senna-tower/SONS-ELEVENLABS.md`; os arquivos vão para
  `_motor/sons/elevenlabs/` (resolvido em 04/10: ver a seção abaixo).

## 03/10/2026 — estilo "gravura suja" (canal de teste Before Soap)

- `_motor/estilo-gravura.js`, ligado por `"estilos": ["gravura"]` no `projeto.json`. Marca em `CANAIS-TESTE/BEFORE-SOAP/marca/MARCA.md`.
- Peças: `gsPapel()` (papel envelhecido, feito uma vez), `gsGravura(pref, x, y, w, h, ang, p)` (a foto vira tinta sobre papel
  com borda rasgada; guardada em cache por tamanho), `gsGota` / `gsGotaCai(x, y, r, lt, tBate)` (a gota verde-lodo que liga
  as cenas), `gsPergunta(n, texto, x, y, lt)` (o cartão do capítulo é uma pergunta em Instrument Serif), `gsNota` / `gsSeta` /
  `gsMedida` (anotação à mão em Permanent Marker), `gsLugar` / `gsFonte` (fixos na tela, em Geist Mono), `gsSeloIA` e
  `gsHachura` (sombreado de gravura para desenhos feitos em código).
- **Na troca de capítulo ('suave', 1 s), a cena nova já aparece durante a mistura:** comece o que ela desenha em `lt` negativo
  (ex.: `prog(lt, -0.95, -0.35)`), senão fica ~1 s de papel vazio na tela (visto na prévia de 03/10).
- Prévia de 11 s (aprovada pelo Guilherme em 03/10): `CANAIS-TESTE/BEFORE-SOAP/videos/00-previa-motor/`.
- **O cache da mídia é por NOME DE PASTA** (`%LOCALAPPDATA%\longos-cache\<pasta>`): dois projetos com o mesmo nome (ex.: duas
  `00-previa-motor` em canais diferentes) se sobrescrevem. Dê nomes únicos (a prévia alemã virou `00-previa-motor-de`, 03/10).

## 04/10/2026 — efeitos e músicas gerados pela API do ElevenLabs (`sons_eleven.py`)

- `python sons_eleven.py` lê as tabelas (Arquivo | Pedido | Duração) de `_motor/sons/elevenlabs/CATALOGO.md` e de todo
  `SONS-ELEVENLABS.md` dentro de O-JACARE, GUILHERME-AUGUST, SHORTS-PAPEL e CANAIS-TESTE, e mostra o que falta e o custo.
  `--vai --teto <créditos>` gera; `<prefixos>` limita a alguns; `--refazer <nome>` gera de novo (o antigo vai para `_antigos/`);
  `--ouvir` junta todos os efeitos em `sons/elevenlabs/_amostra.wav`; `--indice` refaz `GERAL/BIBLIOTECA-AUDIO.md`.
- **Regra do Guilherme:** gerar só com permissão dele e a estimativa de créditos na mão. O `--teto` é o valor aprovado, e
  o script se recusa a gerar sem ele ou acima dele. Antes de gerar, procurar em `GERAL/BIBLIOTECA-AUDIO.md`.
- **Efeito** → `_motor/sons/elevenlabs/<nome>.wav`, já nivelado como os do `sons.py` (48 kHz, estéreo, pico 0,9, silêncio
  cortado, fade de 80 ms). Nas cenas: `{ t: 1.2, som: 'elevenlabs/foto_cai', vol: 0.8 }`. O render não mudou: o caminho com
  subpasta funciona como os nomes antigos (inclusive a regra do `_suave`). Os sintetizados continuam valendo.
- **Ambiente** (`amb_*`, gerado com loop sem emenda) → `TRILHA = [{ de: 0, arq: 'elevenlabs/amb_mesa.wav', pasta: 'sons', vol: 0.12 }]`.
  Atenção: `sons/amb_mesa.wav` (sintetizado) e `sons/elevenlabs/amb_mesa.wav` (ElevenLabs) são arquivos diferentes.
- **Música** (`musica_*`, instrumental, modelo `music_v2_5`) → `MUSICAS/elevenlabs/<nome>.mp3`.
  `TRILHA = [{ de: 0, arq: 'elevenlabs/musica_jacare_obra.mp3', vol: 0.2 }]`. Elas saem ~5 dB mais baixas que as da biblioteca do
  YouTube (−14,5 LUFS contra −9 do Kazoom): usar um `vol` um pouco maior que o de costume e conferir no ouvido.
- Aprendido no teste: **efeito pedido com menos de 2 s vem quase mudo** (0,8 s → pico −54 dB). O script pede no mínimo 2 s e
  corta depois; se ainda vier mudo, tenta de novo com 3 s.


## 3D de verdade com Three.js (`estilo-three.js`, 10/10/2026)

- `"estilos": ["three"]` no `projeto.json` injeta o Three.js 0.149.0 (MIT, build UMD, global `THREE`; original em `_motor/vendor/`).
- O Chrome do render tem **WebGL2 na GPU** (ANGLE, Intel, Direct3D 11; testado em 10/10). Render no mesmo ritmo do 2D (~13 q/s).
- Padrão: um `WebGLRenderer` só, com canvas próprio (`preserveDrawingBuffer: true`, fundo transparente); a cena faz `render()` e copia
  com `ctx.drawImage` para o ctx do motor, assim o 2D (legenda, textos) fica por cima. Cores em hex: `THREE.ColorManagement.legacyMode = false`
  e `outputEncoding = sRGBEncoding`; **sem tone mapping** para cores chapadas (o ACES desbota).
- Exemplo completo (terreno em camadas, torre, estacas, câmera por palavra, 4 designs): `O-JACARE/shorts/motor/00-estilos-3d-jacare/cenas/00b-3d.js`.
- Projeto sem mídia também precisa do `preparar.py` antes do `gerar.py` (é ele que cria o `manifesto.json`).

## Mapas do Stoff der Geschichte (`estilo-karte.js`, 04/10/2026)

- Ligar com `"estilos": ["colagem", "karte"]` (nessa ordem). Contornos do **Natural Earth** (domínio público): terra 1:50m
  do mundo e 1:10m da Europa, lagos e rios. **Sem fronteiras de hoje** (seriam anacrônicas nos vídeos de história).
- `const M = cgKarte(lon0, lat0, k)` desenha o mapa (fica em cache) e devolve `{X(lon), Y(lat)}`; k = pixels por grau
  (Europa ≈ 28, Alemanha ≈ 105, Salzburg/Reichenhall ≈ 3600). `cgOrt(M, lon, lat, 'NOME', p, {lado})` põe cidade;
  `cgLinhaGeo(M, pts, p, {cor: 'rota' | 'rio'})` rota pontilhada ou rio desenhado à mão; `cgNomeGeo` nome de rio ou mar.
- Para refazer os dados: baixar os .geojson (lista no topo de `_motor/dados/gerar_karte.py`) e rodar
  `python _motor/dados/gerar_karte.py <pasta>`. O código do mapa fica em `_motor/dados/karte-codigo.js`.
- Montador declarativo de cenas (lista de elementos presos a palavras, som automático da biblioteca do ElevenLabs):
  `CANAIS-TESTE/STOFF-DER-GESCHICHTE/videos/sg01-salz/cenas/00-base.js`. Copiar para os outros vídeos do canal.

## 04/10/2026 — controle de qualidade (estudo do ffmpeg-skill, `_referencias/FFMPEG-SKILL.md`)

Vale para os vídeos renderizados daqui em diante (decisão do Guilherme: os prontos não são refeitos).
- **Cor:** o `render.py` converte os quadros do Chrome (JPEG, BT.601) para **BT.709** e marca assim o MP4. Desde 04/10 (noite) com o filtro
  `colorspace` (mesma cor, vários núcleos; −34% no tempo de render). Não voltar para o `scale` sem os flags de precisão: escurece ~1–2 níveis.
- **Volume final em duas passadas:** o `mixar()` grava a mixagem bruta, mede e aplica **um ganho fixo** até −15 LUFS, com limitador
  em −2 dBFS (`nivelar()`; antes era `loudnorm` dinâmico de uma passada). O render imprime o ganho e quanto o limitador segurou.
- **`conferir.py <projeto|mp4>`:** confere codificação, pixel, tamanho, fps, duração (Shorts ≤ 180 s), cor, áudio, volume
  (−14 ±2 LUFS) e pico real (≤ −1 dBTP). **O `pronto.py` roda a conferência e não copia nada se houver FALHA**
  (`--mesmo-assim` passa por cima).
- **`medir.py`:** parou de acusar "0:00, 0:01, 0:02" baixos em todo vídeo (era a janela de 3 s enchendo, não o vídeo).

## 04/10/2026 — foto em peças (`pecas.py` + `gsGravuraPecas`; estudo em `_referencias/LEMO-WAKE.md`, código nosso)

A foto deixa de entrar inteira: ela é desmontada e as peças se mexem de verdade (navio que entra navegando, bloco que sobe).
Primeiro uso e comparação: `00-comparar-hoje/` × `00-comparar-novo/` (mesma cena do Before Soap, 10 s cada).
- `python _motor/pecas.py <projeto> <foto> --peca NOME:x0,y0,x1,y1 ... [--junto NOME:caixa] [--limpar caixa] [--folga 28]`
  grava em `<projeto>/midia/pecas/`: o fundo sem as peças, a camada "perto" (paralaxe), cada peça recortada (PNG transparente
  do tamanho da foto), a profundidade, o `pc-<foto>.json` (caixa e profundidade de cada peça) e uma folha de conferência.
  Caixas em pixels da foto original. **Olhe a folha antes de animar.** No Centurion: ~80 s na CPU.
- Modelos (ONNX, CPU): Depth Anything V2 Small, MobileSAM e LaMa, ~350 MB em `%LOCALAPPDATA%\motor-modelos`. Somem no reboot e
  o `pecas.py` baixa de novo sozinho (grátis, sha256 conferido).
- **O que custou tentativas no Centurion:** (1) o recorte pega o corpo e perde o traço fino (verga, corda, bandeira); sobrando no
  fundo, o LaMa "continua" o traço e refez um navio fantasma. Agora a tinta a até `--folga` px da peça sobre o fundo distante
  (céu, pela profundidade) vai junto com ela. (2) Preencher uma região pequena depois de uma grande sobrescrevia o que estava bom
  (retângulo cinza): agora cada pixel é preenchido uma vez, as maiores primeiro, com recorte justo. (3) `--fundo linhas`
  (copiar a textura da mesma linha) fez blocos claros no céu: o LaMa ficou melhor nas gravuras.
- `preparar.py`: PNG com transparência continua PNG no cache (antes virava JPG e perdia o recorte).
- Na cena: `gsGravuraPecas('G01', info, x, y, w, h, ang, p, { par, ordem, pecas: { nome: { dx, dy, rot, alpha } } })`
  (`estilo-gravura.js`), com a mesma tinta e a mesma borda rasgada da `gsGravura`. Exemplo completo, com o navio que entra
  navegando, aderna e balança (`navega()`): `00-comparar-novo/cenas/01-cena.js`. Por enquanto só no estilo gravura.
- O `medir.py` dá 0% parado nos DOIS vídeos da comparação (a câmera viva mexe tudo): a régua de tempo parado não mede se as
  coisas da imagem se mexem. Isso se julga olhando.
- Achado de passagem: a G01 (Google Books) tem a marca-d'água "Copyrighted material" no canto de baixo. O `pecas.py --limpar` tira.
- **04/10/2026 (mais tarde): colagem e pontilhado.** `cgRecorte('viva-<foto>')` refaz o recorte a cada quadro (a colagem
  guardava em cache); o pontilhado já refazia sozinho. `pecas.py --fundo papel` para desenho de linha (o buraco vira papel limpo,
  nada de traço inventado) e máscara do MobileSAM com os furos tapados. `fotoViva` aceita `recorte: true` por peça (só aparece
  dentro da caixa: bloco que sobe do chão). Demonstrações em `00-comparar-estilos/`.
