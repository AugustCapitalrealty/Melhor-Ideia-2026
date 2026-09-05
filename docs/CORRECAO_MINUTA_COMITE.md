# Correção da minuta ao comitê — seção 3

> **O que muda**: o item 3 da [RESPOSTA_AO_COMITE.md](RESPOSTA_AO_COMITE.md) promete duas coisas que não se cumprem no prazo e uma delas não é da nossa alçada.
> **O que não muda**: a integração com o Fluig continua no roadmap. O problema não é o escopo — é o documento afirmar como presente algo que é futuro.

---

## 1. As duas promessas, e por que incomodam de formas diferentes

### 1.1 "Gatilho sem Fricção" — gravidade média

> *"No momento em que a medição ou Ordem de Compra de Facilities for dada como concluída no Fluig/Mega, o gestor responsável pelo recebimento recebe uma notificação com link direto para o formulário no Web App."*

Para isso funcionar é preciso **alterar o workflow do TOTVS Fluig** ou ler eventos dele por integração. Dono: TI / consultoria TOTVS. Não sai em 35 dias e não depende de você.

É um problema de **prazo e dependência**.

### 1.2 "Condicionamento do encerramento da medição" — gravidade alta

> *"Condicionamento do encerramento final da medição ao registro da avaliação, assegurando taxa de resposta superior a 90%."*

Esta é diferente, e não é só questão de prazo:

| Por quê | |
| :--- | :--- |
| **Medição fechada libera pagamento** | Está sendo proposto um **bloqueio dentro de um fluxo de pagamento a fornecedor** |
| **Não é decisão técnica** | É decisão de processo — de quem é dono do fluxo (Suprimentos / Financeiro) somado a TI. Não é alçada de quem inscreve uma ideia |
| **Risco contratual real** | Se alguém não preencher, o fornecedor não recebe. O contrato do Canaveral tem regra de pagamento nos dias 10 e 20 e **multa de 15%** por descumprimento |
| **Métrica anexada** | O ">90% de adesão" transforma isso em compromisso mensurável sobre algo fora do seu controle |

> Mesmo que a TI dissesse sim amanhã, travar um fluxo de pagamento não é algo que se propõe unilateralmente. **Corrigir está certo pelo mérito, não só pela viabilidade.**

---

## 2. O risco de deixar como está

1. **É o parágrafo que o comitê mais vai ler.** A devolutiva deles foi exatamente sobre o fluxo pós-OC.
2. **Dois documentos seus se contradizem no mesmo ponto.** A [arquitetura](ARQUITETURA_TECNICA_E_FLUXO.md) marca o Fluig como *"Integração Futura"*; a minuta promete como entrega.
3. **Em novembro, "não implementamos" depois de prometer é pior que nunca ter prometido.** O critério de Qualidade da Implementação (30% da nota, **2º critério de desempate**) diz literalmente *"efetividade na entrega dos resultados propostos"*.

---

## 3. Por que a troca é melhor, e não uma retirada

**O gatilho já existe — no contrato, não no Fluig.** O Termo nº 0187.2026 estabelece:

> *"As Notas Fiscais serão emitidas somente após a emissão das Ordens de Compra. O número da Ordem de Compra deverá constar obrigatoriamente na Nota Fiscal."*
> *"A CONTRATADA deverá apresentar juntamente com a Nota Fiscal mensal o ANEXO II — Acordo de Nível de Serviço (SLA) preenchido e validado com a CONTRATANTE."*

Ou seja: **o ciclo de avaliação já é obrigação contratual.** Não precisamos inventar uma trava — precisamos tornar operável algo que já foi acordado.

E ganhamos uma captura que a versão original não tinha: **o comportamento de cotação, registrado no fechamento da própria equalização** — atrito zero, sem depender de sistema nenhum, e que hoje ninguém mede.

**O enquadramento honesto**: *trocamos uma dependência de TI por duas capturas que dependem só de nós, e ampliamos o que é avaliado.*

---

## 4. Texto substituto — pronto para colar

Substitui integralmente a seção 3 da minuta.

---

### 3. Ativação do Fluxo de Avaliação — em duas frentes

A avaliação de prestadores fracassou no passado por ser um formulário isolado, passivo e desconectado do momento da decisão de compra. A correção não está em criar mais uma obrigação de preenchimento, e sim em **capturar a informação onde ela já existe naturalmente**.

**Frente 1 — No fechamento da equalização (atrito zero, disponível desde o início)**

Ao homologar uma cotação, o comprador registra, em segundos, o comportamento de cada proponente: respondeu ao convite, apresentou proposta completa, honrou a validade e o prazo declarados, foi ágil na negociação.

Este dado hoje **não é medido em lugar nenhum** — e é justamente o que já se sabe no momento em que se fecha a compra. Ele passa a alimentar automaticamente o histórico do fornecedor, sem exigir nenhuma etapa nova de ninguém.

**Frente 2 — Após a execução do serviço (avaliação de desempenho)**

Concluída a entrega, o gestor responsável recebe por e-mail um formulário curto e responsivo, preenchível pelo celular no próprio Mega em menos de um minuto, com os cinco critérios ponderados descritos no item 2.

A adesão será sustentada por três mecanismos que **estão sob nossa governança direta**, sem depender de alteração em sistemas de terceiros:

- **Lembrete automático** ao gestor enquanto a avaliação estiver pendente;
- **Painel de pendências** por empreendimento, visível à coordenação;
- **Efeito prático imediato**: a nota do fornecedor aparece na tela do comprador na cotação seguinte — quem avalia colhe o benefício na próxima contratação.

**Sobre a integração com o Fluig**

O ciclo de avaliação **já é obrigação contratual**: os contratos vigentes determinam que a Nota Fiscal só seja emitida após a Ordem de Compra, que o número da OC conste obrigatoriamente na Nota, e que o Acordo de Nível de Serviço seja apresentado mensalmente junto com o faturamento.

Nossa entrega nesta fase é **tornar esse ciclo operável e mensurável**, com os dados centralizados e disponíveis para consulta.

A automação do disparo a partir do encerramento da medição no Fluig/Mega — bem como qualquer condicionamento no fluxo de aprovação — depende de alteração em processo de outra área e será proposta formalmente em fase posterior, com o envolvimento de TI e Suprimentos. **Optamos deliberadamente por não colocar essa dependência no caminho crítico da implementação de 2026**, garantindo que a solução entregue valor mensurável dentro do prazo do concurso.

---

## 5. Checklist antes de enviar

- [ ] Substituir a seção 3 pelo texto acima
- [ ] Conferir se o item 4 (IQF) ainda descreve o que vamos entregar
- [ ] Corrigir a razão social no README: é `CAPITAL REALTY INFRAESTRUTURA LOGÍSTICA LTDA` (CNPJ 03.015.145/0001-54)
- [ ] Enviar **dentro da janela de consultoria**, que fecha em 30/09/2026
