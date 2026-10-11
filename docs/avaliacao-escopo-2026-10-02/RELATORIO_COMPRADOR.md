# Avaliação do comprador de Facilities: aba "Escopos"

Data: 02/10/2026. Código avaliado: a cópia local de hoje (v73, texto justificado, `ESL6`). O projeto não foi alterado.

**Método.** Montei dois escopos pela tela real (`app/EscopoInterface.html`) com o Playwright e o Google simulado (`ambiente()` de `tests/teste-escopos.cjs`). As fotos são JPEG/PNG de verdade:
- **Escopo A (barreiras):** 28 barreiras para o Mega Curitiba, com a distribuição 20 + 4 + 4 por local, o mapa em PNG, a foto do modelo e a condição de pagamento.
- **Escopo B (elétrica):** quadros elétricos dos módulos 01 e 02, com 3 grupos e 10 fotos de celular de 12 MP (1,4 a 4,2 MB cada, 22,6 MB no total). Quatro das fotos estão em pé com EXIF 6 e uma tem os pixels em pé.

Depois gerei o deck pelo código real e o desenhei em HTML com o texto justificado pelo navegador. Também renderizei as células e os estilos da planilha do fornecedor. Scripts: `aval.cjs` e `fotos.cjs`. Números brutos: `resultado.json`.

**Limites.** Não houve Google real. Por isso ficaram sem verificação:
- os tempos de rede do Apps Script;
- se o Slides respeita o EXIF das fotos;
- a altura das linhas mescladas no .xlsx exportado.

---

## Nota: 6,5 / 10

O ganho é real onde o PowerPoint me custa mais: diagramar fotos e montar a planilha. O deck sai consistente e apresentável, e a EAP, o deck e a planilha nascem do mesmo cadastro.

Perde pontos em três frentes:
- O caminho das fotos do celular recusa os arquivos que o celular de fato produz (acima de 5 MB ou HEIC).
- Não existe prévia sem emitir revisão, e a revisão nova nasce em silêncio. Consegui mandar uma planilha R2 junto com um deck R1.
- Alguns detalhes constrangem quem envia o material, como a legenda cortada no meio da palavra ("encosta no ba").

## Eu usaria amanhã?

**Sim, para escopos com poucas fotos, como o das barreiras.** Fica pronto em cerca de 20 minutos e o material é melhor que o meu PowerPoint.

**Para vistoria com 10 ou mais fotos de celular, ainda não com confiança.** Teria que passar as fotos pelo WhatsApp para encolher e converter os HEIC. Teria também que abrir o PDF antes de mandar, porque não sei se o Slides vai deitar as fotos tiradas em pé. Um erro de digitação visto no PDF me obriga a emitir a R2.

## Tempo: sistema contra PowerPoint

Contei as ações do roteiro do Playwright e estimei o tempo humano assim:
- digitação a 200 caracteres por minuto;
- 4 s para achar cada campo;
- 2 s por clique;
- 8 s por arquivo escolhido.

A esse total somei a espera estimada do Apps Script real e a conferência do PDF. O tempo do simulador não serve de referência porque responde na hora.

| | Escopo A (barreiras) | Escopo B (elétrica) |
| :--- | :--- | :--- |
| Cliques / campos / caracteres digitados / arquivos | 37 / 23 / 2.572 / 2 | 98 / 50 / 3.505 / 10 |
| Preenchimento (estimado) | 16 min | 26 min |
| Envio das fotos, gerar deck e planilha (estimado no Apps Script) | 2 min | 4 a 6 min (32 MB em base64 de envio) |
| Conferência do PDF antes de mandar | 3 min | 5 min |
| **Total no sistema** | **~20 min** | **~35 a 40 min** |
| **Minha estimativa no PowerPoint + Excel** | **~30 a 35 min** | **~60 a 75 min** |

