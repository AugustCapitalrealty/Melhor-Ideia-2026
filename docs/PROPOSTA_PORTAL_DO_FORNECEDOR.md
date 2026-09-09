# Proposta — Portal do Fornecedor

**Ideia de:** Guilherme Marques · **Registrada em:** 07/09/2026
**Situação:** proposta. Nada disto está construído.
**Quando:** depois do relatório final de 15/10 — ver a seção "Quando", que é
parte da proposta e não um detalhe de cronograma.

> **Pré-requisito registrado depois desta proposta:** o portal precisa de um
> convite para existir — é o convite que gera o token, define o escopo que o
> fornecedor enxerga e delimita o que ele pode responder. Ver
> `PROPOSTA_CONVITE_COM_ESCOPO.md`, de 09/09/2026. Construir o portal antes do
> convite seria construir a porta antes da casa.

---

## A ideia, em uma frase

Em vez de enviar a planilha em branco por e-mail e transpor as respostas à
mão, **cada fornecedor recebe um link** onde preenche apenas a proposta dele.
As colunas chegam prontas, lado a lado, para o time comparar.

---

## Por que ela é a conclusão certa

Não é intuição: é onde a pesquisa de campo do projeto já tinha chegado. O
fim da seção 9.11 da `BASE_DE_CONHECIMENTO.md`, sobre o fluxo do EAP em
branco na Engenharia:

> *"A identidade do fornecedor mora no **nome do arquivo**, não no dado. O app
> precisa de export de EAP em branco + reimport, **ou acesso externo do
> fornecedor**."*

O fluxo documentado hoje tem seis passos. O link resolve três deles:

| Passo de hoje | O que o link faz |
|---|---|
| 3. *"CR identifica o Monopólio prefixando o nome do arquivo. O arquivo da JB não tem prefixo — não dá para saber pelo nome que é dela"* | **Quem preencheu passa a ser dado**, não convenção de nome de arquivo |
| 6. *"CR transpõe manualmente as 4 planilhas em 4 blocos de colunas do EQU"* | **Deixa de existir.** É este o tempo que estamos medindo — o link não o reduz, elimina |
| — | **`Convites` ganha dado real.** Hoje a taxa de resposta é calculada sobre quem já respondeu; com convite emitido e link não usado, "não respondeu" vira fato registrado |

Esse terceiro ponto é uma correção, não um ganho novo: a auditoria de 07/09
apontou que a métrica de resposta a convites, do jeito que existe, mede só
quem respondeu — e por isso é sempre alta.

---

## As duas decisões que precisam ser tomadas antes de escrever código

São baratas agora e caríssimas depois de a primeira proposta externa entrar.

### 1. Dois web apps, não uma porta nova no atual

Para um fornecedor sem conta Google entrar, a implantação precisa ser
*"qualquer pessoa, inclusive anônima"*. Nesse modo o `Session.getActiveUser()`
volta **vazio**.

O app interno depende dele: `cfExigeAutorizacao_` (`app/Codigo.gs:481`) exige
`@capitalrealty.com.br` ou `@demercado.com.br` para qualquer escrita, e a
avaliação grava quem avaliou a partir do login. Misturar os dois numa
implantação só apaga a identidade interna — justamente a parte de governança.

**Desenho:** dois web apps, uma planilha.

| | Interno | Portal do fornecedor |
|---|---|---|
| Acesso | conta corporativa | qualquer pessoa com o link |
| Executa como | o usuário | o proprietário |
| Autoriza por | identidade (`cfExigeAutorizacao_`) | **token** |
| Enxerga | tudo | só a árvore de itens e a própria coluna |

O portal não pergunta quem a pessoa é. Ele confia no token, e o token já
carrega de quem é.

### 2. O fornecedor nunca pode ver o preço de outro

Isto não é funcionalidade: é risco comercial e jurídico. Dois concorrentes
enxergando a proposta um do outro é combinação de preço.

Consequência de projeto: o endpoint externo **lê** a árvore de itens (escopo,
quantidade, unidade, marca de referência) e **escreve** apenas as linhas de
`Precos` daquele proponente. Ele nunca devolve dado de outro proponente —
nem totais, nem contagem, nem "você está X% acima".

