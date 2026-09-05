# Base de Conhecimento — Capital Fornecedores
### Tudo que descobrimos sobre como o processo funciona hoje, antes de construir

> Documento vivo. Cada achado aqui vem de **documento real**, com citação literal.
> Regra: se não veio de evidência, entra marcado como `[SUPOSIÇÃO]`.
> Última atualização: 05/09/2026

---

## 0. Sumário dos achados que mudam o projeto

| # | Achado | Consequência |
| :-- | :--- | :--- |
| 1 | Existe contrato na modalidade **"Lista de Preço Fixo" (LPU)** com preço unitário por item, irreajustável por 12 meses | Preço de referência **contratual**, não estatístico. **→ v2.0**, mas o campo de referência nasce na v1 (ver §11.2) |
| 2 | O contrato já traz um **SLA estruturado (Anexo II)** com itens de medição, tolerância, nota e **glosa financeira** | O IQF não precisa ser inventado. Já existe instrumento contratual objetivo. **→ v2.0** (ver §11) |
| 3 | Não-conformidade gera **glosa proporcional na NF do mês seguinte** | Saving atribuível e contratualmente exigível. **→ v2.0** (ver §11) |
| 4 | A OC é o elo obrigatório: NF só é emitida após OC, e **o nº da OC é obrigatório na NF** | O gancho de avaliação pós-OC já existe no contrato. Não precisa do Fluig para justificá-lo. |
| 5 | A "unidade" no mundo de consumo é **embalagem**, não unidade física (`PCT c/ 8 Rolos - 300m`) | O modelo de unidade precisa aceitar embalagem, senão a comparação de preço mente. |
| 6 | A própria LPU do contrato tem **numeração com buracos** (falta 11, 15, 22, 24, 26) | Mesma doença da EAP: numeração mantida à mão apodrece. Confirma a decisão de numeração derivada. |
| 7 | A regra é "**mínimo 3** cotações acima de R$ 1.000", mas o template tem 3 colunas — e **10 de 10** documentos de Facilities têm exatamente 3 | O formulário transformou o piso em teto. A companhia deixa de capturar propostas melhores por limitação de planilha. (§7A) |

---

## 1. O template oficial de equalização

**Arquivo**: `EQU_AAAAMMDD-MEGA_PROJETO_ÁREA.xlsx` — confirmado pelo Guilherme como **o template oficial vigente**. Se melhorarmos, vira a nova versão.

### 1.1 Estrutura física

Duas abas, uma por empresa:
- `Mapa de Cotação_Demercado`
- `Mapa de Cotação_CR`

**Três colunas de proponente, travadas: `E`, `F`, `G`.** É a origem da dor de "N proponentes".

### 1.2 Blocos do formulário

**Cabeçalho da equalização** (colunas B/C):
`Empresa:` · `Empreendimento:` · `Projeto:` · `Grupo Centro de Custo:` · `Nome Centro de Custo:` · `Data da equalização:` · `Favoravel à contratação e por que?` · `Detalhar o serviço a ser aprovado:`

**Por proponente** (rótulos na coluna D, valores em E/F/G):
`Cód. Fornecedor:` · `Razão:` · `Contato:` · `Cidade/Estado:` · `Telefone:` · `CNPJ:` · `Email:` · `Observação:`

> `Cód. Fornecedor` é o código no **Mega ERP**. Estava faltando na arquitetura original — é a chave de conciliação com OC e NF.

**EAP** (coluna B = código, C = descrição, E/F/G = valores):
Três níveis — `Etapa (1.)` → `Sub-etapa (1.1)` → `Atividade (1.1.1)`.
**Sem coluna de quantidade. Sem coluna de unidade. Valor fechado por atividade.**

**Rodapé por proponente** (rótulos na coluna B):
`Numero da Proposta:` · `Data da Proposta:` · `Condições de pagamento:` · `Lead time para início:` · `Prazo de execução:` · `Validade proposta:` · `Faturamento Direto:` · `Data prevista para início:` · `Data prevista para término:` · `Notas Capital Realty:`

**Histórico da Negociação**:
`Proposta inicial:` · `Proposta R01:` · `Proposta R02:` · `Redução total da negociação:`

### 1.3 Os bugs que o template carrega (munição para a apresentação)

Extraídos direto do XML da planilha:

| Onde | O que está errado |
| :--- | :--- |
| `B25` | Numerada `2.2.1`, mas está sob `B24 = 2.1`. Deveria ser `2.1.1`. |
| `B20`–`B22` | Numeradas `1.3.3`, `1.3.5`, `1.3.7` — pulando números. |
| `E12` | `=E13+E16+E19` — subtotal somando célula escolhida a dedo, não faixa. Inserir sub-etapa não entra na conta. |
| `E23` | `=E24+E26` — mesmo padrão frágil. |
| `G24` vs `E24`/`F24` | `G24 = G25` enquanto `E24 = SUM(E25)`. **Fórmula diferente para proponentes diferentes na mesma linha.** |

Isso é o print de abertura da apresentação.

### 1.4 Decisão derivada

O importador **descarta a numeração gravada** e reconstrói a árvore pela profundidade (contagem de pontos) + ordem de aparição. Efeito: o `2.2.1` errado entra e sai como `2.1.1` correto. O bug se conserta na importação.

---

## 2. Contratos de preço fixo (LPU) — o achado que muda o produto

**Evidência**: `Contrato de prestação de serviços_0187.2026_Canaveral_MItajai_e anexos-Manifesto.pdf`

### 2.1 O que é

**Termo de Contratação na modalidade "LISTA DE PREÇO FIXO"** — nº `0187.2026`, assinado em 07/08/2026.

- **Contratante**: CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA — CNPJ `03.015.145/0001-54`
- **Contratada**: CANAVERAL PRODUTOS DE HIGIENE E LIMPEZA — CNPJ `07.052.432/0001-95`
- **Empreendimento**: Mega Centro Logístico Itajaí
- **Vigência**: 01/09/2026 a 30/08/2027
- **Anexos**: `ANEXO I - LPU Material de Consumo` · `ANEXO II - SLA`

### 2.2 A cláusula que faz o produto

> *"Os preços aqui estipulados são **certos e irreajustáveis**"*

> *"A CONTRATANTE encaminhará à CONTRATADA a relação dos produtos a serem fornecidos, contendo as respectivas quantidades de cada item para o período. O fornecimento deverá ocorrer conforme as quantidades solicitadas, **observando-se os preços unitários previamente estabelecidos e fixados neste Contrato**."*

Ou seja: para item sob contrato **não se cota — se aplica o preço**. Confirma exatamente o que o Guilherme levantou: *"se tiver cadastrado faz um com os itens, já sabe o preço, só confirma com o fornecedor"*.

### 2.3 A LPU real (Anexo I) — 30 itens com preço unitário

Transcrição literal, com a numeração original:

```
 1  Adesivo para vaso Coala Lavanda (refil) ................... R$  15,00
 2  Adesivo para vaso Coala Lavanda (aplicador + refil) ....... R$  19,90
 3  Água Sanitária 5L Q Boa ................................... R$  18,90
 4  Alcool Líquido 1L Itajuba/Vale ............................ R$   8,85
 5  Bom Ar Leveuze 400ml Capim Limão .......................... R$   9,90
 6  Desinfetante Canaveral Lavanda 5L ......................... R$  15,00
 7  Coala 120ml (aromatizante) ................................ R$  14,90
 8  Detergente clorado Gel Guimarães 5L ....................... R$  39,90
 9  Tela aromatizante mictório ................................ R$   6,99
10  Detergente de louça Ypê 5L ................................ R$  27,50
12  Desinfetante Bact Germ Canaveral 1L ....................... R$  15,00
13  Detergente Multiuso Pink Canaveral Super Concentrado 5L ... R$  29,90
14  Esponja Louça Condor PCT c/ 4 ............................. R$   3,40
16  Fibra branca para rodo .................................... R$   1,99
17  Luva verniz Bompack Azul .................................. R$   7,99
18  Fibra verde para rodo ..................................... R$   2,25
19  Lustra móveis Polwax 200ml Lavanda ........................ R$   6,99
20  Pastilha para vaso sanitário Coala Lavanda ................ R$   5,50
21  Papel higiênico (PCT c/ 8 Rolos - 300m) ................... R$  89,90
23  Papel toalha (PCT c/ 6 Rolos - 200m) ...................... R$ 172,50
25  Sabonete Líquido Premisse Algas Marinhas (5L) ............. R$  89,90
27  Saco de lixo 100L 0,10micras (PCT c/ 100 sacos) azul ...... R$  79,90
28  Saco de lixo 60L (PCT c/ 100 sacos) azul .................. R$  25,00
29  Saco de lixo 40L (PCT c/ 100 sacos) azul .................. R$  19,90
30  Saco de lixo 100L 0,10micras (PCT c/ 100 sacos) marrom .... R$  79,90
31  Saco de lixo 60L (PCT c/ 100 sacos) marrom ................ R$  25,00
32  Saco de lixo 40L (PCT c/ 100 sacos) marrom ................ R$  19,90
33  Saponáceo CIF 250ml ....................................... R$  11,90
```

**Faltam os números 11, 15, 22, 24 e 26** — itens removidos durante a negociação sem renumerar. A lista de contrato tem a mesma doença da EAP.

### 2.4 O que a LPU ensina sobre o catálogo

Esta lista **é** a convenção de nomenclatura da casa. Aprendizados diretos:

1. **A descrição carrega marca + especificação + embalagem**: `Detergente de louça Ypê 5L`, `Papel higiênico (PCT c/ 8 Rolos - 300m)`.
2. **"Unidade" aqui é embalagem, não unidade física.** `PCT c/ 100 sacos`, `PCT c/ 4`, `5L`, `200ml`. Um modelo que só aceite `un / kg / m²` compara errado.
3. **Cor e variante são item distinto**: saco de lixo 100L azul e marrom são linhas separadas, mesmo preço. O catálogo precisa de variante.
4. **Existe família**: saco de lixo 40L/60L/100L × azul/marrom = 6 SKUs da mesma família. Categoria → família → item é a hierarquia natural.
5. `[SUPOSIÇÃO]` A LPU é digitada à mão em cada contrato — não vi fonte única. Confirmar com o Guilherme.

### 2.5 Condições comerciais estruturáveis

Coisas hoje escritas como texto livre em "Condições de pagamento" que são, na verdade, **regra**:

- NF emitida entre dias **01 e 13** → paga no dia **10** do mês seguinte
- NF emitida entre dias **14 e 25** → paga no dia **20** do mês seguinte
- **Proibido** emitir NF entre os dias 26 e 31
- NF só após OC, e **o nº da OC é obrigatório na NF**
- Entrega: até **48h úteis** da OC
- Substituição de item em desacordo: até **24h úteis**
- Multa por descumprimento: **15%** sobre o valor total
- Comodato: 11 porta papel toalha, 10 porta papel higiênico, 10 dispensers de sabonete

> Comparar proponentes por "condições de pagamento" em texto livre é impossível. Normalizado em prazo médio efetivo, vira critério objetivo de equalização.

---

## 3. O SLA que já existe — e por que ele substitui o IQF que inventamos

**Evidência**: `ANEXO II - SLA`, transcrito no mesmo PDF do contrato.

### 3.1 O instrumento

> *"A CONTRATADA deverá apresentar juntamente com a Nota Fiscal mensal o ANEXO II — Acordo de Nível de Serviço (SLA) preenchido e validado com a CONTRATANTE, o qual serve como base da medição da qualidade do serviço prestado."*

Período de medição: do 1º ao último dia do mês, apresentado até o **5º dia útil** do mês seguinte.

### 3.2 Os itens de medição reais (contrato Canaveral)

1. Atraso na entrega dos produtos, superior a 48 horas úteis após o envio da Ordem de Compra
2. Não substituição de produtos entregues em desacordo no prazo de até 24 horas úteis
3. Não substituição de dispensers quebrados, danificados ou com mau funcionamento em até 24 horas úteis
4. Entrega de produtos em desacordo com a Ordem de Compra, quanto às **quantidades, especificações ou preços contratados**
5. Fornecimento de dispensers fora do padrão aprovado (cor, identificação visual não autorizada)
6. Emissão de Nota Fiscal com erros ou sem a indicação do número da Ordem de Compra
7. Entrega parcial ou incompleta do pedido

Colunas do instrumento: `Parâmetros de Avaliação` · `Tolerância` · `Qtde de Inspeções` · `Qtde de Inconformidades` · `Status` · `Nível de Resultado` · `Nota Aplicada` (3.00 = Ótimo) · `% Tolerância` · `Glosa a ser Aplicada`

### 3.3 A consequência financeira

> *"As 'não-conformidades' que não respeitarem as tolerâncias e parâmetros do ANEXO I, poderão ocasionar em **desconto proporcional na Nota Fiscal do mês subsequente**."*

Não-conformidade também pode gerar **plano de ação** sem custo para a contratante.

