# Fases até o MVP — Capital Fornecedores

> Plano por **incremento entregável**, não por calendário. O calendário está em [PLANO_SPRINT.md](PLANO_SPRINT.md).
> Cada fase tem uma **definição de pronto testável** — ou passa, ou não está pronta.

---

## Mapa das fases

| # | Fase | O que destrava | Precisa para quarta? |
| :--: | :--- | :--- | :---: |
| **0** | Fundação — schema e setup | tudo | ✅ sim |
| **1** | Importador do acervo | o histórico existir | ✅ sim |
| **2** | Cadastros e catálogo | consultar fornecedor e item | ✅ sim |
| **3** | Tela de equalização | criar cotação nova | ❌ não |
| **4** | Motor de comparação | **o valor do produto** | ⚠️ só a consulta de preço |
| **4B** | Presets e linhagem — eixo do tempo | **a promessa de tempo** | ❌ não |
| **4C** | Visão de gestão — eixo entre Megas | a leitura da diretoria | ⚠️ versão crua ajuda muito |
| **5** | Saídas — planilha, PDF, pasta | o entregável que circula | ❌ não |
| **6** | Fechamento e base viva | o ciclo fechar e a base crescer | ❌ não |
| **7** | Gerador de apresentação | o deck | ❌ não |
| **8** | Avaliação pós-execução | a devolutiva do comitê | ❌ não |

**MVP = fases 0 a 6, incluindo 4B e 4C.** Com isso um comprador de verdade usa a ferramenta do início ao fim.
Fases 7 e 8 completam a narrativa do concurso, mas não são o que faz alguém usar.

### 🎯 O alívio de escopo para quarta

**A tela de equalização (fase 3) não é necessária para a reunião do comitê.**

Para a demo você precisa de: histórico importado + consulta de preço. Ou seja, fases **0, 1, 2 e uma fatia da 4**. Digitar uma equalização nova não faz parte da demonstração — o que impressiona é o app responder *"último preço R$ 8.240 em março no Mega Itajaí; esta proposta está 18% acima"*.

Isso corta bastante trabalho dos 4 dias.

---

## Fase 0 — Fundação

**Objetivo**: a base de dados existe, versionada e recriável por código.

- [ ] `setupBaseDeDados()` — idempotente, aditiva, nunca destrutiva
- [ ] As 15 abas com cabeçalho, linha 1 congelada e formatação
- [ ] `SCHEMA_VERSAO` em Script Properties
- [ ] `LockService` no wrapper de escrita
- [ ] `CacheService` para catálogo e índice de preços
- [ ] `semearDadosDeTeste()` / `apagarDadosDeTeste()` com marca
- [ ] Deployment: executar como eu + acesso à organização

**Pronto quando**: rodar `setupBaseDeDados()` três vezes seguidas numa planilha com dado não altera nem perde nada, e o relatório da terceira execução diz "nada a fazer".

**Risco**: baixo. É o alicerce — errar aqui custa reescrita, então vale fazer devagar.

---

## Fase 1 — Importador do acervo

**Objetivo**: o histórico existir. Sem isso a tese não se demonstra.

> **Não é migração, é funcionalidade permanente** (§15). Alguém vai achar uma pasta antiga em dezembro e vai querer carregar.

- [ ] Localizar linhas por **rótulo** e por **padrão de numeração**, nunca por número de linha fixo
- [ ] Reconstruir a árvore pela profundidade + ordem, **descartando a numeração gravada**
- [ ] Detectar as colunas de proponente dinamicamente (não assumir E/F/G)
- [ ] Mapear `INCLUSO`, `R$ -`, vazio → `STATUS_PRECO`
- [ ] **Nunca importar `Redução total`** — derivar sempre
- [ ] Separar revisão do fornecedor (`REV02`) de rodada de negociação (`R01`)
- [ ] Relatório de importação: o que entrou, o que foi ignorado e por quê
- [ ] **Idempotência por hash** do arquivo — reimportar não duplica
- [ ] `ORIGEM` em todo registro (`app` / `import_sheets` / `import_pdf` / `manual`) e origem visível na tela
- [ ] `desfazerImportacao(id)` — importação ruim sai inteira
- [ ] Aceitar **importação parcial**: equalização só com cabeçalho e total é válida
- [ ] Aceitar **orçamento avulso** — `Propostas` com `equalizacao_id` nulo
- [ ] Aba `Pendencias`: o que o parser não resolveu vai para revisão humana, não é descartado

**Pronto quando**: importar o template oficial em branco sem erro; importar um arquivo preenchido real; **importar o mesmo arquivo duas vezes e a base não mudar na segunda**; e o relatório listar cada linha ignorada com motivo.

**Risco**: 🔴 **alto e bloqueante** — depende de achar os originais em Sheets/xlsx. A pasta compartilhada tem PDFs exportados. Se só houver PDF, o parser muda de natureza e o custo sobe bastante.

---

## Fase 2 — Cadastros e catálogo

