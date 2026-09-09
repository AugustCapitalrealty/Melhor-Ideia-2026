# Proposta — Convite para Licitação, com Escopo

**Data:** 09/09/2026 · **Autor:** Guilherme Marques · **Estado:** ideia registrada, sem código escrito

> **Sobre a palavra "licitação".** Usada aqui no sentido corrente da companhia — concorrência privada entre fornecedores convidados. Nada nesta proposta implica rito, prazo ou publicidade da Lei 14.133; a Capital Realty e a Demercado não estão sujeitas a ela. Onde o texto diz "convite", leia-se o ato comercial de chamar fornecedores para cotar um escopo definido.

---

## A ideia, em uma frase

**Montar o escopo dentro do sistema e disparar o convite para os participantes** — em vez de o processo começar quando as propostas já voltaram, ele passa a começar quando a Capital Realty define o que quer comprar.

---

## Por que ela fecha o ciclo

Hoje o sistema entra em cena tarde. A equalização nasce no momento em que o comprador já tem três PDFs na mão e precisa compará-los. Tudo o que aconteceu antes — o escopo escrito num e-mail, no WhatsApp ou num Word, os fornecedores escolhidos de memória, o prazo combinado por telefone — acontece fora, e some.

Isso produz três problemas que o sistema hoje registra sem poder resolver:

| Problema | Onde ele aparece hoje |
|---|---|
| **Cada fornecedor cotou uma coisa ligeiramente diferente** | A equalização compara colunas que não são comparáveis, e o comprador descobre isso na hora de decidir |
| **"Não respondeu" não é fato registrado** | A tabela `Convites` só sabe de quem respondeu. Quem foi chamado e ignorou não deixa rastro — e é exatamente o dado que qualifica o fornecedor |
| **A escolha de quem chamar é de memória** | 179 fornecedores cadastrados e 738 compras mapeadas na base, e a lista de convidados continua saindo da cabeça de quem compra |

Convidar com escopo resolve os três de uma vez, porque **todo mundo recebe o mesmo texto, a mesma quantidade e a mesma marca de referência** — e porque o convite emitido vira registro antes de existir resposta.

---

## O que o modelo de dados já sustenta

Esta é a parte que torna a ideia barata: **o escopo já existe como dado estruturado.** Não é preciso inventar formato.

A árvore `EAP` (`app/Config.gs`, schema v8) já carrega, por item:

| Campo | O que é |
|---|---|
| `DESCRICAO` | O que se está pedindo |
| `QUANTIDADE_REFERENCIA` | Quanto — *"o que a CR pede"*, nas palavras do próprio schema |
| `UNIDADE_REFERENCIA` | Em que unidade |
| `MARCA_REFERENCIA` | A marca ou padrão técnico exigido |
| `ID_PAI` / `ORDEM` | A hierarquia, com o código derivado da posição |

**O convite é essa árvore sem a coluna de preço.** É a mesma estrutura que a equalização já exporta em Sheets e PDF — o gerador de documento em `Exportar.gs` produz um retrato estático, sem fórmula, que é precisamente o que se manda para fora.

E a tabela `Convites` já existe, com os campos que o fluxo pede:

`ID` · `ID_EQUALIZACAO` · `CNPJ` · `DATA_CONVITE` · `CONFIRMOU` · `VISITOU` · `APRESENTOU_PROPOSTA` · `MOTIVO_RECUSA` · `OBSERVACAO`

Hoje ela é preenchida **na homologação**, olhando para trás. A proposta é preenchê-la **no disparo**, olhando para frente — e deixar a homologação apenas fechar as linhas que já estavam abertas.

O disparo de e-mail também já está provado: `cfDispararNotificacaoAvaliacao_`, em `app/Avaliacao.gs`, envia com `MailApp` no momento da homologação, com link direto. A mesma máquina serve.

---

## O que precisa ser construído

| Peça | O que faz | Esforço |
|---|---|---|
| **Tela de escopo** | Montar a árvore EAP com quantidade, unidade e marca, *antes* de existir qualquer proposta. É a tela de nova equalização sem as colunas de proponente | 4–6 h |
| **Seleção de convidados** | Escolher os fornecedores, com sugestão vinda da base (ver abaixo) | 3–5 h |
| **Documento de convite** | O PDF do escopo, gerado do mesmo motor da exportação, sem preço e com prazo de resposta no topo | 3–4 h |
| **Disparo** | E-mail por fornecedor, com o documento anexo ou em link, e uma linha em `Convites` por envio | 3–4 h |
| **Painel do convite** | Quem foi chamado, quem confirmou, quem visitou, quem apresentou, quem recusou e por quê | 3–4 h |

**Total estimado: 16 a 23 horas.** É uma frente inteira, não um ajuste — e por isso não cabe antes de 15/10.

---

## A parte que só este sistema consegue fazer

Qualquer um manda um e-mail com um PDF anexo. O que a base permite, e um e-mail não, é **sugerir quem convidar com fundamento**.

