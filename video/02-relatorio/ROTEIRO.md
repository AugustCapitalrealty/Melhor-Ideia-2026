# Gestão de Contratações · vídeo do relatório (2–3 min) — v3, 11/10/2026

Pedido do Guilherme em 11/10/2026: *"me manda o roteiro para eu gerar no ElevenLabs"*. Escala: **a empresa toda** é proposta; o uso
começou pelos três Megas. O conselho aprovou a parte do escopo; fornecedor e preço serão feitos **com a TI** (Fluig/RM ainda não
integrado; o vídeo não diz que existe). Mesma história do deck (`relatorio/rascunho/`).

- **v3** aplica o parecer do Checador (`CHECAGEM-ROTEIRO-2026-10-11.md`, feito sobre a v1): abertura no caso, oferta (não execução),
  laudo sem conclusão jurídica, preço sem discriminação (não "sem abrir"), VB × KG num só item, dois botões, reaproveitamento parcial,
  testes sem "toda mudança", integração como proposta. **Rodar o Checador de novo nesta v3 antes de gerar a voz.**
- **Imagens:** só capturas reais do app e dos documentos que ele gera; casos do capítulo 1 e linha do tempo como **cartões de texto**
  (não imitar captura). Recortes obrigatórios: sem a barra de abas antiga (E01, E02, E05, C01); D02 só acima da caixa "Emissão &
  responsável"; D90/E04 sem a barra do Google (foto de perfil) e só até a linha 22 (a 25 tem nome e telefone). Não usar E06 nem C02–C09/T02–T05.
- **Voz:** o Guilherme gera no ElevenLabs, um MP3 por capítulo, em `voz/N-nome.mp3`. Texto para colar: `LOCUCAO-elevenlabs.md`.
- **Capítulo 7 (tempo) só depois da medição de 14/10**, com a mesma estatística do slide 9 (mediana) e o tamanho da amostra.

**Som (gerado no ElevenLabs em 11/10/2026, `sons/gerar_sons.py`; corporativo, pouco e baixo):**

| Onde | Som | Volume |
| :--- | :--- | :--- |
| O vídeo todo, sob a voz | `TRILHA = [{ de: 0, arq: 'elevenlabs/musica_contratacoes.mp3', vol: 0.10 }]` (instrumental, 2:40) | 0,10 |
| Troca de capítulo | `relatorio/transicao` | 0,35 |
| Número ou caso que aparece (2·3·12, "1 preço", "VB × KG", "revisão nove") | `relatorio/destaque` | 0,45 |
| Cada documento gerado (3.4) e o primeiro chip do escopo base (4.2) | `relatorio/documento` | 0,40 |
| Botões "Gerar Slides e PDF", "Gerar planilha" e "Usar como base" | `relatorio/clique` | 0,50 |
| Logo no fecho (8.2) | `relatorio/fecho` | 0,50 |
| **Não usar** | plim, brilho, máquina, pop agudo (sons de canal) | — |

| Fato falado | Fonte |
| :--- | :--- |
| Ar-condicionado: 3 propostas, "1,00 VB" anual, 2, 3 e 12 visitas/ano; uma (a de 2 visitas) sem o laudo PMOC com ART previsto | `docs/BASE_DE_CONHECIMENTO.md` §8.4; mapa original `MCtba - Mapa de Equalização Manut Preventiva + Emissão de PMOC_v02.pdf` (conferido pelo Checador) |
| Mão de obra com um preço no item pai; infraestrutura, passagem de cabos e instalação do painel descritas, sem preço separado | `docs/BASE_DE_CONHECIMENTO.md` §16.3 |
| Fundação: posicionamento da armadura em VB (2 propostas) e KG (2 propostas) | `docs/BASE_DE_CONHECIMENTO.md` §9.2 |
| Ideia aprovada; comitê pediu detalhes porque parte já existe no Fluig; conselho aprovou o escopo, o restante com a TI | e-mails de 29/04 e 19/05/2026; aprovações informadas pelo Guilherme (`docs/HISTORICO.md`, 11/10/2026) — **datas a confirmar** |
| Do mesmo cadastro saem apresentação, PDF e planilha, em duas etapas (dois botões) | `app/EscopoInterface.html`; tela E05 |
| Escopo base: o que vem e o que se preenche | `app/Escopos.gs`; `docs/HISTORICO.md` (v76, 11/10/2026) |
| Escopos emitidos nos três Megas: Curitiba (bombas de água potável; adequações elétricas), Itajaí (sinalização viária; bombas de drenagem; PPCI do prédio de apoio), Esteio (manutenção do piso DHL, R3) | PDFs gerados pelo sistema em `G:\Meu Drive\MELHOR IDEIA 2026\PLANO\` (lidos em 11/10/2026) |
| PPCI do prédio de apoio de Itajaí na revisão 9; revisões R4 a R9 registradas | tela E05; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json` |
| Pedidos de usuários viraram versão | `docs/HISTORICO.md` 02/10 e 11/10/2026 |
| 34 suítes de teste, rodadas antes de publicar | `package.json`; `docs/HISTORICO.md` (publicação da v77) |

## 1 · O PROBLEMA

**1.1 · AR-CONDICIONADO (cartão).** Quadro 0 já em ação: três cartões "Proposta A / B / C", sem nomes e sem valores, todos com
"1 verba anual"; acendem "2 visitas/ano", "3 visitas/ano", "12 visitas/ano".

> Três propostas para a manutenção do ar-condicionado. Duas, três e doze visitas por ano, no mesmo item cotado como verba anual.