### 3.4 Por que isso muda a estratégia do projeto

O plano original inventava 5 critérios de avaliação (Qualidade 30%, Pontualidade 25%, SST 20%, Postura 15%, Limpeza 10%) — **subjetivos, novos, e precisando ser vendidos à operação.**

Mas a empresa **já tem** instrumento de avaliação:
- **objetivo** (contagem de inconformidade contra tolerância, não opinião),
- **específico por contrato** (os itens do Canaveral são de material de consumo; um contrato de manutenção teria outros),
- **já acordado com o fornecedor** (está assinado),
- **com consequência financeira** (glosa),
- **com periodicidade definida** (mensal, até o 5º dia útil).

E ele provavelmente morre em planilha/papel, como o fluxo do Fluig.

> **Reposicionamento**: o IQF deixa de ser "formulário novo de avaliação" e passa a ser **a consolidação do SLA contratual que já existe**. Isso responde a devolutiva do comitê com muito mais força — é literalmente *"transformar uma funcionalidade hoje subutilizada em ferramenta estratégica de gestão"*, só que sobre um instrumento contratual, não sobre um formulário voluntário.

`[A CONFIRMAR com o Guilherme]` Quantos contratos ativos têm SLA anexo? O SLA está sendo preenchido mensalmente hoje? Se não estiver, **quanto de glosa deixou de ser aplicado?** Essa é possivelmente a métrica de impacto mais forte do relatório de 15/10.

---

## 4. O ciclo completo, como o contrato o descreve

O contrato descreve um ciclo fechado que **já é obrigação contratual** — o que falta é o sistema que o torna operável:

```
CONTRATO (LPU preço fixo)
   │  preço unitário fixo, irreajustável, por 12 meses
   ▼
ORDEM DE COMPRA  ── e-mail com produto, quantidade e especificação
   │  "os preços... previamente estabelecidos e fixados neste Contrato"
   ▼
ENTREGA  ── 48h úteis
   │  desacordo em qtd, especificação OU PREÇO = não-conformidade
   ▼
NOTA FISCAL  ── nº da OC obrigatório na NF
   │
   ▼
SLA MENSAL  ── até o 5º dia útil, validado com a contratante
   │
   ├──> GLOSA na NF do mês seguinte
   └──> PLANO DE AÇÃO
```

Cada seta acima é um ponto onde hoje o dado se perde em e-mail, planilha ou PDF.

---

## 5. Convenções de nomenclatura observadas

**Equalizações**: `EQU_AAAAMMDD-<EMPREENDIMENTO>_<PROJETO>_<ÁREA>`
Exemplos reais: `EQU_20260827-MEGA CURITIBA_Revitalização Reservatório Metálico 138.000l`, `EQU_20260415-MCtba_Revitalização Campo de Society_Facilities`, `EQU_20260202-MEsteio_ArmazémB_Piso`, `EQU_20260406-MEGA_LAVAGEM DE PISO_PROPRIEDADES`

> **Empreendimento não é padronizado**: `MEGA CURITIBA`, `MCtba` e `MEGA` aparecem para a mesma coisa; `MEsteio` para Mega Esteio. Precisa de tabela de empreendimentos com apelidos.

**Orçamentos de fornecedor**: `Orç <Fornecedor> - <valor>` — ex. `Orç Litoral - 936,84`, `Orç Canaveral - 1.595,72`, `Orç Fabesul R$719,42`
> O valor está **no nome do arquivo**, e revisões viram `RV01`/`REV01` (`Orç Litoral - 987,26 RV01`). Rodada de negociação hoje é versionada por nome de arquivo.

**Ordem de compra**: `OC <número> <Fornecedor> - <valor>` — ex. `OC 034925 Fabesul - 671,52`

**Engenharia**: `<Empreendimento>-F<fase>_EAP <DISCIPLINA>_R<nn>` — ex. `MCtba-F7_EAP FUNDAÇÃO_R02`
> Prefixo de fornecedor quando é a cópia devolvida: `Monopolio-MCtba-F7_EAP FUNDAÇÃO_R01`

**Empresas do grupo**: `CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA` (03.015.145/0001-54) e `DEMERCADO INVESTIMENTOS S.A.`
> O README do repositório escreve "CAPITAL INFRAESTRUTURA LOGÍSTICA LTDA." — falta o "REALTY". Corrigir.

---

## 6. Decisões de arquitetura já travadas

| Decisão | Motivo | Reversível? |
| :--- | :--- | :---: |
| Árvore recursiva (`id_pai` + `ordem`) | ~~Obra precisa de 4+ níveis~~ **CORRIGIDO (§9.5)**: ambos param em 3 níveis. O motivo real é que `codigo` não é único nem codifica posição | ❌ reescrita |
| Numeração **derivada** da posição, nunca gravada | Conserta o bug de numeração na origem | ❌ reescrita |
| Folha tem preço; pai é soma recursiva | Elimina fórmula quebrada por construção | ❌ reescrita |
| Preços em **formato longo** (1 linha por item × proponente) | Esta tabela *é* o histórico de preço | ❌ reescrita |
| `quantidade` + `unidade` + `preço unitário` em `precos` **e** `quantidade_referencia` + `unidade_referencia` no item | §9.2: são dois conceitos distintos, e a divergência entre eles é o principal sinal de risco | ❌ reescrita |
| Unidade aceita **embalagem** (`PCT c/ 100`), não só unidade física | A LPU real é assim | ❌ reescrita |
| ~~`BDI` em campo separado do preço~~ **DERRUBADO (§9.4)** | BDI não existe como coluna em Facilities (0/15) nem em Engenharia. É premissa de edital → vai para o cabeçalho: `regime_contratacao`, `bdi_incluso`, `premissas_texto` | — |
| `UF` na chave de comparação | Mesmo serviço custa diferente por praça | ⚠️ caro |
| `MESCLADO_EM` no catálogo | Permite deduplicar depois sem reescrever histórico | ❌ reescrita |
| `CHAVE_BUSCA` normalizada (minúsculo, sem acento) | Busca acha o parecido antes de deixar criar duplicata | ✅ barato |
| Uma base só, campo `EMPRESA` | Separar parte o histórico ao meio | ❌ reescrita |
| Deployment "executar como eu" + acesso à organização | Planilha fechada, mas registra o usuário real | ⚠️ médio |
| `LockService` em toda escrita | Sheets corrompe linha em escrita concorrente | ✅ barato |
| `CacheService` para catálogo e índice de preços | `SpreadsheetApp` é lento demais para consulta por tecla | ✅ barato |

---

## 7. Pendências de investigação

### Bloqueia a v1
- [x] ~~Onde estão os originais das equalizações?~~ → ✅ **Google Sheets** (05/09). Leitura direta, sem parser de PDF.
- [x] ~~Onde o app vai morar?~~ → ✅ **Drive compartilhado já existente** (05/09)
- [x] ~~Quem usa no piloto?~~ → ✅ **usuário identificado** (05/09)
- [ ] Tabela de empreendimentos e seus apelidos (MCtba / MEGA CURITIBA / MEGA / MEsteio / MItajai...) — sem isso a comparação entre Megas não fecha
- [ ] "Formulário de equalização" é processo paralelo ao "EQU_"? *(agente investigando)*
- [ ] Engenharia usa quantidade e unidade na EAP? *(agente investigando)*
- [ ] O fluxo "fornecedor preenche a própria cópia do EAP" se confirma? *(agente investigando)*

### Só importa para a v2.0
> ⚪ **Encerradas por decisão do Guilherme em 05/09**: a frente de SLA e glosa não será aberta agora. As perguntas ficam registradas para quando a v2.0 começar.
- [ ] ~~Como funciona hoje o "performance de contratos"?~~
- [ ] ~~Quantos contratos ativos têm SLA anexo, e ele é preenchido mensalmente?~~
- [ ] ~~Quanto de glosa deixou de ser aplicada por SLA não medido?~~
- [ ] ~~Quantos contratos ativos em modalidade LPU existem?~~

---

## 7A. Regras de negócio da companhia

> Fonte: **Guilherme, 05/09/2026** (regra interna, não extraída de documento).

### 7A.1 Número mínimo de cotações por faixa de valor

| Valor da compra | Cotações exigidas |
| :--- | :--- |
| Até R$ 1.000,00 | **1 basta** |
| Acima de R$ 1.000,00 | **mínimo 3** — e pode ser 4, 5, 6, 7… |

**"Mínimo 3" nunca significou "exatamente 3".** Não há teto na regra.

### 7A.2 🔴 O template transformou um piso em teto

Cruzando a regra com o que o campo mostrou:

| Contexto | Layout | Proponentes cotados |
| :--- | :--- | :---: |
| **Facilities** (§8.3) | 3 colunas travadas (`E`, `F`, `G`) | **exatamente 3, em 10 de 10 documentos** |
| **Engenharia** (§9.6) | N blocos de colunas | **4** (Monopólio, JB, Pretech, Petry) — de **12 convidados** |

Nenhum documento de Facilities teve 2 proponentes. Nenhum teve 4. **Sempre exatamente 3.**

Isso não é coincidência estatística: é a planilha ditando o comportamento. Quando a regra diz "no mínimo 3" e o formulário só tem três colunas, **o mínimo vira o máximo** — o comprador nunca busca uma 4ª cotação porque não há onde colocá-la. A Engenharia, que montou um layout de N colunas, cotou 4 naturalmente.

> **Consequência de negócio**: a companhia deixa de capturar propostas melhores em compras acima de R$ 1.000 por limitação de formulário. É um argumento direto e verificável para a banca.

E na outra ponta: para compra de até R$ 1.000, onde 1 cotação bastaria, o formulário de 3 colunas provavelmente empurra o comprador a **buscar duas cotações desnecessárias** — desperdício de tempo em compra de baixo valor.

### 7A.3 O que o app precisa fazer com isso

1. **N proponentes de verdade** — sem teto. Já era decisão travada; agora tem justificativa de regra, não só de conveniência.
2. **Validação na homologação**, não na digitação: se `valor_final > limite` e `propostas_válidas < mínimo`, bloquear ou exigir justificativa. Hoje nada impede fechar R$ 50 mil com 2 cotações.
3. **Limite em tabela de configuração, não no código.** Faixa de valor muda; e pode diferir entre Capital Realty e Demercado.
4. **"Proposta válida" precisa de definição.** Convite recusado não conta. E cesta incompleta (§8.10, §9.9) não deveria contar como proposta comparável — é exatamente o caso da Petry, que deixou uma seção inteira em branco.
5. **Modo simplificado para até R$ 1.000**: uma cotação, tela curta. Se o app exigir o mesmo ritual da compra grande, ninguém usa para compra pequena — e compra pequena é o piloto.

### 7A.4 A confirmar

- [ ] O limite é exatamente R$ 1.000,00? Há outras faixas acima (ex.: acima de X exige mais cotações, ou aprovação de nível superior)?
- [ ] Existe exceção formal — fornecedor exclusivo, emergência, contrato vigente? Com que justificativa?
- [ ] O limite é o mesmo para Capital Realty e Demercado?
- [ ] A faixa considera o valor de cada proposta ou o valor final homologado?

---

## 8. Achados de campo — Facilities e materiais

**Fonte**: 15 documentos reais (5 `EQU_`, 5 `Formulário de equalização`, 1 `Mapa de Equalização`, 7 orçamentos de fornecedor, 1 OC).
**Ressalva**: são PDFs exportados de Sheets; a extração embaralha a ordem espacial e a associação coluna↔proponente às vezes não é recuperável. O que está marcado como ambíguo abaixo é ambíguo mesmo.

### 8.1 A descoberta central: a equalização destrói a granularidade

| Etapa do processo | Tem qtd + unidade + unitário? |
| :--- | :---: |
| Orçamento do fornecedor | ✅ **sempre** (7 de 7) |
| **Equalização** | ❌ **1 de 10** — e nesse a qtd foi forçada para `1,00 VB` |
| Ordem de Compra | ✅ **sempre** |

Cabeçalhos literais dos orçamentos: `Produto Un Qtde. %Desc. Valor Unitário Total` (Litoral) · `CÓDIG DESCRIÇÃO UN QTD VLR UNIT VLR TOT DESC VLR LIQ LOC` (Canaveral) · `Item Código Descrição do Item Quantid. Un Unit.R$ Total R$ MVA % IPI % ICMS % CST NCM/SH` (S. Vargas).

Exemplo do dano — formulário de material de consumo, 30 itens, nenhuma quantidade:
```
1.1.5  Café Melita 500G ......... R$ 502,60 | R$ 502,60 | R$ 587,86
1.1.13 Papel Higiênico Rolão c/8  R$ 636,90 | R$ 769,89 | R$ 669,90
```
R$ 502,60 num café de 500g é total estendido de várias unidades — **o multiplicador não existe em lugar nenhum do documento e não é recuperável nem manualmente**.