No escopo B, 52 dos 98 cliques foram na EAP: unidade, abrir "Serviços vinculados" e marcar grupos. O texto custa o mesmo nos dois métodos. O ganho vem de não diagramar 10 fotos (no PowerPoint são de 1 a 1,5 min cada, entre inserir, cortar, alinhar e legendar) e de não montar a planilha à mão.

Detalhe por etapa (cliques | campos | caracteres | arquivos | minutos estimados):

| Etapa | A | B |
| :--- | :--- | :--- |
| Identificação | 6 / 5 / 258 / 0 / 1,8 | 6 / 5 / 186 / 0 / 1,5 |
| Objetivo e vistoria | 2 / 2 / 484 / 0 / 2,6 | 2 / 2 / 636 / 0 / 3,4 |
| Grupos e serviços | 8 / 4 / 803 / 2 / 4,9 (com fotos) | 9 / 6 / 874 / 0 / 5,1 |
| Fotos e legendas | junto acima | 18 / 9 / 487 / 10 / 5,0 |
| EAP | 11 / 7 / 205 / 0 / 1,9 | 52 / 23 / 464 / 0 / 5,6 |
| Limites e condições | 5 / 5 / 822 / 0 / 4,7 | 6 / 5 / 858 / 0 / 4,9 |
| Revisar, salvar, gerar e planilha | 4 cliques | 4 cliques |

Mensagens que apareceram no caminho feliz, todas claras:
- "Pronto para emitir. A apresentação terá aproximadamente 12 página(s)."
- "Rascunho salvo — revisão 1."
- "Salvando e gerando… Isso pode levar alguns minutos…"
- "Apresentação e PDF da revisão 1 prontos."
- "Planilha pronta. Baixe o Excel e envie ao fornecedor."

O fluxo não travou em nenhum ponto. Os pontos em que eu, como usuário, ficaria preso estão listados abaixo.

---

## Os 5 melhores pontos

1. **Foto dentro do grupo e o deck se monta sozinho.** Subi 10 fotos em 3 grupos. Cada grupo virou um slide de texto e, logo depois, um slide com as fotos dele, até 4, numeradas e com a legenda colada na foto. Foto deitada e foto em pé ficam na mesma linha de base. Foi o maior ganho sobre o PowerPoint. (`ui-B01-grupo1-fotos.png`, `deck-b-06-fotos.png`, `deck-b-08-fotos.png`, `deck-a-06-fotos.png`)
2. **Um cadastro gera três saídas coerentes.** O deck, o PDF e a planilha do fornecedor saem com o mesmo código de EAP, as mesmas quantidades e a mesma revisão. A planilha leva o "Local:" de cada item e as condições do escopo. A equalização importa a EAP pelo botão "Aplicar escopo na EAP". (`planilha-1.png`, `planilha-4.png`)
3. **O diagnóstico antes de gerar funciona.** Ele separa o que é obrigatório do que é recomendado. O botão "Corrigir" levou o foco ao campo certo (`es-endereco`). Gerar com pendência não grava nada nem gasta revisão. (`ui-E04-gerar-pendencias.png`, `ui-A07-diagnostico.png`)
4. **O deck tem cara de documento de empresa.** Tem capa com metadados, um tamanho só de letra no corpo, rodapé com revisão, data e página, e cartões centralizados. As inclusões, as exclusões e o aceite ficam lado a lado em cores, e a visita obrigatória aparece em destaque. Eu mandaria sem vergonha a maior parte dos slides. (`deck-a-01-capa.png`, `deck-a-11-limites-aceite.png`, `deck-b-17-encerramento.png`)
5. **Proteções que evitam retrabalho bobo:**
   - Gerar duas vezes não duplica o deck, e o duplo clique gerou uma chamada só.
   - O rascunho volta inteiro ao ser reaberto.
   - Sair com alterações pede confirmação, e cancelar mantém os dados.
   - No Mega Curitiba, o endereço e a imagem aérea entram sozinhos.
   - A revisão emitida fica congelada.

   (`ui-R01-reaberto-topo.png`, `ui-R02-historico-duplicado.png`)

