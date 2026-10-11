# Avaliação do negociador: aba Escopos (deck, planilha ao fornecedor e passagem para a equalização)

Data: 02/10/2026. Tudo foi feito localmente, com o Google simulado (`tests/teste-escopos.cjs`). Nada no projeto foi alterado.

**Como reproduzir** (pasta `SP/aval-negociador/`):
- `node cenarios.cjs` grava e emite os dois escopos pela API real.
- `node render.cjs` gera os prints dos slides e da planilha.
- `node propostas.cjs` cria as propostas A, B e C e roda a tela real de equalização (`Interface.html` no Chrome).

Resultados, prints e log ficam em `out/`. Os principais: `propostas-log.txt`, `equalizacao-colagem-ingenua.png`, `equalizacao-colagem-filtrada.png`, `propostas-ABC.png`, `*-planilha.png` e `*-slide-*.png`.

## Nota: 5/10

A espinha dorsal é boa: há EAP com código, quantidade, unidade de lista fechada e marca de referência. A revisão congela quando é emitida, e o deck e a planilha mostram a mesma EAP. Mas a planilha que vai ao fornecedor:
- não trava nada;
- não calcula nada;
- deixa as condições comerciais em texto livre.

Na passagem para a equalização só o lado do escopo é aproveitado. O lado do fornecedor (preço, marca, condição) é digitado ou colado de novo. A colagem que a própria tela recomenda desalinha os preços sem avisar: na simulação ela gerou um saving falso de R$ 37.835 (−67%).

## Este escopo gera propostas comparáveis?

**Parcialmente.** Os itens e as quantidades chegam iguais aos três fornecedores, mas nada impede que voltem diferentes. Na simulação da elétrica (12 itens, 7 grupos), as três respostas "válidas" ficaram assim:

| | A (segue à risca) | B (mexe em linhas) | C (muda unidade e base) |
|---|---|---|---|
| Valor que o fornecedor realmente pede | R$ 13.672 | R$ 10.464 + mobilização a R$ 1.200/diária | R$ 8.899 sem ISS e ICMS, frete FOB |
| Total que ele declarou na planilha | 13.672 | 10.464 | **13.900** (não confere com as linhas) |
| Na grade, colando a coluna G inteira (como a tela sugere) | **38.231** | **56.172** | 18.337, e a grade ganhou 7 linhas fantasmas |
| Na grade, colando só as linhas de item (filtro manual no Excel) | 13.672 ✔ | 10.464, com o total certo e os itens trocados | **109.219** |
| Validade / pagamento / prazo | 30 d / 28 d / 20 d após a OS | 15 d / 30-60 / "3 sábados" | 5 d / 50% antecipado / "a combinar" |

Exemplos concretos do que deu errado:
- **Proposta B.** O fornecedor inseriu a linha "1.1.6 Terminais" (R$ 380) e apagou "1.2.2 Diagrama unifilar", com a observação "incluso no 1.2.1". Na grade, os R$ 380 caíram em "1.2.1 Reorganização do QD-01" e apareceram em verde como o menor preço. Os R$ 3.900 da reorganização foram para o diagrama. O total bate por coincidência, mas qualquer negociação item a item parte de números errados.
- **Proposta C.** O fornecedor cotou o cabo em "2 rolos de 100 m" a R$ 890. A grade multiplica 890 pelos 120 m do escopo e mostra C como o mais caro, quando ele é o mais barato. Os serviços de C vieram só na coluna Total (H) e por isso viraram "não cotou".
- **Marca.** C escreveu "similar" e "S" na marca ofertada. A regra real `cfMarcaDivergente_` (Exportar.gs:1517) considera "similar" compatível com "Hellermann ou similar" e "S" compatível com "Steck / WEG", porque compara por substring. Com isso, não sai alerta.

## Brechas que um fornecedor exploraria (por risco financeiro)

**1. A coluna de preço é colada por posição, não por código EAP. Risco: escolher o fornecedor errado ou registrar um saving falso.**
- **Exemplo:** colando G10:G28 da planilha do próprio sistema, as linhas de grupo vazias deslocam tudo em 2 posições. O preço do disjuntor (R$ 98) caiu na linha do cabo (120 m), e a barra mostrou "Saving R$ 37.835,20 (−67,4%)" (`out/equalizacao-colagem-ingenua.png`). Uma linha inserida ou apagada pelo fornecedor (caso B) desloca o resto sem nenhum aviso.
- **Onde:** `app/Interface.html:8271` (`colarColuna`), `:8202` (`linhasComPreco` ignora grupos, mas a planilha os tem) e a dica em `:3215`.
- **Correção:**
  - criar "Importar planilha do fornecedor": ler a .xlsx devolvida e casar as linhas pela coluna A (código EAP) e pelo ID/revisão da linha 4;
  - recusar códigos desconhecidos ou faltantes, listando-os;
  - enquanto isso, fazer a colagem ignorar linhas vazias que correspondam a grupos e avisar quando o número de linhas coladas não for igual ao número de itens.

