# Histórico — Capital Fornecedores

> Registro cronológico do que decidimos, do que mudou de ideia e por quê.
> **Regra**: decisão revertida não é apagada. Fica riscada, com o motivo.
> Documentos irmãos: [PLANO_SPRINT.md](PLANO_SPRINT.md) · [BASE_DE_CONHECIMENTO.md](BASE_DE_CONHECIMENTO.md)

---

## 05/09/2026 — sábado

### Diagnóstico inicial

Revisão dos 4 documentos existentes + regulamento + planilha template.

**Achado que reorganizou tudo**: o plano no repositório descrevia 4 fases de fevereiro a dezembro, mas os commits eram de 04–05/09 e **não havia uma linha de código**. Faltavam 35 dias para o prazo de implementação (10/10) e 40 para o relatório (15/10).

→ Plano de 11 meses reescrito como sprint de 40 dias.

### Decisões de escopo

| Decisão | Quem | Motivo |
| :--- | :--- | :--- |
| Sem BI separado — tudo dentro do web app | Guilherme | Uma URL só, sem segunda ferramenta para o comitê acessar |
| Piloto em compras pequenas, não obra | acordado | Frequência gera volume de dado até outubro; obra dá 1–3 pontos no período |
| LPU e SLA/glosa vão para a **v2.0** | Guilherme | Proteger o sprint de 4 dias. Já existe controle de performance de contratos na casa |
| App em Apps Script compartilhado no Workspace | Guilherme | Infra existente, custo zero |
| Item cadastrável dentro do app | Guilherme | Nunca bloquear o comprador |
| CR e Demercado na mesma base, só o design muda | Guilherme | Separar partiria o histórico ao meio |
| **Repositório como ambiente — tudo em `.md` aqui**, sem artefato | Guilherme | Histórico completo versionado no mesmo lugar do código |
| Regra de cotação: 1 até R$ 1.000, **mínimo 3** acima — sem teto | Guilherme | Regra interna da companhia. Derruba de vez qualquer limite de proponentes |
| Pasta por equalização no Drive, com link único — **futuro** | Guilherme | Estamos dentro do Workspace; resolve rastreabilidade da OC e compartilhamento de uma vez (§11.3) |

### Pesquisa de campo — 3 agentes

Analisados **28 documentos reais** da pasta compartilhada:
- **Facilities**: 5 `EQU_`, 5 `Formulário de equalização`, 1 `Mapa de Equalização`, 7 orçamentos, 1 OC
- **Engenharia**: 4 Sheets da Fase 7 (fundações, ~R$ 1,2M, 4 proponentes, 12 convidados) + carta proposta, memorial técnico
- **Repositório** `AugustCapitalrealty/Teste-RH-`: motor de geração de Slides, com suítes de teste executadas

Resultado consolidado em [BASE_DE_CONHECIMENTO.md](BASE_DE_CONHECIMENTO.md) — 868 linhas, 11 seções, tudo com citação literal da fonte.

### Mudança de tese

**Antes**: "o histórico de preço é o produto".
**Depois**: *"a comparação de compras da companhia está errada hoje, e temos os documentos"*.

O histórico continua sendo o motor. O que mudou é o argumento de abertura — e ele ficou muito mais forte porque é evidência, não promessa.

### ~~Decisões travadas~~ que o campo derrubou