---

## Problemas, em ordem de gravidade

### BLOQUEIA

**1. Fotos do celular acima de 5 MB ou em HEIC são recusadas, e o lote para no primeiro erro.**
- **O que aconteceu.** Testei três casos:
  - Uma foto de 5,85 MB e um HEIC, enviados com `image/heic` ou sem tipo, receberam "Envie PNG ou JPEG de até 5 MB.".
  - Num lote de 3 fotos (válida, grande, válida), só a 1ª entrou. A 3ª foi descartada sem aviso, e a mensagem não diz qual arquivo falhou.
  - A mensagem aparece no topo da página, e a tela rola até lá, longe do grupo em que eu estava.

  Escolher um arquivo recusado ainda marca "alterações não salvas".
- **Por que bloqueia.** O iPhone grava em HEIC por padrão, e quem passa as fotos pelo Drive ou pelo cabo recebe HEIC. Android em modo de alta resolução passa de 5 MB. O seletor nem mostra o HEIC, porque usa `accept="image/png,image/jpeg"`.
- **Prints:** `ui-H01-heic.png`, `ui-G01-foto-grande.png`, `ui-G02-lote-com-grande.png`.
- **Onde:** `app/EscopoInterface.html:115` (`esArquivoUI`), `:143` (`esUploadFotosUI` para no primeiro erro), `:53` (`esMsg` rola até o topo), `:212` (o listener de `input` marca sujo com o campo de arquivo), `:135` (`accept`). No servidor: `app/Escopos.gs:221` e `:226`.
- **Sugestão:**
  - Reduzir no navegador antes de enviar: desenhar em canvas com o lado maior até 2.000 px e salvar em JPEG 0,85. Isso resolve o tamanho, grava a orientação nos pixels (elimina o risco do item 2) e reduz em cerca de 10 vezes o envio e a reabertura.
  - Seguir com o lote quando um arquivo falhar e listar os recusados dentro do grupo, pelo nome.
  - Aceitar `.heic` no seletor e dizer como converter quando o navegador não decodificar.

**2. Não há confirmação de que o Slides respeita o EXIF (risco: fotos em pé saindo deitadas).**
- **O que aconteceu.** O sistema lê o EXIF só para calcular a moldura. Se o Slides inserir a imagem ignorando o EXIF, 4 das 10 fotos do escopo B saem deitadas e pequenas dentro de uma moldura em pé. Simulei esse pior caso.
- **Prints:** `deck-b-06-fotos.png` (com EXIF respeitado) e `deck-b-06-fotos-SEM-EXIF.png` (pior caso).
- **Onde:** `app/EscopoSlides.gs:212` (`esDimensoesImagem_`) e `:465` (`insertImage`). O HISTORICO de 02/10 já registra este ponto como "Não verificado".
- **Sugestão:** a reescrita no canvas do item 1 resolve. Enquanto ela não existir, gerar um deck real com uma foto EXIF 6 e conferir.

### ATRAPALHA

**3. Não existe prévia sem emitir, e a revisão nova nasce em silêncio. Mandei planilha R2 com deck R1.**
- **O que aconteceu.** A única forma de ver o deck é "Gerar Slides e PDF", e isso congela a revisão. Achei um erro no PDF e mudei um prazo. O rótulo mostrou "Revisão 1 · alterações não salvas", sem dizer que vou abrir a R2. Cliquei em "Gerar planilha" e o histórico ficou assim:
  - Slides: R1;
  - Planilhas: R1, R1 e R2.

  A mensagem de status diz só "Planilha pronta". Nada avisa que o deck enviado é de outra revisão, e nenhum documento diz o que mudou da R1 para a R2.
