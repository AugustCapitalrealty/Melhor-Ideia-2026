# Histórico de orçamentos dos Megas

Consolidação local de **21 orçamentos, 7 fornecedores e 274 linhas**, a partir dos PDFs da [pasta compartilhada](https://drive.google.com/drive/folders/1O3ZhuqfzlHpnsrORdY9T3-w2Otb7aF2F). Inventário consultado em 05/09/2026. Estes arquivos ainda não foram importados na base Google do aplicativo.

Abra [historico_orcamentos.xlsx](historico_orcamentos.xlsx) para consultar e filtrar. A planilha contém resumo por Mega, histórico por linha e documentos com evidências e links para os PDFs. Também estão disponíveis [CSV](historico_orcamentos.csv) e [JSON](historico_orcamentos.json). Prefira XLSX para preservar códigos com zeros à esquerda; na importação manual do CSV, defina códigos e CNPJs como texto.

| Mega | Orçamentos | Linhas | Com preço unitário | Componentes globais |
| --- | ---: | ---: | ---: | ---: |
| Curitiba / PR | 8 | 73 | 73 | 0 |
| Itajaí / SC | 8 | 133 | 133 | 0 |
| Esteio / RS | 5 | 68 | 65 | 3 |
| Total | 21 | 274 | 271 | 3 |

## Extrações e vínculos

Foram reaproveitados os 9 documentos e 137 linhas de `DadosCanaveral.gs` e `DadosBasePapeis.gs`. As cinco novas extrações acrescentam 12 documentos e 137 linhas:

| Extração | Documentos | Linhas | Mega / empresa |
| --- | ---: | ---: | --- |
| [S. Vargas](../app/DadosSVargas.gs) | 3 | 28 | Curitiba / Demercado |
| [Litoral](../app/DadosLitoral.gs) | 4 | 75 | Itajaí / Capital Realty |
| [Fabesul](../app/DadosFabesul.gs) | 3 | 12 | Curitiba / Demercado |
| [Contabilista](../app/DadosContabilista.gs) | 1 | 19 | Curitiba / Demercado |
| [ADS](../app/DadosADS.gs) | 1 | 3 | Esteio / Capital Realty |

Os vínculos de S. Vargas, Litoral, Fabesul e Contabilista foram confirmados pelo usuário. A ADS foi vinculada pela equalização `EQU_20260202-MEsteio_ArmazémB_Piso.pdf`, que coincide em data, contato, e-mail, prazo e total de R$ 10.000; ela fornece também o CNPJ do fornecedor. A revisão indicada pela equalização (REV02) difere do nome da proposta (REV01), e essa diferença permanece registrada.

A empresa é identificada por documento: Curitiba possui documentos de Capital Realty e de Demercado. A UF corresponde ao empreendimento, independentemente da localização do fornecedor. Cada linha tem identidade formada pelo ID do PDF e posição do item, preservando diferentes cotações do mesmo produto.

## Limites para comparar preços

- São valores **cotados**, sem inferir contratação, pagamento ou economia.
- As 79 linhas da Base Papéis não informam unidade. Permanecem com `unidade_pendente=true`; é necessário confirmar unidade e embalagem antes de comparar fornecedores.
- Os 3 componentes da ADS são valores globais. Quantidade, unidade e preço unitário permanecem ausentes; não se inferiu preço por metro quadrado.
- Em 31 linhas da Litoral, quantidade × unitário impresso difere em centavos do total impresso. Ambos foram preservados; o desconto não foi aplicado novamente. A soma dos totais das linhas confere com o total de cada documento.
- Códigos genéricos como `UN` ou `KG` não identificam um produto. Mesmo descrições iguais exigem validação de embalagem, especificação e escopo antes de agrupar preços.

## Cobertura do Drive

O [inventário por arquivo](inventario_drive.json) registra as 37 entradas da pasta principal: 21 PDFs de orçamento consolidados, 11 PDFs de equalização, 1 contrato, 1 ordem de compra, 1 modelo Google Sheets e 2 subpastas. A equalização da ADS foi usada como evidência complementar, sem repetir seus valores no histórico.

A auditoria posterior percorreu também Engenharia (9 arquivos) e PLANO (1 base Google), totalizando **45 arquivos e duas subpastas**. Todos receberam classificação. Equalizações, documentos de Engenharia, contrato e ordem de compra ainda não integram este consolidado de 21 orçamentos; a base Google contém outros conjuntos já importados que exigem conciliação.

A [revisão adicional de serviços e Engenharia](../docs/REVISAO_ACERVO_SERVICOS.md) identifica propostas de PMOC, lavagem de piso, society, reservatório, bicicletário, fundações e mais cotações de materiais. Ela registra valores, diferenças de escopo e possíveis duplicatas; essas propostas ainda não integram os arquivos consolidados acima.

A [auditoria completa](../docs/AUDITORIA_COBERTURA_COMPLETA.md) e sua [planilha de pendências por arquivo](auditoria_cobertura.xlsx) ampliam essa revisão: **31 cotações candidatas ausentes**, 28 preços contratuais da Canaveral e Wi-Fi/utilities já presentes no Google, mas ausentes do consolidado local. Duas fontes referenciadas exigem acesso. Os números representam tipos diferentes de registro e não devem ser somados como compras.

Para reproduzir a planilha de auditoria a partir do retrato [auditoria_cobertura.json](auditoria_cobertura.json), execute `python3 tools/gerar-planilha-cobertura.py`. Esse comando não atualiza o Drive nem o histórico de preços.

## Reprodução e integração

Na raiz do repositório, com Node.js e Python 3 com `openpyxl` instalado:

```sh
node tools/consolidar-acervo.cjs
python3 tools/gerar-planilha-acervo.py
```

A consolidação valida a identidade única dos PDFs, os vínculos de empresa e empreendimento e a soma dos itens de cada orçamento. Os comandos geram apenas arquivos locais e não chamam importadores ou serviços do Google. O inventário é um retrato da consulta ao Drive, não é atualizado por esses comandos.

Para levar o acervo ao aplicativo, ainda é necessário adequar a importação e a consulta: preservar a empresa por proposta, evitar duplicação em reimportações e manter cotações avulsas distintas nas séries históricas. Os novos módulos contêm dados e evidências; não acrescentam funções de importação automática.