Com 738 ordens de compra e 179 fornecedores conectados, mais o IQF e o histórico de preço por item, o sistema pode responder, no momento de montar a lista:

- **Quem já cotou esta categoria** nos Megas — não quem alguém lembra, quem de fato cotou
- **Quem entregou bem** — o IQF do fornecedor, com a classe A / B / C ao lado do nome
- **Quem foi chamado e não respondeu das últimas vezes** — taxa de resposta como dado, não impressão
- **Quem pratica preço fora da faixa** naquele item, contra o histórico

Isso é o quinto pedido do comitê — *"aplicação prática dessas informações na tomada de decisão"* — aplicado **na origem** da compra, e não só na hora de premiar. Hoje a nota do fornecedor aparece quando ele já está na disputa. Com o convite, ela passa a influenciar **quem entra na disputa**.

Há uma regra de negócio que já existe e conversa direto com isso: a **cotação mínima por faixa de valor**, lida da aba `Regras` e aplicada na homologação. O convite é o outro lado dela — se a faixa exige três cotações, convidar dois é um problema que o sistema pode apontar **no dia do disparo**, e não no dia em que a compra trava.

---

## A regra de integridade: escopo congelado no disparo

Esta é a decisão de projeto que não pode ser deixada para depois.

**No instante em que o primeiro convite sai, o escopo daquela equalização vira imutável.** Editar descrição, quantidade, unidade ou marca depois disso destrói a única coisa que o convite existe para garantir: que todos cotaram a mesma coisa.

Se o escopo precisa mudar de verdade — e às vezes precisa —, o caminho é **emitir uma revisão**, com número próprio, redisparada a todos os convidados, e com o registro de quem recebeu qual versão. Uma proposta que responde à revisão 1 não pode ser comparada com outra que respondeu à revisão 0 sem que isso esteja à vista na tela.

Essa restrição já foi antecipada na `PROPOSTA_PORTAL_DO_FORNECEDOR.md`, que levanta o caso de "Engenharia editar o escopo depois de convidar". As duas propostas precisam resolver isso do mesmo jeito.

---

## Relação com o Portal do Fornecedor

São as duas metades do mesmo movimento, e a ordem importa:

```
  Convite com escopo          Portal do Fornecedor
  (esta proposta)             (PROPOSTA_PORTAL_DO_FORNECEDOR.md)
  ─────────────────           ──────────────────────
  a CR define o que quer  →   o fornecedor responde
  e chama quem vai cotar      dentro do sistema
```

**Esta proposta é pré-requisito da outra.** O portal precisa de um convite para existir: é o convite que gera o token, que define o escopo que o fornecedor vê, e que delimita o que ele pode responder. Construir o portal antes do convite seria construir a porta antes da casa.

E há um ganho de transição: **o convite com escopo funciona sem o portal.** O fornecedor recebe o PDF e responde por e-mail, como já faz hoje — mas todo mundo respondendo o mesmo escopo, com o convite registrado. O portal, depois, só troca o canal de resposta.

---

## O que fica em aberto e precisa de decisão de negócio

1. **Quem pode emitir convite?** É ato externo, em nome da companhia. A `PROPOSTA_PORTAL_DO_FORNECEDOR.md` levanta a mesma questão para o token. Talvez mereça alçada própria, distinta de quem monta equalização.
2. **O e-mail sai de quem?** Da conta pessoal do comprador ou de um remetente institucional (`suprimentos@`)? Muda a percepção do fornecedor e muda a cota de envio.
3. **Anexo ou link do Drive?** O link exige compartilhamento externo, que a política do Workspace pode bloquear. O anexo é imune a isso, mas não registra abertura. **Verificar a política antes de escolher.**
4. **Prazo de resposta é campo obrigatório?** Sem prazo, "não respondeu" não tem data de corte e a métrica não fecha.
5. **Visita técnica entra no fluxo?** O campo `VISITOU` já existe em `Convites`. Se a visita for parte do convite, ela precisa de data e de confirmação.
6. **O fornecedor recusa dentro do sistema?** `MOTIVO_RECUSA` existe. Um link de "não vou cotar, e o motivo é este" custa pouco e gera dado que hoje não existe em lugar nenhum.

---

## Quando — e por que não agora

**Não antes de 15/10.** O caminho crítico até o Relatório Final é volume de uso real: piloto rodando, tempo medido dos dois lados, saving apurado e IQF saindo da amostra de um. Nenhuma dessas coisas anda mais rápido porque existe convite.

Pior: construir esta frente agora **consome as horas que o piloto precisa** e adiciona uma superfície nova, voltada para fora da companhia, logo antes de uma apresentação. Fornecedor recebendo e-mail de um sistema em piloto é um risco de imagem que não paga o benefício dentro do prazo.

**A janela certa é depois do relatório**, junto com o Portal do Fornecedor e com o volume já rodando. Aí o convite chega numa base que sabe quem chamar, e não numa base que ainda está aprendendo.

---

*Registrado em 09/09/2026. Nenhuma linha de código escrita para esta frente. Os campos e tabelas citados foram verificados no schema v8 em `app/Config.gs`.*
