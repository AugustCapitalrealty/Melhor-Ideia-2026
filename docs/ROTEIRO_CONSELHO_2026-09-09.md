# Roteiro falado — Conselho

**Data:** 09/09/2026 · **Para:** Guilherme Marques · **Base:** deck `Apresentacao_Conselho.gs` corrigido no commit desta data

> Isto não é a apresentação. É o que você fala **em cima** dela, a ordem em que abre os assuntos, e o que responder quando perguntarem o que dói. Cada número citado aqui foi verificado contra o código; os que não foram estão na seção "O que você não pode dizer".

---

## A regra da sala

**Você ganha esta apresentação sendo o único que sabe o que não sabe.**

Um conselho de gestores já viu dezenas de projetos com número redondo e slide bonito. O que ele quase nunca vê é alguém que chega dizendo "isto aqui funciona, isto aqui não, e este número eu ainda não tenho". Essa é a sua vantagem competitiva, e ela some no instante em que você defender um número que não sustenta.

Se em algum momento você não souber, a resposta é **"não sei, e vou apurar até tal dia"**. Ela custa dez segundos. Um número inventado custa a apresentação inteira.

---

## O arco, em cinco movimentos

### 1. A dor, em trinta segundos — não mais

Abra pelo achado mais concreto, não pela solução:

> "Analisamos 45 documentos reais de compra do acervo. Num deles, contratou-se por R$ 70 mil e a planilha registra R$ 80.563. O valor real do contrato não está no arquivo que documenta a compra."

Pare aí. Deixe o silêncio trabalhar. **Não conte a solução ainda.**

Se quiser uma segunda: a numeração da lista do contrato pula os itens 11, 15, 22, 24 e 26. Numeração mantida à mão apodrece.

### 2. O que existe hoje — demonstre, não descreva

A frase que organiza: **"a planilha equaliza, mas não lembra."**

Três coisas, e só três. Mais que isso vira lista e a sala desliga:

- **Memória de preço.** "Quanto pagamos por isso da última vez" passa a ter resposta em segundos — e o sistema avisa sozinho na digitação quando o preço sobe mais de 15% ou cai mais de 10% contra o histórico.
- **A marca à vista.** Quando o item é tubo, usar Tigre é exigência da diretoria. Antes, conferir isso exigia abrir três PDFs. Agora está na grade, e o documento que vai à Diretoria marca quem cotou fora da referência.
- **O laço.** A nota do fornecedor aparece na coluna dele na tela onde a compra é decidida. Avaliar deixa de ser favor e vira investimento.

**Se puder abrir o sistema ao vivo, abra.** Um comitê que vê a tela funcionar não pergunta se ela funciona.

### 3. A pergunta do Fluig — antes que perguntem

Não espere. Traga você mesmo, porque quem traz o próprio ponto fraco controla como ele é discutido:

> "Vocês vão perguntar se isso já não existe no Fluig. Existe: o formulário está lá. Ele não falhou por falta de formulário — falhou por falta de **gatilho** e de **consequência**. Eu não construí outro formulário. Construí o gatilho, que dispara sozinho na Ordem de Compra, e a consequência, que é a nota aparecer na tela do comprador na próxima cotação. Sem essas duas coisas, qualquer formulário volta a ser subutilizado. Inclusive um novo."

E emende com a decisão, sem pedir desculpa por ela:

> "Nesta fase roda fora do Fluig, e foi decisão. Integrar depende de mexer em processo de outra área, com TI e Suprimentos. Colocar isso no caminho crítico de 2026 seria trocar entrega por reunião."

### 4. O que ainda não temos — você diz primeiro

Este é o movimento que decide a sua credibilidade na sala:

> "Os dois números que mais interessam a vocês eu ainda não tenho. Zero equalização real rodou no sistema. Uma única avaliação registrada. O saving nunca foi somado, porque só entra compra homologada e ainda não houve. Prefiro dizer isso agora do que ser desmontado na terceira pergunta."

E imediatamente mostre que está resolvido, não abandonado:

> "Dois analistas estão cronometrando as equalizações no Excel esta semana. É a única medição do projeto cuja janela fecha sozinha: depois que a operação migrar, ninguém volta ao Excel para cronometrar, e o 'antes' é perdido para sempre."

### 5. Os planos — e o pedido

As três frentes, com a faixa que você não pode omitir: **nenhuma tem código escrito.**

| Frente | Uma frase |
|---|---|
| **Convite com escopo** | O processo passa a começar quando a CR define o que quer comprar, não quando as propostas chegam. Todo mundo cota o mesmo escopo |
| **Portal do Fornecedor** | O fornecedor responde dentro do sistema, sem ver o preço dos outros. É a outra metade do convite |
| **Custo real de MEI** | Sinalizar quando o proponente é MEI e o serviço gera 20% de encargo sobre a mão de obra. A proposta mais barata pode não ser a mais barata |