- **Prints:** `ui-R03-editando-apos-emitir.png`, `ui-R04-historico-planilha-R2-deck-R1.png`, `ui-R05-historico-R2.png`.
- **Onde:** `app/Escopos.gs:165-190` (`esRevisaoEmitida_` e `apiEscopoSalvar` abrem a R+1), `app/EscopoInterface.html:73` (rótulo), `:146` (gerar), `:199-206` (a planilha salva e emite sozinha).
- **Sugestão:**
  - Criar uma "Prévia" que gera o deck sem congelar a revisão, mesmo que seja um PDF temporário.
  - Ao editar uma revisão emitida, mostrar "Você vai criar a R2. A R1 foi enviada em dd/mm".
  - Ter um botão único "Emitir pacote para fornecedor", que gera deck, PDF e planilha da mesma revisão.
  - Colocar um campo "O que mudou nesta revisão", que sai na capa.

**4. Cada clique em "Gerar planilha" cria um arquivo novo da mesma revisão.**
- **O que aconteceu.** Ficaram duas "Revisão 1" no histórico, a 15:42:56 e a 15:42:58. Qual delas eu mandei?
- **Print:** `ui-R02-historico-duplicado.png`.
- **Onde:** `app/EscopoPlanilha.gs:39-80`. O deck é reaproveitado, a planilha não.
- **Sugestão:** reaproveitar a planilha da revisão, como já se faz com o deck.

**5. A legenda é cortada em 180 caracteres sem aviso, e o corte sai no meio da palavra no PDF.**
- **O que aconteceu.** Digitei 242 caracteres e ficaram 180. O deck mostra "…e encosta no ba", e é esse o texto que vai ao fornecedor. O campo tem uma linha só, então eu não percebo o corte.
- **Prints:** `ui-B01-grupo1-fotos.png` (3ª foto) e `deck-b-06-fotos.png` (FOTO 3).
- **Onde:** `app/EscopoInterface.html:138` (`esInputUI(...,'legenda',...,180)` como `<input>`), `:131`, `app/Escopos.gs:72`.
- **Sugestão:** usar textarea com contador "180/180" e impedir o envio com texto cortado.

**6. A planilha não tem fórmulas nem volta para o sistema.**
- **O que aconteceu.** "Total (R$)" e "TOTAL DA PROPOSTA" ficam em branco para o fornecedor calcular, e é aí que mais nascem erros de conta. Quando as 3 ou mais propostas chegam, não há como importar a planilha preenchida para a equalização: eu redigito os preços. A planilha também não tem proteção, então o fornecedor pode mudar quantidades.
- **Prints:** `planilha-1.png`, `planilha-4.png`.
- **Onde:** `app/EscopoPlanilha.gs:63-70`. O teste `tests/teste-escopos.cjs:322` exige "sem fórmulas".
- **Sugestão:**
  - Usar `=C*G` por linha e `SOMA` no total.
  - Proteger as colunas A a E.
  - Criar "Importar proposta preenchida", que lê as colunas F a I da mesma revisão direto na equalização.

**7. A condição de pagamento não tem campo, e a planilha pede ao fornecedor que a proponha.**
- **O que aconteceu.** Escrevi "pagamento em até 28 dias após a entrega" dentro de "Considerações". No deck ela fica na 3ª linha do cartão "DIRETRIZES". A planilha, por sua vez, tem a célula amarela "Condição de pagamento:" para o fornecedor preencher. Cada um vai responder uma coisa.
- **Prints:** `deck-a-10-card-texto.png`, `planilha-1.png` (linha 7).
- **Onde:** `app/Escopos.gs:34-37` (não há o campo), `app/EscopoPlanilha.gs:15`.
- **Sugestão:**
  - Criar campos próprios para condição de pagamento, faturamento e empresa contratante, que hoje não aparece; o rodapé diz sempre "CAPITAL REALTY" (`EscopoSlides.gs:695`).
  - Imprimir esses dados num bloco "Condições comerciais" no deck.
  - Na planilha, trocar "Condição de pagamento:" por "Aceita a condição de 28 dias? (sim/não e contraproposta)".

