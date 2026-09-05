# Plano de Sprint — Capital Fornecedores
### De 05/09/2026 ao relatório final. Substitui o cronograma fev–dez, que não aconteceu.

> **Este documento é o plano vivo.** O que já sabemos está em [BASE_DE_CONHECIMENTO.md](BASE_DE_CONHECIMENTO.md).
> O registro cronológico de decisões está em [HISTORICO.md](HISTORICO.md).

---

## 1. O relógio

| Marco | Data | Regulamento |
| :--- | :---: | :--- |
| Construção até o comitê | sáb 05/09 → **qua 09/09** | — |
| Consultoria do comitê fecha | **30/09/2026** | item 13 |
| Prazo final de implementação | **10/10/2026** | item 5.3 |
| Relatório final no RH | **15/10/2026** | item 7 |
| Seleção dos finalistas | 30/10/2026 | item 7 |
| Apresentação presencial | novembro/2026 | item 7 |
| Definição do vencedor | até 05/12/2026 | item 7 |

---

## 2. A tese — atualizada depois da pesquisa de campo

**Versão inicial**: "o histórico de preço é o produto".

**Versão atual** — enunciado do Guilherme, e é o eixo do projeto:

> **Ganhar tempo na equalização, torná-la mais agradável e comparativa aos olhos, e reduzir trabalho manual desnecessário.** A padronização vem junto, e a governança vem de graça como consequência.

O histórico de preço continua sendo o motor. A pesquisa de campo deu munição forte — mas ela serve para mostrar **por que o formato importa**, não para acusar ninguém. Ver §12.1 da base.

E o cadastro de fornecedor **se constrói sozinho**: cada equalização enriquece a base para a próxima, sem ninguém encarregado de manter cadastro (§11.4).

### 2.1 As provas (todas em §8 e §9 da base de conhecimento)

| Achado | Valor | Onde |
| :--- | ---: | :--- |
| Decisão de R$ 1,2M comparando rodadas diferentes (inicial × R01 × R02) e escopos diferentes (493 m × 929 m) | R$ 1.221.270,95 | §9.8 |
| `R$ 740.000 < R$ 925.112` é falso — a Pretech exclui concreto e armadura que a JB inclui | R$ 185.112 | §9.16 |
| Cesta incompleta somada como completa — Petry deixou a seção `01.` em branco e o mapa leu vazio como zero | R$ 182.127 | §9.9 |
| `Redução total` reporta 100% de economia em 5 de 10 documentos | — | §8.7 |
| Três totais divergentes para o mesmo fornecedor, no mesmo arquivo | R$ 38.077 de spread | §9.15 |
| Redigitação da OC erra o preço unitário | 28% | §8.13 |

---

## 3. Os 4 dias — 05/09 a 08/09

### Sábado 05/09 — Schema e importador

- [ ] **`setupBaseDeDados()`** — cria e migra todas as abas por código. Idempotente: roda quantas vezes precisar sem perder dado. Ver §5.
- [ ] Árvore de EAP: `id_pai`, `ordem`, `tipo` (grupo | item). **`codigo` é rótulo de exibição, nunca identificador** (§9.5)
- [ ] `precos` em formato longo — 1 linha por item × proponente, com `unidade` e `quantidade` **do proponente**, mais `STATUS_PRECO`
- [ ] `proposta` (fornecedor × rodada × data) e `baseline_escopo` como entidades
- [ ] Parser tolerante: localizar linhas por rótulo e por padrão de numeração, **nunca por número de linha fixo**
- [ ] Importar o acervo — meta: 30+ equalizações antigas

> **Bloqueador**: onde estão os `.xlsx`/Sheets originais? A pasta compartilhada tem PDFs exportados. PDF dá para ler, mas Sheets importa muito melhor.

### Domingo 06/09 — Catálogo e cadastro

- [ ] Derivar itens canônicos das descrições importadas
- [ ] `CHAVE_BUSCA` normalizada (minúscula, sem acento, espaço colapsado) + `MESCLADO_EM` para deduplicar depois sem reescrever histórico
- [ ] Unidade aceitando **embalagem** (`PCT c/ 100 sacos`), não só unidade física (§2.4)
- [ ] BrasilAPI com cache no Sheets e fallback manual
- [ ] Cadastro de fornecedor por CNPJ (única chave real — `Cód. Fornecedor` está vazio em 10 de 10, §8.5)

### Segunda 07/09 — Tela de equalização

