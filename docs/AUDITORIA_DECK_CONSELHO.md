# Auditoria do deck ao Conselho contra o estado real do código

**Data:** 09/09/2026 · **Alvo:** `app/Apresentacao_Conselho.gs` (718 linhas, 7 slides)
**Régua:** o código-fonte e os dados do repositório. Documento não é evidência.
**Produto:** relatório. Nenhum arquivo do repositório foi modificado.

> **Método.** Cada afirmação do deck foi procurada no fonte. Onde o número não
> pôde ser apontado num arquivo ou num comando reproduzível, ele está marcado
> como **SEM LASTRO** — inclusive quando aparece em documento do próprio
> repositório. Os documentos de `docs/` foram escritos em datas diferentes e se
> contradizem; três contradições reais estão registradas na seção 5.

---

## 1. Resumo

| Classificação | Quantidade |
|---|---:|
| Slides auditados | **7** |
| Slides sem nenhum problema | **2** (Capa, Pedidos) |
| Slides com pelo menos um achado | **5** |
| Achados **DESATUALIZADOS** | **7** |
| Achados **SEM LASTRO** | **4** |
| Achados **FALTANDO** (existe no sistema, o deck não menciona) | **12** |
| Total de achados | **23** |

**`npm test`: PASSA.** 31 suítes, exit code 0, Node v24.19.0.
Comando: `npm test` em `C:/Users/guilherme.marques/Melhor-Ideia-2026`.

**Os três achados mais graves**

1. **Slide 3 (`_cnSlideFunciona`) — "ASSERÇÕES DE TESTE · 1.044 · 90% verificam
   comportamento".** O "90%" não existe em lugar nenhum do repositório: nenhum
   script calcula essa proporção, e a string "90%" em `docs/` refere-se sempre à
   meta de adesão à avaliação, nunca a testes. É exatamente a família dos dois
   números que a auditoria anterior removeu. **Tem de sair ou virar um número
   apurável.**
2. **Slides 4 e 5 se contradizem sobre convites.** O slide 4 diz que a etapa
   COTAR tem "Convite registrado: quem respondeu **e quem não**"; o slide 5 diz,
   corretamente, que falta registrar "quem foi convidado e não respondeu". O
   código dá razão ao slide 5 (`app/Equalizacao.gs:1310-1345`: `Convites` só é
   escrita na homologação, e só a partir de propostas existentes). Se o Conselho
   ler os dois slides, o slide 4 fica sem defesa.
3. **Slide 2 — "O mesmo fornecedor, cinco grafias".** As cinco grafias
   documentadas são das **empresas contratantes** (Demercado e Capital Realty),
   não de um fornecedor — `docs/BASE_DE_CONHECIMENTO.md:484` e
   `app/Config.gs:111` (`'Empresas', nota: 'CR e Demercado. O acervo tem 5
   grafias para 2 CNPJs.'`). O achado é real; a atribuição está errada, e é o
   tipo de erro que um conselheiro que conhece a operação corrige em voz alta.

---

## 2. Tabela de achados

