# Plano Estratégico Master: Capital Fornecedores
## Da Equalização Inteligente ao Scorecard de Fornecedores nos Megas
**Projeto Inscrito no Concurso da Melhor Ideia 2026 — Capital Realty & Demercado**

---

## 1. Visão Geral e Propósito

O **Capital Fornecedores** é uma solução digital corporativa desenvolvida para transformar a gestão de prestadores de serviço da **Capital Realty** e **Demercado**. 

O projeto ataca simultaneamente duas grandes dores operacionais da companhia:
1. **No Pré-Contratação**: Substitui a planilha descentralizada e frágil de equalização (`EQU_AAAAMMDD-MEGA_PROJETO_ÁREA.xlsx`), eliminando riscos de fórmulas quebradas, retrabalho e perda de histórico.
2. **No Pós-Contratação (Cobrado pelo Comitê)**: Transforma o fluxo subutilizado no Fluig em uma rotina automatizada, rápida e estruturada de **Avaliação Pós-Ordem de Compra**, gerando uma base de inteligência com o **Índice de Qualificação do Fornecedor (IQF)** que retroalimenta as decisões de compras futuras.

---

## 2. O Ciclo Completo: Começo, Meio e Fim

```
========================================================================================
                                 JORNADA DO PROJETO
========================================================================================

  [ FASE 1: COMEÇO ]              [ FASE 2: MEIO ]                 [ FASE 3: FIM ]
  Fevereiro a Abril/2026          Maio a Julho/2026                Agosto a Outubro/2026
  ───────────────────────         ────────────────────────         ─────────────────────────
  • Diagnóstico & Alinhamento     • Desenvolvimento do MVP         • Operação Piloto nos Megas
  • Resposta formal ao Comitê     • Web App no Google Apps Script  • Consolidação de Métricas
  • Modelagem dos Dados           • Integração BrasilAPI           • Relatório Final de Resultados
  • Validação com Facilities      • Piloto no Mega Curitiba/Itajaí • Apresentação Presencial
========================================================================================
```

---

### FASE 1: O COMEÇO (Diagnóstico, Validação & Fundamentação)
*Período: 01/02/2026 a 30/04/2026*

#### Objetivos:
- Responder à orientação do Comitê de Avaliação demonstrando o escopo integral e a evolução do processo atual.
- Conectar as dores reais da planilha `.xlsx` com as necessidades operacionais dos gestores de Facilities nos Megas.
- Definir a matriz oficial de critérios de avaliação de prestadores com a liderança.

#### Ações e Entregáveis:
1. **Defesa e Alinhamento com o Comitê**:
   - Envio do detalhamento estratégico demonstrando o ciclo completo (Pré + Pós-Serviço).
   - Validação da proposta e garantia do apoio consultivo do comitê (conforme item 3 e 5.3 do regulamento).
2. **Mapeamento de Dados e Regras de Negócio**:
   - Decomposição de todos os campos da planilha atual (`Mapa de Cotação_CR` e `Mapa de Cotação_Demercado`).
   - Mapeamento das regras de integração da BrasilAPI (CNPJ, Razão Social, CNAE, Situação Cadastral).
   - Definição dos campos operacionais de contato (persistidos automaticamente após o 1º cadastro).
3. **Ponderação dos Critérios de Facilities**:
   - *Pontualidade / SLA (25%)*
   - *Qualidade Técnica / Conformidade de Escopo (30%)*
   - *Segurança do Trabalho / SST (20%)*
   - *Atendimento e Postura (15%)*
   - *Limpeza e Organização Pós-Serviço (10%)*

---

### FASE 2: O MEIO (Construção, Integração & Piloto Controlado)
*Período: 01/05/2026 a 31/07/2026*

#### Objetivos:
- Construir a ferramenta digital sem custos de infraestrutura no Google Workspace (Google Apps Script).
- Aplicar a identidade visual refinada (Apple Design System + Brandbook oficial Capital Realty).
- Realizar os primeiros testes de campo com cotações reais de Facilities nos Megas.

#### Ações e Entregáveis:
1. **Desenvolvimento do Web App**:
   - **Frontend**: Aplicação web fluida com design **Liquid Glass**, responsiva (desktop e mobile), utilizando as cores oficiais da Capital Realty (`#151E49`, `#003D7B`, `#065CA9`).
   - **Backend (`Code.gs`)**: Integração REST com a BrasilAPI (`UrlFetchApp`), motor de cálculo dinâmico da EAP (sem risco de fórmulas quebradas) e gravação centralizada no Google Sheets.
2. **Ambiente de Dados Centralizado (Google Sheets como Banco)**:
   - Aba `Fornecedores`: Cadastro inteligente com enriquecimento contínuo e nota média (IQF).
   - Aba `Equalizacoes`: Histórico de todas as cotações com saving obtido e parecer técnico.
   - Aba `Avaliacoes`: Registro detalhado de cada avaliação pós-serviço vinculada à OC.
3. **Gatilho de Avaliação Pós-OC (Conexão Fluig)**:
   - Estruturação do disparo de e-mail/notificação para o gestor do Mega no fechamento da OC.
   - Formulário de 1 minuto para garantir alta taxa de resposta sem sobrecarregar a operação.