| Decisão original | Status | Motivo |
| :--- | :--- | :--- |
| ~~`BDI` em campo separado no preço~~ | 🔴 **derrubada** | Zero ocorrências em 15 arquivos de Facilities e zero em Engenharia. BDI é **premissa de edital** (*"deverão estar inclusos... taxas, bdi"*), não número de linha. Vai para o cabeçalho: `regime_contratacao`, `bdi_incluso`, `premissas_texto`. (§9.4) |
| ~~Árvore livre porque obra precisa de 4+ níveis~~ | 🟠 **justificativa corrigida** | Ambos param em **3 níveis**. A árvore continua certa por outro motivo: `codigo` se repete no mesmo arquivo (`02.03` é `ARMAÇÃO` **e** `APOIO CIVIL`) e não codifica posição (template vai `01.` → `03.`). (§9.5) |
| ~~`quantidade` só no item~~ | 🟠 **desdobrada** | São **duas**: `quantidade_referencia` no item (a CR pede) e `quantidade` no preço (o proponente levanta). Divergem de verdade — CR pede `VB 1,00`, fornecedor cota `KG 7.844,51`. (§9.2) |
| ~~"Formulário de equalização" é processo paralelo~~ | 🔵 **hipótese descartada** | Estrutura interna idêntica. É convenção regional de nome: Itajaí usa "Formulário", Curitiba/Esteio usa "EQU_". (§8.11) |
| ~~`RV01` no nome do arquivo = rodada de negociação~~ | 🔵 **hipótese descartada** | É revisão do documento do **fornecedor**, eixo ortogonal à rodada. E é enganoso: `Orç Litoral 936,84` e `Orç Litoral 987,26 RV01` têm datas e conteúdos diferentes — não são revisão um do outro. (§8.8) |
| ~~"Sempre 3 proponentes" é só costume~~ | 🟢 **explicado** | É regra da companhia (mínimo 3 acima de R$ 1.000) **combinada** com um template de 3 colunas. O piso virou teto: Facilities cotou exatamente 3 em 10 de 10; Engenharia, com layout de N colunas, cotou 4 de 12 convidados. (§7A.2) |
| ~~Ninguém rastreia quem foi convidado e não cotou~~ | 🟢 **eu estava errado** | Engenharia rastreia — 12 empresas com trilha de convite/confirmação/proposta/visita e motivo literal de recusa. Falta em Facilities. (§9.17) |
| ~~Benchmark de preço por unidade é novidade~~ | 🟢 **já existe** | Engenharia calcula à mão: `Valor por m de estaca: Fase 6 R$ 357,74 → Fase 7 R$ 365,87`, com valor alvo. Não escala — é isso que o app resolve. (§9.17) |

### Decisões novas nascidas do campo

| Decisão | Motivo |
| :--- | :--- |
| `STATUS_PRECO` (`cotado / excluído / incluso em outro item / não cotado`) | `INCLUSO`, `R$ -` e vazio são três coisas. Ler vazio como zero fez uma proposta parecer R$ 182 mil mais barata sem ter cotado nada (§9.9) |
| `proposta` (fornecedor × rodada × data) e `baseline_escopo` como entidades | A equalização de R$ 1,2M compara a **inicial** de um com a **R02** de outro, sobre escopos diferentes (§9.8) |
| Observação por **(item × proponente)** | Foi o que estourou o template real: 3 proponentes × (unit + total + observação) = 9 colunas. E a observação é o que decidiu a compra — *"NÃO emite laudo PMOC"* (§8.4) |
| **Três canais de nota** com visibilidade separada | `ANALISE CR` é coluna interna que não vai no arquivo do fornecedor. Colapsar num campo só vaza análise interna (§9.10) |
| `ajustes` e `clausulas` como tabelas próprias | Desconto comercial não pertence a item nenhum; e a matriz de responsabilidade da Pretech muda o que o preço cobre (§9.15, §9.16) |
| `quantidade` **pode ser nula** | Preço contingente (`Faturamento mínimo diário — dia — R$ 16.000 — sem quantidade`) é justamente o que estoura orçamento de obra (§9.18) |
| Unidade aceita **embalagem** | `PCT c/ 100 sacos`, `PCT c/ 4`, `5L`. Um modelo só com `un/kg/m²` compara errado (§2.4) |
| **Nunca importar `Redução total`** | Quebrado em 5 de 10 documentos — reporta 100% de economia. Sempre derivar (§8.7) |
| `setupBaseDeDados()` idempotente e aditivo | Schema vai mudar muito no sprint; e instalar num Drive novo vira um clique |
| Planilha gerada é **snapshot sem fórmula**, nunca reimportada | Se virar fonte editável paralela, o problema da fórmula quebrada volta inteiro |
| PDF via export URL com `UrlFetchApp` + OAuth token | Único caminho com controle de paisagem, ajuste à largura e escolha de aba |
| Validação de cotação mínima na **homologação**, com limite em tabela | Hoje nada impede fechar R$ 50 mil com 2 cotações (§7A) |
| **Modo simplificado até R$ 1.000** | 1 cotação basta pela regra. Se o app exigir o ritual completo, ninguém usa na compra pequena — que é o piloto |