| # | Slide | Classificação | Frase no deck (exata) | Correção proposta | Onde verifiquei |
|---|---|---|---|---|---|
| 1 | 2 — O problema | **SEM LASTRO** (atribuição errada) | *"O mesmo fornecedor, cinco grafias — Cinco formas de escrever para dois CNPJs."* | "A mesma **empresa**, cinco grafias — cinco formas de escrever Demercado e Capital Realty, para dois CNPJs. Sem chave única não há como somar quanto se gastou com quem." | `app/Config.gs:111`; `docs/BASE_DE_CONHECIMENTO.md:484`; `app/Manutencao.gs:824-838` (as grafias alternativas semeadas) |
| 2 | 2 — O problema | CORRETO | *"45 documentos reais analisados"* | manter | `dados/auditoria_cobertura.json` → `resumo.arquivos_na_pasta_e_subpastas: 45` |
| 3 | 2 — O problema | CORRETO | *"Faltam os itens 11, 15, 22, 24 e 26 na lista do contrato"* | manter | `docs/BASE_DE_CONHECIMENTO.md:133` e `:19` |
| 4 | 2 — O problema | CORRETO | *"Contratou-se por R$ 70.000 e a planilha mostra R$ 80.563,38"* | manter | `docs/BASE_DE_CONHECIMENTO.md:382-386`; `docs/REVISAO_ACERVO_SERVICOS.md:47` |
| 5 | 2 — O problema | CORRETO | *"o Cód. Fornecedor veio vazio em 10 de 10 documentos"* | manter | `app/Config.gs:129` (nota da tabela `Fornecedores`) |
| 6 | 3 — Já funciona | **DESATUALIZADO** + receita não reproduzível | *"LINHAS EM PRODUÇÃO · 20.025"* | **23.051** — `app/*.gs` (sem `Apresentacao_Conselho.gs`) + `app/Interface.html`. Se preferir só o servidor: **13.010**. | `ls app/*.gs \| grep -v Apresentacao \| xargs cat \| cat - app/Interface.html \| wc -l` = 23051. Não consegui reproduzir 20.025 por nenhuma combinação; no commit em que o deck nasceu (`b973c8d`) o total de `app/` era 20.918 |
| 7 | 3 — Já funciona | **DESATUALIZADO** | *"ASSERÇÕES DE TESTE · 1.044"* | **1.157** ocorrências de `assert.` nas 31 suítes do `npm test` | script de contagem sobre `package.json` + `tests/*.cjs`; no commit `b973c8d` eram 1.004 |
| 8 | 3 — Já funciona | **SEM LASTRO** | *"90% verificam comportamento"* (sub-rótulo do KPI de asserções) | **remover**. Substituir por algo apurável: *"27 scripts de mutação quebram o código de propósito para checar se o teste pega"* | nenhum script no repo calcula essa proporção; `grep -rn "90%" docs/` só devolve a meta de adesão à avaliação (`docs/PLANO_ESTRATEGICO_PROJETO.md:138`) |
| 9 | 3 — Já funciona | **DESATUALIZADO** | *"SUÍTES AUTOMÁTICAS · 25"* | **31** (as que o `npm test` roda). São 32 arquivos em `tests/`, um dos quais é o gerador de baseline | `package.json` → script `test`; `ls tests/*.cjs \| wc -l` = 32 |
| 10 | 3 — Já funciona | CORRETO | *"DOCUMENTOS DO ACERVO · 45 · analisados; 21 já importados"* | manter | `dados/auditoria_cobertura.json` (45 e 21); `dados/historico_orcamentos.json` → 8+8+5 = 21 documentos, 73+133+68 = 274 linhas |
| 11 | 3 — Já funciona | **FALTANDO** | — | ver seção 4, slide "O que já funciona (2)": importador da plataforma, painel de saving, ficha 360°, via em Slides, disparo de e-mail, proteção da base, Megas em cadastro | seção 4 |
| 12 | 4 — O ciclo | **SEM LASTRO** | etapa 1: *"Convite registrado: quem respondeu **e quem não**"* | "Convite registrado na homologação: quem apresentou proposta e quem não apresentou" | `app/Equalizacao.gs:1310-1345` — a escrita em `Convites` parte de `propostas`; `CONFIRMOU` entra fixo em `true` e `VISITOU` fixo em `false`. Convidado que nunca respondeu não gera linha |
| 13 | 4 — O ciclo | **DESATUALIZADO** | rodapé: *"O aviso ativo ao gestor — e-mail e chatbot — está mapeado para a versão seguinte."* | "O e-mail já dispara na homologação, com link direto para a avaliação. Falta rotear ao gestor do Mega e o canal de chatbot." | `app/Equalizacao.gs:1351` chama `cfDispararNotificacaoAvaliacao_`; `app/Avaliacao.gs:350-434` monta e envia com `MailApp`; a rota `?page=avaliacao` é tratada em `app/Interface.html:10036` |
| 14 | 4 — O ciclo | CORRETO | *"Cinco critérios ponderados, em um minuto"* | manter | `app/Avaliacao.gs:43-55` — qualidade 30, prazo 25, segurança 20, atendimento 15, limpeza 10; soma travada em `CF_PESO_TOTAL_AVALIACAO` |
| 15 | 5 — A implementar | CORRETO | *"ATÉ 20/09 — Trava de cotação mínima ativada na base"* | manter, com a precisão de que a regra já bloqueia e o que falta é semear a aba | `app/Equalizacao.gs:1246-1268` (bloqueio C21) e `:749-784` (`cfRegraCotacao_`); semeadura em `app/Manutencao.gs:868` a partir de `app/Config.gs:600` |
| 16 | 5 — A implementar | **DESATUALIZADO** (parcial) | *"Hoje grava quem apresentou proposta. Falta validade, prazo declarado e agilidade na negociação — e quem foi convidado e não respondeu."* | acrescentar que `CONFIRMOU` e `VISITOU` hoje entram com valor fixo, não medido | `app/Equalizacao.gs:1329-1337` |
| 17 | 5 — A implementar | **DESATUALIZADO** | *"VERSÃO FUTURA — Aviso ativo ao gestor: e-mail e chatbot"* | mover o e-mail para "já funciona" e deixar em futuro apenas: destinatário roteado ao gestor do Mega, lembrete de pendência e chatbot | `app/Avaliacao.gs:350-434`; o destinatário hoje sai de `Config.EMAIL_AVALIACOES` / `EMAIL_FISCAL_FACILITIES` ou, na falta, do usuário que homologou (`:369-375`). Não há gatilho de tempo: `grep -rn "ScriptApp.newTrigger" app/` não devolve nada |
| 18 | 5 — A implementar | CORRETO | *"VERSÃO FUTURA — Catálogo com unidade base"* | manter | `app/Config.gs:212-227` (`UNIDADE_BASE`, `FATOR_BASE`); a tabela `Catalogo` não é lida nem escrita por nenhum arquivo — ver seção 3 |
| 19 | 6 — Falta provar | NÃO VERIFICÁVEL aqui | *"EQUALIZAÇÕES REAIS · 0"*, *"MEDIÇÕES DE TEMPO · 0"*, *"AVALIAÇÕES · 1"* | manter, mas conferir na base antes de apresentar | esses números vivem na planilha Google (`app/Schema.gs:11`, `CF_PLANILHA_PADRAO`), não no repositório. O `README.md` diz o mesmo, com auditoria de 05/09 |
| 20 | 6 — Falta provar | **DESATUALIZADO** | *"SAVING APURADO · — · a partir das compras feitas no sistema"* | manter o travessão, mas trocar o subtítulo para "o caminho do dado já existe de ponta a ponta; falta homologação" | `app/Persistencia.gs:299-300` grava `VALOR_PROPOSTA_INICIAL` e `REDUCAO_NEGOCIADA`; `app/Equalizacao.gs:109-190` (`cfPanoramaSaving_`) soma por mês, Mega, categoria e negociador, com denominador; `app/Codigo.gs:373` expõe. Continua sem número porque só entra equalização com `STATUS = 'homologada'` (`app/Equalizacao.gs:125`) |
| 21 | 6 — Falta provar | CORRETO | *"A instrumentação já mede sozinha os dois lados — e não rodou nenhuma vez."* | manter | `app/Manutencao.gs:614` (`registrarTempoNaPlanilha`) e `:646` (`relatorioDeTempo`) |
| 22 | 7 — Pedidos | CORRETO | os três pedidos e a faixa de fechamento | manter | consistente com `docs/PLANO_FECHAR_OS_BURACOS.md` blocos 1.1 e 3.1 |
| 23 | Deck inteiro | **FALTANDO** | — | os planos (Convite com Escopo, Portal do Fornecedor, Custo Real de MEI) não aparecem em slide nenhum. O Conselho vai ouvir os planos | `docs/PROPOSTA_CONVITE_COM_ESCOPO.md`, `docs/PROPOSTA_PORTAL_DO_FORNECEDOR.md`, `docs/PROPOSTA_CUSTO_REAL_MEI.md` |

