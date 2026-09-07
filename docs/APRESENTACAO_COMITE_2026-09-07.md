# Capital Fornecedores — Apresentação ao Comitê
## Concurso da Melhor Ideia 2026 · Capital Realty & Demercado
**Data:** 07/09/2026 · **Autor:** Guilherme Marques · **Área:** Suprimentos / Facilities

> **Regra desta apresentação:** tudo o que já funciona está marcado **✅ FUNCIONA HOJE** e pode ser demonstrado ao vivo.
> Tudo o que ainda não existe está marcado **🔜 SERÁ IMPLEMENTADO**, com prazo.
> Não há nada nesta apresentação em estado intermediário não declarado. Se o comitê pedir para ver algo marcado com ✅, eu abro na hora.

---

## 1. Em uma frase

Tiramos a equalização de compras de uma planilha `.xlsx` avulsa e a colocamos num sistema que **guarda memória** — de preço, de fornecedor e, agora, de desempenho pós-serviço. O software está construído e implantado. **O que ainda falta não é código: é uso real.** E é sobre isso que peço a orientação do comitê hoje.

---

## 2. O problema, com evidência de campo

Não partimos de suposição. Analisamos **45 documentos reais** do acervo de Facilities e Engenharia. O que encontramos:

| Achado | Consequência prática |
|---|---|
| A numeração da EAP tem buracos — faltam os itens 11, 15, 22, 24 e 26 na LPU do contrato | Numeração mantida à mão apodrece. Duas planilhas do mesmo serviço não conversam |
| **A negociação vive fora da planilha.** Contratou-se por R$ 70.000 e a EAP mostra R$ 80.563,38 | O valor real do contrato não está no arquivo que documenta a compra |
| As 3 colunas de proponente estouraram por atributo: 3 fornecedores × 3 campos = 9 colunas | O que decidiu a compra estava numa observação em texto: *"NÃO emite laudo PMOC"* |
| O mesmo fornecedor aparece com **5 grafias diferentes** para 2 CNPJs | Não há como somar o que se gastou com quem |
| `Cód. Fornecedor` veio vazio em **10 de 10** documentos | O CNPJ é a única chave real que existe |

E o achado central: **cada arquivo EQU é um retrato isolado.** O preço pago no mês passado, pelo mesmo item, no mesmo Mega, não está ao alcance de quem compra hoje.

---

## 3. O que já funciona — demonstrável ao vivo

### ✅ FUNCIONA HOJE

**Equalização em tela, sem fórmula quebrada.** Árvore de EAP com numeração **derivada da posição**, nunca digitada — o problema dos buracos deixa de existir por construção. Número livre de proponentes: as 3 colunas não estouram mais.

**Memória de preço por item ao longo do tempo.** A pergunta *"quanto pagamos por isso da última vez?"* passa a ter resposta em segundos, com faixa (menor a maior) e variação percentual. Isso é o que a planilha nunca teve.

**Cadastro por CNPJ com BrasilAPI.** Razão social, CNAE e situação cadastral vêm sozinhos. E a cadeia é resiliente: cadastro local → cache de 24h → API. **Se a BrasilAPI cair durante esta apresentação, o sistema continua funcionando.**

**Documento de aprovação para a Diretoria.** Exportação em Sheets e PDF, sem uma única fórmula — é um retrato estático, não recalcula sozinho. Traz no topo a proposta indicada, o valor, a economia da disputa e as ressalvas nomeando **quais itens** cada fornecedor deixou de cotar ou cotou com marca diferente da pedida.

**Governança de marca.** "Papel higiênico Coala" e "Papel higiênico Pato" têm a mesma descrição e **não são o mesmo item**. O sistema distingue quem cotou a marca pedida, quem cotou outra, e quem cotou sem dizer qual — as três situações aparecem separadas no documento.

**Importação do acervo antigo**, idempotente por hash: importar duas vezes não duplica, e há desfazer.

**Avaliação pós-serviço e IQF.** Formulário de cinco critérios, respondido em menos de um minuto, com fila de pendências no topo da tela. **E a nota do fornecedor aparece na coluna dele na cotação seguinte** — quem avalia colhe o benefício na próxima contratação.

> **Sobre a adesão, que é onde a avaliação fracassou no passado.**
> Prometemos a este comitê três mecanismos de adesão. **Dois estão funcionando:** o painel de pendências, que mostra a quem abre o sistema o que está devendo, e a retroalimentação — a nota aparecendo na tela do comprador na cotação seguinte, que é o que torna avaliar um investimento e não um favor.
> O terceiro, o **aviso ativo por e-mail e chatbot**, está mapeado para a versão seguinte e explico adiante por que não foi ligado agora.