**2. A planilha não protege nada e não calcula nada. Risco: unidade e quantidade trocadas, total incoerente.**
- **Exemplo:** C trocou a quantidade e a unidade (2 "rolo 100 m"), deixou o unitário em branco nos serviços e digitou um total de 13.900 que não é a soma das linhas. B inseriu e apagou linhas.
- **Onde:** `app/EscopoPlanilha.gs:39-73`. Não há `protect()`, `setDataValidation` nem fórmula: H e o total (linha `totalLinha`) ficam em branco para digitação (`:27`, `:69-70`). O teste chega a exigir ausência de fórmulas (`tests/teste-escopos.cjs:322`).
- **Correção:**
  - proteger as colunas A–E e as linhas de item, liberando só F, G, I e o cabeçalho;
  - H = C×G como fórmula, subtotal por grupo e total = SOMA;
  - validação numérica > 0 em G;
  - linhas reservadas e numeradas "Itens adicionais propostos pelo fornecedor (não substituem itens do escopo)".

**3. As condições comerciais são texto livre e o escopo não as fixa. Risco: no valor presente e no custo final.**
- **Exemplo:**
  - **Barreiras:** "Condição de pagamento: 28 dias" está enterrada em Considerações (linha 19 da planilha). Mesmo assim a célula amarela "Condição de pagamento" (F7) deixa o fornecedor escrever outra coisa, e C escreveu "50% antecipado".
  - **Validade:** "5 dias" (C) contra "30 dias" (A).
  - **Frete, impostos e DIFAL:** não há campo. C declarou "sem impostos, frete FOB" numa observação.
- **Onde:**
  - `app/EscopoPlanilha.gs:13-15` (células abertas);
  - `app/Escopos.gs:34-37` (o escopo não tem campos de pagamento, validade mínima, frete, impostos nem garantia);
  - `app/EscopoInterface.html:42` (tudo vira "Considerações").
- **Correção:** criar no escopo os campos estruturados "Condição de pagamento exigida", "Validade mínima (dias)", "Frete (CIF obra obrigatório)", "Preços com todos os tributos (S/N)" e "Garantia mínima (meses)". Eles devem sair pré-preenchidos e travados na planilha. Ao lado de cada um, uma célula "Aceita? Sim/Não + contraproposta" com lista suspensa, e mais uma linha fixa "Impostos inclusos? (Sim/Não) · Frete (CIF/FOB)".

**4. O aviso padrão "Este escopo tem caráter orientativo" anula o próprio escopo. Risco: aditivo.**
- **Exemplo:** é a frase final do deck e da planilha nos dois casos (slides 12 e 16, linhas 21 e 40 da planilha). O fornecedor que cota menos e depois pede aditivo cita exatamente isso: "o escopo era orientativo".
- **Onde:** `app/EscopoInterface.html:66` (valor inicial) e `app/EscopoSlides.gs:390` (texto usado quando o campo está vazio).
- **Correção:** trocar o texto padrão por: "Este escopo, na revisão Rn, é a base contratual da proposta. Itens, quantidades e unidades não podem ser alterados. Divergências, exclusões e itens adicionais devem ser declarados nos campos próprios da planilha; o que não for declarado considera-se incluso no preço."

**5. Marca "ou similar" sem critério de equivalência. Risco: material inferior.**
- **Exemplo:** "Hellermann ou similar" e "Schneider EasyPact ou similar". C ofertou "similar", e o alerta não dispara (ver acima). Além disso, "WEG DWB" contra "Schneider EasyPact ou similar" gera alerta, mesmo sendo uma oferta legítima: o sistema não distingue "ou similar" de marca exigida.
- **Onde:** `app/Escopos.gs:65` (referência em texto livre de 200 caracteres) e `app/Exportar.gs:1517-1522`.
- **Correção:**
  - separar no item os campos "Marca/modelo de referência" e "Aceita equivalente? (S/N)", mais "Requisitos de equivalência" (ex.: Icu ≥ 10 kA, curva C, NBR IEC 60898);
  - na planilha, a "Marca ofertada" deve exigir marca + modelo, recusando "similar", "equivalente" ou texto com menos de 3 caracteres;
  - em `cfMarcaDivergente_`, ignorar as palavras "similar", "ou" e "equivalente" e exigir token com ≥ 3 caracteres.

