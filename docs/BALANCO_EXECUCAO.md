# Capital Fornecedores — balanço de execução

**Data:** 06/09/2026 · **Commit:** `733aad9`
**Projeto inscrito no Concurso da Melhor Ideia 2026 — Capital Realty & Demercado**

| | |
| :--- | ---: |
| Fases entregues | **4 de 4** |
| Trabalho ativo | **17,5 h** |
| Defeitos com teste de regressão | **37** |
| Dias até o relatório final | **39** |

---

## 1. O objetivo

Substituir a planilha `EQU_AAAAMMDD-MEGA_PROJETO_ÁREA.xlsx`, usada pelo departamento de Facilities dos Megas para equalizar cotações de fornecedores.

A planilha equaliza, mas não lembra. Cada arquivo nasce isolado: o preço cotado em abril não conversa com o de setembro, o fornecedor que atendeu Curitiba não aparece quando Esteio cota o mesmo item, e a fórmula quebra quando alguém insere uma linha no meio.

O que o projeto acrescenta é **memória** — cada equalização feita no sistema alimenta um histórico consultável de preço por item, por fornecedor e por Mega. É a única coisa que um arquivo por cotação não tem como fazer, e é dela que sai todo o resto.

| Na planilha | No sistema |
| :--- | :--- |
| Colunas fixas: 3 proponentes, e mais que isso quebra o layout | N proponentes, sem limite de colunas |
| Só o total da linha — sem unitário, o histórico não se compara | Unitário e total, na tela e no documento |
| Fórmula que quebra ao inserir linha | Retrato estático: nenhuma fórmula para quebrar |
| Razão social e CNPJ redigitados a cada cotação | CNPJ ou nome resolvem o fornecedor pelo cadastro |
| Empresa contratante escolhida à mão, e às vezes errada | Derivada do Mega: Curitiba é Demercado; Esteio e Itajaí, Capital Realty |
| Código da EAP digitado, divergindo da hierarquia real | Derivado da posição na árvore |

---

## 2. Onde estamos

As quatro fases do plano diretor estão construídas e publicadas.

| Fase | Entrega | Situação |
| :--- | :--- | :--- |
| **1 · Dossiê de Diretoria** | Resumo executivo no topo do documento, economia da disputa e da negociação, variação percentual entre propostas, quadro de alçadas e link clicável para a proposta original — na planilha e no PDF | Completa |
| **2 · Ergonomia** | Cabeçalho fixo na grade, menor preço da linha marcado ao vivo, rascunho por rodada de renegociação, colagem de bloco do Excel, navegação por teclado na grade e nas sugestões de CNPJ | Completa (6 de 6) |
| **3 · Catálogo por categoria** | Taxonomia de sete macro-categorias com subcategorias, hub de filtros com contagem real, agrupamento em acordeão com montante somado, alternância entre cartões e tabela densa | Completa |
| **4 · Ecossistema de fornecedores** | Aba própria, busca por categoria e subcategoria, ficha 360° em gaveta lateral com cadastro, contato, disputas e histórico de preço por item ao longo do tempo | Completa |
| **Medição de tempo** | O tempo por equalização é registrado sozinho, do primeiro campo digitado até a gravação, com o tamanho junto — itens e proponentes | **Sem dados ainda** |

Três decisões de projeto que sustentam esses números e que valem registro:

- **O link no PDF foi medido antes de ser prometido.** Um teste descartável gerou o PDF pelo caminho real de exportação e procurou as anotações `/Annots` e `/URI` nos bytes do arquivo. O mesmo teste mostrou que a ordem proposta no plano original não funcionava — o `setValues` da grade apagava o link sem erro nenhum.
- **A categoria é deduzida das descrições dos itens.** Sem isso, as equalizações e os fornecedores já gravados nasceriam todos sem categoria, e a tela de filtros abriria vazia no primeiro uso.
- **A taxa de vitória só vira percentual a partir de 5 disputas decididas.** Abaixo disso a tela mostra a fração crua ("venceu 2 de 3") com aviso de amostra curta. E disputa nunca soma com orçamento avulso: orçamento solto não tem concorrente, não é vitória nem derrota.

### A base hoje

| Indicador | Valor | Leitura |
| :--- | ---: | :--- |
| Equalizações gravadas | 4 | De teste e do acervo importado. Nenhuma cotação real feita no sistema ainda |
| Fornecedores com proposta | 17 | Com cadastro, contato e histórico de preço consultável |
| Documentos de acervo importados | 21 | Orçamentos reais, que alimentam a consulta de preço |
| Registros de preço consolidados | 274 | Todos são orçamentos avulsos — nenhum é disputa com vencedor apurado |

### Qualidade da implementação

| Indicador | Valor | Leitura |
| :--- | ---: | :--- |
| Linhas de código da aplicação | 12.642 | Em 24 arquivos, dos quais 3.829 na interface |
| Linhas de teste automatizado | 2.760 | Rodam antes de cada publicação: o deploy só acontece se passarem |
| Defeitos com teste de regressão | 37 | Cada correção tem um teste que falha se o defeito voltar |
| Asserções de comportamento | 335 | Testes que exercitam a função, não que procuram texto no código-fonte |

