# Modelo de escopo — preenchimento no sistema e geração de Slides

Análise em 09/09/2026. Estado: primeira implementação local concluída; publicação e validação no Google Apps Script real pendentes.

## Implementação entregue em 09/09/2026

**Ajuste de identidade solicitado pelo usuário:** o gerador passou a consumir `DS_CN`, a mesma paleta e tipografia usadas em `ExportarSlides.gs` e `Apresentacao_Conselho.gs`. Títulos em Montserrat, corpo em Open Sans, capa azul noturna com linha de destaque, cabeçalhos claros com acento azul e tabelas com cabeçalho institucional, linhas alternadas e rodapé suave. O exemplo fornecido continua orientando o conteúdo, as fotos e as seções; o fundo gráfico extraído permanece como referência, mas não é aplicado pelo gerador atual.

- Aba **Escopos**, também acessível por `?page=escopos`, com identificação, localização, objetivo, vistoria, grupos de serviços, fotos, itens para cotação e condições.
- Rascunhos salvos em revisões imutáveis; salvamento concorrente de uma versão antiga é recusado. Geração repetida da mesma revisão retorna os arquivos já registrados.
- Imagem e endereço padrão de Curitiba extraídos da referência. Os demais Megas recebem seu padrão pelo próprio formulário; nenhum endereço ou imagem foi inventado para eles.
- Upload de PNG/JPEG, associação a grupos, ordenação de fotos/serviços/itens e duplicação de grupos. Uma linha comercial pode cobrir vários grupos de serviços.
- Slides e PDF com a marca original, paginação de textos e tabelas, fotos agrupadas e identificação de revisão. Preços ficam em branco para preenchimento pelo fornecedor.
- Quatro abas novas, declaradas no schema v9: `Escopos`, `EscopoArquivos`, `EscopoImagens` e `EscopoMegas`. São criadas de forma aditiva ao primeiro acesso à funcionalidade; `setupBaseDeDados()` continua disponível para migração integral.
- Limites explícitos desta entrega: 30 grupos, 100 itens, 40 fotos, 5 MB por imagem, 45 mil caracteres no conteúdo serializado e 45 páginas por apresentação. Escopos que excedam esses limites são recusados com mensagem, sem truncamento.

Arquivos: `app/Escopos.gs` (persistência e API), `app/EscopoSlides.gs` (paginação e desenho), `app/EscopoInterface.html` (formulário), `app/EscopoAssets.html` (recursos originais em base64).

Validação local: suíte `npm test`, testes de persistência/concorrência/recuperação de falhas/paginação, Chrome com os serviços do Google simulados e inspeção visual de renderização local. A execução real, permissões de Drive e fidelidade final do PDF no serviço do Google precisam ser conferidas após publicação.

Diferenças deliberadas da referência: detalhes opcionais aparecem ao lado da imagem geral sem editor de setas; legendas individuais recebem páginas de texto adicionais para manter as fotos grandes; as colunas de preço ficam vazias; o rodapé identifica escopo e revisão. Textos das condições são preenchidos pelo responsável, sem inserir requisitos elétricos em outras contratações. O vínculo com a equalização, o disparo de convites e o portal continuam posteriores.

### Origem dos recursos visuais

Foram extraídos da exportação PPTX da apresentação fornecida: `ppt/media/image1.png` (logo branca), `image3.png` (fundo institucional) e `image8.png` (imagem aérea de Curitiba). Os bytes originais estão preservados no arquivo de recursos, sem copiar textos, notas ou formas da apresentação. Isso elimina a herança do texto residual observado no PDF. O PPTX identifica Arial nos textos inspecionados.

