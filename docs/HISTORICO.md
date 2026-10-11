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

## 11/10/2026 — domingo

### Ambiente

O git estava íntegro, sem locks e igual ao `origin/main`. O Node agora fica em `%LOCALAPPDATA%\node` (v24) e não mais em `C:\Program Files\nodejs`. O clasp não é dependência do projeto: use `npx @google/clasp …`, porque `npx clasp` falha com "could not determine executable". Por isso o `npm run push` também falha; rode `npm test` e depois `npx @google/clasp push -f`.

### Disclaimer padrão no aviso ao proponente (v75)

O pedido veio do Jonatas, em comentário de 05/10. O texto foi usado como ele enviou, com uma correção: "têm" virou "tem", concordando com "o escopo".

| Decisão | Motivo |
| :--- | :--- |
| `ES_AVISO_PADRAO` em `Escopos.gs`, com "caráter orientativo" e "visita técnica prévia" em negrito no deck | Os negritos estão no texto original |
| Aviso vazio ou igual a um dos dois padrões antigos vira o novo, tanto na normalização quanto na abertura | Escolha do usuário: trocar nos escopos já salvos. Aviso escrito à mão não muda |
| Reabrir e salvar sem editar não cria revisão | Senão, toda revisão emitida viraria R+1 só pelo texto novo |
| Quebra do aviso a 276 pt (era 284) | O negrito alarga a linha |
| Versão visual `ESL7` | Uma revisão já emitida sai com o disclaimer ao clicar em Gerar |

O texto sempre fala em visita técnica prévia, mesmo com a caixa "Exigir visita" desmarcada. É o padrão do Facilities; a caixa continua controlando só o alerta âmbar.

### Escopos base, início e busca (v76)

Pedido do Jonatas, 05/10: a plataforma deve classificar, gravar e gerar escopos base para futuras contratações. O usuário pediu junto um jeito melhor de começar um escopo e de achar os antigos. Antes, a aba abria com um `select` de todos os escopos e os botões Abrir, Novo e Atualizar, e todo escopo começava em branco.

| Decisão | Motivo |
| :--- | :--- |
| A aba abre numa tela de início: "Novo escopo em branco", busca, filtros por Mega, situação e categoria (com contagem) e um cartão por escopo | Substitui o `select` |
| A busca ignora acento e caixa e procura no título, no Mega, na categoria, no objetivo, nos serviços (linha a linha) e na EAP. Quando o termo não está no título, o cartão mostra o trecho com o termo marcado | Escopo antigo costuma ser lembrado pelo serviço, não pelo título |
| A classificação usa a mesma regra das equalizações (`cfCategoriaDerivada_` e `cfSubcategoriaDerivada_`) sobre título, objetivo, serviços e EAP. Empate fica "Sem categoria" | Uma taxonomia só no sistema. Inclusões ficam de fora porque "limpeza e descarte" puxaria quase tudo para Material de Consumo |
| Campo "Categoria" opcional; vazio é automática, e a tela mostra o que o conteúdo indica | A palavra-chave erra às vezes, e a correção precisa ficar a um clique |
| A classificação é calculada na listagem, não gravada em coluna | Sem migração, e mudar a regra reclassifica tudo |
| "Usar como base" parte da última revisão emitida (a que foi a fornecedor). Vêm grupos, EAP, objetivo, inclusões, exclusões, aceite, considerações, visita e aviso. Ficam em branco o título, o Mega, o endereço, as imagens, as fotos, a vistoria, os prazos, o contato, o armazém e os módulos | Esses campos são do lugar e da data |
| O escopo novo grava `base: {id, revisao, titulo}`. O original mostra "base de N escopo(s)", e o novo mostra "partiu de…" | Rastro de origem; mais tarde permite levar ao escopo base o preço da última contratação |
| Selo "Emitido · Rn" quando um PDF ou uma planilha saiu; senão, "Rascunho". No emitido, o botão principal é "Usar como base"; no rascunho, é "Continuar" | Emitido é o que já serviu de referência para fornecedor |

`tests/teste-escopos.cjs` agora carrega o `Equalizacao.gs`. O `tests/teste-escopos-browser.cjs` foi atualizado para a tela nova e passou no Chrome com o `playwright-core` 1.47.2 instalado no scratchpad.

**Fica para depois da entrega**: levar ao cartão do escopo base o preço e o fornecedor da última equalização feita a partir dele. A equalização só guarda a origem em texto, no detalhamento ("Escopo: … · ESC-…").

---

## 11/10/2026 — domingo

### Vídeo e relatório final: o conhecimento entra no repositório

