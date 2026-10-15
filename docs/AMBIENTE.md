# Ambiente da máquina (Deep Freeze no C:)

O C: volta ao estado congelado a cada reinício. O repositório (G:) e o GitHub sobrevivem; o que está só no C: some.
Conferido em 15/10/2026.

## O que sobreviveu ao último reinício e o que não

| Item | Onde | Sobrevive? |
| :--- | :--- | :--- |
| Node v24 portátil, com clasp 3.4.1 | `%LOCALAPPDATA%\node\node-v24.22.0-win-x64` | Sim, em 15/10 estava lá; **não está no PATH** |
| Git | `C:\Program Files\Git\cmd` | Sim; **não está no PATH** do PowerShell (o Bash do Git tem) |
| Python 3.13 | `%LOCALAPPDATA%\Programs\Python\Python313` | Não estava em 15/10; reinstalar (abaixo) |
| Login do clasp | `%USERPROFILE%\.clasprc.json` | Estava em 15/10 |
| Memória do Claude, scratchpad, cache do motor de vídeo | C: | **Não.** Tudo que importa está no repositório ou no Drive |

## Remontar em 5 minutos

```powershell
# 1) PATH do usuário (vale para terminais novos)
$n = "$env:LOCALAPPDATA\node\node-v24.22.0-win-x64"; $g = "C:\Program Files\Git\cmd"
$u = [Environment]::GetEnvironmentVariable("Path","User"); foreach ($p in @($n,$g)) { if ($u -notlike "*$p*") { $u = "$u;$p" } }
[Environment]::SetEnvironmentVariable("Path",$u,"User")

# 2) Python 3.13 (instalação por usuário, sem admin) e os pacotes usados
$f = "$env:TEMP\py.exe"; Invoke-WebRequest "https://www.python.org/ftp/python/3.13.16/python-3.13.16-amd64.exe" -OutFile $f -UseBasicParsing
Start-Process $f -ArgumentList "/quiet InstallAllUsers=0 PrependPath=1 Include_test=0 TargetDir=`"$env:LOCALAPPDATA\Programs\Python\Python313`"" -Wait
& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" -m pip install openpyxl pypdf pypdfium2 pillow
```

Se o Node sumir: baixar o zip portátil do Node 24 para `%LOCALAPPDATA%\node\` e `npm i -g @google/clasp`.
Conferir: `npm test` (34 scripts) tem de sair com código 0.

## Ferramentas por tarefa

| Tarefa | Como |
| :--- | :--- |
| Apresentação (PNG + PDF) | `node relatorio/rascunho/gerar.cjs` → `relatorio/rascunho/saida/` (fora do git); o PDF é montado com Pillow juntando os PNGs |
| Google Slides | `relatorio/google-slides/` (projeto Apps Script `1yVvcjY7…`): `gerarApresentacao` (imagens) e `gerarApresentacaoNativa` (PNG de fundo + texto editável). Antes da nativa: `node relatorio/google-slides/extrair.cjs "G:\Meu Drive\MELHOR IDEIA 2026\APRESENTACAO-SLIDES-NATIVA"`. Push: `clasp push -f` dentro da pasta |
| Playwright (extrair.cjs, recontagem) | `npm i playwright-core@1.48.2` numa pasta **fora** do repositório e apontar `PLAYWRIGHT_MODULE` para `<pasta>\node_modules\playwright-core`; usa o Chrome instalado |
| Recontar escopos na produção | `tools/playwright-recontar-escopos.cjs` (perfil com login fica em `%TEMP%\melhor-ideia-playwright`) |
| Vídeo | `video/motor/_motor`: `preparar.py`, `gerar.py`, `checar.py`, `render.py <projeto> [--folha N]`. Projeto: `video/02-relatorio/rascunho-ia` |
| Voz do vídeo | API do ElevenLabs (`_motor/eleven_api.py`), voz "Lucas – Natural, Calm and Steady" (`SVgp5d1fyFQRW1eQbwkq`), modelo `eleven_v4`. Chave: `H:\Meu Drive\Youtube\GERAL\ferramentas` (`eleven_historico.chave_api`) ou `ELEVENLABS_API_KEY`. Nunca imprimir nem versionar a chave |
| Trilha | `video/MUSICAS/elevenlabs/musica_corporativa.mp3` (no Drive, fora do git) |

## Onde está o que não vai para o git

| O quê | Onde (Drive) |
| :--- | :--- |
| Pasta de entrega ao comitê | `G:\Meu Drive\MELHOR IDEIA 2026\ENTREGA-COMITE-2026-10-15` |
| PNGs para o Google Slides | `G:\Meu Drive\MELHOR IDEIA 2026\APRESENTACAO-SLIDES-PNG` e `APRESENTACAO-SLIDES-NATIVA` |
| Transcrição do Mega Itajaí, textos dos 9 escopos, pareceres originais | `G:\Meu Drive\MELHOR IDEIA 2026\FONTES-SESSAO-2026-10-15` |
| Fotos da capa e contracapa | `G:\Drives compartilhados\08.000 - Business Analysis\APRESENTAÇÃO ORÇAMENTO\_fotos-subcapas` (cópia em `relatorio/rascunho/midia/fotos/`) |
| Escopos antigos (miniaturas) | `relatorio/rascunho/midia/antigos/` e `video/02-relatorio/rascunho-ia/midia/real/` |
