# Avaliação pela perspectiva do aprovador — 06/09/2026

**Parecer:** a exportação já organiza bem a decisão, mas eu devolveria para complementação um dossiê com propostas de escopos diferentes, pendências relevantes ou aprovação anterior alterada sem identificação da revisão. O principal investimento deve ser na confiança do conteúdo recebido. O resumo executivo, os valores numéricos e os links já existem.

Avaliação independente por agente no papel de gestor que recebe a planilha/PDF e precisa autorizar uma contratação. Código de referência: HEAD `f944187`, incluindo as correções recentes de integridade e de valor homologado. Este documento não repete a auditoria antiga como se descrevesse o estado atual.

## Escopo e evidências

- Leitura de `app/Exportar.gs`, `app/Equalizacao.gs`, schema, autorização, fluxo de decisão da interface e testes de exportação/homologação.
- Inspeção estrutural do XLSX `EQU_AAAAMMDD-MEGA_PROJETO_ÁREA.xlsx`, abrindo os XMLs internos. As abas são `Mapa de Cotação_Demercado` e `Mapa de Cotação_CR`; ambas contêm total em B30, condições comerciais em B31:B40, negociação inicial/R01/R02 em B43:B45 e detalhamento em B49. Essa inspeção não equivale à leitura visual no Excel.
- Execução local de funções de exportação e montagem do mapa em Node, com serviços Google substituídos por objetos simulados. A grade gerada foi capturada antes da formatação. Sete reproduções concluídas com saída 0 em `tools/avaliar-exportacao-aprovador.cjs`: bases do comparativo, pendências, faturamento direto, status de itens, prazo, validade e título de homologação. O script registra o comportamento atual, incluindo as falhas; não é uma suíte que declara essas falhas desejáveis.
- O agente principal também executou onze reproduções do fluxo de compra em `tools/avaliar-fluxo-compras.cjs`, incluindo a troca incorreta de identidade descrita em A0 e a mistura de unidades na série histórica.
- O agente principal informou execução bem-sucedida das suítes atuais: 37 verificações de ciclo e 37 cenários de correções. Os testes existentes usam simulações e verificações de código; passar nesses testes não comprova impressão, paginação ou acesso real aos anexos.
- Nenhuma alteração de aplicação, deploy, gravação na base ou exportação real no Google foi realizada por este agente. Não foram verificados dados de produção, políticas internas efetivamente aprovadas ou assinatura real da diretoria.

P0 significa necessário antes de tratar o documento como base suficiente para autorização formal. P1 significa melhoria necessária no próximo ciclo de produto. P2 significa refinamento de apresentação e operação. “Falha confirmada” se refere a comportamento observado no código ou na simulação; “recomendação” depende de decisão de produto/processo.

## O que já ajuda quem aprova

| Recurso existente | Benefício | Evidência |
| --- | --- | --- |
| Resumo no início com fornecedor, CNPJ, valor, prazo e pagamento | Permite identificar a decisão antes de percorrer a matriz | `app/Exportar.gs:67`, `app/Exportar.gs:667` |
| Separação de total declarado, calculado e valor final homologado | Preserva a diferença entre soma dos itens e negociação global | `app/Exportar.gs:168`, `app/Exportar.gs:210`, `app/Exportar.gs:680`; teste em `tests/validar-correcoes.cjs:2473` |
| Unitário e total por fornecedor, agrupamento da EAP | Facilita a conferência do quantitativo e da composição | `app/Exportar.gs:129`, `app/Equalizacao.gs:163` |
| Parecer exigido ao escolher uma proposta mais cara | Registra parte da justificativa de contratação | `app/Equalizacao.gs:681` |
| Campos de prazo, validade, pagamento e proposta original | Dá acesso às condições e à evidência comercial | `app/Exportar.gs:233`, `app/Exportar.gs:270` |
| Quadro com Suprimentos, parecer técnico e Diretoria | Explicita responsabilidades no documento | `app/Exportar.gs:831` |
| ID da equalização, data/hora, autor da exportação e log | Oferece um início de rastreabilidade | `app/Exportar.gs:84`, `app/Exportar.gs:377`, `app/Exportar.gs:396` |
| Números estáticos e links aplicados após a escrita | Favorece conferência e evita fórmulas quebradas | `app/Exportar.gs:404`, `app/Exportar.gs:546`; testes em `tests/validar-correcoes.cjs:1035` e `:1578` |

## P0 — condições para uma decisão confiável

### A0. Trocar um fornecedor pode transferir a indicação anterior para outra empresa

