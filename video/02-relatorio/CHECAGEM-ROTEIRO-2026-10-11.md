# Checagem independente do roteiro — 11/10/2026

**REPROVADO na versão atual para gravação e render final.**
Há contradições factuais e cenas com dados pessoais; as correções abaixo permitem nova checagem.

## 2. Conferência frase a frase

Checagem em 11/10/2026, fuso America/Sao_Paulo. Somente leitura das fontes. A única escrita desta sessão é este parecer. Roteiro, locução, código, imagens e histórico não foram alterados. Não houve geração de voz, commit ou push.

O texto falado do roteiro coincide com a locução. A única diferença é a retirada dos colchetes de X, Y e N no capítulo 7. Referências: `video/02-relatorio/ROTEIRO.md:30–123` e `video/02-relatorio/LOCUCAO-elevenlabs.md:15–43`. Os números de linha abaixo correspondem aos arquivos abertos nesta checagem.

**Convenção para fontes sem linhas:** PNG foi aberto visualmente e é citado pelo arquivo e pela região. A linha do gerador identifica o texto do slide, mas não substitui a imagem. Para os dois PDFs locais abertos, a numeração é a da extração em memória por `pdftotext -layout -enc UTF-8 "arquivo.pdf" -`, contando desde 1, inclusive linhas vazias. Nenhum TXT foi gravado.

**PDF-PMOC** significa `G:/Meu Drive/MELHOR IDEIA 2026/MCtba - Mapa de Equalização Manut Preventiva + Emissão de PMOC_v02.pdf`, página 1. Foi aberto integralmente por extração. **Regulamento** significa `Regulamento Concurso de Melhor Ideia 2026.pdf`, versão 01 de 12/12/2025, também aberto integralmente.

✅ confere no alcance indicado. ⚠ exagera, simplifica ou depende de confirmação. ❌ não tem lastro suficiente para a formulação ou contradiz a fonte. Um ✅ documental não equivale a uma auditoria da base ao vivo.

