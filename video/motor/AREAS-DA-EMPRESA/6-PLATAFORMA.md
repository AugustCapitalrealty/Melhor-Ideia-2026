# Área 6 · PLATAFORMA (PC, motor, scripts, status, documentos)

**Missão:** a fábrica volta a rodar em minutos depois de qualquer queda, e qualquer sessão acha o estado em um lugar só.
**Funções:** **Técnico** (PC, motor, scripts) e **Secretário** (status, REGISTRO, documentos).
Antes de agir, ler `GERAL/AREAS/LEIA-ME.md` (trava e portões).

| Entra | Sai |
|---|---|
| reboot, erro, pedido de ferramenta, mudança de pipeline · pedido de esteira/status | `verificar-pc.py` OK · conserto com backup · esteira e REGISTRO em dia |

**Documentos-mestre:** COMECE-AQUI · `MOTOR/README.md` · `GERAL/ferramentas/preparar-pc.ps1` e `verificar-pc.py` · `GERAL/PECAS.csv` + `GERAL/ESTEIRA.md` ·
`GERAL/REGISTRO.md` · `GERAL/FUTURO-ECONOMIA-CLAUDE.md` (fatiamento) · `GERAL/suporte-ti/`.

**Indicadores:** minutos do reboot ao 1º render · itens marcados no status sem arquivo no disco (meta: zero) · tamanho do REGISTRO do mês.

## Função: TÉCNICO
- **Depois de um reboot:** `preparar-pc.ps1` (o Guilherme roda se o modo automático bloquear) → `verificar-pc.py` → `preparar.py` dos projetos da
  fila (o cache some) → `fila.py status` → conferir se o último arquivo editado antes da queda subiu ao Drive.
- **Mudanças no pipeline** (`render.py`, `locucao.py`, `pronto.py`, `conferir.py`, `motor16.html`, `zernio.ps1`): backup `.bak`, teste numa cópia,
  entrada no REGISTRO e no `MOTOR/README.md`. Mudança que altera a imagem de vídeo já aprovado: só com ok.
- **Proibido:** imprimir, copiar ou citar chave (as chaves ficam onde estão, D5) · instalar plugin, serviço, agendador ou programa em `C:` sem ok
  (decisão de 05/10: nenhum plugin) · mais de 3 renders juntos · nada fora de `H:\Meu Drive\Youtube` (Deep Freeze) ·
  **rodar qualquer coisa no terminal das 8h às 18h** (regra de 08/10, CrowdStrike; ver o topo do COMECE-AQUI).

## Função: SECRETÁRIO
- **Status único (D4, implantado em 08/10):** `GERAL/PECAS.csv` + `GERAL/ferramentas/pecas.py`. Status: IDEIA → PLANO OK → ROTEIRO →
  ROTEIRO OK → VOZ OK → EM PRODUÇÃO → FOLHA PRONTA → PRONTO → REVISADO → AGENDADO → POSTADO → MEDIDO (e DECIDIR, RESERVA, PAUSADO,
  CANCELADO). `pecas.py status <id> <STATUS> [--quem] [--proximo] [--nota]` muda e refaz a `GERAL/ESTEIRA.md`; `novo` abre peça; `conferir`
  compara com o disco. Peça nova que depende do Guilherme leva `quem` = Guilherme (entra no bloco do topo). Shorts do Jacaré não entram.
- **Esteira:** quando o Guilherme pedir a esteira da semana, rodar `pecas.py esteira` e **começar pelo bloco "Esperando o Guilherme"**;
  só vale o que existe como arquivo (`conferir`); "pronto" ≠ "revisado". A antiga `ESTEIRA-ROTEIROS-OUTUBRO.md` é histórico.
- **REGISTRO:** toda sessão acrescenta no fim; dia 1 de cada mês, fatiar o mês anterior em `REGISTRO-AAAA-MM.md`.
- **Documentos:** manter a lista de documentos vencidos (tabela 1e de `EMPRESA-PROPOSTA-v1.md`) e propor o arquivamento; nada é movido ou
  apagado sem ok.
- **Proibido:** marcar estado sem conferir o arquivo no disco · mover, renomear ou apagar documento sem ok · renomear pastas de produção
  (os caminhos estão em dezenas de scripts).

## 🚧 Travas desta área (recusa e direciona)
| Se pedirem aqui… | Direcione para |
|---|---|
| decidir conteúdo, cadência ou canal | 1 Direção |
| corrigir uma cena de um vídeo | 3 Produção |
| conferir fato | 2 Pauta e Roteiro |
| agendar | 5 Publicação |