**Falha confirmada pelo agente principal na reprodução C02.** Ao editar, os IDs de proposta são reaproveitados primeiro por CNPJ e depois por posição. Substituir Alfa por Gama na mesma posição pode manter o ID da proposta vencedora, o status e o parecer antigo. A reprodução encontrou a nova proposta de Gama com o `CNPJ_VENCEDOR` de Alfa e o parecer “Escolha da Alfa”. Como a exportação resolve o vencedor pelo ID da proposta atual, a indicação pode aparecer vinculada à nova empresa.

**Evidência:** `app/Equalizacao.gs:327`, `app/Equalizacao.gs:337`, `app/Equalizacao.gs:429`, `app/Exportar.gs:672`; `tools/avaliar-fluxo-compras.cjs:77`. A ocorrência foi simulada; não se afirma que existam documentos reais afetados.

**Melhoria e aceite:** vincular a decisão à identidade do fornecedor e à revisão comercial. Trocar CNPJ/empresa não transfere a escolha ou a justificativa da anterior. No caso Alfa → Gama, a edição deve exigir seleção explícita da nova proposta; nome, CNPJ, ID e parecer precisam referenciar a mesma empresa em tela, base e documento. Isso é correção de integridade da decisão, distinta da política de reaprovar alterações de preço discutida em A2.

### A1. O resumo pode recomendar uma cesta incompleta sem carregar o alerta

**Falha confirmada.** O mapa devolve `pendencias`, mas a exportação não as imprime. O scorecard recebe apenas equalização e proponentes; escolhe o menor total positivo sem conferir cobertura, exclusões ou validade. A própria função de pendências reconhece que uma cesta incompleta parece artificialmente barata.

**Evidência:** `app/Equalizacao.gs:218`, `app/Equalizacao.gs:223`, `app/Exportar.gs:67`, `app/Exportar.gs:688`. Na simulação, a pendência “Fornecedor A deixou itens sem cotar” desapareceu da grade exportada, enquanto A permaneceu como menor proposta.

**Como eu leria:** R$ 90 mil por nove itens não basta para superar R$ 100 mil pelo escopo completo. Se essa limitação não chega à primeira página, o aprovador precisa reconstruir a cotação para descobrir o risco.

**Melhoria:** mostrar “apto para decisão” ou “pendente de equalização”, cobertura por fornecedor e pendências com impacto financeiro/técnico. Usar uma base de escopo comparável antes de recomendar. Uma contratação parcial pode existir, mas precisa declarar o lote/escopo autorizado.

**Aceite:** com 9/10 itens obrigatórios cotados, o fornecedor não aparece como recomendação de contratação integral; item faltante e efeito na comparação constam do resumo. PDF e planilha conservam os mesmos alertas do mapa. Exceção exige escopo e justificativa registrados.

### A2. A seleção do comprador e a aprovação da diretoria têm o mesmo nome

**Comportamento confirmado; recomendação de governança.** O botão do comprador grava `homologada`. O topo exporta “PROPOSTA HOMOLOGADA”, mas o quadro da Diretoria segue com decisão e assinaturas em branco. O controle de acesso valida domínio corporativo; não diferencia função de comprador, gestor técnico e aprovador. A edição preserva o status e atualiza o valor final: isso é deliberado e coberto pelo teste 35, não uma regressão de persistência.

**Evidência:** `app/Interface.html:1618`, `app/Equalizacao.gs:429`, `app/Equalizacao.gs:449`, `app/Equalizacao.gs:699`, `app/Codigo.gs:246`, `app/Codigo.gs:311`, `app/Exportar.gs:672`, `app/Exportar.gs:700`, `app/Exportar.gs:843`, `tests/validar-correcoes.cjs:2385`.

**Como eu leria:** receber “homologada” e ainda ter de aprovar gera dúvida sobre quem já decidiu. Se o valor/escopo muda depois, a etiqueta de aprovação não identifica a versão autorizada. Além disso, o scorecard usa a presença de uma vencedora para determinar homologação; uma simulação com status `cancelada` e vencedora preenchida ainda produziu “PROPOSTA HOMOLOGADA”. Isso não comprova que esse estado exista na base atual.

**Melhoria:** representar separadamente recomendação de Suprimentos, validação técnica e autorização do gasto. Enquanto a aprovação ocorrer no papel/fora da aplicação, nomear o topo “Proposta indicada por Suprimentos — aguardando aprovação” e registrar o documento aprovado. Quando houver fluxo digital, aplicar papéis e alçadas definidos pela empresa. Alteração material após autorização deve gerar revisão pendente de nova aprovação.

**Aceite:** selecionar fornecedor pelo comprador não indica autorização da Diretoria. Decisão aprovada identifica pessoa, data, valor, escopo e revisão. Alterar preço/escopo preserva a revisão anterior e exige nova decisão conforme a política definida. Cancelada nunca aparece como aprovada. A política de alçadas deve ser validada com a operação, sem inventar faixas neste relatório.