| Capítulo | Frase | Fonte (arquivo:linha) | Veredito | Correção |
| :--- | :--- | :--- | :--- | :--- |
| 1 · L15 | “Na empresa, o mesmo pedido volta do fornecedor de jeitos diferentes.” | `docs/BASE_DE_CONHECIMENTO.md:394–401`, `:543–550`; PDF-PMOC:42–50 | ⚠ Os casos mostram ofertas diferentes. Não demonstram frequência em toda a empresa nem que os pedidos originais eram iguais. | Abrir com o caso: “Três propostas de ar-condicionado.” |
| 1 · L15 | “Num contrato de manutenção de ar-condicionado, três empresas cotaram o mesmo item como uma verba só.” | `docs/BASE_DE_CONHECIMENTO.md:394–401`; PDF-PMOC:3,16,74–76 | ⚠ Três proponentes e uma linha de verba anual conferem. A fonte é uma cotação, não prova de contrato executado. O valor foi ajustado para doze meses. | “No mesmo item cotado como verba anual.” |
| 1 · L15 | “Uma fazia duas visitas por ano, outra três, outra doze.” | `docs/BASE_DE_CONHECIMENTO.md:397–401`; PDF-PMOC:42–50,70 | ⚠ Os números conferem. “Fazia” afirma execução. A fonte registra o que cada proposta oferecia. Doze visitas não são automaticamente melhor atendimento. | “Duas, três e doze visitas por ano.” Vincular à palavra “propostas”. |
| 1 · L15 | “E uma delas não emitia o laudo que a lei exige.” | `docs/BASE_DE_CONHECIMENTO.md:401`; PDF-PMOC:45–49,64,72; [Lei 13.589/2018, art. 1º](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13589.htm), linhas 9–10 da página aberta | ❌ A base repete a conclusão jurídica, mas não a demonstra. O art. 1º exige o PMOC; isso não sustenta sozinho a expressão genérica “o laudo que a lei exige”. O documento distingue laudo simples de laudo PMOC com ART. | “Uma proposta não incluía o laudo com responsabilidade técnica previsto no pedido.” |
| 1 · L15 | “Em outra contratação, a mão de obra veio com um preço fechado, sem abrir o que estava dentro: infraestrutura, passagem de cabos, instalação do painel.” | `docs/BASE_DE_CONHECIMENTO.md:1341–1349` | ❌ A própria fonte diz “item de verba com escopo detalhado”. Os três serviços estão descritos. Faltam preços separados, não a descrição do conteúdo. | “Em outro caso, a mão de obra veio fechada. Infraestrutura, passagem de cabos e instalação do painel estavam descritas, mas sem preços separados.” |
| 1 · L15 | “Numa obra de fundação, cada proponente usou a sua própria unidade para o mesmo serviço.” | `docs/BASE_DE_CONHECIMENTO.md:547–550`; `video/02-relatorio/ROTEIRO.md:17,41` | ❌ “Cada” exagera: há proponentes com a mesma unidade. A cena agrava o erro ao juntar VB, KG e M³ num mesmo serviço. Posicionamento da armadura varia entre VB e KG. Bota-fora varia entre VB e M³. | “Na fundação, um mesmo item apareceu em verba e quilos.” Na tela, usar apenas o item posicionamento da armadura e VB × KG. |
| 1 · L15 | “Quando o escopo deixa margem, cada fornecedor entende de um jeito, e a comparação deixa de ser justa.” | `docs/BASE_DE_CONHECIMENTO.md:403,543–552`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:48–50` | ⚠ É interpretação plausível. As respostas não provam a causa exclusiva. Preço fechado com subitens descritivos pode ser escolha válida. | “Esses casos mostram o que precisa ficar explícito antes de comparar propostas.” |
| 1 · L15 | “O problema nasce no escopo.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:48–51,64–65` | ⚠ É a tese do projeto, não uma causalidade comprovada para todo problema de contratação. | Usar a conclusão delimitada da linha anterior. |
| 2 · L19 | “O comitê aprovou uma ideia para avaliar prestadores de serviço, e a avaliação foi construída.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:35–46`; `docs/RESPOSTA_AO_COMITE.md:17`; `docs/APRESENTACAO_COMITE_2026-09-08.md:21–29`; `app/Avaliacao.gs:43–54,101–105` | ✅ A aprovação também é premissa expressa desta solicitação. A construção tem lastro documental e código. Não significa integração com Fluig/RM. | Manter, com frase mais curta. Ressalva: o e-mail original do comitê não foi aberto. |
| 2 · L19 | “Mas os documentos reais mostraram a causa antes: cada pedido saía de um jeito, e o fornecedor respondia ao que entendia.” | `docs/BASE_DE_CONHECIMENTO.md:394–403,543–552`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:48–51` | ⚠ Os documentos mostram divergências nas ofertas. Não foi aberto um conjunto de pedidos originais que comprove “cada pedido saía de um jeito”. “Antes” confunde etapa do processo com cronologia. | “A análise dos documentos mostrou também diferenças no que os fornecedores ofereciam.” |
| 2 · L19 | “Então a ideia cresceu na direção da causa: começar pelo escopo.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:43–55`; `docs/HISTORICO.md:453–455` | ⚠ A evolução está documentada. A causa exclusiva não está demonstrada. | “A ideia cresceu: além de avaliar depois, organizar melhor o escopo antes da contratação.” |
| 3 · L23 | “Hoje, quem contrata monta o escopo uma vez, no sistema.” | `app/EscopoInterface.html:45–59`; `docs/avaliacao-escopo-2026-10-02/RELATORIO_COMPRADOR.md:79–80` | ⚠ Um cadastro alimenta as saídas. “Uma vez” não pode significar ausência de revisão ou retrabalho. | “Hoje, o escopo é montado no sistema.” |
| 3 · L23 | “Os serviços de cada local, uma atividade por linha.” | `app/EscopoInterface.html:55`; `video/01-previa-20s/midia/real/E01-escopo-servicos-fotos.png`, campo de serviços | ✅ A orientação e o exemplo estão disponíveis. | Manter ou completar o verbo para facilitar a fala. |
| 3 · L23 | “As fotos ficam junto do serviço que descrevem.” | `docs/HISTORICO.md:228,242–243,280`; `app/EscopoInterface.html:56`; E01 e `E03-slides-registro-foto.png`, abertos | ⚠ No cadastro, estão vinculadas ao grupo. No deck, ficam no slide seguinte ao texto do grupo. As imagens mostradas são plantas, não fotografias de vistoria. | “As imagens ficam vinculadas ao serviço.” |
| 3 · L23 | “A EAP traz quantidade, unidade e marca de referência.” | `app/EscopoInterface.html:57`; `video/01-previa-20s/midia/real/E02-escopo-eap.png`, itens 1.2–1.7 | ✅ Conferido. Há itens sem marca, como mão de obra. A frase descreve os campos, não preenchimento obrigatório de toda marca. | Na voz, “A lista de itens traz quantidade, unidade e marca de referência.” |
| 3 · L23 | “Com um clique saem três documentos coerentes: a apresentação, o PDF e a planilha para o fornecedor.” | `app/EscopoInterface.html:59,209,262–272`; `video/01-previa-20s/midia/real/E05-escopo-revisoes.png`, barra de botões | ❌ Há dois comandos. Um gera Slides/PDF; outro gera a planilha. Não existe emissão única dos três. | “Do mesmo cadastro saem apresentação, PDF e planilha, gerados em etapas separadas.” |
| 3 · L23 | “A mesma EAP, a mesma revisão.” | `docs/avaliacao-escopo-2026-10-02/RELATORIO_COMPRADOR.md:80,121–132`; `app/Escopos.gs:273–282`; `app/EscopoPlanilha.gs:43–45` | ❌ O cadastro é comum, mas a igualdade de revisão não é garantida entre emissões. O teste documentou planilha R2 junto com deck R1. O exemplo de Itajaí está na R9 nos três artefatos; isso não prova a regra universal. | Retirar a garantia. Se necessário: “Neste exemplo, os três estão na revisão nove.” |
| 4 · L27 | “E o próximo escopo já começa pronto.” | `docs/HISTORICO.md:333`; `app/Escopos.gs:175–185` | ⚠ Começa parcialmente preenchido. Fotos, identificação, contato e prazos ficam em branco. A função não prova ganho de tempo medido. | “O próximo escopo pode partir de uma base.” |
| 4 · L27 | “Usando um escopo emitido como base, vêm os serviços, a EAP, as inclusões, as exclusões e o aceite.” | `docs/HISTORICO.md:333`; `app/Escopos.gs:178–184` | ✅ Esses campos vêm. A lista é parcial: também há objetivo, considerações, visita e aviso. | Manter a lista como exemplos, sem dizer “só estes”. |
| 4 · L27 | “Fica em branco só o que é do lugar e da data.” | `docs/HISTORICO.md:333`; `app/Escopos.gs:180–181` | ⚠ A fórmula esconde que título, fotos e contato precisam ser refeitos. Pode sugerir escopo pronto para emissão. | “Título, local, fotos, contato e prazos precisam ser preenchidos para a nova contratação.” |
| 5 · L31 | “Já está em uso.” | `video/capturas/2026-10-11/C01-escopos-lista.png`, cartões com selo Emitido; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:2–9,38–46` | ✅ Há escopos reais e arquivos emitidos. Isso não comprova envio ou execução do contrato. | Manter, preferindo “Já há escopos emitidos”. |
| 5 · L31 | “Começou pelos três Megas: o escopo do sistema de incêndio do prédio de apoio de Itajaí chegou à revisão nove, e cada revisão ficou registrada.” | `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:228`; `docs/HISTORICO.md:453–455`; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:2–45`; C01 e E05 | ⚠ R9 e registros de R4 a R9 confirmados. “Três Megas” consta dos resumos, mas Esteio não aparece no recorte aberto. Não foi possível confirmar Esteio na base. R9 não equivale a nove arquivos gerados. | Até prova de Esteio: “Já há escopos emitidos em Curitiba e Itajaí.” Separar a frase de R9 e dizer que a tela registra R4 a R9. |
| 5 · L31 | “O mesmo padrão serve para qualquer área da empresa que contrata.” | `docs/HISTORICO.md:453–455`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:149` | ⚠ É proposta de alcance. Não há validação de adequação em toda área. | “A proposta é levar esse padrão a toda área da empresa que contrata.” |
| 6 · L35 | “Quem usa pediu, e o sistema mudou em dias: a mesma fonte em todos os slides, as fotos junto da descrição, o texto justificado, o aviso padrão do Facilities e os escopos base.” | `docs/HISTORICO.md:226–243,251–268,310–324,333` | ⚠ Os cinco pedidos têm lastro. Fonte única no corpo tem exceção na EAP; fotos vão no slide seguinte. Mudanças de 02/10 foram publicadas no dia; pedidos de 05/10 aparecem em versões de 11/10. | “Pedidos de quem usa viraram versões: padronização do texto, imagens logo após o serviço, texto justificado, aviso do Facilities e escopos base.” |
| 6 · L35 | “Cada mudança passa por teste antes de ir para produção.” | `package.json:7,11`; `docs/HISTORICO.md:267,282,306,337,428–430` | ⚠ Há suíte e registros de execução. O comando push não é o deploy versionado. O histórico registra inclusive falha do comando e uso manual. Não há prova de teste específico para toda mudança, sem exceção. | “Há testes automatizados, com execução registrada antes da publicação mais recente.” |
| 7 · L39 | “Montar um escopo levou X minutos no sistema, contra Y no PowerPoint, numa amostra de N escopos reais.” | `video/02-relatorio/LOCUCAO-elevenlabs.md:6,37–39`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:82`; `relatorio/rascunho/gerar.cjs:163–174` | ⚠ Bloqueado até a medição de 14/10. Hoje é um marcador editorial. O deck prevê medianas; a fala não diz qual estatística representa X e Y. | Não gerar. Depois da medição, dizer “mediana”, tamanho da amostra e método. Texto condicional abaixo. |
| 8 · L43 | “Os próximos passos: levar o padrão para a empresa toda e trazer fornecedor e preço do Fluig e do RM, onde o cadastro oficial já mora.” | `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:195–207`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:52–53`; `docs/BASE_DE_CONHECIMENTO.md:909–918` | ✅ Como proposta, respeita a decisão. ⚠ A localização e o conteúdo exatos da base oficial não foram consultados. Não presumir que os dois sistemas já oferecem fornecedor e preço por integração pronta. | “Outro próximo passo é integrar fornecedor e preço ao flúig e ao erre eme, usando o cadastro oficial…” |
| 8 · L43 | “Sem base duplicada.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:52–53`; `docs/HISTORICO.md:399` | ⚠ É objetivo futuro. Ocultar abas não elimina a base já existente. | “…para evitar uma base duplicada.” |
| 8 · L43 | “Gestão de Contratações.” | `video/02-relatorio/ROTEIRO.md:1,123`; `relatorio/rascunho/saida/slide-01.png`, título | ✅ Nome do projeto. | Manter. |
| 8 · L43 | “Começar melhor.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:67`; `relatorio/rascunho/saida/slide-15.png`, assinatura | ✅ Assinatura. Não é métrica de ganho. | Manter. |
| 8 · L43 | “Contratar melhor.” | `docs/ESTRATEGIA_NOTA_MAXIMA.md:67`; `relatorio/rascunho/saida/slide-15.png`, assinatura | ✅ Assinatura. Não é resultado medido. | Manter. |