---

## 3. Números de hoje, com o comando que prova cada um

Ambiente: `PATH` com `C:\Program Files\nodejs`. Node **v24.19.0**.

| Número | Valor | Comando / arquivo |
|---|---:|---|
| Suíte automatizada | **PASSA** (exit 0) | `npm test` |
| Suítes rodadas pelo `npm test` | **31** | script `test` em `package.json` |
| Arquivos de teste em `tests/` | **32** | `ls tests/*.cjs \| wc -l` |
| Asserções `assert.` nas 31 suítes | **1.157** | varredura de `assert\.` nos arquivos citados no script `test` |
| Asserções `assert.` em todo `tests/*.cjs` | **1.157** | `grep -oh "assert\." tests/*.cjs \| wc -l` |
| Scripts de mutação | **27** | `ls tests/mutacoes/*.cjs \| wc -l` |
| Mutações pegas em `mutar-plataforma.cjs` | **9 de 10** | `node tests/mutacoes/mutar-plataforma.cjs` — a décima ("CNPJ não recupera o zero à esquerda") não encontra mais o alvo e precisa ser reescrita |
| Linhas de servidor (`app/*.gs`, sem o gerador do deck) | **13.010** | `ls app/*.gs \| grep -v Apresentacao \| xargs cat \| wc -l` |
| Linhas de front (`app/Interface.html`) | **10.041** | `wc -l app/Interface.html` |
| **Linhas em produção (servidor + front)** | **23.051** | soma dos dois acima |
| Linhas do gerador do deck | 718 | `wc -l app/Apresentacao_Conselho.gs` |
| Commits | **159** | `git log --oneline \| wc -l` |
| Último commit | `7389c9c` · 2026-09-09 | `git log -1 --format='%h %ad' --date=short` |
| Versão do schema | **v8** | `app/Config.gs:21` — `const CF_SCHEMA_VERSAO = 8` |
| Tabelas no schema v8 | **24** | contagem de `{ nome: '...'` em `app/Config.gs` |
| Colunas no schema v8 | **282** | contagem de `campo: '...'` em `app/Config.gs` |
| Naturezas orçamentárias catalogadas | **16** (11 disputáveis, 5 não) | `app/Config.gs:563-580` |
| Faixas de cotação mínima padrão | **3** | `app/Config.gs:600-618` (`CF_REGRAS_COTACAO_PADRAO`) |
| Critérios de avaliação (v2) | **5**, pesos 30/25/20/15/10 | `app/Avaliacao.gs:43-55` |
| Limiar do alerta de preço | **+15% / −10%** | `app/Interface.html:4338-4349` e `:6209-6213` |
| Documentos do acervo analisados | **45** | `dados/auditoria_cobertura.json` → `resumo.arquivos_na_pasta_e_subpastas` |
| Documentos já importados | **21** | mesmo arquivo, `arquivos_no_historico_local`; conferido em `dados/historico_orcamentos.json` (8 Curitiba + 8 Itajaí + 5 Esteio) |
| Linhas de preço no acervo local | **274** | `dados/historico_orcamentos.json` → 73 + 133 + 68 |
| APIs expostas ao navegador | **20** | `grep -n "^function api" app/*.gs` |
| Abas da interface | **4** (Consulta de preço, Equalizações, Fornecedores, Configurações) + janela de nova cotação | `app/Interface.html:2927-2933` |

### Dado morto no schema v8 — confirmado por varredura

**Oito tabelas** existem no schema e não são lidas nem escritas por nenhum
arquivo fora de `Config.gs` / `Schema.gs` / `Migracao.gs`:

`Categorias` · `Catalogo` · `Presets` · `PresetItens` · `Baselines` · `Notas` ·
`Ajustes` · `Clausulas`