**Objetivo**: consultar fornecedor e item.

- [ ] `Empresas` (CR e Demercado por CNPJ) e `Empreendimentos` com apelidos (`MCtba` = `MEGA CURITIBA` = `MEGA`)
- [ ] `Fornecedores` por CNPJ, com normalização de grafia (achamos `44.983.675 0001-73`, sem barra)
- [ ] BrasilAPI com cache no Sheets e fallback manual
- [ ] Catálogo derivado das descrições importadas — não taxonomia inventada
- [ ] `CHAVE_BUSCA` normalizada + `MESCLADO_EM`
- [ ] Unidade aceitando embalagem (`PCT c/ 100 sacos`) e variante (azul/marrom)
- [ ] `Regras`: faixas de valor × cotações mínimas, por empresa

**Pronto quando**: digitar um CNPJ traz razão social e situação em menos de 2 segundos (cache quente), e buscar "café" devolve os itens do catálogo com a unidade certa.

**Risco**: médio. A granularidade do catálogo é a decisão intelectual difícil — `Café Melita 500G` e `Café Melitta 500g` precisam casar; `Pato` e `Coala` **não** podem casar (são marcas diferentes).

---

## Fase 3 — Tela de equalização

**Objetivo**: criar uma cotação do zero.

- [ ] Árvore com botão **+** contextual: novo grupo ou item do catálogo
- [ ] Numeração derivada; folha tem preço, pai é soma recursiva
- [ ] N proponentes, sem teto
- [ ] Qtd e unidade **de referência** (item) e **do proponente** (preço)
- [ ] `STATUS_PRECO` selecionável, com `INCLUSO` e `não cotado` explícitos
- [ ] Observação por (item × proponente)
- [ ] Três canais de nota com visibilidade separada
- [ ] Modo simplificado até R$ 1.000 — uma cotação, tela curta
- [ ] Todos os campos do rodapé que existem hoje

**Pronto quando**: reproduzir uma equalização real do acervo inteira na tela, e o total bater com o do documento original ao centavo.

**Risco**: médio. É a fase com mais superfície. O perigo é caprichar no visual antes de a comparação funcionar.

---

## Fase 4 — Motor de comparação

**Objetivo**: **o valor do produto.** É aqui que a ferramenta faz o que a planilha não faz.

- [ ] Último preço pago, variação % e faixa de 12 meses por item
- [ ] `PRECO_REFERENCIA` + `ORIGEM_REFERENCIA` (v1: `historico`; v2: `contrato`)
- [ ] **Alerta de variação na entrada** — vermelho na hora, não em relatório
- [ ] **Cesta incompleta marcada** — recusar comparar totais sem aviso
- [ ] Comparação alinhada por item, N colunas, com destaque de outlier
- [ ] Valor total × **valor comparável** (descontando o que um exclui e outro inclui)
- [ ] Faturamento direto separado do valor contratado com o fornecedor
- [ ] Bloqueio/alerta de comparação entre rodadas ou baselines diferentes
- [ ] Busca por categoria: "café" → fornecedores + últimos preços

**Pronto quando**: carregar a equalização da Fase 7 do acervo e o app **apontar sozinho** os três defeitos que achamos — rodadas desalinhadas, escopos diferentes e a cesta incompleta somada.

> Esse é o teste que vale ouro. Se o app pega sozinho um erro que passou por gente competente, ele está pronto.

**Risco**: baixo tecnicamente, alto em desenho. É onde "agradável aos olhos" se ganha ou se perde.

---

## Fase 4B — Presets e linhagem

**Objetivo**: a equalização recorrente nasce pronta — e a série histórica fica exata em vez de aproximada.

- [ ] `Presets` e `PresetItens` versionados; criar preset **a partir de uma equalização existente**
- [ ] Instanciar: nova equalização nasce com a árvore, itens e unidades do preset
- [ ] Quantidade sugerida da última rodada, editável
- [ ] Preço de referência pré-preenchido — `historico` na v1, `contrato` na v2
- [ ] Linhagem: `preset_id`, `preset_versao`, `equalizacao_anterior_id`
- [ ] Comparação com a rodada anterior **item a item**, nunca por total entre versões diferentes
- [ ] **Decomposição preço × quantidade × escopo** (§13.4)
- [ ] Convidados da última vez **sugeridos, nunca fixados**
- [ ] Ranking de variação: quais itens mais mudaram na série

**Pronto quando**: criar preset a partir de uma equalização real de material de consumo, instanciar a rodada seguinte, e a tela mostrar item a item quanto variou — com o efeito preço separado do efeito quantidade.

**Risco**: baixo tecnicamente. O cuidado é conceitual: preset é ponto de partida, não decalque, e comparar totais entre versões diferentes reproduz o erro da Fase 7.

---

## Fase 4C — Visão de gestão

**Objetivo**: responder *"onde pagamos menos pela mesma coisa?"* entre empreendimentos.