> **Consequência**: pedir qtd + unidade não é "campo a mais". É **restaurar dado que já existe no orçamento do fornecedor e que a equalização joga fora**. Muda completamente o argumento de venda para o comprador.

### 8.2 Preço não é sempre número

Valores literais encontrados em célula de preço: `INCLUSO` · `R$ -` · `-` · `Sim = R$ 15.350,00`

Semânticas distintas que um `DECIMAL` perde:
- `INCLUSO` = coberto por outra linha (≠ zero)
- `R$ -` = fornecedor **não cotou** este item (≠ cotou por zero)
- `Sim = R$ 15.350,00` = valor colado dentro do campo `Faturamento Direto`

→ **`precos` precisa de `STATUS_PRECO`**: `cotado | incluso_em_outra_linha | nao_cotado | nao_aplicavel`.

### 8.3 A negociação vive fora da EAP — e o vencedor fica com o valor errado

`EQU_20260827-MEGA CURITIBA_Revitalização Reservatório`:
- Árvore de preços (Norte Sul): `R$ 80.563,38`
- `Proposta R01` (Norte Sul): `R$ 70.000,00`
- Narrativa: *"o mesmo cobriu a proposta de execuar o serviço pelo menos valor do primeiro colocado"*

**Contratou-se por R$ 70.000 e a EAP mostra R$ 80.563,38.** A negociação acontece **no total**, nunca desce de volta para o item.

→ `precos` **não é** a fonte da verdade do valor contratado. Precisa de `valor_negociado` por (proponente × rodada), no nível do documento, separado da árvore.

### 8.4 As 3 colunas já estouraram — por atributo, não por fornecedor

Proponentes: **exatamente 3 em 10 de 10.** Ninguém passou de 3 fornecedores.

Mas o `Mapa de Equalização PMOC` estourou de outro jeito: 3 proponentes × (`Valor Unit` + `Valor Total` + `Observação`) = **9 colunas**. E as observações eram o que decidiu a compra:
```
"NÃO emite laudo PMOC"
"Efetua 2 visitas no ano para Limp. e Manut. Preventiva,"
"Efetua 3 visitas no ano ... com ART valido até 31/12/2026"
"Efetua 12 visitas no ano ... com ART valido até 31/12/2026"
```
Os três cotaram `Quantidade 1,00 VB` e entregam **2, 3 e 12 visitas por ano**. A quantidade real difere por proponente e está escondida em texto livre. Um deles não emite o laudo — que é exigência legal (Lei 13.589/2018).

→ **Faltava no modelo**: `OBSERVACAO` por **(item × proponente)**, e um campo de escopo ofertado por proponente. Sem isso a decisão fica inexplicável no banco.

### 8.5 Não existe chave de item nem chave de fornecedor

- **`Cód. Fornecedor`: vazio em 10 de 10.** No EQU do reservatório aparece literalmente `Cód. Fornecedor: 1 2 3` — é só a numeração das colunas. O único código real do corpus está na OC: `FORNECEDOR: 008940`.
- **O código `1.1.x` não identifica item, identifica posição de linha.** `Filtro de café` é `1.1.8` em abril e `1.1.13` em junho, mesmo comprador, mesmos fornecedores.
- **CNPJ com grafia quebrada**: `44.983.675 0001-73` (sem barra).
- **Mesmo CNPJ, duas razões sociais**: `15.661.459/0001-03` aparece como `EDERSON TEXEIRA` e como `IMUNIZADORA RP`.

### 8.6 O mesmo item escrito de formas irreconciliáveis

Equalização × orçamento do **mesmo fornecedor** (Canaveral, Itajaí):

| Na equalização | No orçamento do fornecedor |
| :--- | :--- |
| `Papel Higiênico Rolão c/ 8` | `6621 PAPEL HIG. 300 MT NATUREZA CX C/8` |
| `Refil Gel Adesivo **Pato** c/ 6` | `8971 REFIL C/6 GEL ADESIVO SANIT. **COALA** LAVANDA` |
| `Fibra verde para rodo` | `96 FIBRAÇO VERDE GDE 26CM 9502` |
| `Tela de mictório` | `8901 TELA DE MICTORIO PREMISSE LIMÃO` |

> `Pato` vs `Coala` **não é variação de escrita — é marca diferente sendo comparada como se fosse o mesmo item.**

Entre Itajaí e Curitiba, o mesmo produto sem nenhuma palavra em comum:
`Pastilha adesiva` (Itajaí) = `Adesivo para vaso` (Curitiba) · `Café Melita 500G` vs `Café Melitta 500g` · `Saco de lixo marrom 100L` vs `Saco de lixo 200L (PCT c/ 100 sacos)`

→ **Catálogo com match exato por descrição é inviável.** Os únicos identificadores estáveis são os **códigos internos de cada fornecedor** (`6621` Canaveral, `30676` Fabesul, `001305` Litoral) — e nenhum aparece na equalização.

E preço é função de **(fornecedor, item, data)**: `001305 - RESISTENCIA LORENZETTI ULTRA 5500 3T` custou `43,85` em 27/03 e `47,12` em 03/06, mesmo fornecedor.

### 8.7 `Redução total da negociação` está quebrado em 5 de 10

Quando `Proposta inicial` está vazia, a fórmula copia o total como se fosse redução — reportando **100% de economia**:

| Documento | Valor total | "Redução" reportada |
| :--- | :--- | :--- |
| Form. Bicicletário | R$ 11.500,00 | `R$ (11.500,00)` |
| Form. Material Itajaí | R$ 3.227,80 | `R$ (3.227,80)` |
| Form. Material Ctba | R$ 1.467,63 | `R$ (1.467,63)` |

→ **Nunca importar `Redução total` como dado.** Sempre derivar. Importado, gera métrica de saving falsa — exatamente o número que eu ia levar para a banca.

### 8.8 `RV01` ≠ rodada de negociação

Dois eixos ortogonais que o modelo precisa separar:
1. **Revisão do documento do fornecedor** — `REV02`, `REV00`, `175-2026 Rev.00`, no campo `Numero da Proposta`
2. **Rodada de negociação da Capital Realty** — `Proposta inicial / R01 / R02`, no rodapé

Prova: no EQU Esteio, o ADS tem `Numero da Proposta: REV02` **e** rodada de negociação zerada.

⚠️ **`RV01` no nome do arquivo é enganoso**: `Orç Litoral - 936,84` (03/06, orçamento 056768) e `Orç Litoral - 987,26 RV01` (27/03, orçamento 055791) têm datas e conteúdos diferentes — **não são revisão um do outro**.

Uso real das rodadas: **R01 em 1 de 10 documentos. R02 nunca foi usado.** Mas hardcodar 2 rodadas repete o erro das 3 colunas.

### 8.9 Campos "de cabeçalho" que são, na verdade, por proponente

- `Nome Centro de Custo`: `LIMPEZA DO PISO (ADS MANUTENCAO)` / `(EDERSON)` / `CSM)` ← carrega o nome do fornecedor dentro
- `Data prevista para início/término`: `10/08/2026` / `10/08/2026` / `01/09/2026` — diferentes entre proponentes
- `Faturamento Direto`: `Não Não Sim = R$ 15.350,00` — **não é booleano**

### 8.10 Cestas desiguais somadas como se fossem comparáveis

Numa equalização de Curitiba, uma coluna tem `R$ -` em três itens (`Álcool Gel 5L`, `Hipoclorito 5L`, `Soda 1kg`) e **mesmo assim o total dessa coluna é somado e comparado**. A justificativa escrita à mão diz `Contabilista possui todos os itens e melhor custo beneficio` — o comprador sabia do problema e resolveu na cabeça, não no documento.

→ O app precisa **marcar cesta incompleta** e recusar comparar totais de cestas diferentes sem aviso. *(A associação exata coluna↔fornecedor é ambígua na extração; o que é certo é que existe coluna incompleta somada como completa.)*

### 8.11 `Formulário de equalização` vs `EQU_` — não são dois processos

Estrutura interna **idêntica**. A diferença é convenção regional de nome:
- Os 3 documentos de **Itajaí** são todos `Formulário de equalização - <assunto>`
- 4 dos 5 `EQU_AAAAMMDD-...` são **Curitiba / Esteio**

Tendência de uso (não regra — a fronteira vaza): `Formulário` concentra material recorrente de baixo valor e muitos itens; `EQU_` concentra serviço pontual de alto valor com negociação. Mas `Formulário - Bicicletário externo` (R$ 11.500) é obra, e `EQU_..._Facilities` (R$ 15.300) é do mesmo porte.

### 8.12 Outros achados que afetam validação

- **BDI não existe em Facilities.** Zero ocorrências em 15 arquivos. O campo é exclusivo de obra.
- **Data do nome ≠ data interna**: arquivo `EQU_20260827-...` tem `Data da equalização: 31/07/2026` no cabeçalho.
- **Datas incoerentes no legado**: `EQU_20260202` tem `Data da Proposta: 25/01/2026 | 23/06/2026 | 27/01/2026` — a segunda é 4 meses depois da equalização. Validação `data_proposta <= data_equalizacao` rejeitaria histórico real.
- **Numeração da EAP com buracos**: formulário de Itajaí vai de `1.1.1` a `1.1.36` mas faltam `1.1.12, 1.1.16, 1.1.27, 1.1.29, 1.1.30, 1.1.31` — 30 itens, índice máximo 36.
- **Impostos morrem na equalização**: orçamentos trazem `MVA %`, `IPI %`, `ICMS %`, `CST 060`, `NCM 39174090`, `%Desc. 15,00`. Nada sobrevive.
- **Profundidade real: nunca passou de 3 níveis**, e em 5 de 10 os níveis 1 e 2 são texto duplicado (`1. Limpeza do Piso` → `1.1 Limpeza do Piso`). Em Facilities, a árvore existe por template, não por necessidade. *(Obra é o motivo da árvore livre — aguardando agente de Engenharia.)*
- **`Empresa` tem 5 grafias para 2 CNPJs**: `DEMERCADO INVESTIMENTOS S.A.` / `S/A` (`08.601.964/0001-05`) e `CAPITAL REALTY INFRAESTRUTURA LOGISTICA LTDA` / `CAPITAL INFRAESTRUTURA LOGÍSTICA LTDA.` / `CAPITAL REALTY INFRA-ESTRUTURA LOGISTICA LTDA` (`03.015.145/0001-54`).
- **Preços idênticos ao centavo entre concorrentes** em 5 itens de Itajaí (`Bom ar 400ML R$ 69,30 | R$ 69,30`, `Café Melita R$ 502,60 | R$ 502,60`). `[AMBÍGUO]` — pode ser preenchimento de lacuna com o preço do concorrente. Se for, os totais comparados são fictícios.

### 8.13 A Ordem de Compra — e o elo que não existe

OC `034925` (Demercado → Fabesul), campos reais: número, `FORNECEDOR: 008940`, CNPJ, endereço, `A/C`, condição de pagamento (regra dos dias 10/20), `Informar o número desta Ordem de Compra no corpo da Nota Fiscal`, itens com `UND QTD UNITARIO TOTAL`, **rateio por centro de custo** (`MEGA CURITIBA RATEIO DE CONDOMÍNIO 671,52`), e **cadeia de aprovação** (`INCLUÍDO POR: 16/01 LAUREANE BRANSIN` / `AUTORIZADO POR: 16/01 JONATAS AUGUSTO FERREIRA` / `19/01 KETHLI PEREIRA BEZERRA` — dois autorizadores, datas diferentes). Origem: `PORTAL CR`.

**A OC não aponta para cotação nenhuma.** O único vínculo é o texto livre `ORÇAMENTO: MATERIAL DE CONSUMO` — uma categoria, não um documento.

E os números não fecham com o orçamento disponível:

| | Orçamento Fabesul | OC 034925 |
| :--- | :--- | :--- |
| Descrição | `Bobina Térmica 1 Via 80X80M Br Regispel R23 T12 48G R.31123` | `BOBINA TÉRMICA (CONSUMO)` |
| Qtd | 48 | 48,00 |
| Unitário | **10,91** | **13,99** |
| Data | 12/08/2026 | 16/01/2026 |

Mesma quantidade, unitário 28% maior, 7 meses de diferença — a OC veio de outro orçamento, que não está na pasta. E extraiu **1 item de um orçamento de 11**, redigitando a descrição e perdendo o código do fornecedor.

→ **O vínculo equalização → OC não existe nos arquivos.** Guardar `NUMERO_OC` desde a v1 continua valendo.

> ⚠️ **CORRIGIDO em 05/09 (Guilherme)**: eu havia escrito que "auditoria hoje é impossível". **Exagero.** Quando alguém sobe o processo no Fluig, anexa tudo corretamente — o dossiê existe lá. O problema real não é perda de rastreabilidade, é **redigitação**: o mesmo dado é digitado no orçamento, na equalização e de novo na OC. É tempo e erro (o unitário da bobina saiu 28% diferente), não buraco de auditoria.