`docs/PLANO_FECHAR_OS_BURACOS.md` lista **sete** e esquece `Categorias`. São
oito. As ocorrências que parecem contrariar isso são todas de outra natureza e
foram checadas uma a uma: `apiCategorias` (`app/Codigo.gs:315`) deduz categoria
das equalizações, não da aba; a configuração do catálogo vive em
ScriptProperties (`app/Codigo.gs:411-445`, chave `CF_CATALOGO_CONFIG`), não na
aba `Catalogo`; "Presets" em `Interface.html` é o motor de predefinições de EAP
do lado do cliente; e `nNotasCr` é um campo da equalização, não a tabela
`Notas`. **24 abas declaradas, 16 em uso.**

**Sete campos cadastrais da v8** são escritos pelo importador e não chegam a
nenhuma tela — o `IS_MEI` que você já conhecia tem mais seis companheiros:

| Campo | Escrito em | Lido por |
|---|---|---|
| `IS_MEI` | `app/ImportPlataforma.gs:263` | ninguém |
| `PORTE` | `app/ImportPlataforma.gs:213` | ninguém |
| `CAPITAL_SOCIAL` | `app/ImportPlataforma.gs:260` | ninguém |
| `DATA_INICIO_ATIVIDADE` | `app/ImportPlataforma.gs:261` | ninguém |
| `DATA_SITUACAO_CADASTRAL` | `app/ImportPlataforma.gs:262` | ninguém |
| `NATUREZA_JURIDICA` | `app/ImportPlataforma.gs:213` | ninguém |
| `CNAES_SECUNDARIOS` | `app/ImportPlataforma.gs:213` | ninguém |

`CNAE_PRINCIPAL`, por contraste, **é** lido (`app/Fornecedores.gs:67`, `:183`,
`:355`). E dois campos legados de `Avaliacoes` — `CONFORMIDADE` e
`DOCUMENTACAO` — ficaram órfãos quando os critérios foram trocados na versão 2
(`app/Avaliacao.gs:57-64`); não é defeito, é passado preservado de propósito,
mas conta como coluna que ninguém escreve mais.

---

## 4. Conteúdo slide a slide proposto

Onze slides. A ordem foi montada para o Conselho: problema → o que existe →
prova que falta → planos → pedidos. Cada afirmação carrega ✅ ou 🔜, e cada
número carrega o lastro entre parênteses.

> **Regra de layout ao aplicar:** todo texto continua tendo de passar por
> `_cnUmaLinha_` (curto) ou `_cnParagrafo_` (bloco). O recuo interno de ~7pt de
> cada lado do TEXT_BOX é o que quebra texto curto em caixa estreita — os
> rótulos abaixo foram escritos curtos por causa disso.

---

### Slide 1 — Capa
*(sem alteração de conteúdo)*

Manter como está, inclusive a caixa da régua: *"o que já funciona está separado
do que ainda será implementado — e nenhum número aparece sem dado por trás."*
Ela é a coisa mais valiosa do deck e é o que autoriza os slides 7 e 8.

---

### Slide 2 — O problema, com evidência de campo
*(header: "45 documentos reais analisados" · "Facilities e Engenharia")*

Quatro cartões, o terceiro corrigido:

1. **A numeração da EAP tem buracos** — Faltam os itens 11, 15, 22, 24 e 26 na
   lista do contrato. Numeração mantida à mão apodrece, e duas planilhas do
   mesmo serviço deixam de conversar.
   *(lastro: `docs/BASE_DE_CONHECIMENTO.md:133`)*
2. **A negociação vive fora da planilha** — Contratou-se por R$ 70.000 e a
   planilha mostra R$ 80.563,38. O valor real do contrato não está no arquivo
   que documenta a compra.
   *(lastro: `docs/BASE_DE_CONHECIMENTO.md:382-386`)*
3. **A mesma empresa, cinco grafias** ← **corrigido** — Cinco formas de escrever
   Demercado e Capital Realty, para dois CNPJs. Sem chave única não há como
   somar quanto se gastou com quem — e o Cód. Fornecedor veio vazio em 10 de 10
   documentos.
   *(lastro: `app/Config.gs:111` e `:129`; `docs/BASE_DE_CONHECIMENTO.md:484`)*
4. **Cada arquivo é um retrato isolado** — O preço pago no mês passado, pelo
   mesmo item, no mesmo Mega, não está ao alcance de quem compra hoje.

Rodapé: manter.

---

### Slide 3 — O que já funciona (1/2): a compra e a memória
*(header: "implantado" · "auditado contra o código-fonte")*

**KPIs (quatro cartões) — todos trocados:**

| Rótulo | Valor | Sub-rótulo |
|---|---|---|
| LINHAS EM PRODUÇÃO | **23.051** | servidor e tela, no ar |
| ASSERÇÕES DE TESTE | **1.157** | em 31 suítes automáticas |
| SCRIPTS DE MUTAÇÃO | **27** | quebram o código para ver se o teste pega |
| DOCUMENTOS DO ACERVO | **45** | analisados; 21 já importados |

*(lastro, na ordem: `ls app/*.gs | grep -v Apresentacao | xargs cat | cat - app/Interface.html | wc -l`; varredura de `assert.` nas suítes do `npm test`; `ls tests/mutacoes/*.cjs | wc -l`; `dados/auditoria_cobertura.json`)*