**8. Reabrir o rascunho baixa todas as fotos em resolução cheia.**
- **O que aconteceu.** Reabrir o escopo B baixou 31,6 MB em 11 chamadas `apiEscopoImagem`. No envio subiram 32,5 MB em base64. No simulador isso é instantâneo. No Apps Script, a minha estimativa é de dezenas de segundos a mais de 1 minuto, em cada envio e em cada reabertura.
- **Onde:** `app/EscopoInterface.html:113` (`esPreviewUI`), `app/Escopos.gs:252-256`.
- **Sugestão:** reduzir as fotos no envio (item 1) e servir uma miniatura na prévia.

**9. Vincular itens a vários grupos dá trabalho, e o contador mente.**
- **O que aconteceu.** Com mais de um grupo, cada item exige abrir "Serviços vinculados" e marcar os grupos. Foram 52 cliques para 9 linhas. Depois de marcar os 3 grupos do item 3.1, o resumo continuou dizendo "Serviços vinculados (0)".
- **Print:** `ui-B03-eap.png`.
- **Onde:** `app/EscopoInterface.html:126` (`esVinculoUI` só redesenha as fotos), `:176`.
- **Sugestão:**
  - Atualizar o contador ao marcar.
  - Vincular automaticamente ao último grupo usado.
  - Permitir "+ Item" de dentro do próprio grupo de serviços.

**10. O campo "Título do conjunto fotográfico" é obrigatório e não aparece em lugar nenhum.**
- **O que aconteceu.** São 10 campos inúteis no escopo B. Hoje o sistema os preenche com o nome do grupo, mas se eu apagar um deles a geração trava.
- **Print:** `ui-B01-grupo1-fotos.png`.
- **Onde:** `app/EscopoInterface.html:138`, `app/Escopos.gs:263`.
- **Sugestão:** remover o campo e a validação.

### INCOMODA

- **Texto justificado em coluna estreita abre buracos.** Nas inclusões aparece "quantidade    conforme    esta". No responsável em negrito aparece "Guilherme    Marques    ·    Compras". Prints: `deck-a-11-limites-aceite.png`, `deck-a-12-encerramento.png`, `deck-b-16-limites-aceite.png`. Onde: `app/EscopoSlides.gs:448` e `:663`. Sugestão: alinhar à esquerda as colunas com menos de cerca de 300 pt e o contato.
- **Listas sem marcador fora dos serviços.** As inclusões, as exclusões e os critérios saem como texto corrido, e cada item vira um parágrafo sem "•". Prints: os mesmos acima. Sugestão: aplicar o mesmo "• " dos serviços (`EscopoSlides.gs:326-329`).
- **Deck inchado.** Há 3 divisórias de seção num deck de 12 páginas para um fornecimento de 2 itens. A EAP tem 7 linhas fixas de 38 pt, e por isso a 2ª página da EAP do escopo B tem só 2 linhas. Prints: `deck-a-04-capa-secao.png`, `deck-b-13-eap.png`. Onde: `app/EscopoSlides.gs:317`, `:344`, `:366`, `:359`. Sugestão: tirar as divisórias quando o deck tiver menos de cerca de 15 páginas e paginar a EAP pela altura real das linhas.
- **Rodapé e planilha com um ID de 40 caracteres.** Aparece "ESC-xxxxxxxx-xxxx-…" em toda página. O fornecedor não consegue citar esse número. Onde: `app/EscopoSlides.gs:695`, `app/EscopoPlanilha.gs:12`. Sugestão: um número curto, como "ESC-2026-0142 R2".
- **A capa corta o responsável.** Sai "Guilherme Marques · Compr…" (`deck-a-01-capa.png`, `app/EscopoSlides.gs:535`). Sugestão: na capa, só o nome.
- **O aviso padrão "caráter orientativo"** vem pré-preenchido e sai em destaque no último slide. Isso abre espaço para aditivo ("era só orientativo"). Onde: `app/EscopoInterface.html:66`. Sugestão: um texto padrão do tipo "Itens não listados e necessários à entrega completa devem constar da proposta".
- **"Novo escopo" não limpa a lista.** O escopo anterior continua selecionado no topo enquanto edito um novo. Prints: `ui-E01-salvar-vazio.png`, `ui-H01-heic.png`. Onde: `app/EscopoInterface.html:66`.
- **Mega sem cadastro (Esteio).** Chega sem endereço e sem imagem, e só gera depois que eu subo uma imagem aérea. Basta uma vez por Mega ("Salvar como padrão"), mas no primeiro uso trava o comprador.
- **A planilha mescla as linhas das condições.** No Excel, uma linha mesclada não ajusta a altura sozinha. Se o Google exportar com a altura padrão, as inclusões e os critérios aparecem cortados (`planilha-4-excel.png`, pior caso, não verificado). Onde: `app/EscopoPlanilha.gs:71`.
- **Tela no celular.** A tela abre no celular sem rolagem horizontal, e a parte das fotos funciona. A tabela da EAP fica espremida, a ponto de não dar para editar (`ui-M01-celular-grupo.png`, `ui-M02-celular-eap.png`). Para subir foto na vistoria serve; para montar o escopo, não.