**Qualidade de engenharia.** 16 suítes de teste, **827 asserções**, e o deploy é bloqueado se qualquer teste falhar. Cada correção entrou com um teste que foi **verificado por mutação**: quebramos o código de propósito para confirmar que o teste reprova.

> **Ressalva honesta sobre esse número:** cerca de 112 das 827 asserções verificam estrutura do código, não comportamento. As demais executam o código de verdade em sandbox. Prefiro dar o número com a ressalva a dar o número redondo.

---

## 4. O que ainda NÃO fizemos — e será implementado

Esta é a parte que peço ao comitê ler com atenção, porque é onde está o trabalho que resta.

### 🔜 SERÁ IMPLEMENTADO — até 20/09

**Os cinco critérios exatamente como foram prometidos a este comitê.**
Na minuta que enviamos, os critérios ponderados eram: Qualidade Técnica 30%, Pontualidade/SLA 25%, **Segurança do Trabalho e SST 20%**, Atendimento 15%, **Limpeza e Organização 10%**.
O sistema hoje tem cinco critérios em **média simples**, e dois deles não são os prometidos: entraram Conformidade e Documentação; **faltam Segurança do Trabalho e Limpeza** — justamente os dois mais específicos de condomínio logístico.
Vamos alinhar o sistema à promessa: os cinco critérios corretos, com os pesos corretos, e o IQF na escala **0 a 100 com Classes A / B / C**, como descrito na minuta.

**Validação de cotação mínima.**
Hoje o sistema permite homologar uma compra de R$ 80 mil com uma proposta só. A estrutura de faixas de valor × número mínimo de cotações já existe na base; falta ligá-la à homologação.

**As três divergências de dados do acervo.**
O diagnóstico está pronto e aponta três equalizações com inconsistência entre o total declarado e a soma dos itens — uma delas com fator 12×. São erros que vieram da planilha original, não do sistema, mas precisam sair da base antes de qualquer demonstração.

### 🔜 SERÁ IMPLEMENTADO — até 30/09

**Alerta de variação de preço na hora da digitação.**
Hoje a consulta ao histórico existe, mas em outra tela e sob demanda. A diferença entre *"o sistema avisa"* e *"o comprador lembra de ir olhar"* é a diferença entre um produto e um relatório. O alerta vermelho na própria linha, comparando com o histórico daquele item, é o que fecha essa distância.

**Registro do comportamento de cotação no fechamento.**
Prometemos ao comitê uma segunda frente de avaliação, de atrito zero: no momento de homologar, registrar se o proponente respondeu ao convite, apresentou proposta completa e honrou validade e prazo. É um dado que hoje não é medido em lugar nenhum e que já se sabe na hora de fechar. Ainda não foi feito.

**Megas e empresas em tabela, não no código.**
Hoje os três Megas estão fixos no código. Abrir um quarto Mega exigiria alteração de programa. Para o argumento de escala — Obras, Demercado, 2027 — isso precisa virar cadastro.

### 🔜 SERÁ IMPLEMENTADO — durante o piloto (setembro/outubro)

**Catálogo canônico com unidade base.** Para comparar "pacote de 500 g" com "quilo", o sistema precisa de um fator de conversão por item. A estrutura existe; falta preencher, e isso só se faz com uso real.

### 🔜 VERSÃO FUTURA — mapeado, viável, fora do escopo desta entrega

**Aviso ativo ao gestor: e-mail e chatbot.**

Hoje a avaliação pendente aparece como **fila no topo da tela de Fornecedores** — quem abre o sistema vê o que está devendo. O que ainda não existe é o sistema **ir atrás** do gestor.

Isso é deliberado, e vale explicar o porquê: notificação automática é fácil de ligar e difícil de desligar. Disparar e-mail para gestor de Mega antes de haver piloto rodando é ensinar a equipe a ignorar a mensagem — e essa educação, uma vez dada, não se desfaz. Preferimos ligar o aviso quando houver o que avisar.

O desenho já está mapeado e é tecnicamente viável na plataforma atual:

| Canal | Quando dispara | Conteúdo |
|---|---|---|
| **E-mail** | Ao homologar a compra, e depois como lembrete enquanto pendente | Link direto para a avaliação **daquela** compra, sem navegação |
| **Chatbot** | Mesmo gatilho, canal alternativo | Mesma avaliação respondível na conversa, para quem está no Mega e não abre e-mail |
| **Painel por empreendimento** | Contínuo | Pendências de avaliação visíveis à coordenação, por Mega |

