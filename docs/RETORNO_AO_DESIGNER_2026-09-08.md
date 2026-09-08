# Retorno à proposta de design — "Modern Enterprise Platform"
## Capital Fornecedores · Capital Realty & Demercado
**Data:** 08/09/2026 · **De:** Guilherme Marques (Suprimentos / Facilities)

---

## Resumo

A direção visual está aprovada como alvo: hierarquia clara, densidade adequada ao volume de informação e tipografia bem escolhida. O material entregue, porém, não é implementável na forma atual — por conteúdo, não por estética.

Peço uma segunda rodada com **três condições**, detalhadas abaixo. Elas não mexem no estilo; mexem no que as telas afirmam.

---

## 1. O que fica da proposta

Estes elementos quero aproveitar como estão:

- A **faixa de KPIs** no topo da visão executiva
- A **coluna de referência histórica** ao lado das propostas, dentro da grade de equalização — hoje esse dado existe mas vive em outra tela, e trazê-lo para dentro da comparação é uma melhoria real
- A **legenda no rodapé da tabela**, explicando cada cor e cada símbolo
- Os **chips de status** e o selo de classe no cabeçalho de cada proponente
- A **gaveta lateral 360°** do fornecedor
- O ritmo de espaçamento e a hierarquia tipográfica em geral

---

## 2. Condição 1 — nenhum número inventado

Esta é a condição inegociável, e vale explicar o porquê antes do "o quê".

Este projeto está inscrito num concurso interno julgado por um comitê e, ao final, pela Presidência. A postura que adotamos desde o início é que **nada é afirmado antes de ser apurado**: a documentação declara o que ainda não existe, a tela marca a nota do fornecedor como preliminar enquanto a amostra for pequena, e o painel de saving mostra um traço e explica a ausência em vez de exibir zero. Essa disciplina é o principal ativo do projeto na avaliação.

A proposta entregue contradiz isso em quase todas as telas.

### O caso mais grave

O mockup atribui notas de desempenho e um depoimento a **empresas reais e identificáveis**, que existem na nossa base de fornecedores:

> **Canaveal Eng. — IQF 96,4 · Avaliado em 18 contratos · Top 2% da Rede Capital · 0 desvios**
> *"Equipe técnica extremamente disciplinada. Executaram a troca dos compressores no Mega Curitiba com zero impacto operacional aos inquilinos."*
> — Eng. Marcelo Duarte, Ger. Operações, Nov/2024

Nada disso aconteceu. Existe **uma** avaliação registrada no sistema inteiro, para todos os fornecedores somados. Não há 18 contratos avaliados, não existe ranking de rede, e esse depoimento não foi dado por ninguém.

Uma tela com CNPJ visível, nota de desempenho e citação atribuída a uma pessoa nomeada deixa de ser um mockup com dado de exemplo: passa a parecer um registro. Isso não pode circular, nem em apresentação interna.

**Regra para a próxima rodada:** nome de empresa real nunca aparece associado a nota, ranking ou depoimento. Use `Proponente A`, `Proponente B`, `Proponente C`.

### Os demais números a corrigir

| A tela afirma | A realidade |
|---|---|
| R$ 246.300 economizados · saving médio 11,8% | O saving **nunca foi apurado**. O cálculo existe em código; o número não existe |
| R$ 1.842.650 de volume homologado | Ver tabela de números reais abaixo |
| "100% integradas ao ERP" | **Não há integração com ERP** |
| IQF médio 94,2 / 88,7 / 91,5 por Mega | 1 avaliação registrada no total |
| "Assinatura Digital Validada (DocuSign/ICP-Brasil)" | Não existe |
| Custo Facility por m², ABL por Mega | Não coletamos área nem custo por m² |
| IPCA projetado, IGP-M, reajuste previsto em R$ | Não existe base de contratos contínuos no sistema |
| "GAS Quota: 84%", "Latência: 142ms (Cache L2)" | Telemetria inventada |

### Os números reais, para usar nas telas