---

## 9. Achados de campo — Engenharia (Mega Curitiba Fase 7, fundações)

**Fonte**: 4 Google Sheets (`EAP FUNDAÇÃO` R01/R02/R03, `EQU Fund Profunda_R01`) + carta proposta JB, proposta Pretech, memorial técnico. Obra real de ~R$ 1,2 milhão, 4 proponentes cotados, 12 convidados.

> **Veredito**: Engenharia **não é** Facilities com colunas a mais. Facilities é `atividade → valor fechado`. Aqui a unidade atômica de comparação é **(item × proponente)** carregando unidade própria, quantidade própria, preço de material, preço de mão de obra, status de cotação e três canais de nota distintos.

### 9.1 Estrutura e profundidade

Numeração `NN.` → `NN.NN` → `NN.NN.NN`, com zero à esquerda. **Profundidade máxima: 3 níveis. Nunca 4.**

Colunas do EAP em branco emitido pela CR (13 colunas):
```
ITEM | DESCRIÇÃO | CONSIDERAÇÕES | QUANTIDADE ESTIMATIVA | UNID | QUANTIDADE PROPONENTE |
R$ UNITÁRIO MATERIAL | TOTAL MATERIAL | R$ UNITÁRIO M.O | TOTAL MO |
R$ UNITÁRIO MAT+MO | TOTAL GLOBAL | NOTAS PROPONENTE
```

Linhas reais:
```
02.01.02  PERFURAÇÃO DE ESTACA HÉLICE D=40CM ............  929,00  M
02.02.01  CONCRETO USINADO BOMBEADO 40MPA ...............  164,00  M3   [PERDA NO VALOR UNITÁRIO]
02.03.01  ARMAÇÃO ESTACA HÉLICE CONTÍNUA - AÇO CA-50/60 . 7.552,00 KG
01.04.01  SEGURO DE GARANTIA CONTRATUAL - 30% DO VALOR ..    1,00  VB
01.07.01  CONTROLE TECNOLÓGICO DO CONCRETO ..............  291,75  M3
```

Unidades literais: `VB · MÊS · M · M3 · M³ · KG · CJ · DIA · LITRO · l · unid` (`M3` e `M³` coexistem no mesmo corpus).

### 9.2 Duas quantidades, e a unidade também varia por proponente

- `QUANTIDADE ESTIMATIVA` + `UNID` = referência da CR
- `QUANTIDADE PROPONENTE` = levantamento próprio do fornecedor — **e é ela que multiplica o preço**

Divergem de fato, na mesma linha:

| Item | CR | Monopólio | JB | Pretech | Petry |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `01.05.02 EQUIPE DE TOPOGRAFIA` | `MÊS` | `MÊS 1,00` | `MÊS 1,00` | **`DIA 15,00`** | — |
| `02.03.01 POSICIONAMENTO DA ARMADURA` | `VB 1,00` | `VB 1,00` | **`KG 7.844,51`** | `VB 1,00` | **`KG 8.399,60`** |
| `02.03.02 BOTA FORA` | `VB 1,00` | `VB 1,00` | `VB 1,00` | **`M³ 250,00`** | `VB 1,00` |
| `02.01.02 PERFURAÇÃO D=40CM` | `M 493,00` | `M 493,00` | `M 929,00` | `M 929,00` | `M 929,00` |

→ **Unidade e quantidade pertencem à tupla (item × proponente)**, e o item precisa ADICIONALMENTE de `quantidade_referencia` + `unidade_referencia`. A divergência entre as duas é o principal sinal de risco da equalização.

### 9.3 Três preços unitários, não um

`R$ UNITÁRIO MATERIAL` · `R$ UNITÁRIO M.O` · `R$ UNITÁRIO MAT+MO`, cada um com seu total.

Exemplo literal (JB, `02.02.01`): `164,00 | M3 | 164,03 | R$ 849,30 | R$ 139.310,32 | R$ 151,56 | R$ 24.860,00 | R$ 1.000,86 | R$ 164.170,32`

A separação **não é cosmética**: define faturamento direto, tratamento de ISS e a isenção de retenção previdenciária de 11%.

### 9.4 ⚠️ CORREÇÃO — BDI não existe como coluna, nem aqui

**Zero colunas de BDI. Zero linhas de BDI. Zero encargos sociais.** Em Facilities também era zero em 15 arquivos.

O que existe é **premissa de edital**, no rodapé de todo EAP:
> *"Nos preços dos materiais e mão de obra descritos na planilha deverão estar inclusos todos os impostos, transportes, descargas, taxas, **bdi**, e demais custos"*
> *"A modalidade de contratação será **Empreitada global e não por preço unitário**"*
> *"Os empolamentos, perdas, sobreposições... deverão ser considerados nos preços unitários"*

→ **A decisão "BDI em campo separado em `precos`" estava errada.** BDI é premissa contratual, não número de linha. Vai para o cabeçalho: `regime_contratacao`, `bdi_incluso`, `premissas_texto`.

Cuidado com falsos positivos: `MOBILIZAÇÃO/DESMOBILIZAÇÃO DE EQUIPES`, `TAXA DE MOBILIZAÇÃO DE EQUIPAMENTO HCM` e `EQUIPE TÉCNICA/ADMINISTRATIVA DA OBRA` são **itens de EAP**, não BDI.

### 9.5 ⚠️ CORREÇÃO — a árvore livre não se justifica por profundidade

Facilities: máximo 3 níveis. Engenharia: máximo 3 níveis. **Nenhum documento do corpus passou de 3.**

A árvore recursiva continua certa, mas por **outros** motivos:
- `codigo` **não é único**: `02.03` é ao mesmo tempo `ARMAÇÃO ESTACA HÉLICE` e `APOIO CIVIL` no mesmo arquivo → existem dois `02.03.01` distintos. `03.04` idem.
- `codigo` **não codifica posição**: o template mais novo vai `01.` → `03.`, sem `02.`. Derivar `id_pai` por prefixo de string quebra.
- Ordem fora de sequência no arquivo: `01.07.02` → `01.07.04` → `01.07.03`.

→ `codigo` é **rótulo de exibição**, nunca identificador. PK sintética + `ordem` explícita.

### 9.6 R01/R02/R03 são DOIS eixos misturados — com prova documental

A proposta da Pretech traz o próprio changelog:
> `REV00 – Proposta preliminar sem os projetos de fundações.`
> `REV01 – **Ajuste de quantitativos** conforme projeto executivo liberado em 20/01/26.`
> `REV02 – **Revisão de preços** de serviços complementares, ajuste para fechamento.`
> `REV03 – **Ajuste em preços** e condições dos serviços complementares.`
> `REV04 – **Ajuste pontual de projeto** liberado em 02/02/26, redução de 3 estacas de 40 cm.`

**Revisão de escopo e rodada de negociação se intercalam sob a mesma numeração.**

O escopo muda de verdade entre revisões:

| Item | Monopólio rev00 (dez/25) | JB rev03 (26/01) | branco rev03 (03/02) |
| :--- | ---: | ---: | ---: |
| `PERFURAÇÃO D=40CM` | 493,00 M | 929,00 M | 915,20 M |
| `PERFURAÇÃO D=50CM` | 578,00 M | 240,80 M | 240,80 M |
| `CONCRETO USINADO` | 175,44 M3 | 164,00 M3 | 209,96 M3 |

D=50cm caiu **−58%**. E `CONCRETO 30MPA` virou `CONCRETO 40MPA`. E `02.03.01 POSICIONAMENTO (VB)` virou `02.04.01 POSICIONAMENTO (KG)` — mudou código, descrição e unidade. **Nenhuma chave sobrevive.**

→ Precisa de `baseline_escopo` como entidade, e `proposta (fornecedor × rodada × data)` como entidade. Histórico de preço só é comparável **dentro do mesmo baseline**.

### 9.7 O rótulo de revisão não é chave de nada

| Arquivo (nome no Drive) | `DATA:` interna | `REVISÃO:` interna | `EMPRESA:` |
| :--- | :--- | :---: | :--- |
| `..._EAP FUNDAÇÃO_R02` | 03/02/26 | **03** | `PROPONENTE` (branco) |
| `..._EAP FUNDAÇÃO_R03` | 26/01/26 | **03** | `JB ACABAMENTOS LTDA` |
| `Monopolio-..._R01` | 26/12/26 *(erro de digitação de 25)* | **00** | `PROPONENTE` |

Dois arquivos dizem `REVISÃO: 03` com conteúdos diferentes. O arquivo chamado `_R02` é **o mais novo**.

→ Não confiar nem no nome do arquivo nem no campo interno. O app tem de ser a fonte da verdade de versionamento.

### 9.8 🔴 O achado mais grave: a equalização compara rodadas e escopos diferentes

Cruzando o total de cada coluna do EQU com o `Histórico da Negociação`:

| Proponente | Coluna no EQU | Corresponde a |
| :--- | ---: | :--- |
| Monopólio | R$ 1.221.270,95 | **Proposta inicial** |
| JB | R$ 925.112,00 | **Proposta R02** |
| Petry | R$ 868.187,22 | **Proposta R01** |
| Pretech | R$ 778.077,50 | **não bate com nenhuma** (inicial = 780.077,50) |

E pior: **o Monopólio está cotado sobre `493,00 m` / `578,00 m` (estimativa velha) enquanto os outros três estão sobre `929,00 m` / `240,80 m`.**

> Uma decisão de R$ 1,2 milhão sendo tomada sobre uma comparação em que um proponente responde a um escopo diferente dos outros três, e cada um está numa rodada de negociação distinta.

A coluna `Média` agrava: em `02.03.01 ARMAÇÃO` a média `R$ 88.703,79` **inclui um zero da Petry, que não cotou o item**. Em `02.03.01 POSICIONAMENTO` é média de `VB` com `KG`.

→ O modelo precisa referenciar **uma proposta específica por proponente** (fornecedor × rodada × data), nunca "o fornecedor". E precisa bloquear — ou alertar duro — comparação cross-baseline.

### 9.9 Zero, vazio e "excluído" são três coisas — confirmado pelo próprio edital

Regra 6 do edital:
> *"Os itens da planilha deverão ser todos preenchidos, com valores **ou indicação em forma de texto da inclusão em outro item ou exclusão do escopo**."*

A JB grava `R$ -` + `CONSIDERAÇÕES: NÃO SERÁ NECESSÁRIO` + `NOTAS: EXCLUSO DA PROPOSTA`. A **Petry deixa toda a seção `01.` em branco** e o mapa registra `R$ -` — que lido como zero faz a Petry parecer **R$ 182 mil mais barata** que a Pretech sem ter cotado nada.

→ `STATUS_PRECO`: `cotado | excluido | incluso_em_outro_item | nao_cotado | nao_aplicavel`. **Sem isso, toda soma e toda média estão erradas.**

### 9.10 Três canais de nota com visibilidades diferentes

| Canal | Direção | Granularidade | Visível ao fornecedor? |
| :--- | :--- | :--- | :---: |
| `CONSIDERAÇÕES` | CR → fornecedor | item | ✅ sim |
| `NOTAS PROPONENTE` | fornecedor → CR | item × fornecedor | ✅ sim |
| `ANALISE CR` | interna da CR | item × fornecedor | 🔴 **nunca** |

A coluna `ANALISE CR` é a 14ª, **existe só na cópia interna do Monopólio** — não está no PDF que o fornecedor devolveu nem na planilha da JB. Conteúdo literal: `Valor acima da média` · `Revisar - Muito acima da média` · `Desconsiderar item. Não será necessário` · `Prever valor - ... não será aceito aditivo.`

→ **Colapsar num único campo `observacao` vaza análise interna para o fornecedor.** Hoje o isolamento só existe porque a coluna é adicionada à mão num arquivo separado.

### 9.11 O fluxo do EAP em branco — confirmado

1. CR emite EAP em branco (`EMPRESA: PROPONENTE`, preços zerados, quantidades de referência preenchidas, linhas `OMISSOS` pré-alocadas)
2. Fornecedor devolve preenchido — **a JB preencheu `EMPRESA`, o Monopólio não**
3. CR identifica o Monopólio **prefixando o nome do arquivo**: `Monopolio-MCtba-F7_EAP...`. O arquivo da JB **não tem prefixo** — não dá para saber pelo nome que é dela
4. Fornecedor também devolve PDF; a JB anexou o EAP como `ANEXO I` da carta proposta
5. CR anota numa cópia própria (coluna `ANALISE CR`)
6. CR transpõe manualmente as 4 planilhas em 4 blocos de colunas do EQU

**Monopólio** = `Cód. Fornecedor 24573` · `CNPJ 34.897.810/0001-04` · `Otávio` · `contato@monopolioengenharia.com.br` · `CONVITE 12/15/2025`

→ A identidade do fornecedor mora no **nome do arquivo**, não no dado. O app precisa de export de EAP em branco + reimport, ou acesso externo do fornecedor.