O Guilherme juntou duas pastas à sessão (a "empresa" do YouTube, `H:\Meu Drive\Youtube`, e o deck do Orçamento 2027, no Drive
compartilhado) e pediu para aprender o que serve para entregar **um relatório e um vídeo** no fim do projeto. Tudo foi resumido em
[CONHECIMENTO_VIDEO_E_RELATORIO.md](CONHECIMENTO_VIDEO_E_RELATORIO.md), e o `CLAUDE.md` da raiz manda toda sessão ler esse arquivo.

| Decisão | Motivo |
| :--- | :--- |
| O relatório é um **deck** | Regulamento §7: "relatório final (apresentação)" até 15/10 |
| O vídeo vai junto com o relatório em 15/10, 2 a 3 min, voz do Guilherme no ElevenLabs | Respostas dele |
| Visual corporativo, sem o "jeito YouTube" | Ele reprovou esse visual no deck do orçamento em 07/10: "pense nas grandes empresas de auditoria" |
| Núcleo do motor de vídeo copiado para `video/` | "Salve o que precisa": a pasta do YouTube é pessoal e pode ser apagada |
| Não usar o "~50 min → 15 min" do `DEFESA_DA_MELHOR_IDEIA_MACBOOK.md` | Nunca foi medido |
| Linha de base no Excel: o Guilherme cronometra nesta semana | Impacto vale 30% e é o 1º desempate |

### Prévia de 20 s

`video/01-previa-20s/`: 5 cenas (a planilha que não lembra, o ciclo do retorno, a solução, o que buscamos, o fecho), voz provisória do
edge-tts, trilha "Como Vamos" (Biblioteca do YouTube). Narrativa do roteiro de 10/09, sem número nenhum. Folha conferida duas vezes
(cabeçalho atropelado nas planilhas pequenas e ponto vermelho por cima do "REMONTAR", corrigidos). Render 20,2 s, `conferir.py`
aprovado (−15 LUFS, pico −1,9 dBTP, BT.709). O `medir.py` acusa 49% de tempo parado: melhorar na versão final.

### Prévia v1 e v2: telas reais e foco no escopo

| Pedido do Guilherme | O que mudou |
| :--- | :--- |
| "O vídeo tem que usar imagem do script mesmo, real, não simulado" | Os desenhos saíram. Capturas do app em produção (implantação @76) com o login dele, pelo Chrome de depuração; scripts em `video/ferramentas/` |
| "Minha meta é focada no escopo; base de fornecedores vamos interligar com o que está no Fluig/RM" | A prévia conta o escopo real do PPCI de Itajaí (serviços, fotos, EAP, o deck e a planilha gerados, revisões R4–R9) e fecha com a integração Fluig/RM como **próximo passo** |

Resultado: 21,5 s, `conferir.py` aprovado, 24% de tempo parado (era 49%). Achados nas telas: "R$ R$" duplicado na Consulta de preço
(defeito a corrigir com o ok dele) e o IQF médio de 76,9 com 1 avaliação na tela de Fornecedores (não usar como resultado).
Detalhes em [CONHECIMENTO_VIDEO_E_RELATORIO.md](CONHECIMENTO_VIDEO_E_RELATORIO.md) §9.

### Foco da entrega: a montagem do escopo

O Guilherme, à noite: *"vamos entregar essa semana; o foco é vender a montagem do Escopo. Vamos ocultar preços e base de fornecedores
(isso vai ser integrado com FLUIG/RM)"*.

| Decisão | Motivo |
| :--- | :--- |
| Ocultar **Consulta de preço, Equalizações e Base Fornecedores** (e o "+ Nova cotação") | Preço, equalização e fornecedor entram juntos como integração Fluig/RM, que é **próximo passo** e não existe ainda |
| Ocultar **no app e nas peças**: implantação nova em "modo escopo", e vídeo e deck sem preço nem fornecedor | Escolha dele. No app, a ocultação é por chave reversível: nada é apagado (dados e código ficam) |
| O app abre direto em Escopos | É o produto que vamos vender |
| A linha de base de tempo passa a ser **montar um escopo no PowerPoint × no sistema**, com 2 ou 3 escopos | Impacto (30%, 1º desempate) precisa de número do produto que vendemos. ~~Cronometrar equalização no Excel~~: saiu do foco |
| Publicação da implantação nova só com o ok dele | Regra da casa |

**Modo escopo no código (ainda não publicado):**