- [ ] `UNIDADE_BASE` + `FATOR_BASE` no catálogo — sem isso compara pacote com quilo (§14.4)
- [ ] Consulta por item ou categoria: linha por Mega com preço unitário normalizado, fornecedor, data e volume
- [ ] Dispersão: menor, maior, % de diferença, dentro de janela de tempo
- [ ] **Classificar a causa**: mesmo fornecedor / fornecedores diferentes / escala / momento
- [ ] Detectar **mesmo CNPJ com preços diferentes por Mega** — a vitória mais fácil
- [ ] Sugerir **compra conjunta** onde o volume justifica
- [ ] "Potencial máximo identificado" — rotulado como teto, **nunca como saving**

**Pronto quando**: escolher uma categoria e a tela dizer, sozinha, em qual Mega se paga mais, quanto é a diferença e **qual das quatro causas** explica.

**Risco**: baixo tecnicamente — o schema já sustenta a consulta. O risco é de leitura: apresentar teto teórico como economia derruba a credibilidade do mesmo jeito que o saving de negociação derrubaria.

---

## Fase 5 — Saídas

**Objetivo**: o entregável que circula de verdade.

- [ ] `gerarPlanilhaDaEqualizacao()` — snapshot **sem uma única fórmula**, com ID e versão carimbados
- [ ] `exportarPDF()` — export URL, paisagem, ajuste à largura, aba escolhida
- [ ] Pasta por equalização no Drive, arquivo criado dentro dela (herda permissão)
- [ ] Devolver **o link da pasta**, não o do arquivo solto
- [ ] Exportação para fornecedor sai **sem** o canal de nota interna

**Pronto quando**: gerar o PDF de uma equalização real e ele ficar legível e imprimível sem ajuste manual, e o snapshot não conter nenhuma fórmula.

**Risco**: baixo. Caminho conhecido.

---

## Fase 6 — Fechamento e base viva

**Objetivo**: o ciclo fecha, e a base cresce sozinha.

- [ ] Homologação: escolher vencedor, registrar valor final e parecer
- [ ] **Validação de cotação mínima** — acima de R$ 1.000 exige 3 propostas válidas
- [ ] Definir "proposta válida": convite recusado não conta; cesta incompleta não conta
- [ ] Captura do **comportamento de cotação** no fechamento — respondeu, mandou completo, honrou validade
- [ ] Métricas derivadas por fornecedor: taxa de resposta, taxa de vitória, completude
- [ ] `Convites`: quem foi chamado, quem recusou e por quê
- [ ] Log de alerta que virou renegociação — **é o saving atribuível do relatório**

**Pronto quando**: fechar uma equalização e o cadastro do fornecedor ficar mais rico do que estava antes, sem ninguém ter digitado um campo a mais.

**Risco**: baixo. Mas é a fase que responde ao comitê — não pode ficar de fora.

---

## Fase 7 — Gerador de apresentação

**Objetivo**: o deck, gerado pela própria ferramenta.

- [ ] Portar as primitivas de `apresentacao.gs` (§10 da base)
- [ ] Copiar o harness de teste **antes** de escrever qualquer slide
- [ ] Trocar a escala fixa `0–5` por escala derivada do máximo da série
- [ ] Unificar a duplicação entre os dois arquivos do repositório original
- [ ] Roteiro: capa · resumo · comparativo de totais · itens paginados · recomendação
- [ ] `LockService` e checkpoint por slide se passar de ~30 páginas
- [ ] Trocar os IDs hardcoded por Script Properties

**Pronto quando**: `node testes/previa.js` renderiza o deck de uma equalização real em SVG, sem forma estourando o slide e sem `NaN` em texto.

**Risco**: baixo. O motor existe e está testado.

---

## Fase 8 — Avaliação pós-execução

**Objetivo**: o que o comitê pediu, no formato mínimo honesto.

- [ ] 5 campos, uma tela, responsiva
- [ ] Disparo manual por e-mail com link — **sem Fluig**
- [ ] Nota consolidada por fornecedor, alimentando a próxima cotação

**Pronto quando**: o fiscal preenche pelo celular em menos de 60 segundos.

**Risco**: baixo tecnicamente. O risco é de adesão, e por isso tem que ser pequeno.

---

## Ordem de ataque

```
0 → 1 → 2 → [fatia da 4: consulta de preço]  ═══► COMITÊ (qua 09/09)
                    │
                    └→ 3 → 4 (completa) → 4B → 4C → 5 → 6  ═══► MVP, piloto rodando
                                                │
                                                └→ 7 → 8  ═══► RELATÓRIO (15/10)
```

**Regra de corte**: se o tempo apertar, corta-se de trás para frente. Nunca se corta a fase 4 — ela **é** o produto. E nunca se pula a fase 1: sem histórico, a fase 4 não tem o que mostrar.

**Exceção à regra de corte**: a fase 4B é a que sustenta a promessa de ganho de tempo (§13.7). Cortá-la deixa o relatório de 15/10 sem mecanismo por trás do número — e o número vira estimativa outra vez.