### 9.12 `OMISSOS` — o fornecedor inventa itens

Linhas `OMISSOS (LISTAR ABAIXO):` são folhas em branco pré-alocadas (`01.11.01` a `01.11.05`) que **o fornecedor preenche com um item que ele mesmo criou**.

No EQU, `02.04.02 BOMBEAMENTO DE CONCRETO` e `02.04.03 ABASTECIMENTO DIESEL` estão na coluna de descrição compartilhada — mas **só a Pretech cotou** (`DIA 15,00 × R$1.750,00` e `LITRO 2.500,00 × R$7,02`).

→ `itens.descricao` 1:1 não comporta isso. `precos` precisa de `descricao_proponente`, e o app precisa de um passo de **reconciliação de omissos** entre fornecedores.

### 9.13 Faturamento direto é enorme e não cabe em qtd × preço

É a fatia faturada pelo fornecedor *do fornecedor* diretamente contra a contratante:

| Proponente | Faturamento direto | % do contrato |
| :--- | ---: | ---: |
| JB | R$ 655.000,00 de R$ 925.112,00 | **71%** |
| Pretech | R$ 335.653,95 de R$ 740.000,00 | **45%** |

Na Pretech é **uma seção inteira da EAP** (`4 FATURAMENTO DIRETO`). Na JB é **tag por item** (`Considerado como faturamento direto os serviços de mobilização (Empresa Maggi)`).

→ Precisa de flag + valor + **terceiro executor** em `precos`. E o comparativo precisa mostrar "valor total" e "valor efetivamente contratado com este fornecedor" como números diferentes.

### 9.14 Subcontratado é entidade — e pode ser concorrente ao mesmo tempo

**Maggi** aparece como executor dentro do preço da JB (3 itens) **e** como convidada independente: `Maggi | Willians | comercial01@maggifundacoes.com.br | CONVITE 1/22/2026 | PROPOSTA Sim | Apenas executa perfuração`.

→ Sem modelar subcontratado, perde-se a detecção de que dois "concorrentes" compartilham a mesma perfuratriz.

### 9.15 O total não é a soma — e há três totais para o mesmo proponente

Pretech, na mesma planilha:
- `R$ 778.077,50` — linha de total da aba de preços
- `R$ 757.147,50` — soma das seções no MAPA
- `R$ 740.000,00` — VALOR TOTAL após `DESCONTO COMERCIAL R$ (17.147,50)`

`757.147,50 − 17.147,50 = 740.000,00` fecha, mas **nenhum reconcilia com 778.077,50**. E a soma dos itens da seção `01.` dá `R$ 65.652,28` no EQU contra `R$ 182.127,28` no MAPA.

→ `total` precisa ser **armazenado E reconciliado** contra a soma calculada, com tabela `ajustes { tipo, valor, escopo }` e alerta visível de divergência. Nunca derivado silenciosamente.

### 9.16 As cláusulas fora do EAP decidem a comparação

A Pretech tem matriz de responsabilidade em 4 seções. `7.4 Fornecer o concreto` e `7.5 Fornecer e instalar as armaduras das estacas` estão **a cargo da CONTRATANTE** — mas são os itens `02.02.01` e `02.03.01` do EAP da CR.

> **`R$ 740.000 < R$ 925.112` é uma comparação falsa**: a Pretech exclui o que a JB inclui.

Outras cláusulas que mudam o preço efetivo:
- Pretech: retenção `6%` (3% após 90 dias, 3% após 180) · noturno/fim de semana `+30%` · `Custo diário da integração por equipe: R$ 7.000,00` · desmobiliza se paralisação > 6 dias úteis · data-base `dezembro/2025`
- JB: `não contempla perfuração em rocha` · matacões `repassados à Contratante` · entrada `10%` + medições mensais · validade `45 dias`
- Memorial CR: `sobreconsumo de concreto é responsabilidade exclusiva da CONTRATADA` — **em conflito direto** com o repasse de risco da JB

→ Mínimo necessário: `proposta { numero, data, validade_dias, data_base, regime, condicoes_pagamento, retencao, prazo_execucao, valor_faturamento_direto }` + tabela `clausulas { proposta_id, tipo ∈ (exclusao|premissa|risco|escopo_contratante|escopo_contratada), texto, item_eap_afetado? }`.

### 9.17 ✅ Duas coisas que Engenharia JÁ FAZ e que eu propus como novidade

**1. Rastreia quem foi convidado e não cotou.** Aba com 12 empresas e trilha `CONVITE / CONFIRMAÇÃO / PROPOSTA / Visita / NOTAS DE EQUALIZAÇÃO / DEVOLUÇÃO EQUALIZAÇÃO`. Motivos literais de declínio:
> `Apenas executa perfuração` (Aude, União, Maggi) · `Não consegue pegar o pacote completo` (Campanelli) · `"não é interessante atendermos somente a disciplina de fundações para esse empreendimento"` (Engecap) · `Não conseguiu apresentar proposta a tempo` (Engkoch)

**2. Faz benchmark de preço por unidade física entre fases.**
```
                          Fase 6      Fase 7      Diferença
Valor por m de estaca    R$ 357,74   R$ 365,87    102,27%
Valor do contrato                    R$ 740.000,00
Valor do orçamento                   R$ 472.538,55
Valor alvo (0% reajuste)             R$ 723.564,92
```

> **O histórico de preço por unidade — que é a tese do projeto — já existe em Engenharia, feito à mão.** Isso não enfraquece a ideia: valida. E dá um argumento novo para a banca — *"a Engenharia já faz isso na unha para uma obra por vez; o app faz para toda a companhia, automaticamente."*
>
> ⚠️ Mas hoje o benchmark é calculado sobre um conjunto de quantidades **diferente** do que está na grade de preços ao lado (`2.022,60 m` das quantidades novas vs. as da grade).

### 9.18 Preços contingentes — quantidade indefinida

`1.4 Faturamento mínimo diário de equipe/equipamento | dia | — | R$ 16.000,00 | —`
`4.2 Bomba de concreto | m³ | — | R$ 50,00 | —`
`Custo diário da integração por equipe: R$ 7.000,00` *(nem está numa linha de planilha)*

Preço unitário acordado, quantidade indefinida, total zero hoje.

→ Um schema com `quantidade NOT NULL` **perde exatamente os itens que estouram o orçamento na obra**.

---

## 10. A receita de apresentação — repositório `Teste-RH-`

**Fonte**: `AugustCapitalrealty/Teste-RH-`, branch default `claude/google-script-transformation-plan-puhawn` (**não existe `main`**). Clonado, lido e **as suítes de teste foram executadas com sucesso**.

> `[A CONFIRMAR]` A branch default é um branch de trabalho. Confirmar com o Guilherme se o código no ar é esse.

### 10.1 Como funciona: desenho procedural, sem template

**Não há template.** Sem `.gslides` base, sem `{{placeholder}}`, sem `replaceAllText`, sem gráfico nativo, sem PNG. É `SlidesApp` puro desenhando em **coordenadas absolutas** num canvas de **720 × 405 pt (16:9)**. Slides criados com `PredefinedLayout.BLANK`. **Gráfico é retângulo** com largura proporcional ao valor.

Zero advanced services, zero REST, zero `UrlFetchApp`.

Dois arquivos:

| Arquivo | Papel |
| :--- | :--- |
| `google-apps-script/apresentacao.gs` (1022 linhas) | Motor + todas as primitivas `PRH_*` |
| `google-apps-script/apresentacao_empresa.gs` (569 linhas) | **Motor de gráfico genérico** `PRHE_grafico_` |

### 10.2 O núcleo reaproveitável: desenhar novo → apagar velho

`apresentacao.gs:600` — `PRH_reconstruirPaginas_()`. Três garantias embutidas:

1. **Anexa antes de remover.** Se o desenho falha no meio, o rollback apaga só os novos e o deck anterior fica íntegro.
2. **Valida 16:9 antes de tocar em nada** (`Math.abs(W/H - ratio) > 0.015`).
3. **Valida a contagem final** de slides.

E **idempotência por Script Property**: o ID do deck fica em `DECKS_POR_AREA`, então reexecutar **atualiza o mesmo arquivo** — o link compartilhado nunca muda, sem duplicatas.

### 10.3 Arquitetura em três camadas

```
definirRoteiro_(modelo)   → [{id, titulo}, ...]   lista de slides, tamanho variável
desenharSlide_(id)        → switch por id
slideXxx_(slide, W, H, m) → um desenhista por tipo
```

O `id` composto (`'fortes:2'`) é como a paginação vira slide.

**O `modelo` é objeto JS puro** — nenhuma função de desenho lê a planilha. É isso que torna o teste local possível.

Padrão de disciplina que vale herdar (`painel.gs:93`):
> *"Separado de obterDadosPainel() para a apresentação da empresa poder usar exatamente a mesma conta que o painel. Se as duas recalculassem por conta própria, um dia divergiriam — e ninguém saberia qual está certa."*

→ **A tela de equalização e o deck gerado devem chamar a mesma função de cálculo.**

### 10.4 Paginação por altura estimada — resolve a lista longa de itens

`apresentacao.gs:509-550`. Não é contagem fixa por página: é **empacotamento por altura**, estimando quantas linhas o texto ocupa e fechando a página quando estoura a área útil (`topo 78` → `base 348`). O contador "(2/4)" sai no título.

É exatamente o problema que a equalização vai ter com muitos itens por fornecedor.

### 10.5 O motor de gráfico genérico

`apresentacao_empresa.gs:403`:
```js
if (itens.length > PRHE_MAX_COLUNAS || comExtras) PRHE_barras_(...)  // deitada
else PRHE_colunas_(...)                                              // vertical
```
Até 8 itens vira coluna vertical; acima disso, barra deitada com 140pt de rótulo. Colunas numéricas extras forçam a deitada.

Entrada normalizada: `[{rotulo, series: [{valor, cor}], extras: [{texto, cor}]}]`

A chamada do RH é praticamente o slide de comparação de fornecedores, trocando os rótulos:
```js
series: [{valor: a.notaAuto}, {valor: a.notaExterna}], extras: [celulaGap_(a.diferenca)]
titulosColunas: ['AUTO', 'EXTERNA', 'GAP']     →     ['ORÇADO', 'PROPOSTO', 'VARIAÇÃO']
```
E `PRHE_celulaGap_` já colore por faixa (vermelho/verde/neutro) — serve tal e qual para variação de preço.

🔴 **Limitação obrigatória de corrigir**: a escala é **fixa 0–5, hardcoded** (`barraW * valor / 5`, grade `for (v=0; v<=5; v++)`). Para preço, trocar por escala derivada do máximo da série. ~10 linhas.

### 10.6 O ativo mais valioso: o harness de teste

`testes/_slides_falso.js` + `testes/_previa_svg.js` + `testes/_ambiente.js`

- `SlidesApp` e `DriveApp` **falsos** que registram tudo que é desenhado
- Conversor do registro para **SVG** — vê os slides sem abrir o Google
- Sandbox `vm` que carrega os `.gs` no Node

**Verificado funcionando**: `node testes/apresentacao.test.js` → *"🎉 tudo passou"*; `node testes/previa.js` → HTML de 43 KB com os 7 slides em SVG.

Os asserts são o gabarito de QA — num gerador procedural, esses são os dois bugs que mais acontecem:
```js
ok('nenhuma forma de conteúdo estoura o slide', fora.length === 0);
ok('sem NaN/undefined/null em texto', !textos.some(t => /NaN|undefined|\bnull\b/.test(t.texto)));
```

> **Iterar layout em segundos no Node, sem gastar cota e sem abrir o navegador.** É isso que torna o gerador viável num sprint curto.

### 10.7 Tratamento de tempo — e onde falta

Bom: orçamento de `260s` dentro do limite de 360s do Apps Script, com **checkpoint gravado a cada deck** e retomada explícita.

Buracos para a equalização:
- O guard é **por deck, não por slide**. Deck com 40 páginas estoura sozinho e o rollback nem roda — o timeout mata a execução.
- **Não há `LockService`.** Duas execuções concorrentes reconstroem o mesmo deck. Em web app multiusuário é risco real.
- Cada slide dispara dezenas de `insertShape` individuais (>50 formas por deck). `SlidesApp` não expõe `batchUpdate`. Custo é tempo, não cota.

### 10.8 O que precisa ser trocado ao portar

| Onde | Valor hardcoded |
| :--- | :--- |
| `sheets.gs:29` | `ID_PLANILHA = '1v1SEGIhz...'` |
| `apresentacao.gs:19-20` | IDs das logos no Drive |
| `apresentacao_empresa.gs:17` | `deckId` do consolidado |

⚠️ **São IDs de produção da Capital Realty num repositório GitHub.** Não são segredos (acesso ainda depende de permissão no Drive), mas vazam estrutura interna. O próprio código reconhece a regra em `apresentacao.gs:210` — *"o mapa área → deck mora em propriedade de script, e não no código, porque o repositório é público"* — e ela foi **esquecida** nas logos e no deck da empresa.