- [ ] Árvore com botão **+** contextual: *novo grupo* ou *item do catálogo*
- [ ] Numeração derivada da posição; folha tem preço, pai é soma recursiva
- [ ] **N proponentes, sem teto** — a regra é "mínimo 3 acima de R$ 1.000", e o template de 3 colunas transformou esse piso em teto (§7A da base)
- [ ] **Modo simplificado até R$ 1.000** — 1 cotação, tela curta. Se exigir o mesmo ritual da compra grande, ninguém usa na compra pequena — que é o piloto.
- [ ] **Observação por (item × proponente)** — foi o que estourou o template real (§8.4)
- [ ] Três canais de nota com visibilidade separada (§9.10)
- [ ] Campos que não podem sumir: nº e data da proposta, condições de pagamento, lead time, prazo de execução, validade, faturamento direto, centro de custo, datas previstas, parecer, notas

### Terça 08/09 — Motor, saídas e ensaio

- [ ] Último preço pago, variação % e faixa de 12 meses
- [ ] **Alerta de variação na entrada** — lendo `PRECO_REFERENCIA` + `ORIGEM_REFERENCIA` (na v1 `historico`, na v2 `contrato`)
- [ ] Marcar **cesta incompleta** e recusar comparar totais sem aviso
- [ ] **Validação de número mínimo de cotações na homologação** — limite em tabela de configuração, não no código. Hoje nada impede fechar R$ 50 mil com 2 cotações.
- [ ] Busca por categoria
- [ ] `gerarPlanilhaDaEqualizacao()` + `exportarPDF()` — ver §6
- [ ] Ensaiar a demo 3× e separar **um achado real** do acervo

---

## 4. Depois de quarta

**10/09 → 10/10 — piloto e melhorias**
- [ ] **Medir o baseline antes do primeiro uso.** Cronometrar 3 equalizações no método atual. Irreversível: depois que alguém usar o app, o "antes" não existe mais.
- [ ] Registrar todo alerta que virou renegociação — esse log **é** o saving atribuível
- [ ] **Fechamento da equalização captura o comportamento de cotação** — quem fechou, respondeu no prazo, mandou completo, honrou a validade. Atrito zero: a pessoa já está ali (§11.4)
- [ ] Avaliação pós-execução: 5 campos, uma tela, e-mail manual. Sem Fluig.
- [ ] Gerador de Slides (portar de `Teste-RH-`, §10 da base)
- [ ] Refino visual — por último
- [ ] **30/09**: última chance de usar a consultoria do comitê

**15/10 — relatório final**, métricas em ordem de força:
1. **Saving atribuível** — só o que veio de alerta. Nunca saving de negociação.
2. **Erros de comparação evitados** — com os casos documentados de §2.1
3. **Dispersão de preço no acervo** — achado, não projeção; independe do piloto
4. **Tempo por equalização** — antes medido contra depois medido
5. **Volume** — equalizações, itens, fornecedores

> O regulamento pede "relatório final *(apresentação)*". **Gerar o relatório pelo próprio gerador de Slides** — a ferramenta provando a ferramenta.

---

## 5. `setupBaseDeDados()` — gerar as planilhas por código

**Por que existe**: num sprint de 4 dias o schema vai mudar várias vezes. Criar aba à mão é lento e diverge entre o seu ambiente e o de produção. E na hora de instalar num Drive novo, é um clique.

**Contrato da função**:

```
setupBaseDeDados()
  Para cada aba definida em SCHEMA:
    - se a aba não existe   → cria, escreve cabeçalho, congela linha 1, formata
    - se existe             → compara cabeçalho com o esperado
                              · coluna nova   → acrescenta no fim (nunca no meio)
                              · coluna sumiu  → avisa no log, NÃO apaga
                              · ordem mudou   → avisa, não reordena
    - nunca apaga linha de dado
  Grava SCHEMA_VERSAO em Script Properties
  Devolve relatório do que fez
```

**Regras que tornam a função segura de rodar em produção**:

- **Idempotente**: rodar 10× tem o mesmo efeito de rodar 1×
- **Aditiva**: coluna nova entra no fim. Nunca insere no meio, porque isso desloca dado existente
- **Nunca destrutiva**: coluna que sumiu do schema é reportada, não removida
- `LockService` em volta — duas execuções simultâneas corrompem
- Uma função separada `semearDadosDeTeste()` / `apagarDadosDeTeste()` com marca, para remover só os fictícios com a coisa em produção *(padrão copiado de `Teste-RH-`, §10)*