### Pendências abertas no fim do dia

- 🔴 **Onde estão os originais das equalizações** (Sheets/xlsx, não PDF) — caminho crítico do importador
- 🔴 Corrigir a promessa do Fluig em `RESPOSTA_AO_COMITE.md:53` antes de quarta
- 🟠 Confirmar se a branch `claude/google-script-transformation-plan-puhawn` é o código no ar do `Teste-RH-`
- 🟠 Medir o baseline de tempo **antes** de qualquer um usar o app
- 🟡 Tabela de empreendimentos e apelidos (`MCtba` / `MEGA CURITIBA` / `MEGA` / `MEsteio` / `MItajai`)
- 🟡 Mover IDs de produção do `Teste-RH-` para Script Properties
- 🟡 Confirmar a regra de cotação: limite é exatamente R$ 1.000? Há faixas acima? Exceção por exclusividade/emergência? Vale igual para CR e Demercado? (§7A.4)

### Documentos criados hoje

| Arquivo | O que é |
| :--- | :--- |
| `docs/BASE_DE_CONHECIMENTO.md` | Tudo que descobrimos, com citação literal — 868 linhas |
| `docs/PLANO_SPRINT.md` | O plano de 40 dias, substituindo o cronograma fev–dez |
| `docs/HISTORICO.md` | Este arquivo |

### Documentos que precisam de correção

| Arquivo | Problema |
| :--- | :--- |
| `docs/PLANO_ESTRATEGICO_PROJETO.md` | Cronograma fev–dez que não aconteceu. **Substituído por `PLANO_SPRINT.md`** |
| `docs/ARQUITETURA_TECNICA_E_FLUXO.md` | `VALORES_JSON`, 3 níveis fixos, BDI no preço, falta `Cód. Fornecedor` |
| `docs/RESPOSTA_AO_COMITE.md` | Linha 53 promete condicionar medição via Fluig; contradiz a própria arquitetura |
| `README.md` | Escreve "CAPITAL INFRAESTRUTURA LOGÍSTICA LTDA." — o nome real é `CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA` (CNPJ 03.015.145/0001-54) |

---

### Correções do Guilherme no fim do dia

| O que eu disse | Correção | Efeito |
| :--- | :--- | :--- |
| *"Auditoria hoje é impossível — a OC não aponta para cotação nenhuma"* | **Exagero.** Quem sobe o processo no Fluig anexa tudo corretamente; o dossiê existe | O problema real é **redigitação**, não perda de rastreabilidade. Corrigido em §8.13 |
| Tese de abertura: *"a comparação está errada"* | O eixo é **ganhar tempo, comparação agradável aos olhos, menos trabalho manual** | Achados de campo viram munição sobre o **formato**, não acusação. Novo §12 |
| Fluig como integração | **Futuro**, confirmado três vezes (05/09) | Roadmap em §11.1.1, com o levantamento que precede o código. O condicionamento da medição só volta com decisão formal de processo |

### Ideia nova — base de fornecedores que se constrói sozinha

*"Equalização gera dados dos fornecedores. Depois que finaliza, preenche como foi, quem fechou. E vai se auto-aumentando com a participação dos colaboradores."*

Ninguém mantém cadastro — ele **acumula como subproduto** de fazer equalização. E responde a devolutiva do comitê sem criar processo novo: a avaliação vira o passo de fechamento da própria equalização.

