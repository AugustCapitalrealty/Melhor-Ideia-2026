# Capital Fornecedores — Apresentação ao Comitê
## Concurso da Melhor Ideia 2026 · Capital Realty & Demercado
**Data:** 08/09/2026 · **Autor:** Guilherme Marques · **Área:** Suprimentos / Facilities

> **Regra desta apresentação:** tudo marcado **✅ FUNCIONA HOJE** pode ser aberto ao vivo, agora, nesta sala.
> Tudo marcado **🔜** ainda não existe, e vem com prazo.
> Não há nada aqui em estado intermediário não declarado.
>
> *Esta versão substitui a de 07/09, que listava como pendentes cinco itens entregues desde então.*

---

## 1. Em uma frase

O comitê pediu que a avaliação de prestadores deixasse de ser uma funcionalidade subutilizada e virasse **ferramenta estratégica de gestão**. Os cinco pontos nomeados na orientação estão **funcionando em código hoje**. O que ainda falta não é software — é volume de uso, e ele já começou.

---

## 2. A orientação do comitê, ponto por ponto

O e-mail de 19/05 pediu cinco detalhamentos. Esta é a resposta de cada um, verificada contra o código-fonte:

| O que o comitê pediu | Situação | Evidência |
|---|---|---|
| **Definição dos critérios de avaliação** | ✅ FUNCIONA HOJE | Os cinco critérios exatamente como esta minuta os recebeu: Qualidade Técnica **30%**, Pontualidade/SLA **25%**, Segurança e SST **20%**, Atendimento **15%**, Limpeza **10%**. O sistema recusa iniciar se os pesos não somarem 100 |
| **Automatização após cada Ordem de Compra** | ✅ FUNCIONA HOJE | Ao homologar a compra, o e-mail de avaliação **dispara sozinho**, com link direto que abre a avaliação daquela compra específica — sem navegação, sem procurar, respondível pelo celular em menos de um minuto |
| **Consolidação de indicadores gerenciais** | ✅ FUNCIONA HOJE | **IQF** (Índice de Qualificação do Fornecedor) de 0 a 100, em Classes A / B / C. **Painel de saving** por mês, por Mega, por categoria e por negociador |
| **Geração de histórico de desempenho** | ✅ FUNCIONA HOJE | Ficha 360° do prestador: cadastro, contatos, disputas, preço por item ao longo do tempo — e o **comportamento de cotação** registrado na homologação: respondeu ao convite, cotou completo, honrou validade e prazo |
| **Aplicação prática na tomada de decisão** | ✅ FUNCIONA HOJE | A nota do fornecedor aparece **na coluna dele, na tela onde a compra é decidida**, e no documento que vai à Diretoria. Não é relatório que alguém precisa lembrar de abrir |

**O quinto item é o que fecha o ciclo, e é o que faltava no modelo anterior.** Avaliar deixa de ser burocracia e vira investimento: quem avalia colhe o benefício na cotação seguinte, porque a nota está na tela na hora de escolher.

---

## 3. "Isso já não existe no Fluig?"

É a pergunta certa, e a resposta é curta:

> **O Fluig já tem o formulário. Ele não falhou por falta de formulário — falhou por falta de gatilho e de consequência.**
>
> Não construí outro formulário. Construí o **gatilho**, que dispara sozinho na Ordem de Compra, e a **consequência**, que é a nota aparecer na tela do comprador na próxima cotação.
>
> Sem essas duas coisas, qualquer formulário volta a ser subutilizado — inclusive um novo.

**Nesta fase a solução roda fora do Fluig, e isso é decisão consciente.** A integração do disparo a partir do encerramento da medição depende de alteração em processo de outra área, com TI e Suprimentos. Colocar essa dependência no caminho crítico de 2026 seria trocar entrega por reunião.

O ciclo já é obrigação contratual — Nota Fiscal só após a Ordem de Compra, número da OC obrigatório na Nota, e Acordo de Nível de Serviço apresentado mensalmente junto ao faturamento. O que esta entrega faz é tornar esse ciclo **operável e mensurável agora**, com a porta aberta para integrar depois.

---