**Painel esquerdo — A COMPRA, DE PONTA A PONTA** (todos ✅ FUNCIONA HOJE)
- ✅ Comparativo item a item, sem fórmula que quebra *(`app/Exportar.gs` grava valores, não fórmulas — `grep -c setFormula app/Exportar.gs` = 0)*
- ✅ Numeração da EAP derivada da posição, nunca digitada *(`app/Config.gs:356`)*
- ✅ Número livre de proponentes — as 3 colunas não estouram mais *(`app/Equalizacao.gs:786-800`)*
- ✅ Cadastro por CNPJ com preenchimento automático *(`app/Cnpj.gs`; cadastro interno na frente da BrasilAPI)*
- ✅ Documento de aprovação em Sheets, PDF **e Google Slides** *(`app/Exportar.gs` 1.577 linhas; `app/ExportarSlides.gs` 796 linhas)*
- ✅ Importação do acervo antigo, sem duplicar *(hash em `app/Config.gs:481-494`)*

**Painel direito — A MEMÓRIA QUE A PLANILHA NÃO TINHA** (todos ✅)
- ✅ Histórico de preço por item ao longo do tempo *(`app/Consulta.gs`)*
- ✅ Alerta na digitação: ▲ +15% ou ▼ −10% contra a última compra *(`app/Interface.html:4338-4349`; a equalização aberta é excluída da própria referência — `app/Codigo.gs:547-560`)*
- ✅ Marca cotada distinta da marca pedida, item a item *(`MARCA_COTADA` / `MARCA_REFERENCIA`, `app/Config.gs`)*
- ✅ Avaliação pós-serviço, cinco critérios ponderados 30/25/20/15/10 *(`app/Avaliacao.gs:43-55`)*
- ✅ A nota do fornecedor aparece na tela de quem decide *(selo de IQF no autocomplete e no cabeçalho do proponente)*
- ✅ Cotação mínima por faixa de valor, configurável em tabela *(`app/Equalizacao.gs:1246-1268`; faixas em `app/Config.gs:600`)*

Rodapé: manter — *"Se o Conselho pedir para ver qualquer item desta página, ele
é aberto na hora."*

---

### Slide 4 — O que já funciona (2/2): o que entrou desde a última versão
**SLIDE NOVO.** É o slide que o deck atual não tem, e é onde está quase tudo o
que mudou nas duas últimas semanas.

Seis cartões, todos ✅ FUNCIONA HOJE:

1. ✅ **Base da plataforma de compras conectada** — cadastro de fornecedores e
   histórico de contratações entram por importação idempotente, em tabela
   separada de `Equalizacoes` de propósito: compra importada não é equalização
   feita aqui. *(`app/ImportPlataforma.gs`, 567 linhas; `Contratacoes` e
   `Naturezas` em `app/Config.gs:429-480`; 12 verificações em
   `tests/teste-import-plataforma.cjs`)*
   > **Antes de apresentar:** ver a seção 5. O volume dessa base (fornecedores,
   > ordens de compra, valor) **não pode ser conferido neste repositório** e os
   > documentos discordam entre si. Ou você confere na base e diz o número
   > apurado, ou este cartão fala de mecanismo e não de volume.
2. ✅ **O zero à esquerda do CNPJ volta — e só com prova** — planilha e CSV comem
   o zero inicial; o reparo só é aceito quando o dígito verificador confirma que
   era ele. *(`app/ImportPlataforma.gs:125-175`)*
3. ✅ **A base não se reinventa** — se o ID da planilha-mestra não abrir, o
   sistema para e explica. Antes ele criava uma base vazia e gravava o ID dela
   para todo mundo: um usuário sem permissão derrubava o histórico de todos, em
   silêncio. *(`app/Schema.gs:54-99`; 3 verificações em
   `tests/teste-planilha-nao-inventa.cjs`)*
4. ✅ **Painel de saving com denominador à vista** — por mês, Mega, categoria e
   por quem negociou; o saving entra no mês da decisão, não no da cotação, e
   toda aproximação vai marcada. *(`app/Equalizacao.gs:109-190`;
   `app/Codigo.gs:373`)*
5. ✅ **Ao homologar, o sistema vai atrás da avaliação** — e-mail com link direto
   que abre o formulário pronto, em celular ou desktop.
   *(`app/Equalizacao.gs:1351` → `app/Avaliacao.gs:350-434`; rota em
   `app/Interface.html:10036`)*
6. ✅ **Megas e empresas saíram do código e viraram cadastro** — abrir um quarto
   Mega é uma linha de planilha, não uma publicação de programa.
   *(`app/Manutencao.gs:820-870`)*

Rodapé: *"Nada nesta página estava pronto na última vez que este projeto foi
apresentado."*

---

### Slide 5 — O ciclo que se fecha
*(header: "é isto que muda o processo")*

Texto de abertura: manter.

Cinco etapas, com a **primeira corrigida**:

| # | Etapa | Texto |
|---|---|---|
| 1 | COTAR | Convite registrado na homologação: quem apresentou e quem não |
| 2 | EQUALIZAR | Comparativo item a item, com alerta de preço fora da faixa |
| 3 | HOMOLOGAR | Exige justificativa fora do menor preço e abaixo da cotação mínima |
| 4 | AVALIAR | Cinco critérios ponderados, em um minuto |
| 5 | A NOTA VOLTA | O IQF aparece na coluna do fornecedor na próxima cotação |