Se isso não estiver certo desde a primeira linha, não há conserto depois de um
vazamento.

---

## O token

Uma linha de `Convites` por fornecedor por equalização já existe no schema
(`app/Config.gs`), com `ID`, `ID_EQUALIZACAO`, `CNPJ` e `DATA_CONVITE`. O
token vive aí.

Colunas a acrescentar — sempre **no fim da lista**, que é a regra do schema:

| Coluna | Para quê |
|---|---|
| `TOKEN` | aleatório, longo. Um por convite: **um fornecedor, uma equalização** |
| `TOKEN_VALIDO_ATE` | link de cotação tem prazo, como a cotação tem |
| `TOKEN_REVOGADO` | desconvidar sem apagar o histórico do convite |
| `PRIMEIRO_ACESSO` | "abriu o link e não preencheu" é diferente de "nunca abriu" |
| `ENVIADO_EM` | separa convite emitido de convite entregue |

`APRESENTOU_PROPOSTA` deixa de ser derivado na homologação
(`app/Equalizacao.gs:1145`) e passa a ser fato: o fornecedor enviou pelo
portal, ou não enviou.

Duas regras que valem escrever no código quando chegar a hora:

- **Token não é senha.** Quem tiver o link entra. Por isso ele é por convite,
  tem validade e é revogável — e por isso ele não dá acesso a nada além
  daquela coluna daquela equalização.
- **Token revogado responde "este convite não está mais válido"**, nunca
  "token inválido". A diferença importa para quem está do outro lado tentando
  entender por que não consegue cotar.

---

## O que o modelo de dados já sustenta

A estrutura não precisa mudar, e isso é o que torna a proposta barata:

- Um fornecedor preenchendo é **uma linha em `Propostas` + N linhas em
  `Precos`** — exatamente o que já acontece hoje quando o time digita.
- Os preços são chaveados por `ID_EAP`, **não por posição de linha**. Se a
  Engenharia editar o escopo depois de convidar, o que o fornecedor já digitou
  sobrevive e o item novo aparece em branco. Isso já está certo.
- `STATUS_PRECO` já distingue `cotado`, `incluso_em_outro_item`, `excluido` e
  `nao_aplicavel` — o fornecedor precisa dessas quatro respostas, não só de
  um campo de preço.

### O item que o fornecedor inventa

A seção 9.12 da base documenta o comportamento: **o fornecedor acrescenta
itens** (`OMISSOS`). Se o portal não deixar, ele manda por e-mail e a
informação se perde de novo — que é o problema que estamos resolvendo.

Deixe acrescentar, marcado como *incluído pelo fornecedor*. O time decide
depois se entra no comparativo.

---

## O que fica em aberto e precisa de decisão de negócio

Não são detalhes técnicos; são regras que só o dono do processo define:

1. **O comprador vê as propostas conforme chegam, ou só depois do prazo?**
   Ver conforme chegam dá controle. Ver antes do fim pode influenciar a
   condução da negociação. É uma escolha de política, não de software.
2. **Quem pode emitir e revogar convite?** Hoje qualquer usuário corporativo
   escreve. Convite é ato externo — talvez mereça alçada própria.
3. **O fornecedor pode reenviar depois de enviar?** Rodada de renegociação é
   isso. Se puder, precisa virar `RODADA` — o campo já existe em `Propostas`.

---

## Quando — e por que não agora

**Depois de 15/10.**

Isto muda o que a ferramenta é: de consolidador interno para portal de
cotação. É o argumento mais forte que existe para 2027, e é também a
construção mais arriscada do projeto — acesso externo, token, segurança,
dado de fornecedor.

O que decide o concurso até 15/10 continua sendo cronometrar o Excel e rodar
8 a 12 compras reais. **Um portal pela metade em outubro vale menos que uma
medição feita em setembro** — e a janela da medição fecha sozinha quando o
Excel sair de uso, enquanto a do portal não fecha nunca.

Na apresentação ao Conselho, ele entra como visão de futuro. É onde ele
brilha, e é onde ele não atrapalha.