Desdobramento registrado em §11.4: são **dois** momentos distintos — comportamento na cotação (atrito zero, ninguém mede hoje) e execução do serviço (o que o comitê pediu, fica por e-mail).

### Ideia nova — presets (equalização recorrente)

*"Um Mega pede material de consumo todo mês. Já abrir e ele vai preenchendo as unidades; se tiver LPU já puxa o preço. Ou um aumento de fase: já traz todos os itens da última fase e vai comparando — a diretoria vai ter noção de quais itens mais variaram ao longo dos anos."*

**Resolve estruturalmente o problema mais difícil do projeto.** Casar item por descrição é aproximação e erra (`Pastilha adesiva` × `Adesivo para vaso`). Com preset, o item não precisa ser reconhecido: **é o mesmo registro**. O preset vira a identidade do item ao longo do tempo — a chave estável que o legado nunca teve.

Um mecanismo, dois mundos: compra mensal recorrente e nova fase de obra. E a Engenharia já faz isso à mão (`R$/m de estaca, Fase 6 → Fase 7`).

Também é o que **sustenta a promessa de tempo**. Eu havia criticado o "−70%" como chute, e era. O preset dá o mecanismo: 30 itens × 3 proponentes que hoje se redigita do zero passam a vir prontos. Vira aritmética cronometrável, não estimativa.

Registrado em §13 da base e como **Fase 4B**, dentro do MVP, com exceção explícita à regra de corte.

### Ideia nova — tela de gestão entre Megas

*"Tem 3 Megas, onde o café é mais barato?"*

Fecha a estrutura do produto: o **mesmo motor** olhando para três eixos — entre proponentes (uma cotação), ao longo do tempo (uma série, via preset) e entre empreendimentos (todas as séries, via catálogo).

O prêmio não é o ranking, é a **causa**: mesmo fornecedor cobrando diferente por Mega é um telefonema; volumes diferentes viram **compra conjunta**, que é economia só enxergável com os dados juntos.

Duas coisas anotadas: falta `UNIDADE_BASE` + `FATOR_BASE` no catálogo (sem isso compara pacote com quilo), e o número "se todos pagassem o menor" é **teto teórico**, nunca saving.

Registrado em §14 e como **Fase 4C**.

### Requisito novo — ingestão contínua

*"Faça de uma maneira que no futuro vou colocar mais orçamentos do passado e/ou equalizações."*

Muda a natureza do importador: **funcionalidade permanente, não script de migração**. Exige idempotência por hash, rastreio de origem, reversibilidade, versão de parser e fila de revisão.

Dois ajustes que caíram do requisito:

| Ajuste | Motivo |
| :--- | :--- |
| Coluna `ORIGEM` em todo registro | Dado de PDF de 2024 não tem a mesma confiança de dado digitado no app. Se entrarem iguais, a análise mente com cara de certeza |
| ~~`Propostas` é filha de `Equalizacoes`~~ → **`equalizacao_id` pode ser nulo** | Orçamento avulso é ponto de preço legítimo. A pasta tem 7 orçamentos para 5 equalizações — e o orçamento é o único documento que **sempre** traz qtd + unidade + unitário |

Também dá a resposta honesta para "e se o piloto rodar poucas equalizações?": o valor não depende só do que for criado, depende do que for **resgatado do passado**.

### Respostas que destravaram o plano — fim do dia 05/09

| Pergunta | Resposta | Efeito |
| :--- | :--- | :--- |
| Formato do acervo | **Google Sheets** | 🟢 **Bloqueador da Fase 1 resolvido.** Leitura direta com `SpreadsheetApp`, sem conversão e sem parser de PDF |
| Onde o app mora | **Drive compartilhado já existe** | 🟢 Dono institucional resolvido. Viabilidade (20%) vai a 10, e o compartilhamento de PDF e deck **herda da pasta** — não precisa escrever código de permissão |
| Usuário do piloto | **Já tem alguém em mente** | 🟢 O maior risco de Impacto cai. A primeira tela se desenha para o jeito dessa pessoa trabalhar |
| SLA / glosa | **Fica para a v2** | ⚪ Decisão do Guilherme. Sai do radar; não voltar ao assunto |