Feche com os três pedidos, nesta ordem:

1. Autorização para o piloto em Facilities, Curitiba e Esteio, em setembro e outubro
2. Definição de quem preenche a avaliação: o gestor do Mega ou Suprimentos
3. Validação dos cinco critérios e pesos como definitivos para 2026

---

## As perguntas difíceis

### "De onde vêm os R$ 5,1 milhões?" — a mais perigosa hoje

**Não cite esse número até confirmar na base.** Ele aparece nos documentos do projeto, mas nenhum dado do repositório o produz, e há contradição interna: o código do importador fala em **312 fornecedores** enquanto os documentos falam em **179**.

Se você já tiver confirmado na planilha antes da reunião, cite com a fonte: *"são as compras da plataforma dos últimos nove meses, importadas em tabela separada"*. Se não tiver confirmado:

> "O importador trouxe o histórico de compras da plataforma. O número exato eu confirmo e mando — não quero citar de cabeça."

**Ponto importante que protege você:** essas compras entraram numa tabela `Contratacoes`, **separada de `Equalizacoes`**, de propósito. Somadas, o número de equalizações declarado ao comitê saltaria de 4 para centenas — e nenhuma delas foi equalizada aqui. Se alguém perguntar por que não contam como equalização, essa é a resposta, e ela mostra rigor.

### "Qual é a nota do projeto?"

O 8,95/10 que circula nos documentos é **auto-atribuído**, não veio da banca. Não apresente como nota.

> "Fiz uma auditoria do próprio projeto contra os critérios do regulamento, para saber onde eu estava fraco. Ela me deu um diagnóstico, não uma nota — quem dá nota são vocês. O que ela apontou é que meu ponto fraco é impacto medido, e é nele que estou trabalhando."

### "Quanto custa?"

> "Zero de infraestrutura. Roda em Google Apps Script, sobre o Workspace que a companhia já contrata. Não tem servidor, não tem licença nova, não tem contrato de terceiro."

### "E se você sair da empresa?"

Pergunta clássica de conselho, e a mais legítima de todas. Não minimize:

> "Hoje é dependência real de uma pessoa, e reconheço. O que reduz isso: o código está versionado no GitHub, tem 31 suítes de teste automatizadas que bloqueiam a publicação se qualquer uma falhar, e a documentação registra as decisões e o porquê de cada uma. Quem assumir tem por onde começar. Sustentação por uma segunda pessoa é conversa que eu queria ter com vocês."

### "Por que devo acreditar que os testes servem para alguma coisa?"

Aqui você tem uma resposta que quase nenhum projeto tem:

> "Cada teste foi verificado por mutação: a gente quebra o código de propósito e confirma que o teste reprova. Teste que passa com o código quebrado é teatro, e vale menos que nada porque dá confiança falsa. Duas vezes esse método mostrou que o defeito estava no teste, não no sistema."

E se quiser ser exemplar, diga o que a auditoria de hoje encontrou:

> "Rodando os testes de mutação agora, um deles falhou em pegar o alvo — 9 de 10, não 10 de 10 como um documento meu afirmava. Já está anotado para reescrever."

Isso parece um ponto contra. **Não é.** É a prova de que o processo funciona e de que você não maquia.

### "O sistema já está em produção?"

> "Está publicado e implantado, e eu uso. O que ainda não aconteceu é compra real passando por ele — isso começa no piloto. E há uma pendência de configuração de acesso que estou fechando: hoje cada usuário autoriza individualmente, e vou mudar para execução centralizada, o que elimina a tela de permissão para todo mundo."

---

## O que você não pode dizer

Quatro números apareceram em versões anteriores do material e **não têm lastro**. Já saíram do deck; não os traga de volta na fala:

| Não diga | Por quê |
|---|---|
| *"90% das asserções verificam comportamento"* | Nenhum script calcula essa proporção. Era número inventado |
| *"De 50 minutos para menos de 15"* | Nenhum dos dois lados foi cronometrado. É a medição que está em campo agora |
| *"Saving de 11,8%"* / *"100% de taxa de resposta"* | Já removidos numa auditoria anterior. O segundo era 100% sobre zero convites |
| *"Nota 8,95"* | Auto-atribuída |

E um cuidado de precisão: o sistema registra **quem apresentou proposta e quem não apresentou**. Ele **não** sabe quem foi convidado e nunca respondeu — convidado que não manda nada não gera linha. Se perguntarem sobre taxa de resposta a convite, essa é a distinção honesta, e é exatamente o que a frente do convite com escopo resolve.

---

## A última frase

Se der para escolher como terminar, termine assim:

> "A ferramenta está construída. A prova, não. E eu sei a diferença entre as duas."

---

*Roteiro escrito em 09/09/2026 a partir da auditoria em `docs/AUDITORIA_DECK_CONSELHO.md`. Os números citados foram verificados no código; os não verificáveis estão nomeados como tal.*