| Decisão | Motivo |
| :--- | :--- |
| `cfModoEscopo_()` em `Codigo.gs`: ligado por padrão; a propriedade do script `MODO_ESCOPO = nao` desliga | Reverter sem nova implantação quando o Fluig/RM entrar |
| No `doGet`, toda página que não é Escopos vira Escopos, inclusive links antigos de e-mail e PDF (`?page=mapa`, `ficha`, `avaliacao`, `nova`) | Link antigo não pode reabrir preço por trás |
| Na tela, somem Consulta de preço, Equalizações, Base Fornecedores e "+ Nova cotação"; `aba()` redireciona qualquer chamada a elas para Escopos; Configurações fica (grupos, itens e marcas, sem preço) | Salvar, ficha e avaliação ainda chamam `aba('mapa')` e `aba('fornecedores')` no código |
| Rodapé sem "dados importados do acervo de equalizações" | Fora do assunto no modo escopo |
| É ocultação de tela, não controle de acesso | As funções `api*` continuam respondendo; dito no comentário do código |

`tests/teste-modo-escopo.cjs` entrou no `npm test` e pegou 5 de 5 mutações. Print no Chrome (Google simulado): barra só com Escopos e
Configurações, sem erro de JavaScript.

Cronograma: seg 12 app em modo escopo e medições; ter 13 roteiro e texto do deck (Checador em outra sessão); qua 14 voz, folha,
Auditor, render e deck final; qui 15 revisão e protocolo no RH.

### Estratégia para a nota máxima (proposta)

O Guilherme: *"ok; vamos deixar a medição até o dia 14; o que a gente precisa agora é montar a estratégia para vender o projeto e pegar
a nota máxima"*. Resultado em [ESTRATEGIA_NOTA_MAXIMA.md](ESTRATEGIA_NOTA_MAXIMA.md), à espera do "sim".

| Achado | Efeito |
| :--- | :--- |
| A ideia aprovada foi "Capital Fornecedores, avaliação de prestadores" (e-mail do comitê de 19/05) e agora vendemos o escopo com fornecedores ocultos | Risco nº 1. Proposta: contar a evolução (pedido → construído → o campo mostrou que o problema nasce no escopo → fornecedor e preço para o Fluig/RM, sem base duplicada) |
| A nota final é do relatório **e** da apresentação de novembro | 15/10 = passar no corte; novembro = ganhar, com mais um mês de uso |
| "Satisfação de colaboradores" está escrita no critério de Impacto | Coletar 2–3 depoimentos |
| `AUDITORIA_NOTA_2026-09-08.md` (8,95) se apoia em números não medidos e agora ocultos | Não usar como base |
| A publicação da v77 (modo escopo) foi barrada pela trava de segurança da sessão | O Guilherme roda os comandos ou libera |

### v77 publicada (modo escopo)

O computador esquentou e reiniciou às ~18:15; o Deep Freeze levou Node, clasp, login e o git do PATH. Nada do repositório se perdeu
(tudo até 18:10 já estava no GitHub). O Guilherme: *"faça o clasp app, faltava fazer isso"*.

| Passo | Resultado |
| :--- | :--- |
| Node v24.21.0 portátil em `%LOCALAPPDATA%\node`; git em `C:\Program Files\Git\cmd\git.exe` (fora do PATH) | Ambiente refeito |
| `npm test` | Suíte inteira OK, inclusive modo escopo |
| `npx @google/clasp login` (conta guilherme.marques) e `push -f` | @HEAD atualizado |
| `clasp deploy -i AKfycbxy2cJdA-d5zM39KXeRhyZxinfTWEaVIJLMs5Y03rQBQNPH1mFnh0HbIjLSI4ciHA94Aw` | **@77 "Modo escopo: oculta preco, equalizacoes e fornecedores"**; link dos usuários o mesmo |

Pendente: conferir no navegador que a @77 abre em Escopos sem as abas ocultas.

### Estratégia aprovada e rascunho do relatório (v1)

O Guilherme: *"sim, vamos isso"* para a [estratégia](ESTRATEGIA_NOTA_MAXIMA.md); *"vamos fazer a apresentação tipo a do orçamento e
deixe em aberto somente a parte da medição e depoimentos"*.