---

## 3. Tempo gasto

**97 commits** entre 04/09/2026 às 19h53 e 06/09/2026 às 18h16 — uma janela corrida de 46 horas, das quais cerca de 17 foram de trabalho ativo.

```
04/09 sex  ▏                                          0,3 h
05/09 sáb  ████████████████████████████████████████   8,7 h
06/09 dom  ███████████████████████████████████        7,7 h
           0h        3h         6h         9h
```

Para dar escala: são **pouco mais de dois dias de trabalho** para substituir um processo que a área usa há anos. O número tem valor no relatório final — mas só depois de emparelhado com o que ele economiza, e é justamente esse segundo número que ainda não existe.

---

## 4. O que falta

Separado por quem precisa fazer. A maior parte não é desenvolvimento — é uso.

| Item | De quem | Estimativa | Situação |
| :--- | :--- | ---: | :--- |
| **Linha de base na planilha** — cronometrar 3 equalizações feitas no Excel e registrar com `registrarTempoNaPlanilha` | Você | 2–3 h | **Janela fechando** |
| **Piloto com cotações reais** — 8 a 12 equalizações | Você | 3–4 semanas | Aguardando demanda |
| **Corrigir as 3 divergências de dados** | Nós dois | 1–2 h | Diagnóstico pronto |
| **Ajustes vindos do uso real** | Desenvolvimento | 4–8 h | Reserva |
| **Relatório final** (entrega 15/10) | Você, com apoio | 4–6 h | Não começado |
| **Roteiro da apresentação** | Você, com apoio | 3–5 h | Novembro |

**Estimativa de desenvolvimento restante: 5 a 10 horas.** O sistema está pronto para o que o plano previa. O caminho crítico daqui em diante não passa mais por código — passa por cotação real entrando e por dois documentos escritos.

Sobre as divergências de dados: uma das equalizações tem total declarado **12× maior** que o calculado — mensalidade lida como anual no processamento. O resumo executivo da Fase 1 publica o Valor Homologado no topo do PDF que vai à Diretoria, e um número inflado em 12× ali é pior do que não ter resumo. `diagnosticarDivergenciasAltas()`, em `Manutencao.gs`, lista as três.

---

## 5. Cronograma do regulamento (§13)

| Data | Marco | Restam |
| :--- | :--- | ---: |
| 01/06/2026 | Encerramento das inscrições e alinhamento com o Comitê | concluído |
| 04–06/09/2026 | Construção do sistema — 97 commits, 4 fases | concluído |
| **30/09/2026** | **Fim do período de consultoria do Comitê** — última janela para ajustar escopo com eles | **24 dias** |
| **10/10/2026** | **Conclusão da implementação prática** — o piloto precisa estar rodado até aqui | **34 dias** |
| **15/10/2026** | **Protocolo do Relatório Final** — o comitê pontua o relatório e a apresentação, não o repositório | **39 dias** |
| Novembro/2026 | Apresentação presencial à Presidência e ao Comitê | — |
| 05/12/2026 | Escolha da ideia vencedora | — |

**10/10 cai num sábado.** O último dia útil de implementação é sexta, **09/10** — um dia a menos do que o calendário sugere.

---

## 6. O risco que sobrou

**Impacto para a Empresa vale 30% da nota e é o primeiro critério de desempate.** É o único critério onde ainda não existe um número defensável.

O sistema já mede o tempo por equalização sozinho. Falta o outro lado da conta: quanto a mesma equalização levava na planilha.

**Essa medição é irreversível.** Depois que a operação migrar, ninguém vai voltar ao Excel só para cronometrar. Cada semana que passa sem esse dado é uma semana a menos de janela, e o custo de perdê-la é ter que apresentar o ganho como estimativa — que é exatamente a frase que um comitê de gestores pede para justificar.

Duas ou três equalizações cronometradas resolvem. É a tarefa de melhor retorno por hora do projeto inteiro, e a única que não pode esperar.

---

## Como os números foram apurados

**Tempo ativo (16,7 h)** — estimado a partir dos carimbos de tempo dos 97 commits: soma dos intervalos entre commits consecutivos, descartando os maiores que 90 minutos como pausa, mais 20 minutos atribuídos ao início de cada um dos 6 blocos de trabalho. É instrumentação indireta, não cronômetro, e **erra para menos**: não conta leitura, discussão e decisão que não terminaram em commit.

**Volume de código e testes** — contagem direta de linhas em `app/` e `tests/` no commit `733aad9`. As 322 asserções são as chamadas a `assert.*` na suíte de regressão.

**Base de dados** — equalizações e registros conforme `dados/auditoria_cobertura.json` (05/09/2026); fornecedores conforme a tela em 06/09/2026.

**Estimativas de esforço** — calibradas pelo ritmo real deste projeto. As linhas atribuídas a "Você" dependem da chegada de cotações reais e não estão sob controle do desenvolvimento.

**Nenhum ganho de tempo é afirmado neste documento, porque nenhum foi medido ainda.**