## 4. O que a planilha nunca soube fazer

### ✅ A marca à vista, sem abrir a proposta

Quando o item é tubo ou conexão, **usar Tigre é exigência da diretoria**. Na planilha, descobrir quem respeitou isso exigia abrir os PDFs das três propostas e procurar.

No sistema, a marca de referência fica gravada no item e a marca cotada fica ao lado do preço de cada proponente. **O comprador vê na própria grade quem cotou Tigre e quem cotou outra coisa**, e o documento que vai à Diretoria marca a divergência com `≠ referência`, nomeando o item.

Isso não é conforto de interface. É o que separa duas compras diferentes:

> A proposta mais barata que trocou Tigre por marca genérica **não é a mais barata. É outra compra.** Comparar as duas pelo preço é comparar coisas que não são a mesma coisa.

O sistema distingue três situações, e elas aparecem separadas no documento: quem cotou a marca pedida, quem cotou outra, e quem cotou **sem dizer qual** — que é o caso mais perigoso, porque na planilha parecia conformidade.

O mesmo vale para consumo e limpeza: "papel higiênico Coala" e "papel higiênico Pato" têm a mesma descrição e não são o mesmo produto.

### ✅ Memória de preço entre cotações

Cada arquivo `EQU.xlsx` é um retrato isolado. O preço pago mês passado, pelo mesmo item, no mesmo Mega, não está ao alcance de quem compra hoje.

Aqui a pergunta *"quanto pagamos por isso da última vez?"* tem resposta em segundos — e mais: **o sistema avisa sozinho durante a digitação**, com alerta na própria linha quando o preço sobe mais de 15% ou cai mais de 10% contra o histórico daquele item.

A diferença entre *o sistema avisa* e *o comprador lembra de ir olhar* é a diferença entre um produto e um relatório.

---

## 5. O saving: medir o que nunca foi medido

**Hoje a empresa paga pela negociação e não vê o retorno dela.** O tempo que o time gasta negociando com fornecedor é custo real — horas de analista, de coordenação, de gestor. Esse custo aparece na folha. O que ele produziu, não aparece em lugar nenhum.

O sistema passa a apurar exatamente isso: **a diferença entre a proposta inicial do fornecedor e o valor efetivamente contratado**, compra a compra, consolidada **por mês, por Mega, por categoria e por negociador**.

O que isso entrega à companhia, e que hoje não existe:

- **Quanto os nossos times economizaram neste mês. E no ano.**
- Onde a negociação rende mais — por Mega e por categoria de serviço
- Quem negocia, e quanto essa negociação trouxe de volta

O trabalho de negociar deixa de ser esforço invisível e vira **número apresentável à Diretoria**. É a evidência de que a área não é centro de custo: é o time que traz dinheiro de volta.

**E o painel não inventa número.** O saving só existe quando três coisas estão juntas: a compra foi homologada, sabe-se qual proposta venceu, e o valor inicial dela foi registrado. Faltando qualquer uma, a tela mostra `—` e explica por quê. Contratar por mais que a proposta inicial não vira "saving negativo": é escopo que mudou no meio, e chamar isso de economia ou de prejuízo seria inventar uma leitura que o dado não sustenta.

O denominador fica à vista ao lado do resultado, sempre. Um saving de R$ 40 mil sobre R$ 200 mil contratados é uma coisa; sobre R$ 4 milhões é outra. Apresentar o numerador sozinho é o tipo de número que não sobrevive à segunda pergunta.

---

## 6. Os números que ainda não temos — e o que já está em campo

Sou direto: os indicadores de impacto ainda não estão apurados, e não vou apresentá-los como se estivessem.

| Métrica | Situação hoje |
|---|---|
| Tempo por equalização — o "depois" | ✅ Medido automaticamente pelo sistema, do primeiro campo digitado até gravar, com o tamanho junto (itens e proponentes) |
| Tempo por equalização — o "antes", na planilha | 🔜 **Em campo agora: dois analistas estão cronometrando.** É o dado que fecha a conta |
| Saving apurado | 🔜 O motor está pronto e testado; falta o volume de compras reais passar por ele |
| IQF com base estatística | 🔜 1 avaliação registrada. A tela marca a nota como **preliminar** enquanto a amostra for pequena — o selo não mente sobre o que o sustenta |
| Equalizações reais rodadas no sistema | 🔜 O piloto começa agora |