### Riscos encerrados hoje

- ~~🔴 Acervo pode estar só em PDF~~ → **está em Google Sheets**
- ~~🟠 Dono institucional do script~~ → **Drive compartilhado existe**
- ~~🟠 Piloto sem usuário definido~~ → **usuário identificado**
- ~~🟡 SLA está sendo preenchido?~~ → **fora de escopo por decisão**

### Riscos que continuam abertos

- 🟠 Corrigir com o comitê as duas promessas que não se cumprem — **texto substituto pronto em [CORRECAO_MINUTA_COMITE.md](CORRECAO_MINUTA_COMITE.md)**, falta enviar (janela de consultoria fecha 30/09)
- 🟠 Escopo cresceu muito num dia; alguma coisa vai ficar de fora e é melhor escolher qual
- 🟠 Baseline de tempo precisa ser medido **antes** de o piloto começar
- 🟡 Dependência solo — mitigada pela documentação

### Fase 1 — leitor validado (08:15)

Leitor rodando limpo em dois arquivos reais, quatro equalizações, zero falso positivo. Três falsos positivos foram eliminados no caminho: periodicidade (anual × mensal), verba fechada com filhos descritivos, e soluções alternativas.

Três armadilhas técnicas registradas em §17 da base — a mais cara foi `R$ -` ser o número zero e não texto.

**Falta na Fase 1**: rodar a gravação (`importarEqualizacao`), já commitada.

### Tarde 05/09 — Schema v3, Correções P0 e Automação com Clasp

- **Schema v3 & Migração Aditiva**: 21 abas e 224 colunas com `setupBaseDeDados` e `migrarParaSchemaV3`.
- **Correções de Confiabilidade (P0)**:
  - Rollback em `desfazerImportacao` contemplando propostas avulsas (`EAP`, `Propostas`, `Precos`).
  - Resolução semântica de entidades: `cfResolverEmpresa_` (Demercado vs Capital Realty) e `cfResolverEmpreendimento_` (normalização de Megas).
  - Hash v2 cobrindo empresa e empreendimento canônicos.
  - Preço global preservado (total sem unitário não vira `nao_cotado`).
  - Agrupamento de avulsos por `idProposta` na consulta, impedindo falsas fusões.
- **Suíte de Testes Automatizados (36/36)**:
  - Validação de ciclo completo (`ciclo-completo.cjs`), correção de defeitos (`validar-correcoes.cjs`) e reprodução (`reproduzir-defeitos.cjs`).
- **Carga dos 21 Orçamentos**:
  - 7 fornecedores consolidados e função unificada `importarTodosOsOrcamentos()`.
- **Adoção do Clasp (Fim do Copia-e-Cola)**:
  - Configurado `.clasp.json` e scripts npm (`npm test`, `npm run push`, `npm run status`).
  - O comando `npm run push` encadeia a suíte de testes antes do `clasp push`, criando um portão de proteção automático contra quebras.

---

## 02/10/2026 — sexta

### Ambiente: índice do git corrompido pelo Drive

O `.git/index` tinha sumido. Sobraram `index.lock` e `packed-refs.lock` de um commit interrompido em 17/09 às 14:25, e por isso o git mostrava os 234 arquivos como apagados. O índice foi reconstruído com `git reset`, e nenhum arquivo de trabalho foi alterado.

**Restrição registrada**: a máquina tem Deep Freeze, então o C: volta ao estado congelado a cada reinício. O repositório continua no Google Drive (G:), e o GitHub é a cópia de segurança: dar push ao fim de cada sessão. O Node fica em `C:\Program Files\nodejs` e pode não estar no PATH da sessão do VS Code.

### Retorno dos usuários sobre os slides do escopo

Três reclamações sobre o deck gerado na aba Escopos:

1. "Em cada slide está ficando um tamanho de fonte diferente e a cor também."
2. "A configuração está ficando tudo em um canto só."
3. "A foto precisa estar junto com a descrição."

Um agente gerou decks com o Google simulado e mediu cada slide, e as três se confirmaram:
- **Fonte e cor**: o corpo saía em sete tamanhos diferentes e com duas cores; os rótulos tinham três tamanhos e três cores.
- **Conteúdo num canto**: um grupo com 3 tópicos ocupava 8% do slide.
- **Foto longe da descrição**: as fotos ficavam numa seção própria, em média sete slides depois dos serviços do grupo.

| Decisão | Motivo |
| :--- | :--- |
| Escala tipográfica única (`ES_FS`): corpo 11,5 pt e rótulo 9 pt Montserrat, uma cor de corpo em todo o deck | Reclamação 1. A tabela da EAP mantém 8,5 pt, por ser tabela |
| Cartão do tamanho do texto, centralizado quando cabe em uma página; a continuação começa no topo | Reclamação 2 |
| Texto quebrado na largura em que será desenhado | Limites, prazos e aviso eram quebrados na coluna estreita e desenhados no cartão largo |
| Altura de linha pela métrica da Open Sans (1,362 em × 110%) | A estimativa de 1,2 em deixava texto vazar dos cartões cheios |
| Legenda colada na foto pelo tamanho real da imagem (cabeçalho PNG/JPEG, com rotação EXIF) | O Slides encaixa a imagem mantendo a proporção; sem o tamanho real, a legenda ficava na borda da moldura |
| ~~Fotos do grupo à direita do texto, até 2 por slide~~ | Publicado na v71. **Revertido no mesmo dia**: com poucos tópicos, o cartão de texto ficava 70% vazio (print do usuário, escopo das barreiras plásticas, R2) |
| Cada grupo: primeiro um slide só com o texto, no slide seguinte as suas fotos (até 4) | Pedido do usuário após ver a v71. Publicado na v72 |
| Fotos apoiadas na mesma linha de base | Foto deitada ao lado de foto em pé deixava os números desalinhados |
| A paginação corta antes de um tópico, nunca no meio | O teste E2E pegou um tópico partido entre dois slides |

**Merge com o trabalho de 22/09**: o primeiro push foi recusado. O GitHub tinha dois commits de 22/09, feitos em outra cópia do repositório, que esta pasta do Drive não tinha. Ficaram deles a paginação que não corta frase, o arranjo parcial de limites (dois blocos lado a lado e o terceiro em cartão próprio), o recuo na continuação de tópicos, a calibração de largura do Open Sans e o rótulo que não repete o título. ~~Corpo adaptativo de até 14 pt~~: substituído pela escala única, porque era exatamente a causa da reclamação 1.

**Versão visual**: `ESL3` → `ESL4` → `ESL5`. Uma revisão já emitida numa versão anterior é regenerada no layout novo ao clicar em Gerar, e o arquivo antigo fica no histórico.

### Texto justificado (v73)

Pedido do usuário depois de ver a v72: todo texto de corpo justificado. Só trocar o alinhamento não bastava, porque o gerador quebrava as linhas à mão, cada linha virava um parágrafo e o Slides não justifica a última linha de um parágrafo.

| Decisão | Motivo |
| :--- | :--- |
| O parágrafo vai inteiro para o Slides, que quebra e justifica as linhas; a quebra estimada continua só para medir as caixas e paginar | Sem isso o justificado não aparece. Ganho extra: quem editar o slide depois vê o texto se ajustar em vez de quebrar torto |
| Marca invisível (U+2063) no início de cada linha de continuação, retirada no desenho por `esParagrafos_` | Mantém a paginação por linhas sem perder onde termina cada parágrafo |
| Tópico com "•" recebe recuo de segunda linha (`setIndentStart`) | Com o parágrafo inteiro, o Slides alinharia a segunda linha embaixo do marcador |
| Justificado no corpo de todos os slides de conteúdo e no endereço e na legenda do detalhe da localização | Pedido do usuário |
| Títulos, rótulos, células da EAP e legendas embaixo das fotos continuam como estavam (legenda centralizada) | Justificar uma coluna de 3 ou 4 palavras abre buracos entre elas. Muda se o usuário pedir |