O que o sistema já tem pronto para sustentar isso: a fila de pendentes calculada (`cfAvaliacoesPendentes_`), o vínculo da avaliação com a compra e com o Mega, e o registro de quem avaliou vindo do login.
O que falta construir: o gatilho, o texto da mensagem e a rota de link direto.

**Estimativa: 6 a 10 horas**, e há caminho disponível internamente para o canal de chatbot.

---

## 5. Os números que ainda não temos — e por quê

Sou direto: **os dois números que mais interessam ao comitê ainda não existem.**

| Métrica prometida | Situação real hoje |
|---|---|
| Redução de tempo por equalização (−70%) | **Não medida em nenhum dos dois lados.** A instrumentação está pronta e mede sozinha; nenhuma medição foi feita ainda |
| Saving gerado | **Não apurado.** O dado existe na base; falta consolidar |
| Adesão à avaliação (>90%) | **0 avaliações.** O formulário e a fila existem; o aviso ativo fica para a versão futura |
| Equalizações reais rodadas no sistema | **Nenhuma.** As que estão na base são de teste e do acervo importado |

**Por que não medimos ainda:** a ferramenta ficou pronta há poucos dias e a prioridade foi terminar o que se demonstra. Foi uma escolha e ela tem um custo — este.

**O que isso significa para o julgamento:** hoje eu consigo defender *"a ferramenta existe, funciona, está testada e implantada, e aqui está o plano"*. Ainda **não** consigo defender *"aqui está o impacto medido"*. Prefiro dizer isso ao comitê do que ser desmontado na terceira pergunta.

**Uma janela que se fecha sozinha:** a medição do tempo **no Excel** só pode ser feita enquanto o Excel ainda estiver em uso. Depois que ele sair, o "antes" é perdido para sempre. É a tarefa mais barata do projeto — cronometrar três equalizações — e a mais urgente.

---

## 6. Plano até o relatório final (15/10)

| Semana | O que acontece | Resultado esperado |
|---|---|---|
| **08–12/09** | Cronometrar 3 equalizações no Excel · corrigir as 3 divergências · alinhar os 5 critérios ponderados | Linha de base do "antes" registrada |
| **15–19/09** | Validação de cotação mínima · Megas e empresas em cadastro | Governança de compra amarrada na homologação |
| **22–26/09** | Piloto: primeiras compras reais no sistema · avaliações começam a entrar | Primeiros dados de verdade |
| **29/09–10/10** | Alerta de variação · piloto continua · consolidação de saving e tempo | Números apurados |
| **até 15/10** | Relatório final com os indicadores medidos | Entrega no prazo do regulamento |

**Meta realista do piloto:** 8 a 12 equalizações reais e as avaliações correspondentes. Não é uma amostra grande, e não vou apresentá-la como se fosse. É o suficiente para uma mediana de tempo com ressalva honesta de amostra.

---

## 7. O que peço ao comitê

1. **Autorização para rodar o piloto em Facilities**, nos Megas Curitiba e Esteio, durante setembro e outubro.
2. **Definição de quem preenche a avaliação pós-serviço**: o gestor do Mega, que viu o serviço acontecer, ou Suprimentos, que conduziu a compra. O sistema já grava o papel de quem avaliou, então dá para começar com um e ajustar — mas a orientação do comitê aqui vale mais que a minha escolha.
3. **Aval para a medição do tempo no Excel esta semana**, antes que a janela feche.

---

## 8. Anexo — a régua que usei comigo mesmo

Submeti o sistema a uma auditoria linha a linha, verificando cada promessa contra o código-fonte, nunca contra outro documento. O resultado:

- **Entregue e funcionando:** motor de EAP, importador, consulta de preço, exportação, marcas, ecossistema de fornecedores, avaliação pós-serviço, retroalimentação na tela de decisão.
- **Entregue mas sem dado:** taxa de vitória, IQF, saving, histórico — o código está pronto e a base está vazia.
- **Não entregue, com prazo nesta apresentação:** alerta de variação, cotação mínima, critérios ponderados como prometidos, comportamento de cotação no fechamento.
- **Mapeado para versão futura:** aviso ativo ao gestor por e-mail e chatbot.

Nenhum desses quatro grupos foi apresentado aqui como pertencendo a outro.

**Números do estado atual:** 18.395 linhas de produção, 6.095 de teste, 827 asserções, 123 commits, suíte passando integralmente, código implantado e versionado.

---

*Documento gerado em 07/09/2026 a partir de auditoria do código-fonte. Os itens marcados 🔜 não estavam implementados na data desta apresentação.*