**Abas do schema** (detalhe dos campos na base de conhecimento):

| Aba | Papel |
| :--- | :--- |
| `Empreendimentos` | Megas e seus apelidos (`MCtba` = `MEGA CURITIBA` = `MEGA`) |
| `Empresas` | CR e Demercado por CNPJ — hoje há 5 grafias para 2 CNPJs (§8.12) |
| `Fornecedores` | CNPJ como chave, `Cód. Fornecedor` do ERP, contato, `TEM_CONTRATO_ATIVO` |
| `Categorias` / `Catalogo` | Itens canônicos, `CHAVE_BUSCA`, `MESCLADO_EM`, unidade padrão |
| `Equalizacoes` | Cabeçalho, `NUMERO_OC`, regime, premissas, parecer |
| `Propostas` | fornecedor × rodada × data × baseline — **a equalização referencia isto, não "o fornecedor"** |
| `Baselines` | versão de escopo; histórico só compara dentro do mesmo baseline |
| `EAP` | a árvore: `id_pai`, `ordem`, `tipo`, qtd e unidade **de referência** |
| `Precos` | 1 linha por item × proponente: qtd e unidade **do proponente**, unitário material, unitário M.O., `STATUS_PRECO`, faturamento direto, `descricao_proponente` |
| `Notas` | os 3 canais com visibilidade (`consideracao` / `proponente` / `interna`) |
| `Ajustes` | desconto comercial e afins — não pertencem a item nenhum (§9.15) |
| `Clausulas` | exclusão, premissa, risco, escopo do contratante (§9.16) |
| `Convites` | quem foi chamado, quem recusou e por quê (§9.17) — base para contar propostas válidas |
| `Regras` | faixas de valor × cotações mínimas, por empresa (§7A) |
| `Log` | auditoria |

---

## 6. As três saídas — e a regra que não pode ser quebrada

A pasta compartilhada prova qual é o entregável real: os arquivos se chamam `EQU_…xlsx - Google Planilhas.pdf`. **Alguém abre a planilha e imprime.** O PDF é o que circula para aprovação.

| Saída | Para quê |
| :--- | :--- |
| **Planilha (snapshot)** | Conferir, arquivar, anexar. Formato que a casa conhece. |
| **PDF** | O que vai para aprovação. |
| **Deck (Slides)** | Apresentar — engenharia, diretoria, banca. |

### 6.1 🔴 A regra

> **A planilha gerada é somente leitura, sem uma única fórmula, e nunca é reimportada.**

Todos os valores são calculados pelo app e gravados como **número estático**, com ID e versão da equalização carimbados no cabeçalho. É retrato, não fonte.

Se ela virar fonte editável paralela, o problema da fórmula quebrada volta inteiro — e era exatamente o que viemos resolver.

### 6.2 Como gerar o PDF

**Caminho escolhido — planilha formatada → export URL.** Dá controle de paisagem, ajuste à largura e qual aba sai. Necessário porque equalização é tabela larga.

```js
function exportarPDF_(planilhaId, abaGid, nomeArquivo) {
  const params = [
    'format=pdf',
    'size=A4',
    'portrait=false',      // paisagem — equalização é larga
    'fitw=true',           // ajusta à largura da página
    'gridlines=false',
    'printtitle=false',
    'sheetnames=false',
    'pagenumbers=CENTER',
    'top_margin=0.50', 'bottom_margin=0.50',
    'left_margin=0.50', 'right_margin=0.50',
    'gid=' + abaGid        // só a aba da equalização
  ].join('&');

  const url = 'https://docs.google.com/spreadsheets/d/' + planilhaId + '/export?' + params;
  const blob = UrlFetchApp.fetch(url, {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  }).getBlob().setName(nomeArquivo + '.pdf');

  return DriveApp.getFolderById(PASTA_PDFS).createFile(blob);  // salva e devolve link
}
```

**Notas técnicas**:

- Exige o escopo `script.external_request` (UrlFetchApp). O manifesto do `Teste-RH-` **já tem** — o agente marcou como "escopo herdado desnecessário" porque nada lá usa `UrlFetchApp`. Aqui ele volta a ser necessário.
- Também usa `auth/drive` (já presente) e `ScriptApp.getOAuthToken()`.
- Export leva alguns segundos por aba. **Não chamar em laço** — o Apps Script tem 6 min de limite.
- **Salvar no Drive e devolver o link**, não empurrar download. É compartilhável e auditável, e o web app não precisa lidar com blob no navegador.

