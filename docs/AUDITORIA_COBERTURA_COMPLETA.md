# Cobertura completa do acervo e lacunas do histórico

Consulta em **05/09/2026**, com leitura da pasta principal, Engenharia e PLANO. As listagens públicas retornaram 45 arquivos e duas subpastas, sem outras subpastas. Todos os 24 arquivos fora dos 21 orçamentos consolidados receberam classificação e ação. Também foram identificadas duas fontes externas referenciadas pela base do aplicativo; seus originais exigem acesso.

Abra a [planilha de auditoria](../dados/auditoria_cobertura.xlsx) para filtrar arquivo, situação, ação e fonte. O [JSON](../dados/auditoria_cobertura.json) preserva a auditoria dos mapas e as evidências. Esta entrega é um mapa de cobertura: **não acrescenta automaticamente dados ao histórico de 21 orçamentos/274 linhas e não grava na base Google**.

## O que falta no consolidado local

| Conjunto | Cotações candidatas ausentes | O que preservar |
| --- | ---: | --- |
| PMOC e ar-condicionado — Itajaí | 3 | Total anual, seis aparelhos, capacidade e PMOC/ART |
| PMOC e ar-condicionado — Curitiba | 3 | 2/3/12 visitas e diferenças de inclusão de PMOC |
| Lavagem de piso B2 — Esteio | 2 | CSM e Imunizadora RP; ADS já consta no histórico |
| Revitalização de society — Curitiba | 3 | Escopo, prazos e seleção de Norte Sul |
| Reservatório metálico — Curitiba | 3 | Propostas iniciais, negociação e justificativa da escolha |
| Ampliação de bicicletário — Itajaí | 3 | Fornecimento/instalação de 50 vagas adicionais |
| Material de consumo — Curitiba, abril | 3 | Contabilista, Essenza e Fabesul; dois PDFs representam o mesmo mapa |
| Material de consumo — Curitiba, junho | 3 | Contabilista, Essenza e Fabesul; datas individuais |
| Material de consumo — Itajaí, julho | 3 | Canaveral, Papersul e RC Papéis |
| Fundações — Curitiba, Fase 7 | 5 | Monopólio, JB, Pretech, Petry e União Fundações |
| **Total provisório** | **31** | Proponentes por concorrência, sem contar revisões como contratos novos |

Os 11 PDFs de equalização da pasta principal representam nove conjuntos únicos provisórios e 27 participações distintas. Uma participação, ADS/piso, já está no consolidado, restando 26. O vínculo dos dois mapas de piso é provisório para Imunizadora RP, devido à data divergente. A revisão independente do agente confirmou esses vínculos e a duplicação dos mapas de abril.

Nas nove cotações adicionais de materiais, foram conferidos **234 valores de linha**, em 80 descrições: os nove totais fecham. Os seis campos sem preço da Fabesul permanecem ausentes. São valores de linha sem quantidades suficientes para tratá-los como preços unitários. O [relatório anterior de serviços](REVISAO_ACERVO_SERVICOS.md) detalha as ofertas e os escopos.

## Contrato Canaveral: histórico contratual ainda ausente