**Por que a medição do "antes" não podia esperar:** ela só pode ser feita enquanto o Excel ainda estiver em uso. Depois que a operação migrar, ninguém volta ao Excel para cronometrar, e o "antes" é perdido para sempre. É a única tarefa do projeto cuja janela fecha sozinha — por isso está sendo feita esta semana, por dois analistas, antes de qualquer outra coisa.

---

## 7. Plano até o relatório final (15/10)

| Período | O que acontece | Resultado |
|---|---|---|
| **08–12/09** | Cronometragem do Excel pelos dois analistas · limpeza das divergências do acervo importado | Linha de base do "antes" registrada |
| **15–19/09** | Piloto começa: primeiras compras reais nos Megas Curitiba e Esteio | Dados de verdade entrando |
| **22–30/09** | Piloto corrente · primeiras avaliações pós-OC chegando · alinhamento final com o comitê **(a janela de consultoria fecha em 30/09)** | IQF sai da amostra de 1 |
| **01–09/10** | Consolidação: saving apurado, tempo dos dois lados, adesão à avaliação | Números fechados |
| **até 15/10** | Relatório Final protocolado no RH | Entrega no prazo do regulamento |

**Atenção ao calendário:** 10/10 cai num sábado. O último dia útil de implementação é sexta, **09/10** — um dia a menos do que o calendário sugere.

**Meta honesta do piloto:** 8 a 12 equalizações reais com as avaliações correspondentes. Não é amostra grande e não será apresentada como se fosse. É suficiente para uma mediana com ressalva declarada.

---

## 8. O que peço ao comitê

1. **Autorização para o piloto em Facilities**, nos Megas Curitiba e Esteio, em setembro e outubro.
2. **Definição de quem preenche a avaliação pós-serviço**: o gestor do Mega, que viu o serviço acontecer, ou Suprimentos, que conduziu a compra. O sistema já grava o papel de quem avaliou, então dá para começar com um e ajustar — mas a orientação do comitê aqui vale mais que a minha escolha.
3. **Validação dos cinco critérios e seus pesos** como definitivos para 2026, para que as avaliações do piloto já entrem na régua final.

---

## 9. Anexo — estado do código e método de apuração

**Números de hoje, contados no commit `52332e5`:**

| | |
|---|---:|
| Linhas em produção (24 arquivos `.gs` + `Interface.html`) | 22.136 |
| Arquivos de teste automatizado | 30 |
| Asserções na suíte | 1.093 |
| Commits | 144 |
| Custo de infraestrutura | **R$ 0,00** |

**A disciplina de teste, que é o que sustenta o número acima:** cada teste foi **verificado por mutação** — o código de produção foi quebrado de propósito para confirmar que o teste **reprova**. Teste que passa com o código quebrado é teatro, e vale menos que nada, porque dá confiança falsa. Duas vezes esse método revelou que o defeito estava no teste, não no sistema.

**O deploy é bloqueado se qualquer teste falhar.** Não é política escrita num documento: é o comando de publicação que se recusa a rodar.

**Ressalva sobre as 1.093 asserções:** parte delas verifica estrutura do código-fonte — que um campo existe, que uma função é chamada — e não comportamento em execução. A maioria carrega os arquivos e executa o sistema de verdade em sandbox. Declaro a ressalva porque o número redondo sem ela seria maquiagem.

**Sobre a dependência externa:** a consulta de CNPJ usa a BrasilAPI, serviço comunitário sem SLA. O dado é indício útil, não certidão. A cadeia é resiliente — cadastro local, depois cache de 24h, depois a API — e **se a BrasilAPI cair durante esta apresentação, o sistema continua funcionando**.

---

*Documento gerado em 08/09/2026 a partir de auditoria direta do código-fonte no commit `52332e5`. Nenhum item marcado ✅ foi verificado contra outro documento: todos foram verificados contra o código que roda.*