Auditados em 05/09/2026, direto da base:

| | |
|---|---:|
| Equalizações na base | 4 |
| Propostas registradas | 12 |
| Linhas de preço | 78 |
| Documentos no acervo histórico importado | 21 |
| Registros no acervo | 274 |
| Fornecedores distintos | 7 |
| **Avaliações de desempenho registradas** | **1** |
| **Saving apurado** | **não apurado** |
| **Equalizações reais rodadas no sistema** | **0** — o piloto começa em setembro |

Sim, são números pequenos. É exatamente por isso que a próxima condição existe.

---

## 3. Condição 2 — desenhar o estado vazio e o estado preliminar

Todo painel da proposta está desenhado cheio. O sistema hoje está praticamente vazio, e durante todo o piloto vai estar com pouco dado. **Um design que só funciona com dado abundante não serve para o produto que existe.**

Preciso de três estados desenhados para cada componente que exibe número:

**Vazio** — ainda não há dado.
Não mostrar zero. Zero é uma afirmação ("economizamos R$ 0"). Mostrar um traço, dizer o que falta acontecer para o número existir, e apontar a ação. Exemplo real do sistema: o saving só existe quando a compra foi homologada, sabe-se qual proposta venceu e o valor inicial dela foi registrado — faltando qualquer uma das três, a tela precisa dizer qual.

**Preliminar** — há dado, mas a amostra é pequena demais para sustentar a leitura.
É o estado do IQF hoje. Precisa de um tratamento visual próprio, legível sem passar o mouse: uma nota preliminar não pode parecer igual a uma nota consolidada, porque ninguém decide uma compra passando o cursor por cima de um selo.

**Pleno** — o que a proposta já desenhou.

Um pedido específico: o **denominador sempre à vista** ao lado do resultado. Um saving de R$ 40 mil sobre R$ 200 mil contratados é uma coisa; sobre R$ 4 milhões é outra. Numerador sozinho é número que não sobrevive à segunda pergunta.

---

## 4. Condição 3 — paleta do brandbook da Capital Realty

A proposta substitui a identidade corporativa por uma paleta genérica de plataforma enterprise (indigo e cobalto). Não podemos apresentar à Presidência da empresa uma interface que abandona o brandbook da própria empresa.

**Paleta estrutural — obrigatória:**

| Cor | Uso |
|---|---|
| `#151E49` — Azul Noturno | Base estrutural |
| `#003D7B` — Azul Royal | Ações primárias e destaques |
| `#065CA9` — Azul Destaque | Elementos interativos e hover |

**Semânticas:** verde `#34C759`, laranja `#FF9500`, vermelho `#FF3B30`.

O indigo proposto (`#1E1B4B`) é vizinho do Azul Noturno, então a adaptação é pequena. O cobalto (`#2563EB`) precisa ceder lugar ao `#065CA9`.

A direção de experiência já estabelecida no produto é **Liquid Glass**: superfícies translúcidas com `backdrop-blur` e segmented controls no estilo macOS. A proposta já conversa bem com isso — só precisa trocar os matizes.

---

## 5. Correções no material entregue

Quatro problemas técnicos no que recebemos:

**O `DESIGN.md` contradiz a si mesmo.** Os tokens do frontmatter e a prosa descrevem sistemas diferentes:

| Token declarado | O que a prosa afirma |
|---|---|
| `primary: #070235` | "Primary (#1E1B4B — Deep Indigo)" |
| `secondary: #0051d5` | "Secondary (#2563EB — Crisp Cobalt)" |
| `tertiary: #000f07` (quase preto) | "Tertiary (#059669 — Emerald Green)" |

A prosa ainda especifica componentes com uma paleta slate completa (`#64748B`, `#0F172A`, `#CBD5E1`, `#E2E8F0`) que não existe nos tokens. Quem implementar pelo texto e quem implementar pelos tokens entrega dois aplicativos diferentes. Precisa haver uma fonte única de verdade.

