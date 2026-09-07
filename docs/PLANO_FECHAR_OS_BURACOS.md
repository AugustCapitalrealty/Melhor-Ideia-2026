# Plano para fechar os buracos até 15/10

**Origem:** auditoria do MVP de 07/09/2026, que verificou cada promessa contra o código-fonte.
**Nota de partida:** 6,5/10 — *"defensável como software, não como resultado"*.
**Objetivo:** chegar ao relatório final com os dois números que decidem o concurso apurados.

---

## A tese deste plano

A auditoria foi clara sobre onde está a perda: **não é código, é evidência.**

> *"A distância entre as duas defesas não é código: são 2-3 horas de cronômetro no Excel, 6-10 horas de disparo de avaliação, 2-3 horas de acertar os critérios, e 3-4 semanas de cotação real entrando."*

Por isso este plano **não é ordenado por esforço nem por dificuldade**. É ordenado por **quanto cada item move a nota**, com uma exceção que vem primeiro por motivo de calendário.

---

## Bloco 0 — O que já foi feito hoje, 07/09

| Item | Situação |
|---|---|
| Retroalimentação: nota do fornecedor na tela de quem decide | ✅ feito e testado (mutação 5/5) |
| Sucesso falso em `apiSincronizarMarcaOnTheFly` | ✅ corrigido (mutação 3/3) |
| Cinco critérios ponderados como prometidos ao comitê, IQF 0-100 com Classes A/B/C | ✅ feito e testado (mutação 7/7) |
| Validação de cotação mínima + Megas e empresas em cadastro | 🔄 em execução |

---

## Bloco 1 — Esta semana (08 a 12/09) · a janela que fecha sozinha

### 1.1 Medir o tempo do Excel — **PRIORIDADE MÁXIMA**
**Por quê:** vale 30% da nota do concurso e é o primeiro critério de desempate. **E só pode ser feito enquanto o Excel ainda estiver em uso.** Depois que ele sair, o "antes" é perdido para sempre.
**O que fazer:** cronometrar **3 equalizações reais** feitas na planilha, do arquivo em branco ao PDF pronto. Registrar com `registrarTempoNaPlanilha(minutos, descricao)` em `Manutencao.gs`.
**Quem:** você. **Esforço:** 2-3 h. **Código necessário:** nenhum — a instrumentação já existe e já recusa medição implausível.

### 1.2 Corrigir as 3 divergências de dados
**Por quê:** uma equalização na base tem total declarado **12× o calculado**, e o valor homologado sai no topo do PDF que vai à Diretoria. Numa demonstração ao vivo, é dano difícil de recuperar.
**O que fazer:** rodar `diagnosticarDivergenciasAltas()` e depois `corrigirEmpresaDasEqualizacoes()` em `Manutencao.gs`. Ambas têm modo de simulação antes de escrever.
**Quem:** você. **Esforço:** 1-2 h.

### 1.3 Rodar `setupBaseDeDados` para o schema v6
**Por quê:** as colunas novas de avaliação (`SEGURANCA`, `LIMPEZA`, `VERSAO_CRITERIOS`) só nascem quando a função roda. Sem isso, a avaliação grava com colunas faltando.
**Quem:** você. **Esforço:** 5 minutos.

### 1.4 Rodar `migrarParaSchemaV4`
**Por quê:** preenche CATEGORIA no que já está gravado. Sem isso, os filtros por categoria enxergam a base pela metade.
**Quem:** você. **Esforço:** 5 minutos.

---

## Bloco 2 — Semana de 15 a 19/09 · governança

### 2.1 Validação de cotação mínima
Hoje o sistema permite homologar R$ 80 mil com uma proposta só. A tabela `Regras` existe no schema e nunca foi lida. Ligar a regra à homologação, com faixas configuráveis em tabela.
**Esforço:** 3-4 h. **Status:** 🔄 em execução hoje.

### 2.2 Megas e empresas saem do código, viram cadastro
Os três Megas estão fixos no código. Um quarto Mega exigiria alterar programa — o que destrói o argumento de escala (Obras, Demercado, 2027).
**Esforço:** 4-6 h. **Status:** 🔄 em execução hoje.

### 2.3 Registro do comportamento de cotação no fechamento — a "Frente 1"
Prometida ao comitê como *"atrito zero, disponível desde o início"*: ao homologar, registrar se o proponente respondeu ao convite, apresentou proposta completa e honrou validade e prazo. É dado que já se sabe na hora de fechar e que hoje não é medido em lugar nenhum. A tabela `Convites` existe e está vazia.
**Esforço:** 4-6 h.

---

## Bloco 3 — Semana de 22 a 26/09 · o piloto começa