## 3. Correções em ordem e textos prontos

### 3.1. Ordem de correção

1. **Corrigir os fatos do capítulo 1.** Retirar a conclusão jurídica, distinguir escopo descrito de preço discriminado e separar VB/KG de VB/M³. No roteiro, o selo de ausência de laudo está na coluna errada: a sequência duas/três/doze coloca a oferta de duas visitas na primeira coluna; é ela que não inclui laudo PMOC com ART. A terceira, de doze, inclui. Fontes: `video/02-relatorio/ROTEIRO.md:27–34`; PDF-PMOC:42–50,70–72.
2. **Corrigir o capítulo 3.** Retirar “com um clique” e a garantia universal de mesma revisão. Fontes: `app/EscopoInterface.html:59,209,262–272`; `docs/avaliacao-escopo-2026-10-02/RELATORIO_COMPRADOR.md:121–132`.
3. **Sanear as imagens antes de qualquer render.** D02 contém nome e telefone na capa. D90 e E04 contêm nome/telefone na linha 25 e foto de perfil no canto superior direito. E04 não está saneada, apesar de `video/01-previa-20s/midia/real/FONTES.txt:1` dizer que o enquadramento os exclui.
4. **Delimitar os fatos de uso.** Não liberar Esteio como verificado com base apenas nos resumos. Manter “empresa toda” como proposta. Distinguir R9 de nove revisões emitidas e de seis pacotes completos. Fontes: `docs/HISTORICO.md:453–455`; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:4–49`.
5. **Encurtar e qualificar os capítulos 2, 4 e 6.** Evitar causa exclusiva, escopo totalmente pronto e teste universal.
6. **Manter o capítulo 7 fechado até 14/10.** Só preencher com resultado medido e a mesma estatística usada no slide 9.
7. **Reformular o fecho como proposta.** Integração e ausência de duplicidade são objetivos futuros.
8. **Aplicar os mesmos ajustes ao roteiro e ao deck em uma etapa posterior.** Este parecer não altera nenhum deles. Colar apenas a nova locução deixaria as três peças divergentes.

### 3.2. Texto substituto completo por MP3

Os textos abaixo são sugestões prontas para colar. A versão do capítulo 5 usa apenas os empreendimentos visíveis na evidência aberta. Isso não conclui que Esteio esteja sem uso. Se uma leitura identificável da base comprovar Esteio, “Começou pelos três Megas” pode voltar, com fonte e data.

**1-problema.mp3**

> Três propostas de ar-condicionado. Duas, três e doze visitas por ano, no mesmo item cotado como verba anual. Uma proposta não incluía o laudo com responsabilidade técnica previsto no pedido. Em outro caso, a mão de obra veio fechada. Infraestrutura, passagem de cabos e instalação do painel estavam descritas, mas sem preços separados. Na fundação, um mesmo item apareceu em verba e quilos. Esses casos mostram o que precisa ficar explícito antes de comparar propostas.

**2-virada.mp3**

> O comitê aprovou avaliar prestadores, e a avaliação foi construída. A análise dos documentos mostrou também diferenças no que os fornecedores ofereciam. A ideia cresceu: além de avaliar depois, organizar melhor o escopo antes da contratação.

**3-solucao.mp3**

> Hoje, o escopo é montado no sistema. Os serviços entram por local, uma atividade por linha. As imagens ficam vinculadas ao serviço. A lista de itens traz quantidade, unidade e marca de referência. Do mesmo cadastro saem apresentação, PDF e planilha, gerados em etapas separadas.

**4-escopo-base.mp3**

> O próximo escopo pode partir de uma base. Vêm serviços, lista de itens, inclusões, exclusões e aceite. Título, local, fotos, contato e prazos precisam ser preenchidos para a nova contratação.

**5-em-uso.mp3**

> Já há escopos emitidos em Curitiba e Itajaí. No prédio de apoio de Itajaí, o escopo do sistema de incêndio chegou à revisão nove. A tela registra as revisões quatro a nove. A proposta é levar esse padrão a toda área da empresa que contrata.

**6-quem-usa.mp3**

> Pedidos de quem usa viraram versões: padronização do texto, imagens logo após o serviço, texto justificado, aviso do Facilities e escopos base. Há testes automatizados, com execução registrada antes da publicação mais recente.

**7-tempo.mp3 — NÃO GERAR EM 11/10.**

Somente depois de 14/10, com números medidos, substituídos por extenso e conferidos contra o slide 9:

> Na amostra pequena de [N por extenso] escopos, a mediana foi de [X por extenso] minutos no sistema e [Y por extenso] no PowerPoint. O cronômetro foi do primeiro campo ao PDF pronto.

Os colchetes são instruções editoriais. Não entram no ElevenLabs. Se não houver medição, omitir o capítulo e manter a pendência explícita no relatório. Nenhum ganho de tempo deve migrar para outro capítulo.

**8-proximo-passo.mp3**

> A proposta é levar o padrão para a empresa toda. Outro próximo passo é integrar fornecedor e preço ao flúig e ao erre eme, usando o cadastro oficial para evitar uma base duplicada. Gestão de Contratações. Começar melhor. Contratar melhor.

### 3.3. Coerência com o deck

Foram abertos os quinze PNGs, individualmente, e a folha geral. O texto do gerador foi lido para localizar as linhas. A espinha narrativa coincide: casos reais → evolução da avaliação → cadastro → reaproveitamento → uso → pedidos → medição → integração futura. Há erros compartilhados e divergências que impedem liberar o conjunto.

| Slide aberto | Achado | Fonte aberta e correção |
| :--- | :--- | :--- |
| 1 e 15 | Nome e assinatura coincidem com o vídeo. | `video/02-relatorio/ROTEIRO.md:123`; PNGs 01 e 15. Manter. As fotos de capa não precisam ser levadas ao vídeo. |
| 2 | A pendência dos escopos antigos aponta o slide 6; o antes/depois está no 7. | PNG 02; `relatorio/rascunho/gerar.cjs:77,134–145`. Corrigir a referência para 7. |
| 3 | Sumário coerente com a estrutura. | PNG 03; `relatorio/rascunho/gerar.cjs:87–93`. Não há resultado adicional de tempo. |
| 4 | ❌ Repete laudo legal, conteúdo supostamente não aberto e três unidades no mesmo serviço. A coincidência com o vídeo não valida os fatos. | PNG 04; `relatorio/rascunho/gerar.cjs:102–104`; `docs/BASE_DE_CONHECIMENTO.md:547–549,1347–1349`; Lei, art. 1º. Aplicar as correções do capítulo 1. O 2/3/12 confere como oferta anual. |
| 5 | ❌ “O escopo entra em produção” em outubro contradiz as emissões reais de setembro. A linha do tempo também posiciona “setembro” antes de 05/09 sem uma data precisa. | PNG 05; `relatorio/rascunho/gerar.cjs:113–116`; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:8–9,38–39`. Usar setembro para as emissões já comprovadas; outubro para escopos base e modo escopo. Ordenar apenas datas verificadas. |
| 6 | Cadastro único confere. “Mesma revisão” precisa ser delimitada ao exemplo. O deck não afirma um clique; o vídeo acrescenta esse erro. | PNG 06; `relatorio/rascunho/gerar.cjs:123–132`; `app/EscopoInterface.html:59`; relatório do comprador:121–132. Sugestão: “No exemplo mostrado, os documentos estão na R9.” |
| 7 | “Agora todos saem do mesmo cadastro” pode significar adoção em toda a empresa. Os antigos ainda são espaços vazios. | PNG 07; `relatorio/rascunho/gerar.cjs:136–145`; `docs/HISTORICO.md:453–455`. Dizer “Os escopos gerados no sistema seguem o mesmo cadastro; propomos adotar esse padrão na empresa toda.” Não usar o antes/depois como prova até abrir os originais. |
| 8 | Nove blocos reaproveitados têm lastro, mas “já começa pronto” exagera. Fotos e identificação ficam vazias. | PNG 08; `relatorio/rascunho/gerar.cjs:149–155`; `app/Escopos.gs:180–185`. Trocar para “O próximo escopo parte de uma base”. A contagem é de nove blocos editoriais, não de todos os campos do objeto. |
| 9 | A pendência está visível. O deck prevê medianas e método; a locução precisa fazer o mesmo depois de 14/10. | PNG 09; `relatorio/rascunho/gerar.cjs:163–174`. Nenhum X/Y está liberado. |
| 10 | ❌ “R4 a R9, cada uma com deck, PDF e planilha” contradiz a captura. Só há planilha R9 na listagem aberta. Seis escopos nos três Megas continuam sem confirmação independente de Esteio. “10 dias” é ambíguo. | PNG 10; `relatorio/rascunho/gerar.cjs:181–183`; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:4–49`; E05. Dizer “seis revisões de apresentação/PDF, de R4 a R9; planilha R9”. De 02 a 11/10 são nove dias decorridos, ou dez datas inclusivas: preferir “versões publicadas entre 02 e 11/10”. |
| 11 | Depoimentos ainda são espaços de reserva. Não foram inventados nem liberados. | PNG 11; `relatorio/rascunho/gerar.cjs:189–192`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:84`. Só inserir falas reais e autorização documentada. |
| 12 | Pedidos e versões conferem com as ressalvas da locução. Há 34 comandos de teste, não 35 como na estratégia. A afirmação de teste antes de toda publicação é mais forte que a prova aberta. | PNG 12; `relatorio/rascunho/gerar.cjs:197–206`; `package.json:7`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:100`; `docs/HISTORICO.md:237,243,268,310–337,428–430`. Usar “34 comandos na suíte atual” e a formulação limitada do capítulo 6. |
| 13 | Não aparece na voz. “Se mantém sem depender de uma pessoa só” não está demonstrado: a própria peça diz que a segunda pessoa está a definir. “Nenhum sistema paralelo” e “sem base duplicada” confundem objetivo futuro com estado atual. | PNG 13; `relatorio/rascunho/gerar.cjs:212–220`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:116–117`; `docs/HISTORICO.md:399`. Dizer “Documentação e testes apoiam a continuidade; segunda pessoa a definir” e marcar integração como proposta. “Custo zero” deve ser “sem infraestrutura adicional, usando o Workspace já contratado”; não é custo total zero. |
| 14 | Escala corporativa e integração estão corretamente como pedidos. Há outras propostas ausentes do vídeo: fotos, prévia, convite e segunda pessoa. | PNG 14; `relatorio/rascunho/gerar.cjs:228–237`. Omissão em um vídeo curto é aceitável. O subtítulo não deve prometer que todas serão entregues até novembro sem compromisso demonstrado. |
| Todos | Nenhum ganho de tempo medido está liberado. O slide 9 e o capítulo 7 continuam pendentes. | `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:32,195–207`; `docs/ESTRATEGIA_NOTA_MAXIMA.md:82`. Reaproveitamento é função existente, não economia cronometrada. |