**6. Prazo de entrega e prazo de execução no mesmo campo, sem marco de início. Risco: multa impossível de aplicar e mobilização extra.**
- **Exemplo:**
  - **Barreiras:** "Entrega: 15 dias" (corridos ou úteis? a partir do pedido?).
  - **Elétrica:** "Execução: 20 dias", mas desligamentos só aos sábados das 7h às 13h. Isso dá 3 janelas, e B respondeu "3 sábados" e cobra R$ 1.200 por diária extra; C cobra +50% no sábado.
  - **Planilha:** a célula é única, "Prazo de entrega / execução" (`EscopoPlanilha.gs:15`).
- **Onde:** `app/Escopos.gs:37` (`prazo`, texto de 400 caracteres) e `app/EscopoPlanilha.gs:15`.
- **Correção:**
  - campos separados no escopo: "Prazo de entrega de materiais (dias corridos a partir do pedido)", "Prazo de execução (dias corridos a partir da OS)", "Janelas de trabalho" e "Nº máximo de mobilizações incluídas";
  - colunas de resposta numéricas na planilha;
  - validação de coerência quando houver restrição de horário.

**7. As linhas "verba" e "serviço" com quantidade 1 escondem o conteúdo. Risco: inclusão em disputa.**
- **Exemplo:** "3.1 Mobilização, ART e relatório — 1 verba". C cotou só a ART ("relatório não incluso"), e B tirou a mobilização. "1.1.5 Anilhas — 1 verba": C "incluso". A tela registra só "não cotou" (ver item 9).
- **Onde:** a lista de unidades em `app/EscopoInterface.html:166` aceita "verba" e "serviço" sem exigir composição.
- **Correção:** quando a unidade for verba ou serviço, exigir o campo "O que compõe" (aparece na planilha e no deck). Separar mobilização, ART e relatório em linhas próprias nos modelos (presets).

**8. O critério de aceite não é verificável. Risco: recebimento contestado.**
- **Exemplo:** "Testes funcionais aprovados" não diz quem aprova, com qual instrumento nem com qual valor. "Conferência da quantidade e da cor" não fala de dimensões, peso nem lastro. A barreira não tem altura, comprimento, massa nem norma; o "New Jersey" foi preenchido pelo comprador. O próprio objetivo (NR-10, NBR 5410) não vira critério mensurável.
- **Onde:** `app/Escopos.gs:36` (texto livre de 6.000 caracteres) e `app/EscopoInterface.html:42` (só um placeholder). `esValidarGeracao_` (`app/Escopos.gs:259-264`) não exige inclusões, exclusões, aceite nem prazo, e o diagnóstico só "recomenda" (`EscopoInterface.html:95-98`).
- **Correção:**
  - aceite em lista de linhas "Critério · Evidência · Valor-limite · Quem confere" (ex.: "Resistência de isolamento ≥ 1 MΩ · laudo de megômetro · por circuito · Facilities");
  - tornar obrigatório pelo menos um critério com evidência para emitir;
  - textos padrão por categoria (elétrica: termografia pós-serviço, laudo de isolamento, ART, as built em PDF/DWG; fornecimento: nota fiscal, ficha técnica, conferência dimensional).

**9. "Incluso em outro item" e "excluído" não têm como ser registrados. Risco: o comparativo acusa omissão onde há inclusão, ou o contrário.**
- **Exemplo:** "incluso no 1.2.1" (B e C) vira "não cotou". O mapa já sabe tratar `incluso_em_outro_item` e `excluido` (`Equalizacao.gs:451`, `:500`), mas a gravação pela tela só escreve `cotado` ou `nao_cotado` (`Equalizacao.gs:932`).
- **Correção:**
  - coluna "Situação" com lista (Cotado / Incluso no item __ / Excluído / Não cota) na planilha;
  - seletor por célula na grade, gravado em `STATUS_PRECO`.

**10. Distribuição por local, frete e descarga sem quantidade por ponto. Risco: frete ou descarga cobrados à parte.**
- **Exemplo:** a distribuição 20/4/4 das barreiras existe só no texto do grupo. Na planilha, "Local:" mostra o título do grupo, "Barreiras Plásticas Viárias", que não é um local.
- **Onde:** `app/EscopoPlanilha.gs:22-23`.
- **Correção:** permitir item com quantidades por local (subitens ou grupos-local) e mostrar o local de fato. Para fornecimento, linha fixa "Frete e descarga até o ponto: incluso no unitário (S/N)".

## O que falta na planilha do fornecedor