**O `rounded-full` está quebrado.** A configuração do Tailwind no `code.html` define `"full": "0.75rem"`, enquanto o `DESIGN.md` especifica `full: 9999px`. Consequência: toda pílula, avatar e bolinha de status renderiza como quadrado arredondado em vez de círculo. Os raios `lg` e `xl` também estão deslocados um passo em relação à especificação.

**Codificação corrompida.** O HTML veio com acentuação quebrada (`Consulta de PreÃ§o`, `EqualizaÃ§Ãµes`) — arquivo salvo em codificação diferente da declarada.

**Imagens temporárias.** As fotos apontam para URLs `lh3.googleusercontent.com/aida-public/...`, que são endereços efêmeros e vão deixar de responder.

### Restrição técnica da plataforma

O sistema roda em **Google Apps Script**, e a interface atual tem 9.197 linhas com 2.551 de CSS próprio e **zero dependência externa** — nenhum CDN, nenhuma fonte remota. Essa escolha é deliberada: é o que nos permite afirmar que, se qualquer serviço externo cair durante uma apresentação, o sistema continua funcionando.

A proposta carrega o Tailwind pelo CDN de play, que compila CSS no navegador a cada carregamento, mais duas famílias do Google Fonts e a biblioteca Material Symbols. Num web app do Apps Script, que já tem partida lenta, isso soma latência e um piscar de conteúdo sem estilo, e troca autossuficiência por três dependências de rede.

**Pedido:** entregar como CSS estático, sem compilação em tempo de execução, e com os ícones embutidos ou substituídos por SVG inline.

---

## 6. Fora de escopo nesta rodada

Estas funcionalidades foram desenhadas mas não existem, e não entram agora:

- Motor de contraproposta automática com target price (R01 / R02)
- TCO ponderado por risco como critério de adjudicação
- Radar de vigência contratual com simulação de IPCA / IGP-M
- Split screen do Google Drive com visualizador de PDF embutido
- Disparo de e-mail em lote para rodadas de negociação
- Benchmark normalizado por metro quadrado de galpão
- Assinatura digital e validação ICP-Brasil

Várias são boas ideias — o target price e o radar de vigência especialmente. Ficam registradas como roadmap. Mas o prazo de implementação do concurso encerra em **09/10** com o piloto ainda por rodar, e cada uma delas é trabalho de semanas.

---

## 7. O que o produto realmente faz hoje

Para desenhar sobre o que existe:

- **Consulta de preço** por item, com histórico entre equalizações, faixa de valores e variação percentual
- **Grade de equalização** com árvore de EAP numerada por posição e número livre de proponentes
- **Alerta de variação** na própria linha durante a digitação, comparando com o histórico do item
- **Governança de marca**: marca de referência no item e marca cotada por proponente, com três situações distintas — cotou a pedida, cotou outra, cotou sem informar
- **Cadastro por CNPJ** com consulta pública, cadastro interno na frente e cache
- **Homologação** com parecer registrado e validação de cotação mínima
- **Avaliação pós-Ordem de Compra** com cinco critérios ponderados (Qualidade 30%, Pontualidade/SLA 25%, Segurança e SST 20%, Atendimento 15%, Limpeza 10%), disparada por e-mail automaticamente na homologação
- **IQF** de 0 a 100 em classes A / B / C, visível na tela onde a compra é decidida
- **Ficha 360° do fornecedor** e **painel de saving** por mês, Mega, categoria e negociador
- **Exportação** em planilha e PDF no layout oficial

Os três empreendimentos são **Mega Curitiba** (contratante Demercado), **Mega Esteio** e **Mega Itajaí** (contratante Capital Realty).

---

## 8. Prazo

Nada desta proposta entra em produção antes de **15/10**. Até lá a prioridade é o piloto com compras reais, e a interface atual já é defensável.

A segunda rodada não tem urgência de data — prefiro receber com as três condições atendidas a receber rápido.

Obrigado pelo trabalho. A base visual é boa; é o conteúdo que precisa contar a verdade do produto.
