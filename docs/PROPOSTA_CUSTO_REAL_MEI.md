# Proposta — O Custo Real da Contratação de MEI

**Data:** 09/09/2026 · **Autor:** Guilherme Marques · **Estado:** ideia registrada, sem código escrito

> **Aviso de escopo.** Este documento descreve uma regra **fiscal**, não uma regra de software. O fundamento citado precisa de validação formal da Contabilidade antes de qualquer número gerado por ele entrar num documento que sustente decisão de compra. Enquanto isso não acontecer, o sistema deve **sinalizar**, nunca **calcular como se fosse certeza**. Ver "A trava que essa ideia exige", adiante.

---

## A ideia, em uma frase

**Quando o proponente for MEI e o serviço estiver na lista prevista em lei, a proposta dele carrega 20% de encargo patronal sobre a mão de obra — e a tela precisa dizer isso antes da decisão, não depois.**

---

## Por que isso importa

É exatamente a mesma lição da marca Tigre, aplicada a outro campo:

> A proposta mais barata de um MEI, num serviço que gera 20% de encargo, **pode não ser a mais barata.** Comparar o valor dela com o de uma empresa que não gera esse encargo é comparar coisas que não são a mesma coisa.

Um exemplo com números redondos, para deixar claro o tamanho do problema:

| | Proponente A (MEI) | Proponente B (ME) |
|---|---:|---:|
| Mão de obra proposta | R$ 10.000,00 | R$ 11.500,00 |
| Encargo patronal sobre a mão de obra | **+ R$ 2.000,00** | — |
| **Custo real para a companhia** | **R$ 12.000,00** | **R$ 11.500,00** |

Na tela de hoje, A ganha por R$ 1.500. Na conta real, A perde por R$ 500. **A equalização está premiando a proposta errada, e ninguém vê.**

Isso não é um detalhe contábil que se resolve depois no financeiro. É uma inversão do resultado da disputa, decidida na tela onde a compra acontece.

---

## O fundamento — e o que precisa ser confirmado

A regra citada pela operação é a do **art. 18-B da Lei Complementar 123/2006**, incluído pela **Lei Complementar 128/2008**: a contratante de MEI para determinados serviços fica sujeita às mesmas obrigações previdenciárias de quem contrata contribuinte individual — o que implica a **Contribuição Previdenciária Patronal de 20% sobre o valor da mão de obra**, além dos deveres de declaração (GFIP / eSocial).

Os serviços indicados pela operação são seis:

1. Hidráulica
2. Eletricidade
3. Pintura
4. Alvenaria
5. Carpintaria
6. Manutenção ou reparo de veículos

**O que a Contabilidade precisa confirmar, por escrito, antes de virar código:**

- Se a lista de seis é exaustiva e se é essa mesma a redação vigente hoje
- Qual é a **base de cálculo** quando a nota não separa mão de obra de material — se há presunção aplicável e qual é o percentual dela
- Se há retenção adicional a recolher além dos 20%, e de quem é a obrigação acessória
- Se a regra alcança MEI **fora** dos seis serviços em alguma hipótese

Sem essas quatro respostas o sistema pode sinalizar o risco, mas não pode publicar um número.

---

## O que a base já tem — e o que está sendo desperdiçado

Esta é a parte que torna a ideia barata: **o dado já está lá.**

| Campo | Onde | Estado |
|---|---|---|
| `IS_MEI` | `Fornecedores`, schema v8 | **Preenchido** pelo importador da plataforma (`app/ImportPlataforma.gs:263`), com teste que cobre a conversão do booleano — e **lido por ninguém**. Zero ocorrências em `Interface.html` |
| `CNAE_PRINCIPAL` e `CNAES_SECUNDARIOS` | `Fornecedores`, schema v8 | Preenchidos. O secundário existe justamente porque *"o principal sozinho esconde o que a empresa faz"* |
| `NATUREZA_JURIDICA`, `PORTE` | `Fornecedores`, schema v8 | Preenchidos, do retrato cadastral da Receita |
| Categoria da equalização | Deduzida dos itens | Já existe e já alimenta o catálogo |

`IS_MEI` é hoje um campo morto: entra na base pelo importador e nunca chega a uma tela ou a uma decisão. **A frente não é obter o dado. É dar consequência a ele.**

---

## O problema difícil: qual é a base dos 20%

O encargo incide sobre a **mão de obra**, não sobre o total. E aí está a dificuldade real:

**Se a proposta não separa mão de obra de material, não existe base de cálculo.** O sistema não pode inventar a separação, e chutar um percentual seria produzir um número falso com aparência de exato — exatamente o tipo de coisa que este projeto se recusa a fazer em todo o resto.

Há dois caminhos, e eles não são excludentes:

**1. Pedir a separação no convite.** É aqui que esta proposta encontra a `PROPOSTA_CONVITE_COM_ESCOPO.md`: se o escopo já sai da Capital Realty com linhas separadas de mão de obra e de material, a proposta volta separada, e a base de cálculo existe por construção. **Resolver na origem é mais barato que adivinhar no fim.**