| Decisão | Motivo |
| :--- | :--- |
| Simulação da nota (julgamento sobre as provas, não medição): hoje 6,3; estratégia cumprida 7,7; novembro 8,65; lida como "trocou de ideia" 6,8 | Mostra que Impacto e a ponte com a ideia aprovada são as alavancas |
| Visual do deck do orçamento: capa com as fotos dos 3 Megas, sumário, trilha das 5 seções no topo, título com a conclusão, fonte no rodapé, slide "Revisar antes da versão final" sempre ligado | Pedido dele; padrão já aprovado no orçamento (IDEIAS-DESIGN.md) |
| Rascunho em PNG antes do gerador: `relatorio/rascunho/gerar.cjs` (HTML 1920×1080 → Chrome) | Ciclo aprovado no orçamento: PNG na tela → analista → v2 → "aprovado" → código |
| 15 slides; em aberto com selo PENDENTE: tempo (9), depoimentos (11), escopos antigos do antes × depois (7) e recontagem do uso (10) | Os dois últimos também dependem de dado que não existe ainda; ficam declarados em vez de inventados |
| Fontes Montserrat e Open Sans (OFL) copiadas para `relatorio/fontes/`; fotos dos Megas em `relatorio/rascunho/midia/` (fora do git) | Sobreviver ao Deep Freeze sem depender do Drive do orçamento |

**PowerPoint antigo mede tempo?** Só em parte. O `.pptx` guarda o tempo de edição registrado pelo PowerPoint (`TotalTime`), datas de
criação e gravação e o número de revisões. Esse tempo conta o arquivo aberto (até parado), herda o tempo do arquivo de origem quando
o escopo foi copiado de outro e não anda quando editado no navegador. O deck do Conselho, gerado por código, mostra 0 min. Serve de
indício ao lado do cronômetro, nunca no lugar dele. A comparação mais justa: refazer no sistema, com cronômetro, o mesmo escopo
de um PowerPoint antigo.

**Escala: a empresa toda.** O Guilherme: *"não vai ser apenas para os 3 Megas, é para a empresa toda"*. Deck e vídeo separam fato de
proposta: o uso **começou** pelos três Megas (fato, leitura de 11/10); o padrão de escopo e o pedido ao comitê valem para **toda área
da empresa que contrata** (proposta). Slides 5, 7, 10 e 14 e capítulos 5 e 8 do vídeo (`video/02-relatorio/`) ajustados.

**Vídeo do relatório:** `video/02-relatorio/ROTEIRO.md` e `LOCUCAO-elevenlabs.md` (8 capítulos, ~320 palavras, cerca de 2 min 10 s;
o capítulo 7, do tempo, só depois da medição). O Checador ainda não passou: fato que cair, refaz-se só aquele MP3.

**Problema com casos reais.** O Guilherme: *"o problema está genérico, não podemos inventar; tire do real da empresa: cada
fornecedor pode entender de um jeito, não abrir os detalhes, colocar preço global"*. Vídeo (capítulo 1) e slide 4 passaram a usar
três casos de BASE_DE_CONHECIMENTO.md: manutenção de ar-condicionado cotada como "1 verba" com 2, 3 e 12 visitas/ano e um sem o
laudo legal (§8.4); mão de obra com preço fechado e os itens de dentro sem valor (§16.3); o mesmo serviço em VB, KG e M³ (§9.2).
Sem nomes nem valores. Prompt do Checador do roteiro: [PROMPT_AUDITOR_ROTEIRO.md](PROMPT_AUDITOR_ROTEIRO.md).

**Sons no ElevenLabs** (*"pode gerar pelo ElevenLabs, pode usar os créditos"*). Plano **Creator** (permite uso comercial; resolve a
dúvida da licença da voz). Saldo antes: 52.788 créditos livres. Gerados por `video/02-relatorio/sons/gerar_sons.py`: 5 efeitos
corporativos em `video/motor/_motor/sons/relatorio/` e a música instrumental `video/MUSICAS/elevenlabs/musica_contratacoes.mp3`
(2:40, fora do git como as outras músicas). Gasto: **2.310 créditos** (estimativa 2.510). Plano de som por cena no ROTEIRO.

**Identidade visual.** Logos baixados para `Downloads` (C:, some no reinício) copiados para `relatorio/marca/`; o brandbook é o mesmo da
raiz. Brandbook: cores #151E49, #003D7B, #065CA9 (as do deck); tipografia oficial **Gotham** (paga; o deck segue com Montserrat, a
alternativa livre mais próxima, até haver licença); área de proteção = altura do "C" (p. 17). Logo colorido na capa, negativo no fecho.

### Parecer do Auditor da entrega e decisões do Guilherme

Parecer em [AUDITORIA_ENTREGA_2026-10-11.md](AUDITORIA_ENTREGA_2026-10-11.md) (nota do rascunho 5,6; 6,35 com medição e
depoimentos). Os três 🔴 de fora do deck foram decididos pelo Guilherme:

| Achado do Auditor | Decisão do Guilherme |
| :--- | :--- |
| GitHub público com dados reais de fornecedores | *"Desconsidere, não tem problema isso"* |
| Elegibilidade (§4: três primeiras inscrições; e-mail de 04/02 com três ideias antes de 29/04) | *"O Capital Fornecedores foi aprovado"* |
| 19/05 não é aprovação | *"Eu me reuni com o conselho e foi aprovada a parte do Escopo; o restante será feito junto com a T.I."* **Datas da aprovação da ideia e da reunião com o conselho: a confirmar** (selo PENDENTE no slide 5) |

**Correções factuais aplicadas** (deck e vídeo): laudo PMOC como fato da proposta, não infração; "preço só no total, sem valor
por item" no lugar de "não dá para saber o que foi considerado"; VB × KG no mesmo item (posicionamento da armadura), não "3
unidades"; escopo em produção desde setembro (R4 em 15/09), não outubro; planilha só na R9; dois botões, não "um clique"; "9 dias"
(02/10 a 11/10); testes "antes de publicar", publicação versionada; "sem licença nem servidor novo" no lugar de "custo zero";
fornecedor e preço "com a TI", como aprovou o conselho; recursos de 11/10 (v75 a v77) marcados como posteriores ao prazo de
implementação (10/10, §5.3); autor na capa e no fecho. Estratégia corrigida para 34 suítes. `AUDITORIA_NOTA_2026-09-08.md` e
`DEFESA_DA_MELHOR_IDEIA_MACBOOK.md` marcados como obsoletos. Vídeo: capítulo 2 virou "A aprovação"; 382 palavras (~2 min 30 s).
A prévia de 20 s mostra fornecedores, CNPJ e valores: **não entra na entrega**.

**Slide 14 sem pedidos.** O Guilherme: *"o conselho já aprovou; agora é o relatório final para eles avaliarem o que foi feito"*. O
slide virou "Entregue × próximos passos" (prestação de contas); a seção 05 da trilha virou "Entregue e próximos".

**Datas das versões (API do Apps Script, `createTime`):** v69 e v70 em 17/09; v71 a v73 em 02/10; v74 a v76 em 11/10 (manhã); v77
em 11/10 (noite). O escopo roda em produção desde setembro (R4 do PPCI em 15/09); o escopo base e a busca (v76) e o aviso padrão
(v74/v75) são de 11/10. O deck mantém essa distinção.

**Checador do roteiro** (`video/02-relatorio/CHECAGEM-ROTEIRO-2026-10-11.md`, sobre a v1: REPROVADO). Roteiro v3 aplica o parecer:
abertura no caso; oferta, não execução; a proposta de 2 visitas é a que não incluía o laudo PMOC com ART (não "a lei exige"); preço sem
discriminação; VB × KG; dois botões; reaproveitamento parcial; testes "antes de publicar"; integração como proposta; casos como
cartões; recortes obrigatórios de D02, D90/E04 e da barra de abas. ~~Esteio confirmado~~ **corrigido pelo Guilherme:** *"Esteio foi só um exemplo; os reais são do Mega Itajaí e um do Mega Curitiba,
que foi a casa de bombas"*. Escopos reais emitidos: **4** (Itajaí 3: sinalização viária, bombas de drenagem, PPCI do prédio de apoio;
Curitiba 1: casa de bombas de água potável). Esteio (piso DHL), Curitiba (adequações elétricas) e "Teste 01" foram exemplo ou teste.
O "6 reais nos 3 Megas" de CONHECIMENTO §9 e da estratégia estava errado. Locução v3:
348 palavras sem o capítulo 7 (~2 min 20 s). Falta o Checador conferir a v3.

**Posicionamento: a empresa toda.** O Guilherme: *"vamos vender que o projeto é para a empresa toda: Facilities, Propriedades,
Engenharia e outras áreas que tiverem a necessidade de montar um escopo"*. Capa, slides 4, 7, 10 e 14 e capítulos 1, 5 e 8 do vídeo.
Fato × proposta mantidos: o Facilities já usa (Itajaí e Curitiba); as demais áreas são o alcance. Apoio real: dos três casos do
slide 4, o ar-condicionado é do Facilities e a fundação é da Engenharia (Mega Curitiba, fase 7; BASE_DE_CONHECIMENTO §9).

**Auditor:** prompt para uma sessão independente em [PROMPT_AUDITOR_ENTREGA.md](PROMPT_AUDITOR_ENTREGA.md) (nota, apresentação,
app, vídeo e o que pode ter sido esquecido). Parecer em `docs/AUDITORIA_ENTREGA_<data>.md`.

---

## Próxima entrada

*(a preencher conforme avançamos)*