### 3.4. Confidencialidade e dados pessoais

O §11 do regulamento determina sigilo pelo comitê durante a avaliação. Ele não afirma que todo dado pessoal pode ser divulgado nem dispensa o cuidado com as capturas. Fonte: **Regulamento:177–200**, página 6. Este parecer identifica exposição observável; não conclui, sem conhecer finalidade, acesso e base legal, que houve infração à LGPD.

A locução não cita fornecedor pelo nome, pessoa, valor monetário ou número de contrato. Itajaí e o prédio de apoio identificam uma contratação interna específica. Isso é intencional no exemplo real; o material deve permanecer no circuito de avaliação. A combinação de serviço e empreendimento pode permitir reconhecimento por quem já conhece o caso.

| Arquivo aberto | Exposição observada | Tratamento necessário |
| :--- | :--- | :--- |
| `video/capturas/2026-10-11/escopo-ppci-docs/D02-slides-y0.png` | Nome e telefone na caixa “Emissão e responsável”. | Mostrar apenas o título/capa acima dessa caixa. Recorte fixo, inclusive durante zoom e transições. |
| `video/capturas/2026-10-11/escopo-ppci-docs/D90-planilha-fornecedor.png` e `video/01-previa-20s/midia/real/E04-planilha-fornecedor.png` | ❌ Telefone/nome na linha 25 e foto de perfil no alto à direita. Os dois arquivos foram abertos. | Cortar a barra do Google e encerrar o enquadramento até a linha 22, mantendo apenas a EAP e os campos vazios necessários. Não aproximar a área de contato. |
| E01, E02, E05 e C01 | Menus “Consulta de preço”, “Equalizações” e “Base Fornecedores” ainda visíveis. | Não há valores expostos nesses recortes, mas a navegação contradiz a apresentação focada no escopo. Recortar a barra ou obter captura nova do modo escopo em produção. |
| E02 e D90/E04 | Marca Morley e códigos de equipamento. | São referências técnicas, não identificação do proponente da cotação. Não confundir marca de referência com fornecedor selecionado. |
| E03 | Planta interna com localização de detectores, ambientes e rodapé com ID do escopo. | É informação operacional real. Mostrar somente o trecho necessário ao comitê. Não usar como material público. |
| PDF-PMOC original | Nomes empresariais, CNPJs, telefones, e-mails e preços no documento de origem. | Não inserir a página inteira no vídeo. Os dados não foram transcritos neste parecer. Os números de visitas podem entrar em cartão factual. |