*(lastro da etapa 1: `app/Equalizacao.gs:1310-1345`. Etapa 3:
`app/Equalizacao.gs:1246-1281`. Etapa 5: selo de IQF no cabeçalho do proponente,
protegido por `tests/mutacoes/mutar-iqf.cjs` depois de ter morrido calado por
cinco commits — `tests/mutacoes/README.md`)*

De→para: manter.

**Rodapé corrigido:** ✅ o e-mail ao homologar já dispara. 🔜 Falta rotear ao
gestor do Mega, lembrar enquanto a avaliação estiver pendente, e o canal de
chatbot. *(hoje o destinatário sai de uma chave de configuração ou, na falta,
do usuário que homologou — `app/Avaliacao.gs:369-380`; não há gatilho de tempo
no projeto)*

---

### Slide 6 — O que ainda NÃO fizemos, no caminho crítico até 15/10
*(header: "nada aqui está pronto" · "com prazo")*

Quatro cartões:

| Prazo | Item | Texto |
|---|---|---|
| **ATÉ 20/09** | Trava de cotação mínima ligada na base | 🔜 A regra já bloqueia a homologação e já é configurável por faixa (`app/Equalizacao.gs:1246`). Enquanto a aba `Regras` não for semeada, ela não tem o que cobrar. É rodar uma função (`app/Manutencao.gs:868`) |
| **ATÉ 30/09** | Registro completo do comportamento de cotação | 🔜 Hoje grava quem apresentou proposta, com "confirmou" e "visitou" ainda em valor fixo (`app/Equalizacao.gs:1329-1337`). Falta validade, prazo declarado, agilidade na negociação — e quem foi convidado e não respondeu |
| **ATÉ 10/10** | Piloto: 8 a 12 equalizações reais | 🔜 Zero compras passaram pelo sistema. É o item de maior peso e não depende de código nenhum |
| **ATÉ 15/10** | Saving e tempo somados no relatório final | 🔜 O caminho do dado já existe de ponta a ponta (`app/Persistencia.gs:299-300` → `app/Equalizacao.gs:109`); falta a compra real atravessá-lo |

Rodapé: *"Preferimos declarar o que falta a ser perguntados por ele."*

---

### Slide 7 — Os números que ainda não temos
*(header: "a parte mais importante desta apresentação")*

Texto de abertura: manter.

**KPIs (quatro cartões vermelhos):**

| Rótulo | Valor | Sub-rótulo |
|---|---|---|
| EQUALIZAÇÕES REAIS | 0 | nenhuma compra passou pelo sistema ainda |
| MEDIÇÕES DE TEMPO | 0 | nem no Excel, nem no sistema |
| SAVING APURADO | — | o caminho do dado existe; falta a compra atravessá-lo |
| AVALIAÇÕES | 1 | o índice precisa de 3 para deixar de ser preliminar |

> **Conferir na base antes de apresentar.** Estes quatro números vivem na
> planilha Google (`app/Schema.gs:11`), não no repositório. Rode
> `relatorioDeTempo()` e `panoramaDaBase()` na véspera. Se algum tiver mudado,
> mudou para melhor — mas apresentar "0" quando já são 2 é tão ruim quanto o
> contrário.

Painéis esquerdo e direito: manter os dois textos como estão. São os melhores
parágrafos do deck.

**Acrescentar uma linha ao painel esquerdo:** *"O tempo do lado novo se mede
sozinho, do primeiro campo até a gravação. O do lado velho só se mede à mão, e
só enquanto o Excel existir."* *(`app/Manutencao.gs:596-646`)*

Rodapé: manter.

---

### Slide 8 — Onde a base ainda não paga o que custa
**SLIDE NOVO.** Curto. É o slide que compra credibilidade para tudo o que veio
antes, e ele conecta direto com o slide 10.

Texto: *"O schema v8 declara 24 abas e 282 colunas. Dezesseis abas estão em uso.
Isso é dívida, e ela está mapeada."*

Dois blocos:

- **Oito abas declaradas e nunca escritas** — `Categorias`, `Catalogo`,
  `Presets`, `PresetItens`, `Baselines`, `Notas`, `Ajustes`, `Clausulas`. Para
  cada uma, a decisão é implementar ou remover do schema — nenhuma das duas foi
  tomada ainda. *(varredura em `app/`, seção 3 deste relatório)*
- **Sete campos cadastrais que entram e não saem** — `IS_MEI`, `PORTE`,
  `CAPITAL_SOCIAL`, `DATA_INICIO_ATIVIDADE`, `DATA_SITUACAO_CADASTRAL`,
  `NATUREZA_JURIDICA`, `CNAES_SECUNDARIOS`. O importador grava; nenhuma tela lê.
  *(`app/ImportPlataforma.gs:213`, `:260-263`)*

Rodapé: *"O `IS_MEI` parado na base é o começo da terceira proposta deste deck."*

---

### Slide 9 — As três frentes registradas para depois de 15/10
**SLIDE NOVO.** O Conselho vai ouvir os planos. Este slide existe para que eles
sejam ouvidos **como planos**.