- Proteção de A–E e das linhas de item; validação numérica em G; fórmulas H = C×G, subtotal por grupo e total geral.
- Uma "Situação" por item (cotado / incluso no item / excluído / não cota) em vez de exclusões em observação livre.
- Uma área separada de "itens adicionais", com código próprio, que não quebre a numeração.
- Condições exigidas pré-preenchidas e travadas, com "aceita / contraproposta":
  - pagamento;
  - validade mínima;
  - frete CIF;
  - tributos inclusos (com o regime: ISS/ICMS/Simples);
  - garantia (meses);
  - prazo de entrega e prazo de execução em dias numéricos e separados;
  - mobilizações incluídas;
  - visita realizada em (data e nome de quem acompanhou).
- Campos de identificação: data e número da proposta e "declaro que cotei a Revisão Rn do Escopo ESC-…". A linha 4 diz a revisão, mas nada impede cotar a versão errada.
- Rótulos nas linhas de condição: endereço, objetivo, considerações e prazo saem sem título (linhas 14, 15, 19 e 20 da barreira).

## O que falta na passagem para a equalização

- **Importar a resposta do fornecedor.** `apiEscopoParaEqualizacao` (`app/Escopos.gs:277-298`) traz só o lado do escopo. Preço, marca ofertada, validade, pagamento, prazos e total declarado são digitados de novo para cada fornecedor:
  - 12 marcas × 3 fornecedores = 36 campos;
  - mais cerca de 6 campos comerciais por proponente (lista na tela: número, data, validade, condições, lead time, prazo de execução, total declarado…).
- **Casamento por código EAP**, não por posição (ver brecha 1).
- **Unidade e quantidade cotadas por fornecedor**, com conversão explícita (rolo de 100 m → m). Hoje a grade tem uma quantidade por linha, e a base "unitário/total" vale para a cotação inteira (`Interface.html:3200-3205`), então C (que misturou as duas) exige conta manual.
- **Vínculo estruturado com o escopo.** A tabela `Equalizacoes` não tem `ID_ESCOPO` nem `REVISAO_ESCOPO` (`app/Config.gs:282-321`). A origem fica só como texto em `detalhamento`, e a grade continua editável: dá para mudar a quantidade depois de aplicar o escopo, sem alerta de divergência com a revisão enviada.
- **Condições estruturadas.** As condições do escopo chegam como um texto único em "Premissas" (`Escopos.gs:289-293`), sem campos para comparar com o que cada fornecedor respondeu (ex.: "exigido 28 d · B ofereceu 30/60").
- **Alerta automático de total declarado diferente da soma das linhas.** `VALOR_TOTAL_DECLARADO` e `VALOR_TOTAL_CALCULADO` existem no schema, mas só servem se forem preenchidos à mão.

## 5 melhores pontos

1. **EAP numerada idêntica no deck, na planilha e na grade** (1.0 / 1.1 / 1.1.1). O código usado é o mesmo (`esNumerarEap_`, Escopos.gs:302). É a base certa para casar por código.
2. **Revisão congelada na emissão**, com a planilha e o deck carimbados "Escopo ID · Revisão n", e importação da revisão enviada, não da última (Escopos.gs:165-170, 277-281).
3. **Unidade de lista fechada, quantidade obrigatória > 0 e item vinculado a um grupo de serviço** (Escopos.gs:56-67, 312-318). Sem isso nem haveria discussão de equalização.
4. **A marca de referência viaja até o mapa**, e o mapa acusa "não cotou X de Y itens", "sem marca" e "marca divergente" listando os itens (Equalizacao.gs:465-540). É munição pronta para cobrar o fornecedor, desde que a regra de "similar" seja corrigida.
5. **Página própria de Inclusões / Exclusões / Critérios de aceite no deck e na planilha**, com diagnóstico do que falta antes de emitir. O formato está certo; falta exigir o conteúdo e torná-lo verificável.

## As 3 mudanças que mais reduziriam aditivo e retrabalho de negociação

1. **Importar a planilha devolvida casando pelo código EAP e pelo ID/revisão**, preenchendo na grade os preços, a marca ofertada, a situação por item e as condições comerciais, e recusando códigos desconhecidos ou faltantes com a lista. Isso elimina a redigitação e o desalinhamento silencioso que hoje produz um saving falso.
2. **Planilha travada e calculada:** colunas do escopo protegidas, H = C×G, subtotais e total por fórmula, coluna "Situação" com lista, área própria para itens adicionais e condições exigidas pré-preenchidas com "aceita / contraproposta" (pagamento, validade, frete, tributos, garantia, entrega ≠ execução, mobilizações).
3. **Texto e campos contratuais no escopo:**
   - trocar "caráter orientativo" por "base contratual; o não declarado considera-se incluso";
   - aceite em tabela critério/evidência/valor/responsável, obrigatório para emitir;
   - verba e serviço exigem composição;
   - "ou similar" vem com requisitos mínimos de equivalência.

   Isso fecha as portas do "não estava no escopo" e dá base objetiva para recusar na entrega.