A planilha sem preços preenchidos continua sendo imagem real permitida. Campos vazios de preço não são valores monetários divulgados. Porém, um vídeo focado na EAP não precisa mostrar as colunas de preço. Não usar E06, telas C02–C09 nem T02–T05 como atalho visual para explicar o futuro: elas tratam dos módulos que a decisão mandou ocultar. Referências: `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:195–207,221–222`; `video/02-relatorio/ROTEIRO.md:7–8,117`.

### 3.5. Fala, duração e abertura

Contagem reproduzível: palavras separadas por espaço, apenas os oito parágrafos falados da locução. Nomes dos MP3, títulos e instruções ficam fora. Referências: `video/02-relatorio/LOCUCAO-elevenlabs.md:15,19,23,27,31,35,39,43`.

| Capítulo | Palavras atuais | Tempo a 150 palavras/minuto |
| :--- | ---: | ---: |
| 1 | 111 | 44,4 s |
| 2 | 47 | 18,8 s |
| 3 | 59 | 23,6 s |
| 4 | 37 | 14,8 s |
| 5 | 40 | 16,0 s |
| 6 | 43 | 17,2 s |
| 7, ainda bloqueado | 18 | 7,2 s |
| 8 | 36 | 14,4 s |
| **Total** | **391** | **2min36,4s** |