## P1 — clareza financeira e completude comercial

### A3. Resumo e variação podem apontar fornecedores diferentes

**Falha confirmada de comunicação da base.** O scorecard usa total declarado/valor homologado; a linha “VALOR TOTAL”, a variação e seu destaque usam a soma calculada. As duas medidas são legítimas, porém a leitura parece contraditória.

**Reprodução:** A tem soma R$ 1.000 e declarado R$ 900; B tem soma/declarado R$ 950. O topo recomenda A por R$ 900. Na variação sobre o menor, A aparece +5,26% e B 0%, com B destacado. O total declarado de A recebe outro destaque em seguida.

**Evidência:** `app/Exportar.gs:168`, `app/Exportar.gs:175`, `app/Exportar.gs:190`, `app/Exportar.gs:210`, `app/Exportar.gs:680`.

**Melhoria e aceite:** exibir “Subtotal dos itens”, ajustes discriminados e “Total comercial para decisão”; calcular ranking e variação pela mesma base do resumo, mantendo a soma para conferência. No exemplo, A é a base 0% e B +5,56% no total comercial. A diferença de R$ 100 deve ter origem identificada, não apenas o texto genérico “com ajuste”.

### A4. Parte das condições relevantes não chega ao documento

**Omissão confirmada.** O valor de faturamento direto está no mapa e na tela, mas o PDF/planilha mostra apenas “sim/não”. O schema também prevê regime de contratação, BDI, ajustes e cláusulas; esses dados não são incorporados ao comparativo exportado. A existência do schema não comprova preenchimento dessas tabelas na operação.

**Evidência:** `app/Equalizacao.gs:135`, `app/Interface.html:1492`, `app/Exportar.gs:251`, `app/Config.gs:199`, `app/Config.gs:335`, `app/Config.gs:344`. Na simulação, o valor de faturamento direto 710 não apareceu em nenhuma célula; restou apenas “sim”.

**Melhoria:** apresentar faturamento direto em R$ e %, esclarecendo se integra o total; também premissas de impostos, frete, mobilização, garantia, responsabilidades e exclusões, conforme o tipo de compra. Para contratos recorrentes, indicar período e compromisso total. Não somar faturamento direto novamente sem conhecer sua composição.

**Aceite:** contrato de R$ 100 mil com R$ 71 mil de faturamento direto explicita a composição e preserva o total correto. Condições ausentes aparecem como “não informado”; exclusões relevantes e ajustes têm referência à proposta. O aprovador consegue entender o custo total e o que está fora dele.

### A5. “Incluso”, “excluído” e “não aplicável” viram “não cotou”

**Falha confirmada.** A exportação converte qualquer status diferente de `cotado` em “não cotou”, apesar de o schema distinguir os estados. Simulações com `incluso_em_outro_item`, `excluido` e `nao_aplicavel` produziram o mesmo texto.

**Evidência:** `app/Config.gs:54`, `app/Exportar.gs:143`.

**Melhoria e aceite:** preservar o significado e usar legenda textual. “Incluso no item 1.2” aponta a composição; “Excluído” explicita responsabilidade/custo ainda fora da proposta; “Não aplicável” tem justificativa; “Não cotado” permanece pendência. Cobertura não deve penalizar um item incluso devidamente relacionado nem aceitar uma exclusão como cobertura integral.

### A6. Validade importada em dias e prazo derivado podem desaparecer

**Falhas confirmadas em caminhos específicos.** Importações gravam `VALIDADE_DIAS`; o mapa expõe somente `VALIDADE_ATE`. Uma proposta com data e dez dias de validade chega sem validade ao mapa. Separadamente, quando o prazo de execução não está gravado, a exportação tenta derivá-lo de datas em `dd/MM/yyyy` acrescentando `T00:00:00`, formato que não é ISO válido.

**Evidência:** `app/Persistencia.gs:280`, `app/ImportOrcamento.gs:129`, `app/Equalizacao.gs:127`, `app/Codigo.gs:154`, `app/Exportar.gs:239`. Na simulação, início 15/09/2026 e término 20/09/2026, com prazo nulo, resultaram em prazo em branco. O fluxo de criação que já grava prazo numérico não depende desse fallback.

**Melhoria e aceite:** normalizar datas uma vez; derivar vencimento a partir de data/duração quando houver base suficiente; indicar validade vencida ou não informada no resumo. A proposta importada com validade em dias mantém essa informação. As duas datas do exemplo geram cinco dias, se essa for a convenção de contagem acordada, ou mostram explicitamente a convenção adotada.

### A7. O histórico de negociação não conserva a mesma leitura do modelo EQU

