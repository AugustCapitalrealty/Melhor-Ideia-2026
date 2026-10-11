# Gestão de Contratações · vídeo do relatório (2–3 min) — v1, 11/10/2026

Pedido do Guilherme em 11/10/2026: *"enquanto a análise roda, me manda o roteiro para eu gerar no ElevenLabs"*. Escala: **a empresa toda**, não só os Megas (Guilherme, 11/10: "não vai ser apenas para os 3 Megas, é para a empresa toda"). Segue a
[estratégia aprovada](../../docs/ESTRATEGIA_NOTA_MAXIMA.md) e o rascunho do deck (`relatorio/rascunho/`): só o escopo; preço,
equalização e fornecedores ficam fora. Fluig/RM é **próximo passo** (não existe ainda; o vídeo não diz que existe).

- **Imagens:** só capturas reais do app e dos documentos que ele gera (`video/capturas/2026-10-11/`), sem a aba de preço, sem
  telefone e sem foto de perfil. Visual corporativo (fundo branco ou azul da marca, cartões limpos), nada de efeito de YouTube.
- **Voz:** o Guilherme gera no ElevenLabs, um MP3 por capítulo, em `voz/N-nome.mp3`. Texto para colar: `LOCUCAO-elevenlabs.md`.
- **Capítulo 7 (tempo) só depois da medição de 14/10.** Os depoimentos entram como cartão de texto, com o nome de quem disse.
- **Portão:** o Checador (outra sessão) confere cada fato antes do render final. Se um fato cair, refaz-se só aquele capítulo.

**Som (gerado no ElevenLabs em 11/10/2026, `sons/gerar_sons.py`; corporativo, pouco e baixo):**

| Onde | Som | Volume |
| :--- | :--- | :--- |
| O vídeo todo, sob a voz | `TRILHA = [{ de: 0, arq: 'elevenlabs/musica_contratacoes.mp3', vol: 0.10 }]` (instrumental, 2:40) | 0,10 |
| Troca de capítulo | `relatorio/transicao` | 0,35 |
| Número ou caso que aparece (2·3·12, "1 preço", "3 unidades", "revisão nove") | `relatorio/destaque` | 0,45 |
| Cada um dos três documentos gerados (3.4) e cada chip do escopo base (4.2, só no primeiro) | `relatorio/documento` | 0,40 |
| Botão "Gerar Slides e PDF" e "Usar como base" | `relatorio/clique` | 0,50 |
| Logo no fecho (8.2) | `relatorio/fecho` | 0,50 |
| **Não usar** | plim, brilho, máquina, pop agudo (sons de canal) | — |

| Fato falado | Fonte |
| :--- | :--- |
| Manutenção de ar-condicionado (PMOC): 3 proponentes cotaram "1,00 VB" e entregam 2, 3 e 12 visitas/ano; um não emite o laudo exigido (Lei 13.589/2018) | `docs/BASE_DE_CONHECIMENTO.md` §8.4 (documentos reais analisados em 05/09/2026) |
| Mão de obra com preço fechado no item pai; infraestrutura, passagem de cabos e instalação do painel sem preço | `docs/BASE_DE_CONHECIMENTO.md` §16.3 |
| Fundação: o mesmo serviço cotado em VB, KG e M³ conforme o proponente | `docs/BASE_DE_CONHECIMENTO.md` §9.2 |
| O comitê aprovou a avaliação de prestadores; ela foi construída | `docs/RESPOSTA_AO_COMITE.md`; `docs/ESTRATEGIA_NOTA_MAXIMA.md` §2 |
| Um cadastro gera apresentação, PDF e planilha, com a mesma EAP e a mesma revisão | app em produção; capturas de 11/10/2026 |
| Escopo base: o que vem pronto e o que fica em branco | `docs/HISTORICO.md`, v76 (11/10/2026) |
| PPCI do prédio de apoio de Itajaí na revisão 9 | tela Escopos em produção, 11/10/2026 |
| Uso começou pelos três Megas; o padrão serve à empresa toda (proposta, não uso atual) | `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md` §9 ("6 reais emitidos nos 3 Megas", leitura de 11/10). **Checador: confirmar Esteio na base** |
| Pedidos de usuários viraram versão (fonte única, fotos junto, justificado, aviso padrão, escopos base) | `docs/HISTORICO.md` 02/10 e 11/10/2026 |

## 1 · O PROBLEMA

**1.1 · ABERTURA (manutenção de ar-condicionado).** Quadro 0 já em ação: três colunas de proponentes, sem nomes e sem valores,
todas com "1,00 VB" na quantidade. Por baixo de cada uma acende a observação real: "2 visitas/ano", "3 visitas/ano", "12 visitas/ano".

> Na empresa, o mesmo pedido volta do fornecedor de jeitos diferentes. Num contrato de manutenção de ar-condicionado, três empresas cotaram o mesmo item como uma verba só. Uma fazia duas visitas por ano, outra três, outra doze.

**1.2 · O LAUDO.** A terceira coluna ganha o selo laranja "não emite o laudo exigido em lei".