Sem o capítulo 7, são 373 palavras e 2min29,2s. A fala atual cabe entre dois e três minutos na estimativa de 150 palavras por minuto. Com o capítulo 7, restam cerca de 24 segundos para pausas, transições e leitura até o limite de três minutos. O resultado final precisa ser cronometrado no MP3. A indicação de “~320 palavras, cerca de 2min10s” em `docs/HISTORICO.md:457–458` está desatualizada ou incorreta para os arquivos abertos.

Os sete textos substitutos acima têm **304 palavras**, cerca de **2min02s** de fala. O modelo do capítulo 7 acrescenta cerca de 35 palavras antes da substituição dos números. A ordem de grandeza é **2min16s sem pausas**, com margem para respiração e leitura até três minutos. A duração exata depende do MP3 e dos números medidos. Não há áudio desta versão para cronometrar.

Frases com risco de fôlego:

- Capítulo 6, primeira frase: 32 palavras e cinco pedidos em sequência. Dividir a lista com pausas naturais.
- Capítulo 5, frase iniciada por “Começou”: 24 palavras, dois fatos de uso e duas escalas. Separar uso, R9 e proposta.
- Capítulo 8, primeira frase: 25 palavras e duas integrações. Separar expansão e integração.
- Capítulo 1, frase do preço fechado: 25 palavras e três subitens. A correção em duas frases resolve.
- “Fica em branco só…” e “a mesma fonte em todos…” devem perder os absolutos. A EAP tem tamanho de fonte próprio, e fotos não são herdadas. Fontes: `docs/HISTORICO.md:237,333`.

Pronúncia:

- **EAP:** na locução atual é preciso ouvir a leitura. Se soletrar, usar “é, á, pê”. Nos textos substitutos, “lista de itens” evita a dúvida.
- **PMOC:** não aparece na locução atual. Aparece na fonte e poderia voltar na frase do laudo. Se voltar à voz, “pê, eme, ó, cê”; é melhor manter a formulação por extenso proposta.
- **RM:** “erre eme”. **Fluig:** “flúig”, conforme `video/02-relatorio/LOCUCAO-elevenlabs.md:7`. Isso é orientação editorial; não há MP3 aberto que comprove o resultado.
- **PDF:** testar a leitura antes de fechar a voz. Não há áudio para confirmar.
- **Facilities:** pode receber sotaque inconsistente. Se a voz tropeçar, usar “área de Facilities” com pronúncia ajustada nas configurações.
- **X/Y/N:** nunca narrar as letras. Números medidos por extenso; casas decimais e unidade explícitas. R9 já está corretamente “revisão nove”.
- “Duas, três e doze visitas por ano” não é ambíguo na voz. “1,00 VB” funciona apenas na imagem com explicação de verba anual.

**Abertura:** a primeira frase atual tem 12 palavras, cerca de 4,8 segundos, e é genérica. O primeiro número só aparece depois. Não atende à régua de abrir com o fato mais forte. Fonte da régua: `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:105–110`. A correção começa com “Três propostas de ar-condicionado” e chega à diferença de visitas em seguida. A imagem pode apresentar 2/3/12 desde o quadro inicial. Não mostrar cronômetro de ganho nem insinuar economia de tempo antes de 14/10.