4. **Piloto em Empreendimento Chave**:
   - Rodar 5 a 10 equalizações e avaliações reais no **Mega Curitiba** e/ou **Mega Itajaí**.
   - Colher feedbacks dos fiscais e compradores para ajustes de usabilidade.

---

### FASE 3: O FIM (Escala, Comprovação de Resultados & Relatório Final)
*Período: 01/08/2026 a 15/10/2026*

#### Objetivos:
- Consolidar a utilização da ferramenta na rotina de Facilities de todos os Megas.
- Extrair indicadores quantitativos de impacto financeiro, ganho de produtividade e governança.
- Elaborar e protocolar o **Relatório Final** no RH até **15/10/2026** (prazo limite do regulamento).

#### Ações e Entregáveis:
1. **Operação Consolidada**:
   - 100% das novas contratações de Facilities nos Megas equalizadas pelo Web App.
   - Fornecedores avaliados com notas e histórico alimentando novas concorrências.
2. **Geração de Métricas e Dashboards**:
   - Cálculo do **Saving Total** gerado (Diferença entre Proposta Inicial e Valor Contratado).
   - Tempo médio economizado por equalização (redução estimada de 70% no tempo gasto em planilhas).
   - Taxa de adesão às avaliações pós-OC.
3. **Protocolo do Relatório Final (15/10/2026)**:
   - Entrega do documento executivo com gráficos de desempenho, depoimentos dos usuários e análise comparativa antes vs. depois.

---

### FASE 4: A CONSAGRAÇÃO (Apresentação Presencial & Premiação)
*Período: Novembro a Dezembro/2026*

#### Objetivos:
- Apresentar presencialmente a solução ao Comitê Executivo e à Presidência.
- Demonstrar ao vivo a plataforma funcionando, os resultados reais atingidos e a escalabilidade para outros setores (Obras, Demercado, TI, etc.).
- Conquistar o 1º Lugar no Concurso da Melhor Ideia 2026 (Festa de Final de Ano).

#### Ações e Entregáveis:
1. **Apresentação Presencial (Novembro/2026)**:
   - Pitch de alto impacto com demonstração ao vivo em 3 minutos:
     1. Preenchimento de CNPJ com autopreenchimento instantâneo via BrasilAPI.
     2. Equalização comparativa sem fórmulas quebradas.
     3. Visão do Scorecard de um fornecedor antes de decidir a contratação.
     4. Painel de Savings e Governança para a Diretoria.
2. **Plano de Expansão 2027**:
   - Apresentar o plano de rollout para Deminvest, Obras e áreas corporativas.
3. **Premiação (Dezembro/2026)**:
   - Entrega do MacBook na celebração de encerramento do ano.

---

## 3. Matriz de Indicadores de Sucesso (KPIs)

Para comprovar o impacto irrefutável perante o comitê, acompanharemos 5 métricas centrais:

| Indicador | Situação Atual (Planilha XLSX) | Meta Atingida no Piloto (Web App) | Impacto no Negócio |
| :--- | :---: | :---: | :--- |
| **Tempo por Equalização** | ~45 a 60 min (manual, cópia/cola) | **< 15 min** (autocomplete + cálculo automático) | **-70% de tempo operacional** |
| **Erros de Cálculo / Fórmulas** | Frequentes (somas fixas quebradas) | **Zero** (motor de cálculo centralizado) | **100% de precisão orçamentária** |
| **Histórico Centralizado** | 0% (arquivos soltos em pastas) | **100%** gravado em base central | **Governança e rastreabilidade total** |
| **Adesão à Avaliação de Fornecedores** | Quase nula (fluxo Fluig isolado) | **> 90%** das OCs avaliadas | **Inteligência contínua de fornecedores** |
| **Saving Gerado nas Negociações** | Não consolidado / difícil medição | Visível em tempo real no Dashboard | **Comprovação de redução de custos** |

---

## 4. Cronograma Oficial do Concurso vs. Entregas do Projeto

| Data Limite | Marco do Regulamento | Entrega do Projeto Capital Fornecedores | Status |
| :---: | :--- | :--- | :---: |
| **01/06/2026** | Prazo final de inscrições | Proposta formalizada e detalhamento executivo aprovado pelo comitê | 🟢 Alinhado |
| **01/07/2026** | Período de implementação e consultoria | MVP funcional implantado e testado no primeiro Mega | 🚀 Planejado |
| **30/09/2026** | Fim do período de consultoria do comitê | Piloto em operação plena em múltiplos Megas com geração de dados | 🚀 Planejado |
| **10/10/2026** | Prazo final para implementação das ideias | Conclusão oficial do período de teste e coleta de métricas | 🚀 Planejado |
| **15/10/2026** | **Envio do Relatório Final** | Envio formal do relatório com resultados e dashboard consolidado | 🏆 Marco Decisivo |
| **Novembro/2026**| **Apresentação Presencial** | Apresentação executiva ao vivo perante o comitê e presidente | 🏆 Demonstração |
| **Dezembro/2026**| **Festa de Final de Ano** | Anúncio do vencedor e entrega do **MacBook** | 🥇 Meta Final |