Faixa no topo, em destaque: **🔜 Nenhuma destas três tem uma linha de código
escrita. Todas foram verificadas contra o schema v8; nenhuma cabe antes do
relatório final de 15/10.** *(as três declaram isso no próprio cabeçalho:
`docs/PROPOSTA_CONVITE_COM_ESCOPO.md`, `docs/PROPOSTA_PORTAL_DO_FORNECEDOR.md`,
`docs/PROPOSTA_CUSTO_REAL_MEI.md`)*

Três cartões:

**1. 🔜 Convite para licitação, com escopo** — 16 a 23 h
O processo passa a começar quando a Capital Realty define o que quer comprar, e
não quando os PDFs já voltaram. Todo mundo cota o mesmo texto, a mesma
quantidade e a mesma marca de referência — e o convite emitido vira registro
antes de existir resposta.
*O que já sustenta:* a árvore `EAP` já carrega descrição, quantidade, unidade e
marca de referência; o convite é essa árvore sem a coluna de preço, saindo do
mesmo motor de documento. A tabela `Convites` já existe com os nove campos do
fluxo. O disparo por e-mail já está provado.
*O que só este sistema faz:* sugerir **quem** convidar com fundamento — quem já
cotou a categoria, quem entregou bem, quem não respondeu das últimas vezes.
*Pré-requisito do Portal.*

**2. 🔜 Portal do Fornecedor** — a outra metade do convite
O fornecedor responde dentro do sistema, por token, sem nunca ver o preço dos
outros. Elimina a transposição manual das planilhas — que é justamente o tempo
que estamos medindo.
*Duas decisões que precisam ser tomadas antes da primeira linha:* dois web apps
sobre uma planilha só (o app interno depende da identidade corporativa, que o
acesso anônimo apaga); e o endpoint externo nunca devolve dado de outro
proponente — nem total, nem contagem. Isso é risco comercial, não recurso.
*Depende do convite:* é o convite que gera o token.

**3. 🔜 O custo real da contratação de MEI** — 14 a 21 h
Proponente MEI, em serviço previsto em lei, carrega 20% de encargo patronal
sobre a mão de obra. A proposta mais barata pode não ser a mais barata — e hoje
a tela não diz isso.
*O dado já está na base e não é lido por ninguém:* `IS_MEI`.
*A trava que a ideia exige:* enquanto a Contabilidade não confirmar por escrito
a base de cálculo, o sistema **sinaliza** e **não publica valor**. Selo MEI na
tela custa 1 a 2 h e não depende de validação fiscal nenhuma — é a única parte
antecipável.

Rodapé: *"São ideias registradas para não se perderem. Nenhuma delas move o
relatório de 15/10, e é por isso que nenhuma começa antes dele."*

---

### Slide 10 — Por que não agora
**SLIDE NOVO, curto.** Um `_cnDePara_` e três linhas. Existe porque a pergunta
"por que vocês não estão construindo o portal?" vem, e a resposta é boa.

De→para:
- **antes:** Construir o portal e o convite agora adiciona superfície nova,
  voltada para fora da companhia, semanas antes da apresentação — e consome as
  horas que o piloto precisa.
- **depois:** O que decide o concurso até 15/10 é cronometrar o Excel e rodar 8
  a 12 compras reais. **Um portal pela metade em outubro vale menos que uma
  medição feita em setembro.**

Linha de fecho: *"A janela da medição fecha sozinha quando o Excel sair de uso.
A do portal não fecha nunca."* *(`docs/PROPOSTA_PORTAL_DO_FORNECEDOR.md`, seção
"Quando"; `docs/PLANO_FECHAR_OS_BURACOS.md`, bloco 1.1)*

---

### Slide 11 — O que peço ao Conselho
*(sem alteração de conteúdo — os três pedidos e a faixa de fechamento passaram
na auditoria)*

1. Autorizar o piloto em Facilities — Megas Curitiba e Esteio, 8 a 12
   equalizações reais.
2. Definir quem preenche a avaliação pós-serviço — o gestor do Mega ou
   Suprimentos. *(o sistema já grava o papel de quem avaliou:
   `PAPEL_AVALIADOR`, `app/Config.gs:169`)*
3. Aval para cronometrar o Excel esta semana — três equalizações, duas a três
   horas.

Faixa final: manter.

**Sugestão de acréscimo à faixa final**, já que o slide 9 abre a porta:
*"E, se o Conselho quiser, uma quarta decisão: qual das três frentes de 2027
entra primeiro."* Isso transforma os planos em pauta, em vez de deixá-los como
enfeite.

---

## 5. O que eu NÃO consegui verificar

Esta seção é a mais importante do relatório. Nada abaixo deve entrar no deck sem
apuração direta.

### 5.1 Os números da base da plataforma — 179 / 738 / R$ 5.105.991,36

**Não consegui confirmar nenhum dos três.** Eles aparecem apenas em documentos
(`docs/AUDITORIA_NOTA_2026-09-08.md:31` e `:42`;
`docs/PROPOSTA_CONVITE_COM_ESCOPO.md:25` e `:75`) e em comentários de código
(`app/Config.gs:444`, `app/ImportPlataforma.gs:6`). **Não existe no repositório
nenhum dataset que os produza.** As duas fontes reais são arquivos do Google
Drive referenciados por ID (`app/ImportPlataforma.gs:47-48`), e o resultado da
importação vive na planilha-base — fora daqui. O teste
`tests/teste-import-plataforma.cjs` roda sobre fixtures sintéticas, não sobre os
dados reais.

