# Área 2 · PAUTA E ROTEIRO

**Missão:** pauta aprovada vira roteiro com cada fato conferido, antes de qualquer voz ou animação.
**Funções:** **Roteirista** (escreve) e **Checador** (confere). Nunca a mesma sessão escreve e confere o mesmo roteiro.
Antes de agir, ler `GERAL/AREAS/LEIA-ME.md` (trava e portões).

| Entra | Sai |
|---|---|
| pauta com PLANO OK (Direção) ou do calendário já aprovado; pergunta de seguidor (`GUILHERME-AUGUST/PESQUISA-TEMAS.md`) | `ROTEIRO.md` + `LOCUCAO.md` (ou `LOCUCAO-elevenlabs.md`) + tabela de fatos do Checador → **ROTEIRO OK** |

**Documentos-mestre:** `GERAL/LINHA-EDITORIAL.md` · `SHORTS-PAPEL/README.md` (regras do Short) · `CANAIS-TESTE/GUIA-ROTEIROS.md` ·
`SHORTS-PAPEL/PROMPT-VALIDACAO-ROTEIROS.md` (base do Checador) · `SHORTS-PAPEL/REVISAO-ROTEIROS-04-10.md` (o método e a lição) ·
`CANAIS-TESTE/STOFF-DER-GESCHICHTE/ALERTAS-PROXIMOS-VIDEOS.md` · `GUILHERME-AUGUST/carrosseis/ESTRATEGIA.md` (texto dos carrosséis).

**Indicadores:** % de roteiros aprovados sem volta · fatos corrigidos depois da voz (meta: zero) · dias de roteiro aprovado à frente da produção.

## Função: ROTEIRISTA
- **Missão:** escrever o roteiro na linha editorial do canal.
- **Lê:** a pauta, a linha editorial, o guia do formato, os alertas.
- **Entrega:** `ROTEIRO.md` (com "## Fontes" e "Cuidados") e `LOCUCAO.md`; para longos, `roteiro_para_locucao.py` gera a locução (os dois nunca diferem).
- **Regras:** Short de papel ≥ 170 palavras (0,375 s por palavra; mínimo 61 s), pergunta no quadro 0, carimbo MITO/VERDADE/EXPLICADO;
  o August Explica **não** termina com "caso nº X, até o próximo"; o jacaré nunca entra no August; dica de segurança conferida na fonte oficial.
- **Proibido:** começar ideia nova sem PLANO OK · escrever fonte que não abriu · absoluto sem base · gerar voz · mexer em cena.

## Função: CHECADOR (portão D3)
- **Missão:** abrir cada fonte (curl/WebFetch) e conferir cada número, nome e data **antes da voz**.
- **Entrega:** tabela de fatos no fim do `ROTEIRO.md` (fato · fonte · link aberto · trecho · ok/corrigir) e veredito: ROTEIRO OK ou VOLTA.
- **Proibido:** aprovar fonte que não abriu (404, página inicial, link inventado = reprovado) · reescrever o estilo · ser a sessão que escreveu.

## Processo (ciclo do roteiro)
1. Pauta (calendário aprovado, ou ideia nova com PLANO OK).
2. Roteirista escreve → **pronto quando** duração, pergunta, carimbo e fontes estão no arquivo.
3. Checador confere → **pronto quando** todo fato tem link aberto.
4. 🔒 Guilherme aprova (em lote, de preferência no domingo) → `pecas.py status <id> "ROTEIRO OK"`.
5. Passa para o Guilherme gerar a voz no site e para a Produção.
**Fato errado descoberto depois da voz:** frase a mais = cortar no silêncio; frase errada = o Guilherme gera só aquela frase e a Produção emenda.

## 🚧 Travas desta área (recusa e direciona)
| Se pedirem aqui… | Direcione para |
|---|---|
| ideia nova sem plano aprovado | 1 Direção (plano primeiro) |
| gerar a voz | o Guilherme (site do ElevenLabs) |
| animar, cenas, render, capa | 3 Produção (só com ROTEIRO OK) |
| decidir se publica | 4 Qualidade e o Guilherme |
| agendar, legenda na hora de postar | 5 Publicação |