**Compartilhamento não existe**: nenhum `setSharing`/`addEditor`/`addViewer` em nenhum `.gs`. O deck nasce privado do dono do script; a distribuição é copiar link do Log. **Se a equalização precisa entregar o deck a alguém, isso é código novo.** Caminho mais simples: `PASTA_DOS_DECKS` já compartilhada com o time.

Manifesto: falta o escopo `auth/presentations` (o `auth/drive` cobre na prática); `script.external_request` está listado e **nenhum `.gs` usa `UrlFetchApp`** — escopo herdado desnecessário.

### 10.9 O que é frágil

- **Escala 0–5 hardcoded** em toda parte (ver 10.5)
- **Coordenadas mágicas**: `base = 306`, `alturaMax = 190`, `y + 77`. `PRH_DS.margin` e `contentY` estão declarados e **quase não usados** — os números aparecem literais. Mexer no cabeçalho quebra tudo abaixo, silenciosamente.
- **Autofit por estimativa de caractere** (fatores `0,58` Montserrat / `0,52` Open Sans). É avanço médio empírico, não métrica da fonte. Fonte diferente ou muito numeral e a estimativa erra.
- **Vocabulário de RH cravado no motor**, não nos dados: `'PESQUISA DE SATISFAÇÃO INTERDEPARTAMENTAL'` literal em `PRH_slideCapa_`, mapa fixo de títulos em `PRH_tituloPorId_`. Isso é reescrita, não configuração.
- **Duplicação entre os dois arquivos**: `PRH_reconstruirPaginas_` ≈ `PRHE_reconstruirDeck_`; dois motores de coluna. **Ao portar, unificar.**
- `testes/painel.test.js` requer `playwright` não declarado (não há `package.json`) — `rodar-tudo.sh` falha em máquina limpa.
- Arquivo lixo `&1` (0 bytes) commitado na raiz.

### 10.10 Caminho de porte

1. Copiar `apresentacao.gs`, renomear prefixo. **Manter**: `shape_`, `linha_`, `texto_`, `card_`, `kpi_`, `pill_`, `logo_`, `header_`, `escalaBarra_`, formatadores, `PRH_DS`, `deckDaArea_`, `guardarNaPasta_`, `lerJson_`/`gravarJson_`, `reconstruirPaginas_`. **Apagar** todos os `slideXxx_` de RH.
2. Copiar `PRHE_grafico_`/`barras_`/`colunas_` e **trocar o `/5` por escala derivada do máximo**.
3. Copiar o harness de teste **antes** de escrever qualquer slide novo.
4. Escrever `montarModelo_(equalizacao)`, `definirRoteiro_(m)` e um desenhista por tipo.
   Roteiro sugerido: **capa · resumo (KPIs) · comparativo de totais · itens paginados · recomendação**
5. Trocar IDs de logo, definir `PASTA_DOS_DECKS`, **escrever o compartilhamento**.
6. Acrescentar `LockService` e checkpoint por slide se o deck passar de ~30 páginas.

---

## 11. Roadmap 2.0 — decidido em 05/09/2026

**Decisão do Guilherme**: LPU e performance de contratos/SLA **ficam para a versão 2.0**. Já existe um controle de performance de contratos na casa; a melhoria entra depois. Mapear a LPU fica para depois.

Motivo: proteger o sprint de 4 dias. A v1 entrega a equalização com histórico de preço; contrato e SLA são um segundo produto em cima da mesma base.

### 11.1 O que vai para a 2.0

| Item | O que é | Por que vale |
| :--- | :--- | :--- |
| **Integração Fluig** | Disparo automático da avaliação a partir do encerramento da medição | ⚪ **Confirmado como futuro em 05/09.** Ver 11.1.1 antes de retomar |
| **Cadastro de contratos LPU** | Contrato → itens → preço unitário fixo → vigência → empreendimento | Preço de referência **contratual**, não estatístico |
| **Equalização pré-preenchida por contrato** | Item sob contrato não se cota: aplica-se o preço e confirma-se com o fornecedor | Acelera drasticamente a compra pequena recorrente |
| **Alerta de preço fora do contrato** | Proposta acima da LPU vigente = descumprimento, não "preço ruim" | Controle, não sugestão |
| **SLA mensal digital** | Anexo II operacionalizado: inconformidade × tolerância → nota → glosa | Avaliação objetiva, já assinada pelo fornecedor |
| **Cálculo de glosa** | Desconto proporcional na NF do mês seguinte | Saving contratualmente exigível |
| **IQF alimentado pelo SLA** | Substitui os 5 critérios subjetivos do plano original | Objetivo em vez de opinião |
| **Condições comerciais normalizadas** | Regra dos dias 10/20, 48h úteis, multa 15% viram campo estruturado | Torna "condições de pagamento" comparável entre proponentes |

### 11.1.1 Fluig — o que levantar quando for a hora

Decisão de 05/09: fica para depois. Quando retomar, **o levantamento vem antes do código** — nada aqui é decisão técnica isolada.

| Levantar | Por quê |
| :--- | :--- |
| Quem é dono do processo de medição no Fluig | Alterar o fluxo não é alçada de TI sozinha; envolve Suprimentos e Financeiro |
| O Fluig da casa expõe API, webhook ou base consultável | Define se é integração ou alteração de workflow — custos muito diferentes |
| Existe consultoria TOTVS contratada | Se sim, é demanda de backlog; se não, é projeto |
| Qual o SLA de mudança nesse fluxo | Dimensiona o prazo real |

⚠️ **O condicionamento do encerramento da medição não volta sem decisão formal.** Travar o encerramento significa travar liberação de pagamento a fornecedor — com o contrato do Canaveral prevendo pagamento nos dias 10 e 20 e multa de 15%. É decisão de processo, não de sistema.

O substituto já entregue é mais barato e não depende de ninguém: lembrete automático, painel de pendências por Mega, e a nota aparecendo na tela do comprador na cotação seguinte. **Incentivo em vez de obrigação.**

### 11.2 O que a v1 precisa deixar pronto para não virar reescrita

Custa quase nada agora e é caro depois:

1. **Campo de referência com origem plugável.** A comparação da v1 mostra `PRECO_REFERENCIA` + `ORIGEM_REFERENCIA`. Na v1 a origem é `historico`. Na v2 passa a ser `contrato` quando existir contrato vigente para aquele item.
   → **O mecanismo de alerta é idêntico nos dois casos.** Se a v1 já ler a referência de um campo em vez de calcular direto do histórico, a v2 vira carga de dado, não reconstrução de tela.

2. **`Catalogo` com unidade de embalagem e variante.** A LPU ensinou isso (`PCT c/ 100 sacos`, azul vs marrom), mas a v1 já precisa por causa da equalização. Nasce certo de graça.

3. **`Fornecedores` com espaço para vínculo contratual.** Uma coluna `TEM_CONTRATO_ATIVO` vazia na v1. Não modelar contrato agora — só não fechar a porta.

4. **`NUMERO_OC` na equalização.** A OC já é o elo obrigatório (o nº da OC é obrigatório na NF). Guardar o campo desde a v1 é o que permite, na v2, amarrar equalização → OC → NF → SLA sem migração.

> Nada disso constrói funcionalidade de v2. É só não criar dívida que obrigue a refazer tela.

### 11.3 O que estar dentro do Workspace nos dá de graça

> Ideia do Guilherme, 05/09/2026: *"colocar o link da pasta que pode salvar já redirecionando — trabalhamos no Google Drive com Workspace, então podemos fazer várias coisas."*

O app não roda **ao lado** do Workspace, roda **dentro** dele. Isso resolve problemas que teríamos de construir do zero em qualquer outra stack.

#### Pasta por equalização — a ideia central

```
/Capital Fornecedores/
  2026/
    Mega Curitiba/
      EQU-2026-0142 — Revitalização Reservatório/
        EQU-2026-0142 (planilha snapshot)
        EQU-2026-0142.pdf
        EQU-2026-0142 — apresentação (Slides)
        propostas/
          Norte Sul — proposta R01.pdf
          Monopólio — EAP preenchido
        OC-034925.pdf
```

O app cria a pasta, guarda tudo dentro e devolve **o link da pasta**, não o link de um arquivo solto.

**Isso resolve três coisas de uma vez:**

1. **O elo perdido da OC (§8.13).** Hoje a OC `034925` só aponta para o texto livre `ORÇAMENTO: MATERIAL DE CONSUMO` — não existe forma de achar a equalização que justificou uma compra. Com pasta por equalização e o nº da OC gravado, a rastreabilidade passa a existir por construção.
2. **O compartilhamento que o `Teste-RH-` não resolve (§10.8).** O motor de Slides não tem nenhum `setSharing`/`addEditor` — o deck nasce privado do dono do script. Se o arquivo é **criado dentro de uma pasta já compartilhada, ele herda a permissão.** É a correção mais barata possível: não precisa escrever código de compartilhamento, só criar no lugar certo.
3. **Histórico de versão de graça.** Sobrescrever o mesmo arquivo mantém o versionamento nativo do Drive. Trilha de auditoria sem escrever uma linha.

#### Outras coisas que o Workspace já entrega

| Recurso | Para quê | Resolve o quê |
| :--- | :--- | :--- |
| **Drive compartilhado** | Dono institucional do script e da planilha | O risco de "shadow IT" que ataca o critério de Viabilidade (20%) |
| **`MailApp` / `GmailApp`** | Enviar pedido de cotação e o link da avaliação pós-OC | O gatilho sem depender do Fluig — já era a decisão |
| **EAP em branco por e-mail, com token** | O fluxo de Engenharia (§9.11): CR emite EAP em branco → fornecedor devolve preenchido | **Mata um defeito real**: o Monopólio devolveu sem preencher `EMPRESA` e a CR teve de identificá-lo prefixando o nome do arquivo. Com um ID embutido pelo app, a devolução se identifica sozinha |
| **Pasta de entrada no Drive** | Fornecedor manda orçamento → anexo cai numa pasta → app processa | Ingestão semiautomática das propostas |
| **Google Calendar** | Validade de proposta e prazo de execução viram evento | `Validade proposta` hoje é ignorada — aparece como `30`, `08/07/2026`, `Não informado`, `N/A` (§8.12). Vira alerta real |
| **Google Docs** | Gerar o parecer / memorando de aprovação | Fecha o ciclo dos campos `Favoravel à contratação e por que?` e `Detalhar o serviço a ser aprovado` sem redigitação |
| **Triggers** | Rotinas diárias (reindexar catálogo, avisar proposta vencendo) | — |
| **`Session.getActiveUser()`** | Quem fez o quê, sem construir login | Auditoria de graça, já que o deployment é "executar como eu" |

#### Cuidado

Herdar permissão de pasta é ótimo para o deck e o PDF — e **perigoso para a análise interna**. A coluna `ANALISE CR` (§9.10) nunca pode sair na planilha ou no PDF que o fornecedor recebe. A regra dos três canais de nota vale também na hora de exportar: o snapshot compartilhado com fornecedor sai **sem** o canal interno.

### 11.4 A base de fornecedores que se constrói sozinha

> Ideia do Guilherme, 05/09/2026: *"Equalização gera dados dos fornecedores. Depois que finaliza, preenche algum dado — como foi, quem fechou, se rolou tudo certo, uma certa avaliação. E vai se auto-aumentando com a participação dos colaboradores que fazem equalização."*

**O princípio**: ninguém é encarregado de manter cadastro de fornecedor. O cadastro **acumula como subproduto** de fazer equalização. Cada cotação enriquece a base para a próxima — e quanto mais gente usa, melhor fica para todo mundo.

Isso é o oposto do que costuma fracassar. Cadastro que depende de alguém alimentar morre; cadastro que se alimenta do trabalho que a pessoa já ia fazer, não.

E responde a devolutiva do comitê **sem criar processo novo**: a avaliação deixa de ser um formulário à parte que alguém precisa lembrar de preencher, e vira o **passo de fechamento da própria equalização** — a pessoa já está ali.

#### Os dois momentos de avaliação — e por que são diferentes

| | Quando | O que se sabe | Atrito |
| :--- | :--- | :--- | :---: |
| **A — Comportamento na cotação** | ao fechar a equalização | respondeu? mandou completo? honrou a validade? foi fácil negociar? | **zero** — está fresco na cabeça do comprador |
| **B — Execução do serviço** | depois da entrega / OC | prazo, qualidade, segurança, limpeza | exige um toque depois |

**A é subestimada e é de graça.** Ninguém mede hoje, e o comprador sabe na hora. E os documentos provam que esse dado existe e se perde:

- `Não conseguiu apresentar proposta a tempo` (Engkoch) · `não é interessante atendermos somente a disciplina de fundações` (Engecap) — §9.17
- A Petry deixou **uma seção inteira em branco** e mesmo assim foi somada e comparada — §9.9
- A coluna do Monopólio no EQU **não bate com o EAP que ele mesmo entregou** (5% de diferença no unitário) — §9.6
- `Validade proposta` aparece como `Não informado`, `N/A`, `Não possui` — §8.12

