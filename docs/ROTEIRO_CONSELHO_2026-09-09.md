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

### 4. O primeiro dado real — e o que ainda falta

Este é o movimento que decide a sua credibilidade na sala. E ele mudou de tom: **você já tem metade da conta.**

> "Três equalizações foram feitas por duas pessoas que não sou eu, e o sistema cronometrou cada uma sozinho: 9 minutos e 10, 11 e 32, 13 e 35. Mediana de 11 minutos e meio.
>
> Faço questão de dizer que as **minhas** medições não entram nessa conta. Eu tenho dez delas, quase todas abaixo de dois minutos — mas eu testava com dado preparado e sei onde clicar. Usar isso seria enganar vocês e enganar a mim mesmo."

Essa última frase vale mais que o número. Ela mostra que você sabe distinguir dado de propaganda.

Em seguida, o que falta, sem rodeio:

> "Falta o outro lado: quanto a mesma coisa levava no Excel. Dois analistas estão cronometrando esta semana. É a única medição do projeto cuja janela fecha sozinha — depois que a operação migrar, ninguém volta ao Excel para cronometrar, e o 'antes' é perdido para sempre."

E então o fato mais forte que você tem hoje, que não é sobre tempo:

> "No dia 8, uma das analistas de apoio fez o ciclo inteiro sozinha, sem mim: criou a equalização, homologou o fornecedor, exportou o documento e **avaliou o prestador**. Nota 77,5. Foi a primeira vez que a promessa que fizemos ao comitê — a avaliação alimentando a decisão de compra — aconteceu em produção, na mão de quem opera."

**Números do sistema, apurados na base em 09/09:** 26 equalizações criadas, 7 homologações, 3 avaliações, 4 usuários distintos, 13 medições automáticas de tempo.

Uma ressalva que você deve dar antes que perguntem: **as 3 avaliações estão concentradas em 2 fornecedores.** O IQF continua preliminar, e a tela diz isso.

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

### "De onde vêm esses números da base?"

**Resolvido em 09/09, lendo o log de auditoria do próprio sistema:**

```
08/09 18:24 · importacao_plataforma · 738 contratações, 165 fornecedores novos
08/09 23:54 · importacao_plataforma ·   0 contratações, 136 fornecedores novos
```

Verifiquei também a cronologia: o `zerar_base_operacional` foi em 06/09 e o último `desfazer_importacao` em 05/09 — **ambos antes** da importação. Nada desfez os 738.

Então pode dizer, com fonte: **738 contratações** e **cerca de 312 fornecedores**, importados da plataforma de compras em 08/09. O número de **179** que circula em documentos antigos está errado — ignore.

**O que ainda NÃO pode dizer: os R$ 5.105.991,36.** Esse total não foi conferido; para somá-lo seria preciso ler a aba inteira. Se perguntarem o valor:

> "O volume financeiro eu confirmo e mando. Não quero citar de cabeça um número desse tamanho."

**E guarde este argumento, que te protege:** essas 738 compras entraram numa tabela `Contratacoes`, **separada de `Equalizacoes`**, de propósito. Somadas, o número de equalizações declarado ao comitê saltaria de dezenas para centenas — e nenhuma delas foi equalizada aqui. Se perguntarem por que não contam como equalização, essa é a resposta, e ela mostra rigor em vez de fraqueza.

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

> "Está publicado, implantado e em uso. Quatro pessoas já entraram, e não só eu: as analistas de apoio de Curitiba e Itajaí e o Wilson. Sete homologações já passaram por ele. O acesso é por conta corporativa, liberado para o domínio da companhia, e ninguém precisa instalar nada nem autorizar nada — abre o link e usa."

**Base para essa resposta:** o log registra 4 usuários distintos e 7 homologações, e o manifesto publicado traz `executeAs: USER_DEPLOYING` com `access: DOMAIN` — ou seja, roda com a sua autorização e abre para qualquer pessoa em `capitalrealty.com.br`, sem tela de consentimento.

**Um cuidado:** distribua sempre a URL terminada em `/exec`. A `/dev` executa no contexto de quem acessa, exige permissão de edição no script e pede consentimento — é a explicação mais provável para o pedido de permissão que apareceu num dos testes.

---

## O que você não pode dizer

Quatro números apareceram em versões anteriores do material e **não têm lastro**. Já saíram do deck; não os traga de volta na fala:

| Não diga | Por quê |
|---|---|
| *"90% das asserções verificam comportamento"* | Nenhum script calcula essa proporção. Era número inventado |
| *"De 50 minutos para menos de 15"* | O lado do **sistema** já foi medido — 9min10, 11min32 e 13min35, de usuários reais. O lado do **Excel** ainda não. Sem os dois, não existe comparação, e afirmar redução percentual é inventar |
| *"R$ 5.105.991,36 em compras"* | O volume não foi conferido. As 738 contratações, sim |
| *"Saving de 11,8%"* / *"100% de taxa de resposta"* | Já removidos numa auditoria anterior. O segundo era 100% sobre zero convites |
| *"Nota 8,95"* | Auto-atribuída |

E um cuidado de precisão: o sistema registra **quem apresentou proposta e quem não apresentou**. Ele **não** sabe quem foi convidado e nunca respondeu — convidado que não manda nada não gera linha. Se perguntarem sobre taxa de resposta a convite, essa é a distinção honesta, e é exatamente o que a frente do convite com escopo resolve.

---

## A última frase

Se der para escolher como terminar, termine assim:

> "A ferramenta está construída. A prova, não. E eu sei a diferença entre as duas."

---

*Roteiro escrito em 09/09/2026 a partir da auditoria em `docs/AUDITORIA_DECK_CONSELHO.md`. Os números citados foram verificados no código; os não verificáveis estão nomeados como tal.*