---

## O que falta para eu abandonar o PowerPoint

1. **Redução automática das fotos no navegador**, aceitando HEIC, com lote tolerante a erro e a orientação gravada nos pixels. Sem isso, toda vistoria vira conversão manual.
2. **Prévia sem emitir e "Emitir pacote"**, que gera deck, PDF e planilha da mesma revisão de uma vez, com aviso de revisão nova e o campo "o que mudou". Só assim confio que o fornecedor recebe documentos que batem.
3. **Campos comerciais próprios** para condição de pagamento, empresa e CNPJ de faturamento, e prazo e endereço de envio da proposta, impressos num bloco de destaque. Hoje isso fica escondido em "Considerações".
4. **Fechar o ciclo da cotação:**
   - planilha com fórmulas e protegida;
   - importação da planilha preenchida para a equalização;
   - registro de para quem enviei, com pelo menos 3 fornecedores e a data, e de quem respondeu.

   Hoje o sistema me entrega o material, mas o envio, a cobrança e a redigitação dos preços continuam fora dele.
5. **Acabamento do texto:** legenda sem corte, colunas estreitas alinhadas à esquerda, marcadores nas listas, menos divisórias e número curto do escopo. São detalhes, mas é o que o fornecedor vê.

Com os itens 1 e 2 resolvidos eu já usaria em todos os escopos, e a nota subiria para cerca de 8. Com o 3 e o 4, o PowerPoint e o Excel saem do meu dia.

---

### Arquivos desta avaliação

Todos estão em `SP/aval-comprador/`:
- **Tela:** `ui-A01` a `ui-A10` (barreiras), `ui-B01` a `ui-B05` (elétrica), `ui-R01` a `ui-R05` (reabrir, gerar duas vezes, nova revisão), `ui-E01` a `ui-E04` (campos esquecidos), `ui-H01` (HEIC), `ui-G01` e `ui-G02` (foto grande), `ui-M01` e `ui-M02` (celular).
- **Deck:** `deck-a-01..12-*.png`, `deck-b-01..17-*.png` e `deck-b-06-fotos-SEM-EXIF.png`. Os HTML são `deck-a.html` e `deck-b.html`.
- **Planilha:** `planilha-1.png` (A R1), `planilha-2.png` e `planilha-3.png` (B R1, duplicada), `planilha-4.png` (B R2), cada uma também na versão `-excel.png` (pior caso).
- **Scripts e dados:** `aval.cjs`, `fotos.cjs`, `shot-planilhas.cjs`, `resultado.json`, `fotos/`.