Tudo isso é comportamento de cotação, visível no momento da equalização, e hoje não vira dado.

**B é o que o comitê pediu.** Fica, mínimo e por e-mail, sem Fluig.

#### O que se acumula sem ninguém digitar nada a mais

| Dado | De onde vem |
| :--- | :--- |
| CNPJ, razão social, cidade/UF, situação | BrasilAPI, na primeira vez |
| Contato, telefone, e-mail | digitado uma vez, reaproveitado sempre |
| Categorias que o fornecedor atende | dos itens que ele cotou |
| Faixa de preço praticada por item | do histórico de propostas |
| Taxa de resposta a convite | convites × propostas recebidas |
| Taxa de vitória | propostas × equalizações vencidas |
| Completude das propostas | itens cotados × itens da cesta |
| Aderência à validade e ao prazo | campos da própria proposta |

> Nada disso é campo novo para o comprador. É consequência de ter os dados estruturados em vez de espalhados em PDF.

---

## 12. O que estamos resolvendo — enunciado do Guilherme

> *"A ideia é ganhar tempo na equalização, ela ser mais agradável e comparativa aos olhos, e reduzir trabalhos manuais desnecessários."*

Esse é o eixo. Vale registrar porque a análise de campo achou defeitos graves e é fácil o projeto derivar para um discurso de auditoria — que não é o que ele é.

| Objetivo | Como o app entrega | Evidência de campo |
| :--- | :--- | :--- |
| **Ganhar tempo** | O dado do fornecedor chega pronto e para de ser redigitado três vezes | §8.1, §8.13 |
| **Comparação agradável aos olhos** | N colunas, alinhamento por item, destaque de quem está fora da faixa, cesta incompleta marcada | §8.4, §8.10 |
| **Menos trabalho manual** | Sem transpor 4 planilhas à mão; sem refazer numeração; sem conferir soma | §9.11, §1.3 |
| **Padronização** | Um formulário só, com os mesmos campos e a mesma nomenclatura em todos os Megas | §5, §8.6, §8.11 |
| **Governança como consequência** | Vem de graça da padronização — não é o produto, é o efeito | — |

### 12.1 ⚠️ Cuidado político com o achado da Fase 7

O achado de §9.8 — proponentes comparados em rodadas e escopos diferentes numa concorrência de R$ 1,2 milhão — é a evidência mais forte do projeto **e a mais delicada**: é uma decisão real, recente, de colegas da Engenharia.

**Como usar**: *"o formato induz o erro"*. O template de 3 colunas, a numeração manual e a transposição à mão produzem esse resultado com qualquer pessoa competente.

**Como não usar**: *"a Engenharia errou"*. Vira briga, e a Engenharia é justamente quem mais tem a ganhar com a ferramenta — eles já fazem benchmark de preço por metro de estaca à mão (§9.17).

O mérito não é apontar o erro. É que **o formato novo torna o erro impossível**.

---

## 13. Presets — a equalização recorrente

> Ideia do Guilherme, 05/09/2026: *"Um Mega pede material de consumo todo mês — café, papel etc. Já abrir e ele vai preenchendo as unidades; se tiver LPU já puxa o preço. Ou um aumento de fase: já traz todos os itens da última fase, e conforme a pessoa vai preenchendo vai comparando com as fases antigas — a diretoria vai ter noção de quais itens mais variaram ao longo dos anos."*

### 13.1 Por que isto é maior do que parece

O preset resolve, **por construção**, o problema mais difícil que a pesquisa de campo achou.

O catálogo canônico (§8.6) esbarra em descrições irreconciliáveis: `Café Melita 500G` × `Café Melitta 500g`; `Pastilha adesiva` × `Adesivo para vaso` (o mesmo produto, sem uma palavra em comum); e `Filtro de café` que é `1.1.8` em abril e `1.1.13` em junho — **o código não identifica o item, identifica a posição da linha**.

Casar item por descrição é aproximação, e aproximação erra.

**Com preset, o item não precisa ser reconhecido — ele é o mesmo registro.** A equalização de outubro nasce das mesmas linhas da de setembro. A comparação passa a ser exata em vez de difusa.

> **O preset é a identidade do item ao longo do tempo.** É a chave estável que o legado nunca teve.

### 13.2 Os dois usos, o mesmo mecanismo

| | Compra recorrente | Nova fase de obra |
| :--- | :--- | :--- |
| Exemplo | material de consumo mensal do Mega | Fase 7 a partir da Fase 6 |
| O preset traz | os ~30 itens, unidades e quantidades da última vez | a EAP inteira da fase anterior |
| A pessoa faz | ajusta quantidades | ajusta escopo e quantitativos |
| O preço vem de | LPU vigente *(v2)* ou último preço *(v1)* | último preço por unidade física |
| A comparação mostra | variação mês a mês, item a item | variação entre fases, por unidade |

Um mecanismo, dois mundos. É o que torna a feature valiosa nas pontas pequena e grande ao mesmo tempo.

E a Engenharia **já faz isso à mão** (§9.17): `Valor por m de estaca — Fase 6 R$ 357,74 → Fase 7 R$ 365,87`, com valor alvo calculado. O preset automatiza um raciocínio que a casa já provou que quer ter.

### 13.3 A linhagem

Cada equalização registra de onde veio:

```
preset_id · preset_versao · equalizacao_anterior_id
```

Isso forma uma **corrente**. E é a corrente que torna consultável a pergunta da diretoria — *"quais itens mais variaram ao longo dos anos"* — como uma caminhada exata pela série, não uma busca aproximada em todo o histórico.

```
Material de consumo — Mega Curitiba
  jan/26  →  mar/26  →  abr/26  →  jun/26  →  set/26
    │          │          │          │          │
    └──────────┴── mesma linha de item ────────┘
```

**Os dois mecanismos convivem e servem a perguntas diferentes:**

| Mecanismo | Responde |
| :--- | :--- |
| **Linhagem de preset** | "como este item variou nesta série?" — exato |
| **Catálogo canônico** | "pagamos preços diferentes por café entre os Megas?" — aproximado, entre séries |

### 13.4 🔴 A decomposição que a diretoria vai pedir

Se o total subiu 20%, foi **preço** ou **quantidade**? Essa é a primeira pergunta de qualquer diretor, e somar totais não responde.

A separação honesta fixa uma variável de cada vez:

```
Efeito preço      = Σ (preço_novo − preço_velho) × quantidade_velha
Efeito quantidade = Σ (qtd_nova − qtd_velha)     × preço_velho
Efeito escopo     = itens que entraram ou saíram do preset
```

Sem isso, "o material de consumo subiu 20%" é uma frase sem informação — pode ser inflação, pode ser que o Mega encheu mais um armazém.

> **Os três efeitos precisam aparecer separados na tela e no deck.** É o que diferencia um relatório de um número.

### 13.5 Cuidados

**Preset muda com o tempo.** Item entra, item sai. Mês 3 tem 30 itens, mês 9 tem 34.
→ Preset é **versionado**, e a comparação é **por item**, nunca por total entre versões diferentes. Comparar totais entre escopos diferentes é exatamente o erro de §9.8.

**Sazonalidade.** Consumo de dezembro não se compara com o de janeiro em quantidade.
→ Variação de **preço** é sempre comparável; variação de **quantidade** precisa de contexto.

**Nova fase não é cópia da anterior.** A Fase 7 tem armazéns que a Fase 6 não tinha.
→ O preset é ponto de partida, não decalque. Adicionar e remover tem que ser trivial.

**Risco de governança**: se o preset também trouxer sempre os mesmos fornecedores, nunca se testa o mercado.
→ Sugerir os convidados da última vez, **nunca fixá-los**. E mostrar há quantas rodadas o mesmo fornecedor vence.

### 13.6 Onde já encaixa no que decidimos

Nada aqui exige mudar decisão travada:

- `PRECO_REFERENCIA` + `ORIGEM_REFERENCIA` (§11.2) já estava previsto — o preset só passa a preencher `historico` na v1 e `contrato` na v2, sem mudar tela.
- A árvore com `id_pai` e `ordem` já é o que se copia para instanciar um preset.
- `quantidade` separada do item já permite trazer o item sem trazer a quantidade.
- O **modo simplificado até R$ 1.000** (§7A.3) fica muito melhor: preset + 1 cotação + preço vindo pronto é uma compra recorrente resolvida em minutos.

### 13.7 É isto que sustenta a promessa de tempo

Eu havia criticado o "−70% de tempo" do plano original como chute (e era). **O preset dá o mecanismo.**

Uma equalização mensal de material de consumo tem ~30 itens × 3 proponentes. Hoje: redigitar 30 descrições e preencher 90 células de preço, toda vez, do zero.

Com preset: os 30 itens já estão lá, as unidades já estão lá, os preços de referência já estão lá. Preenche-se quantidade e confirma-se preço.

> Isso deixa de ser estimativa e passa a ser aritmética — dá para cronometrar antes e depois, com as duas coisas na mesa.

---

## 14. Visão de gestão — comparação entre Megas

> Ideia do Guilherme, 05/09/2026: *"Uma tela de gestão. Por exemplo: tem 3 Megas, onde o café é mais barato?"*

### 14.1 Os três eixos de comparação

Com esta ideia o produto fica legível. É o **mesmo motor** olhando para três direções:

| Eixo | Pergunta | Chave de identidade |
| :--- | :--- | :--- |
| **Entre proponentes** — uma cotação | quem está mais barato **agora**? | item da equalização |
| **Ao longo do tempo** — uma série (§13) | como este item variou? | linhagem de preset — exata |
| **Entre empreendimentos** — todas as séries | onde pagamos menos pela mesma coisa? | catálogo canônico — aproximada |

O terceiro eixo é o que a diretoria enxerga primeiro, porque é o único que compara **Megas entre si**.

### 14.2 O que a tela precisa responder — e o que ela não pode fazer

A versão ingênua mostra `Curitiba R$ 25 · Itajaí R$ 28 · Esteio R$ 31` e alguém conclui *"compra tudo em Curitiba"*. Errado: café não se transfere entre Megas, e o fornecedor barato pode nem atender a região.

A tela útil responde **por que a diferença existe e o que dá para fazer**:

| Causa | Como se detecta | Ação |
| :--- | :--- | :--- |
| **Mesmo fornecedor cobrando diferente** | mesmo CNPJ, preços distintos por Mega | 🟢 **A vitória mais fácil que existe** — é um telefonema |
| Fornecedores diferentes | CNPJs distintos | O barato atende a região do caro? |
| Escala | volumes muito diferentes | 🟢 **Compra conjunta** — consolidar volume entre Megas |
| Momento | datas distantes | Não é diferença, é inflação. Comparar só dentro de janela |

> **A compra conjunta é o prêmio.** Três Megas comprando o mesmo café separadamente, de fornecedores diferentes, é economia direta e atribuível à ferramenta — porque só se enxerga com os dados juntos.

Já há indício disso no campo: `001305 — RESISTENCIA LORENZETTI ULTRA 5500 3T` custou `R$ 43,85` em 27/03 e `R$ 47,12` em 03/06 **do mesmo fornecedor** (§8.6). Ali é variação no tempo; entre Megas o mecanismo é o mesmo.

### 14.3 ⚠️ O número que abre os olhos — e a armadilha nele

*"Se todos os Megas pagassem o menor preço, seriam R$ X por ano."*

É o número que faz a diretoria prestar atenção. E é **teto teórico, não economia** — ignora logística, região de atendimento e volume mínimo.

> Apresentar como **"potencial máximo identificado"**, nunca como saving. É a mesma disciplina que aplicamos ao saving de negociação: número honesto resiste a pergunta difícil; número inflado morre na primeira.

### 14.4 O que falta no schema para isto funcionar

O grosso já está: `Precos` em formato longo com `ID_ITEM_CAT`, `EMPREENDIMENTO`, `UF`, `DATA`, `PRECO_UNITARIO` e `UNIDADE` desnormalizados **já é** a consulta desta tela. Uma leitura, um filtro em memória.

**Falta uma coisa — normalização de unidade.** Sem ela a comparação mente:

```
Catalogo
  UNIDADE_PADRAO   PCT        (como se compra)
  UNIDADE_BASE     KG         (como se compara)
  FATOR_BASE       0,5        (1 PCT = 0,5 KG)
```

Assim `Café Melitta 500g` a R$ 18/pacote e um café a R$ 32/kg viram R$ 36/kg e R$ 32/kg — comparáveis. Sem o fator, a tela compara pacote com quilo e diz o contrário do certo.

É coluna nova no catálogo, barata agora e cara depois.

### 14.5 Ligação com quarta-feira

O **achado do acervo** que eu recomendei levar ao comitê — *"pagamos 3 preços diferentes pelo mesmo serviço em 3 Megas"* — é literalmente a versão manual desta tela.