**2. Presumir, declarando que é presunção.** Quando a proposta chegar sem separação — e vai chegar, no acervo antigo e nos fornecedores que não seguirem o convite —, o sistema aplica a presunção que a Contabilidade definir e **marca o número como presumido na tela e no documento**, com o mesmo rigor que a nota preliminar do IQF já tem hoje.

---

## Como isso deve aparecer na tela

Uma regra que o projeto já segue e que aqui não pode ser quebrada: **o valor da proposta é o que o fornecedor disse.** O sistema não altera esse número — alterar seria falsificar o registro da cotação.

Portanto o encargo entra como **linha separada**, nunca embutido:

```
  Proponente A — CONSTRUTORA X SERVIÇOS (MEI)        ⚠ encargo
  ────────────────────────────────────────────────────────────
  Mão de obra proposta                        R$ 10.000,00
  Material                                     R$  3.200,00
  ────────────────────────────────────────────────────────────
  Total da proposta                            R$ 13.200,00
  Encargo patronal estimado (20% s/ MO)      + R$  2.000,00
  ────────────────────────────────────────────────────────────
  Custo real estimado para a companhia         R$ 15.200,00
```

E o selo `MEI` ao lado do nome do proponente, do mesmo jeito que o selo de IQF já aparece hoje — visível no autocomplete, no cabeçalho da coluna e no documento exportado.

**A ordenação do menor preço passa a ter duas leituras**, e as duas precisam estar à vista: menor proposta e menor custo real. Esconder uma delas seria trocar um viés por outro.

---

## A trava que essa ideia exige

O documento de exportação vai à Diretoria com o Valor Homologado no topo. Este projeto já teve um caso de número inflado em 12× vindo do acervo, e a lição foi registrada: **número errado num documento de decisão é pior que número ausente.**

Um encargo fiscal calculado errado é da mesma família, com agravante — erra para um lado que tem consequência com a Receita.

Por isso, a sequência não pode ser invertida:

1. Contabilidade confirma as quatro perguntas acima, por escrito
2. A regra entra numa **tabela configurável**, como a de cotação mínima já está na aba `Regras` — nunca fixa no código, porque legislação muda e código publicado não
3. Só então o número aparece em documento exportado
4. Antes disso, o sistema **sinaliza** — selo MEI e aviso de que há encargo aplicável — **sem publicar valor**

O sinal sozinho já vale muito: hoje o comprador não sabe sequer que o proponente é MEI.

---

## O que precisa ser construído

| Peça | O que faz | Esforço |
|---|---|---|
| **Selo MEI na tela** | Ler `IS_MEI` e mostrar no autocomplete e na coluna do proponente | 1–2 h |
| **Tabela de serviços com encargo** | Os seis serviços na aba `Regras`, configuráveis, casando por categoria e por CNAE | 2–3 h |
| **Aviso na equalização** | Quando MEI + serviço da lista, alerta na coluna do proponente | 2–3 h |
| **Separação mão de obra / material** | Campo por item, e o convite pedindo separado | 4–6 h *(compartilhado com a proposta do convite)* |
| **Custo real na comparação** | A linha separada e a segunda ordenação | 3–4 h |
| **Nota no documento exportado** | O encargo declarado, marcado como estimativa ou presunção | 2–3 h |

**Total estimado: 14 a 21 horas**, das quais 4 a 6 já estariam feitas se o convite com escopo vier antes.

---

## O que fica em aberto

1. **Quem responde pela regra?** A Contabilidade valida, mas alguém precisa ser dono de mantê-la atualizada quando a legislação mudar.
2. **O encargo entra na alçada de aprovação?** Uma compra de R$ 48 mil que vira R$ 52 mil com encargo pode mudar de faixa de alçada. Se muda, a alçada precisa olhar o custo real, não a proposta.
3. **Fornecedor MEI recorrente vira alerta de outra natureza?** Contratar sempre o mesmo MEI para o mesmo serviço tem risco trabalhista próprio, que não é preço. Fora do escopo desta proposta, mas é a pergunta seguinte.
4. **O que fazer com as 738 compras já importadas?** Recalcular o histórico com encargo mudaria o retrato de saving já apurado. Provavelmente a resposta é não mexer no passado e valer só daqui para frente — mas é decisão, não detalhe.

---

## Quando

**Depois de 15/10**, junto com a frente do convite — com uma exceção que vale antecipar.

O **selo MEI na tela** custa 1 a 2 horas, não depende de nenhuma validação fiscal e não publica número nenhum. Ele apenas mostra um fato cadastral que já está na base. Se o piloto for contratar serviço de hidráulica, elétrica, pintura, alvenaria ou carpintaria, essa uma hora e meia coloca à vista do comprador uma informação que hoje ele não tem — e não carrega nenhum dos riscos que o resto desta proposta carrega.

O cálculo do encargo é que espera a Contabilidade.

---

*Registrado em 09/09/2026. Os campos citados foram verificados no schema v8 em `app/Config.gs`, e o estado de `IS_MEI` — preenchido pelo importador, lido por nenhuma tela — foi verificado por varredura em `app/` e `tests/`. O fundamento legal citado é a premissa trazida pela operação e ainda não foi validado pela Contabilidade.*