**Limitação confirmada; recomendação.** O XLSX original apresenta inicial, R01 e R02. A aplicação recebe essas rodadas, mas grava a última e os valores inicial/final; o export mostra rodada, inicial e redução, sem os valores intermediários. Não há, nesse caminho, uma tabela cronológica completa da negociação.

**Evidência:** modelo EQU, células B43:B45 nas duas abas; `app/Equalizacao.gs:496`, `app/Equalizacao.gs:504`, `app/Equalizacao.gs:541`, `app/Exportar.gs:289`, `app/Exportar.gs:317`.

**Melhoria e aceite:** conservar rodadas com data, valor, escopo/revisão e documento. Inicial R$ 120 mil → R01 R$ 110 mil → R02 R$ 105 mil deve permitir reconstruir os três momentos, distinguindo redução de preço de redução de escopo. O resumo pode continuar enxuto e remeter ao histórico detalhado.

### A8. “Economia na disputa” é distância para a maior proposta

**Recomendação de gestão, não erro aritmético.** O cálculo e a base percentual estão explícitos e testados. Entretanto, comparar com a proposta mais cara não demonstra economia contra orçamento, contrato anterior ou referência aprovada, e pode ser inflado por uma proposta fora de escopo/mercado.

**Evidência:** `app/Exportar.gs:717`, `app/Exportar.gs:770`, `tests/validar-correcoes.cjs:1703`.

**Melhoria e aceite:** nomear essa medida “Diferença para a maior proposta comparável”. Mostrar, separadamente, negociação do escolhido e desvio contra orçamento/referência quando disponíveis. Sem referência, escrever “sem referência de orçamento”; não somar dispersão de propostas e negociação como duas economias acumuláveis.

## P2 — apresentação e circulação

### A9. Projetar a primeira página e validar documentos longos

**Recomendação; problema visual não confirmado.** A saída é A4 paisagem com ajuste de toda a largura. A largura cresce 250 px por fornecedor, enquanto a fonte de origem é 10 pt. Não há repetição explícita do cabeçalho da matriz ou congelamento da planilha. Textos extensos usam células mescladas e quebra de linha, cuja impressão precisa ser observada em arquivo real.

**Evidência:** `app/Exportar.gs:407`, `app/Exportar.gs:437`, `app/Exportar.gs:468`, `app/Exportar.gs:557`, `app/Exportar.gs:569`.

**Melhoria:** primeira página com decisão solicitada, total, escopo, orçamento, justificativa e riscos; matriz e propostas nos anexos. Cabeçalhos com fornecedor/ID/revisão repetidos em cada página. Considerar A3 ou divisão dos fornecedores preservando colunas de referência em comparativos grandes.

**Aceite:** validar visualmente PDF e planilha com 1, 3, 5 e 8 fornecedores; 10 e 100 itens; nomes sociais longos e parecer extenso. Nenhum corte, assinatura isolada ou perda de identificação de coluna. Critério sugerido: texto legível em impressão a 100%, com corpo mínimo acordado, idealmente 9 pt. Isso requer exportação real e inspeção, ainda não executadas.

### A10. Tornar inequívoca a versão recebida e o acesso às provas

**Recomendação.** ID, autor e momento de geração já existem. Faltam, no documento, revisão aprovada identificada, link para a equalização de origem e histórico das decisões. O log associa IDs dos arquivos gerados, mas o nome da exportação não inclui revisão. O fallback de armazenamento pode deixar o arquivo na raiz do usuário; ter link não comprova acesso de quem aprova.

**Evidência:** `app/Exportar.gs:40`, `app/Exportar.gs:377`, `app/Exportar.gs:395`, `app/Exportar.gs:599`, `app/Equalizacao.gs:707`.

**Melhoria e aceite:** toda exportação informa ID, revisão, status, data-base e link de origem; a decisão referencia essa revisão. Uma revisão posterior não substitui a anterior silenciosamente. Testar os links com um perfil real de aprovador e imprimir “anexo não informado” quando faltar evidência. Valores estáticos, por si só, não tornam a planilha imutável.

## Ordem de implementação sugerida

1. Corrigir a identidade da proposta escolhida na edição, transportar pendências/cobertura para o documento e separar indicação do comprador de aprovação do gasto.
2. Unificar a base financeira de resumo, ranking e variação; preservar semântica dos itens, faturamento direto, validade e prazo.
3. Registrar revisão/rodadas e amadurecer orçamento, cláusulas e decisão técnica.
4. Testar a saída real com casos longos e com um aprovador usando sua própria conta.

**Critério final do aprovador:** conseguir responder, a partir do documento, “o que estou autorizando, por quanto, por que este fornecedor, com quais riscos, até quando e sobre qual versão”, sem depender de explicações orais do comprador.