**1.2 · O LAUDO (cartão).** No cartão de 2 visitas: "sem o laudo PMOC com responsabilidade técnica previsto no pedido".

> Uma delas não incluía o laudo com responsabilidade técnica que o pedido previa.

**1.3 · PREÇO SÓ NO TOTAL (cartão).** "Mão de obra: 1 preço" e, abaixo, "infraestrutura · passagem de cabos · instalação do painel"
com "sem preço separado".

> Em outro caso, a mão de obra veio com um preço só. Infraestrutura, passagem de cabos e instalação do painel estavam descritas, mas sem preços separados.

**1.4 · VERBA OU QUILO (cartão).** "Posicionamento da armadura": "VB" em duas propostas, "KG" nas outras duas.

> Numa obra de fundação, o mesmo item veio em verba numa proposta e em quilos em outra.

**1.5 · A CONCLUSÃO (cartão).** Frase em azul-marinho.

> Esses casos mostram o que o escopo precisa deixar explícito antes de comparar propostas.

## 2 · A APROVAÇÃO

**2.1 · A LINHA DO TEMPO (cartão).** As cinco paradas do slide 5: inscrição → o comitê pede detalhes → ideia aprovada → escopo em
produção (setembro) → o conselho aprova o foco.

> A ideia inscrita foi avaliar prestadores de serviço, e ela foi aprovada. O comitê pediu mais detalhes, porque parte desse processo já existe no Fluig.

**2.2 · O QUE OS DOCUMENTOS MOSTRARAM.** A parada "escopo em produção" acende.

> A análise de documentos reais mostrou diferenças no que os fornecedores ofereciam.

**2.3 · O CONSELHO.** A última parada acende; cartão "Aprovado pelo conselho: o escopo · Com a TI: fornecedor e preço".

> Por isso, o conselho aprovou começar pelo escopo. Fornecedor e preço serão feitos junto com a TI.

## 3 · A SOLUÇÃO

**3.1 · O CADASTRO (E01, sem a barra de abas).** O grupo "Instalação dos Equipamentos do SDAI", serviços uma atividade por linha.

> Hoje, o escopo é montado no sistema. Os serviços entram por local, uma atividade por linha.

**3.2 · AS IMAGENS (E01, mais abaixo).** As plantas anexadas ao grupo.

> As imagens ficam vinculadas ao serviço.

**3.3 · A EAP (E02, sem a barra de abas).** Itens 1.2 a 1.7 com quantidade, unidade e marca de referência.

> A lista de itens traz quantidade, unidade e marca de referência.

**3.4 · OS DOCUMENTOS (E05 → D02 → E03 → D90).** O botão "Gerar Slides e PDF"; a capa do deck (só acima da caixa de responsável);
o registro fotográfico; depois o botão "Gerar planilha para fornecedor" e a planilha (sem a barra do Google, até a linha 22).

> Do mesmo cadastro saem a apresentação, o PDF e a planilha para o fornecedor, gerados em duas etapas.

## 4 · REAPROVEITAR

**4.1 · A TELA DE INÍCIO (C01, sem a barra de abas).** Os cartões dos escopos emitidos e o botão "Usar como base".

> O próximo escopo pode partir de um já emitido.

**4.2 · O QUE VEM E O QUE SE PREENCHE (cartão).** Os chips do slide 8: azuis (vêm) e cinza (preencher).

> Vêm os serviços, a lista de itens, as inclusões, as exclusões e o aceite. Título, local, fotos, contato e prazos são preenchidos para a nova contratação.

## 5 · EM USO

**5.1 · OS TRÊS MEGAS (cartão) E AS REVISÕES (E05, sem a barra de abas).** "Curitiba · Itajaí · Esteio"; depois "Arquivos
emitidos" do PPCI de Itajaí, R4 a R9; no fim, cartão "Proposta: toda área da empresa que contrata".

> Já há escopos emitidos nos três Megas: Curitiba, Itajaí e Esteio. No prédio de apoio de Itajaí, o escopo do sistema de incêndio chegou à revisão nove, com as revisões registradas. A proposta é levar esse padrão a toda área da empresa que contrata.

## 6 · QUEM USA PEDE, O SISTEMA MUDA

**6.1 · OS PEDIDOS (cartão).** A linha do tempo do slide 12, pedido a pedido, com a versão acendendo ao lado.

> Pedidos de quem usa viraram versões: texto padronizado, imagens logo após o serviço e texto justificado. Depois, o aviso padrão do Facilities e os escopos base.

**6.2 · OS TESTES (cartão).** "34 suítes de teste antes de publicar".

> Há testes automatizados, rodados antes de publicar.

## 7 · O TEMPO (gravar só depois da medição de 14/10)

**7.1 · O CRONÔMETRO (cartão).** Dois números grandes, PowerPoint × sistema, com "mediana · amostra de N escopos" embaixo; os mesmos
números do slide 9.

> Na amostra de [N] escopos, a mediana foi de [X] minutos no sistema e [Y] no PowerPoint, do primeiro campo ao PDF pronto.

## 8 · O PRÓXIMO PASSO

**8.1 · PRÓXIMOS PASSOS (cartões).** "Proposta: padrão para a empresa toda" e "Com a TI: fornecedor e preço no Fluig/RM". Sem a tela
de fornecedores.

> A proposta é levar o padrão para a empresa toda. E, junto com a TI, integrar fornecedor e preço ao Fluig e ao RM, usando o cadastro oficial, para evitar uma base duplicada.

**8.2 · FECHO.** Fundo azul-marinho, logo negativo, assinatura e o nome do projeto.

> Gestão de Contratações. Começar melhor. Contratar melhor.
