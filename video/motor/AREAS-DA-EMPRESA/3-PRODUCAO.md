# Área 3 · PRODUÇÃO (Flow, motor, áudio, capa)

**Missão:** roteiro aprovado vira pacote pronto, no padrão de qualidade.
**Funções:** **Promptista do Jacaré** e **Produtor** (motor). O Guilherme gera no Flow e a voz no site.
Antes de agir, ler `GERAL/AREAS/LEIA-ME.md` (trava e portões).

| Entra | Sai |
|---|---|
| ROTEIRO OK + `voz/*.mp3` (motor) · tabela de views do dia (Jacaré) | pasta em `VIDEOS-PRONTOS/<CANAL>/<SHORTS|LONGOS>/` (PRONTO) · `_jacare_DD-MM_*.txt` + página de prompts · slides do carrossel |

**Documentos-mestre:** `MOTOR/README.md` · `MOTOR/QUALIDADE-VIDEO.md` · `GERAL/HISTORICO-MOVIMENTOS.md` · `GERAL/BIBLIOTECA-AUDIO.md` ·
`SHORTS-PAPEL/README.md` · `O-JACARE/shorts/prompts/ARSENAL.md` + `GERAL/receitas-flow/RECEITA-8S.md` · `O-JACARE/shorts/prompts/pagina/LEIA-ME.md` ·
`VIDEOS-PRONTOS/LEIA-ME.md`.

**Indicadores:** estoque pronto em dias por linha (meta August ≥ 4) · tempo parado (`medir.py`) · peças refeitas depois do pronto (meta < 3 em 10).

## Função: PROMPTISTA DO JACARÉ
- **Missão:** os prompts do dia, a partir das views da manhã (Direção).
- **Entrega:** `_jacare_<DD-MM>_<N>_*.txt` e a página no mesmo link (`gerar_pagina.py` + publicar com o `url` de sempre).
- **Regras:** copiar um vencedor e trocar uma coisa · cenário sempre de luxo · bola: nada amarelo/azul nem vocabulário de futebol profissional ·
  sem bicho até segunda ordem · não julgar antes de 24 h.
- **Proibido:** escrever prompt de dia futuro (prompt é do dia, pelo desempenho; dia futuro sem prompt não é pendência).

## Função: PRODUTOR (motor)
- **Missão:** cenas, alinhamento, render, sonoplastia, capa e pacote.
- **Entrega:** cenas → `gerar.py` → `checar.py` → **folha** (`revisar.py auto` ou `render.py --folha`) → (parecer do Auditor) → render →
  `medir.py` → `capa.py` → `pronto.py` (roda o `conferir.py`).
- **Regras:** ficha da cena e régua de gosto (`QUALIDADE-VIDEO.md`) · biblioteca de áudio primeiro · **sem ruído de ambiente sintético sob a voz**
  (nada de `amb_*` sintetizado) e carimbo sem pancada nos longos · no máximo 3 renders juntos e um Whisper por vez · render longo só com o
  "fila on" do Guilherme · `projeto.json` escrito com bash (sem BOM) · capa de longo editorial com foto real P&B, a obra como herói, sem o jacaré ·
  **capa de longo = sempre 2 versões em teste A/B** no "Testar e comparar" do YouTube (Guilherme, 08/10: "eu não escolho, fazemos teste A/B"):
  `publicacao.json` "capas" com CAPA.jpg (A) + CAPA-teste.jpg (B), e o PUBLICAR manda testar, não diz "se quiser"; resultado anotado no REGISTRO ·
  tucano no rodízio · papel "em dois" e tremido **reprovados** · vídeo já aprovado não é refeito.
- **Proibido:** começar animação sem ROTEIRO OK · gerar voz · gerar no ElevenLabs sem "sim" e `--teto` · render final antes do parecer do
  Auditor na folha (D3) · mudar fato do roteiro (devolver para a Pauta) · agendar ou publicar.

## Processo (motor, Short ou longo)
1. ROTEIRO OK + VOZ OK → `preparar.py` (projeto novo ou depois de reboot) → cenas.
2. `gerar.py` + `checar.py` sem erro → folha → **FOLHA PRONTA** → Qualidade.
3. Corrigir o que o parecer bloquear → render → `medir.py` (nada parado > 0,6 s fora de leitura) → capa → `pronto.py` → **PRONTO**.
4. O `pronto.py` marca PRONTO no `GERAL/PECAS.csv` sozinho, e a peça entra no bloco "Esperando o Guilherme" da `GERAL/ESTEIRA.md`. Etapas antes disso: `pecas.py status <id> EM PRODUÇÃO` / `FOLHA PRONTA`.
**Carrossel:** `carrossel.mjs <pasta>` → `build/folha.jpg` → revisão do Guilherme (texto e slides).
**Mudança no motor:** peça nova num estilo de projeto pode, com backup; mudança que vale para todos os vídeos (`render.py`, `locucao.py`,
`pronto.py`, `motor16.html`) é da Plataforma.

## 🚧 Travas desta área (recusa e direciona)
| Se pedirem aqui… | Direcione para |
|---|---|
| animar algo sem ROTEIRO OK | 2 Pauta e Roteiro (checar e aprovar antes) |
| ideia nova ("faz um vídeo de X") | 1 Direção (plano primeiro) |
| gerar voz | o Guilherme (site do ElevenLabs) |
| "está bom para publicar?" | 4 Qualidade |
| agendar, legenda de post, comentários | 5 Publicação |
| PC caiu, Python sumiu, mudar o pipeline do motor | 6 Plataforma |