Versão visual `ESL6`. Conferido com um preview em HTML em que o navegador quebra e justifica, como o Slides fará, usando o escopo das barreiras.

### Publicação

- O `npm run push` só atualiza o @HEAD do Apps Script. Os usuários abrem a implantação versionada `AKfycbxy2cJdA-…`, que precisa de `npx clasp deploy -i <id> -d "<descrição>"`. O link não muda.
- v71: escala única e fotos ao lado. v72: texto e fotos em slides separados. v73: texto justificado.
- Para voltar atrás, basta reimplantar a versão anterior no mesmo ID.
- Antes de mexer no código: `git fetch` e conferir `main..origin/main`, porque existe outra cópia que também envia commits.

### Teste de ponta a ponta com Playwright

O Playwright foi instalado fora do projeto (no scratchpad da sessão, por causa do Deep Freeze) e usa o Chrome da máquina. Com o Google simulado, o teste percorreu a interface real:
- 3 grupos de serviço;
- 9 fotos reais enviadas pelo botão de cada grupo: paisagem, em pé e foto de celular com EXIF 6;
- EAP e condições;
- salvar e gerar.

Na v72 passaram todas as verificações: corpo 11,5 em todos os slides, cada foto logo depois do texto do seu grupo, proporção certa (inclusive EXIF 6), "FOTO n" 2 pt abaixo da imagem, nenhuma foto perdida ou repetida e nada passando do rodapé.

O `tests/teste-escopos-browser.cjs` estava desatualizado desde 17/09: esperava a mensagem do servidor, mas a pendência agora é barrada no navegador e aparece no diagnóstico. Foi corrigido. Ele continua fora do `npm test` porque depende do Playwright; para rodar, aponte `PLAYWRIGHT_MODULE` para uma instalação externa.

**Não verificado**: se o Google Slides aplica a rotação EXIF ao inserir a foto. Se não aplicar, foto de celular tirada em pé sai deitada dentro de uma moldura em pé.

### Pendências da tela de Escopos (decididas para depois)

Vieram do teste E2E. O usuário pediu para não mexer por enquanto.

| # | Pendência | Onde | Sugestão |
| :--- | :--- | :--- | :--- |
| 1 | Foto acima de 5 MB é recusada, e HEIC também; foto de celular costuma passar disso | `EscopoInterface.html` (`esArquivoUI`) | Reduzir e recodificar no navegador (canvas) antes de enviar. Isso também grava a orientação nos pixels e elimina o risco do EXIF acima |
| 2 | "Título do conjunto fotográfico" é obrigatório, mas não aparece mais no deck | `EscopoInterface.html` e `Escopos.gs` (`esValidarGeracao_`) | Tirar o campo e a validação, ou voltar a exibi-lo |
| 3 | A legenda é um campo de uma linha (180 caracteres); legenda longa fica escondida | `EscopoInterface.html` (`esInputUI`) | Trocar por textarea com contador |
| 4 | O envio de várias fotos para no primeiro erro, sem dizer qual arquivo falhou, e a tela rola para o topo | `EscopoInterface.html` (`esUploadFotosUI`) | Seguir com os demais arquivos e listar os recusados junto do grupo |
| 5 | Escolher um arquivo recusado marca "alterações não salvas" | `EscopoInterface.html`, listener de `input` | Ignorar `input[type=file]` |
| 6 | "Salvando e gerando…" aparece no topo, longe do botão clicado | `EscopoInterface.html` | Mostrar o status na barra fixa |
| 7 | ↑/↓ de foto troca com a vizinha de outro grupo e nada muda na tela | `EscopoInterface.html` (`esMoverUI`) | Mover só entre fotos do mesmo grupo |

---

## Próxima entrada

*(a preencher conforme avançamos)*
