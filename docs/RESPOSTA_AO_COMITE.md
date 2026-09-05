# Minuta de Resposta ao Comitê Avaliador
## Concurso de Melhor Ideia 2026 — Capital Realty & Demercado

> **Instruções para envio**:
> Copie o texto abaixo para responder ao e-mail recebido do RH / Comitê Avaliador. O texto endereça com precisão cirúrgica todos os pontos solicitados na devolução, demonstrando visão estratégica, maturidade de projeto e domínio técnico.

---

**Assunto:** Re: Concurso da Melhor Ideia 2026 – Detalhamento da Proposta "Capital Fornecedores"  
**Para:** Setor de Recursos Humanos / Comitê Avaliador (`rh@capitalrealty.com.br`)  
**De:** Guilherme  

---

Boa tarde a todos os membros do Comitê Avaliador e equipe de RH,

Agradeço imensamente pelo retorno cuidadoso e pelas orientações construtivas enviadas sobre a proposta **Capital Fornecedores - Sistema de Avaliação de Prestadores de Serviço**. 

A leitura do comitê foi extremamente precisa: o processo hoje existente de forma nativa no Fluig permaneceu subutilizado justamente por operar como uma funcionalidade isolada, passiva, com alto atrito de preenchimento e, principalmente, **sem conexão direta com o momento da tomada de decisão de compras**. 

Acolhendo a orientação de apresentar a iniciativa de forma integral, estruturamos a evolução completa do modelo atual, demonstrando como a proposta transforma esse ponto cego em uma ferramenta ativa e estratégica de governança e eficiência para a **Capital Realty** e **Demercado**.

Apresento abaixo o detalhamento dos pontos solicitados:

---

### 1. A Evolução do Modelo: Do "AS-IS" Isolado ao Ecossistema "TO-BE" Integrado

| Aspecto | Modelo Atual (AS-IS) | Nova Solução Integrada (TO-BE) |
| :--- | :--- | :--- |
| **Ponto de Entrada** | Planilha de equalização `.xlsx` avulsa, sujeita a quebra de fórmulas e perda de histórico. | **Web App Corporativo Inteligente (Google Apps Script)** com validação de dados, cálculo de saving e histórico unificado. |
| **Cadastro de Fornecedores** | Digitação manual e repetitiva de Razão Social, CNPJ e contatos em cada cotação. | **Integração com BrasilAPI (Receita Federal)** para autopreenchimento instantâneo + memória interna dos contatos comerciais. |
| **Gatilho de Avaliação** | Manual e voluntário no Fluig (baixa adesão). | **Gatilho automatizado pós-Ordem de Compra** no encerramento do serviço no Mega (preenchimento em 60 segundos). |
| **Visibilidade dos Dados** | Avaliações esquecidas em formulários individuais. | **Scorecard Centralizado & IQF (Índice de Qualificação do Fornecedor)** acessível em tempo real. |
| **Impacto na Tomada de Decisão** | Nulo (o comprador não sabe a nota do fornecedor). | **Retroalimentação direta**: o histórico e a reputação do prestador aparecem na tela durante a próxima equalização. |

---

### 2. Critérios Objetivos de Avaliação (Foco Inicial: Facilities nos Megas)
Para eliminar a subjetividade e garantir agilidade operacional para os gestores locais, estruturamos 5 critérios ponderados:

1. **Qualidade Técnica e Acabamento (Peso: 30%)**: Conformidade da entrega com o escopo contratado e padrões técnicos dos Megas.
2. **Pontualidade e Cumprimento de SLA (Peso: 25%)**: Aderência rigorosa ao cronograma e prazos acordados.
3. **Segurança do Trabalho e SST (Peso: 20%)**: Cumprimento das normas de segurança, uso de EPIs e documentação nos condomínios logísticos.
4. **Atendimento, Postura e Comunicação (Peso: 15%)**: Agilidade na resposta, relacionamento com a equipe operacional e resolução de pendências.
5. **Limpeza e Organização (Peso: 10%)**: Conservação e limpeza das áreas comuns do empreendimento após a execução.

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

### 4. Consolidação de Indicadores Gerenciais (IQF & Dashboards)
Os dados alimentam uma base corporativa centralizada, consolidando:
- **IQF (Índice de Qualificação do Fornecedor)** com classificação em faixas:
  - 🟢 **Classe A (Excelente - 85 a 100)**: Fornecedor preferencial para concorrências.
  - 🟡 **Classe B (Regular - 70 a 84)**: Elegível, com pontos de atenção documentados.
  - 🔴 **Classe C (Crítico - abaixo de 70)**: Alerta preventivo e necessidade de plano de ação antes de novas contratações.
- **Painel de Savings e Eficiência**: Visibilidade do volume financeiro negociado e da redução de custos (Saving) alcançada em cada rodada de equalização por Mega.

---

### 5. Aplicação Prática na Tomada de Decisão
As notas não ficam arquivadas: elas atuam como **filtro de governança**:
- **Nas Novas Cotações**: Ao abrir uma equalização de serviços para o Mega Curitiba, por exemplo, o comprador já visualiza o selo IQF de cada proponente, premiando prestadores de excelência e evitando reincidência de contratos problemáticos.
- **Em Renovações Contratuais**: Subsídio técnico indiscutível para negociações de reajuste ou descontinuação de contratos continuados.
- **Feedback aos Prestadores**: Relatórios objetivos para direcionar reuniões semestrais de alinhamento com os principais parceiros.

---

### 6. Viabilidade Técnica e Custo Zero
A solução está sendo estruturada em **Google Apps Script**, utilizando a própria infraestrutura do Google Workspace da Capital Realty. Isso garante **custo zero de licenças ou infraestrutura externa**, alta disponibilidade, conformidade com a segurança da informação e facilidade de sustentação pela equipe interna.

O projeto iniciará sua fase piloto no departamento de **Facilities nos Megas**, com roadmap desenhado para expansão para Obras, Demercado e áreas corporativas.

Com este detalhamento, solicito a validação integral da proposta pelo Comitê Avaliador para darmos continuidade ao cronograma oficial de implementação.

Permaneço à disposição para reuniões de alinhamento ou demonstração da arquitetura técnica.

Atenciosamente,  
**Guilherme**  
*Capital Realty & Demercado*