### 3.1 Piloto em Facilities — Curitiba e Esteio
**Meta:** 8 a 12 equalizações reais, do começo ao fim no sistema.
**Por quê é o item de maior peso:** hoje **zero** cotações reais passaram pela ferramenta. É a primeira pergunta que um avaliador cético faz, e a resposta atual é constrangedora.
**Cada equalização real produz, de graça:** uma medição de tempo do lado novo, um ponto de histórico de preço, uma disputa decidida (que alimenta a taxa de vitória) e uma avaliação pendente na fila.

### 3.2 Marcar o vencedor das equalizações importadas
As equalizações do acervo entram como `importada`, sem vencedor. Abrir cada uma, marcar quem ganhou e homologar transforma o acervo em **fila de avaliação** — e permite avaliar fornecedores de memória, sem esperar compra nova.
**Esforço:** 15 min por equalização.

### 3.3 Alerta de variação de preço na digitação
O plano original diz textualmente: *"nunca se corta a fase 4 — ela **é** o produto"*, e o teste de aceitação escolhido foi *"o app aponta sozinho os três defeitos que achamos"*. Esse teste **não pode ser executado hoje**: a grade de nova cotação não consulta o histórico.
A diferença entre *"o sistema avisa"* e *"o comprador lembra de ir olhar"* é a diferença entre um produto e um relatório.
**Esforço:** 8-12 h.

---

## Bloco 4 — 29/09 a 10/10 · consolidação

### 4.1 Apurar o saving
O dado existe na base (`VALOR_PROPOSTA_INICIAL`, `REDUCAO_NEGOCIADA`) e nunca foi somado. É o número que o concurso julga.
**Esforço:** 2-3 h.

### 4.2 Fechar o comparativo de tempo
Com o "antes" medido no Bloco 1 e o "depois" acumulado no piloto, `relatorioDeTempo()` produz a comparação sozinho — com mediana, e com aviso de amostra pequena quando n<5.
**Esforço:** 1 h.

### 4.3 Relatório final
**Prazo do regulamento: 15/10.** Não é negociável.
**Esforço:** 6-8 h.

---

## Versão futura — mapeado, fora do escopo destes 39 dias

### Aviso ativo ao gestor: e-mail e chatbot
A fila de pendências existe dentro do app. O que falta é o sistema **ir atrás** do gestor: e-mail ao homologar, lembrete enquanto pendente, e o mesmo formulário respondível por chatbot para quem está no Mega e não abre e-mail.
Desenho pronto; a base já tem a fila calculada, o vínculo com a compra e o avaliador vindo do login. Falta o gatilho, o texto e a rota de link direto.
**Esforço: 6-10 h.** Há caminho disponível internamente para o canal de chatbot.

### Catálogo canônico com unidade base
Para comparar "pacote de 500 g" com "quilo" é preciso um fator de conversão por item. As colunas `UNIDADE_BASE` e `FATOR_BASE` existem e estão vazias. Só se preenche com uso real, então depende do piloto.
**Esforço:** 10-16 h.

### Gerador de apresentação (Fase 7 do plano original)
Previsto no plano e nunca portado. **Recomendação: cortar formalmente do escopo** e dizer isso, em vez de deixar como promessa aberta. Uma promessa esquecida num plano vale menos que um corte declarado.
**Esforço se mantido:** 12-20 h.

### As demais tabelas mortas
`Catalogo`, `Presets`, `PresetItens`, `Notas`, `Baselines`, `Clausulas`, `Ajustes` — existem no schema e nunca recebem escrita. **Não são urgentes**, mas o schema com 22 abas operando com 8 é uma dívida que cresce. Decidir, para cada uma: implementar ou remover do schema.

---

## O que muda na nota

| Bloco | O que fecha | Efeito esperado |
|---|---|---|
| **0** (feito hoje) | Retroalimentação, critérios como prometidos, sucesso falso | Tira as três perguntas mais constrangedoras da mesa |
| **1** (esta semana) | Tempo do Excel medido, base limpa | **É o bloco que mais move a nota.** Sem ele, "impacto" continua sendo estimativa |
| **2** | Governança de compra, escala real | Responde "e se abrirmos um quarto Mega?" e "homologa com uma cotação só?" |
| **3** | Uso real | Responde "quantas cotações reais?" — hoje a resposta é zero |
| **4** | Números apurados | Transforma o relatório final de plano em resultado |

**A conta do tempo:** somando o que resta de código nos blocos 2 e 3 — cerca de **20 a 30 horas** — e o piloto correndo em paralelo, cabe nos 39 dias. **Mas só se o cronômetro no Excel for esta semana.**

---

## Regra que vale para todos os itens

Nada entra sem teste verificado por mutação. Foi assim nas 40 correções até aqui, e foi o que fez a auditoria encontrar defeitos reais em vez de suposições — inclusive dois defeitos que os próprios testes acharam antes de qualquer pessoa usar o sistema.

---

*Documento gerado em 07/09/2026 a partir de auditoria linha a linha do código-fonte.*