O [contrato 0187.2026](https://drive.google.com/file/d/1ZbwFdOZXPH5932c0hqkbhcse8Jyc6IRK/view), Capital Realty/Mega Itajaí, datado de 07/08/2026, inclui **28 preços fixados no anexo da página 8**. A numeração vai até 33, com saltos: são 28 linhas, não 33.

A tabela foi transcrita e conferida visualmente na aba `Precos contratuais Canaveral` da auditoria. Deve gerar uma série de preços contratuais, vinculada às cotações e compras correspondentes. O contrato prevê pedidos por OC e quantidades solicitadas: a tabela de preços não comprova compra de uma unidade de cada produto nem pagamento. Não somar seus preços como valor comprado.

O anexo de SLA e as condições de comodato/entrega servem para qualificar a relação comercial, sem gerar novos preços. Os dados pessoais dos protocolos de assinatura não foram copiados para a auditoria.

## Engenharia: fontes adicionais e divergências

A [equalização de fundações](https://docs.google.com/spreadsheets/d/1IXi9g9tG3-dh4vPR5kAB_a-y5GMlqKsuaxBQv6sNL08/edit) tem quatro abas. Os cinco proponentes com valor no `Resumo` são:

| Proponente | Total no Resumo | Relação com os demais documentos |
| --- | ---: | --- |
| Monopólio | R$ 1.221.270,95 | PDF e EAP indicam R$ 1.085.426,14; confirmar versão. Data registrada: 26/12/2026. |
| JB Acabamentos | R$ 925.112,00 | Vincular EAP R03 e carta R02 com anexo R03. |
| Pretech | R$ 740.000,00 | Detalhamento `EQU R0` soma R$ 778.077,50; PDF tem parcelas de escopo parcial que somam R$ 231.520,00. |
| Petry Fundações | R$ 868.187,22 | CNPJ ausente no mapa; preservar composição e faturamento direto. |
| União Fundações | R$ 598.500,00 | Somente no Resumo; a aba Proponentes informa execução apenas de perfuração. CNPJ ausente. |

Esses totais não representam pacotes necessariamente comparáveis. Na Pretech, preservar valores do quadro, revisões da negociação e composição com serviços/materiais complementares: não contar três totais como três contratos. A aba de referências menciona Fase 6 e valor por metro de estaca; sem documento original, manter como referência histórica, não como compra comprovada.

Na aba `Proponentes`, **Aude e Maggi** estão marcadas como tendo apresentado proposta, mas não possuem preço nas abas lidas. São documentos a localizar, não preços a inventar. Dual D, Campanelli, Engecap e Engkoch estão marcadas como declinantes/não apresentaram proposta. Essa informação pode alimentar o histórico de participação dos fornecedores.

Também foram classificados:

- `MCtba-F7_EAP FUNDAÇÃO_R02`: quantitativos de referência e preços não preenchidos; é baseline, apesar dos zeros calculados. Cabeçalho indica revisão 03.
- `MCtba-F7_EAP FUNDAÇÃO_R03`: composição JB, mesma representação do anexo da carta; não duplicar.
- Monopólio em PDF e Sheets: mesma EAP/total, com divergência frente ao mapa; preservar vínculo e revisão.
- Memorial de 19 páginas: escopo da Demercado para armazéns 08/09 e ampliação do 04, sem preço de fornecedor.
- Cartão de assinaturas: comprova vínculo cadastral Demercado/JB e cita contrato 35.552.025; o próprio contrato não está listado na pasta.

## O que já existe no Google e não aparece no consolidado local

A subpasta PLANO contém a [base do aplicativo](https://docs.google.com/spreadsheets/d/1PLuAqtKz2dscfSfAekfEGTAZTAzT8m0R0FfaJ9PmSnc/edit). A leitura por IDs preenchidos encontrou:

| Conteúdo | Quantidade |
| --- | ---: |
| Importações | 2 |
| Equalizações | 4 |
| Registros de proposta | 12 |
| Linhas de preço | 78 — 43 cotadas e 35 não cotadas |
| Pendências | 19 |

As importações são **Wi-Fi da casa de bombas** e **monitoramento de utilities/água**, ambas de Curitiba. Utilities foi dividido em equipamentos, mensalidade e mão de obra; os 12 registros de proposta não equivalem a 12 contratos independentes. Esses conjuntos já estão na base Google, porém ausentes do consolidado local.

As fontes [Wi-Fi](https://docs.google.com/spreadsheets/d/1iOz9t7xjk19UxCkEP7t-v1yzCOk6HMTR4Qfp9mfCNF4/edit) e [utilities](https://docs.google.com/spreadsheets/d/1TaqCghQpf2xmNWhiSX0u7orW4Sw_9lum8Qiid9rv_I4/edit) responderam HTTP 401 na tentativa de leitura. Assim, foi possível conferir os registros na base, mas não revisar integralmente os originais.

Antes de conciliar: as quatro equalizações estão sem CNPJ da empresa; há proposta de Wi-Fi sem CNPJ de fornecedor. Nas mensalidades, os totais declarados equivalem a 12 vezes os valores calculados, sinalizando perda do período no processamento. Eletrobarras aparece em duas colunas de mão de obra com R$ 2.200,00: verificar o vínculo antes de somar. Não reimportar automaticamente esses conjuntos.

## Documentos que não devem virar novas cotações

- **OC Fabesul 034925:** 48 bobinas × R$ 13,99 = R$ 671,52, Curitiba/Demercado. Vincular à proposta 7503081 já consolidada. É ordem de compra, sem comprovação de pagamento.
- **Modelo de equalização:** duas abas CR/Demercado sem fornecedores ou preços preenchidos. Zeros de fórmulas não constituem cotação.
- **Memorial, baseline e cartão de assinaturas:** são referências de escopo/cadastro, sem novos preços.
- **Representações e revisões:** manter fonte, fornecedor, proposta e revisão relacionados; não contar o mesmo documento comercial novamente a cada PDF, planilha ou mapa.

## Resultado e limites

Os 45 arquivos diretamente listados estão cruzados com o histórico e classificados no [inventário atualizado](../dados/inventario_drive.json). Restam trabalhos concretos: incorporar 31 cotações candidatas por escopo/revisão, criar histórico dos 28 preços contratuais, vincular a OC existente e conciliar Wi-Fi/utilities com a base Google.

Não há acesso aos dois originais restritos; faltam as propostas marcadas como recebidas de Aude/Maggi e o contrato JB citado no cartão. Portanto, a listagem foi percorrida integralmente, mas isso não significa que toda proposta mencionada nos documentos esteja disponível ou que todas as linhas de Engenharia já estejam extraídas e validadas.