> E uma delas não emitia o laudo que a lei exige.

**1.3 · PREÇO FECHADO.** Uma árvore de EAP: "Mão de obra" com um valor único (borrado) e, abaixo, "infraestrutura",
"passagem de cabos", "instalação do painel" com a célula de preço vazia.

> Em outra contratação, a mão de obra veio com um preço fechado, sem abrir o que estava dentro: infraestrutura, passagem de cabos, instalação do painel.

**1.4 · CADA UM NA SUA UNIDADE.** Uma linha de uma obra de fundação: o mesmo serviço em "VB", "KG" e "M³", conforme o proponente.

> Numa obra de fundação, cada proponente usou a sua própria unidade para o mesmo serviço.

**1.5 · A CONCLUSÃO.** Cartão branco, frase em azul-marinho.

> Quando o escopo deixa margem, cada fornecedor entende de um jeito, e a comparação deixa de ser justa. O problema nasce no escopo.

## 2 · A VIRADA

**2.1 · A LINHA DO TEMPO.** As quatro paradas do slide 5: comitê aprova → avaliação construída → o campo mostra a causa →
escopo em produção.

> O comitê aprovou uma ideia para avaliar prestadores de serviço, e a avaliação foi construída.

**2.2 · A CAUSA.** A terceira parada acende.

> Mas os documentos reais mostraram a causa antes: cada pedido saía de um jeito, e o fornecedor respondia ao que entendia.

**2.3 · A DIREÇÃO.** A quarta parada acende; título "Gestão de Contratações".

> Então a ideia cresceu na direção da causa: começar pelo escopo.

## 3 · A SOLUÇÃO

**3.1 · O CADASTRO (E01).** O grupo "Instalação dos Equipamentos do SDAI", serviços uma atividade por linha.

> Hoje, quem contrata monta o escopo uma vez, no sistema. Os serviços de cada local, uma atividade por linha.

**3.2 · AS FOTOS (E01, mais abaixo).** As plantas anexadas ao grupo.

> As fotos ficam junto do serviço que descrevem.

**3.3 · A EAP (E02).** Itens 1.2 a 1.7 com quantidade, unidade e marca de referência.

> A EAP traz quantidade, unidade e marca de referência.

**3.4 · TRÊS DOCUMENTOS (D02 → E03 → D90).** O botão "Gerar Slides e PDF"; a capa do deck; o registro fotográfico; a planilha
do fornecedor com as colunas amarelas.

> Com um clique saem três documentos coerentes: a apresentação, o PDF e a planilha para o fornecedor. A mesma EAP, a mesma revisão.

## 4 · O PRÓXIMO JÁ COMEÇA PRONTO

**4.1 · A TELA DE INÍCIO (C01).** Os cartões dos escopos emitidos e o botão "Usar como base".

> E o próximo escopo já começa pronto.

**4.2 · O QUE VEM E O QUE FICA.** Os chips do slide 8: azuis (vêm prontos) e cinza (ficam em branco).

> Usando um escopo emitido como base, vêm os serviços, a EAP, as inclusões, as exclusões e o aceite. Fica em branco só o que é do lugar e da data.

## 5 · EM USO

**5.1 · AS REVISÕES (E05).** "Arquivos emitidos" do PPCI de Itajaí, da revisão 4 à 9; no fim, cartão "da área que contrata, em toda a empresa".

> Já está em uso. Começou pelos três Megas: o escopo do sistema de incêndio do prédio de apoio de Itajaí chegou à revisão nove, e cada revisão ficou registrada. O mesmo padrão serve para qualquer área da empresa que contrata.

## 6 · QUEM USA PEDE, O SISTEMA MUDA

**6.1 · OS PEDIDOS.** A linha do tempo do slide 12, pedido a pedido, com a versão acendendo ao lado.

> Quem usa pediu, e o sistema mudou em dias: a mesma fonte em todos os slides, as fotos junto da descrição, o texto justificado, o aviso padrão do Facilities e os escopos base.

**6.2 · O TESTE.** Cartão: "testes antes de cada publicação".

> Cada mudança passa por teste antes de ir para produção.

## 7 · O TEMPO (gravar só depois da medição de 14/10)

**7.1 · O CRONÔMETRO.** Dois números grandes: PowerPoint × sistema, com "amostra de N escopos" embaixo.

> Montar um escopo levou [X] minutos no sistema, contra [Y] no PowerPoint, numa amostra de [N] escopos reais.

## 8 · O PRÓXIMO PASSO

**8.1 · PRÓXIMOS PASSOS.** Dois cartões de texto (sem a tela de fornecedores): "Padrão para a empresa toda" e "Fornecedor e preço a partir do Fluig/RM".

> Os próximos passos: levar o padrão para a empresa toda e trazer fornecedor e preço do Fluig e do RM, onde o cadastro oficial já mora. Sem base duplicada.

**8.2 · FECHO.** Fundo azul-marinho, assinatura e o nome do projeto.

> Gestão de Contratações. Começar melhor. Contratar melhor.