**Alternativas descartadas**:

| Caminho | Por que não |
| :--- | :--- |
| `DriveApp.getFileById(id).getAs('application/pdf')` | Exporta a planilha inteira com padrão retrato. Sem controle de aba, paisagem ou ajuste à largura. |
| `Utilities.newBlob(html,'text/html').getAs('application/pdf')` | Funciona e dá controle de CSS, mas o conversor do Apps Script é limitado (sem flex/grid). Serve para documento simples, não para tabela larga. |
| Slides → PDF | `deck.getAs('application/pdf')` é quase de graça já que o motor existe. **Vale para o deck, não para a equalização** — são coisas diferentes. |

### 6.3 O botão

Na tela da equalização, três ações que chamam a **mesma função de cálculo** que a tela usa:

```
[ Gerar planilha ]   [ Gerar PDF ]   [ Gerar apresentação ]
```

> Disciplina copiada de `Teste-RH-` (`painel.gs:93`): *"Se as duas recalculassem por conta própria, um dia divergiriam — e ninguém saberia qual está certa."*

---

## 7. Escopo

**Dentro dos 40 dias**
Importador do acervo · árvore de EAP com `+` recursivo · catálogo com unidade e variante · N proponentes · status de preço · proposta datada e baseline · histórico, tendência e alerta · cesta incompleta marcada · busca por categoria · BrasilAPI com cache · `setupBaseDeDados()` · planilha snapshot + PDF · avaliação pós-OC mínima · gerador de Slides

**Roadmap 2.0** *(decidido em 05/09 — ver §11 da base)*
Pasta por equalização no Drive com tudo dentro e link único · herdar permissão da pasta em vez de escrever compartilhamento · EAP em branco por e-mail com token de identificação · validade de proposta no Calendar · parecer gerado em Docs (§11.3)
Contratos LPU e preço de referência contratual · SLA mensal digital e cálculo de glosa · IQF alimentado pelo SLA · automação do gatilho via Fluig · benchmark SINAPI/SICRO · templates de EAP para engenharia · piloto em obra · expansão Deminvest e Obras

---

## 8. Riscos abertos

| Severidade | Risco | Ação |
| :--- | :--- | :--- |
| ~~🔴 Bloqueador~~ ✅ | ~~Acervo em formato ilegível~~ — **está em Google Sheets** | Resolvido 05/09 |
| 🔴 Antes de qua | `RESPOSTA_AO_COMITE.md:53` promete condicionar o encerramento da medição via Fluig; a arquitetura marca Fluig como "integração futura" | Corrigir o texto antes da reunião |
| 🔴 Antes de qua | **Duas promessas ao comitê não se cumprem**: gatilho automatizado no Fluig e condicionamento do encerramento da medição | Corrigir a minuta e apresentar a troca como redução consciente de dependência de TI |
| 🟠 Escopo | Cresceu muito em 05/09. Alguma coisa vai ficar de fora | Escolher agora, não descobrir em outubro |
| 🟠 Enquadramento | Saving de negociação ≠ saving da ferramenta | Só contar o que veio de alerta |
| ~~🟠 Viabilidade~~ ✅ | ~~Dono institucional~~ — **Drive compartilhado já existe** | Resolvido 05/09. Criar tudo dentro dele desde o início |
| 🟠 Medição | Baseline de tempo precisa ser medido **antes** do piloto | Cronometrar 3 equalizações |
| 🟡 Dependência | BrasilAPI não é "Receita Federal oficial" — é comunitária, sem SLA | Cache + fallback manual |
| 🟡 Licença | SF Pro / SF Symbols são licenciados para plataformas Apple | Trocar por fonte livre, reposicionar como "inspirado na HIG" |
| 🟡 Exposição | IDs de produção hardcoded no repositório público `Teste-RH-` | Mover para Script Properties |

---

## 9. Rede de segurança

Item 5.3 do regulamento: ideias validadas que não forem concluídas por limitação de orçamento ou tempo **permanecem elegíveis para o próximo ciclo**.

Não é motivo para desacelerar. É motivo para conversar com o comitê ainda em setembro, dentro da janela de consultoria, em vez de descobrir em 15/10. Usar a consultoria é literalmente o que o critério de Qualidade da Implementação mede.