Pior: **as fontes discordam.** O cabeçalho de `app/ImportPlataforma.gs:5` diz
*"o cadastro de **312** fornecedores"*, enquanto `docs/AUDITORIA_NOTA` diz
**179**. Um dos dois está errado, ou os dois medem coisas diferentes (cadastro
importado × fornecedores com contratação disputável), e nada no repositório
resolve a ambiguidade.

**Recomendação:** antes de apresentar, abrir a base e contar — `panoramaDaBase()`
em `app/Consulta.gs`, ou a própria aba `Contratacoes`. Levar o número apurado e
dizer de onde saiu. Se não houver tempo para isso, o slide 4 fala de mecanismo
("a base da plataforma está conectada, e importar duas vezes não duplica") e não
cita volume. Repetir 179/738/R$ 5,1 mi sem conferir é reintroduzir exatamente o
problema que a auditoria anterior removeu.

Igualmente não verificáveis, e da mesma família: a quebra por Mega (277 Itajaí /
248 Curitiba / 205 Esteio / 8 rateio), os R$ 3.354.782,09 em 571 compras
disputáveis, e os "330 CNPJs restaurados por módulo 11" — todos exclusivos de
`docs/AUDITORIA_NOTA_2026-09-08.md`.

### 5.2 "De ~50 min para menos de 15 min"

`docs/AUDITORIA_NOTA_2026-09-08.md:72` afirma que o piloto vai *"comprovar a
redução de ~50 min para menos de 15 min"*. **Esses dois números não existem.**
`relatorioDeTempo()` (`app/Manutencao.gs:646`) imprime literalmente *"NENHUMA.
Sem isto não existe comparação, e o ganho continua sendo afirmação"* quando não
há medição na planilha — que é o estado de hoje. Nenhum dos dois lados foi
cronometrado. **Este par de números não pode entrar no deck em hipótese
nenhuma**; é o mesmo defeito do "saving fixo de 11,8%".

### 5.3 A nota 8,95/10

`docs/AUDITORIA_NOTA_2026-09-08.md` apresenta uma nota consolidada de 8,95/10
com memória de cálculo. É uma **auto-avaliação** — o documento é do próprio
autor do projeto, não do Comitê Avaliador. Não há registro de nota atribuída
pela banca em lugar nenhum do repositório. Fora do deck.

### 5.4 "10 de 10 mutações capturadas"

`docs/AUDITORIA_NOTA_2026-09-08.md:61` afirma 10/10 em `mutar-plataforma.cjs`.
**Rodei: são 9 de 10 hoje.** A décima ("CNPJ não recupera o zero à esquerda")
devolve *"alvo não encontrado; a mutação precisa ser reescrita"* — o código de
produção mudou e a mutação não acompanhou. O sistema não regrediu; o script de
mutação é que envelheceu. Se for citar mutação no deck, cite os 27 scripts e a
disciplina, não um placar.

### 5.5 Os números da base ao vivo

"0 equalizações reais", "0 medições de tempo", "1 avaliação", "4 equalizações /
12 propostas / 78 linhas de preço" — todos vêm da planilha Google e da auditoria
de 05/09 registrada no `README.md`. **Nenhum é verificável a partir do
repositório.** O acervo local (`dados/historico_orcamentos.json`: 21 documentos,
274 linhas, 7 fornecedores) é a única parte que pude conferir. Confira os demais
na base na véspera.

### 5.6 A frase "20.025 linhas"

Não consegui reproduzir esse total por nenhuma combinação de arquivos, nem hoje
nem no commit em que o deck nasceu (`b973c8d`, onde `app/` inteiro somava
20.918 linhas). O número está errado hoje de qualquer modo; registro aqui apenas
que **também não sei de onde ele saiu**, o que é motivo extra para trocá-lo por
um número com comando ao lado.

### 5.7 A contradição dos documentos, em resumo

| Afirmação | Fonte A | Fonte B | Quem tem razão |
|---|---|---|---|
| Fornecedores na base | 179 (`AUDITORIA_NOTA:42`) | 312 (`ImportPlataforma.gs:5`) | **indeterminado** — conferir na base |
| Tabelas mortas | 7 (`PLANO_FECHAR_OS_BURACOS`) | — | **8** — o plano esquece `Categorias` |
| Abas no schema | 21 (`app/README.md`, "Schema v3") | 22 (`PLANO_FECHAR_OS_BURACOS`) | **24** (`app/Config.gs`, v8) — os dois documentos estão velhos |
| Suítes de teste | 31 (`AUDITORIA_NOTA:57`) | 25 (deck) | **31** — a auditoria acertou, o deck envelheceu |
| Gerador de apresentação | "cortar formalmente do escopo" (`PLANO_FECHAR_OS_BURACOS`) | — | **foi construído** — `app/ExportarSlides.gs`, 796 linhas, com suíte própria |

---

*Auditoria feita em 09/09/2026 contra o commit `7389c9c`. `npm test`: 31 suítes,
exit 0. Nenhum arquivo do repositório foi alterado além da criação deste.*