Se der para montar uma versão crua dela até terça, o achado deixa de ser um slide e vira **a ferramenta mostrando sozinha**. É bem mais forte.

---

## 15. Ingestão contínua — a base cresce com o passado, não só com o futuro

> Requisito do Guilherme, 05/09/2026: *"faça de uma maneira que no futuro vou colocar mais orçamentos do passado e/ou equalizações — vamos poder aumentar nossa base de conhecimento."*

Isso muda a natureza do importador: **não é script de migração que roda uma vez e morre. É funcionalidade permanente.** Alguém vai achar uma pasta antiga em dezembro e vai querer carregar.

### 15.1 O que isso exige

| Requisito | Por quê | Como |
| :--- | :--- | :--- |
| **Idempotência por arquivo** | reimportar o mesmo arquivo não pode duplicar ponto de preço | `hash` do conteúdo + nome na aba `Importacoes` |
| **Rastreio da origem** | toda linha sabe de que arquivo veio, quando e por quem | `ORIGEM_ARQUIVO`, `IMPORTACAO_ID` em cada registro |
| **Reversibilidade** | importação ruim tem que sair inteira | `desfazerImportacao(id)` remove exatamente aquelas linhas |
| **Versão do parser** | o parser melhora; dá para reprocessar o que veio do antigo | `PARSER_VERSAO` no registro |
| **Fila de revisão** | o que o parser não resolveu não pode sumir calado | aba `Pendencias` com o motivo, para humano resolver |

### 15.2 🔴 Confiança do dado — a coluna que impede a base de apodrecer

Uma equalização digitada no app é confiável. Uma extraída de PDF de 2024 é palpite educado. **Se as duas entrarem iguais na base, a análise mente com cara de certeza.**

```
ORIGEM ∈ { app · import_sheets · import_xlsx · import_pdf · manual }
```

Toda consulta de preço filtra ou pondera por isso, e a tela **mostra a origem**. Um alerta de variação disparado por preço extraído de PDF mal lido é pior que não ter alerta — queima a confiança na ferramenta inteira, e confiança não volta.

### 15.3 Importação parcial é o caso normal, não a exceção

Arquivo antigo frequentemente só tem cabeçalho e total, sem detalhe de item. **Isso ainda vale muito**: é um ponto de preço no nível do documento.

→ O modelo precisa aceitar equalização **sem linhas de EAP**. Nada de exigir completude, ou 80% do acervo é rejeitado.

Níveis de completude que a base deve tolerar:

| Nível | O que se aproveita |
| :--- | :--- |
| Só cabeçalho e total | quem, quando, quanto, qual Mega |
| + proponentes | quem cotou e o total de cada um |
| + itens | comparação por item |
| + qtd e unidade | preço unitário — o eixo entre Megas |

### 15.4 Orçamento avulso é um ponto de preço válido

Ele disse *"orçamentos do passado **e/ou** equalizações"*. São coisas diferentes, e a distinção importa:

- **Equalização** = comparação entre propostas
- **Orçamento** = uma proposta só, sem comparação

Um orçamento sozinho **não tem com o que comparar, mas é uma observação de preço legítima** — fornecedor, data, item, quantidade, unidade, preço unitário. E a pasta compartilhada tem **7 orçamentos para 5 equalizações**: há mais orçamento solto do que equalização por aí.

Mais: o orçamento do fornecedor é o **único documento do lote que sempre traz qtd + unidade + unitário** (§8.1). Em termos de qualidade de dado, ele é melhor fonte que a própria equalização.

> ⚠️ **Ajuste no schema**: `Propostas` precisa aceitar `equalizacao_id` **nulo**. Eu havia modelado proposta como filha de equalização — está errado. Proposta é entidade própria; equalização é a comparação de várias.

### 15.5 Efeito no argumento do projeto

Isso transforma a natureza do que a companhia tem. Hoje, cada arquivo numa pasta é uma ilha. Com ingestão contínua, **todo documento que alguém encontrar torna a base mais inteligente** — e a ferramenta melhora sem ninguém programar nada.

É também a resposta honesta para "e se o piloto rodar poucas equalizações até outubro?". O valor não depende só do que for criado no piloto: depende também do que for **resgatado do passado**.

---

## 16. Duas equalizações reais em Sheets — o que muda no parser

**Fonte**: `META UTILITIES` (19/05/2026, 3 abas) e `EQUIPAMENTOS/SERVIÇO` (12/08/2026, 1 aba). Ambas Demercado, Mega Curitiba.

### 16.1 🔴 O bug de fórmula, ao vivo, num arquivo de agosto

Arquivo de 12/08/2026, aba única:

```
1.    EQUIPAMENTOS ........ R$ 4.050,55   ← o pai
1.1     SENSORES .......... R$ 4.050,55
1.1.1     CAIXA 400X400X200 . R$ 594,50
  ...  (soma dos filhos de 1.1 = 4.050,55 ✓)
1.2     SERVIÇO ........... R$   715,00   ← FORA da conta do pai
1.2.1     MÃO DE OBRA ..... R$   715,00
VALOR TOTAL ............... R$ 4.765,55   ← 4.050,55 + 715,00
```

**O grupo `1.` diz R$ 4.050,55; deveria dizer R$ 4.765,55.** A fórmula do pai pegou só `1.1` e esqueceu `1.2` — é o `=E13+E16+E19` do template acontecendo numa equalização real e recente.

> Prova viva de que numeração e soma manuais apodrecem. É o slide de abertura, com data de agosto de 2026.

### 16.1.1 ✅ Confirmado em execução — 05/09, 07:57

O leitor rodou sobre `EQU_20260812-MEGA-CURITIBA_WIFI_CASA_DE_BOMBAS` e achou sozinho:

```
3 proponentes · 11 nós (8 itens)
  1. Golden Phone / Carryer .... R$ 4.765,55
  2. DCOMPIT ................... R$ 4.836,10
  3. CCLINKTECNOLOGIAESERVIÇOS . R$ 5.106,00

⚠ grupo "1. EQUIPAMENTOS": declarado R$ 4.050,55, filhos somam R$ 4.765,55
⚠ cesta incompleta (prop. 3): 1 de 8 itens sem cotação
```

**O defeito aparece nos TRÊS proponentes** — R$ 715,00 deixados de fora em cada coluna. Não é erro de um fornecedor: é a fórmula do grupo `1.` esquecendo o `1.2 SERVIÇO`, defeito estrutural da planilha.

E há uma nuance que muda a narrativa: **o `VALOR TOTAL` está correto** (R$ 4.765,55 = equipamentos + serviço). O que está errado é a **hierarquia** — `1.2 SERVIÇO` foi numerado como filho de `1. EQUIPAMENTOS`, quando é outro grupo. Numeração derivada da posição conserta isso na origem.

> Este é o slide de abertura, com data de agosto de 2026 e o app achando sozinho.

### 16.2 Uma planilha pode conter VÁRIAS equalizações

O arquivo de maio tem **3 abas**, cada uma uma equalização do mesmo projeto: `EQUIPAMENTOS` · `SERVIÇO DE MONITORAMENTO - ANUAL` · `MÃO DE OBRA INSTALAÇÃO`.

→ O importador percorre **todas as abas** e trata cada uma como equalização independente, ligadas pelo mesmo projeto.

### 16.3 ⚠️ Nó pai PODE ter preço próprio — a regra "folha tem preço" não basta

```
1.2   MÃO DE OBRA LOCAL ......... R$ 2.200,00   ← preço fechado aqui
1.2.1   INFRAESTRUTURA .......... (vazio)
1.2.2   PASSAR CABOS ............ (vazio)
1.2.3   INSTALAÇÃO DE PAINEL .... (vazio)
```

Os filhos descrevem escopo, não têm preço. O pai é **verba fechada**.

→ `TIPO` do nó não é só posição na árvore. Um nó com filhos ainda é `item` se ele carrega preço e os filhos não. O importador infere: *filhos sem valor + pai com valor = item de verba com escopo detalhado*.

### 16.4 Proponentes cotam ARQUITETURAS diferentes na mesma tabela

```
                        CAS        GreenPulse   Alma IoT
1.1 SENSORES         1.664,70       R$ -       10.754,70
1.2 MEDIDORES        2.943,00       R$ -        3.098,70
1.3 MONITORAMENTO    3.096,00       R$ -        3.177,90
1.4 KIT INTEGRADO      R$ -      12.885,00        —
```

Não é cesta incompleta: a GreenPulse vende **kit integrado**, os outros vendem **componentes separados**. Comparar linha a linha não faz sentido; comparar total, sim.

→ O app precisa detectar **blocos mutuamente exclusivos** e comparar no nível que faz sentido, avisando que a decomposição difere.

### 16.5 Sujeira que o parser tem que aguentar

| O que aparece | Exemplo real |
| :--- | :--- |
| CNPJ malformado | `57.679.2520001-06` — falta ponto e barra |
| **Duas empresas numa coluna só** | `Golden Phone Telecom Ltda / Carryer Telecom Ltda` com dois CNPJs |
| E-mail sem `@` | `goldentelecom.com.br` |
| Dois e-mails na mesma célula | separados por espaço |
| Telefone múltiplo | `11 3264-0000 / 3267-2227 / 997671-4803` |
| Traço como nulo | `Contato: -` |
| Mesmo fornecedor em duas colunas | `Eletrobarras` em E e G, mesmo CNPJ e mesmo valor |
| Linhas de EAP vazias | `1.2.2` e `1.2.3` sem descrição e sem valor |
| Validade com erro de digitação | `3 dias`, `3 dia`, `N/A` |
| Prazo sem unidade | `90`, `60`, `1` |
| `Faturamento Direto` = `N/A` | confirma que não é booleano |
| Data da proposta **depois** da equalização | proposta 24/08, equalização 12/08 |
| Data prevista **antes** da equalização | início 08/06, equalização 12/08 |

### 16.6 `Redução total` nem sempre está quebrado

No arquivo de agosto está **correto**: Golden fez `inicial 4.900,55 → R01 4.765,55`, redução `R$ 135,00`. Os outros dois mostram `R$ -`, sem negociação.

No de maio está **quebrado** nas três abas: `Proposta inicial` vazia e a redução repetindo o total.

→ Regra do importador: **derivar sempre**. Se `inicial` estiver vazia, redução é zero — nunca o total.

### 16.7 Onde os valores ficam — a regra de leitura

| Bloco | Onde está o valor |
| :--- | :--- |
| Cabeçalho (col B e C) | **na linha de baixo** do rótulo |
| Proponentes (rótulo em D) | **à direita**, nas colunas E, F, G… |
| EAP | código em B, descrição em C, valores nas colunas dos proponentes |
| Rodapé | rótulo mesclado de B a D, valores à direita |

→ Confirma a decisão de **localizar por rótulo, nunca por número de linha**. As duas planilhas têm o mesmo layout mas linhas diferentes.

---

## 17. Armadilhas de leitura do Sheets — aprendidas apanhando

Três coisas que só apareceram rodando contra planilha de verdade, e que custaram uma hora cada.

### 17.1 🔴 `R$ -` é o número zero, não texto

Célula com traço contábil **não devolve string**. `getValues()` devolve `0`.

O leitor marcava "cotado por zero", a cobertura de todos os grupos ficava idêntica, e a detecção de soluções alternativas parava de achar qualquer coisa — **piorando** em vez de melhorar depois de uma correção que estava certa.

→ Ler `getDisplayValues()` junto e usar o **valor exibido** para separar o traço contábil de um zero digitado de propósito. Uma leitura de faixa a mais por aba; barata.

### 17.2 Linha de grupo carrega resultado de fórmula — e a fórmula é o que não é confiável

Usar o valor de um nó de grupo para decidir *quem cotou o quê* é construir em cima justamente do que sabemos estar quebrado (§16.1).

→ Cobertura e histórico contam **só nós do tipo `item`**.

### 17.3 Sem carimbo de versão, você depura código que não está rodando

No Apps Script se cola arquivo à mão. Passamos três ciclos corrigindo uma função que já estava correta, porque o editor tinha outra versão.

→ `CF_VERSAO_IMPORT` impresso no cabeçalho de todo relatório, e `verificarVersoes()` listando o que está carregado. **Hábito, não remendo.**

### 17.4 Estado validado — 05/09/2026, 08:15

Leitor `2026-09-05.7`, dois arquivos reais, quatro equalizações, **zero falso positivo**:

| Aba | Achado |
| :--- | :--- |
| WiFi 12/08 — Equipamentos | defeito de fórmula nos 3 proponentes (R$ 715 / 912 / 2.200 fora da conta) · 1 cesta incompleta real |
| Meta 19/05 — Equipamentos | kit integrado × componentes separados |
| Meta 19/05 — Mensalidade | anual = mensal × 12 |
| Meta 19/05 — Mão de obra | mão de obra do fornecedor × mão de obra local |