Referências técnicas consultadas: [inserção de imagens e formas em Slides](https://developers.google.com/apps-script/reference/slides/slide) e [estilização de formas](https://developers.google.com/apps-script/reference/slides/shape). As caixas de imagem preservam a proporção por meio da sobrecarga de `insertImage` com posição e dimensões.

Fonte: [apresentação de escopo fornecida pelo usuário](https://docs.google.com/presentation/d/1c4MyR9at-mLZiV29eBdlZssFi-pR4MXhhpFMPMAJW5I/edit). Foi baixada uma cópia em PDF e foram lidos os textos e inspecionadas visualmente todas as 24 páginas. O PDF tem páginas de 720 × 405 pontos, proporção 16:9. A análise não inspecionou os objetos editáveis, notas ou layouts mestres do Slides original.

O exemplo trata de adequações elétricas em quadros de distribuição, shafts e DGs de comunicação, nos módulos 01 e 02 do Armazém 1 do Mega Curitiba. Seu conteúdo técnico é específico dessa solicitação; não é um padrão automático para qualquer serviço.

## Decisão confirmada

O usuário preenche o escopo **no sistema** e o sistema gera o **Google Slides**. O documento deve reproduzir a organização do exemplo. A imagem padrão do empreendimento deve ser reutilizável; as fotografias da intervenção devem ser cadastradas em cada escopo.

Este documento detalha a primeira entrega da [proposta de convite com escopo](PROPOSTA_CONVITE_COM_ESCOPO.md). Convites e portal são entregas posteriores.

## Inventário completo da referência

| Páginas | Conteúdo observado | Consequência para o gerador |
|---|---|---|
| 1 | Capa institucional com título que combina serviço, armazém, módulos e Mega | Compor título com dados da solicitação; permitir revisão do título pelo usuário |
| 2 | Localização: imagem aérea à direita, nome e endereço abaixo; grande área branca à esquerda | Usar cadastro do empreendimento; não exigir uma segunda imagem |
| 3 | Localização detalhada: mesma imagem geral, imagem aproximada à esquerda e seta ligando as duas | Oferecer detalhe opcional da área de intervenção e indicação visual cadastrada |
| 4 | Objetivo em texto corrido | Campo próprio de objetivo |
| 5 | Resumo da vistoria em dois parágrafos | Campo próprio para situação encontrada, separado do objetivo e dos serviços |
| 6 | Divisória institucional “Serviços a Executar” | Página de abertura de seção |
| 7 | Módulo 01, quadro elétrico e shaft técnico, térreo: 11 tópicos | Grupo de serviços identificado por módulo, ambiente e pavimento |
| 8 | Módulo 01, DG de comunicação, térreo: 3 tópicos | Suportar grupos curtos, sem forçar preenchimento de toda a página |
| 9 | Módulo 02, quadro elétrico e shaft técnico, térreo: 11 tópicos | Permitir duplicar um grupo e editar seu local e conteúdo |
| 10 | Módulo 02, DG de comunicação, térreo: 3 tópicos | Manter vínculo entre grupo e sua localização |
| 11 | Módulo 02, quadro elétrico e shaft técnico, mezanino: 11 tópicos | Diferenciar pavimentos do mesmo módulo |
| 12 | Registro fotográfico do QD Módulo 01: 3 fotos verticais | Composição com três fotos |
| 13 | Registro fotográfico do QD Módulo 02: 3 fotos verticais | Composição com três fotos |
| 14 | Registro fotográfico dos shafts: 4 fotos verticais | Composição com quatro fotos |
| 15 | Registro fotográfico do QD Mezanino 02: 2 fotos verticais | Composição com duas fotos centralizadas |
| 16 | Divisória institucional “Proposta” | Abertura da parte destinada à cotação |
| 17–21 | Cinco tabelas “Escopo - Orientativo”, com três serviços cada | Gerar tabelas paginadas a partir dos itens estruturados |
| 22 | Divisória institucional “Considerações” | Abertura das condições de execução |
| 23 | Nove tópicos sobre execução, documentação, materiais, testes, resíduos e limpeza | Condições selecionáveis e editáveis conforme a contratação |
| 24 | Aviso sobre caráter orientativo do escopo e visita técnica prévia | Texto de encerramento configurável e condição de visita explícita |

As 24 páginas são o tamanho deste exemplo, não um número fixo para o produto.

## Padrão visual observado

- Capa e divisórias: fundo azul com grafismo institucional grande, título branco e marca branca no canto inferior esquerdo.
- Páginas de conteúdo: fundo branco, faixa azul escura no topo, título branco à esquerda e marca branca à direita.
- Textos: corpo preto, títulos dos grupos em negrito e listas com marcadores; referência visual simples, sem cartões ou efeitos da interface do sistema.
- Fotos: área ampla abaixo do cabeçalho, alinhamento por página e espaçamento entre imagens. O exemplo usa grupos de duas, três ou quatro fotos verticais, sem legendas individuais externas; parte das fotos tem data incorporada na imagem.
- Tabelas: cabeçalho e faixa de total azuis, letras brancas nessas faixas, corpo branco, linhas finas cinza. Descrição ocupa a maior largura; quantidades, unidades e valores ficam nas colunas menores.
- A apresentação repete a mesma identidade em todas as seções. A fonte exata, as cores exatas e os recursos originais deverão ser extraídos ou conferidos no template editável antes da implementação visual.

## O que o usuário deve preencher

| Bloco da tela | Dados e ações propostos | Resultado no Slides |
|---|---|---|
| Identificação | Título, empreendimento, armazém, módulos/áreas e responsável | Capa e identificação da versão |
| Localização | Conferir endereço e imagem padrão carregados pelo Mega; adicionar imagem de detalhe e indicação da intervenção, se necessário | Uma ou mais páginas de localização |
| Contexto | Objetivo e resumo da vistoria em campos separados | Páginas de texto |
| Serviços | Adicionar grupos por área/módulo/pavimento; ordenar tópicos; duplicar e ajustar grupos semelhantes | Páginas “Serviços a Executar” |
| Fotografias | Enviar fotos, associar a um ou mais grupos, escolher ordem e título do conjunto; legenda opcional | Registros fotográficos paginados |
| Itens para cotação | Descrição comercial/técnica, quantidade, unidade e referência opcional; vincular aos serviços cobertos | Tabelas “Escopo - Orientativo” |
| Considerações | Selecionar textos de referência, editar condições específicas e indicar se a visita prévia é exigida | Considerações e aviso final |
| Revisão e geração | Revisar conteúdo, salvar rascunho e gerar apresentação; registrar versão e arquivo | Link do Slides e, em etapa prevista, PDF da mesma versão |

O usuário organiza conteúdo e imagens; o sistema decide posicionamento e quebra de páginas. Não é necessário arrastar caixas manualmente para conseguir um documento completo.

## Imagens padrão e fotos da solicitação

**Cadastro do empreendimento:** nome oficial, endereço, imagem aérea/panorâmica padrão e eventuais imagens de referência de seus armazéns. A seleção do Mega deve carregar esses dados automaticamente. O exemplo confirma apenas Curitiba; não fornece imagens de todos os empreendimentos.

**Dados do escopo:** imagem de detalhe da intervenção, grupos de fotografias, títulos, legendas opcionais, ordem e vínculo com locais/serviços. Uma imagem de um shaft pode ser relevante para mais de um grupo, sem necessidade de duplicar o arquivo.

**Regras propostas:**

- Fotos devem manter proporção e orientação; evitar recorte automático que esconda o defeito ou equipamento.
- Para fotos verticais, reproduzir as composições de duas, três e quatro imagens vistas no exemplo. Para uma foto ou imagens horizontais, prever variações de layout e validar a legibilidade.
- Quantidades maiores geram páginas adicionais com o mesmo título de grupo e indicação de continuação.
- Imagem padrão ausente deve ser indicada no formulário para correção; não substituir por imagem de outro Mega.
- Arquivo de imagem indisponível deve produzir erro identificável; não gerar silenciosamente uma versão final com foto faltante.
- A revisão deve guardar a referência da versão dos recursos utilizados. Trocar a foto padrão no cadastro não pode alterar retroativamente um documento já emitido.

## Serviços detalhados e tabela de cotação

O exemplo tem **duas representações complementares**: tópicos que explicam a execução e linhas que organizam a proposta. Não há correspondência obrigatória de um tópico para uma linha: uma linha comercial pode reunir várias ações.

Por isso, o modelo deve manter grupos de serviços e itens de cotação relacionados, permitindo conferir cobertura. A EAP existente pode sustentar os itens; os textos detalhados e os vínculos precisam de persistência própria ou extensão explícita do modelo atual.

As tabelas observadas têm as colunas **Item, Qtde, Unidade, Valor Unitário e Valor Total**. São 15 linhas no total, todas com quantidade 1 e unidade `vb`, distribuídas em cinco páginas; esses valores pertencem ao exemplo e não devem ser padrões obrigatórios. Cada página termina com uma faixa “Total”.

Os preços aparecem como `R$ 0,00` no exemplo. Para o sistema, a proposta é preservar as colunas destinadas ao fornecedor, mas deixá-las vazias e identificadas como “a preencher pelo fornecedor”. A ausência de preço não deve virar preço zero na base, no histórico ou em cálculos. O total também fica sem valor enquanto não houver proposta. Essa é uma melhoria proposta sobre a referência, não um comportamento observado nela.

Repetir o cabeçalho em cada página e ajustar a quantidade de linhas à extensão das descrições. Três linhas por página é uma característica deste exemplo; nunca truncar uma descrição para cumprir esse número. Definir claramente subtotal de página e total geral caso o documento venha a receber preços em outra etapa.

## Pontos de atenção encontrados no exemplo

1. **Texto residual na página 3:** a extração do PDF contém uma referência a “Estacionamento Hangar Vip” e um endereço em São José dos Pinhais que não aparecem na renderização visível. A posição/origem desse texto não foi determinada. O template deve ser limpo antes do reuso para impedir que conteúdo de outro local permaneça nos arquivos gerados.
2. **Cobertura entre serviços e tabela:** os tópicos dos quadros incluem testes. A tabela da página 18 inclui uma linha de testes e organização final sem delimitação explícita de módulo; não há linha equivalente explícita no bloco final do módulo 02. Não é possível concluir pelo documento se a linha é geral. O formulário deve permitir indicar a cobertura dos itens e destacar serviços sem correspondência para revisão.
3. **Textos técnicos específicos:** os requisitos elétricos da página 23 são conteúdo da referência, não uma validação de suficiência técnica ou normativa. Em outros serviços, os textos precisam ser escolhidos e revisados pelo responsável.
4. **Visita técnica:** a última página a apresenta como imprescindível. Esse requisito deve ser um dado do escopo, coerente com o aviso final e, futuramente, com o convite.
5. **Campos adicionais:** prazo de resposta, responsável e revisão explícita são requisitos propostos para o sistema; não foram identificados como campos dedicados no exemplo. Não apresentá-los como elementos já existentes no modelo visual recebido.

## Caminho de implementação proposto

1. Definir persistência do rascunho, grupos de serviços, itens para cotação, fotos, condições e versões, mantendo vínculo futuro com a equalização.
2. Cadastrar imagem e endereço por empreendimento e preparar um template institucional limpo. A apresentação de referência deve ser preservada como exemplo, sem receber substituições de conteúdo.
3. Construir o formulário com os blocos acima, salvamento e revisão de cobertura entre serviços e itens.
4. Criar gerador de escopo independente das propostas de fornecedores. Avaliar reuso dos auxiliares de `app/ExportarSlides.gs`, sem assumir que o layout de equalização atende a esta apresentação.
5. Gerar capa, localização, textos, serviços, fotos, tabelas e condições com paginação variável; registrar revisão, data de geração e ID do arquivo.
6. Validar com o caso de Curitiba e com variações de quantidade de fotos, extensão de textos, quantidade de itens e ausência de dados opcionais.

Antes de implementar a geração, conferir o template editável e os recursos originais para definir como preservar fundo, marca e estilos. A análise do PDF permite especificar o resultado visual, mas não demonstra a estrutura interna do Google Slides.

## Aceite da primeira entrega

- Criar o escopo sem cadastrar fornecedor ou preço e retomar um rascunho salvo.
- Selecionar o Mega e carregar sua imagem e endereço corretos.
- Gerar todas as seções aplicáveis na ordem da referência, com conteúdo vindo do cadastro.
- Organizar fotografias por grupo e gerar novas páginas sem distorção nem perda de imagem.
- Manter consistência entre local, tópicos de serviço, fotos e linhas para cotação.
- Exportar as tabelas sem inventar preços ou perder descrições, quantidades e unidades.
- Não herdar conteúdo específico do exemplo em um novo escopo vazio.
- Preservar documentos de revisões anteriores e identificar qual versão originou cada arquivo.
- Validar visualmente os Slides e seu PDF, incluindo textos longos e múltiplas páginas de tabelas e fotos.

Nenhum envio a fornecedor é necessário para validar essa primeira entrega.