**Virada:** o capítulo 2 já cumpre a ponte essencial ao dizer que a avaliação foi construída. O ajuste proposto reforça a continuidade: avaliar depois e organizar antes. Não afirma que o comitê aprovou uma integração ainda inexistente. A linha do tempo visual precisa perder a data de outubro para a primeira emissão de escopo, pois há emissão de 15/09. Fontes: `docs/ESTRATEGIA_NOTA_MAXIMA.md:33–55`; `video/capturas/2026-10-11/escopo-ppci/P-arquivos.json:8–9`.

### 3.6. Cenas e imagens reais disponíveis

Caminhos abreviados nesta tabela: **REAL/** = `video/01-previa-20s/midia/real/`; **CAP/** = `video/capturas/2026-10-11/`. Todos os arquivos usados para dar “disponível” foram abertos. A mera existência de arquivos não foi tratada como prova visual.

Cartões de texto podem apresentar fatos verificados. Não devem imitar uma captura de app ou reconstruir uma planilha como se fosse documento real. O pedido permite identificar cenas que só funcionam como cartão. Imagens do aplicativo e dos documentos devem ser reais.

| Cena e linha do roteiro | Disponibilidade | O que falta ou precisa mudar |
| :--- | :--- | :--- |
| 1.1 · L27–30 | Não há captura do caso PMOC nas duas pastas de mídia pedidas. O PDF original existe e foi aberto por extração. | Cartão factual com “três propostas” e “2, 3 e 12 visitas/ano”. Uma montagem de três colunas não pode fingir ser captura real. A fonte anual está em PDF-PMOC:74–76. |
| 1.2 · L32–34 | Sem captura apropriada. | ❌ Não aplicar o selo à terceira coluna: ela inclui laudo com ART. Retirar “exigido em lei”. Se houver cartão, associar corretamente à oferta de duas visitas, ou não associar coluna alguma. |
| 1.3 · L36–39 | Sem captura real dessa árvore nas pastas exigidas. | Cartão: “serviços descritos, preços sem discriminação”. Para imagem real, obter documento gerado pelo app com esse caso, sem criar ou alterar dados durante a checagem. Não exibir valor real, mesmo com aproximação. |
| 1.4 · L41–43 | Sem captura de fundação nessas pastas. | ❌ Não desenhar o mesmo serviço em VB/KG/M³. Cartão VB × KG, referente ao posicionamento da armadura, com fonte `docs/BASE_DE_CONHECIMENTO.md:548`. Captura de uma tabela real só depois de aberta e saneada. |
| 1.5 · L45–47 | Cartão editorial. | Usar a conclusão delimitada dos casos. Não precisa de imagem nova. |
| 2.1 · L51–54 | Slide 5 existe, mas não é captura do app. | Linha do tempo como cartão, após corrigir setembro/outubro. Não usar o slide atual como prova de cronologia. |
| 2.2 · L56–58 | Cartão editorial. | Destacar “diferenças nas ofertas”, sem atribuir causa exclusiva. |
| 2.3 · L60–62 | Cartão editorial. | Mostrar continuidade da avaliação para o escopo; integração segue futura. |
| 3.1 · L66–68 | REAL/E01 disponível. | Recortar a barra superior. Não precisa de nova captura para mostrar o grupo SDAI. |
| 3.2 · L70–72 | REAL/E01 disponível, com plantas vinculadas ao grupo. | Dizer “imagens”. Se a cena exigir foto de vistoria, obter captura de grupo com fotografia real; não confundir planta com foto. |
| 3.3 · L74–76 | REAL/E02 disponível. | Mostrar os campos de quantidade, unidade e marca. Recortar a navegação. Não transformar a marca Morley em nome do proponente. |
| 3.4 · L78–81 | CAP/escopo-ppci-docs/D02, REAL/E03, CAP/escopo-ppci-docs/D90 e REAL/E04 disponíveis. | ❌ D02 e D90/E04 expõem contato; D90/E04 expõem perfil. Recortar. Mostrar os dois comandos separadamente; E05 contém ambos. Não simular um clique emitindo o pacote completo. |
| 4.1 · L85–87 | CAP/C01 disponível. | Botão “Usar como base” real. Recortar a navegação; não usar T01, que ainda está carregando. |
| 4.2 · L89–91 | Chips do slide 8 são cartões de texto. | Podem explicar os campos, com fonte `app/Escopos.gs:180–185`. Para demonstrar a função em tela, falta captura de uma base já aberta, mostrando origem e campos vazios. Não salvar um escopo apenas para produzir evidência. |
| 5.1 · L95–97 | REAL/E05 disponível; JSON confirma R4–R9. | Recortar barra. Para comprovar três Megas, falta captura/listagem identificável de um escopo real emitido em Esteio. Para confirmar seis reais, falta a lista inteira com os testes separados. Cartão de “empresa toda” deve começar por “proposta”. |
| 6.1 · L101–103 | Slide 12 existe como cartão. | Usar pedidos reais e versões registradas. Mostrar fonte/cor do corpo e fotos após o texto, com as exceções documentadas. Não chamar o cartão de captura do app. |
| 6.2 · L105–107 | Cartão editorial; sem imagem de execução de testes nas pastas. | Trocar “testes antes de cada publicação” por “testes automatizados; execução registrada antes da publicação mais recente”. A fonte é o histórico, não uma tela fictícia. |
| 7.1 · L111–113 | Nenhum resultado medido disponível. | Depois de 14/10, cartão com medianas, amostra pequena e método; dados abertos e idênticos aos do slide 9. Nenhuma captura simulada de cronômetro. |
| 8.1 · L117–119 | Cartões de texto. | “Proposta: padrão para a empresa toda” e “Próximo passo: integração Fluig/RM”. Não usar REAL/E06-base-fornecedores.png nem tela de módulos ocultos. |
| 8.2 · L121–123 | Cartão de assinatura. | Fundo corporativo e nome já bastam. Não precisa de imagem nova. |

Capturas novas prioritárias, para uma etapa posterior: modo escopo @77 em produção; listagem completa dos escopos com empreendimento e emissão, especialmente Esteio; base já aberta com origem e campos vazios; grupo com foto real se a palavra “foto” for mantida. O caso PMOC, a mão de obra e a fundação podem ficar como cartões factuais, sem criar imagens artificiais. Referências: `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:195–207`; `docs/HISTORICO.md:428–432`.

## 4. MP3 que precisariam ser refeitos

Não há MP3 na pasta `video/02-relatorio/` nesta leitura. A lista abaixo vale se a voz já tiver sido gerada e guardada em outro lugar.

| Arquivo | Motivo |
| :--- | :--- |
| **1-problema.mp3** | Corrigir fato jurídico, preço discriminado, unidades, oferta versus execução e abertura. |
| **2-virada.mp3** | Retirar causa não comprovada e explicar continuidade. |
| **3-solucao.mp3** | Corrigir um clique, garantia de revisão, imagens versus fotos. |
| **4-escopo-base.mp3** | Distinguir reaproveitamento parcial de escopo pronto. |
| **5-em-uso.mp3** | Separar R9, registros visíveis e proposta corporativa; Esteio sem confirmação primária. |
| **6-quem-usa.mp3** | Qualificar fonte/fotos e teste antes de toda mudança; dividir a lista. |
| **8-proximo-passo.mp3** | Distinguir objetivo de base única de estado atual; ajustar pronúncias. |
| **7-tempo.mp3** | Não gerar agora. Se já houver voz com X/Y/N ou números sem medição, descartar essa tomada e gravar só depois dos dados de 14/10. |

Os textos substitutos também reduzem a duração e ampliam a margem para pausas. Se forem usados, os sete capítulos listados devem ser refeitos por inteiro. Corrigir apenas as frases ❌ deixa as demais ressalvas deste parecer.

## 5. O que não foi possível verificar

1. **Esteio na base de escopos.** K:228 e H:453–455 afirmam três Megas, mas são resumos. C01 mostra Curitiba, Itajaí e apenas o início do cartão PPCI. T01 está carregando. Não há listagem completa de produção aberta. O endereço de depuração local 127.0.0.1:9222 não respondeu. Não se conclui que Esteio não usa; o ponto continua sem confirmação independente.
2. **Seis escopos reais e dois de teste.** C01 mostra total de oito, mas não todos os cartões. Não foi recontada a base nem confirmado envio a fornecedor. Não equiparar selo “Emitido” a mensagem enviada ou serviço executado.
3. **R1 a R3 do PPCI.** A evidência aberta lista apenas R4 a R9. Não há prova de nove emissões ou de planilha em cada revisão. R9, seis emissões de apresentação/PDF e uma planilha R9 estão documentados no JSON.
4. **Conteúdo de todos os arquivos de cada revisão.** O JSON contém links, não o conteúdo dos PDFs. Eles não foram abertos pelo link. As capturas do deck e da planilha R9 foram abertas. Não foi feita comparação integral, item por item, de todos os documentos gerados.
5. **Original do e-mail do comitê de 19/05.** Foram abertos a minuta de resposta, a estratégia, a apresentação interna e o código de avaliação. A aprovação é premissa expressa do pedido, mas não foi reconstituída a cadeia original do e-mail.
6. **Pedidos originais das três contratações.** O PDF-PMOC e a base documentam propostas e análise. O pedido e todos os anexos originais de fundação e mão de obra não foram abertos. Não é possível concluir que divergências decorrem exclusivamente de escopo mal definido.
7. **Exigência técnica/jurídica completa de “laudo PMOC com ART”.** A lei oficial foi aberta. O art. 1º fundamenta a obrigação de PMOC, não toda a formulação falada. Não foram auditadas normas técnicas, enquadramento do imóvel nem exigências profissionais específicas. Por isso o texto substituto fica no requisito observado no pedido.
8. **Integração ou conteúdo efetivo do cadastro Fluig/RM.** A decisão é futura. Nenhuma API, base oficial ou tela desses sistemas foi consultada. Não se promete disponibilidade ou prazo.
9. **Medição de 14/10 e depoimentos.** Ainda não existem nas evidências abertas. Nenhum resultado de tempo ou satisfação é aprovado antecipadamente. O ganho estimado por cliques do relatório do comprador não foi tratado como medição.
10. **Teste de toda mudança e resultado atual da suíte.** Foi lido o comando de 34 testes e o registro da publicação mais recente. Não foram executados testes nem alterações, para preservar o escopo de somente leitura. O registro não prova cobertura de todas as mudanças nem ausência de atalhos em todas as publicações.
11. **Pronúncia, respiração, tempo exato, som e movimentos.** Não há MP3 ou render desta versão. A régua de quadro inicial, pausas e uma ideia por tela só pode receber aprovação final na folha de quadros e no vídeo. Fonte: `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md:105–110`.
12. **Saneamento final e autorização de depoimentos.** A folha de render ainda não existe. O enquadramento prometido no manifesto não corresponde aos arquivos brutos E04/D90. A aprovação depende da imagem efetivamente exportada, incluindo transições e zoom.

Nas referências desta lista, K = `docs/CONHECIMENTO_VIDEO_E_RELATORIO.md`; H = `docs/HISTORICO.md`. Todas as fontes aprovadas neste parecer foram abertas. Arquivo encontrado, link listado ou afirmação repetida no deck não foi considerado confirmação independente.

